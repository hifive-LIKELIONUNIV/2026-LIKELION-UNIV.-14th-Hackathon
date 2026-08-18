import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./PeriodPage1976.css";

const DEFAULT_SELECTION_ID = 12;

function PeriodPage1976() {
  const navigate = useNavigate();
  const location = useLocation();

  const selectionId = location.state?.selectionId ?? DEFAULT_SELECTION_ID;

  // 선택 페이지(3번째 화면)에서 골라온 사진 및 선택 완료 여부 (4번째 화면 조건)
  const selectedPhotoFromChoose = location.state?.photo ?? null;
  const isFinalized = Boolean(location.state?.regenerated);

  // 재생성 진행 상태 (2번째 화면 조건)
  const [isRegenerating, setIsRegenerating] = useState(false);

  // 초기 기본 사진 (1번째 화면)
  const initialImage =
    location.state?.photo ||
    "https://via.placeholder.com/400x533/2b2620/AC7D58?text=1976+Initial+Photo";

  // 현재 화면에 띄울 사진 (선택한 사진이 있으면 그 사진, 없으면 초기 사진)
  const displayImage = selectedPhotoFromChoose || initialImage;

  // [다시 생성] 버튼 클릭 핸들러
  const handleRegenerate = () => {
    // 2번째 화면: 스피너 및 문구 띄우기
    setIsRegenerating(true);

    // Mock: 백엔드 API 처리 대기 (1.5초 후 3번째 선택 화면으로 이동)
    setTimeout(() => {
      setIsRegenerating(false);

      const originalImage = displayImage;
      const candidateImage =
        "https://via.placeholder.com/400x533/3d342c/AC7D58?text=1976+Regenerated+Candidate";

      // 3번째 사진 선택 페이지로 이동
      navigate("/period/1976/select", {
        state: {
          selectionId,
          originalImage,
          candidateImage,
        },
      });
    }, 1500);
  };

  // [다음 시대로] 버튼 클릭 핸들러
  const handleNextPeriod = () => {
    navigate("/period/2005", { state: { selectionId } });
  };

  return (
    <div className="page-wrap">
      <div className="page">
        <header>
          <div className="line">
            <div className="rule" />
            <div className="era">
              <span className="year active">
                <span className="dot" />
                1976
              </span>
              <span className="year">2005</span>
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
            {/* 2번째 화면: 다시 생성 클릭 시에만 로딩 스피너 및 안내 문구 노출 */}
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
              <div className="contentTitle">1976, Munich</div>
              <div className="contentMiniTitle">MCM의 출발</div>
              <div className="contentTxt">
                여행이 새로운 라이프스타일이 되던 시대, MCM은 독일 뮌헨에서
                탄생했습니다. 여행용 가죽 제품과 비세토스 패턴은 이동하는
                사람들의 새로운 상징이 되었습니다.
              </div>
            </div>

            <div className="sceneIntro">
              여행에서 시작된 MCM의 첫 장면을 만나보세요.
            </div>

            <div className="select">
              {/* 
                - 최초 진입 시(1번째 화면): [다시 생성] + [다음 시대로] 노출
                - 재생성 선택 완료 시(4번째 화면) 또는 로딩 중(2번째 화면): [다시 생성] 숨김
              */}
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
  );
}

export default PeriodPage1976;