import { useCallback, useState } from 'react'
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { useFocusEffect } from '@react-navigation/native'
import { Screen } from '../components/Screen'
import { Card } from '../components/Card'
import { Button } from '../components/Button'
import { Icon } from '../components/Icon'
import { colors, font, radius } from '../theme/theme'
import { syncPendingSessions } from '../api/sync'
import { listSessions } from '../storage/sessions'
import { sessionsThisWeek, weeksStreak } from '../lib/stats'
import { usePerfil } from '../perfil/PerfilProvider'
import { usePrograma } from '../programa/ProgramaProvider'
import type { Sessao } from '../data/types'
import type { TabScreenProps } from '../navigation/types'

const iniciais = (nome: string) =>
  nome
    .split(' ')
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? '')
    .join('')

export function HomeScreen({ navigation }: TabScreenProps<'Home'>) {
  const { nome, anamnese } = usePerfil()
  const { programa, coachNote } = usePrograma()
  const hoje = programa[0] // v1: primeiro treino do programa é o de hoje
  const [sessions, setSessions] = useState<Sessao[]>([])

  useFocusEffect(
    useCallback(() => {
      let alive = true
      void syncPendingSessions() // offline-first: empurra pendências ao abrir
      listSessions().then((s) => alive && setSessions(s))
      return () => {
        alive = false
      }
    }, [])
  )

  const streak = weeksStreak(sessions)
  const feitos = sessionsThisWeek(sessions)
  const meta = anamnese?.diasPorSemana ?? 3

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.top}>
          <Image source={require('../../assets/logo-coreupteam.png')} style={styles.logo} resizeMode="contain" />
          <View style={styles.topRight}>
            <View style={styles.streak}>
              <Icon name="fire" size={13} color={colors.accent} />
              <Text style={styles.streakTxt}>{streak}</Text>
            </View>
            <Pressable style={styles.avatar} onPress={() => navigation.navigate('Perfil')} hitSlop={6}>
              <Text style={styles.avatarTxt}>{iniciais(nome)}</Text>
            </Pressable>
          </View>
        </View>

        <Text style={styles.hello}>Bom treino, {nome.split(' ')[0]}</Text>

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

        {/* resumo da semana */}
        <View style={styles.semana}>
          <View style={{ flex: 1 }}>
            <Text style={styles.semanaLabel}>Esta semana</Text>
            <Text style={styles.semanaValor}>
              {feitos} de {meta} <Text style={styles.semanaUnid}>treinos</Text>
            </Text>
          </View>
          <View style={styles.barras}>
            {Array.from({ length: meta }).map((_, i) => (
              <View key={i} style={[styles.barra, i < feitos && styles.barraOn]} />
            ))}
          </View>
        </View>

        {coachNote ? (
          <Card style={styles.noteCard}>
            <View style={styles.noteHead}>
              <Icon name="comment-dots" size={13} color={colors.accent} />
              <Text style={styles.noteTitle}>Recado do coach</Text>
            </View>
            <Text style={styles.noteTxt}>{coachNote}</Text>
          </Card>
        ) : null}

        <Text style={styles.section}>Seu programa</Text>
        {programa.map((t, i) => (
          <Pressable
            key={t.id}
            style={styles.progRow}
            onPress={() => navigation.navigate('Treino', { treinoId: t.id })}
          >
            <View style={[styles.badge, i === 0 && styles.badgeActive]}>
              <Text style={[styles.badgeTxt, i === 0 && styles.badgeTxtActive]}>{t.badge}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.progTitle}>{t.titulo}</Text>
              <Text style={styles.progMeta}>
                {t.meta} · {t.ultimaVez}
              </Text>
            </View>
            <Icon name="chevron-right" size={13} color={colors.muted} />
          </Pressable>
        ))}
        <View style={{ height: 24 }} />
      </ScrollView>
    </Screen>
  )
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: 18, paddingTop: 8 },
  top: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 },
  logo: { width: 128, height: 128 * (43 / 438) },
  hello: { color: colors.muted, fontFamily: font.medium, fontSize: 14, marginBottom: 18 },
  topRight: { flexDirection: 'row', alignItems: 'center', gap: 10 },
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
  avatar: {
    width: 38,
    height: 38,
    borderRadius: radius.pill,
    backgroundColor: colors.bg2,
    borderColor: colors.border,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarTxt: { color: colors.accent, fontFamily: font.displayX, fontSize: 15 },
  section: {
    color: colors.muted,
    fontFamily: font.semibold,
    fontSize: 11,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: 10,
    marginTop: 8,
  },
  hoje: { marginBottom: 14 },
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

  semana: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.bg1,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radius.lg,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 14,
  },
  semanaLabel: {
    color: colors.muted,
    fontFamily: font.semibold,
    fontSize: 10.5,
    letterSpacing: 0.3,
    textTransform: 'uppercase',
    marginBottom: 3,
  },
  semanaValor: { color: colors.text, fontFamily: font.displayX, fontSize: 22 },
  semanaUnid: { color: colors.muted, fontFamily: font.semibold, fontSize: 13 },
  barras: { flexDirection: 'row', gap: 5 },
  barra: { width: 10, height: 26, borderRadius: 3, backgroundColor: colors.bg2 },
  barraOn: { backgroundColor: colors.accent },

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
