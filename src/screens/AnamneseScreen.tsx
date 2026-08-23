import { useState } from 'react'
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native'
import { Screen } from '../components/Screen'
import { Button } from '../components/Button'
import { Icon } from '../components/Icon'
import { colors, font, radius } from '../theme/theme'
import { useAuth } from '../auth/AuthProvider'
import { usePerfil } from '../perfil/PerfilProvider'
import type {
  Anamnese,
  EstiloTreino,
  LocalTreino,
  Objetivo,
  OutraAtividade,
  RegiaoDor,
} from '../data/types'

// Opções de cada pergunta — rótulo + ícone FontAwesome (nunca emoji).
const OBJETIVOS: { v: Objetivo; label: string; icon: React.ComponentProps<typeof Icon>['name'] }[] = [
  { v: 'hipertrofia', label: 'Ganhar músculo', icon: 'dumbbell' },
  { v: 'emagrecimento', label: 'Perder gordura', icon: 'fire' },
  { v: 'forca', label: 'Ficar mais forte', icon: 'hand-fist' },
  { v: 'saude', label: 'Saúde e postura', icon: 'heart-pulse' },
  { v: 'condicionamento', label: 'Fôlego e disposição', icon: 'wind' },
]

const LOCAIS: { v: LocalTreino; label: string; icon: React.ComponentProps<typeof Icon>['name'] }[] = [
  { v: 'academia-completa', label: 'Academia completa', icon: 'building' },
  { v: 'academia-predio', label: 'Academia do prédio', icon: 'house-chimney' },
  { v: 'casa', label: 'Em casa', icon: 'house' },
]

const ESTILOS: { v: EstiloTreino; label: string; icon: React.ComponentProps<typeof Icon>['name'] }[] = [
  { v: 'maquinas', label: 'Máquinas', icon: 'gears' },
  { v: 'peso-livre', label: 'Peso livre', icon: 'dumbbell' },
  { v: 'funcional', label: 'Funcional', icon: 'person-running' },
  { v: 'misto', label: 'Um pouco de tudo', icon: 'shuffle' },
]

const ATIVIDADES: { v: OutraAtividade; label: string; icon: React.ComponentProps<typeof Icon>['name'] }[] = [
  { v: 'corrida', label: 'Corrida', icon: 'person-running' },
  { v: 'luta', label: 'Luta', icon: 'hand-fist' },
  { v: 'crossfit', label: 'Crossfit', icon: 'dumbbell' },
  { v: 'yoga-pilates', label: 'Yoga / Pilates', icon: 'spa' },
  { v: 'ciclismo', label: 'Ciclismo', icon: 'bicycle' },
  { v: 'danca', label: 'Dança', icon: 'music' },
  { v: 'nenhuma', label: 'Só musculação', icon: 'ban' },
]

const DORES: { v: RegiaoDor; label: string }[] = [
  { v: 'lombar', label: 'Lombar' },
  { v: 'joelho', label: 'Joelho' },
  { v: 'ombro', label: 'Ombro' },
  { v: 'punho', label: 'Punho' },
  { v: 'cervical', label: 'Pescoço' },
  { v: 'quadril', label: 'Quadril' },
  { v: 'tornozelo', label: 'Tornozelo' },
]

const TOTAL_STEPS = 5

