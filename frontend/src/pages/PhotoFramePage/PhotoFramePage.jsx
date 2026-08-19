import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import mcmLogo from '../../assets/images/a5ec94c46d1ed7fd47ce06cad157f54ff1b65eb8.png'
import { apiGet } from '../../api/client.js'
import { getSelectionId } from '../../api/session.js'
import './PhotoFramePage.css'

const ERA_ORDER = ['1976', '2005', '2016', '2026']

function PhotoFramePage() {
  const navigate = useNavigate()
  const location = useLocation()
  const selectionId = location.state?.selectionId ?? getSelectionId()

  const [passport, setPassport] = useState(null)

  useEffect(() => {
    if (!selectionId) return undefined
    let cancelled = false

    function fetchPassport() {
      apiGet(`/api/shop/capture/${selectionId}/passport/`).then((data) => {
        if (cancelled) return
        setPassport(data)
        if (!data.ready) {
          setTimeout(fetchPassport, 1500)
        }
      })
    }

    fetchPassport()
    return () => {
      cancelled = true
    }
  }, [selectionId])

  const imagesByEra = Object.fromEntries(
    (passport?.results ?? []).map((r) => [r.era, r.image_url]),
  )

  const handleBack = () => {
    navigate(-1)
  }

  const handleNext = () => {
    navigate('/choose', { state: { ...location.state, selectionId } })
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

        <div className="content-row">
          <div className="frame-card">
            <div className="frame-grid">
              {ERA_ORDER.map((era) => (
                <div
                  key={era}
                  className="frame"
                  style={
                    imagesByEra[era]
                      ? { backgroundImage: `url(${imagesByEra[era]})`, backgroundSize: 'cover', backgroundPosition: 'center' }
                      : undefined
                  }
                />
              ))}
            </div>
            <img src={mcmLogo} className="frame-stamp" alt="" />
          </div>

          <div className="qr-panel">
            <div className="qr-title">사진을 휴대폰에 저장하세요</div>

            {selectionId && (
              <img
                className="qr-box"
                src={`/shop/capture/${selectionId}/passport/qrcode/`}
                alt="QR 코드"
              />
            )}

            <div className="qr-caption">휴대폰으로 QR코드를 스캔해주세요</div>

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
