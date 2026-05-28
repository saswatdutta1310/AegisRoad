import React, { useState, useEffect } from 'react';
import { 
  Navigation, AlertTriangle, Volume2, Mic, MapPin, CheckCircle2, Upload, FileCheck, Clock, Map, HardHat, Zap
} from 'lucide-react';
import { toast } from 'react-toastify';
import InteractiveMap from './InteractiveMap';

export default function DriverMobile({ 
  hazards = [], 
  onModifyHazard,
  onReportHazard,
  currentUser = null
}) {
  const [selectedJobId, setSelectedJobId] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [evidenceFiles, setEvidenceFiles] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [speechActive, setSpeechActive] = useState(false);
  const [quickReportLogged, setQuickReportLogged] = useState(false);
  const [arrivedJobs, setArrivedJobs] = useState({}); // track arrival state per job ID

  // Filter jobs for the worker's firm
  const selectedContractor = currentUser?.orgName || "BuildFast Pvt. Ltd.";
  const activeJobs = hazards.filter(h => h.contractor === selectedContractor);
  const activeJob = activeJobs.find(j => j.id === selectedJobId) || activeJobs[0];

  // Pre-select first job if none selected
  useEffect(() => {
    if (!selectedJobId && activeJobs.length > 0) {
      setSelectedJobId(activeJobs[0].id);
    }
  }, [activeJobs, selectedJobId]);

  // Handle Arrival Logging
  const handleLogArrival = () => {
    if (!activeJob) return;
    setArrivedJobs(prev => ({ ...prev, [activeJob.id]: true }));
    toast.success(`Arrival logged for ${activeJob.id} at ${new Date().toLocaleTimeString()}`);
    if (activeJob.status === 'unassigned') {
      onModifyHazard(activeJob.id, { status: 'in-progress', completionPercent: 5 });
    }
  };

  // Voice Log simulation
  const handleSpeakAlert = () => {
    setSpeechActive(true);
    toast.info("Microphone activated. Recording field log...");
    setTimeout(() => {
      setSpeechActive(false);
      toast.success("Voice log transcribed and attached to task.");
    }, 3000);
  };

  // Live GPS Quick Report
  const handleQuickReport = () => {
    setQuickReportLogged(true);
    onReportHazard({
      title: "Field Worker Quick-Pin: New Obstruction",
      location: "Worker's Current GPS Trajectory",
      severity: "medium",
      reporter: currentUser ? `${currentUser.username} (${currentUser.orgName})` : "Field Unit",
      status: "unassigned",
      description: "Field worker dropped a live hazard pin from the mobile terminal.",
      coordinates: { lat: 16.4357, lng: 80.6281 },
      contractor: selectedContractor
    });
    toast.success("Live Hazard Pin Dropped. Dispatch notified.");
    setTimeout(() => setQuickReportLogged(false), 4000);
  };

  // Drag and Drop Evidence
  const handleDrag = (e) => {
    e.preventDefault(); e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
    else if (e.type === "dragleave") setDragActive(false);
  };
  const handleDrop = (e) => {
    e.preventDefault(); e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const added = Array.from(e.dataTransfer.files).map(f => f.name);
      setEvidenceFiles(prev => [...prev, ...added]);
    }
  };
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const added = Array.from(e.target.files).map(f => f.name);
      setEvidenceFiles(prev => [...prev, ...added]);
    }
  };

  const handleSubmitProof = (e) => {
    e.preventDefault();
    if (evidenceFiles.length === 0) return;
    setIsSubmitting(true);
    
    setTimeout(() => {
      onModifyHazard(activeJob.id, { 
        status: 'completed', 
        completionPercent: 100,
        description: `${activeJob.description} [WORKER PROOF SUBMITTED: ${evidenceFiles.join(', ')}]`
      });
      toast.success("Task marked complete and evidence uploaded!");
      setEvidenceFiles([]);
      setIsSubmitting(false);
    }, 1500);
  };

  const isArrived = activeJob && arrivedJobs[activeJob.id];

  return (
    <div id="field-worker-portal" className="space-y-6 font-sans text-slate-100 pb-20 animate-fadeIn">
      
      {/* SHIFT & SAFETY HEADER */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <HardHat className="text-[#2ea014]" />
            Field Operations Console
          </h1>
          <p className="text-xs text-slate-400 mt-1 font-mono">
            Logged in: <strong className="text-emerald-400">{currentUser?.username || 'Field Worker'}</strong> | Crew: <strong className="text-white">{selectedContractor}</strong>
          </p>
        </div>
        
        {/* Safety Warnings Banner */}
        <div className="bg-amber-950/40 border border-amber-500/30 px-4 py-2 rounded-lg flex items-center gap-3">
          <Zap size={16} className="text-amber-400 animate-pulse" />
          <div className="text-xs">
            <span className="font-bold text-amber-400 block uppercase tracking-wide">Shift Safety Advisory</span>
            <span className="text-amber-200/70 font-mono">Weather: Clear • Vis: 10km • Traffic: Moderate</span>
          </div>
        </div>
      </div>

      {/* SPLIT LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[750px]">
        
        {/* LEFT PANEL: INTERACTIVE MAP */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl flex flex-col overflow-hidden h-full shadow-lg relative">
          <div className="bg-slate-950/80 backdrop-blur border-b border-slate-800 p-3 z-10 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Map className="text-sky-400" size={18} />
              <span className="text-xs font-bold uppercase tracking-widest text-slate-300">Live GPS Radar</span>
            </div>
            <button
              onClick={handleQuickReport}
              disabled={quickReportLogged}
              className={`text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded flex items-center gap-1.5 transition-all ${
                quickReportLogged ? 'bg-slate-800 text-emerald-400' : 'bg-rose-600 hover:bg-rose-500 text-white'
              }`}
            >
              <MapPin size={12} />
              {quickReportLogged ? "PIN DROPPED" : "DROP HAZARD PIN"}
            </button>
          </div>
          
          <div className="flex-1 min-h-[280px] w-full relative overflow-hidden">
            <InteractiveMap
              className="rounded-none"
              hazards={activeJobs}
              selectedHazardId={activeJob?.id}
              activeView="driver"
              onSelectHazard={(h) => setSelectedJobId(h.id)}
            />
            {/* HUD Overlay */}
            <div className="absolute bottom-4 left-4 z-[5] bg-slate-950/90 border border-slate-800 p-3 rounded-xl backdrop-blur-sm pointer-events-none">
              <div className="text-[10px] uppercase font-bold text-slate-500 font-mono">Current Vector</div>
              <div className="text-xl font-black text-white">42 <span className="text-xs text-slate-400">km/h</span></div>
            </div>
          </div>
        </div>

        {/* RIGHT PANEL: TASK QUEUE & CONSOLE */}
        <div className="flex flex-col gap-4 h-full">
          
          {/* Turn-by-Turn Navigation HUD */}
          <div className="bg-gradient-to-r from-sky-950/60 via-slate-900 to-slate-900 border border-sky-900/40 rounded-xl p-4 shadow-lg flex-none" style={{ animation: 'navPulse 3s infinite' }}>
            <div className="flex items-center gap-4">
              {/* Direction Arrow */}
              <div className="w-14 h-14 bg-sky-500/20 border-2 border-sky-500/50 rounded-xl flex items-center justify-center shrink-0">
                <svg viewBox="0 0 24 24" className="w-8 h-8 text-sky-400" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 19V5M5 12l7-7 7 7" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[9px] font-mono text-sky-500 uppercase tracking-widest font-bold">Next Maneuver</div>
                <div className="text-lg font-black text-white leading-tight truncate">
                  {activeJob ? `Head to ${activeJob.location?.split(',')[0] || 'NH65'}` : 'No Active Route'}
                </div>
                <div className="flex items-center gap-4 mt-1">
                  <span className="text-[10px] font-mono text-sky-300">
                    <strong className="text-white text-sm">450m</strong> ahead
                  </span>
                  <span className="text-[10px] font-mono text-slate-500">•</span>
                  <span className="text-[10px] font-mono text-slate-400">
                    ETA: <strong className="text-amber-400">4 min</strong>
                  </span>
                  <span className="text-[10px] font-mono text-slate-500">•</span>
                  <span className="text-[10px] font-mono text-slate-400">
                    Speed: <strong className="text-emerald-400">42 km/h</strong>
                  </span>
                </div>
              </div>
              {/* Route progress mini-bar */}
              <div className="shrink-0 text-center">
                <div className="text-[9px] font-mono text-slate-500 uppercase">Route</div>
                <div className="w-16 bg-slate-800 h-1.5 rounded-full overflow-hidden mt-1">
                  <div className="bg-sky-500 h-full rounded-full" style={{ width: '35%' }}></div>
                </div>
                <div className="text-[9px] font-mono text-sky-400 font-bold mt-0.5">35%</div>
              </div>
            </div>
          </div>

          {/* Top Half: Task Queue */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col shadow-lg flex-1 overflow-hidden">
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3 flex justify-between items-center pb-2 border-b border-slate-800">
              <span>My Assigned Dispatch Queue</span>
              <span className="bg-slate-800 text-emerald-400 px-2 py-0.5 rounded-full">{activeJobs.length} Tasks</span>
            </h3>
            
            <div className="overflow-y-auto pr-2 space-y-2 flex-1">
              {activeJobs.map(job => (
                <button
                  key={job.id}
                  onClick={() => setSelectedJobId(job.id)}
                  className={`w-full text-left p-3 rounded-lg border transition-all flex flex-col gap-2 ${
                    job.id === activeJob?.id 
                      ? 'bg-slate-950 border-emerald-500/50 ring-1 ring-emerald-500/20' 
                      : 'bg-slate-950/50 border-slate-800 hover:bg-slate-900'
                  }`}
                >
                  <div className="flex justify-between items-start text-[10px]">
                    <span className="text-slate-400 font-mono font-bold">{job.id}</span>
                    <span className={`font-black uppercase tracking-wide ${
                      job.status === 'completed' ? 'text-emerald-400' : 'text-amber-400'
                    }`}>{job.status}</span>
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white truncate">{job.title}</h4>
                    <p className="text-[11px] text-slate-400 truncate flex items-center gap-1 mt-0.5">
                      <Navigation size={10} /> {job.location}
                    </p>
                  </div>
                </button>
              ))}
              {activeJobs.length === 0 && (
                <div className="text-center text-slate-500 text-xs font-mono py-10">No tasks currently assigned to your crew.</div>
              )}
            </div>
          </div>

          {/* Bottom Half: Execution Console */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg flex-none h-[400px] flex flex-col justify-between">
            {activeJob ? (
              <>
                <div>
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-[10px] text-emerald-500 font-mono font-bold uppercase tracking-wider">Active Execution Console</span>
                    {activeJob.status === 'completed' && (
                      <span className="bg-emerald-950 text-emerald-400 text-[10px] px-2 py-0.5 rounded font-bold border border-emerald-900">RESOLVED</span>
                    )}
                  </div>
                  <h2 className="text-xl font-black text-white">{activeJob.title}</h2>
                  <p className="text-xs text-slate-400 font-mono">{activeJob.description}</p>
                </div>

                {activeJob.status !== 'completed' ? (
                  <div className="space-y-4">
                    {/* Action Buttons */}
                    <div className="grid grid-cols-2 gap-3">
                      <button 
                        onClick={handleLogArrival}
                        disabled={isArrived}
                        className={`py-3 rounded-lg flex flex-col items-center justify-center gap-1 border transition-all ${
                          isArrived ? 'bg-emerald-950 border-emerald-900 text-emerald-500' : 'bg-slate-800 border-slate-700 text-white hover:bg-slate-700 hover:border-slate-600'
                        }`}
                      >
                        <MapPin size={18} />
                        <span className="text-[10px] font-bold uppercase tracking-wider">{isArrived ? 'Arrival Logged' : 'Log Arrival On-Site'}</span>
                      </button>
                      
                      <button 
                        onClick={handleSpeakAlert}
                        className={`py-3 rounded-lg flex flex-col items-center justify-center gap-1 border transition-all ${
                          speechActive ? 'bg-rose-900 border-rose-700 text-rose-300 animate-pulse' : 'bg-slate-800 border-slate-700 text-white hover:bg-slate-700 hover:border-slate-600'
                        }`}
                      >
                        <Mic size={18} />
                        <span className="text-[10px] font-bold uppercase tracking-wider">{speechActive ? 'Recording...' : 'Voice Log Report'}</span>
                      </button>
                    </div>

                    {/* Proof Upload (Only enabled if arrived) */}
                    <div className={!isArrived ? 'opacity-40 pointer-events-none transition-opacity' : 'transition-opacity'}>
                      <form onSubmit={handleSubmitProof} className="space-y-3 pt-2 border-t border-slate-800">
                        <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                          Finalize: Upload Evidence Proof
                        </label>
                        <div 
                          onDragEnter={handleDrag} onDragOver={handleDrag} onDragLeave={handleDrag} onDrop={handleDrop}
                          className={`border-2 border-dashed rounded-xl p-4 text-center transition-colors flex flex-col items-center justify-center gap-1 ${
                            dragActive ? 'border-emerald-500 bg-emerald-950/20 cursor-pointer' : 'border-slate-700 bg-slate-950/50 hover:border-slate-600 cursor-pointer'
                          }`}
                        >
                          <input type="file" id="worker-evidence" multiple onChange={handleFileChange} className="hidden" />
                          <label htmlFor="worker-evidence" className="w-full h-full flex flex-col items-center cursor-pointer text-xs">
                            <Upload size={20} className="text-emerald-500 mb-1" />
                            <span className="text-slate-300">Tap to snap a photo or <strong className="text-emerald-400">upload file</strong></span>
                          </label>
                        </div>
                        {evidenceFiles.length > 0 && (
                          <div className="text-[10px] font-mono text-emerald-400 bg-emerald-950/30 p-1.5 rounded truncate">
                            Attached: {evidenceFiles.join(', ')}
                          </div>
                        )}
                        <button 
                          type="submit" 
                          disabled={evidenceFiles.length === 0 || isSubmitting}
                          className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 disabled:text-slate-500 text-white font-bold py-2.5 rounded text-xs tracking-wider transition-colors flex items-center justify-center gap-1.5"
                        >
                          {isSubmitting ? <><Clock size={14} className="animate-spin" /> UPLOADING...</> : <><FileCheck size={14} /> MARK TASK AS RESOLVED</>}
                        </button>
                      </form>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full space-y-3 bg-emerald-950/20 border border-emerald-900/50 rounded-xl">
                    <CheckCircle2 size={48} className="text-emerald-500" />
                    <div className="text-center">
                      <div className="text-sm font-bold text-white uppercase tracking-widest">Task Completed</div>
                      <div className="text-[10px] font-mono text-emerald-400/80 mt-1">Audit log securely filed to ledger.</div>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="flex items-center justify-center h-full text-slate-500 text-xs font-mono">
                Select a task from the queue to open the console.
              </div>
            )}
          </div>
          
        </div>
      </div>
    </div>
  );
}
