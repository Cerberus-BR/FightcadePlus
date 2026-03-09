const fs = require('fs');
const path = require('path');

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
            showRanks: "Show Rank",
            showPingBars: "Show Ping Bars",
            showPingText: "Show Ping as Text",
            replacePingBar: "Replace Bar with Text (List)",
            reputation: "Reputation",
            enableRep: "Reputation System (👍/👎)",
            hideNeg: "Hide Negatived Users Chat",
            privacy: "Privacy",
            blurMode: "Blur Mode (Focus Chat)",
            blurNone: "Disabled",
            blurIndiv: "Individual",
            blurAll: "All",
            extras: "Extras",
            unlockThemes: "Unlock Color Themes",
            liveQueue: "Live Queue (Streamers)",
            queueEnable: "Enable Auto !join Parser",
            queueKeyword: "Keyword (e.g. !join)",
            queueLimit: "Queue Limit",
            queueStreamer: "Streamer Nick (Exclude)",
            queueReply: "Auto Chat Reply Bot (15s)"
        },
        about: {
            title: "Fightcade Plus 1.8.3",
            subtitle: "By Cerberus",
            feat1: "Live Player Queue Bot (!join)",
            feat2: "Geographic Country Filter",
            feat3: "Chat visual improvements (Flags, Ping text)",
            feat4: "Global Reputation System (👍/👎)",
            feat5: "Anti-Blink DOM Stabilization",
            feat6: "Premium Themes Unlock",
            note: "Developed with a focus on high performance and optimization.",
            updateBtn: "🔄 Check for Updates",
            updateAvailable: "⚠️ Update Available: "
        },
        rep: {
            like: "Highlight (Bypass Filter)",
            dislike: "Negative",
            clear: "Clear Reputation",
            block: "Block (Native)",
            unblock: "Unblock (Native)"
        },
        motd: {
            clearChat: "Clear Chat",
            queueTitle: "Players Queue",
            updateAvail: "Update Available:"
        },
        queue: {
            title: "Live Queue",
            addBtn: "Add",
            clearBtn: "Clear All",
            empty: "Queue is empty.",
            inputPh: "Player nickname...",
            mark: "Mark as Played/Unplayed",
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
            autoJoin: "Entrar Automático (Auto Join)",
            language: "Idioma",
            filters: "Filtros",
            enableFilter: "Ativar Filtro de Países",
            chatVisual: "Chat Visual",
            showStatus: "Mostrar Status (Online/Ausente/Offline)",
            showFlags: "Mostrar Bandeiras",
            showRanks: "Mostrar Rank",
            showPingBars: "Mostrar Barras de Ping",
            showPingText: "Mostrar Ping em Texto",
            replacePingBar: "Trocar Barra por Texto (Lista)",
            reputation: "Reputação",
            enableRep: "Sistema de Reputação (👍/👎)",
            hideNeg: "Ocultar chat de negativados",
            privacy: "Privacidade",
            blurMode: "Modo Blur (Focar Chat)",
            blurNone: "Desativado",
            blurIndiv: "Individual",
            blurAll: "Tudo",
            extras: "Extras",
            unlockThemes: "Desbloquear Temas de Cor",
            liveQueue: "Fila de Live (Streamers)",
            queueEnable: "Ativar Módulo de Fila da Live",
            queueKeyword: "Palavra-chave (ex: !join)",
            queueLimit: "Limite de Jogadores na Lista",
            queueStreamer: "Nick do Streamer (Exceção)",
            queueReply: "Bot de Resposta no Chat (15s)"
        },
        about: {
            title: "Fightcade Plus 1.8.3",
            subtitle: "By Cerberus",
            feat1: "Bot de Fila para Live (!join)",
            feat2: "Filtro Geográfico de Países",
            feat3: "Melhorias visuais no chat (Bandeiras, Ping em texto)",
            feat4: "Sistema de Reputação Global (👍/👎)",
            feat5: "Estabilização de DOM",
            feat6: "Desbloqueio de Temas Premium",
            note: "Desenvolvido com carinho para a comunidade KOF2002 BR",
            updateBtn: "🔄 Verificar Atualizações",
            updateAvailable: "⚠️ Atualização Disponível: "
        },
        rep: {
            like: "Destacar",
            dislike: "Negativar",
            clear: "Limpar Reputação",
            block: "Bloquear",
            unblock: "Desbloquear"
        },
        motd: {
            clearChat: "Limpar Chat",
            queueTitle: "Fila de Jogadores",
            updateAvail: "Atualização Disponível:"
        },
        queue: {
            title: "Fila da Live",
            addBtn: "Adicionar",
            clearBtn: "Limpar Fila",
            empty: "A fila está vazia.",
            inputPh: "Nick do jogador...",
            mark: "Marcar como Jogado/Não Jogado",
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
            autoJoin: "Entrar Automáticamente",
            language: "Idioma",
            filters: "Filtros",
            enableFilter: "Activar Filtro de Países",
            chatVisual: "Visual del Chat",
            showStatus: "Mostrar Estado (Online/Ausente/Offline)",
            showFlags: "Mostrar Banderas",
            showRanks: "Mostrar Rango",
            showPingBars: "Mostrar Barras de Ping",
            showPingText: "Mostrar Ping en Texto",
            replacePingBar: "Reemplazar Barra por Texto (Lista)",
            reputation: "Reputación",
            enableRep: "Sistema de Reputación (👍/👎)",
            hideNeg: "Ocultar chat de usuarios negativos",
            privacy: "Privacidad",
            blurMode: "Modo Blur (Enfocar Chat)",
            blurNone: "Desactivado",
            blurIndiv: "Individual",
            blurAll: "Todo",
            extras: "Extras",
            unlockThemes: "Desbloquear Temas de Color",
            liveQueue: "Cola de Live (Streamers)",
            queueEnable: "Activar Módulo de Cola",
            queueKeyword: "Palabra clave (ej: !join)",
            queueLimit: "Límite de Jugadores",
            queueStreamer: "Nick del Streamer (Excepción)",
            queueReply: "Bot de Respuesta en Chat (15s)"
        },
        about: {
            title: "Fightcade Plus 1.8.3",
            subtitle: "By Cerberus",
            feat1: "Bot de Cola para Live (!join)",
            feat2: "Filtro Geográfico de Países",
            feat3: "Mejoras visuales en el chat (Banderas, Ping)",
            feat4: "Sistema de Reputación Global (👍/👎)",
            feat5: "Estabilización de DOM (Anti-Blink)",
            feat6: "Desbloqueo de Temas Premium",
            note: "Desarrollado con enfoque en alto rendimiento y optimización.",
            updateBtn: "🔄 Buscar Actualizaciones",
            updateAvailable: "⚠️ Actualización Disponible: "
        },
        rep: {
            like: "Destacar (Bypass Filtro)",
            dislike: "Negativar",
            clear: "Limpiar Reputación",
            block: "Bloquear (Nativo)",
            unblock: "Desbloquear (Nativo)"
        },
        motd: {
            clearChat: "Limpiar Chat",
            queueTitle: "Cola de Jugadores",
            updateAvail: "Actualización Disponible:"
        },
        queue: {
            title: "Cola del Live",
            addBtn: "Añadir",
            clearBtn: "Limpiar Cola",
            empty: "La cola está vacía.",
            inputPh: "Nick del jugador...",
            mark: "Marcar como Jugado/No Jugado",
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

// ==================== CONFIGURAÇÃO INICIAL ====================
const defaultConfig = {
    language: 'en',
    autoJoin: {
        enabled: true,
        channelId: ''
    },
    countryFilter: {
        enabled: false 
    },
    chatUserInfo: {
        enableStatus: true,
        enableFlag: true,
        enableRank: true,
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
        limit: 20,
        streamerNick: '',
        autoReply: false
    }
};

const dataPath = path.join(__dirname, 'cerberus_data.json');
const configPath = path.join(__dirname, 'config.json');

const CURRENT_VERSION = "1.8.3";
let runtimeConfig = null;

module.exports = (FCADE) => {
    try {
        runPlugin(FCADE);
    } catch (e) {
        console.error("Cerberus Fatal Error:", e);
    }
};

// ==================== AUDIO SYNTH (Pop Sound) ====================
function playPopSound() {
    try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (!AudioContext) return;
        const ctx = new AudioContext();
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
    } catch(e) {}
}

