const AsyncLock = require('async-lock');

const lock = new AsyncLock();

const asyncLockUtils = module.exports;

asyncLockUtils.lock = async (key, fn) => {
  let result;
  await lock.acquire(key, async (done) => {
    try {
      result = await fn();
      done();
    } catch (error) {
      done(error);
    }
  });
  return result;
};
