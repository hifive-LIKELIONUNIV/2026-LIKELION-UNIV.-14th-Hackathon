import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import TimePortalTitle from '../../components/TimePortalTitle/TimePortalTitle.jsx'
import mcmCrestLogo from '../../assets/images/image 79.png'
import { apiPostJson } from '../../api/client.js'
import './LoginPage.css'

function LoginPage() {
  const navigate = useNavigate()
  // 해커톤 키오스크 운영용 — 방문객마다 계정을 새로 만들 필요 없이, 미리 만들어둔
  // 데모 계정(관리자 권한 없음)으로 입력창을 채워둬서 '로그인하기' 버튼만 누르면
  // 바로 체험 가능하게 함. 관리자 계정을 여기 쓰면 안 됨 — 프론트 코드는 브라우저에
  // 그대로 노출되므로, 이 계정이 유출돼도 admin 페이지 접근이 안 되게 일반 계정으로 둠.
  const [email, setEmail] = useState('Timeportal@mcm.com')
  const [password, setPassword] = useState('mcmproject')
  const [emailError, setEmailError] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()

    const nextEmailError = email.trim() ? '' : '이메일 주소를 입력해주세요.'
    const nextPasswordError = password.trim() ? '' : '비밀번호를 입력해주세요.'
    setEmailError(nextEmailError)
    setPasswordError(nextPasswordError)

    if (nextEmailError || nextPasswordError) {
      return
    }

    setSubmitting(true)
    try {
      await apiPostJson('/api/accounts/login/', { email, password })
      navigate('/processing')
    } catch (err) {
      setPasswordError(err.message || '로그인에 실패했습니다.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="login-page">
      <div className="login-page__stage">
        <div className="login-page__content">
          <img className="login-page__brand" src={mcmCrestLogo} alt="MCM" />

          <TimePortalTitle className="login-page__title" />

          <form className="login-page__card" onSubmit={handleSubmit} noValidate>
            <div className="login-page__field">
              {!email && (
                <span className="login-page__placeholder" aria-hidden="true">
                  이메일 주소<span className="login-page__asterisk">*</span>
                </span>
              )}
              <input
                id="email"
                type="email"
                className="login-page__input"
                aria-label="이메일 주소"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                autoComplete="email"
                spellCheck="false"
                aria-required="true"
              />
              {emailError && <p className="login-page__error">{emailError}</p>}
            </div>

            <div className="login-page__field">
              {!password && (
                <span className="login-page__placeholder" aria-hidden="true">
                  비밀번호<span className="login-page__asterisk">*</span>
                </span>
              )}
              <input
                id="password"
                type="password"
                className="login-page__input"
                aria-label="비밀번호"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="current-password"
                aria-required="true"
              />
              {passwordError && <p className="login-page__error">{passwordError}</p>}
            </div>

            <button type="submit" className="login-page__submit" disabled={submitting}>
              {submitting ? '로그인 중...' : '로그인하기'}
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
