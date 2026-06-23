const fs = require('fs');
const path = require('path');

const getPluginsDisabledState = () => {
    try {
        const configPath = path.join(__dirname, 'plugins', 'config.json');
        if (fs.existsSync(configPath)) {
            const content = fs.readFileSync(configPath, 'utf8');
            try {
                const config = JSON.parse(content);
                return config.masterSwitchDisabled === true;
            } catch (e) {
                const match = content.match(/"masterSwitchDisabled"\s*:\s*(true|false)/);
                if (match) return match[1] === 'true';
            }
        }
    } catch (e) {
        console.error('[FC2 Injector] Error reading config.json:', e);
    }
    return false;
};

const setPluginsDisabledState = (disabled) => {
    try {
        const pluginsDir = path.join(__dirname, 'plugins');
        if (!fs.existsSync(pluginsDir)) {
            fs.mkdirSync(pluginsDir, { recursive: true });
        }
        
        const configPath = path.join(pluginsDir, 'config.json');
        let content = '';
        let config = null;
        
        if (fs.existsSync(configPath)) {
            content = fs.readFileSync(configPath, 'utf8');
            if (content.trim()) {
                try {
                    config = JSON.parse(content);
                } catch (err) {
                    // Ignorar para ativar fallback
                }
            }
        }
        
        if (config !== null) {
            config.masterSwitchDisabled = disabled;
            fs.writeFileSync(configPath, JSON.stringify(config, null, 4));
        } else if (content.trim()) {
            let newContent = content;
            if (newContent.includes('"masterSwitchDisabled"')) {
                newContent = newContent.replace(/"masterSwitchDisabled"\s*:\s*(true|false)/g, `"masterSwitchDisabled": ${disabled}`);
            } else {
                newContent = newContent.replace(/{\s*/, `{\n    "masterSwitchDisabled": ${disabled},\n    `);
            }
            fs.writeFileSync(configPath, newContent);
        } else {
            fs.writeFileSync(configPath, JSON.stringify({ masterSwitchDisabled: disabled }, null, 4));
        }
    } catch (e) {
        console.error('[FC2 Injector] Error saving config.json:', e);
    }
};

// Inject the Master Switch UI into native Fightcade settings
const injectMasterSwitchUI = () => {
    const observer = new MutationObserver(() => {
        const muteChatOption = document.querySelector('input#chatMuted');
        if (muteChatOption) {
            // Check if we already injected to prevent duplication
            if (document.getElementById('fc2PluginsToggle')) return;

            const muteContainer = muteChatOption.closest('.option');
            if (muteContainer && muteContainer.parentNode) {
                const isDisabled = getPluginsDisabledState();
                
                const dataVAttr = Array.from(muteChatOption.attributes).find(attr => attr.name.startsWith('data-v-'))?.name || '';
                const dataV = dataVAttr ? ` ${dataVAttr}=""` : '';
                
                const toggleDiv = document.createElement('div');
                toggleDiv.className = 'option';
                if (dataVAttr) toggleDiv.setAttribute(dataVAttr, '');
                
                toggleDiv.innerHTML = `
                    <div${dataV} class="title" style="color: #ff6b6b;">Disable All Plugins (Requires Restart)</div>
                    <div${dataV} class="optionCheckboxWrapper">
                        <input${dataV} type="checkbox" id="fc2PluginsToggle" ${isDisabled ? 'checked' : ''}>
                        <div${dataV} class="optionCheckbox" style="border-color: #ff6b6b;"></div>
                        <label${dataV} for="fc2PluginsToggle"></label>
                    </div>
                `;

                // Inject right above "Temporarily mute chat"
                muteContainer.parentNode.insertBefore(toggleDiv, muteContainer);

                // Prevent click events from bubbling up to Fightcade's global click interceptor
                toggleDiv.addEventListener('click', (e) => {
                    e.stopPropagation();
                });

                document.getElementById('fc2PluginsToggle').addEventListener('change', (e) => {
                    setPluginsDisabledState(e.target.checked);
                });
            }
        }
    });

    observer.observe(document.body, { childList: true, subtree: true });
};

const loadPlugins = async (FCADE) => {
    const pluginsDir = path.join(__dirname, 'plugins');
    
    // Safeguard: do not break if the folder does not exist
    if (!fs.existsSync(pluginsDir)) return;

    try {
        // Async I/O: do not block the Main Thread
        const pluginFiles = await fs.promises.readdir(pluginsDir);
        for (const file of pluginFiles.filter(f => f.endsWith('.js'))) {
            try {
                require(path.join(pluginsDir, file))(FCADE);
            } catch (error) {
                console.error(`[FC2 Injector] Error loading plugin "${file}":`, error);
            }
        }
    } catch (err) {
        console.error('[FC2 Injector] Failed to read plugins directory:', err);
    }
};

const waitForVue = (callback) => {
    const appElement = document.querySelector('#app');
    if (appElement?.__vue__?._data?.global?.setTheme) {
        callback(appElement.__vue__);
    } else {
        setTimeout(() => waitForVue(callback), 300);
    }
};

const init = (fcWindow) => {
    fcWindow.currentChannel = 0;
    
    // The Switch UI is always injected, regardless of whether plugins are active or not
    injectMasterSwitchUI();

    // If disabled, the script stops here (True Vanilla Performance - Zero RAM/CPU)
    if (getPluginsDisabledState()) {
        console.log('[FC2 Injector] All plugins are disabled by user.');
        return; 
    }

    waitForVue((FCADE) => loadPlugins(FCADE));
};

init(window);
