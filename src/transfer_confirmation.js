const { validateSchema } = require('./utils/ajv_validate');
const { transferConfirmReqSchema } = require('./utils/schemas');
const sygnaCrypto = require('./utils/crypto');
const sygnaBridgeUtil = require('sygna-bridge-util');

const { SygnaBridgeDomain } = require('../config');
const API_KEY = process.env.API_KEY;
if(!API_KEY) throw new Error('Missing API_KEY');

/**
 * Reponse 200 if signature is valid and priv_info can be decoded successfully.
 * @param {obj} req_body 
 */
async function transferConfirm (req_body) {
    validateSchema(req_body, transferConfirmReqSchema);
    const { transaction, hex_data, originator_signature } = req_body;
    const { originator_vasp_code } = transaction;
    
    const originator_data = sygnaCrypto.decodePrivateInfo(hex_data);
    
    const originator_pubKey = await sygnaBridgeUtil.api.sygnaServer.getVASPPublicKey(SygnaBridgeDomain, API_KEY, originator_vasp_code);
    const signObj = { hex_data , transaction};
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
    params.beneficiary_signature = beneficiary_signature;
    await sygnaBridgeUtil.api.beneficiary.callBackConfirmNotification(callback_url, API_KEY, params);
}

module.exports = {
    transferConfirm,
    validateAndCallBack
};