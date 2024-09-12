const express = require('express');
const Joi = require('joi');
const petService = require('../../../services/pet/pet.service');
const validationMiddleware = require('../middlewares/validation.middleware');
const handlerMiddleware = require('../middlewares/handle.middleware');
const checkTokenAuth = require('../middlewares/check-token-auth.middleware');
const handlePaginationMiddleware = require('../middlewares/handle-pagination.middleware');
const petConfig = require('../../../configs/pet.config');
const eggConfig = require('../../../configs/egg.config');
const { lock } = require('../../../utils/asyncLockUtils');
const { customJoi } = require('../../../utils/schemaUtils');

// @path:pets
const petRoutes = () => {
  const router = express.Router();

  router.post(
    '/edit-pet',
    checkTokenAuth,
    validationMiddleware({
      body: {
        petId: Joi.string().required(),
        name: Joi.string().optional(),
        isOpenAuto: Joi.boolean().optional(),
        isReadGrowthBonus: Joi.boolean().optional(),
      },
    }),
    handlerMiddleware(async (req) => {
      return petService.editPet({
        publicAddress: req.user.publicAddress,
        petId: req.body.petId,
        name: req.body.name,
        isOpenAuto: req.body.isOpenAuto,
        isReadGrowthBonus: req.body.isReadGrowthBonus,
      });
    })
  );

  router.post(
    '/claim-free-item',
    checkTokenAuth,
    validationMiddleware({
      body: {
        petId: Joi.string().required(),
      },
    }),
    handlerMiddleware(async (req) => {
      return petService.claimFreeItem({
        publicAddress: req.user.publicAddress,
        petId: req.body.petId,
      });
    })
  );

  router.post(
    '/buy-pet-slot',
    checkTokenAuth,
    validationMiddleware({
      body: {
        txHash: Joi.string().required(),
        position: Joi.number()
          .valid(...petConfig.PET_POSITION)
          .required(),
      },
    }),
    handlerMiddleware(async (req) => {
      return lock(`PET_${req.user.publicAddress}`, async () => {
        return petService.buyPetSlot({
          publicAddress: req.user.publicAddress,
          txHash: req.body.txHash,
          position: req.body.position,
        });
      });
    })
  );

  router.post(
    '/put-egg',
    checkTokenAuth,
    validationMiddleware({
      body: {
        eggId: Joi.string().required(),
        name: Joi.string().optional(),
        position: Joi.number()
          .valid(...petConfig.PET_POSITION)
          .required(),
      },
    }),
    handlerMiddleware(async (req) => {
      return lock(`PET_${req.user.publicAddress}`, async () => {
        return petService.putEgg({
          publicAddress: req.user.publicAddress,
          eggId: req.body.eggId,
          name: req.body.name,
          position: req.body.position,
        });
      });
    })
  );

  router.get(
    '/get-my-pet',
    checkTokenAuth,
    handlerMiddleware(async (req) => {
      return petService.getMyPet({
        publicAddress: req.user.publicAddress,
      });
    })
  );

  router.get(
    '/get-pet-detail',
    checkTokenAuth,
    validationMiddleware({
      query: {
        petId: Joi.string().required(),
      },
    }),
    handlerMiddleware(async (req) => {
      return petService.getPetDetail({
        publicAddress: req.user.publicAddress,
        petId: req.query.petId,
      });
    })
  );

  router.get(
    '/leaderboard',
    checkTokenAuth,
    handlerMiddleware(async (req) => {
      return petService.getLeaderBoard(req.user.publicAddress);
    })
  );

  router.get(
    '/config',
    checkTokenAuth,
    handlerMiddleware(async (req) => {
      return petService.getPetConfig();
    })
  );

  router.get(
    '/price-config',
    checkTokenAuth,
    handlerMiddleware(async (req) => {
      return petService.getPriceConfig();
    })
  );

  router.post(
    '/buy-item',
    checkTokenAuth,
    validationMiddleware({
      body: {
        itemNumber: Joi.number().required(),
        name: Joi.string()
          .valid(
            ...Object.values(petConfig.FOOD_NAME),
            ...Object.values(petConfig.TOILET_NAME),
            ...Object.values(petConfig.ENTERTAINMENT_NAME)
          )
          .required(),
        txHash: Joi.string().required(),
      },
    }),
    handlerMiddleware(async (req) => {
      return lock(`PET_${req.user.publicAddress}`, async () => {
        return petService.buyItem({
          publicAddress: req.user.publicAddress,
          itemNumber: req.body.itemNumber,
          name: req.body.name,
          txHash: req.body.txHash,
        });
      });
    })
  );

  router.post(
    '/do-activity',
    checkTokenAuth,
    validationMiddleware({
      body: {
        petId: Joi.string().required(),
        name: Joi.string()
          .valid(
            ...Object.values(petConfig.FOOD_NAME),
            ...Object.values(petConfig.TOILET_NAME),
            ...Object.values(petConfig.ENTERTAINMENT_NAME)
          )
          .required(),
      },
    }),
    handlerMiddleware(async (req) => {
      return lock(`PET_${req.user.publicAddress}`, async () => {
        return petService.doActivity({
          publicAddress: req.user.publicAddress,
          petId: req.body.petId,
          name: req.body.name,
        });
      });
    })
  );

  router.post(
    '/harvest',
    checkTokenAuth,
    validationMiddleware({
      body: {
        petId: Joi.string().required(),
        pps: Joi.number().required(),
      },
    }),
    handlerMiddleware(async (req) => {
      return lock(`PET_${req.user.publicAddress}`, async () => {
        return petService.harvest({
          publicAddress: req.user.publicAddress,
          petId: req.body.petId,
          pps: req.body.pps,
        });
      });
    })
  );

  router.post(
    '/active-fusion',
    checkTokenAuth,
    validationMiddleware({
      body: {
        position: Joi.number()
          .valid(...petConfig.PET_POSITION)
          .required(),
        txHash: Joi.string().required(),
      },
    }),
    handlerMiddleware(async (req) => {
      return lock(`PET_${req.user.publicAddress}`, async () => {
        return petService.activeFusionMode({
          publicAddress: req.user.publicAddress,
          position: req.body.position,
          txHash: req.body.txHash,
        });
      });
    })
  );

  router.post(
    '/fusion',
    checkTokenAuth,
    validationMiddleware({
      body: {
        receivePetId: Joi.string().required(),
        givePetId: Joi.string().required(),
        txHash: Joi.string().required(),
      },
    }),
    handlerMiddleware(async (req) => {
      return lock(`PET_${req.user.publicAddress}`, async () => {
        return petService.fusion({
          publicAddress: req.user.publicAddress,
          receivePetId: req.body.receivePetId,
          givePetId: req.body.givePetId,
          txHash: req.body.txHash,
        });
      });
    })
  );

  router.post(
    '/reset-pet',
    checkTokenAuth,
    validationMiddleware({
      body: {
        position: Joi.number()
          .valid(...petConfig.PET_POSITION)
          .required(),
        txHash: Joi.string().required(),
      },
    }),
    handlerMiddleware(async (req) => {
      return lock(`PET_${req.user.publicAddress}`, async () => {
        return petService.resetPet({
          publicAddress: req.user.publicAddress,
          position: req.body.position,
          txHash: req.body.txHash,
        });
      });
    })
  );

  router.post(
    '/open-give-mode',
    checkTokenAuth,
    validationMiddleware({
      body: {
        position: Joi.number()
          .valid(...petConfig.PET_POSITION)
          .required(),
        amount: Joi.number().required(),
      },
    }),
    handlerMiddleware(async (req) => {
      return lock(`PET_${req.user.publicAddress}`, async () => {
        return petService.openGiveMode({
          publicAddress: req.user.publicAddress,
          position: req.body.position,
          amount: req.body.amount,
        });
      });
    })
  );

  router.post(
    '/cancel-give-mode',
    checkTokenAuth,
    validationMiddleware({
      body: {
        position: Joi.number()
          .valid(...petConfig.PET_POSITION)
          .required(),
      },
    }),
    handlerMiddleware(async (req) => {
      return lock(`PET_${req.user.publicAddress}`, async () => {
        return petService.cancelGiveMode({
          publicAddress: req.user.publicAddress,
          position: req.body.position,
        });
      });
    })
  );

  router.post(
    '/active-auto',
    checkTokenAuth,
    validationMiddleware({
      body: {
        position: Joi.number()
          .valid(...petConfig.PET_POSITION)
          .required(),
        txHash: Joi.string().required(),
      },
    }),
    handlerMiddleware(async (req) => {
      return lock(`PET_${req.user.publicAddress}`, async () => {
        return petService.activeAuto({
          publicAddress: req.user.publicAddress,
          position: req.body.position,
          txHash: req.body.txHash,
        });
      });
    })
  );

  router.post(
    '/claim-pps',
    checkTokenAuth,
    validationMiddleware({
      body: {
        position: Joi.number()
          .valid(...petConfig.PET_POSITION)
          .required(),
        pps: Joi.number().positive(),
        txHash: Joi.string().required(),
      },
    }),
    handlerMiddleware(async (req) => {
      return lock(`PET_${req.user.publicAddress}`, async () => {
        return petService.claimPps({
          publicAddress: req.user.publicAddress,
          position: req.body.position,
          pps: req.body.pps,
          txHash: req.body.txHash,
        });
      });
    })
  );

  router.get(
    '/fusion/detail',
    checkTokenAuth,
    validationMiddleware({
      query: {
        petId: Joi.string().required(),
      },
    }),
    handlerMiddleware(async (req) => {
      return petService.getPetFusionDetail({
        petId: req.query.petId,
      });
    })
  );

  router.get(
    '/fusion/list',
    checkTokenAuth,
    validationMiddleware({
      query: {
        rarities: customJoi
          .array()
          .items(Joi.string().valid(...Object.values(eggConfig.RARITY))),
        priceSort: Joi.number().valid(-1, 1),
        offset: Joi.number().default(0),
        limit: Joi.number().default(20),
        petType: Joi.string().valid(...Object.values(petConfig.PET_TYPE)),
      },
    }),
    handlePaginationMiddleware(async (req) => {
      return petService.getPetFusionList({
        publicAddress: req.user.publicAddress,
        rarities: req.query.rarities,
        priceSort: req.query.priceSort,
        offset: req.query.offset,
        limit: req.query.limit,
        petType: req.query.petType,
      });
    })
  );
  return router;
};

module.exports = petRoutes;
