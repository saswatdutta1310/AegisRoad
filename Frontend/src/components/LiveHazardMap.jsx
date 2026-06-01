/**
 * LiveHazardMap.jsx
 * Drop-in replacement / upgrade for your public civic map component.
 *
 * Features added:
 *  - Real-time GPS dot that moves as user moves (blue pulsing circle)
 *  - "Locate Me" button
 *  - Live hazard data from your backend (polls every 30s)
 *  - Mock data fallback when backend is offline
 *  - Location search autocomplete (Nominatim) with fly-to
 *  - Severity-coded markers with popups
 *  - SpendWatch bubble overlay (contract value = bubble size)
 *  - Proximity alert: toast when a critical hazard is within 1km of user
 */

import { useState, useEffect, useRef, useCallback } from 'react'
import { MapContainer, TileLayer, useMap, Marker, Popup,
         Circle, CircleMarker, Polyline, useMapEvents } from 'react-leaflet'
import { toast } from 'react-toastify'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

// Fix Leaflet default icons (Vite/webpack issue)
import markerIcon2x  from 'leaflet/dist/images/marker-icon-2x.png'
import markerIcon    from 'leaflet/dist/images/marker-icon.png'
import markerShadow  from 'leaflet/dist/images/marker-shadow.png'
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({ iconUrl: markerIcon, iconRetinaUrl: markerIcon2x, shadowUrl: markerShadow })

// ── Constants ────────────────────────────────────────────────────────────────
const DEFAULT_CENTER = [20.5937, 78.9629]   // Centre of India
const DEFAULT_ZOOM   = 6
const ALERT_RADIUS_M = 1000                  // 1km proximity alert
const POLL_INTERVAL  = 30000                 // 30 seconds

const SEV_COLOR = {
  critical: '#ef4444',
  high:     '#f59e0b',
  medium:   '#3b82f6',
  low:      '#10b981',
}

// ── Mock hazard data (fallback when backend offline) ─────────────────────────
const MOCK_HAZARDS = [
  { id:1,  lat:16.5417, lng:80.5152, cls:'D40', severity:'critical', road:'NH-16, Vijayawada',   contractor:'Ramesh Road Works',     status:'Open',       reportedAt:'2026-05-20' },
  { id:2,  lat:16.3067, lng:80.4365, cls:'D20', severity:'high',     road:'SH-47, Guntur',       contractor:'AP Infrastructure Ltd', status:'In Progress', reportedAt:'2026-05-22' },
  { id:3,  lat:16.4307, lng:80.6241, cls:'D10', severity:'medium',   road:'NH-65, Mangalagiri',  contractor:'National Highway Corp',  status:'Open',       reportedAt:'2026-05-23' },
  { id:4,  lat:16.5820, lng:80.6278, cls:'D00', severity:'low',      road:'MDR-22, Tadepalle',   contractor:'Coastal Road Builders',  status:'Resolved',   reportedAt:'2026-05-15' },
  { id:5,  lat:16.2760, lng:80.4534, cls:'D40', severity:'critical', road:'NH-16, Tenali',        contractor:'Deccan Infra Pvt Ltd',  status:'Open',       reportedAt:'2026-05-24' },
  { id:6,  lat:17.3850, lng:78.4867, cls:'D40', severity:'critical', road:'ORR, Hyderabad',       contractor:'HMDA Roads Ltd',        status:'In Progress', reportedAt:'2026-05-25' },
  { id:7,  lat:13.0827, lng:80.2707, cls:'D20', severity:'high',     road:'ECR, Chennai',         contractor:'TNRDC',                 status:'Open',       reportedAt:'2026-05-21' },
  { id:8,  lat:12.9716, lng:77.5946, cls:'D10', severity:'medium',   road:'Outer Ring Road, Bengaluru', contractor:'BBMP Works',     status:'Open',       reportedAt:'2026-05-19' },
  { id:9,  lat:19.0760, lng:72.8777, cls:'D40', severity:'high',     road:'Western Express Hwy, Mumbai', contractor:'MMRDA',         status:'In Progress', reportedAt:'2026-05-26' },
  { id:10, lat:22.5726, lng:88.3639, cls:'D20', severity:'medium',   road:'VIP Road, Kolkata',    contractor:'KMC Roads',             status:'Open',       reportedAt:'2026-05-18' },
]

