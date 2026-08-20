import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import RegenCompareModal from '../../components/RegenCompareModal/RegenCompareModal.jsx'
import { useEraResult } from '../../hooks/useEraResult.js'
import { apiPostForm } from '../../api/client.js'
import { getSelectionId } from '../../api/session.js'
import './PeriodPage2016.css'

const ERA = '2016'
const ERAS = ['1976', '2005', '2016', '2026']

function PeriodPage2016() {
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
    navigate('/loading-2026', { state: { ...location.state, selectionId } })
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
              <div className="contentTitle">2016, Republic of Korea</div>
              <div className="contentMiniTitle">Made to Move, 40년의 여정</div>
              <div className="contentTxt">
                2016년, 창립 40주년을 맞은 MCM은 여행과 이동에 대한 이야기를 새로운 방식으로 이어갔습니다. 
                변화하는 시대의 움직임에 주목하며, 
                ‘Made to Move’ 컬렉션을 통해 실용적인 디자인과 새로운 감각을 선보였습니다. 
                MCM이 이어온 여행의 가치는 다양한 움직임과 만나며 더 넓어졌습니다.
              </div>
            </div>

            <div className="sceneIntro">
              {/* TODO: 실제 카피로 교체 */}
              새로운 시선으로 움직임을 이야기한 MCM을 만나보세요.
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

export default PeriodPage2016