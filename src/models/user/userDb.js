const mongoose = require('mongoose');
const {REWARD_PPS_NEW_USER} = require("../../configs/user.config");

const UserDb = new mongoose.Schema(
  {
    publicAddress: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    chatId: {
      type: String,
      trim: true,
    },
    teleUsername: {
      type: String,
      trim: true,
    },
    referralCode: {
      type: String,
    },
    referedByOwnerId: {
      type: String,
    },
    isCheat: {
      type: Boolean,
      default: false,
    },
    numberReferral: {
      type: Number,
      default: 0,
    },
    pps: {
      type: Number,
      default: REWARD_PPS_NEW_USER,
    },
    // itemName: Number
    items: {
      type: Object,
    },
  },
  {
    timestamps: true,
  }
);

UserDb.index({ publicAddress: 1 }, { unique: true });
UserDb.index(
  { chatId: 1 },
  {
    unique: true,
    partialFilterExpression: {
      $and: [{ chatId: { $exists: true } }, { chatId: { $ne: null } }],
    },
  }
);
UserDb.index({ referralCode: 1 }, { unique: true });

const userDb = mongoose.model('User', UserDb, 'users');
module.exports = userDb;
