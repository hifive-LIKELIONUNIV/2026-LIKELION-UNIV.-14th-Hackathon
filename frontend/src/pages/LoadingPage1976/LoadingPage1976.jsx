import { useEffect, useState } from 'react'
import OrbitRing from '../../components/OrbitRing/OrbitRing.jsx'
import bgImage from '../../assets/images/17a7e1790baadbd376b6027d06fb4e0cb431e3cb.png'
import './LoadingPage1976.css'

function LoadingPage1976() {
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

  return (
    <div className="loading-page">
      <div className="loading-page__stage">
        <img src={bgImage} className="loading-page__bg" alt="" />
        <div className="loading-page__overlay" />

        <div className="loading-page__content">
          <OrbitRing />

          <p className="loading-page__year">1976</p>

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
            MCM이 독일 뮌헨에서 탄생한 순간으로 출발합니다
          </p>
        </div>
      </div>
    </div>
  )
}

export default LoadingPage1976
