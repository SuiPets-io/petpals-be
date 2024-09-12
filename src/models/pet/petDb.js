const mongoose = require('mongoose');
const petConfig = require('../../configs/pet.config');
const eggConfig = require('../../configs/egg.config');

const PetDb = new mongoose.Schema(
  {
    publicAddress: {
      type: String,
      required: true,
    },
    position: {
      type: Number,
      required: true,
      enum: Object.values(petConfig.PET_POSITION),
    },
    type: {
      type: String,
      enum: Object.values(petConfig.PET_TYPE),
    },
    level: {
      type: Number,
      enum: Object.values(petConfig.PET_LEVEL),
    },
    point: {
      type: Number,
      default: 0,
    },
    pps: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: Object.values(petConfig.PET_STATUS),
    },
    stage: {
      type: String,
      enum: Object.values(petConfig.PET_STAGE),
    },
    stageIndex: {
      type: Number,
      default: 0,
    },
    nextActionTime: {
      type: Date,
    },
    prevActionTime: {
      // effect by actions eat, toilet, entertainment or harvest
      type: Date,
    },
    growthTime: {
      type: Date,
    },
    isFree: {
      type: Boolean,
      default: false,
    },
    name: {
      type: String,
    },
    eggId: {
      type: String,
    },
    rarity: {
      type: String,
      enum: Object.values(eggConfig.RARITY),
    },
    origin: {
      type: String,
      enum: Object.values(eggConfig.ORIGIN),
    },
    isActiveAuto: {
      type: Boolean,
      default: false,
    },
    isOpenAuto: {
      type: Boolean,
      default: true,
    },
    fusion: {
      isActive: {
        type: Boolean,
        default: false,
      },
      amount: {
        type: Number,
        default: 0,
      },
      numberEgg: {
        type: Number,
        default: 0,
      },
      isGiveMode: {
        type: Boolean,
        default: false,
      },
      checkTime: {
        type: Date,
      },
    },
    freeItemCheckTime: {
      type: Date,
    },
    handleStatus: {
      type: String, // 'admin'
    },
    growthBonus: {
      isRead: {
        type: Boolean,
        default: false,
      },
      value: {
        type: Number,
        default: 0,
      },
      txHash: {
        type: String,
      },
    },
  },
  {
    timestamps: true,
  }
);

PetDb.index({ publicAddress: 1 });
PetDb.index({ isAutoAction: 1 });
PetDb.index({ status: 1 });
PetDb.index({ publicAddress: 1, position: 1 }, { unique: true });

const petDb = mongoose.model('Pet', PetDb, 'pets');
module.exports = petDb;
