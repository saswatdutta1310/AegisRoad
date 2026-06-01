import { useState, useEffect, useRef, useCallback } from 'react'

const ALERT_RADIUS_M = 500

const SIMULATED_ROUTE = [
  { lat: 16.5000, lng: 80.5200, label: 'Start — Vijayawada NH-16' },
  { lat: 16.5100, lng: 80.5180, label: 'Moving north on NH-16...' },
  { lat: 16.5300, lng: 80.5160, label: 'Approaching hazard zone...' },
  { lat: 16.5417, lng: 80.5152, label: 'Near reported pothole zone ⚠️' },
  { lat: 16.5550, lng: 80.5130, label: 'Past hazard — road clear ✅' },
]

const CLASS_INFO = {
  D00: { label: 'Longitudinal Crack', severity: 'Low',      color: '#fbbf24', emoji: '〰️' },
  D10: { label: 'Transverse Crack',   severity: 'Medium',   color: '#f97316', emoji: '⚡' },
  D20: { label: 'Alligator Cracking', severity: 'High',     color: '#ef4444', emoji: '🕸️' },
  D40: { label: 'Pothole',            severity: 'Critical', color: '#dc2626', emoji: '🕳️' },
}

const DEMO_HAZARDS = [
  { id: '1', lat: 16.5417, lng: 80.5152, cls: 'D40', road_name: 'NH-16, Vijayawada', sla_hours: 24 },
  { id: '2', lat: 16.3067, lng: 80.4365, cls: 'D20', road_name: 'SH-47, Guntur',     sla_hours: 48 },
  { id: '3', lat: 16.4307, lng: 80.6241, cls: 'D10', road_name: 'NH-65, Mangalagiri',sla_hours: 72 },
]

