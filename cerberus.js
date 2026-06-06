const fs = require('fs');
const path = require('path');

// — DICIONÁRIO DE IDIOMAS (i18n) —
const Locales = {
    en: {
        btnTitle: "Fightcade Plus Settings", panelTitle: "Cerberus Settings",
        tabs: { countries: "🌍 Countries", settings: "⚙️ Settings", about: "ℹ️ About" },
        countries: { alert: "⚠️ Filter is applied in real-time.<br>Sidebar adjusts automatically.", search: "🔍 Search country...", allowAll: "✓ Allow All", clearAll: "✗ Block All" },
        settings: { global: "Global", autoJoin: "Auto Join Channel", language: "Language", filters: "Filters", enableFilter: "Enable Country Filter", chatVisual: "Chat Visuals", showStatus: "Show Status (Online/Away/Offline)", showFlags: "Show Flags", showRanks: "Show Rank Letters", showNumericRanks: "Show Ranking Position Badge", showPingBars: "Show Ping Bars", showPingText: "Show Ping as Text", replacePingBar: "Show Ping as Text in Sidebar", reputation: "Reputation", enableRep: "Reputation System (👍/👎)", hideNeg: "Hide Messages from Negative Users", privacy: "Privacy", blurMode: "Blur Mode (Stream)", rankingsApi: "Rankings (Online Sync)", rankLimit: "Top Limit (⚠️ >500 is slower)", rankCountry: "Country Filter (ISO 2-letters)", extras: "Extras", unlockThemes: "Unlock Color Themes", liveQueue: "Live Queue (Streamers)", queueEnable: "Enable Live Queue Module", queueKeyword: "Keyword (e.g. !join)", queueLimit: "Queue Limit", queueStreamer: "Streamer Nick (to Exclude)", queueReply: "Auto-reply in Chat (every 15s)", queuePromoEnable: "Enable 10-Min Promo Bot", queuePromo: "Live Promo Msg" },
        about: { title: "Fightcade Plus 1.11.1", subtitle: "By Cerberus", catBot: "🤖 Streamer Tools", feat1: "Live Player Queue via chat command (!join)", feat2: "Automated welcome message for new players in queue", feat3: "Promotional bot with custom messages", catRank: "🏆 Rankings", feat4: "Ranking position badge next to player names", feat5: "Sync rankings per game with country filter", catChat: "💬 Chat & Sidebar", feat6: "Country flags, rank letters, and ping info on chat", feat7: "Online/Away/Offline status indicators", feat8: "Ping displayed as text or bars", feat8b: "Real-time player search bar", catRep: "🛡️ Reputation & Privacy", feat9: "Player reputation system (Favorite / Downvote)", feat10: "Hide messages from downvoted users", feat11: "Blur mode for stream privacy", catFilter: "🌍 Filters & Customization", feat12: "Country-based player filter", feat13: "Premium color themes unlock", feat14: "Auto-join channel on startup", feat15: "Multi-language support", note: "Ultimate Monolith: O(1) Arrays, Batching, Early Returns & CSP.", updateBtn: "🔄 Check for Updates", updateAvailable: "⚠️ Update Available: " },
        rep: { like: "Favorite (Ignores Filters)", dislike: "Downvote", clear: "Clear Reputation", block: "Block (Fightcade)", unblock: "Unblock (Fightcade)" },
        motd: { clearChat: "CLEAR CHAT", muteChat: "PAUSE CHAT", queueTitle: "PLAYERS QUEUE", updateAvail: "Update Available:" },
        sync: { rankingsBtn: "Sync Rankings", wait30: "Wait 30 minutes", clickCancel: "Click to cancel", autoSyncDone: "Rankings auto-synced for today", liveOn: "🟢 LIVE ON", liveOff: "🔴 LIVE OFF", confirmClear: "Are you sure you want to clear the entire queue?" },
        queue: { title: "Live Queue", addBtn: "Add", clearBtn: "Clear All", empty: "Queue is empty.", inputPh: "Player nickname...", mark: "Toggle Played", remove: "Remove Player", up: "Move Up", down: "Move Down" },
        sidebar: { search: "🔍 Search player..." }
    },
    pt: {
        btnTitle: "Configurações Fightcade Plus", panelTitle: "Cerberus Settings",
        tabs: { countries: "🌍 Países", settings: "⚙️ Ajustes", about: "ℹ️ Sobre" },
        countries: { alert: "⚠️ O filtro é aplicado em tempo real.<br>A lista lateral ajusta-se sem precisar reiniciar.", search: "🔍 Buscar país...", allowAll: "✓ Permitir Todos", clearAll: "✗ Bloquear Todos" },
        settings: { global: "Global", autoJoin: "Entrar Automaticamente no Canal", language: "Idioma", filters: "Filtros", enableFilter: "Ativar Filtro de Países", chatVisual: "Chat Visual", showStatus: "Mostrar Status (Online/Ausente/Offline)", showFlags: "Mostrar Bandeiras", showRanks: "Mostrar Letra de Rank", showNumericRanks: "Mostrar Posição no Ranking", showPingBars: "Mostrar Barras de Ping", showPingText: "Mostrar Ping em Texto", replacePingBar: "Mostrar Ping como Texto na Lista Lateral", reputation: "Reputação", enableRep: "Sistema de Reputação (👍/👎)", hideNeg: "Ocultar mensagens de usuários negativados", privacy: "Privacidade", blurMode: "Modo Blur (Stream)", rankingsApi: "Rankings (Sincronização Online)", rankLimit: "Top Ranking (⚠️ >500 demora)", rankCountry: "Filtrar por País (Ex: BR, vazio=Todos)", extras: "Extras", unlockThemes: "Desbloquear Temas de Cor", liveQueue: "Fila de Live (Streamers)", queueEnable: "Ativar Módulo para Streamers", queueKeyword: "Palavra-chave (ex: !join)", queueLimit: "Limite de Jogadores", queueStreamer: "Seu Nick do Fightcade (Exceção)", queueReply: "Resposta Automática da Fila", queuePromoEnable: "Ativar Bot Divulgação (a cada 10min)", queuePromo: "Mensagem do Bot (a cada 10min)" },
        about: { title: "Fightcade Plus 1.11.1", subtitle: "By Cerberus", catBot: "🤖 Ferramentas para Streamers", feat1: "Fila de jogadores via comando no chat (!join)", feat2: "Mensagem automática de boas-vindas na fila", feat3: "Bot promocional com mensagem personalizada", catRank: "🏆 Rankings", feat4: "Exibir posição no ranking ao lado do nome", feat5: "Sincronização de rankings por jogo com filtro", catChat: "💬 Chat e Lista Lateral", feat6: "Bandeiras, letras de rank e ping no chat", feat7: "Indicadores de status (Online/Ausente/Offline)", feat8: "Ping exibido como texto ou barras", feat8b: "Barra de pesquisa em tempo real", catRep: "🛡️ Reputação e Privacidade", feat9: "Sistema de reputação (Destacar / Negativar)", feat10: "Ocultar mensagens de usuários negativados", feat11: "Modo blur para privacidade em streams", catFilter: "🌍 Filtros e Personalização", feat12: "Filtro de jogadores por país (tempo real)", feat13: "Desbloqueo de temas de cores premium", feat14: "Auto-entrar no canal ao iniciar", feat15: "Suporte multi-idioma (EN/PT)", note: "Ultimate Monolith: O(1) Arrays, Batching, Early Returns & CSP.", updateBtn: "🔄 Verificar Atualizações", updateAvailable: "⚠️ Atualização Disponível: " },
        rep: { like: "Destacar (Ignora Filtros)", dislike: "Negativar", clear: "Limpar Reputação", block: "Bloquear", unblock: "Desbloquear" },
        motd: { clearChat: "LIMPAR CHAT", muteChat: "PAUSAR CHAT", queueTitle: "FILA DE JOGADORES", updateAvail: "Atualização Disponível:" },
        sync: { rankingsBtn: "Sincronizar Rankings", wait30: "Aguarde 30 minutos", clickCancel: "Clique para cancelar", autoSyncDone: "Rankings sincronizados automaticamente hoje", liveOn: "🟢 LIVE ON", liveOff: "🔴 LIVE OFF", confirmClear: "Tem certeza que deseja limpar toda a fila?" },
        queue: { title: "Fila da Live", addBtn: "Adicionar", clearBtn: "Limpar Fila", empty: "A fila está vazia.", inputPh: "Nick do jogador...", mark: "Alternar Jogado", remove: "Remover Jogador", up: "Subir na Fila", down: "Descer na Fila" },
        sidebar: { search: "🔍 Buscar jogador..." }
    }
};

const AVAILABLE_COUNTRIES = { 'BR': 'Brazil', 'AR': 'Argentina', 'BO': 'Bolivia', 'UY': 'Uruguay', 'CL': 'Chile', 'PE': 'Peru', 'CO': 'Colombia', 'MX': 'Mexico', 'US': 'United States', 'CA': 'Canada', 'JP': 'Japan', 'KR': 'South Korea', 'CN': 'China', 'FR': 'France', 'DE': 'Germany', 'GB': 'United Kingdom', 'IT': 'Italy', 'ES': 'Spain', 'PT': 'Portugal', 'RU': 'Russia', 'AU': 'Australia', 'NZ': 'New Zealand', 'IN': 'India', 'TH': 'Thailand', 'PH': 'Philippines', 'ID': 'Indonesia', 'MY': 'Malaysia', 'SG': 'Singapore', 'VN': 'Vietnam', 'TR': 'Turkey', 'SA': 'Saudi Arabia', 'AE': 'UAE', 'ZA': 'South Africa', 'EG': 'Egypt', 'NG': 'Nigeria', 'MA': 'Morocco', 'DZ': 'Algeria', 'PK': 'Pakistan', 'HK': 'Hong Kong', 'XX': 'Outros / Desconhecidos' };
const COUNTRY_NAME_TO_CODE = Object.fromEntries(Object.entries(AVAILABLE_COUNTRIES).map(([code, name]) => [name, code]));

const defaultConfig = {
    language: 'en', autoJoin: { enabled: true, channelId: '' }, countryFilter: { enabled: false }, rankings: { limit: 500, country: '' },
    chatUserInfo: { enableStatus: true, enableFlag: true, enableRank: true, showNumericRanks: true, enablePingText: true, enablePingBars: false, replacePingBarWithText: false, enableReputation: true, hideNegativeMessages: true, unlockColorThemes: true, blurMode: 'none' },
    liveQueue: { enabled: false, keyword: '!join', limit: 10, streamerNick: '', autoReply: false, promoEnabled: false, promoMessage: '`[AO VIVO]` *Venham jogar e participar da live!*\nDigite a `palavra-chave` no chat para entrar na fila.\nAssista em: https://www.youtube.com/@Cerberus-BR' }
};

const dataPath = path.join(__dirname, 'cerberus_data.json');
const configPath = path.join(__dirname, 'cerberus_config.json');
const rankingsPath = path.join(__dirname, 'cerberus_rankings.json');

const CURRENT_VERSION = "1.11.1";
let runtimeConfig = null;
let fullConfigCache = null;

window.CerberusState = { liveMasterOn: false, promoBotInterval: null, replyQueue: [], menuIsHovered: false, menuHideTimeout: null, menuShowTimeout: null, menuCleanupInterval: null, sidebarSearchTerm: '', lastUIRenderSignature: '' };

module.exports = (FCADE) => { try { runPlugin(FCADE); } catch (e) { console.error("Cerberus Fatal Error:", e); } };

function updateFilterShield() {
    const isCountryActive = ConfigManager.getSetting('countryFilter.enabled') === true;
    const isHideNegActive = ConfigManager.getSetting('chatUserInfo.hideNegativeMessages') === true;
    const isSearchActive = (window.CerberusState.sidebarSearchTerm || '') !== '';
    if (isCountryActive || isHideNegActive || isSearchActive) document.body.classList.add('cerb-filters-active');
    else document.body.classList.remove('cerb-filters-active');
}

function atomicWriteJSON(filePath, data) {
    return new Promise((resolve, reject) => {
        const tmpPath = filePath + '.tmp'; const bakPath = filePath + '.bak';
        const json = JSON.stringify(data, null, 2);
        fs.writeFile(tmpPath, json, 'utf8', (err) => {
            if (err) { try { fs.writeFileSync(filePath, json, 'utf8'); resolve(); } catch (e2) { reject(e2); } return; }
            fs.copyFile(filePath, bakPath, () => { fs.rename(tmpPath, filePath, (errRen) => { if (errRen) reject(errRen); else resolve(); }); });
        });
    });
}

function safeLoadJSON(filePath, defaults) {
    const bakPath = filePath + '.bak';
    try { if (fs.existsSync(filePath)) return JSON.parse(fs.readFileSync(filePath, 'utf8')); } catch (e) { }
    try { if (fs.existsSync(bakPath)) return JSON.parse(fs.readFileSync(bakPath, 'utf8')); } catch (e) { }
    return typeof defaults === 'function' ? defaults() : (defaults || null);
}

function getActiveChannelWrapper() {
    const all = document.querySelectorAll('.channelWrapper');
    for (const cw of all) { if (cw.style.display !== 'none') return cw; }
    return all[0] || null;
}

function isRankedChannel(cw) {
    const scope = cw || getActiveChannelWrapper() || document;
    return !!scope.querySelector('.channelInfo .rankedWrapper');
}

