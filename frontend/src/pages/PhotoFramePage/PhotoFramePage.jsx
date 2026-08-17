import { useNavigate } from 'react-router-dom'
import mcmLogo from '../../assets/images/a5ec94c46d1ed7fd47ce06cad157f54ff1b65eb8.png'
import './PhotoFramePage.css'

function PhotoFramePage() {
  const navigate = useNavigate()

  const handleNext = () => {
    navigate('/choose')
  }

  return (
    <div className="frame-page-wrap">
      <div className="wrap">
        <div className="frame-subtitle">MCM과 함께한 여정을 확인하세요.</div>

        <div className="content-row">
          {/* 왼쪽: 4컷 프레임 */}
          <div className="frame-card">
            <div className="frame-inner">
              <div className="frame-grid">
                <div className="frame" />
                <div className="frame" />
                <div className="frame" />
                <div className="frame" />
              </div>
              <img src={mcmLogo} className="frame-stamp" alt="" />
            </div>
          </div>

          {/* 오른쪽: QR 영역 (QR 생성은 백엔드에서 처리, 여기는 자리만) */}
          <div className="qr-panel">
            <div className="qr-card">
              <div className="qr-title">사진을 휴대폰에 저장하세요</div>

              {/* TODO: 백엔드에서 QR 코드 이미지 URL 내려주면 여기에 렌더링 */}
              <div className="qr-box" />

              <div className="qr-caption">휴대폰으로 QR코드를 스캔해주세요</div>
            </div>

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
    </div>
  )
}

export default PhotoFramePage