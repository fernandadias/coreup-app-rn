import { useCallback, useState } from 'react'
import { Alert, Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { useFocusEffect } from '@react-navigation/native'
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs'
import { Screen } from '../components/Screen'
import { Card } from '../components/Card'
import { Button } from '../components/Button'
import { Icon } from '../components/Icon'
import { TreinoResumoSheet } from '../components/TreinoResumoSheet'
import { StreakSheet } from '../components/StreakSheet'
import { colors, font, radius } from '../theme/theme'
import { syncPendingSessions } from '../api/sync'
import { listSessions } from '../storage/sessions'
import { loadActiveWorkout, clearActiveWorkout, type ActiveWorkout } from '../storage/activeWorkout'
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

const DIA = 24 * 60 * 60 * 1000
function quando(ts: number): string {
  const dias = Math.floor((Date.now() - ts) / DIA)
  if (dias <= 0) return 'hoje'
  if (dias === 1) return 'ontem'
  return `há ${dias} dias`
}

export function HomeScreen({ navigation }: TabScreenProps<'Home'>) {
  const { nome } = usePerfil()
  const { programa, coachNote, getTreino } = usePrograma()
  const tabBarH = useBottomTabBarHeight()
  const [sessions, setSessions] = useState<Sessao[]>([])
  const [ativo, setAtivo] = useState<ActiveWorkout | null>(null)
  const [resumoId, setResumoId] = useState<string | null>(null)
  const [streakOpen, setStreakOpen] = useState(false)

  useFocusEffect(
    useCallback(() => {
      let alive = true
      void syncPendingSessions()
      listSessions().then((s) => alive && setSessions(s))
      loadActiveWorkout().then((w) => alive && setAtivo(w))
      return () => {
        alive = false
      }
    }, [])
  )

  const streak = weeksStreak(sessions)
  const feitosSemana = sessionsThisWeek(sessions)

  // sequência do programa: o próximo é o seguinte ao último treino concluído (A→B→C→A)
  const ultima = sessions[0] ?? null
  const idxUltimo = ultima ? programa.findIndex((r) => r.id === ultima.rotinaId) : -1
  const proximo = programa[idxUltimo >= 0 ? (idxUltimo + 1) % programa.length : 0]

  const irPraTreino = (id: string) => {
    setResumoId(null)
    navigation.navigate('Treino', { treinoId: id })
  }

  const iniciar = (id: string) => {
    // já tem OUTRO treino em andamento → pergunta antes (também é a forma de parar)
    if (ativo && ativo.rotinaId !== id) {
      setResumoId(null)
      Alert.alert('Treino em andamento', `Você já tem ${ativo.rotinaTitulo} em andamento. Quer parar e começar este?`, [
        { text: 'Continuar o atual', onPress: () => navigation.navigate('Treino', { treinoId: ativo.rotinaId }) },
        {
          text: 'Parar e começar',
          style: 'destructive',
          onPress: async () => {
            await clearActiveWorkout()
            setAtivo(null)
            navigation.navigate('Treino', { treinoId: id })
          },
        },
      ])
      return
    }
    irPraTreino(id)
  }

  const descartarAtivo = () =>
    Alert.alert('Parar treino', 'O que você registrou será descartado.', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Parar', style: 'destructive', onPress: async () => { await clearActiveWorkout(); setAtivo(null) } },
    ])

  return (
    <Screen>
      <ScrollView
        contentContainerStyle={[styles.content, ativo ? { paddingBottom: 84 } : null]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.top}>
          <View style={styles.topLeft}>
            <Pressable style={styles.avatar} onPress={() => navigation.navigate('Perfil')} hitSlop={6}>
              <Text style={styles.avatarTxt}>{iniciais(nome)}</Text>
            </Pressable>
            <View>
              <Text style={styles.hello}>Bom treino, {nome.split(' ')[0]}</Text>
              <Image
                source={require('../../assets/logo-coreupteam.png')}
                style={styles.logo}
                resizeMode="contain"
              />
            </View>
          </View>
          <Pressable style={styles.streak} onPress={() => setStreakOpen(true)} hitSlop={6}>
            <Icon name="fire" size={13} color={colors.accent} />
            <Text style={styles.streakTxt}>{streak}</Text>
          </Pressable>
        </View>

        {proximo ? (
          <>
            <Text style={styles.section}>Próximo treino</Text>
            <Card highlight style={styles.hoje}>
              <View style={styles.hojeHead}>
                <View style={styles.badgeBig}>
                  <Text style={styles.badgeBigTxt}>{proximo.badge}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.hojeTitle}>{proximo.titulo}</Text>
                  <Text style={styles.hojeMeta}>{proximo.meta}</Text>
                </View>
              </View>
              <Button
                label="Iniciar treino"
                variant="secondary"
                style={styles.iniciar}
                onPress={() => iniciar(proximo.id)}
              >
                <Icon name="play" size={13} color={colors.text} />
              </Button>
            </Card>
            {ultima ? (
              <Text style={styles.ultimo}>
                Último: {ultima.rotinaTitulo} · {quando(ultima.iniciadaEm)}
              </Text>
            ) : null}
          </>
        ) : null}

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
        {programa.map((t) => {
          const ehProximo = proximo && t.id === proximo.id
          return (
            <Pressable key={t.id} style={styles.progRow} onPress={() => setResumoId(t.id)}>
              <View style={[styles.badge, ehProximo && styles.badgeActive]}>
                <Text style={[styles.badgeTxt, ehProximo && styles.badgeTxtActive]}>{t.badge}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.progTitle}>{t.titulo}</Text>
                <Text style={styles.progMeta}>{t.meta}</Text>
              </View>
              <Icon name="chevron-right" size={13} color={colors.muted} />
            </Pressable>
          )
        })}
        <View style={{ height: 24 }} />
      </ScrollView>

      {ativo ? (
        <View style={[styles.andamento, { bottom: tabBarH + 10 }]}>
          <Pressable
            style={styles.andamentoMain}
            onPress={() => navigation.navigate('Treino', { treinoId: ativo.rotinaId })}
          >
            <View style={styles.andamentoDot}>
              <Icon name="dumbbell" size={13} color={colors.bg0} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.andamentoLabel}>Treino em andamento</Text>
              <Text style={styles.andamentoTitulo} numberOfLines={1}>
                {ativo.rotinaTitulo}
              </Text>
            </View>
            <Text style={styles.andamentoCta}>Retomar</Text>
          </Pressable>
          <Pressable onPress={descartarAtivo} hitSlop={10} style={styles.andamentoX}>
            <Icon name="xmark" size={15} color={colors.muted} />
          </Pressable>
        </View>
      ) : null}

      <TreinoResumoSheet
        treino={resumoId ? getTreino(resumoId) : null}
        onIniciar={iniciar}
        onClose={() => setResumoId(null)}
      />
      <StreakSheet
        open={streakOpen}
        semanas={streak}
        treinosNaSemana={feitosSemana}
        onVerEvolucao={() => {
          setStreakOpen(false)
          navigation.navigate('Evolucao')
        }}
        onClose={() => setStreakOpen(false)}
      />
    </Screen>
  )
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: 18, paddingTop: 8 },
  top: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 },
  topLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: radius.pill,
    backgroundColor: colors.bg2,
    borderColor: colors.border,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarTxt: { color: colors.accent, fontFamily: font.displayX, fontSize: 17 },
  hello: { color: colors.text, fontFamily: font.semibold, fontSize: 15, marginBottom: 4 },
  logo: { width: 116, height: 116 * (43 / 438) },
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
  hoje: { marginBottom: 8 },
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
  ultimo: { color: colors.faint, fontFamily: font.regular, fontSize: 12.5, marginBottom: 16, paddingHorizontal: 2 },
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

  andamento: {
    position: 'absolute',
    left: 14,
    right: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.bg2,
    borderColor: colors.accent,
    borderWidth: 1,
    borderRadius: radius.xl,
    paddingLeft: 10,
    paddingRight: 6,
    paddingVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 8,
  },
  andamentoMain: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  andamentoDot: {
    width: 30,
    height: 30,
    borderRadius: radius.pill,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  andamentoLabel: {
    color: colors.muted,
    fontFamily: font.semibold,
    fontSize: 9.5,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  andamentoTitulo: { color: colors.text, fontFamily: font.bold, fontSize: 14, marginTop: 1 },
  andamentoCta: { color: colors.accent, fontFamily: font.bold, fontSize: 13 },
  andamentoX: { width: 34, height: 34, alignItems: 'center', justifyContent: 'center' },
})
