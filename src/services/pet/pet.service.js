const dateFns = require('date-fns');
const lodash = require('lodash');
const mongoose = require('mongoose');
const petDb = require('../../models/pet/petDb');
const petActivityDb = require('../../models/pet/petActivityDb');
// const eggDb = require("../../models/pet/eggDb");
const userDb = require('../../models/user/userDb');
const petFusionDb = require('../../models/pet/petFusionDb');
const mongoDbSessionAutoWrap = require('../../models/mongoDbSessionAutoWrap');
const { ERROR_CODES } = require('../../configs/constant');
const { AppError } = require('../../utils/errors');
const config = require('../../configs/config');
const petConfig = require('../../configs/pet.config');
const teleConfig = require('../../configs/tele.config');
const fusionConfig = require('../../configs/fusion.config');
const eggConfig = require('../../configs/egg.config');
const petHelper = require('../../services/pet/pet.helper');
const userRankDb = require('../../models/pet/userRankDb');
const logger = require('../../utils/logger');
const buyPetSlotDb = require('../../models/pet/buyPetSlotDb');
const eggDb = require('../../models/egg/eggDb');
const buyItemDb = require('../../models/pet/buyItemDb');
const activeFusionModeDb = require('../../models/pet/activeFusionModeDb');
const activeAutoDb = require('../../models/pet/activeAutoDb');
const { PromisePool } = require('@supercharge/promise-pool');
const suiLib = require('../../libs/sui.lib');
const suiUtil = require('../../utils/sui');
const resetPetDb = require('../../models/pet/resetPetDb');
const { sendToAllChats } = require('../../networks/tele/bot');
const timeoutAwait = require('../../utils/timeoutAwait');
const adminNotiDb = require('../../models/user/adminNotiDb');

const petService = module.exports;

petService.editPet = async ({
  publicAddress,
  petId,
  name,
  isOpenAuto,
  isReadGrowthBonus,
}) => {
  const update = {};
  if (name) {
    update.name = name;
  }

  if (typeof isOpenAuto === 'boolean') {
    update.isOpenAuto = isOpenAuto;
  }

  if (typeof isReadGrowthBonus === 'boolean') {
    update['growthBonus.isRead'] = isReadGrowthBonus;
  }

  await petDb.updateOne({ _id: petId, publicAddress }, { $set: update });
};

petService.buyPetSlot = async ({ publicAddress, position, txHash }) => {
  const [checkTxHash, checkPosition, countBuySlot] = await Promise.all([
    buyPetSlotDb.findOne({ txHash }),
    petDb.findOne({ publicAddress, position }),
    petDb.countDocuments({
      publicAddress,
      status: { $ne: petConfig.PET_STATUS.NEED_TO_BUY },
    }),
  ]);

  if (checkTxHash) {
    throw new AppError(
      ERROR_CODES.ERR_BAD_REQUEST,
      'Sorry, cannot buy this slot!'
    );
  }

  if (checkPosition.status !== petConfig.PET_STATUS.NEED_TO_BUY) {
    throw new AppError(
      ERROR_CODES.ERR_BAD_REQUEST,
      'Sorry, this slot has already bought!'
    );
  }

  const amount = petConfig.PET_SLOT_PRICE[countBuySlot];
  await buyPetSlotDb.create({
    publicAddress,
    position,
    amount,
    status: petConfig.BUY_PET_SLOT_STATUS.WAITING_TO_CHECK,
    txHash,
  });
};

petService.checkBuyPetSlot = async () => {
  const buyPendings = await buyPetSlotDb
    .find({
      status: petConfig.BUY_PET_SLOT_STATUS.WAITING_TO_CHECK,
    })
    .sort({ _id: -1 });

  for (const buyPending of buyPendings) {
    const tx = await suiLib.getTransaction(buyPending.txHash);
    if (!tx) continue;

    if (tx?.effects.status.status === 'success') {
      const fromInfo = tx?.balanceChanges?.find(
        (item) =>
          item.coinType === '0x2::sui::SUI' &&
          item?.owner?.AddressOwner === buyPending.publicAddress
      );
      const toInfo = tx?.balanceChanges?.find(
        (item) =>
          item.coinType === '0x2::sui::SUI' &&
          Number(item.amount) > 0 &&
          item?.owner?.AddressOwner === config.ADMIN_WALLET_ADDRESS
      );

      if (
        !tx?.balanceChanges ||
        (fromInfo &&
          toInfo &&
          suiUtil.convertToSui(toInfo.amount) === buyPending.amount)
      ) {
        await mongoDbSessionAutoWrap(async (session) => {
          await buyPetSlotDb.updateOne(
            { _id: buyPending._id },
            { $set: { status: petConfig.BUY_PET_SLOT_STATUS.SUCCESS } },
            { session }
          );
          await petDb.updateOne(
            {
              publicAddress: buyPending.publicAddress,
              position: buyPending.position,
            },
            {
              status: petConfig.PET_STATUS.AVAILABLE,
            },
            { session }
          );
          // notify to admin group
          await adminNotiDb.create({
            type: 'open-slot',
            message: `Slot was opened by wallet ${buyPending.publicAddress}!`,
            status: 'pending',
          });
        });
        continue;
      }
    }

    await buyPetSlotDb.updateOne(
      { _id: buyPending._id },
      { $set: { status: petConfig.BUY_PET_SLOT_STATUS.FAIL } }
    );
  }
};

