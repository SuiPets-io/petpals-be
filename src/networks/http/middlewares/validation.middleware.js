const Joi = require('joi');
const { ERROR_CODES } = require('../../../configs/constant');
const { AppError, parseError } = require('../../../utils/errors');
const logger = require('../../../utils/logger');

const validationMiddleware = (schema) => {
  return async (req, res, next) => {
    try {
      if (schema.query) {
        req.query = await Joi.object(schema.query)
          .options({ stripUnknown: true })
          .validateAsync(req.query);
      }
      if (schema.body) {
        req.body = await Joi.object(schema.body)
          .options({ stripUnknown: true })
          .validateAsync(req.body);
      }
      if (schema.params) {
        req.params = await Joi.object(schema.params)
          .options({ stripUnknown: true })
          .validateAsync(req.params);
      }
    } catch (error) {
      logger.error(error);
      return next(
        new AppError(ERROR_CODES.ERR_INVALID_DATA_INPUT, {}, error.stack)
      );
    }

    return next();
  };
};

module.exports = validationMiddleware;
