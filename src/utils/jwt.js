const jwt = require('jsonwebtoken');

const jwtUtils = module.exports;

jwtUtils.sign = (data, SECRET_KEY, EXPIRED_TIME) => {
  try {
    if (EXPIRED_TIME) {
      return jwt.sign(data, SECRET_KEY, { expiresIn: EXPIRED_TIME });
    }
    return jwt.sign(data, SECRET_KEY);
  } catch (error) {
    return false;
  }
};

jwtUtils.unSign = (token, SECRET_KEY) => {
  try {
    return jwt.verify(token, SECRET_KEY);
  } catch (error) {
    return false;
  }
};
