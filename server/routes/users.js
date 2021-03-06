const logger = require('../../lib/logger');
const Router = require('koa-router');
const db = require('../../models');

const router = new Router();
const BASE_URL = '/api/v1/users';

router.get(BASE_URL, async (ctx) => {
    try {
        const where = { leagueId: ctx.params.leagueId };
        const data = await db.User.findAll({ limit: ctx.request.query.limit || 10, offset: ctx.request.query.offset || 0 }, { where, order: [['id', 'ASC']] });
        ctx.body = {
            status: 'success',
            data,
        };
    }
    catch (e) {
        logger.error(e);
    }
});

router.get(`${BASE_URL}/:id`, async (ctx) => {
    try {
        const data = await db.User.findOne({ where: { id: ctx.params.id } });
        if (data) {
            ctx.body = {
                status: 'success',
                data,
            };
        }
        else {
            ctx.status = 404;
            ctx.body = {
                status: 'error',
                message: 'That user does not exist.',
            };
        }
    }
    catch (e) {
        logger.error(e);
    }
});

module.exports = router;
