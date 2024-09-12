const { Server } = require('socket.io');
const wsConfig = require('../../configs/ws.config');
const config = require('../../configs/config');
const { ERROR_CODES } = require('../../configs/constant');
const { checkTokenAuth } = require('./middlewares/auth.middleware');
const logger = require('../../utils/logger');

class Io {
  static io = new Server();
  async wrapErrorHandler(socket, func) {
    try {
      await func();
    } catch (err) {
      logger.log(err);
      return socket.emit(
        wsConfig.EVENT_SOCKET_NAME.ERROR,
        new AppError(ERROR_CODES.ERR_EXCEPTION, 'Something wrong'),
      );
    }
  }

  async startSocket(httpServer, fn = () => {}) {
    Io.io = new Server(httpServer, {
      cors: {
        origin: config.CORS_WEBSOCKET,
      },
    });

    const globalNamespace = Io.io.of('/global');
    globalNamespace.use(checkTokenAuth).on('connection', (socket) => {
      socket.join(socket.data.user.chatId);
      logger.log(`User ${socket.data.user.chatId} connected to global namespace`);
        
      // Handle disconnection
      socket.on('disconnect', () => {
        logger.log(`User ${socket.data.user.chatId} disconnected from global namespace`);
        socket.leave(socket.data.user.chatId);
      });
    });
    fn();
  }
}

module.exports = Io;