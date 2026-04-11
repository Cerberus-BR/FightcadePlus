const fs = require('fs');
const path = require('path');
const fsPromises = fs.promises;

// ==================== PERSISTÊNCIA SEGURA ====================
async function atomicWriteJSON(filePath, data) {
    const tmpPath = filePath + '.tmp';
    const bakPath = filePath + '.bak';
    const json = JSON.stringify(data, null, 2);
    try {
        await fsPromises.writeFile(tmpPath, json, 'utf8');
        try { await fsPromises.copyFile(filePath, bakPath); } catch(e) { /* first write, no existing file */ }
        await fsPromises.rename(tmpPath, filePath);
    } catch (e) {
        console.error('[Cerberus] Atomic write failed:', path.basename(filePath), e.message);
        try { fs.writeFileSync(filePath, json, 'utf8'); } catch(e2) { /* silent fallback */ }
    }
}

function safeLoadJSON(filePath, defaults) {
    const bakPath = filePath + '.bak';
    try {
        if (fs.existsSync(filePath)) {
            return JSON.parse(fs.readFileSync(filePath, 'utf8'));
        }
    } catch (e) {
        console.warn(`[Cerberus] Corrupted: ${path.basename(filePath)}, trying backup...`);
    }
    try {
        if (fs.existsSync(bakPath)) {
            console.log(`[Cerberus] Restored from backup: ${path.basename(bakPath)}`);
            return JSON.parse(fs.readFileSync(bakPath, 'utf8'));
        }
    } catch (e) {
        console.warn(`[Cerberus] Backup also corrupted: ${path.basename(bakPath)}`);
    }
    return typeof defaults === 'function' ? defaults() : (defaults || null);
}

// ==================== DICIONÁRIO DE IDIOMAS (i18n) ====================
const Locales = {
    en: {
        btnTitle: "Fightcade Plus Settings",
        panelTitle: "Cerberus Settings",
        tabs: { countries: "🌍 Countries", settings: "⚙️ Settings", about: "ℹ️ About" },
        countries: {
            alert: "⚠️ Filter is applied in real-time.<br>Sidebar adjusts automatically.",
            search: "🔍 Search country...",
            allowAll: "✓ All",
            clearAll: "✗ None"
        },
        settings: {
            global: "Global",
            autoJoin: "Auto Join Channel",
            language: "Language",
            filters: "Filters",
            enableFilter: "Enable Country Filter",
            chatVisual: "Chat Visuals",
            showStatus: "Show Status (Online/Away/Offline)",
            showFlags: "Show Flags",
            showRanks: "Show Rank Letters",
            showNumericRanks: "Show Ranking Position Badge",
            showPingBars: "Show Ping Bars",
            showPingText: "Show Ping as Text",
            replacePingBar: "Show Ping as Text in Sidebar",
            reputation: "Reputation",
            enableRep: "Reputation System (👍/👎)",
            hideNeg: "Hide Messages from Negative Users",
            privacy: "Privacy",
            blurMode: "Blur Mode (Privacy)",
            blurNone: "Disabled",
            blurIndiv: "Individual",
            blurAll: "All",
            rankingsApi: "Rankings (Online Sync)",
            rankLimit: "Top Limit (⚠️ >500 is slower)",
            rankCountry: "Country Filter (ISO 2-letters, e.g., BR)",
            extras: "Extras",
            unlockThemes: "Unlock Color Themes",
            liveQueue: "Live Queue (Streamers)",
            queueEnable: "Enable Live Queue Module",
            queueKeyword: "Keyword (e.g. !join)",
            queueLimit: "Queue Limit",
            queueStreamer: "Streamer Nick (to Exclude)",
            queueReply: "Auto-reply in Chat (every 15s)",
            queuePromoEnable: "Enable 10-Min Promo Bot",
            queuePromo: "Live Promo Msg"
        },
        about: {
            title: "Fightcade Plus 1.9.0",
            subtitle: "By Cerberus",
            catBot: "🤖 Streamer Tools",
            feat1: "Live Player Queue via chat command (!join)",
            feat2: "Automated welcome message for new players in queue",
            feat3: "Promotional bot with custom messages (every 10min)",
            catRank: "🏆 Rankings",
            feat4: "Ranking position badge next to player names",
            feat5: "Sync rankings per game with country filter",
            catChat: "💬 Chat & Sidebar",
            feat6: "Country flags, rank letters, and ping info on chat",
            feat7: "Online/Away/Offline status indicators",
            feat8: "Ping displayed as text or bars (configurable)",
            catRep: "🛡️ Reputation & Privacy",
            feat9: "Player reputation system (Favorite / Downvote)",
            feat10: "Hide messages from downvoted users",
            feat11: "Blur mode for stream privacy",
            catFilter: "🌍 Filters & Customization",
            feat12: "Country-based player filter (real-time)",
            feat13: "Premium color themes unlock",
            feat14: "Auto-join channel on startup",
            feat15: "Multi-language support (EN/PT/ES)",
            note: "Safe auto-save engine with crash protection.",
            updateBtn: "🔄 Check for Updates",
            updateAvailable: "⚠️ Update Available: "
        },
        rep: {
            like: "Favorite (Ignores Filters)",
            dislike: "Downvote",
            clear: "Clear Reputation",
            block: "Block (Fightcade)",
            unblock: "Unblock (Fightcade)"
        },
        motd: {
            clearChat: "CLEAR CHAT",
            queueTitle: "PLAYERS QUEUE",
            updateAvail: "Update Available:"
        },
        sync: {
            rankingsBtn: "Sync Rankings",
            wait30: "Wait 30 minutes",
            clickCancel: "Click to cancel",
            liveOn: "🟢 LIVE ON",
            liveOff: "🔴 LIVE OFF",
            confirmClear: "Are you sure you want to clear the entire queue?"
        },
        queue: {
            title: "Live Queue",
            addBtn: "Add",
            clearBtn: "Clear All",
            empty: "Queue is empty.",
            inputPh: "Player nickname...",
            mark: "Toggle Played",
            remove: "Remove Player",
            up: "Move Up",
            down: "Move Down"
        }
    },
    pt: {
        btnTitle: "Configurações Fightcade Plus",
        panelTitle: "Cerberus Settings",
        tabs: { countries: "🌍 Países", settings: "⚙️ Ajustes", about: "ℹ️ Sobre" },
        countries: {
            alert: "⚠️ O filtro é aplicado em tempo real.<br>A lista lateral ajusta-se sem precisar reiniciar.",
            search: "🔍 Buscar país...",
            allowAll: "✓ Todos",
            clearAll: "✗ Nenhum"
        },
        settings: {
            global: "Global",
            autoJoin: "Entrar Automaticamente no Canal",
            language: "Idioma",
            filters: "Filtros",
            enableFilter: "Ativar Filtro de Países",
            chatVisual: "Chat Visual",
            showStatus: "Mostrar Status (Online/Ausente/Offline)",
            showFlags: "Mostrar Bandeiras",
            showRanks: "Mostrar Letra de Rank",
            showNumericRanks: "Mostrar Posição no Ranking",
            showPingBars: "Mostrar Barras de Ping",
            showPingText: "Mostrar Ping em Texto",
            replacePingBar: "Mostrar Ping como Texto na Lista Lateral",
            reputation: "Reputação",
            enableRep: "Sistema de Reputação (👍/👎)",
            hideNeg: "Ocultar mensagens de usuários negativados",
            privacy: "Privacidade",
            blurMode: "Modo Blur (Privacidade)",
            blurNone: "Desativado",
            blurIndiv: "Individual",
            blurAll: "Tudo",
            rankingsApi: "Rankings (Sincronização Online)",
            rankLimit: "Top Ranking (⚠️ >500 demora)",
            rankCountry: "Filtrar por País (Ex: BR, vazio=Todos)",
            extras: "Extras",
            unlockThemes: "Desbloquear Temas de Cor",
            liveQueue: "Fila de Live (Streamers)",
            queueEnable: "Ativar Módulo para Streamers",
            queueKeyword: "Palavra-chave (ex: !join)",
            queueLimit: "Limite de Jogadores",
            queueStreamer: "Seu Nick do Fightcade (Exceção)",
            queueReply: "Resposta Automática da Fila",
            queuePromoEnable: "Ativar Bot Divulgação (a cada 10min)",
            queuePromo: "Mensagem do Bot (a cada 10min)"
        },
        about: {
            title: "Fightcade Plus 1.9.0",
            subtitle: "By Cerberus",
            catBot: "🤖 Ferramentas para Streamers",
            feat1: "Fila de jogadores via comando no chat (!join)",
            feat2: "Mensagem automática de boas-vindas ao entrar na fila",
            feat3: "Bot promocional com mensagem personalizada (a cada 10min)",
            catRank: "🏆 Rankings",
            feat4: "Exibir posição no ranking ao lado do nome",
            feat5: "Sincronização de rankings por jogo com filtro de país",
            catChat: "💬 Chat e Lista Lateral",
            feat6: "Bandeiras, letras de rank e ping no chat",
            feat7: "Indicadores de status (Online/Ausente/Offline)",
            feat8: "Ping exibido como texto ou barras (configurável)",
            catRep: "🛡️ Reputação e Privacidade",
            feat9: "Sistema de reputação (Destacar / Negativar)",
            feat10: "Ocultar mensagens de usuários negativados",
            feat11: "Modo blur para privacidade em streams",
            catFilter: "🌍 Filtros e Personalização",
            feat12: "Filtro de jogadores por país (tempo real)",
            feat13: "Desbloqueio de temas de cores premium",
            feat14: "Auto-entrar no canal ao iniciar",
            feat15: "Suporte multi-idioma (EN/PT/ES)",
            note: "Motor de auto-save seguro com proteção contra falhas.",
            updateBtn: "🔄 Verificar Atualizações",
            updateAvailable: "⚠️ Atualização Disponível: "
        },
        rep: {
            like: "Destacar (Ignora Filtros)",
            dislike: "Negativar",
            clear: "Limpar Reputação",
            block: "Bloquear (Fightcade)",
            unblock: "Desbloquear (Fightcade)"
        },
        motd: {
            clearChat: "LIMPAR CHAT",
            queueTitle: "FILA DE JOGADORES",
            updateAvail: "Atualização Disponível:"
        },
        sync: {
            rankingsBtn: "Sincronizar Rankings",
            wait30: "Aguarde 30 minutos",
            clickCancel: "Clique para cancelar",
            liveOn: "🟢 LIVE ON",
            liveOff: "🔴 LIVE OFF",
            confirmClear: "Tem certeza que deseja limpar toda a fila?"
        },
        queue: {
            title: "Fila da Live",
            addBtn: "Adicionar",
            clearBtn: "Limpar Fila",
            empty: "A fila está vazia.",
            inputPh: "Nick do jogador...",
            mark: "Alternar Jogado",
            remove: "Remover Jogador",
            up: "Subir na Fila",
            down: "Descer na Fila"
        }
    },
    es: {
        btnTitle: "Ajustes de Fightcade Plus",
        panelTitle: "Cerberus Settings",
        tabs: { countries: "🌍 Países", settings: "⚙️ Ajustes", about: "ℹ️ Acerca de" },
        countries: {
            alert: "⚠️ El filtro se aplica en tiempo real.<br>La lista lateral se ajusta automáticamente.",
            search: "🔍 Buscar país...",
            allowAll: "✓ Todos",
            clearAll: "✗ Ninguno"
        },
        settings: {
            global: "Global",
            autoJoin: "Entrar Automáticamente al Canal",
            language: "Idioma",
            filters: "Filtros",
            enableFilter: "Activar Filtro de Países",
            chatVisual: "Visual del Chat",
            showStatus: "Mostrar Estado (Online/Ausente/Offline)",
            showFlags: "Mostrar Banderas",
            showRanks: "Mostrar Letra de Rango",
            showNumericRanks: "Mostrar Badge de Posición en el Ranking",
            showPingBars: "Mostrar Barras de Ping",
            showPingText: "Mostrar Ping en Texto",
            replacePingBar: "Mostrar Ping como Texto en la Lista Lateral",
            reputation: "Reputación",
            enableRep: "Sistema de Reputación (👍/👎)",
            hideNeg: "Ocultar mensajes de usuarios negativos",
            privacy: "Privacidad",
            blurMode: "Modo Blur (Privacidad)",
            blurNone: "Desactivado",
            blurIndiv: "Individual",
            blurAll: "Todo",
            rankingsApi: "Rankings (Sincronización Online)",
            rankLimit: "Límite del Top (⚠️ >500 demora)",
            rankCountry: "Filtrar por País (Ej: BR, vacío=Todos)",
            extras: "Extras",
            unlockThemes: "Desbloquear Temas de Color",
            liveQueue: "Cola de Live (Streamers)",
            queueEnable: "Activar Módulo de Cola",
            queueKeyword: "Palabra clave (ej: !join)",
            queueLimit: "Límite de Jugadores",
            queueStreamer: "Nick del Streamer (Excepción)",
            queueReply: "Respuesta Automática en el Chat (cada 15s)",
            queuePromoEnable: "Activar Bot Promocional (10min)",
            queuePromo: "Msg Promo"
        },
        about: {
            title: "Fightcade Plus 1.9.0",
            subtitle: "By Cerberus",
            catBot: "🤖 Herramientas para Streamers",
            feat1: "Cola de jugadores vía comando en el chat (!join)",
            feat2: "Mensaje automático de bienvenida al entrar en la cola",
            feat3: "Bot promocional con mensaje personalizado (cada 10min)",
            catRank: "🏆 Rankings",
            feat4: "Badge de posición en el ranking junto al nombre",
            feat5: "Sincronización de rankings por juego con filtro de país",
            catChat: "💬 Chat y Lista Lateral",
            feat6: "Banderas, letras de rango y ping en el chat",
            feat7: "Indicadores de estado (Online/Ausente/Offline)",
            feat8: "Ping mostrado como texto o barras (configurable)",
            catRep: "🛡️ Reputación y Privacidad",
            feat9: "Sistema de reputación (Destacar / Negativar)",
            feat10: "Ocultar mensajes de usuarios negativos",
            feat11: "Modo blur para privacidad en streams",
            catFilter: "🌍 Filtros y Personalización",
            feat12: "Filtro de jugadores por país (tiempo real)",
            feat13: "Desbloqueo de temas de colores premium",
            feat14: "Auto-entrar al canal al iniciar",
            feat15: "Soporte multi-idioma (EN/PT/ES)",
            note: "Motor de auto-guardado seguro con protección ante fallos.",
            updateBtn: "🔄 Buscar Actualizaciones",
            updateAvailable: "⚠️ Actualización Disponible: "
        },
        rep: {
            like: "Destacar (Ignora Filtros)",
            dislike: "Negativar",
            clear: "Limpiar Reputación",
            block: "Bloquear (Fightcade)",
            unblock: "Desbloquear (Fightcade)"
        },
        motd: {
            clearChat: "LIMPIAR CHAT",
            queueTitle: "COLA DE JUGADORES",
            updateAvail: "Actualización Disponible:"
        },
        sync: {
            rankingsBtn: "Sincronizar Rankings",
            wait30: "Espere 30 minutos",
            clickCancel: "Haga clic para cancelar",
            liveOn: "🟢 LIVE ON",
            liveOff: "🔴 LIVE OFF",
            confirmClear: "¿Está seguro de que desea vaciar toda la cola?"
        },
        queue: {
            title: "Cola del Live",
            addBtn: "Añadir",
            clearBtn: "Limpiar Cola",
            empty: "La cola está vacía.",
            inputPh: "Nick del jugador...",
            mark: "Alternar Jugado",
            remove: "Eliminar Jugador",
            up: "Subir",
            down: "Bajar"
        }
    }
};

