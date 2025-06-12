import type { Server as SocketIOServer, Socket } from 'socket.io';
import { logger } from '../utils/logger';
import { CrashPointGenerator } from '../utils/CrashPointGenerator';

interface Player {
  id: string;
  socket: Socket;
  currentBet?: {
    amount: number;
    multiplier?: number;
    cashedOut: boolean;
    timestamp: number;
  };
  autobet?: {
    enabled: boolean;
    settings: AutobetSettings;
    state: AutobetState;
  };
  balance: number;
  totalWagered: number;
  totalWon: number;
  gamesPlayed: number;
}

interface AutobetSettings {
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

interface AutobetState {
  currentBet: number;
  totalBets: number;
  totalWins: number;
  totalLosses: number;
  profit: number;
  fibonacciSequence: number[];
  fibonacciIndex: number;
}

interface GameState {
  phase: 'waiting' | 'betting' | 'flying' | 'crashed';
  multiplier: number;
  crashPoint: number | null;
  startTime: number | null;
  endTime: number | null;
  roundId: string;
  players: { [playerId: string]: Player };
  history: GameRound[];
}

interface GameRound {
  roundId: string;
  crashPoint: number;
  timestamp: number;
  playerCount: number;
  totalWagered: number;
  totalWon: number;
  duration: number;
}

export class GameManager {
  private io: SocketIOServer;
  private gameState: GameState;
  private gameInterval: NodeJS.Timeout | null = null;
  private crashPointGenerator: CrashPointGenerator;
  private lastUpdateTime = 0;
  private readonly GAME_SPEED = 50; // milliseconds between updates
  private readonly BETTING_TIME = 5000; // 5 seconds betting phase
  private readonly WAITING_TIME = 3000; // 3 seconds waiting phase

  constructor(io: SocketIOServer) {
    this.io = io;
    this.crashPointGenerator = new CrashPointGenerator();
    this.gameState = this.initializeGameState();
  }

  private initializeGameState(): GameState {
    return {
      phase: 'waiting',
      multiplier: 1.0,
      crashPoint: null,
      startTime: null,
      endTime: null,
      roundId: this.generateRoundId(),
      players: {},
      history: [],
    };
  }

  private generateRoundId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  public startGameLoop(): void {
    logger.info('Starting STELLARUSH game loop');
    this.gameInterval = setInterval(() => {
      this.updateGame();
    }, this.GAME_SPEED);
  }

  public stopGameLoop(): void {
    if (this.gameInterval) {
      clearInterval(this.gameInterval);
      this.gameInterval = null;
      logger.info('Stopped STELLARUSH game loop');
    }
  }

  private updateGame(): void {
    const now = Date.now();

    switch (this.gameState.phase) {
      case 'waiting':
        this.handleWaitingPhase(now);
        break;
      case 'betting':
        this.handleBettingPhase(now);
        break;
      case 'flying':
        this.handleFlyingPhase(now);
        break;
      case 'crashed':
        this.handleCrashedPhase(now);
        break;
    }
  }

  private handleWaitingPhase(now: number): void {
    if (!this.gameState.startTime) {
      this.gameState.startTime = now;
      this.broadcastGameState();
    }

    if (now - this.gameState.startTime >= this.WAITING_TIME) {
      this.startBettingPhase();
    }
  }

  private startBettingPhase(): void {
    this.gameState.phase = 'betting';
    this.gameState.startTime = Date.now();
    this.gameState.crashPoint = this.crashPointGenerator.generateCrashPoint();

    logger.info(`New round ${this.gameState.roundId} - Crash point: ${this.gameState.crashPoint}`);

    this.broadcastGameState();

    // Handle autobet for all players
    this.handleAutobetRound();
  }

  private handleBettingPhase(now: number): void {
    if (now - this.gameState.startTime! >= this.BETTING_TIME) {
      this.startFlyingPhase();
    }
  }

  private startFlyingPhase(): void {
    this.gameState.phase = 'flying';
    this.gameState.multiplier = 1.0;
    this.gameState.startTime = Date.now();

    this.broadcastGameState();
    this.io.emit('gameStarted', {
      roundId: this.gameState.roundId,
      startTime: this.gameState.startTime,
    });
  }

