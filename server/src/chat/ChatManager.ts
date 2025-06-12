import { Server as SocketIOServer, Socket } from 'socket.io';
import { logger } from '../utils/logger';

interface ChatMessage {
  id: string;
  playerId: string;
  username: string;
  message: string;
  timestamp: number;
  type: 'user' | 'system' | 'auto';
}

interface PlayerChatState {
  lastMessageTime: number;
  messageCount: number;
  isMuted: boolean;
  muteExpiry?: number;
}

export class ChatManager {
  private io: SocketIOServer;
  private messages: ChatMessage[] = [];
  private playerStates: Map<string, PlayerChatState> = new Map();
  private readonly MAX_MESSAGES = 100;
  private readonly RATE_LIMIT_WINDOW = 30000; // 30 seconds
  private readonly MAX_MESSAGES_PER_WINDOW = 5;
  private readonly MESSAGE_COOLDOWN = 1000; // 1 second between messages

  // Predefined auto messages for atmosphere
  private autoMessages = [
    "🚀 To the moon!",
    "💎 Diamond hands baby!",
    "🔥 This is insane!",
    "⚡ STELLARUSH is addictive!",
    "🎯 Cashed out just in time!",
    "💀 Crashed too early...",
    "🌟 Best crash game ever!",
    "🎮 One more round!",
    "💰 Big win incoming!",
    "🚀 Rocket fuel loaded!",
    "⭐ Flying to the stars!",
    "🔥 On fire today!",
    "💎 HODLing till the end!",
    "🎲 Feeling lucky!",
    "⚡ Lightning fast cash out!",
    "🌙 Moon mission activated!",
    "🚀 Blast off!",
    "💫 Stellar performance!",
    "🔥 Hot streak continues!",
    "🎯 Perfect timing!"
  ];

  constructor(io: SocketIOServer) {
    this.io = io;
    this.startAutoChat();
  }

  private startAutoChat(): void {
    // Send auto messages periodically for atmosphere
    setInterval(() => {
      if (Math.random() < 0.3) { // 30% chance every interval
        this.sendAutoMessage();
      }
    }, 15000 + Math.random() * 30000); // Between 15-45 seconds
  }

  private sendAutoMessage(): void {
    const usernames = [
      'CryptoWolf', 'MoonHunter', 'DiamondHands', 'RocketRider', 'StellarTrader',
      'CosmicGamer', 'SpaceAce', 'CrashMaster', 'LunarLegend', 'GalaxyGambler',
      'NebulaNavigator', 'OrbitOutlaw', 'StardustSurfer', 'VoidVoyager', 'AstroAddict'
    ];

    const message = this.autoMessages[Math.floor(Math.random() * this.autoMessages.length)];
    const username = usernames[Math.floor(Math.random() * usernames.length)];

    const chatMessage: ChatMessage = {
      id: this.generateMessageId(),
      playerId: 'auto',
      username,
      message,
      timestamp: Date.now(),
      type: 'auto',
    };

    this.addMessage(chatMessage);
    this.broadcastMessage(chatMessage);
  }

  public handleMessage(socket: Socket, data: { message: string; username?: string }): void {
    try {
      // Validate message
      if (!this.validateMessage(data.message)) {
        socket.emit('chatError', { message: 'Invalid message content' });
        return;
      }

      // Check rate limiting
      if (!this.checkRateLimit(socket.id)) {
        socket.emit('chatError', { message: 'You are sending messages too quickly' });
        return;
      }

      // Check if player is muted
      if (this.isPlayerMuted(socket.id)) {
        socket.emit('chatError', { message: 'You are temporarily muted' });
        return;
      }

      const chatMessage: ChatMessage = {
        id: this.generateMessageId(),
        playerId: socket.id,
        username: data.username || `Player${socket.id.slice(-4)}`,
        message: this.sanitizeMessage(data.message),
        timestamp: Date.now(),
        type: 'user',
      };

      this.addMessage(chatMessage);
      this.broadcastMessage(chatMessage);
      this.updatePlayerChatState(socket.id);

      logger.info(`Chat message from ${chatMessage.username}: ${chatMessage.message}`);

    } catch (error) {
      logger.error('Error handling chat message:', error);
      socket.emit('chatError', { message: 'Failed to send message' });
    }
  }