const AVAILABLE_COUNTRIES = {
    'BR': 'Brazil', 'AR': 'Argentina', 'BO': 'Bolivia', 'UY': 'Uruguay',
    'CL': 'Chile', 'PE': 'Peru', 'CO': 'Colombia', 'MX': 'Mexico',
    'US': 'United States', 'CA': 'Canada', 'JP': 'Japan', 'KR': 'South Korea',
    'CN': 'China', 'FR': 'France', 'DE': 'Germany', 'GB': 'United Kingdom',
    'IT': 'Italy', 'ES': 'Spain', 'PT': 'Portugal', 'RU': 'Russia',
    'AU': 'Australia', 'NZ': 'New Zealand', 'IN': 'India', 'TH': 'Thailand',
    'PH': 'Philippines', 'ID': 'Indonesia', 'MY': 'Malaysia', 'SG': 'Singapore',
    'VN': 'Vietnam', 'TR': 'Turkey', 'SA': 'Saudi Arabia', 'AE': 'UAE',
    'ZA': 'South Africa', 'EG': 'Egypt', 'NG': 'Nigeria', 'MA': 'Morocco',
    'DZ': 'Algeria', 'PK': 'Pakistan', 'HK': 'Hong Kong'
};

const COUNTRY_NAME_TO_CODE = Object.fromEntries(
    Object.entries(AVAILABLE_COUNTRIES).map(([code, name]) => [name, code])
);

// ==================== SELETORES DOM CENTRALIZADOS ====================
const SELECTORS = {
    rankedWrapper: '.channelInfo .rankedWrapper',
    romName: '.channelInfo .name[title="Rom name"]',
    gameLink: '.channelInfo a.link[href*="/game/"]',
    chatInput: '.chatInput input.input',
    usersOnlineTitle: '.usersOnlineTitle',
    chatContent: '.chatContent',
    chatWrapper: '.chatWrapper',
    userItem: '.userItem',
    playerName: '.playerName',
    matchItem: '.matchesList .matchItem',
    motdWrapper: '.messageWrapper.motd',
    ignoredTitle: '.usersIgnoredTitle',
};

const _selectorMissCounts = {};
let _healthCheckCounter = 0;

function safeQuery(key, context) {
    context = context || document;
    const selector = SELECTORS[key] || key;
    const el = context.querySelector(selector);
    if (SELECTORS[key]) {
        if (!el) _selectorMissCounts[key] = (_selectorMissCounts[key] || 0) + 1;
        else _selectorMissCounts[key] = 0;
    }
    return el;
}

function domHealthCheck() {
    _healthCheckCounter++;
    if (_healthCheckCounter % 30 !== 0) return;
    const critical = ['chatContent', 'usersOnlineTitle'];
    const broken = critical.filter(k => (_selectorMissCounts[k] || 0) > 10);
    if (broken.length > 0 && !window.CerberusState._healthWarned) {
        console.warn('⚠️ [Cerberus] DOM selectors failing:', broken.join(', '), '— Plugin may need update.');
        window.CerberusState._healthWarned = true;
    }
}

// ==================== CONFIGURAÇÃO INICIAL ====================
const defaultConfig = {
    language: 'en',
    autoJoin: { enabled: true, channelId: '' },
    countryFilter: { enabled: false },
    rankings: { limit: 500, country: '' },
    chatUserInfo: {
        enableStatus: true,
        enableFlag: true,
        enableRank: true,
        showNumericRanks: true, 
        enablePingText: true,
        enablePingBars: false, 
        replacePingBarWithText: false,
        enableReputation: true,
        hideNegativeMessages: true, 
        unlockColorThemes: true, 
        blurMode: 'none'
    },
    liveQueue: {
        enabled: false, 
        keyword: '!join', 
        limit: 10, 
        streamerNick: '', 
        autoReply: false, 
        promoEnabled: false,
        // Uso de string dupla \\n para forçar os caracteres a renderizarem visivelmente no painel HTML
        promoMessage: '`[AO VIVO]` *Venham jogar e participar da live!*\nDigite a `palavra-chave` no chat para entrar na fila.\nAssista em: https://www.youtube.com/@Cerberus-BR'
    }
};

// Renomeação Crítica: Sandbox de Configuração isolado do sistema base
const dataPath = path.join(__dirname, 'cerberus_data.json');
const configPath = path.join(__dirname, 'cerberus_config.json');
const rankingsPath = path.join(__dirname, 'cerberus_rankings.json');

const CURRENT_VERSION = "1.9.0";
let runtimeConfig = null;
let fullConfigCache = null;

// Gestão de Estado Centralizada (RAM Only)
window.CerberusState = {
    liveMasterOn: false,
    promoBotInterval: null,
    replyQueue: [],
    menuIsHovered: false,
    menuHideTimeout: null,
    menuShowTimeout: null,
    menuCleanupInterval: null,
    _healthWarned: false,
};

module.exports = (FCADE) => {
    try { runPlugin(FCADE); } catch (e) { console.error("Cerberus Fatal Error:", e); }
};

// ==================== EXTRATOR DE GAMEID (via DOM) ====================
function isRankedChannel() {
    return !!document.querySelector('.channelInfo .rankedWrapper');
}

function getActiveGameId(FCADE) {
    try {
        // Rankings só existem em canais rankeados
        if (!isRankedChannel()) return null;

        // Estratégia 1: Elemento com title="Rom name" na channelInfo
        const romNameEl = document.querySelector('.channelInfo .name[title="Rom name"]');
        if (romNameEl?.textContent?.trim()) {
            return romNameEl.textContent.trim();
        }

        // Estratégia 2: Extrair do link de replays/rankings
        const gameLink = document.querySelector('.channelInfo a.link[href*="/game/"]');
        if (gameLink) {
            const match = gameLink.href.match(/\/game\/([^/]+)\//);
            if (match?.[1]) return match[1];
        }

        return null;
    } catch(e) {
        console.debug('[Cerberus] getActiveGameId error:', e);
        return null;
    }
}

// ==================== AUDIO SYNTH ====================
let _popAudioCtx = null;
function playPopSound() {
    try {
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        if (!AudioContextClass) return;
        if (!_popAudioCtx) _popAudioCtx = new AudioContextClass();
        const ctx = _popAudioCtx;
        if (ctx.state === 'suspended') ctx.resume();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.1);
        
        gain.gain.setValueAtTime(0.3, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
        
        osc.connect(gain);
        gain.connect(ctx.destination);
        
        osc.start();
        osc.stop(ctx.currentTime + 0.1);
    } catch(e) { console.debug('[Cerberus] Audio error:', e.message); }
}

// ==================== GESTÃO DE RANKINGS ====================
const RankCache = {
    data: {}, 
    isSyncing: false,
    _abortController: null,

    load() {
        const data = safeLoadJSON(rankingsPath, null);
        this.data = data || {};
    },
    save() {
        atomicWriteJSON(rankingsPath, this.data)
            .catch(e => console.debug('[Cerberus] Rank save error:', e));
    },
    cancelSync() {
        if (this._abortController) {
            this._abortController.abort();
        }
    },
    _evictOldEntries(maxGames) {
        maxGames = maxGames || 5;
        const entries = Object.entries(this.data);
        if (entries.length <= maxGames) return;
        entries.sort(function(a, b) { return (b[1].lastUpdate || 0) - (a[1].lastUpdate || 0); });
        entries.slice(maxGames).forEach(function(entry) { delete this.data[entry[0]]; }.bind(this));
    },
    getRank(gameId, username) {
        if (!gameId || !username || !this.data[gameId]) return null;
        return this.data[gameId].players[username.toLowerCase()] || null;
    },
    async syncRankings(gameId) {
        if (!gameId) return;
        
        const lastSync = this.data[gameId]?.lastUpdate || 0;
        const cooldownMs = 30 * 60 * 1000;
        
        if (Date.now() - lastSync < cooldownMs) {
            const remaining = Math.ceil((cooldownMs - (Date.now() - lastSync)) / 60000);
            console.warn(`⏳ [Cerberus Rank] Bloqueio de segurança ativo. Tente novamente em ${remaining} minutos.`);
            return;
        }

        if (this.isSyncing) return;
        this.isSyncing = true;

        this._abortController = new AbortController();
        const signal = this._abortController.signal;

        const btn = document.getElementById('cerberusSyncBtn');
        if (btn) {
            btn.classList.add('syncing');
            btn.innerHTML = '<span class="cerb-spin-icon"></span><span class="cerb-sync-progress">0/' + (ConfigManager.getSetting('rankings.limit') || 100) + '</span>';
            btn.title = t('sync.clickCancel');
        }

        const initialGameId = gameId;
        const targetLimit = ConfigManager.getSetting('rankings.limit') || 100;
        const targetCountry = (ConfigManager.getSetting('rankings.country') || '').toUpperCase().trim();
        
        console.log(`🔄 [Cerberus Rank] Fetching Top ${targetLimit} for ${initialGameId} ${targetCountry ? '('+targetCountry+')' : '(Global)'}...`);
        
        const limitPerPage = 100;
        let offset = 0;
        let validPlayersFound = 0;
        let pagesFetched = 0;
        const maxPagesSafeguard = 50; 
        const newCache = {};

        while (validPlayersFound < targetLimit) {
            try {
                if (signal.aborted) { console.log('🛑 [Cerberus Rank] Sync cancelled.'); break; }

                const currentGameId = getActiveGameId(window.CerberusFCADE);
                if (currentGameId !== initialGameId) { console.log('🛑 [Cerberus Rank] Channel changed, aborting.'); break; }

                if (pagesFetched >= maxPagesSafeguard) {
                    console.warn(`🛑 [Cerberus Rank] Safety limit reached.`);
                    break;
                }

                const res = await fetch('https://web.fightcade.com/api/', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    signal,
                    body: JSON.stringify({
                        req: "searchrankings",
                        gameid: initialGameId,
                        limit: limitPerPage,
                        offset: offset,
                        byElo: true,
                        recent: true
                    })
                });

                if (!res.ok) {
                    console.warn(`⚠️ [Cerberus Rank] HTTP ${res.status}. Parando extração.`);
                    break;
                }

                const data = await res.json();
                const players = data?.results?.results || [];
                
                if (players.length === 0) break;
                pagesFetched++;

                players.forEach((p) => {
                    if (validPlayersFound >= targetLimit) return;
                    if (!p.name) return;

                    let shouldAdd = false;
                    if (targetCountry !== '') {
                        if (p.country && p.country.iso_code && p.country.iso_code.toUpperCase() === targetCountry) {
                            shouldAdd = true;
                        }
                    } else {
                        shouldAdd = true;
                    }

                    if (shouldAdd) {
                        validPlayersFound++;
                        newCache[p.name.toLowerCase()] = validPlayersFound; 
                    }
                });

                if (players.length < limitPerPage) break; 
                if (validPlayersFound >= targetLimit) break; 

                offset += limitPerPage;
                if (btn) {
                    const p = btn.querySelector('.cerb-sync-progress');
                    if (p) p.textContent = validPlayersFound + '/' + targetLimit;
                }

                await new Promise(function(resolve) {
                    const timeout = setTimeout(resolve, 3000);
                    signal.addEventListener('abort', function() { clearTimeout(timeout); resolve(); }, { once: true });
                });

            } catch (e) {
                if (e.name === 'AbortError') { console.log('🛑 [Cerberus Rank] Sync aborted.'); break; }
                console.error('❌ [Cerberus Rank] API error:', e.message);
                break;
            }
        }

        if (Object.keys(newCache).length > 0 && !signal.aborted) {
            this.data[initialGameId] = {
                lastUpdate: Date.now(),
                players: newCache,
                filter: { country: targetCountry, limit: targetLimit }
            };
            this._evictOldEntries();
            this.save();
            console.log(`✅ [Cerberus Rank] Done. ${Object.keys(newCache).length} players saved for ${initialGameId}.`);
        }

        this.isSyncing = false;
        this._abortController = null;

        if (btn) {
            btn.classList.remove('syncing');
            btn.innerHTML = '🔄';
            const lastSyncNow = this.data[initialGameId]?.lastUpdate || 0;
            if (Date.now() - lastSyncNow < cooldownMs) {
                btn.style.opacity = '0.3';
                btn.style.cursor = 'not-allowed';
                btn.title = t('sync.wait30');
            } else {
                btn.style.opacity = '1';
                btn.style.cursor = 'pointer';
                btn.title = t('sync.rankingsBtn');
            }
        }

        if (window.CerberusFCADE && runtimeConfig && !signal.aborted) {
            const activeGame = getActiveGameId(window.CerberusFCADE);
            const cfg = runtimeConfig.chatUserInfo;
            if (cfg && cfg.showNumericRanks && activeGame) {
                document.querySelectorAll('.message[data-cerberus-processed]').forEach(msg => {
                    const author = msg.querySelector('span.author');
                    if (!author) return;
                    author.querySelectorAll('.cerb-rank-badge').forEach(el => el.remove());
                    const userKey = normalizeUsername(author.textContent);
                    if (!userKey) return;
                    const numericRank = RankCache.getRank(activeGame, userKey);
                    if (numericRank !== null) {
                        const badge = document.createElement('span');
                        badge.className = 'cerb-rank-badge';
                        Object.assign(badge.style, {
                            fontSize: '12px', fontWeight: 'normal', color: '#ffd700',
                            backgroundColor: 'transparent', border: 'none',
                            padding: '0', marginRight: '5px',
                            verticalAlign: 'middle', display: 'inline-block'
                        });
                        badge.textContent = `🏅${numericRank}`;
                        author.appendChild(badge);
                    }
                });
            }
            updateSidebar(window.CerberusFCADE, runtimeConfig);
        }
    }
};

// ==================== GESTÃO DE ESTADO (CerberusData) ====================
function invalidateCountryFilterCache() {
    unfilterAllMessages();
    unfilterAllUsers();
    if (window.CerberusFCADE && runtimeConfig) {
        updateChat(window.CerberusFCADE, runtimeConfig);
        updateSidebar(window.CerberusFCADE, runtimeConfig);
    }
}

let dataSaveTimeout = null;

