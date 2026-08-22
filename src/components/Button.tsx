import { Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native'
import { colors, font, radius, glowPrimary } from '../theme/theme'

type Variant = 'primary' | 'secondary' | 'danger'
type Size = 'sm' | 'md'

export function Button({
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled,
  style,
  children,
}: {
  label?: string
  onPress?: () => void
  variant?: Variant
  size?: Size
  disabled?: boolean
  style?: StyleProp<ViewStyle>
  children?: React.ReactNode
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.base,
        size === 'sm' ? styles.sm : styles.md,
        variant === 'primary' && styles.primary,
        variant === 'secondary' && styles.secondary,
        variant === 'danger' && styles.danger,
        variant === 'primary' && glowPrimary,
        pressed && styles.pressed,
        disabled && styles.disabled,
        style,
      ]}
    >
      <View style={styles.row}>
        {label ? (
          <Text
            style={[
              styles.label,
              size === 'sm' ? styles.labelSm : styles.labelMd,
              variant === 'primary' && styles.labelPrimary,
              variant === 'danger' && styles.labelDanger,
            ]}
          >
            {label}
          </Text>
        ) : null}
        {children}
      </View>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  base: { alignItems: 'center', justifyContent: 'center', borderRadius: radius.lg, borderWidth: 1 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  sm: { paddingHorizontal: 14, paddingVertical: 8 },
  md: { paddingHorizontal: 18, paddingVertical: 13 },
  primary: { backgroundColor: colors.accent, borderColor: colors.accent },
  secondary: { backgroundColor: colors.surface3, borderColor: 'transparent' },
  danger: { backgroundColor: 'transparent', borderColor: colors.danger },
  pressed: { opacity: 0.85 },
  disabled: { opacity: 0.4 },
  label: { fontFamily: font.semibold, color: colors.text },
  labelSm: { fontSize: 13 },
  labelMd: { fontSize: 15 },
  labelPrimary: { color: colors.bg0, fontFamily: font.bold },
  labelDanger: { color: colors.danger },
})
