// BIBLIOTECA DE EXERCÍCIOS (#54) + TAXONOMIA POSTURAL (#55)
//
// FONTE DA VERDADE: o coreup-dash-pro. Os ids (ex-NNN) nascem lá, e são eles
// que `planos.dados.bibliotecaId` e `serie_executada.exercicio_ref` gravam.
// Este arquivo só carrega o snapshot gerado por `scripts/gerar-biblioteca.mjs`.
//
// NUNCA edite biblioteca.json à mão nem crie exercício só aqui: id divergente
// entre app e dash quebra o histórico de carga no dia da integração.
//
// TODO(M2): trocar o snapshot por download da API (#8) + cache local, que é o
// que um app offline-first pede. O snapshot existe porque a v1 é local-first.

import bibliotecaJson from './biblioteca.json'
import type { Exercicio, ExercicioId, PadraoPostural } from './types'

export const BIBLIOTECA = bibliotecaJson as Exercicio[]

/** Rótulos de exibição da taxonomia postural. */
export const PADRAO_POSTURAL_LABEL: Record<PadraoPostural, string> = {
  'extensao-toracica': 'Extensão torácica',
  'abertura-quadril': 'Abertura de quadril',
  'ativacao-glutea': 'Ativação glútea',
  'retracao-escapular': 'Retração escapular',
  'mobilidade-cervical': 'Mobilidade cervical',
  'estabilidade-core': 'Estabilidade de core',
}

/** O que cada padrão compensa das horas sentado — copy da tela de contraconta (#59). */
export const PADRAO_POSTURAL_PORQUE: Record<PadraoPostural, string> = {
  'extensao-toracica': 'Desfaz a curvatura de quem passa o dia sobre a tela.',
  'abertura-quadril': 'Alonga o flexor de quadril, que encurta sentado.',
  'ativacao-glutea': 'Acorda o glúteo, que desliga depois de horas apoiado nele.',
  'retracao-escapular': 'Puxa os ombros de volta da posição de teclado.',
  'mobilidade-cervical': 'Alivia o pescoço projetado pra frente.',
  'estabilidade-core': 'Devolve estabilidade ao tronco que ficou passivo.',
}

/** Rótulo de exibição do agrupamento muscular — mesmo vocabulário do dash-pro. */
export const ROTULO_AGRUPAMENTO: Record<string, string> = {
  Peitoral: 'Peitoral',
  Costas: 'Costas',
  Ombros: 'Ombros',
  Biceps: 'Bíceps',
  Triceps: 'Tríceps',
  Quadriceps: 'Quadríceps',
  PosteriorCoxa: 'Posterior de coxa',
  Gluteos: 'Glúteos',
  Panturrilhas: 'Panturrilhas',
  Core: 'Abdômen/Core',
}

const PORID = new Map<ExercicioId, Exercicio>(BIBLIOTECA.map((e) => [e.id, e]))

export function getExercicio(id: ExercicioId): Exercicio | null {
  return PORID.get(id) ?? null
}

/** Exercícios que compensam um padrão postural — base da sugestão da contraconta (#59). */
export function exerciciosQueCompensam(padrao: PadraoPostural): Exercicio[] {
  return BIBLIOTECA.filter((e) => e.compensa.includes(padrao))
}
