// Down-sync do programa: o app baixa o plano REAL da aluna do Supabase.
//
// O vínculo conta↔aluna é feito uma vez via resgatarAluno(código) — o código é o
// app_token que a coach copia no dash. Depois disso, fetchProgramaRemoto() acha o
// aluno por auth.uid() (RLS) e lê o plano mais recente (planos.dados jsonb), mapeando
// o PlanoDeTreino do dash pro modelo Rotina do app. A biblioteca de exercícios é a
// mesma nos dois (ids ex-NNN), então os exercícios resolvem direto na tela.

import { supabase } from '../lib/supabase'
import type { BlocoRotina, Rotina, RotinaResumo, SeriePrescrita } from '../data/types'

export interface ProgramaRemoto {
  vinculado: boolean
  programa: RotinaResumo[]
  rotinas: Record<string, Rotina>
  coachNote: string
}

const UUID_RE = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i

/** Aceita o código puro ou um link /app/<uuid> colado — extrai o uuid. */
export function extrairCodigo(input: string): string | null {
  const m = input.trim().match(UUID_RE)
  return m ? m[0] : null
}

// --- mapeamento PlanoDeTreino (dash) → Rotina[] (app) ---

function mapExercicio(ex: Record<string, unknown>): BlocoRotina {
  const series: SeriePrescrita[] = []
  const nAquece = Number(ex.seriesAquecimento ?? 0)
  for (let i = 0; i < nAquece; i++) {
    series.push({ tipo: 'aquecimento', kgAlvo: '', repsAlvo: '', pseAlvo: null })
  }
  const nVal = Number(ex.series ?? 0)
  const tempo = ex.tempoSeg != null ? Number(ex.tempoSeg) : undefined
  const pse = ex.pse != null ? Number(ex.pse) : null
  for (let i = 0; i < nVal; i++) {
    series.push({
      tipo: 'valida',
      kgAlvo: '', // o dash não prescreve carga; entra vazio (herda/registra no treino)
      repsAlvo: tempo != null ? '' : String(ex.repeticoes ?? ''),
      pseAlvo: pse,
      tempoAlvoSeg: tempo,
    })
  }
  return { exercicioId: String(ex.bibliotecaId ?? ''), restSec: Number(ex.descanso ?? 0), series }
}

function mapPlano(dados: Record<string, unknown>, uid: string): Omit<ProgramaRemoto, 'vinculado'> {
  const dias = Array.isArray(dados.dias) ? (dados.dias as Record<string, unknown>[]) : []
  const coachNote = String(dados.racionalAluno ?? '')
  const rotinas: Record<string, Rotina> = {}
  const programa: RotinaResumo[] = []

  dias.forEach((d, i) => {
    const badge = String(d.rotulo ?? String.fromCharCode(65 + i))
    const exs = Array.isArray(d.exercicios) ? (d.exercicios as Record<string, unknown>[]) : []
    const blocos = exs.map(mapExercicio)
    const titulo = String(d.nome ?? `Treino ${badge}`)
    const id = String(d.id ?? badge)
    rotinas[id] = {
      id,
      usuarioId: uid,
      origem: 'coach',
      badge,
      titulo,
      subtitulo: String(d.foco ?? dados.nome ?? ''),
      coachNote: String(d.observacoes ?? coachNote),
      blocos,
    }
    programa.push({
      id,
      badge,
      titulo,
      meta: `${blocos.length} ${blocos.length === 1 ? 'exercício' : 'exercícios'}`,
      ultimaVez: '',
      origem: 'coach',
    })
  })

  return { programa, rotinas, coachNote }
}

/**
 * Busca o programa remoto. Retorna:
 *  - null: sem sessão ou falha de rede (o provider mantém o cache).
 *  - { vinculado:false }: logada mas ainda sem aluno vinculado (→ tela de código).
 *  - { vinculado:true, ... }: programa da aluna (vazio se o coach ainda não montou).
 */
export async function fetchProgramaRemoto(): Promise<ProgramaRemoto | null> {
  const { data: sess } = await supabase.auth.getSession()
  const uid = sess.session?.user.id
  if (!uid) return null

  const { data: aluno, error } = await supabase.from('alunos').select('id').eq('usuario_id', uid).maybeSingle()
  if (error) return null // rede/RLS: não decide nada, provider fica com o cache
  if (!aluno) return { vinculado: false, programa: [], rotinas: {}, coachNote: '' }

  const { data: plano } = await supabase
    .from('planos')
    .select('dados')
    .eq('aluno_id', aluno.id)
    .order('criado_em', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (!plano?.dados) return { vinculado: true, programa: [], rotinas: {}, coachNote: '' }
  return { vinculado: true, ...mapPlano(plano.dados as Record<string, unknown>, uid) }
}

/** Liga a conta logada à aluna cujo app_token bate. Uma vez só. */
export async function resgatarAluno(input: string): Promise<{ ok: boolean; erro?: string }> {
  const token = extrairCodigo(input)
  if (!token) return { ok: false, erro: 'Código inválido. Cole o código que a coach te enviou.' }
  const { error } = await supabase.rpc('resgatar_aluno', { p_token: token })
  if (error) {
    const m = error.message.toLowerCase()
    if (m.includes('inválido') || m.includes('invalido') || m.includes('já') || m.includes('usado')) {
      return { ok: false, erro: 'Código inválido ou já usado.' }
    }
    return { ok: false, erro: 'Não deu pra validar o código. Tenta de novo.' }
  }
  return { ok: true }
}
