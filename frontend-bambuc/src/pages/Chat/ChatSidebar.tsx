import { useState } from 'react'
import { Link } from 'react-router-dom'
import './Chat.css'
import './ChatSidebar.css'

const chats: { id: string; title: string }[] = []

type ChatSidebarProps = {
  showNewChat?: boolean
  showHeader?: boolean
  isMobile?: boolean
  isCollapsed?: boolean
  onToggleCollapse?: () => void
}

function ChatSidebar({
  showNewChat = true,
  showHeader = true,
  isMobile = false,
  isCollapsed,
  onToggleCollapse,
}: ChatSidebarProps) {
  const [localCollapsed, setLocalCollapsed] = useState(false)
  const collapsed = isMobile && typeof isCollapsed === 'boolean' ? isCollapsed : localCollapsed

  const handleHeaderClick = () => {
    if (isMobile) {
      onToggleCollapse?.()
    }
  }

  const handleHeaderKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (!isMobile) {
      return
    }
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      onToggleCollapse?.()
    }
  }

  const handleToggleClick = () => {
    if (isMobile) {
      onToggleCollapse?.()
      return
    }
    setLocalCollapsed((prev) => !prev)
  }

  return (
    <aside className={`chat__sidebar${collapsed ? ' chat__sidebar--collapsed' : ''}`}>
      {showHeader && (
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
      )}

      <div
        className="chat__header chat__sidebar-header"
        onClick={handleHeaderClick}
        onKeyDown={handleHeaderKeyDown}
        role={isMobile ? 'button' : undefined}
        tabIndex={isMobile ? 0 : undefined}
      >
        <div className="chat__title">Ваши чаты</div>
        <button
          className="chat__back-icon chat__sidebar-toggle"
          type="button"
          onClick={handleToggleClick}
          aria-label={collapsed ? 'Развернуть боковую панель' : 'Свернуть боковую панель'}
        >
          <svg
            className="chat__sidebar-toggle-icon"
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
        </button>
      </div>

      <div className="chat__sidebar-content">
        {showNewChat && (
          <button className="chat__new-chat" type="button">
            <span className="chat__new-chat-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            </span>
            <span className="chat__new-chat-label">Новый чат</span>
          </button>
        )}

        {chats.length > 0 && (
          <div className="chat__section">
            <div className="chat__section-title">История</div>
            <div className="chat__list">
              {chats.map((chat) => (
                <button className="chat__list-item" type="button" key={chat.id}>
                  <span className="chat__list-item-icon" aria-hidden="true">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15a4 4 0 0 1-4 4H7l-4 4V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z" />
                    </svg>
                  </span>
                  <span className="chat__list-item-label">{chat.title}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </aside>
  )
}

export default ChatSidebar
