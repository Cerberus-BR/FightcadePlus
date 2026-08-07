// cerberus/chat.js

// [CERBERUS] Performance: Lazy-cached module references
// Circular deps resolved once on first use, eliminating thousands of require() lookups per cycle
let _d = null;
function _deps() {
    if (_d) return _d;
    return (_d = {
        ...require('./state.js'),
        ...require('./api.js'),
        ...require('./config.js'),
        ...require('./constants.js'),
        ...require('./utils.js'),
        ...require('./ui.js')
    });
}

function updateFilterShield() {
    const { ConfigManager } = _deps();
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
    const { getActiveChannelWrapper, ConfigManager } = _deps();

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
    const { getActiveGameId } = _deps();
    if (!wrappersArray || wrappersArray.length === 0) return;

    const cw = wrappersArray[0].closest('.channelWrapper');
    // [CERBERUS] Visibility Lock Removed: Process tabs in background (Audio leak fix)

    const activeGameId = getActiveGameId(FCADE, cw);
    const globalUsers = FCADE.globalUsers || {};

    // [CERBERUS] Multi-Room Fix: Resolve channelId from wrapper context, not global activeChannelId
    let resolvedChannelId = FCADE.activeChannelId;
    if (cw) {
        for (const refKey of Object.keys(FCADE.$refs || {})) {
            const refArr = FCADE.$refs[refKey];
            if (refArr?.[0]?.$el && (refArr[0].$el === cw || refArr[0].$el.contains(cw) || cw.contains(refArr[0].$el))) {
                resolvedChannelId = refKey;
                break;
            }
        }
    }
    const usersList = FCADE.$refs[resolvedChannelId]?.[0]?.$refs?.usersList?.$children;

    const activeUsersMap = new Map();
    if (usersList && usersList.length > 0) {
        for (let i = 0; i < usersList.length; i++) {
            const child = usersList[i];
            if (child && child.user && child.user.id) activeUsersMap.set(child.user.id, child);
        }
    }

    // [CERBERUS] Auto-Scroll Fix: Capture scroll-to-bottom status before DOM modification (using correct selector .chatContent)
    const container = cw ? cw.querySelector('.chatContent') : null;
    const wasAtBottom = container ? (container.scrollHeight - (container.scrollTop + container.clientHeight) < 150) : false;

    wrappersArray.forEach(wrapper => {
        checkAndProcessWrapper(wrapper, FCADE, configFull.chatUserInfo, configFull.countryFilter, configFull.liveQueue, globalUsers, activeGameId, activeUsersMap);
    });

    // [CERBERUS] Auto-Scroll Fix: Snap back to bottom to resolve height offsets immediately and after layout pass
    if (wasAtBottom && container) {
        container.scrollTop = container.scrollHeight;
        setTimeout(() => {
            if (container) container.scrollTop = container.scrollHeight;
        }, 50);
    }
}

function fullChatScanScoped(channelWrapper, FCADE, configFull) {
    if (!channelWrapper) return;
    const wrappersArray = Array.from(channelWrapper.querySelectorAll('.messageWrapper'));
    processCollectedWrappers(wrappersArray, FCADE, configFull);
}

