// Modelo de domínio do app do aluno.
// Prescrição (kgAlvo/repsAlvo/pseAlvo) vem do dash-pro; execução é registrada no app.
// Hoje o dado vem de um seed local (v1); na v1.1 vem da API do dash-pro.

export type SetTipo = 'aquecimento' | 'valida'

export interface SerieData {
  label: string // "A" (aquecimento) ou "1", "2"...
  tipo: SetTipo
  anterior: string | null // "60×10" — o que foi feito da última vez
  kgAlvo: string // prescrito (placeholder). Pode ser '' (herda a última carga)
  repsAlvo: string // prescrito (placeholder)
  pseAlvo: number | null // RPE alvo (6..10, passo 0,5). null = sem alvo (ex: aquecimento)
}

export interface ExercicioData {
  id: string
  nome: string
  grupo: string // "Peito · 4 séries"
  restSec: number // descanso alvo
  pseAlvoLabel: string // "7–8"
  series: SerieData[]
}

export interface TreinoData {
  id: string
  badge: string // "A"
  titulo: string
  subtitulo: string
  coachNote: string
  exercicios: ExercicioData[]
}

export interface TreinoResumo {
  id: string
  badge: string
  titulo: string
  meta: string // "5 exercícios · ~50 min"
  ultimaVez: string
}

// ---- registro de execução (persistido localmente) ----
export interface SerieLog {
  serieId: string
  label: string
  tipo: SetTipo
  kg: string // efetivo (o que foi de fato feito)
  reps: string
  pse: number | null
}

export interface Sessao {
  id: string
  treinoId: string
  treinoTitulo: string
  iniciadaEm: number // epoch ms
  concluidaEm: number | null
  duracaoSeg: number | null
  volumeTotal: number | null
  seriesFeitas: number | null
  sensacao: number | null // 1..5
  logs: SerieLog[]
}
