import { useState, useEffect, useRef, useCallback } from 'react'

// ── Load alert preferences set in AlertSettings ──────────────────────────────
const DEFAULT_ALERT_PREFS = {
  visualAlerts: true,
  popupNotification: true,
  screenFlash: false,
  voiceAlerts: true,
  voiceMessage: 'speed-camera',
  customVoiceText: '',
  vibrationAlerts: true,
  alertDistance: 400,
  reminderFrequency: 'once',
}
function loadAlertPrefs() {
  try {
    const saved = localStorage.getItem('aegis_alert_settings')
    return saved ? { ...DEFAULT_ALERT_PREFS, ...JSON.parse(saved) } : { ...DEFAULT_ALERT_PREFS }
  } catch { return { ...DEFAULT_ALERT_PREFS } }
}

// ── Constants ────────────────────────────────────────────────────────────────
const HAZARDS = [
  { id:1, lat:16.5417, lng:80.5152, cls:'D40', severity:'critical', road:'NH-16, Vijayawada', contractor:'Ramesh Road Works' },
  { id:2, lat:16.3067, lng:80.4365, cls:'D20', severity:'high',     road:'SH-47, Guntur',    contractor:'AP Infrastructure Ltd' },
  { id:3, lat:16.4307, lng:80.6241, cls:'D10', severity:'medium',   road:'NH-65, Mangalagiri',contractor:'National Highway Corp' },
  { id:4, lat:16.5820, lng:80.6278, cls:'D00', severity:'low',      road:'MDR-22, Tadepalle', contractor:'Coastal Road Builders' },
  { id:5, lat:16.2760, lng:80.4534, cls:'D40', severity:'critical', road:'NH-16, Tenali',     contractor:'Deccan Infra Pvt Ltd' },
]

const SEV_COLOR = { critical:'#ef4444', high:'#f59e0b', medium:'#3b82f6', low:'#10b981' }

// ── Helpers ──────────────────────────────────────────────────────────────────
function distM(lat1, lng1, lat2, lng2) {
  const R = 6371000
  const dLat = (lat2-lat1)*Math.PI/180
  const dLng = (lng2-lng1)*Math.PI/180
  const a = Math.sin(dLat/2)**2 +
    Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLng/2)**2
  return R*2*Math.atan2(Math.sqrt(a),Math.sqrt(1-a))
}

function getRouteHazards(coords) {
  const found = []
  for (const h of HAZARDS) {
    for (const [lng,lat] of coords) {
      if (distM(lat,lng,h.lat,h.lng) <= ALERT_RADIUS_M) {
        if (!found.find(f=>f.id===h.id)) found.push(h)
        break
      }
    }
  }
  return found
}

