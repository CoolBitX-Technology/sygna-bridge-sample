const txConfirm = require('../src/transfer_confirmation');

module.exports = ({ routerV1 }) => {
    routerV1.post('/transfer-confirmation', async (ctx) => {
        const reqBody = ctx.request.body;
        let originator_data = await txConfirm.transferConfirm(reqBody);
        ctx.body = "success";
        
        // call back sygnaBridge when validation is done.
        txConfirm.validateAndCallBack(reqBody, originator_data);
    });
};