import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import './Auth.css'

function Login() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')

    if (!email || !password) {
      setError('Введите email и пароль')
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch('/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })

      const data = await response.json()
      if (!response.ok) {
        setError(data?.error ?? 'Ошибка авторизации')
        return
      }

      if (data?.token) {
        localStorage.setItem('auth_token', data.token)
        localStorage.setItem('auth_user', JSON.stringify(data.user))
      }

      navigate('/chat')
    } catch (err) {
      console.error('[auth.login] failed', err)
      setError('Не удалось подключиться к серверу')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="auth bg-dark">
      <section className="auth__card">
        <div className="auth__header">
          <Link className="auth__back" to="/" aria-label="На главную">
            <svg
              className="auth__back-icon"
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
          <div className="auth__title">Войти</div>
        </div>

        <form className="auth__form" onSubmit={handleSubmit}>
          <input
            className="auth__input"
            type="email"
            placeholder="Email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
          <input
            className="auth__input"
            type="password"
            placeholder="Пароль"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
          {error && <div className="auth__error">{error}</div>}
          <button className="btn btn-primary auth__submit" type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Вход...' : 'Войти'}
          </button>
        </form>

        <div className="auth__switch">
          Нет аккаунта? <Link to="/register">Зарегистрироваться</Link>
        </div>
      </section>
    </main>
  )
}

export default Login
