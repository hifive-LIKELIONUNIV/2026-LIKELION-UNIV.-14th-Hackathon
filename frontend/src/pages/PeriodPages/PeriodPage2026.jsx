import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import cameraIconYellow from '../../assets/images/사진 촬영_카메라 icon_황색.svg'
import cameraIconWhite from '../../assets/images/사진 촬영_카메라 icon_흰색.svg'
import { apiPostForm } from '../../api/client.js'
import { getSelectionId } from '../../api/session.js'
import './PeriodPage2026.css'

const COUNTDOWN_START = 5

// era_2026_capture.html과 동일한 크롭/좌우반전 캡처 로직.
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

function PeriodPage2026() {
  const navigate = useNavigate()
  const location = useLocation()
  const selectionId = location.state?.selectionId ?? getSelectionId()

  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const streamRef = useRef(null)

  const [cameraState, setCameraState] = useState('idle') // idle | ready | error
  const [count, setCount] = useState(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

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
        console.error('[PeriodPage2026] 웹캠 접근 실패:', err)
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

  const handleCapture = () => {
    setError('')
    setCount(COUNTDOWN_START)
  }

  const handleSave = async () => {
    setCount(null)
    const dataUrl = captureFrame(videoRef.current, canvasRef.current)

    const formData = new FormData()
    formData.append('image_data', dataUrl)

    setSaving(true)
    try {
      await apiPostForm(`/shop/capture/${selectionId}/era/2026/capture/save/`, formData)
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop())
      }
      navigate('/photo-frame', { state: { ...location.state, selectionId } })
    } catch (err) {
      setError(err.message || '사진 저장에 실패했어요. 다시 촬영해주세요.')
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
    queueMicrotask(handleSave)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [count])

  return (
    <div className="page-wrap">
      <div className="page">
        <header>
          <div className="timeline" style={{ '--progress': 1 }}>
            <div className="year">1976</div>
            <div className="year">2005</div>
            <div className="year">2016</div>
            <div className="year active">2026</div>
          </div>
        </header>

        <section>
          <div className="imgPage">
            <video
              ref={videoRef}
              className="imgPage__video"
              autoPlay
              playsInline
              muted
              style={{ display: cameraState === 'ready' ? 'block' : 'none' }}
            />

            {cameraState !== 'ready' && (
              <>
                <span className="camera-icon-wrap">
                  <img src={cameraIconYellow} className="camera-icon" alt="" />
                  <span className="camera-lens" />
                </span>
                <div className="camera-status">
                  {cameraState === 'error'
                    ? '카메라를 사용할 수 없어요. 권한을 확인해주세요.'
                    : '카메라 활성화 중'}
                </div>
              </>
            )}

            {count > 0 && <div className="imgPage__countdown">{count}</div>}
          </div>

          <canvas ref={canvasRef} width={600} height={800} style={{ display: 'none' }} />

          <div className="content">
            <div>
              <div className="contentTitle">2026, MCM HAUS</div>
              <div className="contentMiniTitle">
                당신과 함께하는 MCM의 새로운 여정
              </div>
              <div className="contentTxt">
                MCM의 50년, 다음 여정을 시작합니다.
                <br />
                2026년 MCM 매장에서의 모습을 담아주세요.
              </div>
            </div>

            {error && <p className="period-error">{error}</p>}

            <button
              type="button"
              className="captureCta"
              onClick={handleCapture}
              disabled={cameraState !== 'ready' || count !== null || saving}
            >
              <span className="btn-icon-wrap">
                <img src={cameraIconWhite} alt="" />
                <span className="camera-lens camera-lens-sm" />
              </span>
              {saving ? '저장 중...' : '촬영하기'}
            </button>
          </div>
        </section>
      </div>
    </div>
  )
}

export default PeriodPage2026
