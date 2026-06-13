import React, { useState } from 'react';
import { 
  Building, Clock, CheckCircle2, Upload, FileCheck, Lock,
  Truck, HelpCircle, FilePlus, X, AlertCircle
} from 'lucide-react';
import { toast } from 'react-toastify';

const T = { teal:'#072E24', tealMid:'#156B52', yellow:'#C8D400', cream:'#F4F0E6', creamDark:'#EAE5D6', textDark:'#0D1E1B' };
const card = { background:'#FFFFFF', border:'1px solid rgba(13,30,27,0.1)', borderRadius:'16px' };
const inp = { background:T.creamDark, border:'1px solid rgba(13,30,27,0.18)', borderRadius:'10px', padding:'9px 12px', fontSize:'13px', color:T.textDark, outline:'none', width:'100%', fontFamily:'inherit' };

const FAKE_CREWS = [
  { id:"CRW-01", name:"Heavy Asphalt Team Alpha", status:"Available", distance:"2.4 km", eta:"14 mins" },
  { id:"CRW-02", name:"Emergency Patching Unit", status:"Busy (Sector 4)", distance:"12 km", eta:"1.5 hrs" },
  { id:"CRW-03", name:"Drainage Specialists", status:"Available", distance:"5.1 km", eta:"22 mins" }
];
const FAKE_MATERIALS = [
  { name:"Hot Mix Asphalt", stock:142, threshold:50, unit:"Tons" },
  { name:"Portland Cement", stock:12, threshold:20, unit:"Tons" },
  { name:"Aggregate Gravel", stock:85, threshold:30, unit:"Tons" },
  { name:"Safety Cones", stock:14, threshold:50, unit:"Units" }
];
const FAKE_TICKETS = [
  { id:"TCK-992", issue:"Payment delayed for Invoice #44", status:"In Review", date:"2 days ago" },
  { id:"TCK-814", issue:"Permit blocked by forestry dept", status:"Resolved", date:"1 week ago" }
];

