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
        ...require('./ui.js'),
        ...require('./elo.js')
    });
}

function updateFilterShield() {
    const { ConfigManager } = _deps();
    const isCountryActive = ConfigManager.getSetting('countryFilter.enabled') === true;
    const isPingActive = ConfigManager.getSetting('pingFilter.enabled') === true && ConfigManager.getSetting('pingFilter.hideHighPing') === true;
    const isHideNegActive = ConfigManager.getSetting('chatUserInfo.hideNegativeMessages') === true;
    const isSearchActive = (window.CerberusState.sidebarSearchTerm || '') !== '';
    if (isCountryActive || isPingActive || isHideNegActive || isSearchActive) document.body.classList.add('cerb-filters-active');
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

function attachSidebarTooltip(sidebar, FCADE) {
    if (!sidebar || sidebar.dataset.cerbTooltipDelegated) return;
    sidebar.dataset.cerbTooltipDelegated = "true";

    const onHoverBadge = (e) => {
        const target = e.target.closest('.cerb-rank-badge, .rankWrapper, .rank');
        if (!target) return;
        const item = target.closest('.userItem');
        if (!item) return;

        const { ConfigManager, getActiveGameId, RANK_IMG_MAP, getPlayerEloInfo, getLocalUserInfo, getRecommendation, getNextRankRequirement, t, RankCache, normalizeUsername } = _deps();
        const config = ConfigManager.getRuntimeConfig();
        const rankingsEnabled = (config?.rankings?.masterEnabled !== false) && (ConfigManager.getSetting('rankings.masterEnabled') !== false);
        const eloEnabled = rankingsEnabled && (config?.rankings?.enableElo === true || ConfigManager.getSetting('rankings.enableElo') === true);

        if (!eloEnabled) {
            if (target.hasAttribute('title')) target.removeAttribute('title');
            const wrapper = target.closest('.rankWrapper');
            if (wrapper && wrapper.hasAttribute('title')) wrapper.removeAttribute('title');
            return;
        }

        const playerNameEl = item.querySelector('.playerName');
        const userKey = normalizeUsername(playerNameEl?.textContent || item.dataset.currentUser);
        if (!userKey) return;

        const cw = item.closest('.channelWrapper');
        const activeGameId = getActiveGameId(FCADE, cw);
        if (!activeGameId) return;

        const rankImg = item.querySelector('.rankWrapper img, .rank img');
        let oppLetter = null;
        let isExplicitlyUnranked = false;

        if (rankImg) {
            const m = (rankImg.src || rankImg.getAttribute('src') || '').match(/rank(\d+)\.png/);
            if (m) {
                if (m[1] === '0') {
                    isExplicitlyUnranked = true;
                } else if (RANK_IMG_MAP[`rank${m[1]}`]) {
                    oppLetter = RANK_IMG_MAP[`rank${m[1]}`];
                }
            }
        }

        // Live check in FCADE.globalUsers
        if (!oppLetter && !isExplicitlyUnranked && FCADE?.globalUsers) {
            const u = FCADE.globalUsers[userKey.toLowerCase()] || FCADE.globalUsers[userKey];
            if (u?.channelRank && typeof u.channelRank === 'object' && activeGameId in u.channelRank) {
                const r = u.channelRank[activeGameId];
                if (r === 0 || r === '0') {
                    isExplicitlyUnranked = true;
                } else if (r >= 1 && r <= 6) {
                    oppLetter = RANK_IMG_MAP[`rank${r}`] || null;
                }
            }
        }

        // Fallback to RankCache ONLY if not explicitly unranked
        if (!oppLetter && !isExplicitlyUnranked && RankCache?.getPlayerRankLetter) {
            oppLetter = RankCache.getPlayerRankLetter(activeGameId, userKey) || null;
        }

        if (!oppLetter || isExplicitlyUnranked) {
            const unrankedText = t ? (t('elo.unrankedHover') || '❓ Rank Indefinido (Sem dados de rank)') : '❓ Rank Indefinido (Sem dados de rank)';
            if (target.title !== unrankedText) target.title = unrankedText;
            const wrapper = target.closest('.rankWrapper');
            if (wrapper && wrapper.title !== unrankedText) wrapper.title = unrankedText;
            const innerImg = wrapper ? wrapper.querySelector('img') : null;
            if (innerImg && innerImg.title !== unrankedText) innerImg.title = unrankedText;
            return;
        }

        const oppInfo = getPlayerEloInfo(userKey, oppLetter, activeGameId, RankCache);
        const oppElo = oppInfo.elo;
        const rankDetails = oppInfo.source === 'partial'
            ? `~${oppElo} Elo · ${t ? t('elo.rangeLabel', { min: oppInfo.minElo, max: oppInfo.maxElo }) : `faixa: ${oppInfo.minElo}–${oppInfo.maxElo}`}`
            : (oppInfo.source === 'reported' ? `${oppElo} Elo` : `~${oppElo} Elo`);

        const localUser = getLocalUserInfo(FCADE, activeGameId, RankCache);
        const isSelf = Boolean(userKey && localUser?.username && userKey.toLowerCase() === localUser.username.toLowerCase());

        if (isSelf && (localUser.isUnranked || !localUser.rankLetter)) {
            const unrankedText = t ? (t('elo.unrankedHover') || '❓ Rank Indefinido (Sem dados de rank)') : '❓ Rank Indefinido (Sem dados de rank)';
            if (target.title !== unrankedText) target.title = unrankedText;
            const wrapper = target.closest('.rankWrapper');
            if (wrapper && wrapper.title !== unrankedText) wrapper.title = unrankedText;
            const innerImg = wrapper ? wrapper.querySelector('img') : null;
            if (innerImg && innerImg.title !== unrankedText) innerImg.title = unrankedText;
            return;
        }

        let tooltipText = '';
        if (isSelf) {
            const selfHeader = t ? t('elo.selfProfileHeader') : '(Your profile / current Elo)';
            const nextReq = getNextRankRequirement ? getNextRankRequirement(oppLetter, oppElo, activeGameId, RankCache) : null;
            let nextRankText = '';
            if (nextReq) {
                if (nextReq.isMaxRank) {
                    nextRankText = `\n${t ? t('elo.maxRankReached') : '👑 Max Rank reached (Rank S)'}`;
                } else if (nextReq.isSynced) {
                    nextRankText = `\n${t ? t('elo.nextRankTarget', { pts: nextReq.ptsNeeded, nextRank: nextReq.nextRank }) : `📈 ~${nextReq.ptsNeeded} pts to Rank ${nextReq.nextRank}`}`;
                }
            }
            tooltipText = `🏅 Rank ${oppLetter} (${rankDetails})\n${selfHeader}${nextRankText}`;
        } else if (localUser && !localUser.isUnranked && localUser.elo) {
            const hoverFt = parseInt(ConfigManager?.getSetting?.('rankings.defaultFt'), 10) || 5;
            const rec = getRecommendation(localUser.elo, oppElo, hoverFt, t);
            tooltipText = `🏅 Rank ${oppLetter} (${rankDetails})\n${rec.diffText}\n${rec.text}`;
        } else {
            tooltipText = `🏅 Rank ${oppLetter} (${rankDetails})`;
        }

        if (target.title !== tooltipText) target.title = tooltipText;
        const wrapper = target.closest('.rankWrapper');
        if (wrapper && wrapper.title !== tooltipText) wrapper.title = tooltipText;
        const innerImg = wrapper ? wrapper.querySelector('img') : null;
        if (innerImg && innerImg.title !== tooltipText) innerImg.title = tooltipText;
    };

    sidebar.addEventListener('mouseover', onHoverBadge);
    sidebar.addEventListener('focusin', onHoverBadge);
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

        attachSidebarTooltip(sidebar, FCADE);

        const observer = new MutationObserver((mutations) => {
            let relevantChange = false;
            for (const mut of mutations) {
                if (mut.target.classList?.contains('cerb-rank-badge') || 
                    mut.target.classList?.contains('cerb-dev-badge') ||
                    mut.target.closest?.('.cerb-rank-badge')) {
                    continue;
                }
                let hasRelevantNodes = false;
                for (const n of mut.addedNodes) {
                    if (n.nodeType === 1 && !n.classList?.contains('cerb-rank-badge') && !n.classList?.contains('cerb-dev-badge')) {
                        hasRelevantNodes = true;
                        break;
                    }
                }
                for (const n of mut.removedNodes) {
                    if (n.nodeType === 1 && !n.classList?.contains('cerb-rank-badge') && !n.classList?.contains('cerb-dev-badge')) {
                        hasRelevantNodes = true;
                        break;
                    }
                }
                if (hasRelevantNodes) {
                    relevantChange = true;
                    break;
                }
            }
            if (!relevantChange) return;

            clearTimeout(sidebarTimeout);
            sidebarTimeout = setTimeout(() => {
                if (document.hidden) return; // [CERBERUS] Skip sidebar re-scan while window is hidden
                updateSidebarScope(sidebar, FCADE, configFull);
            }, 600);
        });
        observer.observe(sidebar, { childList: true, subtree: true });
    });
}

