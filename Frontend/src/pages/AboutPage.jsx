import './AboutPage.css'

function IconHamburger() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  )
}

export default function AboutPage({ sidebarOpen, onToggleSidebar }) {
  return (
    <div className="about-page">
      <header className="chat-page-header">
        {!sidebarOpen && (
          <button className="header-toggle-btn" onClick={onToggleSidebar} title="Open sidebar">
            <IconHamburger />
          </button>
        )}
      </header>

      <div className="about-scroll">
        <div className="about-card">
          <h1>About ChatAI</h1>

          <section>
            <h2>Description</h2>
            <p>
              ChatAI is a conversational AI web application that lets you have natural,
              ongoing conversations with an AI assistant. Each conversation maintains full
              context so the assistant can understand and respond to follow-up questions.
            </p>
          </section>

          <section>
            <h2>Purpose</h2>
            <p>
              This project was built as a final project for a Full Stack Web Development
              course. It demonstrates the integration of a React frontend, a Python FastAPI
              backend, a MySQL database, and the OpenAI API to create a functional,
              end-to-end web application.
            </p>
          </section>

          <section>
            <h2>Technologies</h2>
            <ul>
              <li>React 18 with JavaScript (SPA)</li>
              <li>Python with FastAPI (REST API)</li>
              <li>MySQL (relational database)</li>
              <li>OpenAI API (AI responses)</li>
              <li>Vite (build tool)</li>
            </ul>
          </section>

          <section>
            <h2>Developer</h2>
            <p>Shir Fridman Mor</p>
            <p>Full Stack Web Development Student</p>
          </section>
        </div>
      </div>
    </div>
  )
}
