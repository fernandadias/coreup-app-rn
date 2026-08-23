import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { colors, font, radius } from '../theme/theme'
import { Button } from './Button'
import { Icon } from './Icon'
import type { TreinoData } from '../data/types'

// Resumo de um treino antes de iniciar (tocando num item do programa).
export function TreinoResumoSheet({
  treino,
  onIniciar,
  onClose,
}: {
  treino: TreinoData | null
  onIniciar: (id: string) => void
  onClose: () => void
}) {
  return (
    <Modal visible={treino !== null} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} />
      <View style={styles.sheet}>
        <View style={styles.handle} />
        {treino ? (
          <>
            <View style={styles.head}>
              <View style={styles.badge}>
                <Text style={styles.badgeTxt}>{treino.badge}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.titulo}>{treino.titulo}</Text>
                <Text style={styles.meta}>
                  {treino.exercicios.length} {treino.exercicios.length === 1 ? 'exercício' : 'exercícios'}
                </Text>
              </View>
            </View>

            <ScrollView style={styles.lista} contentContainerStyle={{ paddingVertical: 4 }}>
              {treino.exercicios.map((ex) => (
                <View key={ex.id} style={styles.exRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.exNome} numberOfLines={1}>
                      {ex.nome}
                    </Text>
                    <Text style={styles.exGrupo}>{ex.grupo}</Text>
                  </View>
                  <Text style={styles.exSeries}>{ex.series.length}×</Text>
                </View>
              ))}
            </ScrollView>

            <Button label="Iniciar treino" onPress={() => onIniciar(treino.id)} style={styles.cta}>
              <Icon name="play" size={13} color={colors.bg0} />
            </Button>
          </>
        ) : null}
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
    maxHeight: '80%',
  },
  handle: { alignSelf: 'center', width: 40, height: 4, borderRadius: 2, backgroundColor: colors.surface3, marginBottom: 16 },
  head: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 8 },
  badge: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    backgroundColor: colors.bg2,
    borderColor: colors.border,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeTxt: { color: colors.accent, fontFamily: font.displayX, fontSize: 22 },
  titulo: { color: colors.text, fontFamily: font.bold, fontSize: 18 },
  meta: { color: colors.muted, fontFamily: font.regular, fontSize: 13, marginTop: 1 },
  lista: { marginTop: 6 },
  exRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 11,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  exNome: { color: colors.text, fontFamily: font.semibold, fontSize: 14.5 },
  exGrupo: { color: colors.muted, fontFamily: font.regular, fontSize: 12, marginTop: 1 },
  exSeries: { color: colors.muted, fontFamily: font.bold, fontSize: 13 },
  cta: { marginTop: 16 },
})
