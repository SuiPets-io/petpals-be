const mongoose = require('mongoose');
const eggConfig = require('../../configs/egg.config');
const petConfig = require('../../configs/pet.config');

const EggDb = new mongoose.Schema(
  {
    publicAddress: {
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
    status: {
      type: String,
      enum: Object.values(eggConfig.EGG_STATUS),
    },
    petType: {
      type: String,
      enum: Object.values(petConfig.PET_TYPE),
    },
    isFree: {
      type: Boolean,
      default: false,
    },
    isFreeGenesis: {
      type: Boolean,
      default: false,
    },
    originUserAddress: {
      type: String,
    },
    handleStatus: {
      type: String,
      enum: Object.values(eggConfig.HANDLE_STATUS),
    },
  },
  {
    timestamps: true,
  }
);

EggDb.index({ isFree: 1 });
EggDb.index({ isFreeGenesis: 1, rarity: 1 });
EggDb.index({ originUserAddress: 1, isFreeGenesis: 1 });

const eggDb = mongoose.model('Egg', EggDb, 'eggs');
module.exports = eggDb;
