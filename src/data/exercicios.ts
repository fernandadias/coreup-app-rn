// BIBLIOTECA DE EXERCÍCIOS (#54) + TAXONOMIA POSTURAL (#55)
//
// Antes, exercício era uma string dentro do seed. Agora é entidade referenciada
// por id: rotina do coach, rotina do usuário (#56) e contraconta do sentado (#58)
// leem todas daqui.
//
// O campo `compensa` é a decisão arquitetural mais crítica do M1. Marcar agora,
// na criação da biblioteca, é praticamente de graça; marcar depois significa
// reetiquetar tudo que os usuários já tiverem usado.

import type { Exercicio, ExercicioId, PadraoPostural } from './types'

/** Rótulos de exibição da taxonomia postural. */
export const PADRAO_POSTURAL_LABEL: Record<PadraoPostural, string> = {
  'extensao-toracica': 'Extensão torácica',
  'abertura-quadril': 'Abertura de quadril',
  'ativacao-glutea': 'Ativação glútea',
  'retracao-escapular': 'Retração escapular',
  'mobilidade-cervical': 'Mobilidade cervical',
  'antirrotacao-core': 'Antirrotação de core',
}

/** O que cada padrão compensa das horas sentado — copy pra tela de contraconta (#59). */
export const PADRAO_POSTURAL_PORQUE: Record<PadraoPostural, string> = {
  'extensao-toracica': 'Desfaz a curvatura de quem passa o dia curvado sobre a tela.',
  'abertura-quadril': 'Alonga o flexor de quadril, que fica encurtado sentado.',
  'ativacao-glutea': 'Acorda o glúteo, que desliga depois de horas apoiado nele.',
  'retracao-escapular': 'Puxa os ombros de volta da posição de teclado.',
  'mobilidade-cervical': 'Alivia o pescoço projetado pra frente.',
  'antirrotacao-core': 'Devolve estabilidade ao tronco que ficou passivo.',
}

