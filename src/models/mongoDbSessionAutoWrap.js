const mongoose = require('mongoose');

/**
 * Util function for mongoose (MongoDB) session to ensure
 * the session and transaction are commit/abort and end in the right way.
 *
 * This function will return or throw base on the callback function.
 *
 * @param {Function} fn
 *
 * @example
 * await mongoDbSessionAutoWrap(async mongoSession => {
 *   await ModelA.insertMany(documents, { session: mongoSession });
 *   await ModelB.insertMany(documents, { session: mongoSession });
 * });
 */
const mongoDbSessionAutoWrap = async fn => {
  const session = await mongoose.startSession();
  let rs;
  return session
    .withTransaction(async () => {
      rs = await fn(session);
    })
    .then(() => rs);
};

module.exports = mongoDbSessionAutoWrap;