function checkAndProcessWrapper(wrapper, FCADE, cfg, filterCfg, queueCfg, globalUsers, activeGameId, activeUsersMap) {
    const { CerberusData, RankCache, normalizeUsername, isSystemUser, getMinPing, extractMinPing, playPopSound, silenceRecentAudios, createStatusElement, createFlagElement, createRankElement, createPingElement, createPingTextElement, createRankBadge, applyReputationStyleChat, addReputationControlsToElement, createChatTriggerElement, applyDevBadge, ConfigManager, executeChatMacro, t } = _deps();

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
        if (wrapper.dataset.cerbRejected === "true" && !chalName && isImmuneSystem) {
            // [CERBERUS] State Preservation: Vue.js recycled a blocked invitation to plain text. Keep hidden.
            wrapper.style.display = 'none';
            wrapper.dataset.cerbIdentity = identity;
            wrapper.dataset.cerberusProcessed = "true";
        } else {
            // New message or legitimate challenge. Clear the block status.
            wrapper.removeAttribute('data-cerb-rejected');
            wrapper.removeAttribute('data-cerberus-processed'); 
            wrapper.removeAttribute('data-cerberus-hidden'); 
            wrapper.style.display = '';
            wrapper.querySelectorAll('.cerberus-injected-status, .cerberus-injected-flag, .cerberus-injected-rank, .cerberus-injected-pingbar, .cerberus-injected-pingtext, .cerb-rank-badge, .cerb-chat-trigger').forEach(el => el.remove());
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

                    // [CERBERUS] Decoupling: shouldFilter = hide+silence (always), shouldReject = click decline (only with toggle)
                    let shouldFilter = false;
                    let shouldReject = false;

                    if (isNeg) {
                        shouldFilter = true;
                        if (cfg?.autoRejectNegative) shouldReject = true;
                    }

                    if (isCountryBlocked) {
                        shouldFilter = true;
                        if (filterCfg?.autoReject) shouldReject = true;
                    }

                    const minRank = ConfigManager.getSetting('rankings.minRankToAccept') || 0;
                    if (minRank > 0 && !CerberusData.isPositive(chalUserKey)) {
                        const rankImg = wrapper.querySelector('.challengeContent .userInfo .rank img');
                        let userRankNum = 0; 
                        
                        if (rankImg) {
                            const match = rankImg.src.match(/rank(\d+)\.png/);
                            if (match) userRankNum = parseInt(match[1], 10);
                        }
                        
                        if (userRankNum < minRank) {
                            shouldFilter = true;
                            if (ConfigManager.getSetting('rankings.autoRejectBelowMin')) shouldReject = true;
                        }
                    }

                    const pingCfg = ConfigManager.getSetting('pingFilter');
                    if (pingCfg?.enabled && !CerberusData.isPositive(chalUserKey)) {
                        const maxPingMs = pingCfg.maxPingMs || 150;
                        const pingImg = wrapper.querySelector('.challengeContent .pingWrapper img, .ping img');
                        const pingTitle = pingImg ? (pingImg.title || pingImg.getAttribute('title') || '') : (wrapper.querySelector('.pingWrapper')?.title || '');
                        const userFound = activeUsersMap ? activeUsersMap.get(chalUserKey) : null;
                        const minPing = extractMinPing(pingTitle) || getMinPing(userFound);

                        if (minPing !== null && minPing > maxPingMs) {
                            shouldFilter = true;
                            if (pingCfg.autoReject !== false) shouldReject = true;
                        }
                    }

                    if (shouldFilter) {
                        // [CERBERUS] Base Filtering: Hides and silences filtered challenges unconditionally
                        wrapper.dataset.cerbRejected = "true";
                        wrapper.style.display = 'none'; 
                        silenceRecentAudios();

                        // [CERBERUS] Auto-Reject: Clicks decline only if the corresponding toggle is enabled
                        if (shouldReject) {
                            const declineBtn = wrapper.querySelector('.decline-challenge, .decline') || Array.from(wrapper.querySelectorAll('.button-generic, button, div')).find(b => /decline|recusar|reject|cancel/i.test(b.textContent));
                            if (declineBtn) {
                                declineBtn.click();
                            }

                            // [CERBERUS] Auto-Reject Notify: Sends a generic notice in the chat with a 5s cooldown
                            if (ConfigManager.getSetting('countryFilter.autoRejectNotify')) {
                                const now = Date.now();
                                if (!window.CerberusState.lastAutoRejectNotifyTime || (now - window.CerberusState.lastAutoRejectNotifyTime >= 5000)) {
                                    window.CerberusState.lastAutoRejectNotifyTime = now;
                                    setTimeout(() => executeChatMacro([t('autoReject.notifyMsg')]), 500);
                                }
                            }
                        }

                        return; // End DOM processing for this node
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
                                    // [CERBERUS] Attach channelId to prevent cross-channel spam
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
                            if (!wrapper.querySelector('.cerb-chat-trigger')) {
                                const chatTrigger = createChatTriggerElement(userKey);
                                const avatarEl = wrapper.querySelector('.avatar, .avatarWrapper, .userAvatar');
                                if (avatarEl && avatarEl.nextSibling) {
                                    avatarEl.parentNode.insertBefore(chatTrigger, avatarEl.nextSibling);
                                } else if (elements.status) {
                                    author.parentElement.insertBefore(chatTrigger, elements.status);
                                } else {
                                    author.parentElement.insertBefore(chatTrigger, author);
                                }
                            }
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
    const { CerberusData, RankCache, normalizeUsername, isSystemUser, extractMinPing, getActiveGameId, createRankBadge, applyReputationStyleList, applyReputationStyleMatch, addReputationControlsToElement, applyDevBadge, ConfigManager, COUNTRY_NAME_TO_CODE } = _deps();

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
                if (item.dataset.currentUser !== userKey) {
                item.dataset.currentUser = userKey;
                delete item.dataset.cerbRepState;
            }
            applyReputationStyleList(playerNameEl, item, userKey); 
            addReputationControlsToElement(item, 'list'); 
            }

            if (masterVisuals && cfg?.replacePingBarWithText) {
                const pingWrapper = item.querySelector('.pingWrapper');
                if (pingWrapper) {
                    const img = pingWrapper.querySelector('img.ping'); const minPing = extractMinPing(img ? img.title : pingWrapper.title);
                    if (minPing !== null) {
                        let color = minPing < 60 ? '#00ff00' : (minPing > 90 ? '#ff4444' : '#aaa');
                        let txt = pingWrapper.querySelector('.cerberus-ping-text');
                        const newText = `${minPing}ms`;
                        if (!txt) { txt = document.createElement('span'); txt.className = 'cerberus-ping-text'; Object.assign(txt.style, { fontSize: '11px', fontWeight: 'bold', marginLeft: 'auto', verticalAlign: 'middle' }); pingWrapper.appendChild(txt); }
                        // [CERBERUS] CPU Guard: Only updates DOM if the value has changed
                        if (txt.innerText !== newText) txt.innerText = newText;
                        if (txt.style.color !== color) txt.style.color = color;
                    }
                }
            } else { 
                const pingWrapper = item.querySelector('.pingWrapper'); 
                if (pingWrapper) { const txt = pingWrapper.querySelector('.cerberus-ping-text'); if (txt) txt.remove(); } 
            }

            let userCountry = globalUsers[userKey]?.country?.iso_code?.toUpperCase();
            if (!userCountry) { const flagEl = item.querySelector('.flagWrapper'); if (flagEl && flagEl.title) userCountry = COUNTRY_NAME_TO_CODE[flagEl.title]; }

            let isBlockedByCountry = countryFilterEnabled && !CerberusData.isCountryAllowed(userCountry) && !CerberusData.isPositive(userKey);

            // [CERBERUS] CPU Guard: Only updates display if target style differs from current
            const targetDisplay = (!matchesSearch || isBlockedByCountry) ? 'none' : '';
            if (item.style.display !== targetDisplay) item.style.display = targetDisplay;
            item.dataset.cerbSearchHidden = !matchesSearch ? "true" : "false"; item.dataset.countryBlocked = isBlockedByCountry ? "true" : "false";
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
                const userKey = normalizeUsername(playerNameEl.textContent);
                
                if (playerInfo.dataset.currentUser !== userKey) {
                    playerInfo.dataset.currentUser = userKey;
                    delete playerNameEl.dataset.cerbRepState;
                }

                // Always apply reputation style & controls so recycled <offline> elements clear highlight & buttons
                if (cfg?.enableReputation) { 
                    applyReputationStyleMatch(playerNameEl, userKey); 
                    addReputationControlsToElement(playerInfo, 'match'); 
                }

                if (!userKey || isSystemUser(userKey)) return;

                applyDevBadge(playerNameEl, userKey);
                identity += userKey + '-';
                if (searchTerm === '' || userKey.toLowerCase().includes(searchTerm)) matchesSearch = true;
                if (countryFilterEnabled && shouldHideMatch) {
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
            
            // [CERBERUS] CPU Guard: Only updates display if target style differs from current
            const shouldHide = (searchTerm !== '' && !matchesSearch) || (countryFilterEnabled && shouldHideMatch && players.length > 0);
            const targetDisplay = shouldHide ? 'none' : '';
            if (match.style.display !== targetDisplay) match.style.display = targetDisplay;
            match.dataset.countryBlocked = shouldHide ? "true" : "false";
            match.dataset.cerberusProcessed = "true";
        } catch (e) { }
    });
};

