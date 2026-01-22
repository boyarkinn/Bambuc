import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import './Home.css'

function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    const hasToken = Boolean(localStorage.getItem('auth_token'))
    setIsAuthenticated(hasToken)
  }, [])

  return (
    <main className="home bg-home">
      <header className="home__header">
        <div className="home__logo">BAMBUC</div>
        {isAuthenticated ? (
          <Link className="btn btn-outline btn-sm home__login" to="/account">
            Аккаунт
          </Link>
        ) : (
          <Link className="btn btn-outline btn-sm home__login" to="/login">
            ВОЙТИ
          </Link>
        )}
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
          <div className="home__card-title">BAMBUC Console</div>
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
        <Link className="btn btn-card" to="/images">
          Изображения
        </Link>
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
