import { useNavigate } from 'react-router-dom'
import mcmLogo from '../../assets/images/bc9c25ea8bc6e8552676791b1eaa679c6e122d97.png'
import './PhotoFramePage.css'

function PhotoFramePage() {
  const navigate = useNavigate()

  const handleBack = () => {
    navigate(-1)
  }

  const handleSave = () => {
    // TODO: 실제 사진 저장(다운로드) 로직 연결
    console.log('사진 저장 클릭됨')
  }

  const handleNext = () => {
    // TODO: 다음 단계 페이지가 만들어지면 navigate로 연결
    console.log('다음 단계로 클릭됨')
  }

  return (
    <div className="frame-page-wrap">
      <div className="wrap">
        <div className="header">
          <button type="button" className="back-btn" onClick={handleBack}>
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="15 18 9 12 15 6"></polyline>
            </svg>
            이전
          </button>
          <div className="frame-title">
            TIME <span className="portal">PORTAL</span>
          </div>
        </div>

        <div className="frame-subtitle">MCM과 함께한 여정을 확인하세요.</div>

        <div className="strip-outer">
          <div className="strip">
            <img src={mcmLogo} className="strip-logo" alt="" />
            <div className="frame" />
            <div className="frame" />
            <div className="frame" />
            <div className="frame" />
            <div className="strip-brand">MCM</div>
          </div>
        </div>

        <div className="actions">
          <button type="button" className="btn btn-save" onClick={handleSave}>
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="7 10 12 15 17 10"></polyline>
              <line x1="12" y1="15" x2="12" y2="3"></line>
            </svg>
            사진 저장
          </button>
          <button type="button" className="btn btn-next" onClick={handleNext}>
            다음 단계로
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}

export default PhotoFramePage