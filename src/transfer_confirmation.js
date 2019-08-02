const { validateSchema } = require('./utils/ajv_validate');
const { transferConfirmReqSchema } = require('./utils/schemas');
const sygnaBridgeUtil = require('sygna-bridge-util');
const { SygnaBridgeDomain } = require('../config');

const SYGNA_PRIVKEY = process.env.SYGNA_PRIVKEY;
if(!SYGNA_PRIVKEY) throw new Error('Missing SYGNA_PRIVKEY');
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
    const { data, callback } = req_body;
    const { originator_vasp_code } = data.transaction;
    
    const originator_data = sygnaBridgeUtil.crypto.sygnaDecodePrivateObg(data.private_info, SYGNA_PRIVKEY);
    const originator_pubKey = await sygnaAPI.getVASPPublicKey(originator_vasp_code, true);
    const data_valid = sygnaBridgeUtil.crypto.verifyObject(data, originator_pubKey);
    const callback_valid = sygnaBridgeUtil.crypto.verifyObject(callback);
    if (data_valid && callback_valid) return originator_data;
    // return originator_data;
    throw new Error(`Signature verification fails`);
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
    console.log(`Validating Tx: ${JSON.stringify(req_body.data.transaction)}`);

    const { transfer_id } = req_body;
    const { callback_url } = req_body.callback;
    const result = "ACCEPT"; // or "REJECT"
    const callbackObj = sygnaBridgeUtil.crypto.signResult(transfer_id, result, SYGNA_PRIVKEY);
    const finalresult = await sygnaAPI.callBackConfirmNotification(callback_url, callbackObj);
    console.log(`Result from Sygna Bridge ${JSON.stringify(finalresult)}`);
}

module.exports = {
    transferConfirm,
    validateAndCallBack
};