import { useNavigate } from 'react-router-dom'
import OrbitRing from '../../components/OrbitRing/OrbitRing.jsx'
import TimePortalTitle from '../../components/TimePortalTitle/TimePortalTitle.jsx'
import bgImage from '../../assets/images/image 1.png'
import './StartPage.css'

function StartPage() {
  const navigate = useNavigate()

  const handleStart = () => {
    navigate('/login')
  }

  return (
    <div className="start-page">
      <img src={bgImage} className="start-page__bg" alt="" />
      <div className="start-page__overlay" />

      <div className="start-page__stage">
        <div className="start-page__content">
          <div className="start-page__top">
            <OrbitRing />
            <p className="start-page__eyebrow">MCM Heritage Experience</p>
          </div>

          <TimePortalTitle className="start-page__title" />

          <div className="start-page__bottom">
            <div className="start-page__spacer" aria-hidden="true" />
            <p className="start-page__subtitle">
              MCM의 시간을 건너, 그 시대 속 당신을 만나보세요.
            </p>
            <div className="start-page__spacer" aria-hidden="true" />
            <button
              type="button"
              className="start-page__cta"
              onClick={handleStart}
            >
              체험 시작하기
              <span className="start-page__cta-arrow" aria-hidden="true">
                &#8250;
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default StartPage