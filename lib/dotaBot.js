/**
 * @module dotaBot
 * @description Dota bot functions
 */

/**
 * A Long class for representing a 64 bit two's-complement integer value
 * derived from the Closure Library for stand-alone use and extended with unsigned support.
 * @external Long
 * @category Other
 * @see {@link https://www.npmjs.com/package/long|long} npm package
 */

/**
 * The Steam for Node JS package, allowing interaction with Steam.
 * @external steam
 * @category node-steam
 * @see {@link https://www.npmjs.com/package/steam|steam} npm package
 */

/**
 * External steam SteamClient class.
 * @class SteamClient
 * @category node-steam
 * @memberof external:steam
 * @see {@link https://github.com/seishun/node-steam#steamclient}
 */

/**
 * External steam SteamUser class.
 * @class SteamUser
 * @category node-steam
 * @memberof external:steam
 * @see {@link https://github.com/seishun/node-steam/tree/master/lib/handlers/user}
 */

/**
 * External steam SteamFriends class.
 * @class SteamFriends
 * @category node-steam
 * @memberof external:steam
 * @see {@link https://github.com/seishun/node-steam/tree/master/lib/handlers/friends}
 */

/**
 * External namespace for Dota2 classes.
 * @external Dota2
 * @category node-dota2
 * @see https://github.com/Arcana/node-dota2
 */

/**
 * External Dota2 Dota2Client class.
 * @class Dota2Client
 * @category node-dota2
 * @memberof external:Dota2
 * @see {@link https://github.com/Arcana/node-dota2#module_Dota2.Dota2Client}
 */

const convertor = require('steam-id-convertor');
const steam = require('steam');
const util = require('util');
const fs = require('fs');
const Long = require('long');
const crypto = require('crypto');
const Dota2 = require('dota2');
const Promise = require('bluebird');
const { EventEmitter } = require('events');
const path = require('path');
const Queue = require('./util/queue');
const Fp = require('./util/fp');
const CONSTANTS = require('./constants');
const logger = require('./logger');
const Db = require('./db');

Promise.config({ cancellation: true });

steam.servers = JSON.parse(fs.readFileSync(path.join(__dirname, '../servers')));

const validBotLobbyStates = [CONSTANTS.STATE_WAITING_FOR_BOT, CONSTANTS.STATE_BOT_ASSIGNED, CONSTANTS.STATE_BOT_STARTED, CONSTANTS.STATE_WAITING_FOR_PLAYERS];

/**
* Converts a Dota team slot value to a faction value.
* @function
* @param {number} slot - The Dota team slot.
* @returns {number} An inhouse lobby faction.
*/
const slotToTeam = (slot) => {
    switch (slot) {
    case Dota2.schema.DOTA_GC_TEAM.DOTA_GC_TEAM_GOOD_GUYS:
        return 1;
    case Dota2.schema.DOTA_GC_TEAM.DOTA_GC_TEAM_BAD_GUYS:
        return 2;
    default:
        return null;
    }
};

/**
* Updates a player to team mapping object.
* Used to track which players have joined team slots in lobby.
* A null slot value will remove the player from the mapping meaning they are not in a team slot.
* @function
* @param {string} steamId64 - The player's steamid64.
* @param {?number} slot - The lobby team slot the player joined.
* @param {Object} playerState - A player to team mapping.
* @returns {Object} A player to team mapping.
*/
const updatePlayerState = (steamId64, slot, playerState) => {
    const _playerState = { ...playerState };
    if (slot == null) {
        delete _playerState[steamId64];
    }
    else {
        const team = slotToTeam(slot);
        if (team == null) {
            delete _playerState[steamId64];
        }
        else {
            _playerState[steamId64] = team;
        }
    }
    logger.silly(`DotaBot updatePlayerState ${steamId64} ${slot} ${util.inspect(playerState)} -> ${util.inspect(_playerState)}`);
    return _playerState;
};

/**
* Checks if all entries in a player to team mapping match the player to team state mapping.
* @function
* @param {Object} teamCache - The intended player to team state.
* @param {Object} playerState - The current state of players to teams.
* @returns {boolean} Whether the player state matches the team cache.
*/
const isDotaLobbyReady = (teamCache, playerState) => {
    for (const [steamId64, team] of Object.entries(teamCache)) {
        if (playerState[steamId64] !== team) return false;
    }
    return true;
};

const connectToSteam = async steamClient => new Promise((resolve, reject) => {
    try {
        steamClient.once('connected', () => resolve(steamClient));
        steamClient.connect();
    }
    catch (e) {
        logger.error(e);
        reject(e);
    }
}).timeout(10000);

