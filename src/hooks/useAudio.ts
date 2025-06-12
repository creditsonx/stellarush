'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

interface AudioSettings {
  soundEnabled: boolean;
  musicEnabled: boolean;
  masterVolume: number;
  soundVolume: number;
  musicVolume: number;
}

interface AudioFiles {
  rocketLaunch: string;
  crash: string;
  cashOut: string;
  betPlaced: string;
  win: string;
  lose: string;
  notification: string;
  backgroundMusic: string;
  ambientSpace: string;
}

const defaultAudioFiles: AudioFiles = {
  rocketLaunch: '/sounds/rocket-launch.mp3',
  crash: '/sounds/crash.mp3',
  cashOut: '/sounds/cash-out.mp3',
  betPlaced: '/sounds/bet-placed.mp3',
  win: '/sounds/win.mp3',
  lose: '/sounds/lose.mp3',
  notification: '/sounds/notification.mp3',
  backgroundMusic: '/sounds/background-music.mp3',
  ambientSpace: '/sounds/ambient-space.mp3',
};

const defaultSettings: AudioSettings = {
  soundEnabled: true,
  musicEnabled: true,
  masterVolume: 0.7,
  soundVolume: 0.8,
  musicVolume: 0.4,
};

export function useAudio() {
  const [settings, setSettings] = useState<AudioSettings>(defaultSettings);
  const [isLoaded, setIsLoaded] = useState(false);
  const audioRefs = useRef<{ [key: string]: HTMLAudioElement }>({});
  const musicRef = useRef<HTMLAudioElement | null>(null);

  // Load audio settings from localStorage
  useEffect(() => {
    const savedSettings = localStorage.getItem('stellarush-audio-settings');
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        setSettings({ ...defaultSettings, ...parsed });
      } catch (error) {
        console.error('STELLARUSH: Failed to parse audio settings:', error);
      }
    }
  }, []);

  // Save settings to localStorage
  useEffect(() => {
    localStorage.setItem('stellarush-audio-settings', JSON.stringify(settings));
  }, [settings]);

  // Initialize audio files
  useEffect(() => {
    const loadAudio = async () => {
      try {
        // Load sound effects
        Object.entries(defaultAudioFiles).forEach(([key, src]) => {
          if (key === 'backgroundMusic' || key === 'ambientSpace') return;

          const audio = new Audio(src);
          audio.preload = 'auto';
          audio.volume = (settings.masterVolume * settings.soundVolume) / 10000;
          audioRefs.current[key] = audio;
        });

        // Load background music
        const music = new Audio(defaultAudioFiles.backgroundMusic);
        music.preload = 'auto';
        music.loop = true;
        music.volume = (settings.masterVolume * settings.musicVolume) / 10000;
        musicRef.current = music;

        setIsLoaded(true);
        console.log('STELLARUSH: Audio system initialized');
      } catch (error) {
        console.error('STELLARUSH: Failed to load audio files:', error);
      }
    };

    loadAudio();

    return () => {
      // Cleanup audio references
      Object.values(audioRefs.current).forEach(audio => {
        audio.pause();
        audio.src = '';
      });
      if (musicRef.current) {
        musicRef.current.pause();
        musicRef.current.src = '';
      }
    };
  }, []);

  // Update volumes when settings change
  useEffect(() => {
    Object.values(audioRefs.current).forEach(audio => {
      audio.volume = (settings.masterVolume * settings.soundVolume) / 10000;
    });

    if (musicRef.current) {
      musicRef.current.volume = (settings.masterVolume * settings.musicVolume) / 10000;
    }
  }, [settings.masterVolume, settings.soundVolume, settings.musicVolume]);

  // Play sound effect
  const playSound = useCallback((soundName: keyof AudioFiles) => {
    if (!settings.soundEnabled || !isLoaded) return;

    const audio = audioRefs.current[soundName];
    if (audio) {
      try {
        audio.currentTime = 0;
        audio.play().catch(error => {
          console.warn('STELLARUSH: Failed to play sound:', soundName, error);
        });
      } catch (error) {
        console.warn('STELLARUSH: Sound play error:', error);
      }
    }
  }, [settings.soundEnabled, isLoaded]);

  // Play background music
  const playMusic = useCallback(() => {
    if (!settings.musicEnabled || !isLoaded || !musicRef.current) return;

    try {
      musicRef.current.play().catch(error => {
        console.warn('STELLARUSH: Failed to play background music:', error);
      });
    } catch (error) {
      console.warn('STELLARUSH: Music play error:', error);
    }
  }, [settings.musicEnabled, isLoaded]);

  // Stop background music
  const stopMusic = useCallback(() => {
    if (musicRef.current) {
      musicRef.current.pause();
      musicRef.current.currentTime = 0;
    }
  }, []);

  // Game-specific sound functions
  const gameAudio = {
    rocketLaunch: () => playSound('rocketLaunch'),
    crash: () => playSound('crash'),
    cashOut: () => playSound('cashOut'),
    betPlaced: () => playSound('betPlaced'),
    win: () => playSound('win'),
    lose: () => playSound('lose'),
    notification: () => playSound('notification'),
  };

  // Settings update functions
  const updateSettings = useCallback((newSettings: Partial<AudioSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  }, []);

  const toggleSound = useCallback(() => {
    setSettings(prev => ({ ...prev, soundEnabled: !prev.soundEnabled }));
  }, []);

  const toggleMusic = useCallback(() => {
    setSettings(prev => {
      const newMusicEnabled = !prev.musicEnabled;
      if (newMusicEnabled) {
        playMusic();
      } else {
        stopMusic();
      }
      return { ...prev, musicEnabled: newMusicEnabled };
    });
  }, [playMusic, stopMusic]);

  // Auto-play music when enabled and loaded
  useEffect(() => {
    if (settings.musicEnabled && isLoaded) {
      playMusic();
    }
  }, [settings.musicEnabled, isLoaded, playMusic]);

  return {
    settings,
    isLoaded,
    playSound: gameAudio,
    playMusic,
    stopMusic,
    updateSettings,
    toggleSound,
    toggleMusic,
  };
}

// Hook for haptic feedback on mobile devices
export function useHapticFeedback() {
  const vibrate = useCallback((pattern: number | number[]) => {
    if ('vibrate' in navigator) {
      try {
        navigator.vibrate(pattern);
      } catch (error) {
        console.warn('STELLARUSH: Haptic feedback not supported:', error);
      }
    }
  }, []);

  const gameHaptics = {
    betPlaced: () => vibrate(100),
    cashOut: () => vibrate([200, 100, 200]),
    crash: () => vibrate([300, 100, 300, 100, 300]),
    win: () => vibrate([100, 50, 100, 50, 100]),
    lose: () => vibrate(500),
    notification: () => vibrate([50, 100, 50]),
  };

  return {
    vibrate,
    haptics: gameHaptics,
  };
}
