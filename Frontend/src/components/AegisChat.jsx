import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, Send, X, Bot, Sparkles, User } from 'lucide-react';
import { chatApi } from '../services/api';

const QUICK = [
  { text: 'Potholes on NH65?',    query: 'Are there active pothole issues on NH65?' },
  { text: 'BuildFast compliant?', query: 'Is BuildFast Pvt. Ltd. meeting repair deadlines?' },
  { text: 'Budget utilisation?',  query: 'What is the total spend and budget utilisation?' },
  { text: 'Critical SLA alerts?', query: 'Any critical unassigned hazards or SLA escalations?' },
];

const T = { teal:'#072E24', tealMid:'#156B52', yellow:'#C8D400', cream:'#F4F0E6', creamDark:'#EAE5D6' };

export default function AegisChat({ hazards = [], contracts = [] }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([{
    id: 'welcome', role: 'assistant',
    text: "Welcome, Officer. I am Aegis Intelligence, your municipal road safety and fiscal auditor bot. I have digested the active GIS hazard logs and SpendWatch tables for the current quarter. Ask me anything about regional road conditions, contractor accountability, or budget utilization rates.",
    timestamp: new Date()
  }]);
  const [inputVal, setInputVal] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSend = async (text) => {
    if (!text.trim() || isTyping) return;
    const userMsg = { id: crypto.randomUUID(), role: 'user', text, timestamp: new Date() };
    setMessages(p => [...p, userMsg]);
    setInputVal('');
    setIsTyping(true);
    const history = messages.filter(m => m.role==='user'||m.role==='assistant').map(m => ({ role:m.role, content:m.text }));
    try {
      const reply = await chatApi.send(text, history);
      setMessages(p => [...p, { id: crypto.randomUUID(), role:'assistant', text:reply, timestamp:new Date() }]);
    } catch {
      setMessages(p => [...p, { id: crypto.randomUUID(), role:'assistant', text:'Connection error. Check AegisRoad backend is running.', timestamp:new Date() }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      {isOpen && (
        <div className="w-96 h-[520px] rounded-2xl overflow-hidden shadow-2xl flex flex-col" style={{ background:T.cream, border:`1px solid rgba(7,46,36,0.15)` }}>
          {/* Header */}
          <div className="p-4 flex items-center justify-between" style={{ background:T.teal }}>
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background:T.yellow }}>
                <Sparkles size={16} style={{ color:T.teal }} />
              </div>
              <div>
                <h3 className="text-sm font-black uppercase text-white flex items-center gap-2" style={{ fontFamily:"'Barlow Condensed',sans-serif" }}>
                  Aegis Intelligence
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded" style={{ background:T.yellow, color:T.teal, fontFamily:'monospace' }}>Claude Sonnet 4</span>
                </h3>
                <p className="text-[10px]" style={{ color:'rgba(255,255,255,0.55)' }}>Road Safety & Budget Audits</p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="cursor-pointer transition-colors" style={{ color:'rgba(255,255,255,0.55)' }}>
              <X size={18} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4" style={{ background:'rgba(244,240,230,0.7)' }}>
            {messages.map(m => (
              <div key={m.id} className={`flex gap-2.5 ${m.role==='user'?'justify-end':'justify-start'}`}>
                {m.role==='assistant' && (
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 self-start" style={{ background:T.teal }}>
                    <Bot size={13} style={{ color:T.yellow }} />
                  </div>
                )}
                <div className="flex flex-col max-w-[80%] gap-1">
                  <div className="p-3 rounded-xl text-xs leading-relaxed" style={
                    m.role==='user'
                      ? { background:T.teal, color:'#fff', borderRadius:'12px 12px 4px 12px' }
                      : { background:T.creamDark, color:T.teal, border:`1px solid rgba(13,30,27,0.1)`, borderRadius:'12px 12px 12px 4px' }
                  }>
                    {m.text}
                  </div>
                  <span className="text-[9px] font-mono self-end" style={{ color:'rgba(13,30,27,0.35)' }}>
                    {m.timestamp.toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})}
                  </span>
                </div>
                {m.role==='user' && (
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 self-start" style={{ background:'rgba(7,46,36,0.1)', border:`1px solid rgba(7,46,36,0.2)` }}>
                    <User size={13} style={{ color:T.teal }} />
                  </div>
                )}
              </div>
            ))}
            {isTyping && (
              <div className="flex gap-2.5">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ background:T.teal }}>
                  <Bot size={13} style={{ color:T.yellow }} />
                </div>
                <div className="px-3.5 py-2.5 rounded-xl flex items-center gap-1.5" style={{ background:T.creamDark, border:`1px solid rgba(13,30,27,0.1)` }}>
                  {[0,100,200].map(d => (
                    <div key={d} className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ background:T.tealMid, animationDelay:`${d}ms` }} />
                  ))}
                </div>
              </div>
            )}
            <div ref={scrollRef} />
          </div>

          {/* Quick queries */}
          {messages.length === 1 && (
            <div className="p-3 border-t" style={{ background:T.creamDark, borderColor:'rgba(13,30,27,0.1)' }}>
              <span className="text-[9px] font-black uppercase tracking-widest block mb-1.5" style={{ color:'rgba(13,30,27,0.4)', fontFamily:'monospace' }}>Quick Queries</span>
              <div className="grid grid-cols-2 gap-1.5">
                {QUICK.map((q,i) => (
                  <button key={i} onClick={() => handleSend(q.query)} className="text-[10px] text-left px-2 py-1.5 rounded-lg font-bold transition-all cursor-pointer truncate" style={{ background:T.cream, border:`1px solid rgba(13,30,27,0.1)`, color:T.teal }}>
                    {q.text}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <form onSubmit={e=>{e.preventDefault();handleSend(inputVal);}} className="p-3 flex gap-2 border-t" style={{ background:T.cream, borderColor:'rgba(13,30,27,0.1)' }}>
            <input
              type="text" value={inputVal} onChange={e=>setInputVal(e.target.value)}
              placeholder="Query road conditions, SLA compliance..."
              className="flex-1 text-xs rounded-lg px-3 py-2 outline-none"
              style={{ background:T.creamDark, border:`1px solid rgba(13,30,27,0.15)`, color:T.teal }}
            />
            <button type="submit" disabled={!inputVal.trim()||isTyping} className="px-3 rounded-lg font-black transition-all cursor-pointer disabled:opacity-40" style={{ background:T.teal, color:T.yellow }}>
              <Send size={14} />
            </button>
          </form>
        </div>
      )}

      {/* Floating button */}
      <button
        onClick={() => setIsOpen(p=>!p)}
        className="w-14 h-14 rounded-full flex items-center justify-center transition-all hover:scale-110 active:scale-95 shadow-lg cursor-pointer"
        style={{ background:T.teal, color:T.yellow, boxShadow:'0 8px 28px rgba(7,46,36,0.35)' }}
      >
        {isOpen ? <X size={22} /> : <MessageSquare size={22} />}
      </button>
    </div>
  );
}