function getActiveGameId(FCADE, cw) {
    try {
        if (!isRankedChannel(cw)) return null;
        const scope = cw || getActiveChannelWrapper() || document;
        const romNameEl = scope.querySelector('.channelInfo .name[title="Rom name"]');
        if (romNameEl?.textContent?.trim()) return romNameEl.textContent.trim();
        const gameLink = scope.querySelector('.channelInfo a.link[href*="/game/"]');
        if (gameLink) { const match = gameLink.href.match(/\/game\/([^/]+)\//); if (match?.[1]) return match[1]; }
        if (FCADE && FCADE.activeChannelId) {
            const chan = FCADE.channels?.find(c => c.id === FCADE.activeChannelId);
            if (chan && chan.gameid) return chan.gameid;
            if (FCADE.activeChannelId.includes('-')) return FCADE.activeChannelId.split('-')[0];
            return FCADE.activeChannelId;
        }
        return null;
    } catch (e) { return null; }
}

let _popAudioCtx = null;
function playPopSound() {
    try {
        const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return;
        if (!_popAudioCtx) _popAudioCtx = new AC();
        const ctx = _popAudioCtx; if (ctx.state === 'suspended') ctx.resume();
        const osc = ctx.createOscillator(); const gain = ctx.createGain();
        osc.type = 'sine'; osc.frequency.setValueAtTime(880, ctx.currentTime); osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.1);
        gain.gain.setValueAtTime(0.3, ctx.currentTime); gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
        osc.connect(gain); gain.connect(ctx.destination); osc.start(); osc.stop(ctx.currentTime + 0.1);
    } catch (e) { }
}

const RankCache = {
    data: {}, isSyncing: false, _abortController: null, _autoSyncDate: null,
    load() { this.data = safeLoadJSON(rankingsPath, null) || {}; },
    save() { atomicWriteJSON(rankingsPath, this.data).catch(() => { }); },
    cancelSync() { if (this._abortController) this._abortController.abort(); },
    _evictOldEntries(maxGames = 5) {
        const entries = Object.entries(this.data); if (entries.length <= maxGames) return;
        entries.sort((a, b) => (b[1].lastUpdate || 0) - (a[1].lastUpdate || 0));
        entries.slice(maxGames).forEach(entry => delete this.data[entry[0]]);
    },
    getRank(gameId, username) {
        if (!gameId || !username || !this.data[gameId]) return null;
        return this.data[gameId].players[username.toLowerCase()] || null;
    },
    async syncRankings(gameId) {
        if (!gameId) return;
        const lastSync = this.data[gameId]?.lastUpdate || 0; const cooldownMs = 30 * 60 * 1000;
        if (Date.now() - lastSync < cooldownMs || this.isSyncing) return;
        this.isSyncing = true; this._abortController = new AbortController(); const signal = this._abortController.signal;

        const btn = document.getElementById('cerberusSyncBtn');
        if (btn) {
            btn.classList.add('syncing');
            btn.innerHTML = '<span class="cerb-spin-icon"></span><span class="cerb-sync-progress">0/' + (ConfigManager.getSetting('rankings.limit') || 100) + '</span>';
            btn.title = t('sync.clickCancel');
        }

        const initialGameId = gameId; const targetLimit = ConfigManager.getSetting('rankings.limit') || 100;
        const targetCountry = (ConfigManager.getSetting('rankings.country') || '').toUpperCase().trim();
        let offset = 0; let validPlayersFound = 0; let pagesFetched = 0; const maxPagesSafeguard = 50; const newCache = {};

        while (validPlayersFound < targetLimit) {
            try {
                if (signal.aborted || getActiveGameId(window.CerberusFCADE) !== initialGameId || pagesFetched >= maxPagesSafeguard) break;
                const res = await fetch('https://web.fightcade.com/api/', { method: 'POST', headers: { 'Content-Type': 'application/json' }, signal, body: JSON.stringify({ req: "searchrankings", gameid: initialGameId, limit: 100, offset: offset, byElo: true, recent: true }) });
                if (!res.ok) break;
                const players = (await res.json())?.results?.results || [];
                if (players.length === 0) break;
                pagesFetched++;

                players.forEach((p) => {
                    if (validPlayersFound >= targetLimit || !p.name) return;
                    if (targetCountry === '' || (p.country?.iso_code?.toUpperCase() === targetCountry)) {
                        validPlayersFound++; newCache[p.name.toLowerCase()] = validPlayersFound;
                    }
                });

                if (players.length < 100 || validPlayersFound >= targetLimit) break;
                offset += 100;
                if (btn) { const p = btn.querySelector('.cerb-sync-progress'); if (p) p.textContent = validPlayersFound + '/' + targetLimit; }
                await new Promise(resolve => { const timeout = setTimeout(resolve, 3000); signal.addEventListener('abort', () => { clearTimeout(timeout); resolve(); }, { once: true }); });
            } catch (e) { break; }
        }

        if (Object.keys(newCache).length > 0 && !signal.aborted) {
            this.data[initialGameId] = { lastUpdate: Date.now(), players: newCache, filter: { country: targetCountry, limit: targetLimit } };
            this._evictOldEntries(); this.save();
        }

        this.isSyncing = false; this._abortController = null;
        if (btn) { btn.classList.remove('syncing'); btn.innerHTML = '🔄'; setSyncBtnState(btn, Date.now() - (this.data[initialGameId]?.lastUpdate || 0) < cooldownMs); }
        if (window.CerberusFCADE && runtimeConfig && !signal.aborted) {
            const cw = getActiveChannelWrapper();
            if (cw) {
                fullChatScanScoped(cw, window.CerberusFCADE, runtimeConfig);
                updateSidebarScope(cw.querySelector('.usersListWrapper'), window.CerberusFCADE, runtimeConfig);
            }
        }
    }
};

function invalidateCountryFilterCache() {
    unfilterAllMessages(); unfilterAllUsers();
    if (window.CerberusFCADE && runtimeConfig) {
        const cw = getActiveChannelWrapper();
        if (cw) {
            fullChatScanScoped(cw, window.CerberusFCADE, runtimeConfig);
            const sidebar = cw.querySelector('.usersListWrapper');
            if (sidebar) updateSidebarScope(sidebar, window.CerberusFCADE, runtimeConfig);
        }
    }
}

let dataSaveTimeout = null;

const CerberusData = {
    blockedCountriesSet: new Set(), positive: new Set(), negative: new Set(), selectedTheme: 'bretema', lastUpdateCheck: 0, latestVersion: null, liveQueue: [], queueTimestamp: 0,
    load() {
        const data = safeLoadJSON(dataPath, null);
        if (data) {
            if (data.blockedCountries) this.blockedCountriesSet = new Set(data.blockedCountries);
            else if (data.allowedCountries) {
                const allowed = new Set(data.allowedCountries);
                Object.keys(AVAILABLE_COUNTRIES).forEach(code => { if (!allowed.has(code)) this.blockedCountriesSet.add(code); });
            }
            this.positive = new Set(data.positive || []); this.negative = new Set(data.negative || []); this.selectedTheme = data.selectedTheme || 'bretema';
            this.lastUpdateCheck = data.lastUpdateCheck || 0; this.latestVersion = data.latestVersion || null; this.queueTimestamp = data.queueTimestamp || 0;
            if (Date.now() - this.queueTimestamp > 43200000) { this.liveQueue = []; this.queueTimestamp = Date.now(); } else { this.liveQueue = data.liveQueue || []; }
        }
    },
    save() {
        clearTimeout(dataSaveTimeout);
        dataSaveTimeout = setTimeout(() => {
            atomicWriteJSON(dataPath, { blockedCountries: [...this.blockedCountriesSet], positive: [...this.positive], negative: [...this.negative], selectedTheme: this.selectedTheme, lastUpdateCheck: this.lastUpdateCheck, latestVersion: this.latestVersion, liveQueue: this.liveQueue, queueTimestamp: this.queueTimestamp, lastUpdated: new Date().toISOString() }).catch(() => { });
        }, 100);
    },
    addQueue(playerName) {
        if (!playerName || playerName.trim() === '') return false; const name = playerName.trim(); const limit = ConfigManager.getSetting('liveQueue.limit') || 20;
        if (this.liveQueue.length >= limit || this.liveQueue.some(q => q.name.toLowerCase() === name.toLowerCase()) || this.isNegative(name)) return false;
        this.liveQueue.push({ name: name, played: false }); this.queueTimestamp = Date.now(); this.save(); renderQueueList(); return true;
    },
    removeQueue(index) { if (index < 0 || index >= this.liveQueue.length) return; this.liveQueue.splice(index, 1); this.queueTimestamp = Date.now(); this.save(); renderQueueList(); },
    togglePlayedQueue(index) {
        if (this.liveQueue[index]) {
            this.liveQueue[index].played = !this.liveQueue[index].played;
            if (this.liveQueue[index].played) { const item = this.liveQueue.splice(index, 1)[0]; this.liveQueue.push(item); }
            this.queueTimestamp = Date.now(); this.save(); renderQueueList();
        }
    },
    moveQueue(index, direction) {
        if (index < 0 || index >= this.liveQueue.length) return; const newIndex = index + direction; if (newIndex < 0 || newIndex >= this.liveQueue.length) return;
        const temp = this.liveQueue[index]; this.liveQueue[index] = this.liveQueue[newIndex]; this.liveQueue[newIndex] = temp; this.queueTimestamp = Date.now(); this.save(); renderQueueList();
    },
    clearQueue() { this.liveQueue = []; this.queueTimestamp = Date.now(); this.save(); renderQueueList(); },
    blockCountry(code) { if (!code) return; this.blockedCountriesSet.add(code.toUpperCase()); this.save(); invalidateCountryFilterCache(); },
    unblockCountry(code) { if (!code) return; this.blockedCountriesSet.delete(code.toUpperCase()); this.save(); invalidateCountryFilterCache(); },

    // O(1) Catch-All Logic
    isCountryAllowed(code) {
        let evalCode = code ? code.toUpperCase() : 'XX';
        if (!AVAILABLE_COUNTRIES[evalCode]) evalCode = 'XX';
        return !this.blockedCountriesSet.has(evalCode);
    },

    allowAllCountries() { this.blockedCountriesSet.clear(); this.save(); invalidateCountryFilterCache(); },
    blockAllCountries() { Object.keys(AVAILABLE_COUNTRIES).forEach(c => this.blockedCountriesSet.add(c)); this.save(); invalidateCountryFilterCache(); },
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
            fullConfigCache = fullConfig; runtimeConfig = { ...defaultConfig, ...(fullConfig.cerberus || {}) };
            runtimeConfig.chatUserInfo = { ...defaultConfig.chatUserInfo, ...(runtimeConfig.chatUserInfo || {}) };
            runtimeConfig.liveQueue = { ...defaultConfig.liveQueue, ...(runtimeConfig.liveQueue || {}) };
            runtimeConfig.rankings = { ...defaultConfig.rankings, ...(runtimeConfig.rankings || {}) };
        } else { runtimeConfig = JSON.parse(JSON.stringify(defaultConfig)); fullConfigCache = { cerberus: runtimeConfig }; this.saveConfig(); }
        updateFilterShield();
    },
    saveConfig() {
        clearTimeout(configSaveTimeout);
        configSaveTimeout = setTimeout(() => {
            if (!fullConfigCache) fullConfigCache = {}; fullConfigCache.cerberus = runtimeConfig;
            atomicWriteJSON(configPath, fullConfigCache).catch(() => { });
        }, 100);
    },
    updateSetting(pathStr, value) {
        const keys = pathStr.split('.'); let current = runtimeConfig;
        for (let i = 0; i < keys.length - 1; i++) { if (!current[keys[i]]) current[keys[i]] = {}; current = current[keys[i]]; }
        current[keys[keys.length - 1]] = value; this.saveConfig();

        if (pathStr.startsWith('chatUserInfo.') && pathStr !== 'chatUserInfo.replacePingBarWithText') {
            document.querySelectorAll('.messageWrapper').forEach(wrapper => {
                wrapper.querySelectorAll('.cerberus-injected-status, .cerberus-injected-flag, .cerberus-injected-rank, .cerberus-injected-pingbar, .cerberus-injected-pingtext, .cerb-rank-badge').forEach(el => el.remove());
                wrapper.removeAttribute('data-cerberus-processed'); wrapper.removeAttribute('data-cerb-identity');
            });
            if (window.CerberusFCADE) {
                const cw = getActiveChannelWrapper();
                if (cw) fullChatScanScoped(cw, window.CerberusFCADE, runtimeConfig);
            }
        }
        if (pathStr === 'countryFilter.enabled' || pathStr === 'chatUserInfo.hideNegativeMessages') { updateFilterShield(); invalidateCountryFilterCache(); }
        if (pathStr === 'liveQueue.enabled') { window.CerberusState.lastUIRenderSignature = ''; }
    },
    getSetting(pathStr) {
        const keys = pathStr.split('.'); let current = runtimeConfig;
        for (const key of keys) { if (current === undefined || current === null) return undefined; current = current[key]; }
        return current;
    }
};

function isNewerVersion(latest, current) {
    if (!latest || !current) return false;
    const l = latest.replace('v', '').split('.').map(Number); const c = current.replace('v', '').split('.').map(Number);
    for (let i = 0; i < Math.max(l.length, c.length); i++) {
        const lVal = l[i] || 0; const cVal = c[i] || 0;
        if (lVal > cVal) return true; if (lVal < cVal) return false;
    } return false;
}

async function checkForUpdates() {
    const now = Date.now();
    if (!CerberusData.lastUpdateCheck || (now - CerberusData.lastUpdateCheck > 86400000)) {
        try {
            const response = await fetch('https://api.github.com/repos/Cerberus-BR/FightcadePlus/releases/latest');
            if (response.ok) {
                const data = await response.json();
                if (data && data.tag_name) { CerberusData.latestVersion = data.tag_name; CerberusData.lastUpdateCheck = now; CerberusData.save(); }
            }
        } catch (e) { }
    }
}

function t(keyPath) {
    const lang = ConfigManager.getSetting('language') || 'en'; const keys = keyPath.split('.');
    let result = Locales[lang];
    for (let k of keys) { if (result === undefined) break; result = result[k]; }
    return result || keyPath;
}

