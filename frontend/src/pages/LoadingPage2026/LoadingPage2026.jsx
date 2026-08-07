import { useEffect, useState } from 'react'
import OrbitRing from '../../components/OrbitRing/OrbitRing.jsx'
import bgImage from '../../assets/images/image 60.png'
import './LoadingPage2026.css'

function LoadingPage2026() {
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
            MCM과 함께 당신만의 여정을 시작해보세요.
          </p>
        </div>
      </div>
    </div>
  )
}

export default LoadingPage2026