const logOnToSteam = logOnDetails => steamClient => async steamUser => new Promise((resolve, reject) => {
    const onError = (error) => {
        // eslint-disable-next-line no-use-before-define
        steamClient.removeListener('logOnResponse', onLoggedOn);
        logger.error(util.inspect(error));
        reject(error);
    };
    const onLoggedOn = (logonResp) => {
        steamClient.removeListener('error', onError);
        resolve(logonResp.eresult);
    };
    steamClient.once('logOnResponse', onLoggedOn);
    steamClient.once('error', onError);
    steamUser.logOn(logOnDetails);
}).timeout(10000);

const connectToDota = async dotaClient => new Promise((resolve, reject) => {
    try {
        dotaClient.once('ready', () => resolve(dotaClient));
        dotaClient.launch();
    }
    catch (e) {
        logger.error(e);
        reject(e);
    }
}).timeout(10000);

const updateServers = (servers) => {
    logger.silly('DotaBot Received servers.');
    if (servers && servers.length) {
        fs.writeFileSync('servers', JSON.stringify(servers));
    }
    return servers;
};

const updateMachineAuth = sentryPath => (sentry, callback) => {
    fs.writeFileSync(sentryPath, sentry.bytes);
    logger.silly('DotaBot sentryfile saved');
    callback({ sha_file: crypto.createHash('sha1').update(sentry.bytes).digest() });
};

const defaultLobbyOptions = {
    game_name: Date.now().toString(),
    server_region: Dota2.ServerRegion.USEAST,
    game_mode: Dota2.schema.DOTA_GameMode.DOTA_GAMEMODE_CM,
    series_type: 2,
    game_version: 1,
    allow_cheats: false,
    fill_with_bots: false,
    allow_spectating: true,
    pass_key: 'password',
    radiant_series_wins: 0,
    dire_series_wins: 0,
    allchat: true,
    visibility: Dota2.schema.DOTALobbyVisibility.DOTALobbyVisibility_Public,
    cm_pick: Dota2.schema.DOTA_CM_PICK.DOTA_CM_RANDOM,
};

const createSteamClient = () => new steam.SteamClient();

const createSteamUser = steamClient => new steam.SteamUser(steamClient);

const createSteamFriends = steamClient => new steam.SteamFriends(steamClient);

const createDotaClient = (steamClient, debug, debugMore) => new Dota2.Dota2Client(steamClient, debug, debugMore);

const diffMembers = (membersA = [], membersB = []) => membersA.filter(memberA => !membersB.find(memberB => memberA.id.compare(memberB.id) === 0));

const intersectMembers = (membersA = [], membersB = []) => membersA.filter(memberA => membersB.find(memberB => memberA.id.compare(memberB.id) === 0));

const membersToPlayerState = (members) => {
    const playerState = {};
    for (const member of members) {
        playerState[member.id.toString()] = slotToTeam(member.team);
    }
    return playerState;
};

const processMembers = (oldMembers = [], newMembers = []) => {
    const members = {
        left: diffMembers(oldMembers, newMembers),
        joined: diffMembers(newMembers, oldMembers),
        changedSlot: [],
    };

    for (const oldMember of oldMembers) {
        const newMember = newMembers.find(member => oldMember.id.compare(member.id) === 0);
        if (newMember && (oldMember.team !== newMember.team || oldMember.slot !== newMember.slot)) {
            members.changedSlot.push({
                previous: oldMember,
                current: newMember,
            });
        }
    }

    return members;
};

const invitePlayer = dotaBot => async user => dotaBot.inviteToLobby(user.steamId64);

const kickPlayer = dotaBot => async user => dotaBot.practiceLobbyKick(parseInt(convertor.to32(user.steamId64)));

const disconnectDotaBot = async (dotaBot) => {
    logger.silly(`DotaBot disconnectDotaBot ${dotaBot.steamId64}`);
    await dotaBot.disconnect();
    await Db.updateBotStatusBySteamId(CONSTANTS.BOT_OFFLINE)(dotaBot.steamId64);
    return dotaBot;
};

const connectDotaBot = async (dotaBot) => {
    logger.silly(`DotaBot connectDotaBot ${dotaBot.steamId64}`);
    await dotaBot.connect();
    await Db.updateBotStatusBySteamId(CONSTANTS.BOT_ONLINE)(dotaBot.steamId64);
    return dotaBot;
};

const createDotaBotLobby = ({ lobbyName, password, leagueid, gameMode, firstPick, radiantFaction }) => async (dotaBot) => {
    const cmPick = radiantFaction === firstPick ? Dota2.schema.DOTA_CM_PICK.DOTA_CM_GOOD_GUYS : Dota2.schema.DOTA_CM_PICK.DOTA_CM_BAD_GUYS;
    const gameModeValue = Dota2.schema.DOTA_GameMode[gameMode];
    logger.silly(`DotaBot createDotaBotLobby ${lobbyName} ${password} ${leagueid} ${gameMode} ${gameModeValue} ${cmPick} ${dotaBot.steamId64}`);
    const result = await dotaBot.createPracticeLobby({ game_name: lobbyName, pass_key: password, leagueid, game_mode: gameModeValue, cm_pick: cmPick });
    if (result) {
        logger.silly('DotaBot createDotaBotLobby practice lobby created');
        await Db.updateBotStatusBySteamId(CONSTANTS.BOT_IN_LOBBY)(dotaBot.steamId64);
        logger.silly('DotaBot createDotaBotLobby bot status updated');
        await dotaBot.practiceLobbyKickFromTeam(dotaBot.accountId);
        await dotaBot.joinLobbyChat();
        return true;
    }
    logger.silly('DotaBot createDotaBotLobby practice lobby failed');
    await Db.updateBotStatusBySteamId(CONSTANTS.BOT_IDLE)(dotaBot.steamId64);
    await dotaBot.leavePracticeLobby();
    await dotaBot.leaveLobbyChat();
    return false;
};

