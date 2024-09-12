const mongoose = require('mongoose');
const petConfig = require('../../configs/pet.config');

const UserRankDb = new mongoose.Schema(
  {
    publicAddress: {
      type: String,
      required: true,
    },
    seasonNumber: {
      type: Number,
    },
    seasonType: {
      type: String,
      enum: Object.values(petConfig.PET_SEASON_TYPE),
      required: true,
    },
    pps: {
      type: Number,
    },
    origin: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

UserRankDb.index(
  { publicAddress: 1, seasonNumber: 1, seasonType: 1 },
  { unique: true }
);
UserRankDb.index({ pps: 1 });

const userRankDb = mongoose.model('UserRank', UserRankDb, 'user_ranks');
module.exports = userRankDb;
