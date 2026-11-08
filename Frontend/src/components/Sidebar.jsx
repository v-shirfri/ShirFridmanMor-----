import { useState } from 'react'
import SearchModal from './SearchModal'
import './Sidebar.css'

function IconSidebar() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <path d="M9 3v18" />
    </svg>
  )
}

function IconNewChat() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
    </svg>
  )
}

function IconSearch() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  )
}

function IconSettings() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  )
}

export default function Sidebar({ isOpen, conversations, activeId, onToggle, onNewChat, onSelectConversation, onOpenSettings }) {
  const [searchOpen, setSearchOpen] = useState(false)

  return (
    <>
      <aside className={`sidebar ${isOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-top">
          <button className="sidebar-icon-btn" onClick={onToggle} title="Toggle sidebar">
            <IconSidebar />
          </button>
          <button className="sidebar-icon-btn" onClick={onNewChat} title="New chat">
            <IconNewChat />
          </button>
        </div>

        <div className="sidebar-nav">
          <button className="sidebar-nav-btn" onClick={onNewChat} type="button">
            <IconNewChat />
            <span>New chat</span>
          </button>
          <button className="sidebar-nav-btn" onClick={() => setSearchOpen(true)} type="button">
            <IconSearch />
            <span>Search chats</span>
          </button>
        </div>

        <div className="sidebar-section-label">Recents</div>

        <div className="sidebar-conversations">
          {conversations.length === 0 ? (
            <p className="sidebar-empty">No conversations yet</p>
          ) : (
            conversations.map((conv) => (
              <button
                key={conv.id}
                className={`conv-item ${conv.id === activeId ? 'active' : ''}`}
                onClick={() => onSelectConversation(conv.id)}
                title={conv.title}
              >
                <span className="conv-title">{conv.title}</span>
              </button>
            ))
          )}
        </div>

        <div className="sidebar-footer">
          <button
            className="sidebar-footer-link"
            onClick={onOpenSettings}
            type="button"
          >
            <IconSettings />
            <span>Settings</span>
          </button>
        </div>
      </aside>

      {searchOpen && (
        <SearchModal
          conversations={conversations}
          onSelect={(id) => { onSelectConversation(id) }}
          onClose={() => setSearchOpen(false)}
        />
      )}
    </>
  )
}
