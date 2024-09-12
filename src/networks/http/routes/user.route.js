const express = require('express');
const Joi = require('joi');
const userService = require('../../../services/user/user.service');
const validationMiddleware = require('../middlewares/validation.middleware');
const handlerMiddleware = require('../middlewares/handle.middleware');
const checkTokenAuth = require('../middlewares/check-token-auth.middleware');
const { lock } = require('../../../utils/asyncLockUtils');

// @path:users
const userRoutes = () => {
  const router = express.Router();

  router.post(
    '/create-account-tele',
    validationMiddleware({
      body: {
        chatId: Joi.string().required(),
        hash: Joi.string().required(),
        username: Joi.string().allow('').optional(),
        firstname: Joi.string().allow('').optional(),
        lastname: Joi.string().allow('').optional(),
        publicAddress: Joi.string().required(),
        message: Joi.object().required(),
        signature: Joi.string().required(),
        referedCode: Joi.string().allow('').optional(),
      },
    }),
    handlerMiddleware(async (req) => {
      return userService.createAccountTele({
        chatId: req.body.chatId,
        hash: req.body.hash,
        username: req.body.username,
        firstname: req.body.firstname,
        lastname: req.body.lastname,
        publicAddress: req.body.publicAddress,
        message: req.body.message,
        signature: req.body.signature,
        referedCode: req.body.referedCode,
      });
    })
  );

  router.get(
    '/info',
    checkTokenAuth,
    handlerMiddleware(async (req) => {
      return userService.getUserInfo(req.user.publicAddress);
    })
  );

  router.get(
    '/config',
    checkTokenAuth,
    handlerMiddleware(async (req) => {
      return userService.config();
    })
  );

  router.post(
    '/claim-pps',
    checkTokenAuth,
    validationMiddleware({
      body: {
        pps: Joi.number().greater(0).required(),
        txHash: Joi.string().required(),
      },
    }),
    handlerMiddleware(async (req) => {
      return lock(`USER_${req.user.publicAddress}`, async () => {
        return userService.claimPps({
          publicAddress: req.user.publicAddress,
          pps: req.body.pps,
          txHash: req.body.txHash,
        });
      });
    })
  );

  return router;
};

module.exports = userRoutes;
