const { JOB_TYPE, TIME_UNIT } = require('../configs/constant');
const eggService = require('../services/egg/egg.service');

module.exports = [
  {
    name: 'CHECK-BUY-OFFERING',
    options: { errorTimeout: 24, nextRunning: 5 },
    func: eggService.checkBuyOffering,
    type: JOB_TYPE.JOB,
    enable: true,
  },
  {
    name: 'CHECK-BUY-EGG',
    options: { errorTimeout: 24, nextRunning: 5 },
    func: eggService.checkBuyEgg,
    type: JOB_TYPE.JOB,
    enable: true,
  },
];
