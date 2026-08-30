// cerberus/index.js

function init(FCADE) {
    window.CerberusFCADE = FCADE;
    const { CerberusData } = require('./state.js');
    const { ConfigManager } = require('./config.js');
    const { RankCache } = require('./api.js');
    const { injectStyles, createControlPanel, createQueuePanel, applyTheme, injectGlobalMenu, injectHeaderButtons, injectSidebarSearch, injectUIEnhancements, onChannelSwitch, unlockColorThemes } = require('./ui.js');
    const { connectToChannelWhenAvailable, setupAudioSilencer, checkForUpdates, executeChatMacro, blockAnalyticsAndTagManager, t } = require('./utils.js');
    const { updateFilterShield, attachMultiObservers, setupChatMessageInterceptor } = require('./chat.js');
    const { setupChallengeInterceptor } = require('./challenge.js');
    
    // 0. Privacy Shield & Safety Patch
    blockAnalyticsAndTagManager();
    const VueConstructor = FCADE?.constructor || window.Vue;
    if (VueConstructor && typeof VueConstructor.set === 'function' && !VueConstructor._cerbSetPatched) {
        const origSet = VueConstructor.set;
        VueConstructor.set = function(target, key, val) {
            if (!target || typeof target !== 'object') return val;
            return origSet.call(this, target, key, val);
        };
        VueConstructor._cerbSetPatched = true;
    }
    CerberusData.load();
    ConfigManager.loadConfig();
    RankCache.load();
    
    // 2. Network Interceptors (WebSocket Layer)
    setupChallengeInterceptor(FCADE);
    setupChatMessageInterceptor(FCADE);

    // 3. Base Setup
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
    
    // [CERBERUS] Performance: Watchdog interval relaxed to 10s (Event-driven UI healing handles channel switches)
    window.cerbMainLoopInterval = setInterval(() => {
        updateFilterShield(); 
        attachMultiObservers(FCADE, runtimeConfig);

        try {
            injectHeaderButtons(FCADE);
            injectSidebarSearch();
            injectUIEnhancements();
            if (runtimeConfig.chatUserInfo?.unlockColorThemes !== false) {
                unlockColorThemes();
            }
        } catch (e) {}

        const menu = document.getElementById('cerbGlobalMenu');
        if (menu && menu.classList.contains('visible') && !window.CerberusState.menuIsHovered) {
            menu.classList.remove('visible');
        }
    }, 10000);
    
    // [CERBERUS] Live Queue Timer: Runs only when liveQueue feature is enabled
    if (window.cerbReplyQueueInterval) clearInterval(window.cerbReplyQueueInterval);
    
    window.cerbReplyQueueInterval = setInterval(() => {
        const rtCfg = ConfigManager.getRuntimeConfig();
        const qEnabled = rtCfg.liveQueue?.enabled === true;

        if (!qEnabled) {
            window.CerberusState.replyQueue = [];
            return;
        }

        if (window.CerberusState.liveMasterOn && window.CerberusState.replyQueue.length > 0 && rtCfg.liveQueue?.autoReply) {
            const currentChannel = FCADE.activeChannelId;
            const validEntries = window.CerberusState.replyQueue.filter(q => q.channelId === currentChannel);
            
            window.CerberusState.replyQueue = window.CerberusState.replyQueue.filter(q => q.channelId !== currentChannel);

            if (validEntries.length > 0) {
                const names = validEntries.map(q => q.name).join(', ');
                const msg1 = `${t('queue.welcome')} ${names}`; 
                let queueStr = CerberusData.liveQueue.filter(p => !p.played).map((p, i) => `${i + 1}. ${p.name}`).join(', ');
                executeChatMacro(queueStr ? [msg1, `${t('queue.currentQueue')} ${queueStr}`] : [msg1]);
            }
        }
    }, 15000);

    // [CERBERUS] Theme Fix: Timeout increased from 2.5s to 5s to wait for HTML construction
    setTimeout(() => applyTheme(CerberusData.selectedTheme), 5000);

    scheduleAutoSync(FCADE);
    observeChannelSwitches(FCADE);
    checkForUpdates();
}

function scheduleAutoSync(FCADE) {
    const { getActiveGameId } = require('./utils.js');
    const { RankCache } = require('./api.js');
    const { ConfigManager } = require('./config.js');
    
    if (window.cerbAutoSyncInterval) clearInterval(window.cerbAutoSyncInterval);
    
    window.cerbAutoSyncInterval = setInterval(() => {
        const autoSyncEnabled = ConfigManager.getSetting('rankings.autoSync') !== false;
        if (!autoSyncEnabled) return;

        const gameId = getActiveGameId(FCADE);
        if (gameId && !RankCache.isSyncing) {
            const lastSync = RankCache.data[gameId]?.lastUpdate || 0;
            if (Date.now() - lastSync > 43200000) { 
                RankCache.syncRankings(gameId);
            }
        }
    }, 60000);
}

// [CERBERUS] Multi-Room Fix: Observe channel tab switches via MutationObserver
function observeChannelSwitches(FCADE) {
    if (window.cerbChannelSwitchObserver) {
        window.cerbChannelSwitchObserver.disconnect();
        window.cerbChannelSwitchObserver = null;
    }

    const channelsList = document.querySelector('.channelsList');
    if (!channelsList) return;

    let switchDebounce = null;

    window.cerbChannelSwitchObserver = new MutationObserver(mutations => {
        let switchDetected = false;
        for (const mut of mutations) {
            if (mut.type === 'attributes' && mut.attributeName === 'class') {
                const target = mut.target;
                if (target.classList?.contains('channelItem') && target.classList.contains('active')) {
                    switchDetected = true;
                    break;
                }
            }
        }

        if (switchDetected) {
            clearTimeout(switchDebounce);
            switchDebounce = setTimeout(() => {
                const { onChannelSwitch } = require('./ui.js');
                onChannelSwitch(FCADE);
            }, 100);
        }
    });

    window.cerbChannelSwitchObserver.observe(channelsList, {
        subtree: true,
        attributes: true,
        attributeFilter: ['class']
    });
}

module.exports = { init };