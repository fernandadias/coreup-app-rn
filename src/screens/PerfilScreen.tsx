import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { Screen } from '../components/Screen'
import { Card } from '../components/Card'
import { Icon } from '../components/Icon'
import { colors, font, radius } from '../theme/theme'
import { useAuth } from '../auth/AuthProvider'
import { usePerfil } from '../perfil/PerfilProvider'
import type { ScreenProps } from '../navigation/types'
import type { EstiloTreino, LocalTreino, Objetivo, OutraAtividade, RegiaoDor } from '../data/types'

const L_OBJETIVO: Record<Objetivo, string> = {
  hipertrofia: 'Ganhar músculo',
  emagrecimento: 'Perder gordura',
  forca: 'Ficar mais forte',
  saude: 'Saúde e postura',
  condicionamento: 'Fôlego e disposição',
}
const L_LOCAL: Record<LocalTreino, string> = {
  'academia-completa': 'Academia completa',
  'academia-predio': 'Academia do prédio',
  casa: 'Em casa',
}
const L_ESTILO: Record<EstiloTreino, string> = {
  maquinas: 'Máquinas',
  'peso-livre': 'Peso livre',
  funcional: 'Funcional',
  misto: 'Variado',
}
const L_ATIV: Record<OutraAtividade, string> = {
  corrida: 'Corrida',
  luta: 'Luta',
  crossfit: 'Crossfit',
  'yoga-pilates': 'Yoga / Pilates',
  ciclismo: 'Ciclismo',
  danca: 'Dança',
  nenhuma: 'Só musculação',
}
const L_DOR: Record<RegiaoDor, string> = {
  lombar: 'Lombar',
  joelho: 'Joelho',
  ombro: 'Ombro',
  punho: 'Punho',
  cervical: 'Pescoço',
  quadril: 'Quadril',
  tornozelo: 'Tornozelo',
}

const iniciais = (nome: string) =>
  nome
    .split(' ')
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? '')
    .join('')

export function PerfilScreen({ navigation }: ScreenProps<'Perfil'>) {
  const { session, signOut } = useAuth()
  const { nome, anamnese, resetAnamnese } = usePerfil()

  const sair = () =>
    Alert.alert('Sair da conta', 'Você vai precisar entrar de novo.', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Sair', style: 'destructive', onPress: () => void signOut() },
    ])

  // TODO(#48): exclusão de verdade é um RPC no Supabase (apaga linhas + auth.user).
  // Por ora confirma e desloga — deixar claro pro backend fechar.
  const excluir = () =>
    Alert.alert(
      'Excluir conta',
      'Isso vai apagar seus dados de treino. Essa ação não tem volta.',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Excluir', style: 'destructive', onPress: () => void signOut() },
      ]
    )

  const refazer = () =>
    Alert.alert('Refazer anamnese', 'Você vai responder o questionário de novo.', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Refazer', onPress: () => void resetAnamnese() },
    ])

  return (
    <Screen edges={['top']}>
      <View style={styles.topbar}>
        <Pressable style={styles.iconBtn} onPress={() => navigation.goBack()}>
          <Icon name="chevron-left" size={18} color={colors.text} />
        </Pressable>
        <Text style={styles.topTitle}>Perfil</Text>
        <View style={styles.iconBtn} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <View style={styles.avatar}>
            <Text style={styles.avatarTxt}>{iniciais(nome)}</Text>
          </View>
          <Text style={styles.nome}>{nome}</Text>
          <Text style={styles.email}>{session?.user.email}</Text>
          <View style={styles.plano}>
            <Icon name="star" size={11} color={colors.bg0} />
            <Text style={styles.planoTxt}>Aluna CoreUP</Text>
          </View>
        </View>

        {anamnese ? (
          <>
            <View style={styles.sectionRow}>
              <Text style={styles.section}>Sua anamnese</Text>
              <Pressable onPress={refazer} hitSlop={8}>
                <Text style={styles.editar}>Refazer</Text>
              </Pressable>
            </View>
            <Card style={styles.anamneseCard}>
              <Linha icon="bullseye" label="Objetivo" valor={L_OBJETIVO[anamnese.objetivo]} />
              <Linha icon="location-dot" label="Treina em" valor={anamnese.locais.map((l) => L_LOCAL[l]).join(', ') || '—'} />
              <Linha icon="dumbbell" label="Estilo" valor={anamnese.estilos.map((e) => L_ESTILO[e]).join(', ') || '—'} />
              <Linha icon="calendar-check" label="Frequência" valor={`${anamnese.diasPorSemana}x por semana`} />
              <Linha icon="chair" label="Sentada" valor={`${anamnese.horasSentadoDia}h por dia`} />
              <Linha
                icon="person-running"
                label="Também faz"
                valor={anamnese.outrasAtividades.map((a) => L_ATIV[a]).join(', ') || '—'}
              />
              {anamnese.dores.length > 0 && (
                <Linha icon="triangle-exclamation" label="Cuidado" valor={anamnese.dores.map((d) => L_DOR[d]).join(', ')} destaque />
              )}
              {anamnese.observacoes ? <Linha icon="comment" label="Nota" valor={anamnese.observacoes} last /> : null}
            </Card>
          </>
        ) : null}

        <Text style={styles.section}>Conta</Text>
        <Card style={styles.contaCard}>
          <ContaRow icon="right-from-bracket" label="Sair da conta" onPress={sair} />
          <View style={styles.hair} />
          <ContaRow icon="trash-can" label="Excluir conta" onPress={excluir} danger />
        </Card>

        <View style={{ height: 24 }} />
      </ScrollView>
    </Screen>
  )
}