const joinDotaBotLobby = ({ dotaLobbyId, lobbyName, password, leagueid, gameMode, firstPick, radiantFaction }) => async (dotaBot) => {
    const cmPick = radiantFaction === firstPick ? Dota2.schema.DOTA_CM_PICK.DOTA_CM_GOOD_GUYS : Dota2.schema.DOTA_CM_PICK.DOTA_CM_BAD_GUYS;
    const gameModeValue = Dota2.schema.DOTA_GameMode[gameMode];
    logger.silly(`DotaBot joinDotaBotLobby ${lobbyName} ${password} ${leagueid} ${gameMode} ${gameModeValue} ${cmPick}`);
    const options = { game_name: lobbyName, pass_key: password, leagueid, game_mode: gameModeValue, cm_pick: cmPick };
    const result = await dotaBot.joinPracticeLobby(dotaLobbyId, options);
    if (result) {
        await Db.updateBotStatusBySteamId(CONSTANTS.BOT_IN_LOBBY)(dotaBot.steamId64);
        await dotaBot.configPracticeLobby(options);
        await dotaBot.joinLobbyChat();
        return true;
    }
    await Db.updateBotStatusBySteamId(CONSTANTS.BOT_IDLE)(dotaBot.steamId64);
    await dotaBot.leavePracticeLobby();
    await dotaBot.leaveLobbyChat();
    return false;
};

/**
 * Start a dota lobby and return the match id.
 * @async
 * @param {module:dotaBot.DotaBot} dotaBot - The dota bot.
 * @returns {string} The match id.
 */
const startDotaLobby = async (dotaBot) => {
    const lobbyData = await dotaBot.launchPracticeLobby();
    await dotaBot.leaveLobbyChat();
    return lobbyData.match_id.toString();
};

const loadDotaBotTickets = async (dotaBot) => {
    const leagueInfos = await dotaBot.requestLeagueInfoListAdmins();
    logger.silly(`loadDotaBotTickets ${util.inspect(leagueInfos)}`);
    const tickets = await Fp.mapPromise(Db.upsertTicket)(leagueInfos);
    const bot = await Db.findBotBySteamId64(dotaBot.steamId64);
    await Db.setTicketsOf(bot)(tickets);
    return tickets;
};

const CONNECTION_STATE = {
    STEAM_OFFLINE: 'STEAM_OFFLINE',
    STEAM_CONNECTING: 'STEAM_CONNECTING',
    STEAM_CONNECTED: 'STEAM_CONNECTED',
    STEAM_CONNECT_FAILED: 'STEAM_CONNECT_FAILED',
    STEAM_LOGGING_IN: 'STEAM_LOGGING_IN',
    STEAM_LOGGED_IN: 'STEAM_LOGGED_IN',
    STEAM_LOGIN_FAILED: 'STEAM_LOGIN_FAILED',
    DOTA_CONNECTING: 'DOTA_CONNECTING',
    DOTA_CONNECTED: 'DOTA_CONNECTED',
};

