const { JOB_TYPE, TIME_UNIT } = require('../configs/constant');
const petService = require('../services/pet/pet.service');

module.exports = [
  {
    name: 'PET-INCOMING-DIE',
    options: { errorTimeout: 24, nextRunning: 60 * 10 },
    func: petService.petIncommingDie,
    type: JOB_TYPE.JOB,
    enable: true,
  },
];
