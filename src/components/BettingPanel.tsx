'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useWallet } from '@solana/wallet-adapter-react';

interface BettingPanelProps {
  isGameActive: boolean;
  canBet: boolean;
  canCashOut: boolean;
  multiplier: number;
  onPlaceBet: (amount: number) => void;
  onCashOut: () => void;
  playerBalance: number;
  currentBet: number | null;
}

export function BettingPanel({
  isGameActive,
  canBet,
  canCashOut,
  multiplier,
  onPlaceBet,
  onCashOut,
  playerBalance,
  currentBet,
}: BettingPanelProps) {
  const [betAmount, setBetAmount] = useState<string>('0.1');
  const { connected } = useWallet();

  const handlePlaceBet = () => {
    const amount = Number.parseFloat(betAmount);
    if (amount > 0 && amount <= playerBalance) {
      onPlaceBet(amount);
    }
  };

  const potentialPayout = currentBet ? (currentBet * multiplier) : 0;

  return (
    <div className="bg-gray-800 rounded-lg p-6 space-y-4">
      <div className="text-white text-lg font-bold mb-4">Betting Panel</div>

      {/* Balance Display */}
      <div className="text-gray-300">
        <span className="text-sm">Balance: </span>
        <span className="font-mono">{playerBalance.toFixed(4)} SOL</span>
      </div>

      {/* Current Bet Display */}
      {currentBet && (
        <div className="bg-gray-700 p-3 rounded">
          <div className="text-green-400 text-sm">Active Bet</div>
          <div className="text-white font-mono">{currentBet.toFixed(4)} SOL</div>
          <div className="text-gray-300 text-sm">
            Potential payout: {potentialPayout.toFixed(4)} SOL
          </div>
        </div>
      )}

      {!connected ? (
        <div className="text-center py-4">
          <div className="text-gray-400 mb-2">Connect your wallet to start playing</div>
        </div>
      ) : (
        <>
          {/* Bet Amount Input */}
          <div className="space-y-2">
            <label className="text-gray-300 text-sm">Bet Amount (SOL)</label>
            <Input
              type="number"
              value={betAmount}
              onChange={(e) => setBetAmount(e.target.value)}
              placeholder="0.1"
              step="0.01"
              min="0.01"
              max={playerBalance}
              disabled={!canBet || currentBet !== null}
              className="bg-gray-700 border-gray-600 text-white"
            />
          </div>

          {/* Quick Bet Buttons */}
          <div className="grid grid-cols-4 gap-2">
            {[0.1, 0.5, 1.0, 2.0].map((amount) => (
              <Button
                key={amount}
                variant="outline"
                size="sm"
                onClick={() => setBetAmount(amount.toString())}
                disabled={!canBet || currentBet !== null}
                className="bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600"
              >
                {amount}
              </Button>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="space-y-2">
            {!currentBet ? (
              <Button
                onClick={handlePlaceBet}
                disabled={!canBet || Number.parseFloat(betAmount) <= 0 || Number.parseFloat(betAmount) > playerBalance}
                className="w-full bg-orange-600 hover:bg-orange-700 text-white"
              >
                {canBet ? 'Place Bet' : 'Game in Progress'}
              </Button>
            ) : (
              <Button
                onClick={onCashOut}
                disabled={!canCashOut}
                className="w-full bg-green-600 hover:bg-green-700 text-white animate-pulse"
              >
                Cash Out ({potentialPayout.toFixed(4)} SOL)
              </Button>
            )}
          </div>

          {/* Game Status */}
          <div className="text-center text-sm text-gray-400">
            {!isGameActive && !currentBet && 'Place your bet for the next round'}
            {isGameActive && currentBet && 'Cash out before it crashes!'}
            {isGameActive && !currentBet && 'Round in progress - wait for next round'}
          </div>
        </>
      )}
    </div>
  );
}
