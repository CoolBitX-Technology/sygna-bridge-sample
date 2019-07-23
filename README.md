# JavaScript Sample Sygna Bridge Beneficiary Server

This is a sample Sygna Bridge Beneficiary VASP Server implemented with Nodejs.

## What is a Sygna Bridge Beneficiary Server

Sygna Bridge is a regulatory compliance solution of crypto asset transaction between VASPs.

### Roles in Sygna Bridge

Under the design of Sygna Bridge Protocol, the originator VASP has to grant the signed approval from the beneficiary VASP before broadcasting any trnasaction to the blockchain.
If any law enforcement agency later claims this transaction to be illegal, the originator can use the signature to prove that they have informed the receiver of the transaction and granted permission to send assets to the target address.

The mission of the beneficiary VASP is to make sure **the incoming fund is sending to a legal address under it's control**. This may include validation of addess owner's KYC data and the activity of the account. If it's not the case, this server should send back a `REJECT` message to Sygna Bridge Central Server as a record of rejection of receiving specific fund. This fund may still occur on the blockchain, but if there's any legal concern of this transaction, the beneficiary VASP can ask Sygna Bridge to provide prove of rejection and get rid of the legal responsibility.

## Installation

Clone the project and run `npm install` to install all dependencies.

## Custom Implementation

You should implement following sections (marked with `@todo`) before starting the server:

### API Key validation

`src/util/api_key_validation.js`.

Implement your own API key validation logic to blockout unauthorized API calls.

### Originator Private Data Validation and storage

`src/transfer_confirmation.js`.

Before sending your signature of approval or reject of an incoming transfer, 

### Transaction validation

`src/transfer_confirmation.js`.

Make sure the 

## Run



```shell
SYGNA_PRIVKEY=THIS_IS_A_32_BYTE_PRIVATEKEY API_KEY=APIKEY_GOT_FROM_SYGNA_BRIDGE_SERVER node app.js
```
