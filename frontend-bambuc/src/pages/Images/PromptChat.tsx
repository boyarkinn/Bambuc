import { useEffect, useMemo, useRef, useState } from 'react'
import './PromptChat.css'

type ChatRole = 'user' | 'assistant'

type ChatMessage = {
  id: string
  role: ChatRole
  content: string
}

type PayloadMessage = {
  role: 'system' | 'user' | 'assistant'
  content: string
}

const createId = () =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(16).slice(2)}`

const systemPrompt =
  'Ты ассистент по улучшению промптов для генерации изображений. ' +
  'Получив описание пользователя, верни улучшенный промпт для генерации. ' +
  'Отвечай одним промптом без пояснений, списков и кавычек.'

type PromptChatProps = {
  isCollapsed: boolean
  onToggleCollapse: () => void
  isMobile?: boolean
}

function PromptChat({ isCollapsed, onToggleCollapse, isMobile = false }: PromptChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const endRef = useRef<HTMLDivElement | null>(null)

  const canSend = input.trim().length > 0 && !isSending

  const payloadMessages = useMemo(
    () =>
      messages.map((message): PayloadMessage => ({
        role: message.role,
        content: message.content,
      })),
    [messages],
  )

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isSending])

  const sendMessage = async () => {
    if (!canSend) {
      return
    }

    setError(null)
    const userMessage: ChatMessage = {
      id: createId(),
      role: 'user',
      content: input.trim(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setIsSending(true)

    try {
      const response = await fetch('/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            { role: 'system', content: systemPrompt },
            ...payloadMessages,
            { role: userMessage.role, content: userMessage.content },
          ],
          max_tokens: 500,
        }),
      })

      if (!response.ok) {
        throw new Error('Не удалось получить улучшенный промпт')
      }

      const data = await response.json()
      const content =
        data?.choices?.[0]?.message?.content ??
        data?.choices?.[0]?.text ??
        'Нет ответа от модели'

      const assistantMessage: ChatMessage = {
        id: createId(),
        role: 'assistant',
        content,
      }

      setMessages((prev) => [...prev, assistantMessage])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка запроса')
    } finally {
      setIsSending(false)
    }
  }

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    void sendMessage()
  }

  const handleHeaderClick = () => {
    if (isMobile) {
      onToggleCollapse()
    }
  }

  const handleHeaderKeyDown = (event: React.KeyboardEvent<HTMLElement>) => {
    if (!isMobile) {
      return
    }
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      onToggleCollapse()
    }
  }

  return (
    <section className={`chat__main images__prompt${isCollapsed ? ' images__prompt--collapsed' : ''}`}>
      <header
        className="chat__header"
        onClick={handleHeaderClick}
        onKeyDown={handleHeaderKeyDown}
        role={isMobile ? 'button' : undefined}
        tabIndex={isMobile ? 0 : undefined}
      >
        <div className="chat__title">Улучшение промта</div>
        <button
          className="chat__back-icon images__prompt-toggle"
          type="button"
          onClick={onToggleCollapse}
          aria-label={isCollapsed ? 'Развернуть чат улучшения промпта' : 'Свернуть чат улучшения промпта'}
        >
          <svg
            className="images__prompt-toggle-icon"
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
      </header>

      <section className="chat__window images__prompt-window">
        {messages.length === 0 && !isSending && (
          <div className="chat__empty">Опишите желаемое изображение для улучшения промпта.</div>
        )}

        {messages.map((message) => (
          <div key={message.id} className={`chat__message chat__message--${message.role}`}>
            {message.role === 'assistant' && <div className="chat__avatar">MC</div>}
            <div className="chat__bubble">{message.content}</div>
          </div>
        ))}

        {isSending && (
          <div className="chat__message chat__message--assistant">
            <div className="chat__avatar">MC</div>
            <div className="chat__bubble">...</div>
          </div>
        )}

        {error && <div className="chat__error">{error}</div>}
        <div ref={endRef} />
      </section>

      <form className="chat__composer images__prompt-composer" onSubmit={onSubmit}>
        <textarea
          className="chat__input images__prompt-input"
          rows={2}
          placeholder="Опиши желаемый результат..."
          value={input}
          onChange={(event) => setInput(event.target.value)}
          disabled={isSending}
        />
        <button
          className="images__icon-btn images__icon-btn--primary"
          type="submit"
          disabled={!canSend}
          aria-label="Улучшить"
        >
          <svg
            className="images__icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <line x1="22" y1="2" x2="11" y2="13" />
            <polygon points="22 2 15 22 11 13 2 9 22 2" />
          </svg>
        </button>
      </form>
    </section>
  )
}

export default PromptChat
