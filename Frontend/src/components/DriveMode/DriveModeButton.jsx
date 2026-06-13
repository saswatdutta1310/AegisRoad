export default function DriveModeButton({ hazards = [], onNavigate }) {
  return (
    <>
      <button
        onClick={() => onNavigate?.('drivemode')}
        className="flex items-center gap-1.5 cursor-pointer transition-all"
        style={{
          padding: '6px 12px',
          borderRadius: 8,
          background: 'linear-gradient(135deg,#dc2626,#b91c1c)',
          boxShadow: '0 0 14px rgba(220,38,38,0.4)',
          animation: 'pulse-drive 2s infinite',
          fontSize: 10,
          fontWeight: 900,
          color: '#fff',
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          fontFamily: "'Barlow Condensed', sans-serif",
          border: 'none',
        }}
      >
        <span style={{ fontSize:13 }}>🚗</span>
        Drive Mode
        <span style={{ fontSize:8, background:'rgba(255,255,255,0.2)', padding:'1px 5px', borderRadius:4, letterSpacing:'0.1em' }}>LIVE</span>
      </button>

      <style>{`
        @keyframes pulse-drive {
          0%,100%{ box-shadow:0 0 14px rgba(220,38,38,0.4); }
          50%     { box-shadow:0 0 28px rgba(220,38,38,0.8); }
        }
      `}</style>
    </>
  )
}
