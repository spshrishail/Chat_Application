import { io } from 'socket.io-client';

const SOCKET_URL = 'http://localhost:5000';

export const socket = io(SOCKET_URL, {
  autoConnect: false,
  withCredentials: true,
});

export const initializeSocket = (userId) => {
  if (userId) {
    socket.auth = { token: localStorage.getItem('token') };
    socket.connect();

    socket.on('connect', () => {
      console.log('Socket connected');
    });

    socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });
  }
};

export const disconnectSocket = () => {
  if (socket.connected) {
    socket.disconnect();
  }
};

export const sendMessage = (message) => {
  if (socket) socket.emit('send_message', message);
};

export const subscribeToMessages = (callback) => {
  if (socket) socket.on('receive_message', callback);
};

export const unsubscribeFromMessages = () => {
  if (socket) socket.off('receive_message');
};

export const subscribeToUserStatus = (callback) => {
  if (!socket) return;

  socket.on('user_status', ({ userId, status }) => {
    callback(userId, status);
  });
}; 