window.changeCerberusLanguage = function (lang) {
    ConfigManager.updateSetting('language', lang);
    const panel = document.getElementById('cerberusPanel');
    if (panel) {
        const oldTop = panel.style.top; const oldLeft = panel.style.left; const oldTransform = panel.style.transform;
        const activeTab = panel.querySelector('.tab.active')?.dataset.tab || 'settings';
        panel.remove(); createControlPanel();
        const newPanel = document.getElementById('cerberusPanel');
        newPanel.style.top = oldTop; newPanel.style.left = oldLeft; newPanel.style.transform = oldTransform; newPanel.style.display = 'flex';
        const newTabBtn = newPanel.querySelector(`.tab[data-tab="${activeTab}"]`); if (newTabBtn) newTabBtn.click();
    }
    const menu = document.getElementById('cerbGlobalMenu'); if (menu) menu.remove();
    injectGlobalMenu(); window.CerberusState.lastUIRenderSignature = '';
    const queuePanel = document.getElementById('cerberusQueueWindow');
    if (queuePanel) { queuePanel.remove(); if (ConfigManager.getSetting('liveQueue.enabled')) createQueuePanel(); }
    const searchInput = document.getElementById('cerbPlayerSearchInput'); if (searchInput) searchInput.placeholder = t('sidebar.search');
};

function normalizeUsername(username) { return !username ? '' : username.replace(/\s+/g, ' ').trim(); }
function isSystemUser(username) { return !username || username === '<offline>' || username.startsWith('<'); }
function extractMinPing(title) {
    if (!title) return null;
    const match = title.match(/(\d+)~(\d+)/); if (match) return parseInt(match[1]);
    const single = title.match(/(\d+)/); return single ? parseInt(single[1]) : null;
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
    const cw = getActiveChannelWrapper(); const inputEl = cw ? cw.querySelector('.chatInput input.input') : null;
    if (!inputEl) return;
    const nativeSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set;
    nativeSetter.call(inputEl, command);
    inputEl.dispatchEvent(new Event('input', { bubbles: true }));
    inputEl.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', code: 'Enter', keyCode: 13, which: 13, bubbles: true }));
}

async function executeChatMacro(lines) {
    const cw = getActiveChannelWrapper(); const inputEl = cw ? cw.querySelector('.chatInput input.input') : null;
    if (!inputEl || !lines || lines.length === 0) return;
    const nativeSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set;
    const currentVal = inputEl.value;
    for (const line of lines) {
        nativeSetter.call(inputEl, line); inputEl.dispatchEvent(new Event('input', { bubbles: true })); inputEl.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', keyCode: 13, bubbles: true }));
        await new Promise(r => setTimeout(r, 250));
    }
    await new Promise(r => setTimeout(r, 50));
    nativeSetter.call(inputEl, currentVal); inputEl.dispatchEvent(new Event('input', { bubbles: true }));
}

const connectToChannelWhenAvailable = (FCADE, autoJoinConfig) => {
    let attempts = 0;
    const checkInterval = setInterval(() => {
        attempts++; if (attempts > 120) { clearInterval(checkInterval); return; }
        if (FCADE.initializingApp === false) {
            clearInterval(checkInterval);
            if (autoJoinConfig?.channelId) FCADE.selectChannel(autoJoinConfig.channelId);
            else { const gameChannels = FCADE.channels.filter(ch => 'gameid' in ch); if (gameChannels.length > 0) FCADE.selectChannel(gameChannels[0].id); }
        }
    }, 500);
};

let mainLoopInterval = null;
let replyQueueInterval = null;

const runPlugin = (FCADE) => {
    console.log(`🐺 Cerberus v${CURRENT_VERSION} (Fightcade Plus) Inicializado`);
    window.CerberusFCADE = FCADE;

    CerberusData.load(); ConfigManager.loadConfig(); RankCache.load();
    window.CerberusState.replyQueue = []; window.CerberusState.sidebarSearchTerm = '';

    updateFilterShield(); checkForUpdates();
    if (runtimeConfig.autoJoin?.enabled !== false) connectToChannelWhenAvailable(FCADE, runtimeConfig.autoJoin);

    injectStyles(); injectGlobalMenu(); createControlPanel();
    if (runtimeConfig.liveQueue?.enabled === true) createQueuePanel();

    if (mainLoopInterval) clearInterval(mainLoopInterval);
    mainLoopInterval = setInterval(() => {
        try {
            const qEnabled = ConfigManager.getSetting('liveQueue.enabled') === true;
            const countryEnabled = ConfigManager.getSetting('countryFilter.enabled') === true;
            const currentSignature = `${FCADE?.activeChannelId || ''}|${qEnabled}|${countryEnabled}`;

            if (window.CerberusState.lastUIRenderSignature !== currentSignature) {
                const cw = getActiveChannelWrapper();
                if (cw) {
                    injectHeaderButtons(FCADE); injectSidebarSearch(); injectUIEnhancements();
                    window.CerberusState.lastUIRenderSignature = currentSignature;
                    // Trigger initial Scans on New Room
                    fullChatScanScoped(cw, FCADE, runtimeConfig);
                    const sidebar = cw.querySelector('.usersListWrapper');
                    if (sidebar) updateSidebarScope(sidebar, FCADE, runtimeConfig);
                }
            }

            attachMultiObservers(FCADE, runtimeConfig);
            if (runtimeConfig.chatUserInfo?.unlockColorThemes !== false) unlockColorThemes();
        } catch (err) { }
    }, 1000);

    if (replyQueueInterval) clearInterval(replyQueueInterval);
    replyQueueInterval = setInterval(() => {
        if (window.CerberusState.liveMasterOn && window.CerberusState.replyQueue.length > 0 && ConfigManager.getSetting('liveQueue.autoReply')) {
            const names = window.CerberusState.replyQueue.join(', '); window.CerberusState.replyQueue = [];
            const msg1 = `\`[Fila] Bem-vindo(s): ${names}\``; let queueStr = CerberusData.liveQueue.filter(p => !p.played).map((p, i) => `${i + 1}. ${p.name}`).join(', ');
            executeChatMacro(queueStr ? [msg1, `*Fila atual:* ${queueStr}`] : [msg1]);
        } else { window.CerberusState.replyQueue = []; }
    }, 15000);

    setTimeout(() => applyTheme(CerberusData.selectedTheme), 2500);

    window.CerberusState.menuCleanupInterval = setInterval(() => {
        const menu = document.getElementById('cerbGlobalMenu');
        if (menu && menu.classList.contains('visible') && !window.CerberusState.menuIsHovered) menu.classList.remove('visible');
    }, 3000);
    scheduleAutoSync(FCADE);
};

// ==================== MULTI-ROOM OBSERVERS & BATCHING (MACROTASKS) ====================
function attachMultiObservers(FCADE, configFull) {
    document.querySelectorAll('.chatContent:not([data-cerb-observed])').forEach(chatContent => {
        chatContent.dataset.cerbObserved = "true";
        if (configFull.chatUserInfo?.blurMode === 'all') chatContent.classList.add('blur-all');
        else chatContent.classList.remove('blur-all');

        const pendingWrappers = new Set();
        let chatTimeout = null;

        const observer = new MutationObserver(mutations => {
            let hasChanges = false;
            mutations.forEach(mut => {
                if (mut.type === 'childList') {
                    mut.addedNodes.forEach(node => {
                        if (node.nodeType === 1) {
                            if (node.classList?.contains('messageWrapper')) { pendingWrappers.add(node); hasChanges = true; }
                            else { const w = node.closest('.messageWrapper'); if (w) { pendingWrappers.add(w); hasChanges = true; } }
                        }
                    });
                } else if (mut.type === 'attributes') {
                    const w = mut.target.closest('.messageWrapper'); if (w) { pendingWrappers.add(w); hasChanges = true; }
                }
            });

            if (hasChanges) {
                clearTimeout(chatTimeout);
                chatTimeout = setTimeout(() => {
                    const wrappersArray = Array.from(pendingWrappers);
                    pendingWrappers.clear();
                    processCollectedWrappers(wrappersArray, FCADE, configFull);
                }, 200);
            }
        });
        observer.observe(chatContent, { childList: true, subtree: true, attributes: true, attributeFilter: ['class'] });
    });

    document.querySelectorAll('.usersListWrapper:not([data-cerb-observed])').forEach(sidebar => {
        sidebar.dataset.cerbObserved = "true";
        let sidebarTimeout = null;

        const observer = new MutationObserver(() => {
            clearTimeout(sidebarTimeout);
            sidebarTimeout = setTimeout(() => {
                updateSidebarScope(sidebar, FCADE, configFull);
            }, 600);
        });
        observer.observe(sidebar, { childList: true, subtree: true });
    });
}

function processCollectedWrappers(wrappersArray, FCADE, configFull) {
    if (!wrappersArray || wrappersArray.length === 0) return;

    // [CERBERUS 1.11.0] Early Return (Renderização Preguiçosa para Salas Ocultas)
    const cw = wrappersArray[0].closest('.channelWrapper');
    if (cw && cw.style.display === 'none') return;

    const activeGameId = getActiveGameId(FCADE, cw);
    const globalUsers = FCADE.globalUsers || {};

    const activeChannelId = FCADE.activeChannelId;
    const usersList = FCADE.$refs[activeChannelId]?.[0]?.$refs?.usersList?.$children;

    // [CERBERUS 1.11.0] Mapa O(1) para resolver pesquisa em O(N) e salvar a Main Thread
    const activeUsersMap = new Map();
    if (usersList && usersList.length > 0) {
        for (let i = 0; i < usersList.length; i++) {
            const child = usersList[i];
            if (child && child.user && child.user.id) activeUsersMap.set(child.user.id, child);
        }
    }

    wrappersArray.forEach(wrapper => {
        checkAndProcessWrapper(wrapper, FCADE, configFull.chatUserInfo, configFull.countryFilter, configFull.liveQueue, globalUsers, activeGameId, activeUsersMap);
    });
}

function fullChatScanScoped(channelWrapper, FCADE, configFull) {
    if (!channelWrapper) return;
    const wrappersArray = Array.from(channelWrapper.querySelectorAll('.messageWrapper'));
    processCollectedWrappers(wrappersArray, FCADE, configFull);
}

function checkAndProcessWrapper(wrapper, FCADE, cfg, filterCfg, queueCfg, globalUsers, activeGameId, activeUsersMap) {
    const isImmuneSystem = wrapper.querySelector('.endgameMessageWrapper') !== null || wrapper.classList.contains('endgame') || wrapper.classList.contains('challengeRequested') || wrapper.classList.contains('requestChallenge');
    let identity = wrapper.className; const authorEl = wrapper.querySelector('span.author');
    if (authorEl) identity += '-' + authorEl.textContent.trim();
    else { const chalName = wrapper.querySelector('.challengeContent .name'); if (chalName) identity += '-chal-' + chalName.textContent.trim(); else identity += '-' + (wrapper.textContent.substring(0, 20).trim()); }

    if (wrapper.dataset.cerbIdentity !== identity) {
        wrapper.removeAttribute('data-cerberus-processed'); wrapper.removeAttribute('data-cerberus-hidden'); wrapper.style.display = '';
        wrapper.querySelectorAll('.cerberus-injected-status, .cerberus-injected-flag, .cerberus-injected-rank, .cerberus-injected-pingbar, .cerberus-injected-pingtext, .cerb-rank-badge').forEach(el => el.remove());
        wrapper.dataset.cerbIdentity = identity;
    }

    if (!wrapper.dataset.cerberusProcessed) {
        if (isImmuneSystem) { wrapper.dataset.cerberusHidden = "false"; wrapper.style.display = ''; } else {
            const msg = wrapper.querySelector('.message.chat');
            if (msg) {
                const author = msg.querySelector('span.author');
                if (author) {
                    let userKey = normalizeUsername(author.textContent);
                    if (userKey) {
                        if (queueCfg?.enabled && queueCfg.keyword && window.CerberusState.liveMasterOn) {
                            let msgText = ''; msg.querySelectorAll('.blocksContainer .blocks .regular').forEach(span => { msgText += span.textContent; });
                            msgText = msgText.trim().toLowerCase(); const streamerNick = queueCfg.streamerNick || '';
                            if (msgText === queueCfg.keyword.toLowerCase() && userKey.toLowerCase() !== streamerNick.toLowerCase()) {
                                if (CerberusData.addQueue(userKey)) { playPopSound(); if (!window.CerberusState.replyQueue) window.CerberusState.replyQueue = []; window.CerberusState.replyQueue.push(userKey); }
                            }
                        }
                        const user = globalUsers[userKey]; let userCountry = user ? user.country?.iso_code?.toUpperCase() : null;

                        const userFound = activeUsersMap ? activeUsersMap.get(userKey) : null;
                        const minPingVal = getMinPing(userFound);

                        let statusState = 'offline'; if (user && user.away === false) statusState = 'online'; else if (user && user.away === true) statusState = 'away';
                        if (cfg.showNumericRanks && activeGameId) { const numericRank = RankCache.getRank(activeGameId, userKey); if (numericRank !== null) author.appendChild(createRankBadge(numericRank)); }

                        const elements = {
                            status: cfg.enableStatus ? createStatusElement(statusState) : null,
                            flag: (cfg.enableFlag && user?.country) ? createFlagElement(user.country) : null,
                            rank: (cfg.enableRank && userFound?.rankSrc) ? createRankElement(userFound.rankSrc, userFound.rankTitle) : null,
                            pingBar: (cfg.enablePingBars && userFound?.pingSrc) ? createPingElement(userFound.pingSrc, userFound.pingTitle) : null,
                            pingText: (cfg.enablePingText && minPingVal !== null) ? createPingTextElement(minPingVal) : null
                        };

                        if (cfg.enableReputation && !isSystemUser(userKey)) { applyReputationStyle(author, wrapper.querySelector('.message.chat') || wrapper, userKey, 'chat', false); addReputationControlsToElement(author, wrapper, userKey, 'chat', cfg.hideNegativeMessages); }
                        if (elements.status) author.parentElement.insertBefore(elements.status, author);
                        if (elements.flag) author.appendChild(elements.flag); if (elements.rank) author.appendChild(elements.rank); if (elements.pingBar) author.appendChild(elements.pingBar); if (elements.pingText) author.appendChild(elements.pingText);
                        // blur-individual removed in v1.11.1 — only 'all' mode is supported
                        wrapper.dataset.cerberusUser = userKey; if (userCountry) wrapper.dataset.cerberusCountry = userCountry;
                    }
                }
            } else { wrapper.dataset.cerberusHidden = "false"; wrapper.style.display = ''; }
        }
        wrapper.dataset.cerberusProcessed = "true";
    }

    const countryFilterEnabled = filterCfg?.enabled === true; const hideNeg = cfg?.hideNegativeMessages;
    if (isImmuneSystem || (!countryFilterEnabled && !hideNeg)) { if (wrapper.dataset.cerberusHidden === "true") { wrapper.style.display = ''; wrapper.dataset.cerberusHidden = "false"; } return; }

    const msgNode = wrapper.querySelector('.message.chat');
    if (!msgNode || isSystemUser(wrapper.dataset.cerberusUser)) { if (wrapper.dataset.cerberusHidden === "true") { wrapper.style.display = ''; wrapper.dataset.cerberusHidden = "false"; } return; }

    const userKey = wrapper.dataset.cerberusUser; const userCountry = wrapper.dataset.cerberusCountry;
    let shouldHide = (hideNeg && CerberusData.isNegative(userKey)) || (countryFilterEnabled && !CerberusData.isCountryAllowed(userCountry) && !CerberusData.isPositive(userKey));

    if (shouldHide && wrapper.dataset.cerberusHidden !== "true") { wrapper.style.display = 'none'; wrapper.dataset.cerberusHidden = "true"; }
    else if (!shouldHide && wrapper.dataset.cerberusHidden !== "false") { wrapper.style.display = ''; wrapper.dataset.cerberusHidden = "false"; }
}

