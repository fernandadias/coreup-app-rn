import { useCallback, useState } from 'react'
import { ScrollView, StyleSheet, Text, View } from 'react-native'
import { useFocusEffect } from '@react-navigation/native'
import { Screen } from '../components/Screen'
import { Card } from '../components/Card'
import { Icon } from '../components/Icon'
import { colors, font, radius } from '../theme/theme'
import { fmtClock } from '../lib/format'
import { recordes1RM, treinoMaisPesado, weeksStreak } from '../lib/stats'
import { listSessions } from '../storage/sessions'
import { getExercicio } from '../data/exercicios'
import type { Sessao } from '../data/types'

const MESES = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez']
const fmtData = (ts: number) => {
  const d = new Date(ts)
  return `${d.getDate()} ${MESES[d.getMonth()]}`
}
const fmtVol = (n: number) => Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')
const fmtKg = (n: number) => n.toString().replace('.', ',')

const FACE: Record<number, React.ComponentProps<typeof Icon>['name']> = {
  1: 'face-tired',
  2: 'face-frown',
  3: 'face-meh',
  4: 'face-smile',
  5: 'face-grin-stars',
}

export function EvolucaoScreen() {
  const [sessions, setSessions] = useState<Sessao[]>([])

  useFocusEffect(
    useCallback(() => {
      let alive = true
      listSessions().then((s) => alive && setSessions(s))
      return () => {
        alive = false
      }
    }, [])
  )

  const total = sessions.length
  const volumeTotal = sessions.reduce((a, s) => a + (s.volumeTotal ?? 0), 0)
  const agora = new Date()
  const esteMes = sessions.filter((s) => {
    const d = new Date(s.iniciadaEm)
    return d.getMonth() === agora.getMonth() && d.getFullYear() === agora.getFullYear()
  }).length

  const recordes = recordes1RM(sessions)
  const maisPesado = treinoMaisPesado(sessions)
  const streak = weeksStreak(sessions)

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.h1}>Evolução</Text>

        {total === 0 ? (
          <View style={styles.empty}>
            <Icon name="chart-line" size={30} color={colors.faint} />
            <Text style={styles.emptyTxt}>Conclua um treino e ele aparece aqui — histórico e recordes.</Text>
          </View>
        ) : (
          <>
            <Card style={styles.resumo}>
              <Metric value={String(total)} label="Treinos" accent />
              <View style={styles.sep} />
              <Metric value={fmtVol(volumeTotal)} label="Volume (kg)" />
              <View style={styles.sep} />
              <Metric value={String(esteMes)} label="Este mês" />
            </Card>

            {/* dois cartões-herói */}
            <View style={styles.heroRow}>
              <HeroCard
                icon="trophy"
                titulo="Treino mais pesado"
                valor={maisPesado ? fmtVol(maisPesado.volumeTotal ?? 0) : '—'}
                unidade="kg"
                rodape={maisPesado ? fmtData(maisPesado.iniciadaEm) : ''}
              />
              <HeroCard
                icon="fire"
                titulo="Sequência"
                valor={String(streak)}
                unidade={streak === 1 ? 'semana' : 'semanas'}
                rodape="sem furar"
              />
            </View>

            {recordes.length > 0 && (
              <>
                <Text style={styles.section}>1RM estimado</Text>
                {recordes.map((r) => (
                  <View key={r.exercicioId} style={styles.recRow}>
                    <View style={{ flex: 1 }}>
                      <View style={styles.recTop}>
                        <Text style={styles.recNome} numberOfLines={1}>
                          {getExercicio(r.exercicioId)?.nome ?? 'Exercício'}
                        </Text>
                        {r.novo && (
                          <View style={styles.novoBadge}>
                            <Text style={styles.novoTxt}>NOVO</Text>
                          </View>
                        )}
                      </View>
                      <Text style={styles.recBase}>
                        de {fmtKg(r.kg)} kg × {r.reps}
                      </Text>
                    </View>
                    <Text style={styles.recValor}>
                      {fmtKg(r.est1RM)} <Text style={styles.recUnid}>kg</Text>
                    </Text>
                  </View>
                ))}
                <Text style={styles.nota}>Estimativa a partir das suas séries (fórmula de Epley).</Text>
              </>
            )}

            <Text style={styles.section}>Histórico</Text>
            {sessions.map((s) => (
              <View key={s.id} style={styles.histRow}>
                <View style={styles.histData}>
                  <Text style={styles.histDia}>{fmtData(s.iniciadaEm)}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.histTitulo}>{s.rotinaTitulo}</Text>
                  <Text style={styles.histMeta}>
                    {fmtClock(s.duracaoSeg ?? 0)} · {fmtVol(s.volumeTotal ?? 0)} kg · {s.seriesFeitas ?? 0} séries
                  </Text>
                </View>
                {s.sensacao ? <Icon name={FACE[s.sensacao]} size={20} color={colors.muted} /> : null}
              </View>
            ))}
          </>
        )}
        <View style={{ height: 24 }} />
      </ScrollView>
    </Screen>
  )
}