// Garantir save síncrono ao fechar o app + cleanup de recursos
window.addEventListener('beforeunload', () => {
    clearTimeout(dataSaveTimeout);
    clearTimeout(configSaveTimeout);

    // Cancel ongoing sync
    if (RankCache._abortController) RankCache._abortController.abort();

    // Clean up intervals
    if (mainLoopInterval) clearInterval(mainLoopInterval);
    if (replyQueueInterval) clearInterval(replyQueueInterval);
    if (window.CerberusState.promoBotInterval) clearInterval(window.CerberusState.promoBotInterval);
    if (window.CerberusState.menuCleanupInterval) clearInterval(window.CerberusState.menuCleanupInterval);

    // Clean up observer
    if (chatObserver) { chatObserver.disconnect(); chatObserver = null; }

    // Clean up AudioContext
    if (_popAudioCtx) { try { _popAudioCtx.close(); } catch(e) {} }

    // Sync save data (last resort)
    try {
        const dataObj = {
            allowedCountries: CerberusData.allowedCountries,
            positive: [...CerberusData.positive],
            negative: [...CerberusData.negative],
            selectedTheme: CerberusData.selectedTheme,
            lastUpdateCheck: CerberusData.lastUpdateCheck,
            latestVersion: CerberusData.latestVersion,
            liveQueue: CerberusData.liveQueue,
            queueTimestamp: CerberusData.queueTimestamp,
            lastUpdated: new Date().toISOString()
        };
        try { fs.copyFileSync(dataPath, dataPath + '.bak'); } catch(e) {}
        fs.writeFileSync(dataPath, JSON.stringify(dataObj, null, 2), 'utf8');
    } catch(e) { console.debug('[Cerberus] beforeunload data save error:', e); }
    try {
        if (runtimeConfig) {
            if (!fullConfigCache) fullConfigCache = {};
            fullConfigCache.cerberus = runtimeConfig;
            try { fs.copyFileSync(configPath, configPath + '.bak'); } catch(e) {}
            fs.writeFileSync(configPath, JSON.stringify(fullConfigCache, null, 2), 'utf8');
        }
    } catch(e) { console.debug('[Cerberus] beforeunload config save error:', e); }
});
const CerberusData = {
    allowedCountries: Object.keys(AVAILABLE_COUNTRIES), 
    positive: new Set(),
    negative: new Set(),
    selectedTheme: 'bretema',
    lastUpdateCheck: 0,
    latestVersion: null,
    liveQueue: [], 
    queueTimestamp: 0, 

    load() {
        const data = safeLoadJSON(dataPath, null);
        if (data) {
            this.allowedCountries = data.allowedCountries || Object.keys(AVAILABLE_COUNTRIES);
            this.positive = new Set(data.positive || []);
            this.negative = new Set(data.negative || []);
            this.selectedTheme = data.selectedTheme || 'bretema';
            this.lastUpdateCheck = data.lastUpdateCheck || 0;
            this.latestVersion = data.latestVersion || null;
            
            this.queueTimestamp = data.queueTimestamp || 0;
            if (Date.now() - this.queueTimestamp > 43200000) {
                this.liveQueue = []; 
                this.queueTimestamp = Date.now();
            } else {
                this.liveQueue = data.liveQueue || [];
            }
        }
    },
    save() {
        clearTimeout(dataSaveTimeout);
        dataSaveTimeout = setTimeout(() => {
            atomicWriteJSON(dataPath, {
                allowedCountries: this.allowedCountries,
                positive: [...this.positive],
                negative: [...this.negative],
                selectedTheme: this.selectedTheme,
                lastUpdateCheck: this.lastUpdateCheck,
                latestVersion: this.latestVersion,
                liveQueue: this.liveQueue,
                queueTimestamp: this.queueTimestamp,
                lastUpdated: new Date().toISOString()
            }).catch(e => console.debug('[Cerberus] Data save error:', e));
        }, 100);
    },

    addQueue(playerName) {
        if (!playerName || playerName.trim() === '') return false;
        const name = playerName.trim();
        const limit = ConfigManager.getSetting('liveQueue.limit') || 20;
        
        if (this.liveQueue.length >= limit) return false;
        if (this.liveQueue.some(q => q.name.toLowerCase() === name.toLowerCase())) return false;
        if (this.isNegative(name)) return false; 
        
        this.liveQueue.push({ name: name, played: false });
        this.queueTimestamp = Date.now();
        this.save();
        renderQueueList();
        return true;
    },
    removeQueue(index) {
        if (index < 0 || index >= this.liveQueue.length) return;
        this.liveQueue.splice(index, 1);
        this.queueTimestamp = Date.now();
        this.save();
        renderQueueList();
    },
    togglePlayedQueue(index) {
        if (this.liveQueue[index]) {
            this.liveQueue[index].played = !this.liveQueue[index].played;
            if (this.liveQueue[index].played) {
                const item = this.liveQueue.splice(index, 1)[0];
                this.liveQueue.push(item);
            }
            this.queueTimestamp = Date.now();
            this.save();
            renderQueueList();
        }
    },
    moveQueue(index, direction) {
        if (index < 0 || index >= this.liveQueue.length) return;
        const newIndex = index + direction;
        if (newIndex < 0 || newIndex >= this.liveQueue.length) return;
        const temp = this.liveQueue[index];
        this.liveQueue[index] = this.liveQueue[newIndex];
        this.liveQueue[newIndex] = temp;
        this.queueTimestamp = Date.now();
        this.save();
        renderQueueList();
    },
    clearQueue() { 
        this.liveQueue = []; 
        this.queueTimestamp = Date.now();
        this.save(); 
        renderQueueList(); 
    },
    addCountry(code) {
        if (!code) return;
        code = code.toUpperCase();
        if (!this.allowedCountries.includes(code)) {
            this.allowedCountries.push(code);
            this.save();
            invalidateCountryFilterCache();
        }
    },
    removeCountry(code) {
        if (!code) return;
        this.allowedCountries = this.allowedCountries.filter(c => c !== code.toUpperCase());
        this.save();
        invalidateCountryFilterCache();
    },
    isCountryAllowed(code) {
        if (!code) return true;
        return this.allowedCountries.includes(code.toUpperCase());
    },
    allowAllCountries() { this.allowedCountries = Object.keys(AVAILABLE_COUNTRIES); this.save(); invalidateCountryFilterCache(); },
    clearAllCountries() { this.allowedCountries = []; this.save(); invalidateCountryFilterCache(); },
    markPositive(userId) { this.positive.add(userId); this.negative.delete(userId); this.save(); },
    markNegative(userId) { this.negative.add(userId); this.positive.delete(userId); this.save(); },
    clearReputation(userId) { this.positive.delete(userId); this.negative.delete(userId); this.save(); },
    isPositive(userId) { return this.positive.has(userId); },
    isNegative(userId) { return this.negative.has(userId); },
    setTheme(theme) { this.selectedTheme = theme; this.save(); }
};

let configSaveTimeout = null;
const ConfigManager = {
    loadConfig() {
        const fullConfig = safeLoadJSON(configPath, null);
        if (fullConfig) {
            fullConfigCache = fullConfig;
            runtimeConfig = { ...defaultConfig, ...(fullConfig.cerberus || {}) };
            runtimeConfig.chatUserInfo = { ...defaultConfig.chatUserInfo, ...(runtimeConfig.chatUserInfo || {}) };
            runtimeConfig.liveQueue = { ...defaultConfig.liveQueue, ...(runtimeConfig.liveQueue || {}) };
            runtimeConfig.rankings = { ...defaultConfig.rankings, ...(runtimeConfig.rankings || {}) };
        } else { 
            runtimeConfig = JSON.parse(JSON.stringify(defaultConfig));
            fullConfigCache = { cerberus: runtimeConfig };
            this.saveConfig(); 
        }
    },
    saveConfig() {
        clearTimeout(configSaveTimeout);
        configSaveTimeout = setTimeout(() => {
            if (!fullConfigCache) fullConfigCache = {};
            fullConfigCache.cerberus = runtimeConfig;
            atomicWriteJSON(configPath, fullConfigCache)
                .catch(e => console.error('❌ [Cerberus] Config save failed:', e));
        }, 100);
    },
    updateSetting(pathStr, value) {
        const keys = pathStr.split('.');
        let current = runtimeConfig;
        for (let i = 0; i < keys.length - 1; i++) {
            if (!current[keys[i]]) current[keys[i]] = {};
            current = current[keys[i]];
        }
        current[keys[keys.length - 1]] = value;
        this.saveConfig();

        if (pathStr.startsWith('chatUserInfo.') && pathStr !== 'chatUserInfo.replacePingBarWithText') {
            document.querySelectorAll('.message').forEach(msg => {
                msg.querySelectorAll('.cerberus-injected-status, .cerberus-injected-flag, .cerberus-injected-rank, .cerberus-injected-pingbar, .cerberus-injected-pingtext, .cerb-rank-badge').forEach(el => el.remove());
                msg.removeAttribute('data-cerberus-processed');
            });
        }
        
        if (pathStr === 'countryFilter.enabled' || pathStr === 'chatUserInfo.hideNegativeMessages') {
            invalidateCountryFilterCache();
        }
        
        if (pathStr === 'liveQueue.enabled') {
            injectUIEnhancements();
        }
    },
    getSetting(pathStr) {
        const keys = pathStr.split('.');
        let current = runtimeConfig;
        for (const key of keys) {
            if (current === undefined || current === null) return undefined;
            current = current[key];
        }
        return current;
    }
};

function isNewerVersion(latest, current) {
    if (!latest || !current) return false;
    const l = latest.replace('v', '').split('.').map(Number);
    const c = current.replace('v', '').split('.').map(Number);
    for (let i = 0; i < Math.max(l.length, c.length); i++) {
        const lVal = l[i] || 0;
        const cVal = c[i] || 0;
        if (lVal > cVal) return true;
        if (lVal < cVal) return false;
    }
    return false;
}

async function checkForUpdates() {
    const now = Date.now();
    const ONE_DAY = 24 * 60 * 60 * 1000;
    if (!CerberusData.lastUpdateCheck || (now - CerberusData.lastUpdateCheck > ONE_DAY)) {
        try {
            const response = await fetch('https://api.github.com/repos/Cerberus-BR/FightcadePlus/releases/latest');
            if (response.ok) {
                const data = await response.json();
                if (data && data.tag_name) {
                    CerberusData.latestVersion = data.tag_name;
                    CerberusData.lastUpdateCheck = now;
                    CerberusData.save();
                }
            }
        } catch (e) { console.debug('[Cerberus] Update check error:', e); }
    }
}

function t(keyPath) {
    const lang = ConfigManager.getSetting('language') || 'en';
    const keys = keyPath.split('.');
    let result = Locales[lang];
    for (let k of keys) { if (result === undefined) break; result = result[k]; }
    return result || keyPath;
}

window.changeCerberusLanguage = function(lang) {
    ConfigManager.updateSetting('language', lang);
    const panel = document.getElementById('cerberusPanel');
    if (panel) {
        const oldTop = panel.style.top;
        const oldLeft = panel.style.left;
        const oldTransform = panel.style.transform;
        const activeTab = panel.querySelector('.tab.active')?.dataset.tab || 'settings';
        
        panel.remove();
        createControlPanel();
        
        const newPanel = document.getElementById('cerberusPanel');
        newPanel.style.top = oldTop;
        newPanel.style.left = oldLeft;
        newPanel.style.transform = oldTransform;
        newPanel.style.display = 'flex';
        
        const newTabBtn = newPanel.querySelector(`.tab[data-tab="${activeTab}"]`);
        if (newTabBtn) newTabBtn.click();
    }
    
    const menu = document.getElementById('cerbGlobalMenu');
    if (menu) menu.remove();
    injectGlobalMenu();
    injectHeaderButtons(window.CerberusFCADE);
    
    const queuePanel = document.getElementById('cerberusQueueWindow');
    if (queuePanel) {
        queuePanel.remove();
        if (ConfigManager.getSetting('liveQueue.enabled')) {
            createQueuePanel();
        }
    }
};

function normalizeUsername(username) { return !username ? '' : username.replace(/\s+/g, ' ').trim(); }
function extractMinPing(title) {
    if (!title) return null;
    const match = title.match(/(\d+)~(\d+)/);
    if (match) return parseInt(match[1]);
    const single = title.match(/(\d+)/);
    return single ? parseInt(single[1]) : null;
}
function getMinPing(userFound) { return extractMinPing(userFound?.pingTitle); }

function unfilterAllMessages() {
    document.querySelectorAll('[data-cerberus-hidden]').forEach(msg => {
        const wrapper = msg.closest('.messageWrapper');
        if (wrapper) wrapper.style.display = '';
        msg.style.display = '';
        msg.removeAttribute('data-cerberus-hidden');
    });
}

function unfilterAllUsers() {
    document.querySelectorAll('[data-country-blocked]').forEach(el => {
        el.style.display = '';
        el.removeAttribute('data-country-blocked');
    });
}

function executeChatCommand(command) {
    const inputEl = document.querySelector('.chatInput input.input');
    if (!inputEl) return;
    const nativeSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set;
    nativeSetter.call(inputEl, command);
    inputEl.dispatchEvent(new Event('input', { bubbles: true }));
    inputEl.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', code: 'Enter', keyCode: 13, which: 13, bubbles: true }));
}

// MACRO EXECUTOR
function executeChatMacro(lines) {
    const inputEl = document.querySelector('.chatInput input.input');
    if (!inputEl || !lines || lines.length === 0) return;
    
    const nativeSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set;
    const currentVal = inputEl.value; 

    let i = 0;
    function sendNext() {
        if (i < lines.length) {
            nativeSetter.call(inputEl, lines[i]);
            inputEl.dispatchEvent(new Event('input', { bubbles: true }));
            inputEl.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', keyCode: 13, bubbles: true }));
            i++;
            setTimeout(sendNext, 250); 
        } else {
            setTimeout(() => {
                nativeSetter.call(inputEl, currentVal);
                inputEl.dispatchEvent(new Event('input', { bubbles: true }));
            }, 50);
        }
    }
    sendNext();
}

// ==================== AUTO JOIN ====================
const connectToChannelWhenAvailable = (FCADE, autoJoinConfig) => {
    let attempts = 0;
    const checkInterval = setInterval(() => {
        attempts++;
        if (attempts > 120) { clearInterval(checkInterval); return; } // timeout 60s
        if (FCADE.initializingApp === false) {
            clearInterval(checkInterval);
            if (autoJoinConfig?.channelId) {
                FCADE.selectChannel(autoJoinConfig.channelId);
            } else {
                const gameChannels = FCADE.channels.filter(ch => 'gameid' in ch);
                if (gameChannels.length > 0) {
                    FCADE.selectChannel(gameChannels[0].id);
                }
            }
        }
    }, 500);
};

// ==================== PLUGIN MAIN LOOP ====================
let mainLoopInterval = null;
let replyQueueInterval = null;

const runPlugin = (FCADE) => {
    console.log(`🐺 Cerberus v${CURRENT_VERSION} (Fightcade Plus) Inicializado`);
    window.CerberusFCADE = FCADE; 

    CerberusData.load();
    ConfigManager.loadConfig();
    RankCache.load();
    window.CerberusState.replyQueue = [];

    checkForUpdates();

    if (runtimeConfig.autoJoin?.enabled !== false) {
        connectToChannelWhenAvailable(FCADE, runtimeConfig.autoJoin);
    }

    injectStyles();
    injectGlobalMenu();
    createControlPanel();
    
    if (runtimeConfig.liveQueue?.enabled === true) {
        createQueuePanel();
    }

    if (mainLoopInterval) clearInterval(mainLoopInterval);
    mainLoopInterval = setInterval(() => {
        try {
            injectHeaderButtons(FCADE);
            injectUIEnhancements(); 
            maintainChatObserver(FCADE, runtimeConfig.chatUserInfo);
            updateSidebar(FCADE, runtimeConfig);
            updateChat(FCADE, runtimeConfig);
            domHealthCheck();

            if (runtimeConfig.chatUserInfo?.unlockColorThemes !== false) {
                unlockColorThemes();
            }
        } catch (err) { console.debug('[Cerberus] Main loop error:', err); }
    }, 1000);
    
    // BOT AGREGADOR DE FILA (!join)
    if (replyQueueInterval) clearInterval(replyQueueInterval);
    replyQueueInterval = setInterval(() => {
        if (window.CerberusState.liveMasterOn && window.CerberusState.replyQueue.length > 0 && ConfigManager.getSetting('liveQueue.autoReply')) {
            const names = window.CerberusState.replyQueue.join(', ');
            window.CerberusState.replyQueue = []; 
            
            const msg1 = `\`[Fila] Bem-vindo(s): ${names}\``;
            let queueStr = CerberusData.liveQueue.filter(p => !p.played).map((p, i) => `${i+1}. ${p.name}`).join(', ');
            
            if (queueStr) {
                const msg2 = `*Fila atual:* ${queueStr}`;
                executeChatMacro([msg1, msg2]); 
            } else {
                executeChatMacro([msg1]);
            }
        } else {
            window.CerberusState.replyQueue = []; 
        }
    }, 15000);

    setTimeout(() => applyTheme(CerberusData.selectedTheme), 2500);

    // Safety cleanup: menu flutuante que fica preso visível
    window.CerberusState.menuCleanupInterval = setInterval(() => {
        const menu = document.getElementById('cerbGlobalMenu');
        if (menu && menu.classList.contains('visible') && !window.CerberusState.menuIsHovered) {
            menu.classList.remove('visible');
        }
    }, 3000);
};