const updateSidebarScope = (sidebarElement, FCADE, configFull) => {
    if (!sidebarElement) return;

    // [CERBERUS 1.11.1] Early Return (Renderização Preguiçosa)
    const cw = sidebarElement.closest('.channelWrapper');
    if (cw && cw.style.display === 'none') return;

    const globalUsers = FCADE.globalUsers; if (!globalUsers) return;

    const cfg = configFull.chatUserInfo; const countryFilterEnabled = configFull.countryFilter?.enabled === true;
    const activeGameId = getActiveGameId(FCADE, cw);
    const searchTerm = window.CerberusState.sidebarSearchTerm || '';

    if (cfg?.replacePingBarWithText) document.body.classList.add('cerb-hide-sidebar-ping'); else document.body.classList.remove('cerb-hide-sidebar-ping');

    sidebarElement.querySelectorAll('.usersIgnoredTitle').forEach(titleEl => titleEl.childNodes.forEach(node => { if (node.nodeType === Node.TEXT_NODE && node.nodeValue.includes('Ignored')) node.nodeValue = node.nodeValue.replace('Ignored', 'Blocked'); }));

    sidebarElement.querySelectorAll('.userItem').forEach(item => {
        try {
            const playerNameEl = item.querySelector('.playerName'); if (!playerNameEl) return;
            const userKey = normalizeUsername(playerNameEl.textContent); if (!userKey) return;

            if (item.dataset.cerbIdentity !== userKey) {
                item.removeAttribute('data-cerberus-processed'); item.removeAttribute('data-cerb-search-hidden'); item.removeAttribute('data-country-blocked');
                item.style.display = ''; item.querySelectorAll('.cerberus-ping-text, .cerb-rank-badge').forEach(el => el.remove()); item.dataset.cerbIdentity = userKey;
            }
            item.dataset.currentUser = userKey;
            let matchesSearch = searchTerm === '' || userKey.toLowerCase().includes(searchTerm);

            if (cfg.showNumericRanks && activeGameId) {
                const numericRank = RankCache.getRank(activeGameId, userKey); let badge = item.querySelector('.cerb-rank-badge');
                if (numericRank !== null) {
                    if (!badge) {
                        badge = createRankBadge(numericRank); const rankEl = item.querySelector('.rankWrapper, .rank');
                        if (rankEl && rankEl.parentNode) rankEl.parentNode.insertBefore(badge, rankEl);
                        else { const pingWrapper = item.querySelector('.pingWrapper'); if (pingWrapper && pingWrapper.parentNode) pingWrapper.parentNode.insertBefore(badge, pingWrapper); }
                    } else badge.textContent = `🏅${numericRank}`;
                } else if (badge) badge.remove();
            } else { const badge = item.querySelector('.cerb-rank-badge'); if (badge) badge.remove(); }

            if (cfg?.enableReputation) { applyReputationStyle(playerNameEl, item, userKey, 'list'); addReputationControlsToElement(playerNameEl, item, userKey, 'list'); }

            if (cfg?.replacePingBarWithText) {
                const pingWrapper = item.querySelector('.pingWrapper');
                if (pingWrapper) {
                    const img = pingWrapper.querySelector('img.ping'); const minPing = extractMinPing(img ? img.title : pingWrapper.title);
                    if (minPing !== null) {
                        let color = minPing < 60 ? '#00ff00' : (minPing > 90 ? '#ff4444' : '#aaa');
                        let txt = pingWrapper.querySelector('.cerberus-ping-text');
                        if (!txt) { txt = document.createElement('span'); txt.className = 'cerberus-ping-text'; Object.assign(txt.style, { fontSize: '11px', fontWeight: 'bold', marginLeft: 'auto', verticalAlign: 'middle' }); pingWrapper.appendChild(txt); }
                        txt.style.color = color; txt.innerText = `${minPing}ms`;
                    }
                }
            } else { const pingWrapper = item.querySelector('.pingWrapper'); if (pingWrapper) { const txt = pingWrapper.querySelector('.cerberus-ping-text'); if (txt) txt.remove(); } }

            let userCountry = globalUsers[userKey]?.country?.iso_code?.toUpperCase();
            if (!userCountry) { const flagEl = item.querySelector('.flagWrapper'); if (flagEl && flagEl.title) userCountry = COUNTRY_NAME_TO_CODE[flagEl.title]; }

            let isBlockedByCountry = countryFilterEnabled && !CerberusData.isCountryAllowed(userCountry) && !CerberusData.isPositive(userKey);

            if (!matchesSearch || isBlockedByCountry) { item.style.display = 'none'; item.dataset.cerbSearchHidden = !matchesSearch ? "true" : "false"; item.dataset.countryBlocked = isBlockedByCountry ? "true" : "false"; }
            else { item.style.display = ''; item.dataset.cerbSearchHidden = "false"; item.dataset.countryBlocked = "false"; }
            item.dataset.cerberusProcessed = "true";
        } catch (e) { }
    });

    sidebarElement.querySelectorAll('.matchesList .matchItem').forEach(match => {
        try {
            let shouldHideMatch = countryFilterEnabled; let matchesSearch = false; let identity = ''; const players = match.querySelectorAll('.playerInfo');
            players.forEach(playerInfo => {
                const playerNameEl = playerInfo.querySelector('.playerName'); if (!playerNameEl) return;
                const userKey = normalizeUsername(playerNameEl.textContent); if (!userKey) return;
                identity += userKey + '-'; playerInfo.dataset.currentUser = userKey;
                if (searchTerm === '' || userKey.toLowerCase().includes(searchTerm)) matchesSearch = true;
                if (cfg?.enableReputation) { applyReputationStyle(playerNameEl, null, userKey, 'match'); addReputationControlsToElement(playerNameEl, playerInfo, userKey, 'match'); }
                if (countryFilterEnabled && shouldHideMatch && !isSystemUser(userKey)) {
                    let userCountry = globalUsers[userKey]?.country?.iso_code?.toUpperCase();
                    if (!userCountry) { const flagEl = playerInfo.querySelector('.playerFlag'); if (flagEl && flagEl.title) userCountry = COUNTRY_NAME_TO_CODE[flagEl.title]; }
                    if (CerberusData.isCountryAllowed(userCountry) || CerberusData.isPositive(userKey)) shouldHideMatch = false;
                }
            });

            if (match.dataset.cerbIdentity !== identity) { match.removeAttribute('data-cerberus-processed'); match.removeAttribute('data-country-blocked'); match.style.display = ''; match.dataset.cerbIdentity = identity; }
            if ((searchTerm !== '' && !matchesSearch) || (countryFilterEnabled && shouldHideMatch && players.length > 0)) { match.style.display = 'none'; match.dataset.countryBlocked = "true"; }
            else { match.style.display = ''; match.dataset.countryBlocked = "false"; }
            match.dataset.cerberusProcessed = "true";
        } catch (e) { }
    });
};

function scheduleAutoSync(FCADE) {
    if (ConfigManager.getSetting('chatUserInfo.showNumericRanks') !== true) return;
    const todayStr = new Date().toISOString().slice(0, 10);
    if (RankCache._autoSyncDate === todayStr) return;

    let attempts = 0;
    const poll = setInterval(async () => {
        attempts++; if (attempts > 120) { clearInterval(poll); return; }
        if (FCADE.initializingApp !== false) return;
        const gameId = getActiveGameId(FCADE); if (!gameId) return;
        clearInterval(poll);
        const lastSync = RankCache.data[gameId]?.lastUpdate || 0;
        if (Date.now() - lastSync < 86400000) { RankCache._autoSyncDate = todayStr; return; }
        RankCache._autoSyncDate = todayStr;
        const savedLastUpdate = RankCache.data[gameId]?.lastUpdate;
        if (RankCache.data[gameId]) RankCache.data[gameId].lastUpdate = 0;
        await RankCache.syncRankings(gameId);
        if (savedLastUpdate && RankCache.data[gameId] && RankCache.data[gameId].lastUpdate === 0) RankCache.data[gameId].lastUpdate = savedLastUpdate;
    }, 500);
}

function triggerPromoBot() {
    if (!window.CerberusState.liveMasterOn || !ConfigManager.getSetting('liveQueue.promoEnabled')) return;
    const msg = ConfigManager.getSetting('liveQueue.promoMessage');
    if (!msg || msg.trim() === '') return;
    executeChatMacro(msg.split(/\\n|\n/));
}

function setSyncBtnState(btn, isLocked) {
    if (!btn) return; btn.style.opacity = isLocked ? '0.3' : '1'; btn.style.cursor = isLocked ? 'not-allowed' : 'pointer'; btn.title = t(isLocked ? 'sync.wait30' : 'sync.rankingsBtn');
}

