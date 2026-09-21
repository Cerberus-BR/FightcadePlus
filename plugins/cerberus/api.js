// cerberus/api.js

const fs = require('fs');
const path = require('path');
const { atomicWriteJSON, safeLoadJSON } = require('./state.js');

const rankingsPath = path.join(__dirname, '..', 'cerberus_rankings.json');

function getPlayerRankNumber(p, gameId) {
    if (!p) return null;
    
    // 0. Channel Rank for specified gameId (Fightcade client in-memory structure)
    if (gameId && p.channelRank && typeof p.channelRank === 'object' && typeof p.channelRank[gameId] === 'number') {
        return p.channelRank[gameId];
    }

    // 1. Nested inside p.gameinfo[gameId].rank for specified gameId (REST API structure)
    if (gameId && p.gameinfo && p.gameinfo[gameId] && typeof p.gameinfo[gameId].rank === 'number') {
        return p.gameinfo[gameId].rank;
    }

    // 2. Direct property on p.game for matching gameId
    if (gameId && p.game && (p.game.id === gameId || p.game.gameid === gameId) && typeof p.game.rank === 'number') {
        return p.game.rank;
    }

    // 3. Fallbacks ONLY when no specific gameId was requested
    if (!gameId) {
        if (typeof p.rank === 'number') return p.rank;
        if (p.channelRank && typeof p.channelRank === 'object') {
            for (const ch in p.channelRank) {
                if (typeof p.channelRank[ch] === 'number') return p.channelRank[ch];
            }
        }
        if (p.gameinfo) {
            for (const gId in p.gameinfo) {
                if (p.gameinfo[gId] && typeof p.gameinfo[gId].rank === 'number') {
                    return p.gameinfo[gId].rank;
                }
            }
        }
        const r = p.rank_letter || p.rank_name || p.tier || p.title || p.rank;
        if (r !== null && r !== undefined) {
            const rStr = String(r).toUpperCase().trim();
            if (rStr.includes('RANK S') || rStr === 'S') return 6;
            if (rStr.includes('RANK A') || rStr === 'A') return 5;
            if (rStr.includes('RANK B') || rStr === 'B') return 4;
            if (rStr.includes('RANK C') || rStr === 'C') return 3;
            if (rStr.includes('RANK D') || rStr === 'D') return 2;
            if (rStr.includes('RANK E') || rStr === 'E') return 1;
            const num = parseInt(rStr);
            if (!isNaN(num)) return num;
        }
    }

    return null;
}

function isRankAllowed(p, syncTarget, gameId) {
    if (!p || !syncTarget) return true;
    let num = getPlayerRankNumber(p, gameId);
    if (num === null || num === undefined) {
        if (typeof p.rank === 'number') num = p.rank;
        else if (typeof p.game?.rank === 'number') num = p.game.rank;
    }
    if (num === null || num === undefined) return true;

    // Fightcade API Rank Scale: 6=Rank S, 5=Rank A, 4=Rank B, 3=Rank C, 2=Rank D, 1=Rank E
    if (syncTarget === 'rankA' && num <= 4) return false; // Stop at Rank B (4) or lower
    if (syncTarget === 'rankB' && num <= 3) return false; // Stop at Rank C (3) or lower
    if (syncTarget === 'rankC' && num <= 2) return false; // Stop at Rank D (2) or lower

    return true;
}

let _rankSaveTimeout = null;

