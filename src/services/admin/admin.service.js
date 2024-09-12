const eggDb = require('../../models/egg/eggDb');
const eggConfig = require('../../configs/egg.config');
const petConfig = require('../../configs/pet.config');
const mongoDbSessionAutoWrap = require('../../models/mongoDbSessionAutoWrap');
const userGenDb = require('../../models/user/userGenDb');
const { genAccountFromSeed } = require('../../libs/sui.lib');
const eggOnSaleDb = require('../../models/egg/eggOnSaleDb');
const eggSettingDb = require('../../models/egg/eggSettingDb');
const { ERROR_CODES } = require('../../configs/constant');
const { AppError } = require('../../utils/errors');
const petDb = require('../../models/pet/petDb');
const dateFns = require('date-fns');
const userRankDb = require('../../models/pet/userRankDb');
const petSeasonDb = require('../../models/pet/petSeasonDb');
const randomString = require('random-string');
const userDb = require('../../models/user/userDb');

const adminService = module.exports;

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomFloat(fromValue, toValue, decimalNumber) {
  const random = Math.random() * (toValue - fromValue) + fromValue;
  return parseFloat(random.toFixed(decimalNumber));
}

adminService.eggStatistic = async () => {
  const [
    countNormalEggCommon,
    countNormalEggRare,
    countNormalEggEpic,
    countNormalEggLegend,
    countNormalFreeEggCommon,
    countGenesisEggCommon,
    countGenesisEggRare,
    countGenesisEggEpic,
    countGenesisEggLegend,
    countGenesisFreeEggCommon,
    countGenesisFreeEggRare,
    countGenesisFreeEggEpic,
    countGenesisFreeEggLegend,
  ] = await Promise.all([
    eggDb.countDocuments({
      origin: eggConfig.ORIGIN.NORMAL,
      rarity: eggConfig.RARITY.COMMON,
      isFree: false,
    }),
    eggDb.countDocuments({
      origin: eggConfig.ORIGIN.NORMAL,
      rarity: eggConfig.RARITY.RARE,
      isFree: false,
    }),
    eggDb.countDocuments({
      origin: eggConfig.ORIGIN.NORMAL,
      rarity: eggConfig.RARITY.EPIC,
      isFree: false,
    }),
    eggDb.countDocuments({
      origin: eggConfig.ORIGIN.NORMAL,
      rarity: eggConfig.RARITY.LEGENDARY,
      isFree: false,
    }),
    eggDb.countDocuments({
      origin: eggConfig.ORIGIN.NORMAL,
      rarity: eggConfig.RARITY.COMMON,
      isFree: true,
    }),
    eggDb.countDocuments({
      origin: eggConfig.ORIGIN.GENESIS,
      rarity: eggConfig.RARITY.COMMON,
      isFreeGenesis: false,
    }),
    eggDb.countDocuments({
      origin: eggConfig.ORIGIN.GENESIS,
      rarity: eggConfig.RARITY.RARE,
      isFreeGenesis: false,
    }),
    eggDb.countDocuments({
      origin: eggConfig.ORIGIN.GENESIS,
      rarity: eggConfig.RARITY.EPIC,
      isFreeGenesis: false,
    }),
    eggDb.countDocuments({
      origin: eggConfig.ORIGIN.GENESIS,
      rarity: eggConfig.RARITY.LEGENDARY,
      isFreeGenesis: false,
    }),
    eggDb.countDocuments({
      origin: eggConfig.ORIGIN.GENESIS,
      rarity: eggConfig.RARITY.COMMON,
      isFreeGenesis: true,
    }),
    eggDb.countDocuments({
      origin: eggConfig.ORIGIN.GENESIS,
      rarity: eggConfig.RARITY.RARE,
      isFreeGenesis: true,
    }),
    eggDb.countDocuments({
      origin: eggConfig.ORIGIN.GENESIS,
      rarity: eggConfig.RARITY.EPIC,
      isFreeGenesis: true,
    }),
    eggDb.countDocuments({
      origin: eggConfig.ORIGIN.GENESIS,
      rarity: eggConfig.RARITY.LEGENDARY,
      isFreeGenesis: true,
    }),
  ]);

  return {
    normal: {
      [eggConfig.RARITY.COMMON]: countNormalEggCommon,
      [eggConfig.RARITY.RARE]: countNormalEggRare,
      [eggConfig.RARITY.EPIC]: countNormalEggEpic,
      [eggConfig.RARITY.LEGENDARY]: countNormalEggLegend,
    },
    freeNormal: {
      [eggConfig.RARITY.COMMON]: countNormalFreeEggCommon,
    },
    genesis: {
      [eggConfig.RARITY.COMMON]: countGenesisEggCommon,
      [eggConfig.RARITY.RARE]: countGenesisEggRare,
      [eggConfig.RARITY.EPIC]: countGenesisEggEpic,
      [eggConfig.RARITY.LEGENDARY]: countGenesisEggLegend,
    },
    freeGenesis: {
      [eggConfig.RARITY.COMMON]: countGenesisFreeEggCommon,
      [eggConfig.RARITY.RARE]: countGenesisFreeEggRare,
      [eggConfig.RARITY.EPIC]: countGenesisFreeEggEpic,
      [eggConfig.RARITY.LEGENDARY]: countGenesisFreeEggLegend,
    },
  };
};