// ==================== GESTÃO DE ESTADO & CACHE ====================
function invalidateCountryFilterCache() {
    unfilterAllMessages();
    unfilterAllUsers();
    
    if (window.CerberusFCADE && runtimeConfig) {
        updateChat(window.CerberusFCADE, runtimeConfig);
        updateSidebar(window.CerberusFCADE, runtimeConfig);
    }
}

let dataSaveTimeout = null;
const CerberusData = {
    allowedCountries: Object.keys(AVAILABLE_COUNTRIES), 
    positive: new Set(),
    negative: new Set(),
    selectedTheme: 'bretema',
    lastUpdateCheck: 0,
    latestVersion: null,
    liveQueue: [], 

    load() {
        let rawData = null;
        try {
            if (fs.existsSync(dataPath)) {
                rawData = fs.readFileSync(dataPath, 'utf8');
            }
        } catch (e) {}

        if (rawData) {
            try {
                const data = JSON.parse(rawData);
                this.allowedCountries = data.allowedCountries || Object.keys(AVAILABLE_COUNTRIES);
                this.positive = new Set(data.positive || []);
                this.negative = new Set(data.negative || []);
                this.selectedTheme = data.selectedTheme || 'bretema';
                this.lastUpdateCheck = data.lastUpdateCheck || 0;
                this.latestVersion = data.latestVersion || null;
                this.liveQueue = data.liveQueue || [];
                
                fs.writeFileSync(dataPath + '.bak', rawData, 'utf8');
            } catch (error) {
                try {
                    if (fs.existsSync(dataPath + '.bak')) {
                        const backupData = JSON.parse(fs.readFileSync(dataPath + '.bak', 'utf8'));
                        this.allowedCountries = backupData.allowedCountries || Object.keys(AVAILABLE_COUNTRIES);
                        this.positive = new Set(backupData.positive || []);
                        this.negative = new Set(backupData.negative || []);
                        this.selectedTheme = backupData.selectedTheme || 'bretema';
                        this.lastUpdateCheck = backupData.lastUpdateCheck || 0;
                        this.latestVersion = backupData.latestVersion || null;
                        this.liveQueue = backupData.liveQueue || [];
                        return;
                    }
                } catch(errBak) {}
                this.save();
            }
        } else {
            this.save();
        }
    },

    save() {
        clearTimeout(dataSaveTimeout);
        dataSaveTimeout = setTimeout(() => {
            try {
                const dataToSave = {
                    allowedCountries: this.allowedCountries,
                    positive: [...this.positive],
                    negative: [...this.negative],
                    selectedTheme: this.selectedTheme,
                    lastUpdateCheck: this.lastUpdateCheck,
                    latestVersion: this.latestVersion,
                    liveQueue: this.liveQueue,
                    lastUpdated: new Date().toISOString()
                };
                const jsonStr = JSON.stringify(dataToSave, null, 2);
                fs.writeFileSync(dataPath, jsonStr, 'utf8');
                fs.writeFileSync(dataPath + '.bak', jsonStr, 'utf8');
            } catch (error) {}
        }, 500); 
    },

    // --- Queue Management ---
    addQueue(playerName) {
        if (!playerName || playerName.trim() === '') return false;
        const name = playerName.trim();
        const limit = ConfigManager.getSetting('liveQueue.limit') || 20;
        
        if (this.liveQueue.length >= limit) return false;
        if (this.liveQueue.some(q => q.name.toLowerCase() === name.toLowerCase())) return false;
        if (this.isNegative(name)) return false; 
        
        this.liveQueue.push({ name: name, played: false });
        this.save();
        renderQueueList();
        return true;
    },
    removeQueue(index) {
        this.liveQueue.splice(index, 1);
        this.save();
        renderQueueList();
    },
    togglePlayedQueue(index) {
        if (this.liveQueue[index]) {
            this.liveQueue[index].played = !this.liveQueue[index].played;
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
        this.save();
        renderQueueList();
    },
    clearQueue() {
        this.liveQueue = [];
        this.save();
        renderQueueList();
    },
    
    // --- Existing Data Methods ---
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
    allowAllCountries() {
        this.allowedCountries = Object.keys(AVAILABLE_COUNTRIES);
        this.save();
        invalidateCountryFilterCache();
    },
    clearAllCountries() {
        this.allowedCountries = [];
        this.save();
        invalidateCountryFilterCache();
    },
    markPositive(userId) {
        this.positive.add(userId);
        this.negative.delete(userId);
        this.save();
    },
    markNegative(userId) {
        this.negative.add(userId);
        this.positive.delete(userId);
        this.save();
    },
    clearReputation(userId) {
        this.positive.delete(userId);
        this.negative.delete(userId);
        this.save();
    },
    isPositive(userId) { return this.positive.has(userId); },
    isNegative(userId) { return this.negative.has(userId); },
    setTheme(theme) {
        this.selectedTheme = theme;
        this.save();
    }
};

let configSaveTimeout = null;
const ConfigManager = {
    loadConfig() {
        let rawConfig = null;
        try {
            if (fs.existsSync(configPath)) {
                rawConfig = fs.readFileSync(configPath, 'utf8');
            }
        } catch (e) {}

        if (rawConfig) {
            try {
                const fullConfig = JSON.parse(rawConfig);
                runtimeConfig = { ...defaultConfig, ...(fullConfig.cerberus || {}) };
                runtimeConfig.autoJoin = { ...defaultConfig.autoJoin, ...(runtimeConfig.autoJoin || {}) };
                runtimeConfig.countryFilter = { ...defaultConfig.countryFilter, ...(runtimeConfig.countryFilter || {}) };
                runtimeConfig.chatUserInfo = { ...defaultConfig.chatUserInfo, ...(runtimeConfig.chatUserInfo || {}) };
                runtimeConfig.liveQueue = { ...defaultConfig.liveQueue, ...(runtimeConfig.liveQueue || {}) };
                fs.writeFileSync(configPath + '.bak', rawConfig, 'utf8');
            } catch (error) {
                try {
                    if (fs.existsSync(configPath + '.bak')) {
                        const backupConfig = JSON.parse(fs.readFileSync(configPath + '.bak', 'utf8'));
                        runtimeConfig = { ...defaultConfig, ...(backupConfig.cerberus || {}) };
                        return;
                    }
                } catch(errBak) {}
                runtimeConfig = JSON.parse(JSON.stringify(defaultConfig));
                this.saveConfig();
            }
        } else {
            runtimeConfig = JSON.parse(JSON.stringify(defaultConfig));
            this.saveConfig();
        }
    },

    saveConfig() {
        clearTimeout(configSaveTimeout);
        configSaveTimeout = setTimeout(() => {
            try {
                let fullConfig = {};
                if (fs.existsSync(configPath)) {
                    try { fullConfig = JSON.parse(fs.readFileSync(configPath, 'utf8')); } catch(e){}
                }
                fullConfig.cerberus = runtimeConfig;
                const jsonStr = JSON.stringify(fullConfig, null, 2);
                fs.writeFileSync(configPath, jsonStr, 'utf8');
                fs.writeFileSync(configPath + '.bak', jsonStr, 'utf8');
            } catch (error) {}
        }, 500);
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
                msg.querySelectorAll('.cerberus-injected-status, .cerberus-injected-flag, .cerberus-injected-rank, .cerberus-injected-pingbar, .cerberus-injected-pingtext').forEach(el => el.remove());
                msg.removeAttribute('data-cerberus-processed');
                msg.removeAttribute('data-cerberus-retries');
            });
        }
        
        if (pathStr === 'countryFilter.enabled' || pathStr === 'chatUserInfo.hideNegativeMessages') {
            invalidateCountryFilterCache();
        }
        
        // Destruição ou criação dinâmica da UI da Fila caso alterado no painel
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

