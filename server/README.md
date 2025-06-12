# STELLARUSH WebSocket Server

A production-ready WebSocket server for the STELLARUSH crash game with real-time game state synchronization, room management, and comprehensive monitoring.

## Features

- **Real-time WebSocket Communication**: Low-latency game state updates
- **Room-based Game Sessions**: Multiple concurrent game rooms
- **Comprehensive Rate Limiting**: DDoS protection and abuse prevention
- **Advanced Logging**: Structured logging with Winston
- **Input Validation**: Joi-based request validation
- **Security Features**: Helmet, CORS, and input sanitization
- **Health Monitoring**: Built-in health checks and metrics
- **TypeScript**: Full type safety throughout the codebase

## Architecture

```
server/
 src/
   ├── types/           # TypeScript type definitions
   ├── services/        # Core business logic
   │   ├── gameEngine.ts    # Crash game logic
   │   ├── roomManager.ts   # Room management
   │   └── rateLimiter.ts   # Rate limiting
   ├── events/          # WebSocket event handlers
   ├── utils/           # Utilities and helpers
   │   ├── logger.ts        # Winston logging setup
   │   └── validation.ts    # Joi validation schemas
   └── index.ts         # Main server entry point
 logs/                # Log files (auto-created)
 dist/                # Compiled JavaScript (auto-created)
 package.json
```

## Quick Start

### Installation

```bash
# Install dependencies
bun install

# Copy environment variables
cp .env.example .env

# Edit configuration
nano .env
```

### Development

```bash
# Start in development mode with hot reload
bun run dev

# Build for production
bun run build

# Start production server
bun start

# Run linting
bun run lint
```

## Configuration

Environment variables in `.env`:

```env
# Server Configuration
NODE_ENV=development
PORT=3001
WS_PORT=3002

# Rate Limiting
MAX_CONNECTIONS=1000
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=100

# Timing
HEARTBEAT_INTERVAL_MS=30000
GAME_TICK_INTERVAL_MS=100

# Logging
LOG_LEVEL=info

# CORS
CORS_ORIGINS=http://localhost:3000,http://localhost:3001
```

## WebSocket Events

### Client → Server

| Event | Description | Data |
|-------|-------------|------|
| `player_join` | Join a game room | `{ roomId: string, username: string, wallet?: string }` |
| `place_bet` | Place a bet | `{ amount: number, autoCashOut?: number }` |
| `cash_out` | Cash out current bet | `{}` |
| `chat_message` | Send chat message | `{ message: string }` |
| `ping` | Heartbeat | `{}` |

### Server → Client

| Event | Description | Data |
|-------|-------------|------|
| `player_join` | Player joined | `{ player: Player }` |
| `player_leave` | Player left | `{ playerId: string }` |
| `game_start` | Game round started | `{ gameRound: GameRound }` |
| `game_crash` | Game crashed | `{ crashPoint: number, winners: CashOut[], losers: string[] }` |
| `multiplier_update` | Real-time multiplier | `{ multiplier: number, gameTime: number }` |
| `place_bet` | Bet placed | `{ bet: Bet }` |
| `cash_out` | Player cashed out | `{ cashOut: CashOut }` |
| `chat_message` | Chat message | `{ message: ChatMessage }` |
| `error` | Error occurred | `{ error: string, details?: string }` |
| `pong` | Heartbeat response | `{}` |

## Game Flow

1. **Betting Phase** (10 seconds)
   - Players can place bets
   - Multiplier starts at 1.00x

2. **Running Phase** (Variable duration)
   - Multiplier increases exponentially
   - Players can cash out at any time
   - Auto cash-out triggers automatically

3. **Crash** (Instant)
   - Game ends at predetermined crash point
   - Winners get their payout
   - Losers lose their bet

4. **Cooldown** (3 seconds)
   - Show results
   - Prepare for next round

## API Endpoints

