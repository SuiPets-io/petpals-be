const mongoose = require('mongoose');
const petConfig = require('../../configs/pet.config');

const BuyPetSlotDb = new mongoose.Schema(
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
    amount: {
      type: Number,
    },
    status: {
      type: String,
      enum: Object.values(petConfig.BUY_PET_SLOT_STATUS),
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

BuyPetSlotDb.index({ publicAddress: 1 });
BuyPetSlotDb.index({ txHash: 1 }, { unique: true });
BuyPetSlotDb.index({ status: 1 });

const buyPetSlotDb = mongoose.model(
  'BuyPetSlot',
  BuyPetSlotDb,
  'buy_pet_slots'
);
module.exports = buyPetSlotDb;
