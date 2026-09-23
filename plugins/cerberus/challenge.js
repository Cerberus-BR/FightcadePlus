// cerberus/challenge.js

let _d = null;
function _deps() {
    if (_d) return _d;
    return (_d = {
        ...require('./state.js'),
        ...require('./config.js'),
        ...require('./api.js'),
        ...require('./utils.js'),
        ...require('./constants.js'),
        ...require('./elo.js')
    });
}

function extractOpponentMinPing(FCADE, username) {
    if (!FCADE || !username) return null;
    const { extractMinPing, normalizeUsername } = _deps();
    const userKey = normalizeUsername(username);

    // Source 1: FCADE.globalUsers
    const globalUsers = FCADE.globalUsers || {};
    const userObj = globalUsers[userKey] || globalUsers[username];

    if (userObj) {
        if (userObj.pingTitle) {
            const min = extractMinPing(userObj.pingTitle);
            if (min !== null) return min;
        }
        if (typeof userObj.ping === 'number' && userObj.ping > 0) {
            return Math.round(0.75 * userObj.ping);
        }
    }

    // Source 2: Vue user components in FCADE.$refs
    if (FCADE.$refs) {
        for (const refKey of Object.keys(FCADE.$refs)) {
            const usersList = FCADE.$refs[refKey]?.[0]?.$refs?.usersList?.$children;
            if (usersList && usersList.length > 0) {
                for (let i = 0; i < usersList.length; i++) {
                    const child = usersList[i];
                    const childUser = child?.user;
                    if (childUser && (normalizeUsername(childUser.id) === userKey || normalizeUsername(childUser.name) === userKey)) {
                        if (child.pingTitle) {
                            const min = extractMinPing(child.pingTitle);
                            if (min !== null) return min;
                        }
                        if (typeof childUser.ping === 'number' && childUser.ping > 0) {
                            return Math.round(0.75 * childUser.ping);
                        }
                    }
                }
            }
        }
    }

    // Source 3: DOM pingWrapper title attribute fallback
    const userElements = document.querySelectorAll('.userItem');
    for (const item of userElements) {
        const nameEl = item.querySelector('.playerName');
        if (nameEl && normalizeUsername(nameEl.textContent) === userKey) {
            const pingWrapper = item.querySelector('.pingWrapper');
            if (pingWrapper) {
                const img = pingWrapper.querySelector('img.ping');
                const title = img ? img.title : pingWrapper.title;
                const min = extractMinPing(title);
                if (min !== null) return min;
            }
        }
    }

    return null;
}

function evaluateChallengeFilters(FCADE, user, channelname, challengeid, ranked) {
    const { CerberusData, ConfigManager, RankCache, normalizeUsername } = _deps();
    const username = user?.name || user?.id || user;
    if (!username) return { shouldReject: false, shouldFilter: false };

    const userKey = normalizeUsername(username);
    const globalUsers = FCADE.globalUsers || {};
    const userObj = globalUsers[userKey];
    const userCountry = userObj?.country?.iso_code?.toUpperCase();

    const config = ConfigManager.getRuntimeConfig();
    const filterCfg = config?.countryFilter;
    const rankCfg = config?.rankings;
    const chatCfg = config?.chatUserInfo;
    const pingCfg = config?.pingFilter;

    let shouldFilter = false;
    let shouldReject = false;
    let rejectReason = '';

    // 1. Reputation (Negative rep)
    const isNeg = CerberusData.isNegative(userKey);
    if (isNeg) {
        shouldFilter = true;
        if (chatCfg?.autoRejectNegative) {
            shouldReject = true;
            rejectReason = 'reputation';
        }
    }

    // 2. Country Filter
    const isCountryBlocked = filterCfg?.enabled && !CerberusData.isCountryAllowed(userCountry) && !CerberusData.isPositive(userKey);
    if (isCountryBlocked) {
        shouldFilter = true;
        if (filterCfg?.autoReject) {
            shouldReject = true;
            if (!rejectReason) rejectReason = 'country';
        }
    }

    // 3. Min Rank Filter (0=All, 1=E, 2=D, 3=C, 4=B, 5=A, 6=S)
    const minRank = rankCfg?.minRankToAccept || 0;
    if (minRank > 0 && !CerberusData.isPositive(userKey)) {
        const { getActiveGameId, getPlayerRankNumber } = _deps();
        const targetChannelOrGame = channelname || getActiveGameId(FCADE);
        const sanitizedGameId = (targetChannelOrGame || '').replace(/-[0-9]+$/, '');
        
        let userTier = null;
        if (user) {
            userTier = getPlayerRankNumber(user, targetChannelOrGame) || getPlayerRankNumber(user, sanitizedGameId);
        }
        if (userTier === null && userObj) {
            userTier = getPlayerRankNumber(userObj, targetChannelOrGame) || getPlayerRankNumber(userObj, sanitizedGameId);
        }
        if (userTier === null && sanitizedGameId && RankCache) {
            const cachedLetter = RankCache.getPlayerRankLetter(sanitizedGameId, userKey);
            if (cachedLetter) {
                const tierMap = { 'E': 1, 'D': 2, 'C': 3, 'B': 4, 'A': 5, 'S': 6 };
                userTier = tierMap[cachedLetter] || null;
            }
        }

        if (userTier !== null && userTier < minRank) {
            shouldFilter = true;
            if (rankCfg?.autoRejectBelowMin) {
                shouldReject = true;
                if (!rejectReason) rejectReason = 'rank';
            }
        }
    }

    // 4. Max Ping Filter (uses MINIMUM ping ms)
    if (pingCfg?.enabled && !CerberusData.isPositive(userKey)) {
        const maxPingMs = pingCfg.maxPingMs || 150;
        const minPing = extractOpponentMinPing(FCADE, userKey);
        console.log(`[Cerberus] Ping Filter Check for ${userKey}: Detected Min Ping = ${minPing} ms (Limit: ${maxPingMs} ms)`);
        if (minPing !== null && minPing > maxPingMs) {
            shouldFilter = true;
            if (pingCfg?.autoReject !== false) {
                shouldReject = true;
                if (!rejectReason) rejectReason = 'ping';
            }
        }
    }

    // 5. FT Format Filter
    const ftCfg = config?.ftFilter;
    if (ftCfg?.enabled && !CerberusData.isPositive(userKey)) {
        let ftTarget = null;
        let isCasual = false;
        if (typeof ranked === 'number' && ranked > 0) {
            ftTarget = ranked;
        } else if (typeof ranked === 'string' && /^\d+$/.test(ranked.trim()) && parseInt(ranked.trim(), 10) > 0) {
            ftTarget = parseInt(ranked.trim(), 10);
        } else {
            isCasual = true;
        }

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
            if (ftCfg?.autoReject !== false) {
                shouldReject = true;
                if (!rejectReason) rejectReason = 'ft';
            }
        }
    }

    return { shouldFilter, shouldReject, rejectReason, userKey };
}

