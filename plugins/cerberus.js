/**
 * ARQUITETURA MODULAR NATIVA (CommonJS)
 * Orquestrador central que delega a execução para a pasta /cerberus/
 */
const cerberusMain = require('./cerberus/index.js');

module.exports = (FCADE) => {
    try {
        cerberusMain.init(FCADE);
    } catch (e) {
        console.error("Cerberus Fatal Error:", e);
    }
};