class DotaBot extends EventEmitter {
    /**
     * Constructor of the DotaBot. This prepares an object for connecting to
     * Steam and the Dota2 Game Coordinator.
     * @classdesc Class representing a Dota bot.
     * Handles all in game functions required to host an inhouse lobby.
     * @extends external:EventEmitter
     * @param {external:steam.SteamClient} steamClient - A SteamClient instance.
     * @param {external:steam.SteamUser} steamUser - A SteamUser instance.
     * @param {external:steam.SteamFriends} steamFriends - A SteamFriends instance.
     * @param {external:Dota2.Dota2Client} dotaClient - A Dota2Client instance.
     * @param {module:db.Bot} config - Bot configuration object.
     * */
    constructor(steamClient, steamUser, steamFriends, dotaClient, config) {
        super();

        this._connectionState = CONNECTION_STATE.STEAM_OFFLINE;
        this._connectionAttempts = 0;
        this._connecting = false;
        this.lobbyOptions = {};
        this._teamCache = {};
        this._queue = new Queue(null, null, true);
        this.config = config;
        this.steamClient = steamClient;
        this.steamUser = steamUser;
        this.steamFriends = steamFriends;
        this.Dota2 = dotaClient;

        this.logOnDetails = {
            account_name: config.accountName,
            password: config.password,
        };
        this.logOnDetails.auth_code = 'NXYR8';
        // if (config.steam_guard_code) this.logOnDetails.auth_code = config.steam_guard_code;
        if (config.two_factor_code) this.logOnDetails.two_factor_code = config.two_factor_code;

        try {
            const sentry = fs.readFileSync(`sentry/${config.steamId64}`);
            if (sentry.length) this.logOnDetails.sha_sentryfile = sentry;
        }
        catch (beef) {
            logger.silly(`DotaBot Cannot load the sentry. ${beef}`);
        }

        // Block queue until GC is ready
        this.block();

        this.Dota2.on('ready', () => this.onDotaReady());
        this.Dota2.on('unready', () => this.onDotaUnready());
        this.Dota2.on('unhandled', kMsg => logger.silly(`DotaBot UNHANDLED MESSAGE ${kMsg}`));
        this.Dota2.on('practiceLobbyUpdate', (lobby) => {
            logger.silly('DotaBot practiceLobbyUpdate');
            if (this.lobby) this.processLobbyUpdate(this.lobby, lobby);
            if (lobby.match_outcome === Dota2.schema.EMatchOutcome.k_EMatchOutcome_RadVictory
                || lobby.match_outcome === Dota2.schema.EMatchOutcome.k_EMatchOutcome_DireVictory) {
                this.emit(CONSTANTS.EVENT_MATCH_OUTCOME, lobby.lobby_id, lobby.match_outcome, lobby.members);
            }

            // bot should leave lobby if it does not belong to a valid lobby state
            const dotaLobbyId = lobby.lobby_id.toString();
            Db.findLobbyByDotaLobbyId(dotaLobbyId).then(lobbyState => {
                if (!lobbyState) {
                    logger.silly(`DotaBot practiceLobbyUpdate lobbyState.dotaLobbyId ${dotaLobbyId} not found. Bot ${this.config.id} leaving lobby...`);
                }
                else if (lobbyState.botId !== this.config.id) {
                    logger.silly(`DotaBot practiceLobbyUpdate lobbyState.botId ${lobbyState.botId} mismatch. Bot ${this.config.id} leaving lobby...`);
                }
                else if (validBotLobbyStates.indexOf(lobbyState.state) === -1) {
                    logger.silly(`DotaBot practiceLobbyUpdate lobbyState.state ${lobbyState.state} invalid. Bot ${this.config.id} leaving lobby...`);
                }
                else {
                    return null;
                }
                return this.leavePracticeLobby().then(() => this.leaveLobbyChat()).catch((e) => logger.error(e));
            });
        });
        this.Dota2.on('practiceLobbyCleared', () => this.emit(CONSTANTS.EVENT_BOT_LOBBY_LEFT));
        this.Dota2.on('matchSignedOut', matchId => this.emit(CONSTANTS.EVENT_MATCH_SIGNEDOUT, matchId));
        this.Dota2.on('practiceLobbyResponse', (result, body) => {
            logger.silly(`DotaBot practiceLobbyResponse ${util.inspect(body)}`);
        });
        this.Dota2.on('chatMessage', (channel, senderName, message, chatData) => {
            logger.silly(`DotaBot chatMessage ${channel} ${senderName} {$message} ${util.inspect(chatData)}`);
            if (channel === `Lobby_${this.dotaLobbyId}`) {
                this.emit(CONSTANTS.MSG_CHAT_MESSAGE, channel, senderName, message, chatData);
            }
        });

        this.steamClient.on('loggedOff', () => {
            this._connectionState = CONNECTION_STATE.STEAM_OFFLINE;
        });
        this.steamClient.on('error', async (error) => {
            if (!this.connecting) {
                return this.onSteamClientError(error);
            }
        });
        this.steamClient.on('servers', () => {
            steam.servers = updateServers();
        });
        this.steamUser.on('updateMachineAuth', updateMachineAuth(`sentry/${this.steamId64}`));
    }

    get connectionState() {
        return this._connectionState;
    }

    get connectionAttempts() {
        return this._connectionAttempts;
    }

    get connecting() {
        return this._connecting;
    }

    get maxConnectionAttempts() {
        return 3;
    }

    get lobbyOptions() {
        return this._lobbyOptions;
    }

    set lobbyOptions(options) {
        this._lobbyOptions = { ...defaultLobbyOptions, ...options };
    }

    /**
     * Get the player to team mapping object
     * @return {object} The player to team mapping object.
     * */
    get teamCache() {
        return this._teamCache;
    }

    /**
     * Set the player to team mapping object
     * @param {object} newCache - The new player to team mapping object.
     * */
    set teamCache(newCache) {
        this._teamCache = newCache;
    }

