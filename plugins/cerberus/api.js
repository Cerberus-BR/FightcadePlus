// cerberus/api.js

const fs = require('fs');
const path = require('path');
const { atomicWriteJSON, safeLoadJSON } = require('./state.js');

const rankingsPath = path.join(__dirname, '..', 'cerberus_rankings.json');

const RankCache = {
    data: {}, isSyncing: false, _abortController: null, _autoSyncDate: null,
    
    load() { this.data = safeLoadJSON(rankingsPath, null) || {}; },
    save() { atomicWriteJSON(rankingsPath, this.data).catch(() => { }); },
    cancelSync() { if (this._abortController) this._abortController.abort(); },
    
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

        const initialGameId = gameId; const targetLimit = ConfigManager.getSetting('rankings.limit') || 100;
        const targetCountry = (ConfigManager.getSetting('rankings.country') || '').toUpperCase().trim();

        const cw = getActiveChannelWrapper();
        const btn = cw ? cw.querySelector('#cerberusSyncBtn') : null;
        if (btn) {
            btn.classList.add('syncing');
            btn.innerHTML = '<span class="cerb-spin-icon"></span><span class="cerb-sync-progress">0/' + targetLimit + '</span>';
            btn.title = t('sync.clickCancel');
        }
        let offset = 0; let validPlayersFound = 0; let pagesFetched = 0; const maxPagesSafeguard = 50; const newCache = {};
        let consecutiveEmptyPages = 0;

        while (validPlayersFound < targetLimit) {
            try {
                if (signal.aborted || getActiveGameId(window.CerberusFCADE) !== initialGameId || pagesFetched >= maxPagesSafeguard) break;
                const res = await fetch('https://web.fightcade.com/api/', { method: 'POST', headers: { 'Content-Type': 'application/json' }, signal, body: JSON.stringify({ req: "searchrankings", gameid: initialGameId, limit: 100, offset: offset, byElo: true, recent: true }) });
                if (!res.ok) break;
                const players = (await res.json())?.results?.results || [];
                if (players.length === 0) break;
                pagesFetched++;

                let addedThisPage = 0;
                players.forEach((p) => {
                    if (validPlayersFound >= targetLimit || !p.name) return;
                    if (targetCountry === '' || (p.country?.iso_code?.toUpperCase() === targetCountry)) {
                        validPlayersFound++; newCache[p.name.toLowerCase()] = validPlayersFound;
                        addedThisPage++;
                    }
                });

                if (addedThisPage === 0) {
                    consecutiveEmptyPages++;
                } else {
                    consecutiveEmptyPages = 0;
                }

                if (consecutiveEmptyPages >= 3) break; // Early exit: 3 consecutive pages fetched without finding a matching user

                if (players.length < 100 || validPlayersFound >= targetLimit) break;
                offset += 100;
                if (btn) { const p = btn.querySelector('.cerb-sync-progress'); if (p) p.textContent = validPlayersFound + '/' + targetLimit; }
                
                // Strict safety interval against Cloudflare rate limits
                await new Promise(resolve => { const timeout = setTimeout(resolve, 5000); signal.addEventListener('abort', () => { clearTimeout(timeout); resolve(); }, { once: true }); });
            } catch (e) { break; }
        }

        if (Object.keys(newCache).length > 0 && !signal.aborted) {
            this.data[initialGameId] = { lastUpdate: Date.now(), players: newCache, filter: { country: targetCountry, limit: targetLimit } };
            this._evictOldEntries(); this.save();
        }

        this.isSyncing = false; this._abortController = null;
        if (btn) { btn.classList.remove('syncing'); btn.innerHTML = '🔄'; setSyncBtnState(btn, Date.now() - (this.data[initialGameId]?.lastUpdate || 0) < cooldownMs); }
        if (window.CerberusFCADE && ConfigManager.getRuntimeConfig() && !signal.aborted) {
            const cw = getActiveChannelWrapper();
            if (cw) {
                fullChatScanScoped(cw, window.CerberusFCADE, ConfigManager.getRuntimeConfig());
                updateSidebarScope(cw.querySelector('.usersListWrapper'), window.CerberusFCADE, ConfigManager.getRuntimeConfig());
            }
        }
    }
};

module.exports = { RankCache };