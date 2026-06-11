/**
 * InstallPrompt.jsx — AegisRoad v3.0
 *
 * Shows the right install UI per platform:
 *   iOS Safari  → step-by-step manual instructions banner (no API available on iOS)
 *   Android     → single "Install App" button that triggers the native Chrome dialog
 *   Installed   → nothing (banner auto-hides)
 */

import React, { useState } from 'react';
import { Download, Share, X, Smartphone } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

// ── Platform detection helpers ─────────────────────────────────────────────────

const isIOS = () =>
  /iphone|ipad|ipod/i.test(navigator.userAgent) &&
  !window.MSStream;

const isInStandaloneMode = () =>
  window.matchMedia('(display-mode: standalone)').matches ||
  window.navigator.standalone === true;

// ── Component ─────────────────────────────────────────────────────────────────

export default function InstallPrompt() {
  const { deferredPrompt, isInstalled, triggerInstall } = usePWAInstall();
  const [iosDismissed, setIosDismissed]                 = useState(false);
  const [installing, setInstalling]                     = useState(false);

  // Never show if already running as installed PWA
  if (isInStandaloneMode()) return null;

  // Never show if user already installed this session
  if (isInstalled) return null;

  // ── Android path ─────────────────────────────────────────────────────────
  // deferredPrompt is only set on Android Chrome (and desktop Chrome/Edge)
  // when the browser has decided the PWA is installable.
  if (deferredPrompt) {
    const handleAndroidInstall = async () => {
      setInstalling(true);
      await triggerInstall();
      setInstalling(false);
    };

    return (
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-sm">
        <div className="bg-[#0c1223] border border-[#2ea014]/40 rounded-xl shadow-2xl p-4 flex items-center gap-3">
          {/* Icon */}
          <div className="w-10 h-10 rounded-lg bg-[#2ea014]/15 border border-[#2ea014]/30 flex items-center justify-center shrink-0">
            <Smartphone size={20} className="text-[#2ea014]" />
          </div>

          {/* Text */}
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-white leading-tight">Install AegisRoad</p>
            <p className="text-[10px] text-slate-400 mt-0.5 leading-tight">
              Add to home screen for offline access
            </p>
          </div>

          {/* Install button */}
          <button
            onClick={handleAndroidInstall}
            disabled={installing}
            className="shrink-0 flex items-center gap-1.5 bg-[#2ea014] hover:bg-[#258210] text-white text-[11px] font-bold px-3 py-1.5 rounded-lg transition-colors disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
          >
            <Download size={12} />
            {installing ? 'Installing…' : 'Install'}
          </button>
        </div>
      </div>
    );
  }

  // ── iOS path ──────────────────────────────────────────────────────────────
  // iOS Safari has no install API — we show manual share-sheet instructions.
  if (isIOS() && !iosDismissed) {
    return (
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-sm">
        <div className="bg-[#0c1223] border border-slate-700/60 rounded-xl shadow-2xl p-4">

          {/* Header row */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#2ea014]/15 border border-[#2ea014]/30 flex items-center justify-center">
                <Smartphone size={16} className="text-[#2ea014]" />
              </div>
              <p className="text-xs font-bold text-white">Install AegisRoad</p>
            </div>
            <button
              onClick={() => setIosDismissed(true)}
              className="p-1 rounded text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
              aria-label="Dismiss"
            >
              <X size={14} />
            </button>
          </div>

          {/* Steps */}
          <ol className="space-y-2">
            <li className="flex items-start gap-2 text-[11px] text-slate-300">
              <span className="w-4 h-4 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-[9px] font-bold text-slate-400 shrink-0 mt-0.5">
                1
              </span>
              <span>
                Tap the{' '}
                <Share size={11} className="inline-block text-[#2ea014] mx-0.5 -mt-0.5" />
                <strong className="text-white"> Share</strong> button in Safari's toolbar
              </span>
            </li>
            <li className="flex items-start gap-2 text-[11px] text-slate-300">
              <span className="w-4 h-4 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-[9px] font-bold text-slate-400 shrink-0 mt-0.5">
                2
              </span>
              <span>
                Scroll down and tap{' '}
                <strong className="text-white">"Add to Home Screen"</strong>
              </span>
            </li>
            <li className="flex items-start gap-2 text-[11px] text-slate-300">
              <span className="w-4 h-4 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-[9px] font-bold text-slate-400 shrink-0 mt-0.5">
                3
              </span>
              <span>
                Tap <strong className="text-white">"Add"</strong> to confirm
              </span>
            </li>
          </ol>

        </div>
      </div>
    );
  }

  // Not iOS, no deferredPrompt (desktop, already installed, or unsupported) → nothing
  return null;
}