// ==================== BOT PROMOCIONAL (10 MIN) ====================
function triggerPromoBot() {
    if (!window.CerberusState.liveMasterOn) return; 
    if (!ConfigManager.getSetting('liveQueue.promoEnabled')) return; 
    
    const msg = ConfigManager.getSetting('liveQueue.promoMessage');
    if (!msg || msg.trim() === '') return;
    
    const lines = msg.split(/\\n|\n/);
    executeChatMacro(lines);
}

// ==================== HEADER BUTTONS & SYNC ====================
function injectHeaderButtons(FCADE) {
    const headerTitle = document.querySelector('.usersOnlineTitle');
    if (!headerTitle) return;

    headerTitle.style.display = 'flex';
    headerTitle.style.alignItems = 'center';

    if (!headerTitle.querySelector('#cerberusBtn')) {
        const btn = document.createElement('span');
        btn.id = 'cerberusBtn';
        btn.textContent = '⚙️';
        btn.title = t('btnTitle');
        Object.assign(btn.style, { cursor: 'pointer', fontSize: '16px', marginLeft: 'auto', marginRight: '8px', opacity: '0.8' });
        btn.onclick = (e) => {
            e.stopPropagation();
            const panel = document.getElementById('cerberusPanel');
            if (panel) panel.style.display = panel.style.display === 'none' ? 'flex' : 'none';
        };
        headerTitle.appendChild(btn);
    }

    const showRankBtn = ConfigManager.getSetting('chatUserInfo.showNumericRanks') === true;
    const existingSyncBtn = headerTitle.querySelector('#cerberusSyncBtn');
    
    const gameId = getActiveGameId(FCADE);
    const lastSync = RankCache.data[gameId]?.lastUpdate || 0;
    const isLocked = (Date.now() - lastSync < 30 * 60 * 1000);

    if (showRankBtn) {
        if (!existingSyncBtn) {
            const syncBtn = document.createElement('button');
            syncBtn.id = 'cerberusSyncBtn';
            syncBtn.textContent = '🔄';
            
            Object.assign(syncBtn.style, {
                cursor: 'pointer', fontSize: '15px', background: 'transparent', 
                border: 'none', borderRadius: '50%',
                width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#fff', outline: 'none', padding: '0', marginRight: '5px',
                transition: 'background 0.2s'
            });

            if (isLocked) {
                syncBtn.style.opacity = '0.3';
                syncBtn.style.cursor = 'not-allowed';
                syncBtn.title = t('sync.wait30');
            } else {
                syncBtn.title = t('sync.rankingsBtn');
            }

            syncBtn.onclick = (e) => {
                e.stopPropagation();
                if (RankCache.isSyncing) {
                    RankCache.cancelSync();
                } else {
                    const currentGameId = getActiveGameId(FCADE);
                    if (currentGameId) RankCache.syncRankings(currentGameId);
                }
            };
            headerTitle.insertBefore(syncBtn, headerTitle.querySelector('#cerberusBtn'));
        } else {
            if (isLocked && !RankCache.isSyncing) {
                existingSyncBtn.style.opacity = '0.3';
                existingSyncBtn.style.cursor = 'not-allowed';
                existingSyncBtn.title = t('sync.wait30');
            } else if (!isLocked && !RankCache.isSyncing) {
                existingSyncBtn.style.opacity = '1';
                existingSyncBtn.style.cursor = 'pointer';
                existingSyncBtn.title = t('sync.rankingsBtn');
            }
        }
    } else if (existingSyncBtn) {
        existingSyncBtn.remove();
    }
}

// ==================== UI / FAB INJECTION ====================
function injectUIEnhancements() {
    const chatWrapper = document.querySelector('.chatWrapper');
    if (!chatWrapper) return;

    if (!document.querySelector('.cerb-clear-chat-fab')) {
        const clearBtn = document.createElement('button');
        clearBtn.className = 'cerb-clear-chat-fab';
        clearBtn.innerHTML = t('motd.clearChat');
        clearBtn.onclick = () => executeChatCommand('/clear');
        chatWrapper.appendChild(clearBtn);
    }

    const qEnabled = ConfigManager.getSetting('liveQueue.enabled') === true;
    const existingFab = document.querySelector('.cerb-queue-fab');
    const existingWindow = document.getElementById('cerberusQueueWindow');

    if (qEnabled) {
        if (!existingFab) {
            const queueBtn = document.createElement('button');
            queueBtn.className = 'cerb-queue-fab';
            queueBtn.innerHTML = t('motd.queueTitle');
            queueBtn.onclick = () => {
                const panel = document.getElementById('cerberusQueueWindow');
                if (panel) {
                    panel.style.display = panel.style.display === 'none' ? 'flex' : 'none';
                    if (panel.style.display === 'flex') renderQueueList();
                }
            };
            chatWrapper.appendChild(queueBtn);
        }
        createQueuePanel();
    } else {
        if (existingFab) existingFab.remove();
        if (existingWindow) existingWindow.remove();
    }

    const motdWrapper = document.querySelector('.messageWrapper.motd');
    if (motdWrapper && CerberusData.latestVersion && isNewerVersion(CerberusData.latestVersion, CURRENT_VERSION)) {
        if (motdWrapper.dataset.cerbUpdateAdded !== "true") {
            const updateNotice = document.createElement('div');
            updateNotice.className = 'cerb-motd-update-notice';
            updateNotice.innerHTML = `🐺 <b>${t('motd.updateAvail')} ${CerberusData.latestVersion}</b> <a href="https://github.com/Cerberus-BR/FightcadePlus/releases/latest" target="_blank" style="color: #4ade80; text-decoration: underline; margin-left: 10px;">Download</a>`;
            const blocksContainer = motdWrapper.querySelector('.blocksContainer');
            if (blocksContainer) blocksContainer.appendChild(updateNotice);
            else motdWrapper.appendChild(updateNotice);
            motdWrapper.dataset.cerbUpdateAdded = "true";
        }
    }
}

// ==================== LIVE QUEUE PANEL ====================
function createQueuePanel() {
    if (document.getElementById('cerberusQueueWindow')) return;

    const panel = document.createElement('div');
    panel.id = 'cerberusQueueWindow';
    panel.style.display = 'none';

    panel.innerHTML = `
        <div class="q-header" id="cerberusQueueHeader">
            <span class="q-title">📝 ${t('queue.title')} <small id="cerbQueueCount">(0)</small></span>
            <button class="q-close" id="cerbQueueCloseBtn">×</button>
        </div>
        <div class="q-add-box">
            <input type="text" id="cerbQueueInput" placeholder="${t('queue.inputPh')}">
            <button id="cerbQueueAddBtn">${t('queue.addBtn')}</button>
        </div>
        <div class="q-list" id="cerbQueueList"></div>
        <div class="q-footer" style="display:flex; justify-content:space-between;">
            <button id="cerbLiveMasterBtn" class="q-live-btn off">${t('sync.liveOff')}</button>
            <button id="cerbQueueClearBtn" class="q-clear-btn">🧹 ${t('queue.clearBtn')}</button>
        </div>
    `;

    document.body.appendChild(panel);
    makeDraggable(panel, 'cerberusQueueHeader');

    const masterBtn = document.getElementById('cerbLiveMasterBtn');
    if (window.CerberusState.liveMasterOn) {
        masterBtn.className = 'q-live-btn on';
        masterBtn.innerHTML = t('sync.liveOn');
    }

    masterBtn.addEventListener('click', (e) => {
        const btn = e.currentTarget;
        if (btn.classList.contains('off')) {
            window.CerberusState.liveMasterOn = true;
            btn.className = 'q-live-btn on';
            btn.innerHTML = t('sync.liveOn');
            triggerPromoBot(); 
            window.CerberusState.promoBotInterval = setInterval(triggerPromoBot, 10 * 60 * 1000);
        } else {
            window.CerberusState.liveMasterOn = false;
            btn.className = 'q-live-btn off';
            btn.innerHTML = t('sync.liveOff');
            clearInterval(window.CerberusState.promoBotInterval);
        }
    });

    document.getElementById('cerbQueueCloseBtn').addEventListener('click', () => {
        document.getElementById('cerberusQueueWindow').style.display = 'none';
    });

    document.getElementById('cerbQueueAddBtn').addEventListener('click', () => {
        const input = document.getElementById('cerbQueueInput');
        CerberusData.addQueue(input.value);
        input.value = '';
    });

    document.getElementById('cerbQueueInput').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            CerberusData.addQueue(e.target.value);
            e.target.value = '';
        }
    });

    document.getElementById('cerbQueueClearBtn').addEventListener('click', () => {
        if (CerberusData.liveQueue.length === 0 || confirm(t('sync.confirmClear'))) {
            CerberusData.clearQueue();
        }
    });

    renderQueueList();
}

function renderQueueList() {
    const listEl = document.getElementById('cerbQueueList');
    const countEl = document.getElementById('cerbQueueCount');
    if (!listEl || !countEl) return;

    listEl.innerHTML = '';
    const limit = ConfigManager.getSetting('liveQueue.limit') || 20;
    countEl.innerText = `(${CerberusData.liveQueue.length}/${limit})`;

    if (CerberusData.liveQueue.length === 0) {
        listEl.innerHTML = `<div class="q-empty">${t('queue.empty')}</div>`;
        return;
    }

    CerberusData.liveQueue.forEach((player, index) => {
        const item = document.createElement('div');
        item.className = 'q-item';
        
        const nameSpan = document.createElement('span');
        nameSpan.className = 'q-name';
        if (player.played) nameSpan.classList.add('played');
        nameSpan.innerText = `${index + 1}. ${player.name}`;

        const controls = document.createElement('div');
        controls.className = 'q-controls';

        const btnPlay = document.createElement('button');
        btnPlay.innerHTML = player.played ? '↩️' : '✅';
        btnPlay.title = t('queue.mark');
        btnPlay.onclick = () => CerberusData.togglePlayedQueue(index);

        const btnUp = document.createElement('button');
        btnUp.innerHTML = '⬆️';
        btnUp.title = t('queue.up');
        btnUp.disabled = index === 0;
        if (!btnUp.disabled) btnUp.onclick = () => CerberusData.moveQueue(index, -1);

        const btnDown = document.createElement('button');
        btnDown.innerHTML = '⬇️';
        btnDown.title = t('queue.down');
        btnDown.disabled = index === CerberusData.liveQueue.length - 1;
        if (!btnDown.disabled) btnDown.onclick = () => CerberusData.moveQueue(index, 1);

        const btnDel = document.createElement('button');
        btnDel.innerHTML = '❌';
        btnDel.title = t('queue.remove');
        btnDel.className = 'danger';
        btnDel.onclick = () => CerberusData.removeQueue(index);

        controls.appendChild(btnPlay);
        controls.appendChild(btnUp);
        controls.appendChild(btnDown);
        controls.appendChild(btnDel);

        item.appendChild(nameSpan);
        item.appendChild(controls);
        listEl.appendChild(item);
    });
}

// ==================== MUTATION OBSERVER DO CHAT ====================
let currentChatContent = null;
let chatObserver = null;

function maintainChatObserver(FCADE, cfg) {
    const chatContent = document.querySelector('.chatContent');
    if (chatContent && chatContent !== currentChatContent) {
        if (chatObserver) chatObserver.disconnect();
        
        currentChatContent = chatContent;
        chatObserver = new MutationObserver((mutations) => {
            let hasValidNewNodes = false;
            for (let mut of mutations) {
                if (mut.addedNodes.length > 0) {
                    for (let node of mut.addedNodes) {
                        if (node.nodeType === 1 && node.classList && node.classList.contains('cerberus-injected-flag')) continue;
                        hasValidNewNodes = true;
                        break;
                    }
                }
                if (hasValidNewNodes) break;
            }
            if (hasValidNewNodes) {
                try { updateChat(FCADE, cfg); } catch (err) { console.debug('[Cerberus] Chat observer error:', err); }
            }
        });
        
        chatObserver.observe(chatContent, { childList: true, subtree: true });
        
        try { updateChat(FCADE, cfg); } catch (e) { console.debug('[Cerberus] Initial chat update error:', e); }
    }
}

// ==================== UI INJECTION ====================
function injectGlobalMenu() {
    if (document.getElementById('cerbGlobalMenu')) return;
    
    const menu = document.createElement('div');
    menu.id = 'cerbGlobalMenu';
    menu.innerHTML = `
        <span id="cerbBtnQueueAdd" title="${t('queue.addBtn')}" style="font-size:16px;">➕</span>
        <div class="cerb-menu-divider" id="cerbDivQueue"></div>
        <span id="cerbBtnLike" title="${t('rep.like')}">👍</span>
        <span id="cerbBtnDislike" title="${t('rep.dislike')}">👎</span>
        <span id="cerbBtnClear" title="${t('rep.clear')}">🧹</span>
        <div class="cerb-menu-divider"></div>
        <span id="cerbBtnBlock" title="${t('rep.block')}">🚫</span>
        <span id="cerbBtnUnblock" title="${t('rep.unblock')}">🟢</span>
    `;
    document.body.appendChild(menu);

    menu.addEventListener('mouseenter', () => {
        window.CerberusState.menuIsHovered = true;
        clearTimeout(window.CerberusState.menuHideTimeout);
        clearTimeout(window.CerberusState.menuShowTimeout); 
    });
    
    menu.addEventListener('mouseleave', () => {
        window.CerberusState.menuIsHovered = false;
        window.CerberusState.menuHideTimeout = setTimeout(() => {
            menu.classList.remove('visible');
        }, 200);
    });

    const action = (fn) => {
        const userKey = menu.dataset.user;
        if (!userKey || userKey === '<offline>' || userKey.startsWith('<')) return;
        fn(userKey);
        if (menu.dataset.type === 'match') {
            const playerNames = document.querySelectorAll('.playerName');
            playerNames.forEach(el => {
                if (normalizeUsername(el.textContent) === userKey) {
                    applyReputationStyleMatch(el, userKey);
                }
            });
        }
        const hideNeg = menu.dataset.hideNegative === 'true';
        reprocessUserMessages(userKey, hideNeg);
    };

    document.getElementById('cerbBtnQueueAdd').onclick = () => {
        const userKey = menu.dataset.user;
        if (userKey && userKey !== '<offline>' && !userKey.startsWith('<')) {
            CerberusData.addQueue(userKey);
            menu.classList.remove('visible');
        }
    };

    document.getElementById('cerbBtnLike').onclick = () => action(k => CerberusData.markPositive(k));
    document.getElementById('cerbBtnDislike').onclick = () => action(k => CerberusData.markNegative(k));
    document.getElementById('cerbBtnClear').onclick = () => action(k => CerberusData.clearReputation(k));
    
    document.getElementById('cerbBtnBlock').onclick = () => {
        const userKey = menu.dataset.user;
        if (userKey && userKey !== '<offline>' && !userKey.startsWith('<')) {
            executeChatCommand(`/ignore ${userKey}`);
            
            let attempts = 0;
            const scrollInterval = setInterval(() => {
                attempts++;
                const blockedEl = Array.from(document.querySelectorAll('.usersIgnoredList .userItem')).find(el => el.dataset.currentUser === userKey);
                if (blockedEl) {
                    const sidebarWrapper = document.querySelector('.usersListWrapper');
                    if (sidebarWrapper) sidebarWrapper.scrollTo({ top: sidebarWrapper.scrollHeight, behavior: 'smooth' });
                    blockedEl.classList.remove('cerberus-anim-block-pulse'); 
                    void blockedEl.offsetWidth; 
                    blockedEl.classList.add('cerberus-anim-block-pulse');
                    setTimeout(() => { if (blockedEl) blockedEl.classList.remove('cerberus-anim-block-pulse'); }, 4500);
                    clearInterval(scrollInterval);
                } else if (attempts >= 30) {
                    clearInterval(scrollInterval); 
                }
            }, 100);
        }
        menu.classList.remove('visible');
    };
    
    document.getElementById('cerbBtnUnblock').onclick = () => {
        const userKey = menu.dataset.user;
        if (userKey && userKey !== '<offline>' && !userKey.startsWith('<')) executeChatCommand(`/unignore ${userKey}`);
        menu.classList.remove('visible');
    };
}

