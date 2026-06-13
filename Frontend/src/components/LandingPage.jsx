import React, { useState, useEffect, useRef } from 'react';
import { 
  ArrowRight, MapPin, Coins, CheckCircle2, Mail, Activity
} from 'lucide-react';
import { toast } from 'react-toastify';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar, LineChart, Line
} from 'recharts';

// ── Ticker items ─────────────────────────────────────────
const TICKER_ITEMS = [
  'YOLOv8 Detection','Claude Sonnet 4','Avalanche Blockchain','V2I Drive Mode',
  'SpendWatch Audit','SLA Enforcement','Proof of Repair','Contractor Portal',
  'YOLOv8 Detection','Claude Sonnet 4','Avalanche Blockchain','V2I Drive Mode',
  'SpendWatch Audit','SLA Enforcement','Proof of Repair','Contractor Portal',
];

// ── Animated finance data ────────────────────────────────
const FINANCE_DATA = [
  { month: 'Jan', allocated: 4.2, disbursed: 2.8, efficiency: 78 },
  { month: 'Feb', allocated: 5.1, disbursed: 3.9, efficiency: 82 },
  { month: 'Mar', allocated: 4.8, disbursed: 4.1, efficiency: 85 },
  { month: 'Apr', allocated: 6.2, disbursed: 4.8, efficiency: 88 },
  { month: 'May', allocated: 5.7, disbursed: 5.1, efficiency: 90 },
  { month: 'Jun', allocated: 7.3, disbursed: 5.9, efficiency: 87 },
  { month: 'Jul', allocated: 6.8, disbursed: 6.2, efficiency: 92 },
  { month: 'Aug', allocated: 8.1, disbursed: 7.0, efficiency: 94 },
];

const SLA_DATA = [
  { name: 'BuildFast', score: 94 },
  { name: 'Apex Infra', score: 88 },
  { name: 'Core Asphalt', score: 76 },
  { name: 'Urban Safety', score: 91 },
  { name: 'Metro Build', score: 83 },
];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background:'#072E24', border:'1px solid rgba(200,212,0,0.2)', borderRadius:'10px', padding:'10px 14px' }}>
      <p style={{ color:'#C8D400', fontFamily:"'Barlow Condensed',sans-serif", fontWeight:700, marginBottom:'4px' }}>{label}</p>
      {payload.map((p,i) => (
        <p key={i} style={{ color:'rgba(255,255,255,0.8)', fontSize:'12px', margin:'2px 0' }}>
          {p.name}: <strong style={{ color:p.color }}>{typeof p.value === 'number' && p.value < 20 ? `${p.value}%` : `₹${p.value}Cr`}</strong>
        </p>
      ))}
    </div>
  );
};

