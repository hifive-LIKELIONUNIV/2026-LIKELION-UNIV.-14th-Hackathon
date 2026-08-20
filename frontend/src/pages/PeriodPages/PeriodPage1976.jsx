import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import RegenCompareModal from '../../components/RegenCompareModal/RegenCompareModal.jsx'
import { useEraResult } from '../../hooks/useEraResult.js'
import { apiPostForm } from '../../api/client.js'
import { getSelectionId } from '../../api/session.js'
import './PeriodPage1976.css'

const ERA = '1976'
const ERAS = ['1976', '2005', '2016', '2026']

function PeriodPage1976() {
  const navigate = useNavigate()
  const location = useLocation()
  const selectionId = location.state?.selectionId ?? getSelectionId()

  const [regenerating, setRegenerating] = useState(false)
  const [showRegenModal, setShowRegenModal] = useState(false)
  const [error, setError] = useState('')

  const { result, refetch } = useEraResult(selectionId, ERA)

  const handleRegenerate = async () => {
    setRegenerating(true)
    setError('')
    try {
      await apiPostForm(`/shop/capture/${selectionId}/era/${ERA}/regenerate/`, new FormData())
      setShowRegenModal(true)
    } catch (err) {
      setError(err.message || '다시 생성에 실패했어요.')
    } finally {
      setRegenerating(false)
    }
  }

  const handleRegenConfirmed = () => {
    setShowRegenModal(false)
    refetch()
  }

  const handleNextPeriod = () => {
    navigate('/loading-2005', { state: { ...location.state, selectionId } })
  }

  return (
    <div className="page-wrap">
      <div className="page">
        <header>
          <div className="line">
            <div className="rule" />
            <div className="era">
              {ERAS.map((year) => (
                <span key={year} className={`year ${year === ERA ? 'active' : ''}`}>
                  {year === ERA && <span className="dot" />}
                  {year}
                </span>
              ))}
            </div>
          </div>
        </header>

        <section>
          <div
            className="imgPage"
            style={
              !regenerating && result?.image_url
                ? { backgroundImage: `url(${result.image_url})` }
                : undefined
            }
          >
            {regenerating && (
              <div className="loading-container">
                <svg
                  className="loadingSpinner"
                  viewBox="0 0 100 100"
                  aria-label="이미지 생성 중"
                  role="status"
                >
                  <circle
                    cx="50"
                    cy="50"
                    r="42"
                    fill="none"
                    stroke="#AC7D58"
                    strokeWidth="9"
                    strokeLinecap="round"
                    pathLength="100"
                    strokeDasharray="75 100"
                  />
                </svg>
                <div className="loading-text">
                  <p>장면을 준비하고 있어요.</p>
                  <p>잠시만 기다려주세요.</p>
                </div>
              </div>
            )}
          </div>

          <div className="content">
            <div>
              <div className="contentTitle">1976, Munich</div>
              <div className="contentMiniTitle">MCM의 출발</div>
              <div className="contentTxt">
                1976년, 독일 뮌헨에서 MCM의 이야기가 시작되었습니다.
                여행을 즐기고 새로운 문화를 찾아 나서는 사람들이 늘어나던 시기, 
                MCM은 그들의 여정과 함께할 가방을 만들기 시작했습니다. 
                월계수와 다이아몬드를 담은 로고부터 코냑 컬러, 비세토스 패턴까지, 
                현재 MCM의 상징들도 함께 모습을 드러내기 시작했습니다.
              </div>
            </div>

            <div className="sceneIntro">
              여행에서 시작된 MCM의 첫 장면을 만나보세요.
            </div>

            {error && <p className="period-error">{error}</p>}

            <div className="select">
              {result?.can_regenerate && !regenerating && (
                <button type="button" onClick={handleRegenerate}>
                  다시 생성
                </button>
              )}
              <button type="button" onClick={handleNextPeriod} disabled={regenerating}>
                <div>다음 시대로</div>
                <div>&#8250;</div>
              </button>
            </div>
          </div>
        </section>
      </div>

      {showRegenModal && (
        <RegenCompareModal
          selectionId={selectionId}
          era={ERA}
          onClose={() => setShowRegenModal(false)}
          onConfirmed={handleRegenConfirmed}
        />
      )}
    </div>
  )
}

export default PeriodPage1976