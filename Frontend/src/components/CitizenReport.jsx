import React, { useState } from 'react';
import { Camera, MapPin, Send, AlertTriangle, CheckCircle2 } from 'lucide-react';

const T = { teal:'#072E24', tealMid:'#156B52', yellow:'#C8D400', cream:'#F4F0E6', creamDark:'#EAE5D6', textDark:'#0D1E1B' };
const inp = { background:'#EAE5D6', border:'1px solid rgba(13,30,27,0.18)', borderRadius:'10px', padding:'10px 14px', fontSize:'13px', color:T.textDark, outline:'none', width:'100%', fontFamily:'inherit' };
const label = "block text-[9px] font-black uppercase tracking-wider mb-1.5";
const labelStyle = { color:'rgba(13,30,27,0.45)', fontFamily:'monospace' };

export default function CitizenReport({ onReportHazard }) {
  const [formData, setFormData] = useState({ issueType:'Pothole', severity:'Medium', location:'', description:'', reporterName:'', contactEmail:'' });
  const [coords, setCoords] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [refNumber, setRefNumber] = useState('');

  const detectLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(pos => {
        setCoords({ lat:pos.coords.latitude, lng:pos.coords.longitude });
        setFormData(p => ({ ...p, location:'GPS Location Detected' }));
      });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const clsMap = { 'Pothole':'D40', 'Road Crack':'D20', 'Waterlogging':'D10', 'Other':'D00' };
    onReportHazard({
      road_name: formData.location || 'Unknown location',
      cls: clsMap[formData.issueType] || 'D00',
      severity: formData.severity.toLowerCase(),
      lat: coords?.lat || 16.4307, lng: coords?.lng || 80.6241,
      description: formData.description,
      reporter: formData.reporterName || 'Anonymous Citizen'
    });
    setRefNumber(Math.floor(100000 + Math.random()*900000).toString());
    setSubmitted(true);
    setFormData({ issueType:'Pothole', severity:'Medium', location:'', description:'', reporterName:'', contactEmail:'' });
    setCoords(null);
  };

  return (
    <div className="max-w-2xl mx-auto animate-fadeIn">
      {/* Header */}
      <div className="mb-8">
        <div className="section-eyebrow mb-1">Public</div>
        <h1 className="text-[clamp(32px,5vw,52px)] font-black uppercase leading-tight mb-2" style={{ fontFamily:"'Barlow Condensed',sans-serif", color:T.teal }}>
          Report a Road Hazard
        </h1>
        <p className="text-sm" style={{ color:'rgba(13,30,27,0.5)' }}>Your report goes directly to the municipal command center. No login required.</p>
      </div>

      <div className="rounded-2xl overflow-hidden shadow-sm" style={{ border:'1px solid rgba(13,30,27,0.1)', background:T.cream }}>
        {/* Badge */}
        <div className="px-6 py-4 flex items-center gap-3" style={{ background:T.teal }}>
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background:T.yellow }}>
            <AlertTriangle size={20} style={{ color:T.teal }} />
          </div>
          <div>
            <h2 className="text-lg font-black uppercase text-white" style={{ fontFamily:"'Barlow Condensed',sans-serif" }}>Civic Hazard Submission</h2>
            <p className="text-[10px]" style={{ color:'rgba(255,255,255,0.55)' }}>Report is auto-pinned to the live GIS map upon submission.</p>
          </div>
        </div>

        <div className="p-6">
          {submitted ? (
            <div className="text-center py-12 space-y-5">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto" style={{ background:'rgba(7,46,36,0.08)', border:`2px solid ${T.tealMid}` }}>
                <CheckCircle2 size={30} style={{ color:T.tealMid }} />
              </div>
              <div>
                <h3 className="text-2xl font-black uppercase mb-2" style={{ fontFamily:"'Barlow Condensed',sans-serif", color:T.teal }}>Report Submitted!</h3>
                <p className="text-sm mb-4" style={{ color:'rgba(13,30,27,0.55)' }}>Thank you for helping keep our roads safe.</p>
                <div className="inline-block px-5 py-3 rounded-xl font-mono text-sm font-bold" style={{ background:T.teal, color:T.yellow }}>
                  Reference: <span>AR-{refNumber}</span>
                </div>
              </div>
              <button onClick={() => setSubmitted(false)} className="text-sm font-black uppercase tracking-wider px-6 py-3 rounded-xl cursor-pointer transition-all" style={{ border:`1px solid rgba(13,30,27,0.15)`, color:'rgba(13,30,27,0.6)', fontFamily:"'Barlow Condensed',sans-serif" }}>
                Submit Another Report
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={label} style={labelStyle}>Issue Type</label>
                  <select value={formData.issueType} onChange={e=>setFormData({...formData,issueType:e.target.value})} style={inp}>
                    <option>Pothole</option><option>Road Crack</option><option>Broken Guardrail</option>
                    <option>Waterlogging</option><option>Missing Signage</option><option>Other</option>
                  </select>
                </div>
                <div>
                  <label className={label} style={labelStyle}>Severity</label>
                  <select value={formData.severity} onChange={e=>setFormData({...formData,severity:e.target.value})} style={inp}>
                    <option>Low</option><option>Medium</option><option>High</option><option>Critical</option>
                  </select>
                </div>
              </div>

              <div>
                <label className={label} style={labelStyle}>Location</label>
                <div className="flex gap-2">
                  <input type="text" placeholder="E.g. Near Main Market, Sector 4" value={formData.location} onChange={e=>setFormData({...formData,location:e.target.value})} required style={{ ...inp, flex:1, width:'auto' }} />
                  <button type="button" onClick={detectLocation} className="px-4 rounded-xl flex items-center gap-2 font-bold text-xs uppercase tracking-wider shrink-0 cursor-pointer transition-all" style={{ background:T.tealMid, color:'#fff', fontFamily:"'Barlow Condensed',sans-serif" }} title="Use GPS">
                    <MapPin size={15} /><span className="hidden sm:inline">GPS</span>
                  </button>
                </div>
                {coords && <p className="text-[10px] mt-1 font-mono" style={{ color:T.tealMid }}>✓ GPS: {coords.lat.toFixed(4)}, {coords.lng.toFixed(4)}</p>}
              </div>

              <div>
                <label className={label} style={labelStyle}>Description</label>
                <textarea rows="3" placeholder="Describe the issue in detail..." value={formData.description} onChange={e=>setFormData({...formData,description:e.target.value})} style={{ ...inp, resize:'none' }} />
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4" style={{ borderTop:'1px solid rgba(13,30,27,0.08)' }}>
                <div>
                  <label className={label} style={labelStyle}>Your Name (Optional)</label>
                  <input type="text" placeholder="Anonymous" value={formData.reporterName} onChange={e=>setFormData({...formData,reporterName:e.target.value})} style={inp} />
                </div>
                <div>
                  <label className={label} style={labelStyle}>Email (Optional)</label>
                  <input type="email" placeholder="For status updates" value={formData.contactEmail} onChange={e=>setFormData({...formData,contactEmail:e.target.value})} style={inp} />
                </div>
              </div>

              <button type="submit" className="w-full py-4 rounded-xl text-sm font-black uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-all hover:scale-[1.01] shadow-sm" style={{ background:T.teal, color:T.yellow, fontFamily:"'Barlow Condensed',sans-serif" }}>
                <Send size={16} /> Submit Report to Command Center
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Info cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
        {[
          { icon:'🗺️', title:'Auto-Pinned', desc:'Your report appears on the live GIS hazard map instantly.' },
          { icon:'⏱️', title:'SLA Assigned', desc:'A contractual repair deadline is set automatically based on severity.' },
          { icon:'🔒', title:'No Login Needed', desc:'Any citizen can report hazards — zero authentication required.' },
        ].map((c,i) => (
          <div key={i} className="p-4 rounded-xl text-center" style={{ background:T.creamDark, border:'1px solid rgba(13,30,27,0.08)' }}>
            <div className="text-2xl mb-2">{c.icon}</div>
            <div className="text-sm font-black uppercase mb-1" style={{ fontFamily:"'Barlow Condensed',sans-serif", color:T.teal }}>{c.title}</div>
            <p className="text-[11px]" style={{ color:'rgba(13,30,27,0.5)' }}>{c.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
