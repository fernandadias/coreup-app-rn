// SEED LOCAL (v1) — programa placeholder pra validar o app no treino.
// TODO(v1.1): substituir pela resposta da API do dash-pro (GET programa por token).
// Pra usar seu programa real agora: edite os exercícios/séries abaixo.

import type { TreinoData, TreinoResumo } from './types'

export const treinoA: TreinoData = {
  id: 'A',
  badge: 'A',
  titulo: 'Peito & Tríceps',
  subtitulo: 'Hipertrofia · Semana 3 de 8',
  coachNote:
    'Controla a descida (2–3s). Se o PSE passar de 8 nas primeiras séries, reduz 2,5kg. Cuida do ombro no supino.',
  exercicios: [
    {
      id: 'supino-reto',
      nome: 'Supino reto (barra)',
      grupo: 'Peito · 4 séries',
      restSec: 120,
      pseAlvoLabel: '7–8',
      series: [
        { label: 'A', tipo: 'aquecimento', anterior: null, kgAlvo: '20', repsAlvo: '15', pseAlvo: null },
        { label: '1', tipo: 'valida', anterior: '60×10', kgAlvo: '62.5', repsAlvo: '10', pseAlvo: 7 },
        { label: '2', tipo: 'valida', anterior: '60×9', kgAlvo: '', repsAlvo: '10', pseAlvo: 8 },
        { label: '3', tipo: 'valida', anterior: '57.5×8', kgAlvo: '', repsAlvo: '8', pseAlvo: 8 },
      ],
    },
    {
      id: 'supino-inclinado',
      nome: 'Supino inclinado (halter)',
      grupo: 'Peito · 3 séries',
      restSec: 90,
      pseAlvoLabel: '8',
      series: [
        { label: '1', tipo: 'valida', anterior: '22×12', kgAlvo: '22', repsAlvo: '12', pseAlvo: 8 },
        { label: '2', tipo: 'valida', anterior: '22×11', kgAlvo: '', repsAlvo: '11', pseAlvo: 8 },
        { label: '3', tipo: 'valida', anterior: '20×10', kgAlvo: '', repsAlvo: '10', pseAlvo: 8 },
      ],
    },
    {
      id: 'crucifixo',
      nome: 'Crucifixo na máquina',
      grupo: 'Peito · 3 séries',
      restSec: 60,
      pseAlvoLabel: '8–9',
      series: [
        { label: '1', tipo: 'valida', anterior: '30×15', kgAlvo: '30', repsAlvo: '15', pseAlvo: 8 },
        { label: '2', tipo: 'valida', anterior: '30×13', kgAlvo: '', repsAlvo: '13', pseAlvo: 9 },
        { label: '3', tipo: 'valida', anterior: '27.5×12', kgAlvo: '', repsAlvo: '12', pseAlvo: 9 },
      ],
    },
    {
      id: 'triceps-polia',
      nome: 'Tríceps na polia',
      grupo: 'Tríceps · 4 séries',
      restSec: 60,
      pseAlvoLabel: '8',
      series: [
        { label: '1', tipo: 'valida', anterior: '25×12', kgAlvo: '25', repsAlvo: '12', pseAlvo: 8 },
        { label: '2', tipo: 'valida', anterior: '25×12', kgAlvo: '', repsAlvo: '12', pseAlvo: 8 },
        { label: '3', tipo: 'valida', anterior: '22.5×12', kgAlvo: '', repsAlvo: '12', pseAlvo: 8 },
        { label: '4', tipo: 'valida', anterior: '22.5×10', kgAlvo: '', repsAlvo: '10', pseAlvo: 9 },
      ],
    },
    {
      id: 'triceps-testa',
      nome: 'Tríceps testa (barra W)',
      grupo: 'Tríceps · 3 séries',
      restSec: 90,
      pseAlvoLabel: '8',
      series: [
        { label: '1', tipo: 'valida', anterior: '20×12', kgAlvo: '20', repsAlvo: '12', pseAlvo: 8 },
        { label: '2', tipo: 'valida', anterior: '20×11', kgAlvo: '', repsAlvo: '11', pseAlvo: 8 },
        { label: '3', tipo: 'valida', anterior: '17.5×10', kgAlvo: '', repsAlvo: '10', pseAlvo: 9 },
      ],
    },
  ],
}

// treinos do programa (sequência flexível A→B→C)
export const programa: TreinoResumo[] = [
  { id: 'A', badge: 'A', titulo: 'Peito & Tríceps', meta: '5 exercícios · ~50 min', ultimaVez: 'há 5 dias' },
  { id: 'B', badge: 'B', titulo: 'Costas & Bíceps', meta: '6 exercícios · ~55 min', ultimaVez: 'há 3 dias' },
  { id: 'C', badge: 'C', titulo: 'Pernas & Core', meta: '5 exercícios · ~50 min', ultimaVez: 'ontem' },
]

// v1: só o treino A está montado. Os outros abrem quando você montar o seed.
export function getTreino(id: string): TreinoData | null {
  if (id === 'A') return treinoA
  return null
}
