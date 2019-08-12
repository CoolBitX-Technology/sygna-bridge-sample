# Nodejs Sample Sygna Bridge VASP Server

This is a sample Sygna Bridge VASP Server implemented with Nodejs.

## Sygna Bridge

Sygna Bridge is a regulatory compliance solution of crypto asset transaction between VASPs. You can find a more complete introducion about Sygna Bridge at [Sygna Bridge API Doc](https://coolbitx.gitlab.io/sygna/bridge/api/#sygna-bridge).

### Role of Beneficary Server

Under the design of Sygna Bridge, the **originator VASP** has to grant the signed approval from the **beneficiary VASP** before broadcasting any trnasaction to the blockchain. In this case, if any law enforcement agency later claims this transaction to be illegal, the originator can use the signature to prove that they have informed the receiver of the transaction and granted permission to send assets to the target address.

The mission of the beneficiary VASP is to make sure **the incoming fund is sending to a legal address under it's control**. This may include validation of addess owner's KYC data and the activity of the account. If the validation fails, the server should send back a signed `REJECT` message to Sygna Bridge Central Server as a record of rejection.

This fund may still occur on the blockchain, but if there's any legal concern of this transaction, the beneficiary VASP can ask Sygna Bridge to provide prove of rejection and get rid of the legal responsibility.

![beneficiary_server](https://coolbitx.gitlab.io/sygna/bridge/api/images/bnf_req_.png)

The bold arrow in the diagram indicate the request which the beneficiary should handle in the complete flow.

### Role of Originator Server

This example server also open an endpoint as originator's sample server, it listens to incoming permission from beneficiary.

When you post a permission request to Sygna Bridge server, you need to provide the domain of this server combined with the endpoint (`v1/originator/transaction/permission`) in `callback_url` so the Bridge know where to notify when it got a permission from beneficiary.

![beneficiary_server](https://coolbitx.gitlab.io/sygna/bridge/api/images/org_permit_.png)

## Installation

Clone the project and run `npm install` to install all dependencies.

## Custom Implementation

You should implement following sections (marked with `@todo`) before starting the server.

### Validation and Storage of Transfer Originator's Private Data

```shell
path: src/beneficiary.js
```

The originator VASP will provide you some private information of the crypto sender. According to FATL, **you must store the sender data locally to be AML compliant**. You may also need some extra validation on provided information according to local laws and regulations.

### Transaction validation

```shell
path: src/beneficiary.js
```

As mentioned before, you must make sure the receiving address is under your control or you have done a complete KYC with the account linked this address. This step may include notifying the fund receiver for further validation of incoming transfer. You may also need to check if the `amount` of transaction is legal according to local laws before giving out your final signature.

### Permission Storage

```shell
path: src/originator.js
```

If you are the originator VASP, you may also need to add some logic to inform your wallet user when you have grant a permission from transaction beneficiary, so the wallet can proceed and complete the compliant transaction.

## Run

You need to set `SYGNA_PRIVKEY`, `SB_PORT` and `SYGNA_API_KEY` as environment variables before starting the server, or specify them with start command.

* `SYGNA_PRIVKEY` is the private key you generated and have its corresponding public key registered on Sygna Bridge Central server.
* `SYGNA_API_KEY` is the 64 chars api key got from Sygna Bridge
* `SB_PORT` default to 3000

```shell
node app.js

// with environment variable setting
SYGNA_PRIVKEY=aaa SYGNA_API_KEY=bbb node app.js
```

## Testing

If you want to test your beneficiary VASP server, you can run the test script in `scripts/sample_flow.js`.
In the script, we send a permission request from a registered sample vasp (Exchange 1) to Sygna Bridge, you should replace the `beneficiary_vasp_code` with your own vasp_code so the Bridge Server can relay the message to your VASP server.

```shell
node scripts/sample_flow.js
```

