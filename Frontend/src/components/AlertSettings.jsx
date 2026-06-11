import React, { useState } from 'react';
import {
  Bell, Volume2, Vibrate, Smartphone, Watch, Car,
  ChevronLeft, Check, Save, RotateCcw
} from 'lucide-react';

// BIMSTEC member nations: Bangladesh, India, Myanmar, Nepal, Sri Lanka, Thailand, Bhutan
// English is always spoken first regardless of language chosen.
export const BIMSTEC_LANGUAGES = [
  { code: 'en-IN',  label: 'English',    native: 'English' },
  { code: 'hi-IN',  label: 'Hindi',      native: 'हिन्दी' },
  { code: 'bn-BD',  label: 'Bengali',    native: 'বাংলা' },
  { code: 'my-MM',  label: 'Burmese',    native: 'မြန်မာ' },
  { code: 'ne-NP',  label: 'Nepali',     native: 'नेपाली' },
  { code: 'si-LK',  label: 'Sinhala',    native: 'සිංහල' },
  { code: 'ta-IN',  label: 'Tamil',      native: 'தமிழ்' },
  { code: 'th-TH',  label: 'Thai',       native: 'ภาษาไทย' },
  { code: 'dz-BT',  label: 'Dzongkha',   native: 'རྫོང་ཁ' },
];

export const DEFAULT_ALERT_SETTINGS = {
  visualAlerts: true,
  popupNotification: true,
  bannerAlert: false,
  screenFlash: false,
  voiceAlerts: true,
  voiceLanguage: 'hi-IN',   // secondary language after English
  voiceMessage: 'speed-camera', // 'speed-camera' | 'slow-down' | 'custom'
  customVoiceText: '',
  vibrationAlerts: true,
  alertDistance: 400,
  reminderFrequency: 'once', // 'once' | 'twice' | 'three'
  devices: ['phone', 'carplay'],
};

export function loadAlertSettings() {
  try {
    const saved = localStorage.getItem('aegis_alert_settings');
    return saved ? { ...DEFAULT_ALERT_SETTINGS, ...JSON.parse(saved) } : { ...DEFAULT_ALERT_SETTINGS };
  } catch {
    return { ...DEFAULT_ALERT_SETTINGS };
  }
}

function Toggle({ enabled, onChange }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!enabled)}
      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none ${
        enabled ? 'bg-[#2ea014]' : 'bg-slate-700'
      }`}
    >
      <span
        className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-lg transition-transform duration-200 ${
          enabled ? 'translate-x-5' : 'translate-x-0'
        }`}
      />
    </button>
  );
}

function RadioOption({ label, value, selected, onChange }) {
  return (
    <label className="flex items-center gap-2.5 cursor-pointer group">
      <div
        onClick={() => onChange(value)}
        className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors shrink-0 ${
          selected
            ? 'border-[#2ea014] bg-[#2ea014]'
            : 'border-slate-600 bg-transparent group-hover:border-slate-400'
        }`}
      >
        {selected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
      </div>
      <span className="text-xs text-slate-300 group-hover:text-white transition-colors">{label}</span>
    </label>
  );
}

function Checkbox({ label, checked, onChange }) {
  return (
    <label className="flex items-center gap-2.5 cursor-pointer group">
      <div
        onClick={() => onChange(!checked)}
        className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-colors shrink-0 ${
          checked
            ? 'border-[#2ea014] bg-[#2ea014]'
            : 'border-slate-600 bg-transparent group-hover:border-slate-400'
        }`}
      >
        {checked && <Check size={10} className="text-white" strokeWidth={3} />}
      </div>
      <span className="text-xs text-slate-300 group-hover:text-white transition-colors">{label}</span>
    </label>
  );
}


