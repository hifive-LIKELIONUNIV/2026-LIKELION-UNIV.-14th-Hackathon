import { useEffect, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import cameraIconYellow from "../../assets/images/사진 촬영_카메라 icon_황색.svg";
import cameraIconWhite from "../../assets/images/사진 촬영_카메라 icon_흰색.svg";
import "./PeriodPage2026.css";

const COUNTDOWN_SECONDS = 5;

function PeriodPage2026() {
  const navigate = useNavigate();
  const location = useLocation();

  const previousSelectedPhotos = location.state?.selectedPhotos || {};

  const [phase, setPhase] = useState("idle"); // idle, counting, done
  const [count, setCount] = useState(COUNTDOWN_SECONDS);
  const [capturedImage, setCapturedImage] = useState(null);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const timerRef = useRef(null);
  const streamRef = useRef(null); // 스트림 객체 보관용

  // 웹캠 끄기 함수
  const stopWebcam = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  };

  // 컴포넌트 언마운트 시 타이머 및 카메라 정리
  useEffect(() => {
    return () => {
      clearInterval(timerRef.current);
      stopWebcam();
    };
  }, []);

  // 비디오 프레임 캡처 함수
  const captureFrame = () => {
    if (!videoRef.current || !canvasRef.current) return null;
    const video = videoRef.current;
    const canvas = canvasRef.current;

    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    const ctx = canvas.getContext("2d");
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    return canvas.toDataURL("image/png");
  };

  // 카운트다운 시작 시 웹캠을 켜는 함수
  const startCountdown = async () => {
    clearInterval(timerRef.current);
    stopWebcam(); // 기존 스트림 정리
    setCapturedImage(null);

    try {
      // 카운트다운 시작할 때 웹캠 켜기
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 1280, height: 960 },
        audio: false,
      });
      streamRef.current = stream;

      setPhase("counting");
      setCount(COUNTDOWN_SECONDS);

      // DOM에 video 요소가 반영된 후 스트림 연결
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      }, 50);

      // 카운트다운 타이머 실행
      timerRef.current = setInterval(() => {
        setCount((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);

            // 촬영 실행 후 웹캠 종료
            const imageData = captureFrame();
            stopWebcam();

            setCapturedImage(imageData);
            setPhase("done");
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (err) {
      console.error("웹캠을 켤 수 없습니다:", err);
      alert("카메라 권한을 허용해주세요.");
    }
  };

  const handleCapture = () => {
    if (phase === "counting") return;
    startCountdown();
  };

  const handleRetake = () => {
    startCountdown();
  };

  const handleNext = () => {
    const allSelectedPhotos = {
      ...previousSelectedPhotos,
      2026: capturedImage,
    };

    navigate("/photo-frame", {
      state: {
        selectedPhotos: allSelectedPhotos,
      },
    });
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
          <div className="imgPage" style={{ position: "relative", overflow: "hidden" }}>
            <canvas ref={canvasRef} style={{ display: "none" }} />

            {/* 1. idle 상태일 때: 플레이스홀더 / 안내 아이콘 */}
            {phase === "idle" && (
              <>
                <span className="camera-icon-wrap">
                  <img src={cameraIconYellow} className="camera-icon" alt="" />
                  <span className="camera-lens" />
                </span>
                <div className="camera-status">촬영하기 버튼을 눌러주세요</div>
              </>
            )}

            {/* 2. counting 상태일 때만: 실시간 웹캠 비디오 작동 */}
            {phase === "counting" && (
              <>
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    transform: "scaleX(-1)",
                  }}
                />
                <div className="imgPage__countdown" style={{ position: "absolute", zIndex: 10 }}>
                  {count}
                </div>
              </>
            )}

            {/* 3. done 상태일 때: 촬영 완료된 이미지 프리뷰 */}
            {phase === "done" && capturedImage && (
              <img
                src={capturedImage}
                alt="2026 촬영 결과"
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            )}
          </div>

          <div className="content">
            <div>
              <div className="contentTitle">2026, MCM HAUS</div>
              <div className="contentMiniTitle">당신과 함께하는 MCM의 새로운 여정</div>
              <div className="contentTxt">
                2026년, MCM은 50번째 해를 맞았습니다. 뮌헨에서 시작된 여정은 반세기를 지나 오늘까지 이어졌습니다.
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
                <button type="button" className="retakeCta" onClick={handleRetake}>
                  다시 촬영
                </button>
              )}
            </div>

            {phase === "done" && (
              <button type="button" className="nextStepLink" onClick={handleNext}>
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