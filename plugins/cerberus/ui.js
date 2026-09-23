// cerberus/ui.js

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
function getRankBadgeIcon(numericRank) {
    return numericRank <= 15 ? '👑' : (numericRank <= 200 ? '🏅' : '');
}

function getRankBadgeText(numericRank) {
    const icon = getRankBadgeIcon(numericRank);
    return t('settings.rankBadgeFormat', { icon, rank: numericRank });
}

function createRankBadge(numericRank) {
    const badge = document.createElement('span'); badge.className = 'cerb-rank-badge';
    Object.assign(badge.style, { fontSize: '12px', fontWeight: 'normal', color: '#ffd700', backgroundColor: 'transparent', border: 'none', padding: '0', marginRight: '5px', verticalAlign: 'middle', display: 'inline-block', flexShrink: '0', whiteSpace: 'nowrap' });
    badge.textContent = getRankBadgeText(numericRank);
    badge.title = t('settings.rankBadgeTitle', { rank: numericRank });
    return badge;
}

function injectStyles() {
    if (document.getElementById('cerberusStyles')) return;
    const style = document.createElement('style'); style.id = 'cerberusStyles';
    style.textContent = `
        .cerb-section-children.cerb-disabled { opacity: 0.35; pointer-events: none; user-select: none; }
        /* [CERBERUS] Eco Mode: Low GPU / CPU consumption when window loses focus */
        body.cerb-eco-mode *,
        body.cerb-eco-mode *::before,
        body.cerb-eco-mode *::after {
            animation-play-state: paused !important;
            transition: none !important;
        }
        body.cerb-eco-mode .cerb-sync-btn.syncing {
            animation: none !important;
            box-shadow: none !important;
        }
        body.cerb-eco-mode .cerb-sync-btn.syncing .cerb-spin-icon {
            animation: none !important;
        }
        body.cerb-eco-mode .usersListWrapper .userItem:not([data-cerberus-processed="true"]),
        body.cerb-eco-mode .matchesList .matchItem:not([data-cerberus-processed="true"]),
        body.cerb-eco-mode .chatContent .messageWrapper:not([data-cerberus-processed="true"]) {
            animation: none !important;
        }
        @keyframes cerbAntiFlash { 0%, 99% { opacity: 0; max-height: 0px; padding: 0px; margin: 0px; overflow: hidden; } 100% { opacity: 1; max-height: 500px; } }
        .usersListWrapper .userItem:not([data-cerberus-processed="true"]), .matchesList .matchItem:not([data-cerberus-processed="true"]), .chatContent .messageWrapper:not([data-cerberus-processed="true"]) { animation: cerbAntiFlash 0.35s forwards; }
        #settingsTab textarea::selection, #settingsTab input::selection { background: var(--accentColor, rgba(100, 149, 237, 0.5)); color: var(--mainColor-darker, #fff); }
        #settingsTab textarea::-moz-selection, #settingsTab input::-moz-selection { background: var(--accentColor, rgba(100, 149, 237, 0.5)); color: var(--mainColor-darker, #fff); }
        @keyframes cerbSpin { 100% { transform: rotate(360deg); } }
        @keyframes cerbPulseGlow { 0%, 100% { box-shadow: 0 0 4px rgba(255, 215, 0, 0.15); } 50% { box-shadow: 0 0 12px rgba(255, 215, 0, 0.4); } }
        .cerb-sync-btn { transition: width 0.3s ease, border-radius 0.3s ease, background 0.2s ease, padding 0.3s ease; margin-left: 8px; }
        .cerb-sync-btn.syncing { width: auto !important; min-width: 28px; border-radius: 14px !important; background: rgba(255, 215, 0, 0.08) !important; border: 1px solid rgba(255, 215, 0, 0.25) !important; padding: 0 10px !important; cursor: pointer !important; opacity: 1 !important; animation: cerbPulseGlow 2.5s ease-in-out infinite; gap: 5px; }
        .cerb-sync-btn.syncing .cerb-spin-icon { display: inline-block; width: 12px; height: 12px; border: 2px solid rgba(255, 215, 0, 0.25); border-top-color: #ffd700; border-radius: 50%; animation: cerbSpin 0.7s linear infinite; vertical-align: middle; flex-shrink: 0; }
        .cerb-sync-btn .cerb-sync-progress { font-size: 11px; color: #ffd700; font-weight: 600; vertical-align: middle; letter-spacing: 0.3px; white-space: nowrap; margin-left: 3px; }
        .cerb-sync-btn:hover:not(.syncing) { background: rgba(255,255,255,0.1) !important; }
        .cerb-sync-btn.syncing:hover { background: rgba(255, 68, 68, 0.12) !important; border-color: rgba(255, 68, 68, 0.4) !important; animation: none; box-shadow: 0 0 8px rgba(255, 68, 68, 0.3); }
        .cerb-sync-btn.syncing:hover .cerb-spin-icon { border-top-color: #ff6b6b; border-color: rgba(255, 68, 68, 0.25); }
        @keyframes cerbBlockPulse { 0% { background-color: rgba(255, 68, 68, 0.4); box-shadow: inset 4px 0 0px #ff4444; } 50% { background-color: rgba(255, 68, 68, 0.05); box-shadow: inset 4px 0 0px #ff4444; } 100% { background-color: transparent; box-shadow: none; } }
        .cerberus-anim-block-pulse { animation: cerbBlockPulse 2s ease-in-out 2 forwards !important; }
        
        .cerb-fabs-container {
            position: absolute;
            right: 12px;
            bottom: 58px;
            display: flex;
            flex-direction: column-reverse;
            gap: 5px;
            z-index: 100;
            pointer-events: none;
        }
        .cerb-fab-btn {
            pointer-events: auto;
            position: static !important;
            width: 120px;
            text-align: center;
            text-transform: uppercase;
            padding: 4px 8px;
            margin-bottom: 3px;
            font-size: 10px;
            letter-spacing: 0.3px;
            cursor: pointer;
            transition: all 0.2s ease;
            box-shadow: 0 2px 6px rgba(0,0,0,0.25);
            backdrop-filter: blur(6px);
            border-radius: 4px;
            opacity: 0.6;
            box-sizing: border-box;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }
        .cerb-fab-btn:hover {
            opacity: 1;
            transform: translateY(-1px);
            box-shadow: 0 4px 10px rgba(0,0,0,0.45);
            backdrop-filter: blur(10px);
        }
        .cerb-clear-chat-fab {
            background: rgba(20, 20, 26, 0.45);
            border: 1px solid rgba(255, 255, 255, 0.1);
            color: #94a3b8;
        }
        .cerb-clear-chat-fab:hover {
            background: rgba(35, 35, 48, 0.8);
            color: #fff;
            border-color: rgba(255, 255, 255, 0.25);
        }
        .cerb-mute-chat-fab {
            background: rgba(20, 20, 26, 0.45);
            border: 1px solid rgba(255, 255, 255, 0.1);
            color: #94a3b8;
        }
        .cerb-mute-chat-fab:hover {
            background: rgba(35, 35, 48, 0.8);
            color: #fff;
            border-color: rgba(255, 255, 255, 0.25);
        }
        .cerb-mute-chat-fab[data-muted="true"] {
            border-color: rgba(251, 191, 36, 0.5);
            color: #fbbf24;
            background: rgba(251, 191, 36, 0.15);
            opacity: 0.8;
        }
        .cerb-mute-chat-fab[data-muted="true"]:hover {
            border-color: rgba(251, 191, 36, 0.85);
            color: #fff;
            background: rgba(251, 191, 36, 0.28);
            opacity: 1;
        }
        .cerb-queue-fab {
            background: rgba(20, 20, 26, 0.45);
            border: 1px solid var(--accentColor, rgba(99, 102, 241, 0.25));
            color: var(--accentColor, #a5b4fc);
        }
        .cerb-queue-fab:hover {
            background: rgba(99, 102, 241, 0.2);
            color: #fff;
            border-color: var(--accentColor, #818cf8);
        }
        .cerb-queue-fab[data-live="true"] {
            border-color: rgba(74, 222, 128, 0.5);
            color: #4ade80;
            background: rgba(74, 222, 128, 0.12);
            opacity: 0.8;
        }
        .cerb-queue-fab[data-live="true"]:hover {
            border-color: rgba(74, 222, 128, 0.85);
            color: #fff;
            background: rgba(74, 222, 128, 0.22);
            opacity: 1;
        }
        .cerb-sim-fab {
            background: rgba(20, 20, 26, 0.45);
            border: 1px solid var(--accentColor, rgba(99, 102, 241, 0.25));
            color: var(--accentColor, #a5b4fc);
        }
        .cerb-sim-fab:hover {
            background: rgba(99, 102, 241, 0.2);
            color: #fff;
            border-color: var(--accentColor, #818cf8);
        }
        
        .q-live-btn { border: 1px solid rgba(255,255,255,0.1); border-radius: 4px; padding: 5px 10px; font-size: 11px; font-weight: bold; cursor: pointer; transition: all 0.2s; color: white; }
        .q-live-btn.on { background: rgba(0, 170, 0, 0.3); border-color: #00aa00; }
        .q-live-btn.on:hover { background: rgba(0, 170, 0, 0.5); }
        .q-live-btn.off { background: rgba(170, 0, 0, 0.3); border-color: #ff4444; }
        .q-live-btn.off:hover { background: rgba(170, 0, 0, 0.5); }
        .cerb-motd-update-notice { background: rgba(255, 165, 0, 0.15); border-left: 4px solid #ffaa00; padding: 10px 15px; margin-top: 15px; border-radius: 4px; color: #ffdca5; font-size: 13px; display: inline-block; width: calc(100% - 10px); box-sizing: border-box; line-height: 1.4; }
        .cerb-motd-remote-notice { padding: 10px 15px; margin-top: 10px; border-radius: 4px; font-size: 13px; display: inline-block; width: calc(100% - 10px); box-sizing: border-box; line-height: 1.4; word-break: break-word; }
        .cerb-motd-remote-notice.info { background: rgba(56, 189, 248, 0.15); border-left: 4px solid #38bdf8; color: #bae6fd; }
        .cerb-motd-remote-notice.warning { background: rgba(251, 191, 36, 0.15); border-left: 4px solid #fbbf24; color: #fef08a; }
        .cerb-motd-remote-notice.success { background: rgba(74, 222, 128, 0.15); border-left: 4px solid #4ade80; color: #bbf7d0; }
        .cerb-motd-remote-notice a { color: #a3bffa; text-decoration: underline; margin-left: 10px; font-weight: bold; }
        .cerb-motd-remote-notice a:hover { color: #ffffff; }
        .messageWrapper.motd { position: relative !important; }
        .messageWrapper.motd.cerb-motd-dismissed .motd { display: none !important; }
        .messageWrapper.motd.cerb-motd-dismissed .cerb-motd-dismiss-btn { display: none !important; }
        .messageWrapper.motd.cerb-motd-dismissed .cerb-motd-collapsed-bar { display: flex !important; }
        .messageWrapper.motd:not(.cerb-motd-dismissed) .cerb-motd-collapsed-bar { display: none !important; }
        .messageWrapper.motd:not(.cerb-motd-dismissed) .cerb-motd-dismiss-btn { display: block !important; }
        .cerb-motd-dismiss-btn {
            position: absolute;
            top: 4px;
            right: 6px;
            background: rgba(0, 0, 0, 0.25);
            border: 1px solid rgba(255, 255, 255, 0.08);
            color: #9ca3af;
            font-size: 10px;
            font-weight: 500;
            padding: 2px 6px;
            border-radius: 3px;
            cursor: pointer;
            z-index: 10;
            opacity: 0.55;
            transition: all 0.2s ease;
            backdrop-filter: blur(4px);
        }
        .cerb-motd-dismiss-btn:hover {
            opacity: 1;
            background: rgba(239, 68, 68, 0.3);
            border-color: rgba(239, 68, 68, 0.45);
            color: #ffffff;
        }
        .cerb-motd-collapsed-bar {
            display: flex;
            align-items: center;
            justify-content: space-between;
            background: rgba(10, 10, 14, 0.4);
            border: 1px solid rgba(255, 255, 255, 0.05);
            border-left: 2px solid var(--accentColor, rgba(99, 102, 241, 0.4));
            padding: 3px 8px;
            border-radius: 4px;
            font-size: 10px;
            color: #71717a;
            margin: 2px 0;
            backdrop-filter: blur(4px);
        }
        .cerb-motd-expand-btn {
            background: transparent;
            border: none;
            color: var(--accentColor, #818cf8);
            font-size: 10px;
            font-weight: 500;
            text-decoration: underline;
            cursor: pointer;
            padding: 0 4px;
            transition: color 0.2s ease;
        }
        .cerb-motd-expand-btn:hover {
            color: #ffffff;
        }
        
        #cerberusSimulatorWindow {
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 490px;
            max-width: 95vw;
            background: rgba(30, 36, 48, 0.96);
            border: 1px solid var(--accentColor, rgba(99, 102, 241, 0.45));
            border-radius: 12px;
            box-shadow: 0 16px 40px rgba(0, 0, 0, 0.6), 0 0 24px rgba(99, 102, 241, 0.2);
            backdrop-filter: blur(16px);
            z-index: 100001;
            display: flex;
            flex-direction: column;
            overflow: hidden;
            color: #f1f5f9;
            font-family: inherit;
        }
        .sim-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 10px 16px;
            background: rgba(255, 255, 255, 0.07);
            border-bottom: 1px solid rgba(255, 255, 255, 0.12);
            cursor: move;
            user-select: none;
        }
        .sim-title { font-weight: bold; font-size: 13px; color: #fff; }
        .sim-close { background: none; border: none; font-size: 20px; color: #cbd5e1; cursor: pointer; line-height: 1; }
        .sim-close:hover { color: #f87171; }
        .sim-body { padding: 14px; max-height: 80vh; overflow-y: auto; }
        .sim-controls-grid { display: flex; align-items: center; gap: 8px; margin-bottom: 12px; }
        .sim-player-box { flex: 1; background: rgba(255, 255, 255, 0.05); padding: 8px 10px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.1); }
        .sim-box-title { font-size: 11px; font-weight: bold; color: #cbd5e1; margin-bottom: 6px; }
        .sim-input-row { display: flex; gap: 6px; margin-bottom: 6px; }
        .sim-select, .sim-input {
            background: rgba(16, 22, 32, 0.7);
            border: 1px solid rgba(255, 255, 255, 0.18);
            color: #fff;
            padding: 4px 6px;
            border-radius: 4px;
            font-size: 11px;
            box-sizing: border-box;
        }
        .sim-select { flex: 1.2; width: 60%; }
        .sim-input { width: 40%; text-align: center; }
        .sim-btn-secondary {
            width: 100%;
            background: rgba(99, 102, 241, 0.25);
            border: 1px solid rgba(99, 102, 241, 0.45);
            color: #c7d2fe;
            font-size: 10px;
            font-weight: 600;
            padding: 3px 6px;
            border-radius: 4px;
            cursor: pointer;
            transition: all 0.2s;
        }
        .sim-btn-secondary:hover { background: rgba(99, 102, 241, 0.45); color: #fff; }
        .sim-vs-box { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 4px; padding: 0 4px; }
        .sim-vs-badge { font-size: 11px; font-weight: 900; color: #fbbf24; background: rgba(251, 191, 36, 0.2); padding: 2px 6px; border-radius: 4px; border: 1px solid rgba(251, 191, 36, 0.35); }
        .sim-ft-select-wrap { display: flex; flex-direction: column; align-items: center; font-size: 10px; color: #cbd5e1; }
        .sim-select-compact { background: rgba(16, 22, 32, 0.7); border: 1px solid rgba(255, 255, 255, 0.18); color: #fff; border-radius: 4px; font-size: 10px; padding: 2px 4px; margin-top: 2px; }
        .sim-elo-source, .sim-note { font-size: 12px; color: #cbd5e1; line-height: 1.4; margin-top: 6px; }
        .sim-note { margin: 0 0 10px; }
        .sim-summary-card { margin-bottom: 12px; padding: 8px 12px; border-radius: 6px; font-size: 11px; line-height: 1.4; }
        .sim-summary-card.high_reward { background: rgba(74, 222, 128, 0.15); border-left: 3px solid #4ade80; color: #bbf7d0; }
        .sim-summary-card.balanced { background: rgba(251, 191, 36, 0.15); border-left: 3px solid #fbbf24; color: #fef08a; }
        .sim-summary-card.high_risk { background: rgba(248, 113, 113, 0.15); border-left: 3px solid #f87171; color: #fecaca; }
        .sim-summary-card.unranked { background: rgba(255, 255, 255, 0.08); border-left: 3px solid #94a3b8; color: #cbd5e1; }
        .sim-table-wrap { max-height: 220px; overflow-y: auto; background: rgba(16, 22, 32, 0.55); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 6px; }
        .sim-table { width: 100%; border-collapse: collapse; font-size: 11px; text-align: left; }
        .sim-table th { background: rgba(255, 255, 255, 0.08); padding: 6px 8px; color: #cbd5e1; font-weight: bold; border-bottom: 1px solid rgba(255, 255, 255, 0.12); position: sticky; top: 0; }
        .sim-table td { padding: 5px 8px; border-bottom: 1px solid rgba(255, 255, 255, 0.04); }
        .sim-table tr { transition: background 0.15s ease; }
        
        /* Escala de 4 tonalidades de Verde (Ganho de pontos) */
        .sim-row.gain-4 { color: #4ade80; font-weight: 700; }
        .sim-row.gain-3 { color: #86efac; font-weight: 600; }
        .sim-row.gain-2 { color: #a7f3d0; font-weight: 500; }
        .sim-row.gain-1 { color: #cbfadb; font-weight: 500; }
        
        /* Neutro (Saldo Zero) */
        .sim-row.neutral { color: #94a3b8; }
        
        /* Escala de 4 tonalidades de Vermelho (Perda de pontos) */
        .sim-row.loss-1 { color: #fee2e2; font-weight: 500; }
        .sim-row.loss-2 { color: #fecaca; font-weight: 500; }
        .sim-row.loss-3 { color: #fca5a5; font-weight: 600; }
        .sim-row.loss-4 { color: #f87171; font-weight: 700; }

        .sim-row.gain-4:hover { background: rgba(74, 222, 128, 0.14); }
        .sim-row.gain-3:hover { background: rgba(134, 239, 172, 0.12); }
        .sim-row.gain-2:hover { background: rgba(167, 243, 208, 0.10); }
        .sim-row.gain-1:hover { background: rgba(203, 250, 219, 0.08); }
        .sim-row.neutral:hover { background: rgba(255, 255, 255, 0.06); }
        .sim-row.loss-1:hover { background: rgba(254, 226, 226, 0.08); }
        .sim-row.loss-2:hover { background: rgba(254, 202, 202, 0.10); }
        .sim-row.loss-3:hover { background: rgba(252, 165, 165, 0.12); }
        .sim-row.loss-4:hover { background: rgba(248, 113, 113, 0.14); }
        
        body.cerb-hide-sidebar-ping .usersListToolbar .userItem .pingWrapper img.ping { display: none !important; }
        
        .cerb-net-icon {
            display: inline-block;
            vertical-align: middle;
            width: 12px;
            height: 12px;
            margin-right: 3px;
            flex-shrink: 0;
        }
        .cerb-net-cable {
            mask: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="8" rx="2" ry="2"></rect><rect x="6" y="14" width="12" height="8" rx="2"></rect><line x1="6" y1="6" x2="6.01" y2="6"></line><line x1="10" y1="6" x2="10.01" y2="6"></line><line x1="12" y1="10" x2="12" y2="14"></line></svg>') no-repeat center / contain;
            -webkit-mask: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="8" rx="2" ry="2"></rect><rect x="6" y="14" width="12" height="8" rx="2"></rect><line x1="6" y1="6" x2="6.01" y2="6"></line><line x1="10" y1="6" x2="10.01" y2="6"></line><line x1="12" y1="10" x2="12" y2="14"></line></svg>') no-repeat center / contain;
            background-color: #cccccc;
        }
        .cerb-net-wifi {
            mask: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.55a11 11 0 0 1 14.08 0"></path><path d="M1.42 9a16 16 0 0 1 21.16 0"></path><path d="M8.53 16.11a6 6 0 0 1 6.95 0"></path><line x1="12" y1="20" x2="12.01" y2="20"></line></svg>') no-repeat center / contain;
            -webkit-mask: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.55a11 11 0 0 1 14.08 0"></path><path d="M1.42 9a16 16 0 0 1 21.16 0"></path><path d="M8.53 16.11a6 6 0 0 1 6.95 0"></path><line x1="12" y1="20" x2="12.01" y2="20"></line></svg>') no-repeat center / contain;
            background-color: #fbbf24;
        }
        .cerb-net-vpn {
            mask: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>') no-repeat center / contain;
            -webkit-mask: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>') no-repeat center / contain;
            background-color: #ff4444;
        }
        .challengeContent,
        .challengeContainer,
        .challengeWrapper,
        .requestChallenge,
        .message.challenge,
        .message.challengeSent,
        .message.challengeReceived {
            flex-wrap: wrap !important;
        }
        .challengeContainer {
            display: flex !important;
            flex-wrap: wrap !important;
            width: 100% !important;
            box-sizing: border-box !important;
        }
        .challengeContainer > .title {
            flex: 1 1 auto !important;
            min-width: 0 !important;
        }
        .cerb-challenge-elo-hint {
            display: block !important;
            font-size: 11px;
            padding: 6px 10px;
            margin: 6px 0 0 0 !important;
            width: 100% !important;
            flex-basis: 100% !important;
            box-sizing: border-box !important;
            border-radius: 4px;
            background: rgba(0, 0, 0, 0.35);
            border-left: 3px solid #00d2ff;
            color: #ececec;
            line-height: 1.45;
            overflow-wrap: break-word;
            word-break: break-word;
            user-select: text;
        }
        .cerb-challenge-elo-hint.high_risk { border-left-color: #ff4444; color: #ff9999; }
        .cerb-challenge-elo-hint.high_reward { border-left-color: #00ff88; color: #a3ffcc; }
        .cerb-challenge-elo-hint.balanced { border-left-color: #fbbf24; color: #fde68a; }
        .cerb-challenge-elo-hint.unranked { border-left-color: #888888; color: #cccccc; }

        .cerb-endgame-elo-box {
            margin-top: 6px;
            padding: 6px 10px;
            box-sizing: border-box;
            width: 100%;
            background: rgba(0, 0, 0, 0.25);
            border: 1px solid rgba(255, 255, 255, 0.12);
            border-radius: 6px;
            font-size: 11px;
            color: #ddd;
            line-height: 1.4;
            overflow-wrap: break-word;
            word-break: break-word;
            user-select: text;
        }
        .cerb-endgame-result-row {
            display: flex;
            flex-direction: column;
            gap: 3px;
            font-weight: 500;
        }
        .cerb-endgame-player {
            display: flex;
            align-items: center;
            gap: 6px;
            font-size: 11px;
            overflow-wrap: break-word;
        }
        .cerb-endgame-delta.gain { color: #a3e635; font-weight: 600; }
        .cerb-endgame-warning-row {
            display: flex;
            align-items: center;
            gap: 10px;
            margin-top: 6px;
            padding: 6px 10px;
            width: fit-content;
            max-width: 440px;
            box-sizing: border-box;
            border: 1px dotted rgba(251, 191, 36, 0.65);
            background: rgba(251, 191, 36, 0.08);
            border-radius: 6px;
            color: #fbbf24;
        }
        .cerb-warning-icon {
            font-size: 22px;
            flex-shrink: 0;
            line-height: 1;
            user-select: none;
        }
        .cerb-warning-text {
            font-size: 11px;
            font-weight: 500;
            line-height: 1.35;
            overflow-wrap: break-word;
        }
        .cerb-endgame-motivation-row { margin-top: 5px; font-size: 11px; line-height: 1.35; padding-top: 4px; border-top: 1px solid rgba(255, 255, 255, 0.08); font-weight: 500; overflow-wrap: break-word; }
        .cerb-endgame-motivation-row.win { color: #a3e635; }
        .cerb-endgame-motivation-row.profit { color: #38bdf8; }
        .cerb-endgame-motivation-row.defeat { color: #f87171; }
        .cerb-rank-badge { flex-shrink: 0; white-space: nowrap; }

        .chatContent { padding-bottom: 20px !important; }
        .chatContent.blur-all .message .line .blocksContainer { filter: blur(5px); transition: filter 0.2s ease; user-select: none; }
        .chatContent.blur-all:hover .message .line .blocksContainer { filter: blur(0); user-select: text; }
        #cerbGlobalMenu { position: fixed; background: var(--mainColor-dark, rgba(18, 18, 26, 0.95)); backdrop-filter: blur(12px); border: 1px solid var(--accentColor, var(--mainColor-light, rgba(102, 126, 234, 0.4))); border-radius: 14px; padding: 6px 12px; box-shadow: 0 10px 30px rgba(0, 0, 0, 0.7), 0 0 15px var(--accentColor, rgba(102, 126, 234, 0.25)); display: flex; align-items: center; gap: 8px; z-index: 100000; opacity: 0; pointer-events: none; transition: opacity 0.2s ease, transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1); transform: scale(0.9) translateY(6px); user-select: none; white-space: nowrap; }
        #cerbGlobalMenu.visible { opacity: 1; pointer-events: auto; transform: scale(1) translateY(0); }
        #cerbGlobalMenu .cerb-action-icon { cursor: pointer; font-size: 16px; transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1), filter 0.2s ease; display: inline-block; padding: 3px 5px; line-height: 1; }
        #cerbGlobalMenu .cerb-action-icon:hover { transform: scale(1.35) translateY(-2px); filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.6)); }
        .cerb-menu-divider { width: 1px; height: 18px; background: rgba(255, 255, 255, 0.2); margin: 0 3px; }
        .userItem { position: relative; padding-right: 2em !important; }
        .playerInfo { position: relative; }
        .userItem .flagWrapper { transition: opacity 0.15s ease, visibility 0.15s ease; }
        .userItem:hover .flagWrapper { opacity: 0 !important; visibility: hidden !important; }
        .playerInfo .rank, .playerInfo img.rank, .playerInfo .playerRank, .playerInfo .rankImg, .playerInfo img[src*="rank"], .playerInfo .cerb-rank-badge, .playerInfo .cerberus-injected-rank { transition: opacity 0.15s ease, visibility 0.15s ease; }
        .playerInfo:hover .rank, .playerInfo:hover img.rank, .playerInfo:hover .playerRank, .playerInfo:hover .rankImg, .playerInfo:hover img[src*="rank"], .playerInfo:hover .cerb-rank-badge, .playerInfo:hover .cerberus-injected-rank { opacity: 0 !important; visibility: hidden !important; }

        .cerb-flag-trigger {
            display: none;
            position: absolute;
            top: 50%;
            transform: translateY(-50%);
            width: 16px;
            height: 16px;
            mask: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path></svg>') no-repeat center / contain;
            -webkit-mask: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path></svg>') no-repeat center / contain;
            background-color: #cccccc;
            cursor: pointer;
            z-index: 5;
            user-select: none;
            transition: transform 0.15s ease, background-color 0.15s ease;
        }

        .playerInfo .cerb-flag-trigger { left: 2px; }

        .userItem:hover .cerb-flag-trigger, .playerInfo:hover .cerb-flag-trigger { display: block; }
        .cerb-flag-trigger:hover {
            mask: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="black" stroke="black" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path></svg>') no-repeat center / contain;
            -webkit-mask: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="black" stroke="black" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path></svg>') no-repeat center / contain;
            background-color: var(--accentColor, var(--mainColor-light, #667eea));
            transform: translateY(-50%) scale(1.25);
        }

        .cerb-chat-trigger {
            width: 15px;
            height: 15px;
            mask: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path></svg>') no-repeat center / contain;
            -webkit-mask: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path></svg>') no-repeat center / contain;
            background-color: #cccccc;
            cursor: pointer;
            margin: 0 4px;
            display: inline-block;
            opacity: 0.8;
            transition: transform 0.15s ease, opacity 0.15s ease, background-color 0.15s ease;
            user-select: none;
            vertical-align: middle;
        }

        .cerb-chat-trigger:hover {
            opacity: 1;
            mask: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="black" stroke="black" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path></svg>') no-repeat center / contain;
            -webkit-mask: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="black" stroke="black" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path></svg>') no-repeat center / contain;
            background-color: var(--accentColor, var(--mainColor-light, #667eea));
            transform: scale(1.25);
        }
        
        .cerb-update-btn { display: inline-block; margin-top: 20px; padding: 10px 20px; background: var(--mainColor-darker, rgba(0,0,0,0.25)); border: 1px solid var(--accentColor, var(--mainColor-light, rgba(102, 126, 234, 0.4))); border-radius: 8px; color: var(--accentColor, var(--mainColor-lighter, #a3bffa)); text-decoration: none; font-weight: 600; transition: all 0.2s ease; font-size: 14px; }
        .cerb-update-btn:hover { background: var(--accentColor, var(--mainColor-light, rgba(102, 126, 234, 0.3))); color: var(--mainColor-darker, #000); transform: translateY(-2px); box-shadow: 0 4px 12px var(--accentColor, rgba(0,0,0, 0.3)); }
        .cerb-donate-btn { display: inline-flex; align-items: center; justify-content: center; padding: 8px 16px; border-radius: 6px; font-weight: bold; font-size: 13px; text-decoration: none; transition: all 0.2s ease; box-shadow: 0 2px 5px rgba(0,0,0,0.3); flex: 1; }
        .cerb-donate-btn:hover { transform: translateY(-2px); box-shadow: 0 4px 10px rgba(0,0,0,0.4); }
        .cerb-donate-paypal { background: #00457C; color: #fff; border: 1px solid #005A9C; }
        .cerb-donate-livepix { background: #00FF87; color: #000; border: 1px solid #00CC6A; }

        #cerberusPanel {
            position: fixed;
            width: 480px;
            max-height: 85vh;
            background: rgba(22, 27, 38, 0.96);
            backdrop-filter: blur(20px);
            border: 1px solid rgba(255, 255, 255, 0.12);
            border-radius: 12px;
            z-index: 10000;
            color: #f1f5f9;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.65), 0 0 1px rgba(255, 255, 255, 0.15);
            display: none;
            overflow: hidden;
            flex-direction: column;
        }
        @media (max-width: 768px) { #cerberusPanel { width: 95%; max-height: 90vh; } }
        
        #cerberusPanel .header, #cerberusQueueWindow .q-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 12px 18px;
            background: rgba(255, 255, 255, 0.04);
            border-bottom: 1px solid rgba(255, 255, 255, 0.08);
            cursor: move;
            user-select: none;
        }
        #cerberusPanel .header .title, #cerberusQueueWindow .q-title {
            display: flex;
            align-items: center;
            gap: 8px;
            font-size: 14px;
            font-weight: 600;
            color: #ffffff;
            letter-spacing: 0.3px;
        }
        #cerberusPanel .closeBtn, #cerberusQueueWindow .q-close {
            background: transparent;
            border: none;
            color: #94a3b8;
            font-size: 20px;
            cursor: pointer;
            width: 28px;
            height: 28px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 6px;
            transition: all 0.15s ease;
        }
        #cerberusPanel .closeBtn:hover, #cerberusQueueWindow .q-close:hover {
            background: rgba(239, 68, 68, 0.2);
            color: #f87171;
        }
        
        #cerberusPanel .tabs {
            display: flex;
            background: rgba(14, 18, 26, 0.5);
            padding: 6px 12px;
            gap: 6px;
            border-bottom: 1px solid rgba(255, 255, 255, 0.06);
        }
        #cerberusPanel .tab {
            padding: 6px 14px;
            background: transparent;
            border: none;
            border-radius: 6px;
            color: #94a3b8;
            cursor: pointer;
            font-size: 12px;
            font-weight: 500;
            transition: all 0.15s ease;
        }
        #cerberusPanel .tab:hover:not(.disabled) {
            color: #f1f5f9;
            background: rgba(255, 255, 255, 0.04);
        }
        #cerberusPanel .tab.active {
            color: #ffffff;
            background: rgba(255, 255, 255, 0.09);
            font-weight: 600;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
        }
        #cerberusPanel .tab.disabled {
            opacity: 0.35;
            cursor: not-allowed;
        }
        
        #cerberusPanel .content {
            flex: 1;
            overflow-y: auto;
            padding: 16px;
        }
        
        .cerb-settings-card {
            background: rgba(255, 255, 255, 0.03);
            border: 1px solid rgba(255, 255, 255, 0.07);
            border-radius: 10px;
            overflow: hidden;
            margin-bottom: 16px;
        }
        .cerb-card-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 10px 14px;
            background: rgba(255, 255, 255, 0.03);
            border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }
        .cerb-card-title {
            margin: 0;
            font-size: 12px;
            text-transform: uppercase;
            color: var(--accentColor, #818cf8);
            letter-spacing: 0.6px;
            font-weight: 700;
        }
        
        .modern-toggle {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 9px 14px;
            background: transparent;
            border: none;
            border-bottom: 1px solid rgba(255, 255, 255, 0.04);
            transition: background 0.15s ease;
        }
        .cerb-settings-card .modern-toggle:last-child {
            border-bottom: none;
        }
        .modern-toggle:hover {
            background: rgba(255, 255, 255, 0.02);
        }
        .modern-toggle span {
            font-size: 13px;
            color: #e2e8f0;
        }
        
        .switch {
            position: relative;
            display: inline-block;
            width: 36px;
            height: 20px;
            flex-shrink: 0;
        }
        .switch input { opacity: 0; width: 0; height: 0; }
        .slider {
            position: absolute;
            cursor: pointer;
            top: 0; left: 0; right: 0; bottom: 0;
            background-color: rgba(255, 255, 255, 0.15);
            transition: .25s ease;
            border-radius: 20px;
            border: 1px solid rgba(255, 255, 255, 0.1);
        }
        .slider:before {
            position: absolute;
            content: "";
            height: 14px;
            width: 14px;
            left: 2px;
            bottom: 2px;
            background-color: #ffffff;
            transition: .25s ease;
            border-radius: 50%;
            box-shadow: 0 1px 3px rgba(0,0,0,0.4);
        }
        input:checked + .slider {
            background-color: var(--accentColor, #6366f1);
            border-color: var(--accentColor, #6366f1);
            box-shadow: 0 0 8px var(--accentColor, rgba(99, 102, 241, 0.35));
        }
        .cerb-section-children input:checked + .slider,
        .modern-toggle input:checked + .slider {
            box-shadow: none;
        }
        input:checked + .slider:before {
            transform: translateX(16px);
            background-color: #ffffff;
        }
        
        .search-bar {
            width: 100%;
            padding: 8px 12px;
            background: rgba(14, 18, 26, 0.65);
            border: 1px solid rgba(255, 255, 255, 0.12);
            border-radius: 6px;
            color: #f8fafc;
            margin-bottom: 12px;
            font-size: 13px;
            outline: none;
            box-sizing: border-box;
            transition: border-color 0.15s ease, box-shadow 0.15s ease;
        }
        .search-bar:focus {
            border-color: var(--accentColor, #818cf8);
            box-shadow: 0 0 0 2px var(--accentColor, rgba(99, 102, 241, 0.2));
        }
        #cerberusQueueWindow { position: fixed; right: 20px; bottom: 150px; width: 320px; max-height: 400px; background: rgba(22, 27, 38, 0.96); backdrop-filter: blur(20px); border: 1px solid var(--accentColor, rgba(99, 102, 241, 0.4)); border-radius: 12px; z-index: 10000; color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; box-shadow: 0 10px 30px rgba(0, 0, 0, 0.7); display: flex; flex-direction: column; overflow: hidden; }
        #cerbQueueCount { color: var(--accentColor, #a5b4fc); margin-left: 5px; font-size: 12px; }
        .q-add-box { display: flex; padding: 10px; background: rgba(14, 18, 26, 0.5); border-bottom: 1px solid rgba(255,255,255,0.06); gap: 8px; }
        .q-add-box input { flex: 1; padding: 6px 10px; background: rgba(14, 18, 26, 0.65); border: 1px solid rgba(255,255,255,0.12); border-radius: 4px; color: #fff; font-size: 12px; outline: none; }
        .q-add-box input:focus { border-color: var(--accentColor, #818cf8); }
        .q-add-box button { background: var(--accentColor, #6366f1); color: #ffffff; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer; font-size: 12px; font-weight: bold; transition: all 0.2s; text-transform: uppercase; }
        .q-add-box button:hover { filter: brightness(1.15); box-shadow: 0 0 8px var(--accentColor); }
        .q-list { flex: 1; overflow-y: auto; padding: 10px; display: flex; flex-direction: column; gap: 6px; }
        .q-empty { text-align: center; color: #888; font-size: 12px; padding: 20px 0; font-style: italic; }
        .q-item { display: flex; justify-content: space-between; align-items: center; background: rgba(255,255,255,0.03); padding: 8px 12px; border-radius: 6px; border-left: 3px solid var(--accentColor, #6366f1); }
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
    const targetParent = document.getElementById('app') || document.body;
    targetParent.appendChild(panel); makeDraggable(panel, 'cerberusHeader');

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

    const createSection = (title, items) => `
        <div class="cerb-settings-card">
            <div class="cerb-card-header"><h4 class="cerb-card-title">${title}</h4></div>
            <div>${items}</div>
        </div>
    `;

    const createMasterSection = (masterKey, title, childrenId, items) => {
        const enabled = ConfigManager.getSetting(masterKey) === true;
        const headerToggle = `<label class="switch"><input type="checkbox" data-setting="${masterKey}" data-master-for="${childrenId}" ${enabled ? 'checked' : ''}><span class="slider"></span></label>`;
        const header = `<div class="cerb-card-header"><h4 class="cerb-card-title">${title}</h4>${headerToggle}</div>`;
        return `<div class="cerb-settings-card">${header}<div id="${childrenId}" class="cerb-section-children ${enabled ? '' : 'cerb-disabled'}">${items}</div></div>`;
    };

    const settingToggle = (key, label) => {
        const val = ConfigManager.getSetting(key) === true;
        return `<div class="modern-toggle"><span>${label}</span><label class="switch"><input type="checkbox" data-setting="${key}" ${val ? 'checked' : ''}><span class="slider"></span></label></div>`;
    };

    const escapeHtml = (str) => String(str ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');

    const settingInput = (key, label, type = "text") => {
        let val = ConfigManager.getSetting(key) ?? '';
        if (type === 'textarea') {
            const displayVal = String(val).replace(/\\n/g, '\n');
            return `<div class="modern-toggle" style="flex-direction: column; align-items: stretch; gap: 6px;"><span>${label}</span><textarea data-setting="${key}" rows="3" style="background: rgba(14, 18, 26, 0.65); color: #f8fafc; border: 1px solid rgba(255,255,255,0.12); padding: 6px 8px; border-radius: 6px; outline: none; width: 100%; box-sizing: border-box; resize: vertical; font-family: inherit; font-size: 12px; line-height: 1.4;">${escapeHtml(displayVal)}</textarea></div>`;
        }
        return `<div class="modern-toggle"><span>${label}</span><input type="${type}" data-setting="${key}" value="${escapeHtml(val)}" style="background: rgba(14, 18, 26, 0.65); color: #f8fafc; border: 1px solid rgba(255,255,255,0.12); padding: 4px 8px; border-radius: 6px; outline: none; width: 90px; text-align: center; font-size: 12px;"></div>`;
    };

    const settingSelect = (key, label, options) => {
        const currentVal = ConfigManager.getSetting(key) || options[0].value;
        const optsHtml = options.map(opt => `<option value="${opt.value}" ${currentVal == opt.value ? 'selected' : ''}>${opt.text}</option>`).join('');
        return `<div class="modern-toggle"><span>${label}</span><select data-setting="${key}" style="background: rgba(14, 18, 26, 0.65); color: #f8fafc; border: 1px solid rgba(255,255,255,0.12); padding: 4px 8px; border-radius: 6px; outline: none; font-size: 12px; cursor: pointer;">${optsHtml}</select></div>`;
    };

    const blurToggle = () => {
        const isAll = ConfigManager.getSetting('chatUserInfo.blurMode') === 'all';
        return `<div class="modern-toggle"><span>${t('settings.blurMode')}</span><label class="switch"><input type="checkbox" data-setting="chatUserInfo.blurMode" data-blur-toggle="true" ${isAll ? 'checked' : ''}><span class="slider"></span></label></div>`;
    };

    const langSelect = `
        <div class="cerb-settings-card">
            <div class="modern-toggle" style="padding: 10px 14px;">
                <span style="font-weight: 600; color: #fff;">🌐 ${t('settings.language')}</span>
                <select id="cerbLangSelect" data-setting="language" style="background: rgba(14, 18, 26, 0.65); color: #f8fafc; border: 1px solid rgba(255,255,255,0.14); padding: 5px 10px; border-radius: 6px; outline: none; font-size: 12px; cursor: pointer;">
                    <option value="en" ${ConfigManager.getSetting('language') === 'en' ? 'selected' : ''}>🇺🇸 English</option>
                    <option value="pt" ${ConfigManager.getSetting('language') === 'pt' ? 'selected' : ''}>🇧🇷 Português</option>
                    <option value="es" ${ConfigManager.getSetting('language') === 'es' ? 'selected' : ''}>🇪🇸 Español</option>
                </select>
            </div>
        </div>
    `;

    // [CERBERUS] Custom Audio Block with Test Player
    const soundPref = ConfigManager.getSetting('chatUserInfo.challengeSound') || 'native';
    const isAudioDisabled = soundPref === 'native' || soundPref === 'silent';
    const customAudioSelect = `
        <div class="modern-toggle" style="flex-direction: column; align-items: stretch; gap: 6px;">
            <span>${t('settings.challengeSound')}</span>
            <div style="display: flex; gap: 6px; width: 100%;">
                <select id="cerbAudioSelect" data-setting="chatUserInfo.challengeSound" style="flex: 1; background: rgba(14, 18, 26, 0.65); color: #f8fafc; border: 1px solid rgba(255,255,255,0.12); padding: 5px 8px; border-radius: 6px; outline: none; font-size: 12px;">
                    <option value="native" ${soundPref === 'native' ? 'selected' : ''}>${t('settings.soundNative')}</option>
                    <option value="custom1" ${soundPref === 'custom1' ? 'selected' : ''}>${t('settings.soundCustom1')}</option>
                    <option value="custom2" ${soundPref === 'custom2' ? 'selected' : ''}>${t('settings.soundCustom2')}</option>
                    <option value="custom3" ${soundPref === 'custom3' ? 'selected' : ''}>${t('settings.soundCustom3')}</option>
                    <option value="custom4" ${soundPref === 'custom4' ? 'selected' : ''}>${t('settings.soundCustom4')}</option>
                    <option value="custom5" ${soundPref === 'custom5' ? 'selected' : ''}>${t('settings.soundCustom5')}</option>
                    <option value="custom6" ${soundPref === 'custom6' ? 'selected' : ''}>${t('settings.soundCustom6')}</option>
                    <option value="custom7" ${soundPref === 'custom7' ? 'selected' : ''}>${t('settings.soundCustom7')}</option>
                    <option value="custom8" ${soundPref === 'custom8' ? 'selected' : ''}>${t('settings.soundCustom8')}</option>
					<option value="custom9" ${soundPref === 'custom9' ? 'selected' : ''}>${t('settings.soundCustom9')}</option>
					<option value="custom10" ${soundPref === 'custom10' ? 'selected' : ''}>${t('settings.soundCustom10')}</option>
					<option value="custom11" ${soundPref === 'custom11' ? 'selected' : ''}>${t('settings.soundCustom11')}</option>
					<option value="custom12" ${soundPref === 'custom12' ? 'selected' : ''}>${t('settings.soundCustom12')}</option>
					<option value="custom13" ${soundPref === 'custom13' ? 'selected' : ''}>${t('settings.soundCustom13')}</option>
					<option value="custom14" ${soundPref === 'custom14' ? 'selected' : ''}>${t('settings.soundCustom14')}</option>
					<option value="custom15" ${soundPref === 'custom15' ? 'selected' : ''}>${t('settings.soundCustom15')}</option>
					<option value="custom16" ${soundPref === 'custom16' ? 'selected' : ''}>${t('settings.soundCustom16')}</option>
					<option value="custom17" ${soundPref === 'custom17' ? 'selected' : ''}>${t('settings.soundCustom17')}</option>
					<option value="custom18" ${soundPref === 'custom18' ? 'selected' : ''}>${t('settings.soundCustom18')}</option>
					<option value="custom19" ${soundPref === 'custom19' ? 'selected' : ''}>${t('settings.soundCustom19')}</option>
					<option value="custom20" ${soundPref === 'custom20' ? 'selected' : ''}>${t('settings.soundCustom20')}</option>
                    <option value="silent" ${soundPref === 'silent' ? 'selected' : ''}>${t('settings.soundSilent')}</option>
                </select>
                <button id="cerbAudioPlayBtn" ${isAudioDisabled ? 'disabled style="opacity: 0.3; cursor: not-allowed;"' : 'style="cursor: pointer;"'} class="q-live-btn on" style="padding: 4px 10px; display: flex; align-items: center; justify-content: center; transition: all 0.2s;">▶️</button>
            </div>
        </div>
    `;

    const autoJoinBlock = createMasterSection('autoJoin.enabled', t('settings.autoJoin'), 'cerbAutoJoinChildren',
        `<div class="modern-toggle" style="flex-direction: column; align-items: stretch; gap: 6px; padding: 10px 14px;">
            <div style="display: flex; gap: 6px; width: 100%;">
                <input type="text" data-setting="autoJoin.channelId" value="${(ConfigManager.getSetting('autoJoin.channelId') || '').replace(/"/g, '&quot;')}" placeholder="e.g. The King of Fighters 2002 (NGM-2650)" style="flex: 1; background: rgba(14, 18, 26, 0.65); color: #f8fafc; border: 1px solid rgba(255,255,255,0.12); padding: 6px 8px; border-radius: 6px; outline: none; font-size: 12px;">
                <button id="cerbCaptureRoomBtn" style="background: var(--accentColor, #6366f1); color: #ffffff; border: none; padding: 6px 12px; border-radius: 6px; cursor: pointer; font-size: 11px; font-weight: 600; transition: all 0.2s;">${t('settings.autoJoinCapture')}</button>
            </div>
        </div>`
    );

    tab.innerHTML = langSelect +
        autoJoinBlock +
        createMasterSection('liveQueue.enabled', t('settings.liveQueue'), 'cerbLiveQueueChildren',
            settingInput('liveQueue.keyword', t('settings.queueKeyword')) +
            settingInput('liveQueue.limit', t('settings.queueLimit'), 'number') +
            settingToggle('liveQueue.autoReply', t('settings.queueReply')) +
            settingToggle('liveQueue.promoEnabled', t('settings.queuePromoEnable')) +
            settingInput('liveQueue.promoMessage', t('settings.queuePromo'), 'textarea')) +
        createMasterSection('rankings.masterEnabled', t('settings.rankingsApi'), 'cerbRankingsChildren',
            settingToggle('rankings.enableElo', t('settings.enableElo')) +
            settingSelect('rankings.defaultFt', t('settings.defaultFt'), [
                { value: 2, text: "FT2" },
                { value: 3, text: "FT3" },
                { value: 5, text: "FT5" },
                { value: 10, text: "FT10" },
                { value: 20, text: "FT20" }
            ]) +
            settingToggle('rankings.enableSimulator', t('settings.enableSimulator')) +
            settingToggle('rankings.autoSync', t('settings.autoSyncRankings')) +
            settingSelect('rankings.limit', t('settings.rankLimit'), [
                { value: "100", text: t('settings.syncLimitOptions.num100') },
                { value: "300", text: t('settings.syncLimitOptions.num300') },
                { value: "500", text: t('settings.syncLimitOptions.num500') },
                { value: "900", text: t('settings.syncLimitOptions.num900') },
                { value: "rankA", text: t('settings.syncLimitOptions.rankA') },
                { value: "rankB", text: t('settings.syncLimitOptions.rankB') },
                { value: "rankC", text: t('settings.syncLimitOptions.rankC') }
            ]) +
            `<div style="font-size: 11px; color: #fbbf24; opacity: 0.9; margin: 4px 14px 10px 14px; line-height: 1.35;">${t('settings.rankLimitNotice')}</div>` +
            settingToggle('chatUserInfo.showNumericRanks', t('settings.showNumericRanks')) +
            settingSelect('rankings.minRankToAccept', t('settings.minRankToAccept'), [
                { value: 0, text: t('settings.rankOptions.r0') },
                { value: 1, text: t('settings.rankOptions.r1') },
                { value: 2, text: t('settings.rankOptions.r2') },
                { value: 3, text: t('settings.rankOptions.r3') },
                { value: 4, text: t('settings.rankOptions.r4') },
                { value: 5, text: t('settings.rankOptions.r5') },
                { value: 6, text: t('settings.rankOptions.r6') }
            ]) +
            settingToggle('rankings.autoRejectBelowMin', t('settings.autoRejectRank')) +
            `<div style="padding: 10px 14px;"><button id="cerbClearRankingsBtn" style="width: 100%; padding: 7px 12px; font-size: 11px; font-weight: 600; background: rgba(239, 68, 68, 0.12); border: 1px solid rgba(239, 68, 68, 0.35); color: #fca5a5; border-radius: 6px; cursor: pointer; transition: all 0.2s;">${t('settings.clearRankingsBtn')}</button></div>`) +
        createSection(t('settings.filters'),
            settingToggle('countryFilter.enabled', t('settings.enableFilter')) +
            settingToggle('countryFilter.autoReject', t('settings.autoRejectCountry')) +
            settingToggle('pingFilter.enabled', t('settings.pingFilter')) +
            settingInput('pingFilter.maxPingMs', t('settings.maxPingMs'), 'number') +
            settingToggle('pingFilter.autoReject', t('settings.autoRejectPing')) +
            settingToggle('pingFilter.hideHighPing', t('settings.hideHighPing')) +
            settingToggle('countryFilter.autoRejectNotify', t('autoReject.notifyToggle'))) +
        createMasterSection('ftFilter.enabled', t('settings.ftFilter'), 'cerbFtFilterChildren',
            settingToggle('ftFilter.autoReject', t('settings.autoRejectFt')) +
            `<div class="modern-toggle" style="flex-direction: column; align-items: stretch; gap: 8px; padding: 10px 14px;">
                <span style="font-size: 11px; font-weight: 600; color: #cbd5e1;">${t('settings.ftAllowList')}</span>
                <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px;">
                    <label style="display: flex; align-items: center; gap: 6px; font-size: 11px; cursor: pointer; color: #f8fafc;">
                        <input type="checkbox" data-setting="ftFilter.allowFt2" ${ConfigManager.getSetting('ftFilter.allowFt2') !== false ? 'checked' : ''}> FT2
                    </label>
                    <label style="display: flex; align-items: center; gap: 6px; font-size: 11px; cursor: pointer; color: #f8fafc;">
                        <input type="checkbox" data-setting="ftFilter.allowFt3" ${ConfigManager.getSetting('ftFilter.allowFt3') !== false ? 'checked' : ''}> FT3
                    </label>
                    <label style="display: flex; align-items: center; gap: 6px; font-size: 11px; cursor: pointer; color: #f8fafc;">
                        <input type="checkbox" data-setting="ftFilter.allowFt5" ${ConfigManager.getSetting('ftFilter.allowFt5') !== false ? 'checked' : ''}> FT5
                    </label>
                    <label style="display: flex; align-items: center; gap: 6px; font-size: 11px; cursor: pointer; color: #f8fafc;">
                        <input type="checkbox" data-setting="ftFilter.allowFt10" ${ConfigManager.getSetting('ftFilter.allowFt10') !== false ? 'checked' : ''}> FT10
                    </label>
                    <label style="display: flex; align-items: center; gap: 6px; font-size: 11px; cursor: pointer; color: #f8fafc;">
                        <input type="checkbox" data-setting="ftFilter.allowFt20" ${ConfigManager.getSetting('ftFilter.allowFt20') !== false ? 'checked' : ''}> FT20
                    </label>
                    <label style="display: flex; align-items: center; gap: 6px; font-size: 11px; cursor: pointer; color: #f8fafc;">
                        <input type="checkbox" data-setting="ftFilter.allowCasual" ${ConfigManager.getSetting('ftFilter.allowCasual') !== false ? 'checked' : ''}> ${t('settings.ftCasual')}
                    </label>
                </div>
            </div>`) +
        createMasterSection('chatUserInfo.masterEnabled', t('settings.chatVisual'), 'cerbChatVisualChildren',
            settingToggle('chatUserInfo.enableStatus', t('settings.showStatus')) +
            settingToggle('chatUserInfo.enableFlag', t('settings.showFlags')) +
            settingToggle('chatUserInfo.enableRank', t('settings.showRanks')) +
            settingToggle('chatUserInfo.enablePingBars', t('settings.showPingBars')) +
            settingToggle('chatUserInfo.enablePingText', t('settings.showPingText')) +
            settingToggle('chatUserInfo.replacePingBarWithText', t('settings.replacePingBar')) +
            customAudioSelect) +
        createMasterSection('chatUserInfo.enableReputation', t('settings.reputation'), 'cerbReputationChildren',
            settingToggle('chatUserInfo.hideNegativeMessages', t('settings.hideNeg')) +
            settingToggle('chatUserInfo.autoRejectNegative', t('settings.autoRejectNeg'))) +
        createSection(t('settings.privacy'), blurToggle() + settingToggle('chatUserInfo.unlockColorThemes', t('settings.unlockThemes'))) +
        createSection(t('settings.performance'),
            settingToggle('performance.lowPowerOnBlur', t('settings.lowPowerOnBlur')) +
            `<div style="font-size: 11px; color: #94a3b8; opacity: 0.85; margin: 4px 14px 10px 14px; line-height: 1.35;">${t('settings.lowPowerDesc')}</div>`);

    tab.querySelectorAll('input[data-setting], select[data-setting], textarea[data-setting]').forEach(input => {
        const handleSettingChange = (e) => {
            const key = e.target.getAttribute('data-setting'); let val = e.target.value;
            if (e.target.dataset.blurToggle) val = e.target.checked ? 'all' : 'none';
            else if (e.target.type === 'checkbox') val = e.target.checked;
            else if (key === 'rankings.limit') val = isNaN(Number(e.target.value)) ? e.target.value : parseInt(e.target.value);
            else if (e.target.type === 'number' || key === 'rankings.minRankToAccept' || key === 'rankings.defaultFt') val = parseInt(e.target.value, 10);
            else if (e.target.tagName === 'TEXTAREA') val = e.target.value.split(String.fromCharCode(10)).slice(0, 3).join(String.fromCharCode(92) + 'n');

            if (key?.startsWith('ftFilter.allow') && val === false) {
                const ftCheckboxes = Array.from(tab.querySelectorAll('input[data-setting^="ftFilter.allow"]'));
                const checkedCount = ftCheckboxes.filter(cb => cb.checked).length;
                if (checkedCount === 0) {
                    e.target.checked = true;
                    return;
                }
            }

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
        if (input.type === 'text' || input.type === 'number' || input.tagName === 'TEXTAREA') {
            let inputDebounce = null;
            input.addEventListener('input', (e) => {
                clearTimeout(inputDebounce);
                inputDebounce = setTimeout(() => handleSettingChange(e), 500);
            });
        }
    });

    tab.querySelectorAll('textarea[data-setting]').forEach(textarea => {
        textarea.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                const lines = textarea.value.split('\n');
                if (lines.length >= 3) {
                    e.preventDefault();
                }
            }
        });
        textarea.addEventListener('input', (e) => {
            const lines = e.target.value.split('\n');
            if (lines.length > 3) {
                e.target.value = lines.slice(0, 3).join('\n');
            }
        });
    });

    // Initial sync for AutoSync Rankings disabled/locked state if Rank A, B, or C is selected
    const currentRankLimit = ConfigManager.getSetting('rankings.limit');
    if (currentRankLimit === 'rankA' || currentRankLimit === 'rankB' || currentRankLimit === 'rankC') {
        const autoSyncCheckbox = tab.querySelector('input[data-setting="rankings.autoSync"]');
        if (autoSyncCheckbox) {
            autoSyncCheckbox.checked = false;
            autoSyncCheckbox.disabled = true;
            const toggleParent = autoSyncCheckbox.closest('.modern-toggle');
            if (toggleParent) {
                toggleParent.style.opacity = '0.45';
                toggleParent.style.pointerEvents = 'none';
                toggleParent.title = t('settings.autoSyncDisabledNotice') || 'Sincronização automática desativada para limites por Rank (A, B ou C)';
            }
        }
    }

    // [CERBERUS] Preventative Audio Play/Pause Logic
    const audioSelect = document.getElementById('cerbAudioSelect');
    const audioPlayBtn = document.getElementById('cerbAudioPlayBtn');
    if (audioSelect && audioPlayBtn) {
        audioSelect.addEventListener('change', (e) => {
            const val = e.target.value;
            if (val === 'native' || val === 'silent') {
                audioPlayBtn.disabled = true;
                audioPlayBtn.style.opacity = '0.3';
                audioPlayBtn.style.cursor = 'not-allowed';
            } else {
                audioPlayBtn.disabled = false;
                audioPlayBtn.style.opacity = '1';
                audioPlayBtn.style.cursor = 'pointer';
            }
        });

        audioPlayBtn.addEventListener('click', () => {
            const val = audioSelect.value;
            if (val === 'native' || val === 'silent') return;

            try {
                const fs = require('fs');
                const path = require('path');
                const audioPath = path.join(__dirname, `${val}.wav`);

                fs.readFile(audioPath, (err, data) => {
                    if (!err && data) {
                        const base64Str = `data:audio/wav;base64,${data.toString('base64')}`;
                        const customAudio = new window.Audio(base64Str);
                        customAudio.volume = 0.8;
                        customAudio.play().catch(() => { });
                    } else {
                        console.error("[Cerberus] Ficheiro de áudio não encontrado:", audioPath);
                    }
                });
            } catch (e) { }
        });
    }

    const clearRankingsBtn = document.getElementById('cerbClearRankingsBtn');
    if (clearRankingsBtn) {
        clearRankingsBtn.addEventListener('click', () => {
            const { RankCache } = require('./api.js');
            const { getActiveChannelWrapper } = require('./utils.js');
            const { fullChatScanScoped, updateSidebarScope } = require('./chat.js');
            if (confirm(t('settings.confirmClearRankings'))) {
                RankCache.clearRankings();
                alert(t('settings.rankingsClearedNotice'));
                const cw = getActiveChannelWrapper();
                if (cw && window.CerberusFCADE && ConfigManager.getRuntimeConfig()) {
                    fullChatScanScoped(cw, window.CerberusFCADE, ConfigManager.getRuntimeConfig());
                    updateSidebarScope(cw.querySelector('.usersListWrapper'), window.CerberusFCADE, ConfigManager.getRuntimeConfig());
                }
            }
        });
    }

    const captureBtn = document.getElementById('cerbCaptureRoomBtn');
    if (captureBtn) {
        captureBtn.addEventListener('click', () => {
            const activeId = window.CerberusFCADE?.activeChannelId;
            const activeEl = document.querySelector('.channelItem.active');
            const valToSave = activeId || activeEl?.title || '';
            if (valToSave) {
                const input = document.querySelector('input[data-setting="autoJoin.channelId"]');
                if (input) {
                    input.value = valToSave;
                    input.dispatchEvent(new Event('change'));
                }
            }
        });
    }

}

function createAboutTab() {
    const { CerberusData } = require('./state.js');
    const { isNewerVersion, checkForUpdates } = require('./utils.js');
    const { CURRENT_VERSION } = require('./constants.js');

    let updateHtml = '';
    if (isNewerVersion(CerberusData.latestVersion, CURRENT_VERSION)) {
        const downloadLink = CerberusData.downloadUrl ? ` <a href="${CerberusData.downloadUrl}" target="_blank" style="color: #4ade80; text-decoration: underline; margin-left: 5px;">Download</a>` : '';
        updateHtml = `<div style="background: rgba(255, 165, 0, 0.2); border: 1px solid rgba(255, 165, 0, 0.5); padding: 10px; border-radius: 8px; margin-top: 15px; color: #ffdca5; font-weight: bold; text-align: center;">${t('about.updateAvailable')} ${CerberusData.latestVersion}${downloadLink}</div>`;
    }

    let logoHtml = `<div style="font-size: 40px; margin-bottom: 10px;">🐺</div>`;
    try {
        const fs = require('fs');
        const path = require('path');
        const logoPath = path.join(__dirname, 'logo.png');
        if (fs.existsSync(logoPath)) {
            const logoData = fs.readFileSync(logoPath);
            const base64Logo = `data:image/png;base64,${logoData.toString('base64')}`;
            logoHtml = `<img src="${base64Logo}" alt="Fightcade Plus Logo" style="width: 80px; height: 80px; margin-bottom: 10px; object-fit: contain;" />`;
        }
    } catch (e) {
        console.error("[Cerberus] Falha ao carregar logo.png em base64:", e);
    }

    document.getElementById('aboutTab').innerHTML = `
        <div style="text-align: center; padding: 10px 20px;">
            ${logoHtml}
            <h2 style="margin: 0; color: var(--mainColor-light, #667eea);">${t('about.title')}</h2>
            <div style="font-size: 12px; opacity: 0.6; margin-top: 4px; margin-bottom: 12px;">
                ${t('about.subtitle')} | <a href="https://cerberus-br.github.io/FightcadePlus" target="_blank" style="color: var(--mainColor-lighter, #a3bffa); text-decoration: underline;">${t('about.projectPage')}</a>
            </div>
            <p style="opacity: 0.8; margin-top: 8px; font-weight: 500; font-size: 13px; line-height: 1.4;">
                ${t('about.desc')}
            </p>
            
            <div id="cerbUpdateContainer">
                ${updateHtml}
            </div>

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
            
            <button id="cerbManualUpdateBtn" class="cerb-update-btn" style="margin-top: 25px; width: calc(100% - 40px); display: block; margin-left: auto; margin-right: auto; box-sizing: border-box; cursor: pointer; border: none; outline: none; text-align: center; justify-content: center; align-items: center;">
                ${t('about.updateBtn')}
            </button>
        </div>
    `;

    document.getElementById('cerbManualUpdateBtn').addEventListener('click', async () => {
        const btn = document.getElementById('cerbManualUpdateBtn');
        btn.disabled = true;
        btn.textContent = '⏳ ...';

        const success = await checkForUpdates(true);
        btn.disabled = false;
        btn.textContent = t('about.updateBtn');

        const updateContainer = document.getElementById('cerbUpdateContainer');
        if (success) {
            if (isNewerVersion(CerberusData.latestVersion, CURRENT_VERSION)) {
                const downloadLink = CerberusData.downloadUrl ? ` <a href="${CerberusData.downloadUrl}" target="_blank" style="color: #4ade80; text-decoration: underline; margin-left: 5px;">Download</a>` : '';
                updateContainer.innerHTML = `<div style="background: rgba(255, 165, 0, 0.2); border: 1px solid rgba(255, 165, 0, 0.5); padding: 10px; border-radius: 8px; margin-top: 15px; color: #ffdca5; font-weight: bold; text-align: center;">${t('about.updateAvailable')} ${CerberusData.latestVersion}${downloadLink}</div>`;
            } else {
                updateContainer.innerHTML = `<div style="background: rgba(0, 170, 0, 0.15); border: 1px solid rgba(0, 170, 0, 0.4); padding: 10px; border-radius: 8px; margin-top: 15px; color: #a5ffd0; font-weight: bold; text-align: center;">${t('about.upToDate')}</div>`;
            }
        } else {
            updateContainer.innerHTML = `<div style="background: rgba(255, 0, 0, 0.15); border: 1px solid rgba(255, 0, 0, 0.4); padding: 10px; border-radius: 8px; margin-top: 15px; color: #ffa5a5; font-weight: bold; text-align: center;">${t('about.updateError')}</div>`;
        }
    });
}

function createQueuePanel() {
    const { CerberusData } = require('./state.js');
    if (document.getElementById('cerberusQueueWindow')) return;
    const panel = document.createElement('div'); panel.id = 'cerberusQueueWindow'; panel.style.display = 'none';
    panel.innerHTML = `<div class="q-header" id="cerberusQueueHeader"><span class="q-title">📝 ${t('queue.title')} <small id="cerbQueueCount">(0)</small></span><button class="q-close" id="cerbQueueCloseBtn">×</button></div><div class="q-add-box"><input type="text" id="cerbQueueInput" placeholder="${t('queue.inputPh')}"><button id="cerbQueueAddBtn">${t('queue.addBtn')}</button></div><div class="q-list" id="cerbQueueList"></div><div class="q-footer" style="display:flex; justify-content:space-between;"><button id="cerbLiveMasterBtn" class="q-live-btn off">${t('sync.liveOff')}</button><button id="cerbQueueClearBtn" class="q-clear-btn">🧹 ${t('queue.clearBtn')}</button></div>`;
    const targetParent = document.getElementById('app') || document.body;
    targetParent.appendChild(panel); makeDraggable(panel, 'cerberusQueueHeader');

    document.getElementById('cerbQueueCloseBtn').addEventListener('click', () => panel.style.display = 'none');

    const masterBtn = document.getElementById('cerbLiveMasterBtn');
    if (window.CerberusState.liveMasterOn) { masterBtn.className = 'q-live-btn on'; masterBtn.innerHTML = t('sync.liveOn'); }
    masterBtn.addEventListener('click', (e) => {
        const { ConfigManager } = require('./config.js');
        const btn = e.currentTarget;
        if (btn.classList.contains('off')) {
            window.CerberusState.liveMasterOn = true; btn.className = 'q-live-btn on'; btn.innerHTML = t('sync.liveOn');

            syncQueueFab(document.querySelector('.cerb-queue-fab'));

            const triggerPromo = () => {
                if (ConfigManager.getSetting('liveQueue.enabled') !== true || !window.CerberusState.liveMasterOn || !ConfigManager.getSetting('liveQueue.promoEnabled')) return;
                const msg = ConfigManager.getSetting('liveQueue.promoMessage');
                if (!msg || msg.trim() === '') return;

                const now = Date.now();
                if (!window.CerberusState.lastPromoTime || (now - window.CerberusState.lastPromoTime > 5000)) {
                    window.CerberusState.lastPromoTime = now;
                    executeChatMacro(msg.split(/\\n|\n/));
                }
            };

            triggerPromo();

            if (window.CerberusState.promoBotInterval) clearInterval(window.CerberusState.promoBotInterval);
            window.CerberusState.promoBotInterval = setInterval(triggerPromo, 600000);
        }
        else {
            window.CerberusState.liveMasterOn = false; btn.className = 'q-live-btn off'; btn.innerHTML = t('sync.liveOff');

            syncQueueFab(document.querySelector('.cerb-queue-fab'));

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
        const markBtn = document.createElement('button'); markBtn.title = t('queue.mark'); markBtn.innerHTML = '✓'; markBtn.addEventListener('click', () => CerberusData.togglePlayedQueue(index));
        const upBtn = document.createElement('button'); upBtn.title = t('queue.up'); upBtn.innerHTML = '▲'; upBtn.addEventListener('click', () => CerberusData.moveQueue(index, -1));
        const downBtn = document.createElement('button'); downBtn.title = t('queue.down'); downBtn.innerHTML = '▼'; downBtn.addEventListener('click', () => CerberusData.moveQueue(index, 1));
        const rmBtn = document.createElement('button'); rmBtn.className = 'danger'; rmBtn.title = t('queue.remove'); rmBtn.innerHTML = '✕'; rmBtn.addEventListener('click', () => CerberusData.removeQueue(index));
        controls.appendChild(markBtn); controls.appendChild(upBtn); controls.appendChild(downBtn); controls.appendChild(rmBtn); item.appendChild(nameSpan); item.appendChild(controls); listEl.appendChild(item);
    });
}

function createSimulatorPanel() {
    const { simulateSet, getRecommendation, getRankAverageElo, getRankFromElo } = require('./elo.js');
    const { ConfigManager } = require('./config.js');
    const simDefaultFt = parseInt(ConfigManager?.getSetting?.('rankings.defaultFt'), 10) || 5;

    if (document.getElementById('cerberusSimulatorWindow')) return;

    const panel = document.createElement('div');
    panel.id = 'cerberusSimulatorWindow';
    panel.style.display = 'none';

    panel.innerHTML = `
        <div class="sim-header" id="cerberusSimulatorHeader">
            <span class="sim-title">⚔️ ${t('elo.simTitle')}</span>
            <button type="button" class="sim-close" id="cerbSimulatorCloseBtn">×</button>
        </div>
        <div class="sim-body">
            <div class="sim-controls-grid">
                <div class="sim-player-box">
                    <div class="sim-box-title">👤 ${t('elo.simPlayer1')}</div>
                    <div class="sim-input-row">
                        <select id="cerbSimRank1" class="sim-select">
                            <option value="S">Rank S (~2050)</option>
                            <option value="A">Rank A (~1750)</option>
                            <option value="B">Rank B (~1450)</option>
                            <option value="C" selected>Rank C (~1150)</option>
                            <option value="D">Rank D (~850)</option>
                            <option value="E">Rank E (~550)</option>
                        </select>
                        <input type="number" id="cerbSimElo1" class="sim-input" placeholder="Elo" value="1150" min="100" max="3000" />
                    </div>
                    <button type="button" id="cerbSimUseMyEloBtn" class="sim-btn-secondary">📍 ${t('elo.simUseMyElo')}</button>
                    <div class="sim-elo-source" id="cerbSimSource1" role="status">${t('elo.simExample')}</div>
                </div>

                <div class="sim-vs-box">
                    <div class="sim-vs-badge">VS</div>
                    <div class="sim-ft-select-wrap">
                        <label>${t('elo.simFtLabel')}</label>
                        <select id="cerbSimFtSelect" class="sim-select-compact">
                            <option value="2" ${simDefaultFt === 2 ? 'selected' : ''}>FT2</option>
                            <option value="3" ${simDefaultFt === 3 ? 'selected' : ''}>FT3</option>
                            <option value="5" ${simDefaultFt === 5 ? 'selected' : ''}>FT5</option>
                            <option value="10" ${simDefaultFt === 10 ? 'selected' : ''}>FT10</option>
                            <option value="20" ${simDefaultFt === 20 ? 'selected' : ''}>FT20</option>
                        </select>
                    </div>
                </div>

                <div class="sim-player-box">
                    <div class="sim-box-title">🥊 ${t('elo.simPlayer2')}</div>
                    <div class="sim-input-row">
                        <select id="cerbSimRank2" class="sim-select">
                            <option value="S">Rank S (~2050)</option>
                            <option value="A">Rank A (~1750)</option>
                            <option value="B" selected>Rank B (~1450)</option>
                            <option value="C">Rank C (~1150)</option>
                            <option value="D">Rank D (~850)</option>
                            <option value="E">Rank E (~550)</option>
                        </select>
                        <input type="number" id="cerbSimElo2" class="sim-input" placeholder="Elo" value="1450" min="100" max="3000" />
                    </div>
                    <div class="sim-elo-source" id="cerbSimSource2" role="status">${t('elo.simExample')}</div>
                </div>
            </div>

            <div class="sim-summary-card balanced" id="cerbSimSummaryCard"></div>
            <p class="sim-note">${t('elo.simNote')}</p>

            <div class="sim-table-wrap">
                <table class="sim-table" id="cerbSimTable">
                    <thead>
                        <tr>
                            <th>${t('elo.simColScore')}</th>
                            <th>${t('elo.simColDelta')}</th>
                            <th>${t('elo.simColFinalElo')}</th>
                            <th>${t('elo.simColImpact')}</th>
                        </tr>
                    </thead>
                    <tbody id="cerbSimTableBody"></tbody>
                </table>
            </div>
        </div>
    `;

    const targetParent = document.getElementById('app') || document.body;
    targetParent.appendChild(panel);
    makeDraggable(panel, 'cerberusSimulatorHeader');

    document.getElementById('cerbSimulatorCloseBtn').addEventListener('click', () => {
        panel.style.display = 'none';
    });

    const rankSelect1 = document.getElementById('cerbSimRank1');
    const eloInput1 = document.getElementById('cerbSimElo1');
    const rankSelect2 = document.getElementById('cerbSimRank2');
    const eloInput2 = document.getElementById('cerbSimElo2');
    const ftSelect = document.getElementById('cerbSimFtSelect');
    const useMyEloBtn = document.getElementById('cerbSimUseMyEloBtn');
    const source1 = document.getElementById('cerbSimSource1');
    const source2 = document.getElementById('cerbSimSource2');

    rankSelect1.addEventListener('change', () => {
        eloInput1.value = getRankAverageElo(rankSelect1.value);
        source1.textContent = t('elo.simRankEstimate');
        recalc();
    });
    eloInput1.addEventListener('input', () => {
        source1.textContent = t('elo.simManual');
        const val = parseInt(eloInput1.value, 10);
        if (!isNaN(val)) {
            rankSelect1.value = getRankFromElo(val);
            recalc();
        }
    });

    rankSelect2.addEventListener('change', () => {
        eloInput2.value = getRankAverageElo(rankSelect2.value);
        source2.textContent = t('elo.simRankEstimate');
        recalc();
    });
    eloInput2.addEventListener('input', () => {
        source2.textContent = t('elo.simManual');
        const val = parseInt(eloInput2.value, 10);
        if (!isNaN(val)) {
            rankSelect2.value = getRankFromElo(val);
            recalc();
        }
    });

    ftSelect.addEventListener('change', () => recalc());

    useMyEloBtn.addEventListener('click', () => {
        const { getLocalUserInfo, getRankFromElo } = require('./elo.js');
        const { getActiveGameId } = require('./utils.js');
        const { RankCache } = require('./api.js');
        const activeGameId = getActiveGameId();
        const myInfo = getLocalUserInfo(window.CerberusFCADE, activeGameId, RankCache);
        if (myInfo && myInfo.source !== 'unavailable') {
            eloInput1.value = myInfo.elo;
            rankSelect1.value = getRankFromElo(myInfo.elo);
            source1.textContent = t(`elo.${myInfo.source}`, { elo: myInfo.elo, min: myInfo.minElo, max: myInfo.maxElo });
            recalc();
        } else {
            source1.textContent = t('elo.myEloMissing');
        }
    });

    function recalc() {
        const myElo = parseInt(eloInput1.value, 10) || 1150;
        const oppElo = parseInt(eloInput2.value, 10) || 1450;
        const ft = parseInt(ftSelect.value, 10) || 5;

        const rec = getRecommendation(myElo, oppElo, ft);
        const scenarios = simulateSet(myElo, oppElo, ft);
        const summaryCard = document.getElementById('cerbSimSummaryCard');
        const tbody = document.getElementById('cerbSimTableBody');

        if (summaryCard) {
            summaryCard.className = `sim-summary-card ${rec.type}`;
            let mainMsg = rec.text;
            if (rec.diffText) mainMsg = `<strong>${t('elo.formatEstimate', { ft })} · ${rec.diffText}</strong><br>${rec.text}`;
            summaryCard.innerHTML = mainMsg;
        }

        if (tbody) {
            tbody.innerHTML = '';
            scenarios.forEach(sc => {
                const tr = document.createElement('tr');
                const delta = sc.netDelta;
                let outcomeClass = 'sim-row neutral';

                if (delta > 0) {
                    if (delta >= 20) outcomeClass = 'sim-row gain-4';
                    else if (delta >= 12) outcomeClass = 'sim-row gain-3';
                    else if (delta >= 6) outcomeClass = 'sim-row gain-2';
                    else outcomeClass = 'sim-row gain-1';
                } else if (delta < 0) {
                    if (delta <= -20) outcomeClass = 'sim-row loss-4';
                    else if (delta <= -12) outcomeClass = 'sim-row loss-3';
                    else if (delta <= -6) outcomeClass = 'sim-row loss-2';
                    else outcomeClass = 'sim-row loss-1';
                }

                tr.className = outcomeClass;

                let impactLabel = '';
                if (sc.isWin) {
                    if (sc.oppWins === 0) impactLabel = `🟢 ${t('elo.simWinClean')}`;
                    else if (sc.oppWins <= Math.floor(ft / 2)) impactLabel = `🟢 ${t('elo.simWinDecisive')}`;
                    else impactLabel = delta > 0 ? `🟢 ${t('elo.simWinSimple')}` : `🔴 ${t('elo.simWinSimple')}`;
                } else {
                    if (delta > 0) impactLabel = `🔥 ${t('elo.simLossProfit')}`;
                    else if (sc.myWins === ft - 1) impactLabel = `🔴 ${t('elo.simLossTight')}`;
                    else if (sc.myWins === 0) impactLabel = `🔴 ${t('elo.simLossSweep')}`;
                    else impactLabel = `🔴 ${t('elo.simLossHeavy')}`;
                }

                const scoreDisplay = sc.score.replace('-', 'x');
                const deltaSign = delta > 0 ? `+${delta}` : `${delta}`;
                const finalElo = myElo + delta;

                tr.innerHTML = `
                    <td><strong>${scoreDisplay}</strong></td>
                    <td><strong>${deltaSign}</strong></td>
                    <td>${finalElo}</td>
                    <td>${impactLabel}</td>
                `;
                tbody.appendChild(tr);
            });
        }
    }

    recalc();
}

function positionReputationMenu(menu, anchorEl, contextType) {
    if (!menu || !anchorEl) return;
    try {
        let rect = anchorEl.getBoundingClientRect();

        // Safety Fallback: If anchor element is hidden/detached (0x0 rect), fallback to parent or playerName
        if (rect.width === 0 && rect.height === 0 && rect.top === 0 && rect.left === 0) {
            const parent = anchorEl.closest('.playerInfo, .userItem, .messageWrapper') || anchorEl.parentElement;
            if (parent) {
                const nameEl = parent.querySelector('.playerName, span.author');
                rect = nameEl ? nameEl.getBoundingClientRect() : parent.getBoundingClientRect();
            }
        }

        // Final guard: If rect is still zero (completely unrendered node), abort to avoid top-left window clamping
        if (rect.width === 0 && rect.height === 0 && rect.top === 0 && rect.left === 0) return;

        const menuWidth = menu.offsetWidth || 230;
        const menuHeight = menu.offsetHeight || 38;

        let leftPos, topPos;

        if (contextType === 'sidebar') {
            // Sidebar: Align left edge directly above the flag position
            leftPos = rect.left;
            topPos = rect.top - menuHeight - 6;
        } else if (contextType === 'chat') {
            // Chat: Position directly above the chat trigger icon
            leftPos = rect.left + (rect.width / 2) - (menuWidth / 2);
            topPos = rect.top - menuHeight - 6;
        } else if (contextType === 'match') {
            // Playing: Centered above player name / flag
            leftPos = rect.left + (rect.width / 2) - (menuWidth / 2);
            topPos = rect.top - menuHeight - 6;
        } else {
            leftPos = rect.left + (rect.width / 2) - (menuWidth / 2);
            topPos = rect.top - menuHeight - 6;
        }

        if (leftPos + menuWidth > window.innerWidth - 12) leftPos = window.innerWidth - menuWidth - 12;
        if (leftPos < 12) leftPos = 12;
        if (topPos < 10) topPos = rect.bottom + 6;

        menu.style.left = leftPos + 'px';
        menu.style.top = topPos + 'px';
    } catch (e) { }
}

function openReputationMenuForUser(userKey, type, anchorEl) {
    const { CerberusData, ConfigManager, isSystemUser } = _getUiDeps();
    if (!userKey || isSystemUser(userKey)) return;

    const menu = document.getElementById('cerbGlobalMenu'); if (!menu) return;

    const isNativeBlocked = Array.from(document.querySelectorAll('.usersIgnoredList .userItem')).some(el => el.dataset.currentUser === userKey);
    const isPos = CerberusData.isPositive(userKey); const isNeg = CerberusData.isNegative(userKey);

    const btnLike = document.getElementById('cerbBtnLike');
    const btnDislike = document.getElementById('cerbBtnDislike');
    const btnClear = document.getElementById('cerbBtnClear');
    const btnBlock = document.getElementById('cerbBtnBlock');
    const btnUnblock = document.getElementById('cerbBtnUnblock');
    const divQueue = document.getElementById('cerbDivQueue');
    const btnQueue = document.getElementById('cerbBtnQueueAdd');
    const qEnabled = ConfigManager.getSetting('liveQueue.enabled') === true;

    if (btnQueue) btnQueue.style.display = qEnabled ? 'inline-block' : 'none';
    if (divQueue) divQueue.style.display = qEnabled ? 'block' : 'none';
    if (btnLike) btnLike.style.display = isPos ? 'none' : 'inline-block';
    if (btnDislike) btnDislike.style.display = isNeg ? 'none' : 'inline-block';
    if (btnClear) btnClear.style.display = (isPos || isNeg) ? 'inline-block' : 'none';
    if (btnBlock) btnBlock.style.display = isNativeBlocked ? 'none' : 'inline-block';
    if (btnUnblock) btnUnblock.style.display = isNativeBlocked ? 'inline-block' : 'none';

    menu.dataset.user = userKey;
    menu.dataset.type = type;
    menu.dataset.hideNegative = ConfigManager.getSetting('chatUserInfo.hideNegativeMessages') === true;

    positionReputationMenu(menu, anchorEl, type);
    menu.classList.add('visible');
}

function createChatTriggerElement(userKey) {
    const el = document.createElement('span');
    el.className = 'cerb-chat-trigger';
    el.title = t('rep.like') || 'Reputação / Opções';
    el.addEventListener('click', (e) => {
        e.stopPropagation();
        openReputationMenuForUser(userKey, 'chat', el);
    });
    return el;
}

if (typeof document !== 'undefined') {
    document.addEventListener('click', (e) => {
        const menu = document.getElementById('cerbGlobalMenu');
        if (menu && menu.classList.contains('visible')) {
            if (!menu.contains(e.target) && !e.target.closest('.cerb-flag-trigger, .cerb-chat-trigger')) {
                menu.classList.remove('visible');
            }
        }
    });
}

function injectGlobalMenu() {
    const { CerberusData } = require('./state.js');
    const { isSystemUser, executeChatCommand, normalizeUsername } = require('./utils.js');
    const { reprocessUserMessages } = require('./chat.js');
    const { ConfigManager } = require('./config.js');

    if (document.getElementById('cerbGlobalMenu')) return;
    const menu = document.createElement('div'); menu.id = 'cerbGlobalMenu';
    menu.innerHTML = `
        <span id="cerbBtnLike" class="cerb-action-icon" title="${t('rep.like')}">👍</span>
        <span id="cerbBtnDislike" class="cerb-action-icon" title="${t('rep.dislike')}">👎</span>
        <span id="cerbBtnClear" class="cerb-action-icon" title="${t('rep.clear')}">🧹</span>
        <div class="cerb-menu-divider"></div>
        <span id="cerbBtnBlock" class="cerb-action-icon" title="${t('rep.block')}">🚫</span>
        <span id="cerbBtnUnblock" class="cerb-action-icon" title="${t('rep.unblock')}">🟢</span>
        <div class="cerb-menu-divider" id="cerbDivQueue"></div>
        <span id="cerbBtnQueueAdd" class="cerb-action-icon" title="${t('queue.addBtn')}">➕</span>`;
    const targetParent = document.getElementById('app') || document.body;
    targetParent.appendChild(menu);

    menu.addEventListener('mouseenter', () => {
        window.CerberusState.menuIsHovered = true;
        clearTimeout(window.CerberusState.menuHideTimeout);
        clearTimeout(window.CerberusState.menuShowTimeout);
    });

    menu.addEventListener('mouseleave', () => {
        window.CerberusState.menuIsHovered = false;
        window.CerberusState.menuHideTimeout = setTimeout(() => {
            menu.classList.remove('visible');
        }, 250);
    });

    const action = (fn) => {
        const userKey = menu.dataset.user; if (isSystemUser(userKey)) return; fn(userKey);
        if (menu.dataset.type === 'match') document.querySelectorAll('.playerName').forEach(el => { if (normalizeUsername(el.textContent) === userKey) applyReputationStyleMatch(el, userKey); });
        reprocessUserMessages(userKey, menu.dataset.hideNegative === 'true');
        menu.classList.remove('visible');
    };

    document.getElementById('cerbBtnQueueAdd').addEventListener('click', () => { const userKey = menu.dataset.user; if (!isSystemUser(userKey)) { CerberusData.addQueue(userKey); menu.classList.remove('visible'); } });
    document.getElementById('cerbBtnLike').addEventListener('click', () => action(k => CerberusData.markPositive(k)));
    document.getElementById('cerbBtnDislike').addEventListener('click', () => action(k => CerberusData.markNegative(k)));
    document.getElementById('cerbBtnClear').addEventListener('click', () => action(k => CerberusData.clearReputation(k)));

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
    if (!userKey || userKey === '<offline>' || userKey.startsWith('<')) {
        if (msg && msg.dataset.cerbRepState) {
            delete msg.dataset.cerbRepState;
            if (author) { author.style.color = ''; author.style.fontWeight = ''; author.style.textShadow = ''; author.style.textDecoration = ''; }
            if (msg) { msg.style.backgroundColor = ''; msg.style.borderLeft = ''; msg.style.paddingLeft = ''; msg.style.opacity = ''; }
        }
        return;
    }

    const isPos = CerberusData.isPositive(userKey);
    const isNeg = CerberusData.isNegative(userKey);
    const repState = isPos ? 'pos' : (isNeg ? 'neg' : 'neutral');
    if (msg && msg.dataset.cerbRepState === repState) return;

    if (author) { author.style.color = ''; author.style.fontWeight = ''; author.style.textShadow = ''; author.style.textDecoration = ''; }
    if (msg) { msg.style.backgroundColor = ''; msg.style.borderLeft = ''; msg.style.paddingLeft = ''; msg.style.opacity = ''; msg.dataset.cerbRepState = repState; }

    if (isPos) {
        if (author) { author.style.color = '#00aa00'; author.style.fontWeight = 'bold'; author.style.textShadow = '0 0 3px rgba(0, 170, 0, 0.5)'; }
        if (msg) { msg.style.backgroundColor = 'rgba(0, 255, 0, 0.08)'; msg.style.borderLeft = '3px solid #00aa00'; msg.style.paddingLeft = '5px'; }
    }
    else if (isNeg) {
        if (author) { author.style.color = '#888'; author.style.textDecoration = 'line-through'; }
        if (msg) msg.style.opacity = '0.35';
    }
}

function applyReputationStyleList(playerName, userItem, userKey) {
    const { CerberusData } = require('./state.js');
    if (!userKey || userKey === '<offline>' || userKey.startsWith('<')) {
        if (userItem && userItem.dataset.cerbRepState) {
            delete userItem.dataset.cerbRepState;
            if (playerName) { playerName.style.color = ''; playerName.style.fontWeight = ''; playerName.style.textDecoration = ''; playerName.style.textShadow = ''; }
            if (userItem) { userItem.style.opacity = ''; userItem.style.backgroundColor = ''; userItem.style.borderLeft = ''; }
        }
        return;
    }

    const isPos = CerberusData.isPositive(userKey);
    const isNeg = CerberusData.isNegative(userKey);
    const repState = isPos ? 'pos' : (isNeg ? 'neg' : 'neutral');
    if (userItem && userItem.dataset.cerbRepState === repState) return;

    if (playerName) { playerName.style.color = ''; playerName.style.fontWeight = ''; playerName.style.textDecoration = ''; playerName.style.textShadow = ''; }
    if (userItem) { userItem.style.opacity = ''; userItem.style.backgroundColor = ''; userItem.style.borderLeft = ''; userItem.dataset.cerbRepState = repState; }

    if (isPos) {
        if (playerName) { playerName.style.color = '#00aa00'; playerName.style.fontWeight = 'bold'; playerName.style.textShadow = '0 0 5px rgba(0, 255, 0, 0.6)'; }
        if (userItem) { userItem.style.backgroundColor = 'rgba(0, 255, 0, 0.12)'; userItem.style.borderLeft = '4px solid #00aa00'; }
    } else if (isNeg) {
        if (playerName) { playerName.style.color = '#888'; playerName.style.textDecoration = 'line-through'; }
        if (userItem) userItem.style.opacity = '0.35';
    }
}

function applyReputationStyleMatch(playerName, userKey) {
    const { CerberusData } = require('./state.js');
    const playerInfo = playerName ? playerName.closest('.playerInfo') : null;

    if (!userKey || userKey === '<offline>' || userKey.startsWith('<')) {
        if (playerName && playerName.dataset.cerbRepState) {
            delete playerName.dataset.cerbRepState;
            if (playerName) { playerName.style.color = ''; playerName.style.fontWeight = ''; playerName.style.textShadow = ''; playerName.style.textDecoration = ''; }
            if (playerInfo) playerInfo.style.opacity = '';
        }
        return;
    }

    const isPos = CerberusData.isPositive(userKey);
    const isNeg = CerberusData.isNegative(userKey);
    const repState = isPos ? 'pos' : (isNeg ? 'neg' : 'neutral');
    if (playerName && playerName.dataset.cerbRepState === repState) return;

    if (playerName) { playerName.style.color = ''; playerName.style.fontWeight = ''; playerName.style.textShadow = ''; playerName.style.textDecoration = ''; playerName.dataset.cerbRepState = repState; }
    if (playerInfo) playerInfo.style.opacity = '';

    if (isPos) {
        if (playerName) { playerName.style.color = '#00aa00'; playerName.style.fontWeight = 'bold'; playerName.style.textShadow = '0 0 5px rgba(0, 255, 0, 0.6)'; }
    } else if (isNeg) {
        if (playerName) { playerName.style.color = '#888'; playerName.style.textDecoration = 'line-through'; }
        if (playerInfo) playerInfo.style.opacity = '0.35';
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

let _uiDeps = null;
function _getUiDeps() {
    if (_uiDeps) return _uiDeps;
    return (_uiDeps = {
        CerberusData: require('./state.js').CerberusData,
        ConfigManager: require('./config.js').ConfigManager,
        isSystemUser: require('./utils.js').isSystemUser
    });
}

function addReputationControlsToElement(hoverContainer, type) {
    if (!hoverContainer) return;
    const activeUserKey = hoverContainer.dataset.currentUser;
    const triggerBtn = hoverContainer.querySelector('.cerb-flag-trigger');

    if (!activeUserKey || _getUiDeps().isSystemUser(activeUserKey)) {
        if (triggerBtn) triggerBtn.remove();
        delete hoverContainer.dataset.cerbHoverAdded;
        return;
    }

    if (hoverContainer.dataset.cerbHoverAdded === "true") return;
    hoverContainer.dataset.cerbHoverAdded = "true";

    if (type === 'sidebar' || type === 'list') {
        const flagEl = hoverContainer.querySelector('.flagWrapper');
        if (flagEl) {
            const countryTitle = flagEl.title || flagEl.querySelector('img')?.title || (window.CerberusFCADE?.globalUsers?.[activeUserKey]?.country?.name) || '';
            if (triggerBtn) {
                if (countryTitle && triggerBtn.title !== countryTitle) triggerBtn.title = countryTitle;
            } else {
                const btn = document.createElement('span');
                btn.className = 'cerb-flag-trigger';
                btn.title = countryTitle || t('rep.like') || 'Reputação / Opções';
                btn.addEventListener('mouseenter', () => {
                    const currentKey = hoverContainer.dataset.currentUser;
                    const cTitle = flagEl.title || flagEl.querySelector('img')?.title || (window.CerberusFCADE?.globalUsers?.[currentKey]?.country?.name) || '';
                    if (cTitle && btn.title !== cTitle) btn.title = cTitle;
                });
                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const currentKey = hoverContainer.dataset.currentUser;
                    if (currentKey && !_getUiDeps().isSystemUser(currentKey)) {
                        openReputationMenuForUser(currentKey, type, flagEl);
                    }
                });
                hoverContainer.appendChild(btn);
            }
        }
    } else if (type === 'match') {
        const rankEl = hoverContainer.querySelector('.rank, img.rank, .playerRank, .rankImg, img[src*="rank"], .cerb-rank-badge, .cerberus-injected-rank') || hoverContainer.querySelector('.playerName');
        if (rankEl && !triggerBtn) {
            const btn = document.createElement('span');
            btn.className = 'cerb-flag-trigger';
            btn.title = t('rep.like') || 'Reputação / Opções';
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const currentKey = hoverContainer.dataset.currentUser;
                if (currentKey && !_getUiDeps().isSystemUser(currentKey)) {
                    openReputationMenuForUser(currentKey, type, btn);
                }
            });
            hoverContainer.appendChild(btn);
        }
    }
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

    if (!headerTitle.querySelector('.cerb-settings-btn')) {
        const btn = document.createElement('span'); btn.className = 'cerb-settings-btn'; btn.textContent = '⚙️'; btn.title = t('btnTitle');
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
    const existingSyncBtn = headerTitle.querySelector('.cerb-sync-btn');
    const gameId = getActiveGameId(FCADE); const isLocked = (Date.now() - (RankCache.data[gameId]?.lastUpdate || 0) < 1800000);

    if (showRankBtn) {
        if (!existingSyncBtn) {
            const syncBtn = document.createElement('button'); syncBtn.className = 'cerb-sync-btn'; syncBtn.textContent = '🔄';
            Object.assign(syncBtn.style, { cursor: 'pointer', fontSize: '15px', background: 'transparent', border: 'none', borderRadius: '50%', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', outline: 'none', padding: '0', marginRight: '5px', transition: 'background 0.2s' });
            setSyncBtnState(syncBtn, isLocked);
            syncBtn.addEventListener('click', (e) => { e.stopPropagation(); if (RankCache.isSyncing) RankCache.cancelSync(); else { const cId = getActiveGameId(FCADE); if (cId) RankCache.syncRankings(cId); } });
            headerTitle.insertBefore(syncBtn, headerTitle.querySelector('.cerb-settings-btn'));
        } else if (!RankCache.isSyncing) {
            // [CERBERUS] Multi-Room Fix: Always refresh lock state (different rooms have different games)
            setSyncBtnState(existingSyncBtn, isLocked);
        }
    } else if (existingSyncBtn) existingSyncBtn.remove();
}

function injectSidebarSearch() {
    if (document.getElementById('cerbPlayerSearchInput')) return;
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
    const { ConfigManager } = require('./config.js');
    const checkbox = document.getElementById('chatMuted');
    const isMuted = checkbox ? checkbox.checked : (ConfigManager.getSetting('chatUserInfo.chatMuted') === true);
    const targetMuted = isMuted ? 'true' : 'false';
    const targetText = isMuted ? t('motd.resumeChat') : t('motd.muteChat');
    if (btn.dataset.muted !== targetMuted) btn.dataset.muted = targetMuted;
    if (btn.innerText !== targetText) btn.innerText = targetText;
}

function syncQueueFab(btn) {
    if (!btn) return;
    const isLive = window.CerberusState && window.CerberusState.liveMasterOn;
    const targetLive = isLive ? 'true' : 'false';
    const targetText = isLive ? t('queue.fabLiveOn') : t('queue.fabLiveOff');
    if (btn.dataset.live !== targetLive) btn.dataset.live = targetLive;
    if (btn.innerText !== targetText) btn.innerText = targetText;
}

function getOrCreateFabsContainer(chatWrapper) {
    let container = chatWrapper.querySelector('.cerb-fabs-container');
    if (!container) {
        container = document.createElement('div');
        container.className = 'cerb-fabs-container';
        chatWrapper.appendChild(container);
    }
    return container;
}

function injectMuteChatFab(chatWrapper) {
    const { ConfigManager } = require('./config.js');
    const fabsContainer = getOrCreateFabsContainer(chatWrapper);
    let muteBtn = fabsContainer.querySelector('.cerb-mute-chat-fab');
    const checkbox = document.getElementById('chatMuted');

    const shouldBeMuted = ConfigManager.getSetting('chatUserInfo.chatMuted') === true;
    if (checkbox && checkbox.checked !== shouldBeMuted) {
        checkbox.click();
    }

    if (checkbox && !checkbox._cerbChangeAttached) {
        checkbox._cerbChangeAttached = true;
        checkbox.addEventListener('change', () => {
            ConfigManager.updateSetting('chatUserInfo.chatMuted', checkbox.checked);
            document.querySelectorAll('.cerb-mute-chat-fab').forEach(syncMuteFab);
        });
    }

    if (!muteBtn) {
        muteBtn = document.createElement('button');
        muteBtn.className = 'cerb-mute-chat-fab cerb-fab-btn';
        syncMuteFab(muteBtn);
        muteBtn.addEventListener('click', () => {
            const cb = document.getElementById('chatMuted');
            if (cb) {
                cb.click();
                ConfigManager.updateSetting('chatUserInfo.chatMuted', cb.checked);
            }
            document.querySelectorAll('.cerb-mute-chat-fab').forEach(syncMuteFab);
        });
        fabsContainer.appendChild(muteBtn);
    } else {
        syncMuteFab(muteBtn);
    }
}

function injectUIEnhancements() {
    const { getActiveChannelWrapper, executeChatCommand, isNewerVersion } = require('./utils.js');
    const { ConfigManager } = require('./config.js');
    const { CerberusData } = require('./state.js');
    const { CURRENT_VERSION } = require('./constants.js');

    const cw = getActiveChannelWrapper(); const chatWrapper = cw ? cw.querySelector('.chatWrapper') : null;
    if (!chatWrapper) return;

    const fabsContainer = getOrCreateFabsContainer(chatWrapper);

    let clearBtn = fabsContainer.querySelector('.cerb-clear-chat-fab');
    if (!clearBtn) {
        clearBtn = document.createElement('button');
        clearBtn.className = 'cerb-clear-chat-fab cerb-fab-btn';
        clearBtn.innerHTML = t('motd.clearChat');
        clearBtn.addEventListener('click', () => executeChatCommand('/clear'));
        fabsContainer.appendChild(clearBtn);
    }

    injectMuteChatFab(chatWrapper);

    const qEnabled = ConfigManager.getSetting('liveQueue.enabled') === true;
    let queueBtn = fabsContainer.querySelector('.cerb-queue-fab');
    const existingWindow = document.getElementById('cerberusQueueWindow');
    if (qEnabled) {
        if (!queueBtn) {
            queueBtn = document.createElement('button');
            queueBtn.className = 'cerb-queue-fab cerb-fab-btn';
            syncQueueFab(queueBtn);
            queueBtn.addEventListener('click', () => {
                const panel = document.getElementById('cerberusQueueWindow');
                if (panel) {
                    panel.style.display = panel.style.display === 'none' ? 'flex' : 'none';
                    if (panel.style.display === 'flex') renderQueueList();
                }
            });
            fabsContainer.appendChild(queueBtn);
        } else {
            syncQueueFab(queueBtn);
        }
        createQueuePanel();
    } else {
        if (queueBtn) queueBtn.remove();
        if (existingWindow) existingWindow.remove();
    }

    const simEnabled = ConfigManager.getSetting('rankings.enableSimulator') === true;
    let simBtn = fabsContainer.querySelector('.cerb-sim-fab');
    if (simEnabled) {
        if (!simBtn) {
            simBtn = document.createElement('button');
            simBtn.className = 'cerb-sim-fab cerb-fab-btn';
            simBtn.innerHTML = t('elo.simFab') || '⚔️ SIMULADOR FT';
            simBtn.addEventListener('click', () => {
                const panel = document.getElementById('cerberusSimulatorWindow');
                if (panel) {
                    panel.style.display = panel.style.display === 'none' ? 'flex' : 'none';
                }
            });
            fabsContainer.appendChild(simBtn);
        }
        createSimulatorPanel();
    } else {
        if (simBtn) simBtn.remove();
        const existingSimWindow = document.getElementById('cerberusSimulatorWindow');
        if (existingSimWindow) existingSimWindow.style.display = 'none';
    }

    updateMotdNotices(chatWrapper);
}

function updateMotdNotices(chatWrapper, activeGameId) {
    if (!chatWrapper) return;
    const motdWrapper = chatWrapper.querySelector('.messageWrapper.motd');
    if (!motdWrapper) return;

    const { CerberusData } = require('./state.js');
    const { isNewerVersion, resolveNoticeLocale, getActiveGameId } = require('./utils.js');
    const { ConfigManager } = require('./config.js');

    const blocksContainer = motdWrapper.querySelector('.blocksContainer') || motdWrapper;

    // 1. Version Update Notice
    if (CerberusData.latestVersion && isNewerVersion(CerberusData.latestVersion, CURRENT_VERSION) && motdWrapper.dataset.cerbUpdateAdded !== "true") {
        const updateNotice = document.createElement('div');
        updateNotice.className = 'cerb-motd-update-notice';
        const dlUrl = CerberusData.downloadUrl || 'https://cerberus-br.github.io/FightcadePlus';
        updateNotice.innerHTML = `🐺 <b>${t('motd.updateAvail')} ${CerberusData.latestVersion}</b> <a href="${dlUrl}" target="_blank" style="color: #4ade80; text-decoration: underline; margin-left: 10px;">Download</a> <a href="https://cerberus-br.github.io/FightcadePlus" target="_blank" style="color: #a3bffa; text-decoration: underline; margin-left: 10px;">${t('motd.moreDetails')}</a>`;
        blocksContainer.appendChild(updateNotice);
        motdWrapper.dataset.cerbUpdateAdded = "true";
    }

    // 2. Remote Notices from version.json
    blocksContainer.querySelectorAll('.cerb-motd-remote-notice').forEach(el => el.remove());

    if (Array.isArray(CerberusData.remoteNotices) && CerberusData.remoteNotices.length > 0) {
        const currentLang = ConfigManager.getSetting('language') || 'pt';
        const gameId = activeGameId || (typeof getActiveGameId === 'function' ? getActiveGameId() : null);

        CerberusData.remoteNotices.forEach(notice => {
            if (!notice) return;
            if (notice.gameId && notice.gameId !== 'all' && notice.gameId !== gameId) return;

            const resolved = resolveNoticeLocale(notice, currentLang);
            if (!resolved || !resolved.text) return;

            const noticeEl = document.createElement('div');
            noticeEl.className = `cerb-motd-remote-notice ${resolved.style || 'info'}`;
            if (resolved.id) noticeEl.dataset.cerbNoticeId = resolved.id;

            const textSpan = document.createElement('span');
            textSpan.textContent = resolved.text;
            noticeEl.appendChild(textSpan);

            if (resolved.link) {
                const linkEl = document.createElement('a');
                linkEl.href = resolved.link;
                linkEl.target = '_blank';
                linkEl.rel = 'noopener noreferrer';
                linkEl.textContent = resolved.linkLabel || (currentLang === 'pt' ? 'Mais detalhes' : (currentLang === 'es' ? 'Más detalles' : 'More details'));
                noticeEl.appendChild(linkEl);
            }

            blocksContainer.appendChild(noticeEl);
        });
    }
}

// [CERBERUS] Multi-Room Fix: Immediate UI refresh on channel tab switch
function onChannelSwitch(FCADE) {
    const { ConfigManager } = require('./config.js');
    const { fullChatScanScoped, updateSidebarScope, updateFilterShield } = require('./chat.js');

    // Hide any open reputation popover from the previous channel
    const menu = document.getElementById('cerbGlobalMenu');
    if (menu) menu.classList.remove('visible');

    // Reset sidebar search to avoid cross-room filter leaking
    window.CerberusState.sidebarSearchTerm = '';
    const searchInput = document.getElementById('cerbPlayerSearchInput');
    if (searchInput) searchInput.value = '';

    // Refresh header buttons (sync state recalculated for new game)
    injectHeaderButtons(FCADE);
    injectSidebarSearch();
    injectUIEnhancements();
    updateFilterShield();

    // Run a full scan on the newly visible room
    const runtimeConfig = ConfigManager.getRuntimeConfig();
    if (runtimeConfig) {
        const { getActiveChannelWrapper } = require('./utils.js');
        const cw = getActiveChannelWrapper();
        if (cw) {
            fullChatScanScoped(cw, FCADE, runtimeConfig);
            const sidebar = cw.querySelector('.usersListWrapper');
            if (sidebar) updateSidebarScope(sidebar, FCADE, runtimeConfig);
        }
    }
}

module.exports = {
    injectStyles, createControlPanel, createQueuePanel, renderQueueList, createSimulatorPanel, injectGlobalMenu,
    applyReputationStyleChat, applyReputationStyleList, applyReputationStyleMatch,
    addReputationControlsToElement, unlockColorThemes, applyTheme, setSyncBtnState,
    injectHeaderButtons, injectSidebarSearch, injectUIEnhancements, updateMotdNotices, onChannelSwitch, createFlagElement,
    createPingElement, createRankElement, createPingTextElement, createStatusElement, createRankBadge,
    getRankBadgeIcon, getRankBadgeText,
    applyDevBadge, createChatTriggerElement, openReputationMenuForUser
};
