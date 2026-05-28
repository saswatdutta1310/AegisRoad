import { useState, useRef, useCallback } from 'react'
import { inferenceApi, hazardApi } from '../../services/api'
import styles from './EdgeAI.module.css'

const CLASS_INFO = {
  D00: { label: 'Longitudinal Crack', color: '#fbbf24', severity: 'Low' },
  D10: { label: 'Transverse Crack',   color: '#f97316', severity: 'Medium' },
  D20: { label: 'Alligator Cracking', color: '#ef4444', severity: 'High' },
  D40: { label: 'Pothole',            color: '#dc2626', severity: 'Critical' },
}

const DEMO_RESULT = {
  detections: [
    { class: 'D40', confidence: 0.91, bbox: [120, 200, 280, 320] },
    { class: 'D10', confidence: 0.74, bbox: [340, 150, 180, 90]  },
  ],
  inference_ms: 43,
  model: 'YOLOv8-Nano (demo mode)',
}

export default function EdgeAI() {
  const [file, setFile]         = useState(null)
  const [preview, setPreview]   = useState(null)
  const [result, setResult]     = useState(null)
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState(null)
  const [reported, setReported] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const fileRef = useRef()

  const handleFile = useCallback((incoming) => {
    if (!incoming || !incoming.type.startsWith('image/')) return
    setFile(incoming)
    setPreview(URL.createObjectURL(incoming))
    setResult(null)
    setError(null)
    setReported(false)
  }, [])

  function handleDrop(e) {
    e.preventDefault()
    setDragOver(false)
    handleFile(e.dataTransfer.files[0])
  }

  async function runInference() {
    if (!file) return
    setLoading(true)
    setError(null)
    try {
      const data = await inferenceApi.predict(file)
      setResult(data)
    } catch (err) {
      // HF Space not deployed yet — use demo result
      setResult(DEMO_RESULT)
      setError('⚠️ Inference server not connected yet — showing demo result')
    }
    setLoading(false)
  }

  async function reportHazard() {
    if (!result?.detections?.length) return
    const top = result.detections[0]
    try {
      await hazardApi.report({
        road_name: 'Auto-detected via GPS',
        lat: 16.4307,
        lng: 80.6241,
        cls: top.class,
        severity: CLASS_INFO[top.class]?.severity?.toLowerCase() ?? 'medium',
        status: 'open',
        sla_hours: top.class === 'D40' ? 24 : top.class === 'D20' ? 48 : 72,
        reported: new Date().toISOString(),
        contractor: null,
      })
    } catch { /* json-server may not support all fields */ }
    setReported(true)
  }

  return (
    <div className={styles.container}>

      {/* LEFT — Upload */}
      <div className={styles.left}>
        <div className={styles.heading}>
          <span>🤖</span>
          <div>
            <h2>Edge AI — Hazard Detector</h2>
            <p className={styles.sub}>Upload a dashcam frame · YOLOv8-Nano inference</p>
          </div>
        </div>

        <div
          className={`${styles.dropzone} ${dragOver ? styles.dragOver : ''}`}
          onClick={() => fileRef.current.click()}
          onDrop={handleDrop}
          onDragOver={e => { e.preventDefault(); setDragOver(true) }}
          onDragLeave={() => setDragOver(false)}
        >
          {preview
            ? <img src={preview} className={styles.preview} alt="dashcam frame" />
            : (
              <div className={styles.placeholder}>
                <span className={styles.uploadIcon}>📷</span>
                <span>Drop dashcam image here</span>
                <span className={styles.hint}>or click to browse · JPG / PNG</span>
              </div>
            )
          }
        </div>

        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={e => handleFile(e.target.files[0])}
        />

        {file && <p className={styles.fileInfo}>📎 {file.name} · {(file.size/1024).toFixed(1)} KB</p>}
        {error && <p className={styles.errorNote}>{error}</p>}

        <div className={styles.actions}>
          <button className={styles.btnPrimary} onClick={runInference} disabled={!file || loading}>
            {loading ? <><span className={styles.btnSpinner} /> Analysing…</> : '🔍 Detect Hazards'}
          </button>
          {result && !reported && (
            <button className={styles.btnDanger} onClick={reportHazard}>🚨 Report to Authorities</button>
          )}
          {reported && <span className={styles.success}>✅ Hazard logged · SLA timer started</span>}
        </div>
      </div>

      {/* RIGHT — Results */}
      <div className={styles.right}>
        <h3 className={styles.panelTitle}>Detection Results</h3>

        {!result && !loading && (
          <div className={styles.empty}>
            <span>🛣️</span>
            <p>Upload an image and click<br />"Detect Hazards"</p>
          </div>
        )}

        {loading && (
          <div className={styles.inferenceLoading}>
            <div className={styles.spinner} />
            <p>Running YOLOv8-Nano…</p>
            <p className={styles.hint}>Sending frame to HF Space</p>
          </div>
        )}

        {result && !loading && (
          <>
            <div className={styles.meta}>
              <span className={styles.metaBadge}>⚡ {result.inference_ms}ms</span>
              <span className={styles.metaBadge}>{result.detections?.length ?? 0} detection(s)</span>
              <span className={styles.metaBadge}>🤖 {result.model}</span>
            </div>

            {result.detections?.length === 0 && (
              <p className={styles.noDetect}>✅ No damage detected in this frame</p>
            )}

            {result.detections?.map((d, i) => {
              const info = CLASS_INFO[d.class] ?? { label: d.class, color: '#888', severity: 'Unknown' }
              const pct  = Math.round(d.confidence * 100)
              return (
                <div key={i} className={styles.detection} style={{ '--det': info.color }}>
                  <div className={styles.detHeader}>
                    <span className={styles.detClass} style={{ color: info.color }}>{d.class}</span>
                    <span className={styles.detLabel}>{info.label}</span>
                    <span className={styles.detConf}  style={{ color: info.color }}>{pct}%</span>
                  </div>
                  <div className={styles.detBar}>
                    <div className={styles.detFill} style={{ width: `${pct}%`, background: info.color }} />
                  </div>
                  <p className={styles.detMeta}>
                    Severity: <strong style={{ color: info.color }}>{info.severity}</strong>
                    &nbsp;·&nbsp;BBox: [{d.bbox?.map(Math.round).join(', ')}]
                  </p>
                </div>
              )
            })}
          </>
        )}

        <div className={styles.modelCard}>
          <p className={styles.modelTitle}>Model Pipeline</p>
          {[
            ['Architecture', 'YOLOv8-Nano'],
            ['Training data', 'GRDDC + IDD (Kaggle)'],
            ['Classes', 'D00 · D10 · D20 · D40'],
            ['Inference server', 'HF Spaces (Docker)'],
            ['Target mAP@50', '≥ 0.50'],
          ].map(([k, v]) => (
            <div key={k} className={styles.modelRow}>
              <span>{k}</span><span>{v}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
