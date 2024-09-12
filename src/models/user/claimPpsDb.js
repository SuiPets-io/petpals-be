const mongoose = require('mongoose');
const userConfig = require('../../configs/user.config');

const ClaimPpsDb = new mongoose.Schema(
  {
    publicAddress: {
      type: String,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    pps: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(userConfig.CLAIM_PPS_STATUS),
    },
    txHash: {
      type: String,
      required: true,
    },
    sendTxHash: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

ClaimPpsDb.index({ publicAddress: 1 });
ClaimPpsDb.index({ txHash: 1 }, { unique: true });
ClaimPpsDb.index({ status: 1 });

const claimPpsDb = mongoose.model('ClaimPps', ClaimPpsDb, 'claim_pps');
module.exports = claimPpsDb;
