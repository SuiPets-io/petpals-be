const mongoose = require('mongoose');
const petConfig = require('../../configs/pet.config');

const PetSeasonDb = new mongoose.Schema(
  {
    seasonNumber: {
      type: Number,
      required: true,
    },
    type: {
      type: String,
      enum: Object.values(petConfig.PET_SEASON_TYPE),
      required: true,
    },
    startDate: {
      type: Date,
    },
    endDate: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

PetSeasonDb.index({ seasonNumber: 1, type: 1 }, { unique: true });
PetSeasonDb.index({ type: 1 });
PetSeasonDb.index({ startDate: 1, endDate: 1 });

const petSeasonDb = mongoose.model('PetSeason', PetSeasonDb, 'pet_seasons');
module.exports = petSeasonDb;