  private handleFlyingPhase(now: number): void {
    const elapsed = now - this.gameState.startTime!;

    // Calculate multiplier based on elapsed time
    this.gameState.multiplier = this.calculateMultiplier(elapsed);

    // Check if we should crash
    if (this.gameState.multiplier >= this.gameState.crashPoint!) {
      this.crashGame();
      return;
    }

    // Handle auto cash outs
    this.handleAutoCashOuts();

    // Broadcast multiplier update (throttled)
    if (now - this.lastUpdateTime >= 100) { // 10 FPS
      this.broadcastMultiplierUpdate();
      this.lastUpdateTime = now;
    }
  }

  private calculateMultiplier(elapsed: number): number {
    // Exponential growth curve that feels natural
    const seconds = elapsed / 1000;
    return Math.max(1.0, Math.pow(1.0024, elapsed));
  }

  private crashGame(): void {
    this.gameState.phase = 'crashed';
    this.gameState.endTime = Date.now();
    const actualCrashPoint = this.gameState.multiplier;

    logger.info(`Game crashed at ${actualCrashPoint.toFixed(2)}x`);

    // Calculate payouts and handle losses
    this.processGameResults(actualCrashPoint);

    // Save round to history
    this.saveRoundToHistory(actualCrashPoint);

    // Broadcast crash
    this.io.emit('gameCrashed', {
      roundId: this.gameState.roundId,
      crashPoint: actualCrashPoint,
      endTime: this.gameState.endTime,
    });

    this.broadcastGameState();

    // Start next round after delay
    setTimeout(() => {
      this.startNextRound();
    }, this.WAITING_TIME);
  }

  private handleCrashedPhase(now: number): void {
    // Already handled in crashGame method
  }

  private startNextRound(): void {
    // Save current round
    const previousRound = {
      roundId: this.gameState.roundId,
      crashPoint: this.gameState.multiplier,
      timestamp: Date.now(),
      playerCount: Object.keys(this.gameState.players).length,
      totalWagered: this.calculateTotalWagered(),
      totalWon: this.calculateTotalWon(),
      duration: this.gameState.endTime! - this.gameState.startTime!,
    };

    // Reset for new round
    this.gameState = {
      ...this.initializeGameState(),
      players: this.gameState.players, // Keep connected players
      history: [previousRound, ...this.gameState.history.slice(0, 99)], // Keep last 100 rounds
    };
  }

  private handleAutobetRound(): void {
    for (const player of Object.values(this.gameState.players)) {
      if (player.autobet?.enabled) {
        this.processAutobetForPlayer(player);
      }
    }
  }

  private processAutobetForPlayer(player: Player): void {
    const autobet = player.autobet!;
    const settings = autobet.settings;
    const state = autobet.state;

    // Check stop conditions
    if (this.shouldStopAutobet(player)) {
      this.stopAutobetForPlayer(player);
      return;
    }

    // Calculate bet amount based on strategy
    const betAmount = this.calculateAutobetAmount(player);

    if (betAmount > player.balance || betAmount > settings.maxBetAmount) {
      this.stopAutobetForPlayer(player);
      return;
    }

    // Place autobet
    this.placeBetForPlayer(player, betAmount, true);
  }

  private calculateAutobetAmount(player: Player): number {
    const settings = player.autobet!.settings;
    const state = player.autobet!.state;

    switch (settings.strategy) {
      case 'fixed':
        return settings.betAmount;

      case 'martingale':
        return state.totalBets === 0 ? settings.betAmount :
               state.currentBet * settings.martingaleMultiplier;

      case 'reverse-martingale':
        return state.totalBets === 0 ? settings.betAmount :
               state.currentBet * settings.martingaleMultiplier;

      case 'fibonacci':
        const fibIndex = Math.min(state.fibonacciIndex, state.fibonacciSequence.length - 1);
        return settings.betAmount * state.fibonacciSequence[fibIndex];

      default:
        return settings.betAmount;
    }
  }

