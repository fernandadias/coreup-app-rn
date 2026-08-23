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

/**
 * Plano do usuário — a coluna vertebral dos dois mundos do app.
 *   'livre' → app self-serve: anamnese + treino de IA/próprio + log. Funil de aquisição.
 *   'aluna' → fez upgrade pra consultoria: programa do coach, recados, acompanhamento.
 * Deriva de coachId (aluna ⇔ coachId != null), mas é explícito porque estado de
 * assinatura e vínculo com coach podem divergir (ex.: trial, pausa). A v1 só cria 'aluna'.
 */
export type Plano = 'livre' | 'aluna'

export interface Usuario {
  id: UsuarioId
  nome: string
  email: string | null
  criadoEm: number // epoch ms
  /** Em qual mundo do app a pessoa está (#69). Define o que ela vê e o que pode editar. */
  plano: Plano
  /** Vínculo com a consultoria (#6). null = usuário do app geral. Preenchido ⇒ plano 'aluna'. */
  coachId: CoachId | null
  /** Horas sentado por dia, do questionário de entrada (#66). Alimenta a contraconta. Espelha anamnese.horasSentadoDia. */
  horasSentadoDia: number | null
}

// ---------------------------------------------------------------------------
// Anamnese (#66, #69) — o questionário de entrada, first-run obrigatório
// ---------------------------------------------------------------------------
// Serve os dois mundos: no livre alimenta a sugestão de treino por IA; na aluna
// é o brief que o coach lê no dash. É a base do diferencial — a inteligência do
// app sobre QUEM é a pessoa, não só o log do que ela fez.

export type Objetivo =
  | 'hipertrofia' // ganhar músculo
  | 'emagrecimento' // perder gordura
  | 'forca' // ficar mais forte
  | 'saude' // saúde e postura / contraconta do sentar
  | 'condicionamento' // fôlego e disposição

/** Onde a pessoa pode treinar — multi. Guia a seleção de exercícios e a substituição. */
export type LocalTreino =
  | 'academia-completa' // academia cheia, todos os aparelhos
  | 'academia-predio' // academia de condomínio, equipamento limitado
  | 'casa' // peso do corpo / halteres / elásticos

/** Preferência de estímulo — o que a pessoa curte fazer, pra o treino não virar tortura. */
export type EstiloTreino =
  | 'maquinas' // guiado, seguro
  | 'peso-livre' // barra e halteres
  | 'funcional' // circuito, corpo livre
  | 'misto'

/** Outras atividades além da musculação — pra dimensionar volume e recuperação. */
export type OutraAtividade = 'corrida' | 'luta' | 'crossfit' | 'yoga-pilates' | 'ciclismo' | 'danca' | 'nenhuma'

/** Regiões de dor/limitação relatadas — o coach e a IA evitam agravar. */
export type RegiaoDor = 'lombar' | 'joelho' | 'ombro' | 'punho' | 'cervical' | 'quadril' | 'tornozelo'

export interface Anamnese {
  usuarioId: UsuarioId
  /** Horas sentado por dia (trabalho). Base da contraconta postural (#58). */
  horasSentadoDia: number
  objetivo: Objetivo
  locais: LocalTreino[]
  estilos: EstiloTreino[]
  outrasAtividades: OutraAtividade[]
  dores: RegiaoDor[]
  /** Espaço aberto — a dor que não coube nas opções, contexto pro coach. */
  observacoes: string
  /** Quantos dias por semana pretende treinar. */
  diasPorSemana: number
  preenchidaEm: number // epoch ms
}

// ---------------------------------------------------------------------------
// Biblioteca de exercícios (#54) + taxonomia postural (#55)
// ---------------------------------------------------------------------------

export type ExercicioId = string

/** Agrupamento muscular — mesmo vocabulário do dash-pro (fonte da verdade). */
export type Agrupamento =
  | 'Peitoral'
  | 'Costas'
  | 'Ombros'
  | 'Biceps'
  | 'Triceps'
  | 'Quadriceps'
  | 'PosteriorCoxa'
  | 'Gluteos'
  | 'Panturrilhas'
  | 'Core'

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
  | 'estabilidade-core'

/**
 * Espelha ExercicioBiblioteca do dash-pro. Carregado de biblioteca.json,
 * gerado por scripts/gerar-biblioteca.mjs — não editar à mão.
 */
export interface Exercicio {
  id: ExercicioId
  nome: string
  musculoPrincipal: Agrupamento
  musculosSecundarios: Agrupamento[]
  padraoMovimento: string
  tipo: 'composto' | 'isolado' | null
  equipamentos: string[]
  nivel: 'iniciante' | 'intermediario' | 'avancado'
  /** O que compensa do sentar (#55). Vazio = não compensa — é informação, não lacuna. */
  compensa: PadraoPostural[]
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
  /** Sustentação alvo em segundos (isométricos: prancha). Presente = série por tempo, não reps. */
  tempoAlvoSeg?: number
}

export interface BlocoRotina {
  /** Referência à biblioteca (#54) — não mais o nome em texto. */
  exercicioId: ExercicioId
  series: SeriePrescrita[]
  /** Descanso alvo, em segundos. Vem da prescrição, não da biblioteca. */
  restSec: number
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
