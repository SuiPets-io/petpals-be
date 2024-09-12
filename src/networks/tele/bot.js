const TelegramBot = require('node-telegram-bot-api');

const config = require('../../configs/config');
const teleConfig = require('../../configs/tele.config');
const logger = require('../../utils/logger');
const startGameDb = require('../../models/user/userReferralDb');

let bot;

const init = async () => {
  bot = new TelegramBot(config.TELEBOT_TOKEN, {
    polling: true,
    request: {
      agentOptions: {
        keepAlive: true,
        family: 4,
      },
    },
  });

  // Listen for any message
  bot.on('message', async (msg) => {
    const chatId = msg?.chat?.id;
    const message = msg?.text;
    // let username = msg?.from?.username;

    // if (!message || !username) {
    //   logger.error('Can not find username');
    //   bot.sendMessage(chatId, 'Please setup your Telegram ID first!');
    // }

    if ((message || []).includes('/ping')) {
      // const referralCode = msg?.text?.split(' ')[1];
      // await startGameDb.updateOne(
      //   { chatId },
      //   {
      //     $set: {
      //       referralCode,
      //       status: teleConfig.START_GAME_STATUS.PENDING,
      //     },
      //   },
      //   { upsert: true }
      // );
      bot.sendMessage(chatId, 'Welcome to PetPats!');
    }
  });

  bot.on('polling_error', (error) => {
    logger.log('polling_error', error);
    logger.error('polling_error occurred:', error);
  });
  bot.on('error', (error) => {
    logger.log('error', error);
    logger.error('error:', error);
  });
};

const getChat = async (chatId) => {
  const chatInfo = await bot.getChat(chatId);
  return chatInfo;
};

const sendToAllChats = async (chatIds, message) => {
  chatIds.forEach((chatId) => {
    bot.sendMessage(chatId, message);
  });
};

module.exports = { init, getChat, sendToAllChats };