adminService.upsertEgg = async ({
  fromIndex,
  toIndex,
  rarity,
  origin,
  petType,
  status,
  fromPrice,
  toPrice,
  isFree,
}) => {
  for (let index = fromIndex; index <= toIndex; index++) {
    let user = await userGenDb.findOne({ index });
    if (!user) {
      const { address, privateKey } = genAccountFromSeed(index);
      user = await userGenDb.create({
        publicAddress: address,
        privateKey,
        index,
      });
    }

    let checkFreeEgg = true;
    const countFree = await eggDb.countDocuments({
      isFreeGenesis: true,
    });
    if (countFree >= eggConfig.MAX_FREE_EGG) checkFreeEgg = false;

    const isFreeGenesis = checkFreeEgg && isFree;

    const deleteEggs = await eggDb.find({
      publicAddress: user.publicAddress,
      status: eggConfig.EGG_STATUS.ONSALE,
    });
    await mongoDbSessionAutoWrap(async (session) => {
      for (const deleteEgg of deleteEggs) {
        await eggDb.deleteOne({ _id: deleteEgg._id }, { session });
        await eggOnSaleDb.deleteOne(
          { eggId: String(deleteEgg._id) },
          { session }
        );
        if (
          deleteEgg.origin === eggConfig.ORIGIN.GENESIS &&
          deleteEgg.isFreeGenesis === false
        ) {
          await eggSettingDb.updateOne(
            {},
            { $inc: { [deleteEgg.rarity]: -1, numberEgg: -1 } },
            { session }
          );
        }
      }
      const [egg] = await eggDb.create(
        [
          {
            publicAddress: user.publicAddress,
            origin,
            rarity,
            status: eggConfig.EGG_STATUS.ONSALE,
            petType,
            isFree: false,
            isFreeGenesis:
              origin === eggConfig.ORIGIN.GENESIS ? isFreeGenesis : false,
            handleStatus: eggConfig.HANDLE_STATUS.ADMIN,
          },
        ],
        { session }
      );
      await eggOnSaleDb.create(
        [
          {
            publicAddress: user.publicAddress,
            eggId: egg._id.toString(),
            origin,
            rarity,
            price: getRandomFloat(fromPrice, toPrice, 1),
            petType,
            status: status,
          },
        ],
        { session }
      );
      if (origin === eggConfig.ORIGIN.GENESIS && isFreeGenesis === false) {
        await eggSettingDb.updateOne(
          {},
          { $inc: { [rarity]: 1, numberEgg: 1 } },
          { upsert: true, session }
        );
      }
    });
  }
};

