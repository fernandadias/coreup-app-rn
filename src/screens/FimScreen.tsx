import { useState } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { Screen } from '../components/Screen'
import { Card } from '../components/Card'
import { Button } from '../components/Button'
import { Icon } from '../components/Icon'
import { colors, font, radius } from '../theme/theme'
import { fmtClock } from '../lib/format'
import { appendCompletedSession, clearActiveSession } from '../storage/sessions'
import type { ScreenProps } from '../navigation/types'

const fmtVolume = (n: number) => Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')

const SENSACOES: { valor: number; icon: React.ComponentProps<typeof Icon>['name']; label: string }[] = [
  { valor: 1, icon: 'face-tired', label: 'Acabei' },
  { valor: 2, icon: 'face-frown', label: 'Pesado' },
  { valor: 3, icon: 'face-meh', label: 'Ok' },
  { valor: 4, icon: 'face-smile', label: 'Bem' },
  { valor: 5, icon: 'face-grin-stars', label: 'Voando' },
]

// #35: transição simples pro MVP. UX de emoção/resultado é dívida a repensar (upstream).
export function FimScreen({ route, navigation }: ScreenProps<'Fim'>) {
  const { sessao } = route.params
  const [sensacao, setSensacao] = useState<number | null>(null)

  const salvar = async () => {
    await appendCompletedSession({ ...sessao, sensacao })
    await clearActiveSession()
    navigation.reset({ index: 0, routes: [{ name: 'Home' }] })
  }

  return (
    <Screen>
      <View style={styles.content}>
        <View style={styles.hero}>
          <View style={styles.checkCircle}>
            <Icon name="check" size={34} color={colors.bg0} />
          </View>
          <Text style={styles.title}>Treino concluído</Text>
          <Text style={styles.sub}>{sessao.treinoTitulo}</Text>
        </View>

        <Card style={styles.resumo}>
          <Resumo value={fmtClock(sessao.duracaoSeg ?? 0)} label="Duração" />
          <View style={styles.divider} />
          <Resumo value={`${fmtVolume(sessao.volumeTotal ?? 0)}`} label="Volume (kg)" />
          <View style={styles.divider} />
          <Resumo value={`${sessao.seriesFeitas ?? 0}`} label="Séries" />
        </Card>

        <Text style={styles.pergunta}>Como você se sentiu?</Text>
        <View style={styles.faces}>
          {SENSACOES.map((s) => {
            const active = sensacao === s.valor
            return (
              <View key={s.valor} style={styles.faceWrap}>
                <View
                  style={[styles.face, active && styles.faceActive]}
                  onTouchEnd={() => setSensacao(s.valor)}
                >
                  <Icon name={s.icon} size={26} color={active ? colors.bg0 : colors.muted} />
                </View>
                <Text style={[styles.faceLabel, active && { color: colors.text }]}>{s.label}</Text>
              </View>
            )
          })}
        </View>

        <View style={{ flex: 1 }} />
        <Button label="Salvar treino" onPress={salvar} />
        <View style={{ height: 8 }} />
      </View>
    </Screen>
  )
}

function Resumo({ value, label }: { value: string; label: string }) {
  return (
    <View style={styles.resumoItem}>
      <Text style={styles.resumoValue}>{value}</Text>
      <Text style={styles.resumoLabel}>{label}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  content: { flex: 1, paddingHorizontal: 18, paddingTop: 24, paddingBottom: 20 },
  hero: { alignItems: 'center', marginBottom: 28 },
  checkCircle: {
    width: 72,
    height: 72,
    borderRadius: radius.pill,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: { color: colors.text, fontFamily: font.displayX, fontSize: 30 },
  sub: { color: colors.muted, fontFamily: font.medium, fontSize: 15, marginTop: 2 },
  resumo: { flexDirection: 'row', alignItems: 'center', paddingVertical: 18 },
  resumoItem: { flex: 1, alignItems: 'center' },
  resumoValue: { color: colors.text, fontFamily: font.displayX, fontSize: 24 },
  resumoLabel: {
    color: colors.muted,
    fontFamily: font.semibold,
    fontSize: 10,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
    marginTop: 3,
  },
  divider: { width: 1, alignSelf: 'stretch', backgroundColor: colors.border, marginVertical: 4 },
  pergunta: {
    color: colors.text,
    fontFamily: font.bold,
    fontSize: 15,
    textAlign: 'center',
    marginTop: 28,
    marginBottom: 16,
  },
  faces: { flexDirection: 'row', justifyContent: 'space-between' },
  faceWrap: { alignItems: 'center', gap: 6, flex: 1 },
  face: {
    width: 52,
    height: 52,
    borderRadius: radius.pill,
    backgroundColor: colors.bg1,
    borderColor: colors.border,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  faceActive: { backgroundColor: colors.accent, borderColor: colors.accent },
  faceLabel: { color: colors.muted, fontFamily: font.semibold, fontSize: 11 },
})
