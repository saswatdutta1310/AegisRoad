import { useSpend } from '../../context/SpendContext'
import { useHazards } from '../../context/HazardContext'
import styles from './SpendWatch.module.css'

const STATUS_META = {
  overdue:     { label: 'Overdue',     color: '#ef4444' },
  in_progress: { label: 'In Progress', color: '#fbbf24' },
  resolved:    { label: 'Resolved',    color: '#6ee7b7' },
  open:        { label: 'Open',        color: '#9099b2' },
}

function ScoreBar({ score }) {
  const color = score >= 80 ? '#6ee7b7' : score >= 60 ? '#fbbf24' : '#ef4444'
  return (
    <div className={styles.scoreWrap}>
      <div className={styles.scoreBg}>
        <div className={styles.scoreFill} style={{ width: `${score}%`, background: color }} />
      </div>
      <span style={{ color, fontSize: 12, fontWeight: 700, minWidth: 24 }}>{score}</span>
    </div>
  )
}

function Skeleton() {
  return (
    <div className={styles.skeleton}>
      {[1,2,3,4,5].map(i => <div key={i} className={styles.skeletonRow} />)}
    </div>
  )
}

export default function SpendWatch() {
  const { contractors, isLoading: cLoad, error: cErr, totalBudget, totalSpent, avgScore } = useSpend()
  const { hazards, isLoading: hLoad } = useHazards()

  const open     = hazards.filter(h => h.status === 'open').length
  const overdue  = hazards.filter(h => h.status === 'overdue').length
  const resolved = hazards.filter(h => h.status === 'resolved').length

  return (
    <div className={styles.container}>

      <div className={styles.header}>
        <h2>SpendWatch — Public Accountability Ledger</h2>
        <p className={styles.sub}>Live contractor performance · SLA compliance · Budget transparency</p>
        {cErr && <p className={styles.errorNote}>⚠️ {cErr}</p>}
      </div>

      {/* KPI strip */}
      <div className={styles.kpis}>
        <div className={styles.kpi}><span className={styles.kpiVal}>₹{totalBudget}L</span><span className={styles.kpiLabel}>Total Budget</span></div>
        <div className={styles.kpi}><span className={styles.kpiVal}>₹{totalSpent}L</span><span className={styles.kpiLabel}>Amount Spent</span></div>
        <div className={styles.kpi}><span className={styles.kpiVal} style={{ color:'#ef4444' }}>{open}</span><span className={styles.kpiLabel}>Open Hazards</span></div>
        <div className={styles.kpi}><span className={styles.kpiVal} style={{ color:'#f97316' }}>{overdue}</span><span className={styles.kpiLabel}>Overdue SLAs</span></div>
        <div className={styles.kpi}><span className={styles.kpiVal} style={{ color:'#6ee7b7' }}>{resolved}</span><span className={styles.kpiLabel}>Resolved</span></div>
        <div className={styles.kpi}><span className={styles.kpiVal}>{avgScore}</span><span className={styles.kpiLabel}>Avg Score</span></div>
      </div>

      <div className={styles.grid}>

        {/* Contractor table */}
        <div className={styles.panel}>
          <h3 className={styles.panelTitle}>Contractor Rankings</h3>
          {cLoad ? <Skeleton /> : (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Contractor</th>
                  <th>District</th>
                  <th>Efficiency Score</th>
                  <th>Avg Repair</th>
                  <th>Budget</th>
                  <th>Open SLAs</th>
                </tr>
              </thead>
              <tbody>
                {[...contractors].sort((a,b) => b.score - a.score).map(c => (
                  <tr key={c.id} className={styles.row}>
                    <td>{c.name}</td>
                    <td className={styles.dim}>{c.district}</td>
                    <td><ScoreBar score={c.score} /></td>
                    <td className={styles.dim}>{c.avg_days}d</td>
                    <td className={styles.dim}>₹{c.budget}L</td>
                    <td><span style={{ color: c.active_sla > 2 ? '#ef4444' : '#fbbf24', fontWeight: 700 }}>{c.active_sla}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* SLA tracker */}
        <div className={styles.panel}>
          <h3 className={styles.panelTitle}>Live Hazard SLA Tracker</h3>
          {hLoad ? <Skeleton /> : (
            <div className={styles.slaList}>
              {hazards.map(h => {
                const meta = STATUS_META[h.status] ?? STATUS_META.open
                return (
                  <div key={h.id} className={styles.slaCard}>
                    <div className={styles.slaTop}>
                      <span className={styles.slaRoad}>{h.road_name}</span>
                      <span className={styles.slaStatus} style={{ color: meta.color, borderColor: meta.color }}>
                        {meta.label}
                      </span>
                    </div>
                    <div className={styles.slaMeta}>
                      <span>Class {h.cls}</span>
                      <span>·</span>
                      <span>SLA {h.sla_hours}h</span>
                      <span>·</span>
                      <span>{new Date(h.reported).toLocaleDateString('en-IN')}</span>
                    </div>
                    {h.contractor && <p className={styles.slaContractor}>👷 {h.contractor}</p>}
                  </div>
                )
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