// ==================== CORE PROCESSING (CHAT & SIDEBAR) ====================

const updateChat = (FCADE, configFull) => {
    document.querySelectorAll('.messageWrapper:not(.motd) .cerb-motd-update-notice').forEach(el => el.remove());
    document.querySelectorAll('.messageWrapper .cerb-clear-chat-btn').forEach(el => el.remove());

    const cfg = configFull.chatUserInfo;
    const filterCfg = configFull.countryFilter;
    const queueCfg = configFull.liveQueue;
    const globalUsers = FCADE.globalUsers;
    if (!globalUsers || !cfg) return;

    const chatContent = document.querySelector('.chatContent');
    if (chatContent) {
        if (cfg.blurMode === 'all') chatContent.classList.add('blur-all');
        else chatContent.classList.remove('blur-all');
    }

    const activeGameId = getActiveGameId(FCADE);
    const newMessages = document.querySelectorAll('.message:not([data-cerberus-processed])');

    newMessages.forEach(msg => {
        try {
            const isChat = msg.classList.contains('chat');
            
            if (!isChat) {
                msg.dataset.cerberusProcessed = "true";
                return;
            }

            const author = msg.querySelector('span.author');
            if (!author) {
                msg.dataset.cerberusProcessed = "true";
                return;
            }
            
            let userKey = normalizeUsername(author.textContent);
            if (!userKey) {
                msg.dataset.cerberusProcessed = "true";
                return;
            } 

            // Limpeza Estrita
            author.parentElement.querySelectorAll('.cerberus-injected-status').forEach(el => el.remove());
            author.querySelectorAll('.cerberus-injected-flag, .cerberus-injected-rank, .cerberus-injected-pingbar, .cerberus-injected-pingtext, .cerb-rank-badge').forEach(el => el.remove());

            if (queueCfg && queueCfg.enabled && queueCfg.keyword && window.CerberusState.liveMasterOn) {
                let msgText = '';
                msg.querySelectorAll('.blocksContainer .blocks .regular').forEach(span => {
                    msgText += span.textContent;
                });
                msgText = msgText.trim().toLowerCase();
                
                const streamerNick = queueCfg.streamerNick || '';
                
                if (msgText === queueCfg.keyword.toLowerCase() && userKey.toLowerCase() !== streamerNick.toLowerCase()) {
                    const wasAdded = CerberusData.addQueue(userKey);
                    if (wasAdded) {
                        playPopSound();
                        if (!window.CerberusState.replyQueue) window.CerberusState.replyQueue = [];
                        window.CerberusState.replyQueue.push(userKey);
                    }
                }
            }

            const user = globalUsers[userKey];
            let userCountry = null;
            if (user) userCountry = user.country?.iso_code?.toUpperCase();
            
            const activeChannelId = FCADE.activeChannelId;
            const usersList = FCADE.$refs[activeChannelId]?.[0]?.$refs?.usersList;
            const userFound = usersList?.$children?.find(ch => ch?.user?.id === userKey);
            const minPingVal = getMinPing(userFound);

            let statusState = 'offline';
            if (user && user.away === false) statusState = 'online';
            else if (user && user.away === true) statusState = 'away';

            // RANK NUMÉRICO INJEÇÃO
            if (cfg.showNumericRanks && activeGameId) {
                const numericRank = RankCache.getRank(activeGameId, userKey);
                if (numericRank !== null) {
                    const badge = document.createElement('span');
                    badge.className = 'cerb-rank-badge';
                    Object.assign(badge.style, {
                        fontSize: '12px', fontWeight: 'normal', color: '#ffd700',
                        backgroundColor: 'transparent', border: 'none',
                        padding: '0', marginRight: '5px',
                        verticalAlign: 'middle', display: 'inline-block'
                    });
                    badge.textContent = `🏅${numericRank}`;
                    author.appendChild(badge);
                }
            }

            const elements = {
                status: cfg.enableStatus ? createStatusElement(statusState) : null,
                flag: (cfg.enableFlag && user?.country) ? createFlagElement(user.country) : null,
                rank: (cfg.enableRank && userFound?.rankSrc) ? createRankElement(userFound.rankSrc, userFound.rankTitle) : null,
                pingBar: (cfg.enablePingBars && userFound?.pingSrc) ? createPingElement(userFound.pingSrc, userFound.pingTitle) : null,
                pingText: (cfg.enablePingText && minPingVal !== null) ? createPingTextElement(minPingVal) : null
            };

            if (cfg.enableReputation && userKey !== '<offline>' && !userKey.startsWith('<')) {
                applyReputationStyleChat(author, msg, userKey, false);
                addReputationControlsToElement(author, msg, userKey, 'chat', cfg.hideNegativeMessages);
            }

            if (elements.status) author.parentElement.insertBefore(elements.status, author);
            if (elements.flag) author.appendChild(elements.flag);
            if (elements.rank) author.appendChild(elements.rank);
            if (elements.pingBar) author.appendChild(elements.pingBar);
            if (elements.pingText) author.appendChild(elements.pingText);

            if (cfg.blurMode === 'individual') msg.classList.add('blur-individual');
            
            msg.dataset.cerberusProcessed = "true";
            if (userKey) msg.dataset.cerberusUser = userKey;
            if (userCountry) msg.dataset.cerberusCountry = userCountry; 

        } catch (e) {
            console.debug('[Cerberus] Chat message error:', e);
            msg.dataset.cerberusProcessed = "true"; 
        }
    });

    const countryFilterEnabled = filterCfg?.enabled === true;
    const hideNeg = cfg?.hideNegativeMessages;

    if (!countryFilterEnabled && !hideNeg) {
        unfilterAllMessages();
        return; 
    }

    const messagesToFilter = document.querySelectorAll('.message:not([data-cerberus-hidden="true"]):not([data-cerberus-hidden="false"])');
    messagesToFilter.forEach(msg => {
        const userKey = msg.dataset.cerberusUser;
        const userCountry = msg.dataset.cerberusCountry;
        
        if (!userKey || userKey === '<offline>' || userKey.startsWith('<')) {
            msg.dataset.cerberusHidden = "false";
            return;
        }

        let shouldHide = false;
        if (hideNeg && CerberusData.isNegative(userKey)) {
            shouldHide = true;
        } else if (countryFilterEnabled && userCountry) {
            if (!CerberusData.isCountryAllowed(userCountry) && !CerberusData.isPositive(userKey)) {
                shouldHide = true;
            }
        }

        const wrapper = msg.closest('.messageWrapper');
        if (shouldHide) {
            if (wrapper) wrapper.style.display = 'none';
            msg.style.display = 'none';
            msg.dataset.cerberusHidden = "true";
        } else {
            if (wrapper) wrapper.style.display = '';
            msg.style.display = '';
            msg.dataset.cerberusHidden = "false";
        }
    });
};

const updateSidebar = (FCADE, configFull) => {
    const globalUsers = FCADE.globalUsers;
    if (!globalUsers) return;
    
    const cfg = configFull.chatUserInfo;
    const countryFilterEnabled = configFull.countryFilter?.enabled === true;
    const activeGameId = getActiveGameId(FCADE);

    if (cfg?.replacePingBarWithText) {
        document.body.classList.add('cerb-hide-sidebar-ping');
    } else {
        document.body.classList.remove('cerb-hide-sidebar-ping');
    }
    
    const ignoredTitleNodes = document.querySelectorAll('.usersIgnoredTitle');
    ignoredTitleNodes.forEach(titleEl => {
        titleEl.childNodes.forEach(node => {
            if (node.nodeType === Node.TEXT_NODE && node.nodeValue.includes('Ignored')) {
                node.nodeValue = node.nodeValue.replace('Ignored', 'Blocked');
            }
        });
    });

    document.querySelectorAll('.userItem').forEach(item => {
        try {
            const playerNameEl = item.querySelector('.playerName');
            if (!playerNameEl) return;

            const userKey = normalizeUsername(playerNameEl.textContent);
            if (!userKey) return; 
            
            item.dataset.currentUser = userKey;

            // INJEÇÃO SIDEBAR: Rank Numérico
            if (cfg.showNumericRanks && activeGameId) {
                const numericRank = RankCache.getRank(activeGameId, userKey);
                let badge = item.querySelector('.cerb-rank-badge');

                if (numericRank !== null) {
                    if (!badge) {
                        badge = document.createElement('span');
                        badge.className = 'cerb-rank-badge';
                        Object.assign(badge.style, {
                            fontSize: '12px', fontWeight: 'normal', color: '#ffd700',
                            backgroundColor: 'transparent', border: 'none',
                            padding: '0', marginRight: '5px',
                            verticalAlign: 'middle', display: 'inline-block'
                        });
                        
                        const rankEl = item.querySelector('.rankWrapper, .rank'); 
                        if (rankEl && rankEl.parentNode) {
                            rankEl.parentNode.insertBefore(badge, rankEl);
                        } else {
                            const pingWrapper = item.querySelector('.pingWrapper');
                            if (pingWrapper && pingWrapper.parentNode) {
                                pingWrapper.parentNode.insertBefore(badge, pingWrapper);
                            }
                        }
                    }
                    badge.textContent = `🏅${numericRank}`;
                } else if (badge) {
                    badge.remove(); 
                }
            } else {
                const badge = item.querySelector('.cerb-rank-badge');
                if (badge) badge.remove();
            }
            
            if (cfg?.enableReputation) {
                applyReputationStyleList(playerNameEl, item, userKey);
                addReputationControlsToElement(playerNameEl, item, userKey, 'list');
            }

            if (cfg?.replacePingBarWithText) {
                const pingWrapper = item.querySelector('.pingWrapper');
                if (pingWrapper) {
                    const img = pingWrapper.querySelector('img.ping');
                    const title = img ? img.title : pingWrapper.title; 
                    const minPing = extractMinPing(title);
                    
                    if (minPing !== null) {
                        let color = minPing < 60 ? '#00ff00' : (minPing > 90 ? '#ff4444' : '#aaa');
                        let txt = pingWrapper.querySelector('.cerberus-ping-text');
                        if (!txt) {
                            txt = document.createElement('span');
                            txt.className = 'cerberus-ping-text';
                            Object.assign(txt.style, { fontSize: '11px', fontWeight: 'bold', marginLeft: 'auto', verticalAlign: 'middle' });
                            pingWrapper.appendChild(txt);
                        }
                        txt.style.color = color;
                        txt.innerText = `${minPing}ms`;
                    }
                }
            } else {
                 const pingWrapper = item.querySelector('.pingWrapper');
                 if (pingWrapper) {
                     const txt = pingWrapper.querySelector('.cerberus-ping-text');
                     if (txt) txt.remove();
                 }
            }

            if (countryFilterEnabled && userKey !== '<offline>' && !userKey.startsWith('<')) {
                let userCountry = globalUsers[userKey]?.country?.iso_code?.toUpperCase();
                if (!userCountry) {
                    const flagEl = item.querySelector('.flagWrapper');
                    if (flagEl && flagEl.title) {
                        userCountry = COUNTRY_NAME_TO_CODE[flagEl.title];
                    }
                }

                if (userCountry && !CerberusData.isCountryAllowed(userCountry) && !CerberusData.isPositive(userKey)) {
                    if (item.dataset.countryBlocked !== "true") {
                        item.style.display = 'none';
                        item.dataset.countryBlocked = "true";
                    }
                } else {
                    if (item.dataset.countryBlocked !== "false") {
                        item.style.display = '';
                        item.dataset.countryBlocked = "false";
                    }
                }
            }
        } catch(e) { console.debug('[Cerberus] Sidebar item error:', e); }
    });

    document.querySelectorAll('.matchesList .matchItem').forEach(match => {
        try {
            let shouldHideMatch = countryFilterEnabled; 

            const players = match.querySelectorAll('.playerInfo');
            players.forEach(playerInfo => {
                const playerNameEl = playerInfo.querySelector('.playerName');
                if (!playerNameEl) return;

                const userKey = normalizeUsername(playerNameEl.textContent);
                if (!userKey) return;
                
                playerInfo.dataset.currentUser = userKey;
                
                if (cfg?.enableReputation) {
                    applyReputationStyleMatch(playerNameEl, userKey);
                    addReputationControlsToElement(playerNameEl, playerInfo, userKey, 'match');
                }

                if (countryFilterEnabled && shouldHideMatch && userKey !== '<offline>' && !userKey.startsWith('<')) {
                    let userCountry = globalUsers[userKey]?.country?.iso_code?.toUpperCase();
                    if (!userCountry) {
                        const flagEl = playerInfo.querySelector('.playerFlag');
                        if (flagEl && flagEl.title) {
                            userCountry = COUNTRY_NAME_TO_CODE[flagEl.title];
                        }
                    }
                    
                    if (!userCountry || CerberusData.isCountryAllowed(userCountry) || CerberusData.isPositive(userKey)) {
                        shouldHideMatch = false;
                    }
                }
            });

            if (countryFilterEnabled && shouldHideMatch && players.length > 0) {
                if (match.dataset.countryBlocked !== "true") {
                    match.style.display = 'none';
                    match.dataset.countryBlocked = "true";
                }
            } else {
                if (match.dataset.countryBlocked !== "false") {
                    match.style.display = '';
                    match.dataset.countryBlocked = "false";
                }
            }
        } catch(e) { console.debug('[Cerberus] Match item error:', e); }
    });
    
    if (!countryFilterEnabled) {
        unfilterAllUsers();
    }
};

// ==================== UI HELPERS ====================
function applyReputationStyleChat(author, msg, userKey, hideNegative) {
    author.style.color = '';
    author.style.fontWeight = '';
    author.style.textShadow = '';
    author.style.textDecoration = '';
    msg.style.backgroundColor = '';
    msg.style.borderLeft = '';
    msg.style.paddingLeft = '';
    msg.style.opacity = '';
    
    if (userKey === '<offline>' || userKey.startsWith('<')) return;

    if (CerberusData.isPositive(userKey)) {
        author.style.color = '#00aa00';
        author.style.fontWeight = 'bold';
        author.style.textShadow = '0 0 3px rgba(0, 170, 0, 0.5)';
        msg.style.backgroundColor = 'rgba(0, 255, 0, 0.08)';
        msg.style.borderLeft = '3px solid #00aa00';
        msg.style.paddingLeft = '5px';
    } 
    else if (CerberusData.isNegative(userKey)) {
        author.style.color = '#888';
        author.style.textDecoration = 'line-through';
        if (!hideNegative) {
            msg.style.opacity = '0.35';
        }
    }
}