export function AnamneseScreen() {
  const { session } = useAuth()
  const { salvarAnamnese, nome } = usePerfil()

  const [step, setStep] = useState(0)
  const [objetivo, setObjetivo] = useState<Objetivo | null>(null)
  const [locais, setLocais] = useState<LocalTreino[]>([])
  const [estilos, setEstilos] = useState<EstiloTreino[]>([])
  const [horasSentado, setHorasSentado] = useState(6)
  const [diasPorSemana, setDiasPorSemana] = useState(3)
  const [atividades, setAtividades] = useState<OutraAtividade[]>([])
  const [dores, setDores] = useState<RegiaoDor[]>([])
  const [observacoes, setObservacoes] = useState('')

  const toggle = <T,>(list: T[], v: T, setter: (l: T[]) => void) =>
    setter(list.includes(v) ? list.filter((x) => x !== v) : [...list, v])

  // cada step tem uma regra de "pode avançar"
  const podeAvancar =
    (step === 0 && objetivo !== null) ||
    (step === 1 && locais.length > 0) ||
    (step === 2 && estilos.length > 0) ||
    step === 3 ||
    step === 4

  const concluir = async () => {
    if (!objetivo) return
    const a: Anamnese = {
      usuarioId: session?.user.id ?? '',
      horasSentadoDia: horasSentado,
      objetivo,
      locais,
      estilos,
      outrasAtividades: atividades.length ? atividades : ['nenhuma'],
      dores,
      observacoes: observacoes.trim(),
      diasPorSemana,
      preenchidaEm: Date.now(),
    }
    await salvarAnamnese(a)
    // sem navigation.navigate: o gate do App troca a anamnese pelas tabs sozinho
  }

  const avancar = () => (step < TOTAL_STEPS - 1 ? setStep(step + 1) : concluir())
  const voltar = () => step > 0 && setStep(step - 1)

  return (
    <Screen edges={['top', 'bottom']}>
      <View style={styles.header}>
        <View style={styles.dots}>
          {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
            <View key={i} style={[styles.dot, i <= step && styles.dotOn]} />
          ))}
        </View>
        <Text style={styles.stepLabel}>
          {step + 1} de {TOTAL_STEPS}
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {step === 0 && (
          <Passo titulo={`Prazer, ${nome}.`} sub="Qual seu principal objetivo com os treinos?">
            {OBJETIVOS.map((o) => (
              <Opcao key={o.v} label={o.label} icon={o.icon} ativo={objetivo === o.v} onPress={() => setObjetivo(o.v)} />
            ))}
          </Passo>
        )}

        {step === 1 && (
          <Passo titulo="Onde você treina?" sub="Pode marcar mais de um — isso guia a escolha dos exercícios.">
            {LOCAIS.map((l) => (
              <Opcao
                key={l.v}
                label={l.label}
                icon={l.icon}
                ativo={locais.includes(l.v)}
                multi
                onPress={() => toggle(locais, l.v, setLocais)}
              />
            ))}
          </Passo>
        )}

        {step === 2 && (
          <Passo titulo="Do que você mais gosta?" sub="O treino rende mais quando é do seu estilo.">
            {ESTILOS.map((e) => (
              <Opcao
                key={e.v}
                label={e.label}
                icon={e.icon}
                ativo={estilos.includes(e.v)}
                multi
                onPress={() => toggle(estilos, e.v, setEstilos)}
              />
            ))}
          </Passo>
        )}

        {step === 3 && (
          <Passo titulo="Sua rotina" sub="Pra dimensionar volume e recuperação.">
            <Stepper
              label="Horas sentada por dia"
              hint="trabalho / estudo"
              value={horasSentado}
              min={0}
              max={16}
              suffix="h"
              onChange={setHorasSentado}
            />
            <Stepper
              label="Dias de treino por semana"
              value={diasPorSemana}
              min={1}
              max={7}
              suffix="x"
              onChange={setDiasPorSemana}
            />
            <Text style={styles.miniLabel}>Faz outra atividade?</Text>
            <View style={styles.wrap}>
              {ATIVIDADES.map((a) => (
                <Tag key={a.v} label={a.label} ativo={atividades.includes(a.v)} onPress={() => toggle(atividades, a.v, setAtividades)} />
              ))}
            </View>
          </Passo>
        )}

        {step === 4 && (
          <Passo titulo="Alguma dor ou limitação?" sub="A gente evita agravar. Pode pular se não tiver.">
            <View style={styles.wrap}>
              {DORES.map((d) => (
                <Tag key={d.v} label={d.label} ativo={dores.includes(d.v)} onPress={() => toggle(dores, d.v, setDores)} />
              ))}
            </View>
            <Text style={styles.miniLabel}>Quer contar mais alguma coisa?</Text>
            <TextInput
              style={styles.textarea}
              placeholder="Ex.: sinto o joelho no agachamento profundo…"
              placeholderTextColor={colors.faint}
              value={observacoes}
              onChangeText={setObservacoes}
              multiline
            />
          </Passo>
        )}
        <View style={{ height: 16 }} />
      </ScrollView>

      <View style={styles.footer}>
        {/* passo 1 não tem Voltar → Continuar ocupa 100% da largura */}
        {step > 0 && <Button label="Voltar" variant="secondary" onPress={voltar} style={styles.btnVoltar} />}
        <Button
          label={step === TOTAL_STEPS - 1 ? 'Concluir' : 'Continuar'}
          onPress={avancar}
          disabled={!podeAvancar}
          style={styles.btnAvancar}
        />
      </View>
    </Screen>
  )
}

function Passo({ titulo, sub, children }: { titulo: string; sub: string; children: React.ReactNode }) {
  return (
    <View>
      <Text style={styles.h1}>{titulo}</Text>
      <Text style={styles.sub}>{sub}</Text>
      <View style={{ gap: 10 }}>{children}</View>
    </View>
  )
}

