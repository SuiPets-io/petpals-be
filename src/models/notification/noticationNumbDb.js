const mongoose = require('mongoose');
const notificationConfig = require('../../configs/notification.config');

const NotificationNumbDb = new mongoose.Schema(
  {
    chatId: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    gameName: {
      type: String,
      enum: Object.values(notificationConfig.NOTI_GAME_NAME),
    },
  },
  {
    timestamps: true,
  }
);

const notificationNumbDb = mongoose.model(
  'NotificationNumbDb',
  NotificationNumbDb,
  'notification_numbs'
);
module.exports = notificationNumbDb;
