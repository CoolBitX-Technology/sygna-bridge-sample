const txConfirm = require('../src/transfer_confirmation');
const { callbackVerifyandLog } = require('../src/callback');

module.exports = ({ routerV1 }) => {
    // Needed as a transaction receiver
    routerV1.post('/transfer-confirmation', async (ctx) => {
        const reqBody = ctx.request.body;
        let { valid, err_msg, originator_data } = await txConfirm.transferConfirm(reqBody);
        if (err_msg) console.error(err_msg);
        ctx.body = err_msg | "";
        
        // call back sygnaBridge when validation is done.
        txConfirm.validateAndCallBack(reqBody, valid, originator_data);
    });
    
    // Needed as a transaction sender
    routerV1.post('/transfer-response', async (ctx) => {
        const reqBody = ctx.request.body;

        await callbackVerifyandLog(reqBody);
        ctx.body = { "message":"success" };
    });
};