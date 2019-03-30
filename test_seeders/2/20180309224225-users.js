const CONSTANTS = require('../../lib/constants');

module.exports = {
    up: (queryInterface, Sequelize) => queryInterface.bulkInsert('Users', [{
        id: 1,
        league_id: 1,
        steamid_64: '76561198015512690',
        discord_id: '76864899866697728',
        nickname: 'devilesk',
        role_1: -1,
        role_2: -1,
        role_3: -1,
        role_4: -1,
        role_5: -1,
        queue_timeout: null,
        vouched: true,
        rank_tier: 63,
        game_mode_preference: CONSTANTS.DOTA_GAMEMODE_CM,
        commends: 0,
        reputation: 0,
        created_at: new Date(),
        updated_at: new Date(),
    },
    {
        id: 2,
        league_id: 1,
        steamid_64: '76561198002069391',
        discord_id: '112718237040398336',
        nickname: 'Ari*',
        role_1: -1,
        role_2: -1,
        role_3: -1,
        role_4: -1,
        role_5: -1,
        queue_timeout: null,
        vouched: true,
        rank_tier: 72,
        game_mode_preference: CONSTANTS.DOTA_GAMEMODE_CM,
        commends: 0,
        reputation: 0,
        created_at: new Date(),
        updated_at: new Date(),
    },
    {
        id: 3,
        league_id: 1,
        steamid_64: '76561198007202563',
        discord_id: '424329081862225921',
        nickname: 'Sponge',
        role_1: -1,
        role_2: -1,
        role_3: -1,
        role_4: -1,
        role_5: -1,
        queue_timeout: null,
        vouched: true,
        rank_tier: 75,
        game_mode_preference: CONSTANTS.DOTA_GAMEMODE_CM,
        commends: 0,
        reputation: 0,
        created_at: new Date(),
        updated_at: new Date(),
    },
    {
        id: 4,
        league_id: 1,
        steamid_64: '76561198056207790',
        discord_id: '361185987373826051',
        nickname: 'MellowPrincess',
        role_1: -1,
        role_2: -1,
        role_3: -1,
        role_4: -1,
        role_5: -1,
        queue_timeout: null,
        vouched: true,
        rank_tier: 75,
        game_mode_preference: CONSTANTS.DOTA_GAMEMODE_CM,
        commends: 0,
        reputation: 0,
        created_at: new Date(),
        updated_at: new Date(),
    },
    {
        id: 5,
        league_id: 1,
        steamid_64: '76561198006744028',
        discord_id: '95704393151680512',
        nickname: 'Sasquatch',
        role_1: -1,
        role_2: -1,
        role_3: -1,
        role_4: -1,
        role_5: -1,
        queue_timeout: null,
        vouched: true,
        rank_tier: 73,
        game_mode_preference: CONSTANTS.DOTA_GAMEMODE_CM,
        commends: 0,
        reputation: 0,
        created_at: new Date(),
        updated_at: new Date(),
    },
    {
        id: 6,
        league_id: 1,
        steamid_64: '76561198141833531',
        discord_id: '93164485178564608',
        nickname: 'PooNaNi',
        role_1: -1,
        role_2: -1,
        role_3: -1,
        role_4: -1,
        role_5: -1,
        queue_timeout: null,
        vouched: true,
        rank_tier: 72,
        game_mode_preference: CONSTANTS.DOTA_GAMEMODE_CM,
        commends: 0,
        reputation: 0,
        created_at: new Date(),
        updated_at: new Date(),
    },
    {
        id: 7,
        league_id: 1,
        steamid_64: '76561198084283419',
        discord_id: '108018188054286336',
        nickname: 'Badger',
        role_1: -1,
        role_2: -1,
        role_3: -1,
        role_4: -1,
        role_5: -1,
        queue_timeout: null,
        vouched: true,
        rank_tier: 65,
        game_mode_preference: CONSTANTS.DOTA_GAMEMODE_CM,
        commends: 0,
        reputation: 0,
        created_at: new Date(),
        updated_at: new Date(),
    },
    {
        id: 8,
        league_id: 1,
        steamid_64: '76561198053292860',
        discord_id: '76783098456444928',
        nickname: 'Tomb the Ram of Thunder',
        role_1: -1,
        role_2: -1,
        role_3: -1,
        role_4: -1,
        role_5: -1,
        queue_timeout: null,
        vouched: true,
        rank_tier: 65,
        game_mode_preference: CONSTANTS.DOTA_GAMEMODE_CM,
        commends: 0,
        reputation: 0,
        created_at: new Date(),
        updated_at: new Date(),
    },
    {
        id: 9,
        league_id: 1,
        steamid_64: '76561198026721661',
        discord_id: '103292711313899520',
        nickname: 'Erock',
        role_1: -1,
        role_2: -1,
        role_3: -1,
        role_4: -1,
        role_5: -1,
        queue_timeout: null,
        vouched: true,
        rank_tier: 71,
        game_mode_preference: CONSTANTS.DOTA_GAMEMODE_CM,
        commends: 0,
        reputation: 0,
        created_at: new Date(),
        updated_at: new Date(),
    },
    {
        id: 10,
        league_id: 1,
        steamid_64: '76561198132465299',
        discord_id: '122154474390159362',
        nickname: 'Autoattacks',
        role_1: -1,
        role_2: -1,
        role_3: -1,
        role_4: -1,
        role_5: -1,
        queue_timeout: null,
        vouched: true,
        rank_tier: 74,
        game_mode_preference: CONSTANTS.DOTA_GAMEMODE_CM,
        commends: 0,
        reputation: 0,
        created_at: new Date(),
        updated_at: new Date(),
    },
    {
        id: 11,
        league_id: 1,
        steamid_64: '76561198085487944',
        discord_id: '149649478691979264',
        nickname: 'rawr',
        role_1: -1,
        role_2: -1,
        role_3: -1,
        role_4: -1,
        role_5: -1,
        queue_timeout: null,
        vouched: true,
        rank_tier: 72,
        game_mode_preference: CONSTANTS.DOTA_GAMEMODE_CM,
        commends: 0,
        reputation: 0,
        created_at: new Date(),
        updated_at: new Date(),
    },
    {
        id: 12,
        league_id: 1,
        steamid_64: '76561198077337441',
        discord_id: '85614143951892480',
        nickname: 'UB3R-B0T',
        role_1: -1,
        role_2: -1,
        role_3: -1,
        role_4: -1,
        role_5: -1,
        queue_timeout: null,
        vouched: true,
        rank_tier: 75,
        game_mode_preference: CONSTANTS.DOTA_GAMEMODE_CM,
        commends: 0,
        reputation: 0,
        created_at: new Date(),
        updated_at: new Date(),
    },
    {
        id: 13,
        league_id: 1,
        steamid_64: '76561198035954102',
        discord_id: '398690824721924107',
        nickname: 'AdvaithBot',
        role_1: -1,
        role_2: -1,
        role_3: -1,
        role_4: -1,
        role_5: -1,
        queue_timeout: null,
        vouched: true,
        rank_tier: 73,
        game_mode_preference: CONSTANTS.DOTA_GAMEMODE_CM,
        commends: 0,
        reputation: 0,
        created_at: new Date(),
        updated_at: new Date(),
    },
    {
        id: 14,
        league_id: 1,
        steamid_64: '76561198013337613',
        discord_id: '276060004262477825',
        nickname: 'Koya',
        role_1: -1,
        role_2: -1,
        role_3: -1,
        role_4: -1,
        role_5: -1,
        queue_timeout: null,
        vouched: true,
        rank_tier: 72,
        game_mode_preference: CONSTANTS.DOTA_GAMEMODE_CM,
        commends: 0,
        reputation: 0,
        created_at: new Date(),
        updated_at: new Date(),
    },
    {
        id: 15,
        league_id: 1,
        steamid_64: '76561197984954207',
        discord_id: '239631525350604801',
        nickname: 'Pancake',
        role_1: -1,
        role_2: -1,
        role_3: -1,
        role_4: -1,
        role_5: -1,
        queue_timeout: null,
        vouched: true,
        rank_tier: 65,
        game_mode_preference: CONSTANTS.DOTA_GAMEMODE_CM,
        commends: 0,
        reputation: 0,
        created_at: new Date(),
        updated_at: new Date(),
    },
    {
        id: 16,
        league_id: 1,
        steamid_64: '76561198035149291',
        discord_id: '206955935229280256',
        nickname: 'Senpai',
        role_1: -1,
        role_2: -1,
        role_3: -1,
        role_4: -1,
        role_5: -1,
        queue_timeout: null,
        vouched: true,
        rank_tier: 65,
        game_mode_preference: CONSTANTS.DOTA_GAMEMODE_CM,
        commends: 0,
        reputation: 0,
        created_at: new Date(),
        updated_at: new Date(),
    },
    
    {
        id: 17,
        league_id: 1,
        steamid_64: '76561198032905940',
        discord_id: '1103292711313899520',
        nickname: 'Test6',
        role_1: -1,
        role_2: -1,
        role_3: -1,
        role_4: -1,
        role_5: -1,
        queue_timeout: null,
        vouched: true,
        rank_tier: 71,
        game_mode_preference: CONSTANTS.DOTA_GAMEMODE_CM,
        commends: 0,
        reputation: 0,
        created_at: new Date(),
        updated_at: new Date(),
    },
    {
        id: 18,
        league_id: 1,
        steamid_64: '76561198150158005',
        discord_id: '1122154474390159362',
        nickname: 'Test7',
        role_1: -1,
        role_2: -1,
        role_3: -1,
        role_4: -1,
        role_5: -1,
        queue_timeout: null,
        vouched: true,
        rank_tier: 74,
        game_mode_preference: CONSTANTS.DOTA_GAMEMODE_CM,
        commends: 0,
        reputation: 0,
        created_at: new Date(),
        updated_at: new Date(),
    },
    {
        id: 19,
        league_id: 1,
        steamid_64: '76561198117347893',
        discord_id: '1149649478691979264',
        nickname: 'Test8',
        role_1: -1,
        role_2: -1,
        role_3: -1,
        role_4: -1,
        role_5: -1,
        queue_timeout: null,
        vouched: true,
        rank_tier: 72,
        game_mode_preference: CONSTANTS.DOTA_GAMEMODE_CM,
        commends: 0,
        reputation: 0,
        created_at: new Date(),
        updated_at: new Date(),
    },
    ], {}),

    down: (queryInterface, Sequelize) => queryInterface.bulkDelete('Users', null, {}),
};
