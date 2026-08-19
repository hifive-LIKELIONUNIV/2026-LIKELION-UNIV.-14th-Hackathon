import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import OrbitRing from '../../components/OrbitRing/OrbitRing.jsx'
import TimePortalTitle from '../../components/TimePortalTitle/TimePortalTitle.jsx'
import bgImage from '../../assets/images/image 1.png'
import { clearSelection } from '../../api/session.js'
import './FinalPage.css'

function FinalPage() {
  const navigate = useNavigate()
  const [showModal, setShowModal] = useState(false)

  const handleRestart = () => {
    // 키오스크 특성상 다음 사용자를 위해 세션/장바구니를 초기화
    fetch('/restart/', { credentials: 'include' }).catch(() => {})
    clearSelection()
    navigate('/')
  }

  return (
    <div className="final-page">
      <div className="final-page__stage">
        <img src={bgImage} className="final-page__bg" alt="" />
        <div className="final-page__overlay" />

        <div className="final-page__content">
          <OrbitRing />

          <TimePortalTitle className="final-page__title" />

          <h2 className="final-page__heading">
            이제 어떤 여정을 이어가시겠어요?
          </h2>

          <div className="final-page__actions">
            <button
              type="button"
              className="final-page__option"
              onClick={() => setShowModal(true)}
            >
              혼자 자유롭게 둘러볼게요
            </button>
            <button
              type="button"
              className="final-page__option"
              onClick={() => setShowModal(true)}
            >
              직원과 함께 둘러볼게요
            </button>
          </div>

          {showModal && (
            <div className="final-page__modal-overlay">
              <div className="final-page__modal">
                TIME PORTAL의 여정이 마무리되었습니다.
                <br />
                이제 MCM HAUS에서 마음에 든 제품을 직접 만나보세요.
              </div>
              <button
                type="button"
                className="final-page__restart"
                onClick={handleRestart}
              >
                처음으로
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default FinalPage
