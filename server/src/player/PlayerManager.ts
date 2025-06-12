import type { Server as SocketIOServer, Socket } from 'socket.io';
import { logger } from '../utils/logger';

interface PlayerProfile {
  id: string;
  username: string;
  avatar?: string;
  level: number;
  experience: number;
  totalWagered: number;
  totalWon: number;
  gamesPlayed: number;
  bestMultiplier: number;
  joinedAt: number;
  lastActive: number;
  isOnline: boolean;
}

interface PlayerSession {
  socket: Socket;
  profile: PlayerProfile;
  connectedAt: number;
  lastActivity: number;
}

export class PlayerManager {
  private io: SocketIOServer;
  private activePlayers: Map<string, PlayerSession> = new Map();
  private playerProfiles: Map<string, PlayerProfile> = new Map();

  constructor(io: SocketIOServer) {
    this.io = io;
    this.startHeartbeat();
  }

  private startHeartbeat(): void {
    // Send periodic heartbeat and update player stats
    setInterval(() => {
      this.updatePlayerStats();
      this.cleanupInactivePlayers();
    }, 30000); // Every 30 seconds
  }

  public addPlayer(socket: Socket): void {
    const playerId = socket.id;

    // Get or create player profile
    let profile = this.playerProfiles.get(playerId);
    if (!profile) {
      profile = this.createNewPlayerProfile(playerId);
      this.playerProfiles.set(playerId, profile);
    }

    // Update profile status
    profile.isOnline = true;
    profile.lastActive = Date.now();

    // Create session
    const session: PlayerSession = {
      socket,
      profile,
      connectedAt: Date.now(),
      lastActivity: Date.now(),
    };

    this.activePlayers.set(playerId, session);

    // Send welcome message and initial data
    socket.emit('playerProfile', profile);
    socket.emit('playersOnline', this.getPlayerCount());

    // Broadcast updated player count
    this.broadcastPlayerCount();

    logger.info(`Player ${playerId} connected. Total players: ${this.getPlayerCount()}`);
  }

  public removePlayer(playerId: string): void {
    const session = this.activePlayers.get(playerId);
    if (session) {
      // Update profile
      session.profile.isOnline = false;
      session.profile.lastActive = Date.now();

      // Remove from active players
      this.activePlayers.delete(playerId);

      // Broadcast updated player count
      this.broadcastPlayerCount();

      logger.info(`Player ${playerId} disconnected. Total players: ${this.getPlayerCount()}`);
    }
  }

  private createNewPlayerProfile(playerId: string): PlayerProfile {
    const username = this.generateUsername();
    return {
      id: playerId,
      username,
      level: 1,
      experience: 0,
      totalWagered: 0,
      totalWon: 0,
      gamesPlayed: 0,
      bestMultiplier: 0,
      joinedAt: Date.now(),
      lastActive: Date.now(),
      isOnline: true,
    };
  }

  private generateUsername(): string {
    const adjectives = [
      'Cosmic', 'Stellar', 'Galactic', 'Lunar', 'Solar', 'Nebula', 'Quantum',
      'Digital', 'Crypto', 'Rocket', 'Space', 'Star', 'Moon', 'Galaxy',
      'Astro', 'Void', 'Orbit', 'Plasma', 'Ion', 'Photon'
    ];

    const nouns = [
      'Wolf', 'Hunter', 'Trader', 'Rider', 'Master', 'Legend', 'Ace', 'Hero',
      'Pilot', 'Explorer', 'Voyager', 'Navigator', 'Gambler', 'Player', 'Pro',
      'Champion', 'Warrior', 'Guardian', 'Surfer', 'Ranger'
    ];

    const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
    const noun = nouns[Math.floor(Math.random() * nouns.length)];
    const number = Math.floor(Math.random() * 999) + 1;

    return `${adjective}${noun}${number}`;
  }

  public updateProfile(socket: Socket, updates: Partial<PlayerProfile>): void {
    const session = this.activePlayers.get(socket.id);
    if (!session) return;

    // Validate and sanitize updates
    const allowedUpdates = ['username', 'avatar'];
    const sanitizedUpdates: Partial<PlayerProfile> = {};

    for (const [key, value] of Object.entries(updates)) {
      if (allowedUpdates.includes(key) && value !== undefined) {
        if (key === 'username') {
          // Validate username
          const username = String(value).trim();
          if (username.length >= 3 && username.length <= 20 && /^[a-zA-Z0-9_]+$/.test(username)) {
            sanitizedUpdates.username = username;
          }
        } else if (key === 'avatar') {
          // Validate avatar URL (optional)
          const avatar = String(value).trim();
          if (avatar.length === 0 || /^https?:\/\//.test(avatar)) {
            sanitizedUpdates.avatar = avatar || undefined;
          }
        }
      }
    }

    // Apply updates
    Object.assign(session.profile, sanitizedUpdates);
    session.lastActivity = Date.now();

    // Broadcast updated profile
    socket.emit('playerProfile', session.profile);

    logger.info(`Player ${socket.id} updated profile:`, sanitizedUpdates);
  }

