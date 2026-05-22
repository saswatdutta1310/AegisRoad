import React, { useState } from 'react';
import { 
  Navigation, AlertTriangle, Volume2, Mic, Eye, ThumbsUp, MapPin,
  Compass, ChevronUp, Bell, Heart, Gauge 
} from 'lucide-react';
import InteractiveMap from './InteractiveMap';

export default function DriverMobile({ 
  hazards = [], 
  onReportHazard,
  currentUser = null,
  onTriggerLogin
}) {
  const [speechActive, setSpeechActive] = useState(false);
  const [alertText, setAlertText] = useState("Warning: Pothole Cluster detected 450 meters ahead on Sector 12 Downtown Flyover. Reduce speed.");
  const [quickReportLogged, setQuickReportLogged] = useState(false);

  // Focus on NH65 pothole cluster or first active critical hazard
  const activeAlert = hazards.find(h => h.id === 'HAZ-9821') || hazards[0];

  const handleSpeakAlert = () => {
    if ('speechSynthesis' in window) {
      setSpeechActive(true);
      const utterance = new SpeechSynthesisUtterance(alertText);
      utterance.onend = () => setSpeechActive(false);
      utterance.onerror = () => setSpeechActive(false);
      window.speechSynthesis.speak(utterance);
    } else {
      // Fallback
      setSpeechActive(true);
      setTimeout(() => setSpeechActive(false), 3000);
    }
  };

  const handleQuickReport = () => {
    setQuickReportLogged(true);
    
    // Auto dispatch a quick driver warning
    onReportHazard({
      title: "Driver Quick-Tap: Rough Asphalt Patch",
      location: "NH65 Milestone 14",
      severity: "medium",
      reporter: currentUser ? `${currentUser.username} (${currentUser.orgName})` : "Public Driver (GPS Tracker)",
      status: "unassigned",
      description: "Fast driving shock sensor registered high acceleration vertical vector variance at highway speed.",
      coordinates: { x: 38, y: 38 }
    });

    setTimeout(() => {
      setQuickReportLogged(false);
    }, 4000);
  };

  return (
    <div id="driver-mobile-container" className="space-y-6 font-sans text-slate-100 flex flex-col items-center">
      
      {/* Visual Header */}
      <div className="w-full text-center border-b border-slate-800 pb-4">
        <h1 className="text-2.5xl font-extrabold text-white tracking-tight flex items-center justify-center gap-2">
          Driver Mobile PWA
          <span className="text-xs bg-[#2ea014]/20 text-[#2ea014] border border-[#2ea014]/50 font-mono px-2 py-0.5 rounded tracking-widest leading-none">VEHICLE RADAR</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Simulated smartphone view of the vehicle's telemetry head-up display.
        </p>
      </div>

      {/* Smartphone Outer Shell Wrapper Frame */}
      <div className="w-80 h-[560px] bg-[#0c1223] rounded-[36px] p-3.5 border-[6px] border-slate-800 shadow-2xl relative flex flex-col justify-between overflow-hidden">
        
        {/* Phone Notch/Speaker Indicator */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 bg-slate-800 w-28 h-4 rounded-b-xl z-30 flex items-center justify-center">
          <span className="w-8 h-1 bg-slate-900 rounded-full"></span>
        </div>

        {/* Display Header Status bar */}
        <div className="flex justify-between items-center text-[10px] text-slate-500 px-3/5 pt-1 font-mono tracking-wider z-20">
          <span>08:19 AM</span>
          <div className="flex items-center gap-1.5 text-[#2ea014] font-bold">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping"></span>
            LTE GPS
          </div>
        </div>

        {/* Outer body navigation status panel */}
        <div className="bg-slate-950/90 border border-slate-800/80 p-3 rounded-lg z-20 mt-2 flex flex-col gap-1 items-stretch">
          <div className="flex justify-between items-center text-[9px] uppercase text-slate-500 font-mono font-bold">
            <span>ROUTE MONITOR</span>
            <span className="text-[#2ea014] font-mono leading-none">
              {currentUser ? `🧑‍✈️ ${currentUser.username}` : "📡 PUBLIC OBSERVER"}
            </span>
          </div>
          <div className="text-[13px] font-black text-white flex items-center gap-1.5 truncate">
            <Compass className="text-[#2ea014] shrink-0" size={14} />
            NH65 EXP - DOWNTOWN LINK
          </div>
          
          {/* Quick specs horizontal block */}
          <div className="grid grid-cols-3 gap-1.5 text-center mt-2 pt-2 border-t border-slate-900 font-mono text-[10px]">
            <div>
              <span className="text-slate-500 block text-[8px]">SPEED</span>
              <span className="text-white font-bold text-xs">56 km/h</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[8px]">LIMIT</span>
              <span className="text-orange-400 font-bold text-xs">60 km/h</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[8px]">SAFETY %</span>
              <span className="text-emerald-400 font-bold text-xs">88% score</span>
            </div>
          </div>
        </div>

        {/* GPS Radar Interactive Map underlay mockup taking full body */}
        <div className="absolute inset-0 z-10 w-full h-[520px] rounded-2.5xl overflow-hidden mt-6">
          <InteractiveMap
            hazards={hazards}
            selectedHazardId={activeAlert?.id}
            activeView="driver"
            driverRouteActive={true}
          />
        </div>

        {/* Bottom Drawer Warning overlay cards (Image 4) */}
        <div className="z-20 bg-slate-950/90 border border-slate-800/90 rounded-2xl p-3.5 space-y-3 flex flex-col shadow-2xl relative">
          
          <div className="flex items-center gap-2 pb-2 border-b border-slate-900">
            <AlertTriangle className="text-rose-500 animate-bounce shrink-0" size={18} />
            <div className="flex-1 min-w-0">
              <h4 className="text-xs font-black text-white truncate uppercase tracking-wide">Hazard Ahead 450m</h4>
              <p className="text-[9px] text-slate-400 font-mono truncate">{activeAlert?.title || "Pothole Cluster"}</p>
            </div>
            <span className="text-[9px] font-mono text-[#2ea014] font-bold shrink-0">NH65 FLYOVER</span>
          </div>

          <p className="text-[11px] text-slate-300 leading-normal italic font-mono bg-slate-900/60 p-2 rounded">
            "{alertText}"
          </p>

          {/* Controls Button: Voice synthesis trigger & Driver Quick Dispatch */}
          <div className="grid grid-cols-2 gap-2 pt-1 font-mono text-[9px] font-bold">
            <button
              onClick={handleSpeakAlert}
              className={`py-2 rounded flex items-center justify-center gap-1.5 transition-all text-slate-950 ${
                speechActive 
                  ? 'bg-amber-400 animate-pulse text-slate-950' 
                  : 'bg-[#2ea014] hover:bg-[#258210] text-white'
              }`}
            >
              <Volume2 size={13} />
              {speechActive ? "SPEAKING..." : "PLAY VOICE WARNING"}
            </button>

            <button
              onClick={handleQuickReport}
              disabled={quickReportLogged}
              className={`py-2 rounded flex items-center justify-center gap-1 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700/60 ${
                quickReportLogged ? 'border-[#2ea014] bg-slate-900 text-white' : ''
              }`}
            >
              <Mic size={12} />
              {quickReportLogged ? "SCANNED EXPLOIT!" : "REPORT LIVE GPS"}
            </button>
          </div>
        </div>

        {/* Home screen bottom anchor line */}
        <div className="w-24 h-1.5 bg-slate-700/70 rounded-full mx-auto z-30 mb-0.5"></div>
      </div>

      {/* Desktop Helper Panel instructions */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl max-w-sm text-xs font-mono leading-relaxed text-slate-400 text-center space-y-2">
        <p className="text-slate-300 font-bold uppercase tracking-wider text-[10px] text-[#2ea014]">Voice Safety Engine</p>
        <p>
          Use the <strong className="text-white">"PLAY VOICE WARNING"</strong> button inside the driver simulator casing to hear synthesized auditory hazard navigation instructions. Drivers can instantly deploy a live coordinate marker by tapping <strong className="text-white">"REPORT LIVE GPS"</strong>.
        </p>
        {!currentUser && (
          <div className="pt-2 border-t border-slate-800">
            <span className="text-[10.5px] text-slate-300 block mb-1.5">Represent an official contractor or worker?</span>
            <button
              onClick={onTriggerLogin}
              className="text-[#2ea014] hover:text-white hover:bg-[#2ea014]/20 border border-[#2ea014]/40 rounded px-2.5 py-1 text-[9.5px] uppercase font-black tracking-widest cursor-pointer transition-all"
            >
              Sign In Driver Account
            </button>
          </div>
        )}
      </div>

    </div>
  );
}
