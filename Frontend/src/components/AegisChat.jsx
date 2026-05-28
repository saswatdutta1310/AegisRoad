import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, Send, X, Bot, Sparkles, User, HelpCircle } from 'lucide-react';
import { chatApi } from '../services/api';

const QUICK = [
  { text: 'Potholes on NH65?',   query: 'Are there active pothole issues on NH65?' },
  { text: 'BuildFast compliant?', query: 'Is BuildFast Pvt. Ltd. meeting repair deadlines?' },
  { text: 'Budget utilisation?',  query: 'What is the total spend and budget utilisation?' },
  { text: 'Critical SLA alerts?', query: 'Any critical unassigned hazards or SLA escalations?' },
];

export default function AegisChat({ hazards = [], contracts = [] }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      role: 'assistant',
      text: "Welcome, Officer. I am Aegis Intelligence, your municipal road safety and fiscal auditor bot. I have digested the active GIS hazard logs and SpendWatch tables for the current quarter. Ask me anything about regional road conditions, contractor accountability, or budget utilization rates.",
      timestamp: new Date()
    }
  ]);
  const [inputVal, setInputVal] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping]);

  const handleSendMessage = async (text) => {
    if (!text.trim() || isTyping) return;
    const userMsg = { id: crypto.randomUUID(), role: 'user', text: text, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInputVal(''); 
    setIsTyping(true);
    
    const history = messages
      .filter(m => m.role==='user' || m.role==='assistant')
      .map(m => ({ role: m.role, content: m.text }));
      
    try {
      const reply = await chatApi.send(text, history);
      setMessages(prev => [...prev,
        { id: crypto.randomUUID(), role: 'assistant', text: reply, timestamp: new Date() }]);
    } catch {
      setMessages(prev => [...prev, { id: crypto.randomUUID(), role: 'assistant',
        text: 'Connection error. Check AegisRoad backend is running.', timestamp: new Date() }]);
    } finally { 
      setIsTyping(false); 
    }
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
                  Aegis Intelligence <span className="bg-emerald-950 text-[#2ea014] text-[9px] font-bold px-1.5 py-0.5 rounded uppercase font-mono">Claude Sonnet 4</span>
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
              <div key={m.id} className={`flex gap-2.5 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {m.role === 'assistant' && (
                  <div className="w-7 h-7 bg-slate-800 rounded flex items-center justify-center text-[#2ea014] self-start shrink-0">
                    <Bot size={14} />
                  </div>
                )}
                
                <div className="flex flex-col max-w-[80%] gap-1">
                  <div 
                    className={`p-3 rounded-lg text-xs leading-relaxed ${
                      m.role === 'user'
                        ? 'bg-[#2ea014] text-white rounded-tr-none'
                        : 'bg-slate-900 text-slate-100 border border-slate-800 rounded-tl-none'
                    }`}
                  >
                    <p>{m.text}</p>
                  </div>
                  <span className="text-[9px] text-slate-500 font-mono self-end">
                    {m.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                {m.role === 'user' && (
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
              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block mb-1.5">Quick Queries</span>
              <div className="grid grid-cols-2 gap-1.5">
                {QUICK.map((item, idx) => (
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
              placeholder="Query road conditions, SLA compliance..."
              className="flex-1 bg-slate-900 text-white text-xs border border-slate-800 focus:border-[#2ea014] rounded p-2 focus:outline-none placeholder-slate-500"
            />
            <button
              type="submit"
              disabled={!inputVal.trim() || isTyping}
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
