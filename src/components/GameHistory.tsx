'use client';

import { useState, useEffect } from 'react';

interface GameResult {
  roundId: string;
  crashPoint: number;
  timestamp: number;
}

interface GameHistoryProps {
  currentResult?: GameResult;
}

export function GameHistory({ currentResult }: GameHistoryProps) {
  const [history, setHistory] = useState<GameResult[]>([
    // Mock data for demonstration
    { roundId: '1', crashPoint: 2.45, timestamp: Date.now() - 60000 },
    { roundId: '2', crashPoint: 1.23, timestamp: Date.now() - 120000 },
    { roundId: '3', crashPoint: 5.67, timestamp: Date.now() - 180000 },
    { roundId: '4', crashPoint: 1.01, timestamp: Date.now() - 240000 },
    { roundId: '5', crashPoint: 3.21, timestamp: Date.now() - 300000 },
  ]);

  // Add new result to history when game crashes
  useEffect(() => {
    if (currentResult && !history.find(h => h.roundId === currentResult.roundId)) {
      setHistory(prev => [currentResult, ...prev.slice(0, 19)]); // Keep last 20 results
    }
  }, [currentResult, history]);

  const getCrashColor = (crashPoint: number) => {
    if (crashPoint < 1.5) return 'text-red-400';
    if (crashPoint < 3.0) return 'text-yellow-400';
    return 'text-green-400';
  };

  const getCrashBg = (crashPoint: number) => {
    if (crashPoint < 1.5) return 'bg-red-900/20';
    if (crashPoint < 3.0) return 'bg-yellow-900/20';
    return 'bg-green-900/20';
  };

  return (
    <div className="bg-gray-800 rounded-lg p-4">
      <h3 className="text-white text-lg font-bold mb-4">Recent Results</h3>
      <div className="space-y-2 max-h-64 overflow-y-auto">
        {history.map((result, index) => (
          <div
            key={result.roundId}
            className={`flex justify-between items-center p-2 rounded ${getCrashBg(result.crashPoint)}`}
          >
            <div className="text-gray-400 text-sm">
              #{result.roundId}
            </div>
            <div className={`font-mono font-bold ${getCrashColor(result.crashPoint)}`}>
              {result.crashPoint.toFixed(2)}x
            </div>
          </div>
        ))}
      </div>

      {/* Statistics */}
      <div className="mt-4 pt-4 border-t border-gray-700">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <div className="text-gray-400">Average</div>
            <div className="text-white font-mono">
              {(history.reduce((acc, h) => acc + h.crashPoint, 0) / history.length).toFixed(2)}x
            </div>
          </div>
          <div>
            <div className="text-gray-400">Highest</div>
            <div className="text-green-400 font-mono">
              {Math.max(...history.map(h => h.crashPoint)).toFixed(2)}x
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
