'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

export interface AutobetSettings {
  enabled: boolean;
  betAmount: number;
  autoCashOut: number;
  stopOnWin: boolean;
  stopOnLoss: boolean;
  stopWinAmount: number;
  stopLossAmount: number;
  numberOfBets: number; // 0 = infinite
  strategy: 'fixed' | 'martingale' | 'reverse-martingale' | 'fibonacci';
  martingaleMultiplier: number;
  resetOnWin: boolean;
  resetOnLoss: boolean;
  maxBetAmount: number;
  minBetAmount: number;
}

export interface AutobetState {
  isRunning: boolean;
  currentBet: number;
  totalBets: number;
  totalWins: number;
  totalLosses: number;
  currentStreak: number;
  streakType: 'win' | 'loss' | 'none';
  profit: number;
  fibonacciSequence: number[];
  fibonacciIndex: number;
}

const defaultSettings: AutobetSettings = {
  enabled: false,
  betAmount: 0.1,
  autoCashOut: 2.0,
  stopOnWin: false,
  stopOnLoss: false,
  stopWinAmount: 1.0,
  stopLossAmount: 1.0,
  numberOfBets: 0,
  strategy: 'fixed',
  martingaleMultiplier: 2.0,
  resetOnWin: false,
  resetOnLoss: false,
  maxBetAmount: 10.0,
  minBetAmount: 0.01,
};

const defaultState: AutobetState = {
  isRunning: false,
  currentBet: 0.1,
  totalBets: 0,
  totalWins: 0,
  totalLosses: 0,
  currentStreak: 0,
  streakType: 'none',
  profit: 0,
  fibonacciSequence: [1, 1],
  fibonacciIndex: 0,
};

