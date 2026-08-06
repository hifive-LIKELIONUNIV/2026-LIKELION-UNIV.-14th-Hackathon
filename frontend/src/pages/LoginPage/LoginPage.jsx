import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './LoginPage.css'

function LoginPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [emailError, setEmailError] = useState('')
  const [passwordError, setPasswordError] = useState('')

  const handleSubmit = (event) => {
    event.preventDefault()

    const nextEmailError = email.trim() ? '' : '이메일 주소를 입력해주세요.'
    const nextPasswordError = password.trim() ? '' : '비밀번호를 입력해주세요.'
    setEmailError(nextEmailError)
    setPasswordError(nextPasswordError)

    if (nextEmailError || nextPasswordError) {
      return
    }

    navigate('/processing')
  }

  return (
    <div className="login-page">
      <div className="login-page__stage">
        <div className="login-page__content">
          <h1 className="login-page__title">
            <span>TIME</span>
            <span className="login-page__title--accent">PORTAL</span>
          </h1>

          <form className="login-page__card" onSubmit={handleSubmit} noValidate>
            <div className="login-page__field">
              <label className="login-page__label" htmlFor="email">
                이메일 주소<span className="login-page__required">*</span>
              </label>
              <input
                id="email"
                type="email"
                className="login-page__input"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                autoComplete="email"
                spellCheck="false"
              />
              {emailError && <p className="login-page__error">{emailError}</p>}
            </div>

            <div className="login-page__field">
              <label className="login-page__label" htmlFor="password">
                비밀번호<span className="login-page__required">*</span>
              </label>
              <input
                id="password"
                type="password"
                className="login-page__input"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="current-password"
              />
              {passwordError && <p className="login-page__error">{passwordError}</p>}
            </div>

            <button type="submit" className="login-page__submit">
              로그인하기
            </button>
          </form>

          <button type="button" className="login-page__guest">
            로그인 없이 체험하기
          </button>
        </div>
      </div>
    </div>
  )
}

export default LoginPage
