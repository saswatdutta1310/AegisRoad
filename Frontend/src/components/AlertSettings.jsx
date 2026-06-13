import React, { useState } from 'react';
import { Bell, Volume2, Vibrate, Smartphone, Watch, Car, ChevronLeft, Check, Save, RotateCcw } from 'lucide-react';

export const BIMSTEC_LANGUAGES = [
  { code:'en-IN', label:'English',  native:'English' },
  { code:'hi-IN', label:'Hindi',    native:'हिन्दी' },
  { code:'bn-BD', label:'Bengali',  native:'বাংলা' },
  { code:'my-MM', label:'Burmese',  native:'မြန်မာ' },
  { code:'ne-NP', label:'Nepali',   native:'नेपाली' },
  { code:'si-LK', label:'Sinhala',  native:'සිංහල' },
  { code:'ta-IN', label:'Tamil',    native:'தமிழ்' },
  { code:'th-TH', label:'Thai',     native:'ภาษาไทย' },
  { code:'dz-BT', label:'Dzongkha', native:'རྫོང་ཁ' },
];

export const DEFAULT_ALERT_SETTINGS = {
  visualAlerts:true, popupNotification:true, bannerAlert:false, screenFlash:false,
  voiceAlerts:true, voiceLanguage:'hi-IN', voiceMessage:'speed-camera', customVoiceText:'',
  vibrationAlerts:true, alertDistance:400, reminderFrequency:'once', devices:['phone','carplay'],
};

export function loadAlertSettings() {
  try {
    const s = localStorage.getItem('aegis_alert_settings');
    return s ? { ...DEFAULT_ALERT_SETTINGS, ...JSON.parse(s) } : { ...DEFAULT_ALERT_SETTINGS };
  } catch { return { ...DEFAULT_ALERT_SETTINGS }; }
}

const T = { teal:'#072E24', tealMid:'#156B52', yellow:'#C8D400', cream:'#F4F0E6', creamDark:'#EAE5D6', textDark:'#0D1E1B' };

