const { decodeSuiPrivateKey } = require('@mysten/sui/cryptography');
const { coinWithBalance, Transaction } = require('@mysten/sui/transactions');
const { Ed25519Keypair } = require('@mysten/sui/keypairs/ed25519');
const { getFullnodeUrl, SuiClient } = require('@mysten/sui/client');

const config = require('../configs/config');

const suiLib = module.exports;

suiLib.client = new SuiClient({
  url: config.RPC_SUI,
});

suiLib.getBalance = async (address) => {
  const balance = await this.client.getBalance({
    owner: address,
  });
  return balance.totalBalance / 10 ** 9;
};

suiLib.getTransaction = async (txHash) => {
  const txn = await this.client.getTransactionBlock({
    digest: txHash,
    options: {
      showEffects: true,
      showInput: false,
      showEvents: false,
      showObjectChanges: false,
      showBalanceChanges: true,
    },
  });

  return txn;
};

suiLib.transferSui = async (senderPrivateKey, sendInfos = []) => {
  const decoded = decodeSuiPrivateKey(senderPrivateKey);
  const keypair = Ed25519Keypair.fromSecretKey(decoded.secretKey);

  const tx = new Transaction();
  tx.setSender(keypair.toSuiAddress());
  sendInfos.forEach((info) => {
    tx.transferObjects(
      [coinWithBalance({ balance: info.amount })],
      info.address
    );
  });

  const sign = await this.client.signAndExecuteTransaction({
    signer: keypair,
    transaction: tx,
  });
  const result = await this.client.waitForTransaction({ digest: sign.digest });
  return result;
};

suiLib.transferPps = async (senderPrivateKey, sendInfos = []) => {
  const decoded = decodeSuiPrivateKey(senderPrivateKey);
  const keypair = Ed25519Keypair.fromSecretKey(decoded.secretKey);

  const tx = new Transaction();
  tx.setSender(keypair.toSuiAddress());
  sendInfos.forEach((info) => {
    tx.transferObjects(
      [
        coinWithBalance({
          balance: info.amount,
          type: config.PPS_CONTRACT_ADDRESS,
        }),
      ],
      info.address
    );
  });

  const sign = await this.client.signAndExecuteTransaction({
    signer: keypair,
    transaction: tx,
  });
  const result = await this.client.waitForTransaction({ digest: sign.digest });
  return result;
};

suiLib.genAccountFromSeed = (index) => {
  const keypair = Ed25519Keypair.deriveKeypair(
    config.ADMIN_SEED,
    `m/44'/784'/0'/0'/${index}'`
  );
  const address = keypair.getPublicKey().toSuiAddress();
  const privateKey = keypair.getSecretKey();

  return {
    address,
    privateKey,
  };
};

// const f = async () => {
//   const data = await suiLib.transferPps(config.ADMIN_PRIVATE_KEY, [
//     {
//       amount: '1',
//       address:
//         '0xfa1ec7ef8efbc8fb54ad760a67d5a7310a53409f04380fc941570dfb4d6a5585',
//     },
//   ]);
//   //   const data = await suiLib.getTransaction(
//   //     'DTXEbiUvBuBvoB3EoEFgYcqUQuKwvtWL3XK2gXazV5aM'
//   //   );
//   console.log(JSON.stringify(data));
// };

// f();
