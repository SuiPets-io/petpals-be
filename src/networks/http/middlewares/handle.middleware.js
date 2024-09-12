const { ERROR_CODES } = require('../../../configs/constant');

const handlerMiddleware = (handler) => {
  return async (req, res, next) => {
    try {
      const data = await handler(req, res, next);
      const response = { status: ERROR_CODES.ERR_SUCCESS, data };
      res.json(response);
    } catch (error) {
      next(error);
    }
  };
};

module.exports = handlerMiddleware;