petService.putEgg = async ({ publicAddress, eggId, name, position }) => {
  const [checkEgg, checkPosition] = await Promise.all([
    eggDb.findOne({ publicAddress, _id: eggId }),
    petDb.findOne({ publicAddress, position }),
  ]);

  if (!checkEgg || checkEgg.status !== eggConfig.EGG_STATUS.ACTIVE)
    throw new AppError(
      ERROR_CODES.ERR_BAD_REQUEST,
      'Sorry, unable to put this egg!'
    );

  if (
    !checkPosition ||
    !(
      checkPosition.status === petConfig.PET_STATUS.AVAILABLE ||
      (checkPosition.status === petConfig.PET_STATUS.DIE &&
        checkPosition.origin === eggConfig.ORIGIN.NORMAL)
    )
  ) {
    throw new AppError(ERROR_CODES.ERR_BAD_REQUEST, 'Invalid slot status!');
  }
  await mongoDbSessionAutoWrap(async (session) => {
    if (checkPosition.status === petConfig.PET_STATUS.DIE) {
      await eggDb.updateOne(
        { _id: checkPosition.eggId },
        { $set: { status: eggConfig.EGG_STATUS.DIE } },
        { session }
      );
    }

    await eggDb.updateOne(
      { _id: eggId },
      {
        status: eggConfig.EGG_STATUS.FARMING,
      },
      { session }
    );
    await petDb.updateOne(
      {
        publicAddress,
        position,
      },

      {
        $set: {
          status: petConfig.PET_STATUS.EGG,
          eggId,
          name,
          rarity: checkEgg.rarity,
          origin: checkEgg.origin,
          type: checkEgg.petType,
          growthTime: dateFns.addHours(
            new Date(),
            petConfig.GROWTH_TIME_IN_HOUR
          ),
          pps: 0,
          point: 0,
          isActiveAuto: false,
          fusion: {
            isActive: false,
            amount: 0,
            numberEgg: 0,
            isGiveMode: false,
          },
        },
        $unset: {
          freeItemCheckTime: '',
          stage: '',
          stageIndex: '',
          level: '',
          nextActionTime: '',
          prevActionTime: '',
        },
      },
      { session }
    );
  });
};

petService.checkGrowthEgg = async () => {
  const pets = await petDb.find({
    status: petConfig.PET_STATUS.EGG,
    growthTime: { $lt: new Date() },
  });

  for (const pet of pets) {
    let bonus = petHelper.randomGrowthBonus();
    const balance = await suiLib.getBalance(config.ADMIN_BONUS_SUI_ADDRESS);
    if (balance < 10) bonus = 0;
    if (bonus > 10) bonus = 0;

    let txSend;
    if (config.IS_BONUS_GROWTH_EGG) {
      if (bonus > 0) {
        try {
          txSend = await suiLib.transferSui(
            config.ADMIN_BONUS_SUI_PRIVATE_KEY,
            [{ amount: bonus * 10 ** 9, address: pet.publicAddress }]
          );
          await adminNotiDb.create({
            type: 'bonus',
            message: `User ${pet.publicAddress} has been got ${bonus} bonus !`,
            status: 'pending',
          });
        } catch (e) {
          console.log('Error send bonus');
        }
      }
    }

    await petDb.updateOne(
      { _id: pet._id },
      {
        status: petConfig.PET_STATUS.PET,
        level: petConfig.PET_LEVEL.ZERO,
        stage: petConfig.PET_STAGE.EAT,
        stageIndex: 0,
        nextActionTime: dateFns.addHours(
          new Date(),
          petConfig.PET_ACTIVITY_TIME_IN_HOUR
        ),
        prevActionTime: new Date(),
        pps: 0,
        growthBonus: {
          isRead: false,
          value: bonus,
          txHash: txSend?.digest,
        },
      }
    );
  }
};

petService.getMyPet = async ({ publicAddress }) => {
  let pets = await petDb
    .find({
      publicAddress,
    })
    .sort({ position: 1 })
    .lean();
  if (!pets.length) {
    const createData = petConfig.PET_POSITION.map((position) => {
      // const types = Object.values(petConfig.PET_TYPE);
      // const type = types[Math.floor(Math.random() * types.length)];
      return {
        publicAddress,
        position,
        status:
          position === 0
            ? petConfig.PET_STATUS.AVAILABLE
            : petConfig.PET_STATUS.NEED_TO_BUY,
      };
    });

    pets = await petDb.create(createData);
  }
  return pets;
};

petService.getPetDetail = async ({ publicAddress, petId }) => {
  const pet = await petDb.findOne({ _id: petId, publicAddress }).lean();
  const fusions = await petFusionDb.find({
    receivePetId: petId,
    isReset: false,
  });
  const givePetId = fusions.map((item) => item.givePetId);
  const matchingPetId = [...new Set(givePetId)];

  if (!pet) {
    throw new AppError(
      ERROR_CODES.ERR_BAD_REQUEST,
      'Sorry, cannot find this pet!'
    );
  }
  let isFreeItemTime = true;

  const startOfToday = dateFns.startOfToday();
  if (pet.freeItemCheckTime && pet.freeItemCheckTime > startOfToday) {
    isFreeItemTime = false;
  }

  if (pet.status === petConfig.PET_STATUS.PET) {
    const buff = eggConfig.RARITY_BUFF[pet.origin][pet.rarity];
    const { pps } = petHelper.calculatePps({
      level: pet.level,
      pps: pet.pps,
      prevActionTime: pet.prevActionTime,
      checkTime: new Date(
        Math.min(new Date().getTime(), pet.nextActionTime.getTime())
      ),
      buff,
    });

    return { ...pet, matchingPetId, isFreeItemTime, currentPps: pps };
  }
  return { ...pet, matchingPetId, isFreeItemTime, currentPps: pet.pps };
};