### Health Check
```
GET /health
```
Response:
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 123.45,
  "connections": 42
}
```

### Server Stats
```
GET /stats
```
Response:
```json
{
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 123.45,
  "connections": 42,
  "activeRooms": 1,
  "memoryUsage": {
    "rss": 64,
    "heapUsed": 32,
    "heapTotal": 48,
    "external": 8
  }
}
```

### Room List
```
GET /rooms
```
Response:
```json
{
  "rooms": [
    {
      "id": "room-uuid",
      "name": "Main Room",
      "playerCount": 15,
      "maxPlayers": 100,
      "isActive": true
    }
  ]
}
```

## Security Features

- **Rate Limiting**: Prevents spam and abuse
- **Input Validation**: Joi schemas validate all inputs
- **XSS Protection**: Input sanitization
- **CORS**: Configurable origin whitelist
- **Helmet**: Security headers
- **Logging**: Security event monitoring

## Monitoring & Logging

Logs are written to the `logs/` directory:

- `all.log` - All log entries
- `error.log` - Error messages only
- `game.log` - Game-specific events
- `connections.log` - Connection events
- `security.log` - Security events
- `exceptions.log` - Unhandled exceptions
- `rejections.log` - Unhandled promise rejections

Log levels: `error`, `warn`, `info`, `http`, `debug`

## Performance

- **WebSocket Connections**: Supports 1000+ concurrent connections
- **Memory Usage**: Optimized for low memory footprint
- **CPU Usage**: Efficient event-driven architecture
- **Latency**: Sub-100ms message processing

## Production Deployment

### Using PM2

```bash
# Install PM2
npm install -g pm2

# Build the project
bun run build

# Start with PM2
pm2 start dist/index.js --name stellarush-server

# Monitor
pm2 monit

# View logs
pm2 logs stellarush-server
```

### Using Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY dist/ ./dist/
EXPOSE 3001
CMD ["node", "dist/index.js"]
```

## Testing

```bash
# Run unit tests
bun test

# Run with coverage
bun test --coverage

# Load testing with WebSocket connections
# (Use tools like Artillery or custom scripts)
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Run linting: `bun run lint`
6. Submit a pull request

## License

MIT License - see LICENSE file for details.
EOF  
cd /home/project && cd solana-crash-game/server && cat > README.md << 'EOF'
# STELLARUSH WebSocket Server

A production-ready WebSocket server for the STELLARUSH crash game with real-time game state synchronization, room management, and comprehensive monitoring.

## Features

- **Real-time WebSocket Communication**: Low-latency game state updates
- **Room-based Game Sessions**: Multiple concurrent game rooms
- **Comprehensive Rate Limiting**: DDoS protection and abuse prevention
- **Advanced Logging**: Structured logging with Winston
- **Input Validation**: Joi-based request validation
- **Security Features**: Helmet, CORS, and input sanitization
- **Health Monitoring**: Built-in health checks and metrics
- **TypeScript**: Full type safety throughout the codebase

## Architecture

```
server/
 src/
   ├── types/           # TypeScript type definitions
   ├── services/        # Core business logic
   │   ├── gameEngine.ts    # Crash game logic
   │   ├── roomManager.ts   # Room management
   │   └── rateLimiter.ts   # Rate limiting
   ├── events/          # WebSocket event handlers
   ├── utils/           # Utilities and helpers
   │   ├── logger.ts        # Winston logging setup
   │   └── validation.ts    # Joi validation schemas
   └── index.ts         # Main server entry point
 logs/                # Log files (auto-created)
 dist/                # Compiled JavaScript (auto-created)
 package.json
```

## Quick Start

### Installation

```bash
# Install dependencies
bun install

# Copy environment variables
cp .env.example .env

# Edit configuration
nano .env
```

### Development

```bash
# Start in development mode with hot reload
bun run dev

# Build for production
bun run build

# Start production server
bun start

# Run linting
bun run lint
```

## Configuration

Environment variables in `.env`:

```env
# Server Configuration
NODE_ENV=development
PORT=3001
WS_PORT=3002

# Rate Limiting
MAX_CONNECTIONS=1000
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=100

# Timing
HEARTBEAT_INTERVAL_MS=30000
GAME_TICK_INTERVAL_MS=100

# Logging
LOG_LEVEL=info

