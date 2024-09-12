const mongoose = require('mongoose');
const petConfig = require('../../configs/pet.config');

const ActiveAutoDb = new mongoose.Schema(
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
      enum: Object.values(petConfig.AUTO_STATUS),
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

ActiveAutoDb.index({ publicAddress: 1 });
ActiveAutoDb.index({ txHash: 1 }, { unique: true });
ActiveAutoDb.index({ status: 1 });

const activeAutoDb = mongoose.model('ActiveAuto', ActiveAutoDb, 'active_autos');
module.exports = activeAutoDb;