petService.buyItem = async ({ itemNumber, publicAddress, name, txHash }) => {
  let price = petConfig.FOOD_CONFIG[name]?.price;
  if (!price) {
    price = petConfig.TOILET_CONFIG[name]?.price;
  }
  if (!price) {
    price = petConfig.ENTERTAINMENT_CONFIG[name]?.price;
  }

  if (!price) {
    throw new AppError(ERROR_CODES.ERR_BAD_REQUEST, 'Unable to buy this item!');
  }

  const ppsAmount = price * itemNumber;
  const amount = petConfig.BUY_ITEM_FEE_IN_SUI * itemNumber;

  const user = await userDb.findOne({ publicAddress });
  if (user.pps < ppsAmount) {
    throw new AppError(
      ERROR_CODES.ERR_BAD_REQUEST,
      'Sorry, you do not have enough money!'
    );
  }
  await buyItemDb.create({
    publicAddress,
    name,
    txHash,
    itemNumber,
    ppsAmount,
    amount,
    priceUnit: price,
    status: petConfig.BUY_ITEM_STATUS.WAITING_TO_CHECK,
  });
};

petService.checkBuyItem = async () => {
  const buyPendings = await buyItemDb
    .find({
      status: petConfig.BUY_ITEM_STATUS.WAITING_TO_CHECK,
    })
    .sort({ _id: -1 });

  for (const buyPending of buyPendings) {
    const tx = await suiLib.getTransaction(buyPending.txHash);
    if (!tx) continue;

    if (tx.effects.status.status === 'success') {
      const fromInfo = tx?.balanceChanges?.find(
        (item) =>
          item.coinType === '0x2::sui::SUI' &&
          item?.owner?.AddressOwner === buyPending.publicAddress
      );
      const toInfo = tx?.balanceChanges?.find(
        (item) =>
          item.coinType === '0x2::sui::SUI' &&
          Number(item.amount) > 0 &&
          item?.owner?.AddressOwner === config.ADMIN_WALLET_ADDRESS
      );
      const user = await userDb.findOne({
        publicAddress: buyPending.publicAddress,
      });
      if (
        tx?.balanceChanges &&
        fromInfo &&
        toInfo &&
        suiUtil.convertToSui(toInfo.amount) === buyPending.amount &&
        user.pps >= buyPending.ppsAmount
      ) {
        await mongoDbSessionAutoWrap(async (session) => {
          await userDb.updateOne(
            { publicAddress: buyPending.publicAddress },
            {
              $inc: {
                pps: -buyPending.ppsAmount,
                [`items.${buyPending.name}`]: buyPending.itemNumber,
              },
            },
            { session }
          );
          await buyItemDb.updateOne(
            { _id: buyPending._id },
            { status: petConfig.BUY_ITEM_STATUS.SUCCESS },
            { session }
          );
        });
        continue;
      }
    }

    await buyItemDb.updateOne(
      { _id: buyPending._id },
      { status: petConfig.BUY_ITEM_STATUS.FAIL }
    );
  }
};

petService.doActivity = async ({ publicAddress, petId, name }) => {
  const [user, pet] = await Promise.all([
    userDb.findOne({ publicAddress }),
    petDb.findOne({ _id: petId }),
  ]);

  if (!user.items[name]) {
    throw new AppError(
      ERROR_CODES.ERR_BAD_REQUEST,
      'You have not enough item!'
    );
  }

  if (pet.status !== petConfig.PET_STATUS.PET) {
    throw new AppError(ERROR_CODES.ERR_BAD_REQUEST, `Cannot use ${name}!`);
  }

  if (pet.nextActionTime > new Date()) {
    throw new AppError(
      ERROR_CODES.ERR_BAD_REQUEST,
      'Thank you for taking care of me. Have a nice day!'
    );
  }

  if (!petConfig.LEVEL_MAP_ITEM[pet.level].includes(name)) {
    throw new AppError(
      ERROR_CODES.ERR_BAD_REQUEST,
      'Cannot use this item at this level!'
    );
  }

  let activity;
  let itemType;
  // food
  if (Object.values(petConfig.FOOD_NAME).includes(name)) {
    if (pet.stage !== petConfig.PET_STAGE.EAT) {
      throw new AppError(ERROR_CODES.ERR_BAD_REQUEST, `Cannot use ${name}!`);
    }
    activity = petConfig.ACTIVITY.EAT;
    itemType = petConfig.ITEM_TYPE.FOOD;
  }

  // toilet
  if (Object.values(petConfig.TOILET_NAME).includes(name)) {
    if (pet.stage !== petConfig.PET_STAGE.TOILET) {
      throw new AppError(ERROR_CODES.ERR_BAD_REQUEST, `Cannot use ${name}!`);
    }
    activity = petConfig.ACTIVITY.TOILET;
    itemType = petConfig.ITEM_TYPE.TOILET;
  }

  // entertainment
  if (Object.values(petConfig.ENTERTAINMENT_NAME).includes(name)) {
    if (pet.stage !== petConfig.PET_STAGE.ENTERTAINMENT) {
      throw new AppError(ERROR_CODES.ERR_BAD_REQUEST, `Cannot use ${name}!`);
    }
    activity = petConfig.ACTIVITY.ENTERTAINMENT;
    itemType = petConfig.ITEM_TYPE.ENTERTAINMENT;
  }

  await mongoDbSessionAutoWrap(async (session) => {
    await petActivityDb.create(
      [
        {
          publicAddress,
          petId,
          activity,
          activityDetail: name,
          status: petConfig.ACTIVITY_STATUS.SUCCESS,
        },
      ],
      { session }
    );
    await userDb.updateOne(
      { publicAddress },
      { $inc: { [`items.${name}`]: -1 } },
      { session }
    );
    await petHelper.doActivity({
      publicAddress,
      pet,
      itemType,
      itemName: name,
      session,
    });
  });
};

