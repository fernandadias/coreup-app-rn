// Hidratação: junta Rotina (referências) + Biblioteca (exercícios) no view model
// que as telas consomem.
//
// A rotina guarda só `exercicioId`; os rótulos de display ("Peito · 4 séries",
// "7–8") são DERIVADOS aqui, não gravados. Isso é o que permite renomear um
// exercício na biblioteca sem sair reescrevendo rotina por rotina.

import type {
  BlocoRotina,
  ExercicioData,
  Rotina,
  SerieData,
  TreinoData,
} from './types'
import { getExercicio } from './exercicios'

/** "1", "2", "3"... nas válidas; "A" nas de aquecimento. */
function rotular(bloco: BlocoRotina): SerieData[] {
  let n = 0
  return bloco.series.map((s) => ({
    ...s,
    label: s.tipo === 'valida' ? String(++n) : 'A',
    anterior: null, // preenchido pelo histórico quando E4 existir (#31)
  }))
}

/**
 * "Peito · 4 séries" — derivado dos músculos do exercício e da contagem.
 * Conta TODAS as linhas, aquecimento incluído, como fazia o seed escrito à mão.
 */
function rotuloGrupo(musculos: string[], nSeries: number): string {
  const grupo = musculos[0] ?? 'Geral'
  return `${grupo} · ${nSeries} ${nSeries === 1 ? 'série' : 'séries'}`
}

/** "7–8" ou "8" — derivado da faixa de pseAlvo das séries válidas. */
function rotuloPseAlvo(series: SerieData[]): string {
  const alvos = series
    .filter((s) => s.tipo === 'valida' && s.pseAlvo != null)
    .map((s) => s.pseAlvo as number)
  if (!alvos.length) return '—'
  const min = Math.min(...alvos)
  const max = Math.max(...alvos)
  const fmt = (n: number) => String(n).replace('.', ',')
  return min === max ? fmt(min) : `${fmt(min)}–${fmt(max)}`
}

function hidratarBloco(bloco: BlocoRotina): ExercicioData | null {
  const ex = getExercicio(bloco.exercicioId)
  if (!ex) return null // exercício removido da biblioteca: pula em vez de quebrar a tela

  const series = rotular(bloco)
  return {
    id: ex.id,
    nome: ex.nome,
    grupo: rotuloGrupo(ex.musculos, series.length),
    restSec: bloco.restSec ?? ex.restSecPadrao,
    pseAlvoLabel: rotuloPseAlvo(series),
    compensa: ex.compensa,
    series,
  }
}

export function hidratarRotina(rotina: Rotina): TreinoData {
  return {
    id: rotina.id,
    badge: rotina.badge,
    titulo: rotina.titulo,
    subtitulo: rotina.subtitulo,
    coachNote: rotina.coachNote,
    origem: rotina.origem,
    exercicios: rotina.blocos
      .map(hidratarBloco)
      .filter((e): e is ExercicioData => e !== null),
  }
}
