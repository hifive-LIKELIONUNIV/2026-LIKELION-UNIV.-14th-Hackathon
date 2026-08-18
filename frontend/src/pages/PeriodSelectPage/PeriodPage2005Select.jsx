import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import './PeriodPage2005Select.css'

function PeriodPage2005Select() {
  const navigate = useNavigate()
  const location = useLocation()

  const originalImage = location.state?.originalImage
  const candidateImage = location.state?.candidateImage
  const previousSelectedPhotos = location.state?.selectedPhotos || {}

  const photos = [originalImage, candidateImage]
  const [selectedIndex, setSelectedIndex] = useState(null)

  const handleConfirm = () => {
    if (selectedIndex === null) return

    navigate('/period/2005', {
      state: {
        photo: photos[selectedIndex],
        regenerated: true,
        selectedPhotos: previousSelectedPhotos, // 이전 시대 정보 유지
      },
    })
  }

  return (
    <div className="select-page-wrap">
      <div className="select-page">
        <header>
          <div className="line">
            <div className="rule" />
            <div className="era">
              <span className="year">1976</span>
              <span className="year active">
                <span className="dot" />
                2005
              </span>
              <span className="year">2016</span>
              <span className="year">2026</span>
            </div>
          </div>
        </header>

        <div className="select-title">2005년의 장면을 완성해보세요</div>
        <div className="select-subtitle">
          선택한 사진과 함께 여행이 이어집니다
        </div>

        <div className="select-photo-row">
          {photos.map((photo, index) => (
            <div
              key={index}
              className={`select-photo-frame ${
                selectedIndex === index ? 'selected' : ''
              }`}
              onClick={() => setSelectedIndex(index)}
              role="button"
              tabIndex={0}
            >
              {photo ? (
                <img
                  src={photo}
                  className="select-photo-img"
                  alt={`2005년 후보 ${index + 1}`}
                />
              ) : (
                <div className="select-photo-placeholder" />
              )}
            </div>
          ))}
        </div>

        <button
          type="button"
          className={`select-confirm-btn ${
            selectedIndex !== null ? 'visible' : ''
          }`}
          onClick={handleConfirm}
        >
          선택하기
          <span aria-hidden="true">&#8250;</span>
        </button>
      </div>
    </div>
  )
}

export default PeriodPage2005Select