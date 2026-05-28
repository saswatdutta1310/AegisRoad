import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import axios from 'axios'

const HazardContext = createContext(null)

const BASE = 'http://localhost:3001'

export function HazardProvider({ children }) {
  const [hazards, setHazards]     = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError]         = useState(null)
  const [filter, setFilter]       = useState('all')

  const fetchHazards = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const res = await axios.get(`${BASE}/hazards`)
      setHazards(Array.isArray(res.data) ? res.data : res.data.hazards ?? [])
    } catch (err) {
      setError('Could not load hazard data — showing cached data.')
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchHazards()
    const id = setInterval(fetchHazards, 30000)
    return () => clearInterval(id)
  }, [fetchHazards])

  const filtered = filter === 'all' ? hazards : hazards.filter(h => h.cls === filter)

  return (
    <HazardContext.Provider value={{ hazards, filtered, isLoading, error, filter, setFilter, refetch: fetchHazards }}>
      {children}
    </HazardContext.Provider>
  )
}

export const useHazards = () => {
  const ctx = useContext(HazardContext)
  if (!ctx) throw new Error('useHazards must be inside HazardProvider')
  return ctx
}
