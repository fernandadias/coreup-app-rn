// Controlador da Live Activity do treino. Tudo defensivo: iOS-only, try/catch,
// nunca pode derrubar o treino se a Live Activity falhar (módulo alpha).
import { Platform } from 'react-native'
import WorkoutActivity, { type WorkoutActivityProps } from './WorkoutActivity'

type Instance = ReturnType<typeof WorkoutActivity.start>

let instance: Instance | undefined

export function startWorkoutActivity(state: WorkoutActivityProps): void {
  if (Platform.OS !== 'ios') return
  try {
    instance = WorkoutActivity.start(state, 'coreup://treino')
  } catch {
    /* módulo indisponível — segue o treino normal */
  }
}

export function updateWorkoutActivity(state: WorkoutActivityProps): void {
  if (Platform.OS !== 'ios' || !instance) return
  try {
    instance.update(state)
  } catch {
    /* noop */
  }
}

export function endWorkoutActivity(state: WorkoutActivityProps): void {
  if (Platform.OS !== 'ios' || !instance) return
  try {
    instance.end('immediate', state)
  } catch {
    /* noop */
  }
  instance = undefined
}
