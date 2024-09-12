const mongoose = require('mongoose');
const logger = require('../utils/logger');
const config = require('../configs/config');
const readline = require('readline');

async function askQuestion(query) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  console.clear();
  return new Promise((resolve) =>
    rl.question(query, (ans) => {
      rl.close();
      resolve(ans);
    })
  );
}

const db = {};

db.stop = async () => {
  await mongoose.disconnect();
};

db.init = async () => {
  if (
    /admin/.test(process.env.MONGO_ADDRESS) &&
    process.env.ENVIROMENT === 'local'
  ) {
    const ans = await askQuestion(
      'Are you sure you want to run on db PRODUCTION? (y/n) \n'
    );
    if (ans !== 'y') throw new Error('You not press y');
  }
  logger.info('connecting to db...');
  await mongoose.connect(config.MONGO_ADDRESS, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    autoIndex: true,
  });
  logger.info('db connected!');
};

module.exports = db;
