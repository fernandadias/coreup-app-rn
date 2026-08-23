import { useState } from 'react'
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native'
import { Screen } from '../components/Screen'
import { Button } from '../components/Button'
import { colors, font, radius } from '../theme/theme'
import { useAuth } from '../auth/AuthProvider'

type Mode = 'entrar' | 'criar'

export function LoginScreen() {
  const { signInEmail, signUpEmail } = useAuth()
  const [mode, setMode] = useState<Mode>('entrar')
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState<string | null>(null)
  const [info, setInfo] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const criar = mode === 'criar'

  const submit = async () => {
    setErro(null)
    setInfo(null)
    if (!email || !senha || (criar && !nome)) {
      setErro('Preenche os campos pra continuar.')
      return
    }
    setBusy(true)
    const res = criar ? await signUpEmail(email, senha, nome) : await signInEmail(email, senha)
    setBusy(false)
    if (res.error) setErro(res.error)
    else if (res.info) setInfo(res.info)
    // sucesso com sessão → o portão em App.tsx troca de tela sozinho
  }

  return (
    <Screen>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.content}>
          <View style={styles.header}>
            <View style={styles.wordmark}>
              <Text style={styles.wmCore}>CORE</Text>
              <View style={styles.wmUpBox}>
                <Text style={styles.wmUp}>UP</Text>
              </View>
            </View>
            <Text style={styles.tagline}>{criar ? 'Criar sua conta' : 'Entrar na sua conta'}</Text>
          </View>

          {criar ? (
            <TextInput
              style={styles.input}
              value={nome}
              onChangeText={setNome}
              placeholder="Seu nome"
              placeholderTextColor={colors.faint}
              autoCapitalize="words"
            />
          ) : null}

          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="E-mail"
            placeholderTextColor={colors.faint}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />
          <TextInput
            style={styles.input}
            value={senha}
            onChangeText={setSenha}
            placeholder="Senha"
            placeholderTextColor={colors.faint}
            secureTextEntry
            autoCapitalize="none"
          />

          {erro ? <Text style={styles.erro}>{erro}</Text> : null}
          {info ? <Text style={styles.info}>{info}</Text> : null}

          <Button
            label={busy ? '' : criar ? 'Criar conta' : 'Entrar'}
            onPress={submit}
            disabled={busy}
            style={styles.submit}
          >
            {busy ? <ActivityIndicator color={colors.bg0} /> : undefined}
          </Button>

          <Pressable onPress={() => { setMode(criar ? 'entrar' : 'criar'); setErro(null); setInfo(null) }} hitSlop={8}>
            <Text style={styles.toggle}>
              {criar ? 'Já tenho conta — entrar' : 'Não tem conta? Criar'}
            </Text>
          </Pressable>

          <Text style={styles.soon}>Login com Apple e Google chegam no próximo build.</Text>
        </View>
      </KeyboardAvoidingView>
    </Screen>
  )
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { flex: 1, justifyContent: 'center', paddingHorizontal: 24, gap: 12 },
  header: { alignItems: 'center', marginBottom: 20 },
  wordmark: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  wmCore: { color: colors.text, fontFamily: font.displaySemi, fontStyle: 'italic', fontSize: 40 },
  wmUpBox: { backgroundColor: colors.accent, borderRadius: 7, paddingHorizontal: 7, paddingVertical: 1 },
  wmUp: { color: colors.bg0, fontFamily: font.displayX, fontSize: 38 },
  tagline: { color: colors.muted, fontFamily: font.medium, fontSize: 15, marginTop: 10 },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.bg2,
    borderRadius: radius.md,
    paddingHorizontal: 14,
    paddingVertical: 14,
    color: colors.text,
    fontFamily: font.medium,
    fontSize: 15,
  },
  erro: { color: colors.danger, fontFamily: font.medium, fontSize: 13, textAlign: 'center' },
  info: { color: colors.accent, fontFamily: font.medium, fontSize: 13, textAlign: 'center' },
  submit: { marginTop: 6 },
  toggle: { color: colors.accent, fontFamily: font.semibold, fontSize: 14, textAlign: 'center', marginTop: 14 },
  soon: { color: colors.faint, fontFamily: font.regular, fontSize: 12, textAlign: 'center', marginTop: 24 },
})
