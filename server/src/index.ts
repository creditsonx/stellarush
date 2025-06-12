import express from 'express';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import cors from 'cors';
import { GameManager } from './game/GameManager';
import { ChatManager } from './chat/ChatManager';
import { PlayerManager } from './player/PlayerManager';
import { authMiddleware, rateLimiterMiddleware } from './middleware';
import { logger } from './utils/logger';

const app = express();
const server = createServer(app);

// CORS configuration for local development and production
const corsOptions = {
  origin: process.env.NODE_ENV === 'production'
    ? ['https://stellarush.netlify.app', 'https://creditsonx.github.io']
    : ['http://localhost:3000', 'http://127.0.0.1:3000'],
  methods: ['GET', 'POST'],
  credentials: true
};

app.use(cors(corsOptions));
app.use(express.json());

// Socket.IO setup with CORS
const io = new SocketIOServer(server, {
  cors: corsOptions,
  transports: ['websocket', 'polling'],
  pingTimeout: 60000,
  pingInterval: 25000,
});

// Initialize managers
const gameManager = new GameManager(io);
const chatManager = new ChatManager(io);
const playerManager = new PlayerManager(io);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    activeConnections: io.engine.clientsCount,
    activeGame: gameManager.isGameActive(),
    version: '1.0.0'
  });
});

// Game stats endpoint
app.get('/stats', (req, res) => {
  res.json({
    playersOnline: playerManager.getPlayerCount(),
    currentMultiplier: gameManager.getCurrentMultiplier(),
    gameState: gameManager.getGameState(),
    totalWagered: gameManager.getTotalWagered(),
    gamesPlayed: gameManager.getGamesPlayed(),
  });
});

// Socket connection handling
io.use(rateLimiterMiddleware);
io.use(authMiddleware);

io.on('connection', (socket) => {
  logger.info(`Player connected: ${socket.id}`);

  // Register player
  playerManager.addPlayer(socket);

  // Send initial game state
  socket.emit('gameState', gameManager.getGameState());
  socket.emit('playerStats', playerManager.getPlayerStats());

  // Game events
  socket.on('placeBet', (data) => {
    gameManager.handlePlaceBet(socket, data);
  });

  socket.on('cashOut', () => {
    gameManager.handleCashOut(socket);
  });

  socket.on('startAutobet', (settings) => {
    gameManager.handleStartAutobet(socket, settings);
  });

  socket.on('stopAutobet', () => {
    gameManager.handleStopAutobet(socket);
  });

  // Chat events
  socket.on('chatMessage', (message) => {
    chatManager.handleMessage(socket, message);
  });

  // Player events
  socket.on('updateProfile', (profile) => {
    playerManager.updateProfile(socket, profile);
  });

  socket.on('requestHistory', () => {
    socket.emit('gameHistory', gameManager.getGameHistory());
  });

  // Disconnect handling
  socket.on('disconnect', (reason) => {
    logger.info(`Player disconnected: ${socket.id}, reason: ${reason}`);
    playerManager.removePlayer(socket.id);
    gameManager.handlePlayerDisconnect(socket.id);
  });

  // Error handling
  socket.on('error', (error) => {
    logger.error(`Socket error for ${socket.id}:`, error);
  });
});

// Start game loop
gameManager.startGameLoop();

// Start server
const PORT = process.env.PORT || 3001;
const WS_PORT = process.env.WS_PORT || 3001;

server.listen(WS_PORT, () => {
  logger.info(`🚀 STELLARUSH WebSocket Server running on port ${WS_PORT}`);
  logger.info(`📊 Health check available at http://localhost:${WS_PORT}/health`);
  logger.info(`🎮 Game stats available at http://localhost:${WS_PORT}/stats`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('Received SIGTERM, shutting down gracefully');
  gameManager.stopGameLoop();
  server.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  logger.info('Received SIGINT, shutting down gracefully');
  gameManager.stopGameLoop();
  server.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
});

export { io, gameManager, chatManager, playerManager };
