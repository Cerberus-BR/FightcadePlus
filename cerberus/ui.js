const { t, isNewerVersion, executeChatCommand, normalizeUsername, isSystemUser, getActiveChannelWrapper, getActiveGameId, executeChatMacro } = require('./utils.js');
const { AVAILABLE_COUNTRIES, CURRENT_VERSION, COUNTRY_NAME_TO_CODE } = require('./constants.js');

function createIconSpan(className, width, height, bgUrl, title, bgRepeat) {
    const el = document.createElement('span'); el.className = className;
    const style = { width, height, display: 'inline-block', backgroundImage: `url('${bgUrl}')`, backgroundSize: 'contain', marginLeft: '5px', verticalAlign: 'middle' };
    if (bgRepeat) style.backgroundRepeat = bgRepeat; Object.assign(el.style, style); el.title = title; return el;
}

function createFlagElement(country) { return createIconSpan('flagWrapper cerberus-injected-flag', '20px', '14px', `static/flags/${country.iso_code.toLowerCase()}.png`, country.full_name, 'no-repeat'); }
function createPingElement(src, title) { return createIconSpan('pingWrapper cerberus-injected-pingbar', '15px', '15px', src, title); }
function createRankElement(src, title) { return createIconSpan('rankWrapper cerberus-injected-rank', '15px', '15px', src, title); }
function createPingTextElement(minPing) {
    const text = document.createElement('span'); text.className = `cerberus-injected-pingtext`; let color = '#aaa';
    if (minPing !== null) { if (minPing < 60) color = '#00ff00'; else if (minPing > 90) color = '#ff4444'; }
    Object.assign(text.style, { fontSize: '10px', marginLeft: '5px', fontWeight: 'normal', color: color, verticalAlign: 'middle' });
    text.innerHTML = minPing !== null ? `(${minPing}ms)` : ''; return text;
}
function createStatusElement(state) {
    const status = document.createElement('div'); status.className = `statusWrapper cerberus-injected-status`;
    let color = '#ff4444'; let shadow = 'red'; let title = t('status.offline');
    if (state === 'online') { color = '#00ff00'; shadow = 'green'; title = t('status.online'); } else if (state === 'away') { color = '#ffaa00'; shadow = 'orange'; title = t('status.away'); }
    status.title = title;
    Object.assign(status.style, { width: '8px', height: '8px', display: 'inline-block', borderRadius: '50%', backgroundColor: color, marginRight: '5px', flexShrink: '0', boxShadow: `0 0 2px ${shadow}`, verticalAlign: 'middle' });
    return status;
}
function createRankBadge(numericRank) {
    const badge = document.createElement('span'); badge.className = 'cerb-rank-badge';
    Object.assign(badge.style, { fontSize: '12px', fontWeight: 'normal', color: '#ffd700', backgroundColor: 'transparent', border: 'none', padding: '0', marginRight: '5px', verticalAlign: 'middle', display: 'inline-block' });
    badge.textContent = `🏅${numericRank}`; return badge;
}

