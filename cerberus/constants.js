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
    countryFilter: { enabled: false, autoReject: false },
    // [CERBERUS] Adicionado minRankToAccept (0 = Todos, 1=E, 2=D, 3=C, 4=B, 5=A, 6=S)
    rankings: { masterEnabled: true, limit: 500, country: '', minRankToAccept: 0 },
    chatUserInfo: {
        masterEnabled: true, enableStatus: true, enableFlag: true, enableRank: true,
        showNumericRanks: true, enablePingText: true, enablePingBars: false,
        replacePingBarWithText: false, enableReputation: true, hideNegativeMessages: true,
        autoRejectNegative: false, unlockColorThemes: true, blurMode: 'none'
    },
    liveQueue: {
        enabled: false, keyword: '!join', limit: 10, streamerNick: '',
        autoReply: false, promoEnabled: false,
        promoMessage: '`[AO VIVO]` *Venham jogar e participar da live!*\nDigite a `palavra-chave` no chat para entrar na fila.\nAssista em: https://www.youtube.com/@Cerberus-BR'
    }
};

module.exports = {
    CURRENT_VERSION: "1.12.2",
    AVAILABLE_COUNTRIES,
    COUNTRY_NAME_TO_CODE,
    defaultConfig
};