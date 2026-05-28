import React, { useState } from 'react';
import { 
  AlertTriangle, Filter, Search, ShieldAlert, CheckCircle2, MapPin, 
  ArrowRight, ShieldCheck, Calendar, Activity, RefreshCw 
} from 'lucide-react';
import InteractiveMap from './InteractiveMap';

export default function HazardExplorer({ 
  hazards = [], 
  contracts = [],
  onReportHazard,
  onModifyHazard,
  currentUser
}) {
  const [filterSeverity, setFilterSeverity] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [selectedHazardId, setSelectedHazardId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Settle filtered set
  const filtered = hazards.filter(h => {
    const severityMatch = filterSeverity === 'ALL' || h.severity === filterSeverity;
    const statusMatch = filterStatus === 'ALL' || h.status === filterStatus;
    const searchMatch = searchQuery === '' || 
      h.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      h.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      h.id.toLowerCase().includes(searchQuery.toLowerCase());
    return severityMatch && statusMatch && searchMatch;
  });

  const selectedHazard = hazards.find(h => h.id === selectedHazardId) || hazards[0];

  return (
    <div id="hazard-explorer-container" className="space-y-6 font-sans text-slate-100">
      {/* Visual Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-3 border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-1.5">
            {currentUser?.role === 'government' ? 'Road Safety Incident Map' : 'Public Transparency Map'}
            <span className="text-xs bg-[#2ea014]/25 text-[#2ea014] border border-[#2ea014]/65 font-normal px-2 py-0.5 rounded tracking-widest font-mono">
              {currentUser?.role === 'government' ? 'CIVIC INTELLIGENCE' : 'LIVE FEED'}
            </span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Browse verified road failures, active repair assignments, and real-time civil surveillance updates.
          </p>
        </div>

        {/* Instant Search input */}
        <div className="relative w-full md:w-64">
          <input 
            type="text"
            placeholder="Search sector, ID, location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 text-xs p-2.5 pl-8 rounded text-white focus:outline-none focus:border-teal-400"
          />
          <Search size={14} className="absolute left-2.5 top-3.5 text-slate-500" />
        </div>
      </div>

      {/* Action and Filter Controls Row */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900 p-3.5 rounded-lg border border-slate-800/80">
        <div className="flex flex-wrap items-center gap-4 text-xs font-mono">
          <div className="flex items-center gap-2">
            <span className="text-slate-500 uppercase">Severity Filter:</span>
            <div className="flex bg-slate-950 p-0.5 rounded border border-slate-800">
              {['ALL', 'critical', 'high', 'medium'].map(sev => (
                <button
                  key={sev}
                  onClick={() => setFilterSeverity(sev)}
                  className={`px-2 py-1 rounded text-[10px] uppercase font-bold transition-all cursor-pointer ${
                    filterSeverity === sev ? 'bg-[#2ea014] text-white shadow font-extrabold' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {sev}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-500 uppercase">State:</span>
            <div className="flex bg-slate-950 p-0.5 rounded border border-slate-800">
              {['ALL', 'unassigned', 'in-progress', 'completed'].map(st => (
                <button
                  key={st}
                  onClick={() => setFilterStatus(st)}
                  className={`px-2.5 py-1 rounded text-[10px] uppercase font-bold transition-all cursor-pointer ${
                    filterStatus === st ? 'bg-[#2ea014] text-white shadow font-extrabold' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="text-xs font-mono text-slate-400">
          Showing <strong className="text-white">{filtered.length}</strong> of {hazards.length} identified nodes.
        </div>
      </div>

      {/* Map, Sidebar and detail Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left GIS Vector Map taking up 3 cols */}
        <div className="lg:col-span-3 h-[450px] min-h-[450px] bg-slate-950 border border-slate-800 rounded-xl overflow-hidden flex flex-col">
          <div className="flex-1 min-h-0 p-2">
            <InteractiveMap
              className="rounded-lg"
              hazards={filtered}
              contracts={contracts}
              activeView="hazard"
              selectedHazardId={selectedHazard?.id}
              onSelectHazard={(h) => setSelectedHazardId(h.id)}
            />
          </div>
        </div>

        {/* Right Active Incident Feed List taking up 1 col */}
        <div className="lg:col-span-1 flex flex-col h-[450px] bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
          <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-950">
            <h3 className="text-xs font-bold uppercase tracking-widest text-[#2ea014]">Anomalies Feed</h3>
            <span className="text-[10px] text-slate-550 font-mono font-bold">LATEST RECORDS</span>
          </div>

          {/* Active Card Stream */}
          <div className="flex-1 overflow-y-auto p-3.5 space-y-2.5 scrollbar-thin bg-slate-950/20">
            {filtered.length > 0 ? (
              filtered.map(h => {
                let pillCol = 'bg-teal-950 text-teal-400 border-teal-905';
                if (h.severity === 'critical') pillCol = 'bg-rose-950 text-rose-400 border-rose-909';
                else if (h.severity === 'high') pillCol = 'bg-orange-950 text-orange-400 border-orange-900';
                
                const isSelected = h.id === selectedHazard?.id;

                return (
                  <button
                    key={h.id}
                    onClick={() => setSelectedHazardId(h.id)}
                    className={`w-full text-left p-3 rounded-lg border transition-all relative flex flex-col justify-between ${
                      isSelected 
                        ? 'bg-slate-900 border-teal-500 shadow ring-1 ring-teal-500/20' 
                        : 'bg-slate-900/60 border-slate-800/80 hover:bg-slate-900'
                    }`}
                  >
                    <div className="flex justify-between items-start w-full gap-2 text-[10px]">
                      <span className="text-[#2ea014] font-mono leading-none">{h.id}</span>
                      <span className="text-slate-500 font-mono leading-none">{h.reportedTimeAgo}</span>
                    </div>
                    <h4 className="text-xs font-bold text-slate-200 mt-2 truncate w-full">{h.title}</h4>
                    <p className="text-[11px] text-slate-400 mt-1 truncate w-full">{h.location}</p>
                    <div className="flex justify-between items-center w-full mt-3 pt-2 border-t border-slate-950 font-mono text-[9px]">
                      <span className={`px-1.5 py-0.25 rounded uppercase border text-[8px] font-bold ${pillCol}`}>{h.severity}</span>
                      <span className={`uppercase font-bold ${h.status === 'completed' ? 'text-emerald-400' : 'text-slate-450'}`}>{h.status}</span>
                    </div>
                  </button>
                );
              })
            ) : (
              <div className="text-center py-20 text-slate-500 font-mono text-xs">
                No matching safety incidents verified under these constraints.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Selected Detailed Metadata Overlay Panel */}
      {selectedHazard && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg relative overflow-hidden">
          {/* Subtle colored accent ring */}
          <div className={`absolute top-0 left-0 w-full h-1 ${selectedHazard.severity === 'critical' ? 'bg-rose-600' : 'bg-teal-500'}`} />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Cell 1: Incident Identity */}
            <div className="space-y-3">
              <div>
                <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block font-bold">GRID ANOMALY</span>
                <h3 className="text-xl font-bold text-white mt-1">{selectedHazard.title}</h3>
                <p className="text-xs text-slate-400 font-mono mt-1 flex items-center gap-1.5">
                  <MapPin size={12} className="text-[#2ea014]" /> {selectedHazard.location}
                </p>
              </div>

              <div className="text-xs space-y-1 bg-slate-950 p-3 rounded border border-slate-800 font-mono">
                <div className="flex justify-between">
                  <span className="text-slate-500">SECTOR GRID COORDS:</span>
                  <span className="text-slate-300">X:{selectedHazard.coordinates.x}% Y:{selectedHazard.coordinates.y}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">DIGITAL REPORTER:</span>
                  <span className="text-slate-300">{selectedHazard.reporter}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">VERIFICATION:</span>
                  <span className="text-emerald-400 font-bold">VERIFIED LEVEL-4</span>
                </div>
              </div>
            </div>

            {/* Cell 2: Photographic visual & diagnostics */}
            <div className="space-y-3">
              <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block font-bold">SENSORY FIELD EVIDENCE</span>
              <div className="relative h-24 rounded-lg bg-slate-950 border border-slate-800 overflow-hidden flex items-center justify-center">
                {selectedHazard.photoUrl ? (
                  <img 
                    src={selectedHazard.photoUrl} 
                    alt={selectedHazard.title} 
                    className="w-full h-full object-cover opacity-80"
                  />
                ) : (
                  <span className="text-slate-500 text-[10px] font-mono">No Image Feed Found</span>
                )}
                {/* Floating GPS coordinates overlay */}
                <div className="absolute bottom-1 right-2 bg-slate-950/80 text-[8px] font-mono text-teal-400 px-1 py-0.5 rounded border border-slate-800">
                  LAT 12.98 / LON 80.24
                </div>
              </div>
              <p className="text-xs text-slate-400 italic">"{selectedHazard.description}"</p>
            </div>

            {/* Cell 3: Resolution Status slider & actions */}
            <div className="space-y-3 flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block font-bold">CIVIC TASK FORCE INTEGRATION</span>
                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800/80 mt-1.5 text-xs font-mono flex items-center justify-between">
                  <div>
                    <span className="text-slate-500 block">ASSIGNED TEAMS</span>
                    <span className="text-slate-200 font-bold mt-1 block">{selectedHazard.contractor || "UNASSIGNED DISPATCH"}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">SLA TERM limit</span>
                    <span className="text-rose-400 font-bold block mt-1">{selectedHazard.timeRemaining || "02:44:12"}</span>
                  </div>
                </div>
              </div>

              {!selectedHazard.contractor ? (
                currentUser?.role === 'government' ? (
                  <button 
                    onClick={() => onModifyHazard(selectedHazard.id, { 
                      status: 'in-progress', 
                      contractor: 'BuildFast Pvt. Ltd.', 
                      completionPercent: 10,
                      timeRemaining: "01:20:00"
                    })}
                    className="w-full text-xs font-black bg-[#2ea014] hover:bg-[#258210] text-white py-2.5 rounded transition-colors text-center"
                  >
                    Instantly Dispatch Emergency Crew
                  </button>
                ) : (
                  <div className="flex items-center gap-1.5 p-2 bg-slate-900/40 border border-slate-800 rounded text-[11px] font-sans text-slate-400">
                    <AlertTriangle size={16} />
                    <span>Awaiting automatic government dispatch assignment.</span>
                  </div>
                )
              ) : (
                <div className="flex items-center gap-1.5 p-2 bg-teal-950/40 border border-teal-900/60 rounded text-[11px] font-sans text-teal-400">
                  <ShieldCheck size={16} />
                  <span>Resolution in progress under {selectedHazard.contractor} ({selectedHazard.completionPercent}% done).</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
