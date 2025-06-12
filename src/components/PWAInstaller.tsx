'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { X, Download, Smartphone } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function PWAInstaller() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [showInstallBanner, setShowInstallBanner] = useState(false);
  const [swRegistered, setSwRegistered] = useState(false);

  useEffect(() => {
    // Register service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js', { scope: '/' })
        .then((registration) => {
          console.log('STELLARUSH: Service Worker registered successfully:', registration);
          setSwRegistered(true);

          // Listen for updates
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  // New content is available, refresh the page
                  if (confirm('STELLARUSH has been updated! Refresh to get the latest version?')) {
                    window.location.reload();
                  }
                }
              });
            }
          });
        })
        .catch((error) => {
          console.error('STELLARUSH: Service Worker registration failed:', error);
        });
    }

    // Check if app is already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      return;
    }

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: BeforeInstallPromptEvent) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);

      // Show install banner after a delay
      setTimeout(() => {
        if (!isInstalled && !localStorage.getItem('stellarush-install-dismissed')) {
          setShowInstallBanner(true);
        }
      }, 5000);
    };

    // Listen for app installed event
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setIsInstallable(false);
      setShowInstallBanner(false);
      console.log('STELLARUSH: PWA installed successfully');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt as EventListener);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt as EventListener);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [isInstalled]);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    try {
      await deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;

      if (choiceResult.outcome === 'accepted') {
        console.log('STELLARUSH: User accepted the install prompt');
      } else {
        console.log('STELLARUSH: User dismissed the install prompt');
        localStorage.setItem('stellarush-install-dismissed', 'true');
      }

      setDeferredPrompt(null);
      setIsInstallable(false);
      setShowInstallBanner(false);
    } catch (error) {
      console.error('STELLARUSH: Install prompt failed:', error);
    }
  };

  const handleDismissBanner = () => {
    setShowInstallBanner(false);
    localStorage.setItem('stellarush-install-dismissed', 'true');
  };

  // Don't show anything if already installed or not installable
  if (isInstalled || (!isInstallable && !showInstallBanner)) {
    return null;
  }

  return (
    <>
      {/* Install Banner */}
      {showInstallBanner && (
        <div className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:max-w-sm">
          <div className="bg-gradient-to-r from-orange-600 to-red-600 rounded-lg p-4 shadow-2xl border border-orange-500/20">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                <Smartphone className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-white font-bold text-sm">Install STELLARUSH</h3>
                <p className="text-orange-100 text-xs mt-1">
                  Get the full app experience with offline support and faster loading!
                </p>
                <div className="flex gap-2 mt-3">
                  <Button
                    size="sm"
                    onClick={handleInstallClick}
                    className="bg-white text-orange-600 hover:bg-orange-50 text-xs px-3 py-1"
                  >
                    <Download className="w-3 h-3 mr-1" />
                    Install
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleDismissBanner}
                    className="text-white hover:bg-white/10 text-xs px-2 py-1"
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Install Status Indicator (for development) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed top-4 right-4 z-50 bg-black/80 text-white text-xs p-2 rounded">
          PWA: {swRegistered ? '✅ SW' : '❌ SW'} |
          {isInstalled ? ' ✅ Installed' : isInstallable ? ' 🔄 Installable' : ' ❌ Not Installable'}
        </div>
      )}
    </>
  );
}

// Hook for checking PWA install status
export function usePWAInstallStatus() {
  const [isInstalled, setIsInstalled] = useState(false);
  const [isInstallable, setIsInstallable] = useState(false);

  useEffect(() => {
    // Check if running in standalone mode (installed)
    setIsInstalled(window.matchMedia('(display-mode: standalone)').matches);

    // Check if installable
    const handleBeforeInstallPrompt = () => {
      setIsInstallable(true);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setIsInstallable(false);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  return { isInstalled, isInstallable };
}
