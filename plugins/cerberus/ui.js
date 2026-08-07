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
function createRankBadge(numericRank) {
    const badge = document.createElement('span'); badge.className = 'cerb-rank-badge';
    const icon = numericRank <= 10 ? '👑' : '🏅';
    Object.assign(badge.style, { fontSize: '12px', fontWeight: 'normal', color: '#ffd700', backgroundColor: 'transparent', border: 'none', padding: '0', marginRight: '5px', verticalAlign: 'middle', display: 'inline-block' });
    badge.textContent = `${icon}#${numericRank}`;
    badge.title = `Fightcade Rank #${numericRank}`;
    return badge;
}

function injectStyles() {
    if (document.getElementById('cerberusStyles')) return;
    const style = document.createElement('style'); style.id = 'cerberusStyles';
    style.textContent = `
        .cerb-section-children.cerb-disabled { opacity: 0.35; pointer-events: none; user-select: none; }
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
        
        .cerb-clear-chat-fab { position: absolute; right: 15px; bottom: 65px; background: var(--mainColor-dark, rgba(30, 30, 35, 0.75)); border-radius: 5px; width: 160px; text-align: center; text-transform: uppercase; padding: 6px 14px; font-size: 11px; font-weight: bold; cursor: pointer; transition: all 0.2s ease; z-index: 100; box-shadow: 0 4px 12px rgba(0,0,0,0.4); backdrop-filter: blur(8px); border: 1px solid var(--mainColor-light, rgba(255, 255, 255, 0.15)); color: var(--mainColor-lightest, #ccc); opacity: 0.85; }
        .cerb-clear-chat-fab:hover { background: var(--mainColor-light, rgba(50, 50, 60, 0.9)); color: #fff; transform: translateY(-2px); border-color: var(--accentColor); box-shadow: 0 0 12px var(--accentColor, rgba(102, 126, 234, 0.4)); opacity: 1; backdrop-filter: blur(12px); }
        
        .cerb-mute-chat-fab { position: absolute; right: 15px; bottom: 100px; background: var(--mainColor-dark, rgba(30, 30, 35, 0.75)); border-radius: 5px; width: 160px; text-align: center; text-transform: uppercase; padding: 6px 14px; font-size: 11px; font-weight: bold; cursor: pointer; transition: all 0.2s ease; z-index: 100; box-shadow: 0 4px 12px rgba(0,0,0,0.4); backdrop-filter: blur(8px); border: 1px solid var(--mainColor-light, rgba(255, 255, 255, 0.15)); color: var(--mainColor-lightest, #ccc); opacity: 0.85; }
        .cerb-mute-chat-fab:hover { background: var(--mainColor-light, rgba(50, 50, 60, 0.9)); color: #fff; transform: translateY(-2px); border-color: var(--accentColor); box-shadow: 0 0 12px var(--accentColor, rgba(102, 126, 234, 0.4)); opacity: 1; backdrop-filter: blur(12px); }
        .cerb-mute-chat-fab[data-muted="true"] { border-color: rgba(251, 191, 36, 0.9); color: #fbbf24; background: rgba(251, 191, 36, 0.25); opacity: 0.95; }
        .cerb-mute-chat-fab[data-muted="true"]:hover { border-color: rgba(251, 191, 36, 1); color: #fff; background: rgba(251, 191, 36, 0.35); opacity: 1; }
        
        .cerb-queue-fab { position: absolute; right: 15px; bottom: 135px; background: var(--mainColor-dark, rgba(30, 30, 35, 0.75)); border-radius: 5px; width: 160px; text-align: center; text-transform: uppercase; padding: 6px 14px; font-size: 11px; font-weight: bold; cursor: pointer; transition: all 0.2s ease; z-index: 100; box-shadow: 0 4px 12px rgba(0,0,0,0.4); backdrop-filter: blur(8px); border: 1px solid var(--accentColor, var(--mainColor-light, rgba(102, 126, 234, 0.4))); color: var(--accentColor, var(--mainColor-lighter, #a3bffa)); opacity: 0.85; }
        .cerb-queue-fab:hover { background: var(--mainColor-light, rgba(102, 126, 234, 0.3)); color: #fff; transform: translateY(-2px); border-color: var(--accentColor); box-shadow: 0 0 12px var(--accentColor, rgba(102, 126, 234, 0.4)); opacity: 1; backdrop-filter: blur(12px); }
        .cerb-queue-fab[data-live="true"] { border-color: rgba(74, 222, 128, 0.9); color: #4ade80; background: rgba(74, 222, 128, 0.18); }
        .cerb-queue-fab[data-live="true"]:hover { border-color: rgba(74, 222, 128, 1); color: #fff; background: rgba(74, 222, 128, 0.25); }
        
        .q-live-btn { border: 1px solid rgba(255,255,255,0.1); border-radius: 4px; padding: 5px 10px; font-size: 11px; font-weight: bold; cursor: pointer; transition: all 0.2s; color: white; }
        .q-live-btn.on { background: rgba(0, 170, 0, 0.3); border-color: #00aa00; }
        .q-live-btn.on:hover { background: rgba(0, 170, 0, 0.5); }
        .q-live-btn.off { background: rgba(170, 0, 0, 0.3); border-color: #ff4444; }
        .q-live-btn.off:hover { background: rgba(170, 0, 0, 0.5); }
        .cerb-motd-update-notice { background: rgba(255, 165, 0, 0.15); border-left: 4px solid #ffaa00; padding: 10px 15px; margin-top: 15px; border-radius: 4px; color: #ffdca5; font-size: 13px; display: inline-block; width: calc(100% - 10px); box-sizing: border-box; line-height: 1.4; }
        body.cerb-hide-sidebar-ping .usersListToolbar .userItem .pingWrapper img.ping { display: none !important; }
        .chatContent { padding-bottom: 20px !important; }
        .chatContent.blur-all .message .line .blocksContainer { filter: blur(5px); transition: filter 0.2s ease; user-select: none; }
        .chatContent.blur-all:hover .message .line .blocksContainer { filter: blur(0); user-select: text; }
        #cerbGlobalMenu { position: fixed; background: var(--mainColor-dark, rgba(18, 18, 26, 0.95)); backdrop-filter: blur(12px); border: 1px solid var(--accentColor, var(--mainColor-light, rgba(102, 126, 234, 0.4))); border-radius: 14px; padding: 6px 12px; box-shadow: 0 10px 30px rgba(0, 0, 0, 0.7), 0 0 15px var(--accentColor, rgba(102, 126, 234, 0.25)); display: flex; align-items: center; gap: 8px; z-index: 100000; opacity: 0; pointer-events: none; transition: opacity 0.2s ease, transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1); transform: scale(0.9) translateY(6px); user-select: none; white-space: nowrap; }
        #cerbGlobalMenu.visible { opacity: 1; pointer-events: auto; transform: scale(1) translateY(0); }
        #cerbGlobalMenu .cerb-action-icon { cursor: pointer; font-size: 16px; transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1), filter 0.2s ease; display: inline-block; padding: 3px 5px; line-height: 1; }
        #cerbGlobalMenu .cerb-action-icon:hover { transform: scale(1.35) translateY(-2px); filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.6)); }
        .cerb-menu-divider { width: 1px; height: 18px; background: rgba(255, 255, 255, 0.2); margin: 0 3px; }
        .userItem, .playerInfo { position: relative; }
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

        #cerberusPanel { position: fixed; width: 480px; max-height: 85vh; background: linear-gradient(135deg, var(--mainColor-dark, #260f23), var(--mainColor, #351b30) 65%, var(--mainColor-light, #5e3550)); backdrop-filter: blur(16px); border: 1px solid var(--mainColor-light, rgba(255, 255, 255, 0.25)); border-radius: 12px; z-index: 10000; color: var(--mainColor-lightest, #ececec); font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; box-shadow: 0 20px 60px rgba(0, 0, 0, 0.6), 0 0 25px var(--mainColor-dark, rgba(0,0,0,0.5)); display: none; overflow: hidden; flex-direction: column; }
        @media (max-width: 768px) { #cerberusPanel { width: 95%; max-height: 90vh; } }
        #cerberusPanel .header, #cerberusQueueWindow .q-header { display: flex; justify-content: space-between; align-items: center; padding: 14px 20px; background: linear-gradient(90deg, var(--mainColor-dark, rgba(0, 0, 0, 0.3)), var(--mainColor, rgba(0, 0, 0, 0.1))); border-bottom: 1px solid var(--mainColor-light, rgba(255, 255, 255, 0.15)); cursor: move; user-select: none; }
        #cerberusPanel .header .title, #cerberusQueueWindow .q-title { display: flex; align-items: center; gap: 10px; font-size: 16px; font-weight: 600; color: var(--accentColor, #fff); letter-spacing: 0.5px; }
        #cerberusPanel .closeBtn, #cerberusQueueWindow .q-close { background: transparent; border: none; color: var(--mainColor-lightest-trans-hi, rgba(255, 255, 255, 0.7)); font-size: 24px; cursor: pointer; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; border-radius: 6px; transition: all 0.2s; }
        #cerberusPanel .closeBtn:hover, #cerberusQueueWindow .q-close:hover { background: var(--mainColor-light, rgba(255, 255, 255, 0.15)); color: #fff; }
        #cerberusPanel .tabs { display: flex; background: var(--mainColor-dark, rgba(0, 0, 0, 0.25)); padding: 0 10px; border-bottom: 1px solid var(--mainColor-light, rgba(255, 255, 255, 0.15)); }
        #cerberusPanel .tab { padding: 14px 20px; background: transparent; border: none; border-bottom: 2px solid transparent; color: var(--mainColor-lightest-trans-md, rgba(255, 255, 255, 0.7)); cursor: pointer; font-size: 13px; font-weight: 500; transition: all 0.2s; }
        #cerberusPanel .tab:hover { color: var(--accentColor, #fff); }
        #cerberusPanel .tab.active { color: var(--accentColor, var(--mainColor-light, #667eea)); border-bottom-color: var(--accentColor, var(--mainColor-light, #667eea)); font-weight: 700; }
        #cerberusPanel .tab.disabled { opacity: 0.3; cursor: not-allowed; }
        #cerberusPanel .content { flex: 1; overflow-y: auto; padding: 20px; }
        .modern-toggle { display: flex; justify-content: space-between; align-items: center; padding: 12px; margin-bottom: 8px; background: var(--mainColor-dark-trans-lo, rgba(255, 255, 255, 0.05)); border: 1px solid var(--mainColor-light, rgba(255, 255, 255, 0.1)); border-radius: 8px; transition: background 0.2s, border-color 0.2s; }
        .modern-toggle:hover { background: var(--mainColor-light, rgba(255, 255, 255, 0.1)); border-color: var(--mainColor-lighter, rgba(255, 255, 255, 0.2)); }
        .switch { position: relative; display: inline-block; width: 44px; height: 24px; }
        .switch input { opacity: 0; width: 0; height: 0; }
        .slider { position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: var(--mainColor-dark, #444); transition: .3s; border-radius: 24px; border: 1px solid var(--mainColor-light, rgba(255, 255, 255, 0.15)); }
        .slider:before { position: absolute; content: ""; height: 18px; width: 18px; left: 2px; bottom: 2px; background-color: white; transition: .3s; border-radius: 50%; }
        input:checked + .slider { background-color: var(--accentColor, var(--mainColor-light, #667eea)); border-color: var(--accentColor); box-shadow: 0 0 8px var(--accentColor, rgba(102, 126, 234, 0.4)); }
        input:checked + .slider:before { transform: translateX(20px); background-color: var(--mainColor-darker, #111); }
        .search-bar { width: 100%; padding: 10px 14px; background: var(--mainColor-dark, rgba(0, 0, 0, 0.25)); border: 1px solid var(--mainColor-light, rgba(255, 255, 255, 0.2)); border-radius: 8px; color: white; margin-bottom: 15px; font-size: 14px; outline: none; transition: border-color 0.2s, box-shadow 0.2s; }
        .search-bar:focus { border-color: var(--accentColor, var(--mainColor-light, #667eea)); box-shadow: 0 0 8px var(--accentColor, rgba(102, 126, 234, 0.3)); }
        #cerberusQueueWindow { position: fixed; right: 20px; bottom: 150px; width: 320px; max-height: 400px; background: linear-gradient(135deg, var(--mainColor-dark, #260f23), var(--mainColor, #351b30)); backdrop-filter: blur(16px); border: 1px solid var(--accentColor, var(--mainColor-light, rgba(102, 126, 234, 0.4))); border-radius: 12px; z-index: 10000; color: #ececec; font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; box-shadow: 0 10px 30px rgba(0, 0, 0, 0.7); display: flex; flex-direction: column; overflow: hidden; }
        #cerbQueueCount { color: var(--accentColor, var(--mainColor-lighter, #a3bffa)); margin-left: 5px; font-size: 12px; }
        .q-add-box { display: flex; padding: 10px; background: var(--mainColor-darker, rgba(0,0,0,0.25)); border-bottom: 1px solid var(--mainColor-light, rgba(255,255,255,0.05)); gap: 8px; }
        .q-add-box input { flex: 1; padding: 6px 10px; background: var(--mainColor-dark, rgba(255,255,255,0.05)); border: 1px solid var(--mainColor-light, rgba(255,255,255,0.1)); border-radius: 4px; color: #fff; font-size: 12px; outline: none; }
        .q-add-box input:focus { border-color: var(--accentColor, var(--mainColor-light, #667eea)); }
        .q-add-box button { background: var(--accentColor, var(--mainColor-light, #667eea)); color: var(--mainColor-darker, #000); border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer; font-size: 12px; font-weight: bold; transition: all 0.2s; text-transform: uppercase; }
        .q-add-box button:hover { filter: brightness(1.15); box-shadow: 0 0 8px var(--accentColor); }
        .q-list { flex: 1; overflow-y: auto; padding: 10px; display: flex; flex-direction: column; gap: 6px; }
        .q-empty { text-align: center; color: #888; font-size: 12px; padding: 20px 0; font-style: italic; }
        .q-item { display: flex; justify-content: space-between; align-items: center; background: var(--mainColor-darker-trans-lo, rgba(255,255,255,0.03)); padding: 8px 12px; border-radius: 6px; border-left: 3px solid var(--accentColor, var(--mainColor-light, #667eea)); }
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
    const sectionHeader = (title) => `<h4 style="margin: 0 0 12px 0; font-size: 13px; text-transform: uppercase; color: var(--accentColor, var(--mainColor-lighter, #667eea)); letter-spacing: 1px; font-weight: 700;">${title}</h4>`;
    const createSection = (title, items) => `<div style="margin-bottom: 24px;">${sectionHeader(title)}${items}</div>`;

    const createMasterSection = (masterKey, title, childrenId, items) => {
        const enabled = ConfigManager.getSetting(masterKey) === true;
        const headerToggle = `<label class="switch" style="transform:scale(0.8);"><input type="checkbox" data-setting="${masterKey}" data-master-for="${childrenId}" ${enabled ? 'checked' : ''}><span class="slider"></span></label>`;
        const header = `<div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">${sectionHeader(title)}${headerToggle}</div>`;
        return `<div style="margin-bottom: 24px;">${header}<div id="${childrenId}" class="cerb-section-children ${enabled ? '' : 'cerb-disabled'}">${items}</div></div>`;
    };

    const settingToggle = (key, label) => {
        const val = ConfigManager.getSetting(key) === true;
        return `<div class="modern-toggle"><span style="font-size: 14px; color: var(--mainColor-lightest, #e0e0e0);">${label}</span><label class="switch"><input type="checkbox" data-setting="${key}" ${val ? 'checked' : ''}><span class="slider"></span></label></div>`;
    };
    const settingInput = (key, label, type = "text") => {
        let val = ConfigManager.getSetting(key) ?? ''; const safeVal = val.toString().replace(/"/g, '&quot;');
        if (type === 'textarea') { const displayVal = safeVal.replace(/\\n/g, '\n'); return `<div class="modern-toggle" style="flex-wrap: wrap;"><span style="font-size: 14px; color: var(--mainColor-lightest, #e0e0e0); flex: 1; min-width: 150px;">${label}</span><textarea data-setting="${key}" rows="3" style="background: var(--mainColor-darker, rgba(0,0,0,0.3)); color: white; border: 1px solid var(--mainColor-light, rgba(255,255,255,0.2)); padding: 6px 8px; border-radius: 4px; outline: none; width: 100%; margin-top: 8px; resize: vertical; font-family: inherit; font-size: 13px; line-height: 1.4;">${displayVal}</textarea></div>`; }
        return `<div class="modern-toggle" style="flex-wrap: wrap;"><span style="font-size: 14px; color: var(--mainColor-lightest, #e0e0e0); flex: 1; min-width: 150px;">${label}</span><input type="${type}" data-setting="${key}" value="${safeVal}" style="background: var(--mainColor-darker, rgba(0,0,0,0.3)); color: white; border: 1px solid var(--mainColor-light, rgba(255,255,255,0.2)); padding: 4px 8px; border-radius: 4px; outline: none; width: ${key === 'liveQueue.promoMessage' ? '100%' : '100px'}; text-align: ${key === 'liveQueue.promoMessage' ? 'left' : 'center'}; margin-top: ${key === 'liveQueue.promoMessage' ? '8px' : '0'};"></div>`;
    };
    const settingSelect = (key, label, options) => {
        const currentVal = ConfigManager.getSetting(key) || options[0].value;
        const optsHtml = options.map(opt => `<option value="${opt.value}" ${currentVal == opt.value ? 'selected' : ''}>${opt.text}</option>`).join('');
        return `<div class="modern-toggle"><span style="font-size: 14px; color: var(--mainColor-lightest, #e0e0e0);">${label}</span><select data-setting="${key}" style="background: var(--mainColor-darker, rgba(0,0,0,0.3)); color: white; border: 1px solid var(--mainColor-light, rgba(255,255,255,0.2)); padding: 4px 8px; border-radius: 4px; outline: none;">${optsHtml}</select></div>`;
    };
    const blurToggle = () => {
        const isAll = ConfigManager.getSetting('chatUserInfo.blurMode') === 'all';
        return `<div class="modern-toggle"><span style="font-size: 14px; color: var(--mainColor-lightest, #e0e0e0);">${t('settings.blurMode')}</span><label class="switch"><input type="checkbox" data-setting="chatUserInfo.blurMode" data-blur-toggle="true" ${isAll ? 'checked' : ''}><span class="slider"></span></label></div>`;
    };

    const langSelect = `<div class="modern-toggle" style="margin-bottom: 24px;"><span style="font-size: 14px; color: var(--mainColor-lightest, #e0e0e0); font-weight: bold;">${t('settings.language')}</span><select id="cerbLangSelect" data-setting="language" style="background: var(--mainColor-darker, rgba(0,0,0,0.3)); color: white; border: 1px solid var(--mainColor-light, rgba(255,255,255,0.2)); padding: 6px 10px; border-radius: 4px; outline: none; font-size: 13px; cursor: pointer;"><option value="en" ${ConfigManager.getSetting('language') === 'en' ? 'selected' : ''}>🇺🇸 English</option><option value="pt" ${ConfigManager.getSetting('language') === 'pt' ? 'selected' : ''}>🇧🇷 Português</option><option value="es" ${ConfigManager.getSetting('language') === 'es' ? 'selected' : ''}>🇪🇸 Español</option></select></div>`;

    // [CERBERUS] Custom Audio Block with Test Player
    const soundPref = ConfigManager.getSetting('chatUserInfo.challengeSound') || 'native';
    const isAudioDisabled = soundPref === 'native' || soundPref === 'silent';
    const customAudioSelect = `
        <div class="modern-toggle" style="flex-wrap: wrap;">
            <span style="font-size: 14px; color: var(--mainColor-lightest, #e0e0e0); flex: 1; min-width: 150px;">${t('settings.challengeSound')}</span>
            <div style="display: flex; gap: 5px; width: 100%; margin-top: 8px;">
                <select id="cerbAudioSelect" data-setting="chatUserInfo.challengeSound" style="flex: 1; background: var(--mainColor-darker, rgba(0,0,0,0.3)); color: white; border: 1px solid var(--mainColor-light, rgba(255,255,255,0.2)); padding: 4px 8px; border-radius: 4px; outline: none;">
                    <option value="native" ${soundPref === 'native' ? 'selected' : ''}>${t('settings.soundNative')}</option>
                    <option value="custom1" ${soundPref === 'custom1' ? 'selected' : ''}>${t('settings.soundCustom1')}</option>
                    <option value="custom2" ${soundPref === 'custom2' ? 'selected' : ''}>${t('settings.soundCustom2')}</option>
                    <option value="custom3" ${soundPref === 'custom3' ? 'selected' : ''}>${t('settings.soundCustom3')}</option>
					<option value="custom4" ${soundPref === 'custom4' ? 'selected' : ''}>${t('settings.soundCustom4')}</option>
					<option value="custom5" ${soundPref === 'custom5' ? 'selected' : ''}>${t('settings.soundCustom5')}</option>
					<option value="custom6" ${soundPref === 'custom6' ? 'selected' : ''}>${t('settings.soundCustom6')}</option>
					<option value="custom7" ${soundPref === 'custom7' ? 'selected' : ''}>${t('settings.soundCustom7')}</option>
					<option value="custom8" ${soundPref === 'custom8' ? 'selected' : ''}>${t('settings.soundCustom8')}</option>
                    <option value="silent" ${soundPref === 'silent' ? 'selected' : ''}>${t('settings.soundSilent')}</option>
                </select>
                <button id="cerbAudioPlayBtn" ${isAudioDisabled ? 'disabled style="opacity: 0.3; cursor: not-allowed;"' : 'style="cursor: pointer;"'} class="q-live-btn on" style="padding: 4px 12px; display: flex; align-items: center; justify-content: center; transition: all 0.2s;">▶️</button>
            </div>
        </div>
    `;

    const autoJoinBlock = createMasterSection('autoJoin.enabled', t('settings.autoJoin'), 'cerbAutoJoinChildren',
        `<div style="display: flex; gap: 5px; width: 100%;">
            <input type="text" data-setting="autoJoin.channelId" value="${(ConfigManager.getSetting('autoJoin.channelId') || '').replace(/"/g, '&quot;')}" placeholder="e.g. The King of Fighters 2002 (NGM-2650)" style="flex: 1; background: var(--mainColor-darker, rgba(0,0,0,0.3)); color: white; border: 1px solid var(--mainColor-light, rgba(255,255,255,0.2)); padding: 6px 8px; border-radius: 4px; outline: none; font-size: 12px;">
            <button id="cerbCaptureRoomBtn" style="background: var(--accentColor, var(--mainColor-light, #667eea)); color: var(--mainColor-darker, #000); border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer; font-size: 12px; font-weight: bold; transition: all 0.2s;">${t('settings.autoJoinCapture')}</button>
        </div>`
    );

    tab.innerHTML = langSelect +
        autoJoinBlock +
        createMasterSection('liveQueue.enabled', t('settings.liveQueue'), 'cerbLiveQueueChildren',
            settingInput('liveQueue.keyword', t('settings.queueKeyword')) +
            settingInput('liveQueue.streamerNick', t('settings.queueStreamer')) +
            settingInput('liveQueue.limit', t('settings.queueLimit'), 'number') +
            settingToggle('liveQueue.autoReply', t('settings.queueReply')) +
            settingToggle('liveQueue.promoEnabled', t('settings.queuePromoEnable')) +
            settingInput('liveQueue.promoMessage', t('settings.queuePromo'), 'textarea')) +
        createMasterSection('rankings.masterEnabled', t('settings.rankingsApi'), 'cerbRankingsChildren',
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
            `<div style="font-size: 11px; color: #ffca28; opacity: 0.85; margin-top: -6px; margin-bottom: 12px; line-height: 1.35; padding: 2px 0;">${t('settings.rankLimitNotice')}</div>` +
            settingInput('rankings.country', t('settings.rankCountry')) +
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
            `<button id="cerbClearRankingsBtn" style="margin-top: 12px; width: 100%; padding: 8px 12px; font-size: 12px; font-weight: bold; background: rgba(255, 68, 68, 0.15); border: 1px solid rgba(255, 68, 68, 0.4); color: #ff8888; border-radius: 6px; cursor: pointer; transition: all 0.2s;">${t('settings.clearRankingsBtn')}</button>`) +
        createSection(t('settings.filters'),
            settingToggle('countryFilter.enabled', t('settings.enableFilter')) +
            settingToggle('countryFilter.autoReject', t('settings.autoRejectCountry')) +
            settingToggle('pingFilter.enabled', t('settings.pingFilter')) +
            settingInput('pingFilter.maxPingMs', t('settings.maxPingMs'), 'number') +
            settingToggle('pingFilter.autoReject', t('settings.autoRejectPing')) +
            settingToggle('countryFilter.autoRejectNotify', t('autoReject.notifyToggle'))) +
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
        createSection(t('settings.privacy'), blurToggle() + settingToggle('chatUserInfo.unlockColorThemes', t('settings.unlockThemes')));

    tab.querySelectorAll('input[data-setting], select[data-setting], textarea[data-setting]').forEach(input => {
        const handleSettingChange = (e) => {
            const key = e.target.getAttribute('data-setting'); let val = e.target.value;
            if (e.target.dataset.blurToggle) val = e.target.checked ? 'all' : 'none';
            else if (e.target.type === 'checkbox') val = e.target.checked;
            else if (key === 'rankings.limit') val = isNaN(Number(e.target.value)) ? e.target.value : parseInt(e.target.value);
            else if (e.target.type === 'number' || key === 'rankings.minRankToAccept') val = parseInt(e.target.value);
            else if (key === 'rankings.country') val = e.target.value.toUpperCase().trim();
            else if (e.target.tagName === 'TEXTAREA') val = e.target.value.split(String.fromCharCode(10)).slice(0, 3).join(String.fromCharCode(92) + 'n');

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
        const btnPlay = document.createElement('button'); btnPlay.innerHTML = player.played ? '↩️' : '✅'; btnPlay.title = t('queue.mark'); btnPlay.addEventListener('click', () => CerberusData.togglePlayedQueue(index));
        const btnUp = document.createElement('button'); btnUp.innerHTML = '⬆️'; btnUp.title = t('queue.up'); btnUp.disabled = index === 0; if (!btnUp.disabled) btnUp.addEventListener('click', () => CerberusData.moveQueue(index, -1));
        const btnDown = document.createElement('button'); btnDown.innerHTML = '⬇️'; btnDown.title = t('queue.down'); btnDown.disabled = index === CerberusData.liveQueue.length - 1; if (!btnDown.disabled) btnDown.addEventListener('click', () => CerberusData.moveQueue(index, 1));
        const btnDel = document.createElement('button'); btnDel.innerHTML = '❌'; btnDel.title = t('queue.remove'); btnDel.className = 'danger'; btnDel.addEventListener('click', () => CerberusData.removeQueue(index));
        controls.appendChild(btnPlay); controls.appendChild(btnUp); controls.appendChild(btnDown); controls.appendChild(btnDel); item.appendChild(nameSpan); item.appendChild(controls); listEl.appendChild(item);
    });
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
    if (author) { author.style.color = ''; author.style.fontWeight = ''; author.style.textShadow = ''; author.style.textDecoration = ''; }
    if (msg) { msg.style.backgroundColor = ''; msg.style.borderLeft = ''; msg.style.paddingLeft = ''; msg.style.opacity = ''; delete msg.dataset.cerbRepState; }
    if (!userKey || userKey === '<offline>' || userKey.startsWith('<')) return;

    const isPos = CerberusData.isPositive(userKey);
    const isNeg = CerberusData.isNegative(userKey);
    const repState = isPos ? 'pos' : (isNeg ? 'neg' : 'neutral');
    if (msg.dataset.cerbRepState === repState) return;
    msg.dataset.cerbRepState = repState;

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
    if (playerName) { playerName.style.color = ''; playerName.style.fontWeight = ''; playerName.style.textDecoration = ''; playerName.style.textShadow = ''; delete playerName.dataset.cerbRepState; }
    if (userItem) { userItem.style.opacity = ''; userItem.style.backgroundColor = ''; userItem.style.borderLeft = ''; delete userItem.dataset.cerbRepState; }
    if (!userKey || userKey === '<offline>' || userKey.startsWith('<')) return;

    const isPos = CerberusData.isPositive(userKey);
    const isNeg = CerberusData.isNegative(userKey);
    const repState = isPos ? 'pos' : (isNeg ? 'neg' : 'neutral');
    if (userItem.dataset.cerbRepState === repState) return;
    userItem.dataset.cerbRepState = repState;

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

    if (playerName) { playerName.style.color = ''; playerName.style.fontWeight = ''; playerName.style.textShadow = ''; playerName.style.textDecoration = ''; delete playerName.dataset.cerbRepState; }
    if (playerInfo) playerInfo.style.opacity = '';
    if (!userKey || userKey === '<offline>' || userKey.startsWith('<')) return;

    const isPos = CerberusData.isPositive(userKey);
    const isNeg = CerberusData.isNegative(userKey);
    const repState = isPos ? 'pos' : (isNeg ? 'neg' : 'neutral');
    if (playerName.dataset.cerbRepState === repState) return;
    playerName.dataset.cerbRepState = repState;

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
        if (flagEl && !triggerBtn) {
            const btn = document.createElement('span');
            btn.className = 'cerb-flag-trigger';
            btn.title = t('rep.like') || 'Reputação / Opções';
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const currentKey = hoverContainer.dataset.currentUser;
                if (currentKey && !_getUiDeps().isSystemUser(currentKey)) {
                    openReputationMenuForUser(currentKey, type, flagEl);
                }
            });
            hoverContainer.appendChild(btn);
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
    const checkbox = document.getElementById('chatMuted');
    const isMuted = checkbox ? checkbox.checked : false;
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
            const queueBtn = document.createElement('button'); queueBtn.className = 'cerb-queue-fab';
            syncQueueFab(queueBtn);
            queueBtn.addEventListener('click', () => { const panel = document.getElementById('cerberusQueueWindow'); if (panel) { panel.style.display = panel.style.display === 'none' ? 'flex' : 'none'; if (panel.style.display === 'flex') renderQueueList(); } });
            chatWrapper.appendChild(queueBtn);
        } else {
            syncQueueFab(existingFab);
        }
        createQueuePanel();
    } else { if (existingFab) existingFab.remove(); if (existingWindow) existingWindow.remove(); }
    const motdWrapper = chatWrapper.querySelector('.messageWrapper.motd');
    if (motdWrapper && CerberusData.latestVersion && isNewerVersion(CerberusData.latestVersion, CURRENT_VERSION) && motdWrapper.dataset.cerbUpdateAdded !== "true") {
        const updateNotice = document.createElement('div'); updateNotice.className = 'cerb-motd-update-notice';
        const dlUrl = CerberusData.downloadUrl || 'https://cerberus-br.github.io/FightcadePlus';
        updateNotice.innerHTML = `🐺 <b>${t('motd.updateAvail')} ${CerberusData.latestVersion}</b> <a href="${dlUrl}" target="_blank" style="color: #4ade80; text-decoration: underline; margin-left: 10px;">Download</a> <a href="https://cerberus-br.github.io/FightcadePlus" target="_blank" style="color: #a3bffa; text-decoration: underline; margin-left: 10px;">${t('motd.moreDetails')}</a>`;
        const blocksContainer = motdWrapper.querySelector('.blocksContainer');
        if (blocksContainer) blocksContainer.appendChild(updateNotice); else motdWrapper.appendChild(updateNotice);
        motdWrapper.dataset.cerbUpdateAdded = "true";
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
    injectStyles, createControlPanel, createQueuePanel, renderQueueList, injectGlobalMenu,
    applyReputationStyleChat, applyReputationStyleList, applyReputationStyleMatch,
    addReputationControlsToElement, unlockColorThemes, applyTheme, setSyncBtnState,
    injectHeaderButtons, injectSidebarSearch, injectUIEnhancements, onChannelSwitch, createFlagElement,
    createPingElement, createRankElement, createPingTextElement, createStatusElement, createRankBadge,
    applyDevBadge, createChatTriggerElement, openReputationMenuForUser
};