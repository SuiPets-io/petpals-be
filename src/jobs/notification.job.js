const { JOB_TYPE, TIME_UNIT } = require('../configs/constant');
const notificationService = require('../services/notification/notification.service');

module.exports = [
  {
    name: 'NOTI-NUMB',
    options: { errorTimeout: 2, nextRunning: 2 },
    func: notificationService.notiNumb,
    type: JOB_TYPE.JOB,
    enable: true
  }
];