# CORS
CORS_ORIGINS=http://localhost:3000,http://localhost:3001
```

## WebSocket Events

### Client → Server

| Event | Description | Data |
|-------|-------------|------|
| `player_join` | Join a game room | `{ roomId: string, username: string, wallet?: string }` |
| `place_bet` | Place a bet | `{ amount: number, autoCashOut?: number }` |
| `cash_out` | Cash out current bet | `{}` |
| `chat_message` | Send chat message | `{ message: string }` |
| `ping` | Heartbeat | `{}` |

### Server → Client

| Event | Description | Data |
|-------|-------------|------|
| `player_join` | Player joined | `{ player: Player }` |
| `player_leave` | Player left | `{ playerId: string }` |
| `game_start` | Game round started | `{ gameRound: GameRound }` |
| `game_crash` | Game crashed | `{ crashPoint: number, winners: CashOut[], losers: string[] }` |
| `multiplier_update` | Real-time multiplier | `{ multiplier: number, gameTime: number }` |
| `place_bet` | Bet placed | `{ bet: Bet }` |
| `cash_out` | Player cashed out | `{ cashOut: CashOut }` |
| `chat_message` | Chat message | `{ message: ChatMessage }` |
| `error` | Error occurred | `{ error: string, details?: string }` |
| `pong` | Heartbeat response | `{}` |

## Game Flow

1. **Betting Phase** (10 seconds)
   - Players can place bets
   - Multiplier starts at 1.00x

2. **Running Phase** (Variable duration)
   - Multiplier increases exponentially
   - Players can cash out at any time
   - Auto cash-out triggers automatically

3. **Crash** (Instant)
   - Game ends at predetermined crash point
   - Winners get their payout
   - Losers lose their bet

4. **Cooldown** (3 seconds)
   - Show results
   - Prepare for next round

## API Endpoints

### Health Check
```
GET /health
```
Response:
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 123.45,
  "connections": 42
}
```

### Server Stats
```
GET /stats
```
Response:
```json
{
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 123.45,
  "connections": 42,
  "activeRooms": 1,
  "memoryUsage": {
    "rss": 64,
    "heapUsed": 32,
    "heapTotal": 48,
    "external": 8
  }
}
```

### Room List
```
GET /rooms
```
Response:
```json
{
  "rooms": [
    {
      "id": "room-uuid",
      "name": "Main Room",
      "playerCount": 15,
      "maxPlayers": 100,
      "isActive": true
    }
  ]
}
```

## Security Features

- **Rate Limiting**: Prevents spam and abuse
- **Input Validation**: Joi schemas validate all inputs
- **XSS Protection**: Input sanitization
- **CORS**: Configurable origin whitelist
- **Helmet**: Security headers
- **Logging**: Security event monitoring

## Monitoring & Logging

Logs are written to the `logs/` directory:

- `all.log` - All log entries
- `error.log` - Error messages only
- `game.log` - Game-specific events
- `connections.log` - Connection events
- `security.log` - Security events
- `exceptions.log` - Unhandled exceptions
- `rejections.log` - Unhandled promise rejections

Log levels: `error`, `warn`, `info`, `http`, `debug`

## Performance

- **WebSocket Connections**: Supports 1000+ concurrent connections
- **Memory Usage**: Optimized for low memory footprint
- **CPU Usage**: Efficient event-driven architecture
- **Latency**: Sub-100ms message processing

## Production Deployment

### Using PM2

```bash
# Install PM2
npm install -g pm2

# Build the project
bun run build

# Start with PM2
pm2 start dist/index.js --name stellarush-server

# Monitor
pm2 monit

# View logs
pm2 logs stellarush-server
```

### Using Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY dist/ ./dist/
EXPOSE 3001
CMD ["node", "dist/index.js"]
```

## Testing

```bash
# Run unit tests
bun test

# Run with coverage
bun test --coverage

# Load testing with WebSocket connections
# (Use tools like Artillery or custom scripts)
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Run linting: `bun run lint`
6. Submit a pull request

## License

MIT License - see LICENSE file for details.
