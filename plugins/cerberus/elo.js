// cerberus/elo.js
// Mathematical engine for Elo calculation, position interpolation, FT simulation & match analysis

const ELO_RANGES = {
    'E': { min: 400, max: 699.99, mid: 550 },
    'D': { min: 700, max: 999.99, mid: 850 },
    'C': { min: 1000, max: 1299.99, mid: 1150 },
    'B': { min: 1300, max: 1599.99, mid: 1450 },
    'A': { min: 1600, max: 1899.99, mid: 1750 },
    'S': { min: 1900, max: 2400.00, mid: 2050 }
};

const RANK_IMG_MAP = {
    'rank1': 'E',
    'rank2': 'D',
    'rank3': 'C',
    'rank4': 'B',
    'rank5': 'A',
    'rank6': 'S'
};

const K_FACTOR = 32;

function parseRankLetter(raw) {
    if (!raw) return null;
    const str = String(raw).toUpperCase().trim();
    if (ELO_RANGES[str]) return str;
    for (const [key, letter] of Object.entries(RANK_IMG_MAP)) {
        if (str.toLowerCase().includes(key)) return letter;
    }
    const num = parseInt(str);
    if (!isNaN(num) && num >= 1 && num <= 6) {
        return RANK_IMG_MAP[`rank${num}`] || null;
    }
    return null;
}

function calculateExpectedScore(ra, rb) {
    return 1 / (1 + Math.pow(10, (rb - ra) / 400));
}

function calculateEloDelta(ra, rb, sa, k = K_FACTOR) {
    const ea = calculateExpectedScore(ra, rb);
    return Math.round(k * (sa - ea));
}

const MAX_MEMO_ENTRIES = 1500;
const _eloMemoCache = new Map();

function _setEloMemo(key, val) {
    if (_eloMemoCache.size >= MAX_MEMO_ENTRIES) {
        const oldestKey = _eloMemoCache.keys().next().value;
        if (oldestKey !== undefined) _eloMemoCache.delete(oldestKey);
    }
    _eloMemoCache.set(key, val);
}

const MAX_REC_MEMO_ENTRIES = 500;
const _recMemoCache = new Map();

function clearEloMemoCache() {
    _eloMemoCache.clear();
    _recMemoCache.clear();
}

function estimatePlayerElo(username, rankLetter, gameId, RankCache) {
    const normUser = username ? String(username).toLowerCase().trim() : '';
    const parsedLetter = parseRankLetter(rankLetter);
    const cachedLetter = (gameId && normUser && RankCache?.getPlayerRankLetter) ? RankCache.getPlayerRankLetter(gameId, normUser) : null;
    const letter = parsedLetter || cachedLetter || 'C';
    const cacheKey = `${gameId || ''}:${normUser}:${letter}`;

    if (_eloMemoCache.has(cacheKey)) {
        return _eloMemoCache.get(cacheKey);
    }

    const hasRankChanged = Boolean(parsedLetter && cachedLetter && parsedLetter !== cachedLetter);

    // Priority 1: Real Elo from Patreon API / RankCache (only valid if rank hasn't changed!)
    if (!hasRankChanged && gameId && normUser && RankCache && typeof RankCache.getRealElo === 'function') {
        const realElo = RankCache.getRealElo(gameId, normUser);
        if (typeof realElo === 'number' && realElo > 0) {
            const res = Math.round(realElo);
            _setEloMemo(cacheKey, res);
            return res;
        }
    }

    // Priority 2: Continuous Leaderboard Position Interpolation (only if rank hasn't changed!)
    const range = ELO_RANGES[letter] || ELO_RANGES['C'];

    if (hasRankChanged || !gameId || !RankCache || !RankCache.data || !RankCache.data[gameId]) {
        const res = Math.round(range.mid);
        _setEloMemo(cacheKey, res);
        return res;
    }

    const gameData = RankCache.data[gameId];
    const userRankNum = normUser ? RankCache.getRank(gameId, normUser) : null;
    if (!userRankNum) {
        const res = Math.round(range.mid);
        _setEloMemo(cacheKey, res);
        return res;
    }

    // Only interpolate position if cache has schemaVersion >= 2 and the rank was fully traversed (complete: true)
    if (gameData.schemaVersion === 2 && gameData.rankCoverage && gameData.rankCoverage[letter]) {
        const coverage = gameData.rankCoverage[letter];
        if (coverage.complete === true) {
            const minPos = coverage.firstPosition;
            const maxPos = coverage.lastPosition;
            if (typeof minPos === 'number' && typeof maxPos === 'number' && maxPos > minPos) {
                const ratio = Math.max(0, Math.min(1, (userRankNum - minPos) / (maxPos - minPos)));
                // Curva de distribuição piramidal competitiva (Quadrática p = 2.0):
                // A maioria dos jogadores acumula na base da faixa e apenas o topo se aproxima do teto
                const progress = 1 - ratio;
                const curvedProgress = Math.pow(progress, 2.0);
                const interpolated = range.min + (curvedProgress * (range.max - range.min));
                const res = Math.round(interpolated);
                _setEloMemo(cacheKey, res);
                return res;
            }
        }
    }

    // Partial ranks, legacy caches without schemaVersion 2, or single-player ranks fallback to mid
    const res = Math.round(range.mid);
    _setEloMemo(cacheKey, res);
    return res;
}

