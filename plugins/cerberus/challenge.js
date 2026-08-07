// cerberus/challenge.js

let _d = null;
function _deps() {
    if (_d) return _d;
    return (_d = {
        ...require('./state.js'),
        ...require('./config.js'),
        ...require('./api.js'),
        ...require('./utils.js'),
        ...require('./constants.js')
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
            rejectReason = 'country';
        }
    }

    // 3. Min Rank Filter
    const minRank = rankCfg?.minRankToAccept || 0;
    if (minRank > 0 && !CerberusData.isPositive(userKey)) {
        const activeGameId = FCADE.activeChannelId;
        const userRankNum = activeGameId ? RankCache.getRank(activeGameId, userKey) : 0;
        if (userRankNum !== null && userRankNum < minRank) {
            shouldFilter = true;
            if (rankCfg?.autoRejectBelowMin) {
                shouldReject = true;
                rejectReason = 'rank';
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
                rejectReason = 'ping';
            }
        }
    }

    return { shouldFilter, shouldReject, rejectReason, userKey };
}

function wrapCallbacks(callbacks) {
    if (!callbacks || callbacks._cerbChallengeHooked) return;
    callbacks._cerbChallengeHooked = true;

    const originalOnChallengeRequest = callbacks.onChallengeRequest;

    callbacks.onChallengeRequest = function(user, channelname, challengeid, ranked) {
        try {
            const fcadeObj = window.CerberusFCADE || {};
            const { shouldReject, userKey, rejectReason } = evaluateChallengeFilters(fcadeObj, user, channelname, challengeid, ranked);
            const { ConfigManager, executeChatMacro, t } = _deps();

            if (shouldReject) {
                console.log(`[Cerberus] Network Auto-Rejecting challenge from ${userKey} (Reason: ${rejectReason}, channel: ${channelname}, id: ${challengeid})`);
                
                if (typeof fcadeObj.declineChallenge === 'function') {
                    fcadeObj.declineChallenge(user.name || user, channelname, challengeid);
                }

                if (ConfigManager.getSetting('countryFilter.autoRejectNotify')) {
                    const now = Date.now();
                    if (!window.CerberusState.lastAutoRejectNotifyTime || (now - window.CerberusState.lastAutoRejectNotifyTime >= 5000)) {
                        window.CerberusState.lastAutoRejectNotifyTime = now;
                        setTimeout(() => executeChatMacro([t('autoReject.notifyMsg')]), 500);
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

    let currentCallbacks = FCADE.genericCallbacks || {};
    wrapCallbacks(currentCallbacks);

    try {
        Object.defineProperty(FCADE, 'genericCallbacks', {
            get() {
                return currentCallbacks;
            },
            set(newCallbacks) {
                currentCallbacks = newCallbacks || {};
                wrapCallbacks(currentCallbacks);
            },
            configurable: true,
            enumerable: true
        });
    } catch (e) {
        console.warn('[Cerberus] Could not defineProperty on genericCallbacks, using direct wrapping:', e);
    }
}

module.exports = {
    setupChallengeInterceptor,
    evaluateChallengeFilters
};
