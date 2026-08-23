@AGENTS.md

# CoreUP — App do Aluno (contexto pro Claude)

> Este arquivo é o briefing pra qualquer sessão do Claude (inclusive mobile) continuar o app do zero. Leia inteiro antes de agir.

⚠️ **Expo SDK 57.** Antes de escrever código nativo/config, consulte a doc versionada: https://docs.expo.dev/versions/v57.0.0/ (ver também `AGENTS.md`).

## O que é

App nativo do aluno da **CoreUP** (consultoria de musculação da Nanda). Onde o aluno vê o programa, **registra o treino** (carga/reps/PSE) e acompanha evolução. Porte da POC React/Vite (`../poc-app-aluno`) pra **React Native/Expo**. Momento: **MVP, local-first**, validando com os primeiros alunos.

A Nanda é designer que usa código como ferramenta. Responder em **português (pt-BR)**. Tom direto, sem enrolação.

## Estado atual (onde paramos — 23/08/2026)

- **`main` tem tudo**: v1 local-first + craft pass (visual Hevy-grade) + Live Activity (iOS) + **fundação dos dois mundos** (anamnese, perfil, rotinas). Está no GitHub.
- **TestFlight**: o build lá ainda é a **v1 (build 2), ANTES do craft/Live Activity**. A Nanda está validando essa v1.
- **Próximo passo**: rodar um **build novo da `main`** e validar no device.
- **Tag `craft-clean`**: fallback só-craft (sem Live Activity), caso o módulo alpha da Live Activity quebre o build nativo.

### Modelo de dois mundos (#69) — a coluna vertebral
O app tem **livre** (self-serve, funil) e **aluna** (consultoria paga), via `plano` no `Usuario`. Grátis = ferramenta inteligente; pago = coach. A v1/MVP foca **só na aluna** (as 3 testadoras da consultoria); o mundo livre está **arquitetado no modelo/navegação mas não implementado** até o CoreUP voltar ao radar (pós-formatura CBMF, out/2026). Ver memória `coreup-app-dois-mundos`.

