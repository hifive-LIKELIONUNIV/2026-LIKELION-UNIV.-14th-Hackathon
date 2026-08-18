import { useNavigate, useLocation } from 'react-router-dom'
import mcmLogo from '../../assets/images/a5ec94c46d1ed7fd47ce06cad157f54ff1b65eb8.png'
import './PhotoFramePage.css'

function PhotoFramePage() {
  const navigate = useNavigate()
  const location = useLocation()

  // 1976, 2005, 2016, 2026 선택/촬영 사진 객체 받아오기
  const stateSelectedPhotos = location.state?.selectedPhotos || {}

  const passportData = {
    selection_id: 12,
    product_name: 'Stark',
    results: [
      { era: '1976', image_url: stateSelectedPhotos['1976'] || 'https://via.placeholder.com/300x400/5C4430/fff?text=1976' },
      { era: '2005', image_url: stateSelectedPhotos['2005'] || 'https://via.placeholder.com/300x400/7F5D42/fff?text=2005' },
      { era: '2016', image_url: stateSelectedPhotos['2016'] || 'https://via.placeholder.com/300x400/2b2620/fff?text=2016' },
      { era: '2026', image_url: stateSelectedPhotos['2026'] || 'https://via.placeholder.com/300x400/1c1712/fff?text=2026' },
    ],
    qrcode_url: 'https://via.placeholder.com/200x200/ffffff/000000?text=QR+Code',
  }

  const handleNext = () => {
    navigate('/choose')
  }

  const results = passportData.results

  return (
    <div className="frame-page-wrap">
      <div className="wrap">
        <div className="frame-subtitle">MCM과 함께한 여정을 확인하세요.</div>

        <div className="content-row">
          <div className="frame-card">
            <div className="frame-inner">
              <div className="frame-grid">
                {results.map((item, index) => (
                  <div
                    key={item.era || index}
                    className="frame"
                    style={
                      item.image_url
                        ? {
                            backgroundImage: `url(${item.image_url})`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                          }
                        : undefined
                    }
                  />
                ))}
              </div>
              <img src={mcmLogo} className="frame-stamp" alt="MCM Stamp" />
            </div>
          </div>

          <div className="qr-panel">
            <div className="qr-card">
              <div className="qr-title">사진을 휴대폰에 저장하세요</div>

              <div className="qr-box">
                {passportData.qrcode_url && (
                  <img
                    src={passportData.qrcode_url}
                    alt="QR Code"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                )}
              </div>

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