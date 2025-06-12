'use client';

import { motion } from 'framer-motion';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  className?: string;
}

export function Logo({ size = 'md', showText = true, className = '' }: LogoProps) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24',
  };

  const textSizeClasses = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-3xl',
    xl: 'text-5xl',
  };

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Rocket Logo */}
      <motion.div
        className={`relative ${sizeClasses[size]} flex items-center justify-center`}
        whileHover={{ scale: 1.1 }}
        transition={{ type: "spring", stiffness: 400, damping: 10 }}
      >
        {/* Outer glow */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-orange-500 via-red-500 to-purple-600 opacity-30 blur-md" />

        {/* Main rocket container */}
        <div className="relative w-full h-full rounded-full bg-gradient-to-br from-orange-500 via-red-500 to-purple-600 p-0.5">
          <div className="w-full h-full rounded-full bg-gray-900 flex items-center justify-center">
            {/* Rocket SVG */}
            <svg
              className="w-2/3 h-2/3 text-white"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              {/* Rocket body */}
              <path d="M12 2L15 9H9L12 2Z" className="text-orange-400" fill="currentColor" />
              <path d="M9 9H15V16H9V9Z" className="text-gray-300" fill="currentColor" />

              {/* Rocket fins */}
              <path d="M7 11L9 9V13L7 11Z" className="text-orange-500" fill="currentColor" />
              <path d="M17 11L15 9V13L17 11Z" className="text-orange-500" fill="currentColor" />

              {/* Rocket exhaust */}
              <motion.path
                d="M10 16L12 22L14 16H10Z"
                className="text-blue-400"
                fill="currentColor"
                animate={{
                  opacity: [0.6, 1, 0.6],
                  scale: [0.9, 1.1, 0.9],
                }}
                transition={{
                  duration: 1,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: "easeInOut",
                }}
              />

              {/* Window */}
              <circle cx="12" cy="12" r="1.5" className="text-blue-300" fill="currentColor" />
            </svg>
          </div>
        </div>

        {/* Animated particles */}
        <motion.div
          className="absolute -bottom-1 left-1/2 transform -translate-x-1/2"
          animate={{
            y: [0, -20, 0],
            opacity: [1, 0.3, 1],
          }}
          transition={{
            duration: 0.8,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
        >
          <div className="w-1 h-1 bg-orange-400 rounded-full" />
        </motion.div>

        <motion.div
          className="absolute -bottom-2 left-1/3 transform -translate-x-1/2"
          animate={{
            y: [0, -15, 0],
            opacity: [0.8, 0.2, 0.8],
          }}
          transition={{
            duration: 1.2,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
            delay: 0.3,
          }}
        >
          <div className="w-0.5 h-0.5 bg-red-400 rounded-full" />
        </motion.div>

        <motion.div
          className="absolute -bottom-2 right-1/3 transform translate-x-1/2"
          animate={{
            y: [0, -15, 0],
            opacity: [0.8, 0.2, 0.8],
          }}
          transition={{
            duration: 1.2,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
            delay: 0.6,
          }}
        >
          <div className="w-0.5 h-0.5 bg-yellow-400 rounded-full" />
        </motion.div>
      </motion.div>

      {/* Text Logo */}
      {showText && (
        <motion.div
          className="flex flex-col leading-tight"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <span className={`font-bold bg-gradient-to-r from-orange-400 via-red-400 to-purple-400 bg-clip-text text-transparent ${textSizeClasses[size]}`}>
            STELLA
          </span>
          <span className={`font-bold bg-gradient-to-r from-blue-400 via-cyan-400 to-teal-400 bg-clip-text text-transparent ${textSizeClasses[size]} -mt-1`}>
            RUSH
          </span>
        </motion.div>
      )}
    </div>
  );
}

// Compact horizontal version
export function LogoHorizontal({ size = 'md', className = '' }: LogoProps) {
  const textSizeClasses = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-3xl',
    xl: 'text-5xl',
  };

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <Logo size={size} showText={false} />
      <motion.span
        className={`font-bold bg-gradient-to-r from-orange-400 via-red-400 to-purple-400 bg-clip-text text-transparent ${textSizeClasses[size]}`}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2 }}
      >
        STELLARUSH
      </motion.span>
    </div>
  );
}
