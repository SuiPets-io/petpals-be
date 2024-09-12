const BigNumber = require('bignumber.js');
const claimPpsDb = require('../../models/user/claimPpsDb');
const userDb = require('../../models/user/userDb');
const userReferralDb = require('../../models/user/userReferralDb');
const adminNotiDb = require('../../models/user/adminNotiDb');
const commonUtils = require('../../utils/common');
const { ERROR_CODES } = require('../../configs/constant');
const { AppError, parseError } = require('../../utils/errors');
const suiUtil = require('../../utils/sui');
const userHelper = require('./user.helper');
const { TOKEN_EXPIRE_TIME_TELE } = require('../../configs/constant');
const userConfig = require('../../configs/user.config');
const teleConfig = require('../../configs/tele.config');
const eggConfig = require('../../configs/egg.config');
const petConfig = require('../../configs/pet.config');
const config = require('../../configs/config');
const { PromisePool } = require('@supercharge/promise-pool');
const { getChat } = require('../../networks/tele/bot');
const logger = require('../../utils/logger');
const mongoDbSessionAutoWrap = require('../../models/mongoDbSessionAutoWrap');
const randomString = require('random-string');
const { sendToAllChats } = require('../../networks/tele/bot-noti');
const timeoutAwait = require('../../utils/timeoutAwait');
const eggDb = require('../../models/egg/eggDb');
const suiLib = require('../../libs/sui.lib');

const userService = module.exports;

