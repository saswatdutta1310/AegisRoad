import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { contractorApi } from '../services/api'
 
const SpendContext = createContext(null)
 
export function SpendProvider({ children }) {
  const [contractors, setContractors] = useState([])
  const [isLoading,   setIsLoading]   = useState(true)
  const [error,       setError]       = useState(null)
 
  const fetchContractors = useCallback(async () => {
    setIsLoading(true); setError(null)
    try { setContractors(await contractorApi.getAll()) }
    catch { setError('Could not load contractor data.') }
    finally { setIsLoading(false) }
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
