const { AppError } = require('../../../utils/errors');
const assert = require('assert-plus');
const myJwt = require('../../../utils/jwt');
const config = require('../../../configs/config');
const { ERROR_CODES } = require('../../../configs/constant');

const authSocketMiddleware = module.exports;

authSocketMiddleware.checkTokenAuth = (socket, next) => {
  try {
    const bearerToken = socket.handshake.auth?.token || socket.handshake.headers.token;
    const user = myJwt.unSign(bearerToken, config.SECRET_KEY);
    assert.object(user, 'user');
    socket.data.user = user;
    next();
  } catch (error) {
    next(new AppError(ERROR_CODES.ERR_INVALID_TOKEN, {}, error.stack));
  }
};
