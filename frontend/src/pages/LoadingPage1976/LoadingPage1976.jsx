import { useCallback, useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import OrbitRing from '../../components/OrbitRing/OrbitRing.jsx'
import bgImage from '../../assets/images/1976 배경원본.png'
import { useEraGeneration } from '../../hooks/useEraGeneration.js'
import { getSelectionId } from '../../api/session.js'
import './LoadingPage1976.css'

const ERA = '1976'
const LONG_WAIT_MS = 23400

function LoadingPage1976() {
  const navigate = useNavigate()
  const location = useLocation()
  const selectionId = location.state?.selectionId ?? getSelectionId()

  const handleDone = useCallback(() => {
    navigate(`/period/${ERA}`, { state: { ...location.state, selectionId } })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate, selectionId])

  const { progress, error, retry } = useEraGeneration(selectionId, ERA, handleDone)

  const [isLongWait, setIsLongWait] = useState(false)

  useEffect(() => {
    if (error) return undefined
    let cancelled = false
    queueMicrotask(() => {
      if (!cancelled) setIsLongWait(false)
    })
    const timer = setTimeout(() => setIsLongWait(true), LONG_WAIT_MS)
    return () => {
      cancelled = true
      clearTimeout(timer)
    }
  }, [error])

  return (
    <div className="loading-page loading-page--1976">
      <img src={bgImage} className="loading-page__bg" alt="" />
      <div className="loading-page__overlay" />

      <div className="loading-page__stage">
        <div className="loading-page__content">
          <OrbitRing />

          <p className="loading-page__year">1976</p>

          {error ? (
            <>
              <p className="loading-page__caption">
                이미지 생성에 실패했어요. 잠시 후 다시 시도해주세요.
              </p>
              <button type="button" className="loading-page__retry" onClick={retry}>
                다시 시도
              </button>
            </>
          ) : (
            <>
              <div
                className="loading-page__progress-track"
                role="progressbar"
                aria-valuenow={Math.round(progress)}
                aria-valuemin={0}
                aria-valuemax={100}
              >
                <div
                  className="loading-page__progress-fill"
                  style={{ width: `${progress}%` }}
                />
              </div>

              <p className="loading-page__caption">
                {isLongWait
                  ? '1976년으로 이동중입니다. 조금만 기다려주세요..'
                  : 'MCM이 독일 뮌헨에서 탄생한 순간으로 출발합니다'}
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default LoadingPage1976