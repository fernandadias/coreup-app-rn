import { useEffect, useState } from 'react'
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { colors, font, radius } from '../theme/theme'
import { fmtNum } from '../lib/format'
import { Button } from './Button'

export interface PseContext {
  setLabel: string
  kg: string
  reps: string
  alvo: number | null
  valorAtual: number | null
}

// escala RPE do Hevy
export const RPE_SCALE = [6, 7, 7.5, 8, 8.5, 9, 9.5, 10]

const MEANING: Record<string, string> = {
  '6': '4+ reps na reserva',
  '7': '3 reps na reserva',
  '7.5': '2 a 3 na reserva',
  '8': '2 reps na reserva',
  '8.5': '1 a 2 na reserva',
  '9': '1 rep na reserva',
  '9.5': '0 a 1 na reserva',
  '10': 'Falha — 0 na reserva',
}

export function PseSheet({
  open,
  context,
  onConfirm,
  onClose,
}: {
  open: boolean
  context: PseContext | null
  onConfirm: (valor: number) => void
  onClose: () => void
}) {
  const [sel, setSel] = useState<number>(8)

  useEffect(() => {
    if (open) setSel(context?.valorAtual ?? context?.alvo ?? 8)
  }, [open, context])

  return (
    <Modal visible={open} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} />
      <View style={styles.sheet}>
        <View style={styles.handle} />
        <Text style={styles.title}>Registrar PSE do set</Text>
        {context ? (
          <Text style={styles.sub}>
            Série {context.setLabel}: {context.kg || '—'} kg × {context.reps || '—'} reps
          </Text>
        ) : null}

        <Text style={styles.bigNum}>{fmtNum(sel)}</Text>
        <Text style={styles.meaning}>{MEANING[String(sel)] ?? 'Selecionar RPE'}</Text>
        {context?.alvo != null ? (
          <Text style={styles.alvoLine}>
            Alvo prescrito <Text style={styles.alvoVal}>{fmtNum(context.alvo)}</Text>
          </Text>
        ) : (
          <View style={{ height: 16 }} />
        )}

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.track}
        >
          {RPE_SCALE.map((v) => {
            const active = sel === v
            const isAlvo = context?.alvo === v
            return (
              <Pressable key={v} onPress={() => setSel(v)} style={styles.cellWrap}>
                {isAlvo && !active ? <Text style={styles.alvoTag}>alvo</Text> : null}
                <View style={[styles.cell, isAlvo && styles.cellAlvo, active && styles.cellActive]}>
                  <Text style={[styles.cellNum, active && styles.cellNumActive]}>{fmtNum(v)}</Text>
                </View>
              </Pressable>
            )
          })}
        </ScrollView>

        <Button label="Feito" onPress={() => onConfirm(sel)} style={styles.confirm} />
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)' },
  sheet: {
    backgroundColor: colors.bg1,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderTopWidth: 1,
    borderColor: colors.borderSoft,
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 30,
  },
  handle: { alignSelf: 'center', width: 40, height: 4, borderRadius: 2, backgroundColor: colors.surface3, marginBottom: 14 },
  title: { color: colors.text, fontFamily: font.bold, fontSize: 17, textAlign: 'center' },
  sub: { color: colors.muted, fontFamily: font.regular, fontSize: 13, textAlign: 'center', marginTop: 4 },
  bigNum: { color: colors.accent, fontFamily: font.displayX, fontSize: 76, textAlign: 'center', marginTop: 8, lineHeight: 80 },
  meaning: { color: colors.text, fontFamily: font.semibold, fontSize: 14, textAlign: 'center', marginTop: 2 },
  alvoLine: { color: colors.muted, fontFamily: font.regular, fontSize: 12.5, textAlign: 'center', marginTop: 6, marginBottom: 4 },
  alvoVal: { color: colors.text, fontFamily: font.bold },
  track: { gap: 8, paddingVertical: 18, paddingHorizontal: 2 },
  cellWrap: { alignItems: 'center' },
  alvoTag: {
    position: 'absolute',
    top: -12,
    color: colors.muted,
    fontFamily: font.semibold,
    fontSize: 8.5,
    zIndex: 2,
  },
  cell: {
    minWidth: 56,
    paddingHorizontal: 8,
    paddingVertical: 13,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.bg2,
  },
  cellAlvo: { borderColor: colors.accent, borderStyle: 'dashed' },
  cellActive: { backgroundColor: colors.accent, borderColor: colors.accent, borderStyle: 'solid' },
  cellNum: { color: colors.text, fontFamily: font.bold, fontSize: 16 },
  cellNumActive: { color: colors.bg0 },
  confirm: { marginTop: 6, paddingVertical: 15 },
})
