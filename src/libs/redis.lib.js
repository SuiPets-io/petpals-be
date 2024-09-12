// const { createClient } = require('redis');
// const config = require('../configs/config');
// const logger = require('../utils/logger');

// const redisClient = createClient({
//     url: config.REDIS_ADDRESS,
// });

// const initRedis = () => {
//     redisClient.on('error', err => logger.log(err));
//     return redisClient.connect().then(() => console.log('Redis connected'));
// };

// const cache = {
//     get: async key => {
//         try {
//             const data = await redisClient.get(`${key}`);

//             if (!data) {
//                 return null;
//             }

//             return JSON.parse(data);
//         } catch (error) {
//             logger.warn('Caching error...', error);
//             return null;
//         }
//     },
//     set: async (key, payload, ss) => {
//         try {
//             await redisClient.set(`${key}`, JSON.stringify(payload), {
//                 EX: ss,
//             });

//             return payload;
//         } catch (error) {
//             logger.warn('Set Caching error...', error);
//             return payload;
//         }
//     },
// };

// module.exports = {
//     initRedis,
//     redisClient,
//     cache
// };
