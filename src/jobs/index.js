require('module-alias/register');
const schedule = require('node-schedule');
const assert = require('assert-plus');
const { v4: uuidV4 } = require('uuid');
const timeoutAwait = require('../utils/timeoutAwait');
const { parseError } = require('../utils/errors');
const { JOB_TYPE } = require('../configs/constant');
const userJob = require('./user.job');
const petJob = require('./pet.job');
const eggJob = require('./egg.job');
const botAdminNotiJob = require('./bot-admin-noti.job');
const botNotiJob = require('./bot-noti.job');
const adminNotiDb = require('../models/user/adminNotiDb');

const logger = require('../utils/logger');

const jobRunning = module.exports;

/**
*    *    *    *    *    *
┬    ┬    ┬    ┬    ┬    ┬
│    │    │    │    │    │
│    │    │    │    │    └ day of week (0 - 7) (0 or 7 is Sun)
│    │    │    │    └───── month (1 - 12)
│    │    │    └────────── day of month (1 - 31)
│    │    └─────────────── hour (0 - 23)
│    └──────────────────── minute (0 - 59)
└───────────────────────── second (0 - 59, OPTIONAL)
 */

const jobs = [...petJob, ...userJob, ...eggJob];

const appJobs = [...botAdminNotiJob, ...botNotiJob];

jobRunning.init = () => {
  jobs
    .filter((item) => item.enable)
    .forEach(({ name, type, func, options }) => {
      if (type === JOB_TYPE.RECURRENCE) {
        jobRunning.runSchedule(name, options, func);
      } else {
        jobRunning.runJob(name, func, options);
      }
    });
};

jobRunning.initAppJob = () => {
  appJobs
    .filter((item) => item.enable)
    .forEach(({ name, type, func, options }) => {
      if (type === JOB_TYPE.RECURRENCE) {
        jobRunning.runSchedule(name, options, func);
      } else {
        jobRunning.runJob(name, func, options);
      }
    });
};

jobRunning.runJob = async (
  name,
  func,
  { errorTimeout = 30, nextRunning = 60 }
) => {
  assert.func(func, 'func');
  assert.string(name, 'name');
  assert.number(errorTimeout, 'errorTimeout');
  assert.number(nextRunning, 'nextRunning');

  while (true) {
    logger.info(`systemRunning.runJob-${name}`, { name });
    try {
      await func();
    } catch (error) {
      logger.error(`systemRunning.runJob-${name}`, {
        error: parseError(error),
      });
      await adminNotiDb.create({
        type: 'error',
        message: `Error job occur ${name}: ${JSON.stringify(parseError(error))}!`,
        status: 'pending',
      });
      await timeoutAwait(errorTimeout);
    }
    logger.info(`systemRunning.runJob-${name}-end`, { name });
    await timeoutAwait(nextRunning);
  }
};

jobRunning.runSchedule = (name, options, func) => {
  assert.func(func, 'func');
  assert.string(name, 'name');
  assert.object(options, 'options');
  const uuid = uuidV4();

  // logger.info(`systemRunning.runSchedule-init-${name}`, { id: uuid, name });
  schedule.scheduleJob(options, async () => {
    // logger.info(`systemRunning.runSchedule-${name}`, { id: uuid, name });
    try {
      await func();
    } catch (error) {
      logger.error(`systemRunning.runSchedule-${name}`, {
        id: uuid,
        error: parseError(error),
      });
      await adminNotiDb.create({
        type: 'error',
        message: `Error job occur ${name}: ${JSON.stringify(parseError(error))}!`,
        status: 'pending',
      });
    }
    // logger.info(`systemRunning.runSchedule-${name}-end`, { id: uuid, name });
  });
};
