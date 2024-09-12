const mongoose = require('mongoose');
const eggConfig = require('../../configs/egg.config');
const petConfig = require('../../configs/pet.config');

const EggRecentSoldDb = new mongoose.Schema(
  {
    seller: {
      type: String,
      required: true,
    },
    buyer: {
      type: String,
      required: true,
    },
    eggId: {
      type: String,
      required: true,
    },
    origin: {
      type: String,
      enum: Object.values(eggConfig.ORIGIN),
      required: true,
    },
    rarity: {
      type: String,
      enum: Object.values(eggConfig.RARITY),
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(eggConfig.RECENT_SOLD_STATUS),
    },
    petType: {
      type: String,
      enum: Object.values(petConfig.PET_TYPE),
    },
    txHash: {
      type: String,
    },
    txSend: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

EggRecentSoldDb.index({ publicAddress: 1 });
EggRecentSoldDb.index({ amount: 1 });
EggRecentSoldDb.index({ txHash: 1 }, { unique: true });

const eggRecentSoldDb = mongoose.model(
  'EggRecentSold',
  EggRecentSoldDb,
  'egg_recent_solds'
);
module.exports = eggRecentSoldDb;