function Linha({
  icon,
  label,
  valor,
  destaque,
  last,
}: {
  icon: React.ComponentProps<typeof Icon>['name']
  label: string
  valor: string
  destaque?: boolean
  last?: boolean
}) {
  return (
    <View style={[styles.linha, !last && styles.linhaBorder]}>
      <Icon name={icon} size={14} color={destaque ? colors.warn : colors.muted} />
      <Text style={styles.linhaLabel}>{label}</Text>
      <Text style={[styles.linhaValor, destaque && { color: colors.warn }]} numberOfLines={2}>
        {valor}
      </Text>
    </View>
  )
}

function ContaRow({
  icon,
  label,
  onPress,
  danger,
}: {
  icon: React.ComponentProps<typeof Icon>['name']
  label: string
  onPress: () => void
  danger?: boolean
}) {
  return (
    <Pressable style={styles.contaRow} onPress={onPress}>
      <Icon name={icon} size={16} color={danger ? colors.danger : colors.muted} />
      <Text style={[styles.contaTxt, danger && { color: colors.danger }]}>{label}</Text>
      <View style={{ flex: 1 }} />
      <Icon name="chevron-right" size={13} color={colors.faint} />
    </Pressable>
  )
}

const styles = StyleSheet.create({
  topbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  iconBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', borderRadius: radius.md },
  topTitle: { color: colors.text, fontFamily: font.bold, fontSize: 16 },

  content: { paddingHorizontal: 18, paddingTop: 8 },
  hero: { alignItems: 'center', marginBottom: 24 },
  avatar: {
    width: 84,
    height: 84,
    borderRadius: radius.pill,
    backgroundColor: colors.bg2,
    borderColor: colors.border,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  avatarTxt: { color: colors.accent, fontFamily: font.displayX, fontSize: 32 },
  nome: { color: colors.text, fontFamily: font.bold, fontSize: 20 },
  email: { color: colors.muted, fontFamily: font.regular, fontSize: 13.5, marginTop: 2 },
  plano: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.accent,
    borderRadius: radius.pill,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginTop: 12,
  },
  planoTxt: { color: colors.bg0, fontFamily: font.bold, fontSize: 12.5, letterSpacing: 0.2 },

  sectionRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  section: {
    color: colors.muted,
    fontFamily: font.semibold,
    fontSize: 11,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginTop: 20,
    marginBottom: 10,
  },
  editar: { color: colors.accent, fontFamily: font.bold, fontSize: 13, marginTop: 10 },

  anamneseCard: { paddingVertical: 4 },
  linha: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 13 },
  linhaBorder: { borderBottomColor: colors.border, borderBottomWidth: StyleSheet.hairlineWidth },
  linhaLabel: { color: colors.muted, fontFamily: font.medium, fontSize: 13.5, width: 78 },
  linhaValor: { color: colors.text, fontFamily: font.semibold, fontSize: 13.5, flex: 1, textAlign: 'right' },

  contaCard: { paddingVertical: 4 },
  contaRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 14 },
  contaTxt: { color: colors.text, fontFamily: font.semibold, fontSize: 15 },
  hair: { height: StyleSheet.hairlineWidth, backgroundColor: colors.border },
})
