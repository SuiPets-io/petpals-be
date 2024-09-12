require('module-alias/register');

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const config = require('./configs/config');
const db = require('./models/db');
const logger = require('./utils/logger');
const http = require('http');
const errorMiddleware = require('./networks/http/middlewares/error.middleware');
const userRoutes = require('./networks/http/routes/user.route');
const petRoutes = require('./networks/http/routes/pet.route');
const eggRoutes = require('./networks/http/routes/egg.route');
const adminRoutes = require('./networks/http/routes/admin.route');
const jobRunning = require('./jobs');
const Io = require('./networks/ws');
require('./libs/sui.lib');
const teleBot = require('./networks/tele/bot');
const teleBotNoti = require('./networks/tele/bot-noti');

const start = () => {
  const app = express();

  app.use(cors());
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: false }));
  // app.set('trust proxy', true)

  app.get('/health', (req, res) => {
    return res.json({ version: '1.0.0' });
  });

  app.use('/users', userRoutes());
  app.use('/pets', petRoutes());
  app.use('/eggs', eggRoutes());
  app.use('/admins', adminRoutes());

  app.use(errorMiddleware);

  const server = http.createServer(app);
  const io = new Io();

  Promise.all([db.init(), teleBot.init(), teleBotNoti.init()]).then(
    async () => {
      jobRunning.initAppJob();
      // jobRunning.init();
      server.listen(config.PORT, () => {
        logger.info(`HttpNetwork is running at port: ${config.PORT}`);
      });
      // io.startSocket(server, () =>
      //   console.log(`Socket is running at port: ${config.PORT}`)
      // );
    }
  );
};

start();
