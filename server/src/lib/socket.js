const { Server } = require('socket.io');

let ioInstance = null;

const initSocket = (httpServer) => {
  ioInstance = new Server(httpServer, {
    cors: {
      origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
      credentials: true,
    },
  });

  ioInstance.on('connection', (socket) => {
    socket.on('disconnect', () => {
      // no-op: connection lifecycle is handled by Socket.IO internals
    });
  });

  return ioInstance;
};

const getIO = () => ioInstance;

module.exports = {
  initSocket,
  getIO,
};
