import React, { useState } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell 
} from 'recharts';
import { 
  Search, ArrowDownRight, ArrowUpRight, Award, ShieldAlert, 
  Coins, Filter, ChevronRight, HelpCircle, FileSpreadsheet, Building 
} from 'lucide-react';
export default function SpendWatch({
  contracts = [],
  contractors = [],
  hazards = []
}) {
  const [selectedContract, setSelectedContract] = useState(contracts[0] || null);
  const [sectorFilter, setSectorFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Total municipal financial calculations
  const totalAllocated = contracts.reduce((sum, c) => sum + c.budgetAllocated, 0);
  const totalDisbursed = contracts.reduce((sum, c) => sum + c.amountDisbursed, 0);
  const totalRemaining = totalAllocated - totalDisbursed;
  const avgEfficiency = (contracts.reduce((sum, c) => sum + c.efficiencyScore, 0) / contracts.length).toFixed(0);

  // Grouped data for the Recharts Bar Chart
  const chartData = contracts.map(c => ({
    name: c.sector,
    Allocated: c.budgetAllocated,
    Disbursed: c.amountDisbursed,
    Remaining: Number(c.remainingBudget || (c.budgetAllocated - c.amountDisbursed).toFixed(1))
  }));

  // Filtering contracts
  const filteredContracts = contracts.filter(c => {
    const matchesSector = sectorFilter === 'all' || c.sector === sectorFilter;
    const matchesQuery = searchQuery === '' || 
      c.contractor.toLowerCase().includes(searchQuery.toLowerCase()) || 
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.id.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSector && matchesQuery;
  });

  // Ranked contractors ledger by efficiency scale
  const rankedContractors = [...contractors].sort((a, b) => b.successRate - a.successRate);

  return (
    <div className="space-y-6 font-sans">
      {/* Visual Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase font-bold tracking-widest bg-emerald-950 text-emerald-400 px-2 py-0.5 rounded border border-emerald-900/60 font-mono">
              FINANCIAL SPENDWATCH PORTAL
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#10b981] animate-ping"></span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight mt-1 flex items-center gap-2">
            SpendWatch Dashboard
            <span className="text-xs text-slate-450 font-mono font-medium">(Public Ledger)</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Citizen audit tool tracking public tenders, milestone disbursements, and taxpayer efficiency indexes.
          </p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => window.print()}
            className="cursor-pointer bg-slate-800 text-slate-200 hover:text-white border border-slate-755 hover:border-slate-600 text-xs font-bold px-3 py-2 rounded flex items-center gap-1.5 transition-colors font-mono uppercase"
          >
            <FileSpreadsheet size={13} />
            Export Audit
          </button>
        </div>
      </div>

      {/* Financial KPI Summary Grids */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI: Total Allocated */}
        <div className="bg-[#0f172a] border border-slate-850 p-4 rounded-xl shadow-xl flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-teal-950/60 text-teal-400 border border-teal-900/40 flex items-center justify-center shrink-0">
            <Coins size={22} />
          </div>
          <div className="min-w-0">
            <span className="text-[9px] uppercase font-extrabold text-slate-500 tracking-wider">Total Corridor Budget</span>
            <div className="text-xl sm:text-2xl font-black text-white font-mono mt-0.5">
              {totalAllocated.toFixed(2)} Cr
            </div>
            <p className="text-[9px] text-slate-400 mt-0.5">Accumulated tender sums approved</p>
          </div>
        </div>

        {/* KPI: Disbursed to Date */}
        <div className="bg-[#0f172a] border border-slate-850 p-4 rounded-xl shadow-xl flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-emerald-950/60 text-emerald-400 border border-emerald-900/40 flex items-center justify-center shrink-0">
            <ArrowDownRight size={22} className="text-emerald-400" />
          </div>
          <div className="min-w-0">
            <span className="text-[9px] uppercase font-extrabold text-slate-500 tracking-wider">Milestone Disbursed</span>
            <div className="text-xl sm:text-2xl font-black text-emerald-450 font-mono mt-0.5">
              {totalDisbursed.toFixed(2)} Cr
            </div>
            <p className="text-[9px] text-emerald-500 mt-0.5">Approved on proof of milestone clearance</p>
          </div>
        </div>

        {/* KPI: Remaining Pipeline */}
        <div className="bg-[#0f172a] border border-slate-850 p-4 rounded-xl shadow-xl flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center shrink-0">
            <Coins size={20} className="text-slate-400" />
          </div>
          <div className="min-w-0">
            <span className="text-[9px] uppercase font-extrabold text-slate-500 tracking-wider">Remaining Pipeline</span>
            <div className="text-xl sm:text-2xl font-black text-slate-200 font-mono mt-0.5">
              {totalRemaining.toFixed(2)} Cr
            </div>
            <p className="text-[9px] text-slate-400 mt-0.5">Retained pending work sign-off</p>
          </div>
        </div>

        {/* KPI: SLA Efficiency Index */}
        <div className="bg-[#0f172a] border border-slate-850 p-4 rounded-xl shadow-xl flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-purple-950/40 text-purple-400 border border-purple-900/40 flex items-center justify-center shrink-0">
            <Award size={20} />
          </div>
          <div className="min-w-0">
            <span className="text-[9px] uppercase font-extrabold text-slate-500 tracking-wider">SLA Spend Efficiency</span>
            <div className="text-xl sm:text-2xl font-black text-purple-400 font-mono mt-0.5">
              {avgEfficiency}%
            </div>
            <p className="text-[9px] text-purple-400">Excellent performance scoring</p>
          </div>
        </div>
      </div>

      {/* Main Budget Visual Analytics Flow */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recharts Allocation vs Spent Chart bar block */}
        <div className="lg:col-span-2 bg-[#0f172a] border border-slate-850 p-5 rounded-xl shadow-2xl flex flex-col justify-between">
          <div>
            <h3 className="text-base font-black text-slate-100 mb-1">
              Fiscal Disbursals by Administrative Sector
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Visualizes assigned corridor funding limits versus actual payouts issued based on technical audits.
            </p>
          </div>

          <div className="h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ top: 10, right: 10, left: -20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis 
                  dataKey="name" 
                  stroke="#64748b" 
                  fontSize={10} 
                  tickLine={false} 
                />
                <YAxis 
                  stroke="#64748b" 
                  fontSize={10} 
                  tickLine={false} 
                  unit="Cr" 
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f8fafc' }} 
                  itemStyle={{ fontSize: '11px' }}
                  labelStyle={{ fontWeight: 'bold', fontSize: '11px' }}
                />
                <Legend 
                  wrapperStyle={{ fontSize: '10px', paddingTop: '10px' }} 
                />
                <Bar dataKey="Allocated" fill="#1e293b" name="Allocated Budget" radius={[3, 3, 0, 0]} />
                <Bar dataKey="Disbursed" fill="#10b981" name="Disbursed Payout" radius={[3, 3, 0, 0]} />
                <Bar dataKey="Remaining" fill="#2ea014" name="Remaining Strut" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Contractor Rank Ledger List */}
        <div className="lg:col-span-1 bg-[#0f172a] border border-slate-850 p-5 rounded-xl shadow-2xl flex flex-col justify-between">
          <div>
            <h3 className="text-base font-black text-slate-100 flex items-center gap-1.5 mb-1">
              <Award size={16} className="text-teal-400" />
              Contractor Score Ladder
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Contractors ranked by certified milestone completion rates.
            </p>

            <div className="space-y-3.5">
              {rankedContractors.map((c, index) => {
                let badge = "text-slate-400 border-slate-800 bg-slate-900";
                if (index === 0) badge = "text-yellow-405 bg-yellow-950/30 border-yellow-805/30";
                if (index === 1) badge = "text-slate-200 bg-slate-800 border-slate-700";

                return (
                  <div 
                    key={c.name}
                    className="flex items-center justify-between p-2.5 rounded-lg border border-slate-900 bg-[#0c1222]"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className={`w-6 h-6 rounded flex items-center justify-center font-mono font-black text-xs border ${badge}`}>
                        #{index + 1}
                      </div>
                      <div className="min-w-0">
                        <span className="text-xs font-bold text-slate-200 block truncate">{c.name}</span>
                        <div className="flex gap-2 text-[9px] text-slate-500 font-mono mt-0.5">
                          <span>{c.activeJobs} active jobs</span>
                          <span>{c.slaBreaches} SLA breach</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-xs font-mono font-bold text-teal-400">{c.successRate}%</span>
                      <span className="block text-[8.5px] text-slate-500 uppercase font-bold tracking-tighter">SLA index</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-900 text-[9.5px] text-slate-550 leading-tight">
            *Ranks are compiled daily based on regulatory audit milestones. Standard minimum is 75%.
          </div>
        </div>
      </div>

      {/* Contract Search Table and Inspectors */}
      <div className="bg-[#0f172a] border border-slate-850 rounded-xl p-5 shadow-2xl">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-5">
          <div>
            <h3 className="text-base font-black text-slate-100 flex items-center gap-1">
              Active Road Works Tenders & Records
            </h3>
            <p className="text-xs text-slate-400">
              Query, search, and audit financial disbursement logs of active contractors of record.
            </p>
          </div>

          <div className="flex gap-2 w-full sm:w-auto">
            <select
              value={sectorFilter}
              onChange={(e) => setSectorFilter(e.target.value)}
              className="bg-slate-900 border border-slate-800 text-slate-350 text-xs px-2 py-1.5 rounded outline-none w-full sm:w-40 font-mono cursor-pointer"
            >
              <option value="all">All Sectors</option>
              <option value="Metro-01">Sector Metro-01</option>
              <option value="Metro-02">Sector Metro-02</option>
              <option value="Metro-03">Sector Metro-03</option>
              <option value="NH-65">Corridor NH-65</option>
              <option value="Industrial Zone">Industrial Sector</option>
            </select>

            <div className="relative w-full sm:w-48">
              <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search contractor..."
                className="bg-slate-900 border border-slate-800 text-xs text-white pl-8 pr-3 py-1.5 rounded outline-none w-full font-mono placeholder-slate-600"
              />
            </div>
          </div>
        </div>

        {/* Ledger view structured mapping */}
        <div className="overflow-x-auto border border-slate-900 rounded-lg">
          <table className="w-full text-left border-collapse font-mono text-xs text-slate-300">
            <thead>
              <tr className="bg-[#0c1222] border-b border-slate-900 text-[10px] text-slate-500 uppercase tracking-widest font-black">
                <th className="p-3">Tender ID</th>
                <th className="p-3">Contractor / Agency</th>
                <th className="p-3">Project Title</th>
                <th className="p-3 text-right">Value (Cr)</th>
                <th className="p-3 text-right">Paid (Cr)</th>
                <th className="p-3 text-center">Fisc. Score</th>
                <th className="p-3 text-center">Tether</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-905">
              {filteredContracts.map(c => {
                const isSelected = selectedContract?.id === c.id;
                
                let perfColor = 'text-emerald-450';
                if (c.efficiencyScore < 70) perfColor = 'text-rose-550';
                else if (c.efficiencyScore < 85) perfColor = 'text-amber-550';

                return (
                  <tr 
                    key={c.id}
                    onClick={() => setSelectedContract(c)}
                    className={`hover:bg-slate-900/60 transition-colors cursor-pointer ${
                      isSelected ? 'bg-slate-900 text-white font-bold' : ''
                    }`}
                  >
                    <td className="p-3 font-bold text-teal-450">{c.id}</td>
                    <td className="p-3 text-slate-200">
                      <div className="flex items-center gap-1.5">
                        <Building size={12} className="text-slate-500" />
                        {c.contractor}
                      </div>
                    </td>
                    <td className="p-3 max-w-[200px] truncate text-slate-400">{c.name}</td>
                    <td className="p-3 text-right text-slate-100 font-bold">{c.tenderValue.toFixed(2)} Cr</td>
                    <td className="p-3 text-right text-emerald-450 font-bold">{c.amountDisbursed.toFixed(2)} Cr</td>
                    <td className="p-3 text-center">
                      <span className={`px-2 py-0.5 bg-[#070b13] border border-slate-805/45 rounded font-black ${perfColor}`}>
                        {c.efficiencyScore}%
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      <span className={`px-1.5 py-0.5 rounded text-[8.5px] uppercase font-bold text-white ${
                        c.status === 'optimal' || c.status === 'on-schedule' ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-900' :
                        c.status === 'warning' ? 'bg-amber-950/80 text-amber-400 border border-amber-900' :
                        'bg-red-950/80 text-rose-400 border border-red-900'
                      }`}>
                        {c.status}
                      </span>
                    </td>
                  </tr>
                );
              })}

              {filteredContracts.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center p-8 text-slate-500">
                    No active tenders or contractors correspond to current filter parameters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Selected Tender Audit Inspector details */}
        {selectedContract && (
          <div className="bg-[#0c1222] border border-slate-900 rounded-lg p-4.5 mt-5 grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-2 duration-120">
            <div>
              <span className="text-[9px] text-slate-500 uppercase font-bold tracking-widest block font-mono">TENDER IDENTIFIER</span>
              <h4 className="text-sm font-black text-slate-205 mt-1">{selectedContract.id}</h4>
              <p className="text-xs text-slate-450 leading-relaxed font-sans mt-1.5">
                Targeted sector corridor is **{selectedContract.sector}**. Registered deployment under ID **{selectedContract.id}** handles regional road upgrades.
              </p>
            </div>

            <div className="border-t md:border-t-0 md:border-l border-slate-900 pt-4 md:pt-0 md:pl-5 space-y-2">
              <span className="text-[9px] text-slate-500 uppercase font-bold tracking-widest block font-mono">FINANCIAL AUDIT BALANCE</span>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-slate-450 block text-[9.5px]">Tender Approved Value</span>
                  <span className="font-bold text-white">{selectedContract.tenderValue.toFixed(2)} Cr</span>
                </div>
                <div>
                  <span className="text-slate-450 block text-[9.5px]">Amount Disbursed</span>
                  <span className="font-bold text-white">{selectedContract.amountDisbursed.toFixed(2)} Cr</span>
                </div>
                <div>
                  <span className="text-slate-450 block text-[9.5px]">Available Funds Pool</span>
                  <span className="font-bold text-teal-400">{selectedContract.remainingBudget?.toFixed(2) || (selectedContract.budgetAllocated - selectedContract.amountDisbursed).toFixed(2)} Cr</span>
                </div>
                <div>
                  <span className="text-slate-450 block text-[9.5px]">Budget Allocated</span>
                  <span className="font-bold text-white">{selectedContract.budgetAllocated.toFixed(2)} Cr</span>
                </div>
              </div>
            </div>

            <div className="border-t md:border-t-0 md:border-l border-slate-900 pt-4 md:pt-0 md:pl-5 flex flex-col justify-between">
              <div>
                <span className="text-[9px] text-slate-500 uppercase font-bold tracking-widest block font-mono">QUALITY SCHEDULE METRICS</span>
                <div className="flex justify-between text-xs mt-2 font-mono">
                  <span className="text-slate-400">Target Completion Date:</span>
                  <span className="text-slate-200 font-bold">{selectedContract.targetCompletion || "2026-08-30"}</span>
                </div>
                <div className="flex justify-between text-xs mt-1 font-mono">
                  <span className="text-slate-400">Quality Index Standard:</span>
                  <span className="text-emerald-400 font-bold">{selectedContract.qualityIndex || "98%"}</span>
                </div>
              </div>
              <div className="pt-3">
                <button 
                  onClick={() => alert(`Issuing a formal administrative compliance query to ${selectedContract.contractor} regarding tender ${selectedContract.id}...`)}
                  className="cursor-pointer text-[10px] w-full uppercase tracking-wider font-extrabold bg-[#2ea014] hover:bg-[#258210] py-1.5 rounded text-white transition-colors"
                >
                  Issue Performance Query
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
