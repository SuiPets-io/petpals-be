const mongoose = require('mongoose');
const petConfig = require('../../configs/pet.config');
const eggConfig = require('../../configs/egg.config');

const PetFusionDb = new mongoose.Schema(
  {
    publicAddress: {
      type: String,
      required: true,
    },
    givePublicAddress: {
      type: String,
      required: true,
    },
    receivePetId: {
      type: String,
      required: true,
    },
    receivePetRarity: {
      type: String,
      required: true,
      enum: Object.values(eggConfig.RARITY),
    },
    givePetId: {
      type: String,
      required: true,
    },
    givePetRarity: {
      type: String,
      required: true,
      enum: Object.values(eggConfig.RARITY),
    },
    amount: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(petConfig.FUSION_STATUS),
    },
    txHash: {
      type: String,
      required: true,
    },
    isReset: {
      type: Boolean,
      default: false,
    },
    eggId: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

PetFusionDb.index({ publicAddress: 1 });
PetFusionDb.index({ txHash: 1 }, { unique: true });
PetFusionDb.index({ status: 1 });
PetFusionDb.index({ givePetId: 1, isReset: 1 });
PetFusionDb.index({ receivePetId: 1, isReset: 1 });

const petFusionDb = mongoose.model('PetFusion', PetFusionDb, 'pet_fusions');
module.exports = petFusionDb;
