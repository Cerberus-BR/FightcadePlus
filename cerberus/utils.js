const { Locales } = require('./locales.js');

function t(keyPath) {
    const { ConfigManager } = require('./config.js');
    const lang = ConfigManager.getSetting('language') || 'en';
    const keys = keyPath.split('.');
    
    let result = Locales[lang];
    for (let k of keys) { 
        if (result === undefined) break; 
        result = result[k]; 
    }
    return result || keyPath;
}

function normalizeUsername(username) { 
    return !username ? '' : username.replace(/\s+/g, ' ').trim(); 
}

function isSystemUser(username) { 
    return !username || username === '<offline>' || username.startsWith('<'); 
}

function extractMinPing(title) {
    if (!title) return null;
    const match = title.match(/(\d+)~(\d+)/); 
    if (match) return parseInt(match[1]);
    const single = title.match(/(\d+)/); 
    return single ? parseInt(single[1]) : null;
}

function getMinPing(userFound) { 
    return extractMinPing(userFound?.pingTitle); 
}

let _popAudioCtx = null;
function playPopSound() {
    try {
        const AC = window.AudioContext || window.webkitAudioContext; 
        if (!AC) return;
        if (!_popAudioCtx) _popAudioCtx = new AC();
        const ctx = _popAudioCtx; 
        if (ctx.state === 'suspended') ctx.resume();
        const osc = ctx.createOscillator(); 
        const gain = ctx.createGain();
        osc.type = 'sine'; osc.frequency.setValueAtTime(880, ctx.currentTime); osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.1);
        gain.gain.setValueAtTime(0.3, ctx.currentTime); gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
        osc.connect(gain); gain.connect(ctx.destination); osc.start(); osc.stop(ctx.currentTime + 0.1);
    } catch (e) { }
}

function executeChatCommand(command) {
    const cw = getActiveChannelWrapper(); 
    const inputEl = cw ? cw.querySelector('.chatInput input.input') : null;
    if (!inputEl) return;
    const nativeSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set;
    nativeSetter.call(inputEl, command);
    inputEl.dispatchEvent(new Event('input', { bubbles: true }));
    inputEl.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', code: 'Enter', keyCode: 13, which: 13, bubbles: true }));
}

async function executeChatMacro(lines) {
    const cw = getActiveChannelWrapper(); 
    const inputEl = cw ? cw.querySelector('.chatInput input.input') : null;
    if (!inputEl || !lines || lines.length === 0) return;
    const nativeSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set;
    const currentVal = inputEl.value;
    for (const line of lines) {
        nativeSetter.call(inputEl, line); 
        inputEl.dispatchEvent(new Event('input', { bubbles: true })); 
        inputEl.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', keyCode: 13, bubbles: true }));
        await new Promise(r => setTimeout(r, 250));
    }
    await new Promise(r => setTimeout(r, 50));
    nativeSetter.call(inputEl, currentVal); 
    inputEl.dispatchEvent(new Event('input', { bubbles: true }));
}

function getActiveChannelWrapper() {
    const all = document.querySelectorAll('.channelWrapper');
    for (const cw of all) { 
        if (cw.style.display !== 'none' && cw.offsetParent !== null) {
            return cw; 
        }
    }
    return all[0] || null;
}

function isRankedChannel(cw) {
    const scope = cw || getActiveChannelWrapper() || document;
    return !!scope.querySelector('.channelInfo .rankedWrapper');
}

