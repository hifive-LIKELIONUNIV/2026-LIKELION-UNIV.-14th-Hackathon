import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import infoIcon from '../../assets/images/가방정보설명 _info icon.svg'
import downArrow from '../../assets/images/가방정보설명_아래화살표.svg'
import './PeriodPage2005.css'

function PeriodPage2005() {
  const navigate = useNavigate()
  const location = useLocation()
  const [showBagInfo, setShowBagInfo] = useState(false)

  const toggleBagInfo = () => {
    setShowBagInfo((prev) => !prev)
  }

  const handleRegenerate = () => {
    // TODO: '다시 생성' 로직 연결
    console.log('다시 생성 클릭됨')
  }

  const handleNextPeriod = () => {
    navigate('/loading-2016', { state: location.state })
  }

  return (
    <div className="page-wrap">
      <div className="page">
        <header>
          <div className="timeline" style={{ '--progress': 1 / 3 }}>
            <div className="year">1976</div>
            <div className="year active">2005</div>
            <div className="year">2016</div>
            <div className="year">2026</div>
          </div>
        </header>

        <section>
          <div className="imgPage" />

          <div className="content">
            <div>
              <div className="contentTitle">2005, Republic of Korea</div>
              <div className="contentMiniTitle">새로운 출발</div>
              <div className="contentTxt">
                더 많은 사람이 세계를 자유롭게 오가기 시작한 2005년,
                MCM은 성주그룹과 함께 새로운 여정을 시작했습니다.
                익숙한 비세토스와 코냑 컬러를 간직한 채, 새로운 세대와
                더 넓은 세계를 향해 나아갔습니다.
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

            <div className="select">
              <button type="button" onClick={handleRegenerate}>
                다시 생성
              </button>
              <button type="button" onClick={handleNextPeriod}>
                <div>다음 시대로</div>
                <div>&#8250;</div>
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}

export default PeriodPage2005