### O que já está implementado
- **Down-sync do programa (#69)**: o app baixa o plano REAL da aluna do Supabase (não usa mais o seed em produção). Vínculo conta↔aluna por **código** (o `app_token` do dash) via RPC `resgatar_aluno` — tela `CodigoScreen`. Depois busca o plano mais recente (`planos.dados`), mapeia `PlanoDeTreino → Rotina` em `src/api/programa.ts`, e serve via `ProgramaProvider` (cache offline-first em `src/storage/programa.ts`, fallback pro seed). SQL: `coreup-dash-pro/supabase/migrations/0004_vinculo_app.sql` (aplicada). Prancha desce como `tempoAlvoSeg` → alvo "30s" no Treino.
- **Anamnese (first-run, gate)**: 5 passos (objetivo, onde treina, estilo, rotina+atividades, dores+obs). Passo 1 tem só Continuar (100% largura, sem Voltar). Sem ela preenchida, o app inteiro é a anamnese; ao salvar, o `RootStack` troca pras tabs sozinho. Storage em `src/storage/perfil.ts`; estado reativo no `PerfilProvider`. TODO: quando o sync existir, abrir pré-preenchida do Admin → vira "confirme seus dados".
- **Home (hub)**: logo real (assets/logo-coreupteam.png) + avatar (→ Perfil) + sequência (semanas reais), treino de hoje, **resumo da semana** (feitos/meta), recado do coach, programa A/B/C (toca e inicia). Rotinas foi absorvida aqui.
- **Treino (coração)**: séries com input soft, add/remover série (swipe), PSE bottom-sheet, rest timer, header de vidro colapsável, nudge de carga.
- **Fim**: resumo + "como se sentiu" (1–5), salva local (AsyncStorage).
- **Evolução**: resumo (treinos/volume/mês) + **3 recordes** (1RM estimado por exercício via Epley com badge NOVO, treino mais pesado, sequência de semanas) + histórico. Lógica em `src/lib/stats.ts` (compartilhada com a Home).
- **Perfil (stack, via avatar)**: badge "Aluna CoreUP", resumo da anamnese (com Refazer), conta (sair, excluir — exclusão real é TODO backend #48).
- **Live Activity (iOS)**: Dynamic Island + lock screen. Atualiza por evento (ver limitações).

### Navegação
Tab bar = **2** (Início · Evolução). **Perfil não é tab** — é avatar no header. Portão: Login → **Código** (vínculo com a consultoria) → **Anamnese** → app. Rotinas foi removida (a Home é o hub); volta como aba só no mundo livre.

## Stack

- **Expo SDK 57** (managed) + **TypeScript** + **React Navigation** (native-stack; não usamos expo-router).
- **Fontes**: Genos = display/branding (números grandes, duração, wordmark). **Hanken Grotesk** = conteúdo/UI (equivalente gratuita da Aeonik, pegada Hevy). Tokens em `src/theme/theme.ts`.
- **Paleta**: **chumbo neutro** (base preta + superfícies chumbo, lima `#BDEE63` como único accent). Diverge de propósito do design-guide CoreUP (verde-preto) — é paleta específica do app. Fonte da verdade: `src/theme/theme.ts`.
- **Deps nativas**: expo-blur, react-native-gesture-handler, react-native-reanimated (+ react-native-worklets), @react-native-async-storage/async-storage, expo-haptics, **expo-widgets + @expo/ui** (Live Activity), @expo/vector-icons (FontAwesome6).

## Estrutura

```
src/
  theme/       theme.ts (cores/radius/fonts), fonts.ts (useFonts map)
  data/        types.ts (+ Anamnese, Plano), seed.ts  ← programa placeholder; trocar pelo real aqui
  storage/     sessions.ts, perfil.ts (anamnese local), programa.ts (cache do plano)
  auth/        AuthProvider (Supabase)
  perfil/      PerfilProvider (anamnese reativa + nome + plano)
  programa/    ProgramaProvider (down-sync do plano: vínculo, getTreino, fallback seed)
  api/         sync.ts (sessões↑), programa.ts (plano↓ + resgatar_aluno + map PlanoDeTreino→Rotina)
  lib/         format.ts, useDuration.ts, stats.ts (1RM/sequência/volume — Home + Evolução)
  components/  Button, Card, Badge, Screen, Icon, PseSheet, RestTimer
  screens/     CodigoScreen (gate vínculo), AnamneseScreen (gate), HomeScreen (hub), TreinoScreen (core), FimScreen, EvolucaoScreen, PerfilScreen
  navigation/  types.ts (RootStack: Anamnese | Tabs → Treino/Fim/Perfil; Tabs: Home/Evolucao)
  liveactivity/ WorkoutActivity.tsx ('widget' → SwiftUI), index.ts (start/update/end)
App.tsx        fontes + NavigationContainer + GestureHandlerRootView
```

## Decisões importantes (não reabrir sem motivo)

- **Local-first**: sem backend no app hoje. Programa vem do **seed** (`src/data/seed.ts`) — só o treino "A" está montado. Trocar pelo programa real editando o seed. Backend (Supabase + API do dash-pro, `app_token`, sem auth) é **v1.1** — as telas não mudam, só a fonte de dado.
- **Nunca reconstruir do zero** — evoluir o que existe.
- **PSE = RPE 6–10 (passo 0,5)**, igual Hevy. Aquecimento tem `pseAlvo: null`. Alinhar o dash com essa escala é issue de backend (#44).
- **Input soft**: valor prescrito é placeholder; série sem carga herda a carga anterior; ao marcar feita sem digitar, assume o placeholder.
- **Offline-first**: tudo grava local; sessão concluída salva no AsyncStorage.
- **Ícone é sempre FontAwesome, nunca emoji.**
- **SQL do dash**: entregar SQL pronto (a Nanda roda as migrations).

## Como buildar (detalhado — pra não travar no mobile)

Pré-requisitos já configurados no projeto:
- Conta Expo **fernanda.gracas** (dona), projeto já linkado (`projectId` no app.json).
- Apple Developer / App Store Connect já existem. Bundle do app: `com.nandadias.coreup`; da widget extension: `com.nandadias.coreup.widgets`; app group: `group.com.nandadias.coreup`.
- EAS Update ligado (channel `production`), babel com `react-native-worklets/plugin`, `babel-preset-expo` como dep direta, `NSSupportsLiveActivities: true`.

Comandos:
```bash
npm install                                  # sempre após clonar (node_modules é gitignored)

# Verificação headless (rodar antes de buildar — pega erro sem gastar build):
npx tsc --noEmit
npx expo export --platform ios               # confirma que o bundle fecha
npx expo-doctor                              # deve dar 21/21

# Loop de dev: Expo Go NÃO funciona (SDK 57 é novo demais pro Expo Go da loja).
# Use dev build ou o próprio TestFlight.

# Build + TestFlight (o caminho principal):
npx eas build --profile production --platform ios --auto-submit
#  → EAS pede login Apple e credenciais (incl. da widget extension e do app group): deixar o EAS gerenciar (Yes).
#  → build number auto-incrementa. A Nanda já é testadora interna (grupo "Team (Expo)") → cai automático no TestFlight dela.
#  → ~10-15 min. iOS mínimo p/ Live Activity: 16.2.

# Se o build da main falhar por causa da Live Activity (alpha), buildar do fallback:
git checkout craft-clean && npx eas build --profile production --platform ios --auto-submit

# Mudança SÓ de JS/visual (estilo, copy, fonte, layout): pode ir por OTA, sem build novo,
# DESDE que já exista um build instalado com os módulos nativos atuais:
npx eas update --branch production
```

Perfis no `eas.json`: `production` (TestFlight/store), `preview` (interno/ad-hoc; Android vira .apk), `development` (dev client).

## Live Activity — limitações (é alpha)

- Usa `expo-widgets` (módulo oficial Expo, mas **alpha**). UI em TSX com diretiva `'widget'` (`@expo/ui/swift-ui`), não Swift.
- **Sem timer nativo auto-atualizável**: o descanso correndo ao vivo na tela bloqueada ainda não dá — hoje atualiza por evento (série X/Y, "Em treino"/"Descanso"). Isso é o que falta pra igualar 100% o Hevy.
- Bug alpha conhecido de render em branco: expo/expo#43646. **Ainda não foi testada em device.** Tudo é defensivo (iOS-only, try/catch) — se falhar, não derruba o treino.

## Backlog

45 issues no GitHub, épicos E0–E5, labels MoSCoW (`must`/`should`/`could`) + tipo (`backend`/`bug`/`polish`/`spike`/`future`/`upstream`). O backend (`backend`) vive no repo `coreup-dash-pro`, fora daqui.

## Git

- `main` = tudo (craft + Live Activity). Trabalhe aqui.
- Tag `craft-clean` = fallback só-craft.
- Commits terminam com `Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>`. Só commitar/pushar quando pedido.