petService.harvest = async ({ publicAddress, petId, pps }) => {
  const pet = await petDb.findOne({ _id: petId, publicAddress });
  const buff = eggConfig.RARITY_BUFF[pet.origin][pet.rarity];

  if (pps <= pet.pps) {
    await mongoDbSessionAutoWrap(async (session) => {
      await petDb.updateOne(
        { _id: petId },
        {
          $inc: {
            pps: -pps,
          },
        },
        { session }
      );
      await petActivityDb.create(
        [
          {
            publicAddress,
            petId,
            activity: petConfig.ACTIVITY.HARVEST,
            amountType: petConfig.AMOUNT_TYPE.PPS,
            amount: pps,
            status: petConfig.ACTIVITY_STATUS.PENDING,
          },
        ],
        { session }
      );
      await userDb.updateOne({ publicAddress }, { $inc: { pps } }, { session });
      await petHelper.updateUserRank({ publicAddress, pps, session });
    });
  } else {
    const checkTime =
      new Date() < pet.nextActionTime ? new Date() : pet.nextActionTime;
    const { pps: totalPps, prevActionTime } = petHelper.calculatePps({
      level: pet.level,
      pps: pet.pps,
      prevActionTime: pet.prevActionTime,
      checkTime,
      petStage: pet.stage,
      buff,
    });

    if (pps > totalPps) {
      throw new AppError(
        ERROR_CODES.ERR_BAD_REQUEST,
        'All PPS tokens have been collected!'
      );
    }

    const ppsRest = totalPps - pps;
    await mongoDbSessionAutoWrap(async (session) => {
      await petDb.updateOne(
        { _id: petId },
        {
          $set: {
            pps: ppsRest,
            prevActionTime,
          },
        },
        { session }
      );
      await petActivityDb.create(
        [
          {
            publicAddress,
            petId,
            activity: petConfig.ACTIVITY.HARVEST,
            amountType: petConfig.AMOUNT_TYPE.PPS,
            amount: pps,
            status: petConfig.ACTIVITY_STATUS.SUCCESS,
          },
        ],
        { session }
      );
      await userDb.updateOne({ publicAddress }, { $inc: { pps } }, { session });
      await petHelper.updateUserRank({ publicAddress, pps, session });
    });
  }

  return { pps };
};

// petService.rewardHarvest = async () => {
//   const pendings = await petActivityDb
//     .find({
//       activity: petConfig.ACTIVITY.HARVEST,
//       status: petConfig.ACTIVITY_STATUS.PENDING,
//     })
//     .sort({ _id: -1 });

//   for (const pending of pendings) {
//     const value = pending.amount;
//     if (value) {
//       const txHash = await web3Lib.transferPps(value, pending.publicAddress);
//       await petActivityDb.updateOne(
//         { _id: pending._id },
//         { status: petConfig.ACTIVITY_STATUS.SENDING, txHash }
//       );
//     }
//   }
// };

// petService.checkRewardStatus = async () => {
//   const sendings = await petActivityDb
//     .find({
//       activity: petConfig.ACTIVITY.HARVEST,
//       status: petConfig.ACTIVITY_STATUS.SENDING,
//     })
//     .sort({ _id: -1 });

//   for (const sending of sendings) {
//     const receipt = await web3Lib.getTransactionReceipt(sending.txHash);
//     if (receipt && receipt.status) {
//       await petActivityDb.updateOne(
//         { _id: sending._id },
//         { status: petConfig.ACTIVITY_STATUS.SUCCESS }
//       );
//     } else if (receipt && !receipt.status) {
//       await petActivityDb.updateOne(
//         { _id: sending._id },
//         {
//           $set: { status: petConfig.ACTIVITY_STATUS.PENDING },
//           $inc: { retrySend: 1 },
//         }
//       );
//     }
//   }
// };

petService.getPetConfig = async () => {
  return {
    levelConfig: petConfig.PET_LEVEL_POINT,
    ppsSpeed: petConfig.PET_EARN_PPS_PER_DAY,
    growthEggTimeInHour: petConfig.GROWTH_TIME_IN_HOUR,
    activityTimeInHour: petConfig.PET_ACTIVITY_TIME_IN_HOUR,
    numberDayToDie: petConfig.NUMBER_DAY_TO_DIE,
    petSlotPrice: petConfig.PET_SLOT_PRICE,
    resetPetPrice: petConfig.RESET_PET_PRICE,
    resetPetDiePrice: petConfig.RESET_PET_DIE_PRICE,
    activeFusionPrice: fusionConfig.ACTIVE_FUSION_PRICE,
    autoActivityPrice: petConfig.AUTO_ACTION_PRICE,
    buyItemFeeInSui: petConfig.BUY_ITEM_FEE_IN_SUI,
    timeToFusionInHour: fusionConfig.TIME_TO_FUSION_IN_HOUR,
    fusionFeeRate: fusionConfig.FEE_RATE,
    levelMapItem: petConfig.LEVEL_MAP_ITEM,
    growthEggBonus: petConfig.BONUS_GROWTH_EGG.map((item) => item.value),
  };
};

petService.getLeaderBoard = async (publicAddress) => {
  const { weekSeason, monthSeason } = await petHelper.getSeason();
  const [weekLeaderBoard, monthLeaderBoard, myWeek, myMonth] =
    await Promise.all([
      userRankDb
        .find({
          seasonType: weekSeason.type,
          seasonNumber: weekSeason.seasonNumber,
        })
        .sort({ pps: -1 })
        .limit(100)
        .lean(),
      userRankDb
        .find({
          seasonType: monthSeason.type,
          seasonNumber: monthSeason.seasonNumber,
        })
        .sort({ pps: -1 })
        .limit(100)
        .lean(),
      userRankDb
        .findOne({
          publicAddress,
          seasonNumber: weekSeason.seasonNumber,
          seasonType: weekSeason.type,
        })
        .lean(),
      userRankDb
        .findOne({
          publicAddress,
          seasonNumber: monthSeason.seasonNumber,
          seasonType: monthSeason.type,
        })
        .lean(),
    ]);

  const [myWeekRank, myMonthRank] = await Promise.all([
    userRankDb.countDocuments({
      seasonType: weekSeason.type,
      seasonNumber: weekSeason.seasonNumber,
      pps: { $gt: myWeek?.pps || 0 },
    }),
    userRankDb.countDocuments({
      seasonType: monthSeason.type,
      seasonNumber: monthSeason.seasonNumber,
      pps: { $gt: myMonth?.pps || 0 },
    }),
  ]);

  // const weekUsers = await Promise.all(
  //   weekLeaderBoard.map((item) =>
  //     userDb.findOne({ publicAddress: item.publicAddress }).lean()
  //   )
  // );

  // const monthUsers = await Promise.all(
  //   monthLeaderBoard.map((item) =>
  //     userDb.findOne({ publicAddress: item.publicAddress }).lean()
  //   )
  // );

  return {
    weekLeaderBoard: weekLeaderBoard.map((item, index) => ({
      ...item,
      pps: Math.floor(item.pps),
      // publicAddress: weekUsers[index].publicAddress,
    })),
    monthLeaderBoard: monthLeaderBoard.map((item, index) => ({
      ...item,
      pps: Math.floor(item.pps),
      // publicAddress: monthUsers[index].publicAddress,
    })),
    myWeekRank,
    myMonthRank,
    myWeekPps: Math.floor(myWeek?.pps || 0),
    myMonthPps: Math.floor(myMonth?.pps || 0),
    weekSeason,
    monthSeason,
  };
};

