import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, Send, X, Bot, Sparkles, User, HelpCircle } from 'lucide-react';

export default function AegisChat({ hazards = [], contracts = [] }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      sender: 'assistant',
      text: "Welcome, Officer. I am Aegis Intelligence, your municipal road safety and fiscal auditor bot. I have digested the active GIS hazard logs and SpendWatch tables for the current quarter. Ask me anything about regional road conditions, contractor accountability, or budget utilization rates.",
      timestamp: new Date()
    }
  ]);
  const [inputVal, setInputVal] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef(null);

  const predefinedQueries = [
    { text: "Potholes on NH65?", query: "Are there any active pothole issues on NH65?" },
    { text: "Is BuildFast complying?", query: "Is contractor BuildFast Pvt. Ltd. meeting its repair deadlines?" },
    { text: "Aggregate budget spend?", query: "What is the total spend and budget utilization across all districts?" },
    { text: "Critical SLA bypass alerts?", query: "Are there any critical unassigned hazards or SLA escalations?" }
  ];

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping]);

  const handleSendMessage = (text) => {
    if (!text.trim()) return;

    const userMessage = {
      id: Math.random().toString(),
      sender: 'user',
      text: text,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputVal('');
    setIsTyping(true);

    setTimeout(() => {
      let replyText = '';
      let citations = [];

      const normalizedText = text.toLowerCase();

      if (normalizedText.includes('nh65') || normalizedText.includes('pothole') || normalizedText.includes('asphalt')) {
        const matches = hazards.filter(h => h.location.toLowerCase().includes('nh65') || h.title.toLowerCase().includes('pothole') || h.title.toLowerCase().includes('asphalt'));
        if (matches.length > 0) {
          const first = matches[0];
          replyText = `Audit details retrieved: Found ${matches.length} active asphalt failures on NH65 / Downtown corridors. Most critical: ${first.id} (${first.title}) located at "${first.location}". Status: ${first.status}. `;
          if (first.contractor) {
            replyText += `The contract is held by "${first.contractor}" with completion tracking at ${first.completionPercent}%. They must wrap up within ${first.timeRemaining || 'the next few hours'} to avoid standard municipal SLA penalties.`;
          } else {
            replyText += `Currently unassigned. Recommended dispatch protocols are requested immediately to deploy emergency patching units.`;
          }
          citations = matches.map(m => ({ id: m.id, title: m.title, type: 'hazard' }));
        } else {
          replyText = `No active structural potholes are currently registered inside our database. All GIS nodes in the NH65 segment show a nominal Quality index.`;
        }
      } else if (normalizedText.includes('buildfast') || normalizedText.includes('contractor') || normalizedText.includes('buildright') || normalizedText.includes('health')) {
        const bfJobs = hazards.filter(h => h.contractor && h.contractor.toLowerCase().includes('buildfast'));
        const bfContracts = contracts.filter(c => c.contractor.toLowerCase().includes('buildfast'));

        replyText = `Contractor evaluation: BuildFast Pvt. Ltd. holds ${bfContracts.length} high-value contracts totalling ₹${bfContracts.reduce((acc, c) => acc + c.tenderValue, 0).toFixed(1)}Cr. They maintain an aggregate Operational Efficiency Score of ${bfContracts[0]?.efficiencyScore || 96}% (Optimal status). `;
        if (bfJobs.length > 0) {
          replyText += `They currently have ${bfJobs.length} active emergency patches assigned including ${bfJobs[0].id} which is ${bfJobs[0].completionPercent}% complete. Standard SLA metrics indicate high reliability (94.5% SLA adherence).`;
        } else {
          replyText += `All assigned repair tasks are fully resolved. No pending SLA breaches logged.`;
        }
        citations = bfContracts.map(bc => ({ id: bc.id, title: bc.name, type: 'contract' }));
      } else if (normalizedText.includes('spend') || normalizedText.includes('budget') || normalizedText.includes('utiliz') || normalizedText.includes('crore')) {
        const totalAllocated = contracts.reduce((acc, c) => acc + c.budgetAllocated, 0);
        const totalDisbursed = contracts.reduce((acc, c) => acc + c.amountDisbursed, 0);
        const utilization = ((totalDisbursed / totalAllocated) * 100).toFixed(1);

        replyText = `Fiscal auditing: The municipal administration has allocated ₹${totalAllocated.toFixed(2)}Cr across sectors for road infrastructure expansions. Current actual funds disbursed tracking sits at ₹${totalDisbursed.toFixed(2)}Cr, resulting in an aggregate Budget Utilization Index of ${utilization}%. `;
        replyText += `Top efficiency segment: ${contracts[0]?.name} (Tender Value ₹${contracts[0]?.tenderValue}Cr, holding score of 96%). The lowest-performing asset is Sector 12 smart light allocation under Metro Build Co.`;
        citations = contracts.map(c => ({ id: c.id, title: `${c.contractor} Contract`, type: 'contract' }));
      } else if (normalizedText.includes('sla') || normalizedText.includes('escalat') || normalizedText.includes('critical')) {
        const criticalCount = hazards.filter(h => h.severity === 'critical').length;
        replyText = `SLA telemetry: Currently detecting ${criticalCount} CRITICAL severity hazard nodes across district. Furthermore, the municipal SLA breach board has flagged active escalations: "Major Pothole Escalation" (14 minutes late, Sector 12) and "Traffic Signal Failure" (2 hours late, Broadway). Re-dispatch instructions have been prepared.`;
        citations = [
          { id: 'SLA-101', title: 'Major Pothole Escalation', type: 'hazard' },
          { id: 'SLA-102', title: 'Signal Failure Timeout', type: 'hazard' }
        ];
      } else {
        replyText = `Understood. Analyzing Aegis database... Currently managing ${hazards.length} registered hazards and ${contracts.length} active commercial public road grants. Safety indexes are operating at 88% overall compliance. Please specify a category (Potholes, Budgets, Contractor Names) to fetch grounded, cited metrics.`;
      }

      setIsTyping(false);
      setMessages(prev => [...prev, {
        id: Math.random().toString(),
        sender: 'assistant',
        text: replyText,
        timestamp: new Date(),
        citations: citations.length > 0 ? citations : undefined
      }]);
    }, 1000);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      {isOpen && (
        <div 
          id="aegis-chat"
          className="w-96 h-[500px] bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-2xl flex flex-col font-sans"
        >
          {/* Header */}
          <div className="bg-[#0f172a] p-4 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#2ea014] flex items-center justify-center">
                <Sparkles size={16} className="text-slate-900" />
              </div>
              <div>
                <h3 className="font-bold text-xs text-white uppercase tracking-wider flex items-center gap-1.5">
                  Aegis Intelligence <span className="bg-emerald-950 text-[#2ea014] text-[9px] font-bold px-1.5 py-0.5 rounded uppercase font-mono">RAG Bot</span>
                </h3>
                <p className="text-[10px] text-slate-400">Road Safety & Budget Audits</p>
              </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-white transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {/* Messages block */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-950/60 scrollbar-thin">
            {messages.map((m) => (
              <div key={m.id} className={`flex gap-2.5 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                {m.sender === 'assistant' && (
                  <div className="w-7 h-7 bg-slate-800 rounded flex items-center justify-center text-[#2ea014] self-start shrink-0">
                    <Bot size={14} />
                  </div>
                )}
                
                <div className="flex flex-col max-w-[80%] gap-1">
                  <div 
                    className={`p-3 rounded-lg text-xs leading-relaxed ${
                      m.sender === 'user'
                        ? 'bg-[#2ea014] text-white rounded-tr-none'
                        : 'bg-slate-900 text-slate-100 border border-slate-800 rounded-tl-none'
                    }`}
                  >
                    <p>{m.text}</p>

                    {m.citations && (
                      <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex flex-wrap gap-1.5">
                        <span className="text-[9px] text-slate-400 block w-full">Grounded Documents:</span>
                        {m.citations.map((c, i) => (
                          <span 
                            key={i}
                            className="bg-slate-950 text-[#2ea014] border border-slate-800 rounded px-1.5 py-0.5 text-[9px] font-mono select-all flex items-center gap-1"
                          >
                            <span className="w-1 h-1 bg-[#2ea014] rounded-full"></span>
                            {c.id} ({c.type === 'hazard' ? 'GIS' : 'SpendWatch'})
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <span className="text-[9px] text-slate-500 font-mono self-end">
                    {m.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                {m.sender === 'user' && (
                  <div className="w-7 h-7 bg-[#2ea014]/20 border border-[#2ea014]/50 rounded flex items-center justify-center text-[#2ea014] self-start shrink-0">
                    <User size={14} />
                  </div>
                )}
              </div>
            ))}

            {isTyping && (
              <div className="flex gap-2.5 justify-start">
                <div className="w-7 h-7 bg-slate-800 rounded flex items-center justify-center text-[#2ea014] shrink-0">
                  <Bot size={14} />
                </div>
                <div className="bg-slate-900 border border-slate-800 px-3.5 py-2.5 rounded-lg rounded-tl-none flex items-center gap-1">
                  <div className="w-1.5 h-1.5 bg-[#2ea014] rounded-full animate-bounce"></div>
                  <div className="w-1.5 h-1.5 bg-[#2ea014] rounded-full animate-bounce delay-100"></div>
                  <div className="w-1.5 h-1.5 bg-[#2ea014] rounded-full animate-bounce delay-200"></div>
                </div>
              </div>
            )}
            <div ref={scrollRef}></div>
          </div>

          {/* Quick Predefined Queries block */}
          {messages.length === 1 && (
            <div className="p-3 bg-slate-950 border-t border-slate-900">
              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block mb-1.5">RAG Query Shortcuts</span>
              <div className="grid grid-cols-2 gap-1.5">
                {predefinedQueries.map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendMessage(item.query)}
                    className="text-[10px] text-left text-slate-300 hover:text-white bg-slate-900 border border-slate-800 hover:border-[#2ea014] px-2 py-1.5 rounded-md transition-colors truncate"
                  >
                    {item.text}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input field */}
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage(inputVal);
            }}
            className="p-3 bg-[#0a0f1d] border-t border-slate-800 flex gap-2"
          >
            <input
              type="text"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              placeholder="Query database, budget formulas, etc..."
              className="flex-1 bg-slate-900 text-white text-xs border border-slate-800 focus:border-[#2ea014] rounded p-2 focus:outline-none placeholder-slate-500"
            />
            <button
              type="submit"
              disabled={!inputVal.trim()}
              className="px-3 bg-[#2ea014] hover:bg-[#258210] disabled:bg-slate-800 text-white disabled:text-slate-500 text-xs font-bold rounded flex items-center justify-center transition-colors shadow"
            >
              <Send size={14} />
            </button>
          </form>
        </div>
      )}

      {/* Button widget */}
      <button
        onClick={() => setIsOpen(p => !p)}
        className="w-12 h-12 rounded-full bg-[#2ea014] hover:bg-[#258210] text-white hover:scale-105 active:scale-95 transition-all shadow-lg flex items-center justify-center outline-none"
      >
        {isOpen ? <X size={20} /> : <MessageSquare size={20} />}
      </button>
    </div>
  );
}
