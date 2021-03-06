const sygnaBridgeUtil = require('@sygna/bridge-util');
const { SygnaBridgeTestDomain } = require('../config')

// Sample Exchange 1 Data your beneficiary VASP endpoint Testing
const exchange1_apiKey = "b94c6668bbdf654c805374c13bc7b675f00abc50ec994dbce322d7fb0138c875"
const exchange1_privateKey = "948798a4dd6864f18d5c40483aa05bb58ab211a1f9bc455c4065418ee001366a";
const exchange1_callback = "http://ec2-3-19-59-48.us-east-2.compute.amazonaws.com:4000/api/v1/originator/transaction/permission";
const exchange1_vasp_code = "VASPUSNY1";

const exchange1Node = new sygnaBridgeUtil.API(exchange1_apiKey, SygnaBridgeTestDomain);

// Replace `beneficiary_vasp_code` with your own VASP code for beneficiary server's testing. 
// If you have successfully registered on Sygna Bridge, Sygna Bridge will relay the message to your server
const transaction = {
    "originator_vasp_code": exchange1_vasp_code,
    "originator_addrs": ["3KvJ1uHPShhEAWyqsBEzhfXyeh1TXKAd7D"],
    "beneficiary_vasp_code": "VASPUSNY2",  // replace here
    "beneficiary_addrs": ["3F4ReDwiMLu8LrAiXwwD2DhH8U9xMrUzUf"],
    "transaction_currency": "0x80000000",
    "amount": parseInt(Math.random()*10)
};

const privateInfo = {
    "originator": { // provide transaction originator info to beneficiary VASP.
        "name": "Antoine Griezmann",
        "date_of_birth":"1991-03-21"
    },
    "beneficiary":{ // provide name of fund receiver for beneficiary VASP to verify.
        "name": "Leo Messi"
    }
}

const data_dt = "2019-07-29T06:29:00.123Z";

// Request Beneficary VASP's public key (or you can store them locally)
exchange1Node.getVASPPublicKey(transaction.beneficiary_vasp_code, false).then(recipient_pubKey=>{
    console.log(`Benficiary Pubkey:\t${recipient_pubKey}`);
    
    const private_info = sygnaBridgeUtil.crypto.sygnaEncodePrivateObj(privateInfo, recipient_pubKey);
    console.log(`Encoded Private Info:\t${private_info}`);
    
    // Construct Rermission Request Object and callback Object
    const permissionRequestObj = sygnaBridgeUtil.crypto.signPermissionRequest({ private_info, transaction, data_dt }, exchange1_privateKey)
    const callbackObj = sygnaBridgeUtil.crypto.signCallBack({ callback_url: exchange1_callback }, exchange1_privateKey);

    // Send Permission Request
    exchange1Node.postPermissionRequest({ data:permissionRequestObj, callback:callbackObj }).then(result => {
        /**
         * Should be able to get request at your Beneficiary VASP server.
         * Code below does not interact with Beneficiary VASP server anymore.
         */
        console.error(result)
        let transfer_id = result.transfer_id;
        console.log(`Got transfer_id: ${transfer_id}`);

        const txid = "1a0c9bef489a136f7e05671f7f7fada2b9d96ac9f44598e1bcaa4779ac564dcd";
        let sendTxIdObj = sygnaBridgeUtil.crypto.signTxId({ transfer_id, txid }, exchange1_privateKey);

        // Submit Transaction ID
        exchange1Node.postTransactionId(sendTxIdObj).then(res => {
            console.log(`Send TxId to Bridge, Response: ${JSON.stringify(res)}`)
            setTimeout(()=> {
                exchange1Node.getStatus(transfer_id).then(lookup => {
                    console.log(`Lookup this transfer_id`)
                    console.log(lookup)
                })
            }, 3000);
        })
    }).catch(err=>{
        console.log(`Post PermissionRequest Error`)
        console.log(err)
    })
}).catch(err =>{
    console.log(`Get VASP info Error`)
    console.log(err)
});

