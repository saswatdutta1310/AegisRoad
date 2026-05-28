import { useState } from 'react'
import Navbar from './components/Navbar'
import HazardMap from './components/Map/HazardMap'
import SpendWatch from './components/SpendWatch/SpendWatch'
import EdgeAI from './components/EdgeAI/EdgeAI'
import AegisChat from './components/Chat/AegisChat'
import { AppProvider } from './context/AppContext'
import { HazardProvider } from './context/HazardContext'
import { SpendProvider } from './context/SpendContext'
import styles from './styles/App.module.css'

export default function App() {
  const [activeTab, setActiveTab] = useState('map')

  return (
    <AppProvider>
      <HazardProvider>
        <SpendProvider>
          <div className={styles.app}>
            <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />
            <main className={styles.main}>
              {activeTab === 'map'    && <HazardMap />}
              {activeTab === 'edgeai' && <EdgeAI />}
              {activeTab === 'spend'  && <SpendWatch />}
            </main>
            <AegisChat />
          </div>
        </SpendProvider>
      </HazardProvider>
    </AppProvider>
  )
}
