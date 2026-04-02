import { io, Socket } from 'socket.io-client';

const API_URL = import.meta.env.VITE_API_URL || 'http://192.168.206.171:3001';

let socket: Socket | null = null;

export function getSocket(): Socket {
  const token = localStorage.getItem('accessToken');

  if (!socket) {
    socket = io(API_URL, {
      auth: { token },
      autoConnect: false,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });
  }

  return socket;
}

export function connectSocket(): Socket {
  const s = getSocket();
  const token = localStorage.getItem('accessToken');

  // 항상 최신 토큰으로 업데이트
  s.auth = { token };

  if (!s.connected) {
    s.connect();
  }

  return s;
}

export function disconnectSocket(): void {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
