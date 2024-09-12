const mongoose = require('mongoose');
const petConfig = require('../../configs/pet.config');

const ResetPetDb = new mongoose.Schema(
  {
    publicAddress: {
      type: String,
      required: true,
    },
    position: {
      type: Number,
      required: true,
      enum: Object.values(petConfig.PET_POSITION),
    },
    eggId: {
      type: String,
    },
    amount: {
      type: Number,
    },
    status: {
      type: String,
      enum: Object.values(petConfig.RESET_PET_STATUS),
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

ResetPetDb.index({ publicAddress: 1 });
ResetPetDb.index({ txHash: 1 }, { unique: true });
ResetPetDb.index({ status: 1 });

const resetPetDb = mongoose.model('ResetPetDb', ResetPetDb, 'reset_pets');
module.exports = resetPetDb;
