const mongoose = require('mongoose');
const petConfig = require('../../configs/pet.config');

const PetActivityDb = new mongoose.Schema(
  {
    petId: {
      type: String,
    },
    publicAddress: {
      type: String,
      required: true,
    },
    activity: {
      type: String,
      required: true,
      enum: Object.values(petConfig.ACTIVITY),
      default: petConfig.ACTIVITY.HARVEST,
    },
    activityDetail: {
      type: String,
      default: '',
    },
    amountType: {
      type: String,
      enum: Object.values(petConfig.AMOUNT_TYPE),
    },
    amount: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      required: true,
      enum: Object.values(petConfig.ACTIVITY_STATUS),
      default: petConfig.ACTIVITY_STATUS.SUCCESS,
    },
    txHash: {
      type: String,
    },
    retrySend: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

PetActivityDb.index({ publicAddress: 1 });
PetActivityDb.index({ activity: 1 });
PetActivityDb.index({ activityDetail: 1 });

const petActivityDb = mongoose.model(
  'PetActivity',
  PetActivityDb,
  'pet_activities'
);
module.exports = petActivityDb;
