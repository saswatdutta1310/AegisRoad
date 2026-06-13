import React, { useState } from 'react';
import { Download, Share, X, Smartphone } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

const T = { teal:'#072E24', tealMid:'#156B52', yellow:'#C8D400', cream:'#F4F0E6', creamDark:'#EAE5D6' };

const isIOS = () => /iphone|ipad|ipod/i.test(navigator.userAgent) && !window.MSStream;
const isInStandaloneMode = () =>
  window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;

export default function InstallPrompt() {
  const { deferredPrompt, isInstalled, triggerInstall } = usePWAInstall();
  const [iosDismissed, setIosDismissed] = useState(false);
  const [installing, setInstalling] = useState(false);

  if (isInStandaloneMode() || isInstalled) return null;

  // Android/Desktop install button
  if (deferredPrompt) {
    const handleInstall = async () => {
      setInstalling(true);
      await triggerInstall();
      setInstalling(false);
    };

    return (
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-sm">
        <div className="flex items-center gap-3 p-4 rounded-2xl shadow-xl" style={{ background:T.teal, border:`1px solid rgba(200,212,0,0.2)` }}>
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background:'rgba(200,212,0,0.15)' }}>
            <Smartphone size={20} style={{ color:T.yellow }} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-black uppercase text-white" style={{ fontFamily:"'Barlow Condensed',sans-serif" }}>Install AegisRoad</p>
            <p className="text-[10px] mt-0.5" style={{ color:'rgba(255,255,255,0.5)' }}>Add to home screen for offline access &amp; faster alerts</p>
          </div>
          <button
            onClick={handleInstall}
            disabled={installing}
            className="shrink-0 flex items-center gap-1.5 text-[11px] font-black uppercase px-3 py-2 rounded-xl cursor-pointer transition-all disabled:opacity-60"
            style={{ background:T.yellow, color:T.teal, fontFamily:"'Barlow Condensed',sans-serif" }}
          >
            <Download size={12} />
            {installing ? 'Installing…' : 'Install'}
          </button>
        </div>
      </div>
    );
  }

  // iOS Safari manual instructions
  if (isIOS() && !iosDismissed) {
    return (
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-sm">
        <div className="p-4 rounded-2xl shadow-xl" style={{ background:T.teal, border:`1px solid rgba(200,212,0,0.15)` }}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background:'rgba(200,212,0,0.15)' }}>
                <Smartphone size={15} style={{ color:T.yellow }} />
              </div>
              <p className="text-xs font-black uppercase text-white" style={{ fontFamily:"'Barlow Condensed',sans-serif" }}>Install AegisRoad</p>
            </div>
            <button onClick={() => setIosDismissed(true)} className="cursor-pointer" style={{ color:'rgba(255,255,255,0.4)' }}>
              <X size={14} />
            </button>
          </div>
          <ol className="space-y-2">
            {[
              <>Tap the <Share size={11} className="inline-block mx-0.5 -mt-0.5" style={{ color:T.yellow }} /><strong className="text-white"> Share</strong> button in Safari's toolbar</>,
              <>Scroll down and tap <strong className="text-white">"Add to Home Screen"</strong></>,
              <>Tap <strong className="text-white">"Add"</strong> to confirm</>,
            ].map((step, i) => (
              <li key={i} className="flex items-start gap-2 text-[11px]" style={{ color:'rgba(255,255,255,0.6)' }}>
                <span className="w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-black shrink-0 mt-0.5" style={{ background:'rgba(200,212,0,0.2)', color:T.yellow }}>{i+1}</span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        </div>
      </div>
    );
  }

  return null;
}
