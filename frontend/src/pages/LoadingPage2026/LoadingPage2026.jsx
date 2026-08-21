import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import OrbitRing from '../../components/OrbitRing/OrbitRing.jsx'
import bgImage from '../../assets/images/2026 배경원본.png'
import './LoadingPage2026.css'

function LoadingPage2026() {
  const navigate = useNavigate()
  const location = useLocation()
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((current) => {
        if (current >= 100) {
          clearInterval(timer)
          return 100
        }
        return Math.min(current + Math.random() * 15 + 5, 100)
      })
    }, 300)

    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/period/2026', { state: location.state })
    }, 3000)
    return () => clearTimeout(timer)
    // location.state를 그대로 넘기되, state 객체 자체가 매 렌더 새로 생성돼 재실행되지
    // 않도록 selectionId만 의존성으로 둔다.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate, location.state?.selectionId])

  return (
    <div className="loading-page loading-page--2026">
      <img src={bgImage} className="loading-page__bg" alt="" />
      <div className="loading-page__overlay" />

      <div className="loading-page__stage">
        <div className="loading-page__content">
          <OrbitRing />

          <p className="loading-page__year">2026</p>

          <div
            className="loading-page__progress-track"
            role="progressbar"
            aria-valuenow={Math.round(progress)}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <div
              className="loading-page__progress-fill"
              style={{ width: `${progress}%` }}
            />
          </div>

          <p className="loading-page__caption">
            MCM과 함께 당신만의 여정을 시작해보세요
          </p>
        </div>
      </div>
    </div>
  )
}

export default LoadingPage2026
