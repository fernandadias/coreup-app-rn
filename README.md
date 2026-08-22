# CoreUP — App do Aluno (React Native / Expo)

App nativo do aluno CoreUP. **v1 é local-first**: registra o treino inteiro no dispositivo, sem backend. O Supabase entra na v1.1 (só troca a fonte de dado — as telas não mudam).

- Backlog: https://github.com/fernandadias/coreup-app-rn/issues
- Stack: Expo SDK 57 · React Native · TypeScript · React Navigation (native-stack)
- Marca: `../marca/design-guide.md` (dark verde-quase-preto + accent lima `#BDEE63`, Genos + Inter)

## Rodar no seu celular (rápido, tethered)

```bash
npm install
npx expo start
```

Abra o **Expo Go** no iPhone e escaneie o QR. Enquanto o Mac estiver rodando `expo start`, o app atualiza ao vivo. Bom pra desenvolver — **não** serve pra usar no treino longe do Mac.

## Usar no treino (offline, sem o Mac) — build preview via EAS

Gera um app instalado de verdade, que roda 100% offline.

```bash
# 1x: logar na conta Expo (grátis) e linkar o projeto
npx eas login
npx eas init

# iOS — instala no seu iPhone (Apple ID grátis serve; reassina a cada 7 dias)
npx eas build --profile preview --platform ios

# Android — gera um .apk que você baixa e instala direto
npx eas build --profile preview --platform android
```

O build roda na nuvem do EAS (~10–15 min no primeiro). Ao terminar, o EAS dá um link/QR pra instalar no aparelho. Depois é só treinar — funciona sem internet e sem o Mac.

> Pra passar pra **outras pessoas** no iPhone de verdade → TestFlight (precisa Apple Developer Program, US$99/ano). No Android, basta mandar o `.apk`.

## Estrutura

```
src/
  theme/        tokens de cor + fontes (fonte da verdade: marca/design-guide.md)
  data/         types + seed local do programa  ← troque pelo seu programa real aqui
  storage/      persistência local (AsyncStorage)  ← vira fila de sync na v1.1
  components/   Button, Card, Badge, Screen, Icon, PseSheet, RestTimer
  screens/      Home · Treino (core) · Fim
  navigation/   tipos das rotas
```

## O que já tem na v1 (E2 — registro de treino)

- Tela de treino em andamento com séries, marcar feita, header (duração/volume/séries)
- **Input soft**: valor prescrito é placeholder; série sem carga herda a última carga
- **Adicionar/remover série** (segure a linha da série pra remover)
- **PSE** em bottom-sheet com sinal abaixo/no alvo/acima
- **Rest timer** com háptico ao zerar (som + notificação em background: follow-up #18)
- **Nudge de carga**: aviso calmo quando 2+ séries ficam abaixo das reps alvo
- Fim de treino com sensação → sessão salva localmente

## Trocar pelo seu programa real

Edite `src/data/seed.ts` (exercícios/séries/cargas). Na v1.1 isso vem da API do dash-pro pelo seu `app_token`.
