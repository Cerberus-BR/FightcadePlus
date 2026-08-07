// cerberus/utils.js

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

    // [CERBERUS] Safety: Limit bot messages to a maximum of 3 paragraphs / lines
    const limitedLines = lines.slice(0, 3);

    const nativeSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set;
    const currentVal = inputEl.value;
    for (const line of limitedLines) {
        if (line === undefined || line === null) continue;
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
        if (cw.style.display !== 'none') {
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

async function checkForUpdates(force = false) {
    const { CerberusData } = require('./state.js');
    const now = Date.now();
    if (force || !CerberusData.lastUpdateCheck || (now - CerberusData.lastUpdateCheck > 86400000)) {
        try {
            const response = await fetch('https://cerberus-br.github.io/FightcadePlus/version.json');
            if (response.ok) {
                const data = await response.json();
                if (data && data.latestVersion) { 
                    CerberusData.latestVersion = data.latestVersion; 
                    CerberusData.downloadUrl = data.downloadUrl || null;
                    CerberusData.lastUpdateCheck = now; 
                    CerberusData.save(); 
                    return true;
                }
            }
        } catch (e) { }
        return false;
    }
    return true; // Already verified recently, treated as success
}

const connectToChannelWhenAvailable = (FCADE, autoJoinConfig) => {
    let attempts = 0;
    const checkInterval = setInterval(() => {
        attempts++; 
        if (attempts > 120) { clearInterval(checkInterval); return; }

        const channelEls = document.querySelectorAll('.channelsList .channelItem');
        if (FCADE && !FCADE.initializingApp) {
            try {
                const targetTitle = (autoJoinConfig?.channelId || '').trim();
                
                if (targetTitle) {
                    const searchLower = targetTitle.toLowerCase();

                    // 1. Try to find matching DOM .channelItem element by title, data-channel-id, or text
                    if (channelEls.length > 0) {
                        const targetEl = Array.from(channelEls).find(el => {
                            if (!el) return false;
                            const titleAttr = (el.getAttribute('title') || el.title || '').trim().toLowerCase();
                            const dataId = (el.dataset?.channelId || el.getAttribute('data-channel-id') || el.id || '').trim().toLowerCase();
                            const textContent = (el.textContent || '').trim().toLowerCase();

                            return titleAttr === searchLower ||
                                   dataId === searchLower ||
                                   (titleAttr && (titleAttr.includes(searchLower) || searchLower.includes(titleAttr))) ||
                                   (dataId && (dataId.includes(searchLower) || searchLower.includes(dataId))) ||
                                   (textContent && textContent === searchLower);
                        });

                        if (targetEl) {
                            clearInterval(checkInterval);
                            targetEl.click();
                            return;
                        }
                    }

                    // 2. Fallback: match channel object in FCADE.channels Vue store
                    if (Array.isArray(FCADE.channels) && FCADE.channels.length > 0) {
                        const targetCh = FCADE.channels.find(ch => {
                            if (!ch) return false;
                            const idStr = (ch.id || '').trim().toLowerCase();
                            const gameIdStr = (ch.gameid || ch.gameId || '').trim().toLowerCase();
                            const nameStr = (ch.name || ch.title || ch.description || '').trim().toLowerCase();

                            return idStr === searchLower ||
                                   gameIdStr === searchLower ||
                                   nameStr === searchLower ||
                                   (nameStr && (nameStr.includes(searchLower) || searchLower.includes(nameStr))) ||
                                   (idStr && (searchLower.includes(idStr) || idStr.includes(searchLower)));
                        });

                        if (targetCh && targetCh.id) {
                            clearInterval(checkInterval);
                            const domEl = Array.from(channelEls).find(el => {
                                const t = (el.getAttribute('title') || el.title || '').toLowerCase();
                                const d = (el.dataset?.channelId || el.id || '').toLowerCase();
                                return t.includes(targetCh.id.toLowerCase()) || d === targetCh.id.toLowerCase();
                            });
                            if (domEl) domEl.click();
                            else FCADE.selectChannel(targetCh.id);
                            return;
                        }
                    }

                    // Target specified but not found yet -> Keep polling until attempt 30 (15 seconds)
                    if (attempts < 30) {
                        return;
                    }
                }

                // Fallback: If no target specified or timeout reached (attempt >= 30)
                if (channelEls.length > 0) {
                    clearInterval(checkInterval);
                    const firstGameEl = Array.from(channelEls).find(el => {
                        const t = (el.getAttribute('title') || el.title || '').toLowerCase();
                        return t && !t.includes('lobby');
                    });
                    if (firstGameEl) {
                        firstGameEl.click();
                    } else if (Array.isArray(FCADE.channels)) {
                        const gameChannels = FCADE.channels.filter(ch => ch && ('gameid' in ch || 'gameId' in ch));
                        if (gameChannels.length > 0 && gameChannels[0] && gameChannels[0].id) {
                            FCADE.selectChannel(gameChannels[0].id);
                        }
                    }
                }
            } catch (err) {
                console.warn('[Cerberus] AutoJoin safe catch:', err);
            }
        }
    }, 500);
};

// [CERBERUS] BOM Audio Hijacking (Predictive Muting and Delegation via Suspended Promise)
window.cerberusActiveAudios = new Set();
window.cerberusAudioCache = new Map(); // [CERBERUS] RAM Cache for I/O optimization

function setupAudioSilencer() {
    if (window.cerbAudioHooked) return;
    window.cerbAudioHooked = true;
    
    const originalPlay = window.HTMLAudioElement.prototype.play;
    window.HTMLAudioElement.prototype.play = function() {
        const audioObj = this;
        const src = (audioObj.src || '').toLowerCase();

        // 1. Agnostic Shield: If not a challenge (e.g. DMs and Mentions), play immediately and exit.
        if (!src.includes('-challenge')) {
            return originalPlay.apply(audioObj, arguments);
        }
        
        // 2. Native challenge. Hold audio hostage before it reaches the sound card.
        window.cerberusActiveAudios.add(audioObj);
        
        // 3. Evaluation Window (400ms)
        setTimeout(() => {
            // Did chat.js validate this challenge? (If DOM rejected, it cleared this Set)
            if (window.cerberusActiveAudios.has(audioObj)) {
                window.cerberusActiveAudios.delete(audioObj);
                
                const { ConfigManager } = require('./config.js');
                const soundPref = ConfigManager.getSetting('chatUserInfo.challengeSound') || 'native';

                if (soundPref === 'native') {
                    // Legitimate challenge with native sound. Trigger the real function now.
                    try {
                        const playPromise = originalPlay.apply(audioObj);
                        if (playPromise !== undefined) playPromise.catch(() => {});
                    } catch(e) {}
                } else if (soundPref !== 'silent') {
                    // Legitimate challenge with custom sound via RAM injection (Base64).
                    try {
                        const playBase64 = (dataUri) => {
                            const customAudio = new window.Audio(dataUri);
                            customAudio.volume = 0.8;
                            customAudio.play().catch(() => {});
                        };

                        if (window.cerberusAudioCache.has(soundPref)) {
                            playBase64(window.cerberusAudioCache.get(soundPref));
                        } else {
                            const fs = require('fs');
                            const path = require('path');
                            const audioPath = path.join(__dirname, `${soundPref}.wav`);
                            
                            fs.readFile(audioPath, (err, data) => {
                                if (!err && data) {
                                    const base64Str = `data:audio/wav;base64,${data.toString('base64')}`;
                                    window.cerberusAudioCache.set(soundPref, base64Str);
                                    playBase64(base64Str);
                                }
                            });
                        }
                    } catch(e) {}
                }
            }
        }, 400);
        
        // Return a fake promise instantly so we don't break Vue.js reactivity
        return Promise.resolve();
    };
}

function silenceRecentAudios() {
    // Clean approach: Since the audio was held hostage, simply clear the list.
    // setTimeout won't find the object and won't send anything to the sound card.
    window.cerberusActiveAudios.clear();
}

function blockAnalyticsAndTagManager() {
    if (window.cerbAnalyticsBlocked) return;
    window.cerbAnalyticsBlocked = true;

    // 1. Stub tracking globals
    window.ga = function() { };
    window.gtag = function() { };
    window.dataLayer = window.dataLayer || [];
    window.google_tag_manager = {};

    const isAnalyticsUrl = (url) => {
        if (!url || typeof url !== 'string') return false;
        const lower = url.toLowerCase();
        return lower.includes('google-analytics.com') ||
               lower.includes('googletagmanager.com') ||
               lower.includes('stats.g.doubleclick.net') ||
               lower.includes('google.com/analytics');
    };

    // 2. Intercept Fetch API
    if (window.fetch) {
        const origFetch = window.fetch;
        window.fetch = function(input, init) {
            const url = typeof input === 'string' ? input : (input && input.url ? input.url : '');
            if (isAnalyticsUrl(url)) {
                return Promise.resolve(new Response('', { status: 200, statusText: 'Blocked by Fightcade Plus' }));
            }
            return origFetch.apply(this, arguments);
        };
    }

    // 3. Intercept XMLHttpRequest
    if (window.XMLHttpRequest) {
        const origOpen = window.XMLHttpRequest.prototype.open;
        window.XMLHttpRequest.prototype.open = function(method, url) {
            if (isAnalyticsUrl(url)) {
                this.__blockedByCerberus = true;
            }
            return origOpen.apply(this, arguments);
        };

        const origSend = window.XMLHttpRequest.prototype.send;
        window.XMLHttpRequest.prototype.send = function() {
            if (this.__blockedByCerberus) {
                return;
            }
            return origSend.apply(this, arguments);
        };
    }

    // 4. Block dynamic script tag injections
    const origAppendChild = Element.prototype.appendChild;
    Element.prototype.appendChild = function(child) {
        if (child && child.tagName === 'SCRIPT' && child.src && isAnalyticsUrl(child.src)) {
            console.log('[Cerberus] Blocked Google Analytics / Tag Manager script:', child.src);
            return child;
        }
        return origAppendChild.apply(this, arguments);
    };

    const origInsertBefore = Element.prototype.insertBefore;
    Element.prototype.insertBefore = function(newNode, referenceNode) {
        if (newNode && newNode.tagName === 'SCRIPT' && newNode.src && isAnalyticsUrl(newNode.src)) {
            console.log('[Cerberus] Blocked Google Analytics / Tag Manager script:', newNode.src);
            return newNode;
        }
        return origInsertBefore.apply(this, arguments);
    };
}

module.exports = {
    t, normalizeUsername, isSystemUser, extractMinPing, getMinPing,
    playPopSound, executeChatCommand, executeChatMacro, getActiveChannelWrapper,
    isRankedChannel, getActiveGameId, isNewerVersion, checkForUpdates,
    connectToChannelWhenAvailable, setupAudioSilencer, silenceRecentAudios,
    blockAnalyticsAndTagManager
};