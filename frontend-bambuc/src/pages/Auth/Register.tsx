import { Link } from 'react-router-dom'
import './Auth.css'

function Register() {
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
          <div className="auth__title">Регистрация</div>
        </div>

        <form className="auth__form">
          <input className="auth__input" type="text" placeholder="Имя" />
          <input className="auth__input" type="email" placeholder="Email" />
          <input className="auth__input" type="password" placeholder="Пароль" />
          <button className="btn btn-primary auth__submit" type="button">
            Зарегистрироваться
          </button>
        </form>

        <div className="auth__switch">
          Уже есть аккаунт? <Link to="/login">Войти</Link>
        </div>
      </section>
    </main>
  )
}

export default Register