// ── PWA Install Hook ─────────────────────────────────────────────────────────
// Returns { canInstall, install } — works on Chrome/Edge/Android
// iOS shows instructions instead (Safari doesn't fire beforeinstallprompt)
export function usePWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState(null)
  const [canInstall,     setCanInstall]     = useState(false)
  const [isIOS,          setIsIOS]          = useState(false)
  const [isInstalled,    setIsInstalled]    = useState(false)

  useEffect(() => {
    // Already installed as standalone?
    if (window.matchMedia('(display-mode: standalone)').matches ||
        window.navigator.standalone === true) {
      setIsInstalled(true)
      return
    }

    // Detect iOS (Safari doesn't fire beforeinstallprompt)
    const ios = /iphone|ipad|ipod/i.test(navigator.userAgent) && !window.MSStream
    setIsIOS(ios)
    if (ios) { setCanInstall(true); return }

    // Chrome/Edge/Android — capture the install prompt
    const handler = e => {
      e.preventDefault()           // don't auto-show
      setDeferredPrompt(e)
      setCanInstall(true)
    }
    window.addEventListener('beforeinstallprompt', handler)

    // App was installed successfully
    window.addEventListener('appinstalled', () => {
      setIsInstalled(true)
      setCanInstall(false)
      setDeferredPrompt(null)
    })

    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const install = async () => {
    if (!deferredPrompt) return false
    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    setDeferredPrompt(null)
    if (outcome === 'accepted') setIsInstalled(true)
    return outcome === 'accepted'
  }

  return { canInstall, isInstalled, isIOS, install }
}

// ── Voice Engine ─────────────────────────────────────────────────────────────
// Reliable cross-browser voice: tries Web Speech API first,
// falls back to AudioContext beep so *something* always plays.
class VoiceEngine {
  constructor() {
    this._unlocked = false
    this._ctx = null
  }

  // MUST be called inside a user-gesture handler (click/touch)
  unlock() {
    if (this._unlocked) return
    try {
      // Web Speech API warm-up
      if ('speechSynthesis' in window) {
        const u = new SpeechSynthesisUtterance('')
        u.volume = 0
        window.speechSynthesis.speak(u)
      }
      // AudioContext unlock (needed on iOS/Chrome mobile)
      const Ctx = window.AudioContext || window.webkitAudioContext
      if (Ctx) {
        this._ctx = new Ctx()
        if (this._ctx.state === 'suspended') this._ctx.resume()
      }
      this._unlocked = true
    } catch (_) {}
  }

  // Plays a short warning beep regardless of speech support
  _beep(freq = 880, dur = 0.25) {
    try {
      if (!this._ctx) {
        const Ctx = window.AudioContext || window.webkitAudioContext
        if (!Ctx) return
        this._ctx = new Ctx()
      }
      if (this._ctx.state === 'suspended') this._ctx.resume()
      const osc  = this._ctx.createOscillator()
      const gain = this._ctx.createGain()
      osc.connect(gain); gain.connect(this._ctx.destination)
      osc.frequency.value = freq
      gain.gain.setValueAtTime(0.3, this._ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.001, this._ctx.currentTime + dur)
      osc.start(); osc.stop(this._ctx.currentTime + dur)
    } catch (_) {}
  }

  async speak(engText, localText, localLang = 'hi-IN') {
    // Always beep first — works even when speech is blocked
    this._beep(880, 0.18)
    await new Promise(r => setTimeout(r, 250))
    this._beep(660, 0.15)

    if (!('speechSynthesis' in window)) return
    window.speechSynthesis.cancel()

    const say = (text, lang) => new Promise(res => {
      // Chrome mobile bug: speech hangs after ~15s — watchdog
      const watchdog = setTimeout(() => {
        window.speechSynthesis.cancel(); res()
      }, 8000)

      const u = new SpeechSynthesisUtterance(text)
      u.lang   = lang
      u.rate   = 0.88
      u.volume = 1
      u.pitch  = 1

      u.onend   = () => { clearTimeout(watchdog); res() }
      u.onerror = () => { clearTimeout(watchdog); res() }

      // Chrome mobile needs voices loaded — wait if necessary
      const voices = window.speechSynthesis.getVoices()
      if (voices.length === 0) {
        window.speechSynthesis.onvoiceschanged = () => {
          window.speechSynthesis.onvoiceschanged = null
          window.speechSynthesis.speak(u)
        }
      } else {
        window.speechSynthesis.speak(u)
      }
    })

    // English always comes first
    await say(engText, 'en-IN')

    // Only speak the local translation if a different language is chosen
    if (localLang && localLang !== 'en-IN' && localText) {
      await new Promise(r => setTimeout(r, 350))
      await say(localText, localLang)
    }
  }
}

// Singleton so we don't recreate AudioContext repeatedly
const voice = new VoiceEngine()

// ── BIMSTEC hazard-alert translations ────────────────────────────────────────
// Keys map to BCP-47 lang codes stored in alertPrefs.voiceLanguage.
// Each entry is a function(distM, clsLabel) → translated alert string.
const BIMSTEC_TRANSLATIONS = {
  'en-IN': (d, cls) => `Road damage ahead. ${cls} detected ${d} metres ahead. Reduce speed and stay alert.`,
  'hi-IN': (d, cls) => `चेतावनी! आगे ${d} मीटर पर ${cls} है। कृपया गति धीमी करें।`,
  'bn-BD': (d, cls) => `সাবধান! সামনে ${d} মিটারে ${cls} রয়েছে। গতি কমান।`,
  'my-MM': (d, cls) => `သတိပေးချက်! ${d} မီတာအကွာတွင် ${cls} ရှိသည်။ အမြန်နှုန်းလျှော့ချပါ။`,
  'ne-NP': (d, cls) => `सावधान! अगाडि ${d} मिटरमा ${cls} छ। गति घटाउनुहोस्।`,
  'si-LK': (d, cls) => `අවවාදයයි! ඉදිරියේ ${d} මීටර් දුරින් ${cls} ඇත. වේගය අඩු කරන්න.`,
  'ta-IN': (d, cls) => `எச்சரிக்கை! முன்னே ${d} மீட்டர் தூரத்தில் ${cls} உள்ளது. வேகத்தை குறைக்கவும்.`,
  'th-TH': (d, cls) => `คำเตือน! มี${cls}อยู่ข้างหน้า ${d} เมตร กรุณาลดความเร็ว`,
  'dz-BT': (d, cls) => `ཞིབ་འཚོལ། ${d} སྨི་ལས་གདོང་ལྔ་ཁར་ ${cls} འདུག ཤུགས་ཆུང་ངུ་བཏང་།`,
}

// cls code → human-readable label used in translations
function clsLabel(cls) {
  return cls === 'D40' ? 'pothole' : cls === 'D20' ? 'road crack' : cls === 'D10' ? 'waterlogging' : 'road damage'
}

// ── PWA Install Banner ───────────────────────────────────────────────────────
function InstallBanner({ onDismiss }) {
  const { canInstall, isInstalled, isIOS, install } = usePWAInstall()
  const [showIOSHelp, setShowIOSHelp] = useState(false)

  if (isInstalled || !canInstall) return null

  const handleInstall = async () => {
    if (isIOS) {
      setShowIOSHelp(v => !v)
      return
    }
    await install()
    onDismiss?.()
  }

  return (
    <div style={{
      background: 'linear-gradient(135deg,#1a2744,#0f1a30)',
      border: '1px solid #2d4a8a',
      borderRadius: 12,
      padding: '14px 16px',
      marginBottom: 16,
      position: 'relative',
    }}>
      {/* Dismiss */}
      <button
        onClick={onDismiss}
        style={{ position:'absolute',top:10,right:12,background:'none',border:'none',
          color:'#5a6480',fontSize:18,cursor:'pointer',lineHeight:1 }}
        aria-label="Dismiss"
      >✕</button>

      <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom: showIOSHelp ? 12 : 0 }}>
        <div style={{ fontSize:28 }}>📱</div>
        <div>
          <div style={{ fontSize:14, fontWeight:700, color:'#dde2ee', marginBottom:2 }}>
            Add AegisRoad to Home Screen
          </div>
          <div style={{ fontSize:12, color:'#5a6480' }}>
            Get instant access, offline support & faster alerts
          </div>
        </div>
      </div>

      {showIOSHelp ? (
        <div style={{
          background:'rgba(79,142,247,0.1)', border:'1px solid rgba(79,142,247,0.3)',
          borderRadius:8, padding:'10px 14px', fontSize:12, color:'#a0b4d6', lineHeight:1.8,
        }}>
          <strong style={{ color:'#4f8ef7' }}>On Safari (iOS):</strong><br/>
          1. Tap the <strong style={{color:'#dde2ee'}}>Share button</strong> (box with arrow ↑) at the bottom<br/>
          2. Scroll down and tap <strong style={{color:'#dde2ee'}}>"Add to Home Screen"</strong><br/>
          3. Tap <strong style={{color:'#dde2ee'}}>"Add"</strong> — AegisRoad appears on your home screen!
        </div>
      ) : (
        <button
          onClick={handleInstall}
          style={{
            marginTop: 10,
            width: '100%',
            padding: '10px 0',
            background: 'linear-gradient(135deg,#4f8ef7,#7c3aed)',
            border: 'none',
            borderRadius: 8,
            color: '#fff',
            fontSize: 13,
            fontWeight: 700,
            cursor: 'pointer',
            letterSpacing: 0.3,
          }}
        >
          {isIOS ? '📲 How to install on iOS?' : '⬇️ Install App'}
        </button>
      )}
    </div>
  )
}

