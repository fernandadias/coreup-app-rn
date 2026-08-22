import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native'
import { SafeAreaView, type Edge } from 'react-native-safe-area-context'
import { colors } from '../theme/theme'

export function Screen({
  children,
  style,
  edges = ['top'],
}: {
  children: React.ReactNode
  style?: StyleProp<ViewStyle>
  edges?: Edge[]
}) {
  return (
    <SafeAreaView style={styles.safe} edges={edges}>
      <View style={[styles.inner, style]}>{children}</View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg0 },
  inner: { flex: 1 },
})