  private shouldStopAutobet(player: Player): boolean {
    const settings = player.autobet!.settings;
    const state = player.autobet!.state;

    // Check bet limit
    if (settings.numberOfBets > 0 && state.totalBets >= settings.numberOfBets) {
      return true;
    }

    // Check profit limits
    if (settings.stopOnWin && state.profit >= settings.stopWinAmount) {
      return true;
    }

    if (settings.stopOnLoss && state.profit <= -settings.stopLossAmount) {
      return true;
    }

    return false;
  }

  private stopAutobetForPlayer(player: Player): void {
    if (player.autobet) {
      player.autobet.enabled = false;
      player.socket.emit('autobetStopped', {
        reason: 'conditions_met',
        stats: player.autobet.state,
      });
    }
  }

  public handlePlaceBet(socket: Socket, data: { amount: number }): void {
    const player = this.gameState.players[socket.id];

    if (!player) {
      socket.emit('error', { message: 'Player not found' });
      return;
    }

    if (this.gameState.phase !== 'betting') {
      socket.emit('error', { message: 'Betting phase has ended' });
      return;
    }

    this.placeBetForPlayer(player, data.amount, false);
  }

  private placeBetForPlayer(player: Player, amount: number, isAutobet: boolean): void {
    // Validate bet
    if (amount <= 0 || amount > player.balance) {
      player.socket.emit('error', { message: 'Invalid bet amount' });
      return;
    }

    if (player.currentBet) {
      player.socket.emit('error', { message: 'Bet already placed this round' });
      return;
    }

    // Place bet
    player.currentBet = {
      amount,
      cashedOut: false,
      timestamp: Date.now(),
    };

    player.balance -= amount;
    player.totalWagered += amount;
    player.gamesPlayed++;

    // Update autobet state if applicable
    if (isAutobet && player.autobet) {
      player.autobet.state.totalBets++;
      player.autobet.state.currentBet = amount;
    }

    // Broadcast bet placed
    this.io.emit('betPlaced', {
      playerId: player.id,
      amount,
      isAutobet,
      timestamp: Date.now(),
    });

    player.socket.emit('betConfirmed', {
      amount,
      balance: player.balance,
      roundId: this.gameState.roundId,
    });

    logger.info(`Player ${player.id} placed bet: ${amount} SOL (autobet: ${isAutobet})`);
  }

  public handleCashOut(socket: Socket): void {
    const player = this.gameState.players[socket.id];

    if (!player || !player.currentBet || player.currentBet.cashedOut) {
      socket.emit('error', { message: 'No active bet to cash out' });
      return;
    }

    if (this.gameState.phase !== 'flying') {
      socket.emit('error', { message: 'Cannot cash out at this time' });
      return;
    }

    this.cashOutPlayer(player, this.gameState.multiplier);
  }

  private cashOutPlayer(player: Player, multiplier: number): void {
    if (!player.currentBet || player.currentBet.cashedOut) return;

    const winAmount = player.currentBet.amount * multiplier;
    player.currentBet.multiplier = multiplier;
    player.currentBet.cashedOut = true;
    player.balance += winAmount;
    player.totalWon += winAmount;

    // Update autobet state
    if (player.autobet?.enabled) {
      const profit = winAmount - player.currentBet.amount;
      player.autobet.state.profit += profit;
      player.autobet.state.totalWins++;
    }

    // Broadcast cash out
    this.io.emit('playerCashedOut', {
      playerId: player.id,
      multiplier,
      winAmount,
      timestamp: Date.now(),
    });

    player.socket.emit('cashOutConfirmed', {
      multiplier,
      winAmount,
      balance: player.balance,
    });

    logger.info(`Player ${player.id} cashed out at ${multiplier.toFixed(2)}x for ${winAmount.toFixed(4)} SOL`);
  }

  private handleAutoCashOuts(): void {
    for (const player of Object.values(this.gameState.players)) {
      if (player.currentBet &&
          !player.currentBet.cashedOut &&
          player.autobet?.enabled &&
          this.gameState.multiplier >= player.autobet.settings.autoCashOut) {
        this.cashOutPlayer(player, this.gameState.multiplier);
      }
    }
  }

