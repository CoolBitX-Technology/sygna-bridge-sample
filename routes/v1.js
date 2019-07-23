const txConfirm = require('../src/transfer_confirmation');
const { validateAPIKey } = require('../src/utils/api_key_validation');

module.exports = ({ routerV1 }) => {
    routerV1.post('/transfer-confirmation', async (ctx) => {
        const reqBody = ctx.request.body;
        validateAPIKey(ctx.request.header['api-key']);

        let originator_data = await txConfirm.transferConfirm(reqBody, true);
        ctx.body = "success";
        
        // call back sygnaBridge when validation is done.
        txConfirm.validateAndCallBack(reqBody, originator_data);
    });
};