    /**
     * Get bot steamId64
     * @return {string} The bot steam 64 id.
     * */
    get steamId64() {
        return this.config.steamId64;
    }

    /**
     * Get the dota lobby object
     * @return {object} The current lobby state
     * */
    get lobby() {
        return this.Dota2.Lobby;
    }

    /**
     * Get the dota lobby id
     * @return {external:Long} The id of the current lobby.
     * */
    get dotaLobbyId() {
        return this.Dota2.Lobby ? this.Dota2.Lobby.lobby_id : Long.ZERO;
    }

    /**
     * Get the dota lobby player state
     * @return {object} The current lobby player state
     * */
    get playerState() {
        return this.Dota2.Lobby ? membersToPlayerState(this.Dota2.Lobby.members) : {};
    }

    /**
     * Get the dota lobby channel name
     * @return {string} The channel name of the current lobby.
     * */
    get lobbyChannelName() {
        return `Lobby_${this.dotaLobbyId}`;
    }

    /**
     * Get the bot account id
     * @return {number} The account id.
     * */
    get accountId() {
        return this.Dota2.ToAccountID(this.Dota2._client.steamID);
    }

    /**
     * Get the current state of the queue
     * @return {string} The current state of the queue.
     * */
    get state() {
        return this._queue.state;
    }

    /**
     * Get the current rate limit factor
     * @return {number} The current queue rate limit factor in milliseconds.
     * */
    get rateLimit() {
        return this._queue.rateLimit;
    }

    /**
     * Set the rate limiting factor
     * @param {number} rateLimit - Milliseconds to wait between requests.
     * */
    set rateLimit(rateLimit) {
        this._queue.rateLimit = rateLimit;
    }

    /**
     * Get the current backoff time of the queue
     * @return {number} The current queue backoff time in milliseconds.
     * */
    get backoff() {
        return this._queue.backoff;
    }

    /**
    * Set the backoff time of the queue
    * @param {number} backoff - Exponential backoff time in milliseconds.
    * */
    set backoff(backoff) {
        this._queue.backoff = backoff;
    }

    /**
     * Schedule a function for execution. This function will be executed as soon
     * as the GC is available.
     * */
    schedule(fn) {
        this._queue.schedule(fn);
    }

    /**
     * Block the queue
     */
    block() {
        this._queue.block();
    }

    /**
     * Unblock the queue
     */
    release() {
        this._queue.release();
    }

    /**
     * Clear the queue
     */
    clear() {
        this._queue.clear();
    }

    /**
     * Steam client error handler.
     * Attempts to connect to steam and connect to Dota
     */
    async onSteamClientError(error) {
        logger.silly('DotaBot connection closed by server. Trying reconnect');
        this._connectionState = CONNECTION_STATE.STEAM_OFFLINE;
        logger.error(util.inspect(error));
        // Block queue while there's no access to Steam
        this.block();
        await this.connect();
    }

    /**
     * Dota ready handler.
     * Unblocks the queue.
     */
    onDotaReady() {
        // Activate queue when GC is ready
        logger.silly('DotaBot node-dota2 ready.');
        this.release();
    }

    /**
     * Dota unready handler.
     * Blocks the queue.
     */
    onDotaUnready() {
        logger.silly('DotaBot node-dota2 unready.');
        // Block queue when GC is not ready
        this.block();
    }

    /**
     * Initiates the connection to Steam and the Dota2 Game Coordinator.
     * Invalid password and calling connect when already connecting throw errors.
     * All other errors retry connect until connected or max connection attempts reached.
     * @return {boolean} True if connected, false if failed after max connection attempts reached.
     * */
    async connect() {
        if (!this.connecting) {
            this._connectionAttempts = 0;
            this._connecting = true;
            while (this.connectionAttempts < this.maxConnectionAttempts) {
                logger.silly('DotaBot connecting...');
                this._connectionAttempts += 1;
                await this._connectToSteam();
                await this._logOnToSteam();
                await this._connectToDota();
                if (this.connectionState === CONNECTION_STATE.DOTA_CONNECTED) {
                    this._connecting = false;
                    return true;
                }
                else {
                    logger.silly(`DotaBot failed to connect. Trying again... ${this.connectionAttempts}/${this.maxConnectionAttempts}`);
                    await Promise.delay(1000);
                }
            }
            logger.silly('DotaBot connection retry limit reached.');
            this._connecting = false;
            return false;

        }
        throw new Error('Already connecting.');
    }

    /**
     * Connect to steam.
     * @private
     */
    async _connectToSteam() {
        if (this.connectionState === CONNECTION_STATE.STEAM_OFFLINE) {
            try {
                this._connectionState = CONNECTION_STATE.STEAM_CONNECTING;
                await connectToSteam(this.steamClient);
                this._connectionState = CONNECTION_STATE.STEAM_CONNECTED;
            }
            catch (e) {
                // Block queue while there's no access to Steam
                this.block();
                this._connectionState = CONNECTION_STATE.STEAM_OFFLINE;
            }
        }
    }

