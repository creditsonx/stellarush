import { Socket } from 'socket.io';
import { logger } from '../utils/logger';

interface RateLimitState {
  count: number;
  resetTime: number;
}

// Rate limiting middleware
export const rateLimiterMiddleware = (socket: Socket, next: (err?: Error) => void) => {
  const clientIp = socket.handshake.address;
  const now = Date.now();
  const windowMs = 60000; // 1 minute
  const maxRequests = 100; // Max 100 connections per minute per IP

  // Get or create rate limit state for this IP
  if (!rateLimitStore.has(clientIp)) {
    rateLimitStore.set(clientIp, { count: 0, resetTime: now + windowMs });
  }

  const state = rateLimitStore.get(clientIp)!;

  // Reset counter if window expired
  if (now > state.resetTime) {
    state.count = 0;
    state.resetTime = now + windowMs;
  }

  // Check if limit exceeded
  if (state.count >= maxRequests) {
    logger.warn(`Rate limit exceeded for IP: ${clientIp}`);
    return next(new Error('Rate limit exceeded'));
  }

  state.count++;
  next();
};

// Simple in-memory store for rate limiting (in production, use Redis)
const rateLimitStore = new Map<string, RateLimitState>();

// Authentication middleware (basic implementation)
export const authMiddleware = (socket: Socket, next: (err?: Error) => void) => {
  try {
    const token = socket.handshake.auth.token;
    const apiKey = socket.handshake.headers['x-api-key'];

    // For demo purposes, we'll allow all connections
    // In production, implement proper JWT verification here

    // Basic API key check (optional)
    if (apiKey && apiKey !== process.env.API_KEY && process.env.API_KEY) {
      logger.warn(`Invalid API key from IP: ${socket.handshake.address}`);
      return next(new Error('Invalid API key'));
    }

    // Log connection
    logger.info(`Client connected from ${socket.handshake.address}`);

    next();
  } catch (error) {
    logger.error('Authentication error:', error);
    next(new Error('Authentication failed'));
  }
};

// CORS middleware (handled in main server config, but here for reference)
export const corsMiddleware = {
  origin: process.env.NODE_ENV === 'production'
    ? ['https://stellarush.netlify.app', 'https://creditsonx.github.io']
    : ['http://localhost:3000', 'http://127.0.0.1:3000'],
  methods: ['GET', 'POST'],
  credentials: true
};

// Security headers middleware
export const securityMiddleware = (socket: Socket, next: (err?: Error) => void) => {
  // Add security checks here
  const userAgent = socket.handshake.headers['user-agent'] || '';

  // Block known bad user agents (basic bot protection)
  const blockedAgents = ['bot', 'crawler', 'spider', 'scraper'];
  const isBlocked = blockedAgents.some(agent =>
    userAgent.toLowerCase().includes(agent)
  );

  if (isBlocked) {
    logger.warn(`Blocked bot connection from ${socket.handshake.address}: ${userAgent}`);
    return next(new Error('Access denied'));
  }

  next();
};

// Cleanup function for rate limit store
export const cleanupRateLimitStore = () => {
  const now = Date.now();
  for (const [ip, state] of rateLimitStore.entries()) {
    if (now > state.resetTime + 300000) { // Remove entries older than 5 minutes
      rateLimitStore.delete(ip);
    }
  }
};

// Start cleanup interval
setInterval(cleanupRateLimitStore, 300000); // Clean up every 5 minutes
