'use client';

import { useState, useEffect } from 'react';

interface GameStats {
  playersOnline: number;
  totalWagered: number;
  currentRoundBets: number;
  totalRounds: number;
  biggestWin: number;
}

export function useGameStats() {
  const [stats, setStats] = useState<GameStats>({
    playersOnline: 42,
    totalWagered: 1234.5,
    currentRoundBets: 12,
    totalRounds: 8467,
    biggestWin: 23.8,
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setStats(prev => {
        const playersChange = Math.floor(Math.random() * 6) - 2; // -2 to +3
        const wageredIncrease = Math.random() * 15 + 5; // 5-20 SOL increase
        const roundBetsChange = Math.floor(Math.random() * 4) - 1; // -1 to +2

        return {
          playersOnline: Math.max(25, Math.min(85, prev.playersOnline + playersChange)),
          totalWagered: prev.totalWagered + wageredIncrease,
          currentRoundBets: Math.max(8, Math.min(25, prev.currentRoundBets + roundBetsChange)),
          totalRounds: prev.totalRounds + (Math.random() < 0.3 ? 1 : 0), // Sometimes increment rounds
          biggestWin: Math.max(prev.biggestWin, prev.biggestWin + (Math.random() < 0.05 ? Math.random() * 10 : 0)),
        };
      });
    }, 3000 + Math.random() * 4000); // Random interval 3-7 seconds

    return () => clearInterval(interval);
  }, []);

  return stats;
}
