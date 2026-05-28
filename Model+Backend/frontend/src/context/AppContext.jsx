import { createContext, useContext, useState } from 'react'

const AppContext = createContext(null)

export function AppProvider({ children }) {
  const [chatOpen, setChatOpen] = useState(false)
  return (
    <AppContext.Provider value={{ chatOpen, setChatOpen }}>
      {children}
    </AppContext.Provider>
  )
}

export const useApp = () => useContext(AppContext)
