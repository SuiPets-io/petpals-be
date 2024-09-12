const mongoose = require('mongoose');
const eggConfig = require('../../configs/egg.config');

const EggSettingDb = new mongoose.Schema(
  {
    numberEgg: {
      type: Number,
      default: 0,
    },
    [eggConfig.RARITY.COMMON]: {
      type: Number,
      default: 0,
    },
    [eggConfig.RARITY.RARE]: {
      type: Number,
      default: 0,
    },
    [eggConfig.RARITY.EPIC]: {
      type: Number,
      default: 0,
    },
    [eggConfig.RARITY.LEGENDARY]: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

const eggSettingDb = mongoose.model('EggSetting', EggSettingDb, 'egg_settings');
module.exports = eggSettingDb;
