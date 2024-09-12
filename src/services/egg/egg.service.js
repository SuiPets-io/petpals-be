/* eslint-disable indent */
const userDb = require('../../models/user/userDb');
const buyOfferingDb = require('../../models/egg/buyOfferingDb');
const eggDb = require('../../models/egg/eggDb');
const eggSettingDb = require('../../models/egg/eggSettingDb');
const mongoDbSessionAutoWrap = require('../../models/mongoDbSessionAutoWrap');
const { ERROR_CODES } = require('../../configs/constant');
const { AppError } = require('../../utils/errors');
const eggConfig = require('../../configs/egg.config');
const petConfig = require('../../configs/pet.config');
const eggHelper = require('./egg.helper');
const eggOnSaleDb = require('../../models/egg/eggOnSaleDb');
const eggRecentSoldDb = require('../../models/egg/eggRecentSoldDb');
const suiLib = require('../../libs/sui.lib');
const suiUtil = require('../../utils/sui');
const config = require('../../configs/config');
const buyItemDb = require('../../models/pet/buyItemDb');
// const buyEggDb = require('../../models/egg/buyEggDb');
const activeFusionModeDb = require('../../models/pet/activeFusionModeDb');
const activeAutoDb = require('../../models/pet/activeAutoDb');
const petFusionDb = require('../../models/pet/petFusionDb');
const buyPetSlotDb = require('../../models/pet/buyPetSlotDb');
const claimPpsDb = require('../../models/user/claimPpsDb');
const resetPetDb = require('../../models/pet/resetPetDb');
const adminNotiDb = require('../../models/user/adminNotiDb');

const eggService = module.exports;

eggService.checkClaimFreeEgg = async (publicAddress) => {
  const [numberOfFreeEgg, isClaimFreeEgg] = await Promise.all([
    eggDb.countDocuments({
      isFreeGenesis: true,
    }),
    eggDb.findOne({
      isFreeGenesis: true,
      originUserAddress: publicAddress,
    }),
  ]);

  if (numberOfFreeEgg >= eggConfig.MAX_FREE_EGG) return false;
  if (isClaimFreeEgg) return false;
  return true;
};

eggService.claimFreeEgg = async (publicAddress) => {
  const [
    numberOfFreeEgg,
    isClaimFreeEgg,
    eggCommon,
    eggRare,
    eggEpic,
    eggLegendary,
  ] = await Promise.all([
    eggDb.countDocuments({ isFreeGenesis: true }),
    eggDb.findOne({ originUserAddress: publicAddress, isFreeGenesis: true }),
    eggDb.countDocuments({
      isFreeGenesis: true,
      rarity: eggConfig.RARITY.COMMON,
    }),
    eggDb.countDocuments({
      isFreeGenesis: true,
      rarity: eggConfig.RARITY.RARE,
    }),
    eggDb.countDocuments({
      isFreeGenesis: true,
      rarity: eggConfig.RARITY.EPIC,
    }),
    eggDb.countDocuments({
      isFreeGenesis: true,
      rarity: eggConfig.RARITY.LEGENDARY,
    }),
  ]);

  if (isClaimFreeEgg) {
    throw new AppError(
      ERROR_CODES.ERR_BAD_REQUEST,
      'Sorry, you have already claimed it!'
    );
  }

  if (numberOfFreeEgg >= eggConfig.MAX_FREE_EGG) {
    throw new AppError(
      ERROR_CODES.ERR_BAD_REQUEST,
      'Sorry, the number of free eggs has exceeded the limit!'
    );
  }

  const rarity = eggHelper.eggRandomFreeEggRarity(
    eggCommon,
    eggRare,
    eggEpic,
    eggLegendary
  );
  const types = Object.values(petConfig.PET_TYPE);

  let egg;
  await mongoDbSessionAutoWrap(async (session) => {
    [egg] = await eggDb.create(
      [
        {
          petType: types[Math.floor(Math.random() * types.length)],
          publicAddress: publicAddress,
          origin: eggConfig.ORIGIN.GENESIS,
          rarity,
          status: eggConfig.EGG_STATUS.ACTIVE,
          isFreeGenesis: true,
          originUserAddress: publicAddress,
        },
      ],
      { session }
    );
    // await eggSettingDb.updateOne(
    //   {},
    //   { $inc: { [rarity]: 1, numberEgg: 1 } },
    //   { upsert: true, session }
    // );
  });

  return egg;
};

