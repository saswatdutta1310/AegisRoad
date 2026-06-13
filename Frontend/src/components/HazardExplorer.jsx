import React, { useState } from 'react';
import { AlertTriangle, Search, ShieldAlert, CheckCircle2, MapPin, ShieldCheck } from 'lucide-react';
import InteractiveMap from './InteractiveMap';

const T = { teal:'#072E24', tealMid:'#156B52', yellow:'#C8D400', cream:'#F4F0E6', creamDark:'#EAE5D6', textDark:'#0D1E1B' };
const card = { background:'#FFFFFF', border:'1px solid rgba(13,30,27,0.1)', borderRadius:'16px' };
const SEV = { critical:{ bg:'#fee2e2', text:'#dc2626' }, high:{ bg:'#ffedd5', text:'#ea580c' }, medium:{ bg:'#fef3c7', text:'#d97706' }, low:{ bg:'#dcfce7', text:'#16a34a' } };
const ST = { unassigned:{ bg:'#fee2e2', text:'#dc2626' }, 'in-progress':{ bg:'#dbeafe', text:'#2563eb' }, completed:{ bg:'#dcfce7', text:'#16a34a' } };

export default function HazardExplorer({ hazards = [], contracts = [], onReportHazard, onModifyHazard, currentUser }) {
  const [filterSeverity, setFilterSeverity] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [selectedHazardId, setSelectedHazardId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = hazards.filter(h => {
    const ms = filterSeverity==='ALL'||h.severity===filterSeverity;
    const mt = filterStatus==='ALL'||h.status===filterStatus;
    const mq = !searchQuery||[h.title,h.location,h.id].some(v=>v?.toLowerCase().includes(searchQuery.toLowerCase()));
    return ms && mt && mq;
  });

  const selectedHazard = hazards.find(h=>h.id===selectedHazardId)||hazards[0];

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-3 pb-5 border-b" style={{ borderColor:'rgba(13,30,27,0.12)' }}>
        <div>
          <h1 className="text-[clamp(28px,4vw,44px)] font-black uppercase leading-tight flex items-center gap-2" style={{ fontFamily:"'Barlow Condensed',sans-serif", color:T.teal }}>
            {currentUser?.role==='government'?'Road Safety Incident Map':'Public Transparency Map'}
            <span className="text-[10px] px-2 py-0.5 rounded font-black" style={{ background:T.yellow, color:T.teal, fontFamily:'monospace' }}>
              {currentUser?.role==='government'?'CIVIC INTELLIGENCE':'LIVE FEED'}
            </span>
          </h1>
          <p className="text-sm mt-1" style={{ color:'rgba(13,30,27,0.5)' }}>Browse verified road failures, active repair assignments, and real-time civil surveillance updates.</p>
        </div>
        <div className="relative w-full md:w-64">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color:'rgba(13,30,27,0.35)' }} />
          <input type="text" placeholder="Search sector, ID, location..." value={searchQuery} onChange={e=>setSearchQuery(e.target.value)} className="text-xs pl-9 pr-3 py-2.5 rounded-xl outline-none w-full" style={{ background:T.creamDark, border:'1px solid rgba(13,30,27,0.15)', color:T.textDark }} />
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl" style={{ background:'#FFFFFF', border:'1px solid rgba(13,30,27,0.1)' }}>
        <div className="flex flex-wrap items-center gap-4 text-xs font-mono">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-wider" style={{ color:'rgba(13,30,27,0.4)' }}>Severity:</span>
            <div className="flex rounded-xl overflow-hidden border" style={{ borderColor:'rgba(13,30,27,0.12)', background:T.creamDark }}>
              {['ALL','critical','high','medium'].map(s => (
                <button key={s} onClick={()=>setFilterSeverity(s)} className="px-3 py-1.5 text-[10px] font-black uppercase capitalize cursor-pointer transition-all" style={{ background:filterSeverity===s?T.teal:'transparent', color:filterSeverity===s?T.yellow:'rgba(13,30,27,0.5)', fontFamily:"'Barlow Condensed',sans-serif" }}>{s}</button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-wider" style={{ color:'rgba(13,30,27,0.4)' }}>State:</span>
            <div className="flex rounded-xl overflow-hidden border" style={{ borderColor:'rgba(13,30,27,0.12)', background:T.creamDark }}>
              {['ALL','unassigned','in-progress','completed'].map(s => (
                <button key={s} onClick={()=>setFilterStatus(s)} className="px-3 py-1.5 text-[10px] font-black uppercase capitalize cursor-pointer transition-all" style={{ background:filterStatus===s?T.teal:'transparent', color:filterStatus===s?T.yellow:'rgba(13,30,27,0.5)', fontFamily:"'Barlow Condensed',sans-serif" }}>{s==='in-progress'?'Active':s}</button>
              ))}
            </div>
          </div>
        </div>
        <div className="text-xs font-mono font-bold" style={{ color:'rgba(13,30,27,0.4)' }}>
          Showing <strong style={{ color:T.teal }}>{filtered.length}</strong> of {hazards.length} nodes
        </div>
      </div>

      {/* Map + Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">
        <div className="lg:col-span-3 h-[460px] rounded-2xl overflow-hidden flex flex-col" style={card}>
          <div className="flex items-center justify-between px-4 py-3 border-b shrink-0" style={{ borderColor:'rgba(13,30,27,0.08)' }}>
            <span className="text-[9px] font-black uppercase tracking-widest" style={{ color:'rgba(13,30,27,0.4)', fontFamily:'monospace' }}>Live GIS Vector Engine</span>
            <span className="text-[9px] font-black px-2 py-0.5 rounded" style={{ background:'rgba(21,107,82,0.1)', color:T.tealMid, fontFamily:'monospace' }}>
              <span className="w-1.5 h-1.5 rounded-full bg-green-600 animate-ping inline-block mr-1" />GIS LIVE
            </span>
          </div>
          <div className="flex-1 min-h-0 p-2">
            <InteractiveMap className="rounded-xl" hazards={filtered} contracts={contracts} activeView="hazard" selectedHazardId={selectedHazard?.id} onSelectHazard={h=>setSelectedHazardId(h.id)} />
          </div>
        </div>

        {/* Incident feed */}
        <div className="lg:col-span-1 flex flex-col h-[460px] rounded-2xl overflow-hidden" style={card}>
          <div className="px-4 py-3 border-b flex justify-between items-center shrink-0" style={{ background:T.teal, borderColor:'rgba(255,255,255,0.1)' }}>
            <h3 className="text-sm font-black uppercase text-white" style={{ fontFamily:"'Barlow Condensed',sans-serif" }}>Anomalies Feed</h3>
            <span className="text-[9px] font-mono font-bold" style={{ color:'rgba(200,212,0,0.7)' }}>LATEST</span>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-2" style={{ background:T.creamDark }}>
            {filtered.length>0 ? filtered.map(h => (
              <button key={h.id} onClick={()=>setSelectedHazardId(h.id)} className="w-full text-left p-3 rounded-xl transition-all flex flex-col" style={{ background: h.id===selectedHazard?.id?'#FFFFFF':T.cream, border:`1px solid ${h.id===selectedHazard?.id?T.teal:'rgba(13,30,27,0.08)'}`, boxShadow: h.id===selectedHazard?.id?`0 0 0 2px ${T.teal}22`:'' }}>
                <div className="flex justify-between text-[9px] font-mono mb-1">
                  <span className="font-black" style={{ color:T.tealMid }}>{h.id}</span>
                  <span style={{ color:'rgba(13,30,27,0.4)' }}>{h.reportedTimeAgo}</span>
                </div>
                <h4 className="text-xs font-black truncate mb-0.5" style={{ color:T.teal, fontFamily:"'Barlow Condensed',sans-serif" }}>{h.title}</h4>
                <p className="text-[10px] truncate" style={{ color:'rgba(13,30,27,0.5)' }}>{h.location}</p>
                <div className="flex justify-between mt-2 pt-2 border-t" style={{ borderColor:'rgba(13,30,27,0.06)' }}>
                  <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded" style={{ color:SEV[h.severity]?.text, background:SEV[h.severity]?.bg }}>{h.severity}</span>
                  <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded" style={{ color:ST[h.status]?.text, background:ST[h.status]?.bg }}>{h.status}</span>
                </div>
              </button>
            )) : (
              <div className="text-center py-16 text-sm font-mono" style={{ color:'rgba(13,30,27,0.35)' }}>No matching incidents.</div>
            )}
          </div>
        </div>
      </div>

      {/* Selected detail panel */}
      {selectedHazard && (
        <div className="rounded-2xl overflow-hidden shadow-sm animate-fadeIn" style={{ border:'1px solid rgba(13,30,27,0.1)' }}>
          <div className="px-6 py-4 grid grid-cols-1 md:grid-cols-3 gap-6" style={{ background:T.teal }}>
            <div>
              <span className="text-[9px] font-black uppercase tracking-widest block mb-1 font-mono" style={{ color:'rgba(200,212,0,0.6)' }}>GRID ANOMALY</span>
              <h3 className="text-xl font-black uppercase text-white mb-0.5" style={{ fontFamily:"'Barlow Condensed',sans-serif" }}>{selectedHazard.title}</h3>
              <p className="text-xs flex items-center gap-1.5" style={{ color:'rgba(255,255,255,0.55)' }}><MapPin size={11}/>{selectedHazard.location}</p>
            </div>
            <div className="border-t md:border-t-0 md:border-l pt-3 md:pt-0 md:pl-6" style={{ borderColor:'rgba(255,255,255,0.1)' }}>
              <span className="text-[9px] font-black uppercase tracking-widest block mb-2 font-mono" style={{ color:'rgba(200,212,0,0.6)' }}>INCIDENT METADATA</span>
              <div className="space-y-1 text-xs font-mono">
                <div className="flex justify-between"><span style={{ color:'rgba(255,255,255,0.4)' }}>Reporter:</span><span className="text-white font-bold">{selectedHazard.reporter}</span></div>
                <div className="flex justify-between"><span style={{ color:'rgba(255,255,255,0.4)' }}>Coords:</span><span className="text-white font-bold">X:{selectedHazard.coordinates?.x}% Y:{selectedHazard.coordinates?.y}%</span></div>
                <div className="flex justify-between"><span style={{ color:'rgba(255,255,255,0.4)' }}>Verification:</span><span className="font-bold" style={{ color:T.yellow }}>VERIFIED LVL-4</span></div>
              </div>
            </div>
            <div className="border-t md:border-t-0 md:border-l pt-3 md:pt-0 md:pl-6 flex flex-col justify-between" style={{ borderColor:'rgba(255,255,255,0.1)' }}>
              <div>
                <span className="text-[9px] font-black uppercase tracking-widest block mb-2 font-mono" style={{ color:'rgba(200,212,0,0.6)' }}>TASK FORCE</span>
                <div className="flex justify-between text-xs font-mono">
                  <div><span className="block" style={{ color:'rgba(255,255,255,0.4)' }}>Assigned</span><span className="text-white font-bold">{selectedHazard.contractor||'UNASSIGNED'}</span></div>
                  <div className="text-right"><span className="block" style={{ color:'rgba(255,255,255,0.4)' }}>SLA Timer</span><span className="font-bold" style={{ color:'#ff6b6b' }}>{selectedHazard.timeRemaining||'02:44:12'}</span></div>
                </div>
              </div>
              {!selectedHazard.contractor ? (
                currentUser?.role==='government' ? (
                  <button onClick={()=>onModifyHazard(selectedHazard.id,{ status:'in-progress', contractor:'BuildFast Pvt. Ltd.', completionPercent:10, timeRemaining:'01:20:00' })} className="mt-3 w-full py-2 rounded-xl text-xs font-black uppercase tracking-wider cursor-pointer transition-all hover:scale-[1.01]" style={{ background:T.yellow, color:T.teal, fontFamily:"'Barlow Condensed',sans-serif" }}>
                    Dispatch Emergency Crew →
                  </button>
                ) : (
                  <p className="mt-3 text-[10px] flex items-center gap-1.5" style={{ color:'rgba(255,255,255,0.45)' }}><AlertTriangle size={11}/>Awaiting government dispatch.</p>
                )
              ) : (
                <p className="mt-3 text-[10px] flex items-center gap-1.5" style={{ color:'rgba(200,212,0,0.7)' }}><ShieldCheck size={11}/>In progress — {selectedHazard.completionPercent}% done.</p>
              )}
            </div>
          </div>
          {selectedHazard.description && (
            <div className="px-6 py-4" style={{ background:T.creamDark }}>
              <p className="text-sm italic" style={{ color:'rgba(13,30,27,0.55)' }}>"{selectedHazard.description}"</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