// Keep the numerical API for calculations; presentation also needs the source.
function getPlayerEloInfo(username, rankLetter, gameId, RankCache) {
    const normUser = username ? String(username).toLowerCase().trim() : '';
    const parsedLetter = parseRankLetter(rankLetter);
    const cachedLetter = (gameId && normUser && RankCache?.getPlayerRankLetter) ? RankCache.getPlayerRankLetter(gameId, normUser) : null;
    const hasRankChanged = Boolean(parsedLetter && cachedLetter && parsedLetter !== cachedLetter);

    if (!hasRankChanged) {
        const real = gameId && normUser && RankCache?.getRealElo?.(gameId, normUser);
        if (Number.isFinite(real) && real > 0) {
            const rounded = Math.round(real);
            return { elo: rounded, source: 'reported', minElo: rounded, maxElo: rounded };
        }
    }

    const letter = parsedLetter || cachedLetter || 'C';
    const userRankNum = (!hasRankChanged && gameId && normUser && RankCache?.getRank) ? RankCache.getRank(gameId, normUser) : null;
    const hasData = !!(normUser && (parsedLetter || cachedLetter || userRankNum));

    const range = ELO_RANGES[letter] || ELO_RANGES['C'];
    const minElo = Math.round(range.min);
    const maxElo = Math.round(range.max);

    if (!hasData) {
        return {
            elo: estimatePlayerElo(username, letter, gameId, RankCache),
            source: 'unavailable',
            minElo,
            maxElo
        };
    }

    const gameData = gameId && RankCache?.data?.[gameId];
    const isComplete = !hasRankChanged && !!(
        gameData &&
        gameData.schemaVersion === 2 &&
        gameData.rankCoverage &&
        letter &&
        gameData.rankCoverage[letter]?.complete === true &&
        typeof userRankNum === 'number'
    );

    return {
        elo: estimatePlayerElo(username, letter, gameId, RankCache),
        source: isComplete ? 'estimated' : 'partial',
        minElo,
        maxElo
    };
}

function _simulateSequence(startMy, startOpp, myWins, oppWins, winFirst, k = K_FACTOR) {
    let curMy = startMy;
    let curOpp = startOpp;
    let netDelta = 0;
    let remW = myWins;
    let remL = oppWins;

    while (remW > 0 || remL > 0) {
        if (winFirst) {
            if (remW > 0) {
                const delta = calculateEloDelta(curMy, curOpp, 1, k);
                netDelta += delta;
                curMy += delta;
                curOpp -= delta;
                remW--;
            }
            if (remL > 0) {
                const delta = calculateEloDelta(curMy, curOpp, 0, k);
                netDelta += delta;
                curMy += delta;
                curOpp -= delta;
                remL--;
            }
        } else {
            if (remL > 0) {
                const delta = calculateEloDelta(curMy, curOpp, 0, k);
                netDelta += delta;
                curMy += delta;
                curOpp -= delta;
                remL--;
            }
            if (remW > 0) {
                const delta = calculateEloDelta(curMy, curOpp, 1, k);
                netDelta += delta;
                curMy += delta;
                curOpp -= delta;
                remW--;
            }
        }
    }
    return netDelta;
}

