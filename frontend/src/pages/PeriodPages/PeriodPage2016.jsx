import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import infoIcon from '../../assets/images/가방정보설명 _info icon.svg'
import downArrow from '../../assets/images/가방정보설명_아래화살표.svg'
import './PeriodPage2016.css'

function PeriodPage2016() {
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
    navigate('/period/2026')
  }

  return (
    <div className="page-wrap">
      <div className="page">
        <header>
          <div className="timeline" style={{ '--progress': 2 / 3 }}>
            <div className="year">1976</div>
            <div className="year">2005</div>
            <div className="year active">2016</div>
            <div className="year">2026</div>
          </div>
        </header>

        <section>
          <div className="imgPage" />

          <div className="content">
            <div>
              <div className="contentTitle">2016, Republic of Korea</div>
              <div className="contentMiniTitle">Made to Move, 40년의 여정</div>
              <div className="contentTxt">
                &lsquo;Made to Move&rsquo;라는 이름으로 이동의 가능성을
                새롭게 해석한 2016년, MCM은 창립 40주년을 맞았습니다.
                여행에서 시작된 MCM의 이야기는 도시와 일상을 자유롭게
                넘나드는 새로운 라이프스타일로 확장되었습니다.
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

export default PeriodPage2016