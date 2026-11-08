import { useState, useEffect, useRef } from 'react'
import { getStoredTheme, applyTheme } from '../utils'
import './SettingsModal.css'

const THEME_OPTIONS = [
  { value: 'classic', label: 'Light' },
  { value: 'dark',    label: 'Dark' },
  { value: 'system',  label: 'System' },
  { value: 'pink',    label: 'Pink' },
]

const EFFORT_OPTIONS = [
  { value: 'fast',     label: '⚡ Fast',     desc: 'Quick responses' },
  { value: 'standard', label: '◎ Standard',  desc: 'Balanced (default)' },
  { value: 'deep',     label: '🔍 Deep',     desc: 'More thorough reasoning' },
]

const TABS = ['Appearance', 'Chat', 'About']

export default function SettingsModal({ effort, onEffortChange, onClose }) {
  const [tab, setTab] = useState('Appearance')
  const [theme, setTheme] = useState(getStoredTheme)
  const overlayRef = useRef(null)

  useEffect(() => {
    function handleKey(e) { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [onClose])

  function handleThemeChange(value) {
    setTheme(value)
    applyTheme(value)
  }

  async function requestMic() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      stream.getTracks().forEach((t) => t.stop())
      setMicStatus('granted')
    } catch {
      setMicStatus('denied')
    }
  }

  return (
    <div className="settings-overlay" ref={overlayRef} onClick={(e) => { if (e.target === overlayRef.current) onClose() }}>
      <div className="settings-modal" role="dialog" aria-modal="true" aria-label="Settings">
        <div className="settings-header">
          <h2 className="settings-title">Settings</h2>
          <button className="settings-close" onClick={onClose} type="button" title="Close">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <nav className="settings-tabs">
          {TABS.map((t) => (
            <button
              key={t}
              className={`settings-tab ${tab === t ? 'active' : ''}`}
              onClick={() => setTab(t)}
              type="button"
            >
              {t}
            </button>
          ))}
        </nav>

        <div className="settings-body">
          {tab === 'Appearance' && (
            <section>
              <h3 className="settings-section-title">Theme</h3>
              <div className="settings-options">
                {THEME_OPTIONS.map((o) => (
                  <label key={o.value} className={`settings-option ${theme === o.value ? 'selected' : ''}`}>
                    <input
                      type="radio"
                      name="theme"
                      value={o.value}
                      checked={theme === o.value}
                      onChange={() => handleThemeChange(o.value)}
                    />
                    {o.label}
                  </label>
                ))}
              </div>
            </section>
          )}

          {tab === 'Chat' && (
            <section>
              <h3 className="settings-section-title">Default thinking effort</h3>
              <div className="settings-effort">
                {EFFORT_OPTIONS.map((o) => (
                  <label key={o.value} className={`settings-effort-option ${effort === o.value ? 'selected' : ''}`}>
                    <input
                      type="radio"
                      name="effort"
                      value={o.value}
                      checked={effort === o.value}
                      onChange={() => onEffortChange(o.value)}
                    />
                    <span className="effort-label">{o.label}</span>
                    <span className="effort-desc">{o.desc}</span>
                  </label>
                ))}
              </div>
              <p className="settings-hint">
                This controls the AI's reasoning depth. "Fast" uses a lower temperature for quick answers;
                "Deep" uses a higher search context and more model calls for thorough responses.
                The effort selector in the composer overrides this setting per message.
              </p>
            </section>
          )}

          {tab === 'About' && (
            <section className="settings-about">
              <div className="about-app-name">ChatAI</div>
              <p className="about-desc">An intelligent AI assistant powered by OpenAI's API.</p>
              <dl className="about-details">
                <dt>Version</dt>   <dd>1.0.0</dd>
                <dt>Developer</dt> <dd>Shir Fridman Mor</dd>
                <dt>Built with</dt><dd>React · FastAPI · MySQL · OpenAI API</dd>
                <dt>AI model</dt>  <dd>gpt-4o (configurable via OPENAI_MODEL)</dd>
              </dl>
            </section>
          )}
        </div>
      </div>
    </div>
  )
}
