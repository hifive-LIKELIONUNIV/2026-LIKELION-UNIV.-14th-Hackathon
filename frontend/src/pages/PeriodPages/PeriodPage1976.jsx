import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import infoIcon from '../../assets/images/가방정보설명 _info icon.svg'
import downArrow from '../../assets/images/가방정보설명_아래화살표.svg'
import RegenCompareModal from '../../components/RegenCompareModal/RegenCompareModal.jsx'
import { useEraResult } from '../../hooks/useEraResult.js'
import { apiPostForm } from '../../api/client.js'
import { getSelectionId } from '../../api/session.js'
import './PeriodPage1976.css'

const ERA = '1976'

function PeriodPage1976() {
  const navigate = useNavigate()
  const location = useLocation()
  const selectionId = location.state?.selectionId ?? getSelectionId()
  const [showBagInfo, setShowBagInfo] = useState(false)
  const [showRegenModal, setShowRegenModal] = useState(false)
  const [regenerating, setRegenerating] = useState(false)
  const [error, setError] = useState('')

  const { result, refetch } = useEraResult(selectionId, ERA)

  const toggleBagInfo = () => {
    setShowBagInfo((prev) => !prev)
  }

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
          <div className="timeline" style={{ '--progress': 0 }}>
            <div className="year active">1976</div>
            <div className="year">2005</div>
            <div className="year">2016</div>
            <div className="year">2026</div>
          </div>
        </header>

        <section>
          <div
            className="imgPage"
            style={result?.image_url ? { backgroundImage: `url(${result.image_url})` } : undefined}
          />

          <div className="content">
            <div>
              <div className="contentTitle">1976, Munich</div>
              <div className="contentMiniTitle">MCM의 출발</div>
              <div className="contentTxt">
                여행이 새로운 라이프스타일이 되던 시대, MCM은 독일
                뮌헨에서 탄생했습니다. 여행용 가죽 제품과 비세토스
                패턴은 이동하는 사람들의 새로운 상징이 되었습니다.
              </div>
            </div>

            <div
              className="bagSearch"
              onClick={toggleBagInfo}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') toggleBagInfo()
              }}
              aria-expanded={showBagInfo}
            >
              <img
                className="Iimoji"
                src={infoIcon}
                alt=""
                aria-hidden="true"
              />
              <div>가방 정보 더 알아보기</div>
              <img
                className={
                  showBagInfo
                    ? 'bagSearch-arrow bagSearch-arrow--open'
                    : 'bagSearch-arrow'
                }
                src={downArrow}
                alt=""
                aria-hidden="true"
              />
            </div>

            {showBagInfo && (
              <div className="bagInfoBox">
                {/* TODO: 실제 가방 정보 텍스트로 교체 */}
                가방정보!!
              </div>
            )}

            {error && <p className="period-error">{error}</p>}

            <div className="select">
              <button
                type="button"
                onClick={handleRegenerate}
                disabled={!result?.can_regenerate || regenerating}
              >
                {regenerating ? '생성 중...' : '다시 생성'}
              </button>
              <button type="button" onClick={handleNextPeriod}>
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
