import { useCallback, useState } from 'react'
import { ScrollView, StyleSheet, Text, View } from 'react-native'
import { useFocusEffect } from '@react-navigation/native'
import { Screen } from '../components/Screen'
import { Card } from '../components/Card'
import { Icon } from '../components/Icon'
import { colors, font, radius } from '../theme/theme'
import { fmtClock, parseKg } from '../lib/format'
import { listSessions } from '../storage/sessions'
import { getExercicio } from '../data/exercicios'
import type { Sessao } from '../data/types'

const MESES = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez']
const fmtData = (ts: number) => {
  const d = new Date(ts)
  return `${d.getDate()} ${MESES[d.getMonth()]}`
}
const fmtVol = (n: number) => Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')

const FACE: Record<number, React.ComponentProps<typeof Icon>['name']> = {
  1: 'face-tired',
  2: 'face-frown',
  3: 'face-meh',
  4: 'face-smile',
  5: 'face-grin-stars',
}

interface Recorde {
  id: string
  nome: string
  bestKg: number
  bestReps: number
  serie: number[] // maxKg por sessão, cronológico
}

function agregar(sessions: Sessao[]): Recorde[] {
  // sessions vem do storage (mais recente primeiro); pra progressão queremos crescente
  const cron = [...sessions].reverse()
  const porEx = new Map<string, Recorde & { _porSessao: Map<string, number> }>()

  cron.forEach((s) => {
    s.logs.forEach((l) => {
      if (l.tipo === 'aquecimento') return
      const kg = parseKg(l.kg)
      if (!Number.isFinite(kg)) return
      const reps = parseInt(l.reps, 10)
      const nome = getExercicio(l.exercicioId)?.nome ?? 'Exercício'
      const cur =
        porEx.get(l.exercicioId) ??
        ({ id: l.exercicioId, nome, bestKg: 0, bestReps: 0, serie: [], _porSessao: new Map() } as Recorde & {
          _porSessao: Map<string, number>
        })
      if (kg > cur.bestKg) {
        cur.bestKg = kg
        cur.bestReps = Number.isFinite(reps) ? reps : 0
      }
      const atual = cur._porSessao.get(s.id) ?? 0
      cur._porSessao.set(s.id, Math.max(atual, kg))
      porEx.set(l.exercicioId, cur)
    })
  })

  return [...porEx.values()]
    .map((r) => ({ id: r.id, nome: r.nome, bestKg: r.bestKg, bestReps: r.bestReps, serie: [...r._porSessao.values()] }))
    .sort((a, b) => b.serie.length - a.serie.length)
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
  const recordes = agregar(sessions)

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

            <Text style={styles.section}>Recordes</Text>
            {recordes.map((r) => (
              <View key={r.id} style={styles.recRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.recNome} numberOfLines={1}>
                    {r.nome}
                  </Text>
                  <Text style={styles.recBest}>
                    Recorde <Text style={styles.recBestVal}>{r.bestKg.toString().replace('.', ',')} kg</Text>
                    {r.bestReps ? ` × ${r.bestReps}` : ''}
                  </Text>
                </View>
                <Sparkline valores={r.serie} />
              </View>
            ))}

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

function Sparkline({ valores }: { valores: number[] }) {
  const dados = valores.slice(-10)
  const max = Math.max(...dados, 1)
  return (
    <View style={styles.spark}>
      {dados.map((v, i) => (
        <View
          key={i}
          style={[
            styles.bar,
            { height: Math.max(3, (v / max) * 28) },
            i === dados.length - 1 && { backgroundColor: colors.accent },
          ]}
        />
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: 18, paddingTop: 8 },
  h1: { color: colors.text, fontFamily: font.displayX, fontSize: 30, marginBottom: 16 },
  empty: { alignItems: 'center', gap: 12, paddingVertical: 60, paddingHorizontal: 24 },
  emptyTxt: { color: colors.muted, fontFamily: font.medium, fontSize: 14, textAlign: 'center', lineHeight: 20 },

  resumo: { flexDirection: 'row', alignItems: 'center', paddingVertical: 16, marginBottom: 8 },
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

  section: {
    color: colors.muted,
    fontFamily: font.semibold,
    fontSize: 11,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginTop: 20,
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
  recNome: { color: colors.text, fontFamily: font.bold, fontSize: 15 },
  recBest: { color: colors.muted, fontFamily: font.regular, fontSize: 12.5, marginTop: 2 },
  recBestVal: { color: colors.accent, fontFamily: font.bold },

  spark: { flexDirection: 'row', alignItems: 'flex-end', gap: 2, height: 28 },
  bar: { width: 5, borderRadius: 2, backgroundColor: colors.surface3 },

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
