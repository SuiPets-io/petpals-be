const mongoose = require('mongoose');
const eggConfig = require('../../configs/egg.config');

const BuyOfferingDb = new mongoose.Schema(
  {
    publicAddress: {
      type: String,
      required: true,
    },
    txHash: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      required: true,
      enum: Object.values(eggConfig.BUY_OFFERING_STATUS),
    },
    amount: {
      type: Number,
      required: true,
    },
    eggId: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

BuyOfferingDb.index({ txHash: 1 }, { unique: true });

const buyOfferingDb = mongoose.model(
  'BuyOffering',
  BuyOfferingDb,
  'buy_offerings'
);
module.exports = buyOfferingDb;
