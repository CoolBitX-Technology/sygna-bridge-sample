const { validateSchema } = require('./utils/ajv_validate');
const { transferConfirmReqSchema, privInfoSchema } = require('./utils/schemas');
const sygnaBridgeUtil = require('sygna-bridge-util');
const { SygnaBridgeDomain } = require('../config');

const SYGNA_PRIVKEY = process.env.SYGNA_PRIVKEY;
if(!SYGNA_PRIVKEY) throw new Error('Missing SYGNA_PRIVKEY');
const username = process.env.SB_USER;
const password = process.env.SB_PWD;
if (!username || !password) throw new Error("Missing SB_USER or SB_PWD. Please set them as environment variables.");
const sygnaAPI = new sygnaBridgeUtil.API(username, password, SygnaBridgeDomain);

/**
 * Reponse 200 if signature is valid and priv_info can be decoded successfully.
 * @param {obj} req_body 
 * @return {valid:boolean, originator_pubKey?:string, err_msg?:string}
 */
async function transferConfirm (req_body) {
    const schemaValidation = validateSchema(req_body, transferConfirmReqSchema);
    if(!schemaValidation.valid) return schemaValidation;

    const { data, callback } = req_body;
    
    const originator_data = sygnaBridgeUtil.crypto.sygnaDecodePrivateObg(data.private_info, SYGNA_PRIVKEY);
    const privateInfoVal = validateSchema(originator_data, privInfoSchema);
    if(!privateInfoVal.valid) return privateInfoVal;

    if(!originator_data) return { err_msg:"Cannot decode private_info.", valid:false };

    const { originator_vasp_code } = data.transaction;
    const originator_pubKey = await sygnaAPI.getVASPPublicKey(originator_vasp_code, true);
    const data_valid = sygnaBridgeUtil.crypto.verifyObject(data, originator_pubKey);
    const callback_valid = sygnaBridgeUtil.crypto.verifyObject(callback);
    if (data_valid && callback_valid) return { valid:true, originator_data};
    // return originator_data;
    return { valid:false, err_msg:"Signature verification failed."};
}

/**
 * Validate transaction content and callback Sygna Central Server with signature if valid.
 * @param {object} req_body 
 * @param {boolean} valid
 * @param {object?} originator_data 
 */
async function validateAndCallBack(req_body, valid, originator_data={}) {
    const result = valid? "ACCEPT":"REJECT";
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
    const callbackObj = sygnaBridgeUtil.crypto.signResult(transfer_id, result, SYGNA_PRIVKEY);
    const finalresult = await sygnaAPI.callBackConfirmNotification(callback_url, callbackObj);
    console.log(`Result from Sygna Bridge ${JSON.stringify(finalresult)}`);
}

module.exports = {
    transferConfirm,
    validateAndCallBack
};