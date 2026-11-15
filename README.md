# NEXUS PLAYER

Projeto do NEXUS PLAYER com versão web/PWA e preparação para aplicativos nativos.

## Versão web

A versão web continua publicada no GitHub Pages:

https://cildojuniorbt-cmd.github.io/NEXUS-PLAYER/

A aplicação permite importar arquivos locais de áudio e vídeo, organizar biblioteca e playlists, usar favoritos, fila, reprodução aleatória, repetição e equalizador. Os arquivos importados são armazenados localmente no IndexedDB do navegador. Não existe sincronização em nuvem nesta etapa.

## Preparação Android

A fundação Android usa Capacitor 8 e mantém a aplicação web dentro do pacote do app. O identificador Android reservado é `com.nexus.player`.

### Requisitos locais

- Node.js 22 ou superior
- Android Studio
- Android SDK

### Preparar e abrir o projeto

```bash
npm install
npm run build:web
npx cap add android
npx cap sync android
npx cap open android
```

Depois, no Android Studio, é possível executar no dispositivo conectado ou gerar um APK de depuração.

### Gerar APK de depuração pelo terminal

No Windows PowerShell:

```powershell
npm install
npm run build:web
npx cap add android
npx cap sync android
cd android
.`gradlew.bat assembleDebug
```

O APK de depuração será gerado em:

`android/app/build/outputs/apk/debug/app-debug.apk`

## Build automático

A branch `feature/android-native-foundation` possui um workflow do GitHub Actions para gerar o APK de depuração. O arquivo será disponibilizado como artefato da execução do workflow.

## Etapas nativas ainda pendentes

Esta fundação gera um pacote Android inicial com a interface atual. Ela ainda não implementa o serviço de reprodução Media3, os controles de mídia nativos completos nem a integração Android Auto. Essas funções serão desenvolvidas e testadas em etapas próprias. A integração iOS/CarPlay também permanece planejada para uma fase posterior.

## Estrutura e preservação

- A branch `main` permanece como versão web estável.
- O desenvolvimento Android ocorre em `feature/android-native-foundation`.
- A pasta `www` é gerada pelo script `scripts/prepare-web.mjs` e não deve ser editada manualmente.
