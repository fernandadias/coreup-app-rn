// Cache local do programa baixado (offline-first): a aluna abre o app no meio do
// treino, sem sinal, e o programa continua lá. Atualiza quando a rede permite.

import AsyncStorage from '@react-native-async-storage/async-storage'
import type { ProgramaRemoto } from '../api/programa'

const KEY = 'coreup:programa'

export async function saveProgramaCache(p: ProgramaRemoto): Promise<void> {
  try {
    await AsyncStorage.setItem(KEY, JSON.stringify(p))
  } catch {
    /* noop */
  }
}

export async function loadProgramaCache(): Promise<ProgramaRemoto | null> {
  try {
    const raw = await AsyncStorage.getItem(KEY)
    return raw ? (JSON.parse(raw) as ProgramaRemoto) : null
  } catch {
    return null
  }
}

export async function clearProgramaCache(): Promise<void> {
  try {
    await AsyncStorage.removeItem(KEY)
  } catch {
    /* noop */
  }
}