petService.getPriceConfig = async () => {
  return {
    foodConfig: petConfig.FOOD_CONFIG_CLIENT,
    toiletConfig: petConfig.TOILET_CONFIG_CLIENT,
    entertainmentConfig: petConfig.ENTERTAINMENT_CONFIG_CLIENT,
  };
};

petService.checkDiePet = async () => {
  logger.info('Start checkDiePet');
  const checkTime = dateFns.subDays(new Date(), petConfig.NUMBER_DAY_TO_DIE);
  const pets = await petDb.find({
    status: petConfig.PET_STATUS.PET,
    handleStatus: { $ne: 'admin' },
    prevActionTime: { $lt: checkTime },
  });

  for (const pet of pets) {
    const buff = eggConfig.RARITY_BUFF[pet.origin][pet.rarity];
    const checkTime =
      new Date() < pet.nextActionTime ? new Date() : pet.nextActionTime;
    const { earnPps, prevActionTime } = petHelper.calculatePps({
      level: pet.level,
      pps: pet.pps,
      prevActionTime: pet.prevActionTime,
      checkTime,
      petStage: pet.stage,
      buff,
    });
    await petDb.updateOne(
      { _id: pet._id },
      {
        $set: {
          status: petConfig.PET_STATUS.DIE,
          prevActionTime,
          nextActionTime: prevActionTime,
        },
        $inc: { pps: earnPps },
      }
    );
  }
  logger.info('End checkDiePet');
};

petService.activeFusionMode = async ({ publicAddress, txHash, position }) => {
  const pet = await petDb.findOne({ publicAddress, position });

  if (pet.level < fusionConfig.LEVEL_TO_FUSION) {
    throw new AppError(
      ERROR_CODES.ERR_BAD_REQUEST,
      'Sorry, your pet has not reached the level required for fusion!'
    );
  }

  await activeFusionModeDb.create({
    publicAddress,
    position,
    amount: fusionConfig.ACTIVE_FUSION_PRICE,
    status: petConfig.ACTIVE_FUSION_MODE_STATUS.WAITING_TO_CHECK,
    txHash,
  });
};

petService.checkActiveFusionMode = async () => {
  const buyPendings = await activeFusionModeDb
    .find({
      status: petConfig.ACTIVE_FUSION_MODE_STATUS.WAITING_TO_CHECK,
    })
    .sort({ _id: -1 });

  for (const buyPending of buyPendings) {
    const tx = await suiLib.getTransaction(buyPending.txHash);
    if (!tx) continue;

    if (tx.effects.status.status === 'success') {
      const fromInfo = tx?.balanceChanges?.find(
        (item) =>
          item.coinType === '0x2::sui::SUI' &&
          item?.owner?.AddressOwner === buyPending.publicAddress
      );
      const toInfo = tx?.balanceChanges?.find(
        (item) =>
          item.coinType === '0x2::sui::SUI' &&
          Number(item.amount) > 0 &&
          item?.owner?.AddressOwner === config.ADMIN_WALLET_ADDRESS
      );

      if (
        !tx?.balanceChanges ||
        (fromInfo &&
          toInfo &&
          suiUtil.convertToSui(toInfo.amount) === buyPending.amount)
      ) {
        await mongoDbSessionAutoWrap(async (session) => {
          await activeFusionModeDb.updateOne(
            { _id: buyPending._id },
            { status: petConfig.ACTIVE_FUSION_MODE_STATUS.SUCCESS },
            { session }
          );
          await petDb.updateOne(
            {
              publicAddress: buyPending.publicAddress,
              position: buyPending.position,
            },
            { $set: { 'fusion.isActive': true } },
            { session }
          );
          try {
            await adminNotiDb.create({
              type: 'active-fusion',
              message: `User ${buyPending.publicAddress} has activated fusion mode`,
              status: 'pending',
            });
          } catch (e) {
            console.log('Error activating fusion mode');
          }
        });
        continue;
      }
    }

    await activeFusionModeDb.updateOne(
      { _id: buyPending._id },
      { status: petConfig.ACTIVE_FUSION_MODE_STATUS.FAIL }
    );
  }
};

petService.resetPet = async ({ publicAddress, txHash, position }) => {
  const pet = await petDb.findOne({ publicAddress, position });

  if (pet.origin !== eggConfig.ORIGIN.GENESIS) {
    throw new AppError(
      ERROR_CODES.ERR_BAD_REQUEST,
      'Sorry, only genesis pet can be reset!'
    );
  }

  let amount = petConfig.RESET_PET_PRICE;
  if (pet.status === petConfig.PET_STATUS.DIE) {
    amount = petConfig.RESET_PET_DIE_PRICE;
  }

  await resetPetDb.create({
    publicAddress,
    position,
    eggId: pet.eggId,
    amount,
    status: petConfig.RESET_PET_STATUS.WAITING_TO_CHECK,
    txHash,
  });
};

