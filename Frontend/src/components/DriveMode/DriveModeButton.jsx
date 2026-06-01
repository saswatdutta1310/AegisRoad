import { useState } from 'react'
import DriveMode from './DriveMode'

export default function DriveModeButton({ hazards = [] }) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 cursor-pointer"
        style={{
          padding: '6px 10px',
          borderRadius: 6,
          border: 'none',
          background: 'linear-gradient(135deg, #ef4444, #dc2626)',
          boxShadow: '0 0 14px rgba(239,68,68,0.45)',
          animation: 'pulse-red 2s infinite',
          fontSize: 10,
          fontWeight: 700,
          color: '#fff',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
        }}
      >
        <span style={{ fontSize: 12 }}>🚗</span>
        Drive Mode
        <span style={{
          fontSize: 8,
          background: 'rgba(255,255,255,0.22)',
          padding: '1px 4px',
          borderRadius: 3,
          letterSpacing: '0.08em',
        }}>
          LIVE
        </span>
      </button>

      {open && <DriveMode hazards={hazards} onClose={() => setOpen(false)} />}

      <style>{`
        @keyframes pulse-red {
          0%,100% { box-shadow: 0 0 14px rgba(239,68,68,0.4); }
          50%      { box-shadow: 0 0 26px rgba(239,68,68,0.85); }
        }
        @keyframes fadeInScale {
          from { opacity:0; transform:scale(0.94); }
          to   { opacity:1; transform:scale(1); }
        }
        @keyframes pulse-icon {
          0%,100% { transform: scale(1); }
          50%      { transform: scale(1.18); }
        }
      `}</style>
    </>
  )
}