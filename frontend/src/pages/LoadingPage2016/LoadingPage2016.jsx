import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import OrbitRing from '../../components/OrbitRing/OrbitRing.jsx'
import bgImage from '../../assets/images/2016 배경원본.png'
import './LoadingPage2016.css'

function LoadingPage2016() {
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
      navigate('/period/2016', { state: location.state })
    }, 3000)
    return () => clearTimeout(timer)
  }, [navigate, location.state])

  return (
    <div className="loading-page loading-page--2016">
      <img src={bgImage} className="loading-page__bg" alt="" />
      <div className="loading-page__overlay" />

      <div className="loading-page__stage">
        <div className="loading-page__content">
          <OrbitRing />

          <p className="loading-page__year">2016</p>

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
            MCM 창립 40주년, Made to Move의 시대로 이동합니다
          </p>
        </div>
      </div>
    </div>
  )
}

export default LoadingPage2016
