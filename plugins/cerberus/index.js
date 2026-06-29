// cerberus/index.js

function init(FCADE) {
    window.CerberusFCADE = FCADE;
    const { CerberusData } = require('./state.js');
    const { ConfigManager } = require('./config.js');
    const { RankCache } = require('./api.js');
    const { injectStyles, createControlPanel, createQueuePanel, applyTheme, injectGlobalMenu, injectHeaderButtons, injectSidebarSearch, injectUIEnhancements, unlockColorThemes } = require('./ui.js');
    const { connectToChannelWhenAvailable, setupAudioSilencer, checkForUpdates, executeChatMacro, t } = require('./utils.js');
    const { updateFilterShield, attachMultiObservers } = require('./chat.js');
    
    // 1. Carga de Dados (RAM)
    CerberusData.load();
    ConfigManager.loadConfig();
    RankCache.load();
    
    // 2. Setup Base
    injectStyles();
    createControlPanel();
    setupAudioSilencer();
    
    // [CERBERUS] Correção do Bug do Hover: O menu tem de ser injetado fisicamente no milissegundo zero
    injectGlobalMenu();

    const runtimeConfig = ConfigManager.getRuntimeConfig();

    if (runtimeConfig.autoJoin?.enabled) {
        connectToChannelWhenAvailable(FCADE, runtimeConfig.autoJoin);
    }

    if (runtimeConfig.liveQueue?.enabled === true) createQueuePanel();

    if (window.cerbMainLoopInterval) clearInterval(window.cerbMainLoopInterval);
    
    window.cerbMainLoopInterval = setInterval(() => {
        // [CERBERUS] Performance: require() movidos para o topo do init()
        
        // Defesas e Observadores Base
        updateFilterShield(); 
        attachMultiObservers(FCADE, runtimeConfig);

        // [CERBERUS] UI Healing Watchdog: Protege contra a reciclagem do Vue.js
        try {
            injectHeaderButtons(FCADE);
            injectSidebarSearch();
            injectUIEnhancements();
            if (runtimeConfig.chatUserInfo?.unlockColorThemes !== false) {
                unlockColorThemes();
            }
        } catch (e) {}
        
        // NOTA DE ENGENHARIA: As funções fullChatScanScoped e updateSidebarScope foram amputadas
        // deste loop de 3s para erradicar o estrangulamento de CPU (Reflow Violations de 121ms).
        // A injeção de novas mensagens está agora 100% delegada à eficiência do MutationObserver.

        const menu = document.getElementById('cerbGlobalMenu');
        if (menu && menu.classList.contains('visible') && !window.CerberusState.menuIsHovered) {
            menu.classList.remove('visible');
        }
    }, 3000);
    
    // [CERBERUS] Correção Spam Cruzado: Bot Aggregator Isolado por Sala
    if (window.cerbReplyQueueInterval) clearInterval(window.cerbReplyQueueInterval);
    
    window.cerbReplyQueueInterval = setInterval(() => {
        // [CERBERUS] Performance: require() movidos para o topo do init()

        const rtCfg = ConfigManager.getRuntimeConfig();
        const qEnabled = rtCfg.liveQueue?.enabled === true;

        if (qEnabled && window.CerberusState.liveMasterOn && window.CerberusState.replyQueue.length > 0 && rtCfg.liveQueue?.autoReply) {
            const currentChannel = FCADE.activeChannelId;
            const validEntries = window.CerberusState.replyQueue.filter(q => q.channelId === currentChannel);
            
            // Retém ou descarta as mensagens que pertencem a salas invisíveis
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

    // [CERBERUS] Correção de Tema: O tempo subiu de 2.5s para 5s para aguardar construção do HTML
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