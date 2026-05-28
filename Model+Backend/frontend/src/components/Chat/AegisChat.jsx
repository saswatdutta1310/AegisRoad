import { useState, useRef, useEffect } from 'react'
import { useApp } from '../../context/AppContext'
import styles from './AegisChat.module.css'

const SYSTEM = `You are AegisChat, the AI assistant for AegisRoad — a civic road safety platform for India and BIMSTEC countries.
You help citizens with:
- Querying road conditions and pothole reports
- Understanding contractor accountability and SLA compliance
- Explaining road damage classes: D00 (longitudinal cracks), D10 (transverse cracks), D20 (alligator cracking), D40 (potholes)
- Filing hazard reports and checking repair status
- Understanding the SpendWatch transparency ledger
Be concise, helpful, and civic-minded.`

export default function AegisChat() {
  const { chatOpen, setChatOpen } = useApp()
  const [messages, setMessages] = useState([
    { role: 'assistant', content: "👋 I'm AegisChat. Ask me about road conditions, contractor accountability, or how to report a hazard." }
  ])
  const [input, setInput]     = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef()

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function sendMessage() {
    const text = input.trim()
    if (!text || loading) return
    setInput('')

    const updated = [...messages, { role: 'user', content: text }]
    setMessages(updated)
    setLoading(true)

    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1000,
          system: SYSTEM,
          messages: updated.map(m => ({ role: m.role, content: m.content })),
        }),
      })
      const data = await res.json()
      const reply = data.content?.[0]?.text || 'Sorry, no response received.'
      setMessages([...updated, { role: 'assistant', content: reply }])
    } catch {
      setMessages([...updated, { role: 'assistant', content: '⚠️ Connection error. Please try again.' }])
    }
    setLoading(false)
  }

  return (
    <>
      <button className={styles.fab} onClick={() => setChatOpen(o => !o)} aria-label="Toggle AegisChat">
        {chatOpen ? '✕' : '💬'}
      </button>

      {chatOpen && (
        <div className={styles.window}>
          <div className={styles.header}>
            <span className={styles.dot} />
            <strong>AegisChat</strong>
            <span className={styles.badge}>AI</span>
            <button className={styles.closeBtn} onClick={() => setChatOpen(false)}>✕</button>
          </div>

          <div className={styles.messages}>
            {messages.map((m, i) => (
              <div key={i} className={`${styles.msg} ${m.role === 'user' ? styles.user : styles.bot}`}>
                {m.content}
              </div>
            ))}
            {loading && (
              <div className={`${styles.msg} ${styles.bot} ${styles.typing}`}>
                <span /><span /><span />
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          <div className={styles.inputRow}>
            <input
              className={styles.input}
              value={input}
              placeholder="Ask about road conditions…"
              disabled={loading}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && sendMessage()}
            />
            <button className={styles.send} onClick={sendMessage} disabled={loading || !input.trim()}>➤</button>
          </div>
        </div>
      )}
    </>
  )
}
