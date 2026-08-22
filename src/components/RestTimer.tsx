import { useEffect, useRef, useState } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import * as Haptics from 'expo-haptics'
import { colors, font } from '../theme/theme'
import { fmtClock } from '../lib/format'
import { Icon } from './Icon'
import { Button } from './Button'

// altura aproximada do overlay — usada pra dar padding na lista (issue #24)
export const REST_TIMER_HEIGHT = 150

// Overlay ancorado no rodapé. A contagem roda com a tela ativa.
// TODO(#18): notificação local (expo-notifications) pra alertar com o app em background/bloqueado.
export function RestTimer({
  open,
  seconds,
  nonce,
  onClose,
}: {
  open: boolean
  seconds: number
  nonce: number
  onClose: () => void
}) {
  const [remaining, setRemaining] = useState(seconds)
  const [total, setTotal] = useState(seconds)
  const [done, setDone] = useState(false)
  const endAtRef = useRef<number>(0)
  const totalRef = useRef<number>(seconds)
  const firedRef = useRef(false)

  useEffect(() => {
    if (!open) return
    endAtRef.current = Date.now() + seconds * 1000
    totalRef.current = seconds
    firedRef.current = false
    setDone(false)
    setTotal(seconds)
    setRemaining(seconds)

    const tick = () => {
      const rem = Math.ceil((endAtRef.current - Date.now()) / 1000)
      if (rem <= 0) {
        setRemaining(0)
        if (!firedRef.current) {
          firedRef.current = true
          setDone(true)
          fireAlert()
          setTimeout(onClose, 1300)
        }
      } else {
        setRemaining(rem)
      }
    }
    const id = setInterval(tick, 250)
    return () => clearInterval(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, nonce])

  const adjust = (delta: number) => {
    endAtRef.current += delta * 1000
    totalRef.current = Math.max(1, totalRef.current + delta)
    setTotal(totalRef.current)
    setRemaining(Math.max(0, Math.ceil((endAtRef.current - Date.now()) / 1000)))
  }

  if (!open) return null

  const pct = done ? 0 : Math.max(0, Math.min(1, remaining / total))

  return (
    <View style={styles.wrap} pointerEvents="box-none">
      <View style={styles.sheet}>
        <View style={styles.track}>
          <View style={[styles.fill, { width: `${pct * 100}%` }]} />
        </View>

        {done ? (
          <View style={styles.doneRow}>
            <Icon name="check" size={30} color={colors.accent} />
            <Text style={styles.clock}>Bora!</Text>
          </View>
        ) : (
          <Text style={styles.clock}>{fmtClock(remaining)}</Text>
        )}

        <View style={styles.actions}>
          <Button label="−15" variant="secondary" style={styles.btn} onPress={() => adjust(-15)} />
          <Button label="+15" variant="secondary" style={styles.btn} onPress={() => adjust(15)} />
          <Button style={styles.btn} onPress={onClose}>
            <Text style={styles.pular}>Pular</Text>
            <Icon name="forward" size={13} color={colors.bg0} />
          </Button>
        </View>
      </View>
    </View>
  )
}

async function fireAlert() {
  try {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy)
    setTimeout(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy).catch(() => {}), 180)
  } catch {
    /* háptico indisponível (web) */
  }
}

const styles = StyleSheet.create({
  wrap: { position: 'absolute', left: 0, right: 0, bottom: 0, zIndex: 65 },
  sheet: {
    backgroundColor: colors.bg1,
    // topo reto de propósito: a barra de progresso corre de ponta a ponta sem cortar nos cantos
    paddingHorizontal: 18,
    paddingTop: 0,
    paddingBottom: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.4,
    shadowRadius: 18,
    elevation: 14,
  },
  track: { height: 3, backgroundColor: colors.surface3, marginHorizontal: -18 },
  fill: { height: 3, backgroundColor: colors.accent },
  clock: { color: colors.text, fontFamily: font.displayX, fontSize: 52, textAlign: 'center', marginTop: 14, marginBottom: 14 },
  doneRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, marginTop: 14, marginBottom: 14 },
  actions: { flexDirection: 'row', gap: 10 },
  btn: { flex: 1 },
  pular: { color: colors.bg0, fontFamily: font.bold, fontSize: 15 },
})