export const BIBLIOTECA: Exercicio[] = [
  // ---- empurrar ----
  {
    id: 'supino-reto',
    nome: 'Supino reto (barra)',
    musculos: ['Peito', 'Tríceps'],
    padrao: 'empurrar',
    compensa: [],
    restSecPadrao: 120,
    midiaUrl: null,
  },
  {
    id: 'supino-inclinado',
    nome: 'Supino inclinado (halter)',
    musculos: ['Peito'],
    padrao: 'empurrar',
    compensa: [],
    restSecPadrao: 90,
    midiaUrl: null,
  },
  {
    id: 'crucifixo',
    nome: 'Crucifixo na máquina',
    musculos: ['Peito'],
    padrao: 'empurrar',
    compensa: [],
    restSecPadrao: 60,
    midiaUrl: null,
  },
  {
    id: 'desenvolvimento-halter',
    nome: 'Desenvolvimento (halter)',
    musculos: ['Ombro', 'Tríceps'],
    padrao: 'empurrar',
    compensa: ['extensao-toracica'],
    restSecPadrao: 90,
    midiaUrl: null,
  },

  // ---- puxar ----
  {
    id: 'remada-curvada',
    nome: 'Remada curvada (barra)',
    musculos: ['Costas', 'Bíceps'],
    padrao: 'puxar',
    compensa: ['retracao-escapular'],
    restSecPadrao: 120,
    midiaUrl: null,
  },
  {
    id: 'remada-baixa',
    nome: 'Remada baixa (polia)',
    musculos: ['Costas', 'Bíceps'],
    padrao: 'puxar',
    compensa: ['retracao-escapular'],
    restSecPadrao: 90,
    midiaUrl: null,
  },
  {
    id: 'puxada-alta',
    nome: 'Puxada alta (polia)',
    musculos: ['Costas', 'Bíceps'],
    padrao: 'puxar',
    compensa: ['retracao-escapular'],
    restSecPadrao: 90,
    midiaUrl: null,
  },
  {
    id: 'face-pull',
    nome: 'Face pull (polia)',
    musculos: ['Ombro posterior', 'Costas'],
    padrao: 'puxar',
    compensa: ['retracao-escapular', 'mobilidade-cervical'],
    restSecPadrao: 60,
    midiaUrl: null,
  },

  // ---- agachar / dobradiça ----
  {
    id: 'agachamento-livre',
    nome: 'Agachamento livre',
    musculos: ['Quadríceps', 'Glúteo'],
    padrao: 'agachar',
    compensa: ['abertura-quadril', 'ativacao-glutea'],
    restSecPadrao: 150,
    midiaUrl: null,
  },
  {
    id: 'levantamento-terra',
    nome: 'Levantamento terra',
    musculos: ['Posterior', 'Glúteo', 'Costas'],
    padrao: 'dobradica',
    compensa: ['ativacao-glutea', 'extensao-toracica'],
    restSecPadrao: 180,
    midiaUrl: null,
  },
  {
    id: 'elevacao-pelvica',
    nome: 'Elevação pélvica',
    musculos: ['Glúteo'],
    padrao: 'dobradica',
    compensa: ['ativacao-glutea', 'abertura-quadril'],
    restSecPadrao: 90,
    midiaUrl: null,
  },
  {
    id: 'afundo',
    nome: 'Afundo (halter)',
    musculos: ['Quadríceps', 'Glúteo'],
    padrao: 'agachar',
    compensa: ['abertura-quadril', 'ativacao-glutea'],
    restSecPadrao: 90,
    midiaUrl: null,
  },

  // ---- braços ----
  {
    id: 'triceps-polia',
    nome: 'Tríceps na polia',
    musculos: ['Tríceps'],
    padrao: 'empurrar',
    compensa: [],
    restSecPadrao: 60,
    midiaUrl: null,
  },
  {
    id: 'triceps-testa',
    nome: 'Tríceps testa (barra W)',
    musculos: ['Tríceps'],
    padrao: 'empurrar',
    compensa: [],
    restSecPadrao: 90,
    midiaUrl: null,
  },
  {
    id: 'rosca-direta',
    nome: 'Rosca direta (barra)',
    musculos: ['Bíceps'],
    padrao: 'puxar',
    compensa: [],
    restSecPadrao: 60,
    midiaUrl: null,
  },

  // ---- core / mobilidade — o núcleo da contraconta do sentado ----
  {
    id: 'prancha',
    nome: 'Prancha',
    musculos: ['Core'],
    padrao: 'core',
    compensa: ['antirrotacao-core'],
    restSecPadrao: 45,
    midiaUrl: null,
  },
  {
    id: 'pallof-press',
    nome: 'Pallof press (polia)',
    musculos: ['Core'],
    padrao: 'core',
    compensa: ['antirrotacao-core'],
    restSecPadrao: 45,
    midiaUrl: null,
  },
  {
    id: 'gato-camelo',
    nome: 'Gato-camelo',
    musculos: ['Coluna'],
    padrao: 'mobilidade',
    compensa: ['extensao-toracica', 'mobilidade-cervical'],
    restSecPadrao: 30,
    midiaUrl: null,
  },
  {
    id: 'alongamento-psoas',
    nome: 'Alongamento de psoas (ajoelhado)',
    musculos: ['Flexor de quadril'],
    padrao: 'mobilidade',
    compensa: ['abertura-quadril'],
    restSecPadrao: 30,
    midiaUrl: null,
  },
  {
    id: 'abertura-toracica',
    nome: 'Abertura torácica no rolo',
    musculos: ['Coluna torácica'],
    padrao: 'mobilidade',
    compensa: ['extensao-toracica'],
    restSecPadrao: 30,
    midiaUrl: null,
  },
  {
    id: 'retracao-cervical',
    nome: 'Retração cervical (chin tuck)',
    musculos: ['Cervical'],
    padrao: 'mobilidade',
    compensa: ['mobilidade-cervical'],
    restSecPadrao: 20,
    midiaUrl: null,
  },
]

const PORID = new Map<ExercicioId, Exercicio>(BIBLIOTECA.map((e) => [e.id, e]))

export function getExercicio(id: ExercicioId): Exercicio | null {
  return PORID.get(id) ?? null
}

/** Exercícios que compensam um padrão postural — base da sugestão da contraconta (#59). */
export function exerciciosQueCompensam(padrao: PadraoPostural): Exercicio[] {
  return BIBLIOTECA.filter((e) => e.compensa.includes(padrao))
}
