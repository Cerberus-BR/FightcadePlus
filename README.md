<p align="center">
  <img src="plugins/cerberus/logo.png" alt="Fightcade Plus Logo" width="120" height="120" style="object-fit: contain;" />
</p>

<h1 align="center">FightcadePlus (Plugin)</h1>

<p align="center">
  <img src="https://img.shields.io/badge/Version-2.0.0-blue?style=for-the-badge" alt="Plugin Version" />
  <img src="https://img.shields.io/badge/Plugin-Fightcade_Plus-red?style=for-the-badge" alt="Fightcade Inject" />
  <img src="https://img.shields.io/badge/Languages-EN%20%7C%20PT%20%7C%20ES-green?style=for-the-badge" alt="Languages" />
</p>

A powerful, high-performance plugin injected directly into your Fightcade client. Designed to elevate your gaming, streaming, and community interaction with real-time tools, Elo radar, FT match simulator, customizable filter shields, automated lobbies, 20 custom challenge audio lines, and Obsidian Glass visual tweaks.

🌐 **Project Website**: [https://cerberus-br.github.io/FightcadePlus](https://cerberus-br.github.io/FightcadePlus)

---

## 🗺️ Navigation / Navegação / Navegación

- 🇺🇸 **[English Documentation](#-english)**
  - [Features](#-features)
  - [Custom Challenge Audios](#-custom-challenger-audio-20-tracks)
  - [Installation](#-download--installation)
  - [Advanced Configuration](#-advanced-configuration-reference)
  - [Support](#-support)
- 🇧🇷 **[Documentação em Português](#-português)**
  - [Funcionalidades](#-funcionalidades)
  - [Sons de Desafio Customizados](#-sons-de-desafio-customizados-20-faixas)
  - [Instalação](#-download-e-instalação)
  - [Configurações Avançadas](#-referência-de-configuração-avançada)
  - [Apoie o Projeto](#-apoio)
- 🇪🇸 **[Documentación en Español](#-español)**
  - [Características](#-características)
  - [Sonidos de Desafío Personalizados](#-sonidos-de-desafío-personalizados-20-pistas)
  - [Instalación](#-descarga-e-instalación)
  - [Configuración Avanzada](#-referencia-de-configuración-avanzada)
  - [Soporte](#-soporte)

---

## 🇺🇸 English

### Welcome to Fightcade Plus

**Fightcade Plus** enhances your Fightcade experience by adding quality-of-life additions, robust tools for streamers, live Elo estimations, interactive FT series simulators, multi-layered challenge filtering, 20 custom voice sound lines, and an Obsidian Glass interface.

🌐 **Project Page**: [https://cerberus-br.github.io/FightcadePlus](https://cerberus-br.github.io/FightcadePlus)

---

### 🚀 Features

#### 🏆 Elo Radar & Pre-Match Goals
- **Continuous Elo Estimation**: Calculates player ratings by blending official Fightcade data with a competitive quadratic pyramid curve (`p = 2.0`) across rank tiers.
- **Dynamic Hover Metas**: Hovering over players in the sidebar or challenge cards reveals target point gains and contextual goals based on the selected FT format.
- **FGC Contextual Insight**: Identifies high-value close matches where even a tight loss awards positive net Elo ("heroic loss").

#### ⚔️ Interactive FT Match Simulator
- **Dedicated Floating Tool (`⚔️`)**: Accessible via the action button or settings panel to simulate any score combination between you and any opponent.
- **Format Support**: Simulates FT2, FT3, FT5, FT10, and FT20 with symmetric Elo delta calculations and a one-click profile auto-fill button.

#### 🛡️ Granular FT Challenge Filter & Auto-Reject
- **Selective Match Modalities**: Filter challenges specifically by match type (FT2, FT3, FT5, FT10, FT20, or Casual/Training).
- **Dual-Layer Interception**: Intercepts challenges at the network socket layer (preventing native audio) and through a DOM mutation observer for visual suppression.
- **Strict Reject Priority**: Negative Reputation > Blocked Country > Minimum Rank > Maximum Ping > FT Format.
- **Fail-Safe Open Guard**: If all format boxes are unchecked or settings corrupt, the filter opens safely to avoid blocking gameplay.
- **Small-Caps Chat Notice**: Sends an anti-spam protected (`🛡️ [ᴀᴜᴛᴏ ʀᴇᴊᴇᴄᴛ]`) notice with a 5-second cooldown.

#### 📶 Connection & Network Intelligence
- **Connection Type Badges**: Real-time identification displaying dedicated icons and colors for **Cable (Ethernet)**, **Wi-Fi** (amber highlight), and **VPN / Relay** (red shield).
- **Ping Displays**: Switch between exact numerical ping in milliseconds or visual latency bars.

#### 🏁 Endgame Summary & Rage Quit Detection
- **Vertical Match Card**: Displays clean point balances won or lost per player upon match conclusion, along with motivational messages.
- **Rage Quit Warning**: Detects forced game disconnections (pulled cables / closed emulators) and triggers an immediate chat alert.

#### 🤖 Streamer Toolkit (Live Queue)
- **Live Queue System**: Let viewers join your challenge queue directly from the Fightcade chat using a customizable command (default: `!join`).
- **Automated Welcome Messages**: Greet players automatically as they queue up.
- **10-Minute Promo Bot**: Set a custom promotional message (e.g. YouTube or Twitch links) to be broadcasted automatically.
- **Streamer Safety Nick**: Prevents streamer self-joins when interacting in chat.

#### 💬 Interface & Chat Upgrades
- **Visual Decorations**: Country flags, rank letters (S, A, B, C, D, E), numeric position badges, and connection type indicators.
- **Sidebar Search Bar**: Debounced real-time search box at the top of the user list.
- **Collapsible MOTD / Bulletins**: Server notice banner with support for remote updates and a collapse toggle.
- **Chat Macros**: Instant buttons to Clear, Pause, or Resume chat rendering.

#### 🛡️ Reputation Shield & Privacy
- **Reputation System (👍/👎)**: Upvote friendly rivals (Favorite) or downvote toxic players.
- **Filter Override**: Favorited players bypass all country, ping, and rank block lists.
- **Clean Chat**: Auto-hide chat messages from downvoted players.
- **Blur Mode**: Blur chat histories on screen to protect user privacy during live broadcasts.

#### ⚡ Performance & Eco Mode
- **Low Power on Blur**: Electron throttling reduces CPU and GPU usage automatically whenever Fightcade loses window focus.
- **Obsidian Glass UI**: Modern dark theme with glassmorphism and responsive controls.

---

#### 🔊 Custom Challenger Audio (20 Tracks)

Replace the default Fightcade challenge bell with one of **20 custom high-quality voice/sound lines**:

| ID | Sound Line | Description / Origin |
| :---: | :--- | :--- |
| `01` | **Go, new challenger!** | Energetic arcade announcer call |
| `02` | **A challenger awaits** | Classic fighting game challenge notice |
| `03` | **Step up!** | Competitive hype voice line |
| `04` | **Challenged!** | Direct and punchy voice |
| `05` | **CHAAAALLENGED!** | High-energy hyped shout |
| `06` | **Fight awaits!** | Dramatic match preparation voice |
| `07` | **You have been challenged** | Clear formal announcement |
| `08` | **Challenged** | Neutral tactical voice line |
| `09` | **Whistle** | Sharp sports whistle cue |
| `10` | **CS - Radio OK Lets Go** | Counter-Strike iconic radio cue |
| `11` | **MK - Raiden 1** | Mortal Kombat Raiden battle cry |
| `12` | **MK - Raiden 2** | Mortal Kombat Raiden alternate yell |
| `13` | **RRR - Let the carnage begin!** | Rock n' Roll Racing legendary announcer |
| `14` | **RRR - Bad To The Bone** | Rock n' Roll Racing classic riff cue |
| `15` | **James Brown - Wow** | Iconic funk shout cue |
| `16` | **Chinese Gong** | Deep martial arts gong strike |
| `17` | **Man Screaming Aaaah** | Expressive comedic yell |
| `18` | **Super Mario 64 - let's a go!** | Mario classic game start line |
| `19` | **Mario Coin** | Classic crisp 8-bit coin chime |
| `20` | **MSN Alert** | Nostalgic retro messenger notification |

- **Audio Preview Button (▶️)**: Audition every sound instantly directly in the settings panel before selecting.
- **Silent (Mute)**: Completely disables audio cues for incoming challenges.

---

### 📥 Download & Installation

The recommended method is downloading the pre-configured **Fightcade Plus** installer, featuring **automatic ROM installation** when entering game channels!

📥 **[Download Latest Release (Setup-FightcadePlus-2.0.0.exe)](https://github.com/Cerberus-BR/FightcadePlus/releases/latest)**

#### Setup Steps:
1. Download and run `Setup-FightcadePlus-2.0.0.exe` with Fightcade closed.
2. Launch Fightcade.
3. Click the gear icon (**⚙️**) in the user list header to open Cerberus Settings.

> [!NOTE]
> **Manual Installation**: If updating an existing standalone installation, extract the release archive and overwrite `inject.js` and the `/plugins/` folder inside `fc2-electron/resources/app/inject/`.

---

### ⚙️ Advanced Configuration Reference

Settings are stored in `cerberus_config.json` inside the parent plugins directory:

```json
{
  "language": "en", // Interface language ("en" | "pt" | "es")
  "autoJoin": {
    "enabled": true, // Auto-enter favorite room on startup
    "channelId": "sfiii3an" // Target channel ID to auto-join
  },
  "countryFilter": {
    "enabled": false, // Toggle country filter shield
    "autoReject": false, // Auto-decline challenges from blocked countries
    "autoRejectNotify": true // Send chat notification on auto-reject
  },
  "ftFilter": {
    "enabled": false, // Enable granular FT challenge filter
    "autoReject": true, // Auto-decline filtered FT formats
    "allowFt2": true, // Allow First-to-2 matches
    "allowFt3": true, // Allow First-to-3 matches
    "allowFt5": true, // Allow First-to-5 matches
    "allowFt10": true, // Allow First-to-10 matches
    "allowFt20": true, // Allow First-to-20 matches
    "allowCasual": true // Allow Casual / Training matches
  },
  "pingFilter": {
    "enabled": false, // Filter players exceeding latency limit
    "maxPingMs": 150, // Maximum allowed latency threshold
    "autoReject": true, // Auto-reject challenges exceeding maxPingMs
    "hideHighPing": false // Visually conceal high-ping challenge cards
  },
  "rankings": {
    "masterEnabled": true, // Enable rankings module
    "autoSync": true, // Periodic daily background ranking sync
    "limit": 900, // Maximum players to fetch (max 900 recommended)
    "minRankToAccept": 0, // Filter challenges below: 0=All, 1=E, 2=D, 3=C, 4=B, 5=A, 6=S
    "autoRejectBelowMin": false, // Auto-reject filtered rank challenges
    "enableElo": true, // Display estimated Elo points and radar
    "enableSimulator": true, // Enable floating FT match simulator tool
    "defaultFt": 5 // Default FT format for pre-match radar goals
  },
  "chatUserInfo": {
    "masterEnabled": true, // Enable chat visual enhancements
    "enableStatus": true, // Show Online/Away status indicators
    "enableFlag": true, // Show country flags in chat
    "enableRank": true, // Show ranking letters
    "showNumericRanks": true, // Show ranking position badges
    "enablePingText": true, // Show numerical ping values in chat
    "enablePingBars": true, // Show visual latency bars
    "replacePingBarWithText": true, // Replace sidebar bars with ping text
    "enableReputation": true, // Enable reputation system (Favorite/Downvote)
    "hideNegativeMessages": false, // Hide chat messages from downvoted users
    "autoRejectNegative": true, // Auto-reject challenges from downvoted users
    "unlockColorThemes": true, // Unlock premium color UI themes
    "blurMode": "none", // Chat privacy blur ("none" | "all")
    "challengeSound": "custom1", // Sound: "native", "custom1" to "custom20", or "silent"
    "chatMuted": false // Pause incoming chat scrolling
  },
  "liveQueue": {
    "enabled": false, // Enable streamer live queue
    "keyword": "!join", // Command viewers type to enter
    "limit": 10, // Maximum queue capacity
    "streamerNick": "", // Streamer nick (prevents self-joins)
    "autoReply": false, // Chat announcement for new entries
    "promoEnabled": false, // Send promotional messages
    "promoMessage": "[LIVE] Enter queue by typing !join!" // Custom promo text
  },
  "performance": {
    "lowPowerOnBlur": true // Throttles Electron CPU/GPU when window loses focus
  }
}
```

---

### ☕ Support

- **PayPal (International)**: [Donate via PayPal](https://www.paypal.com/donate/?hosted_button_id=BEPD37AB7XYL4)
- **Ko-Fi / About Tab**: Check the **About** tab inside the Cerberus Settings panel for live support links.

---

## 🇧🇷 Português

### Bem-vindo ao Fightcade Plus

O **Fightcade Plus** eleva sua experiência no Fightcade adicionando melhorias de qualidade de vida, utilitários completos para streamers, Radar de Elo com metas dinâmicas, simulador interativo de FTs, filtros avançados de desafio, 20 opções de áudios customizados e interface moderna em estilo Obsidian Glass.

🌐 **Página do Projeto**: [https://cerberus-br.github.io/FightcadePlus](https://cerberus-br.github.io/FightcadePlus)

---

### 🚀 Funcionalidades

#### 🏆 Radar de Elo e Recomendações Pré-Jogo
- **Estimativa Contínua de Elo**: Mapeia a pontuação dos jogadores combinando dados oficiais do Fightcade com uma curva competitiva piramidal quadrática (`p = 2.0`).
- **Metas Dinâmicas no Hover**: Ao passar o mouse sobre jogadores na lista lateral ou nos desafios recebidos/enviados, exibe as metas de pontuação baseadas no formato FT escolhido.
- **Análise Contextual FGC**: Identifica confrontos acirrados em que até uma derrota apertada concede ganho de Elo ("vitória heroica").

#### ⚔️ Simulador Interativo de Séries FT
- **Janela Flutuante Dedicada (`⚔️`)**: Acessível pelo botão de ação superior ou no painel para simular qualquer combinação de placar entre você e qualquer oponente.
- **Suporte Completo a Formatos**: Simula FT2, FT3, FT5, FT10 e FT20 com cálculo simétrico de delta de Elo e botão de preenchimento automático do seu perfil.

#### 🛡️ Filtro Granular por Formato FT e Auto-Reject
- **Filtro Específico por Modalidade**: Escolha exatamente quais formatos aceitar (FT2, FT3, FT5, FT10, FT20 ou Casuais/Treino).
- **Dupla Camada de Interceptação**: Recusa no socket de rede (sem tocar som nativo) e captura no DOM para ocultação visual instantânea.
- **Hierarquia Estrita de Recusa**: Reputação Negativa > País Bloqueado > Rank Mínimo > Ping Máximo > Formato FT.
- **Postura Fail-Safe Open**: Se todas as opções de FT forem desmarcadas ou houver corrupção de config, o sistema aceita todas as partidas para nunca bloquear a jogabilidade.
- **Aviso no Chat**: Notificação com Small Caps e emoji de proteção (`🛡️ [ᴀᴜᴛᴏ ʀᴇᴊᴇᴄᴛ]`) protegida por cooldown de 5 segundos contra spam.

#### 📶 Identificação de Tipo de Conexão
- **Badges de Conexão em Tempo Real**: Ícones e cores dedicadas para **Cabo (Ethernet)**, **Wi-Fi** (destaque amarelo) e **VPN / Relay** (escudo vermelho).
- **Exibição de Ping**: Alterne entre o ping numérico exato em milissegundos e barras gráficas de latência.

#### 🏁 Quadro de Fim de Partida e Detecção de Rage Quit
- **Card de Fim de Jogo**: Saldo vertical de pontos ganhos ou perdidos por jogador ao término da disputa, acompanhado de mensagens motivacionais.
- **Alerta de Rage Quit**: Detecta encerramento forçado do jogo (cabo puxado / emulador fechado) e notifica imediatamente no chat da sala.

#### 🤖 Ferramentas para Streamers (Live Queue)
- **Fila de Jogadores (Live Queue)**: Permite que seus espectadores entrem na fila de desafios digitando um comando configurável no chat (padrão: `!join`).
- **Boas-vindas Automáticas**: Envia mensagens de saudação no chat conforme novos jogadores entram na fila.
- **Bot Promocional**: Divulga links ou mensagens personalizadas no chat automaticamente a cada 10 minutos.
- **Filtro de Nick**: Evita que o streamer entre na própria fila por engano.

#### 💬 Melhorias no Chat e Lista Lateral
- **Detalhamento Visual**: Bandeiras de países, letras de patentes (S, A, B, C, D, E), medalhas numéricas de ranking e tipo de conexão.
- **Barra de Busca Instantânea**: Campo de busca integrado no topo da lista de usuários para localizar oponentes em tempo real.
- **Quadro de Avisos (MOTD) Retrátil**: Banner com suporte a notícias remotas e botão para recolher.
- **Macros de Chat**: Atalhos para Limpar, Pausar ou Retomar a rolagem do chat.

#### 🛡️ Filtro de Reputação e Privacidade
- **Sistema de Reputação (👍/👎)**: Destaque bons jogadores (Favorito) ou negative usuários indesejados.
- **Ignorar Filtros**: Jogadores marcados como Favorito ignoram qualquer regra de bloqueio de país, rank ou ping.
- **Chat Limpo**: Oculta automaticamente mensagens enviadas por usuários negativados.
- **Modo Blur (Privacidade)**: Borra o histórico do chat na tela para proteger a privacidade durante lives.

#### ⚡ Desempenho e Modo Eco
- **Modo Eco (Low Power on Blur)**: Reduz o consumo de CPU e GPU do Electron automaticamente quando o Fightcade perde o foco.
- **Painel Obsidian Glass**: Design dark moderno com visual glassmorphism e controles responsivos.

---

#### 🔊 Sons de Desafio Customizados (20 Faixas)

Substitua o som de sino padrão por **20 falas e efeitos sonoros exclusivos de alta qualidade**:

| ID | Faixa Sonora | Descrição / Origem |
| :---: | :--- | :--- |
| `01` | **Go, new challenger!** | Locução clássica de arcade empolgante |
| `02` | **A challenger awaits** | Chamada imersiva de novo desafiante |
| `03` | **Step up!** | Frase enérgica de desafio competitivo |
| `04` | **Challenged!** | Voz direta e marcante |
| `05` | **CHAAAALLENGED!** | Grito vibrante de confronto |
| `06` | **Fight awaits!** | Tom dramático de preparação para luta |
| `07` | **You have been challenged** | Locução formal clara |
| `08` | **Challenged** | Efeito de voz tático e neutro |
| `09` | **Assobio** | Apito esportivo nítido |
| `10` | **CS - Radio OK Lets Go** | Comando de rádio clássico do Counter-Strike |
| `11` | **MK - Raiden 1** | Grito de batalha característico do Raiden |
| `12` | **MK - Raiden 2** | Grito alternativo do Raiden (Mortal Kombat) |
| `13` | **RRR - Let the carnage begin!** | Narrador lendário de Rock n' Roll Racing |
| `14` | **RRR - Bad To The Bone** | Riff clássico de guitarra de Rock n' Roll Racing |
| `15` | **James Brown - Wow** | Grito clássico e expressivo de funk |
| `16` | **Chinese Gong** | Batida profunda e tradicional de gongo marcial |
| `17` | **Man Screaming Aaaah** | Grito cômico expressivo |
| `18` | **Super Mario 64 - let's a go!** | Início clássico de partida do Mario 64 |
| `19` | **Mario Coin** | Efeito retrô nítido da moeda de 8 bits |
| `20` | **MSN Alert** | Som nostálgico de notificação do MSN Messenger |

- **Botão de Teste / Prévia (▶️)**: Escute qualquer áudio instantaneamente direto no painel de configurações antes de escolher.
- **Silencioso (Mute)**: Desativa por completo o alerta auditivo de novos desafios.

---

### 📥 Download e Instalação

A maneira recomendada é baixando o instalador integrado do **Fightcade Plus**, que já inclui **instalador automático de ROMs** ao entrar nas salas!

📥 **[Baixar Instalador Oficial (Setup-FightcadePlus-2.0.0.exe)](https://github.com/Cerberus-BR/FightcadePlus/releases/latest)**

#### Passo a Passo:
1. Baixe e execute o `Setup-FightcadePlus-2.0.0.exe` com o Fightcade fechado.
2. Inicie o Fightcade normalmente.
3. Clique no ícone de engrenagem (**⚙️**) no topo da lista de usuários para abrir o Cerberus Settings!

> [!NOTE]
> **Instalação Manual**: Caso prefira atualizar sua instalação avulsa do Fightcade, baixe o arquivo de release e sobrescreva o `inject.js` e a pasta `/plugins/` em `fc2-electron/resources/app/inject/`.

---

### ⚙️ Referência de Configuração Avançada

Os parâmetros ficam salvos em `cerberus_config.json` no diretório de plugins:

```json
{
  "language": "pt", // Idioma da interface ("en" | "pt" | "es")
  "autoJoin": {
    "enabled": true, // Entrar automaticamente na sala favorita ao iniciar
    "channelId": "sfiii3an" // ID do canal favorito
  },
  "countryFilter": {
    "enabled": false, // Ativar filtro de países
    "autoReject": false, // Recusar desafios de países bloqueados
    "autoRejectNotify": true // Enviar aviso no chat ao auto-recusar
  },
  "ftFilter": {
    "enabled": false, // Ativar filtro granular por formato FT
    "autoReject": true, // Recusar automaticamente formatos não permitidos
    "allowFt2": true, // Permitir partidas FT2
    "allowFt3": true, // Permitir partidas FT3
    "allowFt5": true, // Permitir partidas FT5
    "allowFt10": true, // Permitir partidas FT10
    "allowFt20": true, // Permitir partidas FT20
    "allowCasual": true // Permitir partidas Casuais / Treino
  },
  "pingFilter": {
    "enabled": false, // Filtrar oponentes com latência alta
    "maxPingMs": 150, // Limite máximo de ping tolerado
    "autoReject": true, // Recusar desafios com ping acima do limite
    "hideHighPing": false // Ocultar visualmente cards com ping alto
  },
  "rankings": {
    "masterEnabled": true, // Ativar módulo de rankings
    "autoSync": true, // Sincronização periódica em background (diária)
    "limit": 900, // Quantidade de jogadores para sincronizar
    "minRankToAccept": 0, // Filtrar desafios abaixo de: 0=Todos, 1=E, 2=D, 3=C, 4=B, 5=A, 6=S
    "autoRejectBelowMin": false, // Rejeitar automaticamente desafios filtrados por rank
    "enableElo": true, // Exibir estimativa de Elo e metas no hover
    "enableSimulator": true, // Habilitar simulador interativo de FTs
    "defaultFt": 5 // Formato FT padrão para cálculo de metas
  },
  "chatUserInfo": {
    "masterEnabled": true, // Ativar decorações visuais no chat
    "enableStatus": true, // Mostrar status Online/Ausente/Offline
    "enableFlag": true, // Exibir bandeiras dos países
    "enableRank": true, // Exibir letra da patente
    "showNumericRanks": true, // Mostrar medalha de colocação no ranking
    "enablePingText": true, // Mostrar ping numérico no chat
    "enablePingBars": true, // Mostrar barras gráficas de latência
    "replacePingBarWithText": true, // Substituir barras por ping em texto na barra lateral
    "enableReputation": true, // Ativar sistema de Favorito/Negativado
    "hideNegativeMessages": false, // Ocultar mensagens de usuários negativados
    "autoRejectNegative": true, // Recusar desafios de usuários negativados
    "unlockColorThemes": true, // Desbloquear temas de cor premium
    "blurMode": "none", // Modo blur para streams ("none" | "all")
    "challengeSound": "custom1", // Som: "native", "custom1" até "custom20" ou "silent"
    "chatMuted": false // Pausar rolagem do chat
  },
  "liveQueue": {
    "enabled": false, // Ativar fila de desafios para streams
    "keyword": "!join", // Comando que os espectadores digitam
    "limit": 10, // Capacidade máxima da fila
    "streamerNick": "", // Nick do streamer para ignorar auto-entrada
    "autoReply": false, // Enviar aviso no chat sobre novas entradas
    "promoEnabled": false, // Enviar mensagens de divulgação periódicas
    "promoMessage": "[LIVE] Entre na fila digitando !join!" // Mensagem de divulgação
  },
  "performance": {
    "lowPowerOnBlur": true // Reduz consumo de CPU/GPU ao desfocar a janela
  }
}
```

---

### ☕ Apoio

- **LivePix (Brasil)**: [livepix.gg/cerberusbr](https://livepix.gg/cerberusbr)
- **PayPal (Internacional)**: [Doar via PayPal](https://www.paypal.com/donate/?hosted_button_id=BEPD37AB7XYL4)

---

## 🇪🇸 Español

### Bienvenido a Fightcade Plus

**Fightcade Plus** mejora significativamente tu experiencia en Fightcade integrando herramientas de calidad de vida, panel completo para streamers, Radar de Elo con metas en tiempo real, simulador interactivo de FTs, filtros selectivos de retos, 20 sonidos de alerta personalizados y panel visual Obsidian Glass.

🌐 **Página del Proyecto**: [https://cerberus-br.github.io/FightcadePlus](https://cerberus-br.github.io/FightcadePlus)

---

### 🚀 Características

#### 🏆 Radar de Elo y Metas Pre-Partida
- **Estimación Continua de Elo**: Mapea la puntuación de los jugadores combinando datos oficiales de Fightcade con una curva piramidal cuadrática (`p = 2.0`).
- **Metas Dinámicas al Pasar el Cursor**: Al pasar el ratón sobre jugadores o retos, visualiza las metas de puntos según el formato FT seleccionado.
- **Lectura Contextual FGC**: Reconoce partidas reñidas donde incluso una derrota ajustada otorga puntos positivos netos de Elo ("derrota heroica").

#### ⚔️ Simulador Interactivo de Series FT
- **Herramienta Flotante Dedicada (`⚔️`)**: Accesible desde la barra superior o ajustes para simular cualquier marcador entre tú y cualquier rival.
- **Formatos Compatibles**: Simula FT2, FT3, FT5, FT10 y FT20 con cálculo simétrico de delta de Elo y autocompletado de tu perfil.

#### 🛡️ Filtro Selectivo por Formato FT y Auto-Rechazo
- **Filtro Selectivo por Modalidad**: Elige exactamente qué formatos aceptar (FT2, FT3, FT5, FT10, FT20 o Casuales/Entrenamiento).
- **Doble Capa de Intercepción**: Intercepta en el socket de red (sin reproducir el timbre nativo) y en el observador del DOM para ocultación visual instantánea.
- **Jerarquía Estricta de Rechazo**: Reputación Negativa > País Bloqueado > Rango Mínimo > Ping Máximo > Formato FT.
- **Postura Fail-Safe Open**: Si se desmarcan todas las casillas o se corrompen los datos, el filtro se abre para no bloquear nunca el juego.
- **Aviso en Chat**: Notificación con Small Caps y emoji de protección (`🛡️ [ᴀᴜᴛᴏ ʀᴇᴊᴇᴄᴛ]`) protegida por cooldown de 5 segundos contra spam.

#### 📶 Identificación del Tipo de Conexión
- **Insignias de Red en Vivo**: Iconos y colores dedicados para **Cable (Ethernet)**, **Wi-Fi** (resaltado amarillo) y **VPN / Relay** (escudo rojo).
- **Visualización de Ping**: Alterna entre el ping numérico exacto en milisegundos o barras gráficas de latencia.

#### 🏁 Cuadro de Fin de Partida y Detección de Rage Quit
- **Tarjeta de Fin de Partida**: Muestra el saldo vertical de puntos ganados o perdidos por jugador al concluir la serie, con frases motivacionales.
- **Alerta de Rage Quit**: Detecta desconexiones forzadas del juego (cable desconectado / emulador cerrado) y avisa de inmediato en el chat.

#### 🤖 Herramientas para Streamers (Live Queue)
- **Fila de Jugadores en Vivo (Live Queue)**: Permite que tus espectadores se unan a la cola desde el chat usando un comando personalizable (por defecto: `!join`).
- **Mensajes de Bienvenida Automatizados**: Saluda automáticamente a nuevos retadores.
- **Bot de Promociones**: Publica mensajes periódicos de difusión en el chat cada 10 minutos.
- **Filtro Protector de Nick**: Evita que el streamer ingrese a su propia cola por error.

#### 💬 Mejoras de Chat y Lista Lateral
- **Información Visual Ampliada**: Banderas, rangos de letras (S, A, B, C, D, E), medallas numéricas de clasificación e insignias de conexión.
- **Buscador en la Barra Lateral**: Filtro de búsqueda en tiempo real con debounce en la cabecera de la lista de usuarios.
- **Tablón de Anuncios (MOTD) Plegable**: Mensaje superior con soporte a notas remotas y botón de plegado.
- **Macros de Chat**: Botones para Limpiar, Pausar o Reanudar el flujo de mensajes.

#### 🛡️ Escudo de Reputación y Privacidad
- **Reputación Dinámica (👍/👎)**: Califica positivamente (Favorito) o reporta (Downvote) a usuarios tóxicos.
- **Bypass de Filtros**: Los jugadores marcados como Favorito ignoran las restricciones de rango, ping o país.
- **Chat Limpio**: Oculta automáticamente mensajes de usuarios reportados con reputación negativa.
- **Modo Blur (Privacidad)**: Desenfoca los chats en pantalla para proteger la privacidad durante emisiones en directo.

#### ⚡ Rendimiento y Modo Eco
- **Modo Eco (Low Power on Blur)**: Reduce el consumo de CPU y GPU de Electron cuando la ventana de Fightcade pierde el foco.
- **Panel Obsidian Glass**: Interfaz moderna de vidrio oscuro con controles responsivos.

---

#### 🔊 Sonidos de Desafío Personalizados (20 Pistas)

Remplaza el timbre predeterminado por **20 voces y efectos exclusivos de alta calidad**:

| ID | Pista Sonora | Descripción / Origen |
| :---: | :--- | :--- |
| `01` | **Go, new challenger!** | Locución arcade llena de energía |
| `02` | **A challenger awaits** | Llamada clásica de nuevo retador |
| `03` | **Step up!** | Frase desafiante y competitiva |
| `04` | **Challenged!** | Voz directa y contundente |
| `05` | **CHAAAALLENGED!** | Grito vibrante de combate |
| `06` | **Fight awaits!** | Tono dramático de combate |
| `07` | **You have been challenged** | Anuncio formal y claro |
| `08` | **Challenged** | Tono táctico y neutro |
| `09` | **Whistle** | Silbato deportivo nítido |
| `10` | **CS - Radio OK Lets Go** | Clásico aviso de radio de Counter-Strike |
| `11` | **MK - Raiden 1** | Grito característico de Raiden |
| `12` | **MK - Raiden 2** | Grito alternativo de Raiden (Mortal Kombat) |
| `13` | **RRR - Let the carnage begin!** | Locutor legendario de Rock n' Roll Racing |
| `14` | **RRR - Bad To The Bone** | Riff de guitarra clásico de Rock n' Roll Racing |
| `15` | **James Brown - Wow** | Grito icónico de funk |
| `16` | **Chinese Gong** | Golpe tradicional y profundo de gong marcial |
| `17` | **Man Screaming Aaaah** | Grito cómico expresivo |
| `18` | **Super Mario 64 - let's a go!** | Frase clásica de inicio de Mario 64 |
| `19` | **Mario Coin** | Efecto retro nítido de moneda de 8 bits |
| `20` | **MSN Alert** | Alerta nostálgica de MSN Messenger |

- **Botón de Prueba / Reproducción (▶️)**: Escucha cada sonido al instante desde el propio panel antes de elegirlo.
- **Silencioso (Mute)**: Desactiva por completo el aviso sonoro al recibir retos.

---

### 📥 Descarga e Instalación

El método recomendado es descargar el instalador integrado de **Fightcade Plus**, ¡el cual incluye **instalación automática de ROMs** al unirte a cualquier sala de juego!

📥 **[Descargar Instalador Oficial (Setup-FightcadePlus-2.0.0.exe)](https://github.com/Cerberus-BR/FightcadePlus/releases/latest)**

#### Pasos para la Configuración:
1. Descarga y ejecuta `Setup-FightcadePlus-2.0.0.exe` con Fightcade cerrado.
2. Abre Fightcade con normalidad.
3. Pulsa el icono de engranaje (**⚙️**) en la cabecera de la lista para configurar tus preferencias en Cerberus Settings.

> [!NOTE]
> **Instalación Manual**: Si prefieres actualizar manualmente tu versión existente, descarga el paquete de la release y sobrescribe el archivo `inject.js` y la carpeta `/plugins/` en `fc2-electron/resources/app/inject/`.

---

### ⚙️ Referencia de Configuración Avanzada

Los ajustes se guardan en `cerberus_config.json` en el directorio de plugins:

```json
{
  "language": "es", // Idioma de la interfaz ("en" | "pt" | "es")
  "autoJoin": {
    "enabled": true, // Autounirse a la sala favorita al iniciar
    "channelId": "sfiii3an" // ID del canal preferido
  },
  "countryFilter": {
    "enabled": false, // Activar filtro de países
    "autoReject": false, // Auto-rechazar retos de países bloqueados
    "autoRejectNotify": true // Enviar aviso en el chat al auto-rechazar
  },
  "ftFilter": {
    "enabled": false, // Activar filtro selectivo por formato FT
    "autoReject": true, // Rechazar automáticamente formatos no permitidos
    "allowFt2": true, // Permitir partidas FT2
    "allowFt3": true, // Permitir partidas FT3
    "allowFt5": true, // Permitir partidas FT5
    "allowFt10": true, // Permitir partidas FT10
    "allowFt20": true, // Permitir partidas FT20
    "allowCasual": true // Permitir partidas Casuales / Práctica
  },
  "pingFilter": {
    "enabled": false, // Filtrar oponentes con latencia alta
    "maxPingMs": 150, // Límite máximo de ping permitido
    "autoReject": true, // Auto-rechazar retos con ping superior al límite
    "hideHighPing": false // Ocultar visualmente retos con ping alto
  },
  "rankings": {
    "masterEnabled": true, // Activar clasificaciones en vivo
    "autoSync": true, // Sincronización periódica automática (diaria)
    "limit": 900, // Límite de jugadores para sincronizar
    "minRankToAccept": 0, // Filtrar desafíos si es menor a: 0=Todos, 1=E, 2=D, 3=C, 4=B, 5=A, 6=S
    "autoRejectBelowMin": false, // Rechazar automáticamente desafíos filtrados por rango
    "enableElo": true, // Mostrar puntos Elo estimados y radar de metas
    "enableSimulator": true, // Habilitar simulador interactivo de FTs
    "defaultFt": 5 // Formato FT predeterminado para metas
  },
  "chatUserInfo": {
    "masterEnabled": true, // Decoraciones visuales en el chat
    "enableStatus": true, // Mostrar estado Online/Ausente/Offline
    "enableFlag": true, // Mostrar banderas de países
    "enableRank": true, // Mostrar letra de rango
    "showNumericRanks": true, // Mostrar medallas numéricas de posición
    "enablePingText": true, // Mostrar ping numérico en chat
    "enablePingBars": true, // Mostrar barras gráficas de latencia
    "replacePingBarWithText": true, // Reemplazar barras por texto en la barra lateral
    "enableReputation": true, // Habilitar reputación (Favorito/Downvote)
    "hideNegativeMessages": false, // Ocultar mensajes de usuarios reportados
    "autoRejectNegative": true, // Auto-rechazar retos de usuarios reportados
    "unlockColorThemes": true, // Desbloquear temas de color premium
    "blurMode": "none", // Modo desenfoque ("none" | "all")
    "challengeSound": "custom1", // Sonido: "native", "custom1" a "custom20" o "silent"
    "chatMuted": false // Pausar desplazamiento del chat
  },
  "liveQueue": {
    "enabled": false, // Activar cola de retos en vivo
    "keyword": "!join", // Comando que los espectadores escriben
    "limit": 10, // Capacidad máxima de la cola
    "streamerNick": "", // Nickname del streamer para evitar auto-ingreso
    "autoReply": false, // Anunciar nuevos integrantes en el chat
    "promoEnabled": false, // Activar bot promocional
    "promoMessage": "[LIVE] ¡Entra a la cola escribiendo !join!" // Mensaje promocional
  },
  "performance": {
    "lowPowerOnBlur": true // Reduce consumo de CPU/GPU al desenfocar la ventana
  }
}
```

---

### ☕ Soporte

- **PayPal (Internacional)**: [Donar vía PayPal](https://www.paypal.com/donate/?hosted_button_id=BEPD37AB7XYL4)
- **Ko-Fi / Pestaña Acerca de**: Consulta la pestaña **Acerca de** (About) en el panel de control para ver las opciones de contribución activas.