function applyReputationStyleList(playerName, userItem, userKey) {
    playerName.style.color = '';
    playerName.style.fontWeight = '';
    playerName.style.textDecoration = '';
    playerName.style.textShadow = '';
    userItem.style.opacity = '';
    userItem.style.backgroundColor = '';
    userItem.style.borderLeft = '';
    
    if (userKey === '<offline>' || userKey.startsWith('<')) return;

    if (CerberusData.isPositive(userKey)) {
        playerName.style.color = '#00aa00';
        playerName.style.fontWeight = 'bold';
        playerName.style.textShadow = '0 0 5px rgba(0, 255, 0, 0.6)';
        userItem.style.backgroundColor = 'rgba(0, 255, 0, 0.12)';
        userItem.style.borderLeft = '4px solid #00aa00';
    } else if (CerberusData.isNegative(userKey)) {
        playerName.style.color = '#888';
        playerName.style.textDecoration = 'line-through';
        userItem.style.opacity = '0.35';
    }
}

function applyReputationStyleMatch(playerName, userKey) {
    playerName.style.color = '';
    playerName.style.fontWeight = '';
    playerName.style.textShadow = '';
    playerName.style.textDecoration = '';
    
    if (userKey === '<offline>' || userKey.startsWith('<')) return;

    if (CerberusData.isPositive(userKey)) {
        playerName.style.color = '#00aa00';
        playerName.style.fontWeight = 'bold';
        playerName.style.textShadow = '0 0 5px rgba(0, 255, 0, 0.6)';
    } else if (CerberusData.isNegative(userKey)) {
        playerName.style.color = '#888';
        playerName.style.textDecoration = 'line-through';
    }
}

function addReputationControlsToElement(playerNameEl, hoverContainer, userKey, type, hideNegative = false) {
    hoverContainer.dataset.currentUser = userKey;

    if (hoverContainer.dataset.cerbHoverAdded === "true") return;
    hoverContainer.dataset.cerbHoverAdded = "true";

    const timeEl = type === 'chat' ? hoverContainer.querySelector('.time') : null;
    const anchorEl = timeEl || playerNameEl;

    hoverContainer.addEventListener('mouseenter', () => {
        if (window.CerberusState.menuIsHovered) return;

        clearTimeout(window.CerberusState.menuHideTimeout);
        window.CerberusState.menuShowTimeout = setTimeout(() => {
            if (window.CerberusState.menuIsHovered) return;
            
            const menu = document.getElementById('cerbGlobalMenu');
            if (!menu) return;
            
            const activeUserKey = hoverContainer.dataset.currentUser;
            
            if (!activeUserKey || activeUserKey === '<offline>' || activeUserKey.startsWith('<')) {
                return;
            }
            
            const isNativeBlocked = Array.from(document.querySelectorAll('.usersIgnoredList .userItem')).some(el => el.dataset.currentUser === activeUserKey);
            const isPos = CerberusData.isPositive(activeUserKey);
            const isNeg = CerberusData.isNegative(activeUserKey);
            
            const btnLike = document.getElementById('cerbBtnLike');
            const btnDislike = document.getElementById('cerbBtnDislike');
            const btnClear = document.getElementById('cerbBtnClear');
            const btnBlock = document.getElementById('cerbBtnBlock');
            const btnUnblock = document.getElementById('cerbBtnUnblock');
            const divQueue = document.getElementById('cerbDivQueue');
            const btnQueue = document.getElementById('cerbBtnQueueAdd');
            
            const qEnabled = ConfigManager.getSetting('liveQueue.enabled') === true;
            
            if (btnQueue) btnQueue.style.display = qEnabled ? 'inline-block' : 'none';
            if (divQueue) divQueue.style.display = qEnabled ? 'block' : 'none';

            if (btnLike) btnLike.style.display = isPos ? 'none' : 'inline-block';
            if (btnDislike) btnDislike.style.display = isNeg ? 'none' : 'inline-block';
            if (btnClear) btnClear.style.display = (isPos || isNeg) ? 'inline-block' : 'none';
            if (btnBlock) btnBlock.style.display = isNativeBlocked ? 'none' : 'inline-block';
            if (btnUnblock) btnUnblock.style.display = isNativeBlocked ? 'inline-block' : 'none';
            
            menu.dataset.user = activeUserKey;
            menu.dataset.type = type;
            menu.dataset.hideNegative = hideNegative;
            
            const range = document.createRange();
            range.selectNodeContents(anchorEl);
            const rect = range.getBoundingClientRect();
            
            const menuWidth = menu.offsetWidth || 150; 
            let leftPos = rect.right + 12;
            if (leftPos + menuWidth > window.innerWidth - 10) leftPos = window.innerWidth - menuWidth - 10;
            
            menu.style.left = leftPos + 'px';
            menu.style.top = (rect.top + rect.height / 2) + 'px';
            menu.classList.add('visible');
        }, 300);
    });

    hoverContainer.addEventListener('mouseleave', () => {
        clearTimeout(window.CerberusState.menuShowTimeout);
        window.CerberusState.menuHideTimeout = setTimeout(() => {
            const menu = document.getElementById('cerbGlobalMenu');
            if (menu) menu.classList.remove('visible');
        }, 200);
    });
}

function reprocessUserMessages(userKey, hideNegative) {
    const menu = document.getElementById('cerbGlobalMenu');
    if (menu) menu.classList.remove('visible');

    document.querySelectorAll('.message').forEach(msg => {
        if (msg.dataset.cerberusUser === userKey) {
            if (msg.classList.contains('chat')) {
                const author = msg.querySelector('span.author');
                if (author) applyReputationStyleChat(author, msg, userKey, hideNegative);
            }
            const wrapper = msg.closest('.messageWrapper');
            if (wrapper) wrapper.style.display = '';
            msg.style.display = '';
            msg.removeAttribute('data-cerberus-hidden');
        }
    });

    document.querySelectorAll('.userItem').forEach(item => {
        const name = item.querySelector('.playerName');
        if (name && normalizeUsername(name.textContent) === userKey) {
            applyReputationStyleList(name, item, userKey);
            item.style.display = '';
            item.removeAttribute('data-country-blocked');
        }
    });

    document.querySelectorAll('.matchesList .matchItem').forEach(match => {
        let hasUser = false;
        match.querySelectorAll('.playerName').forEach(name => {
            if (normalizeUsername(name.textContent) === userKey) {
                applyReputationStyleMatch(name, userKey);
                hasUser = true;
            }
        });
        if (hasUser) {
            match.style.display = '';
            match.removeAttribute('data-country-blocked');
        }
    });

    if (runtimeConfig && window.CerberusFCADE) {
        updateChat(window.CerberusFCADE, runtimeConfig);
        updateSidebar(window.CerberusFCADE, runtimeConfig);
    }
}

// ==================== THEME UNLOCK ====================
function unlockColorThemes() {
    const themeSelect = document.querySelector('.frontendOptions select.selectValue[disabled]');
    const themeTitle = document.querySelector('.frontendOptions .option .title[disabled]');
    const patronExclusive = document.querySelector('.frontendOptions .patronExclusive');

    if (themeSelect) {
        themeSelect.removeAttribute('disabled');
        themeSelect.style.opacity = '1';
        themeSelect.style.cursor = 'pointer';

        if (!themeSelect.classList.contains('cerberus-unlocked')) {
            themeSelect.addEventListener('change', (e) => CerberusData.setTheme(e.target.value));
            themeSelect.classList.add('cerberus-unlocked');
        }
    }

    if (themeTitle) {
        themeTitle.removeAttribute('disabled');
        themeTitle.style.opacity = '1';
    }

    if (patronExclusive) {
        patronExclusive.style.display = 'none';
    }
}

function applyTheme(themeName) {
    const themeSelect = document.querySelector('.frontendOptions select.selectValue');
    if (themeSelect && themeName && themeName !== 'default') {
        const option = Array.from(themeSelect.options).find(opt => opt.value === themeName);
        if (option && themeSelect.value !== themeName) {
            themeSelect.value = themeName;
            themeSelect.dispatchEvent(new Event('change', { bubbles: true }));
        }
    }
}

// ==================== VISUAL ELEMENTS ====================
function createFlagElement(country) {
    const flag = document.createElement('span');
    flag.className = `flagWrapper cerberus-injected-flag`; 
    Object.assign(flag.style, {
        width: '20px',
        height: '14px',
        display: 'inline-block',
        backgroundImage: `url('static/flags/${country.iso_code.toLowerCase()}.png')`,
        backgroundSize: 'contain',
        backgroundRepeat: 'no-repeat',
        marginLeft: '5px',
        verticalAlign: 'middle'
    });
    flag.title = country.full_name;
    return flag;
}

function createPingElement(src, title) {
    const ping = document.createElement('span');
    ping.className = `pingWrapper cerberus-injected-pingbar`; 
    Object.assign(ping.style, {
        width: '15px',
        height: '15px',
        display: 'inline-block',
        backgroundImage: `url('${src}')`,
        backgroundSize: 'contain',
        marginLeft: '5px',
        verticalAlign: 'middle'
    });
    ping.title = title;
    return ping;
}

function createRankElement(src, title) {
    const rank = document.createElement('span');
    rank.className = `rankWrapper cerberus-injected-rank`; 
    Object.assign(rank.style, {
        width: '15px',
        height: '15px',
        display: 'inline-block',
        backgroundImage: `url('${src}')`,
        backgroundSize: 'contain',
        marginLeft: '5px',
        verticalAlign: 'middle'
    });
    rank.title = title;
    return rank;
}

function createPingTextElement(minPing) {
    const text = document.createElement('span');
    text.className = `cerberus-injected-pingtext`; 
    
    let color = '#aaa';
    if (minPing !== null) {
        if (minPing < 60) color = '#00ff00';
        else if (minPing > 90) color = '#ff4444';
    }

    Object.assign(text.style, {
        fontSize: '10px',
        marginLeft: '5px',
        fontWeight: 'normal',
        color: color,
        verticalAlign: 'middle'
    });
    text.innerHTML = minPing !== null ? `(${minPing}ms)` : '';
    return text;
}

function createStatusElement(state) {
    const status = document.createElement('div');
    status.className = `statusWrapper cerberus-injected-status`; 
    
    let color = '#ff4444'; 
    let shadow = 'red';
    let title = 'Offline / Unknown';
    
    if (state === 'online') {
        color = '#00ff00';
        shadow = 'green';
        title = 'Online';
    } else if (state === 'away') {
        color = '#ffaa00';
        shadow = 'orange';
        title = 'Away';
    }

    status.title = title;
    Object.assign(status.style, {
        width: '8px',
        height: '8px',
        display: 'inline-block',
        borderRadius: '50%',
        backgroundColor: color,
        marginRight: '5px',
        flexShrink: '0', 
        boxShadow: `0 0 2px ${shadow}`,
        verticalAlign: 'middle'
    });
    return status;
}