const RankCache = {
    data: {}, isSyncing: false, _abortController: null, _autoSyncDate: null,

    load() { this.data = safeLoadJSON(rankingsPath, null) || {}; },
    save() {
        clearTimeout(_rankSaveTimeout);
        _rankSaveTimeout = setTimeout(() => {
            atomicWriteJSON(rankingsPath, this.data).catch(() => { });
        }, 500);
    },
    clearRankings() {
        clearTimeout(_rankSaveTimeout);
        this.data = {};
        atomicWriteJSON(rankingsPath, this.data).catch(() => { });
        const { clearEloMemoCache } = require('./elo.js');
        if (typeof clearEloMemoCache === 'function') clearEloMemoCache();
    },
    cancelSync() {
        if (this._abortController) this._abortController.abort();
        this.isSyncing = false;
        const { getActiveChannelWrapper } = require('./utils.js');
        const { setSyncBtnState } = require('./ui.js');
        const cw = getActiveChannelWrapper();
        const btn = cw ? cw.querySelector('.cerb-sync-btn') : document.querySelector('.cerb-sync-btn');
        if (btn) {
            btn.classList.remove('syncing');
            btn.innerHTML = '🔄';
            setSyncBtnState(btn, false);
        }
    },

    _evictOldEntries(maxGames = 5) {
        const entries = Object.entries(this.data); if (entries.length <= maxGames) return;
        entries.sort((a, b) => (b[1].lastUpdate || 0) - (a[1].lastUpdate || 0));
        entries.slice(maxGames).forEach(entry => delete this.data[entry[0]]);
    },

    getRank(gameId, username) {
        if (!gameId || !username || !this.data[gameId]) return null;
        return this.data[gameId].players[username.toLowerCase()] || null;
    },

    getRealElo(gameId, username) {
        if (!gameId || !username || !this.data[gameId]) return null;
        return this.data[gameId].playerElos?.[username.toLowerCase()] || null;
    },

    getPlayerRankLetter(gameId, username) {
        if (!gameId || !username || !this.data[gameId]) return null;
        return this.data[gameId].playerRanks?.[username.toLowerCase()] || null;
    },

    async syncRankings(gameId) {
        const { ConfigManager } = require('./config.js');
        const { t, getActiveGameId, getActiveChannelWrapper } = require('./utils.js');
        const { setSyncBtnState } = require('./ui.js');
        const { fullChatScanScoped, updateSidebarScope } = require('./chat.js');

        if (!gameId) return;
        const lastSync = this.data[gameId]?.lastUpdate || 0; const cooldownMs = 30 * 60 * 1000;
        if (Date.now() - lastSync < cooldownMs || this.isSyncing) return;
        this.isSyncing = true; this._abortController = new AbortController(); const signal = this._abortController.signal;

        const initialGameId = gameId;
        const rawLimitSetting = String(ConfigManager.getSetting('rankings.limit') || '900');
        let targetLimit = 900;
        let syncRankCutoff = null;
        let progressLabel = '900';

        if (rawLimitSetting === 'rankA') {
            targetLimit = 9999; syncRankCutoff = 'rankA'; progressLabel = 'Rank A+';
        } else if (rawLimitSetting === 'rankB') {
            targetLimit = 9999; syncRankCutoff = 'rankB'; progressLabel = 'Rank B+';
        } else if (rawLimitSetting === 'rankC') {
            targetLimit = 9999; syncRankCutoff = 'rankC'; progressLabel = 'Rank C+';
        } else {
            targetLimit = parseInt(rawLimitSetting) || 900;
            progressLabel = String(targetLimit);
        }

        const cw = getActiveChannelWrapper();
        const btn = cw ? cw.querySelector('.cerb-sync-btn') : document.querySelector('.cerb-sync-btn');
        if (btn) {
            btn.classList.add('syncing');
            btn.innerHTML = '<span class="cerb-spin-icon"></span><span class="cerb-sync-progress">0/' + progressLabel + '</span>';
            btn.title = t ? t('sync.clickCancel') : 'Clique para cancelar';
        }

        const RANK_ORDER = { 'S': 6, 'A': 5, 'B': 4, 'C': 3, 'D': 2, 'E': 1 };
        let offset = 0; let validPlayersFound = 0; let pagesFetched = 0; const maxPagesSafeguard = Math.max(50, Math.ceil(targetLimit / 100) + 10); const newCache = {};
        const playerRanks = {};
        const playerElos = {};
        const rankBounds = {};
        const rankCoverage = {};
        let currentRankLetter = null;
        let currentRankWeight = null;
        let stopReason = 'natural_end';
        let consecutiveEmptyPages = 0;
        let rankCutoffReached = false;
        let syncCompleted = false;
        const { parseRankLetter, clearEloMemoCache } = require('./elo.js');

        while (validPlayersFound < targetLimit && !rankCutoffReached) {
            try {
                if (signal.aborted) { stopReason = 'aborted'; break; }
                if (getActiveGameId(window.CerberusFCADE) !== initialGameId) { stopReason = 'channel_changed'; break; }
                if (pagesFetched >= maxPagesSafeguard) { stopReason = 'max_pages'; break; }

                let res = await fetch('https://web.fightcade.com/api/', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    signal,
                    body: JSON.stringify({ req: "searchrankings", gameid: initialGameId, limit: 100, offset: offset, byElo: true, recent: true })
                });

                // [CERBERUS] Graceful HTTP 429 Rate-Limit Handling (10s cooldown retry)
                if (res.status === 429) {
                    await new Promise(resolve => { const timeout = setTimeout(resolve, 10000); signal.addEventListener('abort', () => { clearTimeout(timeout); resolve(); }, { once: true }); });
                    if (signal.aborted) { stopReason = 'aborted'; break; }
                    res = await fetch('https://web.fightcade.com/api/', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        signal,
                        body: JSON.stringify({ req: "searchrankings", gameid: initialGameId, limit: 100, offset: offset, byElo: true, recent: true })
                    });
                }

                if (!res.ok) { stopReason = 'http_error'; break; }
                const players = (await res.json())?.results?.results || [];
                if (players.length === 0) {
                    syncCompleted = true;
                    stopReason = 'natural_end';
                    break;
                }
                pagesFetched++;

                let addedThisPage = 0;
                for (const p of players) {
                    if (validPlayersFound >= targetLimit || !p.name) break;

                    const playerRankNum = getPlayerRankNumber(p, initialGameId);
                    const rLetter = parseRankLetter(playerRankNum || p.game?.rank || p.rank);

                    // Sync Limit Cutoff: stop when player rank falls outside target rank threshold
                    if (syncRankCutoff && !isRankAllowed(p, syncRankCutoff, initialGameId)) {
                        rankCutoffReached = true;
                        stopReason = 'rank_cutoff';
                        if (currentRankLetter && rankCoverage[currentRankLetter] && !rankCoverage[currentRankLetter].hasAnomaly && rankCoverage[currentRankLetter].stopReason !== 'order_anomaly') {
                            rankCoverage[currentRankLetter].complete = true;
                        }
                        break;
                    }

                    validPlayersFound++;
                    const pName = p.name.toLowerCase();
                    newCache[pName] = validPlayersFound;

                    // Capture real raw Elo if returned by Patreon/API
                    const rawElo = p.game?.elo || p.elo || p.points || p.rating || (p.gameinfo && p.gameinfo[initialGameId] && p.gameinfo[initialGameId].elo) || null;
                    if (typeof rawElo === 'number' && rawElo > 0) {
                        playerElos[pName] = Math.round(rawElo);
                    }
                    
                    if (rLetter) {
                        playerRanks[pName] = rLetter;
                        const weight = RANK_ORDER[rLetter] || 0;

                        if (currentRankLetter === null) {
                            currentRankLetter = rLetter;
                            currentRankWeight = weight;
                            rankCoverage[rLetter] = {
                                firstPosition: validPlayersFound,
                                lastPosition: validPlayersFound,
                                firstPlayer: pName,
                                lastPlayer: pName,
                                complete: false,
                                stopReason: null
                            };
                        } else if (currentRankLetter === rLetter) {
                            rankCoverage[rLetter].lastPosition = validPlayersFound;
                            rankCoverage[rLetter].lastPlayer = pName;
                        } else if (weight < currentRankWeight) {
                            // Downward rank transition confirmed
                            if (rankCoverage[currentRankLetter] && rankCoverage[currentRankLetter].stopReason !== 'order_anomaly' && !rankCoverage[currentRankLetter].hasAnomaly) {
                                rankCoverage[currentRankLetter].complete = true;
                            }
                            currentRankLetter = rLetter;
                            currentRankWeight = weight;
                            if (!rankCoverage[rLetter]) {
                                rankCoverage[rLetter] = {
                                    firstPosition: validPlayersFound,
                                    lastPosition: validPlayersFound,
                                    firstPlayer: pName,
                                    lastPlayer: pName,
                                    complete: false,
                                    stopReason: null
                                };
                            } else {
                                rankCoverage[rLetter].lastPosition = validPlayersFound;
                                rankCoverage[rLetter].lastPlayer = pName;
                            }
                        } else {
                            // Order anomaly: rank climbed upwards
                            if (rankCoverage[currentRankLetter]) {
                                rankCoverage[currentRankLetter].complete = false;
                                rankCoverage[currentRankLetter].stopReason = 'order_anomaly';
                                rankCoverage[currentRankLetter].hasAnomaly = true;
                            }
                            currentRankLetter = rLetter;
                            currentRankWeight = weight;
                            if (!rankCoverage[rLetter]) {
                                rankCoverage[rLetter] = {
                                    firstPosition: validPlayersFound,
                                    lastPosition: validPlayersFound,
                                    firstPlayer: pName,
                                    lastPlayer: pName,
                                    complete: false,
                                    stopReason: 'order_anomaly',
                                    hasAnomaly: true
                                };
                            } else {
                                rankCoverage[rLetter].complete = false;
                                rankCoverage[rLetter].stopReason = 'order_anomaly';
                                rankCoverage[rLetter].hasAnomaly = true;
                            }
                        }

                        if (!rankBounds[rLetter]) rankBounds[rLetter] = { minPos: validPlayersFound, maxPos: validPlayersFound };
                        else rankBounds[rLetter].maxPos = validPlayersFound;
                    }
                    
                    addedThisPage++;
                }

                if (validPlayersFound >= targetLimit || rankCutoffReached) {
                    if (validPlayersFound >= targetLimit && !rankCutoffReached) {
                        stopReason = 'limit_reached';
                    }
                    syncCompleted = true;
                    break;
                }

                if (addedThisPage === 0) {
                    consecutiveEmptyPages++;
                } else {
                    consecutiveEmptyPages = 0;
                }

                if (consecutiveEmptyPages >= 3 || players.length < 100) {
                    syncCompleted = true;
                    stopReason = 'natural_end';
                    break;
                }
                offset += 100;

                if (btn) { const p = btn.querySelector('.cerb-sync-progress'); if (p) p.textContent = validPlayersFound + '/' + progressLabel; }

                // [CERBERUS] Adaptive Cloudflare Backoff (>900 users)
                // Offset < 900 (pages 1-9): Fast 2000ms delay
                // Offset >= 900 (pages 10+): +1000ms every 15 pages (up to 6000ms max)
                let delayMs = 2000;
                if (offset >= 900 && pagesFetched >= 9) {
                    const extraCycles = Math.floor((pagesFetched - 9) / 15);
                    delayMs = Math.min(2000 + (extraCycles + 1) * 1000, 6000);
                }

                await new Promise(resolve => { const timeout = setTimeout(resolve, delayMs); signal.addEventListener('abort', () => { clearTimeout(timeout); resolve(); }, { once: true }); });
            } catch (e) {
                stopReason = 'error';
                break;
            }
        }

        if (stopReason === 'natural_end') {
            if (currentRankLetter && rankCoverage[currentRankLetter] && !rankCoverage[currentRankLetter].hasAnomaly && rankCoverage[currentRankLetter].stopReason !== 'order_anomaly') {
                rankCoverage[currentRankLetter].complete = true;
            }
        } else if (stopReason !== 'rank_cutoff') {
            if (currentRankLetter && rankCoverage[currentRankLetter] && !rankCoverage[currentRankLetter].complete) {
                rankCoverage[currentRankLetter].complete = false;
                rankCoverage[currentRankLetter].stopReason = stopReason;
            }
        }

        const previousData = this.data[initialGameId];
        const isFreshOrBetter = syncCompleted || !previousData || !previousData.totalPlayers || validPlayersFound >= previousData.totalPlayers;

        // [CERBERUS] Safe Overwrite: only replace if sync completed or provided a better/complete dataset
        if (Object.keys(newCache).length > 0 && isFreshOrBetter) {
            // [CERBERUS] Preserve confirmed rank boundaries from previous complete syncs
            // When a rank tier was previously completed (complete === true), its confirmed
            // lastPosition boundary is retained as a mathematical reference for Elo calculations
            // until replaced by another complete sync of that rank.
            // Player records (newCache) are always cleanly renewed with the fresh batch.
            if (previousData?.rankCoverage) {
                for (const letter of ['S', 'A', 'B', 'C', 'D', 'E']) {
                    const prevCov = previousData.rankCoverage[letter];
                    const newCov = rankCoverage[letter];
                    if (prevCov && prevCov.complete === true && typeof prevCov.lastPosition === 'number') {
                        if (!newCov) {
                            rankCoverage[letter] = {
                                firstPosition: prevCov.firstPosition,
                                lastPosition: prevCov.lastPosition,
                                complete: false,
                                preservedBoundary: true,
                                historicalLastPosition: prevCov.lastPosition
                            };
                            if (!rankBounds[letter] && previousData.rankBounds?.[letter]) {
                                rankBounds[letter] = { ...previousData.rankBounds[letter] };
                            }
                        } else if (newCov.complete !== true && newCov.stopReason !== 'order_anomaly' && !newCov.hasAnomaly) {
                            newCov.historicalLastPosition = prevCov.lastPosition;
                            newCov.preservedBoundary = true;
                            // Keep complete as false so partial rank remains incomplete
                            if (rankBounds[letter]) {
                                rankBounds[letter].historicalMaxPos = prevCov.lastPosition;
                            }
                        }
                    }
                }
            }

            this.data[initialGameId] = {
                schemaVersion: 2,
                lastUpdate: Date.now(),
                players: newCache,
                playerRanks: playerRanks,
                playerElos: playerElos,
                rankCoverage: rankCoverage,
                rankBounds: rankBounds,
                totalPlayers: validPlayersFound,
                filter: { limit: targetLimit }
            };
            this._evictOldEntries();
            this.save();
            if (typeof clearEloMemoCache === 'function') clearEloMemoCache();
        }

        this.isSyncing = false; this._abortController = null;
        if (btn) {
            btn.classList.remove('syncing');
            btn.innerHTML = '🔄';
            setSyncBtnState(btn, syncCompleted && (Date.now() - (this.data[initialGameId]?.lastUpdate || 0) < cooldownMs));
        }
        if (window.CerberusFCADE && ConfigManager.getRuntimeConfig()) {
            const cw = getActiveChannelWrapper();
            if (cw) {
                fullChatScanScoped(cw, window.CerberusFCADE, ConfigManager.getRuntimeConfig());
                updateSidebarScope(cw.querySelector('.usersListWrapper'), window.CerberusFCADE, ConfigManager.getRuntimeConfig());
            }
        }
    }
};

module.exports = { RankCache, getPlayerRankNumber };