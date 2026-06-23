function updateFilterShield() {
    const { ConfigManager } = require('./config.js');
    const isCountryActive = ConfigManager.getSetting('countryFilter.enabled') === true;
    const isHideNegActive = ConfigManager.getSetting('chatUserInfo.hideNegativeMessages') === true;
    const isSearchActive = (window.CerberusState.sidebarSearchTerm || '') !== '';
    if (isCountryActive || isHideNegActive || isSearchActive) document.body.classList.add('cerb-filters-active');
    else document.body.classList.remove('cerb-filters-active');
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

function invalidateCountryFilterCache() {
    const { getActiveChannelWrapper } = require('./utils.js');
    const { ConfigManager } = require('./config.js');

    unfilterAllMessages(); unfilterAllUsers();
    if (window.CerberusFCADE && ConfigManager.getRuntimeConfig()) {
        const cw = getActiveChannelWrapper();
        if (cw) {
            fullChatScanScoped(cw, window.CerberusFCADE, ConfigManager.getRuntimeConfig());
            const sidebar = cw.querySelector('.usersListWrapper');
            if (sidebar) updateSidebarScope(sidebar, window.CerberusFCADE, ConfigManager.getRuntimeConfig());
        }
    }
}

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
    const { getActiveGameId } = require('./utils.js');
    if (!wrappersArray || wrappersArray.length === 0) return;

    const cw = wrappersArray[0].closest('.channelWrapper');
    // [CERBERUS] Trava de Visibilidade Removida: Processar abas em background (Correção de Fuga de Áudio)

    const activeGameId = getActiveGameId(FCADE, cw);
    const globalUsers = FCADE.globalUsers || {};

    const activeChannelId = FCADE.activeChannelId;
    const usersList = FCADE.$refs[activeChannelId]?.[0]?.$refs?.usersList?.$children;

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
    const { CerberusData } = require('./state.js');
    const { RankCache } = require('./api.js');
    const { normalizeUsername, isSystemUser, getMinPing, playPopSound, silenceRecentAudios } = require('./utils.js');
    const { createStatusElement, createFlagElement, createRankElement, createPingElement, createPingTextElement, createRankBadge, applyReputationStyleChat, addReputationControlsToElement, applyDevBadge } = require('./ui.js');
    const { ConfigManager } = require('./config.js');

    const isImmuneSystem = wrapper.querySelector('.endgameMessageWrapper') !== null || wrapper.classList.contains('endgame') || wrapper.classList.contains('challengeRequested') || wrapper.classList.contains('requestChallenge');
    
    let identity = wrapper.className + '-' + (activeGameId || 'global'); 
    
    const authorEl = wrapper.querySelector('span.author');
    if (authorEl) {
        identity += '-' + authorEl.textContent.trim();
        const timeEl = wrapper.querySelector('.time');
        if (timeEl) identity += '-' + timeEl.textContent.trim();
    } else { 
        const chalName = wrapper.querySelector('.challengeContent .name'); 
        if (chalName) identity += '-chal-' + chalName.textContent.trim(); 
        else identity += '-' + (wrapper.textContent.substring(0, 20).trim()); 
    }

    if (wrapper.dataset.cerbIdentity !== identity) {
        const chalName = wrapper.querySelector('.challengeContent .name');
        if (wrapper.dataset.cerbRejected === "true" && !chalName) {
            // [CERBERUS] Preservação de Estado: O Vue.js reciclou um convite bloqueado para texto puro. Mantemos oculto.
            wrapper.style.display = 'none';
            wrapper.dataset.cerbIdentity = identity;
            wrapper.dataset.cerberusProcessed = "true";
        } else {
            // Nova mensagem ou novo desafio legítimo. Limpamos a ficha de bloqueio.
            wrapper.removeAttribute('data-cerb-rejected');
            wrapper.removeAttribute('data-cerberus-processed'); 
            wrapper.removeAttribute('data-cerberus-hidden'); 
            wrapper.style.display = '';
            wrapper.querySelectorAll('.cerberus-injected-status, .cerberus-injected-flag, .cerberus-injected-rank, .cerberus-injected-pingbar, .cerberus-injected-pingtext, .cerb-rank-badge').forEach(el => el.remove());
            wrapper.dataset.cerbIdentity = identity;
        }
    }

    if (!wrapper.dataset.cerberusProcessed) {
        if (isImmuneSystem) { 
            wrapper.dataset.cerberusHidden = "false"; 
            wrapper.style.display = ''; 

            if (wrapper.classList.contains('challengeRequested') && !wrapper.dataset.cerbRejected) {
                const chalNameEl = wrapper.querySelector('.challengeContent .name');
                if (chalNameEl) {
                    const chalUserKey = normalizeUsername(chalNameEl.textContent);
                    const isNeg = CerberusData.isNegative(chalUserKey);
                    const userCountry = globalUsers[chalUserKey]?.country?.iso_code?.toUpperCase();
                    const isCountryBlocked = filterCfg?.enabled && !CerberusData.isCountryAllowed(userCountry) && !CerberusData.isPositive(chalUserKey);

                    let shouldReject = false;

                    if ((isNeg && cfg?.autoRejectNegative) || (isCountryBlocked && filterCfg?.autoReject)) {
                        shouldReject = true;
                    }

                    const minRank = ConfigManager.getSetting('rankings.minRankToAccept') || 0;
                    if (!shouldReject && minRank > 0 && !CerberusData.isPositive(chalUserKey)) {
                        const rankImg = wrapper.querySelector('.challengeContent .userInfo .rank img');
                        let userRankNum = 0; 
                        
                        if (rankImg) {
                            const match = rankImg.src.match(/rank(\d+)\.png/);
                            if (match) userRankNum = parseInt(match[1], 10);
                        }
                        
                        if (userRankNum < minRank) {
                            shouldReject = true;
                        }
                    }

                    if (shouldReject) {
                        // [CERBERUS] Desacoplamento Visual: Esconde incondicionalmente (corrige o botão fantasma)
                        wrapper.dataset.cerbRejected = "true";
                        wrapper.style.display = 'none'; 

                        const declineBtn = wrapper.querySelector('.decline-challenge, .decline') || Array.from(wrapper.querySelectorAll('.button-generic, button, div')).find(b => /decline|recusar|reject|cancel/i.test(b.textContent));
                        if (declineBtn) {
                            declineBtn.click();
                            silenceRecentAudios(); 
                        }
                        return; // Encerra o processamento do DOM para este nó
                    }
                }
            }

        } else {
            const msg = wrapper.querySelector('.message.chat');
            if (msg) {
                const author = msg.querySelector('span.author');
                if (author) {
                    let userKey = normalizeUsername(author.textContent);
                    if (userKey) {
                        applyDevBadge(author, userKey);
                        
                        if (queueCfg?.enabled && queueCfg.keyword && window.CerberusState.liveMasterOn) {
                            let msgText = ''; msg.querySelectorAll('.blocksContainer .blocks .regular').forEach(span => { msgText += span.textContent; });
                            msgText = msgText.trim().toLowerCase(); const streamerNick = queueCfg.streamerNick || '';
                            if (msgText === queueCfg.keyword.toLowerCase() && userKey.toLowerCase() !== streamerNick.toLowerCase()) {
                                if (CerberusData.addQueue(userKey)) { 
                                    playPopSound(); 
                                    if (!window.CerberusState.replyQueue) window.CerberusState.replyQueue = []; 
                                    // [CERBERUS] Anexa o channelId para evitar o Spam Cruzado
                                    window.CerberusState.replyQueue.push({ name: userKey, channelId: FCADE.activeChannelId }); 
                                }
                            }
                        }
                        const user = globalUsers[userKey]; let userCountry = user ? user.country?.iso_code?.toUpperCase() : null;

                        const userFound = activeUsersMap ? activeUsersMap.get(userKey) : null;
                        const minPingVal = getMinPing(userFound);

                        let statusState = 'offline'; if (user && user.away === false) statusState = 'online'; else if (user && user.away === true) statusState = 'away';
                        
                        const masterVisuals = cfg.masterEnabled !== false;
                        const rankingsEnabled = ConfigManager.getSetting('rankings.masterEnabled') !== false;

                        if (rankingsEnabled && cfg.showNumericRanks && activeGameId) { const numericRank = RankCache.getRank(activeGameId, userKey); if (numericRank !== null) author.appendChild(createRankBadge(numericRank)); }

                        const elements = {
                            status: (masterVisuals && cfg.enableStatus) ? createStatusElement(statusState) : null,
                            flag: (masterVisuals && cfg.enableFlag && user?.country) ? createFlagElement(user.country) : null,
                            rank: (masterVisuals && cfg.enableRank && userFound?.rankSrc) ? createRankElement(userFound.rankSrc, userFound.rankTitle) : null,
                            pingBar: (masterVisuals && cfg.enablePingBars && userFound?.pingSrc) ? createPingElement(userFound.pingSrc, userFound.pingTitle) : null,
                            pingText: (masterVisuals && cfg.enablePingText && minPingVal !== null) ? createPingTextElement(minPingVal) : null
                        };

                        if (cfg.enableReputation && !isSystemUser(userKey)) { 
                            applyReputationStyleChat(author, msg, userKey, false); 
                            wrapper.dataset.currentUser = userKey;
                            addReputationControlsToElement(wrapper, 'chat'); 
                        }
                        
                        if (elements.status) author.parentElement.insertBefore(elements.status, author);
                        if (elements.flag) author.appendChild(elements.flag); 
                        if (elements.rank) author.appendChild(elements.rank); 
                        if (elements.pingBar) author.appendChild(elements.pingBar); 
                        if (elements.pingText) author.appendChild(elements.pingText);
                        if (cfg.blurMode === 'individual') msg.classList.add('blur-individual');
                        
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
    const { CerberusData } = require('./state.js');
    const { RankCache } = require('./api.js');
    const { normalizeUsername, isSystemUser, extractMinPing } = require('./utils.js');
    const { getActiveGameId } = require('./utils.js');
    const { createRankBadge, applyReputationStyleList, applyReputationStyleMatch, addReputationControlsToElement, applyDevBadge } = require('./ui.js');
    const { ConfigManager } = require('./config.js');
    const { COUNTRY_NAME_TO_CODE } = require('./constants.js');

    if (!sidebarElement) return;

    const cw = sidebarElement.closest('.channelWrapper');
    if (cw && cw.style.display === 'none') return;

    const globalUsers = FCADE.globalUsers; if (!globalUsers) return;

    const cfg = configFull.chatUserInfo; const countryFilterEnabled = configFull.countryFilter?.enabled === true;
    const activeGameId = getActiveGameId(FCADE, cw);
    const searchTerm = window.CerberusState.sidebarSearchTerm || '';

    const masterVisuals = cfg.masterEnabled !== false;
    const rankingsEnabled = ConfigManager.getSetting('rankings.masterEnabled') !== false;

    if (masterVisuals && cfg?.replacePingBarWithText) document.body.classList.add('cerb-hide-sidebar-ping'); else document.body.classList.remove('cerb-hide-sidebar-ping');

    sidebarElement.querySelectorAll('.usersIgnoredTitle').forEach(titleEl => titleEl.childNodes.forEach(node => { if (node.nodeType === Node.TEXT_NODE && node.nodeValue.includes('Ignored')) node.nodeValue = node.nodeValue.replace('Ignored', 'Blocked'); }));

    sidebarElement.querySelectorAll('.userItem').forEach(item => {
        try {
            const playerNameEl = item.querySelector('.playerName'); if (!playerNameEl) return;
            const userKey = normalizeUsername(playerNameEl.textContent); if (!userKey) return;

            applyDevBadge(playerNameEl, userKey);

            const itemIdentity = userKey + '-' + (activeGameId || 'global');

            if (item.dataset.cerbIdentity !== itemIdentity) {
                item.removeAttribute('data-cerberus-processed'); 
                item.removeAttribute('data-cerb-search-hidden'); 
                item.removeAttribute('data-country-blocked');
                item.style.display = ''; 
                item.querySelectorAll('.cerberus-ping-text, .cerb-rank-badge').forEach(el => el.remove()); 
                item.dataset.cerbIdentity = itemIdentity;
            }
            item.dataset.currentUser = userKey;
            let matchesSearch = searchTerm === '' || userKey.toLowerCase().includes(searchTerm);

            if (rankingsEnabled && cfg.showNumericRanks && activeGameId) {
                const numericRank = RankCache.getRank(activeGameId, userKey); let badge = item.querySelector('.cerb-rank-badge');
                if (numericRank !== null) {
                    if (!badge) {
                        badge = createRankBadge(numericRank); const rankEl = item.querySelector('.rankWrapper, .rank');
                        if (rankEl && rankEl.parentNode) rankEl.parentNode.insertBefore(badge, rankEl);
                        else { const pingWrapper = item.querySelector('.pingWrapper'); if (pingWrapper && pingWrapper.parentNode) pingWrapper.parentNode.insertBefore(badge, pingWrapper); }
                    } else badge.textContent = `🏅${numericRank}`;
                } else if (badge) badge.remove();
            } else { const badge = item.querySelector('.cerb-rank-badge'); if (badge) badge.remove(); }

            if (cfg?.enableReputation) { 
                applyReputationStyleList(playerNameEl, item, userKey); 
                item.dataset.currentUser = userKey;
                addReputationControlsToElement(item, 'list'); 
            }

            if (masterVisuals && cfg?.replacePingBarWithText) {
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
            } else { 
                const pingWrapper = item.querySelector('.pingWrapper'); 
                if (pingWrapper) { const txt = pingWrapper.querySelector('.cerberus-ping-text'); if (txt) txt.remove(); } 
            }

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
            let shouldHideMatch = countryFilterEnabled; let matchesSearch = false; 
            
            let identity = 'match-' + (activeGameId || 'global') + '-'; 
            
            const players = match.querySelectorAll('.playerInfo');
            players.forEach(playerInfo => {
                const playerNameEl = playerInfo.querySelector('.playerName'); if (!playerNameEl) return;
                const userKey = normalizeUsername(playerNameEl.textContent); if (!userKey) return;
                
                applyDevBadge(playerNameEl, userKey);
                
                identity += userKey + '-'; playerInfo.dataset.currentUser = userKey;
                if (searchTerm === '' || userKey.toLowerCase().includes(searchTerm)) matchesSearch = true;
                if (cfg?.enableReputation) { 
                    applyReputationStyleMatch(playerNameEl, userKey); 
                    playerInfo.dataset.currentUser = userKey;
                    addReputationControlsToElement(playerInfo, 'match'); 
                }
                if (countryFilterEnabled && shouldHideMatch && !isSystemUser(userKey)) {
                    let userCountry = globalUsers[userKey]?.country?.iso_code?.toUpperCase();
                    if (!userCountry) { const flagEl = playerInfo.querySelector('.playerFlag'); if (flagEl && flagEl.title) userCountry = COUNTRY_NAME_TO_CODE[flagEl.title]; }
                    if (CerberusData.isCountryAllowed(userCountry) || CerberusData.isPositive(userKey)) shouldHideMatch = false;
                }
            });

            if (match.dataset.cerbIdentity !== identity) { 
                match.removeAttribute('data-cerberus-processed'); 
                match.removeAttribute('data-country-blocked'); 
                match.style.display = ''; 
                match.dataset.cerbIdentity = identity; 
            }
            
            if ((searchTerm !== '' && !matchesSearch) || (countryFilterEnabled && shouldHideMatch && players.length > 0)) { match.style.display = 'none'; match.dataset.countryBlocked = "true"; }
            else { match.style.display = ''; match.dataset.countryBlocked = "false"; }
            match.dataset.cerberusProcessed = "true";
        } catch (e) { }
    });
};

function reprocessUserMessages(userKey, hideNegative) {
    const { normalizeUsername, getActiveChannelWrapper } = require('./utils.js');
    const { applyReputationStyleChat, applyReputationStyleList, applyReputationStyleMatch } = require('./ui.js');
    const { ConfigManager } = require('./config.js');

    const menu = document.getElementById('cerbGlobalMenu'); if (menu) menu.classList.remove('visible');
    document.querySelectorAll('.messageWrapper').forEach(wrapper => {
        if (wrapper.dataset.cerberusUser === userKey) {
            const msg = wrapper.querySelector('.message.chat'); if (msg) { const author = msg.querySelector('span.author'); if (author) applyReputationStyleChat(author, msg, userKey, hideNegative); }
            wrapper.style.display = ''; wrapper.removeAttribute('data-cerberus-hidden'); wrapper.removeAttribute('data-cerberus-processed');
            wrapper.removeAttribute('data-cerb-identity'); 
        }
    });
    document.querySelectorAll('.userItem').forEach(item => {
        const name = item.querySelector('.playerName');
        if (name && normalizeUsername(name.textContent) === userKey) { applyReputationStyleList(name, item, userKey); item.style.display = ''; item.removeAttribute('data-country-blocked'); item.removeAttribute('data-cerberus-processed'); item.removeAttribute('data-cerb-identity'); }
    });
    document.querySelectorAll('.matchesList .matchItem').forEach(match => {
        let hasUser = false;
        match.querySelectorAll('.playerName').forEach(name => { if (normalizeUsername(name.textContent) === userKey) { applyReputationStyleMatch(name, userKey); hasUser = true; } });
        if (hasUser) { match.style.display = ''; match.removeAttribute('data-country-blocked'); match.removeAttribute('data-cerberus-processed'); match.removeAttribute('data-cerb-identity'); }
    });
    if (ConfigManager.getRuntimeConfig() && window.CerberusFCADE) { const cw = getActiveChannelWrapper(); if (cw) { fullChatScanScoped(cw, window.CerberusFCADE, ConfigManager.getRuntimeConfig()); updateSidebarScope(cw.querySelector('.usersListWrapper'), window.CerberusFCADE, ConfigManager.getRuntimeConfig()); } }
}

module.exports = { updateFilterShield, unfilterAllMessages, unfilterAllUsers, invalidateCountryFilterCache, attachMultiObservers, processCollectedWrappers, fullChatScanScoped, checkAndProcessWrapper, updateSidebarScope, reprocessUserMessages };