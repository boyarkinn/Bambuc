import { Link } from 'react-router-dom'
import './Chat.css'

function Chat() {
  return (
    <main className="chat bg-dark">
      <header className="chat__header">
        <Link className="link-muted" to="/">← На главную</Link>
        <div className="chat__title">MindCraft Chat</div>
      </header>

      <section className="chat__window" />

      <form className="chat__composer">
        <input
          className="chat__input"
          type="text"
          placeholder="Напиши запрос..."
        />
        <button className="btn btn-primary" type="button">Отправить</button>
      </form>
    </main>
  )
}

export default Chat
