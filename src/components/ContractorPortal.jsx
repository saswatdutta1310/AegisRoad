import React, { useState } from 'react';
import { 
  Building, Wrench, ShieldAlert, Clock, CheckCircle2, FileText, 
  Upload, Sparkles, ChevronRight, AlertCircle, FileCheck 
} from 'lucide-react';

export default function ContractorPortal({ 
  hazards = [], 
  contractors = [], 
  onModifyHazard,
  currentUser = null,
  onTriggerLogin
}) {
  const [selectedContractorState, setSelectedContractorState] = useState("BuildFast Pvt. Ltd.");
  const [selectedJobId, setSelectedJobId] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [evidenceFiles, setEvidenceFiles] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successLogs, setSuccessLogs] = useState(null);

  // Enforce contractor name if logged in as contractor
  const selectedContractor = (currentUser && currentUser.role === 'contractor') 
    ? currentUser.orgName 
    : selectedContractorState;

  // Active jobs filter for matching contractor name
  const activeJobs = hazards.filter(h => h.contractor === selectedContractor);
  const activeJob = activeJobs.find(j => j.id === selectedJobId) || activeJobs[0];

  const currentContractorStats = contractors.find(c => c.name === selectedContractor) || contractors[1];

  // Drag and drop event managers (Usability standard)
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (currentUser && currentUser.role === 'contractor') {
      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        const added = Array.from(e.dataTransfer.files).map(f => f.name);
        setEvidenceFiles(prev => [...prev, ...added]);
      }
    }
  };

  const handleFileChange = (e) => {
    if (currentUser && currentUser.role === 'contractor') {
      if (e.target.files && e.target.files[0]) {
        const added = Array.from(e.target.files).map(f => f.name);
        setEvidenceFiles(prev => [...prev, ...added]);
      }
    }
  };

  const handleUpdateProgress = (val) => {
    if (!activeJob) return;
    if (currentUser && currentUser.role === 'contractor') {
      onModifyHazard(activeJob.id, { completionPercent: parseInt(val) });
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
        description: `${activeJob.description} [AUDIT PROOF UPLOADED: ${evidenceFiles.join(', ')}]`
      });
      setSuccessLogs(`Audit submitted successfully for ${activeJob.id}. Site mark listed as COMPLETE.`);
      setEvidenceFiles([]);
      setIsSubmitting(false);

      setTimeout(() => setSuccessLogs(null), 5000);
    }, 1500);
  };

  return (
    <div id="contractor-portal-container" className="space-y-6 font-sans text-slate-100">
      
      {/* Dynamic Security & Observer Mode Banner */}
      <div className="animate-fadeIn">
        {currentUser && currentUser.role === 'contractor' ? (
          <div className="bg-emerald-950/40 border border-[#2ea014]/50 rounded-xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-[#2ea014]/15 text-[#2ea014] flex items-center justify-center border border-[#2ea014]/30 shrink-0">
                <Lock size={16} />
              </div>
              <div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-400 block">SECURE CONTRACTOR LEDGER ACTIVE</span>
                <span className="text-xs text-slate-200">Logged in as <strong className="text-white">{currentUser.username}</strong> representing <strong className="text-emerald-400 font-semibold">{currentUser.orgName}</strong>.</span>
              </div>
            </div>
            <div className="text-[9px] bg-emerald-950 font-mono text-[#2ea014] font-black border border-[#2ea014]/35 px-2.5 py-1 rounded-md uppercase uppercase tracking-wider">
              AUTHORIZED WRITE ACCESS
            </div>
          </div>
        ) : currentUser ? (
          <div className="bg-sky-950/30 border border-sky-800/40 rounded-xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-sky-500/10 text-sky-450 text-sky-455 text-sky-400 flex items-center justify-center border border-sky-800/30 shrink-0">
                <Eye size={16} />
              </div>
              <div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-sky-400 block">GOVERNMENT OVERWATCH SESSION</span>
                <span className="text-xs text-slate-200">You are auditing contractor records. Logged in as <strong className="text-white">{currentUser.username} ({currentUser.orgName})</strong> in Read-Only Audit mode.</span>
              </div>
            </div>
            <div className="text-[9px] bg-slate-900 border border-slate-800 text-slate-400 px-2.5 py-1 rounded-md uppercase tracking-wider font-mono">
              AUDIT OBSERVER STATE
            </div>
          </div>
        ) : (
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-[#2ea014]/10 text-[#2ea014] flex items-center justify-center border border-slate-800 shrink-0">
                <Eye size={16} />
              </div>
              <div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 block">PUBLIC WATCH MODE (READ-ONLY)</span>
                <span className="text-xs text-slate-300">You are viewing the live municipal maintenance queue. If you are a contractor, worker, or official, please login to write.</span>
              </div>
            </div>
            <button
              onClick={onTriggerLogin}
              className="px-3.5 py-1.5 rounded bg-[#2ea014] hover:bg-[#3cd01c] text-white text-[10px] font-mono uppercase font-black tracking-wider transition-all cursor-pointer shadow shrink-0 self-end sm:self-auto"
            >
              Sign In Employee account
            </button>
          </div>
        )}
      </div>

      {/* Title Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
            Contractor Operations Hub
            <span className="text-xs bg-[#2ea014]/20 text-[#2ea014] border border-[#2ea014]/50 font-normal px-2.5 py-0.5 rounded tracking-widest font-mono">REPAIR LOGS</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Authorize dispatch orders, log completed repairs, and upload evidence logs directly to municipal inspectors.
          </p>
        </div>

        {/* Change Contractor filter or lock */}
        <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 p-1.5 rounded-lg">
          <span className="text-[10px] text-slate-500 font-mono uppercase">Contractor:</span>
          {currentUser && currentUser.role === 'contractor' ? (
            <span className="bg-slate-950 font-bold font-mono text-[11px] text-emerald-400 border border-[#2ea014]/30 rounded px-2.5 py-1.5 inline-block">
              {currentUser.orgName} (LOCKED)
            </span>
          ) : (
            <select
              value={selectedContractor}
              onChange={(e) => {
                setSelectedContractorState(e.target.value);
                setSelectedJobId(null);
              }}
              className="bg-slate-950 text-xs text-slate-200 border border-slate-800 rounded px-2.5 py-1.5 focus:outline-none"
            >
              {contractors.map(c => (
                <option key={c.name} value={c.name}>{c.name}</option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Corporate Compliance gauges - Performance Intelligence circular dials (Image 6) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Compliance Dial 1 */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex items-center gap-5">
          <div className="relative w-20 h-20 shrink-0">
            {/* SVG circle gauge */}
            <svg viewBox="0 0 36 36" className="w-full h-full rotate-270">
              <path
                className="text-slate-800"
                strokeWidth="3.5"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="text-teal-400"
                strokeDasharray={`${currentContractorStats?.successRate || 94.5}, 100`}
                strokeWidth="3.5"
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center text-xs font-mono font-bold text-white">
              {currentContractorStats?.successRate || 94.5}%
            </div>
          </div>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">SLA Adherence Index</h4>
            <p className="text-[11px] text-slate-400 mt-1 leading-normal">Percentage of emergency dispatches resolved within the target timeline.</p>
          </div>
        </div>

        {/* Compliance Dial 2 */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex items-center gap-5">
          <div className="relative w-20 h-20 shrink-0">
            <svg viewBox="0 0 36 36" className="w-full h-full rotate-270">
              <path
                className="text-slate-800"
                strokeWidth="3.5"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="text-[#2ea014]"
                strokeDasharray={`${(100 - (parseFloat(currentContractorStats?.averageCostVariance || '0') || 0))}, 100`}
                strokeWidth="3.5"
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center text-xs font-mono font-bold text-white">
              96%
            </div>
          </div>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">Spend Efficiency Index</h4>
            <p className="text-[11px] text-slate-400 mt-1 leading-normal">Score detailing estimated budget cost deviation ratios.</p>
          </div>
        </div>

        {/* Compliance Dial 3 */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex items-center gap-5">
          <div className="relative w-20 h-20 shrink-0">
            <svg viewBox="0 0 36 36" className="w-full h-full rotate-270">
              <path
                className="text-slate-800"
                strokeWidth="3.5"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="text-rose-500"
                strokeDasharray={`${Math.max(10, 100 - (currentContractorStats?.slaBreaches || 1) * 8)}, 100`}
                strokeWidth="3.5"
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center text-xs font-mono font-bold text-slate-200">
              {currentContractorStats?.slaBreaches || 0} Breaches
            </div>
          </div>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">Penalty Incractions</h4>
            <p className="text-[11px] text-slate-400 mt-1 leading-normal">Total number of delayed task orders that triggered automated fiscal deductions.</p>
          </div>
        </div>

      </div>

      {/* Split layout - Assignments list and Detail/Evidence filing */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side: Job Tickets stream */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg lg:col-span-1 space-y-4">
          <div className="pb-2 border-b border-slate-800 flex justify-between items-center">
            <h3 className="text-sm font-bold uppercase tracking-widest text-slate-300">Assigned Tasks</h3>
            <span className="text-[10px] bg-slate-800 text-teal-400 px-2 py-0.5 rounded-full font-mono">{activeJobs.length} Active</span>
          </div>

          <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
            {activeJobs.map(h => (
              <button
                key={h.id}
                onClick={() => setSelectedJobId(h.id)}
                className={`w-full text-left p-3.5 rounded-lg border transition-all flex flex-col justify-between ${
                  h.id === activeJob?.id 
                    ? 'bg-slate-950 border-teal-500 ring-1 ring-teal-500/30' 
                    : 'bg-slate-950/60 border-slate-850 hover:bg-slate-950/90'
                }`}
              >
                <div className="flex justify-between items-start w-full gap-2 text-[10px]">
                  <span className="text-slate-500 font-mono">{h.id}</span>
                  <span className={`font-mono text-rose-400 ${h.status === 'completed' ? 'text-emerald-400' : ''}`}>
                    {h.status === 'completed' ? 'RESOLVED' : h.timeRemaining || "Countdown Active"}
                  </span>
                </div>
                <h4 className="text-xs font-extrabold text-white mt-1.5 truncate w-full">{h.title}</h4>
                <p className="text-[11px] text-slate-400 truncate w-full">{h.location}</p>
                
                {/* Horizontal slider status indicators of tasks */}
                <div className="w-full mt-3 pt-2.5 border-t border-slate-900 flex items-center justify-between text-[10px] font-mono">
                  <div className="flex items-center gap-1.5 w-2/3">
                    <div className="flex-1 bg-slate-850 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-teal-400 h-full rounded" style={{ width: `${h.completionPercent}%` }}></div>
                    </div>
                    <span>{h.completionPercent}%</span>
                  </div>
                  <span className={`text-[9px] px-1.5 py-0.25 rounded-sm uppercase font-extrabold border ${
                    h.severity === 'critical' ? 'bg-rose-950 text-rose-400 border-rose-909' :
                    'bg-orange-950 text-orange-400 border-orange-900'
                  }`}>
                    {h.severity}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Right Side: Quality Evidence Form Drawer & Slider update (Image 5) */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg lg:col-span-2 flex flex-col justify-between">
          {activeJob ? (
            <div className="space-y-5">
              <div className="flex justify-between items-start pb-3 border-b border-slate-850 gap-2 flex-wrap">
                <div>
                  <span className="text-[10px] text-[#2ea014] font-mono">TASK FORCE DISPATCH METADATA</span>
                  <h3 className="text-lg font-bold text-white mt-1 leading-snug">{activeJob.title}</h3>
                  <p className="text-xs text-slate-400 font-mono">{activeJob.id} | {activeJob.location}</p>
                </div>
                {activeJob.status !== 'completed' && (
                  <div className="bg-rose-950/40 p-2 rounded border border-rose-900 flex items-center gap-1.5 text-xs font-mono text-rose-400 shrink-0">
                    <Clock size={14} className="animate-spin" style={{ animationDuration: '4s' }} />
                    <span>Lateness target: {activeJob.timeRemaining || "03:41:20"}</span>
                  </div>
                )}
              </div>

              {selectedJobId && successLogs && (
                <div className="p-3 bg-emerald-950 border border-emerald-900 text-emerald-400 rounded-lg text-xs font-mono">
                  {successLogs}
                </div>
              )}

              {/* Step 1: Repair interactive completion slider */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-slate-300 flex items-center gap-1">
                    Set Current Completed Percentage:
                    {(!currentUser || currentUser.role !== 'contractor') && (
                      <span className="text-[10px] text-rose-400 bg-rose-950/40 px-2 py-0.5 rounded border border-rose-905/30 font-mono">
                        Locked (Contractors Only)
                      </span>
                    )}
                  </span>
                  <span className="font-mono text-teal-400 text-sm font-bold bg-slate-950 px-2.5 py-1 roundedborder border-slate-850">
                    {activeJob.completionPercent}% Complete
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  disabled={activeJob.status === 'completed' || !currentUser || currentUser.role !== 'contractor'}
                  value={activeJob.completionPercent || 0}
                  onChange={(e) => handleUpdateProgress(e.target.value)}
                  className="w-full h-2 bg-slate-950 rounded-lg border border-slate-800 accent-[#2ea014] outline-none cursor-pointer disabled:opacity-40"
                />
                <p className="text-[10px] text-slate-500 font-mono">Sliders sync in-place back to Government Command control rooms.</p>
              </div>

              {/* Step 2: Quality Evidence Photo Drag & Drop (Image 5) */}
              <form onSubmit={handleSubmitProof} className="space-y-3 pt-2">
                <label className="text-[11px] uppercase font-bold text-slate-400 tracking-wider font-mono flex items-center justify-between">
                  <span>Upload Evidence Proof Files</span>
                  {(!currentUser || currentUser.role !== 'contractor') && (
                    <span className="text-[9px] text-rose-400 font-mono italic">Read-Only Observer Profile</span>
                  )}
                </label>
                
                {/* Drag zone container (Usability constraints met) */}
                <div 
                  onDragEnter={handleDrag}
                  onDragOver={handleDrag}
                  onDragLeave={handleDrag}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed bg-slate-950/65 rounded-xl p-6 text-center select-none transition-colors flex flex-col items-center justify-center gap-2 ${
                    (!currentUser || currentUser.role !== 'contractor') 
                      ? 'border-slate-900 bg-slate-950/30 cursor-not-allowed opacity-50' 
                      : dragActive 
                        ? 'border-teal-400 bg-teal-950/10 cursor-pointer' 
                        : 'border-slate-800 hover:border-slate-700 cursor-pointer'
                  }`}
                >
                  <input 
                    type="file" 
                    id="evidence-select" 
                    multiple 
                    disabled={!currentUser || currentUser.role !== 'contractor'}
                    onChange={handleFileChange}
                    className="hidden" 
                  />
                  <label htmlFor="evidence-select" className={`w-full h-full flex flex-col items-center ${(!currentUser || currentUser.role !== 'contractor') ? 'cursor-not-allowed' : 'cursor-pointer'}`}>
                    <Upload size={28} className="text-[#2ea014] mb-1.5 opacity-80" />
                    {(!currentUser || currentUser.role !== 'contractor') ? (
                      <>
                        <span className="text-xs text-slate-400 font-bold">Proof Upload Locked</span>
                        <span className="text-[10px] text-slate-500 font-mono block mt-1">Please log in as a Contractor to drag & drop files</span>
                      </>
                    ) : (
                      <>
                        <span className="text-xs text-slate-300 font-bold">Drag and drop photos/proof here, or <strong className="text-[#2ea014]">click to select</strong></span>
                        <span className="text-[10px] text-slate-505 font-mono block mt-1">Accepts PNG, JPG, JPEG formats</span>
                      </>
                    )}
                  </label>
                </div>

                {/* Evidence files list */}
                {evidenceFiles.length > 0 && (
                  <div className="bg-slate-950 p-2.5 border border-slate-800 rounded text-xs space-y-1.5 font-mono">
                    <span className="text-slate-500 text-[10px] block">Uploaded Proof Items:</span>
                    {evidenceFiles.map((f, index) => (
                      <div key={index} className="flex justify-between items-center bg-slate-900 border border-slate-850 px-2 py-1 rounded">
                        <span className="text-slate-300 truncate">{f}</span>
                        <button 
                          type="button" 
                          onClick={() => setEvidenceFiles(prev => prev.filter((_, i) => i !== index))}
                          className="text-rose-500 text-[10px]"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Submit to dispatch action */}
                {(!currentUser || currentUser.role !== 'contractor') ? (
                  <div 
                    onClick={onTriggerLogin}
                    className="w-full text-center bg-slate-950 hover:bg-[#2ea014]/10 hover:text-white border border-slate-850 p-3 rounded-lg text-slate-400 text-xs font-mono font-bold tracking-wide transition-all cursor-pointer flex items-center justify-center gap-1.5 uppercase"
                  >
                    <Lock size={13} className="text-rose-455 text-[#2ea014]" />
                    <span>Click to Sign In Contractor Account to write</span>
                  </div>
                ) : (
                  <button
                    type="submit"
                    disabled={evidenceFiles.length === 0 || activeJob.status === 'completed' || isSubmitting}
                    className="w-full bg-[#2ea014] disabled:bg-slate-800 text-white font-bold py-2.5 rounded text-xs tracking-wide transition-colors disabled:text-slate-500 hover:bg-[#258210] hover:scale-[1.01] flex items-center justify-center gap-1.5 shadow cursor-pointer text-center"
                  >
                    {isSubmitting ? (
                      <>
                        <Clock size={14} className="animate-spin" />
                        SYNCHRONIZING PROOF WITH INSPECTORS...
                      </>
                    ) : (
                      <>
                        <FileCheck size={14} />
                        SUBMIT QUALITY EVIDENCE & AUDIT AS COMPLETE
                      </>
                    )}
                  </button>
                )}
              </form>

            </div>
          ) : (
            <div className="text-center py-28 text-slate-500 font-mono text-xs">
              No active task is selected. Choose a job ticket card from the left panel.
            </div>
          )}

          {/* Quick SLA guidelines footer */}
          <div className="mt-4 p-3 bg-slate-950 rounded text-[10px] text-slate-400 font-mono border border-slate-850 leading-relaxed">
            SLA Note: All repair works require high-contrast physical photo evidence (before/after) matching target geo-tag coordinates within 5 meters to void automated liquidated damages metrics.
          </div>
        </div>
      </div>

    </div>
  );
}
