// Live Activity do treino (iOS) — lock screen + Dynamic Island.
// expo-widgets (alpha): a UI é definida em TSX com a diretiva 'widget' e transpilada pra SwiftUI.
// NÃO tem timer nativo auto-atualizável documentado — atualizamos por EVENTO (série X/Y, status),
// não de segundo em segundo (JS não roda com o celular bloqueado).
import { Text, VStack, HStack } from '@expo/ui/swift-ui'
import { padding, foregroundStyle, font } from '@expo/ui/swift-ui/modifiers'
import { createLiveActivity, type LiveActivityEnvironment } from 'expo-widgets'

export type WorkoutActivityProps = {
  exercicio: string
  serie: number
  totalSeries: number
  status: string // "Em treino" | "Descanso"
}

const CORE = '#BDEE63'
const TEXT = '#F2F3F5'
const MUTED = '#8A8A8E'

const WorkoutActivity = (props: WorkoutActivityProps, _env: LiveActivityEnvironment) => {
  'widget'
  return {
    banner: (
      <HStack modifiers={[padding({ all: 14 })]}>
        <VStack>
          <Text modifiers={[font({ size: 16, weight: 'bold' }), foregroundStyle(TEXT)]}>{props.exercicio}</Text>
          <Text modifiers={[font({ size: 13 }), foregroundStyle(MUTED)]}>
            {`Série ${props.serie} de ${props.totalSeries} · ${props.status}`}
          </Text>
        </VStack>
      </HStack>
    ),
    compactLeading: <Text modifiers={[foregroundStyle(CORE)]}>CU</Text>,
    compactTrailing: (
      <Text modifiers={[foregroundStyle(TEXT)]}>{`${props.serie}/${props.totalSeries}`}</Text>
    ),
    minimal: <Text modifiers={[foregroundStyle(CORE)]}>{`${props.serie}`}</Text>,
    expandedLeading: (
      <VStack modifiers={[padding({ all: 8 })]}>
        <Text modifiers={[font({ size: 15, weight: 'bold' }), foregroundStyle(TEXT)]}>{props.exercicio}</Text>
      </VStack>
    ),
    expandedTrailing: (
      <VStack modifiers={[padding({ all: 8 })]}>
        <Text modifiers={[font({ size: 15, weight: 'bold' }), foregroundStyle(CORE)]}>
          {`${props.serie}/${props.totalSeries}`}
        </Text>
      </VStack>
    ),
    expandedBottom: (
      <Text modifiers={[padding({ horizontal: 8 }), font({ size: 13 }), foregroundStyle(MUTED)]}>
        {props.status}
      </Text>
    ),
  }
}

export default createLiveActivity('WorkoutActivity', WorkoutActivity)