// ── Scrollable Language Picker ───────────────────────────────────────────────
function LanguagePicker({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const selected = BIMSTEC_LANGUAGES.find(l => l.code === value) || BIMSTEC_LANGUAGES[0];

  return (
    <div className="relative">
      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-2">
        🌏 Alert Language — BIMSTEC Nations
      </span>

      {/* Trigger row */}
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg border border-slate-700 bg-slate-950 hover:border-sky-500/60 transition-colors"
      >
        <div className="flex items-center gap-2.5"><div className="text-left">
            <span className="text-xs font-bold text-slate-200 block">{selected.label}</span>
            <span className="text-[10px] text-slate-500">{selected.native}</span>
          </div>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="text-[9px] font-bold bg-sky-500/20 text-sky-400 border border-sky-500/40 px-1.5 py-0.5 rounded font-mono tracking-widest">
            ACTIVE
          </span>
          <svg
            className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {/* Scrollable dropdown */}
      {open && (
        <div className="absolute left-0 right-0 top-[calc(100%+4px)] z-50 bg-[#0a0f1d] border border-slate-700 rounded-xl shadow-2xl overflow-hidden">
          <div className="overflow-y-auto" style={{ maxHeight: '224px' }}>
            {BIMSTEC_LANGUAGES.map((lang, idx) => {
              const isSelected = lang.code === value;
              return (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => { onChange(lang.code); setOpen(false); }}
                  className={`w-full flex items-center justify-between px-3 py-2.5 text-left transition-colors
                    ${idx !== BIMSTEC_LANGUAGES.length - 1 ? 'border-b border-slate-800/70' : ''}
                    ${isSelected
                      ? 'bg-sky-500/15 text-sky-200'
                      : 'hover:bg-slate-800/60 text-slate-300'}`}
                >
                  <div className="flex items-center gap-2.5"><div>
                      <span className={`text-xs font-bold block ${isSelected ? 'text-sky-200' : 'text-slate-200'}`}>
                        {lang.label}
                      </span>
                      <span className="text-[10px] text-slate-500">{lang.native}</span>
                    </div>
                  </div>
                  {isSelected && (
                    <Check size={13} className="text-sky-400 shrink-0" strokeWidth={3} />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <p className="text-[10px] text-slate-600 mt-2 leading-relaxed">
        ℹ️ English is always spoken first, followed by the selected language.
      </p>
    </div>
  );
}

export default function AlertSettings({ onBack }) {
  const [settings, setSettings] = useState(loadAlertSettings);
  const [saved, setSaved] = useState(false);

  const update = (key, value) =>
    setSettings(prev => ({ ...prev, [key]: value }));

  const toggleDevice = (device) => {
    setSettings(prev => ({
      ...prev,
      devices: prev.devices.includes(device)
        ? prev.devices.filter(d => d !== device)
        : [...prev.devices, device],
    }));
  };

  const handleSave = () => {
    try {
      localStorage.setItem('aegis_alert_settings', JSON.stringify(settings));
    } catch {}
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleReset = () => {
    setSettings({ ...DEFAULT_ALERT_SETTINGS });
    try { localStorage.removeItem('aegis_alert_settings'); } catch {}
  };

  // Human-readable voice message preview
  const voicePreview = settings.voiceAlerts
    ? settings.voiceMessage === 'speed-camera'
      ? '"Road damage ahead. Reduce speed and stay alert."'
      : settings.voiceMessage === 'slow-down'
      ? '"Caution! Unrepaired pothole on this route."'
      : settings.customVoiceText
      ? `"${settings.customVoiceText}"`
      : 'No custom message set'
    : 'Voice disabled';

  const freqLabel = { once: 'once', twice: 'twice', three: '3 times' }[settings.reminderFrequency];

  const activeLang = BIMSTEC_LANGUAGES.find(l => l.code === settings.voiceLanguage);

  const summaryLines = [
    [
      settings.visualAlerts && 'Visual',
      settings.voiceAlerts && 'Voice',
      settings.vibrationAlerts && 'Vibration',
    ].filter(Boolean).join(', ') + ' alerts enabled' || 'All alerts disabled',
    settings.voiceAlerts
      ? `Voice: English → ${activeLang?.label ?? 'Hindi'} (${activeLang?.native ?? ''})`
      : 'Voice alerts disabled',
    `Alert ${settings.alertDistance}m before hazards, reminder ${freqLabel}`,
    `Active on: ${settings.devices.map(d => d === 'carplay' ? 'CarPlay' : d === 'watch' ? 'Apple Watch' : 'Phone').join(', ') || 'no device selected'}`,
  ];

  return (
    <div className="max-w-xl mx-auto font-sans text-slate-100">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          {onBack && (
            <button
              onClick={onBack}
              className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-600 transition-all"
            >
              <ChevronLeft size={16} />
            </button>
          )}
          <div>
            <h2 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
              Alert Settings
              <span className="text-[9px] bg-[#2ea014]/20 text-[#2ea014] border border-[#2ea014]/40 font-bold px-2 py-0.5 rounded font-mono tracking-widest">
                DRIVE MODE
              </span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Controls how Drive Mode alerts you when a hazard is ahead on your route.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-4">

        {/* ── Notification Type ── */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-800 bg-slate-950/40">
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Notification Type</span>
          </div>

          {/* Visual Alerts */}
          <div className="px-4 py-3.5 border-b border-slate-800/60">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-[#2ea014]/20 border border-[#2ea014]/40 flex items-center justify-center">
                  <Bell size={14} className="text-[#2ea014]" />
                </div>
                <div>
                  <span className="text-sm font-bold text-white">Visual Alerts</span>
                  <p className="text-[10px] text-slate-500 mt-0.5">Red hazard card shown in Drive Mode overlay</p>
                </div>
              </div>
              <Toggle enabled={settings.visualAlerts} onChange={v => update('visualAlerts', v)} />
            </div>
            {settings.visualAlerts && (
              <div className="pl-9 space-y-2.5">
                <Checkbox
                  label="Pop-up hazard card (red alert panel)"
                  checked={settings.popupNotification}
                  onChange={v => update('popupNotification', v)}
                />
                <Checkbox
                  label="Screen flash on critical hazards"
                  checked={settings.screenFlash}
                  onChange={v => update('screenFlash', v)}
                />
              </div>
            )}
          </div>

          {/* Voice Alerts */}
          <div className="px-4 py-3.5 border-b border-slate-800/60">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-sky-500/20 border border-sky-500/40 flex items-center justify-center">
                  <Volume2 size={14} className="text-sky-400" />
                </div>
                <div>
                  <span className="text-sm font-bold text-white">Voice Alerts</span>
                  <p className="text-[10px] text-slate-500 mt-0.5">Spoken in English first, then your chosen BIMSTEC language</p>
                </div>
              </div>
              <Toggle enabled={settings.voiceAlerts} onChange={v => update('voiceAlerts', v)} />
            </div>
            {settings.voiceAlerts && (
              <div className="pl-9 space-y-3">

                {/* BIMSTEC Language Picker — scrollable dropdown */}
                <LanguagePicker
                  value={settings.voiceLanguage}
                  onChange={v => update('voiceLanguage', v)}
                />

                {/* Message style */}
                <div className="pt-1 border-t border-slate-800/60 space-y-2.5">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">Message Style</span>
                  <RadioOption
                    label='"Road damage ahead. Reduce speed and stay alert."'
                    value="speed-camera"
                    selected={settings.voiceMessage === 'speed-camera'}
                    onChange={v => update('voiceMessage', v)}
                  />
                  <RadioOption
                    label='"Caution! Unrepaired pothole on this route."'
                    value="slow-down"
                    selected={settings.voiceMessage === 'slow-down'}
                    onChange={v => update('voiceMessage', v)}
                  />
                  <RadioOption
                    label="Custom message"
                    value="custom"
                    selected={settings.voiceMessage === 'custom'}
                    onChange={v => update('voiceMessage', v)}
                  />
                  {settings.voiceMessage === 'custom' && (
                    <input
                      type="text"
                      placeholder="e.g. Hazard ahead, reduce speed now"
                      value={settings.customVoiceText}
                      onChange={e => update('customVoiceText', e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 focus:border-[#2ea014] text-white text-xs rounded-lg px-3 py-2 outline-none transition-colors placeholder-slate-500 mt-1"
                    />
                  )}
                </div>

                {/* Live preview */}
                <div className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2">
                  <span className="text-[9px] text-slate-500 uppercase font-bold tracking-widest block mb-0.5">Will say</span>
                  <span className="text-[11px] text-sky-300 italic">{voicePreview}</span>
                  <span className="text-[10px] text-slate-600 block mt-0.5">
                    + {BIMSTEC_LANGUAGES.find(l => l.code === settings.voiceLanguage)?.label ?? 'selected language'} translation
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Vibration */}
          <div className="px-4 py-3.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center">
                  <Vibrate size={14} className="text-amber-400" />
                </div>
                <div>
                  <span className="text-sm font-bold text-white">Vibration Alerts</span>
                  <p className="text-[10px] text-slate-500 mt-0.5">Pulses device when hazard enters range</p>
                </div>
              </div>
              <Toggle enabled={settings.vibrationAlerts} onChange={v => update('vibrationAlerts', v)} />
            </div>
          </div>
        </div>

        {/* ── Alert Distance ── */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-800 bg-slate-950/40 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Alert Distance</span>
              <p className="text-[10px] text-slate-600 mt-0.5">How far ahead Drive Mode warns you of a hazard</p>
            </div>
            <span className="text-lg font-bold text-[#2ea014] font-mono">{settings.alertDistance}m</span>
          </div>
          <div className="px-4 py-4">
            <input
              type="range"
              min={100}
              max={1000}
              step={50}
              value={settings.alertDistance}
              onChange={e => update('alertDistance', Number(e.target.value))}
              className="w-full accent-[#2ea014] cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1.5">
              <span>100m (tight)</span>
              <span>500m (default)</span>
              <span>1000m (early)</span>
            </div>
          </div>
        </div>

        {/* ── Reminder Frequency ── */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-800 bg-slate-950/40">
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Reminder Frequency</span>
            <p className="text-[10px] text-slate-600 mt-0.5">How many times to alert per hazard as you approach</p>
          </div>
          <div className="px-4 py-3.5 flex items-center gap-6">
            <RadioOption label="Once" value="once" selected={settings.reminderFrequency === 'once'} onChange={v => update('reminderFrequency', v)} />
            <RadioOption label="Twice" value="twice" selected={settings.reminderFrequency === 'twice'} onChange={v => update('reminderFrequency', v)} />
            <RadioOption label="Three Times" value="three" selected={settings.reminderFrequency === 'three'} onChange={v => update('reminderFrequency', v)} />
          </div>
        </div>

        {/* ── Device Selection ── */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-800 bg-slate-950/40">
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Device Selection</span>
            <p className="text-[10px] text-slate-600 mt-0.5">Where Drive Mode alerts will be delivered</p>
          </div>
          <div className="px-4 py-4 flex items-center gap-3">
            {[
              { id: 'phone', icon: Smartphone, label: 'Phone' },
              { id: 'watch', icon: Watch, label: 'Apple Watch' },
              { id: 'carplay', icon: Car, label: 'CarPlay' },
            ].map(({ id, icon: Icon, label }) => {
              const active = settings.devices.includes(id);
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => toggleDevice(id)}
                  className={`flex-1 flex flex-col items-center gap-2 py-3 rounded-xl border-2 transition-all ${
                    active
                      ? 'bg-[#2ea014]/15 border-[#2ea014] text-[#2ea014]'
                      : 'bg-slate-950 border-slate-700 text-slate-400 hover:border-slate-500 hover:text-slate-300'
                  }`}
                >
                  <Icon size={20} />
                  <span className="text-[10px] font-bold">{label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Settings Summary ── */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-800 bg-slate-950/40">
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Your Settings Summary</span>
          </div>
          <div className="px-4 py-3.5 space-y-1.5">
            {summaryLines.map((line, i) => (
              <div key={i} className="flex items-start gap-2 text-xs text-slate-300">
                <span className="text-[#2ea014] mt-0.5 shrink-0">•</span>
                <span>{line}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Actions ── */}
        <div className="flex flex-col gap-2.5 pt-1 pb-4">
          <button
            type="button"
            onClick={handleSave}
            className={`w-full py-3 rounded-xl font-bold text-sm uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg ${
              saved
                ? 'bg-emerald-600 text-white'
                : 'bg-[#2ea014] hover:bg-[#258210] text-white shadow-[#2ea014]/20'
            }`}
          >
            {saved ? <Check size={16} /> : <Save size={16} />}
            {saved ? 'Changes Saved!' : 'Save Changes'}
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="w-full py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800 transition-all flex items-center justify-center gap-2"
          >
            <RotateCcw size={13} />
            Back to Default
          </button>
        </div>

      </div>
    </div>
  );
}