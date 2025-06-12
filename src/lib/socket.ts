import { io, Socket } from 'socket.io-client';

// WebSocket server configuration
const getSocketUrl = (): string => {
  // In production, use the deployed Railway server
  if (process.env.NODE_ENV === 'production') {
    return process.env.NEXT_PUBLIC_WEBSOCKET_URL || 'https://stellarush-server-production.up.railway.app';
  }

  // In development, use local server
  return process.env.NEXT_PUBLIC_WEBSOCKET_URL || 'http://localhost:3001';
};

// Socket.IO configuration
const socketConfig = {
  transports: ['websocket', 'polling'],
  timeout: 20000,
  forceNew: false,
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  maxReconnectionAttempts: 5,
  autoConnect: true,
};

// Create socket instance
let socket: Socket | null = null;

export const createSocket = (): Socket => {
  if (!socket) {
    const url = getSocketUrl();
    console.log('🚀 STELLARUSH: Connecting to WebSocket server:', url);

    socket = io(url, socketConfig);

    // Connection event handlers
    socket.on('connect', () => {
      console.log('✅ STELLARUSH: Connected to WebSocket server');
    });

    socket.on('connect_error', (error) => {
      console.error('❌ STELLARUSH: Connection error:', error);
    });

    socket.on('disconnect', (reason) => {
      console.warn('⚠️ STELLARUSH: Disconnected from server:', reason);
    });

    socket.on('reconnect', (attemptNumber) => {
      console.log('🔄 STELLARUSH: Reconnected to server (attempt:', attemptNumber, ')');
    });

    socket.on('reconnect_error', (error) => {
      console.error('🔄❌ STELLARUSH: Reconnection error:', error);
    });

    socket.on('reconnect_failed', () => {
      console.error('💀 STELLARUSH: Failed to reconnect to server');
    });
  }

  return socket;
};

export const getSocket = (): Socket | null => {
  return socket;
};

export const disconnectSocket = (): void => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

// WebSocket event types for type safety
export interface GameState {
  phase: 'waiting' | 'betting' | 'flying' | 'crashed';
  multiplier: number;
  roundId: string;
  startTime: number | null;
  endTime: number | null;
  playerCount: number;
}

export interface PlayerProfile {
  id: string;
  username: string;
  level: number;
  experience: number;
  totalWagered: number;
  totalWon: number;
  gamesPlayed: number;
  bestMultiplier: number;
  isOnline: boolean;
}

export interface ChatMessage {
  id: string;
  playerId: string;
  username: string;
  message: string;
  timestamp: number;
  type: 'user' | 'system' | 'auto';
}

export interface AutobetSettings {
  betAmount: number;
  autoCashOut: number;
  stopOnWin: boolean;
  stopOnLoss: boolean;
  stopWinAmount: number;
  stopLossAmount: number;
  numberOfBets: number;
  strategy: 'fixed' | 'martingale' | 'reverse-martingale' | 'fibonacci';
  martingaleMultiplier: number;
  maxBetAmount: number;
  minBetAmount: number;
}

// Hook for using WebSocket in React components
export const useSocket = () => {
  const socket = createSocket();

  const emit = (event: string, data?: any) => {
    if (socket.connected) {
      socket.emit(event, data);
    } else {
      console.warn('⚠️ Socket not connected, queuing event:', event);
    }
  };

  const on = (event: string, callback: (...args: any[]) => void) => {
    socket.on(event, callback);
  };

  const off = (event: string, callback?: (...args: any[]) => void) => {
    if (callback) {
      socket.off(event, callback);
    } else {
      socket.off(event);
    }
  };

  return {
    socket,
    emit,
    on,
    off,
    connected: socket.connected,
    connecting: socket.connecting,
  };
};

// Utility function to check server health
export const checkServerHealth = async (): Promise<boolean> => {
  try {
    const url = getSocketUrl();
    const response = await fetch(`${url}/health`);
    const data = await response.json();
    return data.status === 'ok';
  } catch (error) {
    console.error('❌ Health check failed:', error);
    return false;
  }
};

export default createSocket;
