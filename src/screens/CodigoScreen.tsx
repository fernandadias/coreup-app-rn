import { useState } from 'react'
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from 'react-native'
import { Screen } from '../components/Screen'
import { Button } from '../components/Button'
import { Icon } from '../components/Icon'
import { colors, font, radius } from '../theme/theme'
import { useAuth } from '../auth/AuthProvider'
import { usePrograma } from '../programa/ProgramaProvider'

export function CodigoScreen() {
  const { signOut } = useAuth()
  const { resgatar } = usePrograma()
  const [codigo, setCodigo] = useState('')
  const [erro, setErro] = useState<string | null>(null)
  const [enviando, setEnviando] = useState(false)

  const entrar = async () => {
    setErro(null)
    setEnviando(true)
    const res = await resgatar(codigo)
    setEnviando(false)
    if (!res.ok) setErro(res.erro ?? 'Não deu certo. Tenta de novo.')
    // sucesso: o ProgramaProvider vira vinculado e o portão avança sozinho
  }

  return (
    <Screen edges={['top', 'bottom']}>
      <View style={styles.content}>
        <View style={styles.hero}>
          <View style={styles.icon}>
            <Icon name="key" size={22} color={colors.accent} />
          </View>
          <Text style={styles.h1}>Entrar na consultoria</Text>
          <Text style={styles.sub}>
            Cole o código que a sua coach te enviou. Ele liga o app ao seu programa de treino.
          </Text>
        </View>

        <TextInput
          style={styles.input}
          placeholder="Código da consultoria"
          placeholderTextColor={colors.faint}
          value={codigo}
          onChangeText={(t) => {
            setCodigo(t)
            if (erro) setErro(null)
          }}
          autoCapitalize="none"
          autoCorrect={false}
        />
        {erro ? <Text style={styles.erro}>{erro}</Text> : null}

        <View style={{ height: 16 }} />
        <Button label={enviando ? '' : 'Entrar'} onPress={entrar} disabled={enviando || !codigo.trim()}>
          {enviando ? <ActivityIndicator color={colors.bg0} /> : null}
        </Button>

        <View style={{ flex: 1 }} />
        <Pressable onPress={() => void signOut()} hitSlop={8} style={styles.sair}>
          <Text style={styles.sairTxt}>Sair da conta</Text>
        </Pressable>
      </View>
    </Screen>
  )
}

const styles = StyleSheet.create({
  content: { flex: 1, paddingHorizontal: 18, paddingTop: 40, paddingBottom: 16 },
  hero: { alignItems: 'center', marginBottom: 28 },
  icon: {
    width: 56,
    height: 56,
    borderRadius: radius.pill,
    backgroundColor: colors.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  h1: { color: colors.text, fontFamily: font.displayX, fontSize: 28, textAlign: 'center' },
  sub: {
    color: colors.muted,
    fontFamily: font.regular,
    fontSize: 14.5,
    lineHeight: 20,
    textAlign: 'center',
    marginTop: 8,
    paddingHorizontal: 12,
  },
  input: {
    backgroundColor: colors.bg1,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radius.lg,
    paddingHorizontal: 14,
    paddingVertical: 14,
    color: colors.text,
    fontFamily: font.medium,
    fontSize: 15,
  },
  erro: { color: colors.danger, fontFamily: font.medium, fontSize: 13, marginTop: 8, paddingHorizontal: 4 },
  sair: { alignSelf: 'center', paddingVertical: 10 },
  sairTxt: { color: colors.muted, fontFamily: font.semibold, fontSize: 14 },
})
