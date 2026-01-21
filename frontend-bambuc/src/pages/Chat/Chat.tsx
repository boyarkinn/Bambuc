import { useEffect, useMemo, useRef, useState } from 'react'
import './Chat.css'
import ChatSidebar from './ChatSidebar'

type ChatRole = 'user' | 'assistant'

type ChatMessage = {
  id: string
  role: ChatRole
  content: string
}

const createId = () =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(16).slice(2)}`

function Chat() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const endRef = useRef<HTMLDivElement | null>(null)

  const canSend = input.trim().length > 0 && !isSending

  const payloadMessages = useMemo(
    () =>
      messages.map((message) => ({
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
          messages: [...payloadMessages, userMessage].map(({ role, content }) => ({
            role,
            content,
          })),
          max_tokens: 800,
        }),
      })

      if (!response.ok) {
        throw new Error('Не удалось получить ответ от модели')
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

  return (
    <main className="chat bg-dark">
      <div className="chat__layout">
        <ChatSidebar />

        <section className="chat__main">
          <header className="chat__header">
            <div className="chat__title">Chat</div>
          </header>

          <section className="chat__window">
            {messages.length === 0 && !isSending && (
              <div className="chat__empty">
                Напишите запрос, чтобы начать диалог.
              </div>
            )}

            {messages.map((message) => (
              <div
                key={message.id}
                className={`chat__message chat__message--${message.role}`}
              >
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

          <form className="chat__composer" onSubmit={onSubmit}>
            <input
              className="chat__input"
              type="text"
              placeholder="Напиши запрос..."
              value={input}
              onChange={(event) => setInput(event.target.value)}
              disabled={isSending}
            />
            <button className="btn btn-primary" type="submit" disabled={!canSend}>
              Отправить
            </button>
          </form>
        </section>
      </div>
    </main>
  )
}

export default Chat