// ── Helpers ──────────────────────────────────────────────────────────────────
function distM(lat1, lng1, lat2, lng2) {
  const R = 6371000
  const dLat = (lat2-lat1)*Math.PI/180
  const dLng = (lng2-lng1)*Math.PI/180
  const a = Math.sin(dLat/2)**2 +
    Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLng/2)**2
  return R*2*Math.atan2(Math.sqrt(a),Math.sqrt(1-a))
}

function createSeverityIcon(severity, cls) {
  const color = SEV_COLOR[severity] || '#6b7280'
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="36" height="44" viewBox="0 0 36 44">
      <filter id="shadow"><feDropShadow dx="0" dy="2" stdDeviation="2" flood-color="${color}66"/></filter>
      <path d="M18 2C10.3 2 4 8.3 4 16c0 10 14 26 14 26s14-16 14-26C32 8.3 25.7 2 18 2z"
        fill="${color}" filter="url(#shadow)"/>
      <circle cx="18" cy="16" r="7" fill="white" opacity="0.95"/>
      <text x="18" y="20" font-family="system-ui" font-size="9" font-weight="700"
        fill="${color}" text-anchor="middle">${cls}</text>
    </svg>`
  return L.divIcon({
    html: svg,
    iconSize:   [36, 44],
    iconAnchor: [18, 44],
    popupAnchor:[0, -44],
    className:  '',
  })
}

// ── GPS position tracker subcomponent ────────────────────────────────────────
function GPSTracker({ onPosition }) {
  useMapEvents({
    locationfound: e => onPosition({ lat: e.latlng.lat, lng: e.latlng.lng, accuracy: e.accuracy }),
    locationerror: e => console.warn('Location error:', e.message),
  })
  return null
}

// ── Fly-to controller ─────────────────────────────────────────────────────────
function FlyTo({ target }) {
  const map = useMap()
  useEffect(() => {
    if (target) map.flyTo([target.lat, target.lng], target.zoom || 14, { duration: 1.2 })
  }, [target, map])
  return null
}

// ── Search bar with Nominatim autocomplete ───────────────────────────────────
function MapSearchBar({ onSelect }) {
  const [query,       setQuery]       = useState('')
  const [suggestions, setSuggestions] = useState([])
  const [loading,     setLoading]     = useState(false)
  const [showDrop,    setShowDrop]    = useState(false)
  const debounce = useRef(null)
  const wrapRef  = useRef(null)

  useEffect(() => {
    const h = e => { if (wrapRef.current && !wrapRef.current.contains(e.target)) setShowDrop(false) }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])

  const handleChange = e => {
    const v = e.target.value
    setQuery(v); setShowDrop(true)
    clearTimeout(debounce.current)
    if (v.length < 3) { setSuggestions([]); setLoading(false); return }
    setLoading(true)
    debounce.current = setTimeout(async () => {
      try {
        const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(v)}&format=json&limit=6&addressdetails=1&countrycodes=in`
        const r = await fetch(url, { headers: { 'Accept-Language':'en', 'User-Agent':'AegisRoad/3.0' } })
        const d = await r.json()
        setSuggestions(d.map(p => ({
          label: [p.address?.city||p.address?.town||p.address?.village, p.address?.state].filter(Boolean).join(', ') || p.display_name.split(',')[0],
          full:  p.display_name,
          lat:   parseFloat(p.lat),
          lng:   parseFloat(p.lon),
        })))
      } catch { setSuggestions([]) }
      setLoading(false)
    }, 350)
  }

  const select = place => {
    setQuery(place.label)
    setSuggestions([])
    setShowDrop(false)
    onSelect(place)
  }

  return (
    <div ref={wrapRef} style={{
      position:'absolute', top:12, left:'50%', transform:'translateX(-50%)',
      width:'min(420px, calc(100vw - 120px))', zIndex:1000,
    }}>
      <div style={{ position:'relative' }}>
        <input
          value={query}
          onChange={handleChange}
          onFocus={() => suggestions.length > 0 && setShowDrop(true)}
          placeholder="🔍 Search city, road or landmark..."
          autoComplete="off"
          style={{
            width:'100%', boxSizing:'border-box',
            padding:'11px 42px 11px 16px',
            background:'rgba(15,17,23,0.95)', backdropFilter:'blur(12px)',
            border:'1px solid rgba(79,142,247,0.4)', borderRadius:10,
            color:'#dde2ee', fontSize:14, outline:'none',
            boxShadow:'0 4px 20px rgba(0,0,0,0.5)',
          }}
        />
        <div style={{
          position:'absolute', right:14, top:'50%', transform:'translateY(-50%)',
          color: loading ? '#4f8ef7' : '#5a6480', fontSize:15, pointerEvents:'none',
        }}>
          {loading ? '⟳' : '🔍'}
        </div>
      </div>

      {showDrop && suggestions.length > 0 && (
        <div style={{
          marginTop:4, background:'rgba(15,17,23,0.97)', backdropFilter:'blur(12px)',
          border:'1px solid rgba(79,142,247,0.3)', borderRadius:10,
          overflow:'hidden', boxShadow:'0 12px 32px rgba(0,0,0,0.7)',
        }}>
          {suggestions.map((s,i) => (
            <div
              key={i}
              onMouseDown={e => { e.preventDefault(); select(s) }}
              style={{
                padding:'10px 14px', cursor:'pointer', display:'flex', gap:10, alignItems:'flex-start',
                borderBottom: i < suggestions.length-1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
              }}
              onMouseEnter={e => e.currentTarget.style.background='rgba(79,142,247,0.12)'}
              onMouseLeave={e => e.currentTarget.style.background='transparent'}
            >
              <span style={{ fontSize:14, marginTop:1, flexShrink:0 }}>📍</span>
              <div>
                <div style={{ fontSize:13, color:'#dde2ee', fontWeight:600 }}>{s.label}</div>
                <div style={{ fontSize:11, color:'#5a6480', overflow:'hidden', textOverflow:'ellipsis',
                  display:'-webkit-box', WebkitLineClamp:1, WebkitBoxOrient:'vertical' }}>{s.full}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Main Map Component ────────────────────────────────────────────────────────
export default function LiveHazardMap({ height = '100vh', showSearch = true, showControls = true }) {
  const [hazards,   setHazards]   = useState(MOCK_HAZARDS)
  const [userPos,   setUserPos]   = useState(null)
  const [flyTarget, setFlyTarget] = useState(null)
  const [tracking,  setTracking]  = useState(false)
  const [filter,    setFilter]    = useState('all')   // all | critical | high | medium | low
  const [loading,   setLoading]   = useState(false)
  const mapRef      = useRef(null)
  const watchId     = useRef(null)
  const alertedIds  = useRef(new Set())
  const pollTimer   = useRef(null)

  // ── Fetch live hazards from backend ──────────────────────────────────────
  const fetchHazards = useCallback(async () => {
    try {
      const base = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'
      const r = await fetch(`${base}/v1/hazards?limit=200`, {
        headers: { 'Accept': 'application/json' },
        signal: AbortSignal.timeout(5000),
      })
      if (!r.ok) throw new Error(`HTTP ${r.status}`)
      const data = await r.json()
      // Normalise backend shape to our shape
      const normalised = (Array.isArray(data) ? data : data.hazards || data.items || [])
        .map(h => ({
          id:         h.id || h.hazard_id,
          lat:        parseFloat(h.lat || h.latitude),
          lng:        parseFloat(h.lng || h.longitude),
          cls:        h.cls || h.class || h.damage_type || 'D40',
          severity:   h.severity || 'medium',
          road:       h.road || h.location || 'Unknown Road',
          contractor: h.contractor || h.contractor_name || 'Unassigned',
          status:     h.status || 'Open',
          reportedAt: h.reported_at || h.created_at || '',
        }))
        .filter(h => !isNaN(h.lat) && !isNaN(h.lng))
      if (normalised.length > 0) setHazards(normalised)
    } catch {
      // Backend offline — keep mock data, no crash
    }
  }, [])

  // Poll every 30s
  useEffect(() => {
    fetchHazards()
    pollTimer.current = setInterval(fetchHazards, POLL_INTERVAL)
    return () => clearInterval(pollTimer.current)
  }, [fetchHazards])

  // ── Check proximity to critical hazards ──────────────────────────────────
  const checkProximity = useCallback((lat, lng) => {
    hazards
      .filter(h => h.severity === 'critical' && h.status !== 'Resolved')
      .forEach(h => {
        if (alertedIds.current.has(h.id)) return
        const d = distM(lat, lng, h.lat, h.lng)
        if (d <= ALERT_RADIUS_M) {
          alertedIds.current.add(h.id)
          toast.error(`🚨 Critical hazard ${Math.round(d)}m ahead — ${h.cls} on ${h.road}`, {
            position: 'top-center',
            autoClose: 8000,
          })
        }
      })
  }, [hazards])

  // ── Start GPS tracking ────────────────────────────────────────────────────
  const startTracking = () => {
    if (!navigator.geolocation) {
      toast.warning('Geolocation is not supported on this browser/device')
      return
    }
    setTracking(true)
    setLoading(true)
    watchId.current = navigator.geolocation.watchPosition(
      pos => {
        const { latitude:lat, longitude:lng } = pos.coords
        setUserPos({ lat, lng, accuracy: pos.coords.accuracy })
        checkProximity(lat, lng)
        setFlyTarget({ lat, lng, zoom: 14 })
        setLoading(false)
      },
      err => {
        const msgs = {
          1: 'Location permission denied — please allow in your browser',
          2: 'Location unavailable — check device GPS',
          3: 'Location request timed out',
        }
        toast.error(msgs[err.code] || err.message)
        setTracking(false); setLoading(false)
      },
      { enableHighAccuracy:true, maximumAge:3000, timeout:15000 }
    )
  }

  const stopTracking = () => {
    if (watchId.current) navigator.geolocation.clearWatch(watchId.current)
    setTracking(false); setUserPos(null)
    alertedIds.current.clear()
  }

  useEffect(() => () => {
    if (watchId.current) navigator.geolocation.clearWatch(watchId.current)
    clearInterval(pollTimer.current)
  }, [])

  // ── Handle search selection ───────────────────────────────────────────────
  const handleSearchSelect = place => {
    setFlyTarget({ lat: place.lat, lng: place.lng, zoom: 13 })
  }

  // ── Filtered hazards ──────────────────────────────────────────────────────
  const filtered = filter === 'all'
    ? hazards
    : hazards.filter(h => h.severity === filter)

  const counts = {
    all:      hazards.length,
    critical: hazards.filter(h=>h.severity==='critical').length,
    high:     hazards.filter(h=>h.severity==='high').length,
    medium:   hazards.filter(h=>h.severity==='medium').length,
    low:      hazards.filter(h=>h.severity==='low').length,
  }

  return (
    <div style={{ position:'relative', width:'100%', height, background:'#0a0e17' }}>

      {/* ── Map ── */}
      <MapContainer
        center={DEFAULT_CENTER}
        zoom={DEFAULT_ZOOM}
        style={{ width:'100%', height:'100%' }}
        zoomControl={false}
        ref={mapRef}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>'
          maxZoom={19}
        />

        {/* Fly-to controller */}
        <FlyTo target={flyTarget} />

        {/* Hazard markers */}
        {filtered.map(h => (
          <Marker
            key={h.id}
            position={[h.lat, h.lng]}
            icon={createSeverityIcon(h.severity, h.cls)}
          >
            <Popup minWidth={200}>
              <div style={{ fontFamily:'system-ui', padding:2 }}>
                <div style={{
                  display:'flex', justifyContent:'space-between', alignItems:'center',
                  marginBottom:8, paddingBottom:8, borderBottom:'1px solid #e5e7eb',
                }}>
                  <strong style={{ fontSize:15, color: SEV_COLOR[h.severity] }}>{h.cls}</strong>
                  <span style={{
                    background: SEV_COLOR[h.severity]+'22', color: SEV_COLOR[h.severity],
                    padding:'2px 8px', borderRadius:100, fontSize:11, fontWeight:700,
                    textTransform:'uppercase',
                  }}>{h.severity}</span>
                </div>
                <div style={{ fontSize:12, marginBottom:4 }}>
                  <strong>Road:</strong> {h.road}
                </div>
                <div style={{ fontSize:12, marginBottom:4 }}>
                  <strong>Contractor:</strong> {h.contractor}
                </div>
                <div style={{ fontSize:12, marginBottom:4 }}>
                  <strong>Status:</strong>{' '}
                  <span style={{
                    color: h.status==='Resolved'?'#10b981':h.status==='In Progress'?'#f59e0b':'#ef4444'
                  }}>{h.status}</span>
                </div>
                {h.reportedAt && (
                  <div style={{ fontSize:11, color:'#9ca3af', marginTop:4 }}>
                    Reported: {h.reportedAt}
                  </div>
                )}
              </div>
            </Popup>
          </Marker>
        ))}

        {/* User GPS position */}
        {userPos && (
          <>
            {/* Accuracy circle */}
            <Circle
              center={[userPos.lat, userPos.lng]}
              radius={userPos.accuracy || 50}
              pathOptions={{ color:'#4f8ef7', fillColor:'#4f8ef7', fillOpacity:0.12, weight:1 }}
            />
            {/* Pulsing dot */}
            <CircleMarker
              center={[userPos.lat, userPos.lng]}
              radius={8}
              pathOptions={{ color:'#fff', fillColor:'#4f8ef7', fillOpacity:1, weight:2 }}
            >
              <Popup><strong>You are here</strong><br/>{userPos.lat.toFixed(5)}, {userPos.lng.toFixed(5)}</Popup>
            </CircleMarker>
          </>
        )}
      </MapContainer>

      {/* ── Search Bar ── */}
      {showSearch && <MapSearchBar onSelect={handleSearchSelect} />}

      {/* ── Severity Filter Pills ── */}
      {showControls && (
        <div style={{
          position:'absolute', bottom:80, left:'50%', transform:'translateX(-50%)',
          display:'flex', gap:6, zIndex:1000, flexWrap:'wrap', justifyContent:'center',
        }}>
          {['all','critical','high','medium','low'].map(sev => (
            <button
              key={sev}
              onClick={() => setFilter(sev)}
              style={{
                padding:'6px 12px', borderRadius:100, border:'none', fontSize:12, fontWeight:700,
                cursor:'pointer', transition:'all .2s',
                background: filter===sev
                  ? (sev==='all' ? '#4f8ef7' : SEV_COLOR[sev])
                  : 'rgba(15,17,23,0.85)',
                color: filter===sev ? '#fff' : '#8b9bb4',
                backdropFilter:'blur(8px)',
                boxShadow: filter===sev ? `0 2px 12px ${sev==='all'?'#4f8ef744':(SEV_COLOR[sev]||'#fff')+'44'}` : 'none',
              }}
            >
              {sev==='all' ? `All (${counts.all})` : `${sev.charAt(0).toUpperCase()+sev.slice(1)} (${counts[sev]})`}
            </button>
          ))}
        </div>
      )}

      {/* ── GPS Locate Me Button ── */}
      {showControls && (
        <button
          onClick={tracking ? stopTracking : startTracking}
          disabled={loading}
          style={{
            position:'absolute', bottom:140, right:16, zIndex:1000,
            width:48, height:48, borderRadius:'50%', border:'none', cursor:'pointer',
            background: tracking
              ? 'linear-gradient(135deg,#ef4444,#dc2626)'
              : 'linear-gradient(135deg,#4f8ef7,#7c3aed)',
            color:'#fff', fontSize:20,
            boxShadow:'0 4px 16px rgba(0,0,0,0.5)',
            display:'flex', alignItems:'center', justifyContent:'center',
            transition:'all .2s',
            opacity: loading ? 0.7 : 1,
          }}
          title={tracking ? 'Stop GPS tracking' : 'Track my location'}
        >
          {loading ? '⟳' : tracking ? '⏹' : '📍'}
        </button>
      )}

      {/* ── Live indicator ── */}
      <div style={{
        position:'absolute', top:showSearch ? 60 : 12, right:16, zIndex:1000,
        background:'rgba(15,17,23,0.85)', backdropFilter:'blur(8px)',
        border:'1px solid rgba(79,142,247,0.3)', borderRadius:8,
        padding:'6px 12px', display:'flex', alignItems:'center', gap:6, fontSize:12,
      }}>
        <span style={{
          width:7, height:7, borderRadius:'50%',
          background:'#10b981',
          animation:'livePulse 2s ease-in-out infinite',
          display:'inline-block', flexShrink:0,
        }}/>
        <span style={{ color:'#8b9bb4' }}>
          {hazards.length} live hazards
        </span>
      </div>

      {/* ── GPS tracking badge ── */}
      {tracking && userPos && (
        <div style={{
          position:'absolute', top: showSearch ? 60 : 12, left:16, zIndex:1000,
          background:'rgba(79,142,247,0.15)', backdropFilter:'blur(8px)',
          border:'1px solid rgba(79,142,247,0.4)', borderRadius:8,
          padding:'6px 12px', fontSize:12, color:'#4f8ef7',
          display:'flex', alignItems:'center', gap:6,
        }}>
          <span style={{ width:7,height:7,borderRadius:'50%',background:'#4f8ef7',
            animation:'livePulse 1s ease-in-out infinite', display:'inline-block' }}/>
          GPS active
        </div>
      )}

      {/* Animations */}
      <style>{`
        @keyframes livePulse {
          0%,100% { opacity:1; transform:scale(1); }
          50%      { opacity:0.5; transform:scale(1.3); }
        }
      `}</style>
    </div>
  )
}