  public updatePlayerStats(playerId: string, stats: {
    wagered?: number;
    won?: number;
    gamesPlayed?: number;
    bestMultiplier?: number;
  }): void {
    const session = this.activePlayers.get(playerId);
    if (!session) return;

    const profile = session.profile;

    // Update stats
    if (stats.wagered !== undefined) {
      profile.totalWagered += stats.wagered;
      profile.experience += Math.floor(stats.wagered * 10); // 10 XP per SOL wagered
    }

    if (stats.won !== undefined) {
      profile.totalWon += stats.won;
      profile.experience += Math.floor(stats.won * 20); // 20 XP per SOL won
    }

    if (stats.gamesPlayed !== undefined) {
      profile.gamesPlayed += stats.gamesPlayed;
      profile.experience += stats.gamesPlayed * 5; // 5 XP per game
    }

    if (stats.bestMultiplier !== undefined && stats.bestMultiplier > profile.bestMultiplier) {
      profile.bestMultiplier = stats.bestMultiplier;
      profile.experience += Math.floor(stats.bestMultiplier * 50); // Bonus XP for high multipliers
    }

    // Calculate level based on experience
    const newLevel = Math.floor(profile.experience / 1000) + 1;
    if (newLevel > profile.level) {
      profile.level = newLevel;
      session.socket.emit('levelUp', {
        level: newLevel,
        experience: profile.experience
      });

      // Broadcast level up achievement
      this.io.emit('playerAchievement', {
        playerId: profile.id,
        username: profile.username,
        type: 'levelUp',
        level: newLevel,
      });
    }

    profile.lastActive = Date.now();
    session.lastActivity = Date.now();

    // Send updated profile
    session.socket.emit('playerProfile', profile);
  }

  private updatePlayerStats(): void {
    // Broadcast current player statistics
    const stats = {
      playersOnline: this.getPlayerCount(),
      totalPlayers: this.playerProfiles.size,
      activeNow: this.getActivePlayerCount(),
    };

    this.io.emit('serverStats', stats);
  }

  private cleanupInactivePlayers(): void {
    const now = Date.now();
    const inactivityTimeout = 5 * 60 * 1000; // 5 minutes

    for (const [playerId, session] of this.activePlayers.entries()) {
      if (now - session.lastActivity > inactivityTimeout) {
        logger.info(`Removing inactive player: ${playerId}`);
        this.removePlayer(playerId);
      }
    }
  }

  private broadcastPlayerCount(): void {
    const count = this.getPlayerCount();
    this.io.emit('playersOnline', count);
  }

  public getPlayerCount(): number {
    return this.activePlayers.size;
  }

  public getActivePlayerCount(): number {
    const now = Date.now();
    const activeThreshold = 60000; // 1 minute

    return Array.from(this.activePlayers.values())
      .filter(session => now - session.lastActivity < activeThreshold)
      .length;
  }

  public getTopPlayers(limit = 10): PlayerProfile[] {
    return Array.from(this.playerProfiles.values())
      .sort((a, b) => {
        // Sort by level first, then by experience
        if (a.level !== b.level) return b.level - a.level;
        return b.experience - a.experience;
      })
      .slice(0, limit);
  }

  public getPlayerStats(): {
    totalPlayers: number;
    playersOnline: number;
    activeNow: number;
    topPlayers: PlayerProfile[];
  } {
    return {
      totalPlayers: this.playerProfiles.size,
      playersOnline: this.getPlayerCount(),
      activeNow: this.getActivePlayerCount(),
      topPlayers: this.getTopPlayers(5),
    };
  }

  public getPlayerProfile(playerId: string): PlayerProfile | null {
    const session = this.activePlayers.get(playerId);
    return session ? session.profile : null;
  }

  public isPlayerOnline(playerId: string): boolean {
    return this.activePlayers.has(playerId);
  }

  public broadcastToPlayer(playerId: string, event: string, data: any): boolean {
    const session = this.activePlayers.get(playerId);
    if (session) {
      session.socket.emit(event, data);
      return true;
    }
    return false;
  }

  public broadcastToAll(event: string, data: any): void {
    this.io.emit(event, data);
  }

  public getOnlinePlayersList(): Array<{
    id: string;
    username: string;
    level: number;
    isActive: boolean;
  }> {
    const now = Date.now();
    const activeThreshold = 60000; // 1 minute

    return Array.from(this.activePlayers.values()).map(session => ({
      id: session.profile.id,
      username: session.profile.username,
      level: session.profile.level,
      isActive: now - session.lastActivity < activeThreshold,
    }));
  }

  // Activity tracking
  public updatePlayerActivity(playerId: string): void {
    const session = this.activePlayers.get(playerId);
    if (session) {
      session.lastActivity = Date.now();
      session.profile.lastActive = Date.now();
    }
  }

  // Achievements system (basic implementation)
  public checkAchievements(playerId: string): void {
    const profile = this.getPlayerProfile(playerId);
    if (!profile) return;

    const achievements = [];

    // Check various achievements
    if (profile.gamesPlayed >= 100 && !this.hasAchievement(profile, 'centurion')) {
      achievements.push({ type: 'centurion', name: 'Centurion', description: 'Play 100 games' });
    }

    if (profile.bestMultiplier >= 50 && !this.hasAchievement(profile, 'high_roller')) {
      achievements.push({ type: 'high_roller', name: 'High Roller', description: 'Cash out at 50x or higher' });
    }

    if (profile.totalWon >= 100 && !this.hasAchievement(profile, 'profit_master')) {
      achievements.push({ type: 'profit_master', name: 'Profit Master', description: 'Win 100 SOL total' });
    }

    // Broadcast new achievements
    for (const achievement of achievements) {
      this.broadcastToPlayer(playerId, 'achievementUnlocked', achievement);
      this.io.emit('playerAchievement', {
        playerId: profile.id,
        username: profile.username,
        achievement,
      });
    }
  }

  private hasAchievement(profile: PlayerProfile, achievementType: string): boolean {
    // In a real implementation, this would check a database of player achievements
    // For now, we'll use a simple check based on profile data
    return false; // Always return false for demo purposes
  }
}