eggService.buyOffering = async ({ publicAddress, txHash }) => {
  const [checkTx, offeringPrice] = await Promise.all([
    buyOfferingDb.findOne({ txHash }),
    eggHelper.getOfferingPrice(),
  ]);
  if (checkTx) {
    throw new AppError(ERROR_CODES.ERR_BAD_REQUEST, 'Invalid transaction!');
  }

  if (offeringPrice < 0) {
    throw new AppError(ERROR_CODES.ERR_BAD_REQUEST, 'Offering reach limit!!!');
  }

  await buyOfferingDb.create({
    publicAddress,
    txHash,
    status: eggConfig.BUY_OFFERING_STATUS.WAITING_TO_CHECK,
    amount: offeringPrice,
  });
};

eggService.checkBuyOffering = async () => {
  const buyPendings = await buyOfferingDb
    .find({
      status: eggConfig.BUY_OFFERING_STATUS.WAITING_TO_CHECK,
    })
    .sort({ _id: -1 });

  for (const buyPending of buyPendings) {
    const tx = await suiLib.getTransaction(buyPending.txHash);
    if (!tx) continue;
    if (tx.effects.status.status === 'success') {
      const toInfo = tx?.balanceChanges?.find(
        (item) =>
          item.coinType === '0x2::sui::SUI' &&
          Number(item.amount) > 0 &&
          item?.owner?.AddressOwner === config.ADMIN_WALLET_ADDRESS
      );
      const fromInfo = tx?.balanceChanges?.find(
        (item) =>
          item.coinType === '0x2::sui::SUI' &&
          item?.owner?.AddressOwner === buyPending.publicAddress
      );
      if (
        !tx?.balanceChanges ||
        (fromInfo &&
          toInfo &&
          suiUtil.convertToSui(toInfo.amount) === buyPending.amount)
      ) {
        let eggSettingData = await eggSettingDb.findOne({});
        if (!eggSettingData)
          eggSettingData = {
            numberEgg: 0,
            [eggConfig.RARITY.COMMON]: 0,
            [eggConfig.RARITY.RARE]: 0,
            [eggConfig.RARITY.EPIC]: 0,
            [eggConfig.RARITY.LEGENDARY]: 0,
          };
        const rarity = eggHelper.randomOfferingRarity(eggSettingData);
        const types = Object.values(petConfig.PET_TYPE);

        await mongoDbSessionAutoWrap(async (session) => {
          const [egg] = await eggDb.create(
            [
              {
                petType: types[Math.floor(Math.random() * types.length)],
                publicAddress: buyPending.publicAddress,
                origin: eggConfig.ORIGIN.GENESIS,
                rarity,
                status: eggConfig.EGG_STATUS.ACTIVE,
              },
            ],
            { session }
          );
          await buyOfferingDb.updateOne(
            {
              _id: buyPending._id,
            },
            {
              status: eggConfig.BUY_OFFERING_STATUS.SUCCESS,
              eggId: egg._id,
            },
            { session }
          );
          await eggSettingDb.updateOne(
            {},
            { $inc: { [rarity]: 1, numberEgg: 1 } },
            { upsert: true, session }
          );

          try {
            await adminNotiDb.create({
              type: 'buy-egg',
              message: `User ${buyPending.publicAddress} has opened a mystery box with ${buyPending.amount} SUI`,
              status: 'pending',
            });
          } catch (e) {
            console.log('Error opening mystery box');
          }
        });
        continue;
      }
    }
    await buyOfferingDb.updateOne(
      {
        _id: buyPending._id,
      },
      {
        status: eggConfig.BUY_OFFERING_STATUS.FAIL,
      }
    );
  }
};

