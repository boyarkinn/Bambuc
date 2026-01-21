import { Link } from 'react-router-dom'
import './Chat.css'
import './ChatSidebar.css'

const chats: { id: string; title: string }[] = []

function ChatSidebar() {
  return (
    <aside className="chat__sidebar">
      <div className="chat__sidebar-top">
        <Link className="chat__back-icon" to="/" aria-label="На главную">
          <svg
            className="chat__back-icon-svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </Link>
        <div className="chat__brand">
          <span className="chat__brand-mark">BAMBUC</span>
        </div>
      </div>

      <button className="chat__new-chat" type="button">
        Новый чат
      </button>

      {chats.length > 0 && (
        <div className="chat__section">
          <div className="chat__section-title">История</div>
          <div className="chat__list">
            {chats.map((chat) => (
              <button className="chat__list-item" type="button" key={chat.id}>
                {chat.title}
              </button>
            ))}
          </div>
        </div>
      )}
    </aside>
  )
}

export default ChatSidebar