petService.checkResetPet = async () => {
  const buyPendings = await resetPetDb
    .find({
      status: petConfig.RESET_PET_STATUS.WAITING_TO_CHECK,
    })
    .sort({ _id: -1 });

  for (const buyPending of buyPendings) {
    const tx = await suiLib.getTransaction(buyPending.txHash);
    if (!tx) continue;

    if (tx?.effects.status.status === 'success') {
      const fromInfo = tx?.balanceChanges?.find(
        (item) =>
          item.coinType === '0x2::sui::SUI' &&
          item?.owner?.AddressOwner === buyPending.publicAddress
      );
      const toInfo = tx?.balanceChanges?.find(
        (item) =>
          item.coinType === '0x2::sui::SUI' &&
          Number(item.amount) > 0 &&
          item?.owner?.AddressOwner === config.ADMIN_WALLET_ADDRESS
      );

      if (
        !tx?.balanceChanges ||
        (fromInfo &&
          toInfo &&
          suiUtil.convertToSui(toInfo.amount) === buyPending.amount)
      ) {
        const pet = await petDb.findOne({
          publicAddress: buyPending.publicAddress,
          position: buyPending.position,
        });
        await mongoDbSessionAutoWrap(async (session) => {
          await resetPetDb.updateOne(
            { _id: buyPending._id },
            { status: petConfig.RESET_PET_STATUS.SUCCESS },
            { session }
          );
          await eggDb.updateMany(
            {
              _id: buyPending.eggId,
            },
            { status: eggConfig.EGG_STATUS.ACTIVE },
            { session }
          );
          await petFusionDb.updateMany(
            {
              receivePetId: pet._id.toString(),
              isReset: false,
              // $or: [
              //   { receivePetId: pet._id.toString(), isReset: false },
              //   { givePetId: pet._id.toString(), isReset: false },
              // ],
            },
            { $set: { isReset: true } },
            { session }
          );
          await petDb.updateMany(
            {
              publicAddress: buyPending.publicAddress,
              position: buyPending.position,
            },
            {
              $unset: {
                type: '',
                level: '',
                point: '',
                stage: '',
                stageIndex: '',
                nextActionTime: '',
                prevActionTime: '',
                growthTime: '',
                name: '',
                eggId: '',
                rarity: '',
                origin: '',
                freeItemCheckTime: '',
              },
              $set: {
                pps: 0,
                status: petConfig.PET_STATUS.AVAILABLE,
                isActiveAuto: false,
                fusion: {
                  isActive: false,
                  amount: 0,
                  numberEgg: 0,
                  isGiveMode: false,
                },
                growthBonus: {
                  isRead: false,
                  value: 0,
                },
              },
            },
            { session }
          );
          await userDb.updateOne(
            { publicAddress: buyPending.publicAddress },
            { $inc: { pps: pet.pps } },
            { session }
          );
        });
        continue;
      }
    }

    await activeFusionModeDb.updateOne(
      { _id: buyPending._id },
      { status: petConfig.ACTIVE_FUSION_MODE_STATUS.FAIL }
    );
  }
};

petService.openGiveMode = async ({ publicAddress, position, amount }) => {
  const pet = await petDb.findOne({ publicAddress, position });

  if (!pet.fusion.isActive) {
    throw new AppError(
      ERROR_CODES.ERR_BAD_REQUEST,
      'Sorry, you need to enable fusion mode!'
    );
  }

  await petDb.updateOne(
    { _id: pet._id },
    {
      $set: {
        'fusion.isGiveMode': true,
        'fusion.amount': amount,
      },
    }
  );
};

petService.cancelGiveMode = async ({ publicAddress, position }) => {
  const pet = await petDb.findOne({ publicAddress, position });

  if (!pet.fusion.isGiveMode) {
    throw new AppError(ERROR_CODES.ERR_BAD_REQUEST, 'Invalid action!');
  }

  await petDb.updateOne(
    { _id: pet._id },
    {
      $set: {
        'fusion.isGiveMode': false,
        'fusion.amount': 0,
      },
    }
  );
};

petService.fusion = async ({
  publicAddress,
  receivePetId,
  givePetId,
  txHash,
}) => {
  const [receivePet, givePet, checkTxHash, checkPending, checkReset] =
    await Promise.all([
      petDb.findOne({ publicAddress, _id: receivePetId }),
      petDb.findOne({ _id: givePetId }),
      petFusionDb.findOne({ txHash }),
      petFusionDb.findOne({
        givePetId,
        status: petConfig.FUSION_STATUS.WAITING_TO_CHECK,
      }),
      petFusionDb.findOne({
        receivePetId,
        givePetId,
        isReset: false,
      }),
    ]);

  if (
    receivePet.status !== petConfig.PET_STATUS.PET ||
    givePet.status !== petConfig.PET_STATUS.PET
  ) {
    throw new AppError(ERROR_CODES.ERR_BAD_REQUEST, 'Invalid status');
  }
  if (checkTxHash) {
    throw new AppError(ERROR_CODES.ERR_BAD_REQUEST, 'Invalid transaction');
  }

  if (checkPending) {
    throw new AppError(ERROR_CODES.ERR_BAD_REQUEST, 'Invalid action');
  }

  if (!receivePet.fusion.isActive) {
    throw new AppError(
      ERROR_CODES.ERR_BAD_REQUEST,
      'Sorry, you need to enable fusion mode!'
    );
  }

  if (!petHelper.checkTimeToFusion(receivePet.fusion)) {
    throw new AppError(ERROR_CODES.ERR_BAD_REQUEST, 'Sorry, you need to wait!');
  }

  if (checkReset) {
    throw new AppError(
      ERROR_CODES.ERR_BAD_REQUEST,
      'Sorry, You have already matched with this pet!'
    );
  }

  if (receivePet.type !== givePet.type) {
    throw new AppError(
      ERROR_CODES.ERR_BAD_REQUEST,
      'Sorry, you need to choose the same type!'
    );
  }

  if (!givePet.fusion.isActive || !givePet.fusion.isGiveMode) {
    throw new AppError(
      ERROR_CODES.ERR_BAD_REQUEST,
      'Sorry, you need to enable fusion mode!'
    );
  }

  await petFusionDb.create({
    publicAddress,
    givePublicAddress: givePet.publicAddress,
    receivePetId,
    receivePetRarity: receivePet.rarity,
    givePetId: givePetId,
    givePetRarity: givePet.rarity,
    amount: givePet.fusion.amount,
    status: petConfig.FUSION_STATUS.WAITING_TO_CHECK,
    txHash,
  });
};

