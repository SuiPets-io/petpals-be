const mongoose = require('mongoose');
const userConfig = require('../../configs/user.config');

const UserReferralDb = new mongoose.Schema(
  {
    userReferId: {
      type: String,
      required: true,
    },
    userReferedId: {
      type: String,
      required: true,
    },
    publicAddress: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      required: true,
      enum: Object.values(userConfig.REFERRAL_STATUS),
    },
    retrySend: {
      type: Number,
      default: 0,
    },
    level: {
      type: Number,
      required: true,
      enum: [1, 2],
    },
  },
  {
    timestamps: true,
  }
);

const userReferralDb = mongoose.model(
  'userReferral',
  UserReferralDb,
  'user_referrals'
);
module.exports = userReferralDb;
