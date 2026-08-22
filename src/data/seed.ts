// SEED LOCAL (v1) — programa placeholder pra validar o app no treino.
//
// Agora no formato final (#46): a rotina referencia a biblioteca por id e carrega
// `origem`, `usuarioId`. A v1 só grava origem 'coach' — quando o público montar a
// própria rotina (#56), é o mesmo tipo, só com origem 'usuario'.
//
// TODO(M2): substituir pela resposta da API do dash-pro, autenticada (#8, #11).

import type { Rotina, RotinaResumo, TreinoData } from './types'
import { hidratarRotina } from './programa'

/** Placeholder enquanto não há conta de verdade (#47). Vira o auth.uid() no M2. */
export const USUARIO_LOCAL = 'local'

export const rotinaA: Rotina = {
  id: 'A',
  usuarioId: USUARIO_LOCAL,
  origem: 'coach',
  badge: 'A',
  titulo: 'Peito & Tríceps',
  subtitulo: 'Hipertrofia · Semana 3 de 8',
  coachNote:
    'Controla a descida (2–3s). Se o PSE passar de 8 nas primeiras séries, reduz 2,5kg. Cuida do ombro no supino.',
  blocos: [
    {
      exercicioId: 'ex-001',
      restSec: 120,
      series: [
        { tipo: 'aquecimento', kgAlvo: '20', repsAlvo: '15', pseAlvo: null },
        { tipo: 'valida', kgAlvo: '62.5', repsAlvo: '10', pseAlvo: 7 },
        { tipo: 'valida', kgAlvo: '', repsAlvo: '10', pseAlvo: 8 },
        { tipo: 'valida', kgAlvo: '', repsAlvo: '8', pseAlvo: 8 },
      ],
    },
    {
      exercicioId: 'ex-002',
      restSec: 90,
      series: [
        { tipo: 'valida', kgAlvo: '22', repsAlvo: '12', pseAlvo: 8 },
        { tipo: 'valida', kgAlvo: '', repsAlvo: '11', pseAlvo: 8 },
        { tipo: 'valida', kgAlvo: '', repsAlvo: '10', pseAlvo: 8 },
      ],
    },
    {
      exercicioId: 'ex-003',
      restSec: 60,
      series: [
        { tipo: 'valida', kgAlvo: '30', repsAlvo: '15', pseAlvo: 8 },
        { tipo: 'valida', kgAlvo: '', repsAlvo: '13', pseAlvo: 9 },
        { tipo: 'valida', kgAlvo: '', repsAlvo: '12', pseAlvo: 9 },
      ],
    },
    {
      exercicioId: 'ex-025',
      restSec: 60,
      series: [
        { tipo: 'valida', kgAlvo: '25', repsAlvo: '12', pseAlvo: 8 },
        { tipo: 'valida', kgAlvo: '', repsAlvo: '12', pseAlvo: 8 },
        { tipo: 'valida', kgAlvo: '', repsAlvo: '12', pseAlvo: 8 },
        { tipo: 'valida', kgAlvo: '', repsAlvo: '10', pseAlvo: 9 },
      ],
    },
    {
      exercicioId: 'ex-024',
      restSec: 90,
      series: [
        { tipo: 'valida', kgAlvo: '20', repsAlvo: '12', pseAlvo: 8 },
        { tipo: 'valida', kgAlvo: '', repsAlvo: '11', pseAlvo: 8 },
        { tipo: 'valida', kgAlvo: '', repsAlvo: '10', pseAlvo: 9 },
      ],
    },
  ],
}

// Nota (#58): nenhum exercício deste treino tem taxonomia postural — é um treino
// de peito/tríceps puro. Quando a contraconta do sentado existir, ele vai marcar
// zero de compensação, o que é informação correta e não bug. Um face-pull no fim
// resolveria; ficou de fora porque o programa é seu, não meu.

const ROTINAS: Rotina[] = [rotinaA]

/** Resumos do programa (sequência flexível A→B→C). */
export const programa: RotinaResumo[] = [
  { id: 'A', badge: 'A', titulo: 'Peito & Tríceps', meta: '5 exercícios · ~50 min', ultimaVez: 'há 5 dias', origem: 'coach' },
  { id: 'B', badge: 'B', titulo: 'Costas & Bíceps', meta: '6 exercícios · ~55 min', ultimaVez: 'há 3 dias', origem: 'coach' },
  { id: 'C', badge: 'C', titulo: 'Pernas & Core', meta: '5 exercícios · ~50 min', ultimaVez: 'ontem', origem: 'coach' },
]

export function getRotina(id: string): Rotina | null {
  return ROTINAS.find((r) => r.id === id) ?? null
}

/** Rotina já hidratada com a biblioteca — o que as telas consomem. */
export function getTreino(id: string): TreinoData | null {
  const rotina = getRotina(id)
  return rotina ? hidratarRotina(rotina) : null
}

/** @deprecated Use getTreino('A') ou getRotina('A'). */
export const treinoA = hidratarRotina(rotinaA)
