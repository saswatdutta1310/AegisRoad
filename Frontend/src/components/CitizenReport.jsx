import React, { useState } from 'react';
import { Camera, MapPin, Send, AlertTriangle } from 'lucide-react';

export default function CitizenReport({ onReportHazard }) {
  const [formData, setFormData] = useState({
    issueType: 'Pothole',
    severity: 'Medium',
    location: '',
    description: '',
    reporterName: '',
    contactEmail: ''
  });
  const [coords, setCoords] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [refNumber, setRefNumber] = useState('');

  const detectLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setFormData(prev => ({ ...prev, location: 'GPS Location Detected' }));
      });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Convert to AegisRoad schema
    const clsMap = { 'Pothole': 'D40', 'Road Crack': 'D20', 'Waterlogging': 'D10', 'Other': 'D00' };
    const hazard = {
      road_name: formData.location || 'Unknown location',
      cls: clsMap[formData.issueType] || 'D00',
      severity: formData.severity.toLowerCase(),
      lat: coords?.lat || 16.4307,
      lng: coords?.lng || 80.6241,
      description: formData.description,
      reporter: formData.reporterName || 'Anonymous Citizen'
    };

    onReportHazard(hazard);
    
    setRefNumber(Math.floor(100000 + Math.random() * 900000).toString());
    setSubmitted(true);
    setFormData({ issueType: 'Pothole', severity: 'Medium', location: '', description: '', reporterName: '', contactEmail: '' });
    setCoords(null);
  };

  return (
    <div className="max-w-2xl mx-auto bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl">
      <div className="flex items-center gap-3 mb-6 border-b border-slate-800 pb-4">
        <div className="p-3 bg-[#2ea014]/20 text-[#2ea014] rounded-lg">
          <AlertTriangle size={24} />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-100">Report a Road Hazard</h2>
          <p className="text-sm text-slate-400">Your report goes directly to the municipal command center.</p>
        </div>
      </div>

      {submitted ? (
        <div className="bg-emerald-950/30 border border-emerald-900 rounded-lg p-6 text-center">
          <div className="text-emerald-400 mb-2 font-bold text-lg">Report Submitted Successfully</div>
          <p className="text-slate-300 text-sm mb-4">Thank you for helping keep our roads safe.</p>
          <div className="font-mono text-sm bg-slate-950 inline-block px-4 py-2 rounded-md border border-slate-800">
            Reference Number: <span className="text-[#2ea014]">{refNumber}</span>
          </div>
          <button onClick={() => setSubmitted(false)} className="mt-6 block w-full py-2 bg-slate-800 text-slate-300 rounded-md hover:bg-slate-700 transition">
            Submit Another Report
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Issue Type</label>
              <select 
                value={formData.issueType}
                onChange={e => setFormData({...formData, issueType: e.target.value})}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-slate-200 outline-none focus:border-[#2ea014]"
              >
                <option>Pothole</option>
                <option>Road Crack</option>
                <option>Broken Guardrail</option>
                <option>Waterlogging</option>
                <option>Missing Signage</option>
                <option>Other</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Severity</label>
              <select 
                value={formData.severity}
                onChange={e => setFormData({...formData, severity: e.target.value})}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-slate-200 outline-none focus:border-[#2ea014]"
              >
                <option>Low</option>
                <option>Medium</option>
                <option>High</option>
                <option>Critical</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Location</label>
            <div className="flex gap-2">
              <input 
                type="text" 
                placeholder="E.g., Near Main Market, Sector 4"
                value={formData.location}
                onChange={e => setFormData({...formData, location: e.target.value})}
                required
                className="flex-1 bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-slate-200 outline-none focus:border-[#2ea014]"
              />
              <button type="button" onClick={detectLocation} className="px-4 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-slate-300 flex items-center gap-2 transition" title="Use GPS">
                <MapPin size={16} /> <span className="hidden sm:inline text-xs font-bold">GPS</span>
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Description</label>
            <textarea 
              rows="3"
              placeholder="Describe the issue..."
              value={formData.description}
              onChange={e => setFormData({...formData, description: e.target.value})}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-slate-200 outline-none focus:border-[#2ea014]"
            ></textarea>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-800/60">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Your Name (Optional)</label>
              <input 
                type="text" 
                placeholder="Anonymous"
                value={formData.reporterName}
                onChange={e => setFormData({...formData, reporterName: e.target.value})}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-slate-200 outline-none focus:border-[#2ea014]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Email (Optional)</label>
              <input 
                type="email" 
                placeholder="For updates"
                value={formData.contactEmail}
                onChange={e => setFormData({...formData, contactEmail: e.target.value})}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-slate-200 outline-none focus:border-[#2ea014]"
              />
            </div>
          </div>

          <button type="submit" className="w-full mt-4 bg-[#2ea014] hover:bg-emerald-600 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition shadow-lg shadow-[#2ea014]/20">
            <Send size={18} /> Submit Report
          </button>
        </form>
      )}
    </div>
  );
}
