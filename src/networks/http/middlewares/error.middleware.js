require('module-alias/register');

const { AppError, parseError } = require('../../../utils/errors');
const { ERROR_CODES } = require('../../../configs/constant');
const logger = require('../../../utils/logger');
const adminNotiDb = require('../../../models/user/adminNotiDb');

const errorMiddleware = async (err, req, res, next) => {
  if (err instanceof AppError) {
    // logger.info('CLIENT_ERROR', { error: err, path: req.path });
    return res.status(400).json({ status: err.status, data: err.data });
  }
  logger.error('SERVER_ERROR', {
    error: parseError(err),
  });
  await adminNotiDb.create({
    type: 'error',
    message: `Error occur: ${JSON.stringify(parseError(err))}!`,
    status: 'pending',
  });
  return res.status(500).json({ status: ERROR_CODES.ERR_EXCEPTION });
};

module.exports = errorMiddleware;
