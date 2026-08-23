import { Modal, Pressable, StyleSheet, Text, View } from 'react-native'
import { colors, font, radius } from '../theme/theme'
import { Button } from './Button'
import { Icon } from './Icon'

// Parabeniza pela constância. Abre ao tocar no foguinho da Home.
export function StreakSheet({
  open,
  semanas,
  treinosNaSemana,
  onVerEvolucao,
  onClose,
}: {
  open: boolean
  semanas: number
  treinosNaSemana: number
  onVerEvolucao: () => void
  onClose: () => void
}) {
  const temSequencia = semanas > 0
  const titulo = temSequencia
    ? `${semanas} ${semanas === 1 ? 'semana' : 'semanas'} seguidas`
    : 'Bora começar a sequência'
  const msg = temSequencia
    ? 'Constância é o que move o ponteiro. Cada semana treinada é uma a mais na conta.'
    : 'Um treino esta semana já acende o foguinho. A sequência começa no próximo.'

  return (
    <Modal visible={open} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} />
      <View style={styles.sheet}>
        <View style={styles.handle} />
        <View style={styles.fireWrap}>
          <Icon name="fire" size={30} color={colors.accent} />
        </View>
        <Text style={styles.big}>{titulo}</Text>
        <Text style={styles.msg}>{msg}</Text>
        <Text style={styles.semana}>
          {treinosNaSemana} {treinosNaSemana === 1 ? 'treino' : 'treinos'} nesta semana
        </Text>
        <Button label="Ver evolução" variant="secondary" onPress={onVerEvolucao} style={styles.cta} />
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
    paddingHorizontal: 24,
    paddingTop: 10,
    paddingBottom: 30,
    alignItems: 'center',
  },
  handle: { width: 40, height: 4, borderRadius: 2, backgroundColor: colors.surface3, marginBottom: 18 },
  fireWrap: {
    width: 64,
    height: 64,
    borderRadius: radius.pill,
    backgroundColor: colors.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  big: { color: colors.text, fontFamily: font.displayX, fontSize: 28, textAlign: 'center' },
  msg: { color: colors.muted, fontFamily: font.regular, fontSize: 14, lineHeight: 20, textAlign: 'center', marginTop: 6 },
  semana: { color: colors.accent, fontFamily: font.bold, fontSize: 13, marginTop: 14 },
  cta: { marginTop: 20, alignSelf: 'stretch' },
})
