import { useEffect, useMemo, useRef, useState } from 'react'
import {
  Alert,
  Animated,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native'
import { BlurView } from 'expo-blur'
import { Swipeable } from 'react-native-gesture-handler'
import * as Haptics from 'expo-haptics'
import { Screen } from '../components/Screen'
import { Button } from '../components/Button'
import { Badge } from '../components/Badge'
import { Icon } from '../components/Icon'
import { PseSheet, type PseContext } from '../components/PseSheet'
import { RestTimer, REST_TIMER_HEIGHT } from '../components/RestTimer'
import { colors, font, radius } from '../theme/theme'
import { fmtClock, fmtNum, fmtRest, parseKg, uid } from '../lib/format'
import { usePrograma } from '../programa/ProgramaProvider'
import { loadActiveWorkout, saveActiveWorkout, clearActiveWorkout } from '../storage/activeWorkout'
import type { ScreenProps } from '../navigation/types'
import type { SerieLog, Sessao, SetTipo } from '../data/types'
import { useDuration } from '../lib/useDuration'
import { startWorkoutActivity, updateWorkoutActivity, endWorkoutActivity } from '../liveactivity'

const HEADER_H = 52

interface SerieRT {
  id: string
  label: string
  tipo: SetTipo
  anterior: string | null
  kgAlvo: string
  repsAlvo: string
  pseAlvo: number | null
  tempoAlvoSeg?: number // isométrico (prancha): alvo em segundos, no lugar de reps
  kg: string
  reps: string
  pse: number | null
  done: boolean
}
interface ExercicioRT {
  id: string
  nome: string
  grupo: string
  restSec: number
  pseAlvoLabel: string
  series: SerieRT[]
}

const fmtVolume = (n: number) => Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')

function relabel(series: SerieRT[]): SerieRT[] {
  let n = 0
  return series.map((s) => (s.tipo === 'valida' ? { ...s, label: String(++n) } : s))
}

// input soft (#16): prescrito é placeholder; série sem carga herda a última carga efetiva
function withPlaceholders(ex: ExercicioRT) {
  let lastKg = ''
  let lastReps = ''
  return ex.series.map((s) => {
    const phKg = s.kgAlvo !== '' ? s.kgAlvo : lastKg
    const phReps =
      s.repsAlvo !== '' ? s.repsAlvo : s.tempoAlvoSeg != null ? `${s.tempoAlvoSeg}s` : lastReps
    const effKg = s.kg !== '' ? s.kg : phKg
    const effReps = s.reps !== '' ? s.reps : phReps
    lastKg = effKg
    lastReps = effReps
    return { s, phKg, phReps, effKg, effReps }
  })
}

export function TreinoScreen({ route, navigation }: ScreenProps<'Treino'>) {
  const { getTreino } = usePrograma()
  const treino = useMemo(() => getTreino(route.params.treinoId), [getTreino, route.params.treinoId])

  const [exs, setExs] = useState<ExercicioRT[]>(() =>
    (treino?.exercicios ?? []).map((e) => ({
      id: e.id,
      nome: e.nome,
      grupo: e.grupo,
      restSec: e.restSec,
      pseAlvoLabel: e.pseAlvoLabel,
      series: e.series.map((s) => ({
        id: uid('s'),
        label: s.label,
        tipo: s.tipo,
        anterior: s.anterior,
        kgAlvo: s.kgAlvo,
        repsAlvo: s.repsAlvo,
        pseAlvo: s.pseAlvo,
        tempoAlvoSeg: s.tempoAlvoSeg,
        kg: '',
        reps: '',
        pse: null,
        done: false,
      })),
    }))
  )

  const [startedAt, setStartedAt] = useState(() => Date.now())
  const [pronto, setPronto] = useState(false)
  const elapsed = useDuration(startedAt)
  const rotinaId = treino?.id ?? route.params.treinoId

  // ao abrir: se há treino em andamento DESTA rotina, continua de onde parou
  useEffect(() => {
    let alive = true
    loadActiveWorkout().then((aw) => {
      if (!alive) return
      if (aw && aw.rotinaId === rotinaId && Array.isArray(aw.exs) && (aw.exs as unknown[]).length > 0) {
        setExs(aw.exs as ExercicioRT[])
        setStartedAt(aw.iniciadaEm)
      }
      setPronto(true)
    })
    return () => {
      alive = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // persiste o progresso a cada mudança (offline-first) — vira a barra "em andamento" da Home
  useEffect(() => {
    if (!pronto) return
    void saveActiveWorkout({ rotinaId, rotinaTitulo: treino?.titulo ?? 'Treino', iniciadaEm: startedAt, exs })
  }, [exs, pronto, startedAt, rotinaId, treino])

  const scrollY = useRef(new Animated.Value(0)).current
  const titleOpacity = scrollY.interpolate({ inputRange: [0, 40, 72], outputRange: [1, 1, 0], extrapolate: 'clamp' })
  const durOpacity = scrollY.interpolate({ inputRange: [40, 72], outputRange: [0, 1], extrapolate: 'clamp' })

  const [sheet, setSheet] = useState<{ open: boolean; ex: number; set: number; ctx: PseContext | null }>({
    open: false,
    ex: 0,
    set: 0,
    ctx: null,
  })
  const [rest, setRest] = useState<{ open: boolean; seconds: number; nonce: number }>({
    open: false,
    seconds: 90,
    nonce: 0,
  })

  const startRest = (seconds: number) => setRest((r) => ({ open: true, seconds, nonce: r.nonce + 1 }))

  const mutate = (exIdx: number, setIdx: number, patch: Partial<SerieRT>) =>
    setExs((prev) =>
      prev.map((ex, i) =>
        i !== exIdx ? ex : { ...ex, series: ex.series.map((s, j) => (j !== setIdx ? s : { ...s, ...patch })) }
      )
    )

  const toggleDone = (exIdx: number, setIdx: number) => {
    const novo = !exs[exIdx].series[setIdx].done
    mutate(exIdx, setIdx, { done: novo })
    if (novo) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {})
      startRest(exs[exIdx].restSec)
    }
  }

  const openPse = (exIdx: number, setIdx: number, effKg: string, effReps: string) => {
    const s = exs[exIdx].series[setIdx]
    setSheet({
      open: true,
      ex: exIdx,
      set: setIdx,
      ctx: { setLabel: s.label, kg: effKg, reps: effReps, alvo: s.pseAlvo, valorAtual: s.pse },
    })
  }

  const confirmPse = (valor: number) => {
    mutate(sheet.ex, sheet.set, { pse: valor, done: true })
    setSheet((s) => ({ ...s, open: false }))
    startRest(exs[sheet.ex].restSec)
  }

  const addSerie = (exIdx: number) =>
    setExs((prev) =>
      prev.map((ex, i) => {
        if (i !== exIdx) return ex
        const last = ex.series[ex.series.length - 1]
        const nova: SerieRT = {
          id: uid('s'),
          label: '',
          tipo: 'valida',
          anterior: null,
          kgAlvo: '',
          repsAlvo: last ? last.repsAlvo : '',
          pseAlvo: last ? last.pseAlvo : 8,
          kg: '',
          reps: '',
          pse: null,
          done: false,
        }
        return { ...ex, series: relabel([...ex.series, nova]) }
      })
    )

  const removeSerie = (exIdx: number, setIdx: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {})
    setExs((prev) =>
      prev.map((ex, i) =>
        i !== exIdx ? ex : { ...ex, series: relabel(ex.series.filter((_, j) => j !== setIdx)) }
      )
    )
  }

  const { feitas, total, volume } = useMemo(() => {
    let feitas = 0
    let total = 0
    let volume = 0
    exs.forEach((ex) => {
      withPlaceholders(ex).forEach(({ s, effKg, effReps }) => {
        total++
        if (s.done) {
          feitas++
          const kg = parseKg(effKg)
          const reps = parseInt(effReps, 10)
          if (!isNaN(kg) && !isNaN(reps)) volume += kg * reps
        }
      })
    })
    return { feitas, total, volume }
  }, [exs])

  const exercicioAtual = useMemo(() => {
    for (const ex of exs) if (ex.series.some((s) => !s.done)) return ex.nome
    return exs[exs.length - 1]?.nome ?? treino?.titulo ?? 'Treino'
  }, [exs])

  // Live Activity (iOS): inicia no começo, atualiza por evento (série/status), encerra ao sair
  useEffect(() => {
    const total0 = exs.reduce((a, e) => a + e.series.length, 0)
    startWorkoutActivity({ exercicio: exs[0]?.nome ?? 'Treino', serie: 0, totalSeries: total0, status: 'Em treino' })
    return () => endWorkoutActivity({ exercicio: '', serie: 0, totalSeries: 0, status: 'Concluído' })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    updateWorkoutActivity({
      exercicio: exercicioAtual,
      serie: feitas,
      totalSeries: total,
      status: rest.open ? 'Descanso' : 'Em treino',
    })
  }, [feitas, total, rest.open, exercicioAtual])

  const concluir = () => {
    const logs: SerieLog[] = []
    exs.forEach((ex) => {
      withPlaceholders(ex).forEach(({ s, effKg, effReps }) => {
        if (s.done) {
          // exercicioId (#54): permite agregar a sessão por exercício e por padrão postural
          logs.push({
            serieId: s.id,
            label: s.label,
            tipo: s.tipo,
            exercicioId: ex.id,
            kg: effKg,
            reps: effReps,
            pse: s.pse,
          })
        }
      })
    })
    const sessao: Sessao = {
      id: uid('sess'),
      usuarioId: null, // vira o auth.uid() quando houver conta (#47)
      rotinaId: treino?.id ?? route.params.treinoId,
      rotinaTitulo: treino?.titulo ?? 'Treino',
      tipo: 'treino', // 'micro' quando a micro-sessão existir (#63)
      iniciadaEm: startedAt,
      concluidaEm: Date.now(),
      duracaoSeg: Math.round((Date.now() - startedAt) / 1000),
      volumeTotal: Math.round(volume),
      seriesFeitas: feitas,
      sensacao: null,
      logs,
    }
    endWorkoutActivity({ exercicio: exercicioAtual, serie: feitas, totalSeries: total, status: 'Concluído' })
    void clearActiveWorkout() // sessão concluída sai de "em andamento"
    navigation.navigate('Fim', { sessao })
  }

  // parar = descartar o treino em andamento sem registrar (ex.: entrou sem querer)
  const parar = () =>
    Alert.alert('Parar treino', 'O que você registrou será descartado.', [
      { text: 'Continuar treinando', style: 'cancel' },
      {
        text: 'Parar',
        style: 'destructive',
        onPress: () => {
          void clearActiveWorkout()
          endWorkoutActivity({ exercicio: '', serie: 0, totalSeries: 0, status: 'Concluído' })
          navigation.goBack()
        },
      },
    ])

  if (!treino) {
    return (
      <Screen>
        <View style={styles.empty}>
          <Text style={styles.emptyTxt}>Esse treino ainda não foi montado no seed.</Text>
          <Button label="Voltar" variant="secondary" onPress={() => navigation.goBack()} />
        </View>
      </Screen>
    )
  }

  // enquanto decide se resume ou começa do zero, evita flash + salvar fresh por cima
  if (!pronto) return <Screen><View style={styles.empty} /></Screen>

  return (
    <Screen>
      <Animated.ScrollView
        contentContainerStyle={[
          { paddingTop: HEADER_H, paddingBottom: rest.open ? REST_TIMER_HEIGHT + 24 : 40 },
        ]}
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], { useNativeDriver: true })}
      >
        {/* banda de stats (rola pra cima; a duração migra pro header) */}
        <View style={styles.statsBand}>
          <Stat value={fmtClock(elapsed)} label="Duração" accent />
          <Stat value={`${fmtVolume(volume)} kg`} label="Volume" />
          <Stat value={`${feitas}/${total}`} label="Séries" />
        </View>

        {exs.map((ex, ei) => (
          <ExercicioBloco
            key={ex.id}
            ex={ex}
            onKg={(si, v) => mutate(ei, si, { kg: v })}
            onReps={(si, v) => mutate(ei, si, { reps: v })}
            onPse={(si, effKg, effReps) => openPse(ei, si, effKg, effReps)}
            onCheck={(si) => toggleDone(ei, si)}
            onRemove={(si) => removeSerie(ei, si)}
            onAdd={() => addSerie(ei)}
          />
        ))}
      </Animated.ScrollView>

      {/* header de vidro (sticky) */}
      <View style={styles.header}>
        <BlurView intensity={40} tint="dark" style={StyleSheet.absoluteFill} />
        <View style={styles.headerRow}>
          <Pressable style={styles.iconBtn} onPress={() => navigation.goBack()} hitSlop={8}>
            <Icon name="chevron-down" size={15} color={colors.text} />
          </Pressable>

          <View style={styles.headerCenter}>
            <Animated.Text numberOfLines={1} style={[styles.headerTitle, { opacity: titleOpacity }]}>
              {treino.titulo}
            </Animated.Text>
            <Animated.Text style={[styles.headerDur, { opacity: durOpacity }]}>{fmtClock(elapsed)}</Animated.Text>
          </View>

          <View style={styles.headerRight}>
            <Pressable style={styles.iconBtn} onPress={parar} hitSlop={8}>
              <Icon name="circle-stop" size={17} color={colors.muted} />
            </Pressable>
            <Button label="Concluir" size="sm" onPress={concluir} />
          </View>
        </View>
      </View>

      <PseSheet
        open={sheet.open}
        context={sheet.ctx}
        onConfirm={confirmPse}
        onClose={() => setSheet((s) => ({ ...s, open: false }))}
      />
      <RestTimer
        open={rest.open}
        seconds={rest.seconds}
        nonce={rest.nonce}
        onClose={() => setRest((r) => ({ ...r, open: false }))}
      />
    </Screen>
  )
}