petService.checkFusion = async () => {
  const buyPendings = await petFusionDb
    .find({
      status: petConfig.FUSION_STATUS.WAITING_TO_CHECK,
    })
    .sort({ _id: -1 });

  for (const buyPending of buyPendings) {
    const tx = await suiLib.getTransaction(buyPending.txHash);
    if (!tx) continue;

    if (tx.effects.status.status === 'success') {
      const fromInfo = tx?.balanceChanges?.find(
        (item) =>
          item.coinType === '0x2::sui::SUI' &&
          item?.owner?.AddressOwner === buyPending.publicAddress
      );
      const toInfo = tx?.balanceChanges?.find(
        (item) =>
          item.coinType === '0x2::sui::SUI' &&
          Number(item.amount) > 0 &&
          item?.owner?.AddressOwner === config.ADMIN_WALLET_ADDRESS
      );
      if (
        !tx?.balanceChanges ||
        (fromInfo &&
          toInfo &&
          suiUtil.convertToSui(toInfo.amount) === buyPending.amount)
      ) {
        const rarity = petHelper.fusionRarity(
          buyPending.receivePetRarity,
          buyPending.givePetRarity
        );
        // const types = Object.values(petConfig.PET_TYPE);

        const giveAmount = Math.floor(
          (1 - fusionConfig.FEE_RATE) * buyPending.amount * 10 ** 9
        );
        await mongoDbSessionAutoWrap(async (session) => {
          const pet = await petDb.findOne({ _id: buyPending.receivePetId });
          const eggId = new mongoose.Types.ObjectId();
          await suiLib.transferSui(config.ADMIN_PRIVATE_KEY, [
            { amount: giveAmount, address: buyPending.givePublicAddress },
          ]);
          await petFusionDb.updateOne(
            { _id: buyPending._id },
            { status: petConfig.FUSION_STATUS.SUCCESS, eggId },
            { session }
          );
          await petDb.updateOne(
            { _id: buyPending.receivePetId },
            {
              // $push: { 'fusion.matchingAddress': buyPending.givePublicAddress },
              $set: { 'fusion.checkTime': new Date() },
              $inc: { 'fusion.numberEgg': 1 },
            },
            { session }
          );
          // await petDb.updateOne(
          //   { _id: buyPending.givePetId },
          //   {
          //     $set: { 'fusion.isGiveMode': false, 'fusion.amount': 0 },
          //   },
          //   { session }
          // );
          await eggDb.create(
            [
              {
                _id: eggId,
                publicAddress: buyPending.publicAddress,
                origin: eggConfig.ORIGIN.NORMAL,
                rarity,
                status: eggConfig.EGG_STATUS.ACTIVE,
                petType: pet.type,
              },
            ],
            { session }
          );
        });
        continue;
      }
    }

    await petFusionDb.updateOne(
      { _id: buyPending._id },
      { status: petConfig.FUSION_STATUS.FAIL }
    );
  }
};

petService.activeAuto = async ({ publicAddress, position, txHash }) => {
  const pet = await petDb.findOne({ publicAddress, position });

  if (!pet || pet.isActiveAuto) {
    throw new AppError(
      ERROR_CODES.ERR_BAD_REQUEST,
      'Sorry, You have enabled this mode.'
    );
  }

  await activeAutoDb.create({
    publicAddress,
    position,
    amount: petConfig.AUTO_ACTION_PRICE,
    status: petConfig.AUTO_STATUS.WAITING_TO_CHECK,
    txHash,
  });
};

petService.checkActiveAuto = async () => {
  const buyPendings = await activeAutoDb
    .find({
      status: 'waiting-to-check',
    })
    .sort({ _id: -1 });

  for (const buyPending of buyPendings) {
    const tx = await suiLib.getTransaction(buyPending.txHash);
    if (!tx) continue;

    if (tx?.effects?.status.status === 'success') {
      const fromInfo = tx?.balanceChanges?.find(
        (item) =>
          item.coinType === '0x2::sui::SUI' &&
          item?.owner?.AddressOwner === buyPending.publicAddress
      );
      const toInfo = tx?.balanceChanges?.find(
        (item) =>
          item.coinType === '0x2::sui::SUI' &&
          Number(item.amount) > 0 &&
          item?.owner?.AddressOwner === config.ADMIN_WALLET_ADDRESS
      );

      if (
        !tx?.balanceChanges ||
        (fromInfo &&
          toInfo &&
          suiUtil.convertToSui(toInfo.amount) === buyPending.amount)
      ) {
        await mongoDbSessionAutoWrap(async (session) => {
          await activeAutoDb.updateOne(
            { _id: buyPending._id },
            { $set: { status: petConfig.AUTO_STATUS.SUCCESS } },
            { session }
          );
          await petDb.updateOne(
            {
              publicAddress: buyPending.publicAddress,
              position: buyPending.position,
            },
            {
              isActiveAuto: true,
            },
            { session }
          );

          try {
            await adminNotiDb.create({
              type: 'auto-care',
              message: `User ${buyPending.publicAddress} has activated auto-care`,
              status: 'pending',
            });
          } catch (e) {
            console.log('Error auto-care');
          }
        });
        continue;
      }
    }

    await activeAutoDb.updateOne(
      { _id: buyPending._id },
      { $set: { status: petConfig.AUTO_STATUS.FAIL } }
    );
  }
};