eggService.listing = async ({ publicAddress, eggId, price }) => {
  const egg = await eggDb.findOne({ publicAddress, _id: eggId });

  if (!egg || egg.status !== eggConfig.EGG_STATUS.ACTIVE) {
    throw new AppError(ERROR_CODES.ERR_BAD_REQUEST, 'Invalid status!');
  }

  if (egg.isFree) {
    throw new AppError(
      ERROR_CODES.ERR_BAD_REQUEST,
      'Sorry, you cannot list a free egg!'
    );
  }

  await mongoDbSessionAutoWrap(async (session) => {
    await eggDb.updateOne(
      { _id: eggId },
      { $set: { status: eggConfig.EGG_STATUS.ONSALE } },
      { session }
    );
    await eggOnSaleDb.create(
      [
        {
          publicAddress,
          eggId,
          origin: egg.origin,
          rarity: egg.rarity,
          price,
          petType: egg.petType,
          status: eggConfig.ON_SALE_STATUS.LISTING,
        },
      ],
      { session }
    );
  });
};

eggService.cancel = async ({ publicAddress, eggId }) => {
  const eggOnSale = await eggOnSaleDb.findOne({ publicAddress, eggId });

  if (!eggOnSale || eggOnSale.status !== eggConfig.ON_SALE_STATUS.LISTING) {
    throw new AppError(
      ERROR_CODES.ERR_BAD_REQUEST,
      'Sorry, this egg is not currently listed!'
    );
  }

  await mongoDbSessionAutoWrap(async (session) => {
    await eggDb.updateOne(
      { _id: eggId },
      { $set: { status: eggConfig.EGG_STATUS.ACTIVE } },
      { session }
    );
    await eggOnSaleDb.deleteOne(
      {
        _id: eggOnSale._id,
      },
      { session }
    );
  });
};

eggService.buy = async ({ publicAddress, eggId, txHash }) => {
  const [eggOnSale, eggRecentSold] = await Promise.all([
    eggOnSaleDb.findOne({ eggId }),
    eggRecentSoldDb.findOne({ txHash }),
  ]);

  if (!eggOnSale || eggOnSale.status !== eggConfig.ON_SALE_STATUS.LISTING) {
    throw new AppError(
      ERROR_CODES.ERR_BAD_REQUEST,
      'Sorry, this egg is not currently listed!'
    );
  }

  if (eggRecentSold) {
    throw new AppError(
      ERROR_CODES.ERR_BAD_REQUEST,
      'Sorry, this egg has been sold!'
    );
  }

  await mongoDbSessionAutoWrap(async (session) => {
    await eggRecentSoldDb.create(
      [
        {
          seller: eggOnSale.publicAddress,
          buyer: publicAddress,
          eggId,
          origin: eggOnSale.origin,
          rarity: eggOnSale.rarity,
          price: eggOnSale.price,
          petType: eggOnSale.petType,
          status: eggConfig.RECENT_SOLD_STATUS.WAITING_TO_CHECK,
          txHash,
        },
      ],
      { session }
    );
    await eggOnSaleDb.updateOne(
      {
        _id: eggOnSale._id,
      },
      {
        $set: {
          status: eggConfig.ON_SALE_STATUS.BUYING,
        },
      },
      { session }
    );
  });
};