function _simulateSymmetricDelta(myElo, oppElo, myWins, oppWins, k = K_FACTOR) {
    const d1 = _simulateSequence(myElo, oppElo, myWins, oppWins, true, k);
    const d2 = _simulateSequence(myElo, oppElo, myWins, oppWins, false, k);
    return Math.round((d1 + d2) / 2);
}

function simulateSet(myElo, oppElo, ftTarget, k = K_FACTOR) {
    const ft = parseInt(ftTarget, 10) || 5;
    const results = [];

    for (let myWins = 0; myWins <= ft; myWins++) {
        for (let oppWins = 0; oppWins <= ft; oppWins++) {
            if (myWins < ft && oppWins < ft) continue;
            if (myWins === ft && oppWins === ft) continue;

            const netDelta = _simulateSymmetricDelta(myElo, oppElo, myWins, oppWins, k);

            results.push({
                score: `${myWins}-${oppWins}`,
                myWins,
                oppWins,
                netDelta,
                isWin: myWins > oppWins
            });
        }
    }

    return results;
}

function getRecommendation(myElo, oppElo, ftTarget, customT) {
    const { t } = require('./utils.js');
    const tr = (typeof customT === 'function' ? customT : t);

    const ft = parseInt(ftTarget, 10) || 5;
    const myEloNum = Math.max(1, myElo || 1150);
    const oppEloNum = Math.max(1, oppElo || 1150);

    const lang = require('./config.js').ConfigManager?.getSetting?.('language') || 'en';
    const memoKey = `${myEloNum}:${oppEloNum}:${ft}:${lang}`;
    if (_recMemoCache.has(memoKey)) {
        return _recMemoCache.get(memoKey);
    }

    const diffPercent = Math.round(Math.abs(oppEloNum - myEloNum) / myEloNum * 100);

    let diffText = '';
    if (diffPercent <= 5 || myEloNum === oppEloNum) {
        diffText = tr ? tr('elo.diffEven') : '📊 Evenly matched score';
    } else if (oppEloNum < myEloNum) {
        if (diffPercent >= 35) {
            diffText = tr ? tr('elo.diffMuchLower') : '📊 Opponent score significantly lower';
        } else {
            diffText = tr ? tr('elo.diffBelow', { diff: diffPercent }) : `📊 Opponent has ${diffPercent}% less Elo`;
        }
    } else {
        if (diffPercent >= 35) {
            diffText = tr ? tr('elo.diffMuchHigher') : '📊 Opponent score significantly higher';
        } else {
            diffText = tr ? tr('elo.diffAbove', { diff: diffPercent }) : `📊 Opponent has ${diffPercent}% more Elo`;
        }
    }

    const simulation = simulateSet(myElo, oppElo, ft);
    const winningScenarios = simulation.filter(s => s.isWin);
    const profitableScenarios = simulation.filter(s => s.isWin && s.netDelta > 0);
    const profitableLosses = simulation.filter(s => !s.isWin && s.netDelta > 0);

    const worstProfitableWin = profitableScenarios.length > 0 ? profitableScenarios[profitableScenarios.length - 1] : null;
    const worstProfitableLoss = profitableLosses.length > 0 ? profitableLosses[0] : null;

    let type = 'balanced';
    let text = '';

    if (worstProfitableLoss) {
        type = 'high_reward';
        const lossScore = worstProfitableLoss.score.replace('-', 'x');
        const lossPts = Math.abs(worstProfitableLoss.netDelta);
        text = tr ? tr('elo.reqSingleWin', { score: lossScore, pts: lossPts }) : `🔥 Easy XP: even a loss (${lossScore}) earns ~${lossPts} pts`;
    } else if (profitableScenarios.length === 0) {
        type = 'unranked';
        text = tr ? tr('elo.reqNoPoints') : '🎮 Play for practice and have fun!';
    } else if (worstProfitableWin.score === `${ft}-0`) {
        type = 'high_risk';
        const cleanPts = Math.abs(worstProfitableWin.netDelta);
        const cleanScore = `${ft}x0`;
        text = tr ? tr('elo.reqCleanWin', { clean: cleanScore, pts: cleanPts }) : `🎯 Only a clean sweep (${cleanScore}) guarantees ~${cleanPts} pts`;
    } else if (worstProfitableWin.score === `${ft}-${ft - 1}`) {
        type = 'balanced';
        const winPts = Math.abs(worstProfitableWin.netDelta);
        const scoreStr = worstProfitableWin.score.replace('-', 'x');
        text = tr ? tr('elo.reqBalanced', { score: scoreStr, pts: winPts }) : `⚖️ Even a tight win (${scoreStr}) guarantees ~${winPts} pts`;
    } else {
        type = 'high_risk';
        const winPts = Math.abs(worstProfitableWin.netDelta);
        const scoreStr = worstProfitableWin.score.replace('-', 'x');
        text = tr ? tr('elo.reqModerateRisk', { score: scoreStr, pts: winPts }) : `⚡ Score ${scoreStr} or better guarantees ~${winPts} pts`;
    }

    const result = {
        type,
        text,
        diffText,
        diffPercent,
        winChance: Math.round(calculateExpectedScore(myElo, oppElo) * 100)
    };

    if (_recMemoCache.size >= MAX_REC_MEMO_ENTRIES) {
        const oldestKey = _recMemoCache.keys().next().value;
        if (oldestKey !== undefined) _recMemoCache.delete(oldestKey);
    }
    _recMemoCache.set(memoKey, result);
    return result;
}

