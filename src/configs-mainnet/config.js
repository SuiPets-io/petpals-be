const config = {
  MONGO_ADDRESS: process.env.MONGO_ADDRESS,
  PORT: process.env.PORT,
  SECRET_KEY: process.env.SECRET_KEY,
  GAS_PRICE: process.env.GAS_PRICE,
  GAS: process.env.GAS,
  TURN_ON_CAPTCHA:
    process.env.TURN_ON_CAPTCHA?.trim() === 'true' ? true : false,
  RECAPTCHA_SITE_SECRET: process.env.RECAPTCHA_SITE_SECRET,
  CORS_WEBSOCKET: process.env.CORS_WEBSOCKET,
  INTERNAL_API_KEY: process.env.INTERNAL_API_KEY,

  RPC_SUI: process.env.RPC_SUI,

  TELEBOT_TOKEN: process.env.TELEBOT_TOKEN,
  TELE_WEB_URL: process.env.TELE_WEB_URL,
  TELE_BOT_NAME: process.env.TELE_BOT_NAME,

  TELEBOT_NOTI_TOKEN: process.env.TELEBOT_NOTI_TOKEN,
  BOT_NOTI_GROUP_ID: process.env.BOT_NOTI_GROUP_ID,

  ADMIN_SEED: process.env.ADMIN_SEED,
  ADMIN_WALLET_ADDRESS: process.env.ADMIN_WALLET_ADDRESS,
  ADMIN_PRIVATE_KEY: process.env.ADMIN_PRIVATE_KEY,
  ADMIN_BONUS_SUI_ADDRESS: process.env.ADMIN_BONUS_SUI_ADDRESS,
  ADMIN_BONUS_SUI_PRIVATE_KEY: process.env.ADMIN_BONUS_SUI_PRIVATE_KEY,

  PPS_CONTRACT_ADDRESS: process.env.PPS_CONTRACT_ADDRESS,

  IS_OPEN_FREE_EGG: process.env.IS_OPEN_FREE_EGG === 'true' ? true : false,
  IS_OPEN_CLAIM_PPS: process.env.IS_OPEN_CLAIM_PPS === 'true' ? true : false,
  IS_BONUS_GROWTH_EGG:
      process.env.IS_BONUS_GROWTH_EGG === 'true' ? true : false,


  ADMIN_CHAT_ID: process.env.ADMIN_CHAT_ID
      ? process.env.ADMIN_CHAT_ID.split(',').map((item) => item.trim())
      : [],
};

module.exports = config;
