const { JOB_TYPE, TIME_UNIT } = require('../configs/constant');
const userService = require('../services/user/user.service');

module.exports = [
  {
    name: 'ADMIN-NOTI',
    options: { errorTimeout: 24, nextRunning: 60 },
    func: userService.adminNoti,
    type: JOB_TYPE.JOB,
    enable: true,
  },
];
