// Perfil + anamnese do usuário (offline-first, igual sessions).
// A anamnese é o gate de first-run: sem ela, o app manda pra tela de anamnese.
// TODO(#69 backend): subir anamnese pro Supabase pro coach ler no dash.

import AsyncStorage from '@react-native-async-storage/async-storage'
import type { Anamnese } from '../data/types'

const ANAMNESE_KEY = 'coreup:anamnese'

export async function saveAnamnese(a: Anamnese): Promise<void> {
  try {
    await AsyncStorage.setItem(ANAMNESE_KEY, JSON.stringify(a))
  } catch {
    // offline-first: falha de storage não pode travar o onboarding
  }
}

export async function loadAnamnese(): Promise<Anamnese | null> {
  try {
    const raw = await AsyncStorage.getItem(ANAMNESE_KEY)
    if (!raw) return null
    const a = JSON.parse(raw) as Partial<Anamnese>
    // guarda mínima: sem o carimbo de preenchimento, trata como ausente
    if (!a || typeof a.preenchidaEm !== 'number') return null
    return {
      usuarioId: String(a.usuarioId ?? ''),
      horasSentadoDia: Number(a.horasSentadoDia ?? 0),
      objetivo: a.objetivo ?? 'saude',
      locais: Array.isArray(a.locais) ? a.locais : [],
      estilos: Array.isArray(a.estilos) ? a.estilos : [],
      outrasAtividades: Array.isArray(a.outrasAtividades) ? a.outrasAtividades : [],
      dores: Array.isArray(a.dores) ? a.dores : [],
      observacoes: String(a.observacoes ?? ''),
      diasPorSemana: Number(a.diasPorSemana ?? 3),
      preenchidaEm: Number(a.preenchidaEm),
    }
  } catch {
    return null
  }
}

export async function clearAnamnese(): Promise<void> {
  try {
    await AsyncStorage.removeItem(ANAMNESE_KEY)
  } catch {
    /* noop */
  }
}