  private validateMessage(message: string): boolean {
    if (!message || typeof message !== 'string') return false;
    if (message.length < 1 || message.length > 200) return false;
    if (message.trim().length === 0) return false;

    // Check for spam patterns
    const spamPatterns = [
      /(.)\1{10,}/, // Repeated character spam
      /^[A-Z\s!]{20,}$/, // All caps spam
      /(https?:\/\/|www\.)/i, // URLs
      /discord\.gg|t\.me|telegram/i, // Social media links
    ];

    return !spamPatterns.some(pattern => pattern.test(message));
  }

  private sanitizeMessage(message: string): string {
    // Remove potentially harmful content
    return message
      .trim()
      .replace(/<[^>]*>/g, '') // Remove HTML tags
      .replace(/[^\w\s!@#$%^&*(),.?":;'"\-+=/\\|`~]/g, '') // Allow only safe characters
      .slice(0, 200); // Ensure max length
  }

  private checkRateLimit(playerId: string): boolean {
    const playerState = this.playerStates.get(playerId);
    const now = Date.now();

    if (!playerState) {
      this.playerStates.set(playerId, {
        lastMessageTime: now,
        messageCount: 1,
        isMuted: false,
      });
      return true;
    }

    // Check cooldown
    if (now - playerState.lastMessageTime < this.MESSAGE_COOLDOWN) {
      return false;
    }

    // Check rate limit window
    if (now - playerState.lastMessageTime > this.RATE_LIMIT_WINDOW) {
      // Reset counter
      playerState.messageCount = 1;
      playerState.lastMessageTime = now;
      return true;
    }

    // Check message count
    if (playerState.messageCount >= this.MAX_MESSAGES_PER_WINDOW) {
      // Temporarily mute player
      this.mutePlayer(playerId, 60000); // 1 minute mute
      return false;
    }

    playerState.messageCount++;
    playerState.lastMessageTime = now;
    return true;
  }

  private updatePlayerChatState(playerId: string): void {
    const playerState = this.playerStates.get(playerId);
    if (playerState) {
      playerState.lastMessageTime = Date.now();
    }
  }

  private isPlayerMuted(playerId: string): boolean {
    const playerState = this.playerStates.get(playerId);
    if (!playerState || !playerState.isMuted) return false;

    // Check if mute has expired
    if (playerState.muteExpiry && Date.now() > playerState.muteExpiry) {
      playerState.isMuted = false;
      playerState.muteExpiry = undefined;
      return false;
    }

    return true;
  }

  private mutePlayer(playerId: string, duration: number): void {
    const playerState = this.playerStates.get(playerId) || {
      lastMessageTime: 0,
      messageCount: 0,
      isMuted: false,
    };

    playerState.isMuted = true;
    playerState.muteExpiry = Date.now() + duration;
    this.playerStates.set(playerId, playerState);

    logger.info(`Player ${playerId} muted for ${duration}ms`);
  }

  private generateMessageId(): string {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private addMessage(message: ChatMessage): void {
    this.messages.unshift(message);
    if (this.messages.length > this.MAX_MESSAGES) {
      this.messages = this.messages.slice(0, this.MAX_MESSAGES);
    }
  }

  private broadcastMessage(message: ChatMessage): void {
    this.io.emit('chatMessage', message);
  }

  public sendSystemMessage(message: string): void {
    const systemMessage: ChatMessage = {
      id: this.generateMessageId(),
      playerId: 'system',
      username: 'STELLARUSH',
      message,
      timestamp: Date.now(),
      type: 'system',
    };

    this.addMessage(systemMessage);
    this.broadcastMessage(systemMessage);
  }

  public getRecentMessages(count: number = 50): ChatMessage[] {
    return this.messages.slice(0, count);
  }

  public handlePlayerDisconnect(playerId: string): void {
    this.playerStates.delete(playerId);
  }

  // Moderation methods (for future admin features)
  public deleteMessage(messageId: string): boolean {
    const index = this.messages.findIndex(msg => msg.id === messageId);
    if (index !== -1) {
      this.messages.splice(index, 1);
      this.io.emit('messageDeleted', { messageId });
      return true;
    }
    return false;
  }

  public clearChat(): void {
    this.messages = [];
    this.io.emit('chatCleared');
  }

  public mutePlayerByAdmin(playerId: string, duration: number): void {
    this.mutePlayer(playerId, duration);
    this.sendSystemMessage(`Player has been muted for ${duration / 1000} seconds`);
  }
}