function Metric({ value, label, accent }: { value: string; label: string; accent?: boolean }) {
  return (
    <View style={styles.metric}>
      <Text style={[styles.metricValue, accent && { color: colors.accent }]}>{value}</Text>
      <Text style={styles.metricLabel}>{label}</Text>
    </View>
  )
}

function HeroCard({
  icon,
  titulo,
  valor,
  unidade,
  rodape,
}: {
  icon: React.ComponentProps<typeof Icon>['name']
  titulo: string
  valor: string
  unidade: string
  rodape: string
}) {
  return (
    <View style={styles.hero}>
      <View style={styles.heroHead}>
        <Icon name={icon} size={13} color={colors.accent} />
        <Text style={styles.heroTitulo}>{titulo}</Text>
      </View>
      <Text style={styles.heroValor}>
        {valor} <Text style={styles.heroUnid}>{unidade}</Text>
      </Text>
      <Text style={styles.heroRodape}>{rodape}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: 18, paddingTop: 8 },
  h1: { color: colors.text, fontFamily: font.displayX, fontSize: 30, marginBottom: 16 },
  empty: { alignItems: 'center', gap: 12, paddingVertical: 60, paddingHorizontal: 24 },
  emptyTxt: { color: colors.muted, fontFamily: font.medium, fontSize: 14, textAlign: 'center', lineHeight: 20 },

  resumo: { flexDirection: 'row', alignItems: 'center', paddingVertical: 16, marginBottom: 12 },
  metric: { flex: 1, alignItems: 'center' },
  metricValue: { color: colors.text, fontFamily: font.displayX, fontSize: 24 },
  metricLabel: {
    color: colors.muted,
    fontFamily: font.semibold,
    fontSize: 10,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
    marginTop: 3,
  },
  sep: { width: 1, alignSelf: 'stretch', backgroundColor: colors.border, marginVertical: 4 },

  heroRow: { flexDirection: 'row', gap: 10 },
  hero: {
    flex: 1,
    backgroundColor: colors.bg1,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radius.lg,
    padding: 14,
  },
  heroHead: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 10 },
  heroTitulo: {
    color: colors.muted,
    fontFamily: font.semibold,
    fontSize: 10.5,
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  heroValor: { color: colors.text, fontFamily: font.displayX, fontSize: 30 },
  heroUnid: { color: colors.muted, fontFamily: font.semibold, fontSize: 14 },
  heroRodape: { color: colors.faint, fontFamily: font.regular, fontSize: 12, marginTop: 2 },

  section: {
    color: colors.muted,
    fontFamily: font.semibold,
    fontSize: 11,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginTop: 22,
    marginBottom: 10,
  },

  recRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.bg1,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radius.lg,
    padding: 14,
    marginBottom: 8,
  },
  recTop: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  recNome: { color: colors.text, fontFamily: font.bold, fontSize: 15, flexShrink: 1 },
  novoBadge: { backgroundColor: colors.accent, borderRadius: radius.sm, paddingHorizontal: 6, paddingVertical: 1 },
  novoTxt: { color: colors.bg0, fontFamily: font.extrabold, fontSize: 9, letterSpacing: 0.4 },
  recBase: { color: colors.muted, fontFamily: font.regular, fontSize: 12.5, marginTop: 2 },
  recValor: { color: colors.accent, fontFamily: font.displayX, fontSize: 24 },
  recUnid: { color: colors.muted, fontFamily: font.semibold, fontSize: 13 },
  nota: { color: colors.faint, fontFamily: font.regular, fontSize: 11.5, marginTop: 2, marginBottom: 2 },

  histRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  histData: { width: 48 },
  histDia: { color: colors.accent, fontFamily: font.bold, fontSize: 13 },
  histTitulo: { color: colors.text, fontFamily: font.semibold, fontSize: 14.5 },
  histMeta: { color: colors.muted, fontFamily: font.regular, fontSize: 12.5, marginTop: 1 },
})
