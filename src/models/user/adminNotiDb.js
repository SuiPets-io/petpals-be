const mongoose = require('mongoose');

const AdminNotiDb = new mongoose.Schema(
  {
    type: {
      type: String, // error, new-account
      required: true,
    },
    message: String,
    status: String, // pending, success
  },
  {
    timestamps: true,
  }
);

AdminNotiDb.index({ createdAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 7 });

const adminNotiDb = mongoose.model('adminNoti', AdminNotiDb, 'admin_notis');
module.exports = adminNotiDb;
