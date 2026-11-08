import { useState, useRef, useEffect } from 'react'
import { detectDir } from '../utils'
import ThinkingSelector from './ThinkingSelector'
import './MessageInput.css'

const MAX_IMAGE_PX = 2048
const MAX_FILE_MB = 50

function resizeImage(file) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      URL.revokeObjectURL(url)
      const ratio = Math.min(MAX_IMAGE_PX / img.width, MAX_IMAGE_PX / img.height, 1)
      const canvas = document.createElement('canvas')
      canvas.width = Math.round(img.width * ratio)
      canvas.height = Math.round(img.height * ratio)
      canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height)
      resolve(canvas.toDataURL('image/jpeg', 0.85))
    }
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Invalid image')) }
    img.src = url
  })
}

export default function MessageInput({ onSend, disabled, focusKey = 0, effort = 'standard', onEffortChange }) {
  const [text, setText] = useState('')
  const [textDir, setTextDir] = useState('ltr')
  const [image, setImage] = useState(null)
  const [attachError, setAttachError] = useState('')

  const textareaRef = useRef(null)
  const fileRef = useRef(null)

  useEffect(() => {
    const ta = textareaRef.current
    if (!ta) return
    ta.style.height = 'auto'
    ta.style.height = Math.min(ta.scrollHeight, 200) + 'px'
  }, [text])

  useEffect(() => {
    if (!disabled) textareaRef.current?.focus()
  }, [disabled])

  useEffect(() => {
    textareaRef.current?.focus()
  }, [focusKey])

  async function handleFileChange(e) {
    setAttachError('')
    const file = e.target.files?.[0]
    if (!file) return
    e.target.value = ''

    const isImage = file.type.startsWith('image/')

    if (!isImage) {
      setAttachError('Only images are supported.')
      return
    }
    if (file.size > MAX_FILE_MB * 1024 * 1024) {
      setAttachError(`File must be smaller than ${MAX_FILE_MB} MB.`)
      return
    }

    try { 
      setImage(await resizeImage(file)) 
    } catch { 
      setAttachError('Could not read the image file.') 
    }
  }

  function handleChange(e) {
    const val = e.target.value
    setText(val)
    setTextDir(detectDir(val))
  }

  function handleSubmit() {
    const trimmed = text.trim()
    if ((!trimmed && !image) || disabled) return
    onSend(trimmed || ' ', image)
    setText(''); setTextDir('ltr'); setImage(null); setAttachError('')
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit() }
  }

  function handlePaste(e) {
    const item = Array.from(e.clipboardData?.items || []).find(i => i.type.startsWith('image/'))
    if (!item) return
    e.preventDefault()
    const file = item.getAsFile()
    if (file) resizeImage(file).then(setImage).catch(() => {})
  }

  const canSend = (text.trim().length > 0 || !!image) && !disabled

  return (
    <div className="composer">
      {attachError && <p className="composer-image-error">{attachError}</p>}

      {image && (
        <div className="composer-image-preview">
          <img src={image} alt="attachment" />
          <button className="composer-image-remove" onClick={() => setImage(null)} type="button" title="Remove">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      )}

      <div className={`composer-box ${disabled ? 'composer-disabled' : ''}`}>
        <button
          className="composer-attach-btn"
          onClick={() => fileRef.current?.click()}
          type="button"
          title="Attach image (PNG, JPG, WebP)"
          disabled={disabled}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          style={{ display: 'none' }}
          onChange={handleFileChange}
        />

        <textarea
          ref={textareaRef}
          className="composer-textarea"
          value={text}
          dir={textDir}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
          placeholder={image ? 'Ask about this image…' : 'Message ChatAI'}
          disabled={disabled}
          rows={1}
        />

        <div className="composer-actions">
          {onEffortChange && <ThinkingSelector effort={effort} onChange={onEffortChange} />}
          <button
            className={`composer-send-btn ${canSend ? 'can-send' : ''}`}
            onClick={handleSubmit}
            disabled={!canSend}
            type="button"
            title="Send"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="19" x2="12" y2="5" /><polyline points="5 12 12 5 19 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}