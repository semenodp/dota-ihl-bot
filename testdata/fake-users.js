const CONSTANTS = require('../lib/constants');

const data = [
    {
        leagueId: 1,
        steamId64: '76561198015512690',
        discordId: '76864899866697728',
        nickname: 'devilesk',
        role1: -1,
        role2: -1,
        role3: -1,
        role4: -1,
        role5: -1,
        queueTimeout: null,
        vouched: true,
        rankTier: 63,
        gameModePreference: CONSTANTS.DOTA_GAMEMODE_CD,
        commends: 0,
        reputation: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
    },
    {
        leagueId: 1,
        steamId64: '76561198136290105',
        discordId: '112718237040398336',
        nickname: 'Ari*',
        role1: -1,
        role2: -1,
        role3: -1,
        role4: -1,
        role5: -1,
        queueTimeout: null,
        vouched: true,
        rankTier: 72,
        gameModePreference: CONSTANTS.DOTA_GAMEMODE_CD,
        commends: 0,
        reputation: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
    },
    {
        leagueId: 1,
        steamId64: '76561198151093473',
        discordId: '424329081862225921',
        nickname: 'Sponge',
        role1: -1,
        role2: -1,
        role3: -1,
        role4: -1,
        role5: -1,
        queueTimeout: null,
        vouched: true,
        rankTier: 75,
        gameModePreference: CONSTANTS.DOTA_GAMEMODE_CD,
        commends: 0,
        reputation: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
    },
    {
        leagueId: 1,
        steamId64: '76561198068904086',
        discordId: '361185987373826051',
        nickname: 'MellowPrincess',
        role1: -1,
        role2: -1,
        role3: -1,
        role4: -1,
        role5: -1,
        queueTimeout: null,
        vouched: true,
        rankTier: 75,
        gameModePreference: CONSTANTS.DOTA_GAMEMODE_CD,
        commends: 0,
        reputation: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
    },
    {
        leagueId: 1,
        steamId64: '76561197978831683',
        discordId: '95704393151680512',
        nickname: 'Sasquatch',
        role1: -1,
        role2: -1,
        role3: -1,
        role4: -1,
        role5: -1,
        queueTimeout: null,
        vouched: true,
        rankTier: 73,
        gameModePreference: CONSTANTS.DOTA_GAMEMODE_CD,
        commends: 0,
        reputation: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
    },
    {
        leagueId: 1,
        steamId64: '76561198024087473',
        discordId: '93164485178564608',
        nickname: 'PooNaNi',
        role1: -1,
        role2: -1,
        role3: -1,
        role4: -1,
        role5: -1,
        queueTimeout: null,
        vouched: true,
        rankTier: 72,
        gameModePreference: CONSTANTS.DOTA_GAMEMODE_CD,
        commends: 0,
        reputation: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
    },
    {
        leagueId: 1,
        steamId64: '76561198038335275',
        discordId: '108018188054286336',
        nickname: 'Badger',
        role1: -1,
        role2: -1,
        role3: -1,
        role4: -1,
        role5: -1,
        queueTimeout: null,
        vouched: true,
        rankTier: 65,
        gameModePreference: CONSTANTS.DOTA_GAMEMODE_CD,
        commends: 0,
        reputation: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
    },
    {
        leagueId: 1,
        steamId64: '76561197995253668',
        discordId: '76783098456444928',
        nickname: 'Tomb the Ram of Thunder',
        role1: -1,
        role2: -1,
        role3: -1,
        role4: -1,
        role5: -1,
        queueTimeout: null,
        vouched: true,
        rankTier: 65,
        gameModePreference: CONSTANTS.DOTA_GAMEMODE_CD,
        commends: 0,
        reputation: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
    },
    {
        leagueId: 1,
        steamId64: '76561198026721661',
        discordId: '103292711313899520',
        nickname: 'Erock',
        role1: -1,
        role2: -1,
        role3: -1,
        role4: -1,
        role5: -1,
        queueTimeout: null,
        vouched: true,
        rankTier: 71,
        gameModePreference: CONSTANTS.DOTA_GAMEMODE_CD,
        commends: 0,
        reputation: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
    },
    {
        leagueId: 1,
        steamId64: '76561198047112485',
        discordId: '122154474390159362',
        nickname: 'Autoattacks',
        role1: -1,
        role2: -1,
        role3: -1,
        role4: -1,
        role5: -1,
        queueTimeout: null,
        vouched: true,
        rankTier: 74,
        gameModePreference: CONSTANTS.DOTA_GAMEMODE_CD,
        commends: 0,
        reputation: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
    },
    {
        leagueId: 1,
        steamId64: '76561198045206080',
        discordId: '149649478691979264',
        nickname: 'rawr',
        role1: -1,
        role2: -1,
        role3: -1,
        role4: -1,
        role5: -1,
        queueTimeout: null,
        vouched: true,
        rankTier: 72,
        gameModePreference: CONSTANTS.DOTA_GAMEMODE_CD,
        commends: 0,
        reputation: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
    },
];

module.exports = data.map(d => ({ model: 'User', data: d }));
