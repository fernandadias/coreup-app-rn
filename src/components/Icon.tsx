import { FontAwesome6 } from '@expo/vector-icons'
import type { StyleProp, TextStyle } from 'react-native'
import { colors } from '../theme/theme'

// Regra CoreUP: ícone é sempre FontAwesome, nunca emoji.
export function Icon({
  name,
  size = 16,
  color = colors.text,
  style,
}: {
  name: React.ComponentProps<typeof FontAwesome6>['name']
  size?: number
  color?: string
  style?: StyleProp<TextStyle>
}) {
  return <FontAwesome6 name={name} size={size} color={color} style={style} />
}