eggService.checkBuyEgg = async () => {
  const buyPendings = await eggRecentSoldDb
    .find({
      status: eggConfig.RECENT_SOLD_STATUS.WAITING_TO_CHECK,
    })
    .sort({ _id: -1 });

  for (const buyPending of buyPendings) {
    const egg = await eggDb.findOne({ _id: buyPending.eggId });
    const tx = await suiLib.getTransaction(buyPending.txHash);
    if (!tx) continue;

    if (tx.effects.status.status === 'success') {
      const fromInfo = tx?.balanceChanges?.find(
        (item) =>
          item.coinType === '0x2::sui::SUI' &&
          item?.owner?.AddressOwner === buyPending.buyer
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
          suiUtil.convertToSui(toInfo.amount) === buyPending.price)
      ) {
        const sellerAmount = Math.floor(
          (1 - eggConfig.BUY_FEE_RATE) * buyPending.price * 10 ** 9
        );

        await mongoDbSessionAutoWrap(async (session) => {
          const txSend = await suiLib.transferSui(config.ADMIN_PRIVATE_KEY, [
            { amount: sellerAmount, address: buyPending.seller },
          ]);
          const update = {
            publicAddress: buyPending.buyer,
            status: eggConfig.EGG_STATUS.ACTIVE,
          };
          if (egg.handleStatus) {
            update.handleStatus = eggConfig.HANDLE_STATUS.USER;
          }
          await eggDb.updateOne({ _id: buyPending.eggId }, update, { session });
          await eggOnSaleDb.deleteOne(
            {
              eggId: buyPending.eggId,
            },
            { session }
          );
          await eggRecentSoldDb.updateOne(
            { _id: buyPending._id },
            {
              $set: {
                status: eggConfig.RECENT_SOLD_STATUS.SUCCESS,
                txSend: txSend.digest,
              },
            },
            { session }
          );
        });
        continue;
      }
    }
    await mongoDbSessionAutoWrap(async (session) => {
      await eggOnSaleDb.updateOne(
        {
          _id: buyPending.eggId,
        },
        {
          status: eggConfig.ON_SALE_STATUS.LISTING,
        },
        { session }
      );
      await eggRecentSoldDb.updateOne(
        { _id: buyPending._id },
        { $set: { status: eggConfig.RECENT_SOLD_STATUS.FAIL } },
        { session }
      );
    });
  }
};

eggService.getMarket = async ({
  publicAddress,
  origins,
  rarities,
  status,
  priceSort = -1,
  timeSort = -1,
  offset,
  limit,
}) => {
  const query = {};
  const sort = {};

  if (origins) {
    query.origin = { $in: origins };
  }

  if (rarities) {
    query.rarity = { $in: rarities };
  }

  if (status) {
    query.status = { $in: status };
  }

  if (publicAddress) {
    query.publicAddress = publicAddress;
  }

  if (priceSort) {
    sort.price = priceSort;
  }

  if (timeSort) {
    sort.createdAt = timeSort;
  }

  const [eggs, total] = await Promise.all([
    eggOnSaleDb.find(query).sort(sort).skip(offset).limit(limit).lean(),
    eggOnSaleDb.countDocuments(query),
  ]);

  return {
    data: eggs,
    total,
  };
};

eggService.getEggDetail = async ({ eggId }) => {
  const [egg, eggOnsale, saleHistory] = await Promise.all([
    eggDb.findOne({ _id: eggId }, { __v: 0 }).lean(),
    eggOnSaleDb.findOne({ eggId }),
    eggRecentSoldDb
      .find(
        {
          eggId,
          status: eggConfig.RECENT_SOLD_STATUS.SUCCESS,
        },
        { __v: 0 }
      )
      .sort({ _id: -1 })
      .lean(),
  ]);

  if (!egg) {
    throw new AppError(ERROR_CODES.ERR_BAD_REQUEST, 'Egg not found!');
  }

  return {
    ...egg,
    price: eggOnsale?.price,
    saleHistory,
  };
};

