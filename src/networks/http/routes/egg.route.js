const express = require('express');
const Joi = require('joi');
const eggService = require('../../../services/egg/egg.service');
const validationMiddleware = require('../middlewares/validation.middleware');
const handlerMiddleware = require('../middlewares/handle.middleware');
const checkTokenAuth = require('../middlewares/check-token-auth.middleware');
const handlePaginationMiddleware = require('../middlewares/handle-pagination.middleware');
const eggConfig = require('../../../configs/egg.config');
const { lock } = require('../../../utils/asyncLockUtils');
const { customJoi } = require('../../../utils/schemaUtils');

// @path:eggs
const eggRoutes = () => {
  const router = express.Router();

  router.get(
    '/config',
    checkTokenAuth,
    handlerMiddleware(async (req) => {
      return eggService.getEggConfig();
    })
  );

  router.get(
    '/check-claim-free-egg',
    checkTokenAuth,
    handlerMiddleware(async (req) => {
      return lock(`EGG_${req.user.publicAddress}`, async () => {
        return eggService.checkClaimFreeEgg(req.user.publicAddress);
      });
    })
  );

  router.post(
    '/claim-free-egg',
    checkTokenAuth,
    handlerMiddleware(async (req) => {
      return lock(`EGG_${req.user.publicAddress}`, async () => {
        return eggService.claimFreeEgg(req.user.publicAddress);
      });
    })
  );

  router.post(
    '/buy-offering',
    checkTokenAuth,
    validationMiddleware({
      body: {
        txHash: Joi.string().required(),
      },
    }),
    handlerMiddleware(async (req) => {
      return lock(`EGG_${req.user.publicAddress}`, async () => {
        return eggService.buyOffering({
          publicAddress: req.user.publicAddress,
          txHash: req.body.txHash,
        });
      });
    })
  );

  router.post(
    '/listing',
    checkTokenAuth,
    validationMiddleware({
      body: {
        eggId: Joi.string(),
        price: Joi.number().greater(0),
      },
    }),
    handlerMiddleware(async (req) => {
      return lock(`EGG_${req.user.publicAddress}`, async () => {
        return eggService.listing({
          publicAddress: req.user.publicAddress,
          eggId: req.body.eggId,
          price: req.body.price,
        });
      });
    })
  );

  router.post(
    '/cancel',
    checkTokenAuth,
    validationMiddleware({
      body: {
        eggId: Joi.string(),
      },
    }),
    handlerMiddleware(async (req) => {
      return eggService.cancel({
        publicAddress: req.user.publicAddress,
        eggId: req.body.eggId,
      });
    })
  );

  router.post(
    '/buy',
    checkTokenAuth,
    validationMiddleware({
      body: {
        eggId: Joi.string(),
        txHash: Joi.string().required(),
      },
    }),
    handlerMiddleware(async (req) => {
      return lock(`EGG_${req.user.publicAddress}`, async () => {
        return eggService.buy({
          publicAddress: req.user.publicAddress,
          eggId: req.body.eggId,
          txHash: req.body.txHash,
        });
      });
    })
  );

  router.get(
    '/market',
    checkTokenAuth,
    validationMiddleware({
      query: {
        origins: customJoi
          .array()
          .items(Joi.string().valid(...Object.values(eggConfig.ORIGIN))),
        rarities: customJoi
          .array()
          .items(Joi.string().valid(...Object.values(eggConfig.RARITY))),
        status: customJoi
          .array()
          .items(
            Joi.string().valid(...Object.values(eggConfig.ON_SALE_STATUS))
          ),
        priceSort: Joi.number().valid(-1, 1),
        timeSort: Joi.number().valid(-1, 1),
        offset: Joi.number().default(0),
        limit: Joi.number().default(20),
        publicAddress: Joi.string().optional(),
      },
    }),
    handlePaginationMiddleware(async (req) => {
      return eggService.getMarket({
        publicAddress: req.query.publicAddress,
        origins: req.query.origins,
        rarities: req.query.rarities,
        status: req.query.status,
        priceSort: req.query.priceSort,
        timeSort: req.query.timeSort,
        offset: req.query.offset,
        limit: req.query.limit,
      });
    })
  );

  router.get(
    '/my-egg',
    checkTokenAuth,
    validationMiddleware({
      query: {
        origins: customJoi
          .array()
          .items(Joi.string().valid(...Object.values(eggConfig.ORIGIN))),
        rarities: customJoi
          .array()
          .items(Joi.string().valid(...Object.values(eggConfig.RARITY))),
        status: customJoi
          .array()
          .items(Joi.string().valid(...Object.values(eggConfig.EGG_STATUS))),
        timeSort: Joi.number().valid(-1, 1),
        offset: Joi.number().default(0),
        limit: Joi.number().default(20),
      },
    }),
    handlePaginationMiddleware(async (req) => {
      return eggService.getMyEgg({
        publicAddress: req.user.publicAddress,
        origins: req.query.origins,
        rarities: req.query.rarities,
        status: req.query.status,
        timeSort: req.query.timeSort,
        offset: req.query.offset,
        limit: req.query.limit,
      });
    })
  );

  router.get(
    '/reccent-sold',
    checkTokenAuth,
    validationMiddleware({
      query: {
        origins: customJoi
          .array()
          .items(Joi.string().valid(...Object.values(eggConfig.ORIGIN))),
        rarities: customJoi
          .array()
          .items(Joi.string().valid(...Object.values(eggConfig.RARITY))),
        priceSort: Joi.number().valid(-1, 1),
        timeSort: Joi.number().valid(-1, 1),
        offset: Joi.number().default(0),
        limit: Joi.number().default(20),
        publicAddress: Joi.string().optional(),
      },
    }),
    handlePaginationMiddleware(async (req) => {
      return eggService.getRecentSold({
        publicAddress: req.query.publicAddress,
        origins: req.query.origins,
        rarities: req.query.rarities,
        timeSort: req.query.timeSort,
        priceSort: req.query.priceSort,
        offset: req.query.offset,
        limit: req.query.limit,
      });
    })
  );

  router.get(
    '/check-tx',
    checkTokenAuth,
    validationMiddleware({
      query: {
        txHash: Joi.string().required(),
        type: Joi.string().valid(...Object.values(eggConfig.CHECK_TX_TYPE)),
      },
    }),
    handlerMiddleware(async (req) => {
      return eggService.checkTxStatus({
        txHash: req.query.txHash,
        type: req.query.type,
      });
    })
  );

  router.get(
    '/detail',
    checkTokenAuth,
    validationMiddleware({
      query: {
        eggId: Joi.string().required(),
      },
    }),
    handlerMiddleware(async (req) => {
      return eggService.getEggDetail({
        eggId: req.query.eggId,
      });
    })
  );

  return router;
};

module.exports = eggRoutes;
