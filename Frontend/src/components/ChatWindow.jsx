import { useEffect, useRef } from 'react'
import Message from './Message'
import './ChatWindow.css'

function BotAvatarInline() {
  return (
    <div className="msg-avatar bot-avatar">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    </div>
  )
}

export default function ChatWindow({ messages, loading }) {
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  return (
    <div className="chat-window">
      <div className="chat-messages">
        {messages.map((msg, i) => (
          <Message key={i} role={msg.role} content={msg.content} sources={msg.sources} image={msg.image} doc_name={msg.doc_name} />
        ))}
        {loading && (
          <div className="msg msg-assistant">
            <BotAvatarInline />
            <div className="loading-content">
              <div className="thinking-indicator">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                Thinking…
              </div>
              <div className="typing-dots">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>
    </div>
  )
}
