// Paleta do app do aluno CoreUP — direção "chumbo neutro" (craft Hevy), lima como único accent.
// Nota: diverge de propósito do design-guide CoreUP (verde-quase-preto) — é paleta específica do app.

export const colors = {
  bg0: '#0A0A0B', // base — quase preto neutro
  bg1: '#161618', // cards / superfícies
  bg2: '#1F1F22', // chips / inputs (chumbo)
  surface3: '#2A2A2E', // elevado / botão secundário (chumbo claro)
  border: '#2C2C30', // hairline padrão
  borderSoft: 'rgba(255,255,255,0.09)', // hairline sobre vidro
  hairlineDark: 'rgba(0,0,0,0.6)', // linha de contraste escura (profundidade do header)
  text: '#F2F3F5', // quase branco neutro
  muted: '#8A8A8E', // cinza secundário (iOS-like)
  faint: '#5A5A5E', // placeholders bem apagados
  accent: '#BDEE63', // lima — destaque
  accentPress: '#A9DA4F', // lima pressionado
  accentSoft: 'rgba(189,238,99,0.14)', // fundo lima sutil (chip no alvo)
  doneRow: '#232A17', // lima 14% sobre bg0, mas OPACO (linha feita — não deixa o vermelho do swipe vazar)
  danger: '#F87171',
  dangerSoft: 'rgba(248,113,113,0.15)',
  warn: '#F5C850',
  warnSoft: 'rgba(245,200,80,0.14)',
} as const

export const radius = { sm: 8, md: 10, lg: 12, xl: 16, pill: 999 } as const

export const font = {
  // display/branding — Genos (números grandes, duração, wordmark)
  display: 'Genos_700Bold',
  displayX: 'Genos_800ExtraBold',
  displaySemi: 'Genos_600SemiBold',
  // conteúdo/UI — Hanken Grotesk (pegada Aeonik/Hevy)
  regular: 'HankenGrotesk_400Regular',
  medium: 'HankenGrotesk_500Medium',
  semibold: 'HankenGrotesk_600SemiBold',
  bold: 'HankenGrotesk_700Bold',
  extrabold: 'HankenGrotesk_800ExtraBold',
} as const

// glow discreto só no CTA primário
export const glowPrimary = {
  shadowColor: colors.accent,
  shadowOffset: { width: 0, height: 0 },
  shadowOpacity: 0.35,
  shadowRadius: 12,
  elevation: 5,
} as const