if (typeof document !== 'undefined' && typeof window !== 'undefined' && !window.cerbVisibilityHooked) {
    window.cerbVisibilityHooked = true;
    document.addEventListener('visibilitychange', () => {
        if (!document.hidden && window.CerberusFCADE) {
            const { ConfigManager, getActiveChannelWrapper } = _deps();
            const runtimeConfig = ConfigManager?.getRuntimeConfig?.();
            if (runtimeConfig) {
                const cw = getActiveChannelWrapper();
                if (cw) {
                    fullChatScanScoped(cw, window.CerberusFCADE, runtimeConfig);
                    const sidebar = cw.querySelector('.usersListWrapper');
                    if (sidebar) updateSidebarScope(sidebar, window.CerberusFCADE, runtimeConfig);
                }
            }
        }
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

    let activeUsersMap = null;
    const now = Date.now();
    if (cw && cw._cerbActiveUsersMap && (now - (cw._cerbActiveUsersTime || 0) < 2000)) {
        activeUsersMap = cw._cerbActiveUsersMap;
    } else {
        activeUsersMap = new Map();
        if (usersList && usersList.length > 0) {
            for (let i = 0; i < usersList.length; i++) {
                const child = usersList[i];
                if (child && child.user && child.user.id) activeUsersMap.set(child.user.id, child);
            }
        }
        if (cw) {
            cw._cerbActiveUsersMap = activeUsersMap;
            cw._cerbActiveUsersTime = now;
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

function setupMotdControls(wrapper, activeGameId) {
    const { CerberusData, t } = _deps();
    const gameKey = activeGameId || 'global';

    let dismissBtn = wrapper.querySelector('.cerb-motd-dismiss-btn');
    let collapsedBar = wrapper.querySelector('.cerb-motd-collapsed-bar');

    if (!dismissBtn) {
        dismissBtn = document.createElement('button');
        dismissBtn.type = 'button';
        dismissBtn.className = 'cerb-motd-dismiss-btn';
        dismissBtn.textContent = t('motd.hideMotd');
        dismissBtn.title = t('motd.hideMotd');
        dismissBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            CerberusData.dismissMotd(gameKey);
            wrapper.classList.add('cerb-motd-dismissed');
        });
        wrapper.appendChild(dismissBtn);
    }

    if (!collapsedBar) {
        collapsedBar = document.createElement('div');
        collapsedBar.className = 'cerb-motd-collapsed-bar';
        collapsedBar.innerHTML = `
            <span class="cerb-motd-collapsed-title">${t('motd.motdCollapsed')}</span>
            <button type="button" class="cerb-motd-expand-btn">${t('motd.showMotd')}</button>
        `;
        collapsedBar.querySelector('.cerb-motd-expand-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            CerberusData.restoreMotd(gameKey);
            wrapper.classList.remove('cerb-motd-dismissed');
        });
        wrapper.appendChild(collapsedBar);
    }

    const isCurrentlyDismissed = CerberusData.isMotdDismissed(gameKey);
    wrapper.classList.toggle('cerb-motd-dismissed', isCurrentlyDismissed);
}

function getCleanAuthorText(authorEl) {
    if (!authorEl) return '';
    for (let i = 0; i < authorEl.childNodes.length; i++) {
        const node = authorEl.childNodes[i];
        if (node.nodeType === 3) {
            const text = node.textContent.trim();
            if (text) return text;
        }
    }
    const clone = authorEl.cloneNode(true);
    clone.querySelectorAll('.cerberus-injected-status, .cerberus-injected-flag, .cerberus-injected-rank, .cerberus-injected-pingbar, .cerberus-injected-pingtext, .cerb-rank-badge, .cerb-chat-trigger, .cerb-dev-badge').forEach(el => el.remove());
    return clone.textContent.trim();
}

function checkAndProcessWrapper(wrapper, FCADE, cfg, filterCfg, queueCfg, globalUsers, activeGameId, activeUsersMap) {
    const { CerberusData, RankCache, normalizeUsername, isSystemUser, getLocalUsername, getMinPing, extractMinPing, playPopSound, silenceRecentAudios, createStatusElement, createFlagElement, createRankElement, createPingElement, createPingTextElement, createRankBadge, getRankBadgeText, applyReputationStyleChat, addReputationControlsToElement, createChatTriggerElement, applyDevBadge, ConfigManager, executeChatMacro, t } = _deps();

    const isChalReq = wrapper.classList.contains('challengeRequested') || wrapper.querySelector('.challengeRequested, .challengeContent') !== null;
    const isChalSent = wrapper.classList.contains('requestChallenge') || wrapper.querySelector('.requestChallenge, .challengeContainer') !== null;
    const isEndgame = wrapper.classList.contains('endgame') || wrapper.querySelector('.endgameMessageWrapper') !== null;
    const isMotd = wrapper.classList.contains('motd') || wrapper.querySelector('.motd') !== null;
    const isImmuneSystem = isEndgame || isChalReq || isChalSent || isMotd;
    
    let identity = wrapper.className + '-' + (activeGameId || 'global'); 
    
    const authorEl = wrapper.querySelector('span.author');
    if (authorEl) {
        const cleanAuthor = getCleanAuthorText(authorEl);
        identity += '-' + cleanAuthor;
        const timeEl = wrapper.querySelector('.time');
        if (timeEl) identity += '-' + timeEl.textContent.trim();
    } else { 
        const chalName = wrapper.querySelector('.challengeContent .name, .userInfo .name, .playerName, .name'); 
        if (chalName) identity += '-chal-' + chalName.textContent.trim(); 
        else identity += '-' + (wrapper.textContent.replace(/\s+/g, ' ').substring(0, 80).trim()); 
    }

    if (wrapper.dataset.cerbIdentity !== identity) {
        const chalName = wrapper.querySelector('.challengeContent .name, .userInfo .name, .playerName, .name');
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
            wrapper.removeAttribute('data-cerberus-user');
            wrapper.removeAttribute('data-current-user');
            wrapper.classList.remove('cerb-motd-dismissed');
            wrapper.style.display = '';
            wrapper.querySelectorAll('.cerberus-injected-status, .cerberus-injected-flag, .cerberus-injected-rank, .cerberus-injected-pingbar, .cerberus-injected-pingtext, .cerb-rank-badge, .cerb-chat-trigger, .cerb-challenge-elo-hint, .cerb-endgame-elo-box, .cerb-motd-dismiss-btn, .cerb-motd-collapsed-bar').forEach(el => el.remove());
            wrapper.dataset.cerbIdentity = identity;
        }
    }

    if (isMotd) {
        setupMotdControls(wrapper, activeGameId);
        const { updateMotdNotices } = _deps();
        if (typeof updateMotdNotices === 'function') {
            const cw = wrapper.closest('.channelWrapper');
            if (cw) updateMotdNotices(cw, activeGameId);
        }
    }

    if (!wrapper.dataset.cerberusProcessed) {
        if (isImmuneSystem) { 
            wrapper.dataset.cerberusHidden = "false"; 
            wrapper.style.display = ''; 

            if (isChalReq && !wrapper.dataset.cerbRejected) {
                const chalNameEl = wrapper.querySelector('.challengeContent .name, .userInfo .name, .playerName, .name');
                if (chalNameEl) {
                    const chalUserKey = normalizeUsername(chalNameEl.textContent);
                    const isNeg = CerberusData.isNegative(chalUserKey);
                    const userCountry = globalUsers[chalUserKey]?.country?.iso_code?.toUpperCase();
                    const isCountryBlocked = filterCfg?.enabled && !CerberusData.isCountryAllowed(userCountry) && !CerberusData.isPositive(chalUserKey);

                    // [CERBERUS] Decoupling: shouldFilter = hide+silence (always), shouldReject = click decline (only with toggle)
                    let shouldFilter = false;
                    let shouldReject = false;
                    let rejectReason = '';

                    if (isNeg) {
                        shouldFilter = true;
                        if (cfg?.autoRejectNegative) {
                            shouldReject = true;
                            rejectReason = 'reputation';
                        }
                    }

                    if (isCountryBlocked) {
                        shouldFilter = true;
                        if (filterCfg?.autoReject) {
                            shouldReject = true;
                            if (!rejectReason) rejectReason = 'country';
                        }
                    }

                    const minRank = ConfigManager.getSetting('rankings.minRankToAccept') || 0;
                    if (minRank > 0 && !CerberusData.isPositive(chalUserKey)) {
                        const rankImg = wrapper.querySelector('.challengeContent .userInfo .rank img, .userInfo .rank img, .rank img');
                        let userRankNum = 0; 
                        
                        if (rankImg) {
                            const match = (rankImg.src || rankImg.getAttribute('src') || '').match(/rank(\d+)\.png/);
                            if (match) userRankNum = parseInt(match[1], 10);
                        }
                        
                        if (userRankNum < minRank) {
                            shouldFilter = true;
                            if (ConfigManager.getSetting('rankings.autoRejectBelowMin')) {
                                shouldReject = true;
                                if (!rejectReason) rejectReason = 'rank';
                            }
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
                            if (pingCfg.autoReject !== false) {
                                shouldReject = true;
                                if (!rejectReason) rejectReason = 'ping';
                            }
                        }
                    }

                    const ftCfg = ConfigManager.getSetting('ftFilter');
                    if (ftCfg?.enabled && !CerberusData.isPositive(chalUserKey)) {
                        const titleEl = wrapper.querySelector('.challengeWrapper .title, .challengeContent .title, .title');
                        const titleText = titleEl ? (titleEl.textContent || '') : '';
                        const ftMatch = titleText.match(/FT\s*(\d+)/i);
                        const ftTarget = ftMatch ? parseInt(ftMatch[1], 10) : null;
                        const isCasual = !ftMatch;

                        const allowedMap = {
                            2: ftCfg.allowFt2 !== false,
                            3: ftCfg.allowFt3 !== false,
                            5: ftCfg.allowFt5 !== false,
                            10: ftCfg.allowFt10 !== false,
                            20: ftCfg.allowFt20 !== false
                        };
                        const isCasualAllowed = ftCfg.allowCasual !== false;
                        const hasAnyAllowed = Object.values(allowedMap).some(Boolean) || isCasualAllowed;

                        let isFtAllowed = true;
                        if (hasAnyAllowed) {
                            if (ftTarget !== null) {
                                isFtAllowed = allowedMap[ftTarget] === true;
                            } else if (isCasual) {
                                isFtAllowed = isCasualAllowed;
                            }
                        } else {
                            // Fail-safe: se todas as opções estiverem desmarcadas, aceita todas (igual todas ativadas)
                            isFtAllowed = true;
                        }

                        if (!isFtAllowed) {
                            shouldFilter = true;
                            if (ftCfg.autoReject !== false) {
                                shouldReject = true;
                                if (!rejectReason) rejectReason = 'ft';
                            }
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

                            // [CERBERUS] Auto-Reject Notify: mandatory for FT filter, optional via toggle for other filters
                            const isFtReject = rejectReason === 'ft';
                            const shouldNotify = isFtReject || (ConfigManager.getSetting('countryFilter.autoRejectNotify') !== false);

                            if (shouldNotify) {
                                const now = Date.now();
                                const state = (typeof window !== 'undefined' && window.CerberusState) ? window.CerberusState : (typeof window !== 'undefined' ? (window.CerberusState = {}) : {});
                                if (!state.lastAutoRejectNotifyTime || (now - state.lastAutoRejectNotifyTime >= 5000)) {
                                    state.lastAutoRejectNotifyTime = now;
                                    const { formatAllowedFts } = _deps();
                                    const notifyMsg = isFtReject && typeof formatAllowedFts === 'function'
                                        ? t('autoReject.notifyFtMsg', { fts: formatAllowedFts(ConfigManager.getSetting('ftFilter')) })
                                        : t('autoReject.notifyMsg');
                                    setTimeout(() => executeChatMacro([notifyMsg]), 500);
                                }
                            }
                        }

                        return; // End DOM processing for this node
                    }

                    // [CERBERUS] Elo Recommendation for Received Challenge
                    const rankingsEnabled = ConfigManager.getSetting('rankings.masterEnabled') !== false;
                    const eloEnabled = rankingsEnabled && ConfigManager.getSetting('rankings.enableElo') === true;

                    if (eloEnabled) {
                        if (!wrapper.querySelector('.cerb-challenge-elo-hint')) {
                            const titleEl = wrapper.querySelector('.challengeWrapper .title, .challengeContent .title, .title');
                            const titleText = titleEl ? (titleEl.textContent || '') : '';
                            const ftMatch = titleText.match(/FT\s*(\d+)/i);
                            const isRanked = ftMatch !== null;

                            const hintEl = document.createElement('div');

                            if (!isRanked) {
                                hintEl.className = 'cerb-challenge-elo-hint unranked';
                                hintEl.textContent = t ? t('elo.unranked') : 'ℹ️ Não Ranqueado: Partida casual ou sem dados de Elo';
                            } else {
                                const ftTarget = parseInt(ftMatch[1], 10);
                                const rankImg = wrapper.querySelector('.challengeContent .userInfo .rank img, .userInfo .rank img, .rank img');
                                let chalRankLetter = 'C';
                                if (rankImg) {
                                    const match = (rankImg.src || rankImg.getAttribute('src') || '').match(/rank(\d+)\.png/);
                                    if (match) chalRankLetter = _deps().RANK_IMG_MAP[`rank${match[1]}`] || 'C';
                                }

                                const localUser = _deps().getLocalUserInfo(FCADE, activeGameId, RankCache);
                                if (!localUser || localUser.isUnranked || !localUser.elo) {
                                    hintEl.className = 'cerb-challenge-elo-hint unranked';
                                    hintEl.textContent = t ? t('elo.unranked') : 'ℹ️ Não Ranqueado: Partida casual ou sem dados de Elo';
                                } else {
                                    const oppElo = _deps().estimatePlayerElo(chalUserKey, chalRankLetter, activeGameId, RankCache);
                                    const rec = _deps().getRecommendation(localUser.elo, oppElo, ftTarget, t);

                                    let staleNotice = '';
                                    const lastSync = RankCache.data[activeGameId]?.lastUpdate;
                                    if (lastSync) {
                                        const ageDays = Math.floor((Date.now() - lastSync) / (24 * 3600 * 1000));
                                        if (ageDays >= 7) staleNotice = ` <span style="opacity:0.8">${t('elo.expiredNotice')}</span>`;
                                        else if (ageDays >= 1) staleNotice = ` <span style="opacity:0.8">${t('elo.staleNotice', { days: ageDays })}</span>`;
                                    }

                                    hintEl.className = `cerb-challenge-elo-hint ${rec.type}`;
                                    hintEl.innerHTML = `<div><strong>${rec.diffText}</strong></div><div>${rec.text}${staleNotice}</div>`;
                                }
                            }

                            const challengeTarget = wrapper.querySelector('.challengeContent') || wrapper.querySelector('.challengeWrapper') || wrapper.querySelector('.message') || wrapper;
                            if (challengeTarget) challengeTarget.appendChild(hintEl);
                        }
                    } else {
                        const existingHint = wrapper.querySelector('.cerb-challenge-elo-hint');
                        if (existingHint) existingHint.remove();
                    }
                }
            } else if (isChalSent) {
                // [CERBERUS] Elo Recommendation for Sent Challenge
                const rankingsEnabled = ConfigManager.getSetting('rankings.masterEnabled') !== false;
                const eloEnabled = rankingsEnabled && ConfigManager.getSetting('rankings.enableElo') === true;

                if (eloEnabled) {
                    if (!wrapper.querySelector('.cerb-challenge-elo-hint')) {
                        const titleEl = wrapper.querySelector('.challengeContainer .title, .challengeWrapper .title, .title');
                        if (titleEl) {
                            const titleText = titleEl.textContent || '';
                            const match = titleText.match(/challenged\s+(.+?)(?:\s+to\s+(?:a\s+)?FT\s*(\d+)|\s+to\s+(?:a\s+)?casual(?:\s+match)?|\s*$)/i);
                            if (match) {
                                const oppNick = normalizeUsername(match[1]);
                                const isRanked = Boolean(match[2]);
                                const hintEl = document.createElement('div');

                                if (!isRanked) {
                                    hintEl.className = 'cerb-challenge-elo-hint unranked';
                                    hintEl.textContent = t ? t('elo.unranked') : 'ℹ️ Não Ranqueado: Partida casual ou sem dados de Elo';
                                } else {
                                    const ftTarget = parseInt(match[2], 10);
                                    const localUser = _deps().getLocalUserInfo(FCADE, activeGameId, RankCache);
                                    if (!localUser || localUser.isUnranked || !localUser.elo) {
                                        hintEl.className = 'cerb-challenge-elo-hint unranked';
                                        hintEl.textContent = t ? t('elo.unranked') : 'ℹ️ Não Ranqueado: Partida casual ou sem dados de Elo';
                                    } else {
                                        const oppRankLetter = _deps().getPlayerRankLetter(oppNick, FCADE, activeGameId, RankCache);
                                        const oppElo = _deps().estimatePlayerElo(oppNick, oppRankLetter, activeGameId, RankCache);
                                        const rec = _deps().getRecommendation(localUser.elo, oppElo, ftTarget, t);

                                        hintEl.className = `cerb-challenge-elo-hint ${rec.type}`;
                                        hintEl.innerHTML = `<div><strong>${rec.diffText}</strong></div><div>${rec.text}</div>`;
                                    }
                                }
                                
                                const container = wrapper.querySelector('.challengeContainer') || wrapper.querySelector('.message') || wrapper;
                                container.appendChild(hintEl);
                            }
                        }
                    }
                } else {
                    const existingHint = wrapper.querySelector('.cerb-challenge-elo-hint');
                    if (existingHint) existingHint.remove();
                }
            } else if (isEndgame) {
                // [CERBERUS] Endgame Match Result Analysis & Rage Quit Detection
                const rankingsEnabled = ConfigManager.getSetting('rankings.masterEnabled') !== false;
                const eloEnabled = rankingsEnabled && ConfigManager.getSetting('rankings.enableElo') === true;

                if (eloEnabled) {
                    if (!wrapper.querySelector('.cerb-endgame-elo-box')) {
                        const h3 = wrapper.querySelector('.endgameMessageWrapper h3, h3');
                        if (h3) {
                            const h3Text = (h3.textContent || '').replace(/\s+/g, ' ').trim();
                            const match = h3Text.match(/result\s*-\s*(.+?)\s+(\d+)\s+FT\s*(\d+)\s+(\d+)\s+(.+)$/i);
                            if (match) {
                                const p1 = normalizeUsername(match[1]);
                                const s1 = parseInt(match[2], 10);
                                const ftTarget = parseInt(match[3], 10) || 5;
                                const s2 = parseInt(match[4], 10);
                                const p2 = normalizeUsername(match[5]);

                                const p1RankLetter = _deps().getPlayerRankLetter(p1, FCADE, activeGameId, RankCache);
                                const p2RankLetter = _deps().getPlayerRankLetter(p2, FCADE, activeGameId, RankCache);
                                const p1Elo = _deps().estimatePlayerElo(p1, p1RankLetter, activeGameId, RankCache);
                                const p2Elo = _deps().estimatePlayerElo(p2, p2RankLetter, activeGameId, RankCache);
                                const res = _deps().analyzeEndgame(p1, p1Elo, s1, p2, p2Elo, s2, ftTarget);

                                const localUser = _deps().getLocalUserInfo(FCADE, activeGameId, RankCache);
                                const myNick = (localUser?.username || '').toLowerCase();
                                const isLocalP1 = Boolean(myNick && p1.toLowerCase() === myNick);
                                const isLocalP2 = Boolean(myNick && p2.toLowerCase() === myNick);

                                // Check for native Fightcade Patreon subscriber lines in the message
                                const allParas = wrapper.querySelectorAll('p');
                                let nativeRealElo = null;
                                let nativeRealDelta = null;

                                allParas.forEach(pEl => {
                                    const text = pEl.textContent?.trim() || '';
                                    const eloMatch = text.match(/Your elo score is\s*(\d+)/i);
                                    if (eloMatch) {
                                        nativeRealElo = parseInt(eloMatch[1], 10);
                                        pEl.style.display = 'none';
                                    }
                                    const wonMatch = text.match(/You won\s*(\d+)\s*points/i);
                                    if (wonMatch) {
                                        nativeRealDelta = parseInt(wonMatch[1], 10);
                                        pEl.style.display = 'none';
                                    }
                                    const lostMatch = text.match(/You lost\s*(\d+)\s*points/i);
                                    if (lostMatch) {
                                        nativeRealDelta = -parseInt(lostMatch[1], 10);
                                        pEl.style.display = 'none';
                                    }
                                });

                                // If native Patreon real Elo is present, override estimates with official numbers
                                if (typeof nativeRealElo === 'number' && nativeRealElo > 0) {
                                    if (isLocalP1) {
                                        res.finalP1 = nativeRealElo;
                                        if (typeof nativeRealDelta === 'number') {
                                            res.delta1 = nativeRealDelta;
                                            res.delta2 = -nativeRealDelta;
                                            res.finalP2 = p2Elo - nativeRealDelta;
                                        }
                                    } else if (isLocalP2) {
                                        res.finalP2 = nativeRealElo;
                                        if (typeof nativeRealDelta === 'number') {
                                            res.delta2 = nativeRealDelta;
                                            res.delta1 = -nativeRealDelta;
                                            res.finalP1 = p1Elo - nativeRealDelta;
                                        }
                                    }
                                    if (myNick && activeGameId && RankCache && RankCache.data && RankCache.data[activeGameId]) {
                                        if (!RankCache.data[activeGameId].playerElos) RankCache.data[activeGameId].playerElos = {};
                                        RankCache.data[activeGameId].playerElos[myNick] = nativeRealElo;
                                        RankCache.save();
                                        if (typeof _deps().clearEloMemoCache === 'function') {
                                            _deps().clearEloMemoCache();
                                        }
                                    }
                                }

                                const d1Str = res.delta1 >= 0 ? `+${res.delta1}` : `${res.delta1}`;
                                const d2Str = res.delta2 >= 0 ? `+${res.delta2}` : `${res.delta2}`;
                                const isP1Winner = s1 > s2;
                                const isP2Winner = s2 > s1;
                                const isDraw = s1 === s2;
                                const icon1 = isP1Winner ? '🏆' : (isDraw ? '⚖️' : (res.delta1 > 0 ? '📈' : '📉'));
                                const icon2 = isP2Winner ? '🏆' : (isDraw ? '⚖️' : (res.delta2 > 0 ? '📈' : '📉'));
                                const isAborted = res.isEarlyQuit || (wrapper.querySelector('p')?.textContent || '').includes('Not finishing') || (wrapper.textContent || '').includes('Not finishing');
                                const cw = wrapper.closest('.channelWrapper');
                                const isRankedMatch = h3Text.toLowerCase().includes('ranked') || Boolean(cw?.querySelector('.rankedWrapper, .ranked'));
                                const hasScore = (s1 > 0 || s2 > 0);
                                const showPenaltyWarning = isAborted && isRankedMatch && hasScore;

                                let motivationHtml = '';
                                if (isLocalP1 || isLocalP2) {
                                    const isWin = isLocalP1 ? isP1Winner : isP2Winner;
                                    const myDelta = isLocalP1 ? res.delta1 : res.delta2;

                                    if (isWin && myDelta >= 0) {
                                        motivationHtml = `<div class="cerb-endgame-motivation-row win">${t('elo.motivationWin')}</div>`;
                                    } else if (isWin && myDelta < 0) {
                                        motivationHtml = `<div class="cerb-endgame-motivation-row profit" style="color: #fbbf24;">${t('elo.motivationWinDeficit')}</div>`;
                                    } else if (!isWin && myDelta > 0) {
                                        motivationHtml = `<div class="cerb-endgame-motivation-row profit">${t('elo.motivationProfitLoss')}</div>`;
                                    } else {
                                        motivationHtml = `<div class="cerb-endgame-motivation-row defeat">${t('elo.motivationDefeat')}</div>`;
                                    }
                                }

                                const box = document.createElement('div');
                                box.className = 'cerb-endgame-elo-box';
                                box.innerHTML = `
                                    <div class="cerb-endgame-result-row">
                                        <div class="cerb-endgame-player">${icon1} <strong>${res.p1Name}</strong>: <span class="cerb-endgame-delta ${res.delta1 >= 0 ? 'gain' : 'loss'}">${d1Str} pts</span></div>
                                        <div class="cerb-endgame-player">${icon2} <strong>${res.p2Name}</strong>: <span class="cerb-endgame-delta ${res.delta2 >= 0 ? 'gain' : 'loss'}">${d2Str} pts</span></div>
                                    </div>
                                    ${motivationHtml}
                                    ${showPenaltyWarning ? `
                                        <div class="cerb-endgame-warning-row">
                                            <span class="cerb-warning-icon">⚠️</span>
                                            <div class="cerb-warning-text">${t('elo.rageQuitWarning', { score: `${s1}x${s2}` })}</div>
                                        </div>` : ''}
                                `;

                                const innerDiv = wrapper.querySelector('.endgameMessageWrapper > div') || wrapper.querySelector('.endgameMessageWrapper') || wrapper.querySelector('.message') || wrapper;
                                if (innerDiv) {
                                    if (h3 && h3.parentNode === innerDiv) innerDiv.insertBefore(box, h3.nextSibling);
                                    else innerDiv.appendChild(box);
                                } else {
                                    wrapper.appendChild(box);
                                }
                            }
                        }
                    }
                } else {
                    const existingBox = wrapper.querySelector('.cerb-endgame-elo-box');
                    if (existingBox) existingBox.remove();
                }
            } else if (isMotd) {
                setupMotdControls(wrapper, activeGameId);
            }

        } else {
            const msg = wrapper.querySelector('.message.chat');
            if (msg) {
                const author = msg.querySelector('span.author');
                if (author) {
                    let userKey = normalizeUsername(getCleanAuthorText(author));
                    if (userKey) {
                        applyDevBadge(author, userKey);
                        
                        if (queueCfg?.enabled && queueCfg.keyword && window.CerberusState?.liveMasterOn) {
                            let msgText = ''; msg.querySelectorAll('.blocksContainer .blocks .regular').forEach(span => { msgText += span.textContent; });
                            msgText = msgText.trim().toLowerCase();
                            const streamerNick = (getLocalUsername(FCADE) || queueCfg.streamerNick || '').toLowerCase();
                            if (msgText === queueCfg.keyword.toLowerCase() && (!streamerNick || userKey.toLowerCase() !== streamerNick)) {
                                if (CerberusData.addQueue(userKey)) { 
                                    playPopSound(); 
                                    if (!window.CerberusState.replyQueue) window.CerberusState.replyQueue = []; 
                                    // [CERBERUS] Attach channelId to prevent cross-channel spam
                                    window.CerberusState.replyQueue.push({ name: userKey, channelId: FCADE.activeChannelId }); 
                                }
                            }
                        }

                        const masterVisuals = cfg.masterEnabled !== false;
                        const rankingsEnabled = ConfigManager.getSetting('rankings.masterEnabled') !== false;
                        const isVisualActive = masterVisuals && (cfg.enableStatus || cfg.enableFlag || cfg.enableRank || cfg.enablePingBars || cfg.enablePingText);
                        const isRankActive = rankingsEnabled && cfg.showNumericRanks;
                        const isRepActive = cfg.enableReputation;

                        // [CERBERUS] Fast-path: When all chat visual decorations and reputation are off, exit immediately
                        if (!isVisualActive && !isRankActive && !isRepActive) {
                            wrapper.dataset.cerberusProcessed = "true";
                            return;
                        }

                        const user = globalUsers[userKey]; let userCountry = user ? user.country?.iso_code?.toUpperCase() : null;

                        const userFound = activeUsersMap ? activeUsersMap.get(userKey) : null;
                        const minPingVal = getMinPing(userFound);

                        let statusState = 'offline'; if (user && user.away === false) statusState = 'online'; else if (user && user.away === true) statusState = 'away';

                        if (rankingsEnabled && cfg.showNumericRanks && activeGameId) {
                            const numericRank = RankCache.getRank(activeGameId, userKey);
                            const existingBadge = author.querySelector('.cerb-rank-badge');
                            if (numericRank !== null) {
                                const desiredText = getRankBadgeText(numericRank);
                                if (!existingBadge) {
                                    author.appendChild(createRankBadge(numericRank));
                                } else if (existingBadge.textContent !== desiredText) {
                                    existingBadge.textContent = desiredText;
                                }
                            } else if (existingBadge) {
                                existingBadge.remove();
                            }
                        }

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
                        
                        wrapper.dataset.cerberusUser = userKey; 
                        if (userCountry) wrapper.dataset.cerberusCountry = userCountry;
                        if (minPingVal !== null) wrapper.dataset.cerberusPing = String(minPingVal);
                    }
                }
            } else { wrapper.dataset.cerberusHidden = "false"; wrapper.style.display = ''; }
        }
        wrapper.dataset.cerberusProcessed = "true";
    } else {
        // [CERBERUS] Refresh dynamic badges on re-scans (e.g. after RankCache sync)
        const rankingsEnabled = ConfigManager.getSetting('rankings.masterEnabled') !== false;
        if (rankingsEnabled && cfg.showNumericRanks && activeGameId) {
            const author = wrapper.querySelector('.message.chat span.author');
            if (author) {
                const userKey = wrapper.dataset.cerberusUser || normalizeUsername(getCleanAuthorText(author));
                if (userKey) {
                    const numericRank = RankCache.getRank(activeGameId, userKey);
                    const existingBadge = author.querySelector('.cerb-rank-badge');
                    if (numericRank !== null) {
                        const desiredText = getRankBadgeText(numericRank);
                        if (!existingBadge) {
                            author.appendChild(createRankBadge(numericRank));
                        } else if (existingBadge.textContent !== desiredText) {
                            existingBadge.textContent = desiredText;
                        }
                    } else if (existingBadge) {
                        existingBadge.remove();
                    }
                }
            }
        }
    }

    const countryFilterEnabled = filterCfg?.enabled === true; 
    const hideNeg = cfg?.hideNegativeMessages;
    const pingCfg = ConfigManager.getSetting('pingFilter');
    const pingFilterActive = pingCfg?.enabled === true && pingCfg?.hideHighPing === true;
    const maxPing = pingCfg?.maxPingMs || 150;

    if (isImmuneSystem || (!countryFilterEnabled && !hideNeg && !pingFilterActive)) { 
        if (wrapper.dataset.cerberusHidden === "true") { wrapper.style.display = ''; wrapper.dataset.cerberusHidden = "false"; } 
        return; 
    }

    const msgNode = wrapper.querySelector('.message.chat');
    if (!msgNode || isSystemUser(wrapper.dataset.cerberusUser)) { 
        if (wrapper.dataset.cerberusHidden === "true") { wrapper.style.display = ''; wrapper.dataset.cerberusHidden = "false"; } 
        return; 
    }

    const userKey = wrapper.dataset.cerberusUser; 
    const userCountry = wrapper.dataset.cerberusCountry;
    const userPing = wrapper.dataset.cerberusPing ? parseInt(wrapper.dataset.cerberusPing) : null;

    let isBlockedByCountry = countryFilterEnabled && !CerberusData.isCountryAllowed(userCountry) && !CerberusData.isPositive(userKey);
    let isBlockedByPing = pingFilterActive && userPing !== null && userPing > maxPing && !CerberusData.isPositive(userKey);
    let isBlockedByRep = hideNeg && CerberusData.isNegative(userKey);

    let shouldHide = isBlockedByRep || isBlockedByCountry || isBlockedByPing;

    if (shouldHide && wrapper.dataset.cerberusHidden !== "true") { wrapper.style.display = 'none'; wrapper.dataset.cerberusHidden = "true"; }
    else if (!shouldHide && wrapper.dataset.cerberusHidden !== "false") { wrapper.style.display = ''; wrapper.dataset.cerberusHidden = "false"; }
}

const updateSidebarScope = (sidebarElement, FCADE, configFull) => {
    const { CerberusData, RankCache, normalizeUsername, isSystemUser, extractMinPing, getActiveGameId, createRankBadge, getRankBadgeText, applyReputationStyleList, applyReputationStyleMatch, addReputationControlsToElement, applyDevBadge, ConfigManager, COUNTRY_NAME_TO_CODE, RANK_IMG_MAP, estimatePlayerElo, getPlayerEloInfo, getLocalUserInfo, getRecommendation, t } = _deps();

    if (!sidebarElement) return;
    attachSidebarTooltip(sidebarElement, FCADE);

    const cw = sidebarElement.closest('.channelWrapper');
    if (cw && cw.style.display === 'none') return;

    const globalUsers = FCADE.globalUsers; if (!globalUsers) return;

    const cfg = configFull.chatUserInfo; 
    const countryFilterEnabled = configFull.countryFilter?.enabled === true;
    const pingCfg = configFull.pingFilter;
    const pingFilterActive = pingCfg?.enabled === true && pingCfg?.hideHighPing === true;
    const maxPing = pingCfg?.maxPingMs || 150;

    const activeGameId = getActiveGameId(FCADE, cw);
    const searchTerm = window.CerberusState.sidebarSearchTerm || '';

    const masterVisuals = cfg.masterEnabled !== false;
    const rankingsEnabled = ConfigManager.getSetting('rankings.masterEnabled') !== false;

    if (masterVisuals && cfg?.replacePingBarWithText) document.body?.classList?.add('cerb-hide-sidebar-ping'); else document.body?.classList?.remove('cerb-hide-sidebar-ping');

    sidebarElement.querySelectorAll('.usersIgnoredTitle').forEach(titleEl => titleEl.childNodes.forEach(node => { if (node.nodeType === Node.TEXT_NODE && node.nodeValue.includes('Ignored')) node.nodeValue = node.nodeValue.replace('Ignored', 'Blocked'); }));

    const eloEnabled = rankingsEnabled && ConfigManager.getSetting('rankings.enableElo') === true;

    const hasAnySidebarFeature = Boolean(
        searchTerm !== '' ||
        countryFilterEnabled ||
        pingFilterActive ||
        eloEnabled ||
        (rankingsEnabled && cfg?.showNumericRanks) ||
        cfg?.enableReputation ||
        (masterVisuals && cfg?.replacePingBarWithText)
    );

    if (!hasAnySidebarFeature) {
        if (sidebarElement.dataset.cerbSidebarCleaned !== "true") {
            sidebarElement.querySelectorAll('.cerberus-ping-text, .cerb-rank-badge, .cerb-flag-trigger').forEach(el => el.remove());
            sidebarElement.querySelectorAll('.userItem').forEach(item => {
                if (item.style.display === 'none') item.style.display = '';
                item.removeAttribute('data-cerberus-processed');
                item.removeAttribute('data-cerb-identity');
                item.removeAttribute('data-cerb-search-hidden');
                item.removeAttribute('data-country-blocked');
            });
            sidebarElement.dataset.cerbSidebarCleaned = "true";
        }
        return;
    }
    delete sidebarElement.dataset.cerbSidebarCleaned;

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
                const rankEl = item.querySelector('.rankWrapper, .rank');
                if (rankEl && rankEl.hasAttribute('title')) rankEl.removeAttribute('title');
                item.dataset.cerbIdentity = itemIdentity;
            }
            item.dataset.currentUser = userKey;
            let matchesSearch = searchTerm === '' || userKey.toLowerCase().includes(searchTerm);

            const rankImg = item.querySelector('.rankWrapper img, .rank img');
            const isUnrankedLive = rankImg && (rankImg.src || rankImg.getAttribute('src') || '').includes('rank0.png');

            if (rankingsEnabled && cfg.showNumericRanks && activeGameId && !isUnrankedLive) {
                const numericRank = RankCache.getRank(activeGameId, userKey); let badge = item.querySelector('.cerb-rank-badge');
                if (numericRank !== null) {
                    const desiredText = getRankBadgeText(numericRank);
                    if (!badge) {
                        badge = createRankBadge(numericRank); const rankEl = item.querySelector('.rankWrapper, .rank');
                        if (rankEl && rankEl.parentNode) rankEl.parentNode.insertBefore(badge, rankEl);
                        else { const pingWrapper = item.querySelector('.pingWrapper'); if (pingWrapper && pingWrapper.parentNode) pingWrapper.parentNode.insertBefore(badge, pingWrapper); }
                    } else if (badge.textContent !== desiredText) {
                        badge.textContent = desiredText;
                    }
                } else if (badge) badge.remove();
            } else { 
                const badge = item.querySelector('.cerb-rank-badge'); if (badge) badge.remove(); 
                const rankEl = item.querySelector('.rankWrapper, .rank');
                if (rankEl && rankEl.hasAttribute('title')) rankEl.removeAttribute('title');
            }

            if (cfg?.enableReputation) { 
                if (item.dataset.currentUser !== userKey) {
                item.dataset.currentUser = userKey;
                delete item.dataset.cerbRepState;
            }
            applyReputationStyleList(playerNameEl, item, userKey); 
            addReputationControlsToElement(item, 'list'); 
            }

            let minPingVal = null;
            const pingWrapper = item.querySelector('.pingWrapper');
            if (pingWrapper) {
                const img = pingWrapper.querySelector('img.ping'); 
                minPingVal = extractMinPing(img ? img.title : pingWrapper.title);
                if (masterVisuals && cfg?.replacePingBarWithText && minPingVal !== null) {
                    const imgSrc = (img ? (img.src || img.getAttribute('src') || '') : '').toLowerCase();
                    const imgTitle = ((img ? img.title : '') || pingWrapper.title || '').toLowerCase();

                    let netType = 'cable';
                    if (imgSrc.includes('wifi') || imgTitle.includes('wifi') || imgTitle.includes('wireless') || img?.classList?.contains('wifi')) {
                        netType = 'wifi';
                    } else if (imgSrc.includes('relay') || imgSrc.includes('vpn') || imgSrc.includes('turn') || imgTitle.includes('relay') || imgTitle.includes('vpn') || imgTitle.includes('proxy')) {
                        netType = 'vpn';
                    }

                    let color = '#aaa';
                    if (netType === 'vpn') {
                        color = '#ff4444'; // [CERBERUS] VPN is always red
                    } else if (netType === 'wifi') {
                        color = minPingVal > 90 ? '#ff4444' : '#fbbf24'; // [CERBERUS] Wi-Fi: green/neutral become yellow
                    } else {
                        if (minPingVal < 60) color = '#00ff00';
                        else if (minPingVal > 90) color = '#ff4444';
                        else color = '#aaa';
                    }

                    let txt = pingWrapper.querySelector('.cerberus-ping-text');
                    const newText = `${minPingVal}ms`;
                    if (!txt) { 
                        txt = document.createElement('span'); 
                        txt.className = 'cerberus-ping-text'; 
                        Object.assign(txt.style, { fontSize: '11px', fontWeight: 'bold', marginLeft: 'auto', verticalAlign: 'middle', display: 'inline-flex', alignItems: 'center' }); 
                        pingWrapper.appendChild(txt); 
                    }

                    let netIcon = txt.querySelector('.cerb-net-icon');
                    if (!netIcon) {
                        netIcon = document.createElement('span');
                        txt.insertBefore(netIcon, txt.firstChild);
                    }
                    const netClass = `cerb-net-icon cerb-net-${netType}`;
                    if (netIcon.className !== netClass) netIcon.className = netClass;

                    let numSpan = txt.querySelector('.cerb-ping-num');
                    if (!numSpan) {
                        numSpan = document.createElement('span');
                        numSpan.className = 'cerb-ping-num';
                        txt.appendChild(numSpan);
                    }
                    if (numSpan.textContent !== newText) numSpan.textContent = newText;
                    if (txt.style.color !== color) txt.style.color = color;
                    const { t } = _deps();
                    const netLabel = (typeof t === 'function' ? t(`settings.connectionTypes.${netType}`) : null) || (netType === 'cable' ? 'Cable' : (netType === 'wifi' ? 'Wi-Fi' : 'VPN'));
                    const tooltipText = `${netLabel} (${minPingVal}ms)`;
                    if (txt.title !== tooltipText) txt.title = tooltipText;
                }
            }
            if (!masterVisuals || !cfg?.replacePingBarWithText) {
                if (pingWrapper) { const txt = pingWrapper.querySelector('.cerberus-ping-text'); if (txt) txt.remove(); }
            }

            let userCountry = globalUsers[userKey]?.country?.iso_code?.toUpperCase();
            if (!userCountry) { const flagEl = item.querySelector('.flagWrapper'); if (flagEl && flagEl.title) userCountry = COUNTRY_NAME_TO_CODE[flagEl.title]; }

            let isBlockedByCountry = countryFilterEnabled && !CerberusData.isCountryAllowed(userCountry) && !CerberusData.isPositive(userKey);
            let isBlockedByPing = pingFilterActive && minPingVal !== null && minPingVal > maxPing && !CerberusData.isPositive(userKey);
            let isBlocked = isBlockedByCountry || isBlockedByPing;

            // [CERBERUS] CPU Guard: Only updates display if target style differs from current
            const targetDisplay = (!matchesSearch || isBlocked) ? 'none' : '';
            if (item.style.display !== targetDisplay) item.style.display = targetDisplay;
            item.dataset.cerbSearchHidden = !matchesSearch ? "true" : "false"; 
            item.dataset.countryBlocked = isBlocked ? "true" : "false";
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
    if (!FCADE) return;

    const hookCallbacks = (target) => {
        if (!target || target._cerbChatHooked) return;
        target._cerbChatHooked = true;
        const originalOnChatMessage = target.onChatMessage;

        target.onChatMessage = function(channelname, username, chat) {
            try {
                const { ConfigManager, CerberusData, normalizeUsername, playPopSound, getLocalUsername } = _deps();
                const config = ConfigManager.getRuntimeConfig();
                const queueCfg = config?.liveQueue;

                if (queueCfg?.enabled && queueCfg.keyword && window.CerberusState.liveMasterOn && chat) {
                    const userKey = normalizeUsername(username);
                    const streamerNick = (getLocalUsername(FCADE || window.CerberusFCADE) || queueCfg.streamerNick || '').toLowerCase();
                    const msgText = chat.trim().toLowerCase();

                    if (msgText === queueCfg.keyword.toLowerCase() && (!streamerNick || userKey.toLowerCase() !== streamerNick)) {
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
    };

    if (FCADE.connectionCallbacks) hookCallbacks(FCADE.connectionCallbacks);
    if (FCADE.genericCallbacks) hookCallbacks(FCADE.genericCallbacks);

    const descConn = Object.getOwnPropertyDescriptor(FCADE, 'connectionCallbacks');
    const prevSetConn = descConn?.set;
    let currentConn = FCADE.connectionCallbacks;
    try {
        Object.defineProperty(FCADE, 'connectionCallbacks', {
            get() { return currentConn; },
            set(val) {
                currentConn = val;
                if (typeof prevSetConn === 'function') {
                    try { prevSetConn.call(FCADE, val); } catch (_) {}
                }
                hookCallbacks(val);
            },
            configurable: true,
            enumerable: true
        });
    } catch (e) {}

    const descGeneric = Object.getOwnPropertyDescriptor(FCADE, 'genericCallbacks');
    const prevSetGeneric = descGeneric?.set;
    let currentGeneric = FCADE.genericCallbacks;
    try {
        Object.defineProperty(FCADE, 'genericCallbacks', {
            get() { return currentGeneric; },
            set(val) {
                currentGeneric = val;
                if (typeof prevSetGeneric === 'function') {
                    try { prevSetGeneric.call(FCADE, val); } catch (_) {}
                }
                hookCallbacks(val);
            },
            configurable: true,
            enumerable: true
        });
    } catch (e) {}
}

module.exports = { updateFilterShield, unfilterAllMessages, unfilterAllUsers, invalidateCountryFilterCache, attachMultiObservers, processCollectedWrappers, fullChatScanScoped, checkAndProcessWrapper, updateSidebarScope, reprocessUserMessages, setupChatMessageInterceptor };