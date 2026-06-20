const { CerberusData } = require('./state.js');
const { ConfigManager } = require('./config.js');
const { RankCache } = require('./api.js');
const { injectStyles, injectGlobalMenu, createControlPanel, createQueuePanel, injectHeaderButtons, injectSidebarSearch, injectUIEnhancements, applyTheme, unlockColorThemes } = require('./ui.js');
const { updateFilterShield, attachMultiObservers, fullChatScanScoped, updateSidebarScope } = require('./chat.js');
const { checkForUpdates, connectToChannelWhenAvailable, executeChatMacro, getActiveChannelWrapper, getActiveGameId, t, setupAudioSilencer } = require('./utils.js');
const { CURRENT_VERSION } = require('./constants.js');

function init(FCADE) {
    console.log(`🐺 Cerberus v${CURRENT_VERSION} (CommonJS) Inicializado`);
    window.CerberusFCADE = FCADE;

    // Inicia a vigilância e silenciador da placa de som
    setupAudioSilencer();

    CerberusData.load(); 
    ConfigManager.loadConfig(); 
    RankCache.load();

    updateFilterShield(); 
    checkForUpdates();
    
    const runtimeConfig = ConfigManager.getRuntimeConfig();
    if (runtimeConfig.autoJoin?.enabled !== false) connectToChannelWhenAvailable(FCADE, runtimeConfig.autoJoin);

    injectStyles(); 
    injectGlobalMenu(); 
    createControlPanel();
    
    if (runtimeConfig.liveQueue?.enabled === true) createQueuePanel();

    if (window.cerbMainLoopInterval) clearInterval(window.cerbMainLoopInterval);
    
    window.cerbMainLoopInterval = setInterval(() => {
        try {
            const rtCfg = ConfigManager.getRuntimeConfig();
            const qEnabled = rtCfg.liveQueue.enabled === true;
            const countryEnabled = rtCfg.countryFilter.enabled === true;
            const rankingsEnabled = rtCfg.rankings.masterEnabled !== false;
            const currentSignature = `${FCADE?.activeChannelId || ''}|${qEnabled}|${countryEnabled}|${rankingsEnabled}`;

            if (window.CerberusState.lastUIRenderSignature !== currentSignature) {
                const cw = getActiveChannelWrapper();
                if (cw) {
                    injectHeaderButtons(FCADE); 
                    injectSidebarSearch(); 
                    injectUIEnhancements();
                    window.CerberusState.lastUIRenderSignature = currentSignature;
                    fullChatScanScoped(cw, FCADE, rtCfg);
                    const sidebar = cw.querySelector('.usersListWrapper');
                    if (sidebar) updateSidebarScope(sidebar, FCADE, rtCfg);
                }
            }

            attachMultiObservers(FCADE, rtCfg);
            
            if (rtCfg.chatUserInfo?.unlockColorThemes !== false) {
                unlockColorThemes();
            }
        } catch (err) { 
            console.error("[Cerberus] Main Loop Error:", err);
        }
    }, 1000);

    if (window.cerbReplyQueueInterval) clearInterval(window.cerbReplyQueueInterval);
    
    window.cerbReplyQueueInterval = setInterval(() => {
        const rtCfg = ConfigManager.getRuntimeConfig();
        const qEnabled = rtCfg.liveQueue.enabled === true;
        if (qEnabled && window.CerberusState.liveMasterOn && window.CerberusState.replyQueue.length > 0 && rtCfg.liveQueue.autoReply) {
            const names = window.CerberusState.replyQueue.join(', '); window.CerberusState.replyQueue = [];
            const msg1 = `${t('queue.welcome')} ${names}`; let queueStr = CerberusData.liveQueue.filter(p => !p.played).map((p, i) => `${i + 1}. ${p.name}`).join(', ');
            executeChatMacro(queueStr ? [msg1, `${t('queue.currentQueue')} ${queueStr}`] : [msg1]);
        } else { window.CerberusState.replyQueue = []; }
    }, 15000);

    setTimeout(() => applyTheme(CerberusData.selectedTheme), 2500);

    window.CerberusState.menuCleanupInterval = setInterval(() => {
        const menu = document.getElementById('cerbGlobalMenu');
        if (menu && menu.classList.contains('visible') && !window.CerberusState.menuIsHovered) menu.classList.remove('visible');
    }, 3000);
    
    scheduleAutoSync(FCADE);
}

function scheduleAutoSync(FCADE) {
    const rankingsEnabled = ConfigManager.getSetting('rankings.masterEnabled') !== false;
    if (!rankingsEnabled || ConfigManager.getSetting('chatUserInfo.showNumericRanks') !== true) return;
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
        
        if (savedLastUpdate && RankCache.data[gameId] && RankCache.data[gameId].lastUpdate === 0) {
            RankCache.data[gameId].lastUpdate = savedLastUpdate;
        }
    }, 500);
}

module.exports = { init };