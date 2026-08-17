import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import './PeriodPage2005Select.css'

function PeriodPage2005Select() {
  const navigate = useNavigate()
  const location = useLocation()
  const photos = location.state?.photos ?? [null, null]
  const [selectedIndex, setSelectedIndex] = useState(null)

  const handleSelect = (index) => {
    setSelectedIndex(index)
  }

  const handleConfirm = () => {
    if (selectedIndex === null) return
    // 2005 페이지로 복귀. regenerated: true 를 넘겨 '다시 생성' 버튼이 보이지 않게 한다.
    navigate('/period/2005', {
      state: { photo: photos[selectedIndex], regenerated: true },
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
              onClick={() => handleSelect(index)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') handleSelect(index)
              }}
            >
              {photo ? (
                <img
                  src={photo}
                  className="select-photo-img"
                  alt={`재생성된 2005년 장면 ${index + 1}`}
                />
              ) : (
                <div
                  className="select-photo-placeholder"
                  aria-hidden="true"
                />
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