petService.autoAction = async () => {
  const pets = await petDb
    .find({
      isActiveAuto: true,
      isOpenAuto: true,
      status: petConfig.PET_STATUS.PET,
      nextActionTime: { $lt: new Date() },
    })
    .lean();
  const groupedPets = lodash.groupBy(pets, 'publicAddress');

  await PromisePool.withConcurrency(5)
    .for(Object.values(groupedPets))
    .process(async (groupedPets) => {
      const user = await userDb.findOne({
        publicAddress: groupedPets[0].publicAddress,
      });

      for (const pet of groupedPets) {
        let itemName;
        if (pet.stage === petConfig.PET_STAGE.EAT) {
          itemName = Object.values(petConfig.FOOD_NAME)
            .reverse()
            .find((name) => user.items[name] && user.items[name] > 0);
        }

        if (pet.stage === petConfig.PET_STAGE.TOILET) {
          itemName = Object.values(petConfig.TOILET_NAME)
            .reverse()
            .find((name) => user.items[name] && user.items[name] > 0);
        }

        if (pet.stage === petConfig.PET_STAGE.ENTERTAINMENT) {
          itemName = Object.values(petConfig.ENTERTAINMENT_NAME)
            .reverse()
            .find((name) => user.items[name] && user.items[name] > 0);
        }

        if (itemName) {
          try {
            await petService.doActivity({
              publicAddress: groupedPets[0].publicAddress,
              petId: pet._id.toString(),
              name: itemName,
            });
            user.items[itemName]--;
          } catch (error) {
            logger.log('autoAction', pet, error);
          }
        }
      }
    });
};

petService.getPetFusionDetail = async ({ petId }) => {
  const [pet, fusionHistory] = await Promise.all([
    petDb.findOne({ _id: petId }, { __v: 0 }).lean(),
    petFusionDb
      .find(
        {
          $or: [{ receivePetId: petId }, { givePetId: petId }],
        },
        { __v: 0 }
      )
      .sort({ _id: -1 })
      .lean(),
  ]);

  if (!pet) {
    throw new AppError(ERROR_CODES.ERR_BAD_REQUEST, 'Pet not found!');
  }

  return {
    ...pet,
    fusionHistory: fusionHistory.map((item) => ({
      ...item,
      receivePublicAddress: item.publicAddress,
    })),
  };
};

petService.getPetFusionList = async ({
  publicAddress,
  rarities,
  priceSort = -1,
  offset,
  limit,
  petType,
}) => {
  const query = {
    publicAddress: { $ne: publicAddress },
    status: petConfig.PET_STATUS.PET,
    'fusion.isGiveMode': true,
  };
  if (rarities) {
    query.rarity = { $in: rarities };
  }

  if (petType) {
    query.type = petType;
  }

  const [pets, total] = await Promise.all([
    petDb
      .find(query)
      .sort({ 'fusion.amount': priceSort })
      .skip(offset)
      .limit(limit)
      .lean(),
    petDb.countDocuments(query),
  ]);
  return {
    data: pets,
    total,
  };
};

petService.claimFreeItem = async ({ publicAddress, petId }) => {
  const pet = await petDb.findOne({ publicAddress, _id: petId });

  if (
    !pet ||
    pet.status !== petConfig.PET_STATUS.PET ||
    pet.level > petConfig.LEVEL_TO_CLAIM_FREE_ITEM
  ) {
    throw new AppError(
      ERROR_CODES.ERR_BAD_REQUEST,
      'Sorry, Unable to claim free item!'
    );
  }

  const startOfToday = dateFns.startOfToday();
  if (pet.freeItemCheckTime && pet.freeItemCheckTime > startOfToday) {
    throw new AppError(ERROR_CODES.ERR_BAD_REQUEST, 'Sorry, You need to wait!');
  }

  await mongoDbSessionAutoWrap(async (session) => {
    await petDb.updateOne(
      { _id: petId },
      { freeItemCheckTime: new Date() },
      { session }
    );
    await userDb.updateOne(
      { publicAddress: pet.publicAddress },
      {
        $inc: {
          [`items.${petConfig.FOOD_NAME.CARROT}`]:
            petConfig.FREE_ITEM_FOOD_AMOUNT,
          [`items.${petConfig.TOILET_NAME.RAINBOW}`]:
            petConfig.FREE_ITEM_TOILET_AMOUNT,
          [`items.${petConfig.ENTERTAINMENT_NAME.SLEEP}`]:
            petConfig.FREE_ITEM_ENTERTAINMENT_AMOUNT,
        },
      },
      { session }
    );
  });
};

petService.petIncommingDie = async () => {
  const checkTime = dateFns.subSeconds(
    new Date(),
    petConfig.NUMBER_DAY_TO_DIE * 86400 - 20 * 60
  );

  const petIncomingDies = await petDb.find({
    status: 'pet',
    prevActionTime: { $lt: checkTime },
  });

  const publicAddresses = petIncomingDies.map((item) => item.publicAddress);
  const users = await userDb.find({ publicAddress: { $in: publicAddresses } });
  let chatIds = users.map((item) => item.chatId);
  chatIds = [...new Set(chatIds)];

  const chunks = lodash.chunk(chatIds, 10);
  for (const chatIds of chunks) {
    await sendToAllChats(
      chatIds,

      'Your pet is about to die. Please check and take care of it!'
    );
    await timeoutAwait(2);
  }
};
