import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import cameraIconYellow from "../../assets/images/사진 촬영_카메라 icon_황색.svg";
import cameraIconWhite from "../../assets/images/사진 촬영_카메라 icon_흰색.svg";
import "./PeriodPage2026.css";

const COUNTDOWN_SECONDS = 5;

function PeriodPage2026() {
  const navigate = useNavigate();

  // idle: 촬영 대기 / counting: 카운트다운 중 / done: 촬영 완료(다시 촬영 가능)
  const [phase, setPhase] = useState("idle");
  const [count, setCount] = useState(COUNTDOWN_SECONDS);
  const timerRef = useRef(null);

  useEffect(() => {
    return () => clearInterval(timerRef.current);
  }, []);

  const startCountdown = () => {
    clearInterval(timerRef.current);
    setPhase("counting");
    setCount(COUNTDOWN_SECONDS);

    timerRef.current = setInterval(() => {
      setCount((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          // TODO: 여기서 실제 촬영(캡처) 로직 실행
          // 캡처된 이미지가 생기면 이 시점에 state로 저장해서 imgPage 배경 등에 사용
          setPhase("done");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleCapture = () => {
    if (phase === "counting") return;
    startCountdown();
  };

  const handleRetake = () => {
    startCountdown();
  };

  const handleNext = () => {
    // TODO: 캡처된 이미지가 있으면 navigate('/photo-frame', { state: { photo: capturedImage } }) 처럼 같이 넘기기
    navigate("/photo-frame");
  };

  return (
    <div className="page-wrap">
      <div className="page">
        <header>
          <div className="line">
            <div className="rule" />
            <div className="era">
              <span className="year">1976</span>
              <span className="year">2005</span>
              <span className="year">2016</span>
              <span className="year active">
                <span className="dot" />
                2026
              </span>
            </div>
          </div>
        </header>

        <section>
          <div
            className={`imgPage${phase === "done" ? " imgPage--captured" : ""}`}
          >
            {phase === "counting" && (
              <div className="imgPage__countdown">{count}</div>
            )}

            {phase === "idle" && (
              <>
                <span className="camera-icon-wrap">
                  <img src={cameraIconYellow} className="camera-icon" alt="" />
                  <span className="camera-lens" />
                </span>
                <div className="camera-status">카메라 활성화 중</div>
              </>
            )}

            {phase === "done" && <div className="camera-status">촬영 완료</div>}
          </div>

          <div className="content">
            <div>
              <div className="contentTitle">2026, MCM HAUS</div>
              <div className="contentMiniTitle">
                당신과 함께하는 MCM의 새로운 여정
              </div>
              <div className="contentTxt">
                2026년, MCM은 50번째 해를 맞았습니다. 뮌헨에서 시작된 여정은
                반세기를 지나 오늘까지 이어졌습니다. 지난 시간을 바탕으로, MCM은
                새로운 여정을 향해 나아갑니다.
              </div>
            </div>

            <div className="sceneIntro">
              MCM의 새로운 50년이 시작되는 순간을 함께해보세요.
            </div>

            <div className="captureRow">
              <button
                type="button"
                className="captureCta"
                onClick={handleCapture}
                disabled={phase === "counting"}
              >
                <span className="btn-icon-wrap">
                  <img src={cameraIconWhite} alt="" />
                  <span className="captureCta-lens" />
                </span>
                {phase === "counting" ? "촬영 중..." : "촬영하기"}
              </button>

              {phase === "done" && (
                <button
                  type="button"
                  className="retakeCta"
                  onClick={handleRetake}
                >
                  다시 촬영
                </button>
              )}
            </div>

            {phase === "done" && (
              <button
                type="button"
                className="nextStepLink"
                onClick={handleNext}
              >
                다음 단계로 <span className="nextStepLink__arrow">›</span>
              </button>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

export default PeriodPage2026;