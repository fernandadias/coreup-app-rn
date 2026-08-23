// Estatísticas derivadas das sessões — fonte única pra Home e Evolução.
// Tudo puro (sem I/O): recebe Sessao[] e devolve números/estruturas.

import type { Sessao } from '../data/types'
import { parseKg } from './format'

const WEEK = 7 * 24 * 60 * 60 * 1000

/** Início da semana (segunda 00:00) em ms — âncora pra contar semanas. */
export function weekStartMs(ts: number): number {
  const d = new Date(ts)
  const day = (d.getDay() + 6) % 7 // segunda = 0
  d.setHours(0, 0, 0, 0)
  d.setDate(d.getDate() - day)
  return d.getTime()
}

/** Quantos treinos nesta semana. */
export function sessionsThisWeek(sessions: Sessao[], now: number = Date.now()): number {
  const w = weekStartMs(now)
  return sessions.filter((s) => weekStartMs(s.iniciadaEm) === w).length
}

/** Semanas seguidas com ≥1 treino, terminando na atual (com graça pra semana recém-começada). */
export function weeksStreak(sessions: Sessao[], now: number = Date.now()): number {
  const weeks = new Set(sessions.map((s) => weekStartMs(s.iniciadaEm)))
  let w = weekStartMs(now)
  if (!weeks.has(w)) w -= WEEK // semana atual ainda sem treino: não zera a sequência
  let n = 0
  while (weeks.has(w)) {
    n++
    w -= WEEK
  }
  return n
}

/** Epley. Só vale em séries curtas — reps longas superestimam, então corta em 12. */
export function estimate1RM(kg: number, reps: number): number {
  if (!Number.isFinite(kg) || kg <= 0 || !Number.isFinite(reps) || reps < 1 || reps > 12) return 0
  return kg * (1 + reps / 30)
}

export interface Recorde1RM {
  exercicioId: string
  est1RM: number // arredondado
  kg: number
  reps: number
  quando: number // ts da sessão em que bateu
  novo: boolean // atingido na sessão mais recente
}

/** Melhor 1RM estimado por exercício, do maior pro menor. sessions vem mais recente primeiro. */
export function recordes1RM(sessions: Sessao[]): Recorde1RM[] {
  const maisRecente = sessions[0]?.id
  const best = new Map<string, Recorde1RM>()
  for (const s of sessions) {
    for (const l of s.logs) {
      if (l.tipo === 'aquecimento') continue
      const kg = parseKg(l.kg)
      const reps = parseInt(l.reps, 10)
      const e = estimate1RM(kg, reps)
      if (e <= 0) continue
      const cur = best.get(l.exercicioId)
      if (!cur || e > cur.est1RM) {
        best.set(l.exercicioId, {
          exercicioId: l.exercicioId,
          est1RM: Math.round(e),
          kg,
          reps,
          quando: s.iniciadaEm,
          novo: s.id === maisRecente,
        })
      }
    }
  }
  return [...best.values()].sort((a, b) => b.est1RM - a.est1RM)
}

/** A sessão de maior volume total. */
export function treinoMaisPesado(sessions: Sessao[]): Sessao | null {
  let best: Sessao | null = null
  for (const s of sessions) {
    if ((s.volumeTotal ?? 0) > (best?.volumeTotal ?? 0)) best = s
  }
  return best
}
