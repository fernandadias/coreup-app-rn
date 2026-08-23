// Sync das sessões concluídas pro Supabase.
//
// Com contas (#47) + RLS por auth.uid() (#7), o cliente autenticado escreve DIRETO:
// não precisa de servidor no meio — a RLS garante que cada um só grava o que é seu.
// Offline-first (#19): a sessão sempre fica salva local; aqui a gente empurra as
// pendentes quando dá (no fim do treino e ao abrir o app). Idempotência por id local
// guardado em coreup:syncedIds — nada é enviado duas vezes.

import AsyncStorage from '@react-native-async-storage/async-storage'
import { supabase } from '../lib/supabase'
import { listSessions } from '../storage/sessions'
import { parseKg } from '../lib/format'
import type { Sessao } from '../data/types'

const SYNCED_KEY = 'coreup:syncedIds'

async function getSyncedIds(): Promise<Set<string>> {
  try {
    const raw = await AsyncStorage.getItem(SYNCED_KEY)
    return new Set<string>(raw ? JSON.parse(raw) : [])
  } catch {
    return new Set<string>()
  }
}

async function markSynced(ids: Set<string>): Promise<void> {
  try {
    await AsyncStorage.setItem(SYNCED_KEY, JSON.stringify([...ids]))
  } catch {
    /* noop */
  }
}

/** Empurra uma sessão pro Supabase. Retorna true se gravou. */
export async function pushSession(s: Sessao): Promise<boolean> {
  const { data: sess } = await supabase.auth.getSession()
  const uid = sess.session?.user.id
  if (!uid) return false

  const { data: row, error: e1 } = await supabase
    .from('sessao_treino')
    .insert({
      usuario_id: uid,
      rotina_ref: s.rotinaId,
      tipo: s.tipo,
      iniciada_em: new Date(s.iniciadaEm).toISOString(),
      concluida_em: s.concluidaEm ? new Date(s.concluidaEm).toISOString() : null,
      duracao_seg: s.duracaoSeg,
      volume_total: s.volumeTotal,
      series_feitas: s.seriesFeitas,
      sensacao: s.sensacao,
    })
    .select('id')
    .single()
  if (e1 || !row) return false

  if (s.logs.length) {
    const kg = (v: string) => (Number.isFinite(parseKg(v)) ? parseKg(v) : null)
    const reps = (v: string) => (Number.isFinite(parseInt(v, 10)) ? parseInt(v, 10) : null)
    const rows = s.logs.map((l) => ({
      sessao_id: row.id,
      exercicio_ref: l.exercicioId || '',
      rotulo: l.label,
      tipo: l.tipo,
      carga: kg(l.kg),
      reps: reps(l.reps),
      pse: l.pse,
    }))
    const { error: e2 } = await supabase.from('serie_executada').insert(rows)
    if (e2) return false
  }
  return true
}

/** Empurra todas as sessões concluídas ainda não sincronizadas. Silencioso. */
export async function syncPendingSessions(): Promise<void> {
  const { data: sess } = await supabase.auth.getSession()
  if (!sess.session) return // sem login, sem sync

  const [sessions, synced] = await Promise.all([listSessions(), getSyncedIds()])
  let mudou = false
  for (const s of sessions) {
    if (!s.concluidaEm || synced.has(s.id)) continue
    const ok = await pushSession(s).catch(() => false)
    if (ok) {
      synced.add(s.id)
      mudou = true
    }
  }
  if (mudou) await markSynced(synced)
}
