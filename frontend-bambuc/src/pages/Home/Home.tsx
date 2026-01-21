import { Link } from 'react-router-dom'
import './Home.css'

function Home() {
  return (
    <main className="home bg-home">
      <header className="home__header">
        <div className="home__logo">MindCraft</div>
      </header>

      <section className="home__hero">
        <div className="home__hero-text">
          <h1 className="title-xl">Платформа для генерации контента и умных ботов</h1>
          <p className="text-md text-muted">
            Генерируй изображения и видео, запускай специализированных чат-ботов
            и управляй всем из единого интерфейса.
          </p>
        </div>
        <div className="home__hero-card">
          <div className="home__card-title">MindCraft Console</div>
          <div className="home__card-body">
            <div className="home__metric">
              <span>Генераций</span>
              <strong>0</strong>
            </div>
            <div className="home__metric">
              <span>Активных ботов</span>
              <strong>0</strong>
            </div>
            <div className="home__metric">
              <span>Очередь</span>
              <strong>Пусто</strong>
            </div>
          </div>
        </div>
      </section>

      <section className="home__features">
        <button className="btn btn-card" type="button">
          Изображения
        </button>
        <button className="btn btn-card" type="button">
          Видео
        </button>
        <button className="btn btn-card" type="button">
          Чат-боты
        </button>
        <Link className="btn btn-card" to="/chat">
          Разработка
        </Link>
      </section>
    </main>
  )
}

export default Home
