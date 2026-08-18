import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import ringImage from "../../assets/images/빙글빙글 원.svg";
import arrowImage from "../../assets/images/이전_왼쪽 화살표.svg";
import cameraIconYellow from "../../assets/images/사진 촬영_카메라 icon_황색.svg";

// 백엔드 연동 시 아래 주석을 해제하세요.
// import { saveCapturedPhoto } from '../../api/captureApi';
import "./PhotoCapturePage.css";

const TOTAL_PHOTOS = 2;
const COUNTDOWN_START = 5;
const REST_DURATION = 3000;
const DEFAULT_SELECTION_ID = 12;

function PhotoCapturePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const selectionId = location.state?.id ?? DEFAULT_SELECTION_ID;

  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const [phase, setPhase] = useState("countdown"); // 'countdown' | 'resting' | 'uploading' | 'completed'
  const [photoStep, setPhotoStep] = useState(1);
  const [count, setCount] = useState(COUNTDOWN_START);
  const [isCameraReady, setIsCameraReady] = useState(false);
  
  // 1, 2번째 찍은 사진들을 누적 보관할 상태
  const [capturedPhotos, setCapturedPhotos] = useState([]);

  // 1. 카메라 스트림 연결
  useEffect(() => {
    let stream = null;

    const startCamera = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: "user",
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
          audio: false,
        });

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => {
            setIsCameraReady(true);
          };
        }
      } catch (error) {
        console.error("카메라 접근 권한 오류:", error);
        alert("카메라에 접근할 수 없습니다. 권한을 확인해주세요.");
      }
    };

    startCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  // 2. 캡처 및 전송 함수
  const captureAndUpload = useCallback(async () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (!video || !canvas) return;

    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const rawImageSrc = canvas.toDataURL("image/png");
    const base64Data = rawImageSrc.replace(/^data:image\/\w+;base64,/, "");

    // 찍은 사진을 배열에 추가
    const nextPhotos = [...capturedPhotos, base64Data];
    setCapturedPhotos(nextPhotos);

    try {
      setPhase("uploading");

      // 백엔드 미연동 시 가상 딜레이
      await new Promise((resolve) => setTimeout(resolve, 1000));

      if (photoStep >= TOTAL_PHOTOS) {
        setPhase("completed");
        // 전체 찍은 사진 배열(photos)을 백엔드 미연동 결과 페이지로 전달
        navigate("/photo-end", {
          state: { id: selectionId, photos: nextPhotos },
        });
      } else {
        setPhase("resting");
      }
    } catch (error) {
      console.error("사진 처리 중 오류 발생:", error);
      alert("사진 처리에 실패했습니다.");

      if (photoStep >= TOTAL_PHOTOS) {
        setPhase("completed");
      } else {
        setPhase("resting");
      }
    }
  }, [selectionId, photoStep, capturedPhotos, navigate]);

  // 3. 카운트다운 타이머
  useEffect(() => {
    if (phase !== "countdown" || !isCameraReady) return;

    if (count > 0) {
      const tick = setTimeout(() => setCount((prev) => prev - 1), 1000);
      return () => clearTimeout(tick);
    }

    if (count === 0) {
      const timer = setTimeout(() => {
        captureAndUpload();
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [phase, count, isCameraReady, captureAndUpload]);

  // 4. 휴식 상태 타이머
  useEffect(() => {
    if (phase !== "resting") return;

    const rest = setTimeout(() => {
      if (photoStep >= TOTAL_PHOTOS) {
        setPhase("completed");
      } else {
        setPhotoStep((prev) => prev + 1);
        setCount(COUNTDOWN_START);
        setPhase("countdown");
      }
    }, REST_DURATION);

    return () => clearTimeout(rest);
  }, [phase, photoStep]);

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <>
      <canvas ref={canvasRef} style={{ display: "none" }} />

      <div className="rings" aria-hidden="true">
        <div className="ring-corner top-right">
          <img src={ringImage} className="ring-img" alt="" />
        </div>
        <div className="ring-corner bottom-left">
          <img src={ringImage} className="ring-img ring-img-delay" alt="" />
        </div>
      </div>

      <header>
        <div
          className="past-content"
          onClick={handleBack}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") handleBack();
          }}
        >
          <img src={arrowImage} className="arrow" alt="" />
          <div>이전</div>
        </div>
      </header>

      <section>
        <div className="title">얼굴을 인식해주세요</div>
        <p className="subtitle">카메라에 얼굴을 정면으로 비춰주세요.</p>
        <p className="subtitle2">
          정면을 바라보고 얼굴을 화면 중앙에 맞춰주세요.
        </p>

        <div className="capture-frame">
          <span className="corner tl" />
          <span className="corner tr" />
          <span className="corner bl" />
          <span className="corner br" />

          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              borderRadius: "4px",
              position: "absolute",
              inset: 0,
            }}
          />

          {phase === "countdown" && count > 0 && (
            <div className="countdown-number" style={{ zIndex: 3 }}>
              {count}
            </div>
          )}

          {(phase === "resting" || phase === "uploading") && (
            <div
              style={{
                position: "absolute",
                inset: 0,
                backgroundColor: "rgba(0,0,0,0.6)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 3,
              }}
            >
              <span className="camera-icon-wrap">
                <img src={cameraIconYellow} className="camera-icon" alt="" />
                <span className="camera-lens" />
              </span>
              <div className="camera-status">
                {phase === "uploading" ? (
                  "사진 저장 중..."
                ) : (
                  <>
                    잠시후 촬영이
                    <br />
                    다시 시작합니다.
                  </>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="shot-counter">
          <span className="shot-counter-num">
            {photoStep} / {TOTAL_PHOTOS}
          </span>
          <span className="shot-counter-label">촬영 가능한 장수</span>
        </div>
      </section>
    </>
  );
}

export default PhotoCapturePage;