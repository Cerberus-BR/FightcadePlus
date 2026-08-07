// cerberus/constants.js

const AVAILABLE_COUNTRIES = {
    'BR': 'Brazil', 'AR': 'Argentina', 'BO': 'Bolivia', 'UY': 'Uruguay',
    'CL': 'Chile', 'PE': 'Peru', 'CO': 'Colombia', 'MX': 'Mexico',
    'US': 'United States', 'CA': 'Canada', 'JP': 'Japan', 'KR': 'South Korea',
    'CN': 'China', 'FR': 'France', 'DE': 'Germany', 'GB': 'United Kingdom',
    'IT': 'Italy', 'ES': 'Spain', 'PT': 'Portugal', 'RU': 'Russia',
    'AU': 'Australia', 'NZ': 'New Zealand', 'IN': 'India', 'TH': 'Thailand',
    'PH': 'Philippines', 'ID': 'Indonesia', 'MY': 'Malaysia', 'SG': 'Singapore',
    'VN': 'Vietnam', 'TR': 'Turkey', 'SA': 'Saudi Arabia', 'AE': 'UAE',
    'ZA': 'South Africa', 'EG': 'Egypt', 'NG': 'Nigeria', 'MA': 'Morocco',
    'DZ': 'Algeria', 'PK': 'Pakistan', 'HK': 'Hong Kong', 'XX': 'Outros / Desconhecidos'
};

const COUNTRY_NAME_TO_CODE = Object.fromEntries(
    Object.entries(AVAILABLE_COUNTRIES).map(([code, name]) => [name, code])
);

const defaultConfig = {
    language: 'en',
    autoJoin: { enabled: true, channelId: '' },
    countryFilter: { enabled: false, autoReject: false, autoRejectNotify: true },
    pingFilter: { enabled: false, maxPingMs: 150, autoReject: true },
    rankings: { masterEnabled: true, autoSync: true, limit: 500, country: '', minRankToAccept: 0, autoRejectBelowMin: false },
    chatUserInfo: {
        masterEnabled: true, enableStatus: true, enableFlag: true, enableRank: true,
        showNumericRanks: true, enablePingText: true, enablePingBars: true,
        replacePingBarWithText: true, enableReputation: true, hideNegativeMessages: false,
        autoRejectNegative: true, unlockColorThemes: true, blurMode: 'none', challengeSound: 'native'
    },
    liveQueue: {
        enabled: false, keyword: '!join', limit: 10, streamerNick: '',
        autoReply: false, promoEnabled: false,
        promoMessage: '`[AO VIVO]` *Venham jogar e participar da live!*\nDigite: `!join` no chat para entrar na fila.\nAssista em: `https://www.youtube.com/channel/UCHLOCrvPfeS8J4T8k5qpYwQ`'
    }
};

module.exports = {
    CURRENT_VERSION: "1.17.0",
    AVAILABLE_COUNTRIES,
    COUNTRY_NAME_TO_CODE,
    defaultConfig
};