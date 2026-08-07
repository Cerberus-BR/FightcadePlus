// cerberus/api.js

const fs = require('fs');
const path = require('path');
const { atomicWriteJSON, safeLoadJSON } = require('./state.js');

const rankingsPath = path.join(__dirname, '..', 'cerberus_rankings.json');

function getPlayerRankNumber(p, gameId) {
    if (!p) return null;
    
    // 1. Direct property on p
    if (typeof p.rank === 'number') return p.rank;
    
    // 2. Nested inside p.gameinfo[gameId].rank (Fightcade API Structure)
    if (p.gameinfo) {
        if (gameId && p.gameinfo[gameId] && typeof p.gameinfo[gameId].rank === 'number') {
            return p.gameinfo[gameId].rank;
        }
        for (const gId in p.gameinfo) {
            if (p.gameinfo[gId] && typeof p.gameinfo[gId].rank === 'number') {
                return p.gameinfo[gId].rank;
            }
        }
    }

    // 3. String property fallback
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

    return null;
}

function isRankAllowed(p, syncTarget, gameId) {
    if (!p || !syncTarget) return true;
    const num = getPlayerRankNumber(p, gameId);
    if (num === null || num === undefined) return true;

    // Fightcade API Rank Scale: 6=Rank S, 5=Rank A, 4=Rank B, 3=Rank C, 2=Rank D, 1=Rank E
    if (syncTarget === 'rankA' && num <= 4) return false; // Stop at Rank B (4) or lower
    if (syncTarget === 'rankB' && num <= 3) return false; // Stop at Rank C (3) or lower
    if (syncTarget === 'rankC' && num <= 2) return false; // Stop at Rank D (2) or lower

    return true;
}

const RankCache = {
    data: {}, isSyncing: false, _abortController: null, _autoSyncDate: null,

    load() { this.data = safeLoadJSON(rankingsPath, null) || {}; },
    save() { atomicWriteJSON(rankingsPath, this.data).catch(() => { }); },
    cancelSync() { if (this._abortController) this._abortController.abort(); },
    clearRankings() { this.data = {}; this.save(); },

    _evictOldEntries(maxGames = 5) {
        const entries = Object.entries(this.data); if (entries.length <= maxGames) return;
        entries.sort((a, b) => (b[1].lastUpdate || 0) - (a[1].lastUpdate || 0));
        entries.slice(maxGames).forEach(entry => delete this.data[entry[0]]);
    },

    getRank(gameId, username) {
        if (!gameId || !username || !this.data[gameId]) return null;
        return this.data[gameId].players[username.toLowerCase()] || null;
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
        const rawLimitSetting = String(ConfigManager.getSetting('rankings.limit') || '500');
        let targetLimit = 500;
        let syncRankCutoff = null;
        let progressLabel = '500';

        if (rawLimitSetting === 'rankA') {
            targetLimit = 9999; syncRankCutoff = 'rankA'; progressLabel = 'Rank A+';
        } else if (rawLimitSetting === 'rankB') {
            targetLimit = 9999; syncRankCutoff = 'rankB'; progressLabel = 'Rank B+';
        } else if (rawLimitSetting === 'rankC') {
            targetLimit = 9999; syncRankCutoff = 'rankC'; progressLabel = 'Rank C+';
        } else {
            targetLimit = parseInt(rawLimitSetting) || 500;
            progressLabel = String(targetLimit);
        }

        const targetCountry = (ConfigManager.getSetting('rankings.country') || '').toUpperCase().trim();

        const cw = getActiveChannelWrapper();
        const btn = cw ? cw.querySelector('.cerb-sync-btn') : null;
        if (btn) {
            btn.classList.add('syncing');
            btn.innerHTML = '<span class="cerb-spin-icon"></span><span class="cerb-sync-progress">0/' + progressLabel + '</span>';
            btn.title = t('sync.clickCancel');
        }
        let offset = 0; let validPlayersFound = 0; let pagesFetched = 0; const maxPagesSafeguard = 50; const newCache = {};
        let consecutiveEmptyPages = 0;
        let rankCutoffReached = false;

        while (validPlayersFound < targetLimit && !rankCutoffReached) {
            try {
                if (signal.aborted || getActiveGameId(window.CerberusFCADE) !== initialGameId || pagesFetched >= maxPagesSafeguard) break;

                let res = await fetch('https://web.fightcade.com/api/', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    signal,
                    body: JSON.stringify({ req: "searchrankings", gameid: initialGameId, limit: 100, offset: offset, byElo: true, recent: true })
                });

                // [CERBERUS] Graceful HTTP 429 Rate-Limit Handling (10s cooldown retry)
                if (res.status === 429) {
                    await new Promise(resolve => { const timeout = setTimeout(resolve, 10000); signal.addEventListener('abort', () => { clearTimeout(timeout); resolve(); }, { once: true }); });
                    if (signal.aborted) break;
                    res = await fetch('https://web.fightcade.com/api/', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        signal,
                        body: JSON.stringify({ req: "searchrankings", gameid: initialGameId, limit: 100, offset: offset, byElo: true, recent: true })
                    });
                }

                if (!res.ok) break;
                const players = (await res.json())?.results?.results || [];
                if (players.length === 0) break;
                pagesFetched++;

                let addedThisPage = 0;
                for (const p of players) {
                    if (validPlayersFound >= targetLimit || !p.name) break;

                    // Sync Limit Cutoff: stop when player rank falls outside target rank threshold
                    if (syncRankCutoff && !isRankAllowed(p, syncRankCutoff, initialGameId)) {
                        rankCutoffReached = true;
                        break;
                    }

                    if (targetCountry === '' || (p.country?.iso_code?.toUpperCase() === targetCountry)) {
                        validPlayersFound++;
                        newCache[p.name.toLowerCase()] = validPlayersFound;
                        addedThisPage++;
                    }
                }

                if (addedThisPage === 0) {
                    consecutiveEmptyPages++;
                } else {
                    consecutiveEmptyPages = 0;
                }

                if (consecutiveEmptyPages >= 3 || rankCutoffReached) break;
                if (players.length < 100 || validPlayersFound >= targetLimit) break;
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
            } catch (e) { break; }
        }

        // [CERBERUS] Direct Overwrite: Every new sync completely replaces previous cached data for this game
        if (Object.keys(newCache).length > 0) {
            this.data[initialGameId] = {
                lastUpdate: Date.now(),
                players: newCache,
                filter: { country: targetCountry, limit: targetLimit }
            };
            this._evictOldEntries();
            this.save();
        }

        this.isSyncing = false; this._abortController = null;
        if (btn) { btn.classList.remove('syncing'); btn.innerHTML = '🔄'; setSyncBtnState(btn, Date.now() - (this.data[initialGameId]?.lastUpdate || 0) < cooldownMs); }
        if (window.CerberusFCADE && ConfigManager.getRuntimeConfig()) {
            const cw = getActiveChannelWrapper();
            if (cw) {
                fullChatScanScoped(cw, window.CerberusFCADE, ConfigManager.getRuntimeConfig());
                updateSidebarScope(cw.querySelector('.usersListWrapper'), window.CerberusFCADE, ConfigManager.getRuntimeConfig());
            }
        }
    }
};

module.exports = { RankCache };