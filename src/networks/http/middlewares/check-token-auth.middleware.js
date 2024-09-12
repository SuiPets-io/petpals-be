const { ERROR_CODES } = require('../../../configs/constant');
const myJwt = require('../../../utils/jwt');
const config = require('../../../configs/config');
const logger = require('../../../utils/logger');
const { AppError } = require('../../../utils/errors');
const userDb = require('../../../models/user/userDb');

const checkTokenAuth = async (req, res, next) => {
  try {
    const bearerHeader = req.headers.authorization;
    if (typeof bearerHeader !== 'string') {
      logger.error('Error: Invalid token');
      return res.status(400).send({
        status: ERROR_CODES.ERR_INVALID_TOKEN,
        data: 'Invalid token',
      });
    }

    const bearer = bearerHeader.split(' ');
    if (bearer.length < 2) {
      logger.error('Error: Invalid token');
      return res.status(400).send({
        status: ERROR_CODES.ERR_INVALID_TOKEN,
        data: 'Invalid token',
      });
    }
    const bearerToken = bearer[bearer.length - 1];
    const user = myJwt.unSign(bearerToken, config.SECRET_KEY);

    if (typeof user !== 'object') {
      logger.error('Error: Token is invalid');
      return res.status(400).send({
        status: ERROR_CODES.ERR_INVALID_TOKEN,
        data: 'Invalid token',
      });
    }

    const checkUser = await userDb.findOne({
      publicAddress: user.publicAddress,
    });
    if (checkUser && checkUser.isCheat) {
      logger.error('User is cheating', user.publicAddress);
      return res
        .status(400)
        .send({ status: ERROR_CODES.ERR_CHEATING, data: {} });
    }

    req.user = user;
    next();
  } catch (error) {
    next(new AppError(ERROR_CODES.ERR_INVALID_TOKEN, {}, error.stack));
  }
};

module.exports = checkTokenAuth;
