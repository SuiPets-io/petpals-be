const BigNumber = require('bignumber.js');
const { verifyPersonalMessageSignature } = require('@mysten/sui/verify');

const suiUtil = module.exports;

suiUtil.vertifySignature = async (message, signature, publicAddress) => {
  try {
    const publicKey = await verifyPersonalMessageSignature(message, signature);
    return publicKey.toSuiAddress() === publicAddress.toLowerCase();
  } catch {
    return false;
  }
};

suiUtil.convertToSui = (amount) => {
  return new BigNumber(amount).dividedBy(10 ** 9).toNumber();
};

suiUtil.convertToPps = (amount) => {
  return new BigNumber(amount).dividedBy(10 ** 6).toNumber();
};

suiUtil.convertSuiToWei = (amount) => {
  return new BigNumber(String(amount)).multipliedBy(10 ** 9).toString();
};

suiUtil.convertPpsToWei = (amount) => {
  return new BigNumber(amount).multipliedBy(10 ** 6).toString();
};
