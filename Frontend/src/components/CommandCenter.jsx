import React, { useState, useEffect } from 'react';
import { 
  Building, Map as MapIcon, AlertTriangle, Coins, TrendingUp, TrendingDown, 
  Clock, ShieldAlert, Users, CheckCircle2, AlertCircle, Sparkles, Filter, 
  ChevronRight, ArrowUpRight, Search, ListFilter
} from 'lucide-react';
import InteractiveMap from './InteractiveMap';

// ── Design tokens ────────────────────────────────────────
const T = {
  teal: '#072E24', tealMid: '#156B52', yellow: '#C8D400',
  cream: '#F4F0E6', creamDark: '#EAE5D6', white: '#FFFFFF',
  textDark: '#0D1E1B',
};

const card = { background: T.white, border: '1px solid rgba(13,30,27,0.1)', borderRadius: '16px', padding: '20px' };
const cardTeal = { background: T.teal, border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '20px' };
const badge = (col, bg) => ({ color: col, background: bg, fontSize: '9px', fontFamily: 'monospace', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', padding: '3px 8px', borderRadius: '6px', display: 'inline-flex', alignItems: 'center', gap: '4px' });

const SEV = { critical: { bg:'#fee2e2', text:'#dc2626', border:'#fca5a5' }, high: { bg:'#ffedd5', text:'#ea580c', border:'#fdba74' }, medium: { bg:'#fef3c7', text:'#d97706', border:'#fcd34d' }, low: { bg:'#dcfce7', text:'#16a34a', border:'#86efac' } };
const ST = { unassigned: { bg:'#fee2e2', text:'#dc2626' }, 'in-progress': { bg:'#dbeafe', text:'#2563eb' }, completed: { bg:'#dcfce7', text:'#16a34a' } };

const inp = { background: '#EAE5D6', border: '1px solid rgba(13,30,27,0.18)', borderRadius: '8px', padding: '8px 12px', fontSize: '13px', color: T.textDark, outline: 'none', width: '100%', fontFamily: 'inherit' };

export default function CommandCenter({
  hazards = [], contracts = [], contractors = [], slaBreaches = [],
  onReportHazard, onModifyHazard, onUpdateSLABreach
}) {
  const [selectedHazard, setSelectedHazard] = useState(null);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [filterSeverity, setFilterSeverity] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [newLocation, setNewLocation] = useState('');
  const [newSeverity, setNewSeverity] = useState('high');
  const [newCategory, setNewCategory] = useState('Pavement Failure');
  const [newDesc, setNewDesc] = useState('');

  useEffect(() => {
    if (hazards.length > 0 && !selectedHazard) {
      setSelectedHazard(hazards.find(h => h.id === 'HAZ-9821') || hazards[0]);
    }
  }, [hazards, selectedHazard]);

  const [timeRemainingSeconds, setTimeRemainingSeconds] = useState(6312);
  useEffect(() => {
    const timer = setInterval(() => setTimeRemainingSeconds(p => p > 0 ? p - 1 : 12000), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatSeconds = (t) => {
    const h = Math.floor(t/3600), m = Math.floor((t%3600)/60), s = t%60;
    return [h,m,s].map(v => String(v).padStart(2,'0')).join(':');
  };

  const handleCreateReportSubmit = (e) => {
    e.preventDefault();
    if (!newTitle || !newLocation) return;
    onReportHazard({ title:newTitle, location:newLocation, severity:newSeverity, category:newCategory, reporter:"Platform AI Monitor", status:"unassigned", description:newDesc||"Telemetry triggers point to significant road asphalt structure decay.", coordinates:{ x:Math.floor(Math.random()*55)+20, y:Math.floor(Math.random()*55)+20 }, reportedTimeAgo:"Just now" });
    setNewTitle(''); setNewLocation(''); setNewSeverity('high'); setNewCategory('Pavement Failure'); setNewDesc('');
    setReportModalOpen(false);
  };

  const filteredHazards = hazards.filter(h => {
    const ms = filterSeverity === 'all' || h.severity === filterSeverity;
    const mt = filterStatus === 'all' || h.status === filterStatus;
    const mq = !searchQuery || [h.title,h.id,h.location].some(v => v?.toLowerCase().includes(searchQuery.toLowerCase()));
    return ms && mt && mq;
  });

  const totalAllocated = contracts.reduce((s,c) => s + (c.budgetAllocated||0), 0);
  const totalDisbursed = contracts.reduce((s,c) => s + (c.amountDisbursed||0), 0);
  const budgetPct = totalAllocated ? ((totalDisbursed/totalAllocated)*100).toFixed(0) : 0;

  const sevSel = (sev) => sev === filterSeverity;
  const stSel = (st) => st === filterStatus;
  const filterBtnBase = "text-[11px] font-bold uppercase tracking-wider px-3 py-1.5 rounded transition-all cursor-pointer border";

  const camFeeds = [
    { id:"CAM-04", location:"NH65 Downtown Flyover", detection:"Pothole Cluster", confidence:97.2, severity:"critical", bbox:true },
    { id:"CAM-11", location:"Industrial Zone Entry Ramp", detection:"Surface Cracking", confidence:89.1, severity:"high", bbox:true },
    { id:"CAM-07", location:"Riverside Pkwy Southbound", detection:"No Anomaly", confidence:0, severity:"clear", bbox:false },
    { id:"CAM-22", location:"Main St & Commerce", detection:"Debris on Lane", confidence:74.8, severity:"medium", bbox:true },
  ];

  return (
    <div className="space-y-6 animate-fadeIn" style={{ fontFamily:'inherit' }}>

      {/* ── HEADER ─────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-5 border-b" style={{ borderColor:'rgba(13,30,27,0.12)' }}>
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span style={badge('#dc2626','#fee2e2')}>
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse inline-block" />
              SECURE SECTOR 04 FEED
            </span>
          </div>
          <h1 className="text-[clamp(28px,4vw,42px)] font-black uppercase leading-tight" style={{ fontFamily:"'Barlow Condensed',sans-serif", color:T.teal }}>
            Command Center <span className="text-base font-medium normal-case" style={{ color:'rgba(13,30,27,0.4)', fontFamily:'monospace' }}>(Control Tower View)</span>
          </h1>
          <p className="text-sm mt-1" style={{ color:'rgba(13,30,27,0.5)' }}>Real-time asphalt health auditing, active incident logging, and contractor accountability monitoring.</p>
        </div>
        <button onClick={() => setReportModalOpen(true)} className="shrink-0 flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-black uppercase tracking-wider transition-all hover:scale-[1.01] cursor-pointer" style={{ background:T.teal, color:T.yellow, fontFamily:"'Barlow Condensed',sans-serif" }}>
          <AlertCircle size={15} /> Dispatch Patrol
        </button>
      </div>

      {/* ── KPI STATS ──────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { label:'Active Hazards', val:hazards.length, sub:'+2 unassigned nodes', icon:<AlertTriangle size={14}/>, col:'#dc2626', trend:'up' },
          { label:'SLA Breach Rate', val:'11.4%', sub:'-2.1% under threshold', icon:<ShieldAlert size={14}/>, col:'#d97706', trend:'down' },
          { label:'Budget Utilization', val:`${budgetPct}%`, sub:`${totalDisbursed.toFixed(1)}Cr Disbursed`, icon:<Coins size={14}/>, col:T.tealMid, bar:true },
          { label:'Escalating Warnings', val:slaBreaches.filter(s=>s.status==='escalated'||s.status==='active').length, sub:'Required triage ASAP', icon:<ShieldAlert size={14}/>, col:'#dc2626' },
          { label:'Response KPI', val:'2.8h', sub:'Target 4.0h', icon:<Clock size={14}/>, col:T.tealMid },
          { label:'Sector Load', val:'82%', sub:'Peak work hour', icon:<Users size={14}/>, col:'#7c3aed' },
        ].map((k,i) => (
          <div key={i} className="rounded-2xl p-4 flex flex-col justify-between" style={card}>
            <div className="flex justify-between items-start mb-3">
              <span className="text-[9px] font-bold uppercase tracking-wide" style={{ color:'rgba(13,30,27,0.45)' }}>{k.label}</span>
              <span style={{ color:k.col }}>{k.icon}</span>
            </div>
            <div className="text-[26px] font-black leading-none font-mono mb-1" style={{ color:k.col, fontFamily:"'Barlow Condensed',sans-serif" }}>{k.val}</div>
            {k.bar && <div className="w-full h-1.5 rounded-full mb-1" style={{ background:'#EAE5D6', overflow:'hidden' }}><div className="h-full rounded-full" style={{ width:'74%', background:T.tealMid }} /></div>}
            <div className="text-[9px] font-semibold flex items-center gap-0.5" style={{ color: k.trend==='down' ? '#16a34a' : k.trend==='up' ? '#dc2626' : 'rgba(13,30,27,0.4)' }}>
              {k.trend==='down' && <TrendingDown size={10}/>}{k.trend==='up' && <TrendingUp size={10}/>}{k.sub}
            </div>
          </div>
        ))}
      </div>

      {/* ── FILTERS ────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between p-4 rounded-2xl" style={card}>
        <div className="flex flex-wrap gap-2 items-center w-full sm:w-auto">
          <div className="flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider mr-1" style={{ color:'rgba(13,30,27,0.5)', fontFamily:'monospace' }}>
            <ListFilter size={13} /> Filter:
          </div>
          <div className="flex rounded-lg overflow-hidden border" style={{ borderColor:'rgba(13,30,27,0.12)', background:T.creamDark }}>
            {['all','critical','high','medium'].map(s => (
              <button key={s} onClick={() => setFilterSeverity(s)} className="text-[10px] font-black uppercase px-2.5 py-1.5 transition-all cursor-pointer capitalize" style={{ background: sevSel(s)?T.teal:'transparent', color: sevSel(s)?T.yellow:'rgba(13,30,27,0.5)', fontFamily:"'Barlow Condensed',sans-serif" }}>{s}</button>
            ))}
          </div>
          <div className="flex rounded-lg overflow-hidden border" style={{ borderColor:'rgba(13,30,27,0.12)', background:T.creamDark }}>
            {['all','unassigned','in-progress','completed'].map(s => (
              <button key={s} onClick={() => setFilterStatus(s)} className="text-[10px] font-black uppercase px-2.5 py-1.5 transition-all cursor-pointer capitalize" style={{ background: stSel(s)?T.teal:'transparent', color: stSel(s)?T.yellow:'rgba(13,30,27,0.5)', fontFamily:"'Barlow Condensed',sans-serif" }}>
                {s==='in-progress'?'Active':s}
              </button>
            ))}
          </div>
        </div>
        <div className="relative w-full sm:w-72">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color:'rgba(13,30,27,0.35)' }} />
          <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search by ID, title, road..." style={{ ...inp, paddingLeft:'36px' }} />
        </div>
      </div>

      {/* ── MAP + INSPECTOR ─────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">
        <div className="lg:col-span-3 h-[450px] rounded-2xl overflow-hidden relative flex flex-col" style={{ ...card, padding:0 }}>
          <div className="flex items-center justify-between px-4 py-3 border-b shrink-0" style={{ borderColor:'rgba(13,30,27,0.08)' }}>
            <span className="text-[9px] font-black uppercase tracking-widest" style={{ color:'rgba(13,30,27,0.4)', fontFamily:'monospace' }}>Digital Blueprint Vector Engine</span>
            <span style={badge(T.tealMid,'rgba(21,107,82,0.1)')}>
              <span className="w-1.5 h-1.5 rounded-full animate-ping bg-green-600 inline-block" />GIS SYNCHRONIZED
            </span>
          </div>
          <div className="flex-1 min-h-0 p-2">
            <InteractiveMap className="rounded-xl" hazards={filteredHazards} contracts={contracts} activeView="hazard" selectedHazardId={selectedHazard?.id} onSelectHazard={h => setSelectedHazard(h)} />
          </div>
        </div>

        {/* Inspector */}
        <div className="lg:col-span-1 rounded-2xl p-5 flex flex-col" style={card}>
          {selectedHazard ? (
            <div className="space-y-4 flex-1 flex flex-col">
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-black uppercase px-2 py-1 rounded" style={{ ...(SEV[selectedHazard.severity]||SEV.medium), color: SEV[selectedHazard.severity]?.text, background: SEV[selectedHazard.severity]?.bg }}>
                  {selectedHazard.severity} Priority
                </span>
                <span className="text-[9px] font-black uppercase px-2 py-1 rounded" style={{ color: ST[selectedHazard.status]?.text, background: ST[selectedHazard.status]?.bg }}>
                  {selectedHazard.status}
                </span>
              </div>
              <div>
                <h3 className="text-base font-black leading-snug mb-0.5" style={{ color:T.teal, fontFamily:"'Barlow Condensed',sans-serif" }}>{selectedHazard.title}</h3>
                <p className="text-[10px] font-mono" style={{ color:'rgba(13,30,27,0.45)' }}>{selectedHazard.id} | {selectedHazard.location}</p>
              </div>
              <div className="rounded-xl p-3 space-y-2" style={{ background:T.creamDark }}>
                <div>
                  <span className="text-[8px] font-black uppercase tracking-widest block mb-0.5" style={{ color:'rgba(13,30,27,0.4)' }}>Anomaly Diagnosis</span>
                  <p className="text-xs leading-relaxed" style={{ color:T.textDark }}>{selectedHazard.description}</p>
                </div>
                <div className="grid grid-cols-2 gap-2 pt-2 border-t" style={{ borderColor:'rgba(13,30,27,0.08)' }}>
                  <div>
                    <span className="text-[8px] font-black uppercase block" style={{ color:'rgba(13,30,27,0.4)' }}>Category</span>
                    <span className="text-[10px] font-bold" style={{ color:T.tealMid }}>{selectedHazard.category||'Unclassified'}</span>
                  </div>
                  <div>
                    <span className="text-[8px] font-black uppercase block" style={{ color:'rgba(13,30,27,0.4)' }}>Reporter</span>
                    <span className="text-[10px] font-mono truncate block" style={{ color:T.textDark }}>{selectedHazard.reporter}</span>
                  </div>
                </div>
              </div>
              {selectedHazard.contractor ? (
                <div className="flex items-center gap-2.5 p-3 rounded-xl" style={{ background:'rgba(21,107,82,0.08)', border:'1px solid rgba(21,107,82,0.2)' }}>
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black" style={{ background:T.tealMid, color:'#fff' }}>ACT</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold truncate" style={{ color:T.teal }}>{selectedHazard.contractor}</p>
                    <p className="text-[9px] font-mono" style={{ color:'rgba(13,30,27,0.4)' }}>Completion: {selectedHazard.completionPercent}%</p>
                  </div>
                  <CheckCircle2 size={14} style={{ color:T.tealMid }} />
                </div>
              ) : (
                <div className="p-3 rounded-xl text-center" style={{ background:'#fee2e2', border:'1px solid #fca5a5' }}>
                  <p className="text-xs font-bold" style={{ color:'#dc2626' }}>Unassigned Pipeline</p>
                  <p className="text-[9px] mt-0.5" style={{ color:'rgba(220,38,38,0.7)' }}>SLA clock running. Immediate override required.</p>
                </div>
              )}
              <div className="flex items-center gap-2 p-3 rounded-xl" style={{ background:'#fef2f2', border:'1px solid #fecaca' }}>
                <Clock size={14} className="animate-pulse" style={{ color:'#dc2626' }} />
                <div>
                  <div className="text-sm font-mono font-black" style={{ color:'#dc2626' }}>{selectedHazard.timeRemaining||formatSeconds(timeRemainingSeconds)}</div>
                  <p className="text-[8px]" style={{ color:'rgba(220,38,38,0.7)' }}>Contractual override threshold</p>
                </div>
              </div>
              <div className="space-y-2 pt-2 mt-auto">
                <button onClick={() => onModifyHazard(selectedHazard.id,{ status:'in-progress', contractor:'BuildFast Pvt. Ltd.', completionPercent:5, timeRemaining:"01:45:00" })} className="w-full py-2.5 rounded-xl text-sm font-black uppercase tracking-wider cursor-pointer transition-all hover:scale-[1.01]" style={{ background:T.teal, color:T.yellow, fontFamily:"'Barlow Condensed',sans-serif" }}>
                  Override & Assign BuildFast
                </button>
                <button onClick={() => onModifyHazard(selectedHazard.id,{ status:'completed', completionPercent:100 })} className="w-full py-2 rounded-xl text-xs font-bold cursor-pointer transition-all" style={{ border:`1px solid rgba(13,30,27,0.15)`, color:'rgba(13,30,27,0.6)' }}>
                  Mark Complete (Field Clear)
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-16 text-sm font-mono" style={{ color:'rgba(13,30,27,0.35)' }}>Select a road node on the map to inspect.</div>
          )}
        </div>
      </div>

      {/* ── SLA BREACH + CONTRACTOR MONITORS ────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="rounded-2xl p-5" style={card}>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-black uppercase flex items-center gap-2" style={{ fontFamily:"'Barlow Condensed',sans-serif", color:T.teal }}>
              <ShieldAlert size={16} style={{ color:'#dc2626' }} />SLA Compliance Alerts
            </h3>
            <span style={badge('#dc2626','#fee2e2')}>2 Escalated</span>
          </div>
          <div className="space-y-3">
            {slaBreaches.map(alert => (
              <div key={alert.id} className="flex gap-3 p-4 rounded-xl border" style={{ background:T.creamDark, borderColor:'rgba(13,30,27,0.08)' }}>
                <div className="w-1 rounded-full shrink-0" style={{ background: alert.status==='escalated'?'#dc2626':'#d97706', animation: alert.status==='escalated'?'pulse 1.5s infinite':'' }} />
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-1">
                    <h4 className="text-xs font-black truncate" style={{ color:T.teal }}>{alert.title}</h4>
                    <span className="text-[9px] font-black ml-2 shrink-0 px-2 py-0.5 rounded" style={{ color:'#dc2626', background:'#fee2e2', fontFamily:'monospace' }}>{alert.lateness}</span>
                  </div>
                  <p className="text-[11px] leading-relaxed mb-3" style={{ color:'rgba(13,30,27,0.55)' }}>{alert.description}</p>
                  <div className="flex gap-2">
                    <button onClick={() => onUpdateSLABreach(alert.id,'escalate')} className={`text-[10px] font-black uppercase px-3 py-1.5 rounded-lg transition-all cursor-pointer ${alert.status==='escalated'?'opacity-40 pointer-events-none':''}`} style={{ background:T.teal, color:T.yellow, fontFamily:"'Barlow Condensed',sans-serif" }}>
                      {alert.status==='escalated'?'Escalated':'Escalate Severity'}
                    </button>
                    <button onClick={() => onUpdateSLABreach(alert.id,'re-assign')} className="text-[10px] font-bold uppercase px-3 py-1.5 rounded-lg border cursor-pointer transition-all" style={{ borderColor:'rgba(13,30,27,0.15)', color:'rgba(13,30,27,0.6)' }}>
                      Re-assign
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl p-5" style={card}>
          <h3 className="text-lg font-black uppercase flex items-center gap-2 mb-4" style={{ fontFamily:"'Barlow Condensed',sans-serif", color:T.teal }}>
            <Users size={16} style={{ color:T.tealMid }} />Active Contractor SLA Monitors
          </h3>
          <div className="space-y-3">
            {contractors.map(c => {
              const statusCol = c.status==='optimal'?T.tealMid:c.status==='warning'?'#d97706':'#dc2626';
              const statusBg = c.status==='optimal'?'rgba(21,107,82,0.1)':c.status==='warning'?'#fef3c7':'#fee2e2';
              return (
                <div key={c.name} className="p-4 rounded-xl" style={{ background:T.creamDark, border:'1px solid rgba(13,30,27,0.06)' }}>
                  <div className="flex justify-between items-center mb-2">
                    <div>
                      <span className="text-sm font-black" style={{ color:T.teal, fontFamily:"'Barlow Condensed',sans-serif" }}>{c.name}</span>
                      <span className="text-[9px] font-mono ml-2" style={{ color:'rgba(13,30,27,0.4)' }}>({c.responseTime} response)</span>
                    </div>
                    <span className="text-[8.5px] font-black uppercase px-2 py-0.5 rounded-full" style={{ color:statusCol, background:statusBg }}>{c.status}</span>
                  </div>
                  <div className="h-1.5 rounded-full overflow-hidden mb-1.5" style={{ background:'rgba(13,30,27,0.1)' }}>
                    <div className="h-full rounded-full transition-all" style={{ width:`${c.successRate}%`, background:statusCol }} />
                  </div>
                  <div className="flex justify-between text-[9px] font-mono" style={{ color:'rgba(13,30,27,0.45)' }}>
                    <span>{c.activeJobs} Parallel Jobs</span>
                    <span className="font-bold" style={{ color:T.teal }}>{c.successRate}% on SLA</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── EDGE AI CAMERA FEEDS ────────────────────────────── */}
      <div className="rounded-2xl p-5" style={card}>
        <div className="flex justify-between items-center mb-5">
          <h3 className="text-lg font-black uppercase flex items-center gap-2" style={{ fontFamily:"'Barlow Condensed',sans-serif", color:T.teal }}>
            <Sparkles size={16} style={{ color:T.tealMid }} />Edge AI — Live Camera Feed Analysis
          </h3>
          <span style={badge('#dc2626','#fee2e2')}>
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping inline-block" />4 FEEDS ACTIVE
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {camFeeds.map((cam,i) => {
            const cc = cam.severity==='critical'?'#dc2626':cam.severity==='high'?'#d97706':cam.severity==='medium'?'#7c3aed':'#16a34a';
            return (
              <div key={cam.id} className="rounded-2xl overflow-hidden" style={{ border:'1px solid rgba(13,30,27,0.1)' }}>
                <div className="relative h-36 overflow-hidden" style={{ background:'linear-gradient(135deg,#0a1a12,#0d2018)' }}>
                  {/* Road graphic */}
                  <div className="absolute inset-0 opacity-30">
                    <div className="absolute h-[2px] left-0 right-0" style={{ top:'45%', background:'rgba(200,212,0,0.4)' }} />
                    <div className="absolute h-[2px] left-0 right-0" style={{ top:'55%', background:'rgba(200,212,0,0.4)' }} />
                  </div>
                  {/* Scanline */}
                  <div className="absolute left-0 right-0 h-[2px]" style={{ background:'linear-gradient(90deg,transparent,#C8D400,transparent)', opacity:0.7, animation:`scanline ${2+i*0.5}s ease-in-out infinite`, top:0 }} />
                  {/* Bounding box */}
                  {cam.bbox && (
                    <div className="absolute rounded flex items-end justify-start p-1" style={{ top:'22%', left:'18%', right:'18%', bottom:'18%', border:`2px dashed ${cc}` }}>
                      <span className="text-[8px] font-mono font-black px-1 rounded" style={{ background:cc, color:'#fff' }}>{cam.detection} — {cam.confidence}%</span>
                    </div>
                  )}
                  {/* Crosshair */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 rounded-full" style={{ border:'1px solid rgba(200,212,0,0.3)' }} />
                  <div className="absolute top-1/2 left-0 right-0 h-px" style={{ background:'rgba(200,212,0,0.1)' }} />
                  {/* ID */}
                  <div className="absolute top-2 left-2 text-[8px] font-mono font-black px-1.5 py-0.5 rounded" style={{ color:'#C8D400', background:'rgba(7,46,36,0.7)' }}>{cam.id} · REC</div>
                  <div className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                </div>
                <div className="p-3" style={{ background:T.creamDark }}>
                  <div className="text-[10px] font-bold truncate mb-1" style={{ color:T.teal }}>{cam.location}</div>
                  <div className="flex justify-between items-center">
                    <span className="text-[9px] font-black uppercase" style={{ color: cam.severity==='clear'?T.tealMid:cc, fontFamily:'monospace' }}>{cam.detection}</span>
                    {cam.confidence>0 && <span className="text-[9px] font-mono font-black" style={{ color:cc }}>{cam.confidence}%</span>}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── HAZARD LIST ─────────────────────────────────────── */}
      <div className="rounded-2xl p-5" style={card}>
        <h3 className="text-lg font-black uppercase mb-4 flex items-center gap-2" style={{ fontFamily:"'Barlow Condensed',sans-serif", color:T.teal }}>
          <AlertTriangle size={16} style={{ color:'#d97706' }} />Active Hazard Queue ({filteredHazards.length})
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b" style={{ borderColor:'rgba(13,30,27,0.1)' }}>
                {['ID','Title','Location','Severity','Status','Contractor','Completion','Actions'].map(h => (
                  <th key={h} className="text-left py-2 px-3 text-[9px] font-black uppercase tracking-wider" style={{ color:'rgba(13,30,27,0.4)', fontFamily:'monospace' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredHazards.map(h => (
                <tr key={h.id} className="border-b transition-all cursor-pointer" style={{ borderColor:'rgba(13,30,27,0.06)', background: selectedHazard?.id===h.id?'rgba(200,212,0,0.08)':'transparent' }} onClick={() => setSelectedHazard(h)}>
                  <td className="py-3 px-3 text-[10px] font-mono font-bold" style={{ color:T.tealMid }}>{h.id}</td>
                  <td className="py-3 px-3 text-xs font-bold" style={{ color:T.teal }}>{h.title}</td>
                  <td className="py-3 px-3 text-[10px]" style={{ color:'rgba(13,30,27,0.55)', maxWidth:'120px' }}><span className="truncate block">{h.location}</span></td>
                  <td className="py-3 px-3">
                    <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded" style={{ color:SEV[h.severity]?.text, background:SEV[h.severity]?.bg }}>{h.severity}</span>
                  </td>
                  <td className="py-3 px-3">
                    <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded" style={{ color:ST[h.status]?.text, background:ST[h.status]?.bg }}>{h.status}</span>
                  </td>
                  <td className="py-3 px-3 text-[10px] font-mono" style={{ color:'rgba(13,30,27,0.5)', maxWidth:'100px' }}><span className="truncate block">{h.contractor||'—'}</span></td>
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-16 rounded-full overflow-hidden" style={{ background:'#EAE5D6' }}>
                        <div className="h-full rounded-full" style={{ width:`${h.completionPercent||0}%`, background:T.tealMid }} />
                      </div>
                      <span className="text-[9px] font-mono" style={{ color:'rgba(13,30,27,0.5)' }}>{h.completionPercent||0}%</span>
                    </div>
                  </td>
                  <td className="py-3 px-3">
                    <button onClick={e=>{e.stopPropagation();onModifyHazard(h.id,{status:'in-progress',contractor:'BuildFast Pvt. Ltd.',completionPercent:5})}} className="text-[9px] font-black uppercase px-2.5 py-1.5 rounded-lg cursor-pointer transition-all" style={{ background:T.teal, color:T.yellow, fontFamily:"'Barlow Condensed',sans-serif" }}>
                      Assign
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── DISPATCH MODAL ──────────────────────────────────── */}
      {reportModalOpen && (
        <div className="aegis-modal-overlay fixed inset-0 flex items-center justify-center p-4" style={{ background:'rgba(7,46,36,0.75)', backdropFilter:'blur(12px)' }}>
          <div className="w-full max-w-lg rounded-2xl overflow-hidden animate-fadeIn shadow-2xl" style={{ background:T.cream }}>
            <div className="p-5 border-b flex justify-between items-center" style={{ background:T.teal, borderColor:'rgba(255,255,255,0.1)' }}>
              <h3 className="text-xl font-black uppercase text-white" style={{ fontFamily:"'Barlow Condensed',sans-serif" }}>Dispatch New Patrol</h3>
              <button onClick={() => setReportModalOpen(false)} className="text-white/60 hover:text-white text-xl font-light cursor-pointer">✕</button>
            </div>
            <form onSubmit={handleCreateReportSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-[9px] font-black uppercase tracking-wider mb-1.5" style={{ color:'rgba(13,30,27,0.5)' }}>Incident Title *</label>
                <input value={newTitle} onChange={e=>setNewTitle(e.target.value)} placeholder="e.g. Critical Pothole on NH65" required style={inp} />
              </div>
              <div>
                <label className="block text-[9px] font-black uppercase tracking-wider mb-1.5" style={{ color:'rgba(13,30,27,0.5)' }}>Location *</label>
                <input value={newLocation} onChange={e=>setNewLocation(e.target.value)} placeholder="e.g. NH65 Mangalagiri, Sector 4" required style={inp} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[9px] font-black uppercase tracking-wider mb-1.5" style={{ color:'rgba(13,30,27,0.5)' }}>Severity</label>
                  <select value={newSeverity} onChange={e=>setNewSeverity(e.target.value)} style={inp}>
                    <option value="critical">Critical</option><option value="high">High</option><option value="medium">Medium</option><option value="low">Low</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[9px] font-black uppercase tracking-wider mb-1.5" style={{ color:'rgba(13,30,27,0.5)' }}>Category</label>
                  <select value={newCategory} onChange={e=>setNewCategory(e.target.value)} style={inp}>
                    <option>Pavement Failure</option><option>Drainage Issue</option><option>Guardrail Damage</option><option>Pothole</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-[9px] font-black uppercase tracking-wider mb-1.5" style={{ color:'rgba(13,30,27,0.5)' }}>Description</label>
                <textarea value={newDesc} onChange={e=>setNewDesc(e.target.value)} rows="2" style={{ ...inp, resize:'none' }} placeholder="Additional patrol notes..." />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" className="flex-1 py-3 rounded-xl text-sm font-black uppercase tracking-wider cursor-pointer transition-all hover:scale-[1.01]" style={{ background:T.teal, color:T.yellow, fontFamily:"'Barlow Condensed',sans-serif" }}>Create Dispatch →</button>
                <button type="button" onClick={() => setReportModalOpen(false)} className="px-6 py-3 rounded-xl text-sm font-bold cursor-pointer" style={{ border:`1px solid rgba(13,30,27,0.15)`, color:'rgba(13,30,27,0.6)' }}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