function reprocessUserMessages(userKey, hideNegative) {
    const { normalizeUsername, getActiveChannelWrapper, applyReputationStyleChat, applyReputationStyleList, applyReputationStyleMatch, ConfigManager } = _deps();

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

function setupChatMessageInterceptor(FCADE) {
    if (!FCADE || !FCADE.genericCallbacks) return;

    const originalOnChatMessage = FCADE.genericCallbacks.onChatMessage;

    FCADE.genericCallbacks.onChatMessage = function(channelname, username, chat) {
        try {
            const { ConfigManager, CerberusData, normalizeUsername, playPopSound } = _deps();
            const config = ConfigManager.getRuntimeConfig();
            const queueCfg = config?.liveQueue;

            if (queueCfg?.enabled && queueCfg.keyword && window.CerberusState.liveMasterOn && chat) {
                const userKey = normalizeUsername(username);
                const streamerNick = queueCfg.streamerNick || '';
                const msgText = chat.trim().toLowerCase();

                if (msgText === queueCfg.keyword.toLowerCase() && userKey.toLowerCase() !== streamerNick.toLowerCase()) {
                    if (CerberusData.addQueue(userKey)) {
                        playPopSound();
                        if (!window.CerberusState.replyQueue) window.CerberusState.replyQueue = [];
                        window.CerberusState.replyQueue.push({ name: userKey, channelId: channelname || FCADE.activeChannelId });
                    }
                }
            }
        } catch (e) {
            console.error('[Cerberus] Error in chat message interceptor:', e);
        }

        if (originalOnChatMessage) {
            originalOnChatMessage.apply(this, arguments);
        }
    };
}

module.exports = { updateFilterShield, unfilterAllMessages, unfilterAllUsers, invalidateCountryFilterCache, attachMultiObservers, processCollectedWrappers, fullChatScanScoped, checkAndProcessWrapper, updateSidebarScope, reprocessUserMessages, setupChatMessageInterceptor };