adminService.rewardEgg = async ({ addressList, rarity, origin, petType }) => {
  for (const address of addressList) {
    let user = await userDb.findOne({ publicAddress: address });
    if (!user) continue;

    await mongoDbSessionAutoWrap(async (session) => {
      await eggDb.create(
        [
          {
            publicAddress: user.publicAddress,
            origin,
            rarity,
            status: eggConfig.EGG_STATUS.ACTIVE,
            petType,
            isFree: false,
            isFreeGenesis: false,
            handleStatus: eggConfig.HANDLE_STATUS.ADMIN,
          },
        ],
        { session }
      );
      await eggSettingDb.updateOne(
        {},
        { $inc: { [rarity]: 1, numberEgg: 1 } },
        { upsert: true, session }
      );
    });
  }
};

adminService.getListEgg = async ({ offset, limit }) => {
  const query = {
    handleStatus: eggConfig.HANDLE_STATUS.ADMIN,
    status: eggConfig.EGG_STATUS.ONSALE,
  };
  const [eggs, total] = await Promise.all([
    eggDb
      .find(query, {
        __v: 0,
        isFree: 0,
        isFreeGenesis: 0,
        handleStatus: 0,
      })
      .sort({ _id: -1 })
      .skip(offset)
      .limit(limit)
      .lean(),
    eggDb.countDocuments(query),
  ]);

  const onsaleItems = eggs.filter(
    (egg) => egg.status === eggConfig.EGG_STATUS.ONSALE
  );

  const onsaleEggs = await eggOnSaleDb
    .find({
      eggId: { $in: onsaleItems.map((item) => item._id.toString()) },
    })
    .lean();

  return {
    data: eggs.map((egg) => {
      if (egg.status === eggConfig.EGG_STATUS.ONSALE) {
        const onsaleItem = onsaleEggs.find(
          (i) => i.eggId === egg._id.toString()
        );
        return { ...egg, price: onsaleItem.price };
      }
      return egg;
    }),
    total,
  };
};

adminService.upsertFusion = async ({
  fromIndex,
  toIndex,
  rarity,
  petType,
  fromPrice,
  toPrice,
}) => {
  const origin = eggConfig.ORIGIN.GENESIS;
  let petIds = [];
  for (let index = fromIndex; index <= toIndex; index++) {
    let user = await userGenDb.findOne({ index });
    if (!user) {
      const { address, privateKey } = genAccountFromSeed(index);
      user = await userGenDb.create({
        publicAddress: address,
        privateKey,
        index,
      });
    }

    await petDb.deleteMany({ publicAddress: user.publicAddress });
    let pet = await petDb.create({
      publicAddress: user.publicAddress,
      position: 0,
      status: petConfig.PET_STATUS.PET,
      eggId: randomString({ length: 10 }),
      name: '',
      rarity,
      origin,
      type: petType,
      growthTime: new Date(),
      pps: 0,
      point: 0,
      isActiveAuto: false,
      fusion: {
        isActive: true,
        amount: getRandomFloat(fromPrice, toPrice, 2),
        numberEgg: 0,
        isGiveMode: true,
      },
      level: 0,
      stage: petConfig.PET_STAGE.EAT,
      stageIndex: 0,
      nextActionTime: dateFns.addHours(
        new Date(),
        petConfig.PET_ACTIVITY_TIME_IN_HOUR
      ),
      prevActionTime: new Date(),
      pps: 0,
      handleStatus: 'admin',
    });

    petIds.push(pet._id.toString());
  }

  return { petIds };
};

