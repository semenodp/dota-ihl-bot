const got = require('got');

/**
 * @memberof module:util
 */
const getSteamProfile = async (steamId) => {
    try {
        const url = `http://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${process.env.STEAM_API_KEY}&steamids=${steamId}`;
        const body = await got(url).json();
        return body.response.players[0];
    }
    catch (e) {
        logger.error(e);
        return null;
    }
};

module.exports = getSteamProfile;
