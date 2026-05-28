import React, { useState } from 'react';
import { 
  ShieldCheck, ArrowRight, MapPin, Coins, Smartphone, Wrench, 
  Sparkles, Shield, BarChart3, Heart, Globe, AlertOctagon, Scale, Award,
  CheckCircle2, Users, HelpCircle, Phone, Mail, MapPinned, Activity
} from 'lucide-react';
import { toast } from 'react-toastify';

export default function LandingPage({ 
  onNavigate, 
  onReportHazard,
  stats = { activeHazards: 8, contractSum: 24.5, compliances: 94.2, sensors: 1450 } 
}) {
  // Form submission state
  const [formData, setFormData] = useState({
    fullName: '',
    company: '',
    email: '',
    phone: '',
    defectNote: '',
    selectedSeverity: 'medium',
    defectType: 'Pothole Cluster'
  });
  
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.fullName || !formData.email || !formData.defectNote) {
      toast.error("Please fill in all required fields (Name, Email, and Project Details).");
      return;
    }

    // Creating a legitimate hazard to push into active state
    if (onReportHazard) {
      const x_coord = Math.floor(Math.random() * 60) + 20;
      const y_coord = Math.floor(Math.random() * 50) + 20;
      onReportHazard({
        title: `${formData.defectType} - Reported via Portal Inquiry`,
        location: `Inquiry Area (Lat Range x:${x_coord}, y:${y_coord})`,
        severity: formData.selectedSeverity,
        reporter: `Web Form: ${formData.fullName}`,
        status: 'unassigned',
        description: formData.defectNote,
        coordinates: { x: x_coord, y: y_coord },
        depth: "Pending Measurement",
        affectedArea: "Pending Inspection",
        photoUrl: "https://images.unsplash.com/photo-1515162305285-0293e4767cc2?auto=format&fit=crop&q=80&w=600"
      });
    }

    setIsSubmitted(true);
    toast.success(`Success! Public ticket generated for ${formData.fullName}. Assigned default SLA.`, {
      position: "top-right"
    });
  };

  const handleResetForm = () => {
    setFormData({
      fullName: '',
      company: '',
      email: '',
      phone: '',
      defectNote: '',
      selectedSeverity: 'medium',
      defectType: 'Pothole Cluster'
    });
    setIsSubmitted(false);
  };

  // Simple, polished core solutions
  const solutions = [
    { 
      title: "Real-time Road Audits", 
      desc: "Passive computer vision scanning to automatically detect and log potholes, cracks, and safety hazards.", 
      icon: <ShieldCheck size={20} /> 
    },
    { 
      title: "Dynamic Route Warnings", 
      desc: "Verifying and synchronizing road defects directly with driver heads-up telemetry layers and safety radars.", 
      icon: <Smartphone size={20} /> 
    },
    { 
      title: "SpendWatch Ledger", 
      desc: "Providing transparent public oversight by linking infrastructure maintenance directly with contractor resolution SLAs.", 
      icon: <Coins size={20} /> 
    },
    { 
      title: "Interactive AegisChat", 
      desc: "A conversational RAG assistant capable of instantly querying local budgets and municipal compliance logs.", 
      icon: <Sparkles size={20} /> 
    }
  ];

  return (
    <div className="space-y-16 py-4 animate-fadeIn">
      
      {/* 1. Clear, Uncluttered Hero Segment */}
      <section className="relative overflow-hidden rounded-3xl bg-[#090f1d] border border-slate-800/80">
        
        {/* Subtle background image */}
        <div className="absolute inset-0 z-0 opacity-25 mix-blend-lighten pointer-events-none">
          <img 
            src="https://images.unsplash.com/photo-1506012787146-f92b2d7d6d96?auto=format&fit=crop&q=80&w=1400" 
            alt="City Highway Dusk Traffic" 
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#090f1d] via-[#090f1d]/85 to-transparent"></div>
        </div>

        {/* Subtle radial dots */}
        <div className="absolute inset-0 opacity-5 z-0 pointer-events-none" style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, #fff 1px, transparent 0)',
          backgroundSize: '24px 24px'
        }}></div>

        <div className="relative z-10 px-6 py-10 md:p-12 lg:p-14 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Hero text */}
          <div className="lg:col-span-7 space-y-5">
            <div className="inline-flex items-center gap-1.5 bg-green-950/90 border border-green-800/60 px-3 py-1 rounded-full text-green-400 text-[10px] font-mono font-bold tracking-wider uppercase">
              <Sparkles size={11} className="animate-pulse" />
              Public Infrastructure Watch
            </div>
            
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-display font-extrabold text-white leading-tight">
              Honest Pavement <br />
              <span className="text-[#2ea014] filter drop-shadow-[0_2px_6px_rgba(46,160,20,0.25)]">Safety & Spend</span>
            </h1>
            
            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed max-w-lg">
              AegisRoad connects real-time road condition telemetry with municipal financial transparency. 
              We track civic hazards, dispatch qualified regional contractors, and audit public spend automatically.
            </p>

            <div className="flex flex-wrap gap-3 pt-2">
              <button
                id="hero-discover-map"
                onClick={() => onNavigate('explorer')}
                className="px-5 py-3 rounded-lg bg-[#2ea014] hover:bg-[#3cd01c] text-white font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 transition-all hover:scale-[1.01] shadow shadow-green-950/60 cursor-pointer"
              >
                Explore Active Map
                <ArrowRight size={13} />
              </button>
              
              <button
                id="hero-inspect-budget"
                onClick={() => onNavigate('spend')}
                className="px-5 py-3 rounded-lg bg-slate-900/90 hover:bg-slate-800/90 border border-slate-800 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 transition-all hover:scale-[1.01] cursor-pointer"
              >
                Inspect Budgets
                <Coins size={13} className="text-[#2ea014]" />
              </button>
            </div>
          </div>

          {/* Clean, Human-Friendly Report Form Overlay */}
          <div className="lg:col-span-12 lg:max-w-md lg:mx-auto xl:max-w-none xl:col-span-5 bg-slate-950/95 backdrop-blur-xl rounded-2xl p-6 border border-slate-800/80 shadow-2xl relative">
            <div className="absolute top-0 right-6 bg-[#2ea014] text-white text-[8px] font-mono uppercase px-2 py-0.5 rounded-b font-bold tracking-widest">
              SECURE INTENT
            </div>

            <h3 className="text-lg font-display font-bold text-white mb-1">
              Report a Road Defect
            </h3>
            <p className="text-[11px] text-slate-400 mb-5">
              Submit local potholes or crumbling pavements to trigger immediate contractor review.
            </p>

            {!isSubmitted ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[9px] uppercase font-bold text-slate-400 mb-1 tracking-wider">Your Name *</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Sandra Arjun"
                      required
                      value={formData.fullName}
                      onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                      className="w-full text-xs bg-slate-900 border border-slate-800 focus:border-[#2ea014] text-white rounded-lg px-3 py-2 outline-none transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] uppercase font-bold text-slate-400 mb-1 tracking-wider">Email Address *</label>
                    <input 
                      type="email" 
                      placeholder="e.g. s.arjun@gmail.com"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="w-full text-xs bg-slate-900 border border-slate-800 focus:border-[#2ea014] text-white rounded-lg px-3 py-2 outline-none transition-colors"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-900/40 p-2 border border-slate-850 rounded">
                  <div>
                    <label className="block text-[9px] uppercase font-bold text-slate-400 mb-1 tracking-wider">Defect Type</label>
                    <select
                      value={formData.defectType}
                      onChange={(e) => setFormData({...formData, defectType: e.target.value})}
                      className="w-full text-xs bg-slate-950 border border-slate-800 text-white rounded px-2 py-1 focus:border-[#2ea014] focus:outline-none"
                    >
                      <option value="Pothole Cluster">Pothole Cluster</option>
                      <option value="Severe Asphalt Breach">Asphalt Breach</option>
                      <option value="Guardrail Degradation">Guardrail Damage</option>
                      <option value="Drainage Blockage">Drainage Blockage</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[9px] uppercase font-bold text-slate-400 mb-1 tracking-wider">Priority Level</label>
                    <select
                      value={formData.selectedSeverity}
                      onChange={(e) => setFormData({...formData, selectedSeverity: e.target.value})}
                      className="w-full text-xs bg-slate-950 border border-slate-800 text-white rounded px-2 py-1 focus:border-[#2ea014] focus:outline-none font-bold"
                    >
                      <option value="critical" className="text-red-500">Critical (SLA 4h)</option>
                      <option value="high" className="text-orange-500">High (SLA 12h)</option>
                      <option value="medium" className="text-amber-500">Medium (SLA 24h)</option>
                      <option value="low" className="text-green-500">Low (SLA 72h)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[9px] uppercase font-bold text-slate-400 mb-1 tracking-wider">Describe Road Issue & Nearest Landmark *</label>
                  <textarea 
                    rows="2"
                    placeholder="Provide specific details or landmark notes for our maintenance crew."
                    required
                    value={formData.defectNote}
                    onChange={(e) => setFormData({...formData, defectNote: e.target.value})}
                    className="w-full text-xs bg-slate-900 border border-slate-800 focus:border-[#2ea014] text-white rounded-lg px-3 py-2 outline-none transition-colors resize-none"
                  ></textarea>
                </div>

                <button
                  id="submit-defect-report"
                  type="submit"
                  className="w-full py-3 rounded-lg bg-[#2ea014] hover:bg-[#3cd01c] text-white text-xs font-bold uppercase tracking-wider transition-all shadow cursor-pointer text-center block"
                >
                  Submit Incident Ticket
                </button>
              </form>
            ) : (
              <div className="text-center py-6 space-y-4">
                <div className="w-12 h-12 rounded-full bg-green-950/60 border border-green-500 text-green-400 flex items-center justify-center mx-auto">
                  <CheckCircle2 size={24} className="animate-bounce" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-white">Incident Successfully Logged</h4>
                  <p className="text-[11px] text-slate-400 mt-2 leading-relaxed">
                    Dynamic Ticket created! The respective contractor has been alerted, and safety SLA benchmarks are active.
                  </p>
                </div>
                <button
                  onClick={handleResetForm}
                  className="px-5 py-2 rounded-lg border border-slate-800 hover:border-slate-700 text-xs text-slate-300 transition-all cursor-pointer font-semibold"
                >
                  Log Another Issue
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 2. Key Telemetry Stats Grid */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-slate-900/30 rounded-2xl p-5 border border-slate-800/50 transition-all">
          <div className="text-[9px] text-zinc-400 font-bold uppercase tracking-widest font-mono flex items-center gap-1.5 mb-2">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse"></span>
            ACTIVE HAZARDS LOGGED
          </div>
          <div className="text-2xl sm:text-3xl font-display font-black text-rose-500">{stats.activeHazards}</div>
          <div className="text-[10px] text-slate-500 mt-0.5">Verified civic defects</div>
        </div>

        <div className="bg-slate-900/30 rounded-2xl p-5 border border-slate-800/50 transition-all">
          <div className="text-[9px] text-zinc-400 font-bold uppercase tracking-widest font-mono flex items-center gap-1.5 mb-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#2ea014]"></span>
            CAPITAL FUND AUDITED
          </div>
          <div className="text-2xl sm:text-3xl font-display font-black text-white">₹{stats.contractSum.toFixed(2)}Cr</div>
          <div className="text-[10px] text-slate-500 mt-0.5">Approved allocations</div>
        </div>

        <div className="bg-slate-900/30 rounded-2xl p-5 border border-slate-800/50 transition-all">
          <div className="text-[9px] text-zinc-400 font-bold uppercase tracking-widest font-mono flex items-center gap-1.5 mb-2">
            <span className="w-1.5 h-1.5 rounded-full bg-orange-450 bg-orange-500"></span>
            SLA COMPLIANCE STATUS
          </div>
          <div className="text-2xl sm:text-3xl font-display font-black text-orange-500">{stats.compliances}%</div>
          <div className="text-[10px] text-slate-500 mt-0.5">Average response metric</div>
        </div>

        <div className="bg-slate-900/30 rounded-2xl p-5 border border-slate-800/50 transition-all">
          <div className="text-[9px] text-zinc-400 font-bold uppercase tracking-widest font-mono flex items-center gap-1.5 mb-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-450 bg-emerald-500"></span>
            PASSIVE CROWD SCANNING
          </div>
          <div className="text-2xl sm:text-3xl font-display font-black text-emerald-400">+{stats.sensors}</div>
          <div className="text-[10px] text-slate-500 mt-0.5">Enrolled road user aids</div>
        </div>
      </section>

      {/* 2.5 Live Resolution Feed (Public Transparency) */}
      <section className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 overflow-hidden relative">
        <div className="absolute top-0 right-8 bg-[#2ea014] text-white text-[8px] font-mono uppercase px-3 py-1 rounded-b font-bold tracking-widest shadow-lg">
          Live Transparency Feed
        </div>
        
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-xl font-display font-black text-white flex items-center gap-2">
              <Activity className="text-[#2ea014]" size={20} /> 
              Recent Contractor Resolutions
            </h3>
            <p className="text-xs text-slate-400 mt-1">Proof of work: Cryptographically verified infrastructure repairs completed in the last 24 hours.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { id: 'HAZ-8821', title: 'Severe Pothole', contractor: 'BuildFast Pvt. Ltd.', time: '14 mins ago', img: 'https://images.unsplash.com/photo-1515162305285-0293e4767cc2?auto=format&fit=crop&q=80&w=300' },
            { id: 'HAZ-1194', title: 'Guardrail Repair', contractor: 'Apex Infrastruct', time: '2 hours ago', img: 'https://images.unsplash.com/photo-1502877338535-766e1452684a?auto=format&fit=crop&q=80&w=300' },
            { id: 'HAZ-6632', title: 'Drainage Clearance', contractor: 'Metro Build Co.', time: '5 hours ago', img: 'https://images.unsplash.com/photo-1485594050903-8e8ee7b071a8?auto=format&fit=crop&q=80&w=300' }
          ].map((item, i) => (
            <div key={i} className="bg-slate-950/50 border border-slate-800/80 rounded-xl p-3 flex items-center gap-4 hover:border-emerald-500/30 transition-colors">
              <img src={item.img} alt="Repair" className="w-14 h-14 rounded-lg object-cover opacity-80" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] text-[#2ea014] font-mono font-bold tracking-wider">{item.id}</span>
                  <span className="text-[9px] text-slate-500 font-mono">{item.time}</span>
                </div>
                <h4 className="text-sm font-bold text-slate-200 truncate">{item.title}</h4>
                <div className="flex items-center gap-1 mt-1 text-[10px] text-slate-400">
                  <CheckCircle2 size={10} className="text-emerald-500" />
                  Verified by <span className="text-slate-300 font-bold truncate">{item.contractor}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. About our Agency & Safety Commitment (Centered clean layout) */}
      <section className="bg-white rounded-3xl p-6 md:p-10 lg:p-12 text-slate-950 border border-slate-200">
        <div className="max-w-3xl mx-auto space-y-5 text-center">
          <span className="text-xs text-[#2ea014] font-mono tracking-wider uppercase font-extrabold block">
            Integrated Civic Oversight
          </span>
          
          <h2 className="text-2xl sm:text-3xl font-display font-black text-slate-900 leading-tight">
            Our Commitment to Service & Safety
          </h2>
          
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-sans max-w-xl mx-auto">
            Welcome to the AegisRoad portal. We coordinate with local municipal divisions to discover asphalt issues, monitor traffic disruptions, and remove hazardous delays safely.
          </p>

          <div className="border-y border-slate-100 py-4 max-w-lg mx-auto">
            <p className="text-[#2ea014] font-display text-xs sm:text-sm font-semibold italic">
              "We replace bureaucratic manuals with an interactive map, and live contractor audit ratings."
            </p>
          </div>

          <p className="text-xs text-slate-500 leading-relaxed max-w-xl mx-auto">
            Citizens can view active repair jobs, check real-time spending efficiency details on our SpendWatch dashboard, and report road safety failures directly to contractors.
          </p>

          <div className="pt-2">
            <button
              id="about-explore-command"
              onClick={() => onNavigate('command')}
              className="px-5 py-2.5 rounded-lg bg-[#2ea014] hover:bg-[#3cd01c] text-white font-bold text-xs uppercase tracking-wider transition-all cursor-pointer shadow"
            >
              Examine Command Center
            </button>
          </div>
        </div>
      </section>

      {/* 4. Polished, Uncluttered core Solutions Section */}
      <section className="bg-[#090f1d] rounded-3xl p-6 sm:p-10 border border-slate-800/80 relative space-y-8">
        <div className="text-center max-w-xl mx-auto space-y-2 relative z-10">
          <span className="text-xs text-[#2ea014] tracking-widest font-mono font-bold uppercase">
            Services & Oversight
          </span>
          <h2 className="text-2xl sm:text-3xl font-display font-black text-white">
            Our Autonomous Solutions
          </h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            Eradicating manual road surveys with modern, high-contrast coordinate maps and automated spend audits.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10 font-sans">
          {solutions.map((item, index) => (
            <div 
              key={index}
              className="bg-slate-950/80 hover:bg-slate-950/95 border border-slate-900 hover:border-[#2ea014]/60 transition-all p-5 rounded-2xl group flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="w-9 h-9 rounded-xl bg-green-950/40 border border-green-900/50 text-[#2ea014] flex items-center justify-center shrink-0">
                  {item.icon}
                </div>
                <h4 className="text-xs font-bold text-white tracking-wide group-hover:text-[#2ea014] transition-colors">
                  {item.title}
                </h4>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  {item.desc}
                </p>
              </div>
              <div className="pt-4 flex items-center justify-between text-[9px] font-mono text-slate-500 group-hover:text-[#2ea014] transition-colors">
                <span>Core Module S-{index+1}</span>
                <span className="opacity-0 group-hover:opacity-100 transition-all">ACTIVE</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. Why Choose Us / Advantage section matching Screenshot 4 */}
      <section className="bg-white rounded-3xl p-6 sm:p-10 lg:p-14 text-slate-950 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
        
        {/* Left side: narrative advantages */}
        <div className="lg:col-span-7 space-y-6">
          <div className="text-xs text-[#2ea014] font-mono tracking-widest uppercase font-black">
            why choose aegisroad network
          </div>
          
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-display font-black text-slate-900 leading-tight">
            Our Traffic Engineering Advantage
          </h2>
          
          <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-sans">
            Discover the structural reasons that make us the go-to platform for traffic engineering safety, budget oversight, and transparent civic performance overlays:
          </p>

          {/* Exact Bullet Points with green icon borders from Screenshot 4 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
            
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-full bg-green-50 text-[#2ea014] border border-green-200 flex items-center justify-center shrink-0 mt-0.5">
                <CheckCircle2 size={18} />
              </div>
              <div>
                <strong className="text-xs uppercase tracking-wide text-slate-900 block font-display">Fast Detection</strong>
                <span className="text-[11px] text-slate-500 leading-tight font-sans block">Centimeter potholes logged under 1.5 seconds.</span>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-full bg-green-50 text-[#2ea014] border border-green-200 flex items-center justify-center shrink-0 mt-0.5">
                <Coins size={18} />
              </div>
              <div>
                <strong className="text-xs uppercase tracking-wide text-slate-900 block font-display">Affordable Setup</strong>
                <span className="text-[11px] text-slate-500 leading-tight font-sans block">Runs passively on standard smartphone cams with zero extra hardware cost.</span>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-full bg-green-50 text-[#2ea014] border border-green-200 flex items-center justify-center shrink-0 mt-0.5">
                <ShieldCheck size={18} />
              </div>
              <div>
                <strong className="text-xs uppercase tracking-wide text-slate-900 block font-display">Highly Reliable</strong>
                <span className="text-[11px] text-slate-500 leading-tight font-sans block">Verified double-pass scanning removes false hazard flags instantly.</span>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-full bg-green-50 text-[#2ea014] border border-green-200 flex items-center justify-center shrink-0 mt-0.5">
                <Users size={18} />
              </div>
              <div>
                <strong className="text-xs uppercase tracking-wide text-slate-900 block font-display">Experienced RAG AI</strong>
                <span className="text-[11px] text-slate-500 leading-tight font-sans block">AegisChat instantly parses government PDFs and expenditure spreadsheets.</span>
              </div>
            </div>

          </div>
        </div>

        {/* Right side: Splendid collage representing we are trusted by etc. (Screenshot 4 Right) */}
        <div className="lg:col-span-5 relative flex justify-center">
          <div className="relative">
            <div className="relative z-10 w-full max-w-[350px] rounded-2xl overflow-hidden shadow-2xl border-4 border-slate-100">
              
              {/* Stacked image grid represent city cars and infrastructure */}
              <div className="grid grid-cols-2 gap-0.5 bg-white">
                <img src="https://images.unsplash.com/photo-1515162305285-0293e4767cc2?auto=format&fit=crop&q=80&w=300" alt="Orange cones line road marker path" className="h-32 w-full object-cover" referrerPolicy="no-referrer" />
                <img src="https://images.unsplash.com/photo-1473163928189-364b2c4e1135?auto=format&fit=crop&q=80&w=300" alt="Modern asphalt highway lane lines" className="h-32 w-full object-cover" referrerPolicy="no-referrer" />
                <div className="bg-[#2ea014] hover:bg-[#3cd01c] p-4 text-white flex flex-col justify-center select-none cursor-default transition-all">
                  <span className="text-2xl font-black font-display tracking-tight leading-none">100%</span>
                  <span className="text-[10px] uppercase font-bold tracking-widest leading-normal block mt-1 font-mono">public watch</span>
                  <p className="text-[11px] font-sans mt-1 text-green-100 text-xs font-semibold">Tied to direct SLAs</p>
                </div>
                <img src="https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&q=80&w=300" alt="Asphalt crew highway paving" className="h-32 w-full object-cover hover:scale-105 transition-transform" referrerPolicy="no-referrer" />
              </div>

              <div className="bg-slate-900 p-5 text-center text-white border-t border-slate-800">
                <span className="text-[#2ea014] font-black text-lg block font-display font-extrabold">We're Trusted by more than 1000 Clients</span>
                <span className="text-[10px] text-slate-400 mt-1 block">BIMSTEC Municipalities & State Highway Authorities</span>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* 6. Question row contact card banner matching Screenshot 6 */}
      <section className="bg-white rounded-3xl p-6 sm:p-10 lg:p-12 border border-slate-200 text-slate-950 text-center space-y-8 select-text">
        <h3 className="text-lg sm:text-2xl font-display font-extrabold max-w-2xl mx-auto leading-tight text-slate-900">
          Whether you have a question about our services, pricing, projects, or anything else, our team is ready to answer all your questions
        </h3>

        {/* 3 Contact elements precisely with icons & matching green backgrounds */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-left max-w-5xl mx-auto pt-2">
          
          <div className="flex items-center gap-3.5 bg-slate-50 border border-slate-100 p-4 rounded-xl">
            <div className="w-11 h-11 rounded-full bg-green-55/15 bg-green-100 text-[#2ea014] border border-green-200 flex items-center justify-center shrink-0">
              <MapPin size={20} />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block uppercase font-mono font-bold">Office Address</span>
              <strong className="text-xs text-slate-800 tracking-tight leading-snug font-display inline-block mt-0.5">127/A, Church Road, Colombo</strong>
            </div>
          </div>

          <div className="flex items-center gap-3.5 bg-slate-50 border border-slate-100 p-4 rounded-xl">
            <div className="w-11 h-11 rounded-full bg-green-55/15 bg-green-100 text-[#2ea014] border border-green-200 flex items-center justify-center shrink-0">
              <Mail size={20} />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block uppercase font-mono font-bold">Email Assistance</span>
              <a href="mailto:info@traffic.com.au" className="text-xs text-[#2ea014] hover:underline tracking-tight leading-snug font-display font-bold inline-block mt-0.5">info@traffic.com.au</a>
            </div>
          </div>

          <div className="flex items-center gap-3.5 bg-slate-50 border border-slate-100 p-4 rounded-xl">
            <div className="w-11 h-11 rounded-full bg-green-55/15 bg-green-100 text-[#2ea014] border border-green-200 flex items-center justify-center shrink-0">
              <Phone size={20} />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block uppercase font-mono font-bold">Hotline Support</span>
              <strong className="text-xs text-slate-800 tracking-tight leading-snug font-display inline-block mt-0.5">(+94) 123 456 789</strong>
            </div>
          </div>

        </div>
      </section>

    </div>
  );
}