// ==================== UPDATER SYSTEM ====================
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
        } catch (e) {}
    }
}

// ==================== TRADUTOR (i18n) ====================
function t(keyPath) {
    const lang = ConfigManager.getSetting('language') || 'en';
    const keys = keyPath.split('.');
    
    let result = Locales[lang];
    for (let k of keys) {
        if (result === undefined) break;
        result = result[k];
    }
    
    if (result === undefined && lang !== 'en') {
        result = Locales['en'];
        for (let k of keys) {
            if (result === undefined) return keyPath;
            result = result[k];
        }
    }
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
    injectButtonIntoHeader();
    
    const queuePanel = document.getElementById('cerberusQueueWindow');
    if (queuePanel) {
        queuePanel.remove();
        if (ConfigManager.getSetting('liveQueue.enabled')) {
            createQueuePanel();
        }
    }
};

function normalizeUsername(username) {
    if (!username) return '';
    return username.replace(/\s+/g, ' ').trim();
}

function extractMinPing(title) {
    if (!title) return null;
    const match = title.match(/(\d+)~(\d+)/);
    if (match) return parseInt(match[1]);
    const single = title.match(/(\d+)/);
    return single ? parseInt(single[1]) : null;
}

function getMinPing(userFound) {
    return extractMinPing(userFound?.pingTitle);
}

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

