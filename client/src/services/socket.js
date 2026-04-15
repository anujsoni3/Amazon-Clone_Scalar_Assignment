import { io } from 'socket.io-client';

let socket;

const resolveSocketUrl = () => {
  const apiUrl = import.meta.env.VITE_API_URL;
  if (apiUrl && apiUrl.includes('/api')) {
    return apiUrl.replace(/\/api\/?$/, '');
  }
  return import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';
};

export const getSocket = () => {
  if (!socket) {
    socket = io(resolveSocketUrl(), {
      transports: ['websocket'],
      withCredentials: true,
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    });
  }

  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = undefined;
  }
};
