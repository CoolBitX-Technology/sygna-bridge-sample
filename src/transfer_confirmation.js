const { validateSchema } = require('./utils/ajv_validate');
const { transferConfirmReqSchema } = require('./utils/schemas');
const sygnaCrypto = require('./utils/crypto');
const sygnaBridgeUtil = require('sygna-bridge-util');
const { SygnaBridgeDomain } = require('../config');
const username = process.env.SB_USER;
const password = process.env.SB_PWD;
if (!username || !password) throw new Error("Missing SB_USER or SB_PWD. Please set them as environment variables.");
const sygnaAPI = new sygnaBridgeUtil.api.API(username, password, SygnaBridgeDomain);

/**
 * Reponse 200 if signature is valid and priv_info can be decoded successfully.
 * @param {obj} req_body 
 */
async function transferConfirm (req_body) {
    validateSchema(req_body, transferConfirmReqSchema);
    const { hex_data, transaction, data_dt, originator_signature } = req_body;
    const { originator_vasp_code } = transaction;
    
    const originator_data = sygnaCrypto.decodePrivateInfo(hex_data);
    
    const originator_pubKey = await sygnaAPI.getVASPPublicKey(originator_vasp_code, false);
    const signObj = { hex_data , transaction, data_dt};
    sygnaCrypto.verifySignature(signObj, originator_pubKey, originator_signature);
    
    return originator_data;
}

/**
 * Validate transaction content and callback Sygna Central Server with signature if valid.
 * @param {object} req_body 
 * @param {object} originator_data 
 */
async function validateAndCallBack(req_body, originator_data) {
    /**
     * @todo Record originator private information in local db.
     */
    console.log(`Validating Originator Data: ${JSON.stringify(originator_data)}`);
    
    /**
     * @todo Implement amount check or address verification.
     */
    console.log(`Validating Tx: ${JSON.stringify(req_body.transaction)}`);

    const { transfer_id, callback_url } = req_body;
    const result = "ACCEPT"; // or "REJECT"
    let params = { transfer_id, result };
    const beneficiary_signature = sygnaCrypto.signRequest(params);    
    const finalresult = await sygnaAPI.callBackConfirmNotification(transfer_id, result, beneficiary_signature);
    // const finalresult = await sygnaBridgeUtil.api.beneficiary.callBackConfirmNotification(callback_url, API_KEY, transfer_id, result, beneficiary_signature);
    console.log(`Result from Sygna Bridge ${JSON.stringify(finalresult)}`);
}

module.exports = {
    transferConfirm,
    validateAndCallBack
};