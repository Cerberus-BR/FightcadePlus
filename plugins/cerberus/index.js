// cerberus/index.js

function init(FCADE) {
    window.CerberusFCADE = FCADE;
    const { CerberusData } = require('./state.js');
    const { ConfigManager } = require('./config.js');
    const { RankCache } = require('./api.js');
    const { injectStyles, createControlPanel, createQueuePanel, applyTheme, injectGlobalMenu, injectHeaderButtons, injectSidebarSearch, injectUIEnhancements, unlockColorThemes } = require('./ui.js');
    const { connectToChannelWhenAvailable, setupAudioSilencer, checkForUpdates, executeChatMacro, t } = require('./utils.js');
    const { updateFilterShield, attachMultiObservers } = require('./chat.js');
    
    // 1. Data Loading (RAM)
    CerberusData.load();
    ConfigManager.loadConfig();
    RankCache.load();
    
    // 2. Base Setup
    injectStyles();
    createControlPanel();
    setupAudioSilencer();
    
    // [CERBERUS] Hover bug fix: The menu must be physically injected at millisecond zero
    injectGlobalMenu();

    const runtimeConfig = ConfigManager.getRuntimeConfig();

    if (runtimeConfig.autoJoin?.enabled) {
        connectToChannelWhenAvailable(FCADE, runtimeConfig.autoJoin);
    }

    if (runtimeConfig.liveQueue?.enabled === true) createQueuePanel();

    if (window.cerbMainLoopInterval) clearInterval(window.cerbMainLoopInterval);
    
    window.cerbMainLoopInterval = setInterval(() => {
        // [CERBERUS] Performance: require() calls moved to top of init()
        
        // Base Defenses and Observers
        updateFilterShield(); 
        attachMultiObservers(FCADE, runtimeConfig);

        // [CERBERUS] UI Healing Watchdog: Protects against Vue.js component recycling
        try {
            injectHeaderButtons(FCADE);
            injectSidebarSearch();
            injectUIEnhancements();
            if (runtimeConfig.chatUserInfo?.unlockColorThemes !== false) {
                unlockColorThemes();
            }
        } catch (e) {}
        
        // ENGINEERING NOTE: fullChatScanScoped and updateSidebarScope functions were removed
        // from this 3s loop to eradicate CPU throttling (121ms Reflow Violations).
        // New message processing is now 100% delegated to the MutationObserver.

        const menu = document.getElementById('cerbGlobalMenu');
        if (menu && menu.classList.contains('visible') && !window.CerberusState.menuIsHovered) {
            menu.classList.remove('visible');
        }
    }, 3000);
    
    // [CERBERUS] Cross-Chat Spam Fix: Isolated Bot Aggregator per Room
    if (window.cerbReplyQueueInterval) clearInterval(window.cerbReplyQueueInterval);
    
    window.cerbReplyQueueInterval = setInterval(() => {
        // [CERBERUS] Performance: require() calls moved to top of init()

        const rtCfg = ConfigManager.getRuntimeConfig();
        const qEnabled = rtCfg.liveQueue?.enabled === true;

        if (qEnabled && window.CerberusState.liveMasterOn && window.CerberusState.replyQueue.length > 0 && rtCfg.liveQueue?.autoReply) {
            const currentChannel = FCADE.activeChannelId;
            const validEntries = window.CerberusState.replyQueue.filter(q => q.channelId === currentChannel);
            
            // Keep or discard messages belonging to invisible rooms
            window.CerberusState.replyQueue = window.CerberusState.replyQueue.filter(q => q.channelId !== currentChannel);

            if (validEntries.length > 0) {
                const names = validEntries.map(q => q.name).join(', ');
                const msg1 = `${t('queue.welcome')} ${names}`; 
                let queueStr = CerberusData.liveQueue.filter(p => !p.played).map((p, i) => `${i + 1}. ${p.name}`).join(', ');
                executeChatMacro(queueStr ? [msg1, `${t('queue.currentQueue')} ${queueStr}`] : [msg1]);
            }
        } else if (!qEnabled || !window.CerberusState.liveMasterOn) {
            window.CerberusState.replyQueue = [];
        }
    }, 15000);

    // [CERBERUS] Theme Fix: Timeout increased from 2.5s to 5s to wait for HTML construction
    setTimeout(() => applyTheme(CerberusData.selectedTheme), 5000);

    scheduleAutoSync(FCADE);
    checkForUpdates();
}

function scheduleAutoSync(FCADE) {
    const { getActiveGameId } = require('./utils.js');
    const { RankCache } = require('./api.js');
    
    if (window.cerbAutoSyncInterval) clearInterval(window.cerbAutoSyncInterval);
    
    window.cerbAutoSyncInterval = setInterval(() => {
        const gameId = getActiveGameId(FCADE);
        if (gameId && !RankCache.isSyncing) {
            const lastSync = RankCache.data[gameId]?.lastUpdate || 0;
            if (Date.now() - lastSync > 43200000) { 
                RankCache.syncRankings(gameId);
            }
        }
    }, 60000);
}

module.exports = { init };