export function useAutobet() {
  const [settings, setSettings] = useState<AutobetSettings>(defaultSettings);
  const [state, setState] = useState<AutobetState>(defaultState);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const stopConditionsMetRef = useRef<boolean>(false);

  // Load settings from localStorage
  useEffect(() => {
    const savedSettings = localStorage.getItem('stellarush-autobet-settings');
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        setSettings({ ...defaultSettings, ...parsed });
        setState(prev => ({ ...prev, currentBet: parsed.betAmount || defaultSettings.betAmount }));
      } catch (error) {
        console.error('STELLARUSH: Failed to parse autobet settings:', error);
      }
    }
  }, []);

  // Save settings to localStorage
  useEffect(() => {
    localStorage.setItem('stellarush-autobet-settings', JSON.stringify(settings));
  }, [settings]);

  // Calculate next bet amount based on strategy
  const calculateNextBet = useCallback((won: boolean): number => {
    const { strategy, betAmount, martingaleMultiplier, maxBetAmount, minBetAmount } = settings;
    const { currentBet, fibonacciSequence, fibonacciIndex } = state;

    let nextBet = currentBet;

    switch (strategy) {
      case 'fixed':
        nextBet = betAmount;
        break;

      case 'martingale':
        if (won) {
          nextBet = settings.resetOnWin ? betAmount : currentBet;
        } else {
          nextBet = currentBet * martingaleMultiplier;
        }
        break;

      case 'reverse-martingale':
        if (won) {
          nextBet = currentBet * martingaleMultiplier;
        } else {
          nextBet = settings.resetOnLoss ? betAmount : currentBet;
        }
        break;

      case 'fibonacci':
        if (won) {
          // Move back in sequence
          const newIndex = Math.max(0, fibonacciIndex - 1);
          nextBet = betAmount * fibonacciSequence[newIndex];
          setState(prev => ({ ...prev, fibonacciIndex: newIndex }));
        } else {
          // Move forward in sequence
          const newIndex = fibonacciIndex + 1;

          // Extend Fibonacci sequence if needed
          const newSequence = [...fibonacciSequence];
          while (newIndex >= newSequence.length) {
            const nextFib = newSequence[newSequence.length - 1] + newSequence[newSequence.length - 2];
            newSequence.push(nextFib);
          }

          nextBet = betAmount * newSequence[newIndex];
          setState(prev => ({
            ...prev,
            fibonacciIndex: newIndex,
            fibonacciSequence: newSequence
          }));
        }
        break;
    }

    // Ensure bet is within limits
    nextBet = Math.max(minBetAmount, Math.min(maxBetAmount, nextBet));

    return nextBet;
  }, [settings, state]);

  // Check stop conditions
  const checkStopConditions = useCallback((): boolean => {
    const { stopOnWin, stopOnLoss, stopWinAmount, stopLossAmount, numberOfBets } = settings;
    const { totalBets, profit } = state;

    // Check number of bets limit
    if (numberOfBets > 0 && totalBets >= numberOfBets) {
      return true;
    }

    // Check profit limits
    if (stopOnWin && profit >= stopWinAmount) {
      return true;
    }

    if (stopOnLoss && profit <= -stopLossAmount) {
      return true;
    }

    return false;
  }, [settings, state]);

  // Update autobet state after a game round
  const updateAutobetState = useCallback((won: boolean, betAmount: number, payout = 0) => {
    setState(prev => {
      const profit = won ? payout - betAmount : -betAmount;
      const newTotalProfit = prev.profit + profit;

      const newStreak = prev.streakType === (won ? 'win' : 'loss') ? prev.currentStreak + 1 : 1;

      const nextBet = calculateNextBet(won);

      return {
        ...prev,
        totalBets: prev.totalBets + 1,
        totalWins: won ? prev.totalWins + 1 : prev.totalWins,
        totalLosses: won ? prev.totalLosses : prev.totalLosses + 1,
        currentStreak: newStreak,
        streakType: won ? 'win' : 'loss',
        profit: newTotalProfit,
        currentBet: nextBet,
      };
    });
  }, [calculateNextBet]);

  // Start autobet
  const startAutobet = useCallback((onPlaceBet: (amount: number) => void, onCashOut: () => void) => {
    if (state.isRunning) return;

    setState(prev => ({
      ...prev,
      isRunning: true,
      currentBet: settings.betAmount,
    }));

    stopConditionsMetRef.current = false;
    console.log('STELLARUSH: Autobet started');
  }, [settings.betAmount, state.isRunning]);

  // Stop autobet
  const stopAutobet = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    setState(prev => ({ ...prev, isRunning: false }));
    stopConditionsMetRef.current = false;
    console.log('STELLARUSH: Autobet stopped');
  }, []);

  // Reset autobet statistics
  const resetStats = useCallback(() => {
    setState(prev => ({
      ...prev,
      totalBets: 0,
      totalWins: 0,
      totalLosses: 0,
      currentStreak: 0,
      streakType: 'none',
      profit: 0,
      fibonacciIndex: 0,
      currentBet: settings.betAmount,
    }));
  }, [settings.betAmount]);

  // Update settings
  const updateSettings = useCallback((newSettings: Partial<AutobetSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));

    // Update current bet if bet amount changed
    if (newSettings.betAmount !== undefined) {
      setState(prev => ({ ...prev, currentBet: newSettings.betAmount as number }));
    }
  }, []);

  // Auto-bet logic hook for game integration
  const handleGameResult = useCallback((
    won: boolean,
    betAmount: number,
    payout = 0,
    onNextBet?: (amount: number) => void
  ) => {
    if (!state.isRunning) return;

    // Update statistics
    updateAutobetState(won, betAmount, payout);

    // Check stop conditions after updating state
    setTimeout(() => {
      if (checkStopConditions()) {
        stopAutobet();
        return;
      }

      // Place next bet if autobet is still running
      if (state.isRunning && onNextBet) {
        onNextBet(state.currentBet);
      }
    }, 100);
  }, [state.isRunning, updateAutobetState, checkStopConditions, stopAutobet, state.currentBet]);

  // Get formatted statistics
  const getStats = useCallback(() => {
    const winRate = state.totalBets > 0 ? (state.totalWins / state.totalBets) * 100 : 0;
    const avgProfit = state.totalBets > 0 ? state.profit / state.totalBets : 0;

    return {
      ...state,
      winRate: winRate.toFixed(1),
      avgProfit: avgProfit.toFixed(4),
      profitFormatted: state.profit >= 0 ? `+${state.profit.toFixed(4)}` : state.profit.toFixed(4),
    };
  }, [state]);

  return {
    settings,
    state,
    updateSettings,
    startAutobet,
    stopAutobet,
    resetStats,
    handleGameResult,
    checkStopConditions,
    getStats,
    isRunning: state.isRunning,
  };
}