adminService.getListFusion = async ({ offset, limit }) => {
  const query = {
    handleStatus: eggConfig.HANDLE_STATUS.ADMIN,
  };
  const [pets, total] = await Promise.all([
    petDb.find(query).sort({ _id: -1 }).skip(offset).limit(limit).lean(),
    petDb.countDocuments(query),
  ]);

  return {
    data: pets.map((item) => ({
      _id: item._id,
      publicAddress: item.publicAddress,
      price: item.fusion.amount,
    })),
    total,
  };
};

adminService.upsertLeaderboard = async ({
  fromIndex,
  toIndex,
  seasonType,
  fromPpsAmount,
  toPpsAmount,
}) => {
  const date = new Date();
  const season = await petSeasonDb.findOne({
    type: seasonType,
    startDate: { $lt: date },
    endDate: { $gt: date },
  });
  if (!season) {
    throw new AppError(ERROR_CODES.ERR_BAD_REQUEST, 'Can not find season');
  }
  for (let index = fromIndex; index <= toIndex; index++) {
    let user = await userGenDb.findOne({ index });
    if (!user) {
      const { address, privateKey } = genAccountFromSeed(index);
      user = await userGenDb.create({
        publicAddress: address,
        privateKey,
        index,
      });
    }

    await userRankDb.updateOne(
      {
        publicAddress: user.publicAddress,
        seasonType: season.type,
        seasonNumber: season.seasonNumber,
      },
      {
        $set: {
          pps: getRandomInt(fromPpsAmount, toPpsAmount),
          origin: 'admin',
        },
      },
      { upsert: true }
    );

    // await mongoDbSessionAutoWrap(async (session) => {});
  }
};

adminService.getListLeaderboard = async ({ seasonType }) => {
  const date = new Date();
  const season = await petSeasonDb.findOne({
    type: seasonType,
    startDate: { $lt: date },
    endDate: { $gt: date },
  });
  if (!season) {
    throw new AppError(ERROR_CODES.ERR_BAD_REQUEST, 'Can not find season');
  }

  const [userRanks, total] = await Promise.all([
    userRankDb
      .find(
        {
          seasonType: season.type,
          seasonNumber: season.seasonNumber,
          origin: 'admin',
        },
        { _id: 0, __v: 0 }
      )
      .sort({ pps: -1 })
      // .skip(offset)
      .limit(100)
      .lean(),
    userRankDb.countDocuments({
      seasonType: season.type,
      seasonNumber: season.seasonNumber,
      origin: 'admin',
    }),
  ]);

  return {
    data: await Promise.all(
      userRanks.map(async (item) => {
        return {
          ...item,
          rank:
            (await userRankDb.countDocuments({
              seasonType: season.type,
              seasonNumber: season.seasonNumber,
              pps: { $gt: item.pps },
            })) + 1,
        };
      })
    ),
    total,
  };
};

adminService.editEggStatus = async ({ eggIds, status }) => {
  const eggs = await eggDb.find({
    _id: { $in: eggIds },
    handleStatus: eggConfig.HANDLE_STATUS.ADMIN,
    status: eggConfig.EGG_STATUS.ONSALE,
  });

  if (!eggs.length) {
    throw new AppError(ERROR_CODES.ERR_BAD_REQUEST, 'Can not edit egg');
  }

  for (const egg of eggs) {
    await eggOnSaleDb.updateOne({ eggId: egg._id }, { status: status });
  }
};

adminService.editEggPrice = async ({ eggIds, fromPrice, toPrice }) => {
  const eggs = await eggDb.find({
    _id: { $in: eggIds },
    handleStatus: eggConfig.HANDLE_STATUS.ADMIN,
    status: eggConfig.EGG_STATUS.ONSALE,
  });

  if (!eggs.length) {
    throw new AppError(ERROR_CODES.ERR_BAD_REQUEST, 'Can not edit egg');
  }

  for (const egg of eggs) {
    await eggOnSaleDb.updateOne(
      { eggId: egg._id },
      { price: getRandomFloat(fromPrice, toPrice, 1) }
    );
  }
};

