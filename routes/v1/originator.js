const { recordPermission } = require('../../src/originator');

module.exports = ({ routerV1Originator }) => {    
    routerV1Originator.post('/permission', async (ctx) => {
        const reqBody = ctx.request.body;

        await recordPermission(reqBody);
        ctx.body = { "message": "success" };
    });
};