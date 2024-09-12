const express = require('express');
const Joi = require('joi');
const adminService = require('../../../services/admin/admin.service');
const validationMiddleware = require('../middlewares/validation.middleware');
const handlerMiddleware = require('../middlewares/handle.middleware');
const handlePaginationMiddleware = require('../middlewares/handle-pagination.middleware');
const checkAdminAuth = require('../middlewares/check-admin-auth.middleware');
const { lock } = require('../../../utils/asyncLockUtils');
const eggConfig = require('../../../configs/egg.config');
const petConfig = require('../../../configs/pet.config');
const { customJoi } = require('../../../utils/schemaUtils');

// @path:admins
const adminRoutes = () => {
  const router = express.Router();

  router.get(
    '/egg-statistic',
    checkAdminAuth,
    handlerMiddleware((req) => adminService.eggStatistic())
  );

  router.post(
    '/upsert-egg',
    checkAdminAuth,
    validationMiddleware({
      body: {
        fromIndex: Joi.number().greater(0).required(),
        toIndex: Joi.number().greater(0).required(),
        rarity: Joi.string().valid(...Object.values(eggConfig.RARITY)),
        origin: Joi.string().valid(...Object.values(eggConfig.ORIGIN)),
        petType: Joi.string().valid(...Object.values(petConfig.PET_TYPE)),
        status: Joi.string().valid(...Object.values(eggConfig.ON_SALE_STATUS)),
        fromPrice: Joi.number().greater(0).required(),
        toPrice: Joi.number().greater(0).required(),
        isFree: Joi.boolean().default(true),
      },
    }),
    handlerMiddleware((req) =>
      adminService.upsertEgg({
        fromIndex: req.body.fromIndex,
        toIndex: req.body.toIndex,
        rarity: req.body.rarity,
        origin: req.body.origin,
        petType: req.body.petType,
        status: req.body.status,
        fromPrice: req.body.fromPrice,
        toPrice: req.body.toPrice,
        isFree: req.body.isFree,
      })
    )
  );

  router.post(
    '/reward-egg',
    checkAdminAuth,
    validationMiddleware({
      body: {
        addressList: Joi.array().items(Joi.string()),
        rarity: Joi.string().valid(...Object.values(eggConfig.RARITY)),
        origin: Joi.string().valid(...Object.values(eggConfig.ORIGIN)),
        petType: Joi.string().valid(...Object.values(petConfig.PET_TYPE)),
      },
    }),
    handlerMiddleware((req) =>
      adminService.rewardEgg({
        addressList: req.body.addressList,
        rarity: req.body.rarity,
        origin: req.body.origin,
        petType: req.body.petType,
      })
    )
  );

  router.post(
    '/upsert-fusion',
    checkAdminAuth,
    validationMiddleware({
      body: {
        fromIndex: Joi.number().greater(0).required(),
        toIndex: Joi.number().greater(0).required(),
        rarity: Joi.string().valid(...Object.values(eggConfig.RARITY)),
        petType: Joi.string().valid(...Object.values(petConfig.PET_TYPE)),
        fromPrice: Joi.number().greater(0).required(),
        toPrice: Joi.number().greater(0).required(),
      },
    }),
    handlerMiddleware((req) =>
      adminService.upsertFusion({
        fromIndex: req.body.fromIndex,
        toIndex: req.body.toIndex,
        rarity: req.body.rarity,
        petType: req.body.petType,
        fromPrice: req.body.fromPrice,
        toPrice: req.body.toPrice,
      })
    )
  );

  router.post(
    '/upsert-leaderboard',
    checkAdminAuth,
    validationMiddleware({
      body: {
        fromIndex: Joi.number().greater(0).required(),
        toIndex: Joi.number().greater(0).required(),
        seasonType: Joi.string().valid('week', 'month'),
        fromPpsAmount: Joi.number().positive(),
        toPpsAmount: Joi.number().positive(),
      },
    }),
    handlerMiddleware((req) =>
      adminService.upsertLeaderboard({
        fromIndex: req.body.fromIndex,
        toIndex: req.body.toIndex,
        seasonType: req.body.seasonType,
        fromPpsAmount: req.body.fromPpsAmount,
        toPpsAmount: req.body.toPpsAmount,
      })
    )
  );

  router.get(
    '/list-eggs',
    checkAdminAuth,
    validationMiddleware({
      query: {
        offset: Joi.number().default(0),
        limit: Joi.number().default(20),
      },
    }),
    handlePaginationMiddleware(async (req) => {
      return adminService.getListEgg({
        offset: req.query.offset,
        limit: req.query.limit,
      });
    })
  );

  router.get(
    '/list-fusions',
    checkAdminAuth,
    validationMiddleware({
      query: {
        offset: Joi.number().default(0),
        limit: Joi.number().default(20),
      },
    }),
    handlePaginationMiddleware(async (req) => {
      return adminService.getListFusion({
        offset: req.query.offset,
        limit: req.query.limit,
      });
    })
  );

  router.get(
    '/list-leaderboards',
    checkAdminAuth,
    validationMiddleware({
      query: {
        seasonType: Joi.string().valid('week', 'month'),
        // offset: Joi.number().default(0),
        // limit: Joi.number().default(20),
      },
    }),
    handlePaginationMiddleware(async (req) => {
      return adminService.getListLeaderboard({
        seasonType: req.query.seasonType,
        // offset: req.query.offset,
        // limit: req.query.limit,
      });
    })
  );
  router.post(
    '/edit-egg-price',
    checkAdminAuth,
    validationMiddleware({
      body: {
        eggIds: Joi.array().items(Joi.string()),
        fromPrice: Joi.number().greater(0).required(),
        toPrice: Joi.number().greater(0).required(),
      },
    }),
    handlerMiddleware((req) =>
      adminService.editEggPrice({
        eggIds: req.body.eggIds,
        fromPrice: req.body.fromPrice,
        toPrice: req.body.toPrice,
      })
    )
  );

  router.post(
    '/edit-egg-status',
    checkAdminAuth,
    validationMiddleware({
      body: {
        eggIds: Joi.array().items(Joi.string()),
        status: Joi.string().valid(...Object.values(eggConfig.ON_SALE_STATUS)),
      },
    }),
    handlerMiddleware((req) =>
      adminService.editEggStatus({
        eggIds: req.body.eggIds,
        status: req.body.status,
      })
    )
  );

  router.post(
    '/edit-fusion-price',
    checkAdminAuth,
    validationMiddleware({
      body: {
        petIds: Joi.array().items(Joi.string()),
        fromPrice: Joi.number().greater(0).required(),
        toPrice: Joi.number().greater(0).required(),
      },
    }),
    handlerMiddleware((req) =>
      adminService.editFusionPrice({
        petIds: req.body.petIds,
        fromPrice: req.body.fromPrice,
        toPrice: req.body.toPrice,
      })
    )
  );

  router.get(
    '/list-egg-sale',
    checkAdminAuth,
    validationMiddleware({
      query: {
        rarities: customJoi
          .array()
          .items(Joi.string().valid(...Object.values(eggConfig.RARITY))),
        priceSort: Joi.number().valid(-1, 1),
        timeSort: Joi.number().valid(-1, 1),
        offset: Joi.number().default(0),
        limit: Joi.number().default(20),
      },
    }),
    handlePaginationMiddleware(async (req) => {
      return adminService.getSaleEgg({
        rarities: req.query.rarities,
        priceSort: req.query.priceSort,
        timeSort: req.query.timeSort,
        offset: req.query.offset,
        limit: req.query.limit,
      });
    })
  );

  // router.post(
  //   '/change-mode',
  //   checkAdminAuth,
  //   validationMiddleware({
  //     body: {
  //       eggId: Joi.string().required(),
  //       price: Joi.number().greater(0).required(),
  //       mode: Joi.string().valid('fusion', 'sale').required(),
  //     },
  //   }),
  //   handlerMiddleware((req) =>
  //     adminService.changeMode({
  //       eggId: req.body.eggId,
  //       price: req.body.price,
  //       mode: req.body.mode,
  //     })
  //   )
  // );
  return router;
};

module.exports = adminRoutes;
