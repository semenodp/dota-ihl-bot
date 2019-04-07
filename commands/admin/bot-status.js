const logger = require('../../lib/logger');
const IHLCommand = require('../../lib/ihlCommand');
const CONSTANTS = require('../../lib/constants');

/**
 * @class BotStatusCommand
 * @extends IHLCommand
 */
module.exports = class BotStatusCommand extends IHLCommand {
    constructor(client) {
        super(client, {
            name: 'bot-status',
            group: 'admin',
            memberName: 'bot-status',
            guildOnly: true,
            description: 'Manually set a bot status.',,
            examples: ['bot-status 76561197960287930 BOT_UNAVAILABLE', 'bot-status 76561197960287930 BOT_ONLINE', 'bot-status 76561197960287930 BOT_OFFLINE'],
            args: [
                {
                    key: 'steamid_64',
                    prompt: 'Provide a bot steam id.',
                    type: 'string',
                },
                {
                    key: 'status',
                    prompt: 'Provide a status.',
                    type: 'string',
                    validate: (status) => {
                        if (status.startsWith('BOT_') && Object.prototype.hasOwnProperty.call(CONSTANTS, status)) return true;
                        return 'Value must be a valid status';
                    },
                },
            ],
        }, {
            clientOwner: true,
            inhouseAdmin: false,
            inhouseState: false,
            lobbyState: false,
            inhouseUser: false,
        });
    }

    async run({ msg }, { steamid_64, status }) {
        this.ihlManager.emit(CONSTANTS.EVENT_BOT_SET_STATUS, steamid_64, status);
        await msg.say(`Bot ${steamid_64} status set to ${status}`);
    }
};