    /**
     * Log on to steam. Set online state and display name.
     * @private
     */
    async _logOnToSteam() {
        if (this.connectionState === CONNECTION_STATE.STEAM_CONNECTED) {
            logger.silly('DotaBot logOnToSteam logging on steamUser...');
            this._connectionState = CONNECTION_STATE.STEAM_LOGGING_IN;
            let logOnResult;
            try {
                logOnResult = await logOnToSteam(this.logOnDetails)(this.steamClient)(this.steamUser);
            }
            catch (e) {
                this.block();
                this._connectionState = CONNECTION_STATE.STEAM_CONNECTED;
                return;
            }
            if (logOnResult === steam.EResult.OK) {
                this.steamFriends.setPersonaState(steam.EPersonaState.Online);
                this.steamFriends.setPersonaName(this.config.personaName);
                logger.silly('DotaBot set steam persona state and name.');
                this._connectionState = CONNECTION_STATE.STEAM_LOGGED_IN;
            }
            else if (logOnResult === steam.EResult.InvalidPassword) {
                // Block queue while there's no access to Steam
                this.block();
                throw new Error('Invalid Password.');
            }
            else {
                this._connectionState = CONNECTION_STATE.STEAM_CONNECTED;
            }
        }
    }

    /**
     * Connect to dota and unblock queue.
     * @private
     */
    async _connectToDota() {
        if (this.connectionState === CONNECTION_STATE.STEAM_LOGGED_IN) {
            try {
                this._connectionState = CONNECTION_STATE.DOTA_CONNECTING;
                await connectToDota(this.Dota2);
                this._connectionState = CONNECTION_STATE.DOTA_CONNECTED;
                // Activate queue when GC is ready
                logger.silly('DotaBot node-dota2 ready.');
                this.release();
            }
            catch (e) {
                // Block queue while there's no access to Steam
                this.block();
                this._connectionState = CONNECTION_STATE.STEAM_LOGGED_IN;
            }
        }
    }

    /**
     * Disconnect from the Game Coordinator. This will also cancel all queued
     * operations!
     * */
    async disconnect() {
        return Promise.try(() => {
            this.clear();
            this.Dota2.exit();
            this.steamClient.disconnect();
            this._connectionState = CONNECTION_STATE.STEAM_OFFLINE;
            logger.silly('DotaBot Logged off.');
        });
    }

    processLobbyUpdate(oldLobby, newLobby) {
        const members = processMembers(oldLobby.members, newLobby.members);

        for (const member of members.left) {
            logger.silly(`DotaBot processLobbyUpdate member left ${member.id}`);
            this.emit(CONSTANTS.MSG_LOBBY_PLAYER_LEFT, member);
        }

        for (const member of members.joined) {
            logger.silly(`DotaBot processLobbyUpdate member joined ${member.id}`);
            this.emit(CONSTANTS.MSG_LOBBY_PLAYER_JOINED, member);
        }

        for (const memberState of members.changedSlot) {
            logger.silly(`DotaBot processLobbyUpdate member slot changed ${util.inspect(memberState.previous)} => ${util.inspect(memberState.current)}`);
            this.emit(CONSTANTS.MSG_LOBBY_PLAYER_CHANGED_SLOT, memberState);
            const steamId64 = memberState.current.id.toString();
            logger.silly(`DotaBot processLobbyUpdate steamId64 ${steamId64} teamCache ${this.teamCache[steamId64]} slotToTeam ${slotToTeam(memberState.current.team)}`);
            if (Object.prototype.hasOwnProperty.call(this.teamCache, steamId64)) {
                if (this.teamCache[steamId64] !== slotToTeam(memberState.current.team)) {
                    const accountId = parseInt(convertor.to32(steamId64));
                    logger.silly(`DotaBot processLobbyUpdate slot change mismatch. kicking ${accountId} ${typeof accountId}`);
                    this.practiceLobbyKickFromTeam(accountId).catch(e => logger.error(e));
                }
            }
        }

        if (isDotaLobbyReady(this.teamCache, membersToPlayerState(newLobby.members))) {
            logger.silly('DotaBot processLobbyUpdate lobby ready');
            this.emit(CONSTANTS.EVENT_LOBBY_READY);
        }
    }

    async sendMessage(message) {
        return new Promise((resolve) => {
            logger.silly(`DotaBot sendMessage ${message}`);
            this.schedule(() => {
                if (this.lobby) {
                    this.Dota2.sendMessage(message, this.lobbyChannelName, Dota2.schema.DOTAChatChannelType_t.DOTAChannelType_Lobby);
                    resolve(true);
                }
                else {
                    logger.error('DotaBot sendMessage missing lobby');
                    resolve(false);
                }
            });
        }).timeout(5000);
    }

