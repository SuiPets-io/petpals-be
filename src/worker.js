require('dotenv').config();
const jobRunning = require('./jobs');
const db = require('./models/db');

const worker = async () => {
  await db.init();
  await jobRunning.init();
};

worker();
