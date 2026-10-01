// cerberus/challenge.js

let _d = null;
function _deps() {
    if (_d) return _d;
    return (_d = {
        ...require('./state.js'),
        ...require('./config.js'),
        ...require('./api.js'),
        ...require('./utils.js'),
        ...require('./ui.js'),
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
    const { getActiveChannelWrapper } = _deps();
    const scope = (typeof getActiveChannelWrapper === 'function' ? getActiveChannelWrapper() : null) || document;
    const userElements = scope.querySelectorAll('.userItem');
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

                handleAutoRejectNotification(userKey, rejectReason);
                return;
            }
        } catch (e) {
            console.error('[Cerberus] Error in challenge interceptor:', e);
        }

        if (originalOnChallengeRequest) {
            originalOnChallengeRequest.apply(this, arguments);
        }
    };

    const originalOnUserJoin = callbacks.onUserJoin;
    callbacks.onUserJoin = function(user, channelId) {
        try {
            handleFavoriteUserJoin(user, channelId);
        } catch (e) {
            console.error('[Cerberus] Error in onUserJoin interceptor:', e);
        }
        if (originalOnUserJoin) {
            originalOnUserJoin.apply(this, arguments);
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

let _notifyVariantCounter = 0;

function handleAutoRejectNotification(userKey, rejectReason) {
    const { ConfigManager, executeChatMacro, t, formatAllowedFts, showAutoRejectToast } = _deps();
    const now = Date.now();
    const state = (typeof window !== 'undefined' && window.CerberusState) ? window.CerberusState : (typeof window !== 'undefined' ? (window.CerberusState = {}) : {});
    if (!state.lastAutoRejectPerUser) state.lastAutoRejectPerUser = {};
    if (!state.lastToastPerUser) state.lastToastPerUser = {};

    // 1. Notificação Visual Local (Toast): sempre ativa, deduplicada (3s) para evitar trigger duplo entre Rede e DOM
    const lastToast = state.lastToastPerUser[userKey] || 0;
    if (now - lastToast >= 3000) {
        state.lastToastPerUser[userKey] = now;
        if (typeof showAutoRejectToast === 'function') {
            showAutoRejectToast(userKey, rejectReason);
        }
        const toastKeys = Object.keys(state.lastToastPerUser);
        if (toastKeys.length > 50) {
            for (const k of toastKeys) {
                if (now - state.lastToastPerUser[k] > 60000) delete state.lastToastPerUser[k];
            }
        }
    }

    // 2. Chat público: obrigatório para FT, opcional via toggle para os demais filtros
    const isFtReject = rejectReason === 'ft';
    const shouldNotify = isFtReject || (ConfigManager.getSetting('countryFilter.autoRejectNotify') !== false);
    if (!shouldNotify) return;

    // Trava de 5 minutos por jogador (300.000 ms)
    const lastUserNotice = state.lastAutoRejectPerUser[userKey] || 0;
    if (now - lastUserNotice < 300000) {
        return;
    }

    // Cooldown global de 30 segundos (30.000 ms)
    if (state.lastAutoRejectNotifyTime && (now - state.lastAutoRejectNotifyTime < 30000)) {
        return;
    }

    state.lastAutoRejectNotifyTime = now;
    state.lastAutoRejectPerUser[userKey] = now;

    // Limpeza periódica de memória da trava por jogador (> 10 minutos)
    const userKeys = Object.keys(state.lastAutoRejectPerUser);
    if (userKeys.length > 50) {
        for (const k of userKeys) {
            if (now - state.lastAutoRejectPerUser[k] > 600000) delete state.lastAutoRejectPerUser[k];
        }
    }

    // Rotação anti-spam de 3 variantes
    const variant = (_notifyVariantCounter++ % 3) + 1;
    const notifyMsg = isFtReject && typeof formatAllowedFts === 'function'
        ? t(`autoReject.notifyFtMsg${variant}`, { fts: formatAllowedFts(ConfigManager.getSetting('ftFilter')) })
        : t(`autoReject.notifyMsg${variant}`);

    setTimeout(() => executeChatMacro([notifyMsg]), 500);
}

function handleFavoriteUserJoin(user, channelId) {
    try {
        if (!user) return;
        const { CerberusData, ConfigManager, normalizeUsername, isSystemUser, getLocalUsername, showFavoritePlayerToast, playPopSound, playCustomSound } = _deps();
        const userKey = normalizeUsername(user.name || user.id || user.username);
        if (!userKey || isSystemUser(userKey)) return;

        // Não notificar se for o próprio usuário
        const localUser = getLocalUsername ? getLocalUsername() : '';
        if (localUser && userKey.toLowerCase() === localUser.toLowerCase()) return;

        // Checar se o usuário é favorito (reputação positiva)
        if (!CerberusData.isPositive(userKey)) return;

        const now = Date.now();
        const state = (typeof window !== 'undefined' && window.CerberusState) ? window.CerberusState : (typeof window !== 'undefined' ? (window.CerberusState = {}) : {});
        if (!state.lastFavoriteJoinPerUser) state.lastFavoriteJoinPerUser = {};

        // Cooldown de 2 minutos (120.000 ms) por jogador
        const lastJoin = state.lastFavoriteJoinPerUser[userKey] || 0;
        if (now - lastJoin < 120000) return;
        state.lastFavoriteJoinPerUser[userKey] = now;

        const favKeys = Object.keys(state.lastFavoriteJoinPerUser);
        if (favKeys.length > 50) {
            for (const k of favKeys) {
                if (now - state.lastFavoriteJoinPerUser[k] > 240000) delete state.lastFavoriteJoinPerUser[k];
            }
        }

        // Nome da sala amigável (se disponível)
        let channelName = channelId || '';
        try {
            const fcadeObj = window.CerberusFCADE;
            if (fcadeObj && fcadeObj.channels) {
                const chan = fcadeObj.channels.find(c => c.id === channelId || c.name === channelId);
                if (chan && chan.name) channelName = chan.name;
            }
        } catch (_) {}

        // 1. Toast Visual (se ativado nas configurações, padrão: true)
        const notifyToast = ConfigManager.getSetting('chatUserInfo.notifyFavoriteJoin') !== false;
        if (notifyToast && typeof showFavoritePlayerToast === 'function') {
            showFavoritePlayerToast(userKey, channelName);
        }

        // 2. Som (de acordo com a opção selecionada)
        const soundPref = ConfigManager.getSetting('chatUserInfo.favoriteJoinSound') || 'pop';
        if (soundPref === 'pop' && typeof playPopSound === 'function') {
            playPopSound();
        } else if (soundPref === 'custom20' && typeof playCustomSound === 'function') {
            playCustomSound('custom20', 0.8);
        } else if (soundPref === 'custom19' && typeof playCustomSound === 'function') {
            playCustomSound('custom19', 0.8);
        }
    } catch (e) {
        console.warn('[Cerberus] Error in handleFavoriteUserJoin:', e);
    }
}

module.exports = {
    setupChallengeInterceptor,
    evaluateChallengeFilters,
    handleAutoRejectNotification,
    handleFavoriteUserJoin
};
