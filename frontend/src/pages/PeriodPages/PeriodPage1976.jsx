import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import infoIcon from '../../assets/images/가방정보설명 _info icon.svg'
import downArrow from '../../assets/images/가방정보설명_아래화살표.svg'
import './PeriodPage1976.css'

function PeriodPage1976() {
  const navigate = useNavigate()
  const [showBagInfo, setShowBagInfo] = useState(false)

  const toggleBagInfo = () => {
    setShowBagInfo((prev) => !prev)
  }

  const handleRegenerate = () => {
    // TODO: '다시 생성' 로직 연결
    console.log('다시 생성 클릭됨')
  }

  const handleNextPeriod = () => {
    navigate('/period/2005')
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
          <div className="imgPage" />

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

export default PeriodPage1976