function analyzeEndgame(p1Name, p1Elo, score1, p2Name, p2Elo, score2, ftTarget, k = K_FACTOR) {
    const ft = parseInt(ftTarget, 10) || 5;
    const s1 = parseInt(score1, 10) || 0;
    const s2 = parseInt(score2, 10) || 0;

    const isEarlyQuit = s1 < ft && s2 < ft;

    const delta1 = _simulateSymmetricDelta(p1Elo, p2Elo, s1, s2, k);
    const delta2 = -delta1;

    return {
        p1Name,
        p1Elo,
        delta1,
        finalP1: p1Elo + delta1,
        p2Name,
        p2Elo,
        delta2,
        finalP2: p2Elo + delta2,
        ftTarget: ft,
        score1: s1,
        score2: s2,
        isEarlyQuit,
        winner: s1 > s2 ? p1Name : (s2 > s1 ? p2Name : null),
        isP1Winner: s1 > s2,
        isP2Winner: s2 > s1
    };
}

function getLocalUserInfo(FCADE, activeGameId, RankCache) {
    let username = '';

    // Source 0: Streamer Nick manual setting (legacy fallback)
    try {
        const { ConfigManager } = require('./config.js');
        const customNick = ConfigManager.getSetting('liveQueue.streamerNick');
        if (customNick && customNick.trim()) {
            username = customNick.trim();
        }
    } catch (e) { }
    
    // Source 1: Local user resolution (FCADE / DOM / localStorage)
    if (!username) {
        const { getLocalUsername } = require('./utils.js');
        username = getLocalUsername(FCADE);
    }

    const normUser = username.toLowerCase().trim();
    let rankLetter = null;
    let isExplicitlyUnranked = false;

    // 1. Check FCADE globalUsers strictly for activeGameId (Live socket data first)
    if (normUser && FCADE?.globalUsers) {
        const userObj = FCADE.globalUsers[normUser] || FCADE.globalUsers[username];
        if (userObj) {
            let r = null;
            if (activeGameId && userObj.channelRank && typeof userObj.channelRank === 'object' && activeGameId in userObj.channelRank) {
                r = userObj.channelRank[activeGameId];
            }
            if (r === null && activeGameId && userObj.game && (userObj.game.id === activeGameId || userObj.game.gameid === activeGameId) && userObj.game.rank !== undefined) {
                r = userObj.game.rank;
            }
            if (r !== null && r !== undefined) {
                if (r === 0 || r === '0') {
                    isExplicitlyUnranked = true;
                } else {
                    const parsed = parseRankLetter(r);
                    if (parsed) rankLetter = parsed;
                }
            }
        }
    }

    // 2. Check DOM sidebar for local user's own item in the active channel (Live DOM)
    if (!rankLetter && !isExplicitlyUnranked && normUser && typeof document !== 'undefined') {
        const { getActiveChannelWrapper, getActiveGameId: getGameId } = require('./utils.js');
        const cw = (typeof getActiveChannelWrapper === 'function' ? getActiveChannelWrapper() : null);
        const scope = cw || document;
        const userItems = scope.querySelectorAll('.userItem');
        for (const item of userItems) {
            const pName = item.querySelector('.playerName')?.textContent?.trim()?.toLowerCase();
            if (pName === normUser) {
                const itemCw = item.closest('.channelWrapper');
                const itemGameId = (typeof getGameId === 'function') ? getGameId(FCADE, itemCw) : activeGameId;
                if (!itemGameId || itemGameId === activeGameId) {
                    const rImg = item.querySelector('.rankWrapper img, .rank img');
                    if (rImg) {
                        const m = (rImg.src || rImg.getAttribute('src') || '').match(/rank(\d+)\.png/);
                        if (m) {
                            if (m[1] === '0') {
                                isExplicitlyUnranked = true;
                            } else if (RANK_IMG_MAP[`rank${m[1]}`]) {
                                rankLetter = RANK_IMG_MAP[`rank${m[1]}`];
                            }
                        }
                    }
                }
                break;
            }
        }
    }

    // 3. Fallback to RankCache ONLY if not explicitly unranked and offline/unloaded in live data
    if (!rankLetter && !isExplicitlyUnranked && activeGameId && normUser && RankCache?.getPlayerRankLetter) {
        const cached = RankCache.getPlayerRankLetter(activeGameId, normUser);
        if (cached) rankLetter = cached;
    }

    if (!rankLetter || isExplicitlyUnranked) {
        return {
            username: normUser || 'player',
            rankLetter: null,
            elo: null,
            source: 'unavailable',
            minElo: null,
            maxElo: null,
            isUnranked: true
        };
    }

    const info = getPlayerEloInfo(normUser, rankLetter, activeGameId, RankCache);

    return {
        username: normUser || 'player',
        rankLetter: rankLetter,
        elo: info.elo,
        source: info.source,
        minElo: info.minElo,
        maxElo: info.maxElo,
        isUnranked: false
    };
}

