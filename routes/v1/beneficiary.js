const { validateRequest, callbackPermission } = require('../../src/beneficiary');

module.exports = ({ routerV1Beneficiary }) => {
    routerV1Beneficiary.post('/permissionRequest', async (ctx) => {
        const reqBody = ctx.request.body;
        let { valid, err_msg, originator_data } = await validateRequest(reqBody);
        if (err_msg) console.error(err_msg);
        ctx.body = err_msg | "";
        
        // call back sygnaBridge when validation is done.
        callbackPermission(reqBody, valid, originator_data);
    });
};