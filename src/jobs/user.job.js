const { JOB_TYPE, TIME_UNIT } = require('../configs/constant');
const userService = require('../services/user/user.service');

module.exports = [
  {
    name: 'CHECK-REFERAL',
    options: { errorTimeout: 24, nextRunning: 5 },
    func: userService.checkUserReferral,
    type: JOB_TYPE.JOB,
    enable: true,
  },
  {
    name: 'CHECK-CLAIM_PPS',
    options: { errorTimeout: 24, nextRunning: 4 },
    func: userService.checkClaimPps,
    type: JOB_TYPE.JOB,
    enable: true,
  },
];
