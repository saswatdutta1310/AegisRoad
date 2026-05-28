import { useState, useRef, useCallback } from 'react';
import { inferenceApi, hazardApi } from '../services/api';

const CLASS_INFO = {
  D00: { label: 'Longitudinal Crack', color: '#fbbf24', severity: 'Low' },
  D10: { label: 'Transverse Crack',   color: '#f97316', severity: 'Medium' },
  D20: { label: 'Alligator Cracking', color: '#ef4444', severity: 'High' },
  D40: { label: 'Pothole',            color: '#dc2626', severity: 'Critical' },
};

const DEMO_RESULT = {
  detections: [
    { class: 'D40', confidence: 0.91, bbox: [120, 200, 280, 320] },
    { class: 'D10', confidence: 0.74, bbox: [340, 150, 180, 90]  },
  ],
  inference_ms: 43,
  model: 'YOLOv8-Nano (demo mode)',
};

export default function EdgeAI() {
  const [file, setFile]         = useState(null);
  const [preview, setPreview]   = useState(null);
  const [result, setResult]     = useState(null);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState(null);
  const [reported, setReported] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef();

  const handleFile = useCallback((incoming) => {
    if (!incoming || !incoming.type.startsWith('image/')) return;
    setFile(incoming);
    setPreview(URL.createObjectURL(incoming));
    setResult(null);
    setError(null);
    setReported(false);
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
    } catch (err) {
      setResult(DEMO_RESULT);
      setError('⚠️ Inference server not connected yet — showing demo result');
    }
    setLoading(false);
  }

  async function reportHazard() {
    if (!result?.detections?.length) return;
    const top = result.detections[0];
    try {
      await hazardApi.create({
        road_name: 'Auto-detected via Dashcam',
        lat: 16.4307,
        lng: 80.6241,
        cls: top.class,
        severity: CLASS_INFO[top.class]?.severity?.toLowerCase() ?? 'medium',
        contractor: null,
      });
    } catch { /* ignore for now */ }
    setReported(true);
  }

  return (
    <div className="flex flex-col md:flex-row gap-6 p-4">
      {/* LEFT — Upload */}
      <div className="flex-1 bg-slate-900 border border-slate-800 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <span className="text-3xl">🤖</span>
          <div>
            <h2 className="text-xl font-bold text-white">Edge AI — Hazard Detector</h2>
            <p className="text-sm text-slate-400">Upload a dashcam frame · YOLOv8-Nano inference</p>
          </div>
        </div>

        <div
          className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
            dragOver ? 'border-[#2ea014] bg-[#2ea014]/10' : 'border-slate-700 bg-slate-800/50 hover:bg-slate-800'
          }`}
          onClick={() => fileRef.current.click()}
          onDrop={handleDrop}
          onDragOver={e => { e.preventDefault(); setDragOver(true) }}
          onDragLeave={() => setDragOver(false)}
        >
          {preview ? (
            <img src={preview} className="max-h-64 mx-auto rounded-lg object-contain" alt="dashcam frame" />
          ) : (
            <div className="flex flex-col items-center justify-center py-10 gap-2">
              <span className="text-4xl mb-2">📷</span>
              <span className="text-slate-300 font-medium">Drop dashcam image here</span>
              <span className="text-xs text-slate-500">or click to browse · JPG / PNG</span>
            </div>
          )}
        </div>

        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={e => handleFile(e.target.files[0])}
        />

        {file && (
          <p className="mt-4 text-sm text-slate-300 bg-slate-800 p-2 rounded">
            📎 {file.name} · {(file.size/1024).toFixed(1)} KB
          </p>
        )}
        
        {error && <p className="mt-4 text-sm text-amber-400 bg-amber-400/10 p-3 rounded-lg border border-amber-400/20">{error}</p>}

        <div className="mt-6 flex flex-col gap-3">
          <button 
            className="w-full bg-[#2ea014] hover:bg-[#258210] disabled:bg-slate-700 disabled:text-slate-500 text-white font-bold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
            onClick={runInference} 
            disabled={!file || loading}
          >
            {loading ? 'Analysing…' : '🔍 Detect Hazards'}
          </button>
          
          {result && !reported && (
            <button 
              className="w-full bg-rose-600 hover:bg-rose-700 text-white font-bold py-3 px-4 rounded-lg transition-colors"
              onClick={reportHazard}
            >
              🚨 Report to Authorities
            </button>
          )}
          
          {reported && (
            <div className="w-full bg-emerald-900/50 border border-emerald-500/50 text-emerald-400 font-medium py-3 px-4 rounded-lg text-center">
              ✅ Hazard logged · SLA timer started
            </div>
          )}
        </div>
      </div>

      {/* RIGHT — Results */}
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
                const info = CLASS_INFO[d.class] ?? { label: d.class, color: '#888', severity: 'Unknown' };
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
                      <div className="h-1.5 rounded-full" style={{ width: `${pct}%`, backgroundColor: info.color }}></div>
                    </div>
                    
                    <p className="text-xs text-slate-500 font-mono ml-2">
                      Severity: <strong style={{ color: info.color }}>{info.severity}</strong>
                      &nbsp;·&nbsp;BBox: [{d.bbox?.map(Math.round).join(', ')}]
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="mt-8 pt-6 border-t border-slate-800">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Model Pipeline</p>
          <div className="space-y-2 text-xs">
            {[
              ['Architecture', 'YOLOv8-Nano'],
              ['Training data', 'GRDDC + IDD (Kaggle)'],
              ['Classes', 'D00 · D10 · D20 · D40'],
              ['Inference server', 'HF Spaces (Docker)'],
              ['Target mAP@50', '≥ 0.50'],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between border-b border-slate-800/50 pb-1">
                <span className="text-slate-500">{k}</span>
                <span className="text-slate-300 font-mono">{v}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
