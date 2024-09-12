const assert = require('assert-plus');
const config = require('../../../configs/config');
const { ERROR_CODES } = require('../../../configs/constant');
const { AppError } = require('../../../utils/errors');

const checkAdminAuth = (req, res, next) => {
  try {
    const apiKey = req.headers['internal-api-key'];
    assert.string(apiKey, 'apiKey');

    if (apiKey !== config.INTERNAL_API_KEY) {
      throw new Error('Invalid api key');
    }
    next();
  } catch (error) {
    next(new AppError(ERROR_CODES.ERR_INVALID_TOKEN, {}, error.stack));
  }
};

module.exports = checkAdminAuth;
