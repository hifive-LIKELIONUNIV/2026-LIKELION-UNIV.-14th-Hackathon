import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import ringImage from '../../assets/images/빙글빙글 원.svg'
import arrowImage from '../../assets/images/이전_왼쪽 화살표.svg'
import cameraIconYellow from '../../assets/images/사진 촬영_카메라 icon_황색.svg'
import cameraIconWhite from '../../assets/images/사진 촬영_카메라 icon_흰색.svg'
import infoIcon from '../../assets/images/가방정보설명 _info icon.svg'
import './PhotoPage.css'

function PhotoPage() {
  const navigate = useNavigate()
  const location = useLocation()

  const videoRef = useRef(null)
  const streamRef = useRef(null)

  // idle | ready | error  (PeriodPage2026과 동일한 패턴)
  const [cameraState, setCameraState] = useState('idle')

  useEffect(() => {
    let cancelled = false

    async function initCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true })
        if (cancelled) {
          stream.getTracks().forEach((track) => track.stop())
          return
        }
        streamRef.current = stream
        if (videoRef.current) videoRef.current.srcObject = stream
        setCameraState('ready')
      } catch (err) {
        console.error('[PhotoPage] 웹캠 접근 실패:', err)
        if (!cancelled) setCameraState('error')
      }
    }

    initCamera()

    return () => {
      cancelled = true
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop())
        streamRef.current = null
      }
    }
  }, [])

  const handleBack = () => {
    navigate(-1)
  }

  const handleCapture = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
    }
    navigate('/photo-capture', { state: location.state })
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
          <video
            ref={videoRef}
            className="capture-frame__video"
            autoPlay
            playsInline
            muted
            style={{ display: cameraState === 'ready' ? 'block' : 'none' }}
          />

          <span className="corner tl" />
          <span className="corner tr" />
          <span className="corner bl" />
          <span className="corner br" />

          {cameraState !== 'ready' && (
            <>
              <span className="camera-icon-wrap">
                <img src={cameraIconYellow} className="camera-icon" alt="" />
                <span className="camera-lens" />
              </span>
              <div className="camera-status">
                {cameraState === 'error'
                  ? '카메라 권한을 확인해주세요'
                  : '카메라 활성화 중'}
              </div>
            </>
          )}
        </div>

        <div className="disclaimer">
          <img src={infoIcon} className="info-icon" alt="" aria-hidden="true" />
          <span className="disclaimer-text">
            <span className="disclaimer-line1">
              촬영된 얼굴 이미지는 TIME PORTAL
            </span>
            &nbsp;
            <span className="disclaimer-line2">
              체험 이미지 생성에만 사용됩니다.
            </span>
          </span>
        </div>

        <button type="button" className="capture-btn" onClick={handleCapture}>
          <span className="btn-icon-wrap">
            <img src={cameraIconWhite} alt="" />
            <span className="camera-lens camera-lens-sm" />
          </span>
          촬영하기
        </button>
      </section>
    </>
  )
}

export default PhotoPage