function getPlayerRankLetter(username, FCADE, activeGameId, RankCache) {
    if (!username) return null;
    const { normalizeUsername } = require('./utils.js');
    const norm = normalizeUsername(username).toLowerCase();
    let isExplicitlyUnranked = false;

    // 1. Check FCADE.globalUsers (strictly for activeGameId) - Live socket data first
    if (FCADE?.globalUsers) {
        const u = FCADE.globalUsers[norm] || FCADE.globalUsers[username];
        if (u) {
            let r = null;
            if (activeGameId && u.channelRank && typeof u.channelRank === 'object' && activeGameId in u.channelRank) {
                r = u.channelRank[activeGameId];
            }
            if (r === null && activeGameId && u.game && (u.game.id === activeGameId || u.game.gameid === activeGameId) && u.game.rank !== undefined) {
                r = u.game.rank;
            }
            if (r !== null && r !== undefined) {
                if (r === 0 || r === '0') return null; // Explicitly unranked live
                const parsed = parseRankLetter(r);
                if (parsed) return parsed;
            }
        }
    }

    // 2. Check DOM sidebar in the active channel - Live DOM
    if (typeof document !== 'undefined') {
        const { getActiveChannelWrapper, getActiveGameId: getGameId } = require('./utils.js');
        const cw = (typeof getActiveChannelWrapper === 'function' ? getActiveChannelWrapper() : null);
        const scope = cw || document;
        const userItems = scope.querySelectorAll('.userItem');
        for (const item of userItems) {
            const pName = normalizeUsername(item.querySelector('.playerName')?.textContent || '').toLowerCase();
            if (pName === norm) {
                const itemCw = item.closest('.channelWrapper');
                const itemGameId = (typeof getGameId === 'function') ? getGameId(FCADE, itemCw) : activeGameId;
                if (!itemGameId || itemGameId === activeGameId) {
                    const rImg = item.querySelector('.rankWrapper img, .rank img');
                    if (rImg) {
                        const m = (rImg.src || rImg.getAttribute('src') || '').match(/rank(\d+)\.png/);
                        if (m) {
                            if (m[1] === '0') return null; // Explicitly unranked live
                            if (RANK_IMG_MAP[`rank${m[1]}`]) {
                                return RANK_IMG_MAP[`rank${m[1]}`];
                            }
                        }
                    }
                }
                break;
            }
        }
    }

    // 3. Fallback to RankCache ONLY if not explicitly unranked and user has no live data
    if (!isExplicitlyUnranked && activeGameId && RankCache?.getPlayerRankLetter) {
        const cachedLetter = RankCache.getPlayerRankLetter(activeGameId, norm);
        if (cachedLetter) return cachedLetter;
    }

    return null;
}