function injectHeaderButtons(FCADE) {
    const cw = getActiveChannelWrapper(); const headerTitle = cw ? cw.querySelector('.usersOnlineTitle') : null;
    if (!headerTitle) return;
    headerTitle.style.display = 'flex'; headerTitle.style.alignItems = 'center';

    if (!headerTitle.querySelector('#cerberusBtn')) {
        const btn = document.createElement('span'); btn.id = 'cerberusBtn'; btn.textContent = '⚙️'; btn.title = t('btnTitle');
        Object.assign(btn.style, { cursor: 'pointer', fontSize: '16px', marginLeft: 'auto', marginRight: '8px', opacity: '0.8' });
        btn.addEventListener('click', (e) => { e.stopPropagation(); const panel = document.getElementById('cerberusPanel'); if (panel) panel.style.display = panel.style.display === 'none' ? 'flex' : 'none'; });
        headerTitle.appendChild(btn);
    }

    const showRankBtn = ConfigManager.getSetting('chatUserInfo.showNumericRanks') === true;
    const existingSyncBtn = headerTitle.querySelector('#cerberusSyncBtn');
    const gameId = getActiveGameId(FCADE); const isLocked = (Date.now() - (RankCache.data[gameId]?.lastUpdate || 0) < 1800000);

    if (showRankBtn) {
        if (!existingSyncBtn) {
            const syncBtn = document.createElement('button'); syncBtn.id = 'cerberusSyncBtn'; syncBtn.textContent = '🔄';
            Object.assign(syncBtn.style, { cursor: 'pointer', fontSize: '15px', background: 'transparent', border: 'none', borderRadius: '50%', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', outline: 'none', padding: '0', marginRight: '5px', transition: 'background 0.2s' });
            setSyncBtnState(syncBtn, isLocked);
            syncBtn.addEventListener('click', (e) => { e.stopPropagation(); if (RankCache.isSyncing) RankCache.cancelSync(); else { const cId = getActiveGameId(FCADE); if (cId) RankCache.syncRankings(cId); } });
            headerTitle.insertBefore(syncBtn, headerTitle.querySelector('#cerberusBtn'));
        } else if (!RankCache.isSyncing) setSyncBtnState(existingSyncBtn, isLocked);
    } else if (existingSyncBtn) existingSyncBtn.remove();
}

function injectSidebarSearch() {
    const cw = getActiveChannelWrapper(); const headerTitle = cw ? cw.querySelector('.usersOnlineTitle') : null;
    if (!headerTitle) return;
    const sidebarParent = headerTitle.parentNode;
    if (!sidebarParent.querySelector('#cerbPlayerSearchContainer')) {
        const container = document.createElement('div'); container.id = 'cerbPlayerSearchContainer';
        Object.assign(container.style, { padding: '6px 12px', background: 'rgba(0,0,0,0.15)', borderBottom: '1px solid rgba(255,255,255,0.05)', flexShrink: '0', width: '100%', boxSizing: 'border-box', display: 'flex', alignItems: 'center' });
        const input = document.createElement('input'); input.type = 'text'; input.id = 'cerbPlayerSearchInput'; input.placeholder = t('sidebar.search');
        Object.assign(input.style, { width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '4px', color: '#fff', padding: '5px 8px', fontSize: '12px', outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.2s' });
        input.addEventListener('focus', () => input.style.borderColor = '#667eea'); input.addEventListener('blur', () => input.style.borderColor = 'rgba(255,255,255,0.1)');
        let searchDebounce;
        input.addEventListener('input', (e) => {
            clearTimeout(searchDebounce);
            searchDebounce = setTimeout(() => { window.CerberusState.sidebarSearchTerm = e.target.value.toLowerCase().trim(); updateFilterShield(); if (window.CerberusFCADE && runtimeConfig) { const cwl = getActiveChannelWrapper(); if (cwl) updateSidebarScope(cwl.querySelector('.usersListWrapper'), window.CerberusFCADE, runtimeConfig); } }, 300);
        });
        container.appendChild(input); headerTitle.parentNode.insertBefore(container, headerTitle.nextSibling);
    }
}

function injectUIEnhancements() {
    const cw = getActiveChannelWrapper(); const chatWrapper = cw ? cw.querySelector('.chatWrapper') : null;
    if (!chatWrapper) return;
    injectMuteChatFab(chatWrapper);
    if (!chatWrapper.querySelector('.cerb-clear-chat-fab')) {
        const clearBtn = document.createElement('button'); clearBtn.className = 'cerb-clear-chat-fab'; clearBtn.innerHTML = t('motd.clearChat');
        clearBtn.addEventListener('click', () => executeChatCommand('/clear')); chatWrapper.appendChild(clearBtn);
    }
    const qEnabled = ConfigManager.getSetting('liveQueue.enabled') === true;
    const existingFab = chatWrapper.querySelector('.cerb-queue-fab'); const existingWindow = document.getElementById('cerberusQueueWindow');
    if (qEnabled) {
        if (!existingFab) {
            const queueBtn = document.createElement('button'); queueBtn.className = 'cerb-queue-fab'; queueBtn.innerHTML = t('motd.queueTitle');
            queueBtn.addEventListener('click', () => { const panel = document.getElementById('cerberusQueueWindow'); if (panel) { panel.style.display = panel.style.display === 'none' ? 'flex' : 'none'; if (panel.style.display === 'flex') renderQueueList(); } });
            chatWrapper.appendChild(queueBtn);
        }
        createQueuePanel();
    } else { if (existingFab) existingFab.remove(); if (existingWindow) existingWindow.remove(); }
    const motdWrapper = chatWrapper.querySelector('.messageWrapper.motd');
    if (motdWrapper && CerberusData.latestVersion && isNewerVersion(CerberusData.latestVersion, CURRENT_VERSION) && motdWrapper.dataset.cerbUpdateAdded !== "true") {
        const updateNotice = document.createElement('div'); updateNotice.className = 'cerb-motd-update-notice';
        updateNotice.innerHTML = `🐺 <b>${t('motd.updateAvail')} ${CerberusData.latestVersion}</b> <a href="https://github.com/Cerberus-BR/FightcadePlus/releases/latest" target="_blank" style="color: #4ade80; text-decoration: underline; margin-left: 10px;">Download</a>`;
        const blocksContainer = motdWrapper.querySelector('.blocksContainer');
        if (blocksContainer) blocksContainer.appendChild(updateNotice); else motdWrapper.appendChild(updateNotice);
        motdWrapper.dataset.cerbUpdateAdded = "true";
    }
}

function syncMuteFab(btn) {
    const checkbox = document.getElementById('chatMuted'); const isMuted = checkbox ? checkbox.checked : false;
    btn.dataset.muted = isMuted ? 'true' : 'false'; btn.innerHTML = isMuted ? `<span class="cerb-mute-dot active"></span> ${t('motd.muteChat')}` : `<span class="cerb-mute-dot"></span> ${t('motd.muteChat')}`;
}

function injectMuteChatFab(chatWrapper) {
    if (chatWrapper.querySelector('.cerb-mute-chat-fab')) { syncMuteFab(chatWrapper.querySelector('.cerb-mute-chat-fab')); return; }
    const muteBtn = document.createElement('button'); muteBtn.className = 'cerb-mute-chat-fab'; syncMuteFab(muteBtn);
    muteBtn.addEventListener('click', () => { const checkbox = document.getElementById('chatMuted'); if (!checkbox) return; checkbox.click(); syncMuteFab(muteBtn); });
    const observer = new MutationObserver(() => syncMuteFab(muteBtn)); const checkbox = document.getElementById('chatMuted');
    if (checkbox) observer.observe(checkbox, { attributes: true, attributeFilter: ['checked'] });
    chatWrapper.appendChild(muteBtn);
}

function createQueuePanel() {
    if (document.getElementById('cerberusQueueWindow')) return;
    const panel = document.createElement('div'); panel.id = 'cerberusQueueWindow'; panel.style.display = 'none';
    panel.innerHTML = `<div class="q-header" id="cerberusQueueHeader"><span class="q-title">📝 ${t('queue.title')} <small id="cerbQueueCount">(0)</small></span><button class="q-close" id="cerbQueueCloseBtn">×</button></div><div class="q-add-box"><input type="text" id="cerbQueueInput" placeholder="${t('queue.inputPh')}"><button id="cerbQueueAddBtn">${t('queue.addBtn')}</button></div><div class="q-list" id="cerbQueueList"></div><div class="q-footer" style="display:flex; justify-content:space-between;"><button id="cerbLiveMasterBtn" class="q-live-btn off">${t('sync.liveOff')}</button><button id="cerbQueueClearBtn" class="q-clear-btn">🧹 ${t('queue.clearBtn')}</button></div>`;
    document.body.appendChild(panel); makeDraggable(panel, 'cerberusQueueHeader');

    // Binding CSP Compliant
    document.getElementById('cerbQueueCloseBtn').addEventListener('click', () => panel.style.display = 'none');

    const masterBtn = document.getElementById('cerbLiveMasterBtn');
    if (window.CerberusState.liveMasterOn) { masterBtn.className = 'q-live-btn on'; masterBtn.innerHTML = t('sync.liveOn'); }
    masterBtn.addEventListener('click', (e) => {
        const btn = e.currentTarget;
        if (btn.classList.contains('off')) { window.CerberusState.liveMasterOn = true; btn.className = 'q-live-btn on'; btn.innerHTML = t('sync.liveOn'); triggerPromoBot(); window.CerberusState.promoBotInterval = setInterval(triggerPromoBot, 600000); }
        else { window.CerberusState.liveMasterOn = false; btn.className = 'q-live-btn off'; btn.innerHTML = t('sync.liveOff'); clearInterval(window.CerberusState.promoBotInterval); }
    });

    document.getElementById('cerbQueueAddBtn').addEventListener('click', () => { const input = document.getElementById('cerbQueueInput'); CerberusData.addQueue(input.value); input.value = ''; });
    document.getElementById('cerbQueueInput').addEventListener('keypress', (e) => { if (e.key === 'Enter') { CerberusData.addQueue(e.target.value); e.target.value = ''; } });
    document.getElementById('cerbQueueClearBtn').addEventListener('click', () => { if (CerberusData.liveQueue.length === 0 || confirm(t('sync.confirmClear'))) CerberusData.clearQueue(); });
    renderQueueList();
}

function renderQueueList() {
    const listEl = document.getElementById('cerbQueueList'); const countEl = document.getElementById('cerbQueueCount');
    if (!listEl || !countEl) return;
    listEl.innerHTML = ''; const limit = ConfigManager.getSetting('liveQueue.limit') || 20; countEl.innerText = `(${CerberusData.liveQueue.length}/${limit})`;
    if (CerberusData.liveQueue.length === 0) { listEl.innerHTML = `<div class="q-empty">${t('queue.empty')}</div>`; return; }
    CerberusData.liveQueue.forEach((player, index) => {
        const item = document.createElement('div'); item.className = 'q-item';
        const nameSpan = document.createElement('span'); nameSpan.className = 'q-name'; if (player.played) nameSpan.classList.add('played'); nameSpan.innerText = `${index + 1}. ${player.name}`;
        const controls = document.createElement('div'); controls.className = 'q-controls';
        const btnPlay = document.createElement('button'); btnPlay.innerHTML = player.played ? '↩️' : '✅'; btnPlay.title = t('queue.mark'); btnPlay.addEventListener('click', () => CerberusData.togglePlayedQueue(index));
        const btnUp = document.createElement('button'); btnUp.innerHTML = '⬆️'; btnUp.title = t('queue.up'); btnUp.disabled = index === 0; if (!btnUp.disabled) btnUp.addEventListener('click', () => CerberusData.moveQueue(index, -1));
        const btnDown = document.createElement('button'); btnDown.innerHTML = '⬇️'; btnDown.title = t('queue.down'); btnDown.disabled = index === CerberusData.liveQueue.length - 1; if (!btnDown.disabled) btnDown.addEventListener('click', () => CerberusData.moveQueue(index, 1));
        const btnDel = document.createElement('button'); btnDel.innerHTML = '❌'; btnDel.title = t('queue.remove'); btnDel.className = 'danger'; btnDel.addEventListener('click', () => CerberusData.removeQueue(index));
        controls.append(btnPlay, btnUp, btnDown, btnDel); item.append(nameSpan, controls); listEl.appendChild(item);
    });
}

function injectGlobalMenu() {
    if (document.getElementById('cerbGlobalMenu')) return;
    const menu = document.createElement('div'); menu.id = 'cerbGlobalMenu';
    menu.innerHTML = `<span id="cerbBtnQueueAdd" title="${t('queue.addBtn')}" style="font-size:16px;">➕</span><div class="cerb-menu-divider" id="cerbDivQueue"></div><span id="cerbBtnLike" title="${t('rep.like')}">👍</span><span id="cerbBtnDislike" title="${t('rep.dislike')}">👎</span><span id="cerbBtnClear" title="${t('rep.clear')}">🧹</span><div class="cerb-menu-divider"></div><span id="cerbBtnBlock" title="${t('rep.block')}">🚫</span><span id="cerbBtnUnblock" title="${t('rep.unblock')}">🟢</span>`;
    document.body.appendChild(menu);
    menu.addEventListener('mouseenter', () => { window.CerberusState.menuIsHovered = true; clearTimeout(window.CerberusState.menuHideTimeout); clearTimeout(window.CerberusState.menuShowTimeout); });
    menu.addEventListener('mouseleave', () => { window.CerberusState.menuIsHovered = false; window.CerberusState.menuHideTimeout = setTimeout(() => menu.classList.remove('visible'), 200); });

    const action = (fn) => {
        const userKey = menu.dataset.user; if (isSystemUser(userKey)) return; fn(userKey);
        if (menu.dataset.type === 'match') document.querySelectorAll('.playerName').forEach(el => { if (normalizeUsername(el.textContent) === userKey) applyReputationStyle(el, null, userKey, 'match'); });
        reprocessUserMessages(userKey, menu.dataset.hideNegative === 'true');
    };

    document.getElementById('cerbBtnQueueAdd').addEventListener('click', () => { const userKey = menu.dataset.user; if (!isSystemUser(userKey)) { CerberusData.addQueue(userKey); menu.classList.remove('visible'); } });
    document.getElementById('cerbBtnLike').addEventListener('click', () => action(k => CerberusData.markPositive(k))); document.getElementById('cerbBtnDislike').addEventListener('click', () => action(k => CerberusData.markNegative(k))); document.getElementById('cerbBtnClear').addEventListener('click', () => action(k => CerberusData.clearReputation(k)));

    document.getElementById('cerbBtnBlock').addEventListener('click', () => {
        const userKey = menu.dataset.user;
        if (!isSystemUser(userKey)) {
            executeChatCommand(`/ignore ${userKey}`);
            let attempts = 0;
            const scrollInterval = setInterval(() => {
                attempts++; const blockedEl = Array.from(document.querySelectorAll('.usersIgnoredList .userItem')).find(el => el.dataset.currentUser === userKey);
                if (blockedEl) {
                    const sidebarWrapper = document.querySelector('.usersListWrapper'); if (sidebarWrapper) sidebarWrapper.scrollTo({ top: sidebarWrapper.scrollHeight, behavior: 'smooth' });
                    blockedEl.classList.remove('cerberus-anim-block-pulse'); void blockedEl.offsetWidth; blockedEl.classList.add('cerberus-anim-block-pulse');
                    setTimeout(() => { if (blockedEl) blockedEl.classList.remove('cerberus-anim-block-pulse'); }, 4500); clearInterval(scrollInterval);
                } else if (attempts >= 30) clearInterval(scrollInterval);
            }, 100);
        }
        menu.classList.remove('visible');
    });
    document.getElementById('cerbBtnUnblock').addEventListener('click', () => { const userKey = menu.dataset.user; if (!isSystemUser(userKey)) executeChatCommand(`/unignore ${userKey}`); menu.classList.remove('visible'); });
}

function applyReputationStyle(nameEl, itemEl, userKey, type, hideNegative = false) {
    if (!nameEl) return; nameEl.style.color = ''; nameEl.style.fontWeight = ''; nameEl.style.textShadow = ''; nameEl.style.textDecoration = '';
    if (itemEl) { itemEl.style.backgroundColor = ''; itemEl.style.borderLeft = ''; itemEl.style.paddingLeft = ''; itemEl.style.opacity = ''; }
    if (isSystemUser(userKey)) return;
    const isPos = CerberusData.isPositive(userKey); const isNeg = CerberusData.isNegative(userKey);

    if (isPos) {
        nameEl.style.color = '#00aa00'; nameEl.style.fontWeight = 'bold';
        if (type === 'chat') { nameEl.style.textShadow = '0 0 3px rgba(0, 170, 0, 0.5)'; if (itemEl) { itemEl.style.backgroundColor = 'rgba(0, 255, 0, 0.08)'; itemEl.style.borderLeft = '3px solid #00aa00'; itemEl.style.paddingLeft = '5px'; } }
        else { nameEl.style.textShadow = '0 0 5px rgba(0, 255, 0, 0.6)'; if (itemEl && type === 'list') { itemEl.style.backgroundColor = 'rgba(0, 255, 0, 0.12)'; itemEl.style.borderLeft = '4px solid #00aa00'; } }
    } else if (isNeg) {
        nameEl.style.color = '#888'; nameEl.style.textDecoration = 'line-through';
        if (itemEl && (type === 'list' || !hideNegative)) itemEl.style.opacity = '0.35';
    }
}

function addReputationControlsToElement(playerNameEl, hoverContainer, userKey, type, hideNegative = false) {
    hoverContainer.dataset.currentUser = userKey; if (hoverContainer.dataset.cerbHoverAdded === "true") return; hoverContainer.dataset.cerbHoverAdded = "true";
    const timeEl = type === 'chat' ? hoverContainer.querySelector('.time') : null; const anchorEl = timeEl || playerNameEl;

    hoverContainer.addEventListener('mouseenter', () => {
        if (window.CerberusState.menuIsHovered) return;
        clearTimeout(window.CerberusState.menuHideTimeout);
        window.CerberusState.menuShowTimeout = setTimeout(() => {
            if (window.CerberusState.menuIsHovered) return;
            const menu = document.getElementById('cerbGlobalMenu'); if (!menu) return;
            const activeUserKey = hoverContainer.dataset.currentUser; if (isSystemUser(activeUserKey)) return;

            const isNativeBlocked = Array.from(document.querySelectorAll('.usersIgnoredList .userItem')).some(el => el.dataset.currentUser === activeUserKey);
            const isPos = CerberusData.isPositive(activeUserKey); const isNeg = CerberusData.isNegative(activeUserKey);

            const btnLike = document.getElementById('cerbBtnLike'); const btnDislike = document.getElementById('cerbBtnDislike'); const btnClear = document.getElementById('cerbBtnClear'); const btnBlock = document.getElementById('cerbBtnBlock'); const btnUnblock = document.getElementById('cerbBtnUnblock'); const divQueue = document.getElementById('cerbDivQueue'); const btnQueue = document.getElementById('cerbBtnQueueAdd');
            const qEnabled = ConfigManager.getSetting('liveQueue.enabled') === true;

            if (btnQueue) btnQueue.style.display = qEnabled ? 'inline-block' : 'none'; if (divQueue) divQueue.style.display = qEnabled ? 'block' : 'none';
            if (btnLike) btnLike.style.display = isPos ? 'none' : 'inline-block'; if (btnDislike) btnDislike.style.display = isNeg ? 'none' : 'inline-block';
            if (btnClear) btnClear.style.display = (isPos || isNeg) ? 'inline-block' : 'none';
            if (btnBlock) btnBlock.style.display = isNativeBlocked ? 'none' : 'inline-block'; if (btnUnblock) btnUnblock.style.display = isNativeBlocked ? 'inline-block' : 'none';

            menu.dataset.user = activeUserKey; menu.dataset.type = type; menu.dataset.hideNegative = hideNegative;
            const range = document.createRange(); range.selectNodeContents(anchorEl); const rect = range.getBoundingClientRect();
            const menuWidth = menu.offsetWidth || 150; let leftPos = rect.right + 12; if (leftPos + menuWidth > window.innerWidth - 10) leftPos = window.innerWidth - menuWidth - 10;
            menu.style.left = leftPos + 'px'; menu.style.top = (rect.top + rect.height / 2) + 'px'; menu.classList.add('visible');
        }, 300);
    });

    hoverContainer.addEventListener('mouseleave', () => {
        clearTimeout(window.CerberusState.menuShowTimeout);
        window.CerberusState.menuHideTimeout = setTimeout(() => { const menu = document.getElementById('cerbGlobalMenu'); if (menu) menu.classList.remove('visible'); }, 200);
    });
}

function reprocessUserMessages(userKey, hideNegative) {
    const menu = document.getElementById('cerbGlobalMenu'); if (menu) menu.classList.remove('visible');
    document.querySelectorAll('.messageWrapper').forEach(wrapper => {
        if (wrapper.dataset.cerberusUser === userKey) {
            const msg = wrapper.querySelector('.message.chat'); if (msg) { const author = msg.querySelector('span.author'); if (author) applyReputationStyle(author, msg, userKey, 'chat', hideNegative); }
            wrapper.style.display = ''; wrapper.removeAttribute('data-cerberus-hidden'); wrapper.removeAttribute('data-cerberus-processed');
            wrapper.removeAttribute('data-cerb-identity'); // Reseta a identidade para evitar badges duplicados
        }
    });
    document.querySelectorAll('.userItem').forEach(item => {
        const name = item.querySelector('.playerName');
        if (name && normalizeUsername(name.textContent) === userKey) { applyReputationStyle(name, item, userKey, 'list'); item.style.display = ''; item.removeAttribute('data-country-blocked'); item.removeAttribute('data-cerberus-processed'); item.removeAttribute('data-cerb-identity'); }
    });
    document.querySelectorAll('.matchesList .matchItem').forEach(match => {
        let hasUser = false;
        match.querySelectorAll('.playerName').forEach(name => { if (normalizeUsername(name.textContent) === userKey) { applyReputationStyle(name, null, userKey, 'match'); hasUser = true; } });
        if (hasUser) { match.style.display = ''; match.removeAttribute('data-country-blocked'); match.removeAttribute('data-cerberus-processed'); match.removeAttribute('data-cerb-identity'); }
    });
    if (runtimeConfig && window.CerberusFCADE) { const cw = getActiveChannelWrapper(); if (cw) { fullChatScanScoped(cw, window.CerberusFCADE, runtimeConfig); updateSidebarScope(cw.querySelector('.usersListWrapper'), window.CerberusFCADE, runtimeConfig); } }
}

function unlockColorThemes() {
    const themeSelect = document.querySelector('.frontendOptions select.selectValue[disabled]'); const themeTitle = document.querySelector('.frontendOptions .option .title[disabled]'); const patronExclusive = document.querySelector('.frontendOptions .patronExclusive');
    if (themeSelect) {
        themeSelect.removeAttribute('disabled'); themeSelect.style.opacity = '1'; themeSelect.style.cursor = 'pointer';
        if (!themeSelect.classList.contains('cerberus-unlocked')) { themeSelect.addEventListener('change', (e) => CerberusData.setTheme(e.target.value)); themeSelect.classList.add('cerberus-unlocked'); }
    }
    if (themeTitle) { themeTitle.removeAttribute('disabled'); themeTitle.style.opacity = '1'; }
    if (patronExclusive) patronExclusive.style.display = 'none';
}

function applyTheme(themeName) {
    const themeSelect = document.querySelector('.frontendOptions select.selectValue');
    if (themeSelect && themeName && themeName !== 'default') {
        const option = Array.from(themeSelect.options).find(opt => opt.value === themeName);
        if (option && themeSelect.value !== themeName) { themeSelect.value = themeName; themeSelect.dispatchEvent(new Event('change', { bubbles: true })); }
    }
}

function createIconSpan(className, width, height, bgUrl, title, bgRepeat) {
    const el = document.createElement('span'); el.className = className;
    const style = { width, height, display: 'inline-block', backgroundImage: `url('${bgUrl}')`, backgroundSize: 'contain', marginLeft: '5px', verticalAlign: 'middle' };
    if (bgRepeat) style.backgroundRepeat = bgRepeat; Object.assign(el.style, style); el.title = title; return el;
}

function createFlagElement(country) { return createIconSpan('flagWrapper cerberus-injected-flag', '20px', '14px', `static/flags/${country.iso_code.toLowerCase()}.png`, country.full_name, 'no-repeat'); }
function createPingElement(src, title) { return createIconSpan('pingWrapper cerberus-injected-pingbar', '15px', '15px', src, title); }
function createRankElement(src, title) { return createIconSpan('rankWrapper cerberus-injected-rank', '15px', '15px', src, title); }
function createPingTextElement(minPing) {
    const text = document.createElement('span'); text.className = `cerberus-injected-pingtext`; let color = '#aaa';
    if (minPing !== null) { if (minPing < 60) color = '#00ff00'; else if (minPing > 90) color = '#ff4444'; }
    Object.assign(text.style, { fontSize: '10px', marginLeft: '5px', fontWeight: 'normal', color: color, verticalAlign: 'middle' });
    text.innerHTML = minPing !== null ? `(${minPing}ms)` : ''; return text;
}
function createStatusElement(state) {
    const status = document.createElement('div'); status.className = `statusWrapper cerberus-injected-status`;
    let color = '#ff4444'; let shadow = 'red'; let title = 'Offline / Unknown';
    if (state === 'online') { color = '#00ff00'; shadow = 'green'; title = 'Online'; } else if (state === 'away') { color = '#ffaa00'; shadow = 'orange'; title = 'Away'; }
    status.title = title;
    Object.assign(status.style, { width: '8px', height: '8px', display: 'inline-block', borderRadius: '50%', backgroundColor: color, marginRight: '5px', flexShrink: '0', boxShadow: `0 0 2px ${shadow}`, verticalAlign: 'middle' });
    return status;
}
function createRankBadge(numericRank) {
    const badge = document.createElement('span'); badge.className = 'cerb-rank-badge';
    Object.assign(badge.style, { fontSize: '12px', fontWeight: 'normal', color: '#ffd700', backgroundColor: 'transparent', border: 'none', padding: '0', marginRight: '5px', verticalAlign: 'middle', display: 'inline-block' });
    badge.textContent = `🏅${numericRank}`; return badge;
}

function injectStyles() {
    if (document.getElementById('cerberusStyles')) return;
    const style = document.createElement('style'); style.id = 'cerberusStyles';
    style.textContent = `
        /* Master toggle: filhos bloqueados visualmente quando categoria-mãe está desativada */
        .cerb-section-children.cerb-disabled { opacity: 0.35; pointer-events: none; user-select: none; }

        /* [CERBERUS 1.11.1] Escudo CSS Anti-Piscos Universal (Fail-Safe 350ms) */
        @keyframes cerbAntiFlash {
            0%, 99% { opacity: 0; max-height: 0px; padding: 0px; margin: 0px; overflow: hidden; }
            100% { opacity: 1; max-height: 500px; }
        }
        .usersListWrapper .userItem:not([data-cerberus-processed="true"]),
        .matchesList .matchItem:not([data-cerberus-processed="true"]),
        .chatContent .messageWrapper:not([data-cerberus-processed="true"]) {
            animation: cerbAntiFlash 0.35s forwards;
        }

        #settingsTab textarea::selection, #settingsTab input::selection { background: rgba(100, 149, 237, 0.5); color: #fff; }
        #settingsTab textarea::-moz-selection, #settingsTab input::-moz-selection { background: rgba(100, 149, 237, 0.5); color: #fff; }

        @keyframes cerbSpin { 100% { transform: rotate(360deg); } }
        @keyframes cerbPulseGlow { 0%, 100% { box-shadow: 0 0 4px rgba(255, 215, 0, 0.15); } 50% { box-shadow: 0 0 12px rgba(255, 215, 0, 0.4); } }
        #cerberusSyncBtn { transition: width 0.3s ease, border-radius 0.3s ease, background 0.2s ease, padding 0.3s ease; margin-left: 8px; }
        #cerberusSyncBtn.syncing { width: auto !important; min-width: 28px; border-radius: 14px !important; background: rgba(255, 215, 0, 0.08) !important; border: 1px solid rgba(255, 215, 0, 0.25) !important; padding: 0 10px !important; cursor: pointer !important; opacity: 1 !important; animation: cerbPulseGlow 2.5s ease-in-out infinite; gap: 5px; }
        #cerberusSyncBtn.syncing .cerb-spin-icon { display: inline-block; width: 12px; height: 12px; border: 2px solid rgba(255, 215, 0, 0.25); border-top-color: #ffd700; border-radius: 50%; animation: cerbSpin 0.7s linear infinite; vertical-align: middle; flex-shrink: 0; }
        #cerberusSyncBtn .cerb-sync-progress { font-size: 11px; color: #ffd700; font-weight: 600; vertical-align: middle; letter-spacing: 0.3px; white-space: nowrap; margin-left: 3px; }
        #cerberusSyncBtn:hover:not(.syncing) { background: rgba(255,255,255,0.1) !important; }
        #cerberusSyncBtn.syncing:hover { background: rgba(255, 68, 68, 0.12) !important; border-color: rgba(255, 68, 68, 0.4) !important; animation: none; box-shadow: 0 0 8px rgba(255, 68, 68, 0.3); }
        #cerberusSyncBtn.syncing:hover .cerb-spin-icon { border-top-color: #ff6b6b; border-color: rgba(255, 68, 68, 0.25); }
        #cerberusSyncBtn.syncing:hover .cerb-sync-progress { color: #ff6b6b; }
        @keyframes cerbBlockPulse { 0% { background-color: rgba(255, 68, 68, 0.4); box-shadow: inset 4px 0 0px #ff4444; } 50% { background-color: rgba(255, 68, 68, 0.05); box-shadow: inset 4px 0 0px #ff4444; } 100% { background-color: transparent; box-shadow: none; } }
        .cerberus-anim-block-pulse { animation: cerbBlockPulse 2s ease-in-out 2 forwards !important; }
        .cerb-clear-chat-fab, .cerb-queue-fab, .cerb-mute-chat-fab { position: absolute; right: 15px; background: rgba(30, 30, 35, 0.9); border-radius: 5px; width: 160px; text-align: center; text-transform: uppercase; padding: 6px 14px; font-size: 11px; font-weight: bold; cursor: pointer; transition: all 0.2s ease; z-index: 100; box-shadow: 0 4px 10px rgba(0,0,0,0.5); backdrop-filter: blur(5px); }
        .cerb-clear-chat-fab { bottom: 65px; border: 1px solid rgba(255, 255, 255, 0.1); color: #ccc; }
        .cerb-clear-chat-fab:hover { background: rgba(50, 50, 60, 0.95); color: #fff; transform: translateY(-2px); border-color: rgba(255, 255, 255, 0.3); }
        .cerb-mute-chat-fab { bottom: 100px; border: 1px solid rgba(251, 191, 36, 0.4); color: #fbbf24; display: flex; align-items: center; justify-content: center; gap: 6px; }
        .cerb-mute-chat-fab:hover { background: rgba(251, 191, 36, 0.15); color: #fff; transform: translateY(-2px); border-color: rgba(251, 191, 36, 0.7); }
        .cerb-mute-chat-fab[data-muted="true"] { border-color: rgba(251, 191, 36, 0.9); color: #fbbf24; background: rgba(251, 191, 36, 0.18); }
        .cerb-mute-dot { width: 7px; height: 7px; border-radius: 50%; background: rgba(251,191,36,0.3); border: 1px solid rgba(251,191,36,0.5); flex-shrink: 0; transition: background 0.2s, box-shadow 0.2s; }
        .cerb-mute-dot.active { background: #fbbf24; box-shadow: 0 0 5px #fbbf24; }
        .cerb-queue-fab { bottom: 135px; border: 1px solid rgba(102, 126, 234, 0.4); color: #a3bffa; }
        .cerb-queue-fab:hover { background: rgba(102, 126, 234, 0.3); color: #fff; transform: translateY(-2px); }
        .q-live-btn { border: 1px solid rgba(255,255,255,0.1); border-radius: 4px; padding: 5px 10px; font-size: 11px; font-weight: bold; cursor: pointer; transition: all 0.2s; color: white; }
        .q-live-btn.on { background: rgba(0, 170, 0, 0.3); border-color: #00aa00; }
        .q-live-btn.on:hover { background: rgba(0, 170, 0, 0.5); }
        .q-live-btn.off { background: rgba(170, 0, 0, 0.3); border-color: #ff4444; }
        .q-live-btn.off:hover { background: rgba(170, 0, 0, 0.5); }
        .cerb-motd-update-notice { background: rgba(255, 165, 0, 0.15); border-left: 4px solid #ffaa00; padding: 10px 15px; margin-top: 15px; border-radius: 4px; color: #ffdca5; font-size: 13px; display: inline-block; width: calc(100% - 10px); box-sizing: border-box; line-height: 1.4; }
        body.cerb-hide-sidebar-ping .usersListToolbar .userItem .pingWrapper img.ping { display: none !important; }
        .message.blur-individual .line .blocksContainer, .chatContent.blur-all .message .line .blocksContainer { filter: blur(5px); transition: filter 0.2s ease; user-select: none; }
        .message.blur-individual:hover .line .blocksContainer, .chatContent.blur-all:hover .message .line .blocksContainer { filter: blur(0); user-select: text; }
        #cerbGlobalMenu { position: fixed; background: rgba(20, 20, 25, 0.95); border: 1px solid rgba(102, 126, 234, 0.3); border-radius: 8px; padding: 4px 8px; box-shadow: 0 4px 15px rgba(0, 0, 0, 0.6); display: flex; align-items: center; gap: 8px; z-index: 100000; opacity: 0; pointer-events: none; transition: opacity 0.2s ease, transform 0.2s ease; transform: translateY(-50%) translateX(15px) scale(0.95); user-select: none; white-space: nowrap; }
        #cerbGlobalMenu.visible { opacity: 1; pointer-events: auto; transform: translateY(-50%) translateX(0) scale(1); }
        #cerbGlobalMenu span { cursor: pointer; font-size: 14px; transition: transform 0.1s; display: inline-block; }
        #cerbGlobalMenu span:hover { transform: scale(1.3); }
        .cerb-menu-divider { width: 1px; height: 16px; background: rgba(255, 255, 255, 0.2); margin: 0 2px; }
        .cerb-update-btn { display: inline-block; margin-top: 20px; padding: 10px 20px; background: rgba(102, 126, 234, 0.15); border: 1px solid rgba(102, 126, 234, 0.4); border-radius: 8px; color: #a3bffa; text-decoration: none; font-weight: 600; transition: all 0.2s ease; font-size: 14px; }
        .cerb-update-btn:hover { background: rgba(102, 126, 234, 0.3); color: #fff; transform: translateY(-2px); box-shadow: 0 4px 12px rgba(102, 126, 234, 0.2); }
        #cerberusPanel { position: fixed; width: 480px; max-height: 85vh; background: rgba(23, 23, 28, 0.95); backdrop-filter: blur(12px); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 12px; z-index: 10000; color: #ececec; font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; box-shadow: 0 20px 60px rgba(0, 0, 0, 0.7); display: none; overflow: hidden; flex-direction: column; }
        @media (max-width: 768px) { #cerberusPanel { width: 95%; max-height: 90vh; } }
        #cerberusPanel .header, #cerberusQueueWindow .q-header { display: flex; justify-content: space-between; align-items: center; padding: 14px 20px; background: rgba(255, 255, 255, 0.03); border-bottom: 1px solid rgba(255, 255, 255, 0.08); cursor: move; user-select: none; }
        #cerberusPanel .header .title, #cerberusQueueWindow .q-title { display: flex; align-items: center; gap: 10px; font-size: 16px; font-weight: 600; color: #fff; letter-spacing: 0.5px; }
        #cerberusPanel .closeBtn, #cerberusQueueWindow .q-close { background: transparent; border: none; color: rgba(255, 255, 255, 0.6); font-size: 24px; cursor: pointer; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; border-radius: 6px; transition: all 0.2s; }
        #cerberusPanel .closeBtn:hover, #cerberusQueueWindow .q-close:hover { background: rgba(255, 255, 255, 0.1); color: #fff; }
        #cerberusPanel .tabs { display: flex; background: rgba(0, 0, 0, 0.2); padding: 0 10px; }
        #cerberusPanel .tab { padding: 14px 20px; background: transparent; border: none; border-bottom: 2px solid transparent; color: rgba(255, 255, 255, 0.6); cursor: pointer; font-size: 13px; font-weight: 500; transition: all 0.2s; }
        #cerberusPanel .tab:hover { color: #fff; }
        #cerberusPanel .tab.active { color: #667eea; border-bottom-color: #667eea; }
        #cerberusPanel .tab.disabled { opacity: 0.3; cursor: not-allowed; }
        #cerberusPanel .content { flex: 1; overflow-y: auto; padding: 20px; }
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
        #cerberusQueueWindow { position: fixed; right: 20px; bottom: 150px; width: 320px; max-height: 400px; background: rgba(23, 23, 28, 0.95); backdrop-filter: blur(12px); border: 1px solid rgba(102, 126, 234, 0.3); border-radius: 12px; z-index: 10000; color: #ececec; font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; box-shadow: 0 10px 30px rgba(0, 0, 0, 0.8); display: flex; flex-direction: column; overflow: hidden; }
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
        .q-footer { padding: 10px; background: rgba(0,0,0,0.3); text-align: right; border-top: 1px solid rgba(255,255,255,0.05); display: flex; justify-content: space-between; align-items: center; }
        .q-clear-btn { background: transparent; border: 1px solid rgba(255,68,68,0.4); color: #ff4444; padding: 5px 10px; border-radius: 4px; font-size: 11px; cursor: pointer; transition: all 0.2s; text-transform: uppercase; }
        .q-clear-btn:hover { background: rgba(255,68,68,0.2); }
        #cerberusPanel .content::-webkit-scrollbar, .q-list::-webkit-scrollbar { width: 6px; }
        #cerberusPanel .content::-webkit-scrollbar-thumb, .q-list::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.2); border-radius: 4px; }
        #cerberusPanel .content::-webkit-scrollbar-track, .q-list::-webkit-scrollbar-track { background: transparent; }
    `;
    document.head.appendChild(style);
}

function createControlPanel() {
    if (document.getElementById('cerberusPanel')) return;
    const panel = document.createElement('div'); panel.id = 'cerberusPanel';
    panel.innerHTML = `<div class="header" id="cerberusHeader"><div class="title"><span>🐺</span><span>${t('panelTitle')}</span></div><button class="closeBtn">×</button></div><div class="tabs"><button class="tab" data-tab="countries" id="countriesTabBtn">${t('tabs.countries')}</button><button class="tab active" data-tab="settings">${t('tabs.settings')}</button><button class="tab" data-tab="about">${t('tabs.about')}</button></div><div class="content"><div id="countriesTab" class="tab-content" style="display:none;"></div><div id="settingsTab" class="tab-content" style="display:block;"></div><div id="aboutTab" class="tab-content" style="display:none;"></div></div>`;
    document.body.appendChild(panel); makeDraggable(panel, 'cerberusHeader');

    // Binding CSP Compliant
    panel.querySelector('.closeBtn').addEventListener('click', () => panel.style.display = 'none');

    panel.querySelectorAll('.tab').forEach(tab => {
        tab.addEventListener('click', () => {
            if (tab.classList.contains('disabled')) return;
            panel.querySelectorAll('.tab').forEach(t => t.classList.remove('active')); panel.querySelectorAll('.tab-content').forEach(c => c.style.display = 'none');
            tab.classList.add('active'); document.getElementById(tab.dataset.tab + 'Tab').style.display = 'block';
            if (tab.dataset.tab === 'countries') updateCountryList();
        });
    });
    createCountriesTab(); createSettingsTab(); createAboutTab(); updateCountryTabVisibility(ConfigManager.getSetting('countryFilter.enabled') === true);
}

function makeDraggable(element, headerId) {
    const header = document.getElementById(headerId); if (!header) return;
    let isDragging = false; let currentX, currentY, initialX, initialY, xOffset = 0, yOffset = 0;
    const setTranslate = (x, y) => { element.style.transform = `translate3d(${x}px, ${y}px, 0)`; element.style.top = element.style.left = '0'; };
    if (headerId === 'cerberusHeader') { xOffset = (window.innerWidth - 480) / 2; yOffset = (window.innerHeight - 500) / 2; setTranslate(xOffset, yOffset); }
    header.addEventListener("mousedown", (e) => {
        if ((e.target === header || header.contains(e.target)) && e.target.tagName !== 'BUTTON') {
            const rect = element.getBoundingClientRect(); xOffset = rect.left; yOffset = rect.top; initialX = e.clientX - xOffset; initialY = e.clientY - yOffset; isDragging = true;
            const drag = (ev) => { if (!isDragging) return; ev.preventDefault(); currentX = Math.max(0, Math.min(ev.clientX - initialX, window.innerWidth - (element.offsetWidth || 480))); currentY = Math.max(0, Math.min(ev.clientY - initialY, window.innerHeight - (element.offsetHeight || 500))); xOffset = currentX; yOffset = currentY; setTranslate(currentX, currentY); if (element.id === 'cerberusQueueWindow') { element.style.right = element.style.bottom = 'auto'; } };
            const dragEnd = () => { isDragging = false; document.removeEventListener("mouseup", dragEnd); document.removeEventListener("mousemove", drag); };
            document.addEventListener("mouseup", dragEnd); document.addEventListener("mousemove", drag);
        }
    });
}

function updateCountryTabVisibility(enabled) {
    const btn = document.getElementById('countriesTabBtn');
    if (btn) { if (enabled) btn.classList.remove('disabled'); else { btn.classList.add('disabled'); if (btn.classList.contains('active')) { const settingsTab = document.querySelector('.tab[data-tab="settings"]'); if (settingsTab) settingsTab.click(); } } }
}

function createCountriesTab() {
    const tab = document.getElementById('countriesTab');
    tab.innerHTML = `<div style="background: rgba(255, 165, 0, 0.1); border: 1px solid rgba(255, 165, 0, 0.3); border-radius: 8px; padding: 10px; margin-bottom: 15px; font-size: 13px; text-align: center; color: #ffdca5; line-height: 1.4;">${t('countries.alert')}</div><input type="text" id="countrySearch" class="search-bar" placeholder="${t('countries.search')}"><div style="display: flex; gap: 10px; margin-bottom: 15px;"><button id="allowAllBtn" style="flex: 1; padding: 10px; background: rgba(0, 170, 0, 0.2); border: 1px solid rgba(0, 255, 0, 0.3); border-radius: 8px; color: #4ade80; cursor: pointer; font-weight: 600;">${t('countries.allowAll')}</button><button id="clearAllBtn" style="flex: 1; padding: 10px; background: rgba(170, 0, 0, 0.2); border: 1px solid rgba(255, 0, 0, 0.3); border-radius: 8px; color: #f87171; cursor: pointer; font-weight: 600;">${t('countries.clearAll')}</button></div><div id="countriesContainer"></div>`;
    document.getElementById('allowAllBtn').addEventListener('click', () => { CerberusData.allowAllCountries(); updateCountryList(); });
    document.getElementById('clearAllBtn').addEventListener('click', () => { CerberusData.blockAllCountries(); updateCountryList(); });
    document.getElementById('countrySearch').addEventListener('input', (e) => updateCountryList(e.target.value));
    updateCountryList();
}

function updateCountryList(filterText = '') {
    const container = document.getElementById('countriesContainer'); if (!container) return; container.innerHTML = '';
    const filter = filterText.toLowerCase();
    Object.entries(AVAILABLE_COUNTRIES).forEach(([code, name]) => {
        if (!name.toLowerCase().includes(filter) && !code.toLowerCase().includes(filter)) return;
        const isAllowed = CerberusData.isCountryAllowed(code); const div = document.createElement('div');
        Object.assign(div.style, { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', marginBottom: '8px', background: 'rgba(255, 255, 255, 0.03)', borderRadius: '8px', borderLeft: `4px solid ${isAllowed ? '#4ade80' : '#4b5563'}`, transition: 'background 0.2s' });
        div.onmouseenter = () => div.style.background = 'rgba(255, 255, 255, 0.06)'; div.onmouseleave = () => div.style.background = 'rgba(255, 255, 255, 0.03)';

        let bgStyle = code === 'XX'
            ? `content: '🌐'; font-size: 14px; text-align: center; display: inline-block; width: 24px;`
            : `background-image: url('static/flags/${code.toLowerCase()}.png'); background-size: contain; background-repeat: no-repeat;`;

        div.innerHTML = `<div style="display:flex; align-items:center; gap:12px;"><span style="width:24px; height:16px; ${bgStyle} opacity: ${isAllowed ? 1 : 0.5}"></span><span style="font-size:14px; color:${isAllowed ? '#fff' : '#888'}">${name} <small style="opacity:0.5">(${code})</small></span></div>`;
        const toggle = createModernToggle(isAllowed, () => { if (isAllowed) CerberusData.blockCountry(code); else CerberusData.unblockCountry(code); updateCountryList(filterText); });
        div.appendChild(toggle); container.appendChild(div);
    });
}

function createModernToggle(checked, onChange) {
    const label = document.createElement('label'); label.className = 'switch'; const input = document.createElement('input');
    input.type = 'checkbox'; input.checked = checked; input.addEventListener('change', onChange);
    const span = document.createElement('span'); span.className = 'slider'; label.append(input, span); return label;
}

function createSettingsTab() {
    const tab = document.getElementById('settingsTab');
    const sectionHeader = (title) => `<h4 style="margin: 0 0 12px 0; font-size: 13px; text-transform: uppercase; color: #667eea; letter-spacing: 1px; font-weight: 700;">${title}</h4>`;
    const createSection = (title, items) => `<div style="margin-bottom: 24px;">${sectionHeader(title)}${items}</div>`;

    // Seção com master toggle no cabeçalho (filhos bloqueados via CSS quando master=off)
    const createMasterSection = (masterKey, title, childrenId, items) => {
        const enabled = ConfigManager.getSetting(masterKey) === true;
        const headerToggle = `<label class="switch" style="transform:scale(0.8);"><input type="checkbox" data-setting="${masterKey}" data-master-for="${childrenId}" ${enabled ? 'checked' : ''}><span class="slider"></span></label>`;
        const header = `<div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">${sectionHeader(title)}${headerToggle}</div>`;
        return `<div style="margin-bottom: 24px;">${header}<div id="${childrenId}" class="cerb-section-children ${enabled ? '' : 'cerb-disabled'}">${items}</div></div>`;
    };

    const settingToggle = (key, label) => {
        const val = ConfigManager.getSetting(key) === true;
        return `<div class="modern-toggle"><span style="font-size: 14px; color: #e0e0e0;">${label}</span><label class="switch"><input type="checkbox" data-setting="${key}" ${val ? 'checked' : ''}><span class="slider"></span></label></div>`;
    };
    const settingInput = (key, label, type = "text") => {
        let val = ConfigManager.getSetting(key) ?? ''; const safeVal = val.toString().replace(/"/g, '&quot;');
        if (type === 'textarea') { const displayVal = safeVal.replace(/\\n/g, '\n'); return `<div class="modern-toggle" style="flex-wrap: wrap;"><span style="font-size: 14px; color: #e0e0e0; flex: 1; min-width: 150px;">${label}</span><textarea data-setting="${key}" rows="3" style="background: rgba(0,0,0,0.3); color: white; border: 1px solid rgba(255,255,255,0.2); padding: 6px 8px; border-radius: 4px; outline: none; width: 100%; margin-top: 8px; resize: vertical; font-family: inherit; font-size: 13px; line-height: 1.4;">${displayVal}</textarea></div>`; }
        return `<div class="modern-toggle" style="flex-wrap: wrap;"><span style="font-size: 14px; color: #e0e0e0; flex: 1; min-width: 150px;">${label}</span><input type="${type}" data-setting="${key}" value="${safeVal}" style="background: rgba(0,0,0,0.3); color: white; border: 1px solid rgba(255,255,255,0.2); padding: 4px 8px; border-radius: 4px; outline: none; width: ${key === 'liveQueue.promoMessage' ? '100%' : '100px'}; text-align: ${key === 'liveQueue.promoMessage' ? 'left' : 'center'}; margin-top: ${key === 'liveQueue.promoMessage' ? '8px' : '0'};"></div>`;
    };
    const settingSelect = (key, label, options) => {
        const currentVal = ConfigManager.getSetting(key) || options[0].value;
        const optsHtml = options.map(opt => `<option value="${opt.value}" ${currentVal == opt.value ? 'selected' : ''}>${opt.text}</option>`).join('');
        return `<div class="modern-toggle"><span style="font-size: 14px; color: #e0e0e0;">${label}</span><select data-setting="${key}" style="background: rgba(0,0,0,0.3); color: white; border: 1px solid rgba(255,255,255,0.2); padding: 4px 8px; border-radius: 4px; outline: none;">${optsHtml}</select></div>`;
    };
    // Blur toggle: mapeia checked→'all', unchecked→'none' (via data-blur-toggle no handler)
    const blurToggle = () => {
        const isAll = ConfigManager.getSetting('chatUserInfo.blurMode') === 'all';
        return `<div class="modern-toggle"><span style="font-size: 14px; color: #e0e0e0;">${t('settings.blurMode')}</span><label class="switch"><input type="checkbox" data-setting="chatUserInfo.blurMode" data-blur-toggle="true" ${isAll ? 'checked' : ''}><span class="slider"></span></label></div>`;
    };

    const langSelect = `<div class="modern-toggle" style="margin-bottom: 24px;"><span style="font-size: 14px; color: #e0e0e0; font-weight: bold;">${t('settings.language')}</span><select id="cerbLangSelect" style="background: rgba(0,0,0,0.3); color: white; border: 1px solid rgba(255,255,255,0.2); padding: 6px 10px; border-radius: 4px; outline: none; font-size: 13px; cursor: pointer;"><option value="en" ${ConfigManager.getSetting('language') === 'en' ? 'selected' : ''}>🇺🇸 English</option><option value="pt" ${ConfigManager.getSetting('language') === 'pt' ? 'selected' : ''}>🇧🇷 Português</option></select></div>`;

    tab.innerHTML = langSelect +
        createSection(t('settings.global'), settingToggle('autoJoin.enabled', t('settings.autoJoin'))) +
        createMasterSection('liveQueue.enabled', t('settings.liveQueue'), 'cerbLiveQueueChildren',
            settingInput('liveQueue.keyword', t('settings.queueKeyword')) +
            settingInput('liveQueue.streamerNick', t('settings.queueStreamer')) +
            settingInput('liveQueue.limit', t('settings.queueLimit'), 'number') +
            settingToggle('liveQueue.autoReply', t('settings.queueReply')) +
            settingToggle('liveQueue.promoEnabled', t('settings.queuePromoEnable')) +
            settingInput('liveQueue.promoMessage', t('settings.queuePromo'), 'textarea')) +
        createSection(t('settings.rankingsApi'),
            settingSelect('rankings.limit', t('settings.rankLimit'), [{ value: 100, text: "100" }, { value: 200, text: "200" }, { value: 400, text: "400" }, { value: 500, text: "500" }, { value: 800, text: "800" }, { value: 999, text: "999" }]) +
            settingInput('rankings.country', t('settings.rankCountry')) +
            settingToggle('chatUserInfo.showNumericRanks', t('settings.showNumericRanks'))) +
        createSection(t('settings.filters'), settingToggle('countryFilter.enabled', t('settings.enableFilter'))) +
        createSection(t('settings.chatVisual'),
            settingToggle('chatUserInfo.enableStatus', t('settings.showStatus')) +
            settingToggle('chatUserInfo.enableFlag', t('settings.showFlags')) +
            settingToggle('chatUserInfo.enableRank', t('settings.showRanks')) +
            settingToggle('chatUserInfo.enablePingBars', t('settings.showPingBars')) +
            settingToggle('chatUserInfo.enablePingText', t('settings.showPingText')) +
            settingToggle('chatUserInfo.replacePingBarWithText', t('settings.replacePingBar'))) +
        createMasterSection('chatUserInfo.enableReputation', t('settings.reputation'), 'cerbReputationChildren',
            settingToggle('chatUserInfo.hideNegativeMessages', t('settings.hideNeg'))) +
        createSection(t('settings.privacy'), blurToggle() + settingToggle('chatUserInfo.unlockColorThemes', t('settings.unlockThemes')));

    // Attach Delegation listeners (CSP Safe)
    tab.querySelectorAll('input[data-setting], select[data-setting], textarea[data-setting]').forEach(input => {
        const handleSettingChange = (e) => {
            const key = e.target.getAttribute('data-setting'); let val = e.target.value;
            if (e.target.dataset.blurToggle) val = e.target.checked ? 'all' : 'none'; // blur: checkbox→'all'/'none'
            else if (e.target.type === 'checkbox') val = e.target.checked;
            else if (e.target.type === 'number' || key === 'rankings.limit') val = parseInt(e.target.value);
            else if (key === 'rankings.country') val = e.target.value.toUpperCase().trim();
            else if (e.target.tagName === 'TEXTAREA') val = e.target.value.split(String.fromCharCode(10)).join(String.fromCharCode(92) + 'n');
            ConfigManager.updateSetting(key, val);
            if (key === 'countryFilter.enabled') updateCountryTabVisibility(val);
            // Master toggle: ativa/desativa visualmente os filhos
            const masterFor = e.target.dataset.masterFor;
            if (masterFor) { const children = document.getElementById(masterFor); if (children) children.classList.toggle('cerb-disabled', !e.target.checked); }
        };
        input.addEventListener('change', handleSettingChange);
        if (input.type === 'text' || input.type === 'number') { let inputDebounce = null; input.addEventListener('input', (e) => { clearTimeout(inputDebounce); inputDebounce = setTimeout(() => handleSettingChange(e), 500); }); }
    });

    const langSelectObj = document.getElementById('cerbLangSelect');
    if (langSelectObj) langSelectObj.addEventListener('change', (e) => window.changeCerberusLanguage(e.target.value));
}

function createAboutTab() {
    let updateHtml = '';
    if (isNewerVersion(CerberusData.latestVersion, CURRENT_VERSION)) updateHtml = `<div style="background: rgba(255, 165, 0, 0.2); border: 1px solid rgba(255, 165, 0, 0.5); padding: 10px; border-radius: 8px; margin-top: 15px; color: #ffdca5; font-weight: bold;">${t('about.updateAvailable')} ${CerberusData.latestVersion}</div>`;
    document.getElementById('aboutTab').innerHTML = `<div style="text-align: center; padding: 20px;"><div style="font-size: 40px; margin-bottom: 10px;">🐺</div><h2 style="margin: 0; color: #667eea;">${t('about.title')}</h2><p style="opacity: 0.6; margin-top: 5px; font-weight: 500;">${t('about.subtitle')}</p>${updateHtml}<div style="background: rgba(255,255,255,0.05); padding: 15px; border-radius: 12px; margin-top: 20px; text-align: left;"><div style="margin-bottom: 12px;"><div style="font-weight: 600; font-size: 13px; margin-bottom: 6px; color: #a5b4fc;">${t('about.catBot')}</div><ul style="opacity: 0.9; padding-left: 20px; line-height: 1.5; font-size: 13px; margin: 0;"><li>${t('about.feat1')}</li><li>${t('about.feat2')}</li><li>${t('about.feat3')}</li></ul></div><div style="margin-bottom: 12px;"><div style="font-weight: 600; font-size: 13px; margin-bottom: 6px; color: #fbbf24;">${t('about.catRank')}</div><ul style="opacity: 0.9; padding-left: 20px; line-height: 1.5; font-size: 13px; margin: 0;"><li>${t('about.feat4')}</li><li>${t('about.feat5')}</li></ul></div><div style="margin-bottom: 12px;"><div style="font-weight: 600; font-size: 13px; margin-bottom: 6px; color: #34d399;">${t('about.catChat')}</div><ul style="opacity: 0.9; padding-left: 20px; line-height: 1.5; font-size: 13px; margin: 0;"><li>${t('about.feat6')}</li><li>${t('about.feat7')}</li><li>${t('about.feat8')}</li><li>${t('about.feat8b')}</li></ul></div><div style="margin-bottom: 12px;"><div style="font-weight: 600; font-size: 13px; margin-bottom: 6px; color: #f87171;">${t('about.catRep')}</div><ul style="opacity: 0.9; padding-left: 20px; line-height: 1.5; font-size: 13px; margin: 0;"><li>${t('about.feat9')}</li><li>${t('about.feat10')}</li><li>${t('about.feat11')}</li></ul></div><div style="margin-bottom: 8px;"><div style="font-weight: 600; font-size: 13px; margin-bottom: 6px; color: #60a5fa;">${t('about.catFilter')}</div><ul style="opacity: 0.9; padding-left: 20px; line-height: 1.5; font-size: 13px; margin: 0;"><li>${t('about.feat12')}</li><li>${t('about.feat13')}</li><li>${t('about.feat14')}</li><li>${t('about.feat15')}</li></ul></div><p style="font-size: 11px; opacity: 0.4; font-style: italic; margin-top: 15px; text-align: center;">${t('about.note')}</p></div><a href="https://github.com/Cerberus-BR/FightcadePlus/releases/latest" target="_blank" class="cerb-update-btn">${t('about.updateBtn')}</a></div>`;
}

window.updateCountryTabVisibility = updateCountryTabVisibility;
