import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import './PeriodPage2016.css'

function PeriodPage2016() {
  const navigate = useNavigate()
  const location = useLocation()

  // 1. 이전 시대들(1976, 2005)에서 선택했던 사진 객체 가져오기
  const previousSelectedPhotos = location.state?.selectedPhotos || {}

  // 2016 선택 페이지에서 고른 사진 및 선택 완료 여부
  const selectedPhotoFromChoose = location.state?.photo ?? null
  const isFinalized = Boolean(location.state?.regenerated)

  const [isRegenerating, setIsRegenerating] = useState(false)

  // 기본 사진 및 화면 표시 사진
  const initialImage =
    location.state?.photo ||
    "https://via.placeholder.com/400x533/2b2620/AC7D58?text=2016+Initial+Photo"
  const displayImage = selectedPhotoFromChoose || initialImage

  // 현재 2016에서 선택된 사진을 누적 객체에 업데이트
  const updatedSelectedPhotos = {
    ...previousSelectedPhotos,
    2016: displayImage,
  }

  // [다시 생성] 핸들러
  const handleRegenerate = () => {
    setIsRegenerating(true)

    setTimeout(() => {
      setIsRegenerating(false)

      const originalImage = displayImage
      const candidateImage =
        "https://via.placeholder.com/400x533/3d342c/AC7D58?text=2016+Regenerated+Candidate"

      navigate('/period/2016/select', {
        state: {
          originalImage,
          candidateImage,
          selectedPhotos: previousSelectedPhotos, // 이전 시대 사진 보존
        },
      })
    }, 1500)
  }

  // [다음 시대로] 버튼 핸들러 -> 2026으로 이동 시 누적된 사진 객체 전달
  const handleNextPeriod = () => {
    navigate('/period/2026', {
      state: {
        selectedPhotos: updatedSelectedPhotos,
      },
    })
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
              !isRegenerating && displayImage
                ? { backgroundImage: `url(${displayImage})` }
                : undefined
            }
          >
            {isRegenerating && (
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
              <button
                type="button"
                onClick={handleNextPeriod}
                disabled={isRegenerating}
              >
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