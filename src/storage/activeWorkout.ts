// Treino EM ANDAMENTO (working-state completo, não a sessão concluída).
// Guarda o progresso da tela de Treino pra: (1) continuar de onde parou ao voltar,
// (2) mostrar a barra "em andamento" na Home, (3) impedir começar vários do zero.
// Só existe UM por vez. Concluir ou parar limpa. A sessão CONCLUÍDA vai pra sessions.ts.

import AsyncStorage from '@react-native-async-storage/async-storage'

export interface ActiveWorkout {
  rotinaId: string
  rotinaTitulo: string
  iniciadaEm: number // epoch ms
  /** ExercicioRT[] serializado — opaco fora do TreinoScreen (só ele conhece o shape). */
  exs: unknown
}

const KEY = 'coreup:activeWorkout'

export async function saveActiveWorkout(w: ActiveWorkout): Promise<void> {
  try {
    await AsyncStorage.setItem(KEY, JSON.stringify(w))
  } catch {
    /* offline-first: não pode derrubar o treino */
  }
}

export async function loadActiveWorkout(): Promise<ActiveWorkout | null> {
  try {
    const raw = await AsyncStorage.getItem(KEY)
    if (!raw) return null
    const w = JSON.parse(raw) as Partial<ActiveWorkout>
    if (typeof w.rotinaId !== 'string' || typeof w.iniciadaEm !== 'number') return null
    return {
      rotinaId: w.rotinaId,
      rotinaTitulo: String(w.rotinaTitulo ?? 'Treino'),
      iniciadaEm: w.iniciadaEm,
      exs: w.exs ?? [],
    }
  } catch {
    return null
  }
}

export async function clearActiveWorkout(): Promise<void> {
  try {
    await AsyncStorage.removeItem(KEY)
  } catch {
    /* noop */
  }
}
