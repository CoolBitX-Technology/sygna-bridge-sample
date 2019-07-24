# JavaScript Sample Sygna Bridge Beneficiary Server

This is a sample Sygna Bridge Beneficiary VASP Server implemented with Nodejs.

## What is a Sygna Bridge Beneficiary Server

Sygna Bridge is a regulatory compliance solution of crypto asset transaction between VASPs.

### Roles in Sygna Bridge

Under the design of Sygna Bridge Protocol, the originator VASP has to grant the signed approval from the beneficiary VASP before broadcasting any trnasaction to the blockchain.
In this case, if any law enforcement agency later claims this transaction to be illegal, the originator can use the signature to prove that they have informed the receiver of the transaction and granted permission to send assets to the target address.

The mission of the beneficiary VASP is to make sure **the incoming fund is sending to a legal address under it's control**. This may include validation of addess owner's KYC data and the activity of the account. If it's not the case, this server should send back a signed `REJECT` message to Sygna Bridge Central Server as a record of rejection. This fund may still occur on the blockchain, but if there's any legal concern of this transaction, the beneficiary VASP can ask Sygna Bridge to provide prove of rejection and get rid of the legal responsibility.

## Installation

Clone the project and run `npm install` to install all dependencies.

## Custom Implementation

You should implement following sections (marked with `@todo`) before starting the server:

### API Key validation

```shell
path: src/util/api_key_validation.js
```

Implement your own API key validation logic to block out unauthorized API calls. Theoretically all the incoming api calls should come from Sygna Bridge central server.

### Originator Private Data Validation and Storage

```shell
path: src/transfer_confirmation.js
```

The originator VASP will provide you some private information of the transaction sender. According to FATL, **you must store the sender data locally to be AML compliant**. You may also need some extra validation on provided information according to local laws and regulations.

### Transaction validation

```shell
path: src/transfer_confirmation.js
```

As mentioned before, you must make sure the receiving address is under your control or you have done a complete KYC with the account linked this address. You may also need to check if the `amount` of transaction is legal according to local laws before giving out your final signature.

## Run

You need to set `SYGNA_PRIVKEY` and `API_KEY` as environment variables before starting the server, or specify them with start command.

* `SYGNA_PRIVKEY` is the private key you generated and have its corresponding public key registered on Sygna Bridge Central server.

* `API_KEY` is the key you get from Sygna Bridge Central server after successfully registration as a legal and compliant VASP.

```shell
node app.js

// with environment variable setting
SYGNA_PRIVKEY=THIS_IS_A_32_BYTE_PRIVATEKEY API_KEY=APIKEY_GOT_FROM_SYGNA_BRIDGE_SERVER node app.js
```
