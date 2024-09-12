const noticationNumbDb = require('../../models/notification/noticationNumbDb');
const Io = require('../../networks/ws');
const wsConfig = require('../../configs/ws.config');

const notificationService = module.exports;

notificationService.notiNumb = async () => {
  // const notifications = await noticationNumbDb.find({}, { __v: 0 }).sort({ _id: -1 }).limit(10);
  // await noticationNumbDb.deleteMany({ 
  //   _id: { $in: notifications.map(item => item._id) }
  // });

  // if (notifications.length > 0) {
  //   Io.io.of('/global').emit(wsConfig.EVENT_SOCKET_NAME.NOTI_NUMB, {
  //     data: notifications.map(item => ({ 
  //       chatId: item.chatId,
  //       amount: item.amount,
  //       gameName: item.gameName,
  //     }))
  //   });
  // }
};