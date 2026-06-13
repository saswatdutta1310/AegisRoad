import React, { useState } from 'react';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Search, ArrowDownRight, Award, ShieldAlert, Coins, FileSpreadsheet, Building } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const T = { teal:'#072E24', tealMid:'#156B52', yellow:'#C8D400', cream:'#F4F0E6', creamDark:'#EAE5D6', textDark:'#0D1E1B' };
const card = { background:'#FFFFFF', border:'1px solid rgba(13,30,27,0.1)', borderRadius:'16px', padding:'20px' };
const badge = (c,bg) => ({ color:c, background:bg, fontSize:'9px', fontFamily:'monospace', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.08em', padding:'3px 8px', borderRadius:'6px', display:'inline-flex', alignItems:'center', gap:'4px' });

export default function SpendWatch({ contracts = [], contractors = [], hazards = [] }) {
  const [selectedContract, setSelectedContract] = useState(contracts[0] || null);
  const [sectorFilter, setSectorFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [exportLoading, setExportLoading] = useState(false);

  const totalAllocated = contracts.reduce((s,c) => s+(c.budgetAllocated||0), 0);
  const totalDisbursed = contracts.reduce((s,c) => s+(c.amountDisbursed||0), 0);
  const totalRemaining = totalAllocated - totalDisbursed;
  const avgEfficiency = contracts.length ? (contracts.reduce((s,c) => s+(c.efficiencyScore||0), 0)/contracts.length).toFixed(0) : 0;

  const chartData = contracts.map(c => ({
    name: c.sector,
    Allocated: c.budgetAllocated,
    Disbursed: c.amountDisbursed,
    Remaining: Number(c.remainingBudget||(c.budgetAllocated-c.amountDisbursed).toFixed(1))
  }));

  const filteredContracts = contracts.filter(c => {
    const ms = sectorFilter==='all'||c.sector===sectorFilter;
    const mq = !searchQuery||[c.contractor,c.name,c.id].some(v=>v?.toLowerCase().includes(searchQuery.toLowerCase()));
    return ms && mq;
  });

  const rankedContractors = [...contractors].sort((a,b) => b.successRate-a.successRate);

  const handleExportAudit = async () => {
    setExportLoading(true);
    try {
      const response = await axios.get(`${API_BASE}/api/v1/spend/export`, { responseType:'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data],{type:'text/csv'}));
      const link = document.createElement('a');
      link.href = url; link.setAttribute('download','aegisroad_contracts_audit.csv');
      document.body.appendChild(link); link.click();
      link.parentNode.removeChild(link); window.URL.revokeObjectURL(url);
    } catch (error) {
      if (error.response) alert(`Export failed: server returned ${error.response.status}.`);
      else if (error.request) alert('Export failed: backend is unreachable. Please wait 30 seconds and try again.');
      else alert(`Export failed: ${error.message}`);
    } finally { setExportLoading(false); }
  };

  const TooltipStyle = { contentStyle:{ background:T.teal, border:`1px solid rgba(200,212,0,0.2)`, color:'#fff', borderRadius:'12px', fontSize:'12px' }, labelStyle:{ color:T.yellow, fontWeight:700 }, itemStyle:{ color:'rgba(255,255,255,0.8)' } };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-5 border-b" style={{ borderColor:'rgba(13,30,27,0.12)' }}>
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span style={badge(T.tealMid,'rgba(21,107,82,0.12)')}>
              <span className="w-1.5 h-1.5 rounded-full bg-green-600 animate-ping inline-block" />FINANCIAL SPENDWATCH PORTAL
            </span>
          </div>
          <h1 className="text-[clamp(28px,4vw,44px)] font-black uppercase leading-tight" style={{ fontFamily:"'Barlow Condensed',sans-serif", color:T.teal }}>
            SpendWatch Dashboard <span className="text-base font-medium normal-case" style={{ color:'rgba(13,30,27,0.4)', fontFamily:'monospace' }}>(Public Ledger)</span>
          </h1>
          <p className="text-sm mt-1" style={{ color:'rgba(13,30,27,0.5)' }}>Citizen audit tool tracking public tenders, milestone disbursements, and taxpayer efficiency indexes.</p>
        </div>
        <button onClick={handleExportAudit} disabled={exportLoading} className="shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-black uppercase tracking-wider cursor-pointer disabled:opacity-50 transition-all border" style={{ borderColor:'rgba(13,30,27,0.15)', color:T.teal, background:'transparent', fontFamily:"'Barlow Condensed',sans-serif" }}>
          <FileSpreadsheet size={14} />{exportLoading?'Exporting...':'Export Audit CSV'}
        </button>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-[3px]">
        {[
          { icon:<Coins size={22}/>, label:'Total Corridor Budget', val:`${totalAllocated.toFixed(2)} Cr`, sub:'Accumulated tender sums approved', col:T.tealMid, bg:'rgba(21,107,82,0.08)' },
          { icon:<ArrowDownRight size={22}/>, label:'Milestone Disbursed', val:`${totalDisbursed.toFixed(2)} Cr`, sub:'Approved on proof of milestone', col:'#16a34a', bg:'rgba(22,163,74,0.08)' },
          { icon:<Coins size={22}/>, label:'Remaining Pipeline', val:`${totalRemaining.toFixed(2)} Cr`, sub:'Retained pending work sign-off', col:'rgba(13,30,27,0.6)', bg:'rgba(13,30,27,0.04)' },
          { icon:<Award size={22}/>, label:'SLA Spend Efficiency', val:`${avgEfficiency}%`, sub:'Excellent performance scoring', col:'#7c3aed', bg:'rgba(124,58,237,0.08)' },
        ].map((k,i) => (
          <div key={i} className="p-6 flex items-center gap-4" style={{ background:T.white, border:'1px solid rgba(13,30,27,0.08)' }}>
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0" style={{ background:k.bg, color:k.col }}>{k.icon}</div>
            <div>
              <span className="text-[9px] font-black uppercase tracking-wider block mb-0.5" style={{ color:'rgba(13,30,27,0.4)', fontFamily:'monospace' }}>{k.label}</span>
              <div className="text-2xl font-black leading-none" style={{ fontFamily:"'Barlow Condensed',sans-serif", color:k.col }}>{k.val}</div>
              <p className="text-[9px] mt-0.5" style={{ color:'rgba(13,30,27,0.4)' }}>{k.sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Chart + Leaderboard */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 rounded-2xl p-5" style={card}>
          <h3 className="text-lg font-black uppercase mb-1" style={{ fontFamily:"'Barlow Condensed',sans-serif", color:T.teal }}>Fiscal Disbursals by Sector</h3>
          <p className="text-xs mb-4" style={{ color:'rgba(13,30,27,0.45)' }}>Visualizes assigned corridor funding limits versus actual payouts issued.</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top:5, right:5, left:-20, bottom:0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(13,30,27,0.06)" />
                <XAxis dataKey="name" stroke="rgba(13,30,27,0.35)" fontSize={10} tickLine={false} />
                <YAxis stroke="rgba(13,30,27,0.35)" fontSize={10} tickLine={false} unit="Cr" />
                <Tooltip {...TooltipStyle} />
                <Legend wrapperStyle={{ fontSize:'10px', paddingTop:'8px' }} />
                <Bar dataKey="Allocated" fill="#EAE5D6" name="Allocated Budget" radius={[4,4,0,0]} />
                <Bar dataKey="Disbursed" fill={T.tealMid} name="Disbursed Payout" radius={[4,4,0,0]} />
                <Bar dataKey="Remaining" fill={T.yellow} name="Remaining Funds" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-2xl p-5" style={card}>
          <h3 className="text-lg font-black uppercase flex items-center gap-2 mb-4" style={{ fontFamily:"'Barlow Condensed',sans-serif", color:T.teal }}>
            <Award size={16} style={{ color:T.tealMid }} />Score Ladder
          </h3>
          <div className="space-y-3">
            {rankedContractors.map((c,i) => (
              <div key={c.name} className="flex items-center justify-between p-3 rounded-xl" style={{ background:T.creamDark, border:'1px solid rgba(13,30,27,0.07)' }}>
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black shrink-0" style={{ background: i===0?T.yellow:i===1?'rgba(13,30,27,0.15)':'rgba(13,30,27,0.08)', color: i===0?T.teal:'rgba(13,30,27,0.6)', fontFamily:"'Barlow Condensed',sans-serif" }}>#{i+1}</div>
                  <div className="min-w-0">
                    <span className="text-xs font-bold truncate block" style={{ color:T.teal }}>{c.name}</span>
                    <div className="flex gap-2 text-[9px] font-mono" style={{ color:'rgba(13,30,27,0.4)' }}>
                      <span>{c.activeJobs} active</span><span>{c.slaBreaches||0} SLA breach</span>
                    </div>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-sm font-black font-mono" style={{ fontFamily:"'Barlow Condensed',sans-serif", color:T.tealMid }}>{c.successRate}%</span>
                  <span className="block text-[8px] font-black uppercase" style={{ color:'rgba(13,30,27,0.35)' }}>SLA index</span>
                </div>
              </div>
            ))}
          </div>
          <p className="text-[9px] mt-4 pt-3 border-t" style={{ color:'rgba(13,30,27,0.35)', borderColor:'rgba(13,30,27,0.08)' }}>*Ranks compiled daily. Minimum standard: 75%.</p>
        </div>
      </div>

      {/* Contracts Table */}
      <div className="rounded-2xl p-5" style={card}>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-5">
          <div>
            <h3 className="text-lg font-black uppercase" style={{ fontFamily:"'Barlow Condensed',sans-serif", color:T.teal }}>Active Road Works Tenders</h3>
            <p className="text-xs" style={{ color:'rgba(13,30,27,0.45)' }}>Query, search, and audit financial disbursement logs of active contractors.</p>
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <select value={sectorFilter} onChange={e=>setSectorFilter(e.target.value)} className="text-xs px-3 py-2 rounded-xl outline-none cursor-pointer" style={{ background:T.creamDark, border:'1px solid rgba(13,30,27,0.15)', color:T.textDark }}>
              <option value="all">All Sectors</option>
              <option value="Metro-01">Metro-01</option><option value="Metro-02">Metro-02</option><option value="Metro-03">Metro-03</option>
              <option value="NH-65">NH-65</option><option value="Industrial Zone">Industrial Zone</option>
            </select>
            <div className="relative">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color:'rgba(13,30,27,0.35)' }} />
              <input type="text" value={searchQuery} onChange={e=>setSearchQuery(e.target.value)} placeholder="Search contractor..." className="text-xs pl-9 pr-3 py-2 rounded-xl outline-none" style={{ background:T.creamDark, border:'1px solid rgba(13,30,27,0.15)', color:T.textDark, width:'180px' }} />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto rounded-xl border" style={{ borderColor:'rgba(13,30,27,0.1)' }}>
          <table className="w-full text-left text-xs">
            <thead>
              <tr style={{ background:T.creamDark, borderBottom:'1px solid rgba(13,30,27,0.1)' }}>
                {['Tender ID','Contractor','Project Title','Value (Cr)','Paid (Cr)','Fisc. Score','Status'].map(h => (
                  <th key={h} className="px-4 py-3 text-[9px] font-black uppercase tracking-wider" style={{ color:'rgba(13,30,27,0.45)', fontFamily:'monospace' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredContracts.map(c => {
                const perfCol = c.efficiencyScore>=85?T.tealMid:c.efficiencyScore>=70?'#d97706':'#dc2626';
                const stBg = c.status==='optimal'||c.status==='on-schedule'?'rgba(21,107,82,0.1)':c.status==='warning'?'#fef3c7':'#fee2e2';
                const stCol = c.status==='optimal'||c.status==='on-schedule'?T.tealMid:c.status==='warning'?'#d97706':'#dc2626';
                const sel = selectedContract?.id===c.id;
                return (
                  <tr key={c.id} onClick={()=>setSelectedContract(c)} className="cursor-pointer transition-all border-b" style={{ borderColor:'rgba(13,30,27,0.06)', background:sel?'rgba(200,212,0,0.08)':'transparent' }}>
                    <td className="px-4 py-3 font-black font-mono text-[11px]" style={{ color:T.tealMid }}>{c.id}</td>
                    <td className="px-4 py-3 font-bold flex items-center gap-1.5" style={{ color:T.teal }}><Building size={12} style={{ color:'rgba(13,30,27,0.35)' }}/>{c.contractor}</td>
                    <td className="px-4 py-3 max-w-[180px]" style={{ color:'rgba(13,30,27,0.55)' }}><span className="truncate block">{c.name}</span></td>
                    <td className="px-4 py-3 font-bold text-right" style={{ color:T.teal }}>{c.tenderValue?.toFixed(2)} Cr</td>
                    <td className="px-4 py-3 font-bold text-right" style={{ color:T.tealMid }}>{c.amountDisbursed?.toFixed(2)} Cr</td>
                    <td className="px-4 py-3 text-center font-black font-mono" style={{ color:perfCol }}>{c.efficiencyScore}%</td>
                    <td className="px-4 py-3 text-center">
                      <span className="text-[8px] font-black uppercase px-2 py-0.5 rounded" style={{ color:stCol, background:stBg }}>{c.status}</span>
                    </td>
                  </tr>
                );
              })}
              {filteredContracts.length===0 && (
                <tr><td colSpan={7} className="text-center py-8 text-sm" style={{ color:'rgba(13,30,27,0.35)' }}>No tenders match current filters.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Selected Contract Detail */}
        {selectedContract && (
          <div className="mt-5 p-5 rounded-2xl grid grid-cols-1 md:grid-cols-3 gap-6 animate-fadeIn" style={{ background:T.teal }}>
            <div>
              <span className="text-[9px] font-black uppercase tracking-widest block mb-2 font-mono" style={{ color:'rgba(200,212,0,0.6)' }}>TENDER IDENTIFIER</span>
              <h4 className="text-lg font-black uppercase mb-1" style={{ fontFamily:"'Barlow Condensed',sans-serif", color:'#fff' }}>{selectedContract.id}</h4>
              <p className="text-xs leading-relaxed" style={{ color:'rgba(255,255,255,0.5)' }}>Sector {selectedContract.sector} — handles regional road upgrades under tender {selectedContract.id}.</p>
            </div>
            <div className="border-t md:border-t-0 md:border-l pt-4 md:pt-0 md:pl-6 space-y-3" style={{ borderColor:'rgba(255,255,255,0.1)' }}>
              <span className="text-[9px] font-black uppercase tracking-widest block font-mono" style={{ color:'rgba(200,212,0,0.6)' }}>FINANCIAL AUDIT BALANCE</span>
              <div className="grid grid-cols-2 gap-3 text-xs">
                {[
                  { l:'Tender Value', v:`${selectedContract.tenderValue?.toFixed(2)} Cr` },
                  { l:'Disbursed', v:`${selectedContract.amountDisbursed?.toFixed(2)} Cr` },
                  { l:'Remaining', v:`${(selectedContract.budgetAllocated-selectedContract.amountDisbursed).toFixed(2)} Cr` },
                  { l:'Budget Allocated', v:`${selectedContract.budgetAllocated?.toFixed(2)} Cr` },
                ].map(f => (
                  <div key={f.l}>
                    <span className="block text-[9px]" style={{ color:'rgba(255,255,255,0.4)' }}>{f.l}</span>
                    <span className="font-bold text-white">{f.v}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="border-t md:border-t-0 md:border-l pt-4 md:pt-0 md:pl-6 flex flex-col justify-between" style={{ borderColor:'rgba(255,255,255,0.1)' }}>
              <div className="space-y-2 text-xs">
                <span className="text-[9px] font-black uppercase tracking-widest block font-mono" style={{ color:'rgba(200,212,0,0.6)' }}>SCHEDULE METRICS</span>
                <div className="flex justify-between"><span style={{ color:'rgba(255,255,255,0.45)' }}>Target Completion:</span><span className="font-bold text-white">{selectedContract.targetCompletion||'2026-08-30'}</span></div>
                <div className="flex justify-between"><span style={{ color:'rgba(255,255,255,0.45)' }}>Quality Index:</span><span className="font-bold" style={{ color:T.yellow }}>{selectedContract.qualityIndex||'98%'}</span></div>
              </div>
              <button onClick={()=>alert(`Issuing compliance query to ${selectedContract.contractor}...`)} className="mt-4 w-full py-2.5 rounded-xl text-xs font-black uppercase tracking-wider cursor-pointer transition-all hover:scale-[1.01]" style={{ background:T.yellow, color:T.teal, fontFamily:"'Barlow Condensed',sans-serif" }}>
                Issue Performance Query →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
