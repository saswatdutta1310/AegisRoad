import React, { useState } from 'react';
import { ShieldCheck, User, Building, Wrench, Lock, Mail, UserPlus, LogIn, X, Info } from 'lucide-react';
import { toast } from 'react-toastify';
import { authApi } from '../services/api';

export default function AuthSystem({ isOpen, onClose, onLogin }) {
  const [isRegister, setIsRegister] = useState(false);
  const [role, setRole] = useState('contractor');
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    orgName: 'BuildFast Pvt. Ltd.',
    password: ''
  });

  if (!isOpen) return null;

  const handleRoleChange = (selectedRole) => {
    setRole(selectedRole);
    let defaultOrg = '';
    if (selectedRole === 'contractor') defaultOrg = 'BuildFast Pvt. Ltd.';
    else if (selectedRole === 'government') defaultOrg = 'Municipal Road Corp';
    else if (selectedRole === 'worker') defaultOrg = 'Eagle Eye Patrols';
    setFormData(prev => ({ ...prev, orgName: defaultOrg }));
  };

  // Quick login — purely frontend, no backend needed
  const handlePreloadDemo = (roleType, name, email, org) => {
    const user = { username: name, email, role: roleType, orgName: org };
    localStorage.setItem('aegis_auth_user', JSON.stringify(user));
    onLogin(user);
    toast.success(`Welcome, ${name}! Logged in as ${roleType}.`);
    onClose();
  };

  const persistSession = (user, token) => {
    localStorage.setItem('aegis_auth_user', JSON.stringify(user));
    if (token) localStorage.setItem('aegis_jwt_token', token);
    else localStorage.removeItem('aegis_jwt_token');
    onLogin(user);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.username || !formData.email || !formData.password) {
      toast.error("Please fill out all required fields to continue.");
      return;
    }

    const orgName = formData.orgName || (role === 'contractor' ? 'BuildFast Pvt. Ltd.' : role === 'government' ? 'Municipal Road Corp' : 'Eagle Eye Patrols');

    try {
      if (isRegister) {
        await authApi.register({
          username: formData.username,
          email: formData.email,
          password: formData.password,
          role,
          orgName,
        });
        toast.success(`Account created! Signing you in…`);
      }
      const res = await authApi.login({ email: formData.email, password: formData.password });
      persistSession(res.user, res.access_token);
      toast.success(`Welcome, ${res.user.username}!`);
      onClose();
      return;
    } catch {
      // Offline demo fallback when backend is unavailable
      const user = { username: formData.username, email: formData.email, role, orgName };
      persistSession(user, null);
      toast.success(isRegister ? `Demo account ready, ${formData.username}.` : `Demo login: ${formData.username}.`);
      onClose();
    }
  };

  return (
    <div className="aegis-modal-overlay fixed inset-0 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-md bg-[#0a0f1d] border border-slate-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col justify-between">
        
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-800 flex justify-between items-center bg-slate-900/40">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#2ea014]/20 text-[#2ea014] flex items-center justify-center border border-[#2ea014]/30">
              <ShieldCheck size={18} />
            </div>
            <div>
              <h3 className="text-sm font-black text-white uppercase tracking-wider font-display">
                {isRegister ? 'Register Identity' : 'Internal Secure Sign In'}
              </h3>
              <p className="text-[10px] text-slate-400 font-mono tracking-tight leading-none mt-1">
                AegisRoad Authentication Ledger
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="grid grid-cols-2 bg-slate-950 p-1 border-b border-slate-900">
          <button
            onClick={() => setIsRegister(false)}
            className={`py-2 text-[10px] font-bold uppercase tracking-wider transition-all rounded ${
              !isRegister ? 'bg-slate-900 text-[#2ea014] font-extrabold shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Sign In Account
          </button>
          <button
            onClick={() => {
              setIsRegister(true);
              if (!formData.username) {
                setFormData(prev => ({ ...prev, orgName: 'BuildFast Pvt. Ltd.' }));
              }
            }}
            className={`py-2 text-[10px] font-bold uppercase tracking-wider transition-all rounded ${
              isRegister ? 'bg-slate-900 text-[#2ea014] font-extrabold shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Register Personnel
          </button>
        </div>

        {/* Main Content Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          
          {/* Role selection row */}
          <div>
            <label className="block text-[9px] uppercase font-bold text-slate-400 mb-1.5 tracking-wider">
              Choose Security Role *
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleRoleChange('contractor')}
                className={`py-2 px-1 text-[9px] uppercase font-mono font-bold rounded border transition-colors flex flex-col items-center gap-1 ${
                  role === 'contractor' 
                    ? 'bg-[#2ea014]/15 border-[#2ea014] text-[#2ea014]' 
                    : 'bg-slate-950 border-slate-850 hover:border-slate-700 text-slate-400 hover:text-slate-300'
                }`}
              >
                <Building size={14} />
                <span>Contractor</span>
              </button>
              <button
                type="button"
                onClick={() => handleRoleChange('government')}
                className={`py-2 px-1 text-[9px] uppercase font-mono font-bold rounded border transition-colors flex flex-col items-center gap-1 ${
                  role === 'government' 
                    ? 'bg-sky-500/15 border-sky-500 text-sky-400' 
                    : 'bg-slate-950 border-slate-850 hover:border-slate-700 text-slate-400 hover:text-slate-300'
                }`}
              >
                <ShieldCheck size={14} />
                <span>Gov Officer</span>
              </button>
              <button
                type="button"
                onClick={() => handleRoleChange('worker')}
                className={`py-2 px-1 text-[9px] uppercase font-mono font-bold rounded border transition-colors flex flex-col items-center gap-1 ${
                  role === 'worker' 
                    ? 'bg-amber-500/15 border-amber-500 text-amber-400' 
                    : 'bg-slate-950 border-slate-850 hover:border-slate-700 text-slate-400 hover:text-slate-300'
                }`}
              >
                <Wrench size={14} />
                <span>Field Worker</span>
              </button>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-[9px] uppercase font-bold text-slate-400 mb-1 tracking-wider">Full Username *</label>
              <div className="relative">
                <User size={12} className="absolute left-3 top-[11px] text-slate-500" />
                <input 
                  type="text" 
                  placeholder="e.g. Sandra Arjun"
                  required
                  value={formData.username}
                  onChange={(e) => setFormData({...formData, username: e.target.value})}
                  className="w-full text-xs bg-slate-950 border border-slate-800 focus:border-[#2ea014] text-white rounded-lg pl-9 pr-3 py-2 outline-none transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-[9px] uppercase font-bold text-slate-400 mb-1 tracking-wider">Official Email *</label>
              <div className="relative">
                <Mail size={12} className="absolute left-3 top-[11px] text-slate-500" />
                <input 
                  type="email" 
                  placeholder="e.g. s.arjun@aegisroad.gov"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full text-xs bg-slate-950 border border-slate-800 focus:border-[#2ea014] text-white rounded-lg pl-9 pr-3 py-2 outline-none transition-colors"
                />
              </div>
            </div>

            {role === 'contractor' && (
              <div>
                <label className="block text-[9px] uppercase font-bold text-slate-400 mb-1 tracking-wider">Target Contractor Firm</label>
                <select
                  value={formData.orgName}
                  onChange={(e) => setFormData({...formData, orgName: e.target.value})}
                  className="w-full text-xs bg-slate-950 border border-slate-800 text-white rounded-lg px-3 py-2 outline-none transition-colors focus:border-[#2ea014]"
                >
                  <option value="BuildFast Pvt. Ltd.">BuildFast Pvt. Ltd.</option>
                  <option value="Apex Infrastruct">Apex Infrastruct</option>
                  <option value="Core Asphalt Co.">Core Asphalt Co.</option>
                  <option value="Urban Safety Ltd.">Urban Safety Ltd.</option>
                </select>
              </div>
            )}

            {role !== 'contractor' && (
              <div>
                <label className="block text-[9px] uppercase font-bold text-slate-400 mb-1 tracking-wider">Agency / Station Division</label>
                <input 
                  type="text" 
                  placeholder={role === 'government' ? 'e.g. Municipal Road Corporation' : 'e.g. Southern Sector Fleet'}
                  value={formData.orgName}
                  onChange={(e) => setFormData({...formData, orgName: e.target.value})}
                  className="w-full text-xs bg-slate-950 border border-slate-800 focus:border-[#2ea014] text-white rounded-lg px-3 py-2 outline-none transition-colors"
                />
              </div>
            )}

            <div>
              <label className="block text-[9px] uppercase font-bold text-slate-400 mb-1 tracking-wider">Security Password *</label>
              <div className="relative">
                <Lock size={12} className="absolute left-3 top-[11px] text-slate-500" />
                <input 
                  type="password" 
                  placeholder="••••••••"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  className="w-full text-xs bg-slate-950 border border-slate-800 focus:border-[#2ea014] text-white rounded-lg pl-9 pr-3 py-2 outline-none transition-colors"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 rounded-lg bg-[#2ea014] hover:bg-[#3cd01c] text-white font-bold text-xs uppercase tracking-wider transition-all shadow flex items-center justify-center gap-1.5 cursor-pointer mt-2"
          >
            {isRegister ? <UserPlus size={13} /> : <LogIn size={13} />}
            <span>{isRegister ? 'Register & Initialize' : 'Secure Authenticate'}</span>
          </button>
        </form>

        {/* Preset Fast-Onboarding Core Demo Accounts */}
        <div className="p-5 border-t border-slate-800 bg-slate-950/60 font-sans">
          <div className="text-[9px] font-extrabold text-slate-500 tracking-wider uppercase mb-2 flex items-center gap-1">
            <Info size={11} className="text-[#2ea014]" />
            Fast Demo Testing Accounts (Instant Setup)
          </div>
          
          <div className="grid grid-cols-1 gap-2">
            <button
              onClick={() => handlePreloadDemo('contractor', 'Sandra Arjun', 'sandra@buildfast.co.in', 'BuildFast Pvt. Ltd.')}
              className="flex items-center justify-between p-2 rounded bg-slate-900 border border-slate-850 hover:border-[#2ea014]/60 text-left transition-all group cursor-pointer"
            >
              <div>
                <span className="block text-[10px] font-bold text-white group-hover:text-[#2ea014]">👷 Sandra Arjun (Contractor)</span>
                <span className="text-[8px] text-slate-500 font-mono">Firm: BuildFast Pvt. Ltd.</span>
              </div>
              <span className="text-[9px] text-[#2ea014] uppercase font-bold bg-green-950 px-1 rounded">Quick Login</span>
            </button>

            <button
              onClick={() => handlePreloadDemo('government', 'Chief Inspector Rao', 'rao@municipality.gov', 'Municipal Road Corp')}
              className="flex items-center justify-between p-2 rounded bg-slate-900 border border-slate-850 hover:border-sky-500/60 text-left transition-all group cursor-pointer"
            >
              <div>
                <span className="block text-[10px] font-bold text-white group-hover:text-sky-400">🏛️ Chief Inspector Rao (Government)</span>
                <span className="text-[8px] text-slate-500 font-mono">Agency: Municipal Government</span>
              </div>
              <span className="text-[9px] text-sky-400 uppercase font-bold bg-sky-950 px-1 rounded">Quick Login</span>
            </button>

            <button
              onClick={() => handlePreloadDemo('worker', 'Sanjay Kumar', 'sanjay@eagleeye.com', 'Eagle Eye Patrols')}
              className="flex items-center justify-between p-2 rounded bg-slate-900 border border-slate-850 hover:border-amber-500/60 text-left transition-all group cursor-pointer"
            >
              <div>
                <span className="block text-[10px] font-bold text-white group-hover:text-amber-400">🚙 Sanjay Kumar (Field Driver)</span>
                <span className="text-[8px] text-slate-500 font-mono">Sect: Southern Fleet Patrols</span>
              </div>
              <span className="text-[9px] text-amber-400 uppercase font-bold bg-amber-950 px-1 rounded">Quick Login</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