const badge = (c,bg) => ({ color:c, background:bg, fontSize:'9px', fontFamily:'monospace', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.08em', padding:'3px 8px', borderRadius:'6px', display:'inline-flex', alignItems:'center', gap:'4px' });

export default function ContractorPortal({ hazards = [], contractors = [], onModifyHazard, currentUser = null }) {
  const [selectedJobId, setSelectedJobId] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [evidenceFiles, setEvidenceFiles] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successLogs, setSuccessLogs] = useState(null);
  const [activeModal, setActiveModal] = useState(null);
  const [modalStep, setModalStep] = useState('view');

  const selectedContractor = currentUser?.orgName || "BuildFast Pvt. Ltd.";
  const activeJobs = hazards.filter(h => h.contractor === selectedContractor);
  const activeJob = activeJobs.find(j => j.id === selectedJobId) || activeJobs[0];
  const currentContractorStats = contractors.find(c => c.name === selectedContractor) || contractors[1];

  const handleDrag = (e) => { e.preventDefault(); e.stopPropagation(); if (e.type==="dragenter"||e.type==="dragover") setDragActive(true); else if (e.type==="dragleave") setDragActive(false); };
  const handleDrop = (e) => { e.preventDefault(); e.stopPropagation(); setDragActive(false); if (e.dataTransfer.files?.[0]) setEvidenceFiles(p=>[...p,...Array.from(e.dataTransfer.files).map(f=>f.name)]); };
  const handleFileChange = (e) => { if (e.target.files?.[0]) setEvidenceFiles(p=>[...p,...Array.from(e.target.files).map(f=>f.name)]); };

  const handleUpdateProgress = (val) => { if (!activeJob) return; onModifyHazard(activeJob.id, { completionPercent: parseInt(val) }); };

  const handleSubmitProof = (e) => {
    e.preventDefault();
    if (!evidenceFiles.length) return;
    setIsSubmitting(true);
    setTimeout(() => {
      onModifyHazard(activeJob.id, { status:'completed', completionPercent:100, description:`${activeJob.description} [AUDIT PROOF UPLOADED: ${evidenceFiles.join(', ')}]` });
      setSuccessLogs(`Audit submitted for ${activeJob.id}. Site marked as COMPLETE.`);
      setEvidenceFiles([]); setIsSubmitting(false);
      setTimeout(() => setSuccessLogs(null), 5000);
    }, 1500);
  };

  const simulateFormSubmit = (e) => {
    e.preventDefault(); setModalStep('submitting');
    setTimeout(() => { setModalStep('done'); toast.success("Request processed successfully."); setTimeout(() => setActiveModal(null), 2000); }, 1500);
  };

  const dials = [
    { pct: currentContractorStats?.successRate||94.5, label:'SLA Adherence Index', sub:'% emergency dispatches resolved on time', color:'#156B52' },
    { pct: 96, label:'Spend Efficiency Index', sub:'Budget cost deviation ratio score', color:T.tealMid },
    { pct: Math.max(10,100-(currentContractorStats?.slaBreaches||1)*8), label:'Penalty Infractions', sub:'Delayed task orders with auto-deductions', color:'#dc2626', suffix: ` (${currentContractorStats?.slaBreaches||0} breaches)` },
  ];

  return (
    <div className="space-y-6 animate-fadeIn pb-20 relative">

      {/* Security Banner */}
      <div className="rounded-2xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3" style={{ background:'rgba(21,107,82,0.08)', border:'1px solid rgba(21,107,82,0.2)' }}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full flex items-center justify-center border shrink-0" style={{ background:'rgba(21,107,82,0.12)', color:T.tealMid, borderColor:'rgba(21,107,82,0.25)' }}>
            <Lock size={16} />
          </div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider block font-mono" style={{ color:T.tealMid }}>SECURE CONTRACTOR LEDGER ACTIVE</span>
            <span className="text-xs" style={{ color:'rgba(13,30,27,0.7)' }}>Logged in as <strong style={{ color:T.teal }}>{currentUser?.username||'Contractor'}</strong> representing <strong style={{ color:T.tealMid }}>{selectedContractor}</strong>.</span>
          </div>
        </div>
        <div className="text-[9px] font-black uppercase tracking-wider px-3 py-1.5 rounded-lg font-mono" style={{ background:T.teal, color:T.yellow }}>AUTHORIZED WRITE ACCESS</div>
      </div>

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 pb-5 border-b" style={{ borderColor:'rgba(13,30,27,0.12)' }}>
        <div>
          <h1 className="text-[clamp(26px,4vw,42px)] font-black uppercase leading-tight flex items-center gap-2" style={{ fontFamily:"'Barlow Condensed',sans-serif", color:T.teal }}>
            Contractor Operations Hub
            <span className="text-[10px] font-black px-2 py-0.5 rounded normal-case" style={{ background:T.yellow, color:T.teal, fontFamily:'monospace' }}>REPAIR LOGS</span>
          </h1>
          <p className="text-sm mt-1" style={{ color:'rgba(13,30,27,0.5)' }}>Manage dispatches, request materials, and upload evidence logs to the government ledger.</p>
        </div>
        <div className="flex items-center gap-2 p-2 rounded-xl border" style={{ background:'#FFFFFF', borderColor:'rgba(13,30,27,0.1)' }}>
          <span className="text-[10px] font-mono uppercase" style={{ color:'rgba(13,30,27,0.4)' }}>Firm:</span>
          <span className="font-black font-mono text-[11px] px-2.5 py-1.5 rounded-lg" style={{ background:T.teal, color:T.yellow }}>{selectedContractor} (LOCKED)</span>
        </div>
      </div>

      {/* Quick Action Buttons */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { key:'sla', icon:<Clock size={20}/>, label:'SLA Extension', col:'#2563eb', bg:'rgba(37,99,235,0.08)' },
          { key:'crew', icon:<Truck size={20}/>, label:'Dispatch Crew', col:'#d97706', bg:'rgba(217,119,6,0.08)' },
          { key:'material', icon:<FilePlus size={20}/>, label:'Request Material', col:T.tealMid, bg:'rgba(21,107,82,0.08)' },
          { key:'support', icon:<HelpCircle size={20}/>, label:'Support Ticket', col:'#7c3aed', bg:'rgba(124,58,237,0.08)' },
        ].map(b => (
          <button key={b.key} onClick={() => { setActiveModal(b.key); setModalStep('view'); }} className="p-4 rounded-2xl flex flex-col items-center justify-center gap-2 transition-all group cursor-pointer" style={{ background:'#FFFFFF', border:'1px solid rgba(13,30,27,0.1)' }}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform" style={{ background:b.bg, color:b.col }}>{b.icon}</div>
            <span className="text-[10px] font-black uppercase tracking-wider" style={{ color:T.teal, fontFamily:"'Barlow Condensed',sans-serif" }}>{b.label}</span>
          </button>
        ))}
      </div>

      {/* Compliance Dials */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {dials.map((d,i) => (
          <div key={i} className="p-5 rounded-2xl flex items-center gap-5" style={card}>
            <div className="relative w-20 h-20 shrink-0">
              <svg viewBox="0 0 36 36" className="w-full h-full" style={{ transform:'rotate(-90deg)' }}>
                <path stroke="rgba(13,30,27,0.1)" strokeWidth="3.5" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                <path stroke={d.color} strokeDasharray={`${d.pct}, 100`} strokeWidth="3.5" strokeLinecap="round" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center text-xs font-black font-mono" style={{ color:T.teal }}>{d.pct}%</div>
            </div>
            <div>
              <h4 className="text-xs font-black uppercase tracking-wider mb-1" style={{ color:T.teal, fontFamily:"'Barlow Condensed',sans-serif" }}>{d.label}</h4>
              <p className="text-[11px] leading-normal" style={{ color:'rgba(13,30,27,0.5)' }}>{d.sub}{d.suffix||''}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Financial Risk + Fleet */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Financial Risk */}
        <div className="p-5 rounded-2xl" style={card}>
          <div className="flex justify-between items-center mb-4 pb-2 border-b" style={{ borderColor:'rgba(13,30,27,0.08)' }}>
            <h3 className="text-sm font-black uppercase flex items-center gap-2" style={{ fontFamily:"'Barlow Condensed',sans-serif", color:T.teal }}>
              <AlertCircle size={14} style={{ color:'#dc2626' }} />Financial Risk Forecaster
            </h3>
            <span style={badge('#d97706','#fef3c7')}>LIVE CALCULATION</span>
          </div>
          <div className="flex items-center justify-between p-4 rounded-xl mb-4" style={{ background:'#fee2e2', border:'1px solid #fca5a5' }}>
            <div>
              <span className="text-[10px] font-mono uppercase block mb-0.5" style={{ color:'rgba(13,30,27,0.5)' }}>Total Penalty Exposure</span>
              <span className="text-3xl font-black font-mono" style={{ fontFamily:"'Barlow Condensed',sans-serif", color:'#dc2626' }}>₹2.85 <span className="text-sm" style={{ color:'rgba(220,38,38,0.6)' }}>Lakhs</span></span>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-mono uppercase block mb-0.5" style={{ color:'rgba(13,30,27,0.5)' }}>Burn Rate</span>
              <span className="text-lg font-black font-mono" style={{ fontFamily:"'Barlow Condensed',sans-serif", color:'#d97706' }}>₹45K<span className="text-xs" style={{ color:'rgba(217,119,6,0.6)' }}>/hr</span></span>
            </div>
          </div>
          <div className="space-y-2">
            {[
              { id:"HAZ-4421", name:"Severe Asphalt Breach", overdue:"14m", penalty:"₹10,500", risk:"high" },
              { id:"HAZ-4422", name:"Unstable Construction Shoring", overdue:"0m", penalty:"₹0 (on time)", risk:"safe" },
              { id:"HAZ-8742", name:"Surface Cracking (Major)", overdue:"2h 10m", penalty:"₹97,500", risk:"critical" },
            ].map(item => (
              <div key={item.id} className="flex items-center justify-between p-2.5 rounded-xl text-xs border" style={{ background:T.creamDark, borderColor:'rgba(13,30,27,0.07)' }}>
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-2 h-2 rounded-full shrink-0" style={{ background:item.risk==='critical'?'#dc2626':item.risk==='high'?'#d97706':'#16a34a', animation:item.risk==='critical'?'pulse 1.5s infinite':'' }} />
                  <div className="min-w-0">
                    <span className="font-bold truncate block" style={{ color:T.teal }}>{item.name}</span>
                    <span className="text-[9px] font-mono" style={{ color:'rgba(13,30,27,0.4)' }}>{item.id} · Overdue: {item.overdue}</span>
                  </div>
                </div>
                <span className="font-mono font-black text-[11px] shrink-0" style={{ color:item.risk==='critical'?'#dc2626':item.risk==='high'?'#d97706':'#16a34a' }}>{item.penalty}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Fleet Tracker */}
        <div className="p-5 rounded-2xl" style={card}>
          <div className="flex justify-between items-center mb-4 pb-2 border-b" style={{ borderColor:'rgba(13,30,27,0.08)' }}>
            <h3 className="text-sm font-black uppercase flex items-center gap-2" style={{ fontFamily:"'Barlow Condensed',sans-serif", color:T.teal }}>
              <Truck size={14} style={{ color:'#2563eb' }} />Live Fleet Tracker
            </h3>
            <span style={badge(T.tealMid,'rgba(21,107,82,0.1)')}>
              <span className="w-1.5 h-1.5 rounded-full bg-green-600 animate-ping inline-block" />3 UNITS DEPLOYED
            </span>
          </div>
          <div className="space-y-3">
            {[
              { id:"TRK-A1", driver:"Sanjay Kumar", location:"NH65 Sector 12", speed:"42 km/h", eta:"4 min", status:"en-route" },
              { id:"TRK-B3", driver:"Ravi Patil", location:"Industrial Zone B", speed:"0 km/h", eta:"On Site", status:"working" },
              { id:"TRK-C7", driver:"Deepak Nair", location:"Depot HQ", speed:"0 km/h", eta:"Standby", status:"idle" },
            ].map(truck => {
              const statusCol = truck.status==='en-route'?'#2563eb':truck.status==='working'?'#d97706':'rgba(13,30,27,0.4)';
              const statusBg = truck.status==='en-route'?'rgba(37,99,235,0.08)':truck.status==='working'?'rgba(217,119,6,0.08)':'rgba(13,30,27,0.04)';
              const barW = truck.status==='en-route'?'70%':truck.status==='working'?'10%':'0%';
              return (
                <div key={truck.id} className="p-3 rounded-xl flex items-center gap-3" style={{ background:T.creamDark, border:'1px solid rgba(13,30,27,0.07)' }}>
                  <div className="relative shrink-0">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background:statusBg, color:statusCol }}><Truck size={18}/></div>
                    <span className="absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white" style={{ background:statusCol, animation:truck.status==='en-route'?'pulse 1.5s infinite':'' }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold" style={{ color:T.teal }}>{truck.driver}</span>
                      <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded" style={{ color:statusCol, background:statusBg }}>{truck.status}</span>
                    </div>
                    <div className="flex justify-between items-center mt-1">
                      <span className="text-[10px] font-mono truncate" style={{ color:'rgba(13,30,27,0.45)' }}>{truck.id} · {truck.location}</span>
                      <span className="text-[10px] font-mono shrink-0" style={{ color:'rgba(13,30,27,0.4)' }}>ETA: <strong style={{ color:T.teal }}>{truck.eta}</strong></span>
                    </div>
                    <div className="flex items-center gap-2 mt-1.5">
                      <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background:'rgba(13,30,27,0.1)' }}>
                        <div className="h-full rounded-full transition-all" style={{ width:barW, background:statusCol }} />
                      </div>
                      <span className="text-[9px] font-mono" style={{ color:'rgba(13,30,27,0.4)' }}>{truck.speed}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Job Queue + Evidence Form */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Job List */}
        <div className="p-5 rounded-2xl lg:col-span-1 space-y-4" style={card}>
          <div className="pb-2 border-b flex justify-between items-center" style={{ borderColor:'rgba(13,30,27,0.08)' }}>
            <h3 className="text-sm font-black uppercase tracking-wider" style={{ fontFamily:"'Barlow Condensed',sans-serif", color:T.teal }}>Assigned Tasks</h3>
            <span className="text-[10px] font-black px-2 py-0.5 rounded" style={{ background:T.teal, color:T.yellow, fontFamily:'monospace' }}>{activeJobs.length} Active</span>
          </div>
          <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
            {activeJobs.map(h => (
              <button key={h.id} onClick={()=>setSelectedJobId(h.id)} className="w-full text-left p-3.5 rounded-xl border transition-all flex flex-col justify-between cursor-pointer" style={{ background:h.id===activeJob?.id?T.teal:T.creamDark, borderColor:h.id===activeJob?.id?T.teal:'rgba(13,30,27,0.08)' }}>
                <div className="flex justify-between items-start w-full gap-2 text-[10px]">
                  <span className="font-mono font-bold" style={{ color:h.id===activeJob?.id?'rgba(200,212,0,0.7)':'rgba(13,30,27,0.4)' }}>{h.id}</span>
                  <span className="font-mono font-bold" style={{ color:h.status==='completed'?'#16a34a':h.id===activeJob?.id?T.yellow:'#dc2626' }}>{h.status==='completed'?'RESOLVED':'Countdown Active'}</span>
                </div>
                <h4 className="text-xs font-black mt-1.5 truncate" style={{ fontFamily:"'Barlow Condensed',sans-serif", color:h.id===activeJob?.id?'#fff':T.teal }}>{h.title}</h4>
                <p className="text-[11px] truncate mt-0.5" style={{ color:h.id===activeJob?.id?'rgba(255,255,255,0.55)':'rgba(13,30,27,0.45)' }}>{h.location}</p>
                <div className="w-full mt-3 pt-2 border-t flex items-center justify-between text-[10px] font-mono" style={{ borderColor:h.id===activeJob?.id?'rgba(255,255,255,0.1)':'rgba(13,30,27,0.08)' }}>
                  <div className="flex items-center gap-1.5 w-2/3">
                    <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background:h.id===activeJob?.id?'rgba(255,255,255,0.15)':'rgba(13,30,27,0.1)' }}>
                      <div className="h-full rounded-full" style={{ width:`${h.completionPercent}%`, background:T.yellow }} />
                    </div>
                    <span style={{ color:h.id===activeJob?.id?'rgba(255,255,255,0.6)':'rgba(13,30,27,0.5)' }}>{h.completionPercent}%</span>
                  </div>
                  <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded" style={{ color:h.severity==='critical'?'#dc2626':'#ea580c', background:h.severity==='critical'?'#fee2e2':'#ffedd5' }}>{h.severity}</span>
                </div>
              </button>
            ))}
            {activeJobs.length===0 && <div className="text-center py-10 text-sm font-mono" style={{ color:'rgba(13,30,27,0.35)' }}>No active tasks assigned.</div>}
          </div>
        </div>

        {/* Evidence Form */}
        <div className="p-5 rounded-2xl lg:col-span-2 flex flex-col justify-between" style={card}>
          {activeJob ? (
            <div className="space-y-5 flex-1">
              <div className="flex justify-between items-start pb-3 border-b gap-2 flex-wrap" style={{ borderColor:'rgba(13,30,27,0.08)' }}>
                <div>
                  <span className="text-[10px] font-black uppercase tracking-widest font-mono" style={{ color:T.tealMid }}>TASK FORCE DISPATCH METADATA</span>
                  <h3 className="text-xl font-black uppercase mt-0.5 leading-snug" style={{ fontFamily:"'Barlow Condensed',sans-serif", color:T.teal }}>{activeJob.title}</h3>
                  <p className="text-xs font-mono" style={{ color:'rgba(13,30,27,0.45)' }}>{activeJob.id} | {activeJob.location}</p>
                </div>
                {activeJob.status!=='completed' && (
                  <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-mono font-bold" style={{ background:'#fee2e2', color:'#dc2626', border:'1px solid #fca5a5' }}>
                    <Clock size={13} className="animate-spin" style={{ animationDuration:'4s' }} />
                    {activeJob.timeRemaining||"03:41:20"}
                  </div>
                )}
              </div>

              {successLogs && (
                <div className="p-3 rounded-xl text-xs font-mono font-bold" style={{ background:'rgba(21,107,82,0.08)', color:T.tealMid, border:'1px solid rgba(21,107,82,0.2)' }}>✅ {successLogs}</div>
              )}

              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold" style={{ color:T.teal }}>Set Completion Percentage:</span>
                  <span className="font-mono font-black text-sm px-3 py-1 rounded-lg" style={{ background:T.teal, color:T.yellow }}>{activeJob.completionPercent}%</span>
                </div>
                <input type="range" min="0" max="100" disabled={activeJob.status==='completed'} value={activeJob.completionPercent||0} onChange={e=>handleUpdateProgress(e.target.value)} className="w-full cursor-pointer disabled:opacity-40" style={{ accentColor:T.teal }} />
                <p className="text-[10px] font-mono" style={{ color:'rgba(13,30,27,0.4)' }}>Sliders sync back to Government Command control rooms.</p>
              </div>

              <form onSubmit={handleSubmitProof} className="space-y-3 pt-2 border-t" style={{ borderColor:'rgba(13,30,27,0.08)' }}>
                <label className="text-[10px] font-black uppercase tracking-wider block font-mono" style={{ color:'rgba(13,30,27,0.45)' }}>Upload Evidence Proof Files</label>
                <div onDragEnter={handleDrag} onDragOver={handleDrag} onDragLeave={handleDrag} onDrop={handleDrop}
                  className="border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer flex flex-col items-center gap-2 transition-all"
                  style={{ borderColor:dragActive?T.teal:'rgba(13,30,27,0.15)', background:dragActive?'rgba(7,46,36,0.04)':T.creamDark }}
                >
                  <input type="file" id="evidence-select" multiple onChange={handleFileChange} className="hidden" />
                  <label htmlFor="evidence-select" className="w-full flex flex-col items-center cursor-pointer gap-2">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background:'rgba(21,107,82,0.1)', color:T.tealMid }}><Upload size={20}/></div>
                    <span className="text-sm font-bold" style={{ color:T.teal }}>Drag photos here, or <strong style={{ color:T.tealMid }}>click to select</strong></span>
                    <span className="text-[10px] font-mono" style={{ color:'rgba(13,30,27,0.4)' }}>PNG, JPG, JPEG formats accepted</span>
                  </label>
                </div>
                {evidenceFiles.length>0 && (
                  <div className="p-3 rounded-xl space-y-1.5" style={{ background:T.creamDark, border:'1px solid rgba(13,30,27,0.08)' }}>
                    <span className="text-[9px] font-black uppercase block font-mono" style={{ color:'rgba(13,30,27,0.4)' }}>Uploaded Proof Items:</span>
                    {evidenceFiles.map((f,i) => (
                      <div key={i} className="flex justify-between items-center px-2 py-1 rounded-lg" style={{ background:'#FFFFFF' }}>
                        <span className="text-xs font-mono truncate" style={{ color:T.teal }}>{f}</span>
                        <button type="button" onClick={()=>setEvidenceFiles(p=>p.filter((_,idx)=>idx!==i))} className="text-[10px] font-bold ml-2 cursor-pointer" style={{ color:'#dc2626' }}>Remove</button>
                      </div>
                    ))}
                  </div>
                )}
                <button type="submit" disabled={!evidenceFiles.length||activeJob.status==='completed'||isSubmitting} className="w-full py-3.5 rounded-2xl text-sm font-black uppercase tracking-wider disabled:opacity-40 cursor-pointer flex items-center justify-center gap-2 transition-all hover:scale-[1.01]" style={{ background:T.teal, color:T.yellow, fontFamily:"'Barlow Condensed',sans-serif" }}>
                  {isSubmitting?<><Clock size={14} className="animate-spin"/>SYNCHRONIZING WITH INSPECTORS...</>:<><FileCheck size={14}/>Submit Evidence &amp; Mark Complete</>}
                </button>
              </form>
            </div>
          ) : (
            <div className="text-center py-24 text-sm font-mono" style={{ color:'rgba(13,30,27,0.35)' }}>Select a job ticket from the left panel.</div>
          )}
          <div className="mt-4 p-3 rounded-xl text-[10px] font-mono leading-relaxed" style={{ background:T.creamDark, border:'1px solid rgba(13,30,27,0.08)', color:'rgba(13,30,27,0.5)' }}>
            SLA Note: All repair works require high-contrast physical photo evidence (before/after) matching target geo-tag coordinates within 5 meters to void automated liquidated damages metrics.
          </div>
        </div>
      </div>

      {/* Modal Overlay */}
      {activeModal && (
        <div className="aegis-modal-overlay fixed inset-0 flex items-center justify-center p-4" style={{ background:'rgba(7,46,36,0.75)', backdropFilter:'blur(12px)' }}>
          <div className="w-full max-w-xl rounded-2xl overflow-hidden animate-fadeIn shadow-2xl" style={{ background:T.cream }}>
            <div className="p-5 border-b flex justify-between items-center" style={{ background:T.teal, borderColor:'rgba(255,255,255,0.1)' }}>
              <h3 className="text-xl font-black uppercase text-white" style={{ fontFamily:"'Barlow Condensed',sans-serif" }}>
                {activeModal==='sla'&&'SLA Extension Request'}
                {activeModal==='crew'&&'Dispatch Crew'}
                {activeModal==='material'&&'Request Material'}
                {activeModal==='support'&&'Support Ticket'}
              </h3>
              <button onClick={()=>setActiveModal(null)} className="text-white/60 hover:text-white cursor-pointer text-xl font-light">✕</button>
            </div>

            {modalStep==='done' ? (
              <div className="p-10 text-center">
                <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background:'rgba(21,107,82,0.1)', color:T.tealMid }}><CheckCircle2 size={30}/></div>
                <h3 className="text-2xl font-black uppercase mb-2" style={{ fontFamily:"'Barlow Condensed',sans-serif", color:T.teal }}>Request Processed!</h3>
                <p className="text-sm" style={{ color:'rgba(13,30,27,0.55)' }}>Your request has been submitted successfully.</p>
              </div>
            ) : modalStep==='submitting' ? (
              <div className="p-10 text-center">
                <div className="w-10 h-10 rounded-full border-4 mx-auto mb-4 animate-spin" style={{ borderColor:`${T.tealMid}33`, borderTopColor:T.tealMid }}/>
                <p className="text-sm font-bold" style={{ color:T.teal }}>Processing request...</p>
              </div>
            ) : (
              <form onSubmit={simulateFormSubmit} className="p-6 space-y-4">
                {activeModal==='sla' && (
                  <>
                    <div><label className="block text-[9px] font-black uppercase tracking-wider mb-1.5 font-mono" style={{ color:'rgba(13,30,27,0.45)' }}>Job ID</label><input defaultValue={activeJob?.id||''} style={inp} placeholder="e.g. HAZ-4421" /></div>
                    <div><label className="block text-[9px] font-black uppercase tracking-wider mb-1.5 font-mono" style={{ color:'rgba(13,30,27,0.45)' }}>Reason for Extension</label><textarea rows="3" style={{ ...inp, resize:'none' }} placeholder="Describe the reason for SLA extension request..." /></div>
                    <div><label className="block text-[9px] font-black uppercase tracking-wider mb-1.5 font-mono" style={{ color:'rgba(13,30,27,0.45)' }}>Requested Extension (Hours)</label><select style={inp}><option>24 hours</option><option>48 hours</option><option>72 hours</option></select></div>
                  </>
                )}
                {activeModal==='crew' && (
                  <div className="space-y-2">
                    {FAKE_CREWS.map(c => (
                      <div key={c.id} className="flex items-center justify-between p-3 rounded-xl" style={{ background:T.creamDark, border:'1px solid rgba(13,30,27,0.08)' }}>
                        <div>
                          <span className="text-sm font-black" style={{ color:T.teal, fontFamily:"'Barlow Condensed',sans-serif" }}>{c.name}</span>
                          <p className="text-[10px] font-mono" style={{ color:'rgba(13,30,27,0.45)' }}>{c.distance} away · ETA {c.eta}</p>
                        </div>
                        <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded" style={{ color:c.status==='Available'?T.tealMid:'#d97706', background:c.status==='Available'?'rgba(21,107,82,0.1)':'rgba(217,119,6,0.1)' }}>{c.status}</span>
                      </div>
                    ))}
                  </div>
                )}
                {activeModal==='material' && (
                  <div className="space-y-2">
                    {FAKE_MATERIALS.map(m => (
                      <div key={m.name} className="flex items-center justify-between p-3 rounded-xl" style={{ background:T.creamDark, border:'1px solid rgba(13,30,27,0.08)' }}>
                        <div>
                          <span className="text-sm font-black" style={{ color:T.teal, fontFamily:"'Barlow Condensed',sans-serif" }}>{m.name}</span>
                          <p className="text-[10px] font-mono" style={{ color:'rgba(13,30,27,0.45)' }}>Stock: {m.stock} {m.unit} (min: {m.threshold})</p>
                        </div>
                        <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded" style={{ color:m.stock<m.threshold?'#dc2626':T.tealMid, background:m.stock<m.threshold?'#fee2e2':'rgba(21,107,82,0.1)' }}>{m.stock<m.threshold?'LOW':'OK'}</span>
                      </div>
                    ))}
                    <div><label className="block text-[9px] font-black uppercase tracking-wider mb-1.5 font-mono" style={{ color:'rgba(13,30,27,0.45)' }}>Material Request Notes</label><textarea rows="2" style={{ ...inp, resize:'none' }} placeholder="Specify quantities needed..." /></div>
                  </div>
                )}
                {activeModal==='support' && (
                  <>
                    <div className="space-y-2 mb-2">
                      {FAKE_TICKETS.map(t => (
                        <div key={t.id} className="p-3 rounded-xl" style={{ background:T.creamDark, border:'1px solid rgba(13,30,27,0.08)' }}>
                          <div className="flex justify-between text-[10px] font-mono mb-0.5">
                            <span className="font-black" style={{ color:T.tealMid }}>{t.id}</span>
                            <span style={{ color:'rgba(13,30,27,0.4)' }}>{t.date}</span>
                          </div>
                          <p className="text-xs font-bold" style={{ color:T.teal }}>{t.issue}</p>
                          <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded mt-1 inline-block" style={{ color:t.status==='Resolved'?T.tealMid:'#d97706', background:t.status==='Resolved'?'rgba(21,107,82,0.1)':'rgba(217,119,6,0.1)' }}>{t.status}</span>
                        </div>
                      ))}
                    </div>
                    <div><label className="block text-[9px] font-black uppercase tracking-wider mb-1.5 font-mono" style={{ color:'rgba(13,30,27,0.45)' }}>New Support Issue</label><textarea rows="3" style={{ ...inp, resize:'none' }} placeholder="Describe your issue..." /></div>
                  </>
                )}
                <div className="flex gap-3 pt-2">
                  <button type="submit" className="flex-1 py-3 rounded-xl text-sm font-black uppercase tracking-wider cursor-pointer transition-all hover:scale-[1.01]" style={{ background:T.teal, color:T.yellow, fontFamily:"'Barlow Condensed',sans-serif" }}>Submit Request →</button>
                  <button type="button" onClick={()=>setActiveModal(null)} className="px-6 py-3 rounded-xl text-sm font-bold cursor-pointer border" style={{ borderColor:'rgba(13,30,27,0.15)', color:'rgba(13,30,27,0.6)' }}>Cancel</button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
