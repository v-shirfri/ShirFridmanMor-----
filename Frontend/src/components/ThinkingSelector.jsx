import { useState, useEffect, useRef } from 'react'
import './ThinkingSelector.css'

const LEVELS = [
  {
    value: 'fast',
    label: 'Fast',
    desc: 'Quick responses, lower reasoning depth',
    icon: '⚡',
  },
  {
    value: 'standard',
    label: 'Standard',
    desc: 'Balanced quality and speed (default)',
    icon: '◎',
  },
  {
    value: 'deep',
    label: 'Deep',
    desc: 'More thorough reasoning and research',
    icon: '🔍',
  },
]

export default function ThinkingSelector({ effort, onChange }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    function handle(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handle)
    return () => document.removeEventListener('mousedown', handle)
  }, [])

  const current = LEVELS.find((l) => l.value === effort) || LEVELS[1]

  function select(value) {
    onChange(value)
    setOpen(false)
  }

  return (
    <div className="thinking-selector" ref={ref}>
      <button
        className={`thinking-trigger ${open ? 'open' : ''} effort-${effort}`}
        onClick={() => setOpen((o) => !o)}
        type="button"
        title="Thinking effort"
      >
        <span className="thinking-icon">{current.icon}</span>
        <span className="thinking-label">{current.label}</span>
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {open && (
        <div className="thinking-popover">
          <p className="thinking-popover-title">Thinking effort</p>
          {LEVELS.map((l) => (
            <button
              key={l.value}
              className={`thinking-option ${effort === l.value ? 'selected' : ''}`}
              onClick={() => select(l.value)}
              type="button"
            >
              <span className="thinking-option-icon">{l.icon}</span>
              <div className="thinking-option-text">
                <span className="thinking-option-label">{l.label}</span>
                <span className="thinking-option-desc">{l.desc}</span>
              </div>
              {effort === l.value && (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