userService.createAccountTele = async ({
  chatId,
  hash,
  publicAddress,
  message,
  signature,
  username,
  firstname,
  lastname,
  referedCode,
}) => {
  // if (!commonUtils.validateAddress(publicAddress)) {
  //   throw new AppError(ERROR_CODES.ERR_BAD_REQUEST, 'Can not create account');
  // }

  try {
    const chatInfo = await getChat(chatId);
    if (
      !chatInfo ||
      (chatInfo.first_name && firstname !== chatInfo.first_name) ||
      (chatInfo.last_name && lastname !== chatInfo.last_name) ||
      (chatInfo.username && username !== chatInfo.username)
    ) {
      throw new AppError(ERROR_CODES.ERR_BAD_REQUEST, 'Unable to login');
    }
  } catch (e) {
    logger.error(e);
    throw new AppError(ERROR_CODES.ERR_BAD_REQUEST, 'Cannot create account');
  }

  if (!userHelper.compareLoginHash(chatId, hash)) {
    throw new AppError(ERROR_CODES.ERR_BAD_REQUEST, 'Login failed');
  }

  const isSigned = suiUtil.vertifySignature(message, signature, publicAddress);
  if (!isSigned) {
    throw new AppError(ERROR_CODES.ERR_VERIFICATION_FAILED);
  }

  const [findChatId, findAddress] = await Promise.all([
    userDb.findOne({ chatId }),
    userDb.findOne({ publicAddress }),
  ]);

  // check for admin
  if (config.ADMIN_CHAT_ID.includes(chatId)) {
    if (findChatId) {
      await userDb.updateOne(
        { publicAddress: findChatId.publicAddress },
        { $unset: { chatId: '' } }
      );
      await userDb.updateOne(
        { publicAddress: publicAddress },
        {
          $set: {
            chatId,
            teleUsername: username,
            referralCode: randomString({ length: 10 }),
          },
        },
        { upsert: true }
      );
    } else {
      await userDb.updateOne(
        { publicAddress: publicAddress },
        {
          $set: {
            chatId,
            teleUsername: username,
            referralCode: randomString({ length: 10 }),
          },
        },
        { upsert: true }
      );
    }

    return {
      token: userHelper.generateToken(
        { publicAddress },
        TOKEN_EXPIRE_TIME_TELE
      ),
    };
  }

  if (findAddress && !findChatId) {
    throw new AppError(ERROR_CODES.ERR_BAD_REQUEST, 'Invalid account');
  }

  if (findAddress && findChatId) {
    if (findAddress.publicAddress !== findChatId.publicAddress) {
      throw new AppError(
        ERROR_CODES.ERR_BAD_REQUEST,
        'Your Telegram account has been linked to another account!'
      );
    }

    return {
      token: userHelper.generateToken(
        { publicAddress },
        TOKEN_EXPIRE_TIME_TELE
      ),
    };
  }

  if (!findAddress && findChatId) {
    throw new AppError(
      ERROR_CODES.ERR_BAD_REQUEST,
      'Your Telegram account has been linked to another account!'
    );
  }

  // if (findChatId && findAddress) {
  //   if (findChatId.publicAddress === findAddress.publicAddress) {
  //     return {
  //       token: userHelper.generateToken(
  //         { publicAddress },
  //         TOKEN_EXPIRE_TIME_TELE
  //       ),
  //     };
  //   }
  //   if (findChatId.publicAddress !== findAddress.publicAddress) {
  //     await mongoDbSessionAutoWrap(async (session) => {
  //       await userDb.updateOne(
  //         { chatId },
  //         { $unset: { chatId: '' } },
  //         { session }
  //       );
  //       await userDb.updateOne(
  //         { publicAddress },
  //         { $set: { chatId } },
  //         { session }
  //       );
  //     });
  //     return {
  //       token: userHelper.generateToken(
  //         { publicAddress },
  //         TOKEN_EXPIRE_TIME_TELE
  //       ),
  //     };
  //   }
  // }
  // if (!findChatId && findAddress) {
  //   await userDb.updateOne({ publicAddress }, { $set: { chatId } });
  //   return {
  //     token: userHelper.generateToken(
  //       { publicAddress },
  //       TOKEN_EXPIRE_TIME_TELE
  //     ),
  //   };
  // }

  if (!findAddress & !findChatId) {
    let referUser1;
    let referUser2;
    if (referedCode) {
      referUser1 = await userDb
        .findOne({ referralCode: referedCode, chatId: { $exists: true } })
        .lean();
      if (referUser1 && referUser1.referedByOwnerId) {
        referUser2 = await userDb
          .findOne({
            publicAddress: referUser1.referedByOwnerId,
            chatId: { $exists: true },
          })
          .lean();
      }
    }
    const createRefer = [];
    if (referUser1) {
      createRefer.push({
        status: userConfig.REFERRAL_STATUS.PENDING,
        userReferId: referUser1.publicAddress,
        userReferedId: publicAddress,
        publicAddress: referUser1.publicAddress,
        level: 1,
      });
    }
    if (referUser2) {
      createRefer.push({
        status: userConfig.REFERRAL_STATUS.PENDING,
        userReferId: referUser2.publicAddress,
        userReferedId: publicAddress,
        publicAddress: referUser2.publicAddress,
        level: 2,
      });
    }
    // await userDb.updateOne({ chatId }, { $unset: { chatId: '' } });
    await mongoDbSessionAutoWrap(async (session) => {
      await userDb.create(
        [
          {
            chatId,
            publicAddress,
            teleUsername: username,
            referralCode: randomString({ length: 10 }),
            referedByOwnerId: referUser1?.chatId,
            pps: userConfig.REWARD_PPS_NEW_USER,
          },
        ],
        { session }
      );
      await userReferralDb.insertMany(createRefer, { session });
      if (referUser1) {
        await userDb.updateOne(
          { publicAddress: referUser1.publicAddress },
          { $inc: { numberReferral: 1 } },
          { session }
        );
        if (config.IS_OPEN_FREE_EGG) {
          const types = Object.values(petConfig.PET_TYPE);
          await eggDb.create(
            [
              {
                publicAddress,
                origin: eggConfig.ORIGIN.NORMAL,
                rarity: eggConfig.RARITY.COMMON,
                status: eggConfig.EGG_STATUS.ACTIVE,
                petType: types[Math.floor(Math.random() * types.length)],
                isFree: true,
              },
            ],
            { session }
          );
        }
      }
      if (referUser2) {
        await userDb.updateOne(
          { publicAddress: referUser2.publicAddress },
          { $inc: { numberReferral: 1 } },
          { session }
        );
      }
      await adminNotiDb.create({
        type: 'new-account',
        message: `New user created: with wallet ${publicAddress}!`,
        status: 'pending',
      });
    });
    return {
      token: userHelper.generateToken(
        { publicAddress },
        TOKEN_EXPIRE_TIME_TELE
      ),
    };
  }
};

userService.getUserInfo = async (publicAddress) => {
  const user = await userDb
    .findOne({ publicAddress }, { _id: 0, createdAt: 0, updatedAt: 0, __v: 0 })
    .lean();
  if (!user) {
    throw new AppError(ERROR_CODES.ERR_USER_NOT_EXIST);
  }

  return {
    publicAddress,
    chatId: user.chatId,
    referralCode: user.referralCode,
    numberReferral: user.numberReferral || 0,
    teleBotName: config.TELE_BOT_NAME,
    items: user.items || {},
    pps: user.pps || 0,
  };
};

