import React, { useState } from 'react';
import { 
  Building, Wrench, ShieldAlert, Clock, CheckCircle2, FileText, 
  Upload, Sparkles, ChevronRight, AlertCircle, FileCheck, Lock,
  Truck, HelpCircle, FilePlus, X, Send
} from 'lucide-react';
import { toast } from 'react-toastify';

// --- FAKE DATA FOR CONTRACTOR TOOLS ---
const FAKE_CREWS = [
  { id: "CRW-01", name: "Heavy Asphalt Team Alpha", status: "Available", distance: "2.4 km", eta: "14 mins" },
  { id: "CRW-02", name: "Emergency Patching Unit", status: "Busy (Sector 4)", distance: "12 km", eta: "1.5 hrs" },
  { id: "CRW-03", name: "Drainage Specialists", status: "Available", distance: "5.1 km", eta: "22 mins" }
];

const FAKE_MATERIALS = [
  { name: "Hot Mix Asphalt", stock: 142, threshold: 50, unit: "Tons" },
  { name: "Portland Cement", stock: 12, threshold: 20, unit: "Tons" },
  { name: "Aggregate Gravel", stock: 85, threshold: 30, unit: "Tons" },
  { name: "Safety Cones", stock: 14, threshold: 50, unit: "Units" }
];

const FAKE_TICKETS = [
  { id: "TCK-992", issue: "Payment delayed for Invoice #44", status: "In Review", date: "2 days ago" },
  { id: "TCK-814", issue: "Permit blocked by forestry dept", status: "Resolved", date: "1 week ago" }
];
// --------------------------------------