function Opcao({
  label,
  icon,
  ativo,
  multi,
  onPress,
}: {
  label: string
  icon: React.ComponentProps<typeof Icon>['name']
  ativo: boolean
  multi?: boolean
  onPress: () => void
}) {
  return (
    <Pressable style={[styles.opcao, ativo && styles.opcaoOn]} onPress={onPress}>
      <View style={[styles.opcaoIcon, ativo && styles.opcaoIconOn]}>
        <Icon name={icon} size={16} color={ativo ? colors.bg0 : colors.muted} />
      </View>
      <Text style={[styles.opcaoLabel, ativo && styles.opcaoLabelOn]}>{label}</Text>
      <View style={{ flex: 1 }} />
      {ativo ? (
        <Icon name={multi ? 'square-check' : 'circle-check'} size={18} color={colors.accent} />
      ) : (
        <Icon name={multi ? 'square' : 'circle'} size={18} color={colors.faint} />
      )}
    </Pressable>
  )
}

function Tag({ label, ativo, onPress }: { label: string; ativo: boolean; onPress: () => void }) {
  return (
    <Pressable style={[styles.tag, ativo && styles.tagOn]} onPress={onPress}>
      <Text style={[styles.tagTxt, ativo && styles.tagTxtOn]}>{label}</Text>
    </Pressable>
  )
}

function Stepper({
  label,
  hint,
  value,
  min,
  max,
  suffix,
  onChange,
}: {
  label: string
  hint?: string
  value: number
  min: number
  max: number
  suffix: string
  onChange: (v: number) => void
}) {
  return (
    <View style={styles.stepperRow}>
      <View style={{ flex: 1 }}>
        <Text style={styles.stepperLabel}>{label}</Text>
        {hint ? <Text style={styles.stepperHint}>{hint}</Text> : null}
      </View>
      <Pressable style={styles.stepBtn} onPress={() => onChange(Math.max(min, value - 1))} disabled={value <= min}>
        <Icon name="minus" size={14} color={value <= min ? colors.faint : colors.text} />
      </Pressable>
      <Text style={styles.stepValue}>
        {value}
        {suffix}
      </Text>
      <Pressable style={styles.stepBtn} onPress={() => onChange(Math.min(max, value + 1))} disabled={value >= max}>
        <Icon name="plus" size={14} color={value >= max ? colors.faint : colors.text} />
      </Pressable>
    </View>
  )
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: 18, paddingTop: 8, paddingBottom: 4 },
  dots: { flexDirection: 'row', gap: 6 },
  dot: { flex: 1, height: 4, borderRadius: 2, backgroundColor: colors.bg2 },
  dotOn: { backgroundColor: colors.accent },
  stepLabel: {
    color: colors.muted,
    fontFamily: font.semibold,
    fontSize: 11,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
    marginTop: 8,
  },

  content: { paddingHorizontal: 18, paddingTop: 20 },
  h1: { color: colors.text, fontFamily: font.displayX, fontSize: 30, marginBottom: 6 },
  sub: { color: colors.muted, fontFamily: font.regular, fontSize: 14.5, lineHeight: 20, marginBottom: 22 },

  opcao: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.bg1,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radius.lg,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  opcaoOn: { borderColor: colors.accent, backgroundColor: colors.accentSoft },
  opcaoIcon: {
    width: 34,
    height: 34,
    borderRadius: radius.md,
    backgroundColor: colors.bg2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  opcaoIconOn: { backgroundColor: colors.accent },
  opcaoLabel: { color: colors.text, fontFamily: font.semibold, fontSize: 15 },
  opcaoLabelOn: { color: colors.text },

  miniLabel: { color: colors.text, fontFamily: font.bold, fontSize: 14, marginTop: 22, marginBottom: 12 },
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tag: {
    backgroundColor: colors.bg2,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radius.pill,
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  tagOn: { backgroundColor: colors.accent, borderColor: colors.accent },
  tagTxt: { color: colors.muted, fontFamily: font.semibold, fontSize: 13 },
  tagTxtOn: { color: colors.bg0 },

  stepperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: colors.bg1,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radius.lg,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  stepperLabel: { color: colors.text, fontFamily: font.semibold, fontSize: 14.5 },
  stepperHint: { color: colors.muted, fontFamily: font.regular, fontSize: 12, marginTop: 1 },
  stepBtn: {
    width: 34,
    height: 34,
    borderRadius: radius.md,
    backgroundColor: colors.bg2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepValue: { color: colors.text, fontFamily: font.displayX, fontSize: 22, minWidth: 44, textAlign: 'center' },

  textarea: {
    backgroundColor: colors.bg1,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radius.lg,
    padding: 14,
    color: colors.text,
    fontFamily: font.regular,
    fontSize: 14.5,
    minHeight: 90,
    textAlignVertical: 'top',
  },

  footer: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 18,
    paddingTop: 10,
    paddingBottom: 6,
    borderTopColor: colors.border,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  btnVoltar: { minWidth: 96 },
  btnAvancar: { flex: 1 },
})
