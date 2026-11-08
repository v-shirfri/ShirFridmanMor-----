import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { detectDir } from '../utils'
import './Message.css'

function BotAvatar() {
  return (
    <div className="msg-avatar bot-avatar">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    </div>
  )
}

function getDomain(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, '')
  } catch {
    return url.slice(0, 40)
  }
}

function Sources({ sources }) {
  if (!sources || sources.length === 0) return null
  return (
    <div className="sources">
      <span className="sources-label">Sources</span>
      <div className="sources-list">
        {sources.map((s, i) => {
          const domain = getDomain(s.url)
          const title = s.title && s.title !== s.url ? s.title : domain
          return (
            <a
              key={i}
              href={s.url}
              target="_blank"
              rel="noopener noreferrer"
              className="source-chip"
              title={s.url}
            >
              <span className="source-num">{i + 1}</span>
              <span className="source-title">{title}</span>
              <span className="source-domain">{domain}</span>
            </a>
          )
        })}
      </div>
    </div>
  )
}

export default function Message({ role, content, sources, image, doc_name }) {
  const dir = detectDir(content)

  if (role === 'user') {
    return (
      <div className="msg msg-user">
        <div className="msg-bubble-wrap">
          {image && <img src={image} alt="attachment" className="msg-image" />}
          {doc_name && (
            <div className="msg-doc-chip">
              <span>📄</span>
              <span>{doc_name}</span>
            </div>
          )}
          {content && content.trim() && content.trim() !== ' ' && (
            <div className="msg-bubble" dir={dir}>{content}</div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="msg msg-assistant">
      <BotAvatar />
      <div className="msg-text" dir={dir}>
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            pre({ children }) {
              return <pre className="md-pre" dir="ltr">{children}</pre>
            },
            code({ children, className }) {
              return <code className={`md-code ${className || ''}`} dir="ltr">{children}</code>
            },
          }}
        >
          {content}
        </ReactMarkdown>
        <Sources sources={sources} />
      </div>
    </div>
  )
}