function getRankAverageElo(letter) {
    const l = (letter || 'C').toUpperCase();
    return ELO_RANGES[l]?.mid ? Math.round(ELO_RANGES[l].mid) : 1150;
}

function getRankFromElo(elo) {
    const val = Number(elo) || 1150;
    for (const [letter, range] of Object.entries(ELO_RANGES)) {
        if (val >= range.min && val <= range.max) return letter;
    }
    if (val < 400) return 'E';
    if (val > 2400) return 'S';
    return 'C';
}

const NEXT_RANK_MAP = {
    'E': 'D',
    'D': 'C',
    'C': 'B',
    'B': 'A',
    'A': 'S',
    'S': null
};

function getNextRankRequirement(currentRankLetter, currentElo, gameId, RankCache) {
    const letter = parseRankLetter(currentRankLetter);
    if (!letter) return null;
    if (letter === 'S') {
        return { isMaxRank: true, nextRank: null, isSynced: true };
    }
    const nextRank = NEXT_RANK_MAP[letter];
    if (!nextRank || !ELO_RANGES[nextRank]) return null;

    const gameData = gameId && RankCache?.data?.[gameId];
    const isSynced = Boolean(gameData?.rankCoverage && gameData.rankCoverage[nextRank]);
    if (!isSynced) {
        return { isMaxRank: false, isSynced: false, nextRank };
    }

    const targetMinElo = Math.round(ELO_RANGES[nextRank].min);
    const elo = Number(currentElo) || 0;
    const ptsNeeded = Math.max(1, Math.round(targetMinElo - elo));

    return {
        isMaxRank: false,
        isSynced: true,
        nextRank,
        targetMinElo,
        ptsNeeded
    };
}

module.exports = {
    ELO_RANGES,
    RANK_IMG_MAP,
    NEXT_RANK_MAP,
    K_FACTOR,
    clearEloMemoCache,
    parseRankLetter,
    calculateExpectedScore,
    calculateEloDelta,
    estimatePlayerElo,
    getPlayerEloInfo,
    getLocalUserInfo,
    getPlayerRankLetter,
    simulateSet,
    getRecommendation,
    analyzeEndgame,
    getRankAverageElo,
    getRankFromElo,
    getNextRankRequirement
};
