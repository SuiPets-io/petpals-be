const commonUtils = require('../../utils/common');
const userDb = require('../../models/user/userDb');
const jwtUtils = require('../../utils/jwt');
const config = require('../../configs/config');
const teleConfig = require('../../configs/tele.config');
const axios = require('axios');

const userHelper = module.exports;

userHelper.generateToken = (inputData, expiredTime) => {
  const jwt = jwtUtils.sign(inputData, config.SECRET_KEY, expiredTime);
  return jwt;
};

userHelper.validateCaptcha = async (captchaValue) => {
  const captchaURL = `https://www.google.com/recaptcha/api/siteverify?secret=${config.RECAPTCHA_SITE_SECRET}&response=${captchaValue}`;
  const { data } = await axios.post(captchaURL);
  return data?.success;
};

userHelper.createHash = (chatId) => {
  const key =
    teleConfig.LOGIN_VALIDATION_KEY +
    (chatId[6] || 0) +
    (chatId[1] || 0) +
    (chatId[2] || 0) +
    (chatId[3] || 0) +
    (chatId[4] || 0) +
    (chatId[5] || 0) +
    (chatId[7] || 0);
  return Buffer.from(key, 'utf8').toString('base64');
};

userHelper.compareLoginHash = (chatId, hash) => {
  const hashCheck = userHelper.createHash(chatId);
  return hash === hashCheck;
};
