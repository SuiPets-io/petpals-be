const mongoose = require('mongoose');

const UserGenDb = new mongoose.Schema(
  {
    publicAddress: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    privateKey: {
      type: String,
      required: true,
    },
    index: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

UserGenDb.index({ index: 1 }, { unique: true });

const userGenDb = mongoose.model('userGen', UserGenDb, 'user_gens');
module.exports = userGenDb;
