// cerberus/state.js

const fs = require('fs');
const path = require('path');
const { AVAILABLE_COUNTRIES } = require('./constants.js');

const dataPath = path.join(__dirname, '..', 'cerberus_data.json');

if (!window.CerberusState) {
    window.CerberusState = { 
        liveMasterOn: false, promoBotInterval: null, replyQueue: [], 
        menuIsHovered: false, menuHideTimeout: null, menuShowTimeout: null, 
        menuCleanupInterval: null, sidebarSearchTerm: '', lastUIRenderSignature: '',
        lastAutoRejectNotifyTime: 0
    };
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

let dataSaveTimeout = null;

const CerberusData = {
    blockedCountriesSet: new Set(), positive: new Set(), negative: new Set(), selectedTheme: 'bretema', lastUpdateCheck: 0, latestVersion: null, downloadUrl: null, liveQueue: [], queueTimestamp: 0,
    
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
            if (Date.now() - this.queueTimestamp > 43200000) { this.liveQueue = []; this.queueTimestamp = Date.now(); } else { this.liveQueue = data.liveQueue || []; }
        }
    },
    save() {
        clearTimeout(dataSaveTimeout);
        dataSaveTimeout = setTimeout(() => {
            atomicWriteJSON(dataPath, { blockedCountries: [...this.blockedCountriesSet], positive: [...this.positive], negative: [...this.negative], selectedTheme: this.selectedTheme, lastUpdateCheck: this.lastUpdateCheck, latestVersion: this.latestVersion, downloadUrl: this.downloadUrl, liveQueue: this.liveQueue, queueTimestamp: this.queueTimestamp, lastUpdated: new Date().toISOString() }).catch(() => { });
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
        if (index < 0 || index >= this.liveQueue.length) return; 
        this.liveQueue.splice(index, 1); this.queueTimestamp = Date.now(); this.save(); renderQueueList(); 
    },
    togglePlayedQueue(index) {
        const { renderQueueList } = require('./ui.js');
        if (this.liveQueue[index]) {
            this.liveQueue[index].played = !this.liveQueue[index].played;
            if (this.liveQueue[index].played) { const item = this.liveQueue.splice(index, 1)[0]; this.liveQueue.push(item); }
            this.queueTimestamp = Date.now(); this.save(); renderQueueList();
        }
    },
    moveQueue(index, direction) {
        const { renderQueueList } = require('./ui.js');
        if (index < 0 || index >= this.liveQueue.length) return; const newIndex = index + direction; if (newIndex < 0 || newIndex >= this.liveQueue.length) return;
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
    setTheme(theme) { this.selectedTheme = theme; this.save(); }
};

module.exports = { CerberusData, safeLoadJSON, atomicWriteJSON };