/**
 * NATIVE MODULAR ARCHITECTURE (CommonJS)
 * Central orchestrator that delegates execution to the /cerberus/ directory
 */
const cerberusMain = require('./cerberus/index.js');

module.exports = (FCADE) => {
    try {
        cerberusMain.init(FCADE);
    } catch (e) {
        console.error("Cerberus Fatal Error:", e);
    }
};