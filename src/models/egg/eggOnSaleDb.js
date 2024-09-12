const mongoose = require('mongoose');
const eggConfig = require('../../configs/egg.config');
const petConfig = require('../../configs/pet.config');

const EggOnSaleDb = new mongoose.Schema(
  {
    publicAddress: {
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
    petType: {
      type: String,
      enum: Object.values(petConfig.PET_TYPE),
    },
    status: {
      type: String,
      enum: Object.values(eggConfig.ON_SALE_STATUS),
    },
  },
  {
    timestamps: true,
  }
);

EggOnSaleDb.index({ eggId: 1 }, { unique: true });
EggOnSaleDb.index({ publicAddress: 1 });
EggOnSaleDb.index({ amount: 1 });

const eggOnSaleDb = mongoose.model('EggOnSale', EggOnSaleDb, 'egg_on_sales');
module.exports = eggOnSaleDb;