function injectStyles() {
    if (document.getElementById('cerberusStyles')) return;
    const style = document.createElement('style'); style.id = 'cerberusStyles';
    style.textContent = `
        .cerb-section-children.cerb-disabled { opacity: 0.35; pointer-events: none; user-select: none; }
        @keyframes cerbAntiFlash { 0%, 99% { opacity: 0; max-height: 0px; padding: 0px; margin: 0px; overflow: hidden; } 100% { opacity: 1; max-height: 500px; } }
        .usersListWrapper .userItem:not([data-cerberus-processed="true"]), .matchesList .matchItem:not([data-cerberus-processed="true"]), .chatContent .messageWrapper:not([data-cerberus-processed="true"]) { animation: cerbAntiFlash 0.35s forwards; }
        #settingsTab textarea::selection, #settingsTab input::selection { background: rgba(100, 149, 237, 0.5); color: #fff; }
        #settingsTab textarea::-moz-selection, #settingsTab input::-moz-selection { background: rgba(100, 149, 237, 0.5); color: #fff; }
        @keyframes cerbSpin { 100% { transform: rotate(360deg); } }
        @keyframes cerbPulseGlow { 0%, 100% { box-shadow: 0 0 4px rgba(255, 215, 0, 0.15); } 50% { box-shadow: 0 0 12px rgba(255, 215, 0, 0.4); } }
        #cerberusSyncBtn { transition: width 0.3s ease, border-radius 0.3s ease, background 0.2s ease, padding 0.3s ease; margin-left: 8px; }
        #cerberusSyncBtn.syncing { width: auto !important; min-width: 28px; border-radius: 14px !important; background: rgba(255, 215, 0, 0.08) !important; border: 1px solid rgba(255, 215, 0, 0.25) !important; padding: 0 10px !important; cursor: pointer !important; opacity: 1 !important; animation: cerbPulseGlow 2.5s ease-in-out infinite; gap: 5px; }
        #cerberusSyncBtn.syncing .cerb-spin-icon { display: inline-block; width: 12px; height: 12px; border: 2px solid rgba(255, 215, 0, 0.25); border-top-color: #ffd700; border-radius: 50%; animation: cerbSpin 0.7s linear infinite; vertical-align: middle; flex-shrink: 0; }
        #cerberusSyncBtn .cerb-sync-progress { font-size: 11px; color: #ffd700; font-weight: 600; vertical-align: middle; letter-spacing: 0.3px; white-space: nowrap; margin-left: 3px; }
        #cerberusSyncBtn:hover:not(.syncing) { background: rgba(255,255,255,0.1) !important; }
        #cerberusSyncBtn.syncing:hover { background: rgba(255, 68, 68, 0.12) !important; border-color: rgba(255, 68, 68, 0.4) !important; animation: none; box-shadow: 0 0 8px rgba(255, 68, 68, 0.3); }
        #cerberusSyncBtn.syncing:hover .cerb-spin-icon { border-top-color: #ff6b6b; border-color: rgba(255, 68, 68, 0.25); }
        @keyframes cerbBlockPulse { 0% { background-color: rgba(255, 68, 68, 0.4); box-shadow: inset 4px 0 0px #ff4444; } 50% { background-color: rgba(255, 68, 68, 0.05); box-shadow: inset 4px 0 0px #ff4444; } 100% { background-color: transparent; box-shadow: none; } }
        .cerberus-anim-block-pulse { animation: cerbBlockPulse 2s ease-in-out 2 forwards !important; }
        
        .cerb-clear-chat-fab { position: absolute; right: 15px; bottom: 65px; background: rgba(30, 30, 35, 0.9); border-radius: 5px; width: 160px; text-align: center; text-transform: uppercase; padding: 6px 14px; font-size: 11px; font-weight: bold; cursor: pointer; transition: all 0.2s ease; z-index: 100; box-shadow: 0 4px 10px rgba(0,0,0,0.5); backdrop-filter: blur(5px); border: 1px solid rgba(255, 255, 255, 0.1); color: #ccc; }
        .cerb-clear-chat-fab:hover { background: rgba(50, 50, 60, 0.95); color: #fff; transform: translateY(-2px); border-color: rgba(255, 255, 255, 0.3); }
        
        .cerb-mute-chat-fab { position: absolute; right: 15px; bottom: 100px; background: rgba(30, 30, 35, 0.9); border-radius: 5px; width: 160px; text-align: center; text-transform: uppercase; padding: 6px 14px; font-size: 11px; font-weight: bold; cursor: pointer; transition: all 0.2s ease; z-index: 100; box-shadow: 0 4px 10px rgba(0,0,0,0.5); backdrop-filter: blur(5px); border: 1px solid rgba(255, 255, 255, 0.1); color: #ccc; }
        .cerb-mute-chat-fab:hover { background: rgba(50, 50, 60, 0.95); color: #fff; transform: translateY(-2px); border-color: rgba(255, 255, 255, 0.3); }
        .cerb-mute-chat-fab[data-muted="true"] { border-color: rgba(251, 191, 36, 0.9); color: #fbbf24; background: rgba(251, 191, 36, 0.18); }
        .cerb-mute-chat-fab[data-muted="true"]:hover { border-color: rgba(251, 191, 36, 1); color: #fff; background: rgba(251, 191, 36, 0.25); }
        
        .cerb-queue-fab { position: absolute; right: 15px; bottom: 135px; background: rgba(30, 30, 35, 0.9); border-radius: 5px; width: 160px; text-align: center; text-transform: uppercase; padding: 6px 14px; font-size: 11px; font-weight: bold; cursor: pointer; transition: all 0.2s ease; z-index: 100; box-shadow: 0 4px 10px rgba(0,0,0,0.5); backdrop-filter: blur(5px); border: 1px solid var(--mainColor-light, rgba(102, 126, 234, 0.4)); color: var(--mainColor-lighter, #a3bffa); }
        .cerb-queue-fab:hover { background: var(--mainColor-light, rgba(102, 126, 234, 0.3)); color: #fff; transform: translateY(-2px); }
        .q-live-btn { border: 1px solid rgba(255,255,255,0.1); border-radius: 4px; padding: 5px 10px; font-size: 11px; font-weight: bold; cursor: pointer; transition: all 0.2s; color: white; }
        .q-live-btn.on { background: rgba(0, 170, 0, 0.3); border-color: #00aa00; }
        .q-live-btn.on:hover { background: rgba(0, 170, 0, 0.5); }
        .q-live-btn.off { background: rgba(170, 0, 0, 0.3); border-color: #ff4444; }
        .q-live-btn.off:hover { background: rgba(170, 0, 0, 0.5); }
        .cerb-motd-update-notice { background: rgba(255, 165, 0, 0.15); border-left: 4px solid #ffaa00; padding: 10px 15px; margin-top: 15px; border-radius: 4px; color: #ffdca5; font-size: 13px; display: inline-block; width: calc(100% - 10px); box-sizing: border-box; line-height: 1.4; }
        body.cerb-hide-sidebar-ping .usersListToolbar .userItem .pingWrapper img.ping { display: none !important; }
        .chatContent.blur-all .message .line .blocksContainer { filter: blur(5px); transition: filter 0.2s ease; user-select: none; }
        .chatContent.blur-all:hover .message .line .blocksContainer { filter: blur(0); user-select: text; }
        #cerbGlobalMenu { position: fixed; background: rgba(20, 20, 25, 0.95); border: 1px solid var(--mainColor-light, rgba(102, 126, 234, 0.3)); border-radius: 8px; padding: 4px 8px; box-shadow: 0 4px 15px rgba(0, 0, 0, 0.6); display: flex; align-items: center; gap: 8px; z-index: 100000; opacity: 0; pointer-events: none; transition: opacity 0.2s ease, transform 0.2s ease; transform: translateY(-50%) translateX(15px) scale(0.95); user-select: none; white-space: nowrap; }
        #cerbGlobalMenu.visible { opacity: 1; pointer-events: auto; transform: translateY(-50%) translateX(0) scale(1); }
        #cerbGlobalMenu span { cursor: pointer; font-size: 14px; transition: transform 0.1s; display: inline-block; }
        #cerbGlobalMenu span:hover { transform: scale(1.3); }
        .cerb-menu-divider { width: 1px; height: 16px; background: rgba(255, 255, 255, 0.2); margin: 0 2px; }
        
        .cerb-update-btn { display: inline-block; margin-top: 20px; padding: 10px 20px; background: rgba(0,0,0,0.15); border: 1px solid var(--mainColor-light, rgba(102, 126, 234, 0.4)); border-radius: 8px; color: var(--mainColor-lighter, #a3bffa); text-decoration: none; font-weight: 600; transition: all 0.2s ease; font-size: 14px; }
        .cerb-update-btn:hover { background: var(--mainColor-light, rgba(102, 126, 234, 0.3)); color: #fff; transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0, 0.2); }
        .cerb-donate-btn { display: inline-flex; align-items: center; justify-content: center; padding: 8px 16px; border-radius: 6px; font-weight: bold; font-size: 13px; text-decoration: none; transition: all 0.2s ease; box-shadow: 0 2px 5px rgba(0,0,0,0.3); flex: 1; }
        .cerb-donate-btn:hover { transform: translateY(-2px); box-shadow: 0 4px 10px rgba(0,0,0,0.4); }
        .cerb-donate-paypal { background: #00457C; color: #fff; border: 1px solid #005A9C; }
        .cerb-donate-livepix { background: #00FF87; color: #000; border: 1px solid #00CC6A; }

        #cerberusPanel { position: fixed; width: 480px; max-height: 85vh; background: rgba(23, 23, 28, 0.95); backdrop-filter: blur(12px); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 12px; z-index: 10000; color: #ececec; font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; box-shadow: 0 20px 60px rgba(0, 0, 0, 0.7); display: none; overflow: hidden; flex-direction: column; }
        @media (max-width: 768px) { #cerberusPanel { width: 95%; max-height: 90vh; } }
        #cerberusPanel .header, #cerberusQueueWindow .q-header { display: flex; justify-content: space-between; align-items: center; padding: 14px 20px; background: rgba(255, 255, 255, 0.03); border-bottom: 1px solid rgba(255, 255, 255, 0.08); cursor: move; user-select: none; }
        #cerberusPanel .header .title, #cerberusQueueWindow .q-title { display: flex; align-items: center; gap: 10px; font-size: 16px; font-weight: 600; color: #fff; letter-spacing: 0.5px; }
        #cerberusPanel .closeBtn, #cerberusQueueWindow .q-close { background: transparent; border: none; color: rgba(255, 255, 255, 0.6); font-size: 24px; cursor: pointer; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; border-radius: 6px; transition: all 0.2s; }
        #cerberusPanel .closeBtn:hover, #cerberusQueueWindow .q-close:hover { background: rgba(255, 255, 255, 0.1); color: #fff; }
        #cerberusPanel .tabs { display: flex; background: rgba(0, 0, 0, 0.2); padding: 0 10px; }
        #cerberusPanel .tab { padding: 14px 20px; background: transparent; border: none; border-bottom: 2px solid transparent; color: rgba(255, 255, 255, 0.6); cursor: pointer; font-size: 13px; font-weight: 500; transition: all 0.2s; }
        #cerberusPanel .tab:hover { color: #fff; }
        #cerberusPanel .tab.active { color: var(--mainColor-light, #667eea); border-bottom-color: var(--mainColor-light, #667eea); }
        #cerberusPanel .tab.disabled { opacity: 0.3; cursor: not-allowed; }
        #cerberusPanel .content { flex: 1; overflow-y: auto; padding: 20px; }
        .modern-toggle { display: flex; justify-content: space-between; align-items: center; padding: 12px; margin-bottom: 8px; background: rgba(255, 255, 255, 0.03); border-radius: 8px; transition: background 0.2s; }
        .modern-toggle:hover { background: rgba(255, 255, 255, 0.05); }
        .switch { position: relative; display: inline-block; width: 44px; height: 24px; }
        .switch input { opacity: 0; width: 0; height: 0; }
        .slider { position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: #444; transition: .3s; border-radius: 24px; }
        .slider:before { position: absolute; content: ""; height: 18px; width: 18px; left: 3px; bottom: 3px; background-color: white; transition: .3s; border-radius: 50%; }
        input:checked + .slider { background-color: var(--mainColor-light, #667eea); }
        input:checked + .slider:before { transform: translateX(20px); }
        .search-bar { width: 100%; padding: 10px 14px; background: rgba(0, 0, 0, 0.3); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 8px; color: white; margin-bottom: 15px; font-size: 14px; outline: none; }
        .search-bar:focus { border-color: var(--mainColor-light, #667eea); }
        #cerberusQueueWindow { position: fixed; right: 20px; bottom: 150px; width: 320px; max-height: 400px; background: rgba(23, 23, 28, 0.95); backdrop-filter: blur(12px); border: 1px solid var(--mainColor-light, rgba(102, 126, 234, 0.3)); border-radius: 12px; z-index: 10000; color: #ececec; font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; box-shadow: 0 10px 30px rgba(0, 0, 0, 0.8); display: flex; flex-direction: column; overflow: hidden; }
        #cerbQueueCount { color: var(--mainColor-lighter, #a3bffa); margin-left: 5px; font-size: 12px; }
        .q-add-box { display: flex; padding: 10px; background: rgba(0,0,0,0.2); border-bottom: 1px solid rgba(255,255,255,0.05); gap: 8px; }
        .q-add-box input { flex: 1; padding: 6px 10px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 4px; color: #fff; font-size: 12px; outline: none; }
        .q-add-box input:focus { border-color: var(--mainColor-light, #667eea); }
        .q-add-box button { background: var(--mainColor-light, #667eea); color: white; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer; font-size: 12px; font-weight: bold; transition: background 0.2s; text-transform: uppercase; }
        .q-add-box button:hover { background: var(--mainColor, #5a67d8); }
        .q-list { flex: 1; overflow-y: auto; padding: 10px; display: flex; flex-direction: column; gap: 6px; }
        .q-empty { text-align: center; color: #888; font-size: 12px; padding: 20px 0; font-style: italic; }
        .q-item { display: flex; justify-content: space-between; align-items: center; background: rgba(255,255,255,0.03); padding: 8px 12px; border-radius: 6px; border-left: 3px solid var(--mainColor-light, #667eea); }
        .q-name { font-size: 13px; font-weight: 500; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 150px; }
        .q-name.played { text-decoration: line-through; color: #888; border-left-color: #444; }
        .q-controls { display: flex; gap: 4px; }
        .q-controls button { background: transparent; border: 1px solid rgba(255,255,255,0.1); border-radius: 4px; cursor: pointer; font-size: 11px; padding: 4px; transition: all 0.2s; color: #ccc; }
        .q-controls button:hover:not(:disabled) { background: rgba(255,255,255,0.1); transform: scale(1.1); }
        .q-controls button:disabled { opacity: 0.3; cursor: not-allowed; }
        .q-controls button.danger:hover { background: rgba(255,68,68,0.2); border-color: #ff4444; }
        .q-footer { padding: 10px; background: rgba(0,0,0,0.3); text-align: right; border-top: 1px solid rgba(255,255,255,0.05); display: flex; justify-content: space-between; align-items: center; }
        .q-clear-btn { background: transparent; border: 1px solid rgba(255,68,68,0.4); color: #ff4444; padding: 5px 10px; border-radius: 4px; font-size: 11px; cursor: pointer; transition: all 0.2s; text-transform: uppercase; }
        .q-clear-btn:hover { background: rgba(255,68,68,0.2); }
        #cerberusPanel .content::-webkit-scrollbar, .q-list::-webkit-scrollbar { width: 6px; }
        #cerberusPanel .content::-webkit-scrollbar-thumb, .q-list::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.2); border-radius: 4px; }
        #cerberusPanel .content::-webkit-scrollbar-track, .q-list::-webkit-scrollbar-track { background: transparent; }
    `;
    document.head.appendChild(style);
}

