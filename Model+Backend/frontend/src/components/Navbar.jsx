import styles from '../styles/Navbar.module.css'

const tabs = [
  { id: 'map',    label: '🗺️ Hazard Map' },
  { id: 'edgeai', label: '🤖 Edge AI' },
  { id: 'spend',  label: '📊 SpendWatch' },
]

export default function Navbar({ activeTab, setActiveTab }) {
  return (
    <nav className={styles.nav}>
      <div className={styles.brand}>
        <span className={styles.logo}>🛡️</span>
        <span className={styles.title}>AegisRoad</span>
        <span className={styles.version}>v3.0</span>
      </div>
      <div className={styles.tabs}>
        {tabs.map(t => (
          <button
            key={t.id}
            className={`${styles.tab} ${activeTab === t.id ? styles.active : ''}`}
            onClick={() => setActiveTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>
    </nav>
  )
}
