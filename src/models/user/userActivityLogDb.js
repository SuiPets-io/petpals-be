const mongoose = require('mongoose');
const constants = require('../../configs/constant');

const UseActivityLogDb = new mongoose.Schema(
  {
    publicAddress: {
      type: String,
    },
    ip: {
      type: String,
    },
    location: {
      type: Object,
    },
    activity: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const useActivityLogDb = mongoose.model(
  'userActivityLog',
  UseActivityLogDb,
  'user_activity_logs'
);
module.exports = useActivityLogDb;
