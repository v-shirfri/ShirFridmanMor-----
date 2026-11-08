import { useState, useCallback, useEffect, useRef } from 'react'
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import SettingsModal from './components/SettingsModal'
import HomePage from './pages/HomePage'
import AboutPage from './pages/AboutPage'
import {
  createConversation,
  sendMessage,
  listConversations,
  getConversationMessages,
} from './api'
import './App.css'

function AppContent() {
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(() => window.innerWidth >= 768)
  const [conversationId, setConversationId] = useState(null)
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [conversations, setConversations] = useState([])
  const [inputFocusKey, setInputFocusKey] = useState(0)
  const isCreatingConvRef = useRef(false)
  const [effort, setEffort] = useState('standard')
  const [settingsOpen, setSettingsOpen] = useState(false)

  const refreshSidebar = useCallback(async () => {
    try {
      const data = await listConversations()
      setConversations(data.conversations)
    } catch {
      // non-critical — sidebar list failing should not block the chat
    }
  }, [])

  useEffect(() => {
    refreshSidebar()
  }, [refreshSidebar])

  function handleNewChat() {
    setConversationId(null)
    setMessages([])
    setError(null)
    setInputFocusKey((k) => k + 1)
    navigate('/')
  }

  async function handleSelectConversation(id) {
    if (id === conversationId) {
      navigate('/')
      return
    }
    setMessages([])
    setError(null)
    setConversationId(id)
    setLoading(true)
    setInputFocusKey((k) => k + 1)
    navigate('/')
    try {
      const data = await getConversationMessages(id)
      setMessages(data.messages.map((m) => ({ ...m, image: m.image_data || null })))
    } catch (err) {
      setError(err.message || 'Failed to load conversation.')
    } finally {
      setLoading(false)
    }
  }

  async function handleSend(message, image = null) {
    setError(null)
    let activeId = conversationId

    if (!activeId) {
      if (isCreatingConvRef.current) return
      isCreatingConvRef.current = true
      try {
        const data = await createConversation()
        activeId = data.conversation_id
        setConversationId(activeId)
      } catch {
        setError(
          'Could not connect to the server. Make sure the backend is running with: uvicorn main:app --reload'
        )
        return
      } finally {
        isCreatingConvRef.current = false
      }
    }

    setMessages((prev) => [
      ...prev,
      { role: 'user', content: message, image },
    ])
    setLoading(true)

    try {
      const data = await sendMessage(activeId, message, effort, image)
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: data.response, sources: data.sources || [] },
      ])
      refreshSidebar()
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const toggleSidebar = () => setSidebarOpen((o) => !o)

  return (
    <div className="app-layout">
      <Sidebar
        isOpen={sidebarOpen}
        conversations={conversations}
        activeId={conversationId}
        onToggle={toggleSidebar}
        onNewChat={handleNewChat}
        onSelectConversation={handleSelectConversation}
        onOpenSettings={() => setSettingsOpen(true)}
      />
      <div className={`sidebar-backdrop ${sidebarOpen ? 'visible' : ''}`} onClick={toggleSidebar} />
      {settingsOpen && (
        <SettingsModal
          effort={effort}
          onEffortChange={setEffort}
          onClose={() => setSettingsOpen(false)}
        />
      )}
      <div className="main-panel">
        <Routes>
          <Route
            path="/"
            element={
              <HomePage
                messages={messages}
                loading={loading}
                error={error}
                onSend={handleSend}
                sidebarOpen={sidebarOpen}
                onToggleSidebar={toggleSidebar}
                focusKey={inputFocusKey}
                effort={effort}
                onEffortChange={setEffort}
              />
            }
          />
          <Route
            path="/about"
            element={
              <AboutPage sidebarOpen={sidebarOpen} onToggleSidebar={toggleSidebar} />
            }
          />
        </Routes>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  )
}
