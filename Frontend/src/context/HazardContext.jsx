import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { INITIAL_HAZARDS } from '../data'
import { hazardApi } from '../services/api'

const HazardContext = createContext(null)

const isBackendId = (id) => /^\d+$/.test(String(id))

export function HazardProvider({ children }) {
  const [hazards,   setHazards]   = useState(INITIAL_HAZARDS)
  const [isLoading, setIsLoading] = useState(false)
  const [error,     setError]     = useState(null)
  const [filter,    setFilter]    = useState('all')

  const fetchHazards = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const remote = await hazardApi.getAll()
      if (remote?.length) setHazards(remote)
    } catch {
      setError('Using offline demo hazard data (start backend for live sync).')
    } finally {
      setIsLoading(false)
    }
  }, [])
 
  useEffect(() => {
    fetchHazards()
    const id = setInterval(fetchHazards, 30_000)
    return () => clearInterval(id)
  }, [fetchHazards])
 
  const filtered = filter === 'all'
    ? hazards : hazards.filter(h => h.cls===filter || h.severity===filter)
 
  const addHazard = useCallback(async (data) => {
    const tempId = `TEMP-${Date.now()}`
    setHazards(prev => [{ ...data, id: tempId,
      reportedTimeAgo: '1m ago', cls: data.cls||'D40',
      status: 'open' }, ...prev])
    try {
      const saved = await hazardApi.create(data)
      setHazards(prev => prev.map(h => h.id===tempId ? saved : h))
    } catch { /* keep optimistic entry */ }
  }, [])
 
  const modifyHazard = useCallback(async (id, updates) => {
    setHazards(prev => prev.map(h => h.id===id ? {...h,...updates} : h))
    if (!isBackendId(id)) return
    try {
      await hazardApi.update(id, updates)
    } catch { /* keep optimistic entry */ }
  }, [])
 
  return (
    <HazardContext.Provider value={{
      hazards, filtered, isLoading, error, filter,
      setFilter, refetch: fetchHazards, addHazard, modifyHazard
    }}>
      {children}
    </HazardContext.Provider>
  )
}
 
export const useHazards = () => {
  const ctx = useContext(HazardContext)
  if (!ctx) throw new Error('useHazards must be inside HazardProvider')
  return ctx
}
