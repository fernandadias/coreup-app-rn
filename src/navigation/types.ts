import type { NavigatorScreenParams, CompositeScreenProps } from '@react-navigation/native'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs'
import type { Sessao } from '../data/types'

// abas de baixo — 2 tabs. Perfil mora no avatar do header (#69). A Home concentra
// hoje + programa A/B/C, então Rotinas só volta como aba no mundo livre (biblioteca/montar).
export type TabsParamList = {
  Home: undefined
  Evolucao: undefined
}

// stack raiz: as abas + as telas de fluxo por cima (full screen, sem tab bar).
// Anamnese é o gate de first-run (renderizado no lugar das tabs até estar preenchida).
export type RootStackParamList = {
  Anamnese: undefined
  Tabs: NavigatorScreenParams<TabsParamList> | undefined
  Treino: { treinoId: string }
  Fim: { sessao: Sessao }
  Perfil: undefined
}

// props do stack (Treino/Fim)
export type ScreenProps<T extends keyof RootStackParamList> = NativeStackScreenProps<RootStackParamList, T>

// props das abas — compostas, pra Home poder navegar pro stack (Treino)
export type TabScreenProps<T extends keyof TabsParamList> = CompositeScreenProps<
  BottomTabScreenProps<TabsParamList, T>,
  NativeStackScreenProps<RootStackParamList>
>
