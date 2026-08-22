// Persistência local (offline-first). Tudo mora no dispositivo.
// TODO(v1.1): fila de sync — subir sessões concluídas pra API do dash-pro quando online.

import AsyncStorage from '@react-native-async-storage/async-storage'
import type { Sessao } from '../data/types'

const ACTIVE_KEY = 'coreup:activeSession'
const HISTORY_KEY = 'coreup:sessions'

export async function saveActiveSession(s: Sessao): Promise<void> {
  try {
    await AsyncStorage.setItem(ACTIVE_KEY, JSON.stringify(s))
  } catch {
    // offline-first: falha de storage não pode derrubar o treino
  }
}

export async function loadActiveSession(): Promise<Sessao | null> {
  try {
    const raw = await AsyncStorage.getItem(ACTIVE_KEY)
    return raw ? (JSON.parse(raw) as Sessao) : null
  } catch {
    return null
  }
}

export async function clearActiveSession(): Promise<void> {
  try {
    await AsyncStorage.removeItem(ACTIVE_KEY)
  } catch {
    /* noop */
  }
}

export async function appendCompletedSession(s: Sessao): Promise<void> {
  try {
    const raw = await AsyncStorage.getItem(HISTORY_KEY)
    const list: Sessao[] = raw ? JSON.parse(raw) : []
    list.unshift(s)
    await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(list))
  } catch {
    /* noop */
  }
}

export async function listSessions(): Promise<Sessao[]> {
  try {
    const raw = await AsyncStorage.getItem(HISTORY_KEY)
    return raw ? (JSON.parse(raw) as Sessao[]) : []
  } catch {
    return []
  }
}