function wrapCallbacks(callbacks, FCADE) {
    if (!callbacks || callbacks._cerbChallengeHooked) return;
    callbacks._cerbChallengeHooked = true;

    const originalOnChallengeRequest = callbacks.onChallengeRequest;

    callbacks.onChallengeRequest = function(user, channelname, challengeid, ranked) {
        try {
            const fcadeObj = window.CerberusFCADE || FCADE || {};
            const { shouldReject, userKey, rejectReason } = evaluateChallengeFilters(fcadeObj, user, channelname, challengeid, ranked);
            const { ConfigManager, executeChatMacro, t, formatAllowedFts } = _deps();

            if (shouldReject) {
                console.log(`[Cerberus] Network Auto-Rejecting challenge from ${userKey} (Reason: ${rejectReason}, channel: ${channelname}, id: ${challengeid})`);
                
                if (typeof fcadeObj.declineChallenge === 'function') {
                    const userObj = user || fcadeObj.globalUsers?.[userKey];
                    fcadeObj.declineChallenge(channelname, userObj, challengeid);
                }

                // Chat notice on auto-reject: mandatory for FT filter, optional via toggle for other filters
                const isFtReject = rejectReason === 'ft';
                const shouldNotify = isFtReject || (ConfigManager.getSetting('countryFilter.autoRejectNotify') !== false);

                if (shouldNotify) {
                    const now = Date.now();
                    const state = (typeof window !== 'undefined' && window.CerberusState) ? window.CerberusState : (typeof window !== 'undefined' ? (window.CerberusState = {}) : {});
                    if (!state.lastAutoRejectNotifyTime || (now - state.lastAutoRejectNotifyTime >= 5000)) {
                        state.lastAutoRejectNotifyTime = now;
                        const notifyMsg = isFtReject && typeof formatAllowedFts === 'function'
                            ? t('autoReject.notifyFtMsg', { fts: formatAllowedFts(ConfigManager.getSetting('ftFilter')) })
                            : t('autoReject.notifyMsg');
                        setTimeout(() => executeChatMacro([notifyMsg]), 500);
                    }
                }
                return;
            }
        } catch (e) {
            console.error('[Cerberus] Error in challenge interceptor:', e);
        }

        if (originalOnChallengeRequest) {
            originalOnChallengeRequest.apply(this, arguments);
        }
    };
}

function setupChallengeInterceptor(FCADE) {
    if (!FCADE) return;
    if (typeof window !== 'undefined' && !window.CerberusFCADE) {
        window.CerberusFCADE = FCADE;
    }

    const hookCallbacks = (target) => {
        if (!target) return;
        wrapCallbacks(target, FCADE);
    };

    if (FCADE.connectionCallbacks) {
        hookCallbacks(FCADE.connectionCallbacks);
    }
    if (FCADE.genericCallbacks) {
        hookCallbacks(FCADE.genericCallbacks);
    }

    const descConn = Object.getOwnPropertyDescriptor(FCADE, 'connectionCallbacks');
    const prevSetConn = descConn?.set;
    let currentConnCallbacks = FCADE.connectionCallbacks;
    try {
        Object.defineProperty(FCADE, 'connectionCallbacks', {
            get() {
                return currentConnCallbacks;
            },
            set(newCallbacks) {
                currentConnCallbacks = newCallbacks;
                if (typeof prevSetConn === 'function') {
                    try { prevSetConn.call(FCADE, newCallbacks); } catch (_) {}
                }
                hookCallbacks(newCallbacks);
            },
            configurable: true,
            enumerable: true
        });
    } catch (e) {
        console.warn('[Cerberus] Could not defineProperty on connectionCallbacks:', e);
    }

    const descGeneric = Object.getOwnPropertyDescriptor(FCADE, 'genericCallbacks');
    const prevSetGeneric = descGeneric?.set;
    let currentGenericCallbacks = FCADE.genericCallbacks;
    try {
        Object.defineProperty(FCADE, 'genericCallbacks', {
            get() {
                return currentGenericCallbacks;
            },
            set(newCallbacks) {
                currentGenericCallbacks = newCallbacks;
                if (typeof prevSetGeneric === 'function') {
                    try { prevSetGeneric.call(FCADE, newCallbacks); } catch (_) {}
                }
                hookCallbacks(newCallbacks);
            },
            configurable: true,
            enumerable: true
        });
    } catch (e) {
        console.warn('[Cerberus] Could not defineProperty on genericCallbacks:', e);
    }
}

module.exports = {
    setupChallengeInterceptor,
    evaluateChallengeFilters
};
