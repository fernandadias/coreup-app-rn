import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native'
import { colors, radius } from '../theme/theme'

export function Card({
  children,
  style,
  highlight,
}: {
  children: React.ReactNode
  style?: StyleProp<ViewStyle>
  highlight?: boolean // variante accent (fundo lima, texto bg0)
}) {
  return <View style={[styles.card, highlight && styles.highlight, style]}>{children}</View>
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.bg1,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radius.lg,
    padding: 16,
  },
  highlight: { backgroundColor: colors.accent, borderColor: colors.accent },
})
