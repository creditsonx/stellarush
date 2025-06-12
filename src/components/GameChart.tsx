'use client';

import { LineChart, Line, XAxis, YAxis, ResponsiveContainer } from 'recharts';

interface GameChartProps {
  isGameActive: boolean;
  multiplier: number;
  gameData: Array<{ time: number; multiplier: number }>;
  crashed: boolean;
}

// FIXED star positions to prevent auto-scrolling
const FIXED_STARS = [
  { id: 'star-1', left: 10, top: 20, delay: 0 },
  { id: 'star-2', left: 25, top: 15, delay: 0.5 },
  { id: 'star-3', left: 40, top: 30, delay: 1 },
  { id: 'star-4', left: 60, top: 10, delay: 1.5 },
  { id: 'star-5', left: 75, top: 25, delay: 2 },
  { id: 'star-6', left: 85, top: 45, delay: 0.8 },
  { id: 'star-7', left: 15, top: 50, delay: 1.2 },
  { id: 'star-8', left: 50, top: 60, delay: 0.3 },
  { id: 'star-9', left: 80, top: 70, delay: 1.8 },
  { id: 'star-10', left: 30, top: 80, delay: 0.7 },
  { id: 'star-11', left: 70, top: 85, delay: 1.4 },
  { id: 'star-12', left: 20, top: 90, delay: 2.2 },
  { id: 'star-13', left: 90, top: 30, delay: 0.9 },
  { id: 'star-14', left: 5, top: 70, delay: 1.6 },
  { id: 'star-15', left: 45, top: 5, delay: 2.5 }
];

export function GameChart({ isGameActive, multiplier, gameData, crashed }: GameChartProps) {
  return (
    <div className="w-full h-96 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-lg p-4 relative overflow-hidden border border-gray-700">
      {/* Animated background elements with FIXED positions */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Fixed Stars - No random positions */}
        {FIXED_STARS.map((star) => (
          <div
            key={star.id}
            className="absolute w-1 h-1 bg-white rounded-full opacity-30 animate-pulse"
            style={{
              left: `${star.left}%`,
              top: `${star.top}%`,
              animationDelay: `${star.delay}s`,
              animationDuration: '3s',
            }}
          />
        ))}
      </div>

      {/* Game Status Overlay */}
      <div className="absolute top-4 left-4 z-10">
        {!isGameActive && !crashed && (
          <div className="text-white text-xl font-bold bg-gray-800/80 backdrop-blur-sm px-3 py-2 rounded-lg border border-gray-600">
            🚀 Preparing for launch...
          </div>
        )}
        {crashed && (
          <div className="text-red-500 text-2xl font-bold animate-pulse bg-red-900/30 backdrop-blur-sm px-4 py-2 rounded-lg border border-red-500/50">
            💥 CRASHED!
          </div>
        )}
      </div>

      {/* Multiplier Display */}
      <div className="absolute top-4 right-4 z-10">
        <div className={`text-4xl font-bold transition-all duration-300 bg-gray-800/90 backdrop-blur-sm px-4 py-2 rounded-lg border ${
          crashed
            ? 'text-red-500 animate-pulse border-red-500/50 shadow-lg shadow-red-500/20'
            : multiplier > 5
              ? 'text-yellow-400 animate-pulse border-yellow-400/50 shadow-lg shadow-yellow-400/20'
              : 'text-green-400 border-green-400/50 shadow-lg shadow-green-400/20'
        }`}>
          <span className="drop-shadow-lg">{multiplier.toFixed(2)}x</span>
          {multiplier > 2 && !crashed && (
            <div className="text-xs text-gray-300 text-center mt-1">
              🌟 {multiplier > 5 ? 'STELLAR!' : 'RISING!'}
            </div>
          )}
        </div>
      </div>

      {/* Chart */}
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={gameData}>
          <XAxis
            dataKey="time"
            hide
            domain={['dataMin', 'dataMax']}
          />
          <YAxis
            hide
            domain={[1, 'dataMax']}
          />
          <Line
            type="monotone"
            dataKey="multiplier"
            stroke={crashed ? "#ef4444" : "#22c55e"}
            strokeWidth={3}
            dot={false}
            animationDuration={0}
          />
        </LineChart>
      </ResponsiveContainer>

      {/* Grid Background */}
      <div className="absolute inset-0 pointer-events-none">
        <svg width="100%" height="100%" className="opacity-20">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="gray" strokeWidth="1"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>
    </div>
  );
}
