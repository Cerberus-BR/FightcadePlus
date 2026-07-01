# Fightcade Plus (Plugin: Cerberus)

![Plugin Version](https://img.shields.io/badge/Version-1.15.1-blue?style=for-the-badge)
![Fightcade Inject](https://img.shields.io/badge/Plugin-Fightcade_Plus-red?style=for-the-badge)
![Languages](https://img.shields.io/badge/Languages-EN%20%7C%20PT%20%7C%20ES-green?style=for-the-badge)

A powerful, high-performance plugin injected directly into your Fightcade client. Designed to elevate your gaming, streaming, and community interaction with real-time tools, customizable filter shields, automated lobbies, and customized visual tweaks.

---

## 🗺️ Navigation / Navegação / Navegación

* 🇺🇸 **[English Documentation](#-english)**
  * [Features](#-features)
  * [Installation](#%EF%B8%8F-download--installation)
  * [Advanced Configuration](#%EF%B8%8F-advanced-configuration-reference)
  * [Support](#-support)
* 🇧🇷 **[Documentação em Português](#-português)**
  * [Funcionalidades](#-funcionalidades)
  * [Instalação](#%EF%B8%8F-download-e-instalação)
  * [Configurações Avançadas](#%EF%B8%8F-referência-de-configuração-avançada)
  * [Apoie o Projeto](#-apoio)
* 🇪🇸 **[Documentación en Español](#-español)**
  * [Características](#-características)
  * [Instalación](#%EF%B8%8F-descarga-e-instalación)
  * [Configuración Avanzada](#%EF%B8%8F-referencia-de-configuración-avanzada)
  * [Soporte](#-soporte)

---

## 🇺🇸 English

### Welcome to Fightcade Plus (by Cerberus)

**Fightcade Plus** enhances your Fightcade experience by adding quality-of-life additions, robust tools for streamers, custom ranking integrations, reputation-based filtering, and real-time interface enhancements.

---

### 🚀 Features

#### 🤖 Streamer Toolkit
* **Live Queue System**: Let viewers join your challenge queue directly from the Fightcade chat using a customizable command (default: `!join`).
* **Automated Welcome Messages**: Greet players automatically as they queue up.
* **10-Minute Promo Bot**: Set a custom promotional message (like links to YouTube or Twitch) to be posted automatically in the chat.
* **Streamer Safety Nick**: Set your nick to prevent accidental queue self-joins.

#### 🏆 Live Rankings Synchronization
* **Ranking Badges**: Displays current position ranking badges directly next to player names in the chat logs.
* **Automated Backend Sync**: Periodic background synchronization of global/regional rankings per game (runs every 12 hours).
* **Minimal Rank Threshold**: Filter challenge popups from players below a certain rank (can also be configured to auto-reject).

#### 💬 Interface & Chat Upgrades
* **Visual Additions**: Shows country flags, letter ranks, and direct ping numbers in the chat stream.
* **Online Presence Status**: Sidebar status indicators for Online, Away, and Offline players.
* **Ping Display**: Toggle between detailed numerical text or visual bars in the sidebar.
* **Sidebar Player Search**: Real-time search filter in the sidebar to find players instantly.
* **Chat Controls**: Fast macros to Clear, Pause, or Resume chat rendering.

#### 🛡️ Reputation Shield & Privacy
* **Reputation System (👍/👎)**: Upvote friendly rivals (Favorite) or downvote toxic players.
* **Filter Override**: Favorited players bypass all country/rank block lists.
* **Clean Chat**: Auto-hide chat messages from downvoted players.
* **Challenger Protection**: Instantly hide and silence challenges from downvoted players (can also auto-decline).
* **Blur Mode**: Blur chat histories on screen to protect user privacy during live broadcasts.

#### 🌍 Country Filters
* **Real-time Filter**: Toggle allowed or blocked countries in real-time.
* **Filter Mode**: Hide and silence challenges from filtered countries (with optional auto-decline and chat notices).

#### 🔊 Custom Challenger Audio
* Replace the default Fightcade challenge bell with one of **8 custom high-quality voice/sound lines**:
  1. *Go, new challenger!*
  2. *A challenger awaits!*
  3. *Step up!*
  4. *Challenged!*
  5. *CHAAAALLENGED!*
  6. *Fight awaits!*
  7. *You have been challenged*
  8. *Challenged*
* Includes a **Silent (Mute)** option to block challenge sounds entirely.

---

### 📥 Download & Installation

The recommended method is downloading the pre-configured **Fightcade Plus** bundle. It includes this plugin pre-installed and features **automatic ROM installation** when entering game channels!

📥 **[Download Latest Release](https://github.com/Cerberus-BR/FightcadePlus/releases/latest)**

#### Setup Steps:
1. Extract the downloaded archive folder to a location of your choice.
2. Launch the included Fightcade executable.
3. Open the **Cerberus Settings** panel from the main Fightcade title bar to customize your preferences.

> [!NOTE]
> **Manual Installation**: If you already have a Fightcade client, extract the plugin directory into `resources/app/inject/plugins` within your current Fightcade directory.

---

### ⚙️ Advanced Configuration Reference

Settings are stored in `cerberus_config.json` inside the parent plugins directory. Advanced users can tweak parameters directly:

```json
{
  "language": "en",                     // Interface language ("en" | "pt" | "es")
  "autoJoin": {
    "enabled": true,                    // Auto-enter favorite room on startup
    "channelId": "sfiii3an"             // Target channel ID to auto-join
  },
  "countryFilter": {
    "enabled": false,                   // Toggle country filter shield
    "autoReject": false,                // Decline challenges from blocked countries
    "autoRejectNotify": true            // Send chat notification on auto-reject
  },
  "rankings": {
    "masterEnabled": true,              // Enable rankings integration
    "limit": 500,                       // Number of players to cache (max 500 recommended)
    "country": "",                      // Limit rankings to a country (e.g. "BR")
    "minRankToAccept": 0,               // Filter challenges below: 0=All, 1=E, 2=D, 3=C, 4=B, 5=A, 6=S
    "autoRejectBelowMin": false         // Auto-reject filtered rank challenges
  },
  "chatUserInfo": {
    "masterEnabled": true,              // Enable chat decorations
    "enableStatus": true,               // Show Online/Away status indicators
    "enableFlag": true,                 // Show country flags in chat
    "enableRank": true,                 // Show ranking letters
    "showNumericRanks": true,           // Show ranking badges next to names
    "enablePingText": true,             // Show ping values in chat
    "enablePingBars": true,             // Use bars instead of text
    "replacePingBarWithText": true,     // Replace ping bars with text in sidebar
    "enableReputation": true,           // Enable reputation (Favorite/Downvote)
    "hideNegativeMessages": false,      // Hide messages from downvoted players
    "autoRejectNegative": true,         // Auto-reject challenges from downvoted players
    "unlockColorThemes": true,          // Unlock premium color UI themes
    "blurMode": "none",                 // Chat blur mode ("none" | "all")
    "challengeSound": "native"          // Sound file: "native", "custom1" to "custom8", or "silent"
  },
  "liveQueue": {
    "enabled": false,                   // Enable streamer live queue
    "keyword": "!join",                 // Command viewers type to enter
    "limit": 10,                        // Maximum queue capacity
    "streamerNick": "",                 // Streamer nick (ignores self-join)
    "autoReply": false,                 // Chat notification for new queue entries
    "promoEnabled": false,              // Send promotional messages
    "promoMessage": "[LIVE] Enter queue by typing !join!" // Custom message (supports markdown)
  }
}
```

---

### ☕ Support

Developing and maintaining Fightcade Plus requires substantial time and effort. If this plugin enhances your setup, please consider buying a coffee to support continued updates!

* **Ko-Fi / Support Page**: Check the **About** tab inside the Cerberus Settings panel for active support links.

---

## 🇧🇷 Português

### Bem-vindo ao Fightcade Plus (por Cerberus)

O **Fightcade Plus** eleva sua experiência no Fightcade adicionando melhorias de qualidade de vida, utilitários completos para streamers, rankings atualizados em tempo real, filtros de reputação e modificações na interface.

---

### 🚀 Funcionalidades

#### 🤖 Ferramentas para Streamers
* **Fila de Jogadores (Live Queue)**: Permite que seus espectadores entrem na fila de desafios digitando um comando configurável no chat (padrão: `!join`).
* **Boas-vindas Automáticas**: Envia mensagens de saudação no chat conforme novos jogadores entram na fila.
* **Bot Promocional**: Divulga links ou mensagens personalizadas no chat automaticamente a cada 10 minutos.
* **Filtro de Nick**: Evita que o próprio streamer entre acidentalmente na fila ao interagir no chat.

#### 🏆 Sincronização de Rankings em Tempo Real
* **Emblemas de Posição**: Exibe medalhas numéricas com a colocação exata do ranking diretamente ao lado dos nicks no chat.
* **Sincronização em Background**: Atualiza rankings globais e regionais automaticamente a cada 12 horas.
* **Filtro de Desafios por Patente**: Oculta e silencia oponentes abaixo do Rank desejado, com opção de recusar de forma automática.

#### 💬 Melhorias no Chat e Lista Lateral
* **Detalhamento Visual**: Exibe bandeiras de países, letras de patentes (Ranks) e ping numérico no histórico do chat.
* **Indicadores de Presença**: Status visual claro (Online, Ausente ou Offline) na barra lateral.
* **Customização de Ping**: Escolha entre ping numérico detalhado ou barras gráficas tradicionais.
* **Filtro de Busca Rápida**: Barra de pesquisa integrada na lista de usuários para localizar oponentes em tempo real.
* **Macros de Chat**: Atalhos rápidos para Limpar, Pausar ou Retomar a rolagem do chat.

#### 🛡️ Filtro de Reputação e Privacidade
* **Sistema de Reputação (👍/👎)**: Destaque bons jogadores (Favorito) ou negative usuários indesejados.
* **Ignorar Filtros**: Jogadores marcados como Favorito ignoram qualquer regra de bloqueio de país ou rank.
* **Chat Limpo**: Oculta automaticamente mensagens enviadas por usuários negativados.
* **Filtro de Desafiantes**: Oculta e silencia instantaneamente desafios de jogadores negativados (com opção de auto-recusa).
* **Modo Blur (Privacidade)**: Borra o histórico do chat na tela para proteger a privacidade durante as streams.

#### 🌍 Filtros de Região (País)
* **Filtro em Tempo Real**: Ative ou desative países específicos instantaneamente através de checkboxes na interface.
* **Filtro de Região**: Oculta e silencia desafios de oponentes de regiões bloqueadas (com opção de auto-recusa e aviso no chat).

#### 🔊 Sons de Desafio Customizados
* Substitua o audio de desafio padrão do Fightcade por **8 falas exclusivas e de alta qualidade**:
  1. *Go, new challenger!*
  2. *A challenger awaits!*
  3. *Step up!*
  4. *Challenged!*
  5. *CHAAAALLENGED!*
  6. *Fight awaits!*
  7. *You have been challenged*
  8. *Challenged*
* Inclui a opção **Silencioso (Mute)** para desativar completamente os avisos sonoros de novos desafios.

---

### 📥 Download e Instalação

A maneira recomendada para utilizar é baixando o pacote pré-configurado do **Fightcade Plus**. Ele já vem com o plugin embutido e possui **instalador automático de ROMs** ao entrar nas salas!

📥 **[Baixar a Versão Mais Recente](https://github.com/Cerberus-BR/FightcadePlus/releases/latest)**

#### Passo a Passo:
1. Extraia o conteúdo do arquivo baixado em uma pasta de sua escolha.
2. Inicie o executável do Fightcade contido na pasta.
3. Clique no botão de configurações do **Cerberus Settings** na barra superior da interface para ajustar suas preferências!

> [!NOTE]
> **Instalação Manual**: Caso prefira instalar na sua versão do Fightcade existente, extraia a pasta deste plugin no diretório `resources/app/inject/plugins` da sua instalação.

---

### ⚙️ Referência de Configuração Avançada

Os ajustes são salvos em `cerberus_config.json` no diretório de plugins. Usuários avançados podem editar os parâmetros diretamente:

```json
{
  "language": "pt",                     // Idioma da interface ("en" | "pt" | "es")
  "autoJoin": {
    "enabled": true,                    // Entrar automaticamente na sala favorita ao iniciar
    "channelId": "sfiii3an"             // ID do canal favorito
  },
  "countryFilter": {
    "enabled": false,                   // Ativar filtro de países
    "autoReject": false,                // Recusar desafios de países bloqueados
    "autoRejectNotify": true            // Enviar aviso no chat ao auto-recusar
  },
  "rankings": {
    "masterEnabled": true,              // Ativar módulo de rankings
    "limit": 500,                       // Quantidade limite de jogadores para sincronizar
    "country": "",                      // Limitar ranking para um país específico (ex: "BR")
    "minRankToAccept": 0,               // Filtrar desafios abaixo de: 0=Todos, 1=E, 2=D, 3=C, 4=B, 5=A, 6=S
    "autoRejectBelowMin": false         // Rejeitar automaticamente desafios filtrados por rank
  },
  "chatUserInfo": {
    "masterEnabled": true,              // Ativar decorações no chat
    "enableStatus": true,               // Mostrar status Online/Ausente/Offline
    "enableFlag": true,                 // Exibir bandeiras dos países
    "enableRank": true,                 // Exibir letra do Rank
    "showNumericRanks": true,           // Mostrar medalha de posição no ranking
    "enablePingText": true,             // Mostrar ping em texto no chat
    "enablePingBars": true,             // Mostrar ping em barras
    "replacePingBarWithText": true,     // Substituir barras de ping por texto na barra lateral
    "enableReputation": true,           // Ativar sistema de Favorito/Negativado
    "hideNegativeMessages": false,      // Ocultar mensagens de usuários negativados
    "autoRejectNegative": true,         // Recusar desafios de usuários negativados
    "unlockColorThemes": true,          // Desbloquear temas de cor premium
    "blurMode": "none",                 // Modo blur ("none" | "all")
    "challengeSound": "native"          // Som de desafio: "native", "custom1" até "custom8" ou "silent"
  },
  "liveQueue": {
    "enabled": false,                   // Ativar fila de desafios para streams
    "keyword": "!join",                 // Comando que os espectadores digitam
    "limit": 10,                        // Capacidade máxima da fila
    "streamerNick": "",                 // Nick do streamer para ignorar auto-entrada
    "autoReply": false,                 // Enviar aviso no chat sobre novas entradas
    "promoEnabled": false,              // Enviar mensagens de divulgação periódicas
    "promoMessage": "[LIVE] Entre na fila digitando !join!" // Mensagem de divulgação (suporta markdown)
  }
}
```

---

### ☕ Apoio

Manter o projeto atualizado e adicionar novas melhorias requer tempo e dedicação. Se o Fightcade Plus aprimora as suas jogatinas ou streams, considere apoiar o desenvolvimento!

* **Ko-Fi / Links de Apoio**: Veja a aba **Sobre** no painel de configurações para acessar as opções de contribuição.

---

## 🇪🇸 Español

### Bienvenido a Fightcade Plus (por Cerberus)

**Fightcade Plus** mejora significativamente tu experiencia en Fightcade integrando herramientas de calidad de vida, un completo panel para creadores de contenido (streamers), sincronización de clasificaciones en vivo, filtros avanzados de reputación y personalización de la interfaz.

---

### 🚀 Características

#### 🤖 Herramientas para Streamers
* **Fila de Jugadores en Vivo (Live Queue)**: Permite que tus espectadores se unan a la cola de juego desde el chat usando un comando personalizable (por defecto: `!join`).
* **Mensajes de Bienvenida Automatizados**: Saluda automáticamente a los nuevos jugadores al ingresar a la cola.
* **Bot de Promociones**: Publica un mensaje promocional configurable (como redes sociales o enlaces) automáticamente cada 10 minutos.
* **Nombre de Streamer Protector**: Configura tu nick para evitar unirte a tu propia cola por accidente al chatear.

#### 🏆 Sincronización de Clasificaciones (Rankings)
* **Medallas de Posición**: Muestra medallas visuales con la posición exacta del jugador en el chat, justo al lado de su nick.
* **Sincronización Silenciosa**: Clasificaciones regionales y globales actualizadas automáticamente en segundo plano cada 12 horas.
* **Filtro por Rango**: Oculta y silencia retos de oponentes que no alcancen el rango configurado, con opción de rechazo automático.

#### 💬 Mejoras de Chat y Lista Lateral
* **Información Visual Ampliada**: Muestra la bandera de procedencia, el rango de letra y el ping numérico en el chat en vivo.
* **Estados de Presencia**: Indicadores claros de estado (Online, Ausente, Offline) en la barra de usuarios lateral.
* **Personalización de Ping**: Intercambia la barra de ping estándar de Fightcade por el valor de ping exacto en milisegundos.
* **Buscador en la Barra Lateral**: Filtra oponentes en tiempo real usando el motor de búsqueda directa integrado.
* **Macros de Limpieza**: Botones rápidos en el chat para Limpiar, Pausar o Reanudar el historial de mensajes.

#### 🛡️ Escudo de Reputación y Privacidad
* **Reputación Dinámica (👍/👎)**: Califica positivamente (Favorito) a buenos contrincantes o reporta (Downvote) a usuarios tóxicos.
* **Bypass de Filtros**: Los usuarios marcados como Favorito ignorarán las restricciones de rango o país.
* **Chat Limpio**: Oculta de forma automática los mensajes enviados por usuarios con reputación negativa.
* **Filtro por Reputación**: Oculta y silencia retos de usuarios con reputación negativa (con opción de auto-rechazo).
* **Modo Blur (Privacidad)**: Desenfoca los chats en pantalla para proteger datos privados durante directos.

#### 🌍 Filtro de Países
* **Filtros Interactivos**: Selecciona qué países bloquear o permitir en tiempo real mediante un menú de casillas interactivo.
* **Filtro de Región**: Oculta y silencia retos de países bloqueados (con opción de auto-rechazo y aviso en chat).

#### 🔊 Sonidos de Desafío Personalizados
* Remplaza el sonido nativo de Fightcade con **8 voces exclusivas de alta calidad**:
  1. *Go, new challenger!*
  2. *A challenger awaits!*
  3. *Step up!*
  4. *Challenged!*
  5. *CHAAAALLENGED!*
  6. *Fight awaits!*
  7. *You have been challenged*
  8. *Challenged*
* Incluye un modo **Silencioso (Mute)** para desactivar las alertas auditivas por completo.

---

### 📥 Descarga e Instalación

El método recomendado es descargar el paquete integrado de **Fightcade Plus**. ¡Este instalador ya incluye el plugin preconfigurado y además provee **descarga e instalación automática de ROMs** al entrar a salas de juego!

📥 **[Descargar la Última Versión](https://github.com/Cerberus-BR/FightcadePlus/releases/latest)**

#### Pasos para la configuración:
1. Extrae el archivo comprimido descargado en una ubicación de tu preferencia.
2. Abre el ejecutable de Fightcade dentro de la carpeta extraída.
3. Haz clic en el botón de **Cerberus Settings** ubicado en la barra de herramientas superior para configurar tus opciones.

> [!NOTE]
> **Instalación Manual**: Si prefieres usar tu propia instalación de Fightcade, copia la carpeta de este plugin en el directorio `resources/app/inject/plugins`.

---

### ⚙️ Referencia de Configuración Avanzada

Los ajustes se almacenan en `cerberus_config.json` en el directorio de plugins. Los usuarios avanzados pueden modificarlos manualmente:

```json
{
  "language": "es",                     // Idioma de interfaz ("en" | "pt" | "es")
  "autoJoin": {
    "enabled": true,                    // Autounirse a un canal preferido al iniciar
    "channelId": "sfiii3an"             // ID del canal predeterminado
  },
  "countryFilter": {
    "enabled": false,                   // Habilitar filtros de país
    "autoReject": false,                // Auto-rechazar retos de países bloqueados
    "autoRejectNotify": true            // Enviar aviso en el chat al auto-rechazar
  },
  "rankings": {
    "masterEnabled": true,              // Activar clasificaciones
    "limit": 500,                       // Máximo de registros a almacenar
    "country": "",                      // Filtro regional de clasificación (ej: "BR")
    "minRankToAccept": 0,               // Filtrar desafíos si es menor a: 0=Todos, 1=E, 2=D, 3=C, 4=B, 5=A, 6=S
    "autoRejectBelowMin": false         // Rechazar automáticamente desafíos filtrados por rango
  },
  "chatUserInfo": {
    "masterEnabled": true,              // Decorar chat
    "enableStatus": true,               // Mostrar estado Online/Ausente/Offline
    "enableFlag": true,                 // Mostrar banderas
    "enableRank": true,                 // Mostrar rangos de letras
    "showNumericRanks": true,           // Mostrar posición numérica en el chat
    "enablePingText": true,             // Mostrar ping en texto
    "enablePingBars": true,             // Mostrar ping en barras
    "replacePingBarWithText": true,     // Reemplazar barra de ping lateral por texto
    "enableReputation": true,           // Habilitar reputación (Favorito/Downvote)
    "hideNegativeMessages": false,      // Ocultar mensajes de usuarios reportados
    "autoRejectNegative": true,         // Auto-rechazar retos de usuarios reportados
    "unlockColorThemes": true,          // Desbloquear temas de color premium
    "blurMode": "none",                 // Modo desenfoque ("none" | "all")
    "challengeSound": "native"          // Sonido de reto: "native", "custom1" a "custom8" o "silent"
  },
  "liveQueue": {
    "enabled": false,                   // Activar cola de retos en vivo
    "keyword": "!join",                 // Comando del chat para entrar
    "limit": 10,                        // Límite de participantes
    "streamerNick": "",                 // Nickname del streamer para ignorarse a sí mismo
    "autoReply": false,                 // Anunciar nuevos integrantes en el chat
    "promoEnabled": false,              // Activar bot promocional
    "promoMessage": "[LIVE] ¡Entra a la cola escribiendo !join!" // Mensaje promocional (admite markdown)
  }
}
```

---

### ☕ Soporte

Mantener este mod actualizado requiere tiempo, servidores y café. Si Fightcade Plus mejora tus combates o directos de streaming, ¡considera donar y apoyar su desarrollo!

* **Ko-Fi / Soporte**: Visita la pestaña **Acerca de** (About) en el panel de control de Cerberus para acceder a las opciones de contribución activas.