function createControlPanel() {
    const { ConfigManager } = require('./config.js');
    if (document.getElementById('cerberusPanel')) return;
    const panel = document.createElement('div'); panel.id = 'cerberusPanel';
    panel.innerHTML = `<div class="header" id="cerberusHeader"><div class="title"><span>🐺</span><span>${t('panelTitle')}</span></div><button class="closeBtn" id="cerbPanelCloseBtn">×</button></div><div class="tabs"><button class="tab" data-tab="countries" id="countriesTabBtn">${t('tabs.countries')}</button><button class="tab active" data-tab="settings">${t('tabs.settings')}</button><button class="tab" data-tab="about">${t('tabs.about')}</button></div><div class="content"><div id="countriesTab" class="tab-content" style="display:none;"></div><div id="settingsTab" class="tab-content" style="display:block;"></div><div id="aboutTab" class="tab-content" style="display:none;"></div></div>`;
    document.body.appendChild(panel); makeDraggable(panel, 'cerberusHeader');

    document.getElementById('cerbPanelCloseBtn').addEventListener('click', () => panel.style.display = 'none');

    panel.querySelectorAll('.tab').forEach(tab => {
        tab.addEventListener('click', () => {
            if (tab.classList.contains('disabled')) return;
            panel.querySelectorAll('.tab').forEach(t => t.classList.remove('active')); panel.querySelectorAll('.tab-content').forEach(c => c.style.display = 'none');
            tab.classList.add('active'); document.getElementById(tab.dataset.tab + 'Tab').style.display = 'block';
            if (tab.dataset.tab === 'countries') updateCountryList();
        });
    });
    createCountriesTab(); createSettingsTab(); createAboutTab(); updateCountryTabVisibility(ConfigManager.getSetting('countryFilter.enabled') === true);
}

function makeDraggable(element, headerId) {
    const header = document.getElementById(headerId); if (!header) return;
    let isDragging = false; let currentX, currentY, initialX, initialY, xOffset = 0, yOffset = 0;
    const setTranslate = (x, y) => { element.style.transform = `translate3d(${x}px, ${y}px, 0)`; element.style.top = element.style.left = '0'; };
    if (headerId === 'cerberusHeader') { xOffset = (window.innerWidth - 480) / 2; yOffset = (window.innerHeight - 500) / 2; setTranslate(xOffset, yOffset); }
    header.addEventListener("mousedown", (e) => {
        if ((e.target === header || header.contains(e.target)) && e.target.tagName !== 'BUTTON') {
            const rect = element.getBoundingClientRect(); xOffset = rect.left; yOffset = rect.top; initialX = e.clientX - xOffset; initialY = e.clientY - yOffset; isDragging = true;
            const drag = (ev) => { if (!isDragging) return; ev.preventDefault(); currentX = Math.max(0, Math.min(ev.clientX - initialX, window.innerWidth - (element.offsetWidth || 480))); currentY = Math.max(0, Math.min(ev.clientY - initialY, window.innerHeight - (element.offsetHeight || 500))); xOffset = currentX; yOffset = currentY; setTranslate(currentX, currentY); if (element.id === 'cerberusQueueWindow') { element.style.right = element.style.bottom = 'auto'; } };
            const dragEnd = () => { isDragging = false; document.removeEventListener("mouseup", dragEnd); document.removeEventListener("mousemove", drag); };
            document.addEventListener("mouseup", dragEnd); document.addEventListener("mousemove", drag);
        }
    });
}

function updateCountryTabVisibility(enabled) {
    const btn = document.getElementById('countriesTabBtn');
    if (btn) { if (enabled) btn.classList.remove('disabled'); else { btn.classList.add('disabled'); if (btn.classList.contains('active')) { const settingsTab = document.querySelector('.tab[data-tab="settings"]'); if (settingsTab) settingsTab.click(); } } }
}

function createCountriesTab() {
    const { CerberusData } = require('./state.js');
    const tab = document.getElementById('countriesTab');
    tab.innerHTML = `<div style="background: rgba(255, 165, 0, 0.1); border: 1px solid rgba(255, 165, 0, 0.3); border-radius: 8px; padding: 10px; margin-bottom: 15px; font-size: 13px; text-align: center; color: #ffdca5; line-height: 1.4;">${t('countries.alert')}</div><input type="text" id="countrySearch" class="search-bar" placeholder="${t('countries.search')}"><div style="display: flex; gap: 10px; margin-bottom: 15px;"><button id="allowAllBtn" style="flex: 1; padding: 10px; background: rgba(0, 170, 0, 0.2); border: 1px solid rgba(0, 255, 0, 0.3); border-radius: 8px; color: #4ade80; cursor: pointer; font-weight: 600;">${t('countries.allowAll')}</button><button id="clearAllBtn" style="flex: 1; padding: 10px; background: rgba(170, 0, 0, 0.2); border: 1px solid rgba(255, 0, 0, 0.3); border-radius: 8px; color: #f87171; cursor: pointer; font-weight: 600;">${t('countries.clearAll')}</button></div><div id="countriesContainer"></div>`;
    document.getElementById('allowAllBtn').addEventListener('click', () => { CerberusData.allowAllCountries(); updateCountryList(); });
    document.getElementById('clearAllBtn').addEventListener('click', () => { CerberusData.blockAllCountries(); updateCountryList(); });
    document.getElementById('countrySearch').addEventListener('input', (e) => updateCountryList(e.target.value));
    updateCountryList();
}