// ==================== STYLES ====================
function injectStyles() {
    if (document.getElementById('cerberusStyles')) return;

    const style = document.createElement('style');
    style.id = 'cerberusStyles';
    style.textContent = `
        /* Settings Panel Inputs */
        #settingsTab textarea::selection, #settingsTab input::selection { background: rgba(100, 149, 237, 0.5); color: #fff; }
        #settingsTab textarea::-moz-selection, #settingsTab input::-moz-selection { background: rgba(100, 149, 237, 0.5); color: #fff; }

        /* Sync Button */
        @keyframes cerbSpin { 100% { transform: rotate(360deg); } }
        @keyframes cerbPulseGlow { 0%, 100% { box-shadow: 0 0 4px rgba(255, 215, 0, 0.15); } 50% { box-shadow: 0 0 12px rgba(255, 215, 0, 0.4); } }
        #cerberusSyncBtn { transition: width 0.3s ease, border-radius 0.3s ease, background 0.2s ease, padding 0.3s ease; margin-left: 8px; }
        #cerberusSyncBtn.syncing {
            width: auto !important; min-width: 28px; border-radius: 14px !important;
            background: rgba(255, 215, 0, 0.08) !important; border: 1px solid rgba(255, 215, 0, 0.25) !important;
            padding: 0 10px !important; cursor: pointer !important; opacity: 1 !important;
            animation: cerbPulseGlow 2.5s ease-in-out infinite;
            gap: 5px;
        }
        #cerberusSyncBtn.syncing .cerb-spin-icon {
            display: inline-block; width: 12px; height: 12px;
            border: 2px solid rgba(255, 215, 0, 0.25); border-top-color: #ffd700;
            border-radius: 50%; animation: cerbSpin 0.7s linear infinite; vertical-align: middle;
            flex-shrink: 0;
        }
        #cerberusSyncBtn .cerb-sync-progress {
            font-size: 11px; color: #ffd700; font-weight: 600; vertical-align: middle;
            letter-spacing: 0.3px; white-space: nowrap; margin-left: 3px;
        }
        #cerberusSyncBtn:hover:not(.syncing) { background: rgba(255,255,255,0.1) !important; }
        #cerberusSyncBtn.syncing:hover {
            background: rgba(255, 68, 68, 0.12) !important; border-color: rgba(255, 68, 68, 0.4) !important;
            animation: none; box-shadow: 0 0 8px rgba(255, 68, 68, 0.3);
        }
        #cerberusSyncBtn.syncing:hover .cerb-spin-icon { border-top-color: #ff6b6b; border-color: rgba(255, 68, 68, 0.25); }
        #cerberusSyncBtn.syncing:hover .cerb-sync-progress { color: #ff6b6b; }

        /* Animação de UX: Piscar vermelho ao bloquear nativo */
        @keyframes cerbBlockPulse {
            0% { background-color: rgba(255, 68, 68, 0.4); box-shadow: inset 4px 0 0px #ff4444; }
            50% { background-color: rgba(255, 68, 68, 0.05); box-shadow: inset 4px 0 0px #ff4444; }
            100% { background-color: transparent; box-shadow: none; }
        }
        .cerberus-anim-block-pulse { animation: cerbBlockPulse 2s ease-in-out 2 forwards !important; }

        /* Floating Action Buttons (FABs) */
        .cerb-clear-chat-fab {
            position: absolute; right: 15px; bottom: 65px;
            background: rgba(30, 30, 35, 0.9); border: 1px solid rgba(255, 255, 255, 0.1); 
            border-radius: 5px; width: 160px; text-align: center; text-transform: uppercase;
            color: #ccc; padding: 6px 14px; font-size: 11px; font-weight: bold; cursor: pointer; transition: all 0.2s ease;
            z-index: 100; box-shadow: 0 4px 10px rgba(0,0,0,0.5); backdrop-filter: blur(5px);
        }
        .cerb-clear-chat-fab:hover { background: rgba(50, 50, 60, 0.95); color: #fff; transform: translateY(-2px); border-color: rgba(255, 255, 255, 0.3); }

        .cerb-queue-fab {
            position: absolute; right: 15px; bottom: 100px;
            background: rgba(30, 30, 35, 0.9); border: 1px solid rgba(102, 126, 234, 0.4); 
            border-radius: 5px; width: 160px; text-align: center; text-transform: uppercase;
            color: #a3bffa; padding: 6px 14px; font-size: 11px; font-weight: bold; cursor: pointer; transition: all 0.2s ease;
            z-index: 100; box-shadow: 0 4px 10px rgba(0,0,0,0.5); backdrop-filter: blur(5px);
        }
        .cerb-queue-fab:hover { background: rgba(102, 126, 234, 0.3); color: #fff; transform: translateY(-2px); }

        /* Botão LIVE Toggle na Fila */
        .q-live-btn {
            border: 1px solid rgba(255,255,255,0.1); border-radius: 4px; padding: 5px 10px; font-size: 11px;
            font-weight: bold; cursor: pointer; transition: all 0.2s; color: white;
        }
        .q-live-btn.on { background: rgba(0, 170, 0, 0.3); border-color: #00aa00; }
        .q-live-btn.on:hover { background: rgba(0, 170, 0, 0.5); }
        .q-live-btn.off { background: rgba(170, 0, 0, 0.3); border-color: #ff4444; }
        .q-live-btn.off:hover { background: rgba(170, 0, 0, 0.5); }

        /* Elemento MOTD da Notificação de Atualização */
        .cerb-motd-update-notice {
            background: rgba(255, 165, 0, 0.15); border-left: 4px solid #ffaa00; padding: 10px 15px; margin-top: 15px;
            border-radius: 4px; color: #ffdca5; font-size: 13px; display: inline-block; width: calc(100% - 10px); box-sizing: border-box; line-height: 1.4;
        }

        body.cerb-hide-sidebar-ping .usersListToolbar .userItem .pingWrapper img.ping { display: none !important; }

        /* Blur */
        .message.blur-individual .line .blocksContainer { filter: blur(5px); transition: filter 0.2s ease; user-select: none; }
        .message.blur-individual:hover .line .blocksContainer { filter: blur(0); user-select: text; }
        .chatContent.blur-all .message .line .blocksContainer { filter: blur(5px); transition: filter 0.2s ease; user-select: none; }
        .chatContent.blur-all:hover .message .line .blocksContainer { filter: blur(0); user-select: text; }
        
        /* Global Floating Menu */
        #cerbGlobalMenu {
            position: fixed; background: rgba(20, 20, 25, 0.95); border: 1px solid rgba(102, 126, 234, 0.3); border-radius: 8px;
            padding: 4px 8px; box-shadow: 0 4px 15px rgba(0, 0, 0, 0.6); display: flex; align-items: center; gap: 8px;
            z-index: 100000; opacity: 0; pointer-events: none; transition: opacity 0.2s ease, transform 0.2s ease;
            transform: translateY(-50%) translateX(15px) scale(0.95); user-select: none; white-space: nowrap;
        }
        #cerbGlobalMenu.visible { opacity: 1; pointer-events: auto; transform: translateY(-50%) translateX(0) scale(1); }
        #cerbGlobalMenu span { cursor: pointer; font-size: 14px; transition: transform 0.1s; display: inline-block; }
        #cerbGlobalMenu span:hover { transform: scale(1.3); }
        .cerb-menu-divider { width: 1px; height: 16px; background: rgba(255, 255, 255, 0.2); margin: 0 2px; }

        /* Update Button in About Tab */
        .cerb-update-btn {
            display: inline-block; margin-top: 20px; padding: 10px 20px; background: rgba(102, 126, 234, 0.15); border: 1px solid rgba(102, 126, 234, 0.4);
            border-radius: 8px; color: #a3bffa; text-decoration: none; font-weight: 600; transition: all 0.2s ease; font-size: 14px;
        }
        .cerb-update-btn:hover { background: rgba(102, 126, 234, 0.3); color: #fff; transform: translateY(-2px); box-shadow: 0 4px 12px rgba(102, 126, 234, 0.2); }

        /* Modern Control Panel */
        #cerberusPanel {
            position: fixed; width: 480px; max-height: 85vh; background: rgba(23, 23, 28, 0.95); backdrop-filter: blur(12px);
            border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 12px; z-index: 10000; color: #ececec;
            font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; box-shadow: 0 20px 60px rgba(0, 0, 0, 0.7); display: none; overflow: hidden; flex-direction: column;
        }
        @media (max-width: 768px) { #cerberusPanel { width: 95%; max-height: 90vh; } }
        
        #cerberusPanel .header, #cerberusQueueWindow .q-header {
            display: flex; justify-content: space-between; align-items: center; padding: 14px 20px; background: rgba(255, 255, 255, 0.03); border-bottom: 1px solid rgba(255, 255, 255, 0.08); cursor: move; user-select: none;
        }
        #cerberusPanel .header .title, #cerberusQueueWindow .q-title { display: flex; align-items: center; gap: 10px; font-size: 16px; font-weight: 600; color: #fff; letter-spacing: 0.5px; }
        
        #cerberusPanel .closeBtn, #cerberusQueueWindow .q-close {
            background: transparent; border: none; color: rgba(255, 255, 255, 0.6); font-size: 24px; cursor: pointer; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; border-radius: 6px; transition: all 0.2s;
        }
        #cerberusPanel .closeBtn:hover, #cerberusQueueWindow .q-close:hover { background: rgba(255, 255, 255, 0.1); color: #fff; }
        
        #cerberusPanel .tabs { display: flex; background: rgba(0, 0, 0, 0.2); padding: 0 10px; }
        #cerberusPanel .tab { padding: 14px 20px; background: transparent; border: none; border-bottom: 2px solid transparent; color: rgba(255, 255, 255, 0.6); cursor: pointer; font-size: 13px; font-weight: 500; transition: all 0.2s; }
        #cerberusPanel .tab:hover { color: #fff; }
        #cerberusPanel .tab.active { color: #667eea; border-bottom-color: #667eea; }
        #cerberusPanel .tab.disabled { opacity: 0.3; cursor: not-allowed; }
        #cerberusPanel .content { flex: 1; overflow-y: auto; padding: 20px; }
        
        /* Modern Toggle Switch */
        .modern-toggle { display: flex; justify-content: space-between; align-items: center; padding: 12px; margin-bottom: 8px; background: rgba(255, 255, 255, 0.03); border-radius: 8px; transition: background 0.2s; }
        .modern-toggle:hover { background: rgba(255, 255, 255, 0.05); }
        .switch { position: relative; display: inline-block; width: 44px; height: 24px; }
        .switch input { opacity: 0; width: 0; height: 0; }
        .slider { position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: #444; transition: .3s; border-radius: 24px; }
        .slider:before { position: absolute; content: ""; height: 18px; width: 18px; left: 3px; bottom: 3px; background-color: white; transition: .3s; border-radius: 50%; }
        input:checked + .slider { background-color: #667eea; }
        input:checked + .slider:before { transform: translateX(20px); }
        
        .search-bar { width: 100%; padding: 10px 14px; background: rgba(0, 0, 0, 0.3); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 8px; color: white; margin-bottom: 15px; font-size: 14px; outline: none; }
        .search-bar:focus { border-color: #667eea; }

        /* LIVE QUEUE WINDOW */
        #cerberusQueueWindow {
            position: fixed; right: 20px; bottom: 150px; width: 320px; max-height: 400px;
            background: rgba(23, 23, 28, 0.95); backdrop-filter: blur(12px); border: 1px solid rgba(102, 126, 234, 0.3); border-radius: 12px;
            z-index: 10000; color: #ececec; font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; box-shadow: 0 10px 30px rgba(0, 0, 0, 0.8); display: flex; flex-direction: column; overflow: hidden;
        }
        #cerbQueueCount { color: #a3bffa; margin-left: 5px; font-size: 12px; }
        .q-add-box { display: flex; padding: 10px; background: rgba(0,0,0,0.2); border-bottom: 1px solid rgba(255,255,255,0.05); gap: 8px; }
        .q-add-box input { flex: 1; padding: 6px 10px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 4px; color: #fff; font-size: 12px; outline: none; }
        .q-add-box input:focus { border-color: #667eea; }
        .q-add-box button { background: #667eea; color: white; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer; font-size: 12px; font-weight: bold; transition: background 0.2s; text-transform: uppercase; }
        .q-add-box button:hover { background: #5a67d8; }
        .q-list { flex: 1; overflow-y: auto; padding: 10px; display: flex; flex-direction: column; gap: 6px; }
        .q-empty { text-align: center; color: #888; font-size: 12px; padding: 20px 0; font-style: italic; }
        .q-item { display: flex; justify-content: space-between; align-items: center; background: rgba(255,255,255,0.03); padding: 8px 12px; border-radius: 6px; border-left: 3px solid #667eea; }
        .q-name { font-size: 13px; font-weight: 500; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 150px; }
        .q-name.played { text-decoration: line-through; color: #888; border-left-color: #444; }
        .q-controls { display: flex; gap: 4px; }
        .q-controls button { background: transparent; border: 1px solid rgba(255,255,255,0.1); border-radius: 4px; cursor: pointer; font-size: 11px; padding: 4px; transition: all 0.2s; color: #ccc; }
        .q-controls button:hover:not(:disabled) { background: rgba(255,255,255,0.1); transform: scale(1.1); }
        .q-controls button:disabled { opacity: 0.3; cursor: not-allowed; }
        .q-controls button.danger:hover { background: rgba(255,68,68,0.2); border-color: #ff4444; }
        .q-footer { padding: 10px; background: rgba(0,0,0,0.3); text-align: right; border-top: 1px solid rgba(255,255,255,0.05); }
        .q-clear-btn { background: transparent; border: 1px solid rgba(255,68,68,0.4); color: #ff4444; padding: 5px 10px; border-radius: 4px; font-size: 11px; cursor: pointer; transition: all 0.2s; text-transform: uppercase; }
        .q-clear-btn:hover { background: rgba(255,68,68,0.2); }

        /* Scrollbars */
        #cerberusPanel .content::-webkit-scrollbar, .q-list::-webkit-scrollbar { width: 6px; }
        #cerberusPanel .content::-webkit-scrollbar-thumb, .q-list::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.2); border-radius: 4px; }
        #cerberusPanel .content::-webkit-scrollbar-track, .q-list::-webkit-scrollbar-track { background: transparent; }
    `;
    document.head.appendChild(style);
}

// ==================== CONTROL PANEL ====================
function createControlPanel() {
    if (document.getElementById('cerberusPanel')) return;

    const panel = document.createElement('div');
    panel.id = 'cerberusPanel';

    panel.innerHTML = `
        <div class="header" id="cerberusHeader">
            <div class="title">
                <span>🐺</span>
                <span>${t('panelTitle')}</span>
            </div>
            <button class="closeBtn" id="cerbPanelCloseBtn">×</button>
        </div>
        <div class="tabs">
            <button class="tab" data-tab="countries" id="countriesTabBtn">${t('tabs.countries')}</button>
            <button class="tab active" data-tab="settings">${t('tabs.settings')}</button>
            <button class="tab" data-tab="about">${t('tabs.about')}</button>
        </div>
        <div class="content">
            <div id="countriesTab" class="tab-content" style="display:none;"></div>
            <div id="settingsTab" class="tab-content" style="display:block;"></div>
            <div id="aboutTab" class="tab-content" style="display:none;"></div>
        </div>
    `;

    document.body.appendChild(panel);
    makeDraggable(panel, 'cerberusHeader');

    document.getElementById('cerbPanelCloseBtn').addEventListener('click', () => {
        document.getElementById('cerberusPanel').style.display = 'none';
    });

    panel.querySelectorAll('.tab').forEach(tab => {
        tab.addEventListener('click', () => {
            if (tab.classList.contains('disabled')) return;
            
            panel.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
            panel.querySelectorAll('.tab-content').forEach(c => c.style.display = 'none');
            
            tab.classList.add('active');
            document.getElementById(tab.dataset.tab + 'Tab').style.display = 'block';
            
            if (tab.dataset.tab === 'countries') updateCountryList();
        });
    });

    createCountriesTab();
    createSettingsTab();
    createAboutTab();
    updateCountryTabVisibility(ConfigManager.getSetting('countryFilter.enabled') === true);
}

function makeDraggable(element, headerId) {
    const header = document.getElementById(headerId);
    if (!header) return;
    
    let isDragging = false;
    let currentX, currentY, initialX, initialY;
    let xOffset = 0, yOffset = 0;

    if (headerId === 'cerberusHeader') {
        xOffset = (window.innerWidth - 480) / 2; 
        yOffset = (window.innerHeight - 500) / 2;
        setTranslate(xOffset, yOffset, element);
    }

    header.addEventListener("mousedown", dragStart);

    function dragStart(e) {
        if (e.target === header || header.contains(e.target)) {
            if (e.target.tagName !== 'BUTTON') {
                const rect = element.getBoundingClientRect();
                xOffset = rect.left;
                yOffset = rect.top;
                initialX = e.clientX - xOffset;
                initialY = e.clientY - yOffset;
                isDragging = true;
                
                document.addEventListener("mouseup", dragEnd);
                document.addEventListener("mousemove", drag);
            }
        }
    }

    function dragEnd(e) {
        if (isDragging) {
            initialX = currentX;
            initialY = currentY;
            isDragging = false;
            document.removeEventListener("mouseup", dragEnd);
            document.removeEventListener("mousemove", drag);
        }
    }

    function drag(e) {
        if (isDragging) {
            e.preventDefault();
            currentX = e.clientX - initialX;
            currentY = e.clientY - initialY;
            
            const rectWidth = element.offsetWidth || 480;
            const rectHeight = element.offsetHeight || 500;
            const maxX = window.innerWidth - rectWidth;
            const maxY = window.innerHeight - rectHeight;
            
            currentX = Math.max(0, Math.min(currentX, maxX));
            currentY = Math.max(0, Math.min(currentY, maxY));

            xOffset = currentX;
            yOffset = currentY;
            setTranslate(currentX, currentY, element);
            
            if (element.id === 'cerberusQueueWindow') {
                element.style.right = 'auto';
                element.style.bottom = 'auto';
            }
        }
    }

    function setTranslate(xPos, yPos, el) {
        el.style.transform = `translate3d(${xPos}px, ${yPos}px, 0)`;
        el.style.top = '0';
        el.style.left = '0';
    }
}

function updateCountryTabVisibility(enabled) {
    const btn = document.getElementById('countriesTabBtn');
    if (btn) {
        if (enabled) {
            btn.classList.remove('disabled');
        } else {
            btn.classList.add('disabled');
            if (btn.classList.contains('active')) {
                const settingsTab = document.querySelector('.tab[data-tab="settings"]');
                if (settingsTab) settingsTab.click();
            }
        }
    }
}

function createCountriesTab() {
    const tab = document.getElementById('countriesTab');
    tab.innerHTML = `
        <div style="background: rgba(255, 165, 0, 0.1); border: 1px solid rgba(255, 165, 0, 0.3); border-radius: 8px; padding: 10px; margin-bottom: 15px; font-size: 13px; text-align: center; color: #ffdca5; line-height: 1.4;">
            ${t('countries.alert')}
        </div>
        <input type="text" id="countrySearch" class="search-bar" placeholder="${t('countries.search')}">
        <div style="display: flex; gap: 10px; margin-bottom: 15px;">
            <button id="allowAllBtn" style="flex: 1; padding: 10px; background: rgba(0, 170, 0, 0.2); border: 1px solid rgba(0, 255, 0, 0.3); border-radius: 8px; color: #4ade80; cursor: pointer; font-weight: 600;">${t('countries.allowAll')}</button>
            <button id="clearAllBtn" style="flex: 1; padding: 10px; background: rgba(170, 0, 0, 0.2); border: 1px solid rgba(255, 0, 0, 0.3); border-radius: 8px; color: #f87171; cursor: pointer; font-weight: 600;">${t('countries.clearAll')}</button>
        </div>
        <div id="countriesContainer"></div>
    `;

    document.getElementById('allowAllBtn').addEventListener('click', () => { 
        CerberusData.allowAllCountries(); 
        updateCountryList(); 
    });
    
    document.getElementById('clearAllBtn').addEventListener('click', () => { 
        CerberusData.clearAllCountries(); 
        updateCountryList(); 
    });
    
    document.getElementById('countrySearch').addEventListener('input', (e) => {
        updateCountryList(e.target.value);
    });
    
    updateCountryList();
}

