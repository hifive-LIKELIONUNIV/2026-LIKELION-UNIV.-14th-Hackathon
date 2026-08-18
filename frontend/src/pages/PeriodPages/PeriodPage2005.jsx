import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import './PeriodPage2005.css'

function PeriodPage2005() {
  const navigate = useNavigate()
  const location = useLocation()

  // 1. 이전 시대들에서 선택했던 사진 객체 가져오기 (없으면 빈 객체)
  const previousSelectedPhotos = location.state?.selectedPhotos || {}

  // 2005 선택 페이지에서 골라온 사진 및 선택 완료 여부
  const selectedPhotoFromChoose = location.state?.photo ?? null
  const isFinalized = Boolean(location.state?.regenerated)

  const [isRegenerating, setIsRegenerating] = useState(false)

  // 기본 사진 및 화면 표시 사진
  const initialImage =
    location.state?.photo ||
    "https://via.placeholder.com/400x533/2b2620/AC7D58?text=2005+Initial+Photo"
  const displayImage = selectedPhotoFromChoose || initialImage

  // 현재 2005에서 선택된 사진을 누적 객체에 업데이트
  const updatedSelectedPhotos = {
    ...previousSelectedPhotos,
    2005: displayImage,
  }

  // [다시 생성] 핸들러
  const handleRegenerate = () => {
    setIsRegenerating(true)

    setTimeout(() => {
      setIsRegenerating(false)

      const originalImage = displayImage
      const candidateImage =
        "https://via.placeholder.com/400x533/3d342c/AC7D58?text=2005+Regenerated+Candidate"

      navigate('/period/2005/select', {
        state: {
          originalImage,
          candidateImage,
          selectedPhotos: previousSelectedPhotos, // 이전 시대 사진 보존
        },
      })
    }, 1500)
  }

  // [다음 시대로] 버튼 핸들러 -> 2016으로 이동 시 누적된 사진 객체 전달
  const handleNextPeriod = () => {
    navigate('/period/2016', {
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
              <span className="year active">
                <span className="dot" />
                2005
              </span>
              <span className="year">2016</span>
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
            {/* 스피너 및 안내 문구 */}
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
              <div className="contentTitle">2005, Republic of Korea</div>
              <div className="contentMiniTitle">새로운 출발</div>
              <div className="contentTxt">
                더 많은 사람이 세계를 자유롭게 오가기 시작한 2005년,
                MCM은 성주그룹과 함께 새로운 여정을 시작했습니다.
                익숙한 비세토스와 코냑 컬러를 간직한 채, 새로운 세대와
                더 넓은 세계를 향해 나아갔습니다.
              </div>
            </div>

            <div className="sceneIntro">
              더 넓은 세상으로 이어진 MCM의 여정을 따라가 보세요.
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

export default PeriodPage2005