userService.config = async () => {
  return {
    REFERRAL_MESSAGE: userConfig.REFERRAL_MESSAGE,
    CLAIM_PPS_FEE: userConfig.CLAIM_PPS_FEE,
    IS_OPEN_CLAIM_PPS: config.IS_OPEN_CLAIM_PPS,
  };
};

userService.checkUserReferral = async () => {
  const pendings = await userReferralDb
    .find({ status: userConfig.REFERRAL_STATUS.PENDING })
    .sort({ _id: -1 })
    .limit(20);
  await PromisePool.withConcurrency(5)
    .for(pendings)
    .process(async (pending) => {
      // await transferPps(userConfig.REFFERAL_PPS_REWARD, pending.publicAddress);
      await userDb.updateOne(
        { publicAddress: pending.publicAddress },
        { $inc: { pps: userConfig.REFFERAL_PPS_REWARD } }
      );
      await userReferralDb.updateOne(
        { _id: pending._id },
        { status: userConfig.REFERRAL_STATUS.SUCCESS }
      );
    });
};

userService.adminNoti = async () => {
  const notis = await adminNotiDb
    .find({
      status: 'pending',
      // type: 'new-account',
    })
    .limit(10);
  for (const noti of notis) {
    await sendToAllChats([config.BOT_NOTI_GROUP_ID], noti.message);
    await adminNotiDb.updateOne({ _id: noti._id }, { status: 'success' });
    await timeoutAwait(0.5);
  }
};

userService.claimPps = async ({ publicAddress, pps, txHash }) => {
  pps = Math.floor(pps);
  if (!config.IS_OPEN_CLAIM_PPS) {
    throw new AppError(
      ERROR_CODES.ERR_BAD_REQUEST,
      'Sorry, Claim pps is closed!'
    );
  }

  const [user, checkTxHash, checkPending] = await Promise.all([
    userDb.findOne({ publicAddress }),
    claimPpsDb.findOne({ txHash }),
    claimPpsDb.findOne({
      status: userConfig.CLAIM_PPS_STATUS.WAITING_TO_CHECK,
    }),
  ]);

  if (!user || user.pps < pps) {
    throw new AppError(
      ERROR_CODES.ERR_BAD_REQUEST,
      'Sorry, Your PPS is not enough'
    );
  }

  if (checkTxHash) {
    throw new AppError(ERROR_CODES.ERR_BAD_REQUEST, 'Sorry, Can not claim pps');
  }

  if (checkPending) {
    throw new AppError(ERROR_CODES.ERR_BAD_REQUEST, 'Sorry, Can not claim pps');
  }

  await mongoDbSessionAutoWrap(async (session) => {
    await userDb.updateOne(
      {
        publicAddress,
      },
      {
        $inc: { pps: -pps },
      },
      { session }
    );
    await claimPpsDb.create(
      [
        {
          publicAddress,
          amount: userConfig.CLAIM_PPS_FEE,
          pps,
          status: userConfig.CLAIM_PPS_STATUS.WAITING_TO_CHECK,
          txHash,
        },
      ],
      { session }
    );
  });
};

userService.checkClaimPps = async () => {
  const buyPendings = await claimPpsDb
    .find({
      status: userConfig.CLAIM_PPS_STATUS.WAITING_TO_CHECK,
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
        const ppsAmount = new BigNumber(Math.floor(buyPending.pps))
          .multipliedBy(new BigNumber('10').pow(3))
          .toString();
        await mongoDbSessionAutoWrap(async (session) => {
          const { digest } = await suiLib.transferPps(
            config.ADMIN_PRIVATE_KEY,
            [{ amount: ppsAmount, address: buyPending.publicAddress }]
          );
          await claimPpsDb.updateOne(
            { _id: buyPending._id },
            {
              $set: {
                status: userConfig.CLAIM_PPS_STATUS.SUCCESS,
                sendTxHash: digest,
              },
            },
            { session }
          );
        });
        continue;
      }
    }

    await claimPpsDb.updateOne(
      { _id: buyPending._id },
      { $set: { status: userConfig.CLAIM_PPS_STATUS.FAIL } }
    );
  }
};
