import ChatWindow from '../components/ChatWindow'
import MessageInput from '../components/MessageInput'
import WelcomeScreen from '../components/WelcomeScreen'
import './HomePage.css'

function IconHamburger() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  )
}

export default function HomePage({ messages, loading, error, onSend, sidebarOpen, onToggleSidebar, focusKey, effort, onEffortChange }) {
  const hasContent = messages.length > 0 || loading

  return (
    <div className="chat-page">
      <header className="chat-page-header">
        {!sidebarOpen && (
          <button className="header-toggle-btn" onClick={onToggleSidebar} title="Open sidebar">
            <IconHamburger />
          </button>
        )}
      </header>

      <div className="conversation-area">
        {hasContent ? (
          <ChatWindow messages={messages} loading={loading} />
        ) : (
          <WelcomeScreen onSend={onSend} disabled={loading} />
        )}
      </div>

      <div className="input-area">
        {error && <p className="error-banner">{error}</p>}
        <MessageInput
          onSend={onSend}
          disabled={loading}
          focusKey={focusKey}
          effort={effort}
          onEffortChange={onEffortChange}
        />
        <p className="input-hint">ChatAI can make mistakes. Consider checking important information.</p>
      </div>
    </div>
  )
}