eggService.getMyEgg = async ({
  publicAddress,
  origins,
  rarities,
  status,
  timeSort = 1,
  offset,
  limit,
}) => {
  const query = { publicAddress, status: { $ne: eggConfig.EGG_STATUS.DIE } };
  if (origins) {
    query.origin = { $in: origins };
  }

  if (rarities) {
    query.rarity = { $in: rarities };
  }

  if (status) {
    query.status = { $in: status };
  }
  const [eggs, total] = await Promise.all([
    eggDb
      .find(query)
      .sort({ createdAt: timeSort })
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

eggService.getRecentSold = async ({
  publicAddress,
  origins,
  rarities,
  timeSort = -1,
  priceSort = -1,
  offset,
  limit,
}) => {
  const query = {};
  if (origins) {
    query.origin = { $in: origins };
  }

  if (rarities) {
    query.rarity = { $in: rarities };
  }

  if (publicAddress) {
    query.seller = publicAddress;
  }

  const [eggs, total] = await Promise.all([
    eggRecentSoldDb
      .find(query)
      .sort({ price: priceSort, createdAt: timeSort })
      .skip(offset)
      .limit(limit)
      .lean(),
    eggRecentSoldDb.countDocuments(query),
  ]);

  return {
    data: eggs,
    total,
  };
};

eggService.checkTxStatus = async ({ txHash, type }) => {
  switch (type) {
    case eggConfig.CHECK_TX_TYPE.BUY_OFFERING: {
      const buyOffering = await buyOfferingDb.findOne({ txHash });
      if (!buyOffering) {
        throw new AppError(
          ERROR_CODES.ERR_BAD_REQUEST,
          'Sorry, unable to check this transaction!'
        );
      }
      let egg;
      if (buyOffering.status === eggConfig.BUY_OFFERING_STATUS.SUCCESS) {
        egg = await eggDb.findOne({ _id: buyOffering.eggId }).lean();
      }
      return {
        status: buyOffering.status,
        info: egg,
      };
    }
    case eggConfig.CHECK_TX_TYPE.BUY_ITEM: {
      const data = await buyItemDb.findOne({ txHash });
      if (!data) {
        throw new AppError(
          ERROR_CODES.ERR_BAD_REQUEST,
          'Sorry, unable to check this transaction!'
        );
      }
      return {
        status: data.status,
      };
    }
    case eggConfig.CHECK_TX_TYPE.BUY_EGG: {
      const data = await eggRecentSoldDb.findOne({ txHash });
      if (!data) {
        throw new AppError(
          ERROR_CODES.ERR_BAD_REQUEST,
          'Sorry, unable to check this transaction!'
        );
      }
      return {
        status: data.status,
      };
    }
    case eggConfig.CHECK_TX_TYPE.ACTIVE_FUSION: {
      const data = await activeFusionModeDb.findOne({ txHash });
      if (!data) {
        throw new AppError(
          ERROR_CODES.ERR_BAD_REQUEST,
          'Sorry, unable to check this transaction!'
        );
      }
      return {
        status: data.status,
      };
    }
    case eggConfig.CHECK_TX_TYPE.ACTIVE_AUTO: {
      const data = await activeAutoDb.findOne({ txHash });
      if (!data) {
        throw new AppError(
          ERROR_CODES.ERR_BAD_REQUEST,
          'Sorry, unable to check this transaction!'
        );
      }
      return {
        status: data.status,
      };
    }
    case eggConfig.CHECK_TX_TYPE.FUSION: {
      const data = await petFusionDb.findOne({ txHash });
      if (!data) {
        throw new AppError(
          ERROR_CODES.ERR_BAD_REQUEST,
          'Sorry, unable to check this transaction!'
        );
      }
      let egg;
      if (data.status === petConfig.FUSION_STATUS.SUCCESS) {
        egg = await eggDb.findOne({ _id: data.eggId }).lean();
      }
      return {
        status: data.status,
        info: egg,
      };
    }
    case eggConfig.CHECK_TX_TYPE.BUY_PET_SLOT: {
      const data = await buyPetSlotDb.findOne({ txHash });
      if (!data) {
        throw new AppError(
          ERROR_CODES.ERR_BAD_REQUEST,
          'Sorry, unable to check this transaction!'
        );
      }
      return {
        status: data.status,
      };
    }
    case eggConfig.CHECK_TX_TYPE.CLAIM_PPS: {
      const data = await claimPpsDb.findOne({ txHash });
      if (!data) {
        throw new AppError(
          ERROR_CODES.ERR_BAD_REQUEST,
          'Sorry, unable to check this transaction!'
        );
      }
      return {
        status: data.status,
      };
    }
    case eggConfig.CHECK_TX_TYPE.RESET_PET: {
      const data = await resetPetDb.findOne({ txHash });
      if (!data) {
        throw new AppError(
          ERROR_CODES.ERR_BAD_REQUEST,
          'Sorry, unable to check this transaction!'
        );
      }
      return {
        status: data.status,
      };
    }
    default: {
      throw new AppError(
        ERROR_CODES.ERR_BAD_REQUEST,
        'Sorry, unable to check this transaction!'
      );
    }
  }
};

eggService.getEggConfig = async () => {
  const offeringPrice = await eggHelper.getOfferingPrice();

  return {
    buyFeeRate: eggConfig.BUY_FEE_RATE,
    buyOfferingPrice: offeringPrice,
  };
};
