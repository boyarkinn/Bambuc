import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import './Account.css'

function Account() {
  const navigate = useNavigate()
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem('auth_user')
    return raw ? JSON.parse(raw) : null
  })

  const [draftEmail, setDraftEmail] = useState(user?.email ?? '')
  const [draftName, setDraftName] = useState(user?.name ?? '')
  const [isEditingEmail, setIsEditingEmail] = useState(false)
  const [isEditingName, setIsEditingName] = useState(false)
  const [profileSubmitting, setProfileSubmitting] = useState(false)
  const [profileError, setProfileError] = useState('')
  const [profileSuccess, setProfileSuccess] = useState('')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleLogout = () => {
    localStorage.removeItem('auth_token')
    localStorage.removeItem('auth_user')
    navigate('/')
  }

  const saveUser = (nextUser: { email?: string; name?: string } | null) => {
    setUser(nextUser)
    if (nextUser) {
      localStorage.setItem('auth_user', JSON.stringify(nextUser))
    }
  }

  const readJson = async (response: Response) => {
    const text = await response.text()
    return text ? JSON.parse(text) : null
  }

  const updateProfile = async (nextEmail: string, nextName: string) => {
    if (!user?.email) {
      setProfileError('Не найден email пользователя')
      return null
    }

    setProfileSubmitting(true)
    try {
      const response = await fetch('/auth/update-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: user.email,
          newEmail: nextEmail,
          name: nextName
        })
      })

      const data = await readJson(response)
      if (!response.ok) {
        setProfileError(data?.error ?? 'Не удалось обновить данные')
        return null
      }

      if (data?.user) {
        saveUser(data.user)
        setDraftEmail(data.user.email ?? '')
        setDraftName(data.user.name ?? '')
      }

      setProfileSuccess('Данные обновлены')
      return data?.user ?? null
    } catch (err) {
      console.error('[account.update-profile] failed', err)
      setProfileError('Ошибка соединения с сервером')
      return null
    } finally {
      setProfileSubmitting(false)
    }
  }

  const handleSaveEmail = async () => {
    setProfileError('')
    setProfileSuccess('')

    const nextEmail = draftEmail.trim()
    if (!nextEmail) {
      setProfileError('Введите email')
      return
    }

    const updated = await updateProfile(nextEmail, draftName.trim())
    if (updated) {
      setIsEditingEmail(false)
    }
  }

  const handleSaveName = async () => {
    setProfileError('')
    setProfileSuccess('')

    const updated = await updateProfile(draftEmail.trim(), draftName.trim())
    if (updated) {
      setIsEditingName(false)
    }
  }

  const handleChangePassword = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')
    setSuccess('')

    if (!currentPassword || !newPassword) {
      setError('Введите текущий и новый пароль')
      return
    }

    if (!user?.email) {
      setError('Не найден email пользователя')
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch('/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: user.email,
          currentPassword,
          newPassword
        })
      })

      const text = await response.text()
      const data = text ? JSON.parse(text) : null

      if (!response.ok) {
        setError(data?.error ?? 'Не удалось обновить пароль')
        return
      }

      setSuccess('Пароль обновлён')
      setCurrentPassword('')
      setNewPassword('')
    } catch (err) {
      console.error('[account.change-password] failed', err)
      setError('Ошибка соединения с сервером')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="account bg-dark">
      <section className="account__card">
        <div className="account__header">
          <Link className="account__back" to="/" aria-label="На главную">
            <svg
              className="account__back-icon"
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
          <div className="account__title">Аккаунт</div>
        </div>

        <div className="account__info">
          <div className="account__row">
            <span>Email</span>
            <div className="account__value">
              {isEditingEmail ? (
                <div className="account__field">
                  <input
                    className="account__input account__input--compact"
                    type="email"
                    placeholder="Email"
                    value={draftEmail}
                    onChange={(event) => setDraftEmail(event.target.value)}
                  />
                  <button
                    className="account__icon-btn"
                    type="button"
                    aria-label="Сохранить email"
                    onClick={handleSaveEmail}
                    disabled={profileSubmitting}
                  >
                    <svg
                      className="account__icon"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="M20 6L9 17l-5-5" />
                    </svg>
                  </button>
                  <button
                    className="account__icon-btn"
                    type="button"
                    aria-label="Отменить"
                    onClick={() => {
                      setDraftEmail(user?.email ?? '')
                      setIsEditingEmail(false)
                      setProfileError('')
                    }}
                  >
                    <svg
                      className="account__icon"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="M18 6L6 18" />
                      <path d="M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ) : (
                <>
                  <strong className="account__value-text">{user?.email ?? '—'}</strong>
                  <button
                    className="account__icon-btn"
                    type="button"
                    aria-label="Редактировать email"
                    onClick={() => {
                      setIsEditingEmail(true)
                      setProfileError('')
                      setProfileSuccess('')
                    }}
                  >
                    <svg
                      className="account__icon"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="M12 20h9" />
                      <path d="M16.5 3.5l4 4L7 21H3v-4z" />
                    </svg>
                  </button>
                </>
              )}
            </div>
          </div>
          <div className="account__row">
            <span>Имя</span>
            <div className="account__value">
              {isEditingName ? (
                <div className="account__field">
                  <input
                    className="account__input account__input--compact"
                    type="text"
                    placeholder="Имя"
                    value={draftName}
                    onChange={(event) => setDraftName(event.target.value)}
                  />
                  <button
                    className="account__icon-btn"
                    type="button"
                    aria-label="Сохранить имя"
                    onClick={handleSaveName}
                    disabled={profileSubmitting}
                  >
                    <svg
                      className="account__icon"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="M20 6L9 17l-5-5" />
                    </svg>
                  </button>
                  <button
                    className="account__icon-btn"
                    type="button"
                    aria-label="Отменить"
                    onClick={() => {
                      setDraftName(user?.name ?? '')
                      setIsEditingName(false)
                      setProfileError('')
                    }}
                  >
                    <svg
                      className="account__icon"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="M18 6L6 18" />
                      <path d="M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ) : (
                <>
                  <strong className="account__value-text">{user?.name ?? '—'}</strong>
                  <button
                    className="account__icon-btn"
                    type="button"
                    aria-label="Редактировать имя"
                    onClick={() => {
                      setIsEditingName(true)
                      setProfileError('')
                      setProfileSuccess('')
                    }}
                  >
                    <svg
                      className="account__icon"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="M12 20h9" />
                      <path d="M16.5 3.5l4 4L7 21H3v-4z" />
                    </svg>
                  </button>
                </>
              )}
            </div>
          </div>
          {profileError && <div className="account__error">{profileError}</div>}
          {profileSuccess && <div className="account__success">{profileSuccess}</div>}
        </div>

        <form className="account__form" onSubmit={handleChangePassword}>
          <div className="account__section-title">Сменить пароль</div>
          <div className="account__input-wrap">
            <input
              className="account__input"
              type={showCurrentPassword ? 'text' : 'password'}
              placeholder="Текущий пароль"
              autoComplete="current-password"
              value={currentPassword}
              onChange={(event) => setCurrentPassword(event.target.value)}
            />
            <button
              className="account__toggle"
              type="button"
              aria-label={showCurrentPassword ? 'Скрыть пароль' : 'Показать пароль'}
              onClick={() => setShowCurrentPassword((prev) => !prev)}
            >
              <svg
                className="account__toggle-icon"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            </button>
          </div>
          <div className="account__input-wrap">
            <input
              className="account__input"
              type={showNewPassword ? 'text' : 'password'}
              placeholder="Новый пароль"
              autoComplete="new-password"
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
            />
            <button
              className="account__toggle"
              type="button"
              aria-label={showNewPassword ? 'Скрыть пароль' : 'Показать пароль'}
              onClick={() => setShowNewPassword((prev) => !prev)}
            >
              <svg
                className="account__toggle-icon"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            </button>
          </div>
          {error && <div className="account__error">{error}</div>}
          {success && <div className="account__success">{success}</div>}
          <button className="btn btn-primary account__submit" type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Сохраняем...' : 'Сохранить пароль'}
          </button>
        </form>

        <button className="btn btn-outline account__logout" type="button" onClick={handleLogout}>
          Выйти
        </button>
      </section>
    </main>
  )
}

export default Account
