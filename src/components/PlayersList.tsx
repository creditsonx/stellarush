'use client';

import { useState, useEffect } from 'react';

interface Player {
  publicKey: string;
  bet: number;
  cashedOut: boolean;
  cashOutMultiplier?: number;
  payout?: number;
}

interface PlayersListProps {
  currentMultiplier: number;
  isGameActive: boolean;
}

export function PlayersList({ currentMultiplier, isGameActive }: PlayersListProps) {
  const [players, setPlayers] = useState<Player[]>([
    // Mock players for demonstration
    {
      publicKey: '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgHVU',
      bet: 0.5,
      cashedOut: false,
    },
    {
      publicKey: '3fTv3Pn8TzfSPzD4V8NmQyHJKjYbR2aJhUgFvCwNm5Lq',
      bet: 1.2,
      cashedOut: true,
      cashOutMultiplier: 2.34,
      payout: 2.808,
    },
    {
      publicKey: '9gRqKW8dHnPz4vBxMjQcSzKyLpAqWn5FgThYx7NvUiJk',
      bet: 0.25,
      cashedOut: false,
    },
    {
      publicKey: '2hKjMpR8vLqPz6WxNcFdBgYtVnSaJkHi4DwUyQaP5rZu',
      bet: 2.0,
      cashedOut: true,
      cashOutMultiplier: 1.89,
      payout: 3.78,
    },
  ]);

  const formatAddress = (address: string) => {
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  };

  const getCurrentPayout = (bet: number) => {
    return bet * currentMultiplier;
  };

  return (
    <div className="bg-gray-800 rounded-lg p-4">
      <h3 className="text-white text-lg font-bold mb-4">
        Players ({players.length})
      </h3>

      <div className="space-y-2 max-h-64 overflow-y-auto">
        {players.map((player, index) => (
          <div
            key={player.publicKey}
            className={`p-3 rounded-lg border ${
              player.cashedOut
                ? 'bg-green-900/20 border-green-700/30'
                : 'bg-gray-700/50 border-gray-600/30'
            }`}
          >
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="text-gray-300 text-sm font-mono">
                  {formatAddress(player.publicKey)}
                </div>
                <div className="text-gray-400 text-xs">
                  Bet: {player.bet.toFixed(3)} SOL
                </div>
              </div>

              <div className="text-right">
                {player.cashedOut ? (
                  <div>
                    <div className="text-green-400 text-sm font-bold">
                      {player.cashOutMultiplier?.toFixed(2)}x
                    </div>
                    <div className="text-green-300 text-xs">
                      +{player.payout?.toFixed(3)} SOL
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="text-white text-sm font-bold">
                      {currentMultiplier.toFixed(2)}x
                    </div>
                    <div className="text-gray-300 text-xs">
                      {getCurrentPayout(player.bet).toFixed(3)} SOL
                    </div>
                  </div>
                )}
              </div>
            </div>

            {player.cashedOut && (
              <div className="mt-2 text-xs text-green-400">
                ✓ Cashed out
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Summary */}
      <div className="mt-4 pt-4 border-t border-gray-700">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <div className="text-gray-400">Total Bet</div>
            <div className="text-white font-mono">
              {players.reduce((acc, p) => acc + p.bet, 0).toFixed(3)} SOL
            </div>
          </div>
          <div>
            <div className="text-gray-400">Cashed Out</div>
            <div className="text-green-400 font-mono">
              {players.filter(p => p.cashedOut).length}/{players.length}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
