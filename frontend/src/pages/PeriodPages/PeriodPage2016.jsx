import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import './PeriodPage2016.css'

function PeriodPage2016() {
  const navigate = useNavigate()
  const location = useLocation()
  const [isRegenerating, setIsRegenerating] = useState(false)

  // 재생성 선택 페이지(PeriodPage2016Select)에서 사진을 고르고 돌아온 경우
  // location.state.regenerated 가 true로 넘어오며, 이때는 '다시 생성' 버튼을 숨긴다.
  const isFinalized = Boolean(location.state?.regenerated)
  const currentPhoto = location.state?.photo ?? null

  const handleRegenerate = () => {
    console.log('다시 생성 클릭됨')
    setIsRegenerating(true)

    // TODO: 실제 이미지 재생성 API 호출로 교체.
    // 아래는 2초 후 재생성된 두 장의 후보 사진을 들고 선택 페이지로 이동하는 자리표시자입니다.
    setTimeout(() => {
      const candidatePhotos = [currentPhoto, currentPhoto]
      navigate('/period/2016/select', { state: { photos: candidatePhotos } })
    }, 2000)
  }

  const handleNextPeriod = () => {
    navigate('/period/2026')
  }

  return (
    <div className="page-wrap">
      <div className="page">
        <header>
          <div className="line">
            <div className="rule" />
            <div className="era">
              <span className="year">1976</span>
              <span className="year">2005</span>
              <span className="year active">
                <span className="dot" />
                2016
              </span>
              <span className="year">2026</span>
            </div>
          </div>
        </header>

        <section>
          <div
            className="imgPage"
            style={
              currentPhoto
                ? { backgroundImage: `url(${currentPhoto})` }
                : undefined
            }
          >
            {isRegenerating && (
              <svg
                className="loadingSpinner"
                viewBox="0 0 100 100"
                aria-label="다시 생성 중"
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
            )}
          </div>

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

            <div className="sceneIntro">
              새로운 시선으로 움직임을 이야기한 MCM을 만나보세요.
            </div>

            <div className="select">
              {!isFinalized && !isRegenerating && (
                <button type="button" onClick={handleRegenerate}>
                  다시 생성
                </button>
              )}
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