function getDistanceMetres(lat1, lng1, lat2, lng2) {
  const R  = 6371000
  const d1 = (lat2 - lat1) * Math.PI / 180
  const d2 = (lng2 - lng1) * Math.PI / 180
  const a  = Math.sin(d1/2)**2 +
    Math.cos(lat1*Math.PI/180) * Math.cos(lat2*Math.PI/180) * Math.sin(d2/2)**2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

// Unlock Chrome's autoplay policy with a silent utterance on user gesture
function unlockAudio() {
  if (!('speechSynthesis' in window)) return
  const u = new SpeechSynthesisUtterance('')
  u.volume = 0
  u.rate = 1
  window.speechSynthesis.speak(u)
}

function speakAlert(eng, hin) {
  if (!('speechSynthesis' in window)) {
    console.warn('Speech synthesis not supported')
    return
  }

  // Cancel any ongoing speech first
  window.speechSynthesis.cancel()

  // Small delay to let cancel() take effect
  setTimeout(() => {
    const speakOne = (text, lang) => new Promise(resolve => {
      const u = new SpeechSynthesisUtterance(text)
      u.lang = lang
      u.rate = 0.85
      u.volume = 1
      u.pitch = 1

      u.onend = () => resolve()
      u.onerror = (e) => {
        console.warn('Speech error:', e)
        resolve() // don't hang
      }

      // Chrome bug: speechSynthesis can get stuck — this forces it
      window.speechSynthesis.speak(u)

      // Watchdog: if onend never fires within 8s, move on
      setTimeout(resolve, 8000)
    })

    speakOne(eng, 'en-IN')
      .then(() => new Promise(r => setTimeout(r, 500)))
      .then(() => speakOne(hin, 'hi-IN'))
      .catch(err => console.warn('speakAlert error:', err))
  }, 150)
}

function vibrateAlert(severity) {
  if (!navigator.vibrate) return
  const patterns = {
    Critical: [300, 100, 300, 100, 300],
    High:     [200, 100, 200],
    Medium:   [150, 100, 150],
    Low:      [100],
  }
  navigator.vibrate(patterns[severity] || [200])
}

export default function DriveMode({ hazards: propHazards = [], onClose }) {
  const [active, setActive]     = useState(false)
  const [simMode, setSimMode]   = useState(false)
  const [position, setPosition] = useState(null)
  const [hazards, setHazards]   = useState([])
  const [nearby, setNearby]     = useState([])
  const [alert, setAlert]       = useState(null)
  const [status, setStatus]     = useState('idle')
  const [log, setLog]           = useState([])
  const [simIndex, setSimIndex] = useState(0)
  const [audioReady, setAudioReady] = useState(false)

  const watchRef   = useRef(null)
  const simRef     = useRef(null)
  const alertedRef = useRef(new Set())

  useEffect(() => {
    if (propHazards && propHazards.length > 0) {
      setHazards(propHazards)
    } else {
      setHazards(DEMO_HAZARDS)
    }
    if ('Notification' in window) Notification.requestPermission()
    return () => stopDrive()
  }, [propHazards])

  // Chrome fix: resume AudioContext if suspended
  useEffect(() => {
    const resumeAudio = () => {
      if (window.speechSynthesis && window.speechSynthesis.paused) {
        window.speechSynthesis.resume()
      }
    }
    document.addEventListener('visibilitychange', resumeAudio)
    return () => document.removeEventListener('visibilitychange', resumeAudio)
  }, [])

  const addLog = useCallback((msg) => {
    setLog(prev => [
      { time: new Date().toLocaleTimeString('en-IN'), msg },
      ...prev
    ].slice(0, 20))
  }, [])

  const triggerAlert = useCallback((hazard) => {
    const info = CLASS_INFO[hazard.cls] || CLASS_INFO.D40
    setAlert({ ...hazard, ...info })
    vibrateAlert(info.severity)

    // Speak the alert
    speakAlert(
      `Warning! ${info.label} detected ahead on ${hazard.road_name}. Severity ${info.severity}. Please slow down.`,
      `सावधान! आगे ${hazard.road_name} पर खतरा है। कृपया धीमे चलें।`
    )

    addLog(`🚨 ALERT: ${info.emoji} ${info.label} on ${hazard.road_name}`)

    if (Notification.permission === 'granted') {
      new Notification(`⚠️ ${info.severity} Hazard Ahead!`, {
        body: `${info.emoji} ${info.label} on ${hazard.road_name}`,
        tag: 'hazard-alert',
        requireInteraction: true,
      })
    }
  }, [addLog])

  const checkProximity = useCallback((lat, lng) => {
    const close = hazards
      .map(h => ({ ...h, dist: getDistanceMetres(lat, lng, h.lat ?? h.latitude, h.lng ?? h.longitude) }))
      .filter(h => h.dist <= ALERT_RADIUS_M)
      .sort((a, b) => a.dist - b.dist)
    setNearby(close)
    const first = close.find(h => !alertedRef.current.has(String(h.id)))
    if (first) {
      alertedRef.current.add(String(first.id))
      triggerAlert(first)
    }
  }, [hazards, triggerAlert])

  const handleStartReal = useCallback(() => {
    // STEP 1: unlock audio on this user gesture
    unlockAudio()
    setAudioReady(true)

    if (!navigator.geolocation) { addLog('❌ GPS not available on this device'); return }
    alertedRef.current.clear()
    setActive(true); setStatus('tracking')
    addLog('📍 Real GPS tracking started')
    watchRef.current = navigator.geolocation.watchPosition(
      pos => {
        const { latitude: lat, longitude: lng } = pos.coords
        setPosition({ lat, lng })
        checkProximity(lat, lng)
        addLog(`📍 ${lat.toFixed(5)}, ${lng.toFixed(5)}`)
      },
      err => { addLog(`❌ GPS Error: ${err.message}`); setStatus('error') },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    )
  }, [checkProximity, addLog])

  const handleStartSim = useCallback(() => {
    // STEP 1: unlock audio on this user gesture
    unlockAudio()
    setAudioReady(true)

    alertedRef.current.clear()
    setActive(true); setSimMode(true); setStatus('simulating'); setSimIndex(0)
    addLog('🎮 Simulation started — NH-16 Vijayawada route')

    let idx = 0
    simRef.current = setInterval(() => {
      if (idx >= SIMULATED_ROUTE.length) {
        clearInterval(simRef.current)
        setStatus('completed')
        addLog('✅ Simulation complete — route finished')
        return
      }
      const p = SIMULATED_ROUTE[idx]
      setPosition({ lat: p.lat, lng: p.lng })
      setSimIndex(idx)
      addLog(`🚗 ${p.label}`)
      checkProximity(p.lat, p.lng)
      idx++
    }, 2500)
  }, [checkProximity, addLog])

  const stopDrive = useCallback(() => {
    if (watchRef.current) navigator.geolocation.clearWatch(watchRef.current)
    if (simRef.current)  clearInterval(simRef.current)
    window.speechSynthesis?.cancel()
    setActive(false); setSimMode(false); setStatus('idle')
    setPosition(null); setNearby([]); setAlert(null)
    alertedRef.current.clear()
    addLog('⏹️ Drive mode stopped')
  }, [addLog])

  const statusColor = {
    tracking:   '#6ee7b7',
    simulating: '#a5b4fc',
    error:      '#f87171',
    completed:  '#6ee7b7',
    idle:       '#9099b2',
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 2000,
      background: 'rgba(0,0,0,0.88)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16
    }}>
      <div style={{
        background: '#1a1d27', borderRadius: 16, width: '100%', maxWidth: 460,
        maxHeight: '90vh', overflowY: 'auto',
        border: '1px solid #2e3348',
        boxShadow: '0 24px 80px rgba(0,0,0,0.6)',
        animation: 'fadeInScale 0.25s ease'
      }}>

        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '16px 20px', borderBottom: '1px solid #2e3348',
          background: '#22263a', borderRadius: '16px 16px 0 0'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 28 }}>🚗</span>
            <div>
              <div style={{ fontSize: 16, fontWeight: 700, color: '#e8eaf0' }}>Drive Mode</div>
              <div style={{ fontSize: 11, color: '#9099b2' }}>V2I Hazard Alert System · EN + हिंदी</div>
            </div>
          </div>
          <button
            onClick={() => { stopDrive(); onClose?.() }}
            style={{ background: 'none', border: 'none', color: '#9099b2', fontSize: 20, cursor: 'pointer' }}
          >✕</button>
        </div>

        {/* Audio status notice */}
        {!audioReady && (
          <div style={{
            margin: '12px 16px 0',
            padding: '10px 14px',
            background: '#1e1b4b',
            border: '1px solid #4f46e5',
            borderRadius: 8,
            fontSize: 12,
            color: '#a5b4fc',
            display: 'flex',
            alignItems: 'center',
            gap: 8
          }}>
            <span>🔊</span>
            <span>Press <strong>Real GPS Drive</strong> or <strong>Simulate Route</strong> to enable voice alerts</span>
          </div>
        )}

        {audioReady && (
          <div style={{
            margin: '12px 16px 0',
            padding: '8px 14px',
            background: '#052e16',
            border: '1px solid #16a34a',
            borderRadius: 8,
            fontSize: 12,
            color: '#6ee7b7',
            display: 'flex',
            alignItems: 'center',
            gap: 8
          }}>
            <span>✅</span>
            <span>Voice alerts enabled — bilingual EN + हिंदी active</span>
          </div>
        )}

        {/* Status bar */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '10px 20px', borderBottom: '1px solid #2e3348', marginTop: 12,
          background: status === 'tracking' ? '#052e16' : status === 'simulating' ? '#1e1b4b' : '#1a1d27'
        }}>
          <span style={{ fontSize: 11, color: '#9099b2', textTransform: 'uppercase', letterSpacing: '0.05em' }}>STATUS</span>
          <span style={{ fontSize: 13, fontWeight: 600, color: statusColor[status] || '#9099b2' }}>
            {status === 'idle'       && '⏸️  Idle — press Start'}
            {status === 'tracking'   && '🟢 Live GPS Tracking'}
            {status === 'simulating' && '🟣 Simulation Running'}
            {status === 'error'      && '🔴 GPS Error'}
            {status === 'completed'  && '✅ Route Complete'}
          </span>
        </div>

        {/* Position */}
        {position && (
          <div style={{ margin: 16, background: '#22263a', borderRadius: 10, padding: 14, display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
              <span style={{ color: '#9099b2' }}>Latitude</span>
              <span style={{ color: '#e8eaf0', fontFamily: 'monospace', fontWeight: 600 }}>{position.lat.toFixed(5)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
              <span style={{ color: '#9099b2' }}>Longitude</span>
              <span style={{ color: '#e8eaf0', fontFamily: 'monospace', fontWeight: 600 }}>{position.lng.toFixed(5)}</span>
            </div>
            {simMode && (
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                <span style={{ color: '#9099b2' }}>Location</span>
                <span style={{ color: '#e8eaf0' }}>{SIMULATED_ROUTE[simIndex]?.label}</span>
              </div>
            )}
          </div>
        )}

        {/* Nearby hazards */}
        {nearby.length > 0 && (
          <div style={{ margin: '0 16px 16px' }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#fbbf24', marginBottom: 8 }}>
              ⚠️ {nearby.length} Hazard(s) Within 500m
            </div>
            {nearby.map(h => {
              const info = CLASS_INFO[h.cls] || {}
              return (
                <div key={h.id} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '8px 12px', background: '#22263a',
                  borderRadius: 8, border: `1px solid ${info.color}`, marginBottom: 6, fontSize: 13
                }}>
                  <span style={{ color: info.color, fontWeight: 700 }}>{info.emoji} {h.cls}</span>
                  <span style={{ color: '#e8eaf0' }}>{h.road_name}</span>
                  <span style={{ color: info.color }}>{Math.round(h.dist)}m</span>
                </div>
              )
            })}
          </div>
        )}

        {/* Controls */}
        <div style={{ display: 'flex', gap: 10, padding: '0 16px 16px', flexWrap: 'wrap' }}>
          {!active ? (
            <>
              <button onClick={handleStartReal} style={{
                flex: 1, padding: '12px 16px', borderRadius: 10, border: 'none',
                background: '#4f8ef7', color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer'
              }}>
                📍 Real GPS Drive
              </button>
              <button onClick={handleStartSim} style={{
                flex: 1, padding: '12px 16px', borderRadius: 10, border: 'none',
                background: '#7c3aed', color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer'
              }}>
                🎮 Simulate Route
              </button>
            </>
          ) : (
            <button onClick={stopDrive} style={{
              flex: 1, padding: '12px 16px', borderRadius: 10, border: 'none',
              background: '#ef4444', color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer'
            }}>
              ⏹️ Stop Drive Mode
            </button>
          )}
        </div>

        {/* Activity log */}
        <div style={{ margin: '0 16px 16px' }}>
          <div style={{ fontSize: 11, color: '#9099b2', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8, fontWeight: 600 }}>
            Activity Log
          </div>
          <div style={{
            background: '#0f1117', borderRadius: 8, padding: 10,
            maxHeight: 140, overflowY: 'auto',
            display: 'flex', flexDirection: 'column', gap: 4
          }}>
            {log.length === 0
              ? <div style={{ fontSize: 12, color: '#9099b2', textAlign: 'center', padding: '16px 0' }}>
                  Start drive mode to see activity
                </div>
              : log.map((e, i) => (
                <div key={i} style={{ display: 'flex', gap: 10, fontSize: 12 }}>
                  <span style={{ color: '#4f8ef7', fontFamily: 'monospace', flexShrink: 0 }}>{e.time}</span>
                  <span style={{ color: '#e8eaf0' }}>{e.msg}</span>
                </div>
              ))
            }
          </div>
        </div>

      </div>

      {/* HAZARD ALERT OVERLAY */}
      {alert && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 3000,
          background: 'rgba(0,0,0,0.95)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20
        }}>
          <div style={{
            background: '#1a1d27', borderRadius: 20, padding: 32, maxWidth: 380, width: '100%',
            textAlign: 'center', border: `2px solid ${alert.color}`,
            boxShadow: `0 0 60px ${alert.color}66`,
            display: 'flex', flexDirection: 'column', gap: 16,
            animation: 'fadeInScale 0.2s ease'
          }}>
            <div style={{ fontSize: 72, animation: 'pulse-icon 0.8s infinite' }}>{alert.emoji}</div>

            <div style={{ fontSize: 22, fontWeight: 800, color: alert.color, letterSpacing: '0.05em' }}>
              {alert.severity.toUpperCase()} HAZARD AHEAD
            </div>

            <div style={{ fontSize: 16, color: '#e8eaf0', fontWeight: 600 }}>
              {alert.cls} — {alert.label}
            </div>

            <div style={{ fontSize: 14, color: '#9099b2' }}>📍 {alert.road_name}</div>

            <div style={{ fontSize: 16, color: '#fbbf24', fontWeight: 600 }}>
              ⚠️ आगे खतरा है — कृपया धीमे चलें
            </div>

            <div style={{ fontSize: 12, color: '#9099b2', background: '#22263a', padding: '6px 12px', borderRadius: 6 }}>
              SLA: Repair required within {alert.sla_hours}h
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={() => { setAlert(null); window.speechSynthesis?.cancel() }}
                style={{
                  flex: 1, padding: '12px 0', borderRadius: 10, border: 'none',
                  background: alert.color, color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer'
                }}
              >
                ✓ Acknowledged
              </button>
              <button
                onClick={() => speakAlert(
                  `Warning! ${alert.label} ahead on ${alert.road_name}. Please slow down.`,
                  `सावधान! आगे ${alert.road_name} पर खतरा है। कृपया धीमे चलें।`
                )}
                style={{
                  flex: 1, padding: '12px 0', borderRadius: 10,
                  border: '1px solid #2e3348', background: '#22263a',
                  color: '#e8eaf0', fontSize: 14, fontWeight: 600, cursor: 'pointer'
                }}
              >
                🔊 Repeat
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}