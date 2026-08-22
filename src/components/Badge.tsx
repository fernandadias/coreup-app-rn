import { StyleSheet, Text, View } from 'react-native'
import { colors, font, radius } from '../theme/theme'
import { Icon } from './Icon'

export function Badge({
  icon,
  children,
}: {
  icon?: React.ComponentProps<typeof Icon>['name']
  children: React.ReactNode
}) {
  return (
    <View style={styles.badge}>
      {icon ? <Icon name={icon} size={11} color={colors.muted} /> : null}
      <Text style={styles.text}>{children}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.bg2,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  text: { color: colors.muted, fontFamily: font.semibold, fontSize: 11.5 },
})