export default function ContractorPortal({ 
  hazards = [], 
  contractors = [], 
  onModifyHazard,
  currentUser = null
}) {
  const [selectedJobId, setSelectedJobId] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [evidenceFiles, setEvidenceFiles] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successLogs, setSuccessLogs] = useState(null);

  // Modal State
  const [activeModal, setActiveModal] = useState(null); // 'sla', 'crew', 'material', 'support'
  const [modalStep, setModalStep] = useState('view'); // 'view', 'submitting', 'done'

  // Strictly enforce contractor name from auth
  const selectedContractor = currentUser?.orgName || "BuildFast Pvt. Ltd.";

  // Active jobs filter for matching contractor name
  const activeJobs = hazards.filter(h => h.contractor === selectedContractor);
  const activeJob = activeJobs.find(j => j.id === selectedJobId) || activeJobs[0];

  const currentContractorStats = contractors.find(c => c.name === selectedContractor) || contractors[1];

  // Drag and drop event managers
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

  const handleUpdateProgress = (val) => {
    if (!activeJob) return;
    onModifyHazard(activeJob.id, { completionPercent: parseInt(val) });
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

  const handleFeatureClick = (featureName) => {
    setActiveModal(featureName);
    setModalStep('view');
  };

  const simulateFormSubmit = (e) => {
    e.preventDefault();
    setModalStep('submitting');
    setTimeout(() => {
      setModalStep('done');
      toast.success("Request processed successfully.");
      setTimeout(() => {
        setActiveModal(null);
      }, 2000);
    }, 1500);
  };

  return (
    <div id="contractor-portal-container" className="space-y-6 font-sans text-slate-100 pb-20 relative">
      
      {/* Security Banner strictly for Contractors */}
      <div className="animate-fadeIn">
        <div className="bg-emerald-950/40 border border-[#2ea014]/50 rounded-xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#2ea014]/15 text-[#2ea014] flex items-center justify-center border border-[#2ea014]/30 shrink-0">
              <Lock size={16} />
            </div>
            <div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-400 block">SECURE CONTRACTOR LEDGER ACTIVE</span>
              <span className="text-xs text-slate-200">Logged in as <strong className="text-white">{currentUser?.username || 'Contractor'}</strong> representing <strong className="text-emerald-400 font-semibold">{selectedContractor}</strong>.</span>
            </div>
          </div>
          <div className="text-[9px] bg-emerald-950 font-mono text-[#2ea014] font-black border border-[#2ea014]/35 px-2.5 py-1 rounded-md uppercase tracking-wider">
            AUTHORIZED WRITE ACCESS
          </div>
        </div>
      </div>

      {/* Title Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
            Contractor Operations Hub
            <span className="text-xs bg-[#2ea014]/20 text-[#2ea014] border border-[#2ea014]/50 font-normal px-2.5 py-0.5 rounded tracking-widest font-mono">REPAIR LOGS</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Manage your firm's dispatches, request materials, and upload evidence logs securely to the government ledger.
          </p>
        </div>

        {/* Firm Lock */}
        <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 p-1.5 rounded-lg">
          <span className="text-[10px] text-slate-500 font-mono uppercase">Assigned Firm:</span>
          <span className="bg-slate-950 font-bold font-mono text-[11px] text-emerald-400 border border-[#2ea014]/30 rounded px-2.5 py-1.5 inline-block">
            {selectedContractor} (LOCKED)
          </span>
        </div>
      </div>

      {/* Contractor Quick Action Tools */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <button onClick={() => handleFeatureClick('sla')} className="bg-slate-900 border border-slate-800 hover:border-sky-500/50 p-4 rounded-xl flex flex-col items-center justify-center gap-2 transition-all group">
          <Clock size={20} className="text-sky-400 group-hover:scale-110 transition-transform" />
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-300">SLA Extension</span>
        </button>
        <button onClick={() => handleFeatureClick('crew')} className="bg-slate-900 border border-slate-800 hover:border-amber-500/50 p-4 rounded-xl flex flex-col items-center justify-center gap-2 transition-all group">
          <Truck size={20} className="text-amber-400 group-hover:scale-110 transition-transform" />
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-300">Dispatch Crew</span>
        </button>
        <button onClick={() => handleFeatureClick('material')} className="bg-slate-900 border border-slate-800 hover:border-[#2ea014]/50 p-4 rounded-xl flex flex-col items-center justify-center gap-2 transition-all group">
          <FilePlus size={20} className="text-[#2ea014] group-hover:scale-110 transition-transform" />
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-300">Request Material</span>
        </button>
        <button onClick={() => handleFeatureClick('support')} className="bg-slate-900 border border-slate-800 hover:border-purple-500/50 p-4 rounded-xl flex flex-col items-center justify-center gap-2 transition-all group">
          <HelpCircle size={20} className="text-purple-400 group-hover:scale-110 transition-transform" />
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-300">Support Ticket</span>
        </button>
      </div>

      {/* Corporate Compliance gauges */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Compliance Dial 1 */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex items-center gap-5">
          <div className="relative w-20 h-20 shrink-0">
            <svg viewBox="0 0 36 36" className="w-full h-full rotate-270">
              <path className="text-slate-800" strokeWidth="3.5" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
              <path className="text-teal-400" strokeDasharray={`${currentContractorStats?.successRate || 94.5}, 100`} strokeWidth="3.5" strokeLinecap="round" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center text-xs font-mono font-bold text-white">{currentContractorStats?.successRate || 94.5}%</div>
          </div>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">SLA Adherence Index</h4>
            <p className="text-[11px] text-slate-400 mt-1 leading-normal">Percentage of emergency dispatches resolved within target timeline.</p>
          </div>
        </div>

        {/* Compliance Dial 2 */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex items-center gap-5">
          <div className="relative w-20 h-20 shrink-0">
            <svg viewBox="0 0 36 36" className="w-full h-full rotate-270">
              <path className="text-slate-800" strokeWidth="3.5" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
              <path className="text-[#2ea014]" strokeDasharray={`${(100 - (parseFloat(currentContractorStats?.averageCostVariance || '0') || 0))}, 100`} strokeWidth="3.5" strokeLinecap="round" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center text-xs font-mono font-bold text-white">96%</div>
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
              <path className="text-slate-800" strokeWidth="3.5" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
              <path className="text-rose-500" strokeDasharray={`${Math.max(10, 100 - (currentContractorStats?.slaBreaches || 1) * 8)}, 100`} strokeWidth="3.5" strokeLinecap="round" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center text-xs font-mono font-bold text-slate-200">{currentContractorStats?.slaBreaches || 0} Breaches</div>
          </div>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">Penalty Incractions</h4>
            <p className="text-[11px] text-slate-400 mt-1 leading-normal">Total number of delayed task orders that triggered automated deductions.</p>
          </div>
        </div>
      </div>

      {/* NEW: Financial Risk Forecaster + Live Fleet Tracker */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Financial Risk Forecaster */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
          <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-800">
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-300 flex items-center gap-2">
              <AlertCircle size={14} className="text-rose-400" />
              Financial Risk Forecaster
            </h3>
            <span className="text-[9px] font-mono text-amber-400 bg-amber-950/50 border border-amber-900/50 px-2 py-0.5 rounded font-bold">LIVE CALCULATION</span>
          </div>
          
          {/* Risk Summary */}
          <div className="bg-rose-950/20 border border-rose-900/30 rounded-lg p-4 mb-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-400 font-mono uppercase block">Total Penalty Exposure</span>
                <span className="text-3xl font-black text-rose-400 font-mono">₹2.85 <span className="text-sm text-rose-500/70">Lakhs</span></span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-400 font-mono uppercase block">Burn Rate</span>
                <span className="text-lg font-black text-amber-400 font-mono">₹45K<span className="text-xs text-amber-500/70">/hr</span></span>
              </div>
            </div>
          </div>

          {/* Per-job risk breakdown */}
          <div className="space-y-2">
            {[
              { id: "HAZ-4421", name: "Severe Asphalt Breach", overdue: "14m", penalty: "₹10,500", risk: "high" },
              { id: "HAZ-4422", name: "Unstable Construction Shoring", overdue: "0m", penalty: "₹0 (on time)", risk: "safe" },
              { id: "HAZ-8742", name: "Surface Cracking (Major)", overdue: "2h 10m", penalty: "₹97,500", risk: "critical" },
            ].map(item => (
              <div key={item.id} className="flex items-center justify-between p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-xs">
                <div className="flex items-center gap-2 min-w-0">
                  <div className={`w-2 h-2 rounded-full shrink-0 ${
                    item.risk === 'critical' ? 'bg-rose-500 animate-pulse' : item.risk === 'high' ? 'bg-amber-500' : 'bg-emerald-500'
                  }`}></div>
                  <div className="min-w-0">
                    <span className="text-slate-300 font-bold truncate block">{item.name}</span>
                    <span className="text-[9px] text-slate-500 font-mono">{item.id} • Overdue: {item.overdue}</span>
                  </div>
                </div>
                <span className={`font-mono font-bold text-[11px] shrink-0 ${
                  item.risk === 'critical' ? 'text-rose-400' : item.risk === 'high' ? 'text-amber-400' : 'text-emerald-400'
                }`}>{item.penalty}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Live Fleet Tracker */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
          <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-800">
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-300 flex items-center gap-2">
              <Truck size={14} className="text-sky-400" />
              Live Fleet Tracker
            </h3>
            <span className="text-[9px] font-mono text-emerald-400 bg-emerald-950/50 border border-emerald-900/50 px-2 py-0.5 rounded font-bold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
              3 UNITS DEPLOYED
            </span>
          </div>

          {/* Fleet vehicles */}
          <div className="space-y-3">
            {[
              { id: "TRK-A1", driver: "Sanjay Kumar", task: "HAZ-4421", location: "NH65 Sector 12", speed: "42 km/h", eta: "4 min", status: "en-route" },
              { id: "TRK-B3", driver: "Ravi Patil", task: "HAZ-8742", location: "Industrial Zone B", speed: "0 km/h", eta: "On Site", status: "working" },
              { id: "TRK-C7", driver: "Deepak Nair", task: "—", location: "Depot HQ", speed: "0 km/h", eta: "Standby", status: "idle" },
            ].map(truck => (
              <div key={truck.id} className="bg-slate-950 border border-slate-800 rounded-lg p-3 flex items-center gap-3">
                {/* Truck icon with status indicator */}
                <div className="relative shrink-0">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center border ${
                    truck.status === 'en-route' ? 'bg-sky-950/50 border-sky-800 text-sky-400' :
                    truck.status === 'working' ? 'bg-amber-950/50 border-amber-800 text-amber-400' :
                    'bg-slate-900 border-slate-700 text-slate-500'
                  }`}>
                    <Truck size={18} />
                  </div>
                  <span className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-slate-950 ${
                    truck.status === 'en-route' ? 'bg-sky-400 animate-pulse' :
                    truck.status === 'working' ? 'bg-amber-400' : 'bg-slate-600'
                  }`}></span>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-white">{truck.driver}</span>
                    <span className={`text-[9px] font-mono font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${
                      truck.status === 'en-route' ? 'bg-sky-950 text-sky-400 border border-sky-900' :
                      truck.status === 'working' ? 'bg-amber-950 text-amber-400 border border-amber-900' :
                      'bg-slate-800 text-slate-500 border border-slate-700'
                    }`}>{truck.status}</span>
                  </div>
                  <div className="flex justify-between items-center mt-1.5">
                    <span className="text-[10px] text-slate-400 font-mono truncate">{truck.id} • {truck.location}</span>
                    <span className="text-[10px] text-slate-500 font-mono shrink-0">ETA: <strong className="text-white">{truck.eta}</strong></span>
                  </div>
                  {/* Speed bar */}
                  <div className="flex items-center gap-2 mt-1.5">
                    <div className="flex-1 bg-slate-800 h-1 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full transition-all ${
                        truck.status === 'en-route' ? 'bg-sky-500 w-[70%]' :
                        truck.status === 'working' ? 'bg-amber-500 w-[10%]' : 'bg-slate-700 w-[0%]'
                      }`}></div>
                    </div>
                    <span className="text-[9px] font-mono text-slate-500">{truck.speed}</span>
                  </div>
                </div>
              </div>
            ))}
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

        {/* Right Side: Quality Evidence Form Drawer */}
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

              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-slate-300 flex items-center gap-1">Set Current Completed Percentage:</span>
                  <span className="font-mono text-teal-400 text-sm font-bold bg-slate-950 px-2.5 py-1 roundedborder border-slate-850">
                    {activeJob.completionPercent}% Complete
                  </span>
                </div>
                <input
                  type="range" min="0" max="100"
                  disabled={activeJob.status === 'completed'}
                  value={activeJob.completionPercent || 0}
                  onChange={(e) => handleUpdateProgress(e.target.value)}
                  className="w-full h-2 bg-slate-950 rounded-lg border border-slate-800 accent-[#2ea014] outline-none cursor-pointer disabled:opacity-40"
                />
                <p className="text-[10px] text-slate-500 font-mono">Sliders sync in-place back to Government Command control rooms.</p>
              </div>

              <form onSubmit={handleSubmitProof} className="space-y-3 pt-2">
                <label className="text-[11px] uppercase font-bold text-slate-400 tracking-wider font-mono flex items-center justify-between">
                  <span>Upload Evidence Proof Files</span>
                </label>
                
                <div 
                  onDragEnter={handleDrag} onDragOver={handleDrag} onDragLeave={handleDrag} onDrop={handleDrop}
                  className={`border-2 border-dashed bg-slate-950/65 rounded-xl p-6 text-center select-none transition-colors flex flex-col items-center justify-center gap-2 ${dragActive ? 'border-teal-400 bg-teal-950/10 cursor-pointer' : 'border-slate-800 hover:border-slate-700 cursor-pointer'}`}
                >
                  <input type="file" id="evidence-select" multiple onChange={handleFileChange} className="hidden" />
                  <label htmlFor="evidence-select" className="w-full h-full flex flex-col items-center cursor-pointer">
                    <Upload size={28} className="text-[#2ea014] mb-1.5 opacity-80" />
                    <span className="text-xs text-slate-300 font-bold">Drag and drop photos/proof here, or <strong className="text-[#2ea014]">click to select</strong></span>
                    <span className="text-[10px] text-slate-505 font-mono block mt-1">Accepts PNG, JPG, JPEG formats</span>
                  </label>
                </div>

                {evidenceFiles.length > 0 && (
                  <div className="bg-slate-950 p-2.5 border border-slate-800 rounded text-xs space-y-1.5 font-mono">
                    <span className="text-slate-500 text-[10px] block">Uploaded Proof Items:</span>
                    {evidenceFiles.map((f, index) => (
                      <div key={index} className="flex justify-between items-center bg-slate-900 border border-slate-850 px-2 py-1 rounded">
                        <span className="text-slate-300 truncate">{f}</span>
                        <button type="button" onClick={() => setEvidenceFiles(prev => prev.filter((_, i) => i !== index))} className="text-rose-500 text-[10px]">Remove</button>
                      </div>
                    ))}
                  </div>
                )}

                <button type="submit" disabled={evidenceFiles.length === 0 || activeJob.status === 'completed' || isSubmitting} className="w-full bg-[#2ea014] disabled:bg-slate-800 text-white font-bold py-2.5 rounded text-xs tracking-wide transition-colors disabled:text-slate-500 hover:bg-[#258210] hover:scale-[1.01] flex items-center justify-center gap-1.5 shadow cursor-pointer text-center">
                  {isSubmitting ? <><Clock size={14} className="animate-spin" /> SYNCHRONIZING PROOF WITH INSPECTORS...</> : <><FileCheck size={14} /> SUBMIT QUALITY EVIDENCE & AUDIT AS COMPLETE</>}
                </button>
              </form>
            </div>
          ) : (
            <div className="text-center py-28 text-slate-500 font-mono text-xs">
              No active task is selected. Choose a job ticket card from the left panel.
            </div>
          )}

          <div className="mt-4 p-3 bg-slate-950 rounded text-[10px] text-slate-400 font-mono border border-slate-850 leading-relaxed">
            SLA Note: All repair works require high-contrast physical photo evidence (before/after) matching target geo-tag coordinates within 5 meters to void automated liquidated damages metrics.
          </div>
        </div>
      </div>

      {/* QUICK TOOLS MODAL OVERLAY */}
      {activeModal && (
        <div className="aegis-modal-overlay fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#0c1223] border border-slate-700 rounded-xl w-full max-w-xl shadow-2xl flex flex-col overflow-hidden animate-fadeIn">
            
            {/* Modal Header */}
            <div className="bg-slate-900 p-4 border-b border-slate-800 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center
                  ${activeModal === 'sla' ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30' : ''}
                  ${activeModal === 'crew' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : ''}
                  ${activeModal === 'material' ? 'bg-[#2ea014]/20 text-[#2ea014] border border-[#2ea014]/30' : ''}
                  ${activeModal === 'support' ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' : ''}
                `}>
                  {activeModal === 'sla' && <Clock size={16} />}
                  {activeModal === 'crew' && <Truck size={16} />}
                  {activeModal === 'material' && <FilePlus size={16} />}
                  {activeModal === 'support' && <HelpCircle size={16} />}
                </div>
                <div>
                  <h3 className="font-bold text-white uppercase text-sm tracking-wider">
                    {activeModal === 'sla' && "SLA Extension Request"}
                    {activeModal === 'crew' && "Fleet & Crew Allocation"}
                    {activeModal === 'material' && "Material Requisition"}
                    {activeModal === 'support' && "Help & Support Tickets"}
                  </h3>
                  <p className="text-[10px] font-mono text-slate-400">Secure Network: {selectedContractor}</p>
                </div>
              </div>
              <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-white transition-colors p-1 bg-slate-800 hover:bg-slate-700 rounded"><X size={16}/></button>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              {modalStep === 'view' ? (
                <form onSubmit={simulateFormSubmit} className="space-y-5">
                  
                  {/* SLA Content */}
                  {activeModal === 'sla' && (
                    <>
                      <div>
                        <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Select Active Job ID</label>
                        <select required className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-xs font-mono text-slate-200 focus:border-sky-500 outline-none">
                          <option value="">-- Choose Job --</option>
                          {activeJobs.map(j => <option key={j.id} value={j.id}>{j.id} - {j.title}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Reason for Extension</label>
                        <select required className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-xs text-slate-200 focus:border-sky-500 outline-none">
                          <option value="weather">Severe Weather Conditions</option>
                          <option value="material">Material Supply Chain Delay</option>
                          <option value="traffic">Unforeseen Traffic Blockage</option>
                          <option value="other">Other Operational Hazards</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Additional Notes</label>
                        <textarea required placeholder="Briefly describe the delay..." className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-xs text-slate-200 focus:border-sky-500 outline-none h-20"></textarea>
                      </div>
                      <button type="submit" className="w-full bg-sky-600 hover:bg-sky-500 text-white font-bold py-2 rounded text-xs uppercase tracking-wider flex justify-center items-center gap-2 transition-colors">
                        <Send size={14}/> Submit Extension Request
                      </button>
                    </>
                  )}

                  {/* Crew Content */}
                  {activeModal === 'crew' && (
                    <>
                      <div className="space-y-3">
                        <label className="block text-[10px] uppercase font-bold text-slate-400">Available Fleets & Crews</label>
                        {FAKE_CREWS.map(crew => (
                          <div key={crew.id} className="flex justify-between items-center p-3 border border-slate-800 bg-slate-900 rounded-lg">
                            <div>
                              <div className="text-xs font-bold text-white">{crew.name}</div>
                              <div className="text-[10px] font-mono text-slate-400 mt-0.5">Status: <span className={crew.status === 'Available' ? 'text-[#2ea014]' : 'text-amber-500'}>{crew.status}</span></div>
                            </div>
                            <div className="text-right">
                              <div className="text-[10px] font-mono text-slate-400">ETA: {crew.eta}</div>
                              <button type="button" disabled={crew.status !== 'Available'} className="mt-1 px-3 py-1 bg-amber-500/20 text-amber-400 border border-amber-500/50 hover:bg-amber-500 hover:text-slate-900 disabled:opacity-30 disabled:hover:bg-amber-500/20 disabled:hover:text-amber-400 transition-all rounded text-[9px] font-bold uppercase tracking-wider">
                                Assign
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                      <button type="submit" className="w-full bg-amber-600 hover:bg-amber-500 text-white font-bold py-2 rounded text-xs uppercase tracking-wider flex justify-center items-center gap-2 transition-colors mt-2">
                        Confirm Allocation Changes
                      </button>
                    </>
                  )}

                  {/* Material Content */}
                  {activeModal === 'material' && (
                    <>
                      <div className="grid grid-cols-2 gap-3 mb-2">
                        {FAKE_MATERIALS.map((mat, i) => (
                          <div key={i} className="p-3 bg-slate-900 border border-slate-800 rounded-lg text-center">
                            <div className="text-[10px] uppercase font-bold text-slate-400">{mat.name}</div>
                            <div className={`text-xl font-mono font-black mt-1 ${mat.stock <= mat.threshold ? 'text-rose-400' : 'text-emerald-400'}`}>
                              {mat.stock} <span className="text-[10px] text-slate-500 font-sans">{mat.unit}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Select Material for Requisition</label>
                        <select required className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-xs text-slate-200 focus:border-[#2ea014] outline-none">
                          {FAKE_MATERIALS.map(m => <option key={m.name} value={m.name}>{m.name}</option>)}
                        </select>
                      </div>
                      <div className="flex gap-3">
                        <div className="flex-1">
                          <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Quantity</label>
                          <input type="number" required placeholder="e.g. 50" min="1" className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-xs text-slate-200 focus:border-[#2ea014] outline-none" />
                        </div>
                        <div className="flex-1">
                          <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Delivery Site Job ID</label>
                          <select required className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-xs font-mono text-slate-200 focus:border-[#2ea014] outline-none">
                            <option value="">-- Choose Job --</option>
                            {activeJobs.map(j => <option key={j.id} value={j.id}>{j.id}</option>)}
                          </select>
                        </div>
                      </div>
                      <button type="submit" className="w-full bg-[#2ea014] hover:bg-[#258210] text-white font-bold py-2 rounded text-xs uppercase tracking-wider flex justify-center items-center gap-2 transition-colors">
                        <Send size={14}/> Place Material Order
                      </button>
                    </>
                  )}

                  {/* Support Content */}
                  {activeModal === 'support' && (
                    <>
                      <div className="space-y-3 mb-4">
                        <label className="block text-[10px] uppercase font-bold text-slate-400">Previous Tickets</label>
                        {FAKE_TICKETS.map(tick => (
                          <div key={tick.id} className="text-xs p-2.5 bg-slate-900 border border-slate-800 rounded flex justify-between items-center">
                            <div>
                              <span className="font-mono text-slate-500 mr-2">{tick.id}</span>
                              <span className="text-slate-200">{tick.issue}</span>
                            </div>
                            <span className={`text-[9px] uppercase font-bold px-2 py-0.5 rounded ${tick.status === 'Resolved' ? 'bg-emerald-900/50 text-emerald-400' : 'bg-amber-900/50 text-amber-400'}`}>
                              {tick.status}
                            </span>
                          </div>
                        ))}
                      </div>
                      <div className="border-t border-slate-800 pt-4">
                        <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Open New Ticket</label>
                        <textarea required placeholder="Describe the issue..." className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-xs text-slate-200 focus:border-purple-500 outline-none h-20 mb-2"></textarea>
                        <button type="submit" className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold py-2 rounded text-xs uppercase tracking-wider flex justify-center items-center gap-2 transition-colors">
                          Submit Support Ticket
                        </button>
                      </div>
                    </>
                  )}
                  
                </form>
              ) : modalStep === 'submitting' ? (
                <div className="flex flex-col items-center justify-center py-10 space-y-4">
                  <Clock size={32} className="text-slate-400 animate-spin" />
                  <span className="text-xs font-mono font-bold text-slate-300 uppercase tracking-widest">Processing Request...</span>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-10 space-y-4">
                  <CheckCircle2 size={40} className="text-[#2ea014]" />
                  <div className="text-center">
                    <span className="text-sm font-bold text-white block">REQUEST SUBMITTED</span>
                    <span className="text-[10px] font-mono text-slate-400">AegisRoad ledger updated successfully.</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