function updateCountryList(filterText = '') {
    const container = document.getElementById('countriesContainer');
    if (!container) return;
    container.innerHTML = '';

    const filter = filterText.toLowerCase();

    Object.entries(AVAILABLE_COUNTRIES).forEach(([code, name]) => {
        if (!name.toLowerCase().includes(filter) && !code.toLowerCase().includes(filter)) return;

        const isAllowed = CerberusData.isCountryAllowed(code);
        const div = document.createElement('div');
        
        Object.assign(div.style, {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '12px',
            marginBottom: '8px',
            background: 'rgba(255, 255, 255, 0.03)',
            borderRadius: '8px',
            borderLeft: `4px solid ${isAllowed ? '#4ade80' : '#4b5563'}`,
            transition: 'background 0.2s'
        });
        
        div.onmouseenter = () => div.style.background = 'rgba(255, 255, 255, 0.06)';
        div.onmouseleave = () => div.style.background = 'rgba(255, 255, 255, 0.03)';

        div.innerHTML = `
            <div style="display:flex; align-items:center; gap:12px;">
                <span style="width:24px; height:16px; background-image: url('static/flags/${code.toLowerCase()}.png'); background-size: contain; background-repeat: no-repeat; opacity: ${isAllowed ? 1 : 0.5}"></span>
                <span style="font-size:14px; color:${isAllowed ? '#fff' : '#888'}">${name} <small style="opacity:0.5">(${code})</small></span>
            </div>
        `;

        const toggle = createModernToggle(isAllowed, () => {
            if (isAllowed) CerberusData.removeCountry(code);
            else CerberusData.addCountry(code);
            updateCountryList(filterText);
        });

        div.appendChild(toggle);
        container.appendChild(div);
    });
}

function createModernToggle(checked, onChange) {
    const label = document.createElement('label');
    label.className = 'switch';
    const input = document.createElement('input');
    input.type = 'checkbox';
    input.checked = checked;
    input.addEventListener('change', onChange);
    const span = document.createElement('span');
    span.className = 'slider';
    label.appendChild(input);
    label.appendChild(span);
    return label;
}

function createSettingsTab() {
    const tab = document.getElementById('settingsTab');
    
    const createSection = (title, items) => `
        <div style="margin-bottom: 24px;">
            <h4 style="margin: 0 0 12px 0; font-size: 13px; text-transform: uppercase; color: #667eea; letter-spacing: 1px; font-weight: 700;">${title}</h4>
            ${items}
        </div>
    `;

    const settingToggle = (key, label) => {
        const val = ConfigManager.getSetting(key) === true; 
        return `
            <div class="modern-toggle">
                <span style="font-size: 14px; color: #e0e0e0;">${label}</span>
                <label class="switch">
                    <input type="checkbox" data-setting="${key}" ${val ? 'checked' : ''}>
                    <span class="slider"></span>
                </label>
            </div>
        `;
    };

    const settingInput = (key, label, type="text", max="") => {
        let val = ConfigManager.getSetting(key); 
        if (val === undefined || val === null) val = '';
        
        // Prevenção Crítica: Escapar aspas duplas no valor para não destruir a string HTML do atributo 'value'
        const safeVal = val.toString().replace(/"/g, '&quot;');
        
        if (type === 'textarea') {
            // Decodificar \\n para quebras de linha reais no textarea
            const displayVal = safeVal.replace(/\\n/g, '\n');
            return `
                <div class="modern-toggle" style="flex-wrap: wrap;">
                    <span style="font-size: 14px; color: #e0e0e0; flex: 1; min-width: 150px;">${label}</span>
                    <textarea data-setting="${key}" rows="3" style="background: rgba(0,0,0,0.3); color: white; border: 1px solid rgba(255,255,255,0.2); padding: 6px 8px; border-radius: 4px; outline: none; width: 100%; margin-top: 8px; resize: vertical; font-family: inherit; font-size: 13px; line-height: 1.4; user-select: text; -webkit-user-select: text;">${displayVal}</textarea>
                    <div style="width: 100%; margin-top: 4px; font-size: 11px; color: rgba(255,255,255,0.35); display: flex; gap: 10px;">
                        <span>Normal</span>
                        <span style="margin-left: 5px;"><b>*Bold*</b></span>
                        <span style="color: rgb(51, 241, 229); margin-left: 5px; font-weight: 700;">&#96;highlight&#96;</span>
                    </div>
                </div>
            `;
        }
        
        return `
            <div class="modern-toggle" style="flex-wrap: wrap;">
                <span style="font-size: 14px; color: #e0e0e0; flex: 1; min-width: 150px;">${label}</span>
                <input type="${type}" ${max ? `maxlength="${max}"` : ''} data-setting="${key}" value="${safeVal}" style="background: rgba(0,0,0,0.3); color: white; border: 1px solid rgba(255,255,255,0.2); padding: 4px 8px; border-radius: 4px; outline: none; width: ${key === 'liveQueue.promoMessage' ? '100%' : '100px'}; text-align: ${key === 'liveQueue.promoMessage' ? 'left' : 'center'}; text-transform: ${max==='2' ? 'uppercase' : 'none'}; margin-top: ${key === 'liveQueue.promoMessage' ? '8px' : '0'};">
            </div>
        `;
    };

    const settingSelect = (key, label, options) => {
        const currentVal = ConfigManager.getSetting(key) || options[0].value;
        let optsHtml = options.map(opt => `<option value="${opt.value}" ${currentVal == opt.value ? 'selected' : ''}>${opt.text}</option>`).join('');
        return `
            <div class="modern-toggle">
                <span style="font-size: 14px; color: #e0e0e0;">${label}</span>
                <select data-setting="${key}" style="background: rgba(0,0,0,0.3); color: white; border: 1px solid rgba(255,255,255,0.2); padding: 4px 8px; border-radius: 4px; outline: none;">
                    ${optsHtml}
                </select>
            </div>
        `;
    };

    const langSelect = `
        <div class="modern-toggle" style="margin-bottom: 24px;">
            <span style="font-size: 14px; color: #e0e0e0; font-weight: bold;">${t('settings.language')}</span>
            <select id="cerbLangSelect" style="background: rgba(0,0,0,0.3); color: white; border: 1px solid rgba(255,255,255,0.2); padding: 6px 10px; border-radius: 4px; outline: none; font-size: 13px; cursor: pointer;">
                <option value="en" ${ConfigManager.getSetting('language') === 'en' ? 'selected' : ''}>🇺🇸 English</option>
                <option value="pt" ${ConfigManager.getSetting('language') === 'pt' ? 'selected' : ''}>🇧🇷 Português</option>
                <option value="es" ${ConfigManager.getSetting('language') === 'es' ? 'selected' : ''}>🇪🇸 Español</option>
            </select>
        </div>
    `;

    tab.innerHTML = 
        langSelect +
        createSection(t('settings.global'), settingToggle('autoJoin.enabled', t('settings.autoJoin'))) +
        createSection(t('settings.liveQueue'), 
            settingToggle('liveQueue.enabled', t('settings.queueEnable')) +
            settingInput('liveQueue.keyword', t('settings.queueKeyword')) +
            settingInput('liveQueue.streamerNick', t('settings.queueStreamer')) +
            settingInput('liveQueue.limit', t('settings.queueLimit'), 'number') +
            settingToggle('liveQueue.autoReply', t('settings.queueReply')) +
            settingToggle('liveQueue.promoEnabled', t('settings.queuePromoEnable')) +
            settingInput('liveQueue.promoMessage', t('settings.queuePromo'), 'textarea')
        ) +
        createSection(t('settings.rankingsApi'),
            settingSelect('rankings.limit', t('settings.rankLimit'), [
                {value: 100, text: "100"}, {value: 200, text: "200"}, 
                {value: 400, text: "400"}, {value: 500, text: "500"},
				{value: 800, text: "800"}, {value: 999, text: "999"}
            ]) +
            settingInput('rankings.country', t('settings.rankCountry'), 'text', '2')
        ) +
        createSection(t('settings.filters'), 
            settingToggle('countryFilter.enabled', t('settings.enableFilter'))
        ) +
        createSection(t('settings.chatVisual'), 
            settingToggle('chatUserInfo.enableStatus', t('settings.showStatus')) +
            settingToggle('chatUserInfo.enableFlag', t('settings.showFlags')) +
            settingToggle('chatUserInfo.enableRank', t('settings.showRanks')) +
            settingToggle('chatUserInfo.showNumericRanks', t('settings.showNumericRanks')) +
            settingToggle('chatUserInfo.enablePingBars', t('settings.showPingBars')) +
            settingToggle('chatUserInfo.enablePingText', t('settings.showPingText')) +
            settingToggle('chatUserInfo.replacePingBarWithText', t('settings.replacePingBar'))
        ) +
        createSection(t('settings.reputation'), 
            settingToggle('chatUserInfo.enableReputation', t('settings.enableRep')) +
            settingToggle('chatUserInfo.hideNegativeMessages', t('settings.hideNeg'))
        ) +
        createSection(t('settings.privacy'), `
            <div class="modern-toggle">
                <span style="font-size: 14px; color: #e0e0e0;">${t('settings.blurMode')}</span>
                <select data-setting="chatUserInfo.blurMode" style="background: rgba(0,0,0,0.3); color: white; border: 1px solid rgba(255,255,255,0.2); padding: 4px 8px; border-radius: 4px; outline: none;">
                    <option value="none" ${ConfigManager.getSetting('chatUserInfo.blurMode') === 'none' ? 'selected' : ''}>${t('settings.blurNone')}</option>
                    <option value="individual" ${ConfigManager.getSetting('chatUserInfo.blurMode') === 'individual' ? 'selected' : ''}>${t('settings.blurIndiv')}</option>
                    <option value="all" ${ConfigManager.getSetting('chatUserInfo.blurMode') === 'all' ? 'selected' : ''}>${t('settings.blurAll')}</option>
                </select>
            </div>
        `) +
        createSection(t('settings.extras'), settingToggle('chatUserInfo.unlockColorThemes', t('settings.unlockThemes')));

    document.querySelectorAll('#settingsTab input[data-setting], #settingsTab select[data-setting], #settingsTab textarea[data-setting]').forEach(input => {
        const handleSettingChange = (e) => {
            const key = e.target.getAttribute('data-setting');
            let val = e.target.value;
            
            if (e.target.type === 'checkbox') val = e.target.checked;
            else if (e.target.type === 'number' || key === 'rankings.limit') val = parseInt(e.target.value);
            else if (key === 'rankings.country') val = e.target.value.toUpperCase().trim();
            else if (e.target.tagName === 'TEXTAREA') { val = e.target.value.split(String.fromCharCode(10)).join(String.fromCharCode(92) + 'n'); }

            ConfigManager.updateSetting(key, val);
            
            if (key === 'countryFilter.enabled') {
                updateCountryTabVisibility(val);
            }
        };

        input.addEventListener('change', handleSettingChange);

        // Para campos de texto/número: salvar ao digitar (com debounce)
        if (input.type === 'text' || input.type === 'number') {
            let inputDebounce = null;
            input.addEventListener('input', (e) => {
                clearTimeout(inputDebounce);
                inputDebounce = setTimeout(() => handleSettingChange(e), 500);
            });
        }
    });

    const langSelectObj = document.getElementById('cerbLangSelect');
    if (langSelectObj) {
        langSelectObj.addEventListener('change', (e) => {
            window.changeCerberusLanguage(e.target.value);
        });
    }
}

function createAboutTab() {
    let updateHtml = '';
    if (isNewerVersion(CerberusData.latestVersion, CURRENT_VERSION)) {
        updateHtml = `
            <div style="background: rgba(255, 165, 0, 0.2); border: 1px solid rgba(255, 165, 0, 0.5); padding: 10px; border-radius: 8px; margin-top: 15px; color: #ffdca5; font-weight: bold;">
                ${t('about.updateAvailable')} ${CerberusData.latestVersion}
            </div>
        `;
    }

    document.getElementById('aboutTab').innerHTML = `
        <div style="text-align: center; padding: 20px;">
            <div style="font-size: 40px; margin-bottom: 10px;">🐺</div>
            <h2 style="margin: 0; color: #667eea;">${t('about.title')}</h2>
            <p style="opacity: 0.6; margin-top: 5px; font-weight: 500;">${t('about.subtitle')}</p>
            
            ${updateHtml}

            <div style="background: rgba(255,255,255,0.05); padding: 15px; border-radius: 12px; margin-top: 20px; text-align: left;">
                <div style="margin-bottom: 12px;">
                    <div style="font-weight: 600; font-size: 13px; margin-bottom: 6px; color: #a5b4fc;">${t('about.catBot')}</div>
                    <ul style="opacity: 0.9; padding-left: 20px; line-height: 1.5; font-size: 13px; margin: 0;">
                        <li>${t('about.feat1')}</li>
                        <li>${t('about.feat2')}</li>
                        <li>${t('about.feat3')}</li>
                    </ul>
                </div>
                <div style="margin-bottom: 12px;">
                    <div style="font-weight: 600; font-size: 13px; margin-bottom: 6px; color: #fbbf24;">${t('about.catRank')}</div>
                    <ul style="opacity: 0.9; padding-left: 20px; line-height: 1.5; font-size: 13px; margin: 0;">
                        <li>${t('about.feat4')}</li>
                        <li>${t('about.feat5')}</li>
                    </ul>
                </div>
                <div style="margin-bottom: 12px;">
                    <div style="font-weight: 600; font-size: 13px; margin-bottom: 6px; color: #34d399;">${t('about.catChat')}</div>
                    <ul style="opacity: 0.9; padding-left: 20px; line-height: 1.5; font-size: 13px; margin: 0;">
                        <li>${t('about.feat6')}</li>
                        <li>${t('about.feat7')}</li>
                        <li>${t('about.feat8')}</li>
                    </ul>
                </div>
                <div style="margin-bottom: 12px;">
                    <div style="font-weight: 600; font-size: 13px; margin-bottom: 6px; color: #f87171;">${t('about.catRep')}</div>
                    <ul style="opacity: 0.9; padding-left: 20px; line-height: 1.5; font-size: 13px; margin: 0;">
                        <li>${t('about.feat9')}</li>
                        <li>${t('about.feat10')}</li>
                        <li>${t('about.feat11')}</li>
                    </ul>
                </div>
                <div style="margin-bottom: 8px;">
                    <div style="font-weight: 600; font-size: 13px; margin-bottom: 6px; color: #60a5fa;">${t('about.catFilter')}</div>
                    <ul style="opacity: 0.9; padding-left: 20px; line-height: 1.5; font-size: 13px; margin: 0;">
                        <li>${t('about.feat12')}</li>
                        <li>${t('about.feat13')}</li>
                        <li>${t('about.feat14')}</li>
                        <li>${t('about.feat15')}</li>
                    </ul>
                </div>
                <p style="font-size: 11px; opacity: 0.4; font-style: italic; margin-top: 15px; text-align: center;">${t('about.note')}</p>
            </div>
            <a href="https://github.com/Cerberus-BR/FightcadePlus/releases/latest" target="_blank" class="cerb-update-btn">
                ${t('about.updateBtn')}
            </a>
        </div>
    `;
}

window.updateCountryTabVisibility = updateCountryTabVisibility;
