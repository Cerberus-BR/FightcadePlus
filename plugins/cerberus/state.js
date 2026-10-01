// cerberus/state.js

const fs = require('fs');
const path = require('path');
const { AVAILABLE_COUNTRIES } = require('./constants.js');

const dataPath = path.join(__dirname, '..', 'cerberus_data.json');

if (!window.CerberusState) {
    window.CerberusState = { 
        liveMasterOn: false, promoBotInterval: null, replyQueue: [], 
        menuIsHovered: false, menuHideTimeout: null, menuShowTimeout: null, selfProfileHideTimeout: null, 
        menuCleanupInterval: null, sidebarSearchTerm: '', lastUIRenderSignature: '',
        lastAutoRejectNotifyTime: 0,
        lastAutoRejectPerUser: {},
        lastToastPerUser: {},
        lastFavoriteJoinPerUser: {}
    };
}

const _writeQueues = new Map();

function atomicWriteJSON(filePath, data) {
    const prevPromise = _writeQueues.get(filePath) || Promise.resolve();

    const currentPromise = prevPromise.catch(() => { }).then(() => {
        return new Promise((resolve, reject) => {
            const uniqueId = `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
            const tmpPath = `${filePath}.${uniqueId}.tmp`;
            const bakPath = filePath + '.bak';
            const json = JSON.stringify(data, null, 2);

            fs.writeFile(tmpPath, json, 'utf8', (err) => {
                if (err) {
                    try { fs.writeFileSync(filePath, json, 'utf8'); resolve(); } catch (e2) { reject(e2); }
                    return;
                }
                const afterBak = () => {
                    fs.rename(tmpPath, filePath, (errRen) => {
                        if (!errRen) { resolve(); return; }
                        try {
                            fs.writeFileSync(filePath, json, 'utf8');
                            try { fs.unlinkSync(tmpPath); } catch (_) { }
                            resolve();
                        } catch (eFallback) {
                            try { fs.unlinkSync(tmpPath); } catch (_) { }
                            reject(errRen);
                        }
                    });
                };
                if (fs.existsSync(filePath)) {
                    fs.copyFile(filePath, bakPath, () => afterBak());
                } else {
                    afterBak();
                }
            });
        });
    });

    _writeQueues.set(filePath, currentPromise);
    return currentPromise;
}

function safeLoadJSON(filePath, defaults) {
    const bakPath = filePath + '.bak';
    try { if (fs.existsSync(filePath)) return JSON.parse(fs.readFileSync(filePath, 'utf8')); } catch (e) { }
    try { if (fs.existsSync(bakPath)) return JSON.parse(fs.readFileSync(bakPath, 'utf8')); } catch (e) { }
    return typeof defaults === 'function' ? defaults() : (defaults || null);
}

let dataSaveTimeout = null;

const CerberusData = {
    blockedCountriesSet: new Set(), positive: new Set(), negative: new Set(), selectedTheme: 'bretema', lastUpdateCheck: 0, latestVersion: null, downloadUrl: null, remoteNotices: [], liveQueue: [], queueTimestamp: 0, dismissedMotds: new Set(), userPositionHistory: {},
    
    load() {
        const data = safeLoadJSON(dataPath, null);
        if (data) {
            if (data.blockedCountries) this.blockedCountriesSet = new Set(data.blockedCountries);
            else if (data.allowedCountries) {
                const allowed = new Set(data.allowedCountries);
                Object.keys(AVAILABLE_COUNTRIES).forEach(code => { if (!allowed.has(code)) this.blockedCountriesSet.add(code); });
            }
            this.positive = new Set(data.positive || []); this.negative = new Set(data.negative || []); this.selectedTheme = data.selectedTheme || 'bretema';
            this.lastUpdateCheck = data.lastUpdateCheck || 0; this.latestVersion = data.latestVersion || null; this.downloadUrl = data.downloadUrl || null; this.queueTimestamp = data.queueTimestamp || 0;
            this.remoteNotices = Array.isArray(data.remoteNotices) ? data.remoteNotices : [];
            this.userPositionHistory = (data.userPositionHistory && typeof data.userPositionHistory === 'object' && !Array.isArray(data.userPositionHistory)) ? data.userPositionHistory : {};
            if (Date.now() - this.queueTimestamp > 43200000) { this.liveQueue = []; this.queueTimestamp = Date.now(); } else { this.liveQueue = data.liveQueue || []; }
            this.dismissedMotds = new Set();
        }
    },
    save() {
        clearTimeout(dataSaveTimeout);
        dataSaveTimeout = setTimeout(() => {
            atomicWriteJSON(dataPath, { blockedCountries: [...this.blockedCountriesSet], positive: [...this.positive], negative: [...this.negative], selectedTheme: this.selectedTheme, lastUpdateCheck: this.lastUpdateCheck, latestVersion: this.latestVersion, downloadUrl: this.downloadUrl, remoteNotices: this.remoteNotices, liveQueue: this.liveQueue, queueTimestamp: this.queueTimestamp, userPositionHistory: this.userPositionHistory, lastUpdated: new Date().toISOString() }).catch(() => { });
        }, 500);
    },
    addQueue(playerName) {
        const { ConfigManager } = require('./config.js');
        const { renderQueueList } = require('./ui.js');
        if (ConfigManager.getSetting('liveQueue.enabled') !== true) return false;
        if (!playerName || playerName.trim() === '') return false; const name = playerName.trim(); const limit = ConfigManager.getSetting('liveQueue.limit') || 20;
        if (this.liveQueue.length >= limit || this.liveQueue.some(q => q.name.toLowerCase() === name.toLowerCase()) || this.isNegative(name)) return false;
        this.liveQueue.push({ name: name, played: false }); this.queueTimestamp = Date.now(); this.save(); renderQueueList(); return true;
    },
    removeQueue(index) { 
        const { renderQueueList } = require('./ui.js');
        if (!Number.isInteger(index) || index < 0 || index >= this.liveQueue.length) return; 
        this.liveQueue.splice(index, 1); this.queueTimestamp = Date.now(); this.save(); renderQueueList(); 
    },
    togglePlayedQueue(index) {
        const { renderQueueList } = require('./ui.js');
        if (!Number.isInteger(index) || !this.liveQueue[index]) return;
        this.liveQueue[index].played = !this.liveQueue[index].played;
        if (this.liveQueue[index].played) { const item = this.liveQueue.splice(index, 1)[0]; this.liveQueue.push(item); }
        this.queueTimestamp = Date.now(); this.save(); renderQueueList();
    },
    moveQueue(index, direction) {
        const { renderQueueList } = require('./ui.js');
        if (!Number.isInteger(index) || !Number.isInteger(direction)) return;
        if (index < 0 || index >= this.liveQueue.length) return;
        const newIndex = index + direction;
        if (newIndex < 0 || newIndex >= this.liveQueue.length) return;
        const temp = this.liveQueue[index]; this.liveQueue[index] = this.liveQueue[newIndex]; this.liveQueue[newIndex] = temp; this.queueTimestamp = Date.now(); this.save(); renderQueueList();
    },
    clearQueue() { 
        const { renderQueueList } = require('./ui.js');
        this.liveQueue = []; this.queueTimestamp = Date.now(); this.save(); renderQueueList(); 
    },
    blockCountry(code) { 
        const { invalidateCountryFilterCache } = require('./chat.js');
        if (!code) return; this.blockedCountriesSet.add(code.toUpperCase()); this.save(); invalidateCountryFilterCache(); 
    },
    unblockCountry(code) { 
        const { invalidateCountryFilterCache } = require('./chat.js');
        if (!code) return; this.blockedCountriesSet.delete(code.toUpperCase()); this.save(); invalidateCountryFilterCache(); 
    },
    isCountryAllowed(code) {
        let evalCode = code ? code.toUpperCase() : 'XX';
        if (!AVAILABLE_COUNTRIES[evalCode]) evalCode = 'XX';
        return !this.blockedCountriesSet.has(evalCode);
    },
    allowAllCountries() { 
        const { invalidateCountryFilterCache } = require('./chat.js');
        this.blockedCountriesSet.clear(); this.save(); invalidateCountryFilterCache(); 
    },
    blockAllCountries() { 
        const { invalidateCountryFilterCache } = require('./chat.js');
        Object.keys(AVAILABLE_COUNTRIES).forEach(c => this.blockedCountriesSet.add(c)); this.save(); invalidateCountryFilterCache(); 
    },
    markPositive(userId) { this.positive.add(userId); this.negative.delete(userId); this.save(); },
    markNegative(userId) { this.negative.add(userId); this.positive.delete(userId); this.save(); },
    clearReputation(userId) { this.positive.delete(userId); this.negative.delete(userId); this.save(); },
    isPositive(userId) { return this.positive.has(userId); },
    isNegative(userId) { return this.negative.has(userId); },
    setTheme(theme) { this.selectedTheme = theme; this.save(); },
    isMotdDismissed(gameId) { return this.dismissedMotds.has(gameId || 'global'); },
    dismissMotd(gameId) { this.dismissedMotds.add(gameId || 'global'); },
    restoreMotd(gameId) { this.dismissedMotds.delete(gameId || 'global'); },
    recordUserPosition(gameId, username, position, rankLetter, elo) {
        if (!gameId || !username || typeof position !== 'number' || position <= 0) return false;
        const key = `${String(gameId).toLowerCase()}:${String(username).toLowerCase().trim()}`;
        if (!this.userPositionHistory[key]) {
            this.userPositionHistory[key] = [];
        }
        const history = this.userPositionHistory[key];
        const last = history[history.length - 1];
        if (last && last.pos === position) {
            if (rankLetter && last.rank !== rankLetter) last.rank = rankLetter;
            if (elo && last.elo !== elo) last.elo = elo;
            return false;
        }
        history.push({
            timestamp: Date.now(),
            pos: position,
            rank: rankLetter || null,
            elo: elo || null
        });
        if (history.length > 10) {
            this.userPositionHistory[key] = history.slice(-10);
        }
        this.save();
        return true;
    },
    getUserPositionHistory(gameId, username) {
        if (!gameId || !username) return [];
        const key = `${String(gameId).toLowerCase()}:${String(username).toLowerCase().trim()}`;
        return this.userPositionHistory[key] || [];
    },
    getUserPositionDelta(gameId, username) {
        const history = this.getUserPositionHistory(gameId, username);
        if (!history || history.length === 0) return null;
        const current = history[history.length - 1];
        if (history.length === 1) {
            return {
                diff: 0,
                status: 'initial',
                text: '',
                previousPos: null,
                currentPos: current.pos,
                history
            };
        }
        const previous = history[history.length - 2];
        const diff = previous.pos - current.pos;
        let status = 'same';
        let text = '—';
        if (diff > 0) {
            status = 'up';
            text = `▲ +${diff}`;
        } else if (diff < 0) {
            status = 'down';
            text = `▼ ${diff}`;
        }
        return {
            diff,
            status,
            text,
            previousPos: previous.pos,
            currentPos: current.pos,
            history
        };
    }
};

module.exports = { CerberusData, safeLoadJSON, atomicWriteJSON };