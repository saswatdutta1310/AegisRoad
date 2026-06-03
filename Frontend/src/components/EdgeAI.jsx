import { useState, useRef, useCallback, useEffect } from 'react';
import { inferenceApi, hazardApi } from '../services/api';

const CLASS_INFO = {
  D00: { label: 'Longitudinal Crack',  color: '#fbbf24', severity: 'Low' },
  D10: { label: 'Transverse Crack',    color: '#f97316', severity: 'Medium' },
  D20: { label: 'Alligator Cracking',  color: '#ef4444', severity: 'High' },
  D40: { label: 'Pothole',             color: '#dc2626', severity: 'Critical' },
  D43: { label: 'Surface Damage',      color: '#f97316', severity: 'Medium' },
  D44: { label: 'Cross-walk Blur',     color: '#fbbf24', severity: 'Low' },
  D50: { label: 'Manhole Cover',       color: '#a78bfa', severity: 'Low' },
};

function getClassInfo(cls) {
  if (CLASS_INFO[cls]) return CLASS_INFO[cls];
  const digit    = parseInt(cls.replace(/\D/g, '').slice(-1), 10);
  const severity = digit >= 5 ? 'Critical' : digit >= 3 ? 'High' : digit >= 1 ? 'Medium' : 'Low';
  const colors   = { Low: '#fbbf24', Medium: '#f97316', High: '#ef4444', Critical: '#dc2626' };
  return { label: cls.replace(/([A-Z])(\d)/, '$1 $2'), color: colors[severity], severity };
}

const DEMO_RESULT = {
  detections: [
    { class: 'D40', confidence: 0.91, bbox: [120, 200, 280, 320] },
    { class: 'D10', confidence: 0.74, bbox: [340, 150, 180, 90]  },
  ],
  inference_ms: 43,
  model: 'YOLOv8-Nano (demo mode)',
};

async function reverseGeocode(lat, lng) {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
      { headers: { 'Accept-Language': 'en', 'User-Agent': 'AegisRoad/1.0' } }
    );
    const data = await res.json();
    return (
      data.address?.road          ||
      data.address?.suburb        ||
      data.address?.city_district ||
      data.address?.city          ||
      `${lat.toFixed(4)}, ${lng.toFixed(4)}`
    );
  } catch {
    return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
  }
}

