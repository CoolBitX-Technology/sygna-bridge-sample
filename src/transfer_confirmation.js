const { validateSchema } = require('./utils/ajv_validate');
const { transferConfirmReqSchema } = require('./utils/schemas');
const sygnaCrypto = require('./utils/crypto');
const sygnaBridgeUtil = require('sygna-bridge-util');

const SygnaDomain = "https://3xw4q34cqd.execute-api.us-east-2.amazonaws.com/test/api";
const API_KEY = 'THIS IS API KEY';

/**
 * Reponse 200 if signature is valid and priv_info can be decoded successfully.
 * @param {obj} req_body 
 */
async function transferConfirm (req_body) {
    validateSchema(req_body, transferConfirmReqSchema);
    const { transaction, hex_data, originator_signature } = req_body;
    const { originator_vasp_code } = transaction;
    
    const originator_data = sygnaCrypto.decodePrivateInfo(hex_data);
    
    const originator_pubKey = await sygnaBridgeUtil.api.sygnaServer.getVASPPublicKey(SygnaDomain, API_KEY, originator_vasp_code);
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
    console.log(`Validating Originator Data: ${JSON.stringify(originator_data)}`);
    /**
     * @todo
     * Record originator private information in local db.
     */
    const { transaction } = req_body;
    console.log(`Validating Tx: ${JSON.stringify(transaction)}`);
    /**
     * @todo
     * Implement amount check or address verification.
     */

    const { transfer_id, callback_url } = req_body;
    const result = "ACCEPT";
    req_body.result = result;
    console.log(`\nSigning request + result with my beneficiary priv_key: ${JSON.stringify(req_body)}`);
    const beneficiary_signature = sygnaCrypto.signRequest(req_body);
    const params = { transfer_id, beneficiary_signature, result };
    console.log(`\nCallBack to SygnaBridge: ${JSON.stringify(params)}`);
    const callbackResponse = await sygnaBridgeUtil.api.sygnaServer.callBackConfirmNotification(callback_url, API_KEY, params);
}

module.exports = {
    transferConfirm,
    validateAndCallBack
};