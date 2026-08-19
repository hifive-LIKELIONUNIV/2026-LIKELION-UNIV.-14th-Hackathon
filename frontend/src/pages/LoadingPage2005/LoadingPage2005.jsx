import { useCallback } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import OrbitRing from '../../components/OrbitRing/OrbitRing.jsx'
import bgImage from '../../assets/images/2005 배경원본.png'
import { useEraGeneration } from '../../hooks/useEraGeneration.js'
import { getSelectionId } from '../../api/session.js'
import './LoadingPage2005.css'

const ERA = '2005'

function LoadingPage2005() {
  const navigate = useNavigate()
  const location = useLocation()
  const selectionId = location.state?.selectionId ?? getSelectionId()

  const handleDone = useCallback(() => {
    navigate(`/period/${ERA}`, { state: { ...location.state, selectionId } })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate, selectionId])

  const { progress, error, retry } = useEraGeneration(selectionId, ERA, handleDone)

  return (
    <div className="loading-page loading-page--2005">
      <img src={bgImage} className="loading-page__bg" alt="" />
      <div className="loading-page__overlay" />

      <div className="loading-page__stage">
        <div className="loading-page__content">
          <OrbitRing />

          <p className="loading-page__year">2005</p>

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
                MCM이 성주그룹과 함께 새롭게 시작한 시대로 이동합니다.
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default LoadingPage2005
