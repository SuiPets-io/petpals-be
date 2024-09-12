const { ERROR_CODES } = require('../../../configs/constant');

const handlerPaginationMiddleware = handler => {
  return async (req, res, next) => {
    try {
      const { data, total } = await handler(req, res, next);
      const response = { status: ERROR_CODES.ERR_SUCCESS, data, total };
      res.json(response);
    } catch (error) {
      next(error);
    }
  };
};

module.exports = handlerPaginationMiddleware;
