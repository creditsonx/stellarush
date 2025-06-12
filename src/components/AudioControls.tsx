'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Volume2, VolumeX, Music, MicOff, Settings, Headphones } from 'lucide-react';
import { useAudio } from '@/hooks/useAudio';

interface AudioControlsProps {
  compact?: boolean;
  showInHeader?: boolean;
}

export function AudioControls({ compact = false, showInHeader = false }: AudioControlsProps) {
  const { settings, playSound, toggleSound, toggleMusic, updateSettings } = useAudio();
  const [showPanel, setShowPanel] = useState(false);

  const handleVolumeChange = (type: 'master' | 'sound' | 'music', value: number) => {
    const newValue = value / 100;
    updateSettings({
      [`${type}Volume`]: newValue,
    });
  };

  const testSounds = () => {
    playSound.rocketLaunch();
    setTimeout(() => playSound.cashOut(), 1000);
  };

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleSound}
          className={`p-2 ${settings.soundEnabled ? 'text-orange-400' : 'text-gray-500'}`}
          title={settings.soundEnabled ? 'Mute Sounds' : 'Enable Sounds'}
        >
          {settings.soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleMusic}
          className={`p-2 ${settings.musicEnabled ? 'text-orange-400' : 'text-gray-500'}`}
          title={settings.musicEnabled ? 'Mute Music' : 'Enable Music'}
        >
          {settings.musicEnabled ? <Music className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
        </Button>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Trigger Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setShowPanel(!showPanel)}
        className="p-2 text-gray-400 hover:text-orange-400"
        title="Audio Settings"
      >
        <Headphones className="w-4 h-4" />
      </Button>

      {/* Audio Panel */}
      {showPanel && (
        <div className="absolute top-full right-0 mt-2 bg-gray-800 border border-gray-700 rounded-lg p-4 shadow-xl z-50 min-w-[300px]">
          <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
              <h3 className="text-white font-bold flex items-center gap-2">
                <Settings className="w-4 h-4" />
                Audio Settings
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowPanel(false)}
                className="text-gray-400 hover:text-white p-1"
              >
                ×
              </Button>
            </div>

            {/* Sound Toggle */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {settings.soundEnabled ? (
                  <Volume2 className="w-4 h-4 text-orange-400" />
                ) : (
                  <VolumeX className="w-4 h-4 text-gray-500" />
                )}
                <span className="text-white text-sm">Sound Effects</span>
              </div>
              <Button
                variant={settings.soundEnabled ? "default" : "outline"}
                size="sm"
                onClick={toggleSound}
                className="px-3 py-1 text-xs"
              >
                {settings.soundEnabled ? 'ON' : 'OFF'}
              </Button>
            </div>

            {/* Music Toggle */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {settings.musicEnabled ? (
                  <Music className="w-4 h-4 text-orange-400" />
                ) : (
                  <MicOff className="w-4 h-4 text-gray-500" />
                )}
                <span className="text-white text-sm">Background Music</span>
              </div>
              <Button
                variant={settings.musicEnabled ? "default" : "outline"}
                size="sm"
                onClick={toggleMusic}
                className="px-3 py-1 text-xs"
              >
                {settings.musicEnabled ? 'ON' : 'OFF'}
              </Button>
            </div>

            {/* Volume Sliders */}
            <div className="space-y-3 border-t border-gray-700 pt-3">
              {/* Master Volume */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-gray-300 text-xs">Master Volume</label>
                  <span className="text-gray-400 text-xs">{Math.round(settings.masterVolume * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={settings.masterVolume * 100}
                  onChange={(e) => handleVolumeChange('master', Number.parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer audio-slider"
                />
              </div>

              {/* Sound Volume */}
              {settings.soundEnabled && (
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-gray-300 text-xs">Sound Effects</label>
                    <span className="text-gray-400 text-xs">{Math.round(settings.soundVolume * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={settings.soundVolume * 100}
                    onChange={(e) => handleVolumeChange('sound', Number.parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer audio-slider"
                  />
                </div>
              )}

              {/* Music Volume */}
              {settings.musicEnabled && (
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-gray-300 text-xs">Background Music</label>
                    <span className="text-gray-400 text-xs">{Math.round(settings.musicVolume * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={settings.musicVolume * 100}
                    onChange={(e) => handleVolumeChange('music', Number.parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer audio-slider"
                  />
                </div>
              )}
            </div>

            {/* Test Sounds */}
            <div className="border-t border-gray-700 pt-3">
              <Button
                variant="outline"
                size="sm"
                onClick={testSounds}
                disabled={!settings.soundEnabled}
                className="w-full text-xs"
              >
                Test Sounds
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Overlay to close panel */}
      {showPanel && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowPanel(false)}
        />
      )}

      <style jsx>{`
        .audio-slider::-webkit-slider-thumb {
          appearance: none;
          height: 16px;
          width: 16px;
          border-radius: 50%;
          background: #f97316;
          cursor: pointer;
          border: 2px solid #ffffff;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
        }

        .audio-slider::-moz-range-thumb {
          height: 16px;
          width: 16px;
          border-radius: 50%;
          background: #f97316;
          cursor: pointer;
          border: 2px solid #ffffff;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
        }

        .audio-slider::-webkit-slider-track {
          background: #374151;
          height: 8px;
          border-radius: 4px;
        }

        .audio-slider::-moz-range-track {
          background: #374151;
          height: 8px;
          border-radius: 4px;
          border: none;
        }

        .audio-slider::-webkit-slider-thumb:hover {
          background: #ea580c;
        }

        .audio-slider::-moz-range-thumb:hover {
          background: #ea580c;
        }
      `}</style>
    </div>
  );
}
