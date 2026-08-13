import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import TimePortalTitle from '../../components/TimePortalTitle/TimePortalTitle.jsx'
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
          <TimePortalTitle className="login-page__title" />

          <form className="login-page__card" onSubmit={handleSubmit} noValidate>
            <div className="login-page__field">
              <label className="login-page__label-sr" htmlFor="email">
                이메일 주소*
              </label>
              <input
                id="email"
                type="email"
                className="login-page__input"
                placeholder="이메일 주소*"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                autoComplete="email"
                spellCheck="false"
                aria-required="true"
              />
              {emailError && <p className="login-page__error">{emailError}</p>}
            </div>

            <div className="login-page__field">
              <label className="login-page__label-sr" htmlFor="password">
                비밀번호*
              </label>
              <input
                id="password"
                type="password"
                className="login-page__input"
                placeholder="비밀번호*"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="current-password"
                aria-required="true"
              />
              {passwordError && <p className="login-page__error">{passwordError}</p>}
            </div>

            <button type="submit" className="login-page__submit">
              로그인하기
            </button>
          </form>

          <button
            type="button"
            className="login-page__guest"
            onClick={() => navigate('/bags-before')}
          >
            로그인 없이 체험하기
          </button>
        </div>
      </div>
    </div>
  )
}

export default LoginPage
