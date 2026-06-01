import { useState, useEffect, useRef, useCallback } from 'react'

const ALERT_RADIUS_M = 500

const SIMULATED_ROUTE = [
  { lat: 16.5000, lng: 80.5200, label: 'Start — Vijayawada NH-16' },
  { lat: 16.5100, lng: 80.5180, label: 'Moving north on NH-16...' },
  { lat: 16.5300, lng: 80.5160, label: 'Approaching Mangalagiri...' },
  { lat: 16.5417, lng: 80.5152, label: '⚠️ HAZARD ZONE — Critical pothole cluster' },
  { lat: 16.5600, lng: 80.5100, label: 'Past hazard zone — resuming normal speed' },
]

const HAZARDS = [
  { id: 1, lat: 16.5417, lng: 80.5152, cls: 'D40', severity: 'critical',
    road: 'NH-16, Vijayawada', contractor: 'Ramesh Road Works' },
  { id: 2, lat: 16.3067, lng: 80.4365, cls: 'D20', severity: 'high',
    road: 'SH-47, Guntur', contractor: 'AP Infrastructure Ltd' },
]

// ── Haversine distance (metres) ──────────────────────────────────────────────
function distanceMetres(lat1, lng1, lat2, lng2) {
  const R = 6371000
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLng = (lng2 - lng1) * Math.PI / 180
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

// ── Voice alert ──────────────────────────────────────────────────────────────
let audioUnlocked = false

function unlockAudio() {
  if (audioUnlocked) return
  try {
    const u = new SpeechSynthesisUtterance('')
    u.volume = 0
    window.speechSynthesis.speak(u)
    audioUnlocked = true
  } catch (e) { /* ignore */ }
}

function speakAlert(engText, hinText) {
  if (!('speechSynthesis' in window)) return

  window.speechSynthesis.cancel()

  const speakOne = (text, lang) => new Promise(resolve => {
    const u = new SpeechSynthesisUtterance(text)
    u.lang    = lang
    u.rate    = 0.85
    u.volume  = 1
    u.pitch   = 1

    // Watchdog — Chrome sometimes never fires onend
    const timer = setTimeout(resolve, 6000)
    u.onend  = () => { clearTimeout(timer); resolve() }
    u.onerror = () => { clearTimeout(timer); resolve() }

    window.speechSynthesis.speak(u)
  })

  // Small delay gives Chrome time to cancel previous utterance
  setTimeout(async () => {
    await speakOne(engText, 'en-IN')
    await new Promise(r => setTimeout(r, 400))
    await speakOne(hinText, 'hi-IN')
  }, 150)
}

// ── Component ────────────────────────────────────────────────────────────────
export default function DriveMode({ onClose }) {
  const [active,    setActive]    = useState(false)
  const [simMode,   setSimMode]   = useState(false)
  const [position,  setPosition]  = useState(null)
  const [log,       setLog]       = useState([])
  const [alert,     setAlert]     = useState(null)   // hazard that triggered alert
  const [voiceReady, setVoiceReady] = useState(false)

  const watchId   = useRef(null)
  const simIndex  = useRef(0)
  const simTimer  = useRef(null)
  const alertedIds = useRef(new Set())

  const addLog = (msg) =>
    setLog(prev => [`${new Date().toLocaleTimeString()} — ${msg}`, ...prev.slice(0, 19)])

  // ── Check position against hazards ────────────────────────────────────────
  const checkHazards = useCallback((lat, lng) => {
    for (const h of HAZARDS) {
      if (alertedIds.current.has(h.id)) continue
      const d = distanceMetres(lat, lng, h.lat, h.lng)
      if (d <= ALERT_RADIUS_M) {
        alertedIds.current.add(h.id)
        setAlert(h)
        addLog(`🚨 HAZARD DETECTED — ${h.cls} on ${h.road} (${Math.round(d)}m ahead)`)

        const eng = `Warning! ${h.cls === 'D40' ? 'Critical pothole' : 'Road damage'} detected ${Math.round(d)} metres ahead on ${h.road}. Please slow down.`
        const hin = `चेतावनी! आगे ${Math.round(d)} मीटर पर सड़क में गड्ढा है। कृपया गति धीमी करें।`
        speakAlert(eng, hin)
      }
    }
  }, [])

  // ── Real GPS ───────────────────────────────────────────────────────────────
  const startReal = () => {
    unlockAudio()
    setVoiceReady(true)
    if (!navigator.geolocation) {
      addLog('❌ Geolocation not supported by this browser')
      return
    }
    setActive(true)
    setSimMode(false)
    alertedIds.current.clear()
    addLog('📍 Real GPS drive started')

    watchId.current = navigator.geolocation.watchPosition(
      pos => {
        const { latitude: lat, longitude: lng } = pos.coords
        setPosition({ lat, lng })
        addLog(`📍 Position updated: ${lat.toFixed(4)}, ${lng.toFixed(4)}`)
        checkHazards(lat, lng)
      },
      err => addLog(`❌ GPS error: ${err.message}`),
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 10000 }
    )
  }

  // ── Simulate route ─────────────────────────────────────────────────────────
  const startSim = () => {
    unlockAudio()
    setVoiceReady(true)
    setActive(true)
    setSimMode(true)
    alertedIds.current.clear()
    simIndex.current = 0
    addLog('🎮 Simulation started — NH-16 Vijayawada route')

    const tick = () => {
      const idx = simIndex.current
      if (idx >= SIMULATED_ROUTE.length) {
        addLog('✅ Simulation complete')
        setActive(false)
        return
      }
      const wp = SIMULATED_ROUTE[idx]
      setPosition({ lat: wp.lat, lng: wp.lng })
      addLog(wp.label)
      checkHazards(wp.lat, wp.lng)
      simIndex.current += 1
      simTimer.current = setTimeout(tick, 3000)
    }
    tick()
  }

  // ── Stop ───────────────────────────────────────────────────────────────────
  const stop = () => {
    if (watchId.current)  navigator.geolocation.clearWatch(watchId.current)
    if (simTimer.current) clearTimeout(simTimer.current)
    window.speechSynthesis.cancel()
    setActive(false)
    setSimMode(false)
    setPosition(null)
    addLog('⏹ Drive Mode stopped')
  }

  useEffect(() => () => {
    if (watchId.current)  navigator.geolocation.clearWatch(watchId.current)
    if (simTimer.current) clearTimeout(simTimer.current)
    window.speechSynthesis.cancel()
  }, [])

  // ── Styles ─────────────────────────────────────────────────────────────────
  const overlay = {
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)',
    zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: 16,
  }
  const modal = {
    background: '#0f1117', border: '1px solid #1e2433', borderRadius: 16,
    width: '100%', maxWidth: 520, maxHeight: '90vh', overflowY: 'auto', padding: 24,
    color: '#dde2ee', fontFamily: 'system-ui, sans-serif',
  }
  const btnBase = {
    flex: 1, padding: '13px 16px', borderRadius: 10, border: 'none',
    fontSize: 14, fontWeight: 600, cursor: 'pointer',
  }

  return (
    <div style={overlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={modal}>

        {/* Header */}
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
          <div>
            <h2 style={{ margin:0, fontSize:20, fontWeight:700 }}>🚗 Drive Mode</h2>
            <p style={{ margin:'4px 0 0', fontSize:12, color:'#5a6480' }}>
              Real-time hazard alerts · 500m radius
            </p>
          </div>
          <button onClick={onClose}
            style={{ background:'none', border:'none', color:'#5a6480', fontSize:22, cursor:'pointer' }}>
            ✕
          </button>
        </div>

        {/* Voice status */}
        <div style={{
          background: voiceReady ? 'rgba(16,185,129,0.1)' : 'rgba(245,158,11,0.1)',
          border: `1px solid ${voiceReady ? 'rgba(16,185,129,0.3)' : 'rgba(245,158,11,0.3)'}`,
          borderRadius: 8, padding: '8px 14px', marginBottom: 16,
          fontSize: 12, color: voiceReady ? '#10b981' : '#f59e0b',
          display: 'flex', alignItems: 'center', gap: 8,
        }}>
          <span>{voiceReady ? '🔊' : '🔇'}</span>
          {voiceReady
            ? 'Voice alerts enabled — bilingual EN + हिं'
            : 'Press a button below to enable voice alerts'}
        </div>

        {/* Controls */}
        {!active ? (
          <div style={{ display:'flex', gap:10, marginBottom:20 }}>
            <button onClick={startReal} style={{ ...btnBase, background:'#4f8ef7', color:'#fff' }}>
              📍 Real GPS Drive
            </button>
            <button onClick={startSim} style={{ ...btnBase, background:'#7c3aed', color:'#fff' }}>
              🎮 Simulate Route
            </button>
          </div>
        ) : (
          <button onClick={stop} style={{
            ...btnBase, flex:'none', width:'100%', marginBottom:20,
            background:'#ef4444', color:'#fff',
          }}>
            ⏹ Stop Drive Mode
          </button>
        )}

        {/* Position */}
        {position && (
          <div style={{
            background:'#161923', borderRadius:8, padding:'10px 14px',
            marginBottom:16, fontSize:12, color:'#5a6480',
          }}>
            📍 {position.lat.toFixed(5)}, {position.lng.toFixed(5)}
          </div>
        )}

        {/* Hazard alert overlay */}
        {alert && (
          <div style={{
            background:'rgba(239,68,68,0.15)', border:'2px solid #ef4444',
            borderRadius:12, padding:16, marginBottom:16,
          }}>
            <div style={{ fontSize:18, fontWeight:700, color:'#ef4444', marginBottom:6 }}>
              🚨 HAZARD AHEAD
            </div>
            <div style={{ fontSize:14, marginBottom:4 }}>
              <strong>{alert.cls}</strong> — {alert.road}
            </div>
            <div style={{ fontSize:12, color:'#5a6480', marginBottom:10 }}>
              Contractor: {alert.contractor}
            </div>
            <button onClick={() => setAlert(null)} style={{
              background:'#ef4444', color:'#fff', border:'none',
              borderRadius:8, padding:'8px 16px', fontSize:13,
              fontWeight:600, cursor:'pointer',
            }}>
              Dismiss Alert
            </button>
          </div>
        )}

        {/* Activity log */}
        <div>
          <div style={{ fontSize:11, color:'#5a6480', marginBottom:8, letterSpacing:1 }}>
            ACTIVITY LOG
          </div>
          <div style={{
            background:'#070809', borderRadius:8, padding:12,
            height:180, overflowY:'auto', fontFamily:'monospace', fontSize:11,
          }}>
            {log.length === 0
              ? <span style={{ color:'#5a6480' }}>Waiting to start...</span>
              : log.map((l, i) => (
                  <div key={i} style={{ color: l.includes('HAZARD') ? '#ef4444' : '#5a6480', marginBottom:4 }}>
                    {l}
                  </div>
                ))
            }
          </div>
        </div>

      </div>
    </div>
  )
}
