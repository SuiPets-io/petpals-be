const geoip = require('geoip-lite');
const { ERROR_CODES } = require('../../../configs/constant');
const { AppError } = require('../../../utils/errors');
const userActivityLogDb = require('../../../models/user/userActivityLogDb');
const logger = require('../../../utils/logger');

const logActivity = async (req, res, next) => {
  try {
    let activity;

    if (req.url) {
      activity = req.url;
    }
    if (activity) {
      const ip = req.ip || req.headers['x-forwarded-for'];
      await userActivityLogDb.create({
        publicAddress: req?.user?.publicAddress,
        ip,
        location: ip ? geoip.lookup(ip) : {},
        activity,
      });
    }
    next();
  } catch (error) {
    logger.info(error);
    next(new AppError(ERROR_CODES.ERR_BAD_REQUEST));
  }
};

module.exports = logActivity;