function Toggle({ enabled, onChange }) {
  return (
    <button type="button" onClick={() => onChange(!enabled)} className="relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none" style={{ background: enabled?T.teal:'rgba(13,30,27,0.2)' }}>
      <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-lg transition-transform duration-200 ${enabled?'translate-x-5':'translate-x-0'}`} />
    </button>
  );
}

function RadioOption({ label, value, selected, onChange }) {
  return (
    <label className="flex items-center gap-2.5 cursor-pointer">
      <div onClick={() => onChange(value)} className="w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors shrink-0" style={{ borderColor:selected?T.teal:'rgba(13,30,27,0.25)', background:selected?T.teal:'transparent' }}>
        {selected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
      </div>
      <span className="text-xs" style={{ color:T.textDark }}>{label}</span>
    </label>
  );
}

function Checkbox({ label, checked, onChange }) {
  return (
    <label className="flex items-center gap-2.5 cursor-pointer">
      <div onClick={() => onChange(!checked)} className="w-4 h-4 rounded border-2 flex items-center justify-center transition-colors shrink-0" style={{ borderColor:checked?T.teal:'rgba(13,30,27,0.25)', background:checked?T.teal:'transparent' }}>
        {checked && <Check size={10} className="text-white" strokeWidth={3} />}
      </div>
      <span className="text-xs" style={{ color:T.textDark }}>{label}</span>
    </label>
  );
}

function LanguagePicker({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const selected = BIMSTEC_LANGUAGES.find(l => l.code===value)||BIMSTEC_LANGUAGES[0];
  return (
    <div className="relative">
      <span className="text-[9px] font-black uppercase tracking-widest block mb-1.5" style={{ color:'rgba(13,30,27,0.45)', fontFamily:'monospace' }}>🌏 Alert Language — BIMSTEC Nations</span>
      <button type="button" onClick={() => setOpen(o=>!o)} className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-colors border" style={{ background:T.creamDark, borderColor:'rgba(13,30,27,0.15)' }}>
        <div>
          <span className="text-xs font-bold block" style={{ color:T.teal }}>{selected.label}</span>
          <span className="text-[10px]" style={{ color:'rgba(13,30,27,0.45)' }}>{selected.native}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-[9px] font-black px-1.5 py-0.5 rounded" style={{ background:T.teal, color:T.yellow, fontFamily:'monospace' }}>ACTIVE</span>
          <svg className={`w-3.5 h-3.5 transition-transform ${open?'rotate-180':''}`} style={{ color:'rgba(13,30,27,0.4)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
        </div>
      </button>
      {open && (
        <div className="absolute left-0 right-0 top-[calc(100%+4px)] z-50 rounded-2xl shadow-xl overflow-hidden border" style={{ background:T.cream, borderColor:'rgba(13,30,27,0.12)' }}>
          <div className="overflow-y-auto" style={{ maxHeight:'220px' }}>
            {BIMSTEC_LANGUAGES.map((lang,i) => {
              const sel = lang.code===value;
              return (
                <button key={lang.code} type="button" onClick={()=>{onChange(lang.code);setOpen(false);}} className="w-full flex items-center justify-between px-3 py-2.5 text-left transition-colors border-b" style={{ borderColor:'rgba(13,30,27,0.06)', background:sel?'rgba(7,46,36,0.06)':'transparent', ...(i===BIMSTEC_LANGUAGES.length-1?{borderBottom:'none'}:{}) }}>
                  <div>
                    <span className="text-xs font-bold block" style={{ color: sel?T.teal:'rgba(13,30,27,0.7)' }}>{lang.label}</span>
                    <span className="text-[10px]" style={{ color:'rgba(13,30,27,0.4)' }}>{lang.native}</span>
                  </div>
                  {sel && <Check size={13} strokeWidth={3} style={{ color:T.teal }} />}
                </button>
              );
            })}
          </div>
        </div>
      )}
      <p className="text-[10px] mt-1.5" style={{ color:'rgba(13,30,27,0.4)' }}>ℹ️ English is always spoken first, followed by the selected language.</p>
    </div>
  );
}

const section = { background:'#FFFFFF', border:'1px solid rgba(13,30,27,0.1)', borderRadius:'16px', overflow:'hidden' };
const sHead = { padding:'12px 16px', borderBottom:'1px solid rgba(13,30,27,0.08)', background:T.creamDark };

export default function AlertSettings({ onBack }) {
  const [settings, setSettings] = useState(loadAlertSettings);
  const [saved, setSaved] = useState(false);
  const update = (k,v) => setSettings(p=>({...p,[k]:v}));
  const toggleDevice = (d) => setSettings(p=>({ ...p, devices:p.devices.includes(d)?p.devices.filter(x=>x!==d):[...p.devices,d] }));
  const handleSave = () => {
    try { localStorage.setItem('aegis_alert_settings',JSON.stringify(settings)); } catch {}
    setSaved(true); setTimeout(()=>setSaved(false),2000);
  };
  const handleReset = () => { setSettings({...DEFAULT_ALERT_SETTINGS}); try{localStorage.removeItem('aegis_alert_settings');}catch{} };

  const voicePreview = settings.voiceAlerts
    ? settings.voiceMessage==='speed-camera'?'"Road damage ahead. Reduce speed and stay alert."'
    : settings.voiceMessage==='slow-down'?'"Caution! Unrepaired pothole on this route."'
    : settings.customVoiceText?`"${settings.customVoiceText}"`:'No custom message set'
    : 'Voice disabled';

  const activeLang = BIMSTEC_LANGUAGES.find(l=>l.code===settings.voiceLanguage);
  const summaryLines = [
    [settings.visualAlerts&&'Visual',settings.voiceAlerts&&'Voice',settings.vibrationAlerts&&'Vibration'].filter(Boolean).join(', ')+' alerts enabled'||'All alerts disabled',
    settings.voiceAlerts?`Voice: English → ${activeLang?.label??'Hindi'} (${activeLang?.native??''})` : 'Voice alerts disabled',
    `Alert ${settings.alertDistance}m before hazards`,
    `Active on: ${settings.devices.map(d=>d==='carplay'?'CarPlay':d==='watch'?'Apple Watch':'Phone').join(', ')||'no device selected'}`,
  ];

  return (
    <div className="max-w-xl mx-auto animate-fadeIn">
      <div className="flex items-center gap-3 mb-6">
        {onBack && (
          <button onClick={onBack} className="p-2 rounded-xl border cursor-pointer transition-all" style={{ background:T.creamDark, borderColor:'rgba(13,30,27,0.12)', color:T.teal }}>
            <ChevronLeft size={16} />
          </button>
        )}
        <div>
          <h2 className="text-[clamp(24px,3vw,36px)] font-black uppercase flex items-center gap-2" style={{ fontFamily:"'Barlow Condensed',sans-serif", color:T.teal }}>
            Alert Settings
            <span className="text-[9px] font-black px-2 py-0.5 rounded" style={{ background:T.teal, color:T.yellow, fontFamily:'monospace' }}>DRIVE MODE</span>
          </h2>
          <p className="text-xs" style={{ color:'rgba(13,30,27,0.5)' }}>Controls how Drive Mode alerts you when a hazard is ahead.</p>
        </div>
      </div>

      <div className="space-y-4">
        {/* Notification Type */}
        <div style={section}>
          <div style={sHead}><span className="text-[10px] font-black uppercase tracking-widest" style={{ color:'rgba(13,30,27,0.45)', fontFamily:'monospace' }}>Notification Type</span></div>
          
          {/* Visual */}
          <div className="px-4 py-4 border-b" style={{ borderColor:'rgba(13,30,27,0.08)' }}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background:'rgba(7,46,36,0.08)', color:T.teal }}><Bell size={14}/></div>
                <div><span className="text-sm font-bold" style={{ color:T.teal }}>Visual Alerts</span><p className="text-[10px]" style={{ color:'rgba(13,30,27,0.45)' }}>Red hazard card shown in Drive Mode overlay</p></div>
              </div>
              <Toggle enabled={settings.visualAlerts} onChange={v=>update('visualAlerts',v)} />
            </div>
            {settings.visualAlerts && (
              <div className="pl-10 space-y-2.5">
                <Checkbox label="Pop-up hazard card (red alert panel)" checked={settings.popupNotification} onChange={v=>update('popupNotification',v)} />
                <Checkbox label="Screen flash on critical hazards" checked={settings.screenFlash} onChange={v=>update('screenFlash',v)} />
              </div>
            )}
          </div>

          {/* Voice */}
          <div className="px-4 py-4 border-b" style={{ borderColor:'rgba(13,30,27,0.08)' }}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background:'rgba(21,107,82,0.08)', color:T.tealMid }}><Volume2 size={14}/></div>
                <div><span className="text-sm font-bold" style={{ color:T.teal }}>Voice Alerts</span><p className="text-[10px]" style={{ color:'rgba(13,30,27,0.45)' }}>Spoken in English first, then your BIMSTEC language</p></div>
              </div>
              <Toggle enabled={settings.voiceAlerts} onChange={v=>update('voiceAlerts',v)} />
            </div>
            {settings.voiceAlerts && (
              <div className="pl-10 space-y-3">
                <LanguagePicker value={settings.voiceLanguage} onChange={v=>update('voiceLanguage',v)} />
                <div className="pt-2 border-t space-y-2.5" style={{ borderColor:'rgba(13,30,27,0.08)' }}>
                  <span className="text-[9px] font-black uppercase tracking-widest block" style={{ color:'rgba(13,30,27,0.45)', fontFamily:'monospace' }}>Message Style</span>
                  <RadioOption label='"Road damage ahead. Reduce speed and stay alert."' value="speed-camera" selected={settings.voiceMessage==='speed-camera'} onChange={v=>update('voiceMessage',v)} />
                  <RadioOption label='"Caution! Unrepaired pothole on this route."' value="slow-down" selected={settings.voiceMessage==='slow-down'} onChange={v=>update('voiceMessage',v)} />
                  <RadioOption label="Custom message" value="custom" selected={settings.voiceMessage==='custom'} onChange={v=>update('voiceMessage',v)} />
                  {settings.voiceMessage==='custom' && (
                    <input type="text" placeholder="e.g. Hazard ahead, reduce speed now" value={settings.customVoiceText} onChange={e=>update('customVoiceText',e.target.value)} className="w-full text-xs px-3 py-2 rounded-xl outline-none mt-1" style={{ background:T.creamDark, border:'1px solid rgba(13,30,27,0.15)', color:T.textDark }} />
                  )}
                </div>
                <div className="p-3 rounded-xl" style={{ background:T.creamDark, border:'1px solid rgba(13,30,27,0.08)' }}>
                  <span className="text-[9px] font-black uppercase tracking-widest block mb-0.5" style={{ color:'rgba(13,30,27,0.4)', fontFamily:'monospace' }}>Will say</span>
                  <span className="text-xs italic" style={{ color:T.tealMid }}>{voicePreview}</span>
                </div>
              </div>
            )}
          </div>

          {/* Vibration */}
          <div className="px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background:'rgba(217,119,6,0.08)', color:'#d97706' }}><Vibrate size={14}/></div>
                <div><span className="text-sm font-bold" style={{ color:T.teal }}>Vibration Alerts</span><p className="text-[10px]" style={{ color:'rgba(13,30,27,0.45)' }}>Pulses device when hazard enters range</p></div>
              </div>
              <Toggle enabled={settings.vibrationAlerts} onChange={v=>update('vibrationAlerts',v)} />
            </div>
          </div>
        </div>

        {/* Alert Distance */}
        <div style={section}>
          <div style={{ ...sHead, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest block" style={{ color:'rgba(13,30,27,0.45)', fontFamily:'monospace' }}>Alert Distance</span>
              <p className="text-[10px]" style={{ color:'rgba(13,30,27,0.35)' }}>How far ahead Drive Mode warns of a hazard</p>
            </div>
            <span className="text-xl font-black font-mono" style={{ fontFamily:"'Barlow Condensed',sans-serif", color:T.teal }}>{settings.alertDistance}m</span>
          </div>
          <div className="px-4 py-4">
            <input type="range" min={100} max={1000} step={50} value={settings.alertDistance} onChange={e=>update('alertDistance',Number(e.target.value))} className="w-full cursor-pointer" style={{ accentColor:T.teal }} />
            <div className="flex justify-between text-[10px] font-mono mt-1.5" style={{ color:'rgba(13,30,27,0.4)' }}>
              <span>100m (tight)</span><span>500m (default)</span><span>1000m (early)</span>
            </div>
          </div>
        </div>

        {/* Reminder Frequency */}
        <div style={section}>
          <div style={sHead}><span className="text-[10px] font-black uppercase tracking-widest" style={{ color:'rgba(13,30,27,0.45)', fontFamily:'monospace' }}>Reminder Frequency</span></div>
          <div className="px-4 py-4 flex items-center gap-6">
            <RadioOption label="Once" value="once" selected={settings.reminderFrequency==='once'} onChange={v=>update('reminderFrequency',v)} />
            <RadioOption label="Twice" value="twice" selected={settings.reminderFrequency==='twice'} onChange={v=>update('reminderFrequency',v)} />
            <RadioOption label="Three Times" value="three" selected={settings.reminderFrequency==='three'} onChange={v=>update('reminderFrequency',v)} />
          </div>
        </div>

        {/* Device Selection */}
        <div style={section}>
          <div style={sHead}><span className="text-[10px] font-black uppercase tracking-widest" style={{ color:'rgba(13,30,27,0.45)', fontFamily:'monospace' }}>Device Selection</span></div>
          <div className="px-4 py-4 flex items-center gap-3">
            {[{id:'phone',icon:Smartphone,label:'Phone'},{id:'watch',icon:Watch,label:'Apple Watch'},{id:'carplay',icon:Car,label:'CarPlay'}].map(({id,icon:Icon,label}) => {
              const active = settings.devices.includes(id);
              return (
                <button key={id} type="button" onClick={()=>toggleDevice(id)} className="flex-1 flex flex-col items-center gap-2 py-3 rounded-2xl border-2 transition-all cursor-pointer" style={{ background:active?'rgba(7,46,36,0.06)':'transparent', borderColor:active?T.teal:'rgba(13,30,27,0.12)', color:active?T.teal:'rgba(13,30,27,0.4)' }}>
                  <Icon size={20}/><span className="text-[10px] font-bold">{label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Summary */}
        <div style={section}>
          <div style={sHead}><span className="text-[10px] font-black uppercase tracking-widest" style={{ color:'rgba(13,30,27,0.45)', fontFamily:'monospace' }}>Your Settings Summary</span></div>
          <div className="px-4 py-4 space-y-1.5">
            {summaryLines.map((line,i) => (
              <div key={i} className="flex items-start gap-2 text-xs" style={{ color:T.textDark }}>
                <span className="mt-0.5 shrink-0 font-black" style={{ color:T.tealMid }}>•</span>{line}
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2.5 pb-4">
          <button type="button" onClick={handleSave} className="w-full py-4 rounded-2xl text-sm font-black uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-all hover:scale-[1.01]" style={{ background:saved?T.tealMid:T.teal, color:saved?'#fff':T.yellow, fontFamily:"'Barlow Condensed',sans-serif" }}>
            {saved?<Check size={16}/>:<Save size={16}/>}{saved?'Changes Saved!':'Save Changes'}
          </button>
          <button type="button" onClick={handleReset} className="w-full py-3 rounded-2xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-all border" style={{ borderColor:'rgba(13,30,27,0.15)', color:'rgba(13,30,27,0.55)', background:'transparent' }}>
            <RotateCcw size={13}/>Back to Default
          </button>
        </div>
      </div>
    </div>
  );
}
