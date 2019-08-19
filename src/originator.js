const sygnaBridgeUtil = require('sygna-bridge-util');
const { SygnaBridgeDomain } = require('../config');
const API_KEY = process.env.SYGNA_API_KEY;
if (!API_KEY) throw new Error("Missing API_KEY.");
const sygnaAPI = new sygnaBridgeUtil.API(API_KEY, SygnaBridgeDomain);

/**
 * Reponse 200 if signature is valid.
 * @param {obj} req_body 
 */
async function recordPermission (req_body) {
    const { transfer_id } = req_body;
    const txDetail = await sygnaAPI.getStatus(transfer_id);
    const { beneficiary_vasp_code } = txDetail.transaction;
    const beneficiary_pubkey = await sygnaAPI.getVASPPublicKey(beneficiary_vasp_code);
    const valid = sygnaBridgeUtil.crypto.verifyObject(req_body, beneficiary_pubkey);    
    
    if(!valid) throw new Error("decrypt failed.");
    /**
     * @todo Implement custom notification and storage about the result.
     */
    console.log(`Got final result: ${req_body.permission_status}`);
    return { message:"" };
}


module.exports = {
    recordPermission,
};