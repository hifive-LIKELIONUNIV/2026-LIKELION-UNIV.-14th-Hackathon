import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./PeriodPage1976Select.css";

function PeriodPage1976Select() {
  const navigate = useNavigate();
  const location = useLocation();

  const selectionId = location.state?.selectionId;
  const originalImage = location.state?.originalImage;
  const candidateImage = location.state?.candidateImage;

  // 0: 원본(original), 1: 새로 생성된 사진(candidate)
  const photos = [originalImage, candidateImage];
  const [selectedIndex, setSelectedIndex] = useState(null);

  const handleSelect = (index) => {
    setSelectedIndex(index);
  };

const handleConfirm = async () => {
    if (selectedIndex === null) return;

    const selectedPhotoUrl = photos[selectedIndex];

    try {
      /*
      // [백엔드 연동 시 실제 코드 - POST /regenerate/confirm/]
      const chosenType = selectedIndex === 0 ? "original" : "candidate";
      await fetch(`/shop/capture/${selectionId}/era/1976/regenerate/confirm/`, {
        method: 'POST',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ choice: chosenType })
      });
      */

      // 선택된 최종 사진과 함께 1976 메인 화면으로 복귀
      navigate("/period/1976", {
        state: {
          selectionId,
          photo: selectedPhotoUrl,
          regenerated: true, // 선택 완료 후 '다시 생성' 버튼 숨김 처리용
        },
      });
    } catch (error) {
      console.error("확정 전송 실패:", error);
    }
  };

  return (
    <div className="select-page-wrap">
      <div className="select-page">
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

        <div className="select-title">1976년의 장면을 완성해보세요</div>
        <div className="select-subtitle">
          선택한 사진과 함께 여행이 이어집니다
        </div>

        <div className="select-photo-row">
          {photos.map((photo, index) => (
            <div
              key={index}
              className={`select-photo-frame ${
                selectedIndex === index ? "selected" : ""
              }`}
              onClick={() => handleSelect(index)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") handleSelect(index);
              }}
            >
              {photo ? (
                <img
                  src={photo}
                  className="select-photo-img"
                  alt={index === 0 ? "기존 사진" : "재생성된 사진"}
                />
              ) : (
                <div
                  className="select-photo-placeholder"
                  aria-hidden="true"
                />
              )}
            </div>
          ))}
        </div>

        <button
          type="button"
          className={`select-confirm-btn ${
            selectedIndex !== null ? "visible" : ""
          }`}
          onClick={handleConfirm}
        >
          선택하기
          <span aria-hidden="true">&#8250;</span>
        </button>
      </div>
    </div>
  );
}

export default PeriodPage1976Select;