    /**
     * Invites the given steam id to the Dota lobby.
     * @async
     * @param {string} steamId64 - A steam id.
     */
    async inviteToLobby(steamId64) {
        return new Promise((resolve) => {
            this.schedule(() => {
                if (this.lobby) {
                    this.Dota2.once('inviteCreated', () => resolve(true));
                    logger.silly(`DotaBot inviteToLobby ${steamId64}`);
                    this.Dota2.inviteToLobby(Long.fromString(steamId64));
                }
                else {
                    logger.error('DotaBot inviteToLobby missing lobby');
                    resolve(false);
                }
            });
        }).timeout(5000);
    }

    async configPracticeLobby(options) {
        return new Promise((resolve) => {
            this.schedule(() => {
                if (this.lobby) {
                    this.lobbyOptions = options;
                    logger.silly(`DotaBot configPracticeLobby ${util.inspect(this.lobbyOptions)}`);
                    this.Dota2.configPracticeLobby(this.dotaLobbyId, this.lobbyOptions, (err, body) => {
                        logger.silly(`DotaBot configPracticeLobby response ${err} ${body}`);
                        resolve(body.eresult === steam.EResult.OK);
                    });
                }
                else {
                    logger.error('DotaBot configPracticeLobby missing lobby');
                    resolve(false);
                }
            });
        }).timeout(5000);
    }

    async flipLobbyTeams() {
        return new Promise((resolve) => {
            this.schedule(() => {
                if (this.lobby) {
                    logger.silly('DotaBot flipLobbyTeams');
                    for (const [steamId64, team] of Object.entries(this.teamCache)) {
                        this.teamCache[steamId64] = 3 - team;
                    }
                    // flipLobbyTeams callback does not fire
                    this.Dota2.flipLobbyTeams();
                    Promise.delay(1000).then(() => resolve(true));
                }
                else {
                    logger.error('DotaBot flipLobbyTeams missing lobby');
                    resolve(false);
                }
            });
        }).timeout(5000);
    }

    async launchPracticeLobby() {
        return new Promise((resolve, reject) => {
            this.schedule(() => {
                logger.silly('DotaBot launchPracticeLobby');
                this.Dota2.launchPracticeLobby((err) => {
                    logger.silly(`DotaBot launchPracticeLobby response ${err}`);
                    if (!err) {
                        resolve(this.lobby);
                    }
                    else {
                        logger.error(err);
                        reject(err);
                    }
                });
            });
        }).timeout(5000);
    }

    /**
     * Kick the given account id from the lobby team slots.
     * @async
     * @param {number} accountId - An account id.
     */
    async practiceLobbyKickFromTeam(accountId) {
        return new Promise((resolve) => {
            this.schedule(() => {
                if (this.lobby) {
                    logger.silly(`DotaBot practiceLobbyKickFromTeam ${accountId}`);
                    this.Dota2.practiceLobbyKickFromTeam(accountId, (err, body) => {
                        logger.silly(`DotaBot practiceLobbyKickFromTeam response ${err} ${body}`);
                        resolve(body.eresult === steam.EResult.OK);
                    });
                }
                else {
                    logger.error('DotaBot practiceLobbyKickFromTeam missing lobby');
                    resolve(false);
                }
            });
        }).timeout(5000);
    }

    /**
     * Kick the given account id from the lobby.
     * @async
     * @param {number} accountId - An account id.
     */
    async practiceLobbyKick(accountId) {
        return new Promise((resolve) => {
            this.schedule(() => {
                if (this.lobby) {
                    logger.silly(`DotaBot practiceLobbyKick ${accountId}`);
                    this.Dota2.practiceLobbyKick(accountId, (err, body) => {
                        logger.silly(`DotaBot practiceLobbyKick response ${err} ${body}`);
                        resolve(body.eresult === steam.EResult.OK);
                    });
                }
                else {
                    logger.error('DotaBot practiceLobbyKick missing lobby');
                    resolve(false);
                }
            });
        }).timeout(5000);
    }

    async leavePracticeLobby() {
        return new Promise((resolve) => {
            this.schedule(() => {
                logger.silly('DotaBot leavePracticeLobby');
                this.Dota2.leavePracticeLobby((err, body) => {
                    logger.silly(`DotaBot leavePracticeLobby response ${err} ${body}`);
                    resolve(body.eresult === steam.EResult.OK);
                });
            });
        }).timeout(5000);
    }

    async abandonCurrentGame() {
        return new Promise((resolve, reject) => {
            this.schedule(() => {
                try {
                    logger.silly('DotaBot abandonCurrentGame');
                    // abandonCurrentGame does not callback
                    this.Dota2.abandonCurrentGame();
                    resolve();
                }
                catch (e) {
                    logger.error(e);
                    reject(e);
                }
            });
        }).timeout(5000);
    }

