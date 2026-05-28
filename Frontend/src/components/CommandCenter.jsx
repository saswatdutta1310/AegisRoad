import React, { useState, useEffect } from 'react';
import { 
  Building, Map as MapIcon, AlertTriangle, Coins, TrendingUp, TrendingDown, 
  Clock, ShieldAlert, Users, CheckCircle2, AlertCircle, Sparkles, Filter, 
  ChevronRight, ArrowUpRight, Search, ListFilter
} from 'lucide-react';
import { motion } from 'motion/react';
import InteractiveMap from './InteractiveMap';

export default function CommandCenter({
  hazards = [],
  contracts = [],
  contractors = [],
  slaBreaches = [],
  onReportHazard,
  onModifyHazard,
  onUpdateSLABreach
}) {
  const [selectedHazard, setSelectedHazard] = useState(null);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [filterSeverity, setFilterSeverity] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Dispatcher Form State
  const [newTitle, setNewTitle] = useState('');
  const [newLocation, setNewLocation] = useState('');
  const [newSeverity, setNewSeverity] = useState('high');
  const [newCategory, setNewCategory] = useState('Pavement Failure');
  const [newDesc, setNewDesc] = useState('');

  // Default selection
  useEffect(() => {
    if (hazards.length > 0 && !selectedHazard) {
      const activeOrCritical = hazards.find(h => h.id === 'HAZ-9821') || hazards[0];
      setSelectedHazard(activeOrCritical);
    }
  }, [hazards, selectedHazard]);

  // Countdown timer simulation ticking seconds
  const [timeRemainingSeconds, setTimeRemainingSeconds] = useState(6312); // ~01:45:12
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeRemainingSeconds(prev => (prev > 0 ? prev - 1 : 12000));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatSeconds = (ticks) => {
    const hours = Math.floor(ticks / 3600);
    const mins = Math.floor((ticks % 3600) / 60);
    const secs = ticks % 60;
    return [
      String(hours).padStart(2, '0'),
      String(mins).padStart(2, '0'),
      String(secs).padStart(2, '0')
    ].join(':');
  };

  const handleCreateReportSubmit = (e) => {
    e.preventDefault();
    if (!newTitle || !newLocation) return;
    
    onReportHazard({
      title: newTitle,
      location: newLocation,
      severity: newSeverity,
      category: newCategory,
      reporter: "Platform AI Monitor",
      status: "unassigned",
      description: newDesc || "Telemetry triggers point to significant road asphalt structure decay.",
      coordinates: { x: Math.floor(Math.random() * 55) + 20, y: Math.floor(Math.random() * 55) + 20 },
      reportedTimeAgo: "Just now"
    });

    setNewTitle('');
    setNewLocation('');
    setNewSeverity('high');
    setNewCategory('Pavement Failure');
    setNewDesc('');
    setReportModalOpen(false);
  };

  // Filter logic
  const filteredHazards = hazards.filter(h => {
    const matchesSeverity = filterSeverity === 'all' || h.severity === filterSeverity;
    const matchesStatus = filterStatus === 'all' || h.status === filterStatus;
    const matchesKeyword = searchQuery === '' || 
      h.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      h.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      h.location.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSeverity && matchesStatus && matchesKeyword;
  });

  return (
    <div className="space-y-6 font-sans">
      {/* Top Banner Row */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase font-bold tracking-widest bg-red-950/80 text-rose-400 px-2 py-0.5 rounded border border-red-900/60 font-mono">
              SECURE SECTOR 04 FEED
            </span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight mt-1 flex items-center gap-2">
            Command Center 
            <span className="text-xs text-slate-400 font-mono font-medium">(Control Tower View)</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Real-time asphalt health auditing, active incident logging, and contractor accountability monitoring.
          </p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setReportModalOpen(true)}
            className="cursor-pointer bg-amber-500 text-slate-950 text-xs font-bold px-4 py-2.5 rounded hover:bg-amber-450 transition-all flex items-center gap-1.5 shadow-lg shadow-amber-500/10 uppercase tracking-widest font-mono"
          >
            <AlertCircle size={14} />
            Dispatch Patrol
          </button>
        </div>
      </div>

      {/* KPI Stats Grid (Matches Screenshot 3) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {/* Active Hazards */}
        <div className="bg-[#0f172a] border border-slate-800/80 rounded-xl p-4 shadow-xl flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Active Hazards</span>
            <AlertTriangle className="text-rose-500" size={15} />
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-rose-500 font-mono">{hazards.length}</div>
            <div className="flex items-center gap-1 text-[9px] font-semibold text-rose-450 mt-1">
              <TrendingUp size={11} />
              +2 unassigned nodes
            </div>
          </div>
        </div>

        {/* SLA Breach Rate */}
        <div className="bg-[#0f172a] border border-slate-800/80 rounded-xl p-4 shadow-xl flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">SLA Breach Rate</span>
            <ShieldAlert className="text-amber-500" size={15} />
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-amber-500 font-mono">11.4%</div>
            <div className="flex items-center gap-1 text-[9px] font-semibold text-emerald-400 mt-1">
              <TrendingDown size={11} />
              -2.1% under threshold
            </div>
          </div>
        </div>

        {/* Budget Utilisation */}
        <div className="bg-[#0f172a] border border-slate-800/80 rounded-xl p-4 shadow-xl flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Budget Utilization</span>
            <Coins className="text-teal-400" size={15} />
          </div>
          <div className="mt-2.5">
            <div className="text-2xl font-black text-white font-mono">
              {((contracts.reduce((sum, c) => sum + c.amountDisbursed, 0) / contracts.reduce((sum, c) => sum + c.budgetAllocated, 0)) * 100).toFixed(0)}%
            </div>
            <div className="w-full bg-slate-800 h-1 rounded-full mt-2 overflow-hidden">
              <div className="bg-teal-500 h-1 rounded-full" style={{ width: '74%' }}></div>
            </div>
            <div className="text-[8px] text-slate-500 mt-1 font-mono">
              {contracts.reduce((sum, c) => sum + c.amountDisbursed, 0).toFixed(1)}Cr Disbursed
            </div>
          </div>
        </div>

        {/* Pending Escalations */}
        <div className="bg-[#0f172a] border border-slate-800/80 rounded-xl p-4 shadow-xl flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Escalating Warnings</span>
            <ShieldAlert className="text-rose-500" size={15} />
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-rose-500 font-mono">
              {slaBreaches.filter(s => s.status === 'escalated' || s.status === 'active').length}
            </div>
            <div className="text-[9px] text-slate-500 mt-1">Required triage ASAP</div>
          </div>
        </div>

        {/* Avg Response Time */}
        <div className="bg-[#0f172a] border border-slate-800/80 rounded-xl p-4 shadow-xl flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Response KPI</span>
            <Clock className="text-slate-400" size={15} />
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-teal-450 font-mono">2.8h</div>
            <div className="text-[9px] text-[#2dd4bf] font-semibold mt-1">Excellent (Target 4.0h)</div>
          </div>
        </div>

        {/* Contractor Capacity */}
        <div className="bg-[#0f172a] border border-slate-800/80 rounded-xl p-4 shadow-xl flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Sector Load Avg</span>
            <Users className="text-indigo-400" size={15} />
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-indigo-400 font-mono">82%</div>
            <div className="text-[9px] text-indigo-350 font-medium mt-1">Peak work hour detected</div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar for Hazards */}
      <div className="bg-[#0f172a] border border-slate-850 p-4 rounded-xl flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="flex flex-wrap gap-2 items-center w-full sm:w-auto">
          <div className="text-xs text-slate-400 font-mono font-bold flex items-center gap-1.5 mr-2">
            <ListFilter size={14} className="text-slate-500" />
            FILTER INCIDENTS:
          </div>
          
          {/* Severity Option Selector */}
          <div className="flex bg-slate-900 rounded p-0.5 border border-slate-800">
            {['all', 'critical', 'high', 'medium'].map((sev) => (
              <button
                key={sev}
                onClick={() => setFilterSeverity(sev)}
                className={`text-[10px] font-mono font-bold px-2 py-1 rounded capitalize transition-all cursor-pointer ${
                  filterSeverity === sev ? 'bg-slate-800 text-teal-400' : 'text-slate-400 hover:text-white'
                }`}
              >
                {sev}
              </button>
            ))}
          </div>

          {/* Status Option Selector */}
          <div className="flex bg-slate-900 rounded p-0.5 border border-slate-800">
            {['all', 'unassigned', 'in-progress', 'completed'].map((st) => (
              <button
                key={st}
                onClick={() => setFilterStatus(st)}
                className={`text-[10px] font-mono font-bold px-2 py-1 rounded capitalize transition-all cursor-pointer ${
                  filterStatus === st ? 'bg-slate-800 text-teal-400' : 'text-slate-400 hover:text-white'
                }`}
              >
                {st === 'in-progress' ? 'Active' : st}
              </button>
            ))}
          </div>
        </div>

        {/* Search Input Box */}
        <div className="relative w-full sm:w-72">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by ID, title, road..."
            className="w-full bg-slate-900 text-xs text-white pl-9 pr-3 py-2 border border-slate-800 rounded-lg outline-none focus:border-slate-700 placeholder-slate-500 font-mono"
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-slate-500 hover:text-white"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Main split: Map + Sidebar Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Visual Map Frame */}
        <div className="lg:col-span-3 h-[450px] min-h-[450px] bg-[#0c1222]/80 border border-slate-850 rounded-xl overflow-hidden relative flex flex-col shadow-2xl">
          <div className="flex items-center justify-between shrink-0 px-3 py-2 border-b border-slate-900">
            <span className="text-[9px] font-black text-slate-500 font-mono uppercase tracking-widest">
              Digital Blueprint Vector Engine
            </span>
            <div className="flex items-center gap-1.5 text-[8.5px] font-mono text-[#a855f7] bg-purple-950 font-bold px-2 py-0.5 rounded border border-purple-900">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-ping"></span>
              GIS SYNCHRONIZED
            </div>
          </div>
          <div className="flex-1 min-h-0 p-2 pt-0">
            <InteractiveMap
              className="rounded-lg"
              hazards={filteredHazards}
              contracts={contracts}
              activeView="hazard"
              selectedHazardId={selectedHazard?.id}
              onSelectHazard={(h) => setSelectedHazard(h)}
            />
          </div>
        </div>

        {/* Detailed Node Inspector Sidebar */}
        <div className="lg:col-span-1 bg-[#0f172a] border border-slate-850 rounded-xl p-5 shadow-2xl flex flex-col justify-between">
          {selectedHazard ? (
            <div className="space-y-4 flex-1 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className={`text-[8.5px] font-extrabold uppercase px-2 py-0.5 rounded font-mono ${
                    selectedHazard.severity === 'critical' ? 'bg-red-950 text-red-400 border border-red-900/60' :
                    selectedHazard.severity === 'high' ? 'bg-amber-950 text-amber-400 border border-amber-900/60' :
                    'bg-slate-900 text-slate-400 border border-slate-800'
                  }`}>
                    {selectedHazard.severity} Priority
                  </span>
                  <span className="text-[10px] text-[#2ea014] font-mono font-bold uppercase">
                    {selectedHazard.status}
                  </span>
                </div>
                <h3 className="text-base font-black text-white mt-1.5 leading-snug">{selectedHazard.title}</h3>
                <p className="text-[10px] text-slate-400 font-mono mt-0.5">{selectedHazard.id} | {selectedHazard.location}</p>
                
                {/* Inspection fields card */}
                <div className="bg-[#0c1222] border border-slate-900 rounded p-3 mt-3.5 space-y-2">
                  <div>
                    <span className="text-[8px] text-slate-500 uppercase font-black tracking-widest block">Anomaly Diagnosis</span>
                    <p className="text-xs text-slate-300 leading-relaxed mt-0.5">{selectedHazard.description}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-900">
                    <div>
                      <span className="text-[8px] text-slate-500 uppercase font-black">Category</span>
                      <span className="text-[10px] text-teal-450 font-mono block font-bold">{selectedHazard.category || "Unclassified"}</span>
                    </div>
                    <div>
                      <span className="text-[8px] text-slate-500 uppercase font-black">Reporter Node</span>
                      <span className="text-[10px] text-slate-350 font-mono block">{selectedHazard.reporter}</span>
                    </div>
                  </div>
                </div>

                {/* Dispatch Status */}
                <div className="mt-4">
                  <label className="text-[8.5px] text-slate-400 uppercase font-extrabold tracking-widest block mb-1">
                    DEPLOYMENT SCHEDULE
                  </label>
                  {selectedHazard.contractor ? (
                    <div className="bg-[#090d16] border border-slate-900 rounded-lg p-3 flex items-center justify-between gap-2.5">
                      <div className="w-7 h-7 rounded bg-teal-900/50 border border-teal-850 flex items-center justify-center font-mono text-xs font-bold text-teal-400">
                        ACT
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-[#e2e8f0] truncate">{selectedHazard.contractor}</p>
                        <p className="text-[9px] text-slate-450 mt-0.5 font-mono">Job completion: {selectedHazard.completionPercent}%</p>
                      </div>
                      <CheckCircle2 size={15} className="text-teal-400 shrink-0" />
                    </div>
                  ) : (
                    <div className="bg-rose-950/20 border border-rose-900/35 rounded-lg p-3 text-center">
                      <p className="text-xs text-rose-450 font-bold">Unassigned Pipeline</p>
                      <p className="text-[9px] text-rose-500/80 mt-0.5">SLA clock is running. Immediate override required.</p>
                    </div>
                  )}
                </div>

                {/* Countdown display */}
                <div className="mt-4">
                  <label className="text-[8.5px] text-slate-400 uppercase font-extrabold tracking-widest block">
                    SLA ACTION COUNTER
                  </label>
                  <div className="bg-red-950/25 border border-red-900/30 p-2.5 rounded-lg mt-1 flex items-center gap-2">
                    <Clock size={14} className="text-rose-500 animate-pulse" />
                    <div className="flex-1 min-w-0">
                      <div className="text-xs sm:text-sm font-mono font-bold text-rose-400 tracking-wider">
                        {selectedHazard.timeRemaining || formatSeconds(timeRemainingSeconds)}
                      </div>
                      <p className="text-[8px] text-rose-500/85">Contractual override threshold approaching.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Interaction Override Actions */}
              <div className="space-y-1.5 pt-4 border-t border-slate-905">
                <button 
                  onClick={() => onModifyHazard(selectedHazard.id, { 
                    status: 'in-progress', 
                    contractor: 'BuildFast Pvt. Ltd.', 
                    completionPercent: 5,
                    timeRemaining: "01:45:00"
                  })}
                  className="w-full bg-[#2ea014] hover:bg-[#258210] font-semibold text-white py-2 rounded text-xs transition-colors cursor-pointer text-center block"
                >
                  Override & Assign BuildFast
                </button>
                <button 
                  onClick={() => onModifyHazard(selectedHazard.id, { 
                    status: 'completed', 
                    completionPercent: 100 
                  })}
                  className="w-full text-slate-350 hover:text-white border border-slate-800 hover:bg-slate-900 py-1.5 rounded text-[11px] transition-all cursor-pointer font-medium"
                >
                  Mark Complete (Field Clear)
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-24 text-slate-500 text-xs font-mono">
              Inspect road nodes by selecting coordinates on the active vector.
            </div>
          )}
        </div>
      </div>

      {/* SLA Breach feed + Health monitors (Matches bottom half of Screenshot 3) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-3">
        {/* SLA Breach Alert Feed */}
        <div className="bg-[#0f172a] border border-slate-850 rounded-xl p-5 shadow-2xl flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-base font-black text-slate-100 flex items-center gap-2">
                <ShieldAlert size={16} className="text-rose-500" />
                SLA Compliance Alerts
              </h3>
              <span className="text-[10px] text-rose-400 font-mono tracking-wider font-extrabold uppercase">
                2 Escalated Targets
              </span>
            </div>

            <div className="space-y-3">
              {slaBreaches.map(alert => (
                <div 
                  key={alert.id}
                  className="bg-slate-950 border border-slate-900 hover:border-red-950 p-4 rounded-lg flex gap-3.5 transition-all"
                >
                  <div className={`w-1 rounded-full ${alert.status === 'escalated' ? 'bg-rose-500 animate-pulse' : 'bg-amber-500'}`}></div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <h4 className="text-xs font-extrabold text-slate-200 truncate">{alert.title}</h4>
                      <span className="text-[10px] text-rose-400 font-mono font-bold whitespace-nowrap bg-red-950/40 px-1.5 py-0.5 rounded">
                        {alert.lateness}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">{alert.description}</p>
                    
                    {/* Reassign / Escalate operations */}
                    <div className="flex gap-2 mt-3 pl-0.5">
                      <button 
                        onClick={() => onUpdateSLABreach(alert.id, 'escalate')}
                        className={`cursor-pointer text-[10px] uppercase tracking-wider font-extrabold px-3 py-1 bg-rose-900 hover:bg-rose-800 text-white rounded transition-colors ${
                          alert.status === 'escalated' ? 'opacity-50 pointer-events-none bg-slate-800 text-slate-400' : ''
                        }`}
                      >
                        {alert.status === 'escalated' ? 'Escalated Level' : 'Escalate Severity'}
                      </button>
                      <button 
                        onClick={() => onUpdateSLABreach(alert.id, 're-assign')}
                        className="cursor-pointer text-[10px] uppercase font-bold px-3 py-1 border border-slate-800 hover:bg-slate-900 text-slate-300 rounded transition-colors"
                      >
                        Re-assign Dispatch
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Contractor Standings / Health monitor */}
        <div className="bg-[#0f172a] border border-slate-850 rounded-xl p-5 shadow-2xl">
          <h3 className="text-base font-black text-slate-100 flex items-center gap-1.5 mb-4">
            <Users size={16} className="text-teal-400" />
            Active Contractor SLA Monitors
          </h3>

          <div className="space-y-4">
            {contractors.map(c => (
              <div key={c.name} className="bg-slate-950/60 border border-slate-900 p-3.5 rounded-lg">
                <div className="flex justify-between items-center mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-slate-200">{c.name}</span>
                    <span className="text-[9px] text-slate-500 font-mono">({c.responseTime} response)</span>
                  </div>
                  <span className={`text-[8.5px] font-black px-2 py-0.5 rounded-full font-mono uppercase border ${
                    c.status === 'optimal' ? 'bg-teal-950 text-teal-400 border-teal-900' :
                    c.status === 'warning' ? 'bg-amber-950 text-amber-400 border-amber-900' :
                    'bg-red-950 text-rose-400 border-red-900'
                  }`}>
                    {c.status}
                  </span>
                </div>
                
                {/* Horizontal Success index */}
                <div className="w-full bg-[#0d1424] h-1.5 rounded-full overflow-hidden mb-1.5">
                  <div 
                    className={`h-1.5 rounded-full ${
                      c.status === 'optimal' ? 'bg-teal-500' :
                      c.status === 'warning' ? 'bg-amber-500' : 'bg-rose-500'
                    }`} 
                    style={{ width: `${c.successRate}%` }}
                  ></div>
                </div>

                <div className="flex justify-between text-[9px] text-slate-500 font-mono">
                  <span>{c.activeJobs} Parallel Jobs Active</span>
                  <span className="font-bold text-slate-300">{c.successRate}% Milestones on SLA schedule</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Edge AI Live Camera Feed Simulator */}
      <div className="bg-[#0f172a] border border-slate-850 rounded-xl p-5 shadow-2xl">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-base font-black text-slate-100 flex items-center gap-2">
            <Sparkles size={16} className="text-purple-400" />
            Edge AI — Live Camera Feed Analysis
          </h3>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
            <span className="text-[10px] font-mono font-bold text-rose-400 uppercase tracking-wider">4 FEEDS ACTIVE</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { id: "CAM-04", location: "NH65 Downtown Flyover", detection: "Pothole Cluster", confidence: 97.2, severity: "critical", bbox: true },
            { id: "CAM-11", location: "Industrial Zone Entry Ramp", detection: "Surface Cracking", confidence: 89.1, severity: "high", bbox: true },
            { id: "CAM-07", location: "Riverside Pkwy Southbound", detection: "No Anomaly", confidence: 0, severity: "clear", bbox: false },
            { id: "CAM-22", location: "Main St & Commerce", detection: "Debris on Lane", confidence: 74.8, severity: "medium", bbox: true },
          ].map((cam, i) => (
            <div key={cam.id} className="bg-slate-950 border border-slate-800 rounded-lg overflow-hidden group relative">
              {/* Simulated camera viewport */}
              <div className="relative h-36 bg-gradient-to-br from-slate-900 via-[#0a101e] to-slate-950 overflow-hidden">
                {/* Simulated road surface */}
                <div className="absolute inset-0 opacity-30">
                  <div className="absolute top-[45%] left-0 right-0 h-[2px] bg-amber-700/50"></div>
                  <div className="absolute top-[55%] left-0 right-0 h-[2px] bg-amber-700/50"></div>
                  <div className="absolute top-[30%] left-[20%] right-[20%] h-[40%] bg-slate-800/40 rounded"></div>
                </div>

                {/* AI Scanning Line Animation */}
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-60"
                  style={{ animation: `scanline ${2 + i * 0.5}s ease-in-out infinite` }}></div>

                {/* Bounding Box for Detection */}
                {cam.bbox && (
                  <div className="absolute top-[25%] left-[22%] w-[56%] h-[50%] border-2 border-dashed rounded-sm flex items-end justify-start p-1"
                    style={{
                      borderColor: cam.severity === 'critical' ? '#f43f5e' : cam.severity === 'high' ? '#f59e0b' : '#8b5cf6',
                      animation: 'pulse 2s ease-in-out infinite'
                    }}>
                    <span className="text-[8px] font-mono font-black px-1 rounded"
                      style={{
                        background: cam.severity === 'critical' ? '#f43f5e' : cam.severity === 'high' ? '#f59e0b' : '#8b5cf6',
                        color: '#000'
                      }}>
                      {cam.detection} — {cam.confidence}%
                    </span>
                  </div>
                )}

                {/* Crosshair overlay */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 border border-cyan-500/30 rounded-full"></div>
                <div className="absolute top-1/2 left-0 right-0 h-px bg-cyan-900/20"></div>
                <div className="absolute left-1/2 top-0 bottom-0 w-px bg-cyan-900/20"></div>

                {/* Camera ID */}
                <div className="absolute top-2 left-2 text-[8px] font-mono font-bold text-cyan-500/80 bg-slate-950/70 px-1.5 py-0.5 rounded">
                  {cam.id} • REC
                </div>
                <div className="absolute top-2 right-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 inline-block animate-pulse"></span>
                </div>
              </div>

              {/* Camera Info Footer */}
              <div className="p-2.5 space-y-1">
                <div className="text-[10px] font-bold text-slate-300 truncate">{cam.location}</div>
                <div className="flex justify-between items-center">
                  <span className={`text-[9px] font-mono font-black uppercase tracking-wider ${
                    cam.severity === 'critical' ? 'text-rose-400' :
                    cam.severity === 'high' ? 'text-amber-400' :
                    cam.severity === 'clear' ? 'text-emerald-400' : 'text-purple-400'
                  }`}>
                    {cam.severity === 'clear' ? '✓ ALL CLEAR' : `⚠ ${cam.detection}`}
                  </span>
                  {cam.confidence > 0 && (
                    <span className="text-[9px] font-mono text-slate-500">{cam.confidence}%</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Dynamic Patrol Deployment Modal (Dispatcher Dialog) */}
      {reportModalOpen && (
        <div className="aegis-modal-overlay fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#0f172a] rounded-xl shadow-2xl border border-slate-800 w-full max-w-md max-h-[90vh] overflow-y-auto animate-fadeIn">
            <div className="bg-[#0b1329] p-4 flex justify-between items-center border-b border-slate-800">
              <h3 className="font-extrabold text-sm text-white flex items-center gap-2 uppercase tracking-wide">
                <AlertCircle size={15} className="text-amber-500" />
                Dispatch Field Patrol Unit
              </h3>
              <button 
                onClick={() => setReportModalOpen(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <XClose size={18} />
              </button>
            </div>
            
            <form onSubmit={handleCreateReportSubmit} className="p-5 space-y-4">
              <div>
                <label className="text-[9px] uppercase font-bold text-slate-400 tracking-wider block mb-1">Incident Name / Classification</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Major Highway Cracks, Washout, Culvert silt"
                  className="w-full bg-slate-900 border border-slate-800 rounded p-2 text-xs text-white focus:border-teal-600 outline-none placeholder-slate-600"
                />
              </div>

              <div>
                <label className="text-[9px] uppercase font-bold text-slate-400 tracking-wider block mb-1">Administrative Location / Sector Coordinates</label>
                <input
                  type="text"
                  required
                  value={newLocation}
                  onChange={(e) => setNewLocation(e.target.value)}
                  placeholder="e.g. Sectors 12-14 High Bridge, NH-65 Sector 4"
                  className="w-full bg-slate-900 border border-slate-800 rounded p-2 text-xs text-white focus:border-teal-600 outline-none placeholder-slate-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[9px] uppercase font-bold text-slate-400 tracking-wider block mb-1">Sector Class</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded p-2 text-xs text-white focus:border-teal-600 outline-none cursor-pointer"
                  >
                    <option value="Pavement Failure">Pavement Failure</option>
                    <option value="Structural Fatigue">Structural Fatigue</option>
                    <option value="Safety Barriers">Safety Barriers</option>
                    <option value="Drainage / Pipes">Drainage / Pipes</option>
                    <option value="Signage / Markings">Signage / Markings</option>
                  </select>
                </div>
                <div>
                  <label className="text-[9px] uppercase font-bold text-slate-400 tracking-wider block mb-1">Risk Severity</label>
                  <select
                    value={newSeverity}
                    onChange={(e) => setNewSeverity(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded p-2 text-xs text-white focus:border-teal-600 outline-none cursor-pointer"
                  >
                    <option value="critical">Critical (Immediate breach)</option>
                    <option value="high">High (48 Hours threshold)</option>
                    <option value="medium">Medium (72 Hours schedule)</option>
                    <option value="low">Low (General batch cycle)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[9px] uppercase font-bold text-slate-400 tracking-wider block mb-1">Inspection Logging Notes</label>
                <textarea
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  rows={2}
                  placeholder="Insert field details, cracks expansion measurements etc..."
                  className="w-full bg-slate-900 border border-slate-800 rounded p-2 text-xs text-white focus:border-teal-600 outline-none placeholder-slate-600"
                />
              </div>

              <div className="flex gap-2 justify-end pt-3 border-t border-slate-900">
                <button
                  type="button"
                  onClick={() => setReportModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-white hover:bg-slate-800 rounded cursor-pointer transition-colors"
                >
                  Close
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold bg-[#2ea014] hover:bg-[#258210] text-white rounded cursor-pointer shadow-lg ease-out transition-all flex items-center gap-1"
                >
                  Deploy Patrol
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// Minimal manual close svg
function XClose({ size, className }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width={size || 16} 
      height={size || 16} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2.5" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <line x1="18" y1="6" x2="6" y2="18"></line>
      <line x1="6" y1="6" x2="18" y2="18"></line>
    </svg>
  );
}
