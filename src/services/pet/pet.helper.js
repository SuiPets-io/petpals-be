const dateFns = require('date-fns');
const petDb = require('../../models/pet/petDb');
const { ERROR_CODES } = require('../../configs/constant');
const { AppError } = require('../../utils/errors');
const petConfig = require('../../configs/pet.config');
const eggConfig = require('../../configs/egg.config');
const fusionConfig = require('../../configs/fusion.config');
const petSeasonDb = require('../../models/pet/petSeasonDb');
const userRankDb = require('../../models/pet/userRankDb');

const petHelper = module.exports;

petHelper.calculatePps = ({ level, pps, prevActionTime, checkTime, buff }) => {
  let timeInHour;
  if (checkTime < prevActionTime) {
    timeInHour = 0;
  } else {
    const time =
      new Date(checkTime).getTime() - new Date(prevActionTime).getTime();
    // timeInHour = Math.min(
    //   dateFns.differenceInHours(checkTime, prevActionTime),
    //   petConfig.PET_ACTIVITY_TIME_IN_HOUR
    // );
    timeInHour = Math.min(
      time / (60 * 60 * 1000),
      petConfig.PET_ACTIVITY_TIME_IN_HOUR
    );
  }

  const earnPps =
    petConfig.PET_EARN_PPS_PER_DAY[level] * (timeInHour / 24) * buff;

  return {
    earnPps,
    pps: pps + earnPps,
    prevActionTime: checkTime,
  };
};

petHelper.calculateLevel = ({ thisLevel, thisPoint, bonusPoint, petStage }) => {
  const nextLevelPointMin = petConfig.PET_LEVEL_POINT[thisLevel];
  const totalPoint = thisPoint + bonusPoint * petConfig.STAGE_WEIGHT[petStage];
  if (totalPoint > nextLevelPointMin) {
    return {
      level: thisLevel + 1,
      point: totalPoint,
    };
  }
  return {
    level: thisLevel,
    point: totalPoint,
  };
};

petHelper.calculateNextStage = ({ stageIndex }) => {
  stageIndex++;
  if (stageIndex > 5) stageIndex = 0;
  return { stage: petConfig.PET_STAGE_PROCESS[stageIndex].stage, stageIndex };
};

petHelper.doActivity = async ({
  publicAddress,
  pet,
  itemType,
  itemName,
  session,
}) => {
  const now = new Date();
  // need wait time
  if (pet.nextActionTime > now) {
    throw new AppError(
      ERROR_CODES.ERR_BAD_REQUEST,
      'Thank you for taking care of me. Have a nice day!'
    );
  }

  let bonusPoint = 0;
  // do eat
  if (itemType === petConfig.ITEM_TYPE.FOOD) {
    if (pet.stage !== petConfig.PET_STAGE.EAT) {
      throw new AppError(
        ERROR_CODES.ERR_BAD_REQUEST,
        'I do not need to eat right now.'
      );
    }
    bonusPoint = petConfig.FOOD_CONFIG[itemName].point;
  }
  // do toilet
  else if (itemType === petConfig.ITEM_TYPE.TOILET) {
    if (pet.stage !== petConfig.PET_STAGE.TOILET) {
      throw new AppError(
        ERROR_CODES.ERR_BAD_REQUEST,
        'I do not need to use the restroom right now.'
      );
    }
    bonusPoint = petConfig.TOILET_CONFIG[itemName].point;
  }
  // do entertainment
  else {
    if (pet.stage !== petConfig.PET_STAGE.ENTERTAINMENT) {
      throw new AppError(
        ERROR_CODES.ERR_BAD_REQUEST,
        'I am already feeling happy now!'
      );
    }
    bonusPoint = petConfig.ENTERTAINMENT_CONFIG[itemName].point;
  }

  const { level, point } = petHelper.calculateLevel({
    thisLevel: pet.level,
    thisPoint: pet.point,
    bonusPoint,
    petStage: pet.stage,
  });

  const buff = eggConfig.RARITY_BUFF[pet.origin][pet.rarity];

  // console.log({ level, point });
  const { pps, earnPps, prevActionTime } = petHelper.calculatePps({
    level: pet.level,
    pps: pet.pps,
    prevActionTime: pet.prevActionTime,
    checkTime: now,
    buff,
  });
  // console.log({ pps, earnPps, prevActionTime });

  const { stage, stageIndex } = petHelper.calculateNextStage({
    stageIndex: pet.stageIndex,
  });
  // console.log({ stage, stageIndex });

  if (
    pet.level === petConfig.PET_LEVEL.NINE &&
    pet.stage === petConfig.PET_STAGE.ENTERTAINMENT
  ) {
    await petDb.updateOne(
      { _id: pet._id },
      { $set: { status: petConfig.PET_STATUS.DIE } },
      { session }
    );
  } else {
    await petDb.updateOne(
      { _id: pet._id },
      {
        $set: {
          level,
          point,
          pps,
          stage,
          stageIndex,
          nextActionTime: dateFns.addHours(
            now,
            petConfig.PET_ACTIVITY_TIME_IN_HOUR
          ),
          prevActionTime,
        },
      },
      { session }
    );
  }
  // await this.updateUserRank({ publicAddress, pps: earnPps, session });
};

