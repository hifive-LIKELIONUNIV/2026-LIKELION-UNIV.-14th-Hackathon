import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import ringImage from '../../assets/images/빙글빙글 원.svg'
import arrowImage from '../../assets/images/이전_왼쪽 화살표.svg'

import './PhotoCapturePage.css'

const TOTAL_PHOTOS = 2
const COUNTDOWN_START = 5

function PhotoCapturePage() {
  const navigate = useNavigate()
  const [photoStep, setPhotoStep] = useState(1)
  const [count, setCount] = useState(COUNTDOWN_START)

  useEffect(() => {
    if (count > 0) {
      const tick = setTimeout(() => setCount((prev) => prev - 1), 1000)
      return () => clearTimeout(tick)
    }

    const advance = setTimeout(() => {
      if (photoStep < TOTAL_PHOTOS) {
        setPhotoStep((prev) => prev + 1)
        setCount(COUNTDOWN_START)
      } else {
        navigate('/photo-end', { state: { photos: [null, null] } })
      }
    }, 500)

    return () => clearTimeout(advance)
  }, [count, photoStep, navigate])

  const handleBack = () => {
    navigate(-1)
  }

  return (
    <>
      <div className="rings" aria-hidden="true">
        <div className="ring-corner top-right">
          <img src={ringImage} className="ring-img" alt="" />
        </div>
        <div className="ring-corner bottom-left">
          <img src={ringImage} className="ring-img ring-img-delay" alt="" />
        </div>
      </div>

      <header>
        <div
          className="past-content"
          onClick={handleBack}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') handleBack()
          }}
        >
          <img src={arrowImage} className="arrow" alt="" />
          <div>이전</div>
        </div>
      </header>

      <section>
        <div className="title">얼굴을 인식해주세요</div>
        <p className="subtitle">카메라에 얼굴을 정면으로 비춰주세요.</p>

        <div className="capture-frame">
          <span className="corner tl" />
          <span className="corner tr" />
          <span className="corner bl" />
          <span className="corner br" />
          {count > 0 && <div className="countdown-number">{count}</div>}
        </div>

        <div className="shot-counter">
          <span className="shot-counter-num">
            {photoStep} / {TOTAL_PHOTOS}
          </span>
          <span className="shot-counter-label">촬영 가능한 장수</span>
        </div>

        
      </section>
    </>
  )
}

export default PhotoCapturePage