// Live Activity DESATIVADA no build (#51).
//
// O expo-widgets (alpha) foi declarado sem o target nativo da widget extension,
// o que quebrava a build de produção. Até montarmos o target de verdade
// (issues #45 / #51 / #64), o controlador é NO-OP: as telas seguem chamando
// estas funções normalmente — elas só não fazem nada.
//
// A UI real da Live Activity está preservada em ./WorkoutActivity.tsx. Para
// reativar: re-adicionar o plugin "expo-widgets" no app.json (+ target nativo)
// e voltar a importar WorkoutActivity aqui.

export type WorkoutActivityProps = {
  exercicio: string
  serie: number
  totalSeries: number
  status: string
}

export function startWorkoutActivity(_state: WorkoutActivityProps): void {
  /* no-op até o target nativo existir (#51) */
}

export function updateWorkoutActivity(_state: WorkoutActivityProps): void {
  /* no-op */
}

export function endWorkoutActivity(_state: WorkoutActivityProps): void {
  /* no-op */
}
