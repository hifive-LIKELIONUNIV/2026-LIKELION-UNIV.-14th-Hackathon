import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import ringImage from '../../assets/images/빙글빙글 원.svg'
import arrowImage from '../../assets/images/이전_왼쪽 화살표.svg'
import { apiPostForm } from '../../api/client.js'
import { getSelectionId } from '../../api/session.js'

import './PhotoCapturePage.css'

const TOTAL_PHOTOS = 2
const COUNTDOWN_START = 5
const NEXT_SHOT_DELAY_MS = 3000

// 웹캠 원본(보통 16:9)에서 캡처 프레임 비율(3:4)만큼만 크롭해서 캔버스에 그린다.
// 미리보기가 좌우반전(셀카 모드)이라, 저장되는 사진도 동일하게 좌우반전해서 캡처한다.
function captureFrame(video, canvas) {
  const ctx = canvas.getContext('2d')
  const vw = video.videoWidth
  const vh = video.videoHeight
  const targetRatio = canvas.width / canvas.height
  const videoRatio = vw / vh

  let sx, sy, sw, sh
  if (videoRatio > targetRatio) {
    sh = vh
    sw = vh * targetRatio
    sx = (vw - sw) / 2
    sy = 0
  } else {
    sw = vw
    sh = vw / targetRatio
    sx = 0
    sy = (vh - sh) / 2
  }

  ctx.save()
  ctx.translate(canvas.width, 0)
  ctx.scale(-1, 1)
  ctx.drawImage(video, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height)
  ctx.restore()
  return canvas.toDataURL('image/png')
}

function PhotoCapturePage() {
  const navigate = useNavigate()
  const location = useLocation()
  const selectionId = location.state?.selectionId ?? getSelectionId()

  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const streamRef = useRef(null)

  const [cameraState, setCameraState] = useState('idle') // idle | ready | error
  const [photos, setPhotos] = useState([])
  const [count, setCount] = useState(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!selectionId) {
      navigate('/bags', { replace: true })
    }
  }, [selectionId, navigate])

  useEffect(() => {
    let cancelled = false

    async function initCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 600 }, height: { ideal: 800 } },
        })
        if (cancelled) {
          stream.getTracks().forEach((track) => track.stop())
          return
        }
        streamRef.current = stream
        if (videoRef.current) videoRef.current.srcObject = stream
        setCameraState('ready')
      } catch (err) {
        console.error('[PhotoCapturePage] 웹캠 접근 실패:', err)
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

  const startCountdown = () => {
    setError('')
    setCount(COUNTDOWN_START)
  }

  const handleCapture = async () => {
    setCount(null)
    const dataUrl = captureFrame(videoRef.current, canvasRef.current)

    const formData = new FormData()
    formData.append('image_data', dataUrl)

    setSaving(true)
    try {
      const data = await apiPostForm(`/shop/capture/${selectionId}/save/`, formData)
      const nextPhotos = [...photos, { id: data.photo_id, dataUrl }]
      setPhotos(nextPhotos)

      if (data.next_step === 'choose') {
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((track) => track.stop())
        }
        navigate('/photo-end', { state: { ...location.state, selectionId, photos: nextPhotos } })
      } else {
        setTimeout(startCountdown, NEXT_SHOT_DELAY_MS)
      }
    } catch (err) {
      setError(err.message || '사진 저장에 실패했어요. 다시 촬영해주세요.')
    } finally {
      setSaving(false)
    }
  }

  useEffect(() => {
    if (count === null || count <= 0) return
    const timer = setTimeout(() => setCount((prev) => prev - 1), 1000)
    return () => clearTimeout(timer)
  }, [count])

  useEffect(() => {
    if (count !== 0) return
    queueMicrotask(handleCapture)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [count])

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
          <video
            ref={videoRef}
            className="capture-frame__video"
            autoPlay
            playsInline
            muted
            style={{ display: cameraState === 'ready' ? 'block' : 'none' }}
          />

          {cameraState === 'idle' && <p className="camera-status-text">카메라 활성화 중...</p>}
          {cameraState === 'error' && (
            <p className="camera-status-text">카메라를 사용할 수 없어요. 권한을 확인해주세요.</p>
          )}

          <span className="corner tl" />
          <span className="corner tr" />
          <span className="corner bl" />
          <span className="corner br" />
          {count > 0 && <div className="countdown-number">{count}</div>}
        </div>

        <canvas ref={canvasRef} width={600} height={800} style={{ display: 'none' }} />

        <div className="shot-counter">
          <span className="shot-counter-num">
            {photos.length} / {TOTAL_PHOTOS}
          </span>
          <span className="shot-counter-label">촬영 가능한 장수</span>
        </div>

        {error && <p className="capture-error-text">{error}</p>}

        {cameraState === 'ready' && count === null && !saving && (
          <button type="button" className="capture-start-btn" onClick={startCountdown}>
            촬영하기
          </button>
        )}
      </section>
    </>
  )
}

export default PhotoCapturePage
