const schedule = require('node-schedule');
const { JOB_TYPE, TIME_UNIT } = require('../configs/constant');
const petService = require('../services/pet/pet.service');

module.exports = [
  {
    name: 'CHECK-BUY-PET-SLOT',
    options: { errorTimeout: 24, nextRunning: 5 },
    func: petService.checkBuyPetSlot,
    type: JOB_TYPE.JOB,
    enable: true,
  },
  {
    name: 'CHECK-GROWTH-EGG',
    options: { errorTimeout: 24, nextRunning: 10 },
    func: petService.checkGrowthEgg,
    type: JOB_TYPE.JOB,
    enable: true,
  },
  {
    name: 'CHECK-BUY-ITEM',
    options: { errorTimeout: 24, nextRunning: 5 },
    func: petService.checkBuyItem,
    type: JOB_TYPE.JOB,
    enable: true,
  },
  {
    name: 'CHECK-FUSION',
    options: { errorTimeout: 24, nextRunning: 5 },
    func: petService.checkFusion,
    type: JOB_TYPE.JOB,
    enable: true,
  },
  {
    name: 'CHECK-DIE-PET',
    options: { errorTimeout: 24, nextRunning: 20 },
    func: petService.checkDiePet,
    type: JOB_TYPE.JOB,
    enable: true,
  },
  {
    name: 'CHECK-ACTIVE_AUTO',
    options: { errorTimeout: 24, nextRunning: 5 },
    func: petService.checkActiveAuto,
    type: JOB_TYPE.JOB,
    enable: true,
  },
  {
    name: 'CHECK-ACTIVE_FUSION',
    options: { errorTimeout: 24, nextRunning: 5 },
    func: petService.checkActiveFusionMode,
    type: JOB_TYPE.JOB,
    enable: true,
  },
  {
    name: 'AUTO-ACTION',
    options: { errorTimeout: 24, nextRunning: 30 },
    func: petService.autoAction,
    type: JOB_TYPE.JOB,
    enable: true,
  },
  {
    name: 'CHECK-RESET-PET',
    options: { errorTimeout: 24, nextRunning: 5 },
    func: petService.checkResetPet,
    type: JOB_TYPE.JOB,
    enable: true,
  },
];
