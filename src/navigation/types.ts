import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import type { Sessao } from '../data/types'

export type RootStackParamList = {
  Home: undefined
  Treino: { treinoId: string }
  Fim: { sessao: Sessao }
}

export type ScreenProps<T extends keyof RootStackParamList> = NativeStackScreenProps<RootStackParamList, T>
