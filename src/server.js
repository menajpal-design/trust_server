const http = require('http');
const { Server } = require('socket.io');
const app = require('./app');
const env = require('./config/env');
const connectDB = require('./config/database');
const logger = require('./utils/logger');
const initChatSockets = require('./modules/chat/chat.socket');
const seedSuperAdmin = require('./utils/seedSuperAdmin');

const startServer = async () => {
  await connectDB();

  // Automatic Initialization: Seed Primary Super Admin if none exists
  await seedSuperAdmin();

  const server = http.createServer(app);

  const io = new Server(server, {
    cors: {
      origin: env.CLIENT_URL,
      credentials: true
    }
  });

  // Initialize Socket.io Chat Events & Connection Listeners
  initChatSockets(io);

  server.listen(env.PORT, () => {
    logger.info(`Server running in ${env.NODE_ENV} mode on port ${env.PORT} with Socket.io enabled`);
  });
};

startServer();
