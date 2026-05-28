import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet'
import { useHazards } from '../../context/HazardContext'
import styles from './HazardMap.module.css'

const COLORS = { D00: '#fbbf24', D10: '#f97316', D20: '#ef4444', D40: '#dc2626' }
const LABELS = { D00: 'Longitudinal Crack', D10: 'Transverse Crack', D20: 'Alligator Cracking', D40: 'Pothole (Critical)' }
const RADIUS = { D40: 14, D20: 11, D10: 8, D00: 6 }

export default function HazardMap() {
  const { filtered, isLoading, error, filter, setFilter } = useHazards()

  return (
    <div className={styles.container}>

      {/* Filter bar */}
      <div className={styles.filters}>
        {['all', 'D40', 'D20', 'D10', 'D00'].map(f => (
          <button
            key={f}
            className={`${styles.chip} ${filter === f ? styles.active : ''}`}
            style={f !== 'all' ? { '--chip-color': COLORS[f] } : {}}
            onClick={() => setFilter(f)}
          >
            {f === 'all' ? 'All Hazards' : LABELS[f]}
          </button>
        ))}
        <span className={styles.count}>
          {isLoading ? '⏳ Loading...' : `${filtered.length} hazard(s) on map`}
        </span>
      </div>

      {/* Error banner */}
      {error && <div className={styles.errorBanner}>⚠️ {error}</div>}

      {/* Loading overlay */}
      {isLoading && (
        <div className={styles.loadingOverlay}>
          <div className={styles.spinner} />
          <span>Fetching live hazard data…</span>
        </div>
      )}

      {/* Map */}
      <MapContainer center={[16.4307, 80.6241]} zoom={10} className={styles.map}>
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://carto.com">CARTO</a>'
        />
        {filtered.map(h => (
          <CircleMarker
            key={h.id}
            center={[h.lat, h.lng]}
            radius={RADIUS[h.cls] ?? 8}
            color={COLORS[h.cls] ?? '#888'}
            fillColor={COLORS[h.cls] ?? '#888'}
            fillOpacity={0.8}
            weight={2}
          >
            <Popup>
              <div className={styles.popup}>
                <span className={styles.badge} style={{ background: COLORS[h.cls] }}>{h.cls}</span>
                <strong>{LABELS[h.cls]}</strong>
                <p>📍 {h.road_name}</p>
                <p>🔴 Status: <b>{h.status}</b></p>
                <p>⏱️ SLA: repair within {h.sla_hours}h</p>
                {h.contractor && <p>👷 {h.contractor}</p>}
              </div>
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>

      {/* Legend */}
      <div className={styles.legend}>
        {Object.entries(COLORS).map(([cls, color]) => (
          <span key={cls} className={styles.legendItem}>
            <span className={styles.dot} style={{ background: color }} />
            {cls} — {LABELS[cls]}
          </span>
        ))}
      </div>

    </div>
  )
}
