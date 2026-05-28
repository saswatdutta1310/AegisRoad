import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { INITIAL_CONTRACTOR_HEALTH } from '../data'
import { contractorApi } from '../services/api'

const SpendContext = createContext(null)

export function SpendProvider({ children }) {
  const [contractors, setContractors] = useState(INITIAL_CONTRACTOR_HEALTH)
  const [isLoading,   setIsLoading]   = useState(false)
  const [error,       setError]       = useState(null)

  const fetchContractors = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const remote = await contractorApi.getAll()
      if (remote?.length) setContractors(remote)
    } catch {
      setError('Using offline contractor data (start backend for live sync).')
    } finally {
      setIsLoading(false)
    }
  }, [])
 
  useEffect(() => { fetchContractors() }, [fetchContractors])
 
  const totalBudget = contractors.reduce((s,c) => s+(c.budget||0), 0)
  const totalSpent  = contractors.reduce((s,c) => s+(c.spent||0),  0)
  const avgScore = contractors.length
    ? Math.round(contractors.reduce((s,c) => s+c.score,0)/contractors.length) : 0
 
  return (
    <SpendContext.Provider value={{
      contractors, isLoading, error, totalBudget, totalSpent, avgScore,
      refetch: fetchContractors
    }}>
      {children}
    </SpendContext.Provider>
  )
}
 
export const useSpend = () => {
  const ctx = useContext(SpendContext)
  if (!ctx) throw new Error('useSpend must be inside SpendProvider')
  return ctx
}
