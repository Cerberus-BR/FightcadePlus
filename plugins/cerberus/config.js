// cerberus/config.js

const fs = require('fs');
const path = require('path');
const { defaultConfig } = require('./constants.js');
const { atomicWriteJSON, safeLoadJSON } = require('./state.js');

const configPath = path.join(__dirname, '..', 'cerberus_config.json');

let runtimeConfig = null;
let fullConfigCache = null;
let configSaveTimeout = null;

const ConfigManager = {
    loadConfig() {
        const { updateFilterShield } = require('./chat.js');
        const fullConfig = safeLoadJSON(configPath, null);
        if (fullConfig) {
            fullConfigCache = fullConfig; runtimeConfig = { ...defaultConfig, ...(fullConfig.cerberus || {}) };
            runtimeConfig.chatUserInfo = { ...defaultConfig.chatUserInfo, ...(runtimeConfig.chatUserInfo || {}) };
            runtimeConfig.liveQueue = { ...defaultConfig.liveQueue, ...(runtimeConfig.liveQueue || {}) };
            runtimeConfig.rankings = { ...defaultConfig.rankings, ...(runtimeConfig.rankings || {}) };
            runtimeConfig.countryFilter = { ...defaultConfig.countryFilter, ...(runtimeConfig.countryFilter || {}) };
        } else { 
            runtimeConfig = JSON.parse(JSON.stringify(defaultConfig)); 
            fullConfigCache = { cerberus: runtimeConfig }; 
            this.saveConfig(); 
        }
        updateFilterShield();
    },
    saveConfig() {
        clearTimeout(configSaveTimeout);
        configSaveTimeout = setTimeout(() => {
            if (!fullConfigCache) fullConfigCache = {}; 
            fullConfigCache.cerberus = runtimeConfig;
            atomicWriteJSON(configPath, fullConfigCache).catch(() => { });
        }, 500);
    },
    updateSetting(pathStr, value) {
        const { updateFilterShield, invalidateCountryFilterCache, fullChatScanScoped } = require('./chat.js');
        const { getActiveChannelWrapper } = require('./utils.js');

        const keys = pathStr.split('.'); let current = runtimeConfig;
        for (let i = 0; i < keys.length - 1; i++) { if (!current[keys[i]]) current[keys[i]] = {}; current = current[keys[i]]; }
        current[keys[keys.length - 1]] = value; this.saveConfig();

        if ((pathStr.startsWith('chatUserInfo.') && pathStr !== 'chatUserInfo.replacePingBarWithText') || pathStr === 'rankings.masterEnabled') {
            document.querySelectorAll('.messageWrapper').forEach(wrapper => {
                wrapper.querySelectorAll('.cerberus-injected-status, .cerberus-injected-flag, .cerberus-injected-rank, .cerberus-injected-pingbar, .cerberus-injected-pingtext, .cerb-rank-badge').forEach(el => el.remove());
                wrapper.removeAttribute('data-cerberus-processed'); wrapper.removeAttribute('data-cerb-identity');
            });
            if (window.CerberusFCADE) {
                const cw = getActiveChannelWrapper();
                if (cw) fullChatScanScoped(cw, window.CerberusFCADE, runtimeConfig);
            }
        }
        
        if (pathStr === 'liveQueue.enabled' && value === false) { 
            window.CerberusState.lastUIRenderSignature = ''; 
            window.CerberusState.liveMasterOn = false;
            window.CerberusState.replyQueue = [];
            if (window.CerberusState.promoBotInterval) {
                clearInterval(window.CerberusState.promoBotInterval);
                window.CerberusState.promoBotInterval = null;
            }
        }
        
        if (pathStr === 'countryFilter.enabled' || pathStr === 'chatUserInfo.hideNegativeMessages') { 
            updateFilterShield(); 
            invalidateCountryFilterCache(); 
        }
    },
    getSetting(pathStr) {
        const keys = pathStr.split('.'); let current = runtimeConfig;
        for (const key of keys) { if (current === undefined || current === null) return undefined; current = current[key]; }
        return current;
    },
    getRuntimeConfig() {
        return runtimeConfig;
    }
};

module.exports = { ConfigManager };