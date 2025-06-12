'use client';

import { useState, useEffect } from 'react';
import { useSocket } from '@/lib/socket';
import { Wifi, WifiOff, Loader2, AlertTriangle } from 'lucide-react';

interface ConnectionStatusProps {
  showDetails?: boolean;
  className?: string;
}

export function ConnectionStatus({ showDetails = false, className = '' }: ConnectionStatusProps) {
  const { socket, connected, connecting } = useSocket();
  const [connectionState, setConnectionState] = useState<'connected' | 'connecting' | 'disconnected' | 'error'>('disconnected');
  const [serverUrl, setServerUrl] = useState<string>('');

  useEffect(() => {
    if (!socket) return;

    // Get server URL for display
    setServerUrl(socket.io.uri);

    const updateConnectionState = () => {
      if (connected) {
        setConnectionState('connected');
      } else if (connecting) {
        setConnectionState('connecting');
      } else {
        setConnectionState('disconnected');
      }
    };

    // Initial state
    updateConnectionState();

    // Socket event listeners
    const handleConnect = () => {
      setConnectionState('connected');
    };

    const handleDisconnect = () => {
      setConnectionState('disconnected');
    };

    const handleConnectError = () => {
      setConnectionState('error');
    };

    const handleReconnecting = () => {
      setConnectionState('connecting');
    };

    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on('connect_error', handleConnectError);
    socket.on('reconnecting', handleReconnecting);

    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off('connect_error', handleConnectError);
      socket.off('reconnecting', handleReconnecting);
    };
  }, [socket, connected, connecting]);

  const getStatusConfig = () => {
    switch (connectionState) {
      case 'connected':
        return {
          icon: Wifi,
          color: 'text-green-400',
          bgColor: 'bg-green-900/20',
          borderColor: 'border-green-500/30',
          text: 'Connected',
          description: 'Real-time multiplayer active'
        };
      case 'connecting':
        return {
          icon: Loader2,
          color: 'text-yellow-400',
          bgColor: 'bg-yellow-900/20',
          borderColor: 'border-yellow-500/30',
          text: 'Connecting...',
          description: 'Establishing connection'
        };
      case 'error':
        return {
          icon: AlertTriangle,
          color: 'text-red-400',
          bgColor: 'bg-red-900/20',
          borderColor: 'border-red-500/30',
          text: 'Connection Error',
          description: 'Failed to connect to server'
        };
      default:
        return {
          icon: WifiOff,
          color: 'text-gray-400',
          bgColor: 'bg-gray-900/20',
          borderColor: 'border-gray-500/30',
          text: 'Disconnected',
          description: 'Not connected to server'
        };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  if (!showDetails) {
    // Simple indicator version
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs ${config.bgColor} ${config.borderColor} border`}>
          <Icon
            className={`w-3 h-3 ${config.color} ${connectionState === 'connecting' ? 'animate-spin' : ''}`}
          />
          <span className={config.color}>{config.text}</span>
        </div>
      </div>
    );
  }

  // Detailed version
  return (
    <div className={`${config.bgColor} ${config.borderColor} border rounded-lg p-3 ${className}`}>
      <div className="flex items-center gap-3">
        <Icon
          className={`w-5 h-5 ${config.color} ${connectionState === 'connecting' ? 'animate-spin' : ''}`}
        />
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <span className={`font-medium ${config.color}`}>
              {config.text}
            </span>
            {connectionState === 'connected' && (
              <span className="text-xs text-green-300">
                ●
              </span>
            )}
          </div>
          <p className="text-xs text-gray-400 mt-1">
            {config.description}
          </p>
          {showDetails && serverUrl && (
            <p className="text-xs text-gray-500 mt-1 font-mono">
              {serverUrl}
            </p>
          )}
        </div>
      </div>

      {/* Connection actions */}
      {connectionState === 'error' || connectionState === 'disconnected' ? (
        <button
          onClick={() => socket?.connect()}
          className="mt-2 w-full px-3 py-1 text-xs bg-orange-600 hover:bg-orange-700 text-white rounded transition-colors"
        >
          Retry Connection
        </button>
      ) : null}
    </div>
  );
}

// Hook for connection status
export const useConnectionStatus = () => {
  const { connected, connecting } = useSocket();
  const [isHealthy, setIsHealthy] = useState(false);

  useEffect(() => {
    const checkHealth = async () => {
      try {
        const { checkServerHealth } = await import('@/lib/socket');
        const healthy = await checkServerHealth();
        setIsHealthy(healthy);
      } catch {
        setIsHealthy(false);
      }
    };

    if (connected) {
      checkHealth();
    }
  }, [connected]);

  return {
    connected,
    connecting,
    isHealthy,
    status: connected ? 'connected' : connecting ? 'connecting' : 'disconnected'
  };
};
