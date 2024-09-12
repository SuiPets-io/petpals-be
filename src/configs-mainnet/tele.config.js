const config = require('./config');
const teleConfig = module.exports;

teleConfig.LOGIN_VALIDATION_KEY = 'jfhjww12Sjdjhsb#@@edsj';

teleConfig.tele = {
  photo: 'https://ecosu.net/wp-content/uploads/2021/09/minigame-facebook.jpg',
  keyBoard: {
    text: 'Play Game',
    url: config.TELE_WEB_URL,
  },
  inlineKeyboard: {
    text: 'Play Game',
    url: config.TELE_WEB_URL,
  },
};

teleConfig.START_GAME_STATUS = {
  PENDING: 'pending',
  SUCCESS: 'success',
};
