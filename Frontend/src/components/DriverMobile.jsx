import React, { useState, useEffect } from 'react';
import { Navigation, AlertTriangle, Volume2, Mic, MapPin, CheckCircle2, Upload, FileCheck, Clock, Map, HardHat, Zap } from 'lucide-react';
import { toast } from 'react-toastify';
import InteractiveMap from './InteractiveMap';

const T = { teal:'#072E24', tealMid:'#156B52', yellow:'#C8D400', cream:'#F4F0E6', creamDark:'#EAE5D6', textDark:'#0D1E1B' };
const card = { background:'#FFFFFF', border:'1px solid rgba(13,30,27,0.1)', borderRadius:'16px' };

export default function DriverMobile({ hazards = [], onModifyHazard, onReportHazard, currentUser = null }) {
  const [selectedJobId, setSelectedJobId] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [evidenceFiles, setEvidenceFiles] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [speechActive, setSpeechActive] = useState(false);
  const [quickReportLogged, setQuickReportLogged] = useState(false);
  const [arrivedJobs, setArrivedJobs] = useState({});

  const selectedContractor = currentUser?.orgName || "BuildFast Pvt. Ltd.";
  const activeJobs = hazards.filter(h => h.contractor === selectedContractor);
  const activeJob = activeJobs.find(j => j.id === selectedJobId) || activeJobs[0];

  useEffect(() => {
    if (!selectedJobId && activeJobs.length > 0) setSelectedJobId(activeJobs[0].id);
  }, [activeJobs, selectedJobId]);

  const handleLogArrival = () => {
    if (!activeJob) return;
    setArrivedJobs(p => ({...p,[activeJob.id]:true}));
    toast.success(`Arrival logged for ${activeJob.id} at ${new Date().toLocaleTimeString()}`);
    if (activeJob.status === 'unassigned') onModifyHazard(activeJob.id,{status:'in-progress',completionPercent:5});
  };

  const handleSpeakAlert = () => {
    setSpeechActive(true); toast.info("Microphone activated. Recording field log...");
    setTimeout(()=>{setSpeechActive(false);toast.success("Voice log transcribed and attached to task.");},3000);
  };

  const handleQuickReport = () => {
    setQuickReportLogged(true);
    onReportHazard({ title:"Field Worker Quick-Pin: New Obstruction", location:"Worker's Current GPS Trajectory", severity:"medium", reporter:currentUser?`${currentUser.username} (${currentUser.orgName})`:"Field Unit", status:"unassigned", description:"Field worker dropped a live hazard pin from the mobile terminal.", coordinates:{lat:16.4357,lng:80.6281}, contractor:selectedContractor });
    toast.success("Live Hazard Pin Dropped. Dispatch notified.");
    setTimeout(()=>setQuickReportLogged(false),4000);
  };

  const handleDrag = (e) => { e.preventDefault();e.stopPropagation();if(e.type==="dragenter"||e.type==="dragover")setDragActive(true);else if(e.type==="dragleave")setDragActive(false); };
  const handleDrop = (e) => { e.preventDefault();e.stopPropagation();setDragActive(false);if(e.dataTransfer.files?.[0])setEvidenceFiles(p=>[...p,...Array.from(e.dataTransfer.files).map(f=>f.name)]); };
  const handleFileChange = (e) => { if(e.target.files?.[0])setEvidenceFiles(p=>[...p,...Array.from(e.target.files).map(f=>f.name)]); };

  const handleSubmitProof = (e) => {
    e.preventDefault();
    if (!evidenceFiles.length) return;
    setIsSubmitting(true);
    setTimeout(()=>{
      onModifyHazard(activeJob.id,{status:'completed',completionPercent:100,description:`${activeJob.description} [WORKER PROOF SUBMITTED: ${evidenceFiles.join(', ')}]`});
      toast.success("Task marked complete and evidence uploaded!");
      setEvidenceFiles([]);setIsSubmitting(false);
    },1500);
  };

  const isArrived = activeJob && arrivedJobs[activeJob.id];

  return (
    <div className="space-y-5 animate-fadeIn pb-16">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-5 border-b" style={{ borderColor:'rgba(13,30,27,0.12)' }}>
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded" style={{ background:'rgba(21,107,82,0.1)', color:T.tealMid, fontFamily:'monospace' }}>
              <span className="w-1.5 h-1.5 rounded-full bg-green-600 animate-ping inline-block mr-1" />FIELD OPERATIONS ACTIVE
            </span>
          </div>
          <h1 className="text-[clamp(24px,3vw,38px)] font-black uppercase leading-tight flex items-center gap-2" style={{ fontFamily:"'Barlow Condensed',sans-serif", color:T.teal }}>
            <HardHat size={28} style={{ color:T.tealMid }} />Field Operations Console
          </h1>
          <p className="text-sm font-mono mt-0.5" style={{ color:'rgba(13,30,27,0.5)' }}>
            Logged in: <strong style={{ color:T.tealMid }}>{currentUser?.username||'Field Worker'}</strong> | Crew: <strong style={{ color:T.teal }}>{selectedContractor}</strong>
          </p>
        </div>
        <div className="flex items-center gap-3 p-3 rounded-2xl" style={{ background:'#fef3c7', border:'1px solid #fde68a' }}>
          <Zap size={16} className="animate-pulse" style={{ color:'#d97706' }} />
          <div className="text-xs">
            <span className="font-black uppercase tracking-wide block" style={{ color:'#d97706' }}>Shift Safety Advisory</span>
            <span className="font-mono text-[10px]" style={{ color:'rgba(13,30,27,0.55)' }}>Weather: Clear · Vis: 10km · Traffic: Moderate</span>
          </div>
        </div>
      </div>

      {/* Main Split */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5" style={{ minHeight:'720px' }}>
        {/* LEFT: Map */}
        <div className="rounded-2xl flex flex-col overflow-hidden" style={{ ...card, padding:0, minHeight:'400px' }}>
          <div className="flex justify-between items-center px-4 py-3 border-b shrink-0" style={{ background:T.teal, borderColor:'rgba(255,255,255,0.1)' }}>
            <div className="flex items-center gap-2">
              <Map size={16} style={{ color:T.yellow }} />
              <span className="text-sm font-black uppercase text-white" style={{ fontFamily:"'Barlow Condensed',sans-serif" }}>Live GPS Radar</span>
            </div>
            <button onClick={handleQuickReport} disabled={quickReportLogged} className="text-[10px] font-black uppercase tracking-wider px-3 py-1.5 rounded-lg flex items-center gap-1.5 cursor-pointer transition-all" style={{ background:quickReportLogged?'rgba(21,107,82,0.2)':'#dc2626', color:quickReportLogged?T.tealMid:'#fff', fontFamily:"'Barlow Condensed',sans-serif" }}>
              <MapPin size={11}/>{quickReportLogged?"PIN DROPPED":"DROP HAZARD PIN"}
            </button>
          </div>
          <div className="flex-1 min-h-[280px] relative overflow-hidden">
            <InteractiveMap className="rounded-none" hazards={activeJobs} selectedHazardId={activeJob?.id} activeView="driver" onSelectHazard={h=>setSelectedJobId(h.id)} />
            <div className="absolute bottom-4 left-4 z-[5] rounded-xl px-3 py-2 pointer-events-none" style={{ background:'rgba(7,46,36,0.9)', backdropFilter:'blur(8px)' }}>
              <div className="text-[9px] font-black uppercase tracking-widest" style={{ color:'rgba(200,212,0,0.6)', fontFamily:'monospace' }}>Current Vector</div>
              <div className="text-2xl font-black text-white" style={{ fontFamily:"'Barlow Condensed',sans-serif" }}>42 <span className="text-xs font-normal" style={{ color:'rgba(255,255,255,0.5)' }}>km/h</span></div>
            </div>
          </div>
        </div>

        {/* RIGHT: Task Queue + Console */}
        <div className="flex flex-col gap-4 h-full">
          {/* Nav HUD */}
          <div className="rounded-2xl p-4" style={{ background:T.teal, border:'1px solid rgba(255,255,255,0.1)' }}>
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-xl flex items-center justify-center shrink-0" style={{ background:'rgba(200,212,0,0.15)', border:'2px solid rgba(200,212,0,0.4)' }}>
                <svg viewBox="0 0 24 24" className="w-8 h-8" fill="none" stroke={T.yellow} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 19V5M5 12l7-7 7 7" /></svg>
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[9px] font-mono uppercase tracking-widest mb-0.5" style={{ color:'rgba(200,212,0,0.6)' }}>Next Maneuver</div>
                <div className="text-lg font-black text-white truncate leading-tight" style={{ fontFamily:"'Barlow Condensed',sans-serif" }}>
                  {activeJob?`Head to ${activeJob.location?.split(',')[0]||'NH65'}`:'No Active Route'}
                </div>
                <div className="flex items-center gap-3 mt-1 text-[10px] font-mono" style={{ color:'rgba(255,255,255,0.55)' }}>
                  <span><strong className="text-white text-xs">450m</strong> ahead</span>
                  <span>ETA: <strong style={{ color:T.yellow }}>4 min</strong></span>
                  <span>Speed: <strong style={{ color:'#7fd4b8' }}>42 km/h</strong></span>
                </div>
              </div>
              <div className="shrink-0 text-center">
                <div className="text-[8px] font-mono uppercase" style={{ color:'rgba(255,255,255,0.4)' }}>Route</div>
                <div className="w-16 h-1.5 rounded-full overflow-hidden mt-1" style={{ background:'rgba(255,255,255,0.1)' }}><div className="h-full rounded-full" style={{ width:'35%', background:T.yellow }}/></div>
                <div className="text-[9px] font-mono font-bold mt-0.5" style={{ color:T.yellow }}>35%</div>
              </div>
            </div>
          </div>

          {/* Task Queue */}
          <div className="rounded-2xl p-4 flex flex-col flex-1 overflow-hidden" style={card}>
            <div className="flex justify-between items-center pb-2 mb-3 border-b" style={{ borderColor:'rgba(13,30,27,0.08)' }}>
              <h3 className="text-sm font-black uppercase tracking-wider" style={{ fontFamily:"'Barlow Condensed',sans-serif", color:T.teal }}>My Assigned Dispatch Queue</h3>
              <span className="text-[10px] font-black px-2 py-0.5 rounded" style={{ background:T.teal, color:T.yellow, fontFamily:'monospace' }}>{activeJobs.length} Tasks</span>
            </div>
            <div className="overflow-y-auto space-y-2 flex-1 pr-1">
              {activeJobs.map(job => (
                <button key={job.id} onClick={()=>setSelectedJobId(job.id)} className="w-full text-left p-3 rounded-xl transition-all flex flex-col gap-1.5 cursor-pointer border" style={{ background:job.id===activeJob?.id?T.teal:T.creamDark, borderColor:job.id===activeJob?.id?T.teal:'rgba(13,30,27,0.08)' }}>
                  <div className="flex justify-between text-[9px] font-mono">
                    <span className="font-black" style={{ color:job.id===activeJob?.id?'rgba(200,212,0,0.7)':'rgba(13,30,27,0.4)' }}>{job.id}</span>
                    <span className="font-black uppercase" style={{ color:job.status==='completed'?T.tealMid:job.id===activeJob?.id?T.yellow:'#d97706' }}>{job.status}</span>
                  </div>
                  <h4 className="text-xs font-black truncate" style={{ fontFamily:"'Barlow Condensed',sans-serif", color:job.id===activeJob?.id?'#fff':T.teal }}>{job.title}</h4>
                  <p className="text-[10px] truncate flex items-center gap-1" style={{ color:job.id===activeJob?.id?'rgba(255,255,255,0.55)':'rgba(13,30,27,0.45)' }}>
                    <Navigation size={9}/>{job.location}
                  </p>
                </button>
              ))}
              {activeJobs.length===0 && <div className="text-center py-10 text-sm" style={{ color:'rgba(13,30,27,0.35)', fontFamily:'monospace' }}>No tasks assigned to your crew.</div>}
            </div>
          </div>

          {/* Execution Console */}
          <div className="rounded-2xl p-5 flex-none" style={{ ...card, minHeight:'360px', display:'flex', flexDirection:'column', justifyContent:'space-between' }}>
            {activeJob ? (
              <>
                <div>
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-[9px] font-black uppercase tracking-widest font-mono" style={{ color:T.tealMid }}>Active Execution Console</span>
                    {activeJob.status==='completed'&&<span className="text-[9px] font-black uppercase px-2 py-0.5 rounded" style={{ background:'rgba(21,107,82,0.1)', color:T.tealMid }}>RESOLVED</span>}
                  </div>
                  <h2 className="text-xl font-black uppercase mb-1" style={{ fontFamily:"'Barlow Condensed',sans-serif", color:T.teal }}>{activeJob.title}</h2>
                  <p className="text-xs" style={{ color:'rgba(13,30,27,0.5)' }}>{activeJob.description}</p>
                </div>
                {activeJob.status!=='completed' ? (
                  <div className="space-y-4 mt-4">
                    <div className="grid grid-cols-2 gap-3">
                      <button onClick={handleLogArrival} disabled={isArrived} className="py-3 rounded-xl flex flex-col items-center gap-1 transition-all cursor-pointer border" style={{ background:isArrived?'rgba(21,107,82,0.1)':'transparent', borderColor:isArrived?T.tealMid:'rgba(13,30,27,0.15)', color:isArrived?T.tealMid:T.teal }}>
                        <MapPin size={18}/><span className="text-[10px] font-black uppercase">{isArrived?'Arrival Logged':'Log Arrival'}</span>
                      </button>
                      <button onClick={handleSpeakAlert} className={`py-3 rounded-xl flex flex-col items-center gap-1 transition-all cursor-pointer border ${speechActive?'animate-pulse':''}`} style={{ background:speechActive?'#fee2e2':'transparent', borderColor:speechActive?'#dc2626':'rgba(13,30,27,0.15)', color:speechActive?'#dc2626':T.teal }}>
                        <Mic size={18}/><span className="text-[10px] font-black uppercase">{speechActive?'Recording...':'Voice Log'}</span>
                      </button>
                    </div>
                    <div className={`space-y-3 pt-3 border-t transition-opacity ${!isArrived?'opacity-40 pointer-events-none':''}`} style={{ borderColor:'rgba(13,30,27,0.08)' }}>
                      <label className="text-[9px] font-black uppercase tracking-wider block" style={{ color:'rgba(13,30,27,0.45)', fontFamily:'monospace' }}>Upload Evidence Proof</label>
                      <div onDragEnter={handleDrag} onDragOver={handleDrag} onDragLeave={handleDrag} onDrop={handleDrop} className="rounded-xl p-4 text-center cursor-pointer border-2 border-dashed transition-all flex flex-col items-center gap-1.5" style={{ borderColor:dragActive?T.teal:'rgba(13,30,27,0.15)', background:dragActive?'rgba(7,46,36,0.04)':T.creamDark }}>
                        <input type="file" id="worker-evidence" multiple onChange={handleFileChange} className="hidden" />
                        <label htmlFor="worker-evidence" className="w-full flex flex-col items-center cursor-pointer">
                          <Upload size={22} style={{ color:T.tealMid }} className="mb-1"/><span className="text-xs font-bold" style={{ color:T.teal }}>Tap to snap or <strong style={{ color:T.tealMid }}>upload file</strong></span>
                        </label>
                      </div>
                      {evidenceFiles.length>0 && <p className="text-[10px] font-mono font-bold truncate" style={{ color:T.tealMid }}>Attached: {evidenceFiles.join(', ')}</p>}
                      <button type="button" onClick={handleSubmitProof} disabled={evidenceFiles.length===0||isSubmitting} className="w-full py-3 rounded-xl text-xs font-black uppercase tracking-wider disabled:opacity-40 cursor-pointer flex items-center justify-center gap-1.5 transition-all hover:scale-[1.01]" style={{ background:T.teal, color:T.yellow, fontFamily:"'Barlow Condensed',sans-serif" }}>
                        {isSubmitting?<><Clock size={14} className="animate-spin"/>UPLOADING...</>:<><FileCheck size={14}/>Mark Task as Resolved</>}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center flex-1 mt-4 space-y-3 rounded-2xl" style={{ background:'rgba(21,107,82,0.06)', border:'1px solid rgba(21,107,82,0.15)' }}>
                    <CheckCircle2 size={44} style={{ color:T.tealMid }}/>
                    <div className="text-center">
                      <div className="text-sm font-black uppercase" style={{ fontFamily:"'Barlow Condensed',sans-serif", color:T.teal }}>Task Completed</div>
                      <div className="text-[10px] font-mono mt-1" style={{ color:'rgba(13,30,27,0.45)' }}>Audit log securely filed to ledger.</div>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="flex items-center justify-center h-40 text-sm font-mono" style={{ color:'rgba(13,30,27,0.35)' }}>Select a task from the queue.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