function updateCountryList(filterText = '') {
    const { CerberusData } = require('./state.js');
    const container = document.getElementById('countriesContainer'); if (!container) return; container.innerHTML = '';
    const filter = filterText.toLowerCase();
    Object.entries(AVAILABLE_COUNTRIES).forEach(([code, name]) => {
        if (!name.toLowerCase().includes(filter) && !code.toLowerCase().includes(filter)) return;
        const isAllowed = CerberusData.isCountryAllowed(code); const div = document.createElement('div');
        Object.assign(div.style, { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', marginBottom: '8px', background: 'rgba(255, 255, 255, 0.03)', borderRadius: '8px', borderLeft: `4px solid ${isAllowed ? '#4ade80' : '#4b5563'}`, transition: 'background 0.2s' });
        div.onmouseenter = () => div.style.background = 'rgba(255, 255, 255, 0.06)'; div.onmouseleave = () => div.style.background = 'rgba(255, 255, 255, 0.03)';

        let bgStyle = code === 'XX'
            ? `content: '🌐'; font-size: 14px; text-align: center; display: inline-block; width: 24px;`
            : `background-image: url('static/flags/${code.toLowerCase()}.png'); background-size: contain; background-repeat: no-repeat;`;

        div.innerHTML = `<div style="display:flex; align-items:center; gap:12px;"><span style="width:24px; height:16px; ${bgStyle} opacity: ${isAllowed ? 1 : 0.5}"></span><span style="font-size:14px; color:${isAllowed ? '#fff' : '#888'}">${name} <small style="opacity:0.5">(${code})</small></span></div>`;
        const toggle = createModernToggle(isAllowed, () => { if (isAllowed) CerberusData.blockCountry(code); else CerberusData.unblockCountry(code); updateCountryList(filterText); });
        div.appendChild(toggle); container.appendChild(div);
    });
}

function createModernToggle(checked, onChange) {
    const label = document.createElement('label'); label.className = 'switch'; const input = document.createElement('input');
    input.type = 'checkbox'; input.checked = checked; input.addEventListener('change', onChange);
    const span = document.createElement('span'); span.className = 'slider'; label.appendChild(input); label.appendChild(span); return label;
}

function createSettingsTab() {
    const { ConfigManager } = require('./config.js');
    const tab = document.getElementById('settingsTab');
    const sectionHeader = (title) => `<h4 style="margin: 0 0 12px 0; font-size: 13px; text-transform: uppercase; color: var(--mainColor-light, #667eea); letter-spacing: 1px; font-weight: 700;">${title}</h4>`;
    const createSection = (title, items) => `<div style="margin-bottom: 24px;">${sectionHeader(title)}${items}</div>`;

    const createMasterSection = (masterKey, title, childrenId, items) => {
        const enabled = ConfigManager.getSetting(masterKey) === true;
        const headerToggle = `<label class="switch" style="transform:scale(0.8);"><input type="checkbox" data-setting="${masterKey}" data-master-for="${childrenId}" ${enabled ? 'checked' : ''}><span class="slider"></span></label>`;
        const header = `<div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">${sectionHeader(title)}${headerToggle}</div>`;
        return `<div style="margin-bottom: 24px;">${header}<div id="${childrenId}" class="cerb-section-children ${enabled ? '' : 'cerb-disabled'}">${items}</div></div>`;
    };

    const settingToggle = (key, label) => {
        const val = ConfigManager.getSetting(key) === true;
        return `<div class="modern-toggle"><span style="font-size: 14px; color: #e0e0e0;">${label}</span><label class="switch"><input type="checkbox" data-setting="${key}" ${val ? 'checked' : ''}><span class="slider"></span></label></div>`;
    };
    const settingInput = (key, label, type = "text") => {
        let val = ConfigManager.getSetting(key) ?? ''; const safeVal = val.toString().replace(/"/g, '&quot;');
        if (type === 'textarea') { const displayVal = safeVal.replace(/\\n/g, '\n'); return `<div class="modern-toggle" style="flex-wrap: wrap;"><span style="font-size: 14px; color: #e0e0e0; flex: 1; min-width: 150px;">${label}</span><textarea data-setting="${key}" rows="3" style="background: rgba(0,0,0,0.3); color: white; border: 1px solid rgba(255,255,255,0.2); padding: 6px 8px; border-radius: 4px; outline: none; width: 100%; margin-top: 8px; resize: vertical; font-family: inherit; font-size: 13px; line-height: 1.4;">${displayVal}</textarea></div>`; }
        return `<div class="modern-toggle" style="flex-wrap: wrap;"><span style="font-size: 14px; color: #e0e0e0; flex: 1; min-width: 150px;">${label}</span><input type="${type}" data-setting="${key}" value="${safeVal}" style="background: rgba(0,0,0,0.3); color: white; border: 1px solid rgba(255,255,255,0.2); padding: 4px 8px; border-radius: 4px; outline: none; width: ${key === 'liveQueue.promoMessage' ? '100%' : '100px'}; text-align: ${key === 'liveQueue.promoMessage' ? 'left' : 'center'}; margin-top: ${key === 'liveQueue.promoMessage' ? '8px' : '0'};"></div>`;
    };
    const settingSelect = (key, label, options) => {
        const currentVal = ConfigManager.getSetting(key) || options[0].value;
        const optsHtml = options.map(opt => `<option value="${opt.value}" ${currentVal == opt.value ? 'selected' : ''}>${opt.text}</option>`).join('');
        return `<div class="modern-toggle"><span style="font-size: 14px; color: #e0e0e0;">${label}</span><select data-setting="${key}" style="background: rgba(0,0,0,0.3); color: white; border: 1px solid rgba(255,255,255,0.2); padding: 4px 8px; border-radius: 4px; outline: none;">${optsHtml}</select></div>`;
    };
    const blurToggle = () => {
        const isAll = ConfigManager.getSetting('chatUserInfo.blurMode') === 'all';
        return `<div class="modern-toggle"><span style="font-size: 14px; color: #e0e0e0;">${t('settings.blurMode')}</span><label class="switch"><input type="checkbox" data-setting="chatUserInfo.blurMode" data-blur-toggle="true" ${isAll ? 'checked' : ''}><span class="slider"></span></label></div>`;
    };

    const langSelect = `<div class="modern-toggle" style="margin-bottom: 24px;"><span style="font-size: 14px; color: #e0e0e0; font-weight: bold;">${t('settings.language')}</span><select id="cerbLangSelect" data-setting="language" style="background: rgba(0,0,0,0.3); color: white; border: 1px solid rgba(255,255,255,0.2); padding: 6px 10px; border-radius: 4px; outline: none; font-size: 13px; cursor: pointer;"><option value="en" ${ConfigManager.getSetting('language') === 'en' ? 'selected' : ''}>🇺🇸 English</option><option value="pt" ${ConfigManager.getSetting('language') === 'pt' ? 'selected' : ''}>🇧🇷 Português</option><option value="es" ${ConfigManager.getSetting('language') === 'es' ? 'selected' : ''}>🇪🇸 Español</option></select></div>`;

    tab.innerHTML = langSelect +
        createSection(t('settings.global'), settingToggle('autoJoin.enabled', t('settings.autoJoin'))) +
        createMasterSection('liveQueue.enabled', t('settings.liveQueue'), 'cerbLiveQueueChildren',
            settingInput('liveQueue.keyword', t('settings.queueKeyword')) +
            settingInput('liveQueue.streamerNick', t('settings.queueStreamer')) +
            settingInput('liveQueue.limit', t('settings.queueLimit'), 'number') +
            settingToggle('liveQueue.autoReply', t('settings.queueReply')) +
            settingToggle('liveQueue.promoEnabled', t('settings.queuePromoEnable')) +
            settingInput('liveQueue.promoMessage', t('settings.queuePromo'), 'textarea')) +
        createMasterSection('rankings.masterEnabled', t('settings.rankingsApi'), 'cerbRankingsChildren',
            settingSelect('rankings.limit', t('settings.rankLimit'), [{ value: 100, text: "100" }, { value: 200, text: "200" }, { value: 400, text: "400" }, { value: 500, text: "500" }, { value: 800, text: "800" }, { value: 999, text: "999" }]) +
            settingInput('rankings.country', t('settings.rankCountry')) +
            settingToggle('chatUserInfo.showNumericRanks', t('settings.showNumericRanks')) +
            // [CERBERUS] Adicionado Menu de Rank ao UI do CommonJS
            settingSelect('rankings.minRankToAccept', t('settings.minRankToAccept'), [
                { value: 0, text: t('settings.rankOptions.r0') },
                { value: 1, text: t('settings.rankOptions.r1') },
                { value: 2, text: t('settings.rankOptions.r2') },
                { value: 3, text: t('settings.rankOptions.r3') },
                { value: 4, text: t('settings.rankOptions.r4') },
                { value: 5, text: t('settings.rankOptions.r5') },
                { value: 6, text: t('settings.rankOptions.r6') }
            ])) +
        createSection(t('settings.filters'), 
            settingToggle('countryFilter.enabled', t('settings.enableFilter')) +
            settingToggle('countryFilter.autoReject', t('settings.autoRejectCountry'))) +
        createMasterSection('chatUserInfo.masterEnabled', t('settings.chatVisual'), 'cerbChatVisualChildren',
            settingToggle('chatUserInfo.enableStatus', t('settings.showStatus')) +
            settingToggle('chatUserInfo.enableFlag', t('settings.showFlags')) +
            settingToggle('chatUserInfo.enableRank', t('settings.showRanks')) +
            settingToggle('chatUserInfo.enablePingBars', t('settings.showPingBars')) +
            settingToggle('chatUserInfo.enablePingText', t('settings.showPingText')) +
            settingToggle('chatUserInfo.replacePingBarWithText', t('settings.replacePingBar'))) +
        createMasterSection('chatUserInfo.enableReputation', t('settings.reputation'), 'cerbReputationChildren',
            settingToggle('chatUserInfo.hideNegativeMessages', t('settings.hideNeg')) +
            settingToggle('chatUserInfo.autoRejectNegative', t('settings.autoRejectNeg'))) +
        createSection(t('settings.privacy'), blurToggle() + settingToggle('chatUserInfo.unlockColorThemes', t('settings.unlockThemes')));

    tab.querySelectorAll('input[data-setting], select[data-setting], textarea[data-setting]').forEach(input => {
        const handleSettingChange = (e) => {
            const key = e.target.getAttribute('data-setting'); let val = e.target.value;
            if (e.target.dataset.blurToggle) val = e.target.checked ? 'all' : 'none';
            else if (e.target.type === 'checkbox') val = e.target.checked;
            // [CERBERUS] Conversão segura para inteiros (Rankings)
            else if (e.target.type === 'number' || key === 'rankings.limit' || key === 'rankings.minRankToAccept') val = parseInt(e.target.value);
            else if (key === 'rankings.country') val = e.target.value.toUpperCase().trim();
            else if (e.target.tagName === 'TEXTAREA') val = e.target.value.split(String.fromCharCode(10)).join(String.fromCharCode(92) + 'n');
            
            if (key === 'language') {
                ConfigManager.updateSetting('language', val);
                const panel = document.getElementById('cerberusPanel');
                if (panel) {
                    const oldTop = panel.style.top; const oldLeft = panel.style.left; const oldTransform = panel.style.transform;
                    const activeTab = panel.querySelector('.tab.active')?.dataset.tab || 'settings';
                    panel.remove(); createControlPanel();
                    const newPanel = document.getElementById('cerberusPanel');
                    newPanel.style.top = oldTop; newPanel.style.left = oldLeft; newPanel.style.transform = oldTransform; newPanel.style.display = 'flex';
                    const newTabBtn = newPanel.querySelector(`.tab[data-tab="${activeTab}"]`); if (newTabBtn) newTabBtn.click();
                }
                const menu = document.getElementById('cerbGlobalMenu'); if (menu) menu.remove();
                injectGlobalMenu(); window.CerberusState.lastUIRenderSignature = '';
                const queuePanel = document.getElementById('cerberusQueueWindow');
                if (queuePanel) { queuePanel.remove(); if (ConfigManager.getSetting('liveQueue.enabled')) createQueuePanel(); }
                const searchInput = document.getElementById('cerbPlayerSearchInput'); if (searchInput) searchInput.placeholder = t('sidebar.search');
                return;
            }

            ConfigManager.updateSetting(key, val);
            if (key === 'countryFilter.enabled') updateCountryTabVisibility(val);
            const masterFor = e.target.dataset.masterFor;
            if (masterFor) { const children = document.getElementById(masterFor); if (children) children.classList.toggle('cerb-disabled', !e.target.checked); }
        };
        input.addEventListener('change', handleSettingChange);
        if (input.type === 'text' || input.type === 'number') { let inputDebounce = null; input.addEventListener('input', (e) => { clearTimeout(inputDebounce); inputDebounce = setTimeout(() => handleSettingChange(e), 500); }); }
    });
}

function createAboutTab() {
    const { CerberusData } = require('./state.js');
    const { isNewerVersion } = require('./utils.js');
    const { CURRENT_VERSION } = require('./constants.js');
    
    let updateHtml = '';
    if (isNewerVersion(CerberusData.latestVersion, CURRENT_VERSION)) {
        updateHtml = `<div style="background: rgba(255, 165, 0, 0.2); border: 1px solid rgba(255, 165, 0, 0.5); padding: 10px; border-radius: 8px; margin-top: 15px; color: #ffdca5; font-weight: bold; text-align: center;">${t('about.updateAvailable')} ${CerberusData.latestVersion}</div>`;
    }
    
    document.getElementById('aboutTab').innerHTML = `
        <div style="text-align: center; padding: 10px 20px;">
            <div style="font-size: 40px; margin-bottom: 10px;">🐺</div>
            <h2 style="margin: 0; color: var(--mainColor-light, #667eea);">${t('about.title')}</h2>
            <p style="opacity: 0.8; margin-top: 8px; font-weight: 500; font-size: 13px; line-height: 1.4;">
                ${t('about.desc')}
            </p>
            
            ${updateHtml}

            <div style="background: rgba(255,255,255,0.05); padding: 15px; border-radius: 12px; margin-top: 20px; border: 1px solid rgba(255,255,255,0.05);">
                <h3 style="margin: 0 0 8px 0; color: #fff; font-size: 14px;">${t('about.supportTitle')}</h3>
                <p style="font-size: 12px; color: #ccc; line-height: 1.4; margin-top: 0; margin-bottom: 15px;">
                    ${t('about.supportDesc')}
                </p>
                
                <div style="display: flex; justify-content: center; gap: 10px;">
                    <a href="https://www.paypal.com/donate/?hosted_button_id=BEPD37AB7XYL4" target="_blank" class="cerb-donate-btn cerb-donate-paypal">
                        💙 PayPal
                    </a>
                    <a href="https://livepix.gg/cerberusbr" target="_blank" class="cerb-donate-btn cerb-donate-livepix">
                        🟢 LivePix
                    </a>
                </div>
            </div>
            
            <a href="https://github.com/Cerberus-BR/FightcadePlus/releases/latest" target="_blank" class="cerb-update-btn" style="margin-top: 25px; width: calc(100% - 40px); display: block; margin-left: auto; margin-right: auto; box-sizing: border-box;">
                ${t('about.updateBtn')}
            </a>
        </div>
    `;
}

function createQueuePanel() {
    const { CerberusData } = require('./state.js');
    if (document.getElementById('cerberusQueueWindow')) return;
    const panel = document.createElement('div'); panel.id = 'cerberusQueueWindow'; panel.style.display = 'none';
    panel.innerHTML = `<div class="q-header" id="cerberusQueueHeader"><span class="q-title">📝 ${t('queue.title')} <small id="cerbQueueCount">(0)</small></span><button class="q-close" id="cerbQueueCloseBtn">×</button></div><div class="q-add-box"><input type="text" id="cerbQueueInput" placeholder="${t('queue.inputPh')}"><button id="cerbQueueAddBtn">${t('queue.addBtn')}</button></div><div class="q-list" id="cerbQueueList"></div><div class="q-footer" style="display:flex; justify-content:space-between;"><button id="cerbLiveMasterBtn" class="q-live-btn off">${t('sync.liveOff')}</button><button id="cerbQueueClearBtn" class="q-clear-btn">🧹 ${t('queue.clearBtn')}</button></div>`;
    document.body.appendChild(panel); makeDraggable(panel, 'cerberusQueueHeader');

    document.getElementById('cerbQueueCloseBtn').addEventListener('click', () => panel.style.display = 'none');

    const masterBtn = document.getElementById('cerbLiveMasterBtn');
    if (window.CerberusState.liveMasterOn) { masterBtn.className = 'q-live-btn on'; masterBtn.innerHTML = t('sync.liveOn'); }
    masterBtn.addEventListener('click', (e) => {
        const { ConfigManager } = require('./config.js');
        const btn = e.currentTarget;
        if (btn.classList.contains('off')) { 
            window.CerberusState.liveMasterOn = true; btn.className = 'q-live-btn on'; btn.innerHTML = t('sync.liveOn'); 
            
            if (window.CerberusState.promoBotInterval) clearInterval(window.CerberusState.promoBotInterval);
            window.CerberusState.promoBotInterval = setInterval(() => {
                if (ConfigManager.getSetting('liveQueue.enabled') !== true || !window.CerberusState.liveMasterOn || !ConfigManager.getSetting('liveQueue.promoEnabled')) return;
                const msg = ConfigManager.getSetting('liveQueue.promoMessage');
                if (!msg || msg.trim() === '') return;
                executeChatMacro(msg.split(/\\n|\n/));
            }, 600000); 
        }
        else { 
            window.CerberusState.liveMasterOn = false; btn.className = 'q-live-btn off'; btn.innerHTML = t('sync.liveOff'); 
            if (window.CerberusState.promoBotInterval) { clearInterval(window.CerberusState.promoBotInterval); window.CerberusState.promoBotInterval = null; } 
        }
    });

    document.getElementById('cerbQueueAddBtn').addEventListener('click', () => { const input = document.getElementById('cerbQueueInput'); CerberusData.addQueue(input.value); input.value = ''; });
    document.getElementById('cerbQueueInput').addEventListener('keypress', (e) => { if (e.key === 'Enter') { CerberusData.addQueue(e.target.value); e.target.value = ''; } });
    document.getElementById('cerbQueueClearBtn').addEventListener('click', () => { if (CerberusData.liveQueue.length === 0 || confirm(t('sync.confirmClear'))) CerberusData.clearQueue(); });
    renderQueueList();
}

function renderQueueList() {
    const { CerberusData } = require('./state.js');
    const { ConfigManager } = require('./config.js');
    const listEl = document.getElementById('cerbQueueList'); const countEl = document.getElementById('cerbQueueCount');
    if (!listEl || !countEl) return;
    listEl.innerHTML = ''; const limit = ConfigManager.getSetting('liveQueue.limit') || 20; countEl.innerText = `(${CerberusData.liveQueue.length}/${limit})`;
    if (CerberusData.liveQueue.length === 0) { listEl.innerHTML = `<div class="q-empty">${t('queue.empty')}</div>`; return; }
    CerberusData.liveQueue.forEach((player, index) => {
        const item = document.createElement('div'); item.className = 'q-item';
        const nameSpan = document.createElement('span'); nameSpan.className = 'q-name'; if (player.played) nameSpan.classList.add('played'); nameSpan.innerText = `${index + 1}. ${player.name}`;
        const controls = document.createElement('div'); controls.className = 'q-controls';
        const btnPlay = document.createElement('button'); btnPlay.innerHTML = player.played ? '↩️' : '✅'; btnPlay.title = t('queue.mark'); btnPlay.addEventListener('click', () => CerberusData.togglePlayedQueue(index));
        const btnUp = document.createElement('button'); btnUp.innerHTML = '⬆️'; btnUp.title = t('queue.up'); btnUp.disabled = index === 0; if (!btnUp.disabled) btnUp.addEventListener('click', () => CerberusData.moveQueue(index, -1));
        const btnDown = document.createElement('button'); btnDown.innerHTML = '⬇️'; btnDown.title = t('queue.down'); btnDown.disabled = index === CerberusData.liveQueue.length - 1; if (!btnDown.disabled) btnDown.addEventListener('click', () => CerberusData.moveQueue(index, 1));
        const btnDel = document.createElement('button'); btnDel.innerHTML = '❌'; btnDel.title = t('queue.remove'); btnDel.className = 'danger'; btnDel.addEventListener('click', () => CerberusData.removeQueue(index));
        controls.appendChild(btnPlay); controls.appendChild(btnUp); controls.appendChild(btnDown); controls.appendChild(btnDel); item.appendChild(nameSpan); item.appendChild(controls); listEl.appendChild(item);
    });
}

function injectGlobalMenu() {
    const { CerberusData } = require('./state.js');
    const { isSystemUser, executeChatCommand, normalizeUsername } = require('./utils.js');
    const { reprocessUserMessages } = require('./chat.js');
    const { ConfigManager } = require('./config.js');

    if (document.getElementById('cerbGlobalMenu')) return;
    const menu = document.createElement('div'); menu.id = 'cerbGlobalMenu';
    menu.innerHTML = `<span id="cerbBtnQueueAdd" title="${t('queue.addBtn')}" style="font-size:16px;">➕</span><div class="cerb-menu-divider" id="cerbDivQueue"></div><span id="cerbBtnLike" title="${t('rep.like')}">👍</span><span id="cerbBtnDislike" title="${t('rep.dislike')}">👎</span><span id="cerbBtnClear" title="${t('rep.clear')}">🧹</span><div class="cerb-menu-divider"></div><span id="cerbBtnBlock" title="${t('rep.block')}">🚫</span><span id="cerbBtnUnblock" title="${t('rep.unblock')}">🟢</span>`;
    document.body.appendChild(menu);
    menu.addEventListener('mouseenter', () => { window.CerberusState.menuIsHovered = true; clearTimeout(window.CerberusState.menuHideTimeout); clearTimeout(window.CerberusState.menuShowTimeout); });
    menu.addEventListener('mouseleave', () => { window.CerberusState.menuIsHovered = false; window.CerberusState.menuHideTimeout = setTimeout(() => menu.classList.remove('visible'), 200); });

    const action = (fn) => {
        const userKey = menu.dataset.user; if (isSystemUser(userKey)) return; fn(userKey);
        if (menu.dataset.type === 'match') document.querySelectorAll('.playerName').forEach(el => { if (normalizeUsername(el.textContent) === userKey) applyReputationStyleMatch(el, userKey); });
        reprocessUserMessages(userKey, menu.dataset.hideNegative === 'true');
    };

    document.getElementById('cerbBtnQueueAdd').addEventListener('click', () => { const userKey = menu.dataset.user; if (!isSystemUser(userKey)) { CerberusData.addQueue(userKey); menu.classList.remove('visible'); } });
    document.getElementById('cerbBtnLike').addEventListener('click', () => action(k => CerberusData.markPositive(k))); document.getElementById('cerbBtnDislike').addEventListener('click', () => action(k => CerberusData.markNegative(k))); document.getElementById('cerbBtnClear').addEventListener('click', () => action(k => CerberusData.clearReputation(k)));

    document.getElementById('cerbBtnBlock').addEventListener('click', () => {
        const userKey = menu.dataset.user;
        if (!isSystemUser(userKey)) {
            executeChatCommand(`/ignore ${userKey}`);
            let attempts = 0;
            const scrollInterval = setInterval(() => {
                attempts++; const blockedEl = Array.from(document.querySelectorAll('.usersIgnoredList .userItem')).find(el => el.dataset.currentUser === userKey);
                if (blockedEl) {
                    const sidebarWrapper = document.querySelector('.usersListWrapper'); if (sidebarWrapper) sidebarWrapper.scrollTo({ top: sidebarWrapper.scrollHeight, behavior: 'smooth' });
                    blockedEl.classList.remove('cerberus-anim-block-pulse'); void blockedEl.offsetWidth; blockedEl.classList.add('cerberus-anim-block-pulse');
                    setTimeout(() => { if (blockedEl) blockedEl.classList.remove('cerberus-anim-block-pulse'); }, 4500); clearInterval(scrollInterval);
                } else if (attempts >= 30) clearInterval(scrollInterval);
            }, 100);
        }
        menu.classList.remove('visible');
    });
    document.getElementById('cerbBtnUnblock').addEventListener('click', () => { const userKey = menu.dataset.user; if (!isSystemUser(userKey)) executeChatCommand(`/unignore ${userKey}`); menu.classList.remove('visible'); });
}

function applyReputationStyleChat(author, msg, userKey, hideNegative) {
    const { CerberusData } = require('./state.js');
    author.style.color = ''; author.style.fontWeight = ''; author.style.textShadow = ''; author.style.textDecoration = '';
    msg.style.backgroundColor = ''; msg.style.borderLeft = ''; msg.style.paddingLeft = '';
    if (userKey === '<offline>' || userKey.startsWith('<')) return;
    if (CerberusData.isPositive(userKey)) {
        author.style.color = '#00aa00'; author.style.fontWeight = 'bold'; author.style.textShadow = '0 0 3px rgba(0, 170, 0, 0.5)';
        msg.style.backgroundColor = 'rgba(0, 255, 0, 0.08)'; msg.style.borderLeft = '3px solid #00aa00'; msg.style.paddingLeft = '5px';
    } 
    else if (CerberusData.isNegative(userKey)) {
        author.style.color = '#888'; author.style.textDecoration = 'line-through';
    }
}

function applyReputationStyleList(playerName, userItem, userKey) {
    const { CerberusData } = require('./state.js');
    playerName.style.color = ''; playerName.style.fontWeight = ''; playerName.style.textDecoration = ''; playerName.style.textShadow = '';
    userItem.style.opacity = ''; userItem.style.backgroundColor = ''; userItem.style.borderLeft = '';
    if (userKey === '<offline>' || userKey.startsWith('<')) return;
    if (CerberusData.isPositive(userKey)) {
        playerName.style.color = '#00aa00'; playerName.style.fontWeight = 'bold'; playerName.style.textShadow = '0 0 5px rgba(0, 255, 0, 0.6)';
        userItem.style.backgroundColor = 'rgba(0, 255, 0, 0.12)'; userItem.style.borderLeft = '4px solid #00aa00';
    } else if (CerberusData.isNegative(userKey)) {
        playerName.style.color = '#888'; playerName.style.textDecoration = 'line-through'; userItem.style.opacity = '0.35';
    }
}

function applyReputationStyleMatch(playerName, userKey) {
    const { CerberusData } = require('./state.js');
    playerName.style.color = ''; playerName.style.fontWeight = ''; playerName.style.textShadow = ''; playerName.style.textDecoration = '';
    if (userKey === '<offline>' || userKey.startsWith('<')) return;
    if (CerberusData.isPositive(userKey)) {
        playerName.style.color = '#00aa00'; playerName.style.fontWeight = 'bold'; playerName.style.textShadow = '0 0 5px rgba(0, 255, 0, 0.6)';
    } else if (CerberusData.isNegative(userKey)) {
        playerName.style.color = '#888'; playerName.style.textDecoration = 'line-through';
    }
}

function applyDevBadge(element, username) {
    if (!element || !username) return;
    if (username.toLowerCase() === 'cerberus') {
        element.classList.add('dev');
        element.dataset.cerbDevAdded = "true";
    } else if (element.dataset.cerbDevAdded === "true") {
        element.classList.remove('dev');
        element.removeAttribute('data-cerb-dev-added');
    }
}

function addReputationControlsToElement(hoverContainer, type) {
    if (hoverContainer.dataset.cerbHoverAdded === "true") return; 
    hoverContainer.dataset.cerbHoverAdded = "true";

    hoverContainer.addEventListener('mouseenter', () => {
        const { CerberusData } = require('./state.js');
        const { ConfigManager } = require('./config.js');
        const { isSystemUser } = require('./utils.js');

        if (window.CerberusState.menuIsHovered) return;
        clearTimeout(window.CerberusState.menuHideTimeout);
        window.CerberusState.menuShowTimeout = setTimeout(() => {
            if (window.CerberusState.menuIsHovered) return;
            const menu = document.getElementById('cerbGlobalMenu'); if (!menu) return;
            
            const activeUserKey = hoverContainer.dataset.currentUser; 
            if (!activeUserKey || isSystemUser(activeUserKey)) return;

            let anchorEl = hoverContainer;
            if (type === 'chat') anchorEl = hoverContainer.querySelector('.time') || hoverContainer.querySelector('span.author') || hoverContainer;
            else anchorEl = hoverContainer.querySelector('.playerName') || hoverContainer;

            const isNativeBlocked = Array.from(document.querySelectorAll('.usersIgnoredList .userItem')).some(el => el.dataset.currentUser === activeUserKey);
            const isPos = CerberusData.isPositive(activeUserKey); const isNeg = CerberusData.isNegative(activeUserKey);

            const btnLike = document.getElementById('cerbBtnLike'); const btnDislike = document.getElementById('cerbBtnDislike'); const btnClear = document.getElementById('cerbBtnClear'); const btnBlock = document.getElementById('cerbBtnBlock'); const btnUnblock = document.getElementById('cerbBtnUnblock'); const divQueue = document.getElementById('cerbDivQueue'); const btnQueue = document.getElementById('cerbBtnQueueAdd');
            const qEnabled = ConfigManager.getSetting('liveQueue.enabled') === true;

            if (btnQueue) btnQueue.style.display = qEnabled ? 'inline-block' : 'none'; if (divQueue) divQueue.style.display = qEnabled ? 'block' : 'none';
            if (btnLike) btnLike.style.display = isPos ? 'none' : 'inline-block'; if (btnDislike) btnDislike.style.display = isNeg ? 'none' : 'inline-block';
            if (btnClear) btnClear.style.display = (isPos || isNeg) ? 'inline-block' : 'none';
            if (btnBlock) btnBlock.style.display = isNativeBlocked ? 'none' : 'inline-block'; if (btnUnblock) btnUnblock.style.display = isNativeBlocked ? 'inline-block' : 'none';

            menu.dataset.user = activeUserKey; menu.dataset.type = type; 
            menu.dataset.hideNegative = ConfigManager.getSetting('chatUserInfo.hideNegativeMessages') === true;
            
            const range = document.createRange(); range.selectNodeContents(anchorEl); const rect = range.getBoundingClientRect();
            const menuWidth = menu.offsetWidth || 150; let leftPos = rect.right + 12; if (leftPos + menuWidth > window.innerWidth - 10) leftPos = window.innerWidth - menuWidth - 10;
            menu.style.left = leftPos + 'px'; menu.style.top = (rect.top + rect.height / 2) + 'px'; menu.classList.add('visible');
        }, 300);
    });

    hoverContainer.addEventListener('mouseleave', () => {
        clearTimeout(window.CerberusState.menuShowTimeout);
        window.CerberusState.menuHideTimeout = setTimeout(() => { const menu = document.getElementById('cerbGlobalMenu'); if (menu) menu.classList.remove('visible'); }, 200);
    });
}

function unlockColorThemes() {
    const { CerberusData } = require('./state.js');
    const themeSelect = document.querySelector('.frontendOptions select.selectValue[disabled]'); const themeTitle = document.querySelector('.frontendOptions .option .title[disabled]'); const patronExclusive = document.querySelector('.frontendOptions .patronExclusive');
    if (themeSelect) {
        themeSelect.removeAttribute('disabled'); themeSelect.style.opacity = '1'; themeSelect.style.cursor = 'pointer';
        if (!themeSelect.classList.contains('cerberus-unlocked')) { themeSelect.addEventListener('change', (e) => CerberusData.setTheme(e.target.value)); themeSelect.classList.add('cerberus-unlocked'); }
    }
    if (themeTitle) { themeTitle.removeAttribute('disabled'); themeTitle.style.opacity = '1'; }
    if (patronExclusive) patronExclusive.style.display = 'none';
}

function applyTheme(themeName) {
    const themeSelect = document.querySelector('.frontendOptions select.selectValue');
    if (themeSelect && themeName && themeName !== 'default') {
        const option = Array.from(themeSelect.options).find(opt => opt.value === themeName);
        if (option && themeSelect.value !== themeName) { themeSelect.value = themeName; themeSelect.dispatchEvent(new Event('change', { bubbles: true })); }
    }
}

function setSyncBtnState(btn, isLocked) {
    if (!btn) return; btn.style.opacity = isLocked ? '0.3' : '1'; btn.style.cursor = isLocked ? 'not-allowed' : 'pointer'; btn.title = t(isLocked ? 'sync.wait30' : 'sync.rankingsBtn');
}

function injectHeaderButtons(FCADE) {
    const { getActiveChannelWrapper, getActiveGameId } = require('./utils.js');
    const { RankCache } = require('./api.js');
    const { ConfigManager } = require('./config.js');

    const cw = getActiveChannelWrapper(); const headerTitle = cw ? cw.querySelector('.usersOnlineTitle') : null;
    if (!headerTitle) return;
    headerTitle.style.display = 'flex'; headerTitle.style.alignItems = 'center';

    if (!headerTitle.querySelector('#cerberusBtn')) {
        const btn = document.createElement('span'); btn.id = 'cerberusBtn'; btn.textContent = '⚙️'; btn.title = t('btnTitle');
        Object.assign(btn.style, { cursor: 'pointer', fontSize: '16px', marginLeft: 'auto', marginRight: '8px', opacity: '0.8' });
        btn.addEventListener('click', (e) => { 
            e.stopPropagation(); 
            const panel = document.getElementById('cerberusPanel'); 
            if (panel) { 
                panel.style.display = panel.style.display === 'none' ? 'flex' : 'none'; 
                if (panel.style.display === 'flex') {
                    const aboutTabBtn = panel.querySelector('.tab[data-tab="about"]');
                    if (aboutTabBtn) aboutTabBtn.click();
                }
            } 
        });
        headerTitle.appendChild(btn);
    }

    const rankingsEnabled = ConfigManager.getSetting('rankings.masterEnabled') !== false;
    const showRankBtn = rankingsEnabled && ConfigManager.getSetting('chatUserInfo.showNumericRanks') === true;
    const existingSyncBtn = headerTitle.querySelector('#cerberusSyncBtn');
    const gameId = getActiveGameId(FCADE); const isLocked = (Date.now() - (RankCache.data[gameId]?.lastUpdate || 0) < 1800000);

    if (showRankBtn) {
        if (!existingSyncBtn) {
            const syncBtn = document.createElement('button'); syncBtn.id = 'cerberusSyncBtn'; syncBtn.textContent = '🔄';
            Object.assign(syncBtn.style, { cursor: 'pointer', fontSize: '15px', background: 'transparent', border: 'none', borderRadius: '50%', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', outline: 'none', padding: '0', marginRight: '5px', transition: 'background 0.2s' });
            setSyncBtnState(syncBtn, isLocked);
            syncBtn.addEventListener('click', (e) => { e.stopPropagation(); if (RankCache.isSyncing) RankCache.cancelSync(); else { const cId = getActiveGameId(FCADE); if (cId) RankCache.syncRankings(cId); } });
            headerTitle.insertBefore(syncBtn, headerTitle.querySelector('#cerberusBtn'));
        } else if (!RankCache.isSyncing) setSyncBtnState(existingSyncBtn, isLocked);
    } else if (existingSyncBtn) existingSyncBtn.remove();
}

function injectSidebarSearch() {
    const { getActiveChannelWrapper } = require('./utils.js');
    const { updateFilterShield, updateSidebarScope } = require('./chat.js');
    const { ConfigManager } = require('./config.js');

    const cw = getActiveChannelWrapper(); const headerTitle = cw ? cw.querySelector('.usersOnlineTitle') : null;
    if (!headerTitle) return;
    const sidebarParent = headerTitle.parentNode;
    if (!sidebarParent.querySelector('#cerbPlayerSearchContainer')) {
        const container = document.createElement('div'); container.id = 'cerbPlayerSearchContainer';
        Object.assign(container.style, { padding: '6px 12px', background: 'rgba(0,0,0,0.15)', borderBottom: '1px solid rgba(255,255,255,0.05)', flexShrink: '0', width: '100%', boxSizing: 'border-box', display: 'flex', alignItems: 'center' });
        const input = document.createElement('input'); input.type = 'text'; input.id = 'cerbPlayerSearchInput'; input.placeholder = t('sidebar.search');
        Object.assign(input.style, { width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '4px', color: '#fff', padding: '5px 8px', fontSize: '12px', outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.2s' });
        input.addEventListener('focus', () => input.style.borderColor = 'var(--mainColor-light, #667eea)'); input.addEventListener('blur', () => input.style.borderColor = 'rgba(255,255,255,0.1)');
        let searchDebounce;
        input.addEventListener('input', (e) => {
            clearTimeout(searchDebounce);
            searchDebounce = setTimeout(() => { window.CerberusState.sidebarSearchTerm = e.target.value.toLowerCase().trim(); updateFilterShield(); if (window.CerberusFCADE && ConfigManager.getRuntimeConfig()) { const cwl = getActiveChannelWrapper(); if (cwl) updateSidebarScope(cwl.querySelector('.usersListWrapper'), window.CerberusFCADE, ConfigManager.getRuntimeConfig()); } }, 300);
        });
        container.appendChild(input); headerTitle.parentNode.insertBefore(container, headerTitle.nextSibling);
    }
}

function syncMuteFab(btn) {
    const checkbox = document.getElementById('chatMuted'); 
    const isMuted = checkbox ? checkbox.checked : false;
    btn.dataset.muted = isMuted ? 'true' : 'false'; 
    btn.innerHTML = isMuted ? t('motd.resumeChat') : t('motd.muteChat');
}

function injectMuteChatFab(chatWrapper) {
    if (chatWrapper.querySelector('.cerb-mute-chat-fab')) { syncMuteFab(chatWrapper.querySelector('.cerb-mute-chat-fab')); return; }
    const muteBtn = document.createElement('button'); muteBtn.className = 'cerb-mute-chat-fab'; syncMuteFab(muteBtn);
    muteBtn.addEventListener('click', () => { const checkbox = document.getElementById('chatMuted'); if (!checkbox) return; checkbox.click(); syncMuteFab(muteBtn); });
    const observer = new MutationObserver(() => syncMuteFab(muteBtn)); const checkbox = document.getElementById('chatMuted');
    if (checkbox) observer.observe(checkbox, { attributes: true, attributeFilter: ['checked'] });
    chatWrapper.appendChild(muteBtn);
}

function injectUIEnhancements() {
    const { getActiveChannelWrapper, executeChatCommand, isNewerVersion } = require('./utils.js');
    const { ConfigManager } = require('./config.js');
    const { CerberusData } = require('./state.js');
    const { CURRENT_VERSION } = require('./constants.js');

    const cw = getActiveChannelWrapper(); const chatWrapper = cw ? cw.querySelector('.chatWrapper') : null;
    if (!chatWrapper) return;
    injectMuteChatFab(chatWrapper);
    if (!chatWrapper.querySelector('.cerb-clear-chat-fab')) {
        const clearBtn = document.createElement('button'); clearBtn.className = 'cerb-clear-chat-fab'; clearBtn.innerHTML = t('motd.clearChat');
        clearBtn.addEventListener('click', () => executeChatCommand('/clear')); chatWrapper.appendChild(clearBtn);
    }
    const qEnabled = ConfigManager.getSetting('liveQueue.enabled') === true;
    const existingFab = chatWrapper.querySelector('.cerb-queue-fab'); const existingWindow = document.getElementById('cerberusQueueWindow');
    if (qEnabled) {
        if (!existingFab) {
            const queueBtn = document.createElement('button'); queueBtn.className = 'cerb-queue-fab'; queueBtn.innerHTML = t('motd.queueTitle');
            queueBtn.addEventListener('click', () => { const panel = document.getElementById('cerberusQueueWindow'); if (panel) { panel.style.display = panel.style.display === 'none' ? 'flex' : 'none'; if (panel.style.display === 'flex') renderQueueList(); } });
            chatWrapper.appendChild(queueBtn);
        }
        createQueuePanel();
    } else { if (existingFab) existingFab.remove(); if (existingWindow) existingWindow.remove(); }
    const motdWrapper = chatWrapper.querySelector('.messageWrapper.motd');
    if (motdWrapper && CerberusData.latestVersion && isNewerVersion(CerberusData.latestVersion, CURRENT_VERSION) && motdWrapper.dataset.cerbUpdateAdded !== "true") {
        const updateNotice = document.createElement('div'); updateNotice.className = 'cerb-motd-update-notice';
        updateNotice.innerHTML = `🐺 <b>${t('motd.updateAvail')} ${CerberusData.latestVersion}</b> <a href="https://github.com/Cerberus-BR/FightcadePlus/releases/latest" target="_blank" style="color: #4ade80; text-decoration: underline; margin-left: 10px;">Download</a>`;
        const blocksContainer = motdWrapper.querySelector('.blocksContainer');
        if (blocksContainer) blocksContainer.appendChild(updateNotice); else motdWrapper.appendChild(updateNotice);
        motdWrapper.dataset.cerbUpdateAdded = "true";
    }
}

module.exports = {
    injectStyles, createControlPanel, createQueuePanel, renderQueueList, injectGlobalMenu,
    applyReputationStyleChat, applyReputationStyleList, applyReputationStyleMatch,
    addReputationControlsToElement, unlockColorThemes, applyTheme, setSyncBtnState,
    injectHeaderButtons, injectSidebarSearch, injectUIEnhancements, createFlagElement,
    createPingElement, createRankElement, createPingTextElement, createStatusElement, createRankBadge,
    applyDevBadge
};