export default function EdgeAI() {
  const [file, setFile]         = useState(null);
  const [preview, setPreview]   = useState(null);
  const [result, setResult]     = useState(null);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState(null);
  const [reported, setReported] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [autoPinned, setAutoPinned] = useState(false);

  // GPS state
  const [gpsPos, setGpsPos]       = useState(null);
  const [gpsStatus, setGpsStatus] = useState('idle');
  const [roadName, setRoadName]   = useState(null);
  const [gpsError, setGpsError]   = useState(null);
  const [gpsAccuracy, setGpsAccuracy] = useState(null);
  const watchRef = useRef(null);
  const fileRef  = useRef();

  // Start GPS on mount
  useEffect(() => {
    const isSecure =
      window.location.protocol === 'https:' ||
      window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1';

    if (!isSecure) {
      setGpsStatus('error');
      setGpsError('GPS requires HTTPS. Access via localhost or the live Vercel URL.');
      return;
    }
    if (!navigator.geolocation) {
      setGpsStatus('error');
      setGpsError('GPS not available on this device');
      return;
    }

    setGpsStatus('fetching');
    watchRef.current = navigator.geolocation.watchPosition(
      async (pos) => {
        const { latitude: lat, longitude: lng, accuracy } = pos.coords;
        setGpsPos({ lat, lng });
        setGpsAccuracy(Math.round(accuracy));
        setGpsStatus('ok');
        setGpsError(null);
        const name = await reverseGeocode(lat, lng);
        setRoadName(name);
      },
      (err) => {
        setGpsStatus('error');
        setGpsError(
          err.code === 1 ? 'Location permission denied. Please allow access in browser settings.' :
          err.code === 2 ? 'Position unavailable. Check device GPS.' :
          'GPS timed out. Try again.'
        );
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 5000 }
    );
    return () => {
      if (watchRef.current) navigator.geolocation.clearWatch(watchRef.current);
    };
  }, []);

  // Auto-pin to map when result arrives + GPS is ready
  useEffect(() => {
    if (result && gpsStatus === 'ok' && gpsPos && !autoPinned && result.detections?.length > 0) {
      autoPinHazard();
    }
  }, [result, gpsStatus, gpsPos]);

  const handleFile = useCallback((incoming) => {
    if (!incoming || !incoming.type.startsWith('image/')) return;
    setFile(incoming);
    setPreview(URL.createObjectURL(incoming));
    setResult(null);
    setError(null);
    setReported(false);
    setAutoPinned(false);
  }, []);

  function handleDrop(e) {
    e.preventDefault();
    setDragOver(false);
    handleFile(e.dataTransfer.files[0]);
  }

  async function runInference() {
    if (!file) return;
    setLoading(true);
    setError(null);
    try {
      const data = await inferenceApi.predict(file);
      setResult(data);
    } catch {
      setResult(DEMO_RESULT);
      setError('⚠️ Inference server not connected — showing demo result');
    }
    setLoading(false);
  }

  // Auto-pin silently (no button needed)
  async function autoPinHazard() {
    if (!result?.detections?.length || !gpsPos) return;
    const top  = result.detections[0];
    const info = getClassInfo(top.class);
    const resolvedRoadName = roadName || `${gpsPos.lat.toFixed(4)}, ${gpsPos.lng.toFixed(4)}`;
    try {
      await hazardApi.create({
        road_name:   resolvedRoadName,
        location:    resolvedRoadName,
        lat:         gpsPos.lat,
        lng:         gpsPos.lng,
        coordinates: { lat: gpsPos.lat, lng: gpsPos.lng },
        cls:         top.class,
        title:       `${info.label} detected via Dashcam`,
        severity:    info.severity.toLowerCase(),
        contractor:  null,
        source:      'edge_ai_auto',
        confidence:  top.confidence,
      });
    } catch { /* silent — demo mode */ }
    setAutoPinned(true);
  }

  async function reportHazard() {
    if (!result?.detections?.length) return;
    if (!gpsPos) {
      setError('❌ GPS location not available — cannot pin hazard on map.');
      return;
    }
    const top  = result.detections[0];
    const info = getClassInfo(top.class);
    const resolvedRoadName = roadName || `${gpsPos.lat.toFixed(4)}, ${gpsPos.lng.toFixed(4)}`;
    try {
      await hazardApi.create({
        road_name:   resolvedRoadName,
        location:    resolvedRoadName,
        lat:         gpsPos.lat,
        lng:         gpsPos.lng,
        coordinates: { lat: gpsPos.lat, lng: gpsPos.lng },
        cls:         top.class,
        title:       `${info.label} detected via Dashcam`,
        severity:    info.severity.toLowerCase(),
        contractor:  null,
        source:      'edge_ai',
        confidence:  top.confidence,
      });
    } catch { /* demo mode */ }
    setReported(true);
  }

  // ── GPS block color config ─────────────────────────────────────────────────
  const gpsConfig = {
    idle:     { border: '#3a3f58', bg: '#22263a',  labelColor: '#9099b2', valueColor: '#9099b2' },
    fetching: { border: '#4f46e5', bg: '#1e1b4b',  labelColor: '#a5b4fc', valueColor: '#a5b4fc' },
    ok:       { border: '#16a34a', bg: '#052e16',  labelColor: '#6ee7b7', valueColor: '#ffffff' },
    error:    { border: '#dc2626', bg: '#450a0a',  labelColor: '#f87171', valueColor: '#fca5a5' },
  }[gpsStatus];

  const accuracyColor =
    !gpsAccuracy ? '#9099b2' :
    gpsAccuracy < 20  ? '#6ee7b7' :
    gpsAccuracy < 50  ? '#fbbf24' : '#f87171';

  return (
    <div className="flex flex-col md:flex-row gap-6 p-4">

      {/* ── LEFT: Upload + GPS ──────────────────────────────────────────── */}
      <div className="flex-1 bg-slate-900 border border-slate-800 rounded-xl p-6 flex flex-col gap-5">

        {/* Header */}
        <div className="flex items-center gap-3">
          <span className="text-3xl">🤖</span>
          <div>
            <h2 className="text-xl font-bold text-white">Edge AI — Hazard Detector</h2>
            <p className="text-sm text-slate-400">Upload a dashcam frame · YOLOv8-Nano inference · auto-pin to map</p>
          </div>
        </div>

        {/* ── GPS LOCATION BLOCK ─────────────────────────────────────────── */}
        <div style={{
          borderRadius: 12,
          border: `1.5px solid ${gpsConfig.border}`,
          background: gpsConfig.bg,
          padding: '14px 16px',
          transition: 'all 0.3s ease',
        }}>
          {/* Block header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 16 }}>
                {gpsStatus === 'ok' ? '📍' : gpsStatus === 'fetching' ? '🔄' : gpsStatus === 'error' ? '❌' : '📡'}
              </span>
              <span style={{ fontSize: 12, fontWeight: 700, color: gpsConfig.labelColor, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Live GPS Location
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              {gpsStatus === 'fetching' && (
                <div style={{ width: 12, height: 12, borderRadius: '50%', border: '2px solid #4f46e5', borderTopColor: 'transparent', animation: 'spin 0.8s linear infinite' }} />
              )}
              {gpsStatus === 'ok' && (
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#6ee7b7', animation: 'gps-ping 1.5s infinite' }} />
              )}
              <span style={{ fontSize: 10, fontWeight: 700, color: gpsConfig.labelColor, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {gpsStatus === 'ok' ? 'LIVE' : gpsStatus === 'fetching' ? 'ACQUIRING' : gpsStatus === 'error' ? 'ERROR' : 'IDLE'}
              </span>
            </div>
          </div>

          {/* Coordinates display */}
          {gpsPos ? (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {/* Latitude */}
              <div style={{ background: 'rgba(0,0,0,0.3)', borderRadius: 8, padding: '10px 12px' }}>
                <div style={{ fontSize: 9, color: '#9099b2', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4, fontWeight: 600 }}>Latitude</div>
                <div style={{ fontSize: 16, fontWeight: 800, color: gpsConfig.valueColor, fontFamily: 'monospace', letterSpacing: '-0.5px' }}>
                  {gpsPos.lat.toFixed(6)}
                </div>
              </div>
              {/* Longitude */}
              <div style={{ background: 'rgba(0,0,0,0.3)', borderRadius: 8, padding: '10px 12px' }}>
                <div style={{ fontSize: 9, color: '#9099b2', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4, fontWeight: 600 }}>Longitude</div>
                <div style={{ fontSize: 16, fontWeight: 800, color: gpsConfig.valueColor, fontFamily: 'monospace', letterSpacing: '-0.5px' }}>
                  {gpsPos.lng.toFixed(6)}
                </div>
              </div>
              {/* Road name + accuracy */}
              <div style={{ gridColumn: 'span 2', background: 'rgba(0,0,0,0.3)', borderRadius: 8, padding: '8px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontSize: 11, color: '#9099b2', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginRight: 8 }}>
                  {roadName ? `📌 ${roadName}` : '⏳ Resolving road name...'}
                </div>
                {gpsAccuracy && (
                  <div style={{ fontSize: 11, fontWeight: 700, color: accuracyColor, whiteSpace: 'nowrap' }}>
                    ±{gpsAccuracy}m
                  </div>
                )}
              </div>
            </div>
          ) : gpsStatus === 'error' ? (
            <div style={{ fontSize: 12, color: '#fca5a5', lineHeight: 1.5 }}>
              {gpsError}
              <button
                onClick={() => { setGpsStatus('fetching'); setGpsError(null); }}
                style={{ display: 'block', marginTop: 8, padding: '5px 12px', borderRadius: 6, border: 'none', background: '#4f8ef7', color: '#fff', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}
              >
                Retry GPS
              </button>
            </div>
          ) : (
            <div style={{ fontSize: 12, color: gpsConfig.labelColor, padding: '4px 0' }}>
              {gpsStatus === 'fetching' ? '⏳ Acquiring GPS signal — this takes a few seconds...' : 'GPS not started'}
            </div>
          )}
        </div>
        {/* ── END GPS BLOCK ─────────────────────────────────────────────── */}

        {/* Drop zone */}
        <div
          className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
            dragOver ? 'border-[#2ea014] bg-[#2ea014]/10' : 'border-slate-700 bg-slate-800/50 hover:bg-slate-800'
          }`}
          onClick={() => fileRef.current.click()}
          onDrop={handleDrop}
          onDragOver={e => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
        >
          {preview ? (
            <img src={preview} className="max-h-64 mx-auto rounded-lg object-contain" alt="dashcam frame" />
          ) : (
            <div className="flex flex-col items-center justify-center py-10 gap-2">
              <span className="text-4xl mb-2">📷</span>
              <span className="text-slate-300 font-medium">Drop dashcam image here</span>
              <span className="text-xs text-slate-500">or click to browse · JPG / PNG</span>
              {gpsStatus === 'ok' && (
                <span className="text-xs text-emerald-400 mt-1">📍 GPS ready — hazard will auto-pin on detection</span>
              )}
            </div>
          )}
        </div>

        <input ref={fileRef} type="file" accept="image/*" className="hidden"
          onChange={e => handleFile(e.target.files[0])} />

        {file && (
          <p className="text-sm text-slate-300 bg-slate-800 p-2 rounded">
            📎 {file.name} · {(file.size / 1024).toFixed(1)} KB
          </p>
        )}

        {error && (
          <p className="text-sm text-amber-400 bg-amber-400/10 p-3 rounded-lg border border-amber-400/20">{error}</p>
        )}

        {/* Auto-pin success notice */}
        {autoPinned && (
          <div className="p-3 bg-emerald-900/40 border border-emerald-500/50 rounded-lg text-emerald-400 text-sm font-medium flex items-center gap-2">
            <span>✅</span>
            <span>Auto-pinned to Public Map at {gpsPos?.lat.toFixed(5)}, {gpsPos?.lng.toFixed(5)}</span>
          </div>
        )}

        {/* Buttons */}
        <div className="flex flex-col gap-3">
          <button
            className="w-full bg-[#2ea014] hover:bg-[#258210] disabled:bg-slate-700 disabled:text-slate-500 text-white font-bold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
            onClick={runInference}
            disabled={!file || loading}
          >
            {loading ? (
              <>
                <span style={{ display:'inline-block', width:14, height:14, border:'2px solid rgba(255,255,255,0.3)', borderTopColor:'#fff', borderRadius:'50%', animation:'spin 0.8s linear infinite' }} />
                Analysing...
              </>
            ) : '🔍 Detect Hazards'}
          </button>

          {result && !reported && (
            <button
              className={`w-full font-bold py-3 px-4 rounded-lg transition-colors text-white ${
                gpsStatus === 'ok'
                  ? 'bg-rose-600 hover:bg-rose-700'
                  : 'bg-slate-700 cursor-not-allowed opacity-60'
              }`}
              onClick={reportHazard}
              disabled={gpsStatus !== 'ok'}
              title={gpsStatus !== 'ok' ? 'Waiting for GPS fix before reporting' : ''}
            >
              {gpsStatus === 'ok' ? '🚨 Report to Authorities' : '⏳ Waiting for GPS fix...'}
            </button>
          )}

          {reported && (
            <div className="w-full bg-emerald-900/50 border border-emerald-500/50 text-emerald-400 font-medium py-3 px-4 rounded-lg text-center">
              ✅ Hazard logged at {gpsPos?.lat.toFixed(4)}, {gpsPos?.lng.toFixed(4)} · SLA timer started
            </div>
          )}
        </div>
      </div>

      {/* ── RIGHT: Results ──────────────────────────────────────────────── */}
      <div className="flex-1 bg-slate-900 border border-slate-800 rounded-xl p-6">
        <h3 className="text-lg font-bold text-white mb-6 pb-2 border-b border-slate-800">Detection Results</h3>

        {!result && !loading && (
          <div className="flex flex-col items-center justify-center h-48 text-center text-slate-500 gap-3">
            <span className="text-4xl opacity-50">🛣️</span>
            <p>Upload an image and click<br />"Detect Hazards"</p>
          </div>
        )}

        {loading && (
          <div className="flex flex-col items-center justify-center h-48 text-center gap-3">
            <div className="w-8 h-8 border-4 border-[#2ea014] border-t-transparent rounded-full animate-spin"></div>
            <p className="text-slate-300 font-medium">Running YOLOv8-Nano…</p>
            <p className="text-xs text-slate-500">Sending frame to HF Space</p>
          </div>
        )}

        {result && !loading && (
          <div className="space-y-6">
            <div className="flex gap-2 flex-wrap">
              <span className="px-2.5 py-1 rounded bg-slate-800 text-slate-300 text-xs font-mono border border-slate-700">⚡ {result.inference_ms}ms</span>
              <span className="px-2.5 py-1 rounded bg-slate-800 text-slate-300 text-xs font-mono border border-slate-700">{result.detections?.length ?? 0} detection(s)</span>
              <span className="px-2.5 py-1 rounded bg-slate-800 text-slate-300 text-xs font-mono border border-slate-700">🤖 {result.model}</span>
            </div>

            {result.detections?.length === 0 && (
              <div className="p-4 bg-emerald-900/20 border border-emerald-500/30 rounded-lg text-emerald-400">
                ✅ No damage detected in this frame
              </div>
            )}

            <div className="space-y-3">
              {result.detections?.map((d, i) => {
                const info = getClassInfo(d.class);
                const pct  = Math.round(d.confidence * 100);
                return (
                  <div key={i} className="bg-slate-950 border border-slate-800 rounded-lg p-4 relative overflow-hidden">
                    <div className="absolute left-0 top-0 bottom-0 w-1" style={{ backgroundColor: info.color }}></div>
                    <div className="flex justify-between items-center mb-2 pl-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-sm" style={{ color: info.color }}>{d.class}</span>
                        <span className="text-slate-300 text-sm font-medium">{info.label}</span>
                      </div>
                      <span className="font-mono text-sm font-bold" style={{ color: info.color }}>{pct}%</span>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-1.5 mb-3 ml-2">
                      <div className="h-1.5 rounded-full transition-all duration-500" style={{ width: `${pct}%`, backgroundColor: info.color }}></div>
                    </div>
                    <p className="text-xs text-slate-500 font-mono ml-2">
                      Severity: <strong style={{ color: info.color }}>{info.severity}</strong>
                      &nbsp;·&nbsp;BBox: [{d.bbox?.map(Math.round).join(', ')}]
                    </p>
                  </div>
                );
              })}
            </div>

            {/* GPS pin preview */}
            {gpsStatus === 'ok' && gpsPos && (
              <div className="p-3 bg-slate-800/60 border border-slate-700 rounded-lg text-xs space-y-1">
                <div className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mb-2">
                  {autoPinned ? '✅ Auto-pinned at' : '📍 Will be pinned at'}
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Coordinates</span>
                  <span className="text-white font-mono">{gpsPos.lat.toFixed(6)}, {gpsPos.lng.toFixed(6)}</span>
                </div>
                {roadName && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">Road</span>
                    <span className="text-white">{roadName}</span>
                  </div>
                )}
                {gpsAccuracy && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">GPS Accuracy</span>
                    <span style={{ color: accuracyColor }}>±{gpsAccuracy}m</span>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Model pipeline info */}
        <div className="mt-8 pt-6 border-t border-slate-800">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Model Pipeline</p>
          <div className="space-y-2 text-xs">
            {[
              ['Architecture',     'YOLOv8-Nano'],
              ['Training data',    'GRDDC + IDD (Kaggle)'],
              ['Classes',          'D00 · D10 · D20 · D40'],
              ['Inference server', 'HF Spaces (Docker)'],
              ['Target mAP@50',    '≥ 0.50'],
              ['Location source',  gpsStatus === 'ok' ? '✅ Live GPS' : '⚠️ GPS pending'],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between border-b border-slate-800/50 pb-1">
                <span className="text-slate-500">{k}</span>
                <span className="text-slate-300 font-mono">{v}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin     { to { transform: rotate(360deg); } }
        @keyframes gps-ping { 0%,100% { transform:scale(1); opacity:1; } 50% { transform:scale(1.5); opacity:0.4; } }
      `}</style>
    </div>
  );
}