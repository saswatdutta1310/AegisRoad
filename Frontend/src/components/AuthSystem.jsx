import React, { useState } from 'react';
import { ShieldCheck, User, Building, Wrench, Lock, Mail, UserPlus, LogIn, X, Info } from 'lucide-react';
import { toast } from 'react-toastify';
import { authApi } from '../services/api';

const T = { teal:'#072E24', tealMid:'#156B52', yellow:'#C8D400', cream:'#F4F0E6', creamDark:'#EAE5D6', textDark:'#0D1E1B' };
const inp = {
  background: '#EAE5D6', border: '1px solid rgba(13,30,27,0.18)',
  borderRadius: '10px', padding: '9px 12px 9px 36px',
  fontSize: '13px', color: T.textDark, outline: 'none', width: '100%',
};
const inpNoIcon = { ...inp, padding: '9px 12px' };

export default function AuthSystem({ isOpen, onClose, onLogin }) {
  const [isRegister, setIsRegister] = useState(false);
  const [role, setRole] = useState('contractor');
  const [formData, setFormData] = useState({ username:'', email:'', orgName:'BuildFast Pvt. Ltd.', password:'' });

  if (!isOpen) return null;

  const handleRoleChange = (r) => {
    setRole(r);
    const orgs = { contractor:'BuildFast Pvt. Ltd.', government:'Municipal Road Corp', worker:'Eagle Eye Patrols' };
    setFormData(p => ({ ...p, orgName: orgs[r] }));
  };

  const handlePreloadDemo = (roleType, name, email, org) => {
    const user = { username:name, email, role:roleType, orgName:org };
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
      toast.error("Please fill out all required fields to continue."); return;
    }
    const orgName = formData.orgName || (role==='contractor'?'BuildFast Pvt. Ltd.':role==='government'?'Municipal Road Corp':'Eagle Eye Patrols');
    try {
      if (isRegister) await authApi.register({ username:formData.username, email:formData.email, password:formData.password, role, orgName });
      const res = await authApi.login({ email:formData.email, password:formData.password });
      persistSession(res.user, res.access_token);
      toast.success(`Welcome, ${res.user.username}!`);
      onClose();
    } catch {
      const user = { username:formData.username, email:formData.email, role, orgName };
      persistSession(user, null);
      toast.success(isRegister ? `Demo account ready, ${formData.username}.` : `Demo login: ${formData.username}.`);
      onClose();
    }
  };

  const roleBtn = (r, icon, label, activeCol) => {
    const active = role === r;
    return (
      <button type="button" onClick={() => handleRoleChange(r)}
        className="flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer border"
        style={{
          background: active ? T.teal : T.creamDark,
          color: active ? T.yellow : 'rgba(13,30,27,0.5)',
          borderColor: active ? T.teal : 'rgba(13,30,27,0.12)',
          fontFamily: "'Barlow Condensed', sans-serif"
        }}
      >
        {icon}
        <span>{label}</span>
      </button>
    );
  };

  return (
    <div className="aegis-modal-overlay fixed inset-0 flex items-center justify-center p-4 animate-fadeIn" style={{ background:'rgba(7,46,36,0.8)', backdropFilter:'blur(14px)' }}>
      <div className="relative w-full max-w-md rounded-2xl overflow-hidden shadow-2xl" style={{ background:T.cream }}>

        {/* Header */}
        <div className="p-5 flex justify-between items-center" style={{ background:T.teal }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background:T.yellow }}>
              <ShieldCheck size={20} style={{ color:T.teal }} />
            </div>
            <div>
              <h3 className="text-lg font-black uppercase text-white" style={{ fontFamily:"'Barlow Condensed',sans-serif" }}>
                {isRegister ? 'Register Identity' : 'Secure Sign In'}
              </h3>
              <p className="text-[10px] font-mono" style={{ color:'rgba(255,255,255,0.5)' }}>AegisRoad Authentication Ledger</p>
            </div>
          </div>
          <button onClick={onClose} className="text-white/50 hover:text-white transition-colors cursor-pointer"><X size={18} /></button>
        </div>

        {/* Tabs */}
        <div className="grid grid-cols-2 gap-0 border-b" style={{ background:T.creamDark, borderColor:'rgba(13,30,27,0.1)' }}>
          {[{ id:false, label:'Sign In Account' }, { id:true, label:'Register Personnel' }].map(t => (
            <button key={String(t.id)} onClick={() => setIsRegister(t.id)} className="py-3 text-[11px] font-black uppercase tracking-wider transition-all cursor-pointer" style={{
              background: isRegister===t.id ? T.cream : 'transparent',
              color: isRegister===t.id ? T.teal : 'rgba(13,30,27,0.45)',
              fontFamily: "'Barlow Condensed',sans-serif",
              borderBottom: isRegister===t.id ? `2px solid ${T.teal}` : '2px solid transparent',
            }}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-[9px] font-black uppercase tracking-wider mb-2" style={{ color:'rgba(13,30,27,0.45)', fontFamily:'monospace' }}>Choose Security Role *</label>
            <div className="grid grid-cols-3 gap-2">
              {roleBtn('contractor', <Building size={15}/>, 'Contractor')}
              {roleBtn('government', <ShieldCheck size={15}/>, 'Gov Officer')}
              {roleBtn('worker', <Wrench size={15}/>, 'Field Worker')}
            </div>
          </div>

          <div className="space-y-3">
            <div className="relative">
              <label className="block text-[9px] font-black uppercase tracking-wider mb-1.5" style={{ color:'rgba(13,30,27,0.45)', fontFamily:'monospace' }}>Full Username *</label>
              <User size={13} className="absolute left-3 bottom-[9px]" style={{ color:'rgba(13,30,27,0.35)' }} />
              <input type="text" required placeholder="e.g. Sandra Arjun" value={formData.username} onChange={e=>setFormData({...formData,username:e.target.value})} style={inp} />
            </div>
            <div className="relative">
              <label className="block text-[9px] font-black uppercase tracking-wider mb-1.5" style={{ color:'rgba(13,30,27,0.45)', fontFamily:'monospace' }}>Official Email *</label>
              <Mail size={13} className="absolute left-3 bottom-[9px]" style={{ color:'rgba(13,30,27,0.35)' }} />
              <input type="email" required placeholder="e.g. s.arjun@aegisroad.gov" value={formData.email} onChange={e=>setFormData({...formData,email:e.target.value})} style={inp} />
            </div>
            {role === 'contractor' ? (
              <div>
                <label className="block text-[9px] font-black uppercase tracking-wider mb-1.5" style={{ color:'rgba(13,30,27,0.45)', fontFamily:'monospace' }}>Contractor Firm</label>
                <select value={formData.orgName} onChange={e=>setFormData({...formData,orgName:e.target.value})} style={inpNoIcon}>
                  <option>BuildFast Pvt. Ltd.</option><option>Apex Infrastruct</option><option>Core Asphalt Co.</option><option>Urban Safety Ltd.</option>
                </select>
              </div>
            ) : (
              <div>
                <label className="block text-[9px] font-black uppercase tracking-wider mb-1.5" style={{ color:'rgba(13,30,27,0.45)', fontFamily:'monospace' }}>Agency / Division</label>
                <input type="text" placeholder={role==='government'?'Municipal Road Corporation':'Southern Sector Fleet'} value={formData.orgName} onChange={e=>setFormData({...formData,orgName:e.target.value})} style={inpNoIcon} />
              </div>
            )}
            <div className="relative">
              <label className="block text-[9px] font-black uppercase tracking-wider mb-1.5" style={{ color:'rgba(13,30,27,0.45)', fontFamily:'monospace' }}>Security Password *</label>
              <Lock size={13} className="absolute left-3 bottom-[9px]" style={{ color:'rgba(13,30,27,0.35)' }} />
              <input type="password" required placeholder="••••••••" value={formData.password} onChange={e=>setFormData({...formData,password:e.target.value})} style={inp} />
            </div>
          </div>

          <button type="submit" className="w-full py-3 rounded-xl text-sm font-black uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-all hover:scale-[1.01]" style={{ background:T.teal, color:T.yellow, fontFamily:"'Barlow Condensed',sans-serif" }}>
            {isRegister ? <UserPlus size={14}/> : <LogIn size={14}/>}
            {isRegister ? 'Register & Initialize' : 'Secure Authenticate'}
          </button>
        </form>

        {/* Demo accounts */}
        <div className="p-5 border-t" style={{ background:T.creamDark, borderColor:'rgba(13,30,27,0.1)' }}>
          <div className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-wider mb-3" style={{ color:'rgba(13,30,27,0.45)', fontFamily:'monospace' }}>
            <Info size={11} style={{ color:T.tealMid }} />Fast Demo Testing Accounts
          </div>
          <div className="flex flex-col gap-2">
            {[
              { emoji:'👷', name:'Sandra Arjun', role:'contractor', org:'BuildFast Pvt. Ltd.', email:'sandra@buildfast.co.in', col:'#16a34a', bg:'rgba(22,163,74,0.08)' },
              { emoji:'🏛️', name:'Chief Inspector Rao', role:'government', org:'Municipal Road Corp', email:'rao@municipality.gov', col:T.tealMid, bg:'rgba(21,107,82,0.08)' },
              { emoji:'🚙', name:'Sanjay Kumar', role:'worker', org:'Eagle Eye Patrols', email:'sanjay@eagleeye.com', col:'#d97706', bg:'rgba(217,119,6,0.08)' },
            ].map(d => (
              <button key={d.name} onClick={() => handlePreloadDemo(d.role,d.name,d.email,d.org)} className="flex items-center justify-between p-2.5 rounded-xl transition-all cursor-pointer text-left" style={{ background:d.bg, border:`1px solid ${d.col}22` }}>
                <div>
                  <span className="text-[10px] font-black block" style={{ color:T.teal }}>{d.emoji} {d.name} <span className="font-normal" style={{ color:'rgba(13,30,27,0.4)' }}>({d.role})</span></span>
                  <span className="text-[8px] font-mono" style={{ color:'rgba(13,30,27,0.4)' }}>Firm: {d.org}</span>
                </div>
                <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded" style={{ color:d.col, background:`${d.col}18`, fontFamily:"'Barlow Condensed',sans-serif" }}>Quick Login</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