petHelper.getSeason = async (session) => {
  const dateNow = new Date();
  let [[weekSeason], [monthSeason]] = await Promise.all([
    petSeasonDb
      .find({
        type: petConfig.PET_SEASON_TYPE.WEEK,
      })
      .sort({ seasonNumber: -1 })
      .limit(1),
    petSeasonDb
      .find({
        type: petConfig.PET_SEASON_TYPE.MONTH,
      })
      .sort({ seasonNumber: -1 })
      .limit(1),
  ]);

  if (
    !weekSeason ||
    !(weekSeason.startDate <= dateNow && weekSeason.endDate >= dateNow)
  ) {
    const startDate = dateFns.startOfWeek(dateNow);
    const endDate = dateFns.endOfWeek(dateNow);
    weekSeason = await petSeasonDb.create(
      [
        {
          seasonNumber: (weekSeason?.seasonNumber || 0) + 1,
          type: petConfig.PET_SEASON_TYPE.WEEK,
          startDate,
          endDate,
        },
      ],
      { session }
    );
  }

  if (
    !monthSeason ||
    !(monthSeason.startDate <= dateNow && monthSeason.endDate >= dateNow)
  ) {
    const startDate = dateFns.startOfMonth(dateNow);
    const endDate = dateFns.endOfMonth(dateNow);
    monthSeason = await petSeasonDb.create(
      [
        {
          seasonNumber: (monthSeason?.seasonNumber || 0) + 1,
          type: petConfig.PET_SEASON_TYPE.MONTH,
          startDate,
          endDate,
        },
      ],
      { session }
    );
  }
  return {
    weekSeason,
    monthSeason,
  };
};

petHelper.updateUserRank = async ({ publicAddress, pps, session }) => {
  const { weekSeason, monthSeason } = await this.getSeason(session);

  await userRankDb.updateOne(
    {
      publicAddress,
      seasonNumber: weekSeason.seasonNumber,
      seasonType: weekSeason.type,
    },
    { $inc: { pps } },
    { upsert: true, session }
  );

  await userRankDb.updateOne(
    {
      publicAddress,
      seasonNumber: monthSeason.seasonNumber,
      seasonType: monthSeason.type,
    },
    { $inc: { pps } },
    { upsert: true, session }
  );
};

petHelper.checkTimeToFusion = async ({ checkTime, numberEgg = 0 }) => {
  if (!checkTime) return true;

  const dateNow = new Date();

  let timeToFusionInHour = fusionConfig.TIME_TO_FUSION_IN_HOUR[numberEgg];
  if (!timeToFusionInHour) {
    timeToFusionInHour = fusionConfig.TIME_TO_FUSION_IN_HOUR[numberEgg][10];
  }

  if (dateNow.getTime() - checkTime.getTime() > timeToFusionInHour * 3600000) {
    return true;
  }
  return false;
};

petHelper.fusionRarity = (receivePetRarity, givePetRarity) => {
  const rate =
    fusionConfig.FUSION_RATE[
      fusionConfig.FUSION_RARITY_INDEX[receivePetRarity]
    ][fusionConfig.FUSION_RARITY_INDEX[givePetRarity]];

  const random = Math.random();
  const findRarity = rate.find(
    (item) => item.from <= random && item.to >= random
  );

  return findRarity?.rarity || eggConfig.RARITY.COMMON;
};

petHelper.randomGrowthBonus = () => {
  const random = Math.random();
  const bonus = petConfig.BONUS_GROWTH_EGG.find(
    (item) => item.fromRate <= random && item.toRate >= random
  );
  return bonus?.value || 0;
};