function getActiveGameId(FCADE, cw) {
    try {
        if (!isRankedChannel(cw)) return null;
        const scope = cw || getActiveChannelWrapper() || document;
        const romNameEl = scope.querySelector('.channelInfo .name[title="Rom name"]');
        if (romNameEl?.textContent?.trim()) return romNameEl.textContent.trim();
        const gameLink = scope.querySelector('.channelInfo a.link[href*="/game/"]');
        if (gameLink) { const match = gameLink.href.match(/\/game\/([^/]+)\//); if (match?.[1]) return match[1]; }
        if (FCADE && FCADE.activeChannelId) {
            const chan = FCADE.channels?.find(c => c.id === FCADE.activeChannelId);
            if (chan && chan.gameid) return chan.gameid;
            if (FCADE.activeChannelId.includes('-')) return FCADE.activeChannelId.split('-')[0];
            return FCADE.activeChannelId;
        }
        return null;
    } catch (e) { return null; }
}

function isNewerVersion(latest, current) {
    if (!latest || !current) return false;
    const l = latest.replace('v', '').split('.').map(Number); 
    const c = current.replace('v', '').split('.').map(Number);
    for (let i = 0; i < Math.max(l.length, c.length); i++) {
        const lVal = l[i] || 0; const cVal = c[i] || 0;
        if (lVal > cVal) return true; if (lVal < cVal) return false;
    } 
    return false;
}

async function checkForUpdates() {
    const { CerberusData } = require('./state.js');
    const now = Date.now();
    if (!CerberusData.lastUpdateCheck || (now - CerberusData.lastUpdateCheck > 86400000)) {
        try {
            const response = await fetch('https://api.github.com/repos/Cerberus-BR/FightcadePlus/releases/latest');
            if (response.ok) {
                const data = await response.json();
                if (data && data.tag_name) { 
                    CerberusData.latestVersion = data.tag_name; 
                    CerberusData.lastUpdateCheck = now; 
                    CerberusData.save(); 
                }
            }
        } catch (e) { }
    }
}

const connectToChannelWhenAvailable = (FCADE, autoJoinConfig) => {
    let attempts = 0;
    const checkInterval = setInterval(() => {
        attempts++; 
        if (attempts > 120) { clearInterval(checkInterval); return; }
        if (FCADE.initializingApp === false) {
            clearInterval(checkInterval);
            if (autoJoinConfig?.channelId) FCADE.selectChannel(autoJoinConfig.channelId);
            else { 
                const gameChannels = FCADE.channels.filter(ch => 'gameid' in ch); 
                if (gameChannels.length > 0) FCADE.selectChannel(gameChannels[0].id); 
            }
        }
    }, 500);
};

// [CERBERUS] BOM Audio Hijacking (Silenciador Preditivo)
window.cerberusActiveAudios = new Set();

function setupAudioSilencer() {
    if (window.cerbAudioHooked) return;
    window.cerbAudioHooked = true;
    
    const originalPlay = window.HTMLAudioElement.prototype.play;
    window.HTMLAudioElement.prototype.play = function() {
        const audioObj = this;
        
        // Grava o estado original e aplica a mordaça instantânea (Mute preventivo)
        const originalMuted = audioObj.muted;
        audioObj.muted = true;
        
        window.cerberusActiveAudios.add(audioObj);
        
        const cleanup = () => window.cerberusActiveAudios.delete(audioObj);
        audioObj.addEventListener('ended', cleanup, { once: true });
        audioObj.addEventListener('pause', cleanup, { once: true });
        
        // Executa a função nativa com o áudio mutado
        const playPromise = originalPlay.apply(audioObj, arguments);
        
        // Janela de avaliação (100ms)
        setTimeout(() => {
            // Se o áudio ainda estiver ativo (não foi rejeitado/pausado), devolvemos a voz.
            if (window.cerberusActiveAudios.has(audioObj)) {
                audioObj.muted = originalMuted;
            }
        }, 100);
        
        return playPromise;
    };
}

function silenceRecentAudios() {
    window.cerberusActiveAudios.forEach(audio => {
        try {
            audio.pause();
            audio.currentTime = 0;
        } catch(e) {} // Captura erro silencioso se a API nativa bloquear a pausa
    });
    window.cerberusActiveAudios.clear();
}

module.exports = {
    t, normalizeUsername, isSystemUser, extractMinPing, getMinPing,
    playPopSound, executeChatCommand, executeChatMacro, getActiveChannelWrapper,
    isRankedChannel, getActiveGameId, isNewerVersion, checkForUpdates,
    connectToChannelWhenAvailable, setupAudioSilencer, silenceRecentAudios
};