// ── Nominatim autocomplete ───────────────────────────────────────────────────
async function searchPlaces(query) {
  if (!query || query.length < 3) return []
  const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=7&addressdetails=1&countrycodes=in`
  try {
    const r = await fetch(url, { headers: { 'Accept-Language': 'en', 'User-Agent': 'AegisRoad/3.0' } })
    if (!r.ok) throw new Error('Nominatim error')
    const d = await r.json()
    return d.map(p => ({
      display: p.display_name,
      short:   [
        p.address?.suburb || p.address?.neighbourhood,
        p.address?.city || p.address?.town || p.address?.village,
        p.address?.state,
      ].filter(Boolean).join(', '),
      lat: parseFloat(p.lat),
      lng: parseFloat(p.lon),
    }))
  } catch { return [] }
}

// ── Get route ────────────────────────────────────────────────────────────────
async function getRoute(from, to) {
  try {
    const body = { coordinates:[[from.lng,from.lat],[to.lng,to.lat]], format:'geojson' }
    const r = await fetch('https://api.openrouteservice.org/v2/directions/driving-car/geojson', {
      method:'POST',
      headers:{ 'Authorization':'5b3ce3597851110001cf62481c8b0a4e9c6a4e5e9b1a2b3c','Content-Type':'application/json' },
      body:JSON.stringify(body)
    })
    if (!r.ok) throw new Error('ORS unavailable')
    const d = await r.json()
    return d.features[0].geometry.coordinates
  } catch {
    const coords = []
    for (let i=0;i<=40;i++) coords.push([
      from.lng+(to.lng-from.lng)*(i/40),
      from.lat+(to.lat-from.lat)*(i/40),
    ])
    return coords
  }
}

// ── Location Input with autocomplete ────────────────────────────────────────
function LocationInput({ label, placeholder, value, onChange, onSelect }) {
  const [suggestions, setSuggestions] = useState([])
  const [showDrop,    setShowDrop]    = useState(false)
  const [loading,     setLoading]     = useState(false)
  const debounce = useRef(null)
  const wrapRef  = useRef(null)

  useEffect(() => {
    const handler = e => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setShowDrop(false)
    }
    document.addEventListener('mousedown', handler)
    document.addEventListener('touchstart', handler, { passive: true })
    return () => {
      document.removeEventListener('mousedown', handler)
      document.removeEventListener('touchstart', handler)
    }
  }, [])

  const handleChange = e => {
    const v = e.target.value
    onChange(v)
    setShowDrop(true)
    clearTimeout(debounce.current)
    if (v.length < 3) { setSuggestions([]); setLoading(false); return }
    setLoading(true)
    debounce.current = setTimeout(async () => {
      const results = await searchPlaces(v)
      setSuggestions(results)
      setLoading(false)
      setShowDrop(true)
    }, 350)
  }

  const handleSelect = place => {
    const label = place.short || place.display.split(',').slice(0,2).join(',').trim()
    onChange(label)
    onSelect(place)
    setSuggestions([])
    setShowDrop(false)
  }

  const formatShort = place => place.short || place.display.split(',').slice(0,2).join(',').trim()
  const formatFull  = place => place.display.split(',').slice(0,4).join(',').trim()

  return (
    <div ref={wrapRef} style={{ position:'relative', marginBottom:14 }}>
      <label style={{ fontSize:12, color:'#5a6480', marginBottom:6, display:'block', fontWeight:600 }}>
        {label}
      </label>
      <div style={{ position:'relative' }}>
        <input
          style={{
            width:'100%', background:'#161923', border:'1px solid #1e2433',
            borderRadius:8, padding:'11px 40px 11px 14px', color:'#dde2ee',
            fontSize:14, outline:'none', boxSizing:'border-box',
            transition:'border-color .2s',
          }}
          onFocus={e => {
            e.target.style.borderColor = '#4f8ef7'
            if (suggestions.length > 0) setShowDrop(true)
          }}
          onBlur={e => { e.target.style.borderColor = '#1e2433' }}
          placeholder={placeholder}
          value={value}
          onChange={handleChange}
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
        />
        <div style={{
          position:'absolute', right:12, top:'50%', transform:'translateY(-50%)',
          fontSize:15, pointerEvents:'none', transition:'opacity .2s',
        }}>
          {loading
            ? <span style={{ color:'#4f8ef7', animation:'spin 1s linear infinite', display:'inline-block' }}>⟳</span>
            : <span style={{ color: value ? '#4f8ef7' : '#5a6480' }}>🔍</span>
          }
        </div>
      </div>

      {/* Dropdown suggestions */}
      {showDrop && suggestions.length > 0 && (
        <div style={{
          position:'absolute', top:'calc(100% + 4px)', left:0, right:0, zIndex:99999,
          background:'#161923', border:'1px solid #2a3555', borderRadius:10,
          overflow:'hidden', boxShadow:'0 12px 32px rgba(0,0,0,0.7)',
          maxHeight:260, overflowY:'auto',
        }}>
          {suggestions.map((s, i) => (
            <div
              key={i}
              onMouseDown={e => { e.preventDefault(); handleSelect(s) }}  // mousedown fires before blur
              style={{
                padding:'10px 14px', cursor:'pointer',
                borderBottom: i < suggestions.length-1 ? '1px solid #0f1117' : 'none',
                display:'flex', alignItems:'flex-start', gap:10,
              }}
              onMouseEnter={e => e.currentTarget.style.background='#1a2030'}
              onMouseLeave={e => e.currentTarget.style.background='transparent'}
            >
              <span style={{ fontSize:16, marginTop:1, flexShrink:0 }}>📍</span>
              <div style={{ minWidth:0 }}>
                <div style={{ fontSize:13, color:'#dde2ee', fontWeight:600, marginBottom:2,
                  whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>
                  {formatShort(s)}
                </div>
                <div style={{ fontSize:11, color:'#5a6480', overflow:'hidden',
                  textOverflow:'ellipsis', display:'-webkit-box',
                  WebkitLineClamp:2, WebkitBoxOrient:'vertical' }}>
                  {formatFull(s)}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* No results */}
      {showDrop && !loading && value.length >= 3 && suggestions.length === 0 && (
        <div style={{
          position:'absolute', top:'calc(100% + 4px)', left:0, right:0, zIndex:99999,
          background:'#161923', border:'1px solid #1e2433', borderRadius:10,
          padding:'14px', fontSize:13, color:'#5a6480',
          boxShadow:'0 8px 24px rgba(0,0,0,0.6)',
        }}>
          No locations found — try a different spelling or city name.
        </div>
      )}

      {/* Spinner keyframe */}
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )
}

// ── Main Component ───────────────────────────────────────────────────────────
export default function DriveMode({ onClose }) {
  const [tab,           setTab]         = useState('plan')
  const [fromText,      setFromText]    = useState('')
  const [toText,        setToText]      = useState('')
  const [fromPlace,     setFromPlace]   = useState(null)
  const [toPlace,       setToPlace]     = useState(null)
  const [loading,       setLoading]     = useState(false)
  const [error,         setError]       = useState('')
  const [routeResult,   setRouteResult] = useState(null)
  const [active,        setActive]      = useState(false)
  const [position,      setPosition]    = useState(null)
  const [activeAlert,   setActiveAlert] = useState(null)
  const [log,           setLog]         = useState([])
  const [voiceReady,    setVoiceReady]  = useState(false)
  const [showInstall,   setShowInstall] = useState(true)
  const [testingVoice,  setTestingVoice]= useState(false)
  // Load alert preferences from AlertSettings
  const [alertPrefs,    setAlertPrefs]  = useState(loadAlertPrefs)
  // Re-read prefs every time modal opens (in case user changed settings)
  useEffect(() => { setAlertPrefs(loadAlertPrefs()) }, [])

  const watchId    = useRef(null)
  const simTimer   = useRef(null)
  const alertedIds = useRef(new Set())
  const alertCounts = useRef({})   // tracks how many times each hazard has fired

  const addLog = msg =>
    setLog(prev => [`${new Date().toLocaleTimeString()} — ${msg}`, ...prev.slice(0,49)])

  // ── Voice unlock + test ────────────────────────────────────────────────────
  const unlockAndTestVoice = async () => {
    voice.unlock()
    setVoiceReady(true)
    setTestingVoice(true)
    addLog('🔊 Testing voice alerts...')
    try {
      const prefs   = loadAlertPrefs()
      const lang    = prefs.voiceLanguage || 'hi-IN'
      const localText = lang !== 'en-IN'
        ? (BIMSTEC_TRANSLATIONS[lang]?.(0, 'road damage') ?? null)
        : null
      // Use a fixed test phrase for English; pick matching local test phrase
      const localTestPhrases = {
        'hi-IN': 'एजिस रोड वॉयस अलर्ट अब सक्रिय हैं।',
        'bn-BD': 'এজিস রোড ভয়েস অ্যালার্ট এখন সক্রিয়।',
        'my-MM': 'AegisRoad voice alerts များ ဖွင့်ထားပြီ။',
        'ne-NP': 'एजिस रोड भ्वाइस अलर्ट अब सक्रिय छ।',
        'si-LK': 'AegisRoad හඬ ඇඟවීම් දැන් ක්‍රියාත්මකයි.',
        'ta-IN': 'AegisRoad குரல் எச்சரிக்கைகள் இப்போது செயலில் உள்ளன.',
        'th-TH': 'AegisRoad เปิดใช้งานการแจ้งเตือนด้วยเสียงแล้ว',
        'dz-BT': 'AegisRoad སྐད་ཀྱི་ཞིབ་འཚོལ་སྦྱོར་བ་ཡོད།',
      }
      const testLocal = lang !== 'en-IN' ? (localTestPhrases[lang] ?? null) : null
      await voice.speak('AegisRoad voice alerts are now active.', testLocal, lang)
      addLog(`✅ Voice working — EN + ${lang}`)
    } catch (e) {
      addLog('⚠️ Voice unavailable — beep alerts still active')
    } finally {
      setTestingVoice(false)
    }
  }

  // ── Hazard proximity check (reads alertPrefs) ──────────────────────────────
  const checkPos = useCallback((lat, lng) => {
    if (!routeResult) return
    const prefs = loadAlertPrefs()   // always fresh from localStorage
    const maxFires = prefs.reminderFrequency === 'three' ? 3 : prefs.reminderFrequency === 'twice' ? 2 : 1

    for (const h of routeResult.hazards) {
      const fires = alertCounts.current[h.id] || 0
      if (fires >= maxFires) continue

      const d = distM(lat, lng, h.lat, h.lng)
      if (d <= prefs.alertDistance) {
        alertCounts.current[h.id] = fires + 1

        // ── Visual alert ──────────────────────────────────────────────────────
        if (prefs.visualAlerts && prefs.popupNotification) {
          setActiveAlert(h)
        }

        // ── Screen flash for critical hazards ─────────────────────────────────
        if (prefs.visualAlerts && prefs.screenFlash && h.severity === 'critical') {
          document.body.style.transition = 'background 0.1s'
          document.body.style.background = 'rgba(239,68,68,0.18)'
          setTimeout(() => { document.body.style.background = '' }, 400)
        }

        addLog(`🚨 ${h.cls} — ${h.road} (${Math.round(d)}m ahead)`)

        // ── Voice alert ───────────────────────────────────────────────────────
        if (prefs.voiceAlerts) {
          const dist    = Math.round(d)
          const label   = clsLabel(h.cls)
          const lang    = prefs.voiceLanguage || 'hi-IN'

          // English text (always first)
          let engText
          if (prefs.voiceMessage === 'slow-down') {
            engText = `Caution! Unrepaired ${label} on this route, ${dist} metres ahead on ${h.road}.`
          } else if (prefs.voiceMessage === 'custom' && prefs.customVoiceText) {
            engText = prefs.customVoiceText
          } else {
            engText = `Road damage ahead. ${h.cls === 'D40' ? 'Critical pothole' : h.cls === 'D20' ? 'Road crack' : h.cls === 'D10' ? 'Waterlogging' : 'Road damage'} detected ${dist} metres ahead on ${h.road}. Reduce speed and stay alert.`
          }

          // Local language text (null when user chose English-only)
          const localText = lang !== 'en-IN'
            ? (BIMSTEC_TRANSLATIONS[lang]?.(dist, label) ?? null)
            : null

          voice.speak(engText, localText, lang)
        }

        // ── Vibration alert ───────────────────────────────────────────────────
        if (prefs.vibrationAlerts && 'vibrate' in navigator) {
          navigator.vibrate(h.severity === 'critical' ? [300, 100, 300, 100, 300] : [200, 100, 200])
        }
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [routeResult])

  // ── Route planning ─────────────────────────────────────────────────────────
  const planRoute = async () => {
    if (!fromPlace || !toPlace) {
      setError('Please select both locations from the dropdown suggestions')
      return
    }
    setLoading(true); setError(''); setRouteResult(null)
    try {
      addLog(`🔍 Planning: ${fromText} → ${toText}`)
      const coords  = await getRoute(fromPlace, toPlace)
      const hazards = getRouteHazards(coords)
      const distKm  = Math.round(distM(fromPlace.lat,fromPlace.lng,toPlace.lat,toPlace.lng)/100)/10
      const durMin  = Math.round(distKm * 2.5)
      setRouteResult({ from:fromPlace, to:toPlace, coords, hazards, distKm, durMin })
      setTab('drive')
      addLog(hazards.length===0 ? '✅ Route clear — no hazards!' : `⚠️ ${hazards.length} hazard(s) found`)
      hazards.forEach(h => addLog(`   ↳ ${h.cls} (${h.severity}) at ${h.road}`))
    } catch(e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  // ── Simulation ─────────────────────────────────────────────────────────────
  const startSim = () => {
    if (!routeResult || !voiceReady) {
      addLog('⚠️ Enable voice first — tap the 🔊 button above')
      return
    }
    alertedIds.current.clear(); alertCounts.current = {}; setActive(true); setActiveAlert(null)
    addLog('🎮 Simulating drive on planned route...')
    const total = routeResult.coords.length
    const step  = Math.max(1, Math.floor(total / 20))
    let idx = 0
    const tick = () => {
      if (idx >= total) { addLog('✅ Arrived at destination!'); setActive(false); return }
      const [lng,lat] = routeResult.coords[idx]
      setPosition({lat,lng}); checkPos(lat,lng)
      idx += step
      simTimer.current = setTimeout(tick, 1800)
    }
    tick()
  }

  // ── Real GPS ───────────────────────────────────────────────────────────────
  const startReal = () => {
    if (!navigator.geolocation) { setError('Geolocation not supported on this device'); return }
    if (!voiceReady) {
      addLog('⚠️ Enable voice first — tap the 🔊 button above')
      return
    }
    alertedIds.current.clear(); alertCounts.current = {}; setActive(true); setActiveAlert(null)
    addLog('📍 Real GPS drive started — move your device...')
    watchId.current = navigator.geolocation.watchPosition(
      pos => {
        const { latitude:lat, longitude:lng } = pos.coords
        setPosition({lat,lng}); checkPos(lat,lng)
        addLog(`📍 ${lat.toFixed(5)}, ${lng.toFixed(5)}`)
      },
      err => {
        const msg = {
          1: 'Location permission denied — please allow in browser settings',
          2: 'Location unavailable — check GPS signal',
          3: 'Location request timed out',
        }[err.code] || err.message
        addLog(`❌ GPS: ${msg}`)
        setError(msg)
      },
      { enableHighAccuracy:true, maximumAge:3000, timeout:15000 }
    )
  }

  const stop = () => {
    if (watchId.current)  navigator.geolocation.clearWatch(watchId.current)
    if (simTimer.current) clearTimeout(simTimer.current)
    window.speechSynthesis?.cancel()
    setActive(false); setPosition(null)
    addLog('⏹ Drive stopped')
  }

  useEffect(() => () => {
    if (watchId.current)  navigator.geolocation.clearWatch(watchId.current)
    if (simTimer.current) clearTimeout(simTimer.current)
    window.speechSynthesis?.cancel()
  }, [])

  const s = {
    tab: act => ({
      padding:'8px 18px', borderRadius:8, border:'none', fontSize:13,
      fontWeight:600, cursor:'pointer',
      background: act ? '#4f8ef7' : '#161923',
      color: act ? '#fff' : '#5a6480',
      transition:'all .2s',
    }),
    btn: (bg, dis) => ({
      padding:'12px 18px', borderRadius:10, border:'none', fontSize:14,
      fontWeight:600, cursor: dis?'not-allowed':'pointer',
      background: dis?'#1e2433':bg, color:'#fff', opacity:dis?0.5:1,
      transition:'opacity .2s',
    }),
    hazardCard: sev => ({
      background:`${SEV_COLOR[sev]}18`, border:`1px solid ${SEV_COLOR[sev]}40`,
      borderLeft:`3px solid ${SEV_COLOR[sev]}`, borderRadius:8,
      padding:'10px 14px', marginBottom:8,
    }),
  }

  return (
    <div
      style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.88)', zIndex:9999,
        display:'flex', alignItems:'center', justifyContent:'center', padding:16 }}
      onClick={e => e.target===e.currentTarget && onClose()}
    >
      <div style={{
        background:'#0f1117', border:'1px solid #1e2433', borderRadius:16,
        width:'100%', maxWidth:540, maxHeight:'94vh', overflowY:'auto',
        padding:24, color:'#dde2ee', fontFamily:'system-ui,sans-serif',
      }}>

        {/* ── Header ── */}
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
          <div>
            <h2 style={{ margin:0, fontSize:20, fontWeight:700 }}>🚗 Drive Mode</h2>
            <p style={{ margin:'3px 0 0', fontSize:12, color:'#5a6480' }}>
              Route planning · Hazard detection · Live alerts
            </p>
          </div>
          <button onClick={onClose}
            style={{ background:'none', border:'none', color:'#5a6480', fontSize:22, cursor:'pointer' }}>
            ✕
          </button>
        </div>

        {/* ── PWA Install Banner ── */}
        {showInstall && <InstallBanner onDismiss={() => setShowInstall(false)} />}

        {/* ── Voice Unlock Banner (shown before voice enabled) ── */}
        {!voiceReady && (
          <div style={{
            background:'rgba(124,58,237,0.12)', border:'1px solid rgba(124,58,237,0.4)',
            borderRadius:10, padding:'12px 14px', marginBottom:16,
            display:'flex', alignItems:'center', justifyContent:'space-between', gap:12,
          }}>
            <div>
              <div style={{ fontSize:13, fontWeight:700, color:'#c084fc', marginBottom:2 }}>
                🔇 Voice alerts are disabled
              </div>
              <div style={{ fontSize:11, color:'#6b5b95' }}>
                Tap the button to enable voice + audio alerts
              </div>
            </div>
            <button
              onClick={unlockAndTestVoice}
              disabled={testingVoice}
              style={{
                background:'linear-gradient(135deg,#7c3aed,#4f8ef7)',
                border:'none', borderRadius:8, padding:'9px 16px',
                color:'#fff', fontSize:13, fontWeight:700, cursor:'pointer',
                flexShrink:0, opacity: testingVoice ? 0.7 : 1,
              }}
            >
              {testingVoice ? '⟳ Testing...' : '🔊 Enable Voice'}
            </button>
          </div>
        )}

        {/* ── Voice Active Indicator ── */}
        {voiceReady && (
          <div style={{
            background:'rgba(16,185,129,0.1)', border:'1px solid rgba(16,185,129,0.3)',
            borderRadius:8, padding:'8px 14px', marginBottom:14,
            display:'flex', alignItems:'center', justifyContent:'space-between', fontSize:12,
          }}>
            <span style={{ color:'#10b981' }}>
              🔊 Voice active — EN
              {alertPrefs.voiceLanguage && alertPrefs.voiceLanguage !== 'en-IN'
                ? ` + ${alertPrefs.voiceLanguage.split('-')[0].toUpperCase()}`
                : ' only'}
            </span>
            <button
              onClick={unlockAndTestVoice}
              style={{ background:'none', border:'1px solid rgba(16,185,129,0.4)',
                borderRadius:6, padding:'4px 10px', color:'#10b981', fontSize:11, cursor:'pointer' }}
            >
              Test
            </button>
          </div>
        )}

        {/* ── Active Alert Settings Summary ── */}
        <div style={{
          background:'#0d1117', border:'1px solid #1e2433', borderRadius:8,
          padding:'9px 14px', marginBottom:16, fontSize:11, color:'#5a6480',
          display:'flex', flexWrap:'wrap', gap:'6px 16px',
        }}>
          <span>📏 Distance: <strong style={{color:'#dde2ee'}}>{alertPrefs.alertDistance}m</strong></span>
          <span>🔁 Repeat: <strong style={{color:'#dde2ee'}}>
            {alertPrefs.reminderFrequency === 'three' ? '3×' : alertPrefs.reminderFrequency === 'twice' ? '2×' : '1×'}
          </strong></span>
          <span>🔊 Voice: <strong style={{color: alertPrefs.voiceAlerts ? '#10b981' : '#ef4444'}}>
            {alertPrefs.voiceAlerts
              ? `EN${alertPrefs.voiceLanguage && alertPrefs.voiceLanguage !== 'en-IN' ? ` + ${alertPrefs.voiceLanguage.split('-')[0].toUpperCase()}` : ''}`
              : 'off'}
          </strong></span>
          <span>📳 Vibrate: <strong style={{color: alertPrefs.vibrationAlerts ? '#10b981' : '#ef4444'}}>
            {alertPrefs.vibrationAlerts ? 'on' : 'off'}
          </strong></span>
        </div>

        {/* ── Tabs ── */}
        <div style={{ display:'flex', gap:8, marginBottom:20 }}>
          <button style={s.tab(tab==='plan')}  onClick={() => setTab('plan')}>📍 Plan Route</button>
          <button style={s.tab(tab==='drive')} onClick={() => routeResult && setTab('drive')} disabled={!routeResult}>
            🛣️ Route Info
          </button>
          <button style={s.tab(tab==='live')}  onClick={() => routeResult && setTab('live')} disabled={!routeResult}>
            🎯 Live Drive
          </button>
        </div>

        {/* ── PLAN TAB ── */}
        {tab==='plan' && (
          <div>
            <LocationInput
              label="📍 Starting point"
              placeholder="Type a city, area or landmark..."
              value={fromText}
              onChange={setFromText}
              onSelect={p => {
                setFromPlace(p)
                setFromText(p.short || p.display.split(',').slice(0,2).join(',').trim())
              }}
            />
            <LocationInput
              label="🏁 Destination"
              placeholder="Type a city, area or landmark..."
              value={toText}
              onChange={setToText}
              onSelect={p => {
                setToPlace(p)
                setToText(p.short || p.display.split(',').slice(0,2).join(',').trim())
              }}
            />

            {/* Selection confirmation */}
            {(fromPlace || toPlace) && (
              <div style={{ background:'#161923', borderRadius:8, padding:'10px 14px', marginBottom:14, fontSize:12 }}>
                {fromPlace
                  ? <div style={{ color:'#10b981', marginBottom:4 }}>✅ From: {fromText}</div>
                  : <div style={{ color:'#f59e0b' }}>⚠️ Select start from dropdown</div>
                }
                {toPlace
                  ? <div style={{ color:'#10b981' }}>✅ To: {toText}</div>
                  : <div style={{ color:'#f59e0b' }}>⚠️ Select destination from dropdown</div>
                }
              </div>
            )}

            {error && (
              <div style={{ background:'rgba(239,68,68,.1)', border:'1px solid #ef4444',
                borderRadius:8, padding:'10px 14px', marginBottom:14, fontSize:13, color:'#ef4444' }}>
                ❌ {error}
              </div>
            )}

            <button
              onClick={planRoute}
              disabled={loading || !fromPlace || !toPlace}
              style={{ ...s.btn('#4f8ef7', loading || !fromPlace || !toPlace), width:'100%' }}
            >
              {loading ? '🔍 Searching route & hazards...' : '🔍 Find Route & Check Hazards'}
            </button>

            <div style={{ marginTop:10, fontSize:11, color:'#5a6480', lineHeight:1.7 }}>
              💡 Type at least 3 letters to see location suggestions from OpenStreetMap
            </div>

            {log.length > 0 && (
              <div style={{ marginTop:14 }}>
                <div style={{ fontSize:11, color:'#5a6480', marginBottom:6 }}>LOG</div>
                <div style={{ background:'#070809', borderRadius:8, padding:10,
                  maxHeight:100, overflowY:'auto', fontFamily:'monospace', fontSize:11 }}>
                  {log.map((l,i) => <div key={i} style={{ color:'#5a6480', marginBottom:3 }}>{l}</div>)}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── ROUTE INFO TAB ── */}
        {tab==='drive' && routeResult && (
          <div>
            <div style={{ background:'#161923', borderRadius:10, padding:14, marginBottom:16 }}>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:10, textAlign:'center' }}>
                <div>
                  <div style={{ fontSize:22, fontWeight:700, color:'#4f8ef7' }}>{routeResult.distKm}</div>
                  <div style={{ fontSize:11, color:'#5a6480' }}>km</div>
                </div>
                <div>
                  <div style={{ fontSize:22, fontWeight:700, color:'#10b981' }}>{routeResult.durMin}</div>
                  <div style={{ fontSize:11, color:'#5a6480' }}>min est.</div>
                </div>
                <div>
                  <div style={{ fontSize:22, fontWeight:700,
                    color: routeResult.hazards.length > 0 ? '#ef4444' : '#10b981' }}>
                    {routeResult.hazards.length}
                  </div>
                  <div style={{ fontSize:11, color:'#5a6480' }}>hazards</div>
                </div>
              </div>
            </div>

            <div style={{ background:'#161923', borderRadius:8, padding:'10px 14px', marginBottom:14, fontSize:13 }}>
              <span style={{ color:'#10b981' }}>📍</span> {fromText}
              <span style={{ color:'#5a6480', margin:'0 8px' }}>→</span>
              <span style={{ color:'#ef4444' }}>🏁</span> {toText}
            </div>

            <div style={{ fontSize:12, color:'#5a6480', marginBottom:8 }}>HAZARDS ON ROUTE</div>
            {routeResult.hazards.length === 0 ? (
              <div style={{ background:'rgba(16,185,129,.1)', border:'1px solid rgba(16,185,129,.3)',
                borderRadius:8, padding:'12px 14px', fontSize:13, color:'#10b981', marginBottom:16 }}>
                ✅ No hazards detected on this route!
              </div>
            ) : (
              <div style={{ marginBottom:16 }}>
                {routeResult.hazards.map(h => (
                  <div key={h.id} style={s.hazardCard(h.severity)}>
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                      <div>
                        <span style={{ fontWeight:700, color:SEV_COLOR[h.severity] }}>{h.cls}</span>
                        <span style={{ fontSize:12, color:'#5a6480', marginLeft:8 }}>{h.road}</span>
                      </div>
                      <span style={{ background:SEV_COLOR[h.severity]+'30', color:SEV_COLOR[h.severity],
                        fontSize:10, padding:'2px 8px', borderRadius:100, fontWeight:600, textTransform:'uppercase' }}>
                        {h.severity}
                      </span>
                    </div>
                    <div style={{ fontSize:11, color:'#5a6480', marginTop:4 }}>
                      Contractor: {h.contractor}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div style={{ display:'flex', gap:10 }}>
              <button onClick={() => setTab('plan')} style={{ ...s.btn('#1e2433', false), flex:1 }}>
                ← Change Route
              </button>
              <button
                onClick={() => {
                  if (!voiceReady) unlockAndTestVoice().then(() => setTab('live'))
                  else setTab('live')
                }}
                style={{ ...s.btn('#7c3aed', false), flex:2 }}
              >
                🚗 Start Drive →
              </button>
            </div>
          </div>
        )}

        {/* ── LIVE DRIVE TAB ── */}
        {tab==='live' && routeResult && (
          <div>
            {!active ? (
              <div>
                {!voiceReady && (
                  <div style={{ background:'rgba(245,158,11,0.1)', border:'1px solid rgba(245,158,11,0.3)',
                    borderRadius:8, padding:'10px 14px', marginBottom:14, fontSize:12, color:'#f59e0b' }}>
                    ⚠️ Enable voice alerts above before starting the drive
                  </div>
                )}
                <div style={{ display:'flex', gap:10, marginBottom:16 }}>
                  <button onClick={startSim} style={{ ...s.btn('#7c3aed', !voiceReady), flex:1 }}>
                    🎮 Simulate Route
                  </button>
                  <button onClick={startReal} style={{ ...s.btn('#4f8ef7', !voiceReady), flex:1 }}>
                    📍 Real GPS
                  </button>
                </div>
              </div>
            ) : (
              <button onClick={stop} style={{ ...s.btn('#ef4444', false), width:'100%', marginBottom:16 }}>
                ⏹ Stop Drive
              </button>
            )}

            {/* Active hazard alert */}
            {activeAlert && (
              <div style={{
                background:'rgba(239,68,68,.15)', border:'2px solid #ef4444',
                borderRadius:12, padding:16, marginBottom:14,
                animation:'pulse 1s ease-in-out infinite',
              }}>
                <div style={{ fontSize:18, fontWeight:700, color:'#ef4444', marginBottom:6 }}>
                  🚨 HAZARD AHEAD
                </div>
                <div style={{ fontSize:14, marginBottom:2 }}>
                  <strong>{activeAlert.cls}</strong> — {activeAlert.road}
                </div>
                <div style={{ fontSize:12, color:'#5a6480', marginBottom:10 }}>
                  Severity: {activeAlert.severity} · {activeAlert.contractor}
                </div>
                <button
                  onClick={() => setActiveAlert(null)}
                  style={{ background:'#ef4444', color:'#fff', border:'none',
                    borderRadius:8, padding:'8px 16px', fontSize:13, fontWeight:600, cursor:'pointer' }}
                >
                  Dismiss
                </button>
              </div>
            )}

            {/* GPS position */}
            {position && (
              <div style={{ background:'#161923', borderRadius:8, padding:'8px 14px',
                marginBottom:12, fontSize:11, color:'#5a6480', fontFamily:'monospace' }}>
                📍 {position.lat.toFixed(5)}, {position.lng.toFixed(5)}
              </div>
            )}

            {/* Hazards list */}
            <div style={{ background:'#161923', borderRadius:8, padding:'10px 14px', marginBottom:14 }}>
              <div style={{ fontSize:11, color:'#5a6480', marginBottom:6 }}>HAZARDS ON ROUTE</div>
              {routeResult.hazards.length === 0
                ? <span style={{ fontSize:12, color:'#10b981' }}>✅ Clear route</span>
                : routeResult.hazards.map(h => (
                    <div key={h.id} style={{ display:'flex', alignItems:'center', gap:8, marginBottom:4, fontSize:12 }}>
                      <span style={{ color:SEV_COLOR[h.severity], fontSize:8 }}>●</span>
                      <span style={{ fontWeight:600 }}>{h.cls}</span>
                      <span style={{ color:'#5a6480' }}>{h.road}</span>
                    </div>
                  ))
              }
            </div>

            {/* Activity log */}
            <div style={{ fontSize:11, color:'#5a6480', marginBottom:6 }}>ACTIVITY LOG</div>
            <div style={{
              background:'#070809', borderRadius:8, padding:10,
              height:160, overflowY:'auto', fontFamily:'monospace', fontSize:11,
            }}>
              {log.length === 0
                ? <span style={{ color:'#5a6480' }}>Waiting to start...</span>
                : log.map((l,i) => (
                    <div key={i} style={{
                      color: l.includes('🚨') || l.includes('HAZARD') ? '#ef4444' : '#5a6480',
                      marginBottom:3,
                    }}>
                      {l}
                    </div>
                  ))
              }
            </div>
          </div>
        )}

        {/* Pulse animation */}
        <style>{`
          @keyframes pulse {
            0%,100% { box-shadow: 0 0 0 0 rgba(239,68,68,0.4); }
            50%      { box-shadow: 0 0 0 8px rgba(239,68,68,0); }
          }
        `}</style>
      </div>
    </div>
  )
}