function Stat({ value, label, accent }: { value: string; label: string; accent?: boolean }) {
  return (
    <View style={styles.stat}>
      <Text style={[styles.statValue, accent && { color: colors.accent }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  )
}

function ExercicioBloco({
  ex,
  onKg,
  onReps,
  onPse,
  onCheck,
  onRemove,
  onAdd,
}: {
  ex: ExercicioRT
  onKg: (si: number, v: string) => void
  onReps: (si: number, v: string) => void
  onPse: (si: number, effKg: string, effReps: string) => void
  onCheck: (si: number) => void
  onRemove: (si: number) => void
  onAdd: () => void
}) {
  const rows = withPlaceholders(ex)

  // nudge de carga (#22): 2+ séries feitas abaixo das reps alvo
  const abaixo = rows.filter(({ s, effReps }) => {
    if (!s.done || s.repsAlvo === '') return false
    const r = parseInt(effReps, 10)
    const alvo = parseInt(s.repsAlvo, 10)
    return !isNaN(r) && !isNaN(alvo) && r < alvo
  }).length

  return (
    <View style={styles.bloco}>
      <View style={styles.blocoPad}>
      <View style={styles.blocoHead}>
        <View style={styles.exIcon}>
          <Icon name="dumbbell" size={17} color={colors.accent} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.exNome}>{ex.nome}</Text>
          <Text style={styles.exGrupo}>{ex.grupo}</Text>
        </View>
      </View>

      <View style={styles.badges}>
        <Badge icon="stopwatch">
          Descanso <Text style={styles.badgeStrong}>{fmtRest(ex.restSec)}</Text>
        </Badge>
        <Badge icon="bullseye">
          PSE alvo <Text style={{ color: colors.text, fontFamily: font.bold }}>{ex.pseAlvoLabel}</Text>
        </Badge>
      </View>

      <View style={styles.thead}>
        <Text style={[styles.th, styles.colSerie]}>Série</Text>
        <Text style={[styles.th, styles.colAnt]}>Anterior</Text>
        <Text style={[styles.th, styles.colInput]}>Kg</Text>
        <Text style={[styles.th, styles.colInput]}>Reps</Text>
        <Text style={[styles.th, styles.colPse]}>PSE</Text>
        <Text style={[styles.th, styles.colCheck]}> </Text>
      </View>
      </View>

      {rows.map(({ s, phKg, phReps, effKg, effReps }, si) => (
        <SerieRow
          key={s.id}
          serie={s}
          phKg={phKg}
          phReps={phReps}
          effKg={effKg}
          effReps={effReps}
          onKg={(v) => onKg(si, v)}
          onReps={(v) => onReps(si, v)}
          onPse={() => onPse(si, effKg, effReps)}
          onCheck={() => onCheck(si)}
          onRemove={() => onRemove(si)}
        />
      ))}

      <View style={styles.blocoPad}>
        {abaixo >= 2 ? (
          <View style={styles.nudge}>
            <Icon name="circle-info" size={12} color={colors.warn} />
            <Text style={styles.nudgeTxt}>
              Você ficou abaixo das reps em {abaixo} séries. Sem pressa — pode ser hora de aliviar a carga.
            </Text>
          </View>
        ) : null}

        <Pressable style={styles.addBtn} onPress={onAdd}>
          <Icon name="plus" size={12} color={colors.text} />
          <Text style={styles.addTxt}>Adicionar série</Text>
        </Pressable>
      </View>
    </View>
  )
}

function SerieRow({
  serie,
  phKg,
  phReps,
  effKg,
  effReps,
  onKg,
  onReps,
  onPse,
  onCheck,
  onRemove,
}: {
  serie: SerieRT
  phKg: string
  phReps: string
  effKg: string
  effReps: string
  onKg: (v: string) => void
  onReps: (v: string) => void
  onPse: () => void
  onCheck: () => void
  onRemove: () => void
}) {
  const done = serie.done
  const aquecimento = serie.tipo === 'aquecimento'

  let chipStyle: StyleProp<ViewStyle> = styles.chipIdle
  let chipTxt: string = colors.muted
  let arrow: 'arrow-up' | 'arrow-down' | null = null
  if (serie.pse != null && serie.pseAlvo != null) {
    if (serie.pse > serie.pseAlvo) {
      chipStyle = styles.chipHigh
      chipTxt = colors.danger
      arrow = 'arrow-up'
    } else if (serie.pse < serie.pseAlvo) {
      chipStyle = styles.chipLow
      chipTxt = colors.warn
      arrow = 'arrow-down'
    } else {
      chipStyle = styles.chipOk
      chipTxt = colors.accent
    }
  } else if (serie.pse != null) {
    chipStyle = styles.chipOk
    chipTxt = colors.accent
  }

  const renderRightActions = () => (
    <Pressable style={styles.swipeDelete} onPress={onRemove}>
      <Icon name="trash" size={16} color="#fff" />
    </Pressable>
  )

  return (
    <Swipeable renderRightActions={renderRightActions} overshootRight={false} friction={2}>
      <View style={[styles.tr, done && styles.trDone]}>
        <View style={styles.colSerie}>
          <View style={[styles.serieBadge, aquecimento && styles.serieBadgeWarm]}>
            <Text style={[styles.serieLabel, aquecimento && { color: colors.warn }]}>{serie.label}</Text>
          </View>
        </View>
        <View style={styles.colAnt}>
          <Text style={styles.antTxt}>{serie.anterior ?? '—'}</Text>
        </View>

        <View style={styles.colInput}>
          {done ? (
            <Text style={styles.effTxt}>{effKg || '—'}</Text>
          ) : (
            <TextInput
              style={styles.input}
              value={serie.kg}
              placeholder={phKg || '—'}
              placeholderTextColor={colors.faint}
              onChangeText={onKg}
              keyboardType="decimal-pad"
              selectTextOnFocus
            />
          )}
        </View>

        <View style={styles.colInput}>
          {done ? (
            <Text style={styles.effTxt}>{effReps || '—'}</Text>
          ) : (
            <TextInput
              style={styles.input}
              value={serie.reps}
              placeholder={phReps || '—'}
              placeholderTextColor={colors.faint}
              onChangeText={onReps}
              keyboardType="number-pad"
              selectTextOnFocus
            />
          )}
        </View>

        <View style={styles.colPse}>
          <Pressable onPress={onPse} style={[styles.chip, chipStyle]}>
            <View style={styles.chipTop}>
              <Text style={[styles.chipNum, { color: chipTxt }]}>{serie.pse == null ? 'PSE' : fmtNum(serie.pse)}</Text>
              {arrow ? <Icon name={arrow} size={9} color={chipTxt} /> : null}
            </View>
            {serie.pseAlvo != null ? <Text style={styles.chipAlvo}>alvo {fmtNum(serie.pseAlvo)}</Text> : null}
          </Pressable>
        </View>

        <View style={styles.colCheck}>
          <Pressable onPress={onCheck} style={[styles.check, done && styles.checkDone]}>
            <Icon name="check" size={13} color={done ? colors.bg0 : 'transparent'} />
          </Pressable>
        </View>
      </View>
    </Swipeable>
  )
}

const styles = StyleSheet.create({
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16, padding: 24 },
  emptyTxt: { color: colors.muted, fontFamily: font.medium, fontSize: 15, textAlign: 'center' },

  header: { position: 'absolute', top: 0, left: 0, right: 0, height: HEADER_H, overflow: 'hidden' },
  headerRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.borderSoft,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.5,
    shadowRadius: 3,
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: { flex: 1, marginHorizontal: 10, height: HEADER_H, justifyContent: 'center' },
  headerTitle: { position: 'absolute', alignSelf: 'center', color: colors.text, fontFamily: font.bold, fontSize: 16 },
  headerDur: { position: 'absolute', alignSelf: 'center', color: colors.accent, fontFamily: font.displayX, fontSize: 22 },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 12 },

  statsBand: {
    flexDirection: 'row',
    paddingHorizontal: 18,
    paddingVertical: 16,
    gap: 6,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  stat: { flex: 1 },
  statValue: { color: colors.text, fontFamily: font.displayX, fontSize: 24 },
  statLabel: {
    color: colors.muted,
    fontFamily: font.semibold,
    fontSize: 10,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginTop: 3,
  },

  bloco: { paddingTop: 20, paddingBottom: 8 },
  blocoPad: { paddingHorizontal: 18 },
  blocoHead: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  exIcon: {
    width: 44,
    height: 44,
    borderRadius: radius.pill,
    backgroundColor: colors.bg2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  exNome: { color: colors.accent, fontFamily: font.bold, fontSize: 16 },
  exGrupo: { color: colors.muted, fontFamily: font.regular, fontSize: 12.5, marginTop: 1 },
  badges: { flexDirection: 'row', flexWrap: 'wrap', gap: 7, marginTop: 12, marginBottom: 8 },
  badgeStrong: { color: colors.accent, fontFamily: font.bold },

  thead: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, gap: 4 },
  th: {
    color: colors.muted,
    fontFamily: font.semibold,
    fontSize: 9.5,
    letterSpacing: 0.3,
    textTransform: 'uppercase',
    textAlign: 'center',
  },
  colSerie: { width: 40, alignItems: 'flex-start', justifyContent: 'center' },
  colAnt: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  colInput: { width: 58, alignItems: 'center', justifyContent: 'center' },
  colPse: { width: 58, alignItems: 'center', justifyContent: 'center' },
  colCheck: { width: 42, alignItems: 'center', justifyContent: 'center' },

  tr: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 9,
    paddingHorizontal: 18,
    gap: 4,
    backgroundColor: colors.bg0,
  },
  trDone: { backgroundColor: colors.doneRow },
  serieBadge: {
    width: 30,
    height: 30,
    borderRadius: radius.sm,
    backgroundColor: colors.bg2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  serieBadgeWarm: { backgroundColor: colors.warnSoft },
  serieLabel: { color: colors.text, fontFamily: font.extrabold, fontSize: 14 },
  antTxt: { color: colors.muted, fontFamily: font.regular, fontSize: 12.5, textAlign: 'center' },
  input: {
    width: 54,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.bg2,
    borderRadius: radius.sm,
    paddingVertical: 8,
    textAlign: 'center',
    color: colors.text,
    fontFamily: font.semibold,
    fontSize: 15,
  },
  effTxt: { color: colors.text, fontFamily: font.bold, fontSize: 15 },

  chip: {
    minWidth: 52,
    borderWidth: 1,
    borderRadius: radius.sm,
    paddingHorizontal: 6,
    paddingVertical: 5,
    alignItems: 'center',
  },
  chipTop: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  chipNum: { fontFamily: font.extrabold, fontSize: 14 },
  chipAlvo: { color: colors.muted, fontFamily: font.semibold, fontSize: 8.5, marginTop: 1 },
  chipIdle: { borderColor: colors.border, backgroundColor: colors.bg2 },
  chipOk: { borderColor: colors.accent, backgroundColor: colors.accentSoft },
  chipHigh: { borderColor: colors.danger, backgroundColor: colors.dangerSoft },
  chipLow: { borderColor: colors.warn, backgroundColor: colors.warnSoft },

  check: {
    width: 30,
    height: 30,
    borderRadius: radius.sm,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.bg2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkDone: { backgroundColor: colors.accent, borderColor: colors.accent },

  swipeDelete: {
    width: 72,
    backgroundColor: colors.danger,
    alignItems: 'center',
    justifyContent: 'center',
  },

  nudge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.warnSoft,
    borderColor: 'rgba(245,200,80,0.3)',
    borderWidth: 1,
    borderRadius: radius.md,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginTop: 12,
  },
  nudgeTxt: { flex: 1, color: colors.warn, fontFamily: font.medium, fontSize: 12, lineHeight: 17 },

  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.bg1,
    borderRadius: radius.md,
    paddingVertical: 13,
    marginTop: 12,
  },
  addTxt: { color: colors.text, fontFamily: font.semibold, fontSize: 13 },
})
