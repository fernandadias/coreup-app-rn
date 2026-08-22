// Modelo de domínio do CoreUP.
//
// Este modelo já nasce no formato do app público (M1 / issue #46), mesmo que a v1
// só atenda alunos da consultoria. Cada campo que a v1 "não usa" existe porque
// retrofitá-lo depois que houver dado real de usuário é caro:
//
//   - rotina.origem   → 'coach' na v1; 'usuario' quando o público montar a própria (#56)
//   - sessao.tipo     → 'treino' na v1; 'micro' nas micro-sessões (#63)
//   - exercicio.compensa → taxonomia postural, base da contraconta do sentado (#58)
//
// Prescrição (kgAlvo/repsAlvo/pseAlvo) vem do coach; execução é registrada no app.

// ---------------------------------------------------------------------------
// Identidade (#46, #47)
// ---------------------------------------------------------------------------

export type UsuarioId = string
export type CoachId = string

export interface Usuario {
  id: UsuarioId
  nome: string
  email: string | null
  criadoEm: number // epoch ms
  /** Vínculo com a consultoria (#6). null = usuário do app geral. */
  coachId: CoachId | null
  /** Horas sentado por dia, do questionário de entrada (#66). Alimenta a contraconta. */
  horasSentadoDia: number | null
}

// ---------------------------------------------------------------------------
// Biblioteca de exercícios (#54) + taxonomia postural (#55)
// ---------------------------------------------------------------------------

export type ExercicioId = string

/** Padrão de movimento — organiza a biblioteca e o construtor de rotina (#56). */
export type PadraoMovimento =
  | 'empurrar'
  | 'puxar'
  | 'agachar'
  | 'dobradica'
  | 'core'
  | 'mobilidade'

/**
 * Taxonomia postural (#55): o que o exercício compensa das horas sentado.
 * É a chave do diferencial do produto — todo o E8 lê daqui.
 * Lista vazia = o exercício não compensa nada do sentar (o que também é informação).
 */
export type PadraoPostural =
  | 'extensao-toracica'
  | 'abertura-quadril'
  | 'ativacao-glutea'
  | 'retracao-escapular'
  | 'mobilidade-cervical'
  | 'antirrotacao-core'

export interface Exercicio {
  id: ExercicioId
  nome: string
  /** Grupos musculares principais. Ex: ['Peito', 'Tríceps'] */
  musculos: string[]
  padrao: PadraoMovimento
  /** O que compensa do sentar (#55). Vazio = não compensa. */
  compensa: PadraoPostural[]
  /** Descanso alvo padrão, em segundos. A rotina pode sobrescrever. */
  restSecPadrao: number
  /** Vídeo/imagem de execução (#31). Ainda não populado. */
  midiaUrl: string | null
}

// ---------------------------------------------------------------------------
// Rotina (#46) — o que antes se chamava "programa/treino"
// ---------------------------------------------------------------------------

export type RotinaId = string

/**
 * Quem montou a rotina. É isto — e não uma tela separada — que define se o
 * usuário pode editar (#13, #68). A v1 só grava 'coach'.
 */
export type RotinaOrigem = 'coach' | 'usuario'

export type SetTipo = 'aquecimento' | 'valida'

export interface SeriePrescrita {
  tipo: SetTipo
  /** Prescrito, entra como placeholder (#16). '' = herda a carga da série anterior. */
  kgAlvo: string
  repsAlvo: string
  /** RPE alvo (6..10, passo 0,5). null = sem alvo, ex. aquecimento. */
  pseAlvo: number | null
}

export interface BlocoRotina {
  /** Referência à biblioteca (#54) — não mais o nome em texto. */
  exercicioId: ExercicioId
  series: SeriePrescrita[]
  /** Sobrescreve o restSecPadrao do exercício, quando o coach quiser. */
  restSec: number | null
}

export interface Rotina {
  id: RotinaId
  /** Dono do dado — base do RLS por auth.uid() (#7). */
  usuarioId: UsuarioId
  origem: RotinaOrigem
  badge: string // "A"
  titulo: string
  subtitulo: string
  coachNote: string
  blocos: BlocoRotina[]
}

export interface RotinaResumo {
  id: RotinaId
  badge: string
  titulo: string
  meta: string // "5 exercícios · ~50 min"
  ultimaVez: string
  origem: RotinaOrigem
}

// ---------------------------------------------------------------------------
// View model hidratado — o que as telas consomem
// ---------------------------------------------------------------------------
// A rotina guarda referências; as telas precisam do exercício já resolvido.
// hidratarRotina() (em ./programa) junta os dois e deriva os rótulos de display.

export interface SerieData extends SeriePrescrita {
  label: string // "A" (aquecimento) ou "1", "2"...
  anterior: string | null // "60×10" — o que foi feito da última vez
}

export interface ExercicioData {
  id: ExercicioId
  nome: string
  grupo: string // derivado: "Peito · 4 séries"
  restSec: number
  pseAlvoLabel: string // derivado: "7–8"
  compensa: PadraoPostural[]
  series: SerieData[]
}

export interface TreinoData {
  id: RotinaId
  badge: string
  titulo: string
  subtitulo: string
  coachNote: string
  origem: RotinaOrigem
  exercicios: ExercicioData[]
}

/** @deprecated Use RotinaResumo. Mantido só pra não quebrar imports antigos. */
export type TreinoResumo = RotinaResumo

// ---------------------------------------------------------------------------
// Registro de execução
// ---------------------------------------------------------------------------

export interface SerieLog {
  serieId: string
  label: string
  tipo: SetTipo
  /** Referência à biblioteca — permite agregar por exercício e por padrão postural. */
  exercicioId: ExercicioId
  kg: string // efetivo (o que foi de fato feito)
  reps: string
  pse: number | null
}

/**
 * Tipo de sessão (#62). A v1 só grava 'treino', mas histórico, recap e o score
 * de compensação (#58) leem desta coluna — se a micro-sessão virasse entidade
 * separada depois, tudo isso teria que somar duas fontes.
 */
export type SessaoTipo = 'treino' | 'micro'

export interface Sessao {
  id: string
  /** Dono do dado (#7). null enquanto o app é local-first, sem conta. */
  usuarioId: UsuarioId | null
  rotinaId: RotinaId
  rotinaTitulo: string
  tipo: SessaoTipo
  iniciadaEm: number // epoch ms
  concluidaEm: number | null
  duracaoSeg: number | null
  volumeTotal: number | null
  seriesFeitas: number | null
  sensacao: number | null // 1..5
  logs: SerieLog[]
}