export default function LandingPage({ 
  onNavigate, 
  onReportHazard,
  stats = { activeHazards: 8, contractSum: 24.5, compliances: 94.2, sensors: 1450 } 
}) {
  const [formData, setFormData] = useState({
    fullName: '', email: '', defectNote: '', selectedSeverity: 'medium', defectType: 'Pothole Cluster'
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [openFaq, setOpenFaq] = useState(null);
  const [graphTab, setGraphTab] = useState('budget');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.fullName || !formData.email || !formData.defectNote) {
      toast.error("Please fill in all required fields.");
      return;
    }
    if (onReportHazard) {
      const x = Math.floor(Math.random() * 60) + 20, y = Math.floor(Math.random() * 50) + 20;
      onReportHazard({
        title: `${formData.defectType} - Reported via Portal`,
        location: `Inquiry Area (x:${x}, y:${y})`,
        severity: formData.selectedSeverity, reporter: `Web Form: ${formData.fullName}`,
        status: 'unassigned', description: formData.defectNote,
        coordinates: { x, y }, depth: "Pending", affectedArea: "Pending",
        photoUrl: "https://images.unsplash.com/photo-1515162305285-0293e4767cc2?auto=format&fit=crop&q=80&w=600"
      });
    }
    setIsSubmitted(true);
    toast.success(`Ticket generated for ${formData.fullName}!`);
  };

  const steps = [
    { num:'01.', name:'Edge AI — YOLOv8 Hazard Detection', icon:'🤖',
      img:'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=400',
      desc:'YOLOv8-Nano trained on RDD2022 classifies D00/D10/D20/D40 defects. Live GPS auto-pins to the public map.' },
    { num:'02.', name:'Command Center — Government Dashboard', icon:'🏛️',
      img:'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=400',
      desc:'Municipal officers triage hazards, assign contractors, and monitor SLA countdown timers in real time.' },
    { num:'03.', name:'Drive Mode — V2I Alert System', icon:'🚗',
      img:'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?auto=format&fit=crop&q=80&w=400',
      desc:'Real GPS watchPosition with 500m geofence. Bilingual voice alerts via Web Speech API. Critical = 5 vibration pulses.' },
    { num:'04.', name:'AegisChat — Claude Sonnet 4 AI', icon:'💬',
      img:'https://images.unsplash.com/photo-1531746790731-6c087fecd65a?auto=format&fit=crop&q=80&w=400',
      desc:'RAG-grounded AI queries live hazard DB before every answer. Session persistent with feedback tracking.' },
    { num:'05.', name:'SpendWatch — Financial Accountability', icon:'💰',
      img:'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&q=80&w=400',
      desc:'Four-factor efficiency scoring. Live disbursement tracking, CSV audit export, contractor leaderboard.' },
    { num:'06.', name:'Contractor Portal — Job Queue', icon:'🏗️',
      img:'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&q=80&w=400',
      desc:'Contractors view job queue with SLA deadlines. Field workers log arrival, capture photo evidence, submit completion.' },
  ];

  const faqs = [
    { q:'What defect classes does AegisRoad detect?', a:'YOLOv8-Nano classifies D00 Longitudinal Cracks, D10 Transverse Cracks, D20 Alligator Cracking, and D40 Potholes — all with SLA deadlines from 7 days down to 24 hours for critical potholes.' },
    { q:'How is contractor accountability enforced?', a:'SLA countdown timers start on assignment. Breaches trigger automatic escalation emails to the Municipal Commissioner and penalty deductions calculated against the contractor efficiency score.' },
    { q:'Is the Avalanche blockchain integration real?', a:'Yes — proof-of-repair photo hashes are anchored on Avalanche Fuji testnet. Each completed repair generates an immutable transaction ID viewable in the Contractor Portal.' },
    { q:'Can citizens report hazards without logging in?', a:'Absolutely. The public Report Issue page and the Landing Page form both accept hazard reports with zero authentication. Reports auto-pin to the live GIS map immediately.' },
    { q:'What languages does Drive Mode support?', a:'Drive Mode delivers bilingual alerts — English first, followed by your selected BIMSTEC language (Hindi, Bengali, Tamil, Nepali, Sinhala, Burmese, Thai, or Dzongkha).' },
  ];

  const inp = "w-full text-sm px-3 py-2 rounded-lg outline-none transition-colors border";
  const inpStyle = { background:'#EAE5D6', borderColor:'rgba(7,46,36,0.2)', color:'#0D1E1B' };
  const S = { fontFamily:"'Barlow Condensed',sans-serif" };

  return (
    <div className="animate-fadeIn">

      {/* ── HERO ──────────────────────────────────────────── */}
      <section className="relative overflow-hidden" style={{ minHeight:'100vh', background:'linear-gradient(150deg,#c9d5d2 0%,#a8bcb6 35%,#7d9e96 70%,#5a807a 100%)' }}>
        <div className="absolute top-1/2 left-1/2 pointer-events-none select-none whitespace-nowrap" style={{ transform:'translate(-50%,-50%)', fontFamily:"'Barlow Condensed',sans-serif", fontSize:'clamp(80px,13vw,180px)', fontWeight:900, color:'#072E24', opacity:0.1, letterSpacing:'-4px', zIndex:0 }}>
          AEGIS<span style={{ color:'#C8D400' }}>ROAD</span>
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-14 grid grid-cols-1 lg:grid-cols-2 gap-10 items-center" style={{ minHeight:'100vh', paddingTop:'80px', paddingBottom:'60px' }}>
          {/* Left */}
          <div className="flex flex-col justify-center">
            <div className="w-[80px] h-[80px] rounded-full border-2 border-dashed flex items-center justify-center animate-spin-slow mb-6" style={{ borderColor:'rgba(7,46,36,0.3)', background:'rgba(200,212,0,0.15)' }}>
              <div className="text-center animate-spin-reverse">
                <span className="block text-lg" style={{ color:'#072E24' }}>→</span>
                <span className="block text-[6px] font-black uppercase tracking-widest leading-tight" style={{ color:'#072E24', ...S }}>Civic AI</span>
              </div>
            </div>
            <p className="text-xs font-semibold mb-3 uppercase tracking-widest hidden" style={{ color:'rgba(7,46,36,0.55)' }}>YOLOv8 · Claude Sonnet 4 · Avalanche Blockchain</p>
            <h1 className="font-black uppercase leading-none mb-4" style={{ ...S, fontSize:'clamp(38px,6vw,76px)', color:'#072E24', letterSpacing:'-1px' }}>
              THE SMARTEST<br/>WAY TO ENSURE<br/><span style={{ color:'#C8D400' }}>ROAD SAFETY</span>
            </h1>
            <p className="text-sm leading-relaxed mb-7" style={{ color:'rgba(7,46,36,0.65)', maxWidth:'360px' }}>
              Next-generation civic infrastructure platform automating road hazard detection, contractor dispatch, and proof-of-repair anchoring on-chain.
            </p>
            <div className="flex flex-wrap gap-3">
              <button onClick={() => onNavigate('explorer')} className="btn-primary" style={{ padding:'12px 28px', fontSize:'14px' }}>Explore Live Map →</button>
              <button onClick={() => onNavigate('edgeai')} className="btn-secondary" style={{ color:'rgba(7,46,36,0.7)', borderColor:'rgba(7,46,36,0.3)', background:'rgba(255,255,255,0.5)', padding:'12px 24px', fontSize:'13px' }}>Try Edge AI</button>
            </div>
            <div className="flex items-center gap-2.5 mt-10 text-sm font-medium" style={{ color:'rgba(7,46,36,0.55)' }}>
              <div className="w-8 h-8 rounded-full border flex items-center justify-center animate-bounce-slow" style={{ borderColor:'rgba(7,46,36,0.3)' }}>↓</div>
              Scroll Down
            </div>
          </div>
          {/* Right — 3D Card */}
          <div className="flex items-center justify-center lg:justify-end">
            <div className="animate-hero-float" style={{ width:'min(500px,100%)', height:'340px', perspective:'1200px', transformStyle:'preserve-3d', flexShrink:0 }}>
              <div className="relative w-full h-full rounded-[28px] overflow-hidden" style={{ background:'#072E24', boxShadow:'0 48px 96px rgba(0,0,0,0.45)' }}>
                <div className="absolute bottom-0 left-0 right-0 overflow-hidden" style={{ height:'52%', background:'linear-gradient(to bottom,#1a3028,#0d2018)', borderRadius:'0 0 28px 28px' }}>
                  <div className="absolute left-0 right-0 top-0 h-[3px]" style={{ background:'rgba(255,255,255,0.12)' }} />
                  <div className="absolute" style={{ left:'50%', top:'-36px', bottom:0, width:'6px', transform:'translateX(-50%)', background:'repeating-linear-gradient(to bottom,#C8D400 0,#C8D400 18px,transparent 18px,transparent 36px)', opacity:0.8, animation:'roadScrollLine 0.8s linear infinite' }} />
                </div>
                <div className="absolute inset-0 rounded-[28px]" style={{ background:'linear-gradient(135deg,rgba(7,46,36,0) 40%,rgba(7,46,36,0.65) 100%)' }} />
                <div className="absolute top-6 left-7" style={{ ...S, fontSize:'12px', fontWeight:900, color:'rgba(200,212,0,0.7)', letterSpacing:'0.12em', textTransform:'uppercase' }}>AegisRoad v3.0 · Municipal AI</div>
                {[{top:'36%',left:'28%',d:'0s'},{top:'28%',left:'54%',d:'0.6s'},{top:'18%',left:'68%',d:'1.2s'}].map((p,i) => (
                  <div key={i} className="absolute" style={{ top:p.top, left:p.left, width:'14px', height:'14px' }}>
                    <div className="w-full h-full rounded-full animate-pulse" style={{ background:'#FF4444' }} />
                    <div className="absolute inset-[-4px] rounded-full border-2 border-red-500" style={{ animation:`ping-ring 2s ease-in-out ${p.d} infinite` }} />
                  </div>
                ))}
                <div className="absolute top-5 right-5 w-[64px] h-[64px] rounded-full border-2 flex items-center justify-center animate-spin-slow" style={{ borderColor:'rgba(200,212,0,0.4)' }}>
                  <div className="text-center animate-spin-reverse" style={{ ...S, fontSize:'8px', fontWeight:700, color:'#C8D400', textTransform:'uppercase', letterSpacing:'0.1em', lineHeight:1.4 }}>AegisRoad<br/>v3.0<br/>↗</div>
                </div>
                <div className="absolute top-[56px] right-7 flex flex-col gap-1">
                  {['#FF4444','#C8D400','#44FF88'].map((c,i) => (
                    <div key={i} className="w-2.5 h-2.5 rounded-full animate-pulse" style={{ background:c, animationDelay:`${i*0.5}s` }} />
                  ))}
                </div>
                <div className="absolute bottom-7 left-7" style={{ ...S, fontSize:'22px', fontWeight:900, color:'#fff', lineHeight:1.1, textTransform:'uppercase' }}>
                  THE SMARTEST WAY TO<br/>ENSURE <span style={{ color:'#C8D400' }}>ROAD SAFETY</span>
                </div>
                <div className="absolute bottom-7 right-7 px-2.5 py-1 rounded-full text-[9px] font-black uppercase whitespace-nowrap" style={{ background:'#C8D400', color:'#072E24', ...S, letterSpacing:'0.08em' }}>YOLOv8 · Claude AI · Avalanche</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── TICKER ──────────────────────────────────────────── */}
      <div className="overflow-hidden py-3" style={{ background:'#C8D400' }}>
        <div className="flex gap-10 animate-ticker whitespace-nowrap">
          {TICKER_ITEMS.map((t,i) => (
            <span key={i} className="flex items-center gap-3 shrink-0 text-[17px] font-black uppercase tracking-wide" style={{ ...S, color:'#072E24' }}>
              {t} <span className="w-[6px] h-[6px] rounded-full bg-[#072E24] opacity-40 inline-block" />
            </span>
          ))}
        </div>
      </div>

      {/* ── COMMITMENT ──────────────────────────────────────── */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center px-6 sm:px-10 lg:px-14 py-14" style={{ background:'#072E24' }}>
        <div>
          <h2 className="text-[clamp(30px,4vw,54px)] font-black uppercase leading-[1.04] text-white mb-4" style={S}>
            OUR COMMITMENT TO<br/><span style={{ color:'#C8D400' }}>ZERO HAZARDS</span><br/>ON EVERY ROAD
          </h2>
          <p className="text-sm leading-relaxed" style={{ color:'rgba(255,255,255,0.55)', maxWidth:'400px' }}>
            AegisRoad automates how municipal governments detect road hazards, dispatch contractors with SLA deadlines, verify repairs with photo evidence, and anchor proof-of-repair immutably on blockchain.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-[2px]">
          {[
            { n:'6', l:'Defect Classes', yellow:true },
            { n:'26K+', l:'Training Images', yellow:false },
            { n:'5', l:'Platform Roles', yellow:false },
            { n:'24/7', l:'Active Monitoring', yellow:true },
          ].map((s,i) => (
            <div key={i} className="p-6 sm:p-7" style={{ background:s.yellow?'#C8D400':'#156B52' }}>
              <div className="text-[44px] font-black leading-none" style={{ ...S, color:s.yellow?'#072E24':'#C8D400' }}>{s.n}</div>
              <div className="text-xs font-bold uppercase tracking-widest mt-1" style={{ color:s.yellow?'rgba(7,46,36,0.65)':'rgba(200,212,0,0.65)' }}>{s.l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── MODULES ─────────────────────────────────────────── */}
      <section className="px-6 sm:px-10 lg:px-14 py-14" style={{ background:'#F4F0E6' }}>
        <div className="section-eyebrow mb-1">AegisRoad's</div>
        <div className="section-title mb-2">Platform Modules</div>
        <p className="section-sub mb-8 max-w-md">Six integrated modules form a complete civic infrastructure command platform.</p>
        <div className="flex flex-col gap-[2px]">
          {steps.map((s, i) => (
            <div key={i} onClick={() => setActiveStep(i)}
              className="flex items-center justify-between rounded-xl px-5 py-4 cursor-pointer transition-all"
              style={{ background:activeStep===i?'#C8D400':'#EAE5D6' }}
            >
              <div className="flex items-center gap-4 flex-1 min-w-0">
                <span className="shrink-0 text-sm font-bold opacity-50 hidden sm:block" style={{ ...S, color:'#156B52', minWidth:'24px' }}>{s.num}</span>
                <div className="min-w-0 flex-1">
                  <div className="text-base sm:text-[20px] font-black uppercase" style={{ ...S, color:'#072E24' }}>{s.name}</div>
                  {activeStep===i && (
                    <div className="flex items-start gap-4 mt-2">
                      <img src={s.img} alt={s.name} className="w-24 h-16 rounded-lg object-cover shrink-0 hidden sm:block" />
                      <p className="text-sm leading-relaxed" style={{ color:'rgba(13,30,27,0.7)' }}>{s.desc}</p>
                    </div>
                  )}
                </div>
              </div>
              <div className="w-14 h-10 sm:w-20 sm:h-14 rounded-xl flex items-center justify-center text-2xl sm:text-3xl shrink-0 ml-3" style={{ background:'rgba(7,46,36,0.1)' }}>{s.icon}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── APPROACH ────────────────────────────────────────── */}
      <section style={{ background:'#072E24' }}>
        <div className="grid grid-cols-1 lg:grid-cols-2">
          <div className="px-6 sm:px-10 lg:px-14 py-12 lg:border-r" style={{ borderColor:'rgba(255,255,255,0.07)' }}>
            <h2 className="text-[clamp(28px,4vw,52px)] font-black uppercase leading-[1.04] text-white mb-4" style={S}>
              A <span style={{ color:'#C8D400' }}>Personalized</span><br/>Civic Approach
            </h2>
            <p className="text-sm leading-relaxed mb-7" style={{ color:'rgba(255,255,255,0.5)' }}>
              Every deployment is configured to your municipality's unique infrastructure. AegisRoad integrates AI detection, role-based dashboards, and immutable blockchain records — holding contractors accountable across India and BIMSTEC nations.
            </p>
            <button onClick={() => onNavigate('explorer')} className="btn-primary" style={{ padding:'12px 28px', fontSize:'14px' }}>Live Map →</button>
          </div>
          <div className="px-6 sm:px-10 lg:px-14 py-12">
            {[
              { t:'Individual Deployment', s:'Custom city configuration with existing infrastructure' },
              { t:'RAG-Grounded AI Responses', s:'AegisChat queries live hazard DB before every answer' },
              { t:'24/7 Active SLA Enforcement', s:'Countdown timers, auto-escalation, and breach penalties' },
              { t:'Open REST API', s:'Full Swagger docs at /docs — integrate with any system' },
              { t:'PWA — Install on Any Device', s:'Android, iOS native-like with offline service worker' },
            ].map((f,i) => (
              <div key={i} className="py-4 border-b" style={{ borderColor:'rgba(255,255,255,0.07)', ...(i===0?{borderTop:'1px solid rgba(255,255,255,0.07)'}:{}) }}>
                <div className="text-[16px] font-black uppercase text-white mb-0.5" style={S}>{f.t}</div>
                <div className="text-sm" style={{ color:'rgba(255,255,255,0.38)' }}>{f.s}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── ROLES ───────────────────────────────────────────── */}
      <section className="px-6 sm:px-10 lg:px-14 py-14" style={{ background:'#EAE5D6' }}>
        <div className="section-eyebrow mb-1">Platform</div>
        <div className="section-title mb-2">User Roles & Portals</div>
        <p className="section-sub mb-8 max-w-md">Four distinct dashboards built for each stakeholder — with JWT-secured role-based access.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { icon:'🏛️', img:'https://images.unsplash.com/photo-1568992687947-868a62a9f521?auto=format&fit=crop&q=80&w=400', name:'Government Officer', org:'Municipal Road Corp', desc:'Full command center: hazard triage, contractor assignment, SLA timer control, SpendWatch dashboards, and all GIS maps.', tags:['Command Center','SpendWatch','HazardMap'], nav:'command' },
            { icon:'🏗️', img:'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&q=80&w=400', name:'Contractor', org:'BuildFast Pvt. Ltd.', desc:'Job queue with SLA deadlines visible before breach. Manages work submissions and efficiency score.', tags:['Job Queue','SLA Tracker','Penalty View'], nav:'contractor', yellow:true },
            { icon:'🔧', img:'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&q=80&w=400', name:'Field Worker', org:'Eagle Eye Patrols', desc:'Mobile Driver HUD: navigate to hazards, log GPS arrival, capture photo evidence, submit completion.', tags:['Driver HUD','GPS Nav','Photo Evidence'], nav:'driver' },
            { icon:'👁️', img:'https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&q=80&w=400', name:'Citizen', org:'Public Portal', desc:'Any citizen can report a road hazard with zero login. Report is auto-pinned to the live GIS map.', tags:['Hazard Report','Public Map','No Login'], nav:'citizen' },
            { icon:'🤖', img:'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=400', name:'Edge AI Observer', org:'Dashcam / Auto-detect', desc:'Upload dashcam image — YOLOv8-Nano classifies defects instantly. GPS auto-pins to map.', tags:['YOLOv8','Auto-pin','No Login'], nav:'edgeai' },
            { icon:'💬', img:'https://images.unsplash.com/photo-1531746790731-6c087fecd65a?auto=format&fit=crop&q=80&w=400', name:'AegisChat User', org:'AI-Powered Q&A', desc:'Ask anything about hazards, contractors, or road conditions. Claude Sonnet 4 with session persistence.', tags:['Claude AI','RAG','Persistent'], nav:null },
          ].map((r,i) => (
            <div key={i} className="rounded-2xl overflow-hidden transition-all cursor-default hover:-translate-y-1"
              style={{ background:'#FFFFFF', boxShadow:'0 2px 8px rgba(7,46,36,0.06)' }}
              onMouseEnter={e=>e.currentTarget.style.boxShadow='0 16px 40px rgba(7,46,36,0.12)'}
              onMouseLeave={e=>e.currentTarget.style.boxShadow='0 2px 8px rgba(7,46,36,0.06)'}
            >
              {/* Role image */}
              <div className="h-32 overflow-hidden relative">
                <img src={r.img} alt={r.name} className="w-full h-full object-cover" />
                <div className="absolute inset-0" style={{ background:'linear-gradient(to bottom,transparent 40%,rgba(7,46,36,0.6) 100%)' }} />
                <div className="absolute bottom-3 left-3 w-10 h-10 rounded-xl flex items-center justify-center text-xl" style={{ background:r.yellow?'#C8D400':'#072E24' }}>{r.icon}</div>
              </div>
              <div className="p-5">
                <div className="text-[18px] font-black uppercase mb-0.5" style={{ ...S, color:'#072E24' }}>{r.name}</div>
                <div className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color:'rgba(13,30,27,0.4)' }}>{r.org}</div>
                <p className="text-xs leading-relaxed mb-3" style={{ color:'rgba(13,30,27,0.6)', fontSize:'12px' }}>{r.desc}</p>
                <div className="flex flex-wrap gap-1 mb-3">
                  {r.tags.map(t => (
                    <span key={t} className="text-[10px] font-bold uppercase px-2 py-0.5 rounded" style={{ background:'#F4F0E6', color:'#072E24', letterSpacing:'0.05em' }}>{t}</span>
                  ))}
                </div>
                {r.nav && (
                  <button onClick={() => onNavigate(r.nav)} className="text-xs font-black uppercase tracking-wider flex items-center gap-1" style={{ color:'#156B52', ...S }}>
                    Open Portal <ArrowRight size={12} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── FINANCIAL ACCOUNTABILITY + ANIMATED GRAPH ───────── */}
      <section className="px-6 sm:px-10 lg:px-14 py-14" style={{ background:'#F4F0E6' }}>
        <div className="section-eyebrow mb-1">Financial</div>
        <div className="section-title mb-2">SpendWatch Accountability</div>
        <p className="section-sub mb-8 max-w-md">Every rupee of public infrastructure spend is tracked, scored, and auditable in real time.</p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Animated chart panel */}
          <div className="rounded-2xl p-6" style={{ background:'#072E24', border:'1px solid rgba(200,212,0,0.1)' }}>
            {/* Tab switcher */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-black uppercase text-white" style={S}>Live Finance Tracker</h3>
              <div className="flex gap-1 p-1 rounded-xl" style={{ background:'rgba(255,255,255,0.07)' }}>
                {['budget','efficiency','sla'].map(t => (
                  <button key={t} onClick={() => setGraphTab(t)}
                    className="px-3 py-1 rounded-lg text-[10px] font-black uppercase cursor-pointer transition-all"
                    style={{ background:graphTab===t?'#C8D400':'transparent', color:graphTab===t?'#072E24':'rgba(255,255,255,0.45)', ...S }}
                  >{t}</button>
                ))}
              </div>
            </div>

            {/* Summary KPIs */}
            <div className="grid grid-cols-3 gap-3 mb-5">
              {[
                { l:'Total Budget', v:'₹24.5 Cr', c:'#C8D400' },
                { l:'Disbursed', v:'₹18.2 Cr', c:'#7fd4b8' },
                { l:'Efficiency', v:'94.2%', c:'#ffaa55' },
              ].map((k,i) => (
                <div key={i} className="p-3 rounded-xl text-center" style={{ background:'rgba(255,255,255,0.06)' }}>
                  <div className="text-[9px] font-black uppercase mb-1 font-mono" style={{ color:'rgba(255,255,255,0.4)', letterSpacing:'0.1em' }}>{k.l}</div>
                  <div className="text-xl font-black" style={{ ...S, color:k.c }}>{k.v}</div>
                </div>
              ))}
            </div>

            {/* Animated chart */}
            <div style={{ height:'200px' }}>
              <ResponsiveContainer width="100%" height="100%">
                {graphTab === 'budget' ? (
                  <AreaChart data={FINANCE_DATA} margin={{ top:5, right:5, left:-20, bottom:0 }}>
                    <defs>
                      <linearGradient id="allocGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#C8D400" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#C8D400" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="disbGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#7fd4b8" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#7fd4b8" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                    <XAxis dataKey="month" stroke="rgba(255,255,255,0.3)" fontSize={10} tickLine={false} />
                    <YAxis stroke="rgba(255,255,255,0.3)" fontSize={10} tickLine={false} unit="Cr" />
                    <Tooltip content={<CustomTooltip />} />
                    <Area type="monotone" dataKey="allocated" name="Allocated" stroke="#C8D400" fill="url(#allocGrad)" strokeWidth={2} />
                    <Area type="monotone" dataKey="disbursed" name="Disbursed" stroke="#7fd4b8" fill="url(#disbGrad)" strokeWidth={2} />
                  </AreaChart>
                ) : graphTab === 'efficiency' ? (
                  <BarChart data={SLA_DATA} margin={{ top:5, right:5, left:-20, bottom:0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                    <XAxis dataKey="name" stroke="rgba(255,255,255,0.3)" fontSize={9} tickLine={false} />
                    <YAxis stroke="rgba(255,255,255,0.3)" fontSize={10} tickLine={false} domain={[60,100]} unit="%" />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="score" name="SLA Score" fill="#C8D400" radius={[4,4,0,0]} />
                  </BarChart>
                ) : (
                  <LineChart data={FINANCE_DATA} margin={{ top:5, right:5, left:-20, bottom:0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                    <XAxis dataKey="month" stroke="rgba(255,255,255,0.3)" fontSize={10} tickLine={false} />
                    <YAxis stroke="rgba(255,255,255,0.3)" fontSize={10} tickLine={false} domain={[70,100]} unit="%" />
                    <Tooltip content={<CustomTooltip />} />
                    <Line type="monotone" dataKey="efficiency" name="SLA Efficiency" stroke="#ffaa55" strokeWidth={2.5} dot={{ fill:'#ffaa55', r:3 }} activeDot={{ r:5 }} />
                  </LineChart>
                )}
              </ResponsiveContainer>
            </div>
          </div>

          {/* Formula + weight bars */}
          <div className="flex flex-col gap-4">
            <div className="rounded-2xl p-6 relative overflow-hidden flex-1" style={{ background:'#072E24' }}>
              <div className="absolute inset-0" style={{ background:'linear-gradient(135deg,rgba(200,212,0,0.04) 0%,transparent 60%)' }} />
              <span className="relative z-10 block text-[9px] font-bold uppercase tracking-widest mb-2 font-mono" style={{ color:'#C8D400' }}>Efficiency Score Formula</span>
              <div className="relative z-10 font-mono text-xs leading-[2] text-white">
                Score = (<span style={{ color:'#C8D400' }}>SLA × 0.40</span>)
                + (<span style={{ color:'#7fd4b8' }}>Budget × 0.30</span>)
                + (<span style={{ color:'#ffaa55' }}>Quality × 0.20</span>)
                + (<span style={{ color:'#ff8888' }}>Rating × 0.10</span>)
              </div>
            </div>
            <div className="grid grid-cols-2 gap-[2px]">
              {[
                { pct:'40%', label:'SLA Compliance', weight:'×0.40', color:'#C8D400' },
                { pct:'30%', label:'Budget Efficiency', weight:'×0.30', color:'#7fd4b8' },
                { pct:'20%', label:'Work Quality', weight:'×0.20', color:'#ffaa55' },
                { pct:'10%', label:'Civic Rating', weight:'×0.10', color:'#ff8888' },
              ].map((b,i) => (
                <div key={i} className="rounded-xl p-4 text-center" style={{ background:'#EAE5D6' }}>
                  <div className="text-[32px] font-black leading-none mb-0.5" style={{ ...S, color:b.color==='#C8D400'?'#072E24':'#072E24' }}>{b.pct}</div>
                  <div className="text-[10px] font-bold uppercase mb-1.5" style={{ color:'rgba(13,30,27,0.5)' }}>{b.label}</div>
                  <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded" style={{ background:'#072E24', color:'#C8D400', letterSpacing:'0.08em' }}>{b.weight}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="text-center">
          <button onClick={() => onNavigate('spend')} className="btn-primary" style={{ padding:'12px 28px', fontSize:'14px' }}>View SpendWatch Dashboard →</button>
        </div>
      </section>

      {/* ── FAQ ─────────────────────────────────────────────── */}
      <section className="px-6 sm:px-10 lg:px-14 py-14 relative overflow-hidden" style={{ background:'#EAE5D6' }}>
        <div className="absolute w-[160px] h-[160px] rounded-full flex items-center justify-center" style={{ background:'#C8D400', top:'-60px', left:'-60px' }}>
          <span className="text-[10px] font-black uppercase tracking-wider" style={{ color:'#072E24', transform:'rotate(-30deg)', opacity:0.55, ...S }}>FAQ</span>
        </div>
        <div className="text-center font-black uppercase mb-8 relative z-10 overflow-hidden" style={{ ...S, fontSize:'clamp(40px,8vw,90px)', color:'rgba(13,30,27,0.06)', letterSpacing:'0.08em' }}>QUESTIONS</div>
        <div className="max-w-[720px] mx-auto relative z-10">
          {faqs.map((f,i) => (
            <div key={i} className="border-b py-4" style={{ borderColor:'rgba(13,30,27,0.12)' }}>
              <button className="w-full flex items-center justify-between text-left gap-4" onClick={() => setOpenFaq(openFaq===i?null:i)}>
                <span className="text-[18px] font-black uppercase" style={{ ...S, color:openFaq===i?'#156B52':'#072E24' }}>{f.q}</span>
                <span className="text-xl font-light shrink-0 transition-transform" style={{ color:'rgba(13,30,27,0.4)', transform:openFaq===i?'rotate(45deg)':'none' }}>+</span>
              </button>
              {openFaq===i && <p className="text-sm leading-relaxed mt-2" style={{ color:'rgba(13,30,27,0.6)' }}>{f.a}</p>}
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA + QUICK REPORT ──────────────────────────────── */}
      <section className="px-6 sm:px-10 lg:px-14 py-14" style={{ background:'#F4F0E6' }}>
        <div className="rounded-[24px] p-8 sm:p-12 grid grid-cols-1 lg:grid-cols-2 gap-10 items-center relative overflow-hidden" style={{ background:'#072E24' }}>
          <div className="absolute right-[-20px] bottom-[-40px] font-black uppercase pointer-events-none" style={{ ...S, fontSize:'160px', color:'rgba(200,212,0,0.04)', letterSpacing:'-6px', lineHeight:1 }}>AEGIS</div>
          <div className="relative z-10">
            <h2 className="text-[clamp(26px,3.5vw,46px)] font-black uppercase leading-[1.1] text-white mb-4" style={S}>
              REPORT A <span style={{ color:'#C8D400' }}>ROAD HAZARD</span> RIGHT NOW
            </h2>
            <p className="text-sm leading-relaxed mb-6" style={{ color:'rgba(255,255,255,0.5)' }}>
              No login required — your report auto-pins to the live GIS map and triggers contractor dispatch.
            </p>
            <div className="flex flex-col gap-3">
              <button onClick={() => onNavigate('citizen')} className="btn-primary" style={{ padding:'12px 24px', fontSize:'14px' }}>Open Full Report Form →</button>
              <button onClick={() => onNavigate('explorer')} className="btn-secondary" style={{ padding:'10px 24px', fontSize:'13px' }}>View Public Hazard Map</button>
            </div>
          </div>
          <div className="relative z-10 rounded-2xl p-5" style={{ background:'#F4F0E6' }}>
            <div className="absolute top-0 right-5 text-[8px] font-black uppercase px-2 py-0.5 rounded-b tracking-widest font-mono" style={{ background:'#C8D400', color:'#072E24' }}>QUICK REPORT</div>
            <h3 className="text-[20px] font-black uppercase mb-4" style={{ ...S, color:'#072E24' }}>Report a Road Defect</h3>
            {!isSubmitted ? (
              <form onSubmit={handleSubmit} className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[9px] font-black uppercase tracking-wider mb-1 font-mono" style={{ color:'rgba(13,30,27,0.5)' }}>Your Name *</label>
                    <input type="text" placeholder="Sandra Arjun" required value={formData.fullName} onChange={e=>setFormData({...formData,fullName:e.target.value})} className={inp} style={inpStyle} />
                  </div>
                  <div>
                    <label className="block text-[9px] font-black uppercase tracking-wider mb-1 font-mono" style={{ color:'rgba(13,30,27,0.5)' }}>Email *</label>
                    <input type="email" placeholder="s.arjun@gmail.com" required value={formData.email} onChange={e=>setFormData({...formData,email:e.target.value})} className={inp} style={inpStyle} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[9px] font-black uppercase tracking-wider mb-1 font-mono" style={{ color:'rgba(13,30,27,0.5)' }}>Defect Type</label>
                    <select value={formData.defectType} onChange={e=>setFormData({...formData,defectType:e.target.value})} className={inp} style={inpStyle}>
                      <option>Pothole Cluster</option><option>Severe Asphalt Breach</option><option>Guardrail Degradation</option><option>Drainage Blockage</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[9px] font-black uppercase tracking-wider mb-1 font-mono" style={{ color:'rgba(13,30,27,0.5)' }}>Priority</label>
                    <select value={formData.selectedSeverity} onChange={e=>setFormData({...formData,selectedSeverity:e.target.value})} className={inp} style={inpStyle}>
                      <option value="critical">Critical (SLA 4h)</option><option value="high">High (SLA 12h)</option><option value="medium">Medium (SLA 24h)</option><option value="low">Low (SLA 72h)</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-[9px] font-black uppercase tracking-wider mb-1 font-mono" style={{ color:'rgba(13,30,27,0.5)' }}>Describe Issue *</label>
                  <textarea rows="2" placeholder="Specific details & nearest landmark..." required value={formData.defectNote} onChange={e=>setFormData({...formData,defectNote:e.target.value})} className={inp+" resize-none"} style={inpStyle} />
                </div>
                <button type="submit" className="w-full py-2.5 rounded-xl text-sm font-black uppercase tracking-wider cursor-pointer transition-all hover:scale-[1.01]" style={{ background:'#072E24', color:'#C8D400', ...S }}>Submit Incident Ticket →</button>
              </form>
            ) : (
              <div className="text-center py-6 space-y-4">
                <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto" style={{ background:'rgba(7,46,36,0.1)', border:'2px solid #072E24' }}>
                  <CheckCircle2 size={22} style={{ color:'#072E24' }} />
                </div>
                <h4 className="text-lg font-black uppercase" style={{ ...S, color:'#072E24' }}>Incident Logged!</h4>
                <p className="text-sm" style={{ color:'rgba(13,30,27,0.6)' }}>Contractor alerted. SLA benchmarks active.</p>
                <button onClick={() => setIsSubmitted(false)} className="text-sm font-bold uppercase tracking-wider px-4 py-2 rounded-lg cursor-pointer" style={{ border:'1px solid rgba(13,30,27,0.2)', color:'rgba(13,30,27,0.6)' }}>Log Another Issue</button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── LIVE STATS ──────────────────────────────────────── */}
      <section className="grid grid-cols-2 lg:grid-cols-4" style={{ background:'#072E24', gap:'2px' }}>
        {[
          { label:'ACTIVE HAZARDS', val:stats.activeHazards, sub:'Verified civic defects', color:'#ff6b6b' },
          { label:'CAPITAL AUDITED', val:`₹${stats.contractSum.toFixed(1)}Cr`, sub:'Approved allocations', color:'#C8D400' },
          { label:'SLA COMPLIANCE', val:`${stats.compliances}%`, sub:'Average response metric', color:'#ffaa55' },
          { label:'USERS ENROLLED', val:`+${stats.sensors}`, sub:'Passive crowd scanning', color:'#7fd4b8' },
        ].map((s,i) => (
          <div key={i} className="p-6 sm:p-7" style={{ background:i%2===0?'rgba(255,255,255,0.03)':'rgba(255,255,255,0.06)' }}>
            <div className="text-[9px] font-black uppercase tracking-widest mb-2 flex items-center gap-1.5 font-mono" style={{ color:'rgba(255,255,255,0.4)' }}>
              <span className="w-1.5 h-1.5 rounded-full animate-pulse inline-block" style={{ background:s.color }} />{s.label}
            </div>
            <div className="text-[40px] font-black leading-none mb-1" style={{ ...S, color:s.color }}>{s.val}</div>
            <div className="text-xs" style={{ color:'rgba(255,255,255,0.3)' }}>{s.sub}</div>
          </div>
        ))}
      </section>

      {/* ── LIVE RESOLUTION FEED ────────────────────────────── */}
      <section className="px-6 sm:px-10 lg:px-14 py-12" style={{ background:'#EAE5D6' }}>
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-6 gap-4">
          <div>
            <div className="section-eyebrow mb-1">Live</div>
            <div className="section-title">Contractor Resolutions</div>
            <p className="section-sub mt-1 max-w-sm">Cryptographically verified infrastructure repairs completed in the last 24 hours.</p>
          </div>
          <button onClick={() => onNavigate('explorer')} className="btn-primary shrink-0 hidden sm:block" style={{ padding:'10px 22px', fontSize:'13px' }}>View All →</button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              id:'HAZ-8821', title:'Severe Pothole Repair', contractor:'BuildFast Pvt. Ltd.', time:'14 mins ago',
              img:'https://images.unsplash.com/photo-1515162305285-0293e4767cc2?auto=format&fit=crop&q=80&w=400'
            },
            {
              id:'HAZ-1194', title:'Guardrail Reinstallation', contractor:'Apex Infrastruct', time:'2 hours ago',
              img:'https://images.unsplash.com/photo-1502877338535-766e1452684a?auto=format&fit=crop&q=80&w=400'
            },
            {
              id:'HAZ-6632', title:'Drainage Channel Clearance', contractor:'Metro Build Co.', time:'5 hours ago',
              img:'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?auto=format&fit=crop&q=80&w=400'
            },
          ].map((item,i) => (
            <div key={i} className="flex items-center gap-4 p-4 rounded-2xl transition-all" style={{ background:'#FFFFFF', boxShadow:'0 2px 8px rgba(7,46,36,0.06)' }}>
              <img src={item.img} alt={item.title} className="w-16 h-16 rounded-xl object-cover shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="flex justify-between mb-0.5">
                  <span className="text-[9px] font-black tracking-wider font-mono" style={{ color:'#156B52' }}>{item.id}</span>
                  <span className="text-[9px] font-mono" style={{ color:'rgba(13,30,27,0.4)' }}>{item.time}</span>
                </div>
                <h4 className="text-sm font-bold truncate" style={{ color:'#072E24' }}>{item.title}</h4>
                <div className="flex items-center gap-1 mt-0.5 text-[10px]" style={{ color:'rgba(13,30,27,0.5)' }}>
                  <CheckCircle2 size={9} style={{ color:'#156B52' }} />
                  Verified by <span className="font-bold ml-0.5" style={{ color:'#072E24' }}>{item.contractor}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CONTACT ─────────────────────────────────────────── */}
      <section className="px-6 sm:px-10 lg:px-14 py-12 text-center" id="contact" style={{ background:'#F4F0E6' }}>
        <h3 className="text-[clamp(20px,3vw,34px)] font-black uppercase max-w-2xl mx-auto leading-tight mb-8" style={{ ...S, color:'#072E24' }}>
          Whether you have a question about our services, pricing, or anything else — our team is ready
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-4xl mx-auto">
          {[
            { icon:<MapPin size={18}/>, label:'Office Address', val:'127/A, Church Road, Colombo' },
            { icon:<Mail size={18}/>, label:'Email Assistance', val:'info@aegisroad.gov.in' },
            { icon:<Activity size={18}/>, label:'Platform Status', val:'All systems operational' },
          ].map((c,i) => (
            <div key={i} className="flex items-center gap-3 p-4 rounded-xl text-left" style={{ background:'#EAE5D6', border:'1px solid rgba(13,30,27,0.08)' }}>
              <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0" style={{ background:'rgba(7,46,36,0.1)', color:'#072E24' }}>{c.icon}</div>
              <div>
                <span className="text-[9px] font-black uppercase tracking-wider block mb-0.5 font-mono" style={{ color:'rgba(13,30,27,0.4)' }}>{c.label}</span>
                <strong className="text-sm font-bold" style={{ ...S, color:'#072E24' }}>{c.val}</strong>
              </div>
            </div>
          ))}
        </div>
      </section>

      <style>{`@keyframes roadScrollLine { from { background-position: 0 0; } to { background-position: 0 36px; } }`}</style>
    </div>
  );
}
