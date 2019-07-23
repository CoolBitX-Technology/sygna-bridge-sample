const sygnaBridge = require('sygna-bridge-util');
const SYGNA_PRIVKEY = process.env.SYGNA_PRIVKEY;
if(!SYGNA_PRIVKEY) throw new Error('Missing SYGNA_PRIVKEY');


/**
 * @param {string} private_info 
 * @return {{originator:object, beneficiary:object}}
 */
function decodePrivateInfo(private_info) {
    const result = sygnaBridge.crypto.sygnaDecodePrivateObg(private_info, SYGNA_PRIVKEY);
    if (result === false) throw new Error("Decode private_info error.");
    return result;
}

/**
 * Verify originator signature with their publickey.
 * @param {obj} obj 
 * @param {string} publicKey 
 * @param {string} signature 
 */
function verifySignature(obj, publicKey, signature){
    const valid = sygnaBridge.crypto.verifyObject(obj, publicKey, signature);
    if (!valid) throw new Error("Invalid Signature.");
}

/**
 * Sign request object after all validation process.
 * @param {object} request 
 */
function signRequest(request){
    return sygnaBridge.crypto.signObject(request, SYGNA_PRIVKEY);
}

module.exports = {
    decodePrivateInfo,
    verifySignature,
    signRequest,
};

