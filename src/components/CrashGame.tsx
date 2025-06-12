'use client';

import { useState, useEffect, useCallback } from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { GameChart } from './GameChart';
import { BettingPanel } from './BettingPanel';
import { GameHistory } from './GameHistory';
import { PlayersList } from './PlayersList';
import { ChatBox } from './ChatBox';
import { useGameStats } from '../hooks/useGameStats';
import { useAudio, useHapticFeedback } from '../hooks/useAudio';
import { useAutobet, type AutobetSettings } from '../hooks/useAutobet';
import { AudioControls } from './AudioControls';
import { AutobetPanel } from './AutobetPanel';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';

interface GameState {
  isActive: boolean;
  crashed: boolean;
  multiplier: number;
  startTime: number | null;
  crashPoint: number | null;
  roundId: string;
}

interface PlayerState {
  currentBet: number | null;
  hasActiveBet: boolean;
  balance: number;
  canCashOut: boolean;
}

export function CrashGame() {
  const { connected, publicKey } = useWallet();
  const { connection } = useConnection();
  const stats = useGameStats(); // Dynamic stats hook
  const { playSound } = useAudio();
  const { haptics } = useHapticFeedback();
  const autobet = useAutobet();

  // Game state
  const [gameState, setGameState] = useState<GameState>({
    isActive: false,
    crashed: false,
    multiplier: 1.0,
    startTime: null,
    crashPoint: null,
    roundId: '',
  });

  // Player state
  const [playerState, setPlayerState] = useState<PlayerState>({
    currentBet: null,
    hasActiveBet: false,
    balance: 10.0, // Mock balance for demo
    canCashOut: false,
  });

  // Chart data
  const [gameData, setGameData] = useState<Array<{ time: number; multiplier: number }>>([]);

  // Current result for history
  const [currentResult, setCurrentResult] = useState<{ roundId: string; crashPoint: number; timestamp: number } | undefined>();

  // Mock game logic - in production this would be handled by smart contract + backend
  const generateCrashPoint = useCallback(() => {
    // Simple crash point generation (not cryptographically secure - for demo only)
    return Math.max(1.01, Math.random() * 10 + 1);
  }, []);

  const startNewRound = useCallback(() => {
    const crashPoint = generateCrashPoint();
    const roundId = Date.now().toString();

    setGameState({
      isActive: true,
      crashed: false,
      multiplier: 1.0,
      startTime: Date.now(),
      crashPoint,
      roundId,
    });

    setGameData([{ time: 0, multiplier: 1.0 }]);

    // Enable cash out for players with active bets
    setPlayerState(prev => ({
      ...prev,
      canCashOut: prev.hasActiveBet,
    }));

    // Play rocket launch sound and haptic feedback
    playSound.rocketLaunch();
    haptics.notification();
  }, [generateCrashPoint, playSound, haptics]);

  // Game loop
  useEffect(() => {
    if (!gameState.isActive || gameState.crashed) return;

    const interval = setInterval(() => {
      const now = Date.now();
      const elapsed = (now - (gameState.startTime || now)) / 1000;
      const newMultiplier = 1 + (elapsed * 0.1); // Increase by 0.1x per second

      setGameState(prev => ({ ...prev, multiplier: newMultiplier }));
      setGameData(prev => [...prev, { time: elapsed, multiplier: newMultiplier }]);

      // Check if game should crash
      if (gameState.crashPoint && newMultiplier >= gameState.crashPoint) {
        setGameState(prev => ({
          ...prev,
          crashed: true,
          isActive: false
        }));

        // Play crash sound and haptic feedback
        playSound.crash();
        haptics.crash();

        // Handle autobet result (player lost)
        if (autobet.isRunning && playerState.hasActiveBet && playerState.currentBet) {
          autobet.handleGameResult(false, playerState.currentBet, 0, (nextBetAmount) => {
            // Place next autobet
            handlePlaceBet(nextBetAmount);
          });
        }

        // Player loses if they didn't cash out
        setPlayerState(prev => ({
          ...prev,
          currentBet: null,
          hasActiveBet: false,
          canCashOut: false,
        }));

        // Add to history
        setCurrentResult({
          roundId: gameState.roundId,
          crashPoint: gameState.crashPoint,
          timestamp: Date.now(),
        });

        // Start new round after delay
        setTimeout(() => {
          setGameState(prev => ({
            ...prev,
            crashed: false,
            multiplier: 1.0,
            startTime: null,
            crashPoint: null,
          }));

          setTimeout(startNewRound, 3000); // 3 second delay before next round
        }, 2000);
      }
    }, 100); // Update every 100ms

    return () => clearInterval(interval);
  }, [gameState.isActive, gameState.crashed, gameState.startTime, gameState.crashPoint, gameState.roundId, startNewRound]);

  // Start first round
  useEffect(() => {
    if (!gameState.isActive && !gameState.crashed && gameState.roundId === '') {
      setTimeout(startNewRound, 2000);
    }
  }, [gameState, startNewRound]);

  const handlePlaceBet = useCallback((amount: number) => {
    if (playerState.balance >= amount && !gameState.isActive) {
      setPlayerState(prev => ({
        ...prev,
        currentBet: amount,
        hasActiveBet: true,
        balance: prev.balance - amount,
      }));

      // Play bet placed sound and haptic feedback
      playSound.betPlaced();
      haptics.betPlaced();
    }
  }, [playerState.balance, gameState.isActive, playSound, haptics]);

  const handleCashOut = useCallback(() => {
    if (playerState.canCashOut && playerState.currentBet) {
      const payout = playerState.currentBet * gameState.multiplier;

      // Play cash out sound and haptic feedback
      playSound.cashOut();
      haptics.cashOut();

      // Handle autobet result (player won)
      if (autobet.isRunning) {
        autobet.handleGameResult(true, playerState.currentBet, payout, (nextBetAmount) => {
          // Place next autobet after round ends
          setTimeout(() => {
            if (!gameState.isActive) {
              handlePlaceBet(nextBetAmount);
            }
          }, 1000);
        });
      }

      setPlayerState(prev => ({
        ...prev,
        balance: prev.balance + payout,
        currentBet: null,
        hasActiveBet: false,
        canCashOut: false,
      }));
    }
  }, [playerState.canCashOut, playerState.currentBet, gameState.multiplier, playSound, haptics, autobet, gameState.isActive, handlePlaceBet]);

  // Autobet handlers
  const handleStartAutobet = useCallback((settings: AutobetSettings) => {
    autobet.startAutobet(
      (amount) => handlePlaceBet(amount),
      () => handleCashOut()
    );
  }, [autobet, handlePlaceBet, handleCashOut]);

  const handleStopAutobet = useCallback(() => {
    autobet.stopAutobet();
  }, [autobet]);

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <div className="border-b border-gray-800 p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="text-2xl font-bold bg-gradient-to-r from-orange-400 via-red-400 to-purple-400 bg-clip-text text-transparent">
              STELLARUSH
            </div>
            <div className="w-1 h-6 bg-gradient-to-b from-orange-400 to-purple-400 rounded-full" />
            <div className="text-gray-400 text-sm">
              Round #{gameState.roundId || '...'}
            </div>
          </div>
          <div className="flex items-center gap-4">
            <AudioControls compact />
            <div className="text-sm text-gray-400">
              {gameState.isActive ? 'GAME ACTIVE' : 'WAITING FOR PLAYERS'}
            </div>
          </div>
        </div>
      </div>

      {/* Main Game Area */}
      <div className="max-w-7xl mx-auto p-4">
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          {/* Game Chart - Takes up 2 columns */}
          <div className="xl:col-span-2">
            <GameChart
              isGameActive={gameState.isActive}
              multiplier={gameState.multiplier}
              gameData={gameData}
              crashed={gameState.crashed}
            />
          </div>

          {/* Betting Panel */}
          <div className="xl:col-span-1 space-y-4">
            <BettingPanel
              isGameActive={gameState.isActive}
              canBet={!gameState.isActive && !gameState.crashed}
              canCashOut={playerState.canCashOut}
              multiplier={gameState.multiplier}
              onPlaceBet={handlePlaceBet}
              onCashOut={handleCashOut}
              playerBalance={playerState.balance}
              currentBet={playerState.currentBet}
            />
            <AutobetPanel
              onStartAutobet={handleStartAutobet}
              onStopAutobet={handleStopAutobet}
              playerBalance={playerState.balance}
              isGameActive={gameState.isActive}
            />
          </div>

          {/* Side Panel with History and Players */}
          <div className="xl:col-span-1 space-y-6">
            <GameHistory currentResult={currentResult} />
            <PlayersList
              currentMultiplier={gameState.multiplier}
              isGameActive={gameState.isActive}
            />
          </div>
        </div>

        {/* Stats and Chat */}
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Dynamic Game Stats */}
          <div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-gray-800 p-4 rounded-lg">
                <div className="text-gray-400 text-sm">Players Online</div>
                <div className="text-white text-xl font-bold">{stats.playersOnline}</div>
              </div>
              <div className="bg-gray-800 p-4 rounded-lg">
                <div className="text-gray-400 text-sm">Total Wagered</div>
                <div className="text-white text-xl font-bold">{stats.totalWagered.toFixed(0)} SOL</div>
              </div>
              <div className="bg-gray-800 p-4 rounded-lg">
                <div className="text-gray-400 text-sm">Current Bets</div>
                <div className="text-white text-xl font-bold">{stats.currentRoundBets}</div>
              </div>
              <div className="bg-gray-800 p-4 rounded-lg">
                <div className="text-gray-400 text-sm">Last Crash</div>
                <div className="text-white text-xl font-bold">
                  {gameState.crashPoint ? `${gameState.crashPoint.toFixed(2)}x` : '...'}
                </div>
              </div>
            </div>

            {/* Additional Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-800 p-4 rounded-lg">
                <div className="text-gray-400 text-sm">Total Rounds</div>
                <div className="text-white text-lg font-bold">{stats.totalRounds.toLocaleString()}</div>
              </div>
              <div className="bg-gray-800 p-4 rounded-lg">
                <div className="text-gray-400 text-sm">Biggest Win</div>
                <div className="text-green-400 text-lg font-bold">{stats.biggestWin.toFixed(1)} SOL</div>
              </div>
            </div>
          </div>

          {/* Chat */}
          <div>
            <ChatBox />
          </div>
        </div>
      </div>
    </div>
  );
}
