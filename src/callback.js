const sygnaBridgeUtil = require('sygna-bridge-util');
const { SygnaBridgeDomain } = require('../config');
const username = process.env.SB_USER;
const password = process.env.SB_PWD;
if (!username || !password) throw new Error("Missing SB_USER or SB_PWD. Please set them as environment variables.");
const sygnaAPI = new sygnaBridgeUtil.API(username, password, SygnaBridgeDomain);

/**
 * Reponse 200 if signature is valid.
 * @param {obj} req_body 
 */
async function callbackVerifyandLog (req_body) {
    const { transfer_id } = req_body;
    const txDetail = await sygnaAPI.getTransferStatus(transfer_id);
    const { beneficiary_vasp_code } = txDetail.transaction;
    const beneficiary_pubkey = await sygnaAPI.getVASPPublicKey(beneficiary_vasp_code);
    const valid = sygnaBridgeUtil.crypto.verifyObject(req_body, beneficiary_pubkey);    
    
    if(!valid) throw new Error("decrypt failed.");
    console.log(`Got final result: ${req_body.result}`);

    return { message:"" };
}


module.exports = {
    callbackVerifyandLog,
};