adminService.editFusionPrice = async ({ petIds, fromPrice, toPrice }) => {
  const pets = await petDb.find({
    _id: { $in: petIds },
    handleStatus: eggConfig.HANDLE_STATUS.ADMIN,
  });

  for (const pet of pets) {
    await petDb.updateOne(
      { _id: pet._id },
      { $set: { 'fusion.amount': getRandomFloat(fromPrice, toPrice, 2) } }
    );
  }
};

adminService.getSaleEgg = async ({
  rarities,
  priceSort = -1,
  timeSort = -1,
  offset,
  limit,
}) => {
  const userGens = await userGenDb.find({});
  const publicAddresses = userGens.map((item) => item.publicAddress);
  const query = {
    publicAddress: { $not: { $in: publicAddresses } },
  };
  const sort = {};

  if (rarities) {
    query.rarity = { $in: rarities };
  }

  if (priceSort) {
    sort.price = priceSort;
  }

  if (timeSort) {
    sort.createdAt = timeSort;
  }

  const [eggs, total] = await Promise.all([
    eggOnSaleDb
      .find(query, { __v: 0, createdAt: 0, updatedAt: 0 })
      .sort(sort)
      .skip(offset)
      .limit(limit)
      .lean(),
    eggOnSaleDb.countDocuments(query),
  ]);

  return {
    data: eggs,
    total,
  };
};

// adminService.changeMode = async ({ eggId, price, mode }) => {
//   let egg;
//   if (mode === 'fusion') {
//     egg = await eggDb.findOne({
//       _id: eggId,
//       handleStatus: eggConfig.HANDLE_STATUS.ADMIN,
//       status: eggConfig.EGG_STATUS.ONSALE,
//     });

//     if (!egg) {
//       throw new AppError(
//         ERROR_CODES.ERR_BAD_REQUEST,
//         'Can not change pet mode'
//       );
//     }

//     await mongoDbSessionAutoWrap(async (session) => {
//       await eggDb.updateOne(
//         { _id: eggId },
//         { status: eggConfig.EGG_STATUS.FARMING },
//         { session }
//       );
//       await eggOnSaleDb.deleteOne({ eggId }, { session });
//       await petDb.create(
//         [
//           {
//             publicAddress: egg.publicAddress,
//             position: 0,
//             type: egg.petType,
//             level: 6,
//             point: 0,
//             status: petConfig.PET_STATUS.PET,
//             stage: petConfig.PET_STAGE.EAT,
//             stageIndex: 1,
//             nextActionTime: new Date(),
//             prevActionTime: new Date(),
//             growthTime: new Date(),
//             eggId: egg._id,
//             rarity: egg.rarity,
//             origin: egg.origin,
//             fusion: {
//               isActive: true,
//               amount: price,
//               isGiveMode: true,
//             },
//           },
//         ],
//         { session }
//       );
//     });
//   }

//   if (mode === 'sale') {
//     egg = await eggDb.findOne({
//       _id: eggId,
//       handleStatus: eggConfig.HANDLE_STATUS.ADMIN,
//       status: eggConfig.EGG_STATUS.FARMING,
//     });

//     if (!egg) {
//       throw new AppError(
//         ERROR_CODES.ERR_BAD_REQUEST,
//         'Can not change pet mode'
//       );
//     }

//     await mongoDbSessionAutoWrap(async (session) => {
//       await eggDb.updateOne(
//         { _id: eggId },
//         { status: eggConfig.EGG_STATUS.ONSALE },
//         { session }
//       );
//       await eggOnSaleDb.create(
//         [
//           {
//             publicAddress: address,
//             eggId: egg._id.toString(),
//             origin: egg.origin,
//             rarity: egg.rarity,
//             price,
//             petType: egg.petType,
//             status: eggConfig.ON_SALE_STATUS.LISTING,
//           },
//         ],
//         { session }
//       );
//       await petDb.deleteOne({ eggId }, { session });
//     });
//   }
// };