CerberusData.load();
ConfigManager.loadConfig();

window.CerberusData = CerberusData;
window.ConfigManager = ConfigManager;
window.cerbReplyQueue = [];

// ==================== AUTO JOIN ====================
const connectToChannelWhenAvailable = (FCADE, autoJoinConfig) => {
    const checkInterval = setInterval(() => {
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

const runPlugin = (FCADE) => {
    console.log(`🐺 Cerberus v${CURRENT_VERSION} (Fightcade Plus) Inicializado`);
    window.CerberusFCADE = FCADE; 

    checkForUpdates();

    if (runtimeConfig.autoJoin?.enabled !== false) {
        connectToChannelWhenAvailable(FCADE, runtimeConfig.autoJoin);
    }

    injectStyles();
    injectGlobalMenu();
    createControlPanel();

    setInterval(() => {
        try {
            injectButtonIntoHeader();
            injectUIEnhancements(); 
            maintainChatObserver(FCADE, runtimeConfig.chatUserInfo);
            updateSidebar(FCADE, runtimeConfig);
            updateChat(FCADE, runtimeConfig);

            if (runtimeConfig.chatUserInfo?.unlockColorThemes !== false) {
                unlockColorThemes();
            }
        } catch (err) {}
    }, 1000);
    
    // Bot Aggregator (Input Restorer)
    setInterval(() => {
        if (window.cerbReplyQueue.length > 0 && ConfigManager.getSetting('liveQueue.autoReply')) {
            const inputEl = document.querySelector('.chatInput input.input');
            if (!inputEl) return;

            const currentVal = inputEl.value; // Snapshot do texto do streamer
            const names = window.cerbReplyQueue.join(', ');
            window.cerbReplyQueue = []; // Limpa fila local
            
            const msg = `[Fila] Adicionado(s): ${names}`;
            
            const nativeSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set;
            nativeSetter.call(inputEl, msg);
            inputEl.dispatchEvent(new Event('input', { bubbles: true }));
            inputEl.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', code: 'Enter', keyCode: 13, which: 13, bubbles: true }));
            
            // Restaura o input em 50ms para evitar Input Hijacking
            setTimeout(() => {
                nativeSetter.call(inputEl, currentVal);
                inputEl.dispatchEvent(new Event('input', { bubbles: true }));
            }, 50);
        }
    }, 15000);

    setTimeout(() => applyTheme(CerberusData.selectedTheme), 2500);
};

// ==================== UI / FAB INJECTION ====================
function injectUIEnhancements() {
    const chatWrapper = document.querySelector('.chatWrapper');
    if (!chatWrapper) return;

    // FAB Limpar Chat (Sempre visível)
    if (!document.querySelector('.cerb-clear-chat-fab')) {
        const clearBtn = document.createElement('button');
        clearBtn.className = 'cerb-clear-chat-fab cerberus-anim-pop';
        clearBtn.innerHTML = `🧹 ${t('motd.clearChat')}`;
        clearBtn.onclick = () => executeChatCommand('/clear');
        chatWrapper.appendChild(clearBtn);
    }

    // FAB Live Queue (Apenas visível se ativado nas configs)
    const qEnabled = ConfigManager.getSetting('liveQueue.enabled') === true;
    const existingFab = document.querySelector('.cerb-queue-fab');
    const existingWindow = document.getElementById('cerberusQueueWindow');

    if (qEnabled) {
        if (!existingFab) {
            const queueBtn = document.createElement('button');
            queueBtn.className = 'cerb-queue-fab cerberus-anim-pop';
            queueBtn.innerHTML = `📝 ${t('motd.queueTitle')}`;
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
        // Aniquilação Dinâmica de DOM: Destrói interface se desligado
        if (existingFab) existingFab.remove();
        if (existingWindow) existingWindow.remove();
    }

    // Notificação Dinâmica de Atualização
    const motdWrapper = document.querySelector('.messageWrapper.motd');
    if (motdWrapper && CerberusData.latestVersion && isNewerVersion(CerberusData.latestVersion, CURRENT_VERSION)) {
        if (motdWrapper.dataset.cerbUpdateAdded !== "true") {
            const updateNotice = document.createElement('div');
            updateNotice.className = 'cerb-motd-update-notice cerberus-anim-pop';
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
            <button class="q-close" onclick="document.getElementById('cerberusQueueWindow').style.display='none'">×</button>
        </div>
        <div class="q-add-box">
            <input type="text" id="cerbQueueInput" placeholder="${t('queue.inputPh')}">
            <button id="cerbQueueAddBtn">${t('queue.addBtn')}</button>
        </div>
        <div class="q-list" id="cerbQueueList"></div>
        <div class="q-footer">
            <button id="cerbQueueClearBtn" class="q-clear-btn">🧹 ${t('queue.clearBtn')}</button>
        </div>
    `;

    document.body.appendChild(panel);
    makeDraggable(panel, 'cerberusQueueHeader');

    document.getElementById('cerbQueueAddBtn').onclick = () => {
        const input = document.getElementById('cerbQueueInput');
        CerberusData.addQueue(input.value);
        input.value = '';
    };

    document.getElementById('cerbQueueInput').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            CerberusData.addQueue(e.target.value);
            e.target.value = '';
        }
    });

    document.getElementById('cerbQueueClearBtn').onclick = () => {
        CerberusData.clearQueue();
    };

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
        item.className = 'q-item cerberus-anim-pop';
        
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
                        if (node.nodeType === 1 && node.classList && node.classList.contains('cerberus-anim-pop')) continue;
                        hasValidNewNodes = true;
                        break;
                    }
                }
                if (hasValidNewNodes) break;
            }
            if (hasValidNewNodes) {
                try { updateChat(FCADE, cfg); } catch (err) {}
            }
        });
        
        chatObserver.observe(chatContent, { childList: true, subtree: true });
        
        try { updateChat(FCADE, cfg); } catch (e) {}
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
        window.cerbMenuIsHovered = true;
        clearTimeout(window.cerbMenuHideTimeout);
        clearTimeout(window.cerbMenuShowTimeout); 
    });
    
    menu.addEventListener('mouseleave', () => {
        window.cerbMenuIsHovered = false;
        window.cerbMenuHideTimeout = setTimeout(() => {
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

function injectButtonIntoHeader() {
    const headerTitle = document.querySelector('.usersOnlineTitle');
    
    if (headerTitle && !headerTitle.querySelector('#cerberusBtn')) {
        const oldBtn = document.getElementById('cerberusBtn');
        if (oldBtn) oldBtn.remove();

        headerTitle.style.display = 'flex';
        headerTitle.style.alignItems = 'center';

        const btn = document.createElement('span');
        btn.id = 'cerberusBtn';
        btn.textContent = '⚙️';
        btn.title = t('btnTitle');
        
        Object.assign(btn.style, {
            cursor: 'pointer',
            fontSize: '16px',
            marginLeft: 'auto',
            marginRight: '10px',
            opacity: '0.8',
            transition: 'all 0.2s'
        });

        btn.onmouseenter = () => {
            btn.style.opacity = '1';
            btn.style.transform = 'scale(1.2) rotate(30deg)';
        };
        btn.onmouseleave = () => {
            btn.style.opacity = '0.8';
            btn.style.transform = 'scale(1) rotate(0deg)';
        };

        btn.onclick = (e) => {
            e.stopPropagation();
            const panel = document.getElementById('cerberusPanel');
            if (panel) {
                if (!panel.style.top) {
                    panel.style.top = '50%';
                    panel.style.left = '50%';
                    panel.style.transform = 'translate(-50%, -50%)';
                }
                panel.style.display = panel.style.display === 'none' ? 'flex' : 'none';
                if (panel.style.display === 'flex') updateCountryList();
            }
        };

        headerTitle.appendChild(btn);
    }
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

    const newMessages = document.querySelectorAll('.message:not([data-cerberus-processed])');
    
    // SMART BATCHING: Ativado se o Vue recriar massivamente o DOM (limite das 300 msgs)
    const isBatchUpdate = newMessages.length > 5;

    if (isBatchUpdate) {
        document.body.classList.add('cerb-mass-update');
        clearTimeout(window.cerbMassUpdateTimeout);
        window.cerbMassUpdateTimeout = setTimeout(() => {
            document.body.classList.remove('cerb-mass-update');
        }, 150);
    }

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

            // Live Queue Auto-Parser
            if (queueCfg && queueCfg.enabled && queueCfg.keyword) {
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
                        if (!window.cerbReplyQueue) window.cerbReplyQueue = [];
                        window.cerbReplyQueue.push(userKey);
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

            const elements = {
                status: cfg.enableStatus ? createStatusElement(statusState, isBatchUpdate) : null,
                flag: (cfg.enableFlag && user?.country) ? createFlagElement(user.country, isBatchUpdate) : null,
                rank: (cfg.enableRank && userFound?.rankSrc) ? createRankElement(userFound.rankSrc, userFound.rankTitle, isBatchUpdate) : null,
                pingBar: (cfg.enablePingBars && userFound?.pingSrc) ? createPingElement(userFound.pingSrc, userFound.pingTitle, isBatchUpdate) : null,
                pingText: (cfg.enablePingText && minPingVal !== null) ? createPingTextElement(minPingVal, isBatchUpdate) : null
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

    if (cfg?.replacePingBarWithText) {
        document.body.classList.add('cerb-hide-sidebar-ping');
    } else {
        document.body.classList.remove('cerb-hide-sidebar-ping');
    }
    
    const ignoredTitleNodes = document.querySelectorAll('.usersIgnoredTitle');
    ignoredTitleNodes.forEach(titleEl => {
        titleEl.childNodes.forEach(node => {
            if (node.nodeType === Node.TEXT_NODE && node.nodeValue.includes('Ignored')) {
                node.nodeValue = node.nodeValue.replace('Ignored', 'BLOCKED');
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
                            txt.className = 'cerberus-ping-text cerberus-anim-pop';
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
        } catch(e) { }
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
        } catch(e) { }
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
        if (window.cerbMenuIsHovered) return;

        clearTimeout(window.cerbMenuHideTimeout);
        window.cerbMenuShowTimeout = setTimeout(() => {
            if (window.cerbMenuIsHovered) return;
            
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
        clearTimeout(window.cerbMenuShowTimeout);
        window.cerbMenuHideTimeout = setTimeout(() => {
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
function createFlagElement(country, isBatchUpdate = false) {
    const flag = document.createElement('span');
    flag.className = `flagWrapper cerberus-injected-flag ${isBatchUpdate ? '' : 'cerberus-anim-pop'}`;
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

function createPingElement(src, title, isBatchUpdate = false) {
    const ping = document.createElement('span');
    ping.className = `pingWrapper cerberus-injected-pingbar ${isBatchUpdate ? '' : 'cerberus-anim-pop'}`;
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

function createRankElement(src, title, isBatchUpdate = false) {
    const rank = document.createElement('span');
    rank.className = `rankWrapper cerberus-injected-rank ${isBatchUpdate ? '' : 'cerberus-anim-pop'}`;
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

function createPingTextElement(minPing, isBatchUpdate = false) {
    const text = document.createElement('span');
    text.className = `cerberus-injected-pingtext ${isBatchUpdate ? '' : 'cerberus-anim-pop'}`;
    
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

function createStatusElement(state, isBatchUpdate = false) {
    const status = document.createElement('div');
    status.className = `statusWrapper cerberus-injected-status ${isBatchUpdate ? '' : 'cerberus-anim-pop'}`;
    
    let color = '#ff4444'; // Offline/Unknown por padrão (UX Placeholder)
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
        /* Premium Anim: Smooth Pop-In */
        @keyframes cerbPopIn {
            0% { opacity: 0; transform: scale(0.8) translateX(-4px); }
            100% { opacity: 1; transform: scale(1) translateX(0); }
        }
        .cerberus-anim-pop { animation: cerbPopIn 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }

        /* Cloak de Opacidade */
        .messageWrapper.chat .message:not([data-cerberus-processed="true"]) header .authorAndTime { opacity: 0 !important; }
        .messageWrapper.chat .message header .authorAndTime { transition: opacity 0.2s ease-in !important; }
        
        body.cerb-mass-update .messageWrapper.chat .message header .authorAndTime {
            transition: none !important; opacity: 1 !important;
        }

        /* Animação de UX: Piscar vermelho */
        @keyframes cerbBlockPulse {
            0% { background-color: rgba(255, 68, 68, 0.4); box-shadow: inset 4px 0 0px #ff4444; }
            50% { background-color: rgba(255, 68, 68, 0.05); box-shadow: inset 4px 0 0px #ff4444; }
            100% { background-color: transparent; box-shadow: none; }
        }
        .cerberus-anim-block-pulse { animation: cerbBlockPulse 2s ease-in-out 2 forwards !important; }

        /* Floating Action Buttons (FABs) */
        .cerb-clear-chat-fab {
            position: absolute; right: 15px; bottom: 65px;
            background: rgba(30, 30, 35, 0.9); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 20px;
            color: #ccc; padding: 6px 14px; font-size: 11px; font-weight: bold; cursor: pointer; transition: all 0.2s ease;
            z-index: 100; box-shadow: 0 4px 10px rgba(0,0,0,0.5); backdrop-filter: blur(5px);
        }
        .cerb-clear-chat-fab:hover { background: rgba(50, 50, 60, 0.95); color: #fff; transform: translateY(-2px); border-color: rgba(255, 255, 255, 0.3); }

        .cerb-queue-fab {
            position: absolute; right: 15px; bottom: 105px;
            background: rgba(30, 30, 35, 0.9); border: 1px solid rgba(102, 126, 234, 0.4); border-radius: 20px;
            color: #a3bffa; padding: 6px 14px; font-size: 11px; font-weight: bold; cursor: pointer; transition: all 0.2s ease;
            z-index: 100; box-shadow: 0 4px 10px rgba(0,0,0,0.5); backdrop-filter: blur(5px);
        }
        .cerb-queue-fab:hover { background: rgba(102, 126, 234, 0.3); color: #fff; transform: translateY(-2px); }

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
        .q-add-box button { background: #667eea; color: white; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer; font-size: 12px; font-weight: bold; transition: background 0.2s; }
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
        .q-clear-btn { background: transparent; border: 1px solid rgba(255,68,68,0.4); color: #ff4444; padding: 5px 10px; border-radius: 4px; font-size: 11px; cursor: pointer; transition: all 0.2s; }
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
            <button class="closeBtn" onclick="document.getElementById('cerberusPanel').style.display='none'">×</button>
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

    // Tab Logic
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

    // Apenas centra se for o painel principal, a Queue nasce no canto
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
            
            // Remove o ancoramento right e bottom nativos ao iniciar arrasto
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

    document.getElementById('allowAllBtn').onclick = () => { CerberusData.allowAllCountries(); updateCountryList(); };
    document.getElementById('clearAllBtn').onclick = () => { CerberusData.clearAllCountries(); updateCountryList(); };
    
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
    input.onchange = onChange;
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

    const settingToggle = (key, label, isMain = false) => {
        const val = ConfigManager.getSetting(key) === true; 
        const extraAction = isMain ? 'updateCountryTabVisibility(this.checked);' : '';
        const fn = `ConfigManager.updateSetting('${key}', this.checked); ${extraAction}`;
        
        return `
            <div class="modern-toggle">
                <span style="font-size: 14px; color: #e0e0e0;">${label}</span>
                <label class="switch">
                    <input type="checkbox" ${val ? 'checked' : ''} onchange="${fn}">
                    <span class="slider"></span>
                </label>
            </div>
        `;
    };

    const settingInput = (key, label, type="text") => {
        const val = ConfigManager.getSetting(key) || ''; 
        return `
            <div class="modern-toggle">
                <span style="font-size: 14px; color: #e0e0e0;">${label}</span>
                <input type="${type}" value="${val}" style="background: rgba(0,0,0,0.3); color: white; border: 1px solid rgba(255,255,255,0.2); padding: 4px 8px; border-radius: 4px; outline: none; width: 100px; text-align: center;" 
                        onchange="ConfigManager.updateSetting('${key}', ${type === 'number' ? 'parseInt(this.value)' : 'this.value'})">
            </div>
        `;
    };

    const langSelect = `
        <div class="modern-toggle" style="margin-bottom: 24px;">
            <span style="font-size: 14px; color: #e0e0e0; font-weight: bold;">${t('settings.language')}</span>
            <select style="background: rgba(0,0,0,0.3); color: white; border: 1px solid rgba(255,255,255,0.2); padding: 6px 10px; border-radius: 4px; outline: none; font-size: 13px; cursor: pointer;" 
                    onchange="window.changeCerberusLanguage(this.value)">
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
            settingToggle('liveQueue.autoReply', t('settings.queueReply'))
        ) +
        createSection(t('settings.filters'), 
            settingToggle('countryFilter.enabled', t('settings.enableFilter'), true)
        ) +
        createSection(t('settings.chatVisual'), 
            settingToggle('chatUserInfo.enableStatus', t('settings.showStatus')) +
            settingToggle('chatUserInfo.enableFlag', t('settings.showFlags')) +
            settingToggle('chatUserInfo.enableRank', t('settings.showRanks')) +
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
                <select style="background: rgba(0,0,0,0.3); color: white; border: 1px solid rgba(255,255,255,0.2); padding: 4px 8px; border-radius: 4px; outline: none;" 
                        onchange="ConfigManager.updateSetting('chatUserInfo.blurMode', this.value)">
                    <option value="none" ${ConfigManager.getSetting('chatUserInfo.blurMode') === 'none' ? 'selected' : ''}>${t('settings.blurNone')}</option>
                    <option value="individual" ${ConfigManager.getSetting('chatUserInfo.blurMode') === 'individual' ? 'selected' : ''}>${t('settings.blurIndiv')}</option>
                    <option value="all" ${ConfigManager.getSetting('chatUserInfo.blurMode') === 'all' ? 'selected' : ''}>${t('settings.blurAll')}</option>
                </select>
            </div>
        `) +
        createSection(t('settings.extras'), settingToggle('chatUserInfo.unlockColorThemes', t('settings.unlockThemes')));
}

function createAboutTab() {
    let updateHtml = '';
    if (isNewerVersion(CerberusData.latestVersion, CURRENT_VERSION)) {
        updateHtml = `
            <div style="background: rgba(255, 165, 0, 0.2); border: 1px solid rgba(255, 165, 0, 0.5); padding: 10px; border-radius: 8px; margin-top: 15px; color: #ffdca5; font-weight: bold; animation: cerbPopIn 0.3s ease;">
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
                <ul style="opacity: 0.9; padding-left: 20px; line-height: 1.6; font-size: 14px; margin-top: 0;">
                    <li>${t('about.feat1')}</li>
                    <li>${t('about.feat2')}</li>
                    <li>${t('about.feat3')}</li>
                    <li>${t('about.feat4')}</li>
                    <li>${t('about.feat5')}</li>
                    <li>${t('about.feat6')}</li>
                </ul>
                <p style="font-size: 12px; opacity: 0.5; font-style: italic; margin-top: 15px; text-align: center;">${t('about.note')}</p>
            </div>
            <a href="https://github.com/Cerberus-BR/FightcadePlus/releases/latest" target="_blank" class="cerb-update-btn">
                ${t('about.updateBtn')}
            </a>
        </div>
    `;
}

window.updateCountryTabVisibility = updateCountryTabVisibility;