    async destroyLobby() {
        return new Promise((resolve) => {
            this.schedule(() => {
                logger.silly('DotaBot destroyLobby');
                this.Dota2.destroyLobby((err, body) => {
                    logger.silly(`DotaBot destroyLobby response ${err} ${body}`);
                    this.lobbyOptions = null;
                    resolve(body.result === Dota2.schema.CMsgDOTADestroyLobbyResponse.Result.SUCCESS);
                });
            });
        }).timeout(5000);
    }

    async joinChat(channelName, channelType) {
        return new Promise((resolve, reject) => {
            this.schedule(() => {
                try {
                    logger.silly(`DotaBot joinChat ${channelName}`);
                    this.Dota2.joinChat(channelName, channelType);
                    resolve();
                }
                catch (e) {
                    logger.error(e);
                    reject(e);
                }
            });
        }).timeout(5000);
    }

    async joinLobbyChat() {
        return new Promise((resolve) => {
            if (this.lobby) {
                resolve(this.joinChat(this.lobbyChannelName, Dota2.schema.DOTAChatChannelType_t.DOTAChannelType_Lobby));
            }
            else {
                logger.error('DotaBot joinLobbyChat missing lobby');
                resolve(false);
            }
        }).timeout(5000);
    }

    async leaveChat(channelName, channelType) {
        return new Promise((resolve, reject) => {
            this.schedule(() => {
                try {
                    logger.silly(`DotaBot leaveChat ${channelName}`);
                    this.Dota2.leaveChat(channelName, channelType);
                    resolve();
                }
                catch (e) {
                    logger.error(e);
                    reject(e);
                }
            });
        }).timeout(5000);
    }

    async leaveLobbyChat() {
        return new Promise((resolve) => {
            if (this.lobby) {
                resolve(this.leaveChat(this.lobbyChannelName, Dota2.schema.DOTAChatChannelType_t.DOTAChannelType_Lobby));
            }
            else {
                logger.error('DotaBot leaveLobbyChat missing lobby');
                resolve(false);
            }
        }).timeout(5000);
    }

    /**
     * Join the lobby by dota lobby id.
     * @async
     * @param {string} dotaLobbyId - A dota lobby id.
     */
    async joinPracticeLobby(dotaLobbyId, options) {
        return new Promise((resolve) => {
            this.schedule(() => {
                this.lobbyOptions = options;
                logger.silly(`DotaBot joinPracticeLobby ${dotaLobbyId}`);
                this.Dota2.joinPracticeLobby(Long.fromString(dotaLobbyId), this.lobbyOptions.pass_key, (err, body) => {
                    resolve(body.result === Dota2.schema.DOTAJoinLobbyResult.DOTA_JOIN_RESULT_SUCCESS);
                });
            });
        }).timeout(5000);
    }

    async createPracticeLobby(options) {
        return new Promise((resolve) => {
            this.schedule(() => {
                this.lobbyOptions = options;
                logger.silly(`DotaBot createPracticeLobby ${util.inspect(this.lobbyOptions)}`);
                this.Dota2.createPracticeLobby(this.lobbyOptions, (err, body) => {
                    resolve(body.eresult === steam.EResult.OK);
                });
            });
        }).timeout(5000);
    }

    async requestLeagueInfoListAdmins() {
        return new Promise((resolve, reject) => {
            this.schedule(() => {
                logger.silly('DotaBot requestLeagueInfoListAdmins');
                this.Dota2.requestLeagueInfoListAdmins((err, body) => {
                    if (!err) {
                        logger.silly(`DotaBot requestLeagueInfoListAdmins ${util.inspect(body)}`);
                        resolve(body.map(ticket => ({
                            leagueid: ticket.league_id,
                            name: ticket.name,
                            mostRecentActivity: ticket.most_recent_activity,
                            startTimestamp: ticket.start_timestamp,
                            endTimestamp: ticket.end_timestamp,
                        })));
                    }
                    else {
                        logger.error(err);
                        reject(err);
                    }
                });
            });
        }).timeout(5000);
    }
}

const createDotaBot = (config) => {
    const steamClient = createSteamClient();
    const steamUser = createSteamUser(steamClient);
    const steamFriends = createSteamFriends(steamClient);
    const dotaClient = createDotaClient(steamClient, true, true);
    return new DotaBot(steamClient, steamUser, steamFriends, dotaClient, config);
};

module.exports = {
    validBotLobbyStates,
    slotToTeam,
    updatePlayerState,
    isDotaLobbyReady,
    connectToSteam,
    logOnToSteam,
    connectToDota,
    updateServers,
    updateMachineAuth,
    defaultLobbyOptions,
    createSteamClient,
    createSteamUser,
    createSteamFriends,
    createDotaClient,
    diffMembers,
    intersectMembers,
    membersToPlayerState,
    processMembers,
    invitePlayer,
    kickPlayer,
    disconnectDotaBot,
    connectDotaBot,
    createDotaBotLobby,
    joinDotaBotLobby,
    startDotaLobby,
    loadDotaBotTickets,
    DotaBot,
    createDotaBot,
};
