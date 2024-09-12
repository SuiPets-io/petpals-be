const mongoose = require('mongoose');
const petConfig = require('../../configs/pet.config');

const ActiveFusionModeDb = new mongoose.Schema(
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
      enum: Object.values(petConfig.ACTIVE_FUSION_MODE_STATUS),
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

ActiveFusionModeDb.index({ publicAddress: 1 });
ActiveFusionModeDb.index({ txHash: 1 }, { unique: true });
ActiveFusionModeDb.index({ status: 1 });

const activeFusionModeDb = mongoose.model(
  'ActiveFusionMode',
  ActiveFusionModeDb,
  'active_fusion_modes'
);
module.exports = activeFusionModeDb;
