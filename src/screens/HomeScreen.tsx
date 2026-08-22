import { ScrollView, StyleSheet, Text, View } from 'react-native'
import { Screen } from '../components/Screen'
import { Card } from '../components/Card'
import { Button } from '../components/Button'
import { Icon } from '../components/Icon'
import { colors, font, radius } from '../theme/theme'
import { programa, treinoA } from '../data/seed'
import type { ScreenProps } from '../navigation/types'

export function HomeScreen({ navigation }: ScreenProps<'Home'>) {
  const hoje = programa[0] // v1: treino A é o de hoje

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.top}>
          <View>
            <Text style={styles.hello}>Bom treino</Text>
            <Wordmark />
          </View>
          <View style={styles.streak}>
            <Icon name="fire" size={13} color={colors.accent} />
            <Text style={styles.streakTxt}>5</Text>
          </View>
        </View>

        <Text style={styles.section}>Treino de hoje</Text>
        <Card highlight style={styles.hoje}>
          <View style={styles.hojeHead}>
            <View style={styles.badgeBig}>
              <Text style={styles.badgeBigTxt}>{hoje.badge}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.hojeTitle}>{hoje.titulo}</Text>
              <Text style={styles.hojeMeta}>{hoje.meta}</Text>
            </View>
          </View>
          <Button
            label="Iniciar treino"
            variant="secondary"
            style={styles.iniciar}
            onPress={() => navigation.navigate('Treino', { treinoId: hoje.id })}
          >
            <Icon name="play" size={13} color={colors.text} />
          </Button>
        </Card>

        <Card style={styles.noteCard}>
          <View style={styles.noteHead}>
            <Icon name="comment-dots" size={13} color={colors.accent} />
            <Text style={styles.noteTitle}>Recado do coach</Text>
          </View>
          <Text style={styles.noteTxt}>{treinoA.coachNote}</Text>
        </Card>

        <Text style={styles.section}>Seu programa</Text>
        {programa.map((t, i) => (
          <View key={t.id} style={styles.progRow}>
            <View style={[styles.badge, i === 0 && styles.badgeActive]}>
              <Text style={[styles.badgeTxt, i === 0 && styles.badgeTxtActive]}>{t.badge}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.progTitle}>{t.titulo}</Text>
              <Text style={styles.progMeta}>
                {t.meta} · {t.ultimaVez}
              </Text>
            </View>
            {i === 0 ? <Icon name="chevron-right" size={13} color={colors.muted} /> : null}
          </View>
        ))}
        <View style={{ height: 24 }} />
      </ScrollView>
    </Screen>
  )
}

function Wordmark() {
  return (
    <View style={styles.wordmark}>
      <Text style={styles.wmCore}>CORE</Text>
      <View style={styles.wmUpBox}>
        <Text style={styles.wmUp}>UP</Text>
      </View>
      <Text style={styles.wmTeam}>TEAM</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: 18, paddingTop: 8 },
  top: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 22 },
  hello: { color: colors.muted, fontFamily: font.medium, fontSize: 14, marginBottom: 2 },
  wordmark: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  wmCore: { color: colors.text, fontFamily: font.displaySemi, fontStyle: 'italic', fontSize: 26 },
  wmUpBox: { backgroundColor: colors.accent, borderRadius: 5, paddingHorizontal: 5, paddingVertical: 1 },
  wmUp: { color: colors.bg0, fontFamily: font.displayX, fontSize: 24 },
  wmTeam: { color: colors.text, fontFamily: font.displaySemi, fontSize: 22 },
  streak: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: colors.bg1,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radius.pill,
    paddingHorizontal: 11,
    paddingVertical: 6,
  },
  streakTxt: { color: colors.text, fontFamily: font.bold, fontSize: 14 },
  section: {
    color: colors.muted,
    fontFamily: font.semibold,
    fontSize: 11,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: 10,
    marginTop: 8,
  },
  hoje: { marginBottom: 16 },
  hojeHead: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 14 },
  badgeBig: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    backgroundColor: colors.bg0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeBigTxt: { color: colors.accent, fontFamily: font.displayX, fontSize: 24 },
  hojeTitle: { color: colors.bg0, fontFamily: font.extrabold, fontSize: 19 },
  hojeMeta: { color: 'rgba(10,14,12,0.7)', fontFamily: font.medium, fontSize: 13, marginTop: 1 },
  iniciar: { backgroundColor: colors.bg0, borderColor: colors.bg0 },
  noteCard: { marginBottom: 16 },
  noteHead: { flexDirection: 'row', alignItems: 'center', gap: 7, marginBottom: 7 },
  noteTitle: { color: colors.text, fontFamily: font.bold, fontSize: 13 },
  noteTxt: { color: colors.muted, fontFamily: font.regular, fontSize: 13.5, lineHeight: 20 },
  progRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.bg1,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radius.lg,
    padding: 12,
    marginBottom: 8,
  },
  badge: {
    width: 38,
    height: 38,
    borderRadius: radius.md,
    backgroundColor: colors.bg2,
    borderColor: colors.border,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeActive: { backgroundColor: colors.accent, borderColor: colors.accent },
  badgeTxt: { color: colors.muted, fontFamily: font.displayX, fontSize: 20 },
  badgeTxtActive: { color: colors.bg0 },
  progTitle: { color: colors.text, fontFamily: font.bold, fontSize: 15 },
  progMeta: { color: colors.muted, fontFamily: font.regular, fontSize: 12.5, marginTop: 1 },
})
