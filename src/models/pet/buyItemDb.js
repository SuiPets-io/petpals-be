const mongoose = require('mongoose');
const petConfig = require('../../configs/pet.config');

const BuyItemDb = new mongoose.Schema(
  {
    publicAddress: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
      enum: [
        ...Object.values(petConfig.FOOD_NAME),
        ...Object.values(petConfig.TOILET_NAME),
        ...Object.values(petConfig.ENTERTAINMENT_NAME),
      ],
    },
    amount: {
      type: Number,
      required: true,
    },
    ppsAmount: {
      type: Number,
      required: true,
    },
    priceUnit: {
      type: Number,
      required: true,
    },
    itemNumber: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(petConfig.BUY_ITEM_STATUS),
      required: true,
    },
    txHash: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

BuyItemDb.index({ publicAddress: 1 });
BuyItemDb.index({ txHash: 1 }, { unique: true });
BuyItemDb.index({ status: 1 });

const buyItemDb = mongoose.model('BuyItem', BuyItemDb, 'buy_items');
module.exports = buyItemDb;
