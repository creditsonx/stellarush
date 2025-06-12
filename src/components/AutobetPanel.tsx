'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAutobet, type AutobetSettings } from '@/hooks/useAutobet';
import {
  Play,
  Pause,
  RotateCcw,
  Settings,
  TrendingUp,
  TrendingDown,
  Target,
  DollarSign,
  Hash,
  Zap
} from 'lucide-react';

interface AutobetPanelProps {
  onStartAutobet: (settings: AutobetSettings) => void;
  onStopAutobet: () => void;
  playerBalance: number;
  isGameActive: boolean;
}

export function AutobetPanel({
  onStartAutobet,
  onStopAutobet,
  playerBalance,
  isGameActive
}: AutobetPanelProps) {
  const { settings, state, updateSettings, resetStats, getStats, isRunning } = useAutobet();
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showStats, setShowStats] = useState(false);

  const stats = getStats();

  const handleStartStop = () => {
    if (isRunning) {
      onStopAutobet();
    } else {
      onStartAutobet(settings);
    }
  };

  const handleSettingChange = (key: keyof AutobetSettings, value: string | number | boolean) => {
    updateSettings({ [key]: value });
  };

  const validateBetAmount = (amount: number): boolean => {
    return amount >= settings.minBetAmount &&
           amount <= settings.maxBetAmount &&
           amount <= playerBalance;
  };

  const strategies = [
    { value: 'fixed', label: 'Fixed Bet', description: 'Same amount every bet' },
    { value: 'martingale', label: 'Martingale', description: 'Double after loss' },
    { value: 'reverse-martingale', label: 'Reverse Martingale', description: 'Double after win' },
    { value: 'fibonacci', label: 'Fibonacci', description: 'Follow Fibonacci sequence' },
  ];

  return (
    <div className="bg-gray-800 rounded-lg p-4">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="text-white font-bold flex items-center gap-2">
            <Zap className="w-4 h-4 text-orange-400" />
            AutoBet
            {isRunning && (
              <span className="text-xs bg-green-600 text-white px-2 py-1 rounded-full animate-pulse">
                ACTIVE
              </span>
            )}
          </h3>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowStats(!showStats)}
              className="p-2 text-gray-400 hover:text-orange-400"
              title="Statistics"
            >
              <TrendingUp className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="p-2 text-gray-400 hover:text-orange-400"
              title="Advanced Settings"
            >
              <Settings className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Basic Settings */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-gray-300 text-xs block mb-1">Bet Amount (SOL)</label>
            <Input
              type="number"
              step="0.01"
              min={settings.minBetAmount}
              max={Math.min(settings.maxBetAmount, playerBalance)}
              value={settings.betAmount}
              onChange={(e) => handleSettingChange('betAmount', Number.parseFloat(e.target.value) || 0)}
              className="bg-gray-700 border-gray-600 text-white text-sm"
              disabled={isRunning}
            />
          </div>
          <div>
            <label className="text-gray-300 text-xs block mb-1">Auto Cash Out</label>
            <Input
              type="number"
              step="0.1"
              min="1.01"
              max="100"
              value={settings.autoCashOut}
              onChange={(e) => handleSettingChange('autoCashOut', Number.parseFloat(e.target.value) || 1.01)}
              className="bg-gray-700 border-gray-600 text-white text-sm"
              disabled={isRunning}
            />
            <div className="text-xs text-gray-400 mt-1">{settings.autoCashOut.toFixed(2)}x</div>
          </div>
        </div>

        {/* Strategy Selection */}
        <div>
          <label className="text-gray-300 text-xs block mb-2">Betting Strategy</label>
          <div className="grid grid-cols-2 gap-2">
            {strategies.map((strategy) => (
              <Button
                key={strategy.value}
                variant={settings.strategy === strategy.value ? "default" : "outline"}
                size="sm"
                onClick={() => handleSettingChange('strategy', strategy.value)}
                className="text-xs p-2 h-auto flex flex-col items-start"
                disabled={isRunning}
                title={strategy.description}
              >
                <span className="font-medium">{strategy.label}</span>
                <span className="text-xs opacity-70">{strategy.description}</span>
              </Button>
            ))}
          </div>
        </div>

        {/* Strategy-specific settings */}
        {(settings.strategy === 'martingale' || settings.strategy === 'reverse-martingale') && (
          <div>
            <label className="text-gray-300 text-xs block mb-1">Multiplier</label>
            <Input
              type="number"
              step="0.1"
              min="1.1"
              max="10"
              value={settings.martingaleMultiplier}
              onChange={(e) => handleSettingChange('martingaleMultiplier', Number.parseFloat(e.target.value) || 2)}
              className="bg-gray-700 border-gray-600 text-white text-sm"
              disabled={isRunning}
            />
          </div>
        )}

        {/* Advanced Settings */}
        {showAdvanced && (
          <div className="border-t border-gray-700 pt-4 space-y-3">
            <h4 className="text-gray-300 font-medium text-sm">Advanced Settings</h4>

            {/* Stop Conditions */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <input
                    type="checkbox"
                    id="stopOnWin"
                    checked={settings.stopOnWin}
                    onChange={(e) => handleSettingChange('stopOnWin', e.target.checked)}
                    className="rounded"
                    disabled={isRunning}
                  />
                  <label htmlFor="stopOnWin" className="text-gray-300 text-xs">Stop on Win</label>
                </div>
                {settings.stopOnWin && (
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={settings.stopWinAmount}
                    onChange={(e) => handleSettingChange('stopWinAmount', Number.parseFloat(e.target.value) || 0)}
                    className="bg-gray-700 border-gray-600 text-white text-sm"
                    placeholder="Win amount"
                    disabled={isRunning}
                  />
                )}
              </div>

              <div>
                <div className="flex items-center gap-2 mb-1">
                  <input
                    type="checkbox"
                    id="stopOnLoss"
                    checked={settings.stopOnLoss}
                    onChange={(e) => handleSettingChange('stopOnLoss', e.target.checked)}
                    className="rounded"
                    disabled={isRunning}
                  />
                  <label htmlFor="stopOnLoss" className="text-gray-300 text-xs">Stop on Loss</label>
                </div>
                {settings.stopOnLoss && (
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={settings.stopLossAmount}
                    onChange={(e) => handleSettingChange('stopLossAmount', Number.parseFloat(e.target.value) || 0)}
                    className="bg-gray-700 border-gray-600 text-white text-sm"
                    placeholder="Loss amount"
                    disabled={isRunning}
                  />
                )}
              </div>
            </div>

            {/* Number of Bets */}
            <div>
              <label className="text-gray-300 text-xs block mb-1">Number of Bets (0 = infinite)</label>
              <Input
                type="number"
                min="0"
                max="10000"
                value={settings.numberOfBets}
                onChange={(e) => handleSettingChange('numberOfBets', Number.parseInt(e.target.value) || 0)}
                className="bg-gray-700 border-gray-600 text-white text-sm"
                disabled={isRunning}
              />
            </div>

            {/* Bet Limits */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-gray-300 text-xs block mb-1">Min Bet</label>
                <Input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={settings.minBetAmount}
                  onChange={(e) => handleSettingChange('minBetAmount', Number.parseFloat(e.target.value) || 0.01)}
                  className="bg-gray-700 border-gray-600 text-white text-sm"
                  disabled={isRunning}
                />
              </div>
              <div>
                <label className="text-gray-300 text-xs block mb-1">Max Bet</label>
                <Input
                  type="number"
                  step="0.01"
                  min={settings.minBetAmount}
                  value={settings.maxBetAmount}
                  onChange={(e) => handleSettingChange('maxBetAmount', Number.parseFloat(e.target.value) || 1)}
                  className="bg-gray-700 border-gray-600 text-white text-sm"
                  disabled={isRunning}
                />
              </div>
            </div>
          </div>
        )}

        {/* Statistics */}
        {showStats && state.totalBets > 0 && (
          <div className="border-t border-gray-700 pt-4 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-gray-300 font-medium text-sm">Statistics</h4>
              <Button
                variant="ghost"
                size="sm"
                onClick={resetStats}
                className="text-xs p-1"
                disabled={isRunning}
                title="Reset Statistics"
              >
                <RotateCcw className="w-3 h-3" />
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-gray-700 p-2 rounded">
                <div className="text-gray-400">Total Bets</div>
                <div className="text-white font-bold">{stats.totalBets}</div>
              </div>
              <div className="bg-gray-700 p-2 rounded">
                <div className="text-gray-400">Win Rate</div>
                <div className="text-white font-bold">{stats.winRate}%</div>
              </div>
              <div className="bg-gray-700 p-2 rounded">
                <div className="text-gray-400">Profit</div>
                <div className={`font-bold ${state.profit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {stats.profitFormatted} SOL
                </div>
              </div>
              <div className="bg-gray-700 p-2 rounded">
                <div className="text-gray-400">Current Streak</div>
                <div className="text-white font-bold">
                  {stats.currentStreak} {stats.streakType === 'win' ? '🎯' : stats.streakType === 'loss' ? '💔' : ''}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Current Bet Display */}
        {isRunning && (
          <div className="bg-orange-900/20 border border-orange-500/30 rounded p-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-300 text-sm">Next Bet:</span>
              <span className="text-orange-400 font-bold">{state.currentBet.toFixed(4)} SOL</span>
            </div>
            {settings.numberOfBets > 0 && (
              <div className="flex items-center justify-between mt-1">
                <span className="text-gray-400 text-xs">Progress:</span>
                <span className="text-gray-300 text-xs">
                  {state.totalBets}/{settings.numberOfBets}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Control Buttons */}
        <div className="flex gap-2">
          <Button
            onClick={handleStartStop}
            disabled={isGameActive || !validateBetAmount(settings.betAmount)}
            className={`flex-1 ${isRunning
              ? 'bg-red-600 hover:bg-red-700'
              : 'bg-orange-600 hover:bg-orange-700'
            }`}
          >
            {isRunning ? (
              <>
                <Pause className="w-4 h-4 mr-2" />
                Stop AutoBet
              </>
            ) : (
              <>
                <Play className="w-4 h-4 mr-2" />
                Start AutoBet
              </>
            )}
          </Button>

          {!isRunning && state.totalBets > 0 && (
            <Button
              variant="outline"
              onClick={resetStats}
              className="px-3"
              title="Reset Statistics"
            >
              <RotateCcw className="w-4 h-4" />
            </Button>
          )}
        </div>

        {/* Validation Messages */}
        {!validateBetAmount(settings.betAmount) && (
          <div className="text-red-400 text-xs">
            {settings.betAmount > playerBalance
              ? 'Insufficient balance'
              : 'Invalid bet amount'
            }
          </div>
        )}
      </div>
    </div>
  );
}