  private processGameResults(crashPoint: number): void {
    for (const player of Object.values(this.gameState.players)) {
      if (player.currentBet && !player.currentBet.cashedOut) {
        // Player lost
        if (player.autobet?.enabled) {
          const loss = player.currentBet.amount;
          player.autobet.state.profit -= loss;
          player.autobet.state.totalLosses++;
        }

        player.socket.emit('betLost', {
          amount: player.currentBet.amount,
          crashPoint,
        });
      }

      // Clear current bet for next round
      player.currentBet = undefined;
    }
  }

  private saveRoundToHistory(crashPoint: number): void {
    const round: GameRound = {
      roundId: this.gameState.roundId,
      crashPoint,
      timestamp: Date.now(),
      playerCount: Object.keys(this.gameState.players).length,
      totalWagered: this.calculateTotalWagered(),
      totalWon: this.calculateTotalWon(),
      duration: this.gameState.endTime! - this.gameState.startTime!,
    };

    this.gameState.history.unshift(round);
    this.gameState.history = this.gameState.history.slice(0, 100); // Keep last 100
  }

  private calculateTotalWagered(): number {
    return Object.values(this.gameState.players)
      .reduce((total, player) => total + (player.currentBet?.amount || 0), 0);
  }

  private calculateTotalWon(): number {
    return Object.values(this.gameState.players)
      .reduce((total, player) => {
        if (player.currentBet?.cashedOut && player.currentBet.multiplier) {
          return total + (player.currentBet.amount * player.currentBet.multiplier);
        }
        return total;
      }, 0);
  }

  private broadcastGameState(): void {
    this.io.emit('gameState', {
      phase: this.gameState.phase,
      multiplier: this.gameState.multiplier,
      roundId: this.gameState.roundId,
      startTime: this.gameState.startTime,
      endTime: this.gameState.endTime,
      playerCount: Object.keys(this.gameState.players).length,
    });
  }

  private broadcastMultiplierUpdate(): void {
    this.io.emit('multiplierUpdate', {
      multiplier: this.gameState.multiplier,
      timestamp: Date.now(),
    });
  }

  // Public methods for external access
  public addPlayer(socket: Socket): void {
    this.gameState.players[socket.id] = {
      id: socket.id,
      socket,
      balance: 10.0, // Starting balance (in production, this would come from blockchain)
      totalWagered: 0,
      totalWon: 0,
      gamesPlayed: 0,
    };
  }

  public removePlayer(socketId: string): void {
    delete this.gameState.players[socketId];
  }

  public handleStartAutobet(socket: Socket, settings: AutobetSettings): void {
    const player = this.gameState.players[socket.id];
    if (!player) return;

    player.autobet = {
      enabled: true,
      settings,
      state: {
        currentBet: settings.betAmount,
        totalBets: 0,
        totalWins: 0,
        totalLosses: 0,
        profit: 0,
        fibonacciSequence: [1, 1],
        fibonacciIndex: 0,
      },
    };

    socket.emit('autobetStarted', { settings });
    logger.info(`Player ${player.id} started autobet`);
  }

  public handleStopAutobet(socket: Socket): void {
    const player = this.gameState.players[socket.id];
    if (!player || !player.autobet) return;

    player.autobet.enabled = false;
    socket.emit('autobetStopped', {
      reason: 'manual',
      stats: player.autobet.state,
    });

    logger.info(`Player ${player.id} stopped autobet`);
  }

  public handlePlayerDisconnect(socketId: string): void {
    this.removePlayer(socketId);
  }

  // Getters for API endpoints
  public getGameState() {
    return {
      phase: this.gameState.phase,
      multiplier: this.gameState.multiplier,
      roundId: this.gameState.roundId,
      playerCount: Object.keys(this.gameState.players).length,
    };
  }

  public getCurrentMultiplier(): number {
    return this.gameState.multiplier;
  }

  public isGameActive(): boolean {
    return this.gameState.phase === 'flying';
  }

  public getTotalWagered(): number {
    return this.gameState.history.reduce((total, round) => total + round.totalWagered, 0);
  }

  public getGamesPlayed(): number {
    return this.gameState.history.length;
  }

  public getGameHistory(): GameRound[] {
    return this.gameState.history.slice(0, 50); // Last 50 rounds
  }
}
