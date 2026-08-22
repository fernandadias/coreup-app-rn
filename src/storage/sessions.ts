// Persistência local (offline-first). Tudo mora no dispositivo.
// TODO(M2 / #19): fila de sync — subir sessões concluídas pra API quando online.

import AsyncStorage from '@react-native-async-storage/async-storage'
import type { Sessao } from '../data/types'

const ACTIVE_KEY = 'coreup:activeSession'
const HISTORY_KEY = 'coreup:sessions'

/**
 * Migração do formato pré-M1 (#46, #62).
 *
 * Sessões gravadas antes do modelo unificado não têm `tipo`, `usuarioId` nem
 * `rotinaId` — usavam `treinoId`/`treinoTitulo`. Como esse dado já existe no
 * celular, normalizamos na leitura em vez de descartar.
 */
function migrar(raw: unknown): Sessao | null {
  if (!raw || typeof raw !== 'object') return null
  const s = raw as Record<string, unknown>
  if (typeof s.id !== 'string') return null

  return {
    id: s.id,
    usuarioId: typeof s.usuarioId === 'string' ? s.usuarioId : null,
    rotinaId: typeof s.rotinaId === 'string' ? s.rotinaId : String(s.treinoId ?? ''),
    rotinaTitulo: typeof s.rotinaTitulo === 'string' ? s.rotinaTitulo : String(s.treinoTitulo ?? ''),
    tipo: s.tipo === 'micro' ? 'micro' : 'treino',
    iniciadaEm: Number(s.iniciadaEm ?? 0),
    concluidaEm: s.concluidaEm == null ? null : Number(s.concluidaEm),
    duracaoSeg: s.duracaoSeg == null ? null : Number(s.duracaoSeg),
    volumeTotal: s.volumeTotal == null ? null : Number(s.volumeTotal),
    seriesFeitas: s.seriesFeitas == null ? null : Number(s.seriesFeitas),
    sensacao: s.sensacao == null ? null : Number(s.sensacao),
    logs: Array.isArray(s.logs)
      ? s.logs.map((l: Record<string, unknown>) => ({
          serieId: String(l.serieId ?? ''),
          label: String(l.label ?? ''),
          tipo: l.tipo === 'aquecimento' ? 'aquecimento' : 'valida',
          exercicioId: typeof l.exercicioId === 'string' ? l.exercicioId : '',
          kg: String(l.kg ?? ''),
          reps: String(l.reps ?? ''),
          pse: l.pse == null ? null : Number(l.pse),
        }))
      : [],
  }
}

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
    return raw ? migrar(JSON.parse(raw)) : null
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
    const list: unknown[] = raw ? JSON.parse(raw) : []
    list.unshift(s)
    await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(list))
  } catch {
    /* noop */
  }
}

export async function listSessions(): Promise<Sessao[]> {
  try {
    const raw = await AsyncStorage.getItem(HISTORY_KEY)
    if (!raw) return []
    const list: unknown[] = JSON.parse(raw)
    return list.map(migrar).filter((s): s is Sessao => s !== null)
  } catch {
    return []
  }
}
