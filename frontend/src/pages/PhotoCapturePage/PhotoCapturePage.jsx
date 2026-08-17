import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import ringImage from '../../assets/images/빙글빙글 원.svg'
import arrowImage from '../../assets/images/이전_왼쪽 화살표.svg'
import cameraIconYellow from '../../assets/images/사진 촬영_카메라 icon_황색.svg'

import './PhotoCapturePage.css'

const TOTAL_PHOTOS = 2
const COUNTDOWN_START = 5
const REST_DURATION = 3000 // 촬영 사이 딜레이(ms)

function PhotoCapturePage() {
  const navigate = useNavigate()
  const [phase, setPhase] = useState('countdown') // 'countdown' | 'resting'
  const [photoStep, setPhotoStep] = useState(1)
  const [count, setCount] = useState(COUNTDOWN_START)

  // 카운트다운 진행
  useEffect(() => {
    if (phase !== 'countdown') return

    if (count > 0) {
      const tick = setTimeout(() => setCount((prev) => prev - 1), 1000)
      return () => clearTimeout(tick)
    }

    const advance = setTimeout(() => {
      if (photoStep < TOTAL_PHOTOS) {
        // 마지막 컷이 아니면 잠깐 쉬었다가 다음 촬영으로
        setPhase('resting')
      } else {
        navigate('/photo-end', { state: { photos: [null, null] } })
      }
    }, 500)

    return () => clearTimeout(advance)
  }, [phase, count, photoStep, navigate])

  // 촬영 사이 딜레이 처리
  useEffect(() => {
    if (phase !== 'resting') return

    const rest = setTimeout(() => {
      setPhotoStep((prev) => prev + 1)
      setCount(COUNTDOWN_START)
      setPhase('countdown')
    }, REST_DURATION)

    return () => clearTimeout(rest)
  }, [phase])

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
        <p className="subtitle2">정면을 바라보고 얼굴을 화면 중앙에 맞춰주세요.</p>

        <div className="capture-frame">
          <span className="corner tl" />
          <span className="corner tr" />
          <span className="corner bl" />
          <span className="corner br" />

          {phase === 'countdown' && count > 0 && (
            <div className="countdown-number">{count}</div>
          )}

          {phase === 'resting' && (
            <>
              <span className="camera-icon-wrap">
                <img src={cameraIconYellow} className="camera-icon" alt="" />
                <span className="camera-lens" />
              </span>
              <div className="camera-status">
                잠시후 촬영이
                <br />
                다시 시작합니다.
              </div>
            </>
          )}
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