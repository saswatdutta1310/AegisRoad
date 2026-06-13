/**
 * usePWAInstall — custom React hook
 *
 * Captures the Android Chrome `beforeinstallprompt` event so we can
 * trigger it at a time we choose instead of letting Chrome decide.
 *
 * Returns:
 *   deferredPrompt  — the saved event (null until Chrome fires it)
 *   isInstalled     — true once the user has installed or dismissed
 *   triggerInstall  — call this when the user clicks your install button
 */

import { useState, useEffect } from 'react';

export function usePWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstalled, setIsInstalled]       = useState(false);

  useEffect(() => {
    // Chrome fires this on Android when all PWA criteria are met.
    // We must call e.preventDefault() or Chrome shows its own mini-bar
    // at a random time, which we don't want.
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    // Fires after the user installs from our custom button OR from the
    // browser menu — either way we hide the install UI.
    const handleAppInstalled = () => {
      setDeferredPrompt(null);
      setIsInstalled(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled',        handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled',        handleAppInstalled);
    };
  }, []);

  // Call this when the user clicks the "Install on Android" button.
  const triggerInstall = async () => {
    if (!deferredPrompt) return;

    try {
      // Show the native Chrome install dialog
      await deferredPrompt.prompt();

      // Wait for the user's choice
      const { outcome } = await deferredPrompt.userChoice;

      if (outcome === 'accepted') {
        setIsInstalled(true);
      }
    } catch (err) {
      console.error('PWA install prompt error:', err);
    } finally {
      // The prompt can only be used once — clear it regardless of outcome
      setDeferredPrompt(null);
    }
  };

  return { deferredPrompt, isInstalled, triggerInstall };
}