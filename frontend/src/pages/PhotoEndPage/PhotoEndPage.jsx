import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import ringImage from "../../assets/images/빙글빙글 원.svg";
import arrowImage from "../../assets/images/이전_왼쪽 화살표.svg";

// 백엔드 연동 시 아래 주석을 해제하세요.
// import { getPhotoList, submitPhotoChoice } from "../../api/captureApi";
import "./PhotoEndPage.css";

const DEFAULT_SELECTION_ID = 12;

function PhotoEndPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const selectionId = location.state?.id ?? DEFAULT_SELECTION_ID;
  const passedPhotos = location.state?.photos || []; // 전달받은 1번째, 2번째 사진 배열

  const [photos, setPhotos] = useState([]);
  const [selectedPhotoId, setSelectedPhotoId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // 사진 목록 가져오기
  useEffect(() => {
    const fetchPhotos = async () => {
      try {
        /*
        // [백엔드 연동 시 실제 코드]
        const data = await getPhotoList(selectionId);
        setPhotos(data.photos || []);
        */

        // [프론트 단독 테스트용 Mock 코드]
        await new Promise((resolve) => setTimeout(resolve, 300));

        if (passedPhotos.length > 0) {
          // 전달받은 사진 배열을 각각 id와 함께 맵핑
          setPhotos(
            passedPhotos.map((base64, index) => ({
              id: index + 1,
              image_url: `data:image/png;base64,${base64}`,
            }))
          );
        } else {
          // 사진이 없을 경우 더미 이미지
          setPhotos([
            { id: 1, image_url: "https://via.placeholder.com/300x400?text=Photo+1" },
            { id: 2, image_url: "https://via.placeholder.com/300x400?text=Photo+2" },
          ]);
        }
      } catch (error) {
        console.error("사진 목록을 불러오지 못했습니다:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPhotos();
  }, [selectionId, passedPhotos]);

  const handleBack = () => {
    navigate(-1);
  };

  const handleSelect = (photoId) => {
    setSelectedPhotoId(photoId);
  };

  const handleStartTravel = async () => {
    if (!selectedPhotoId) return;

    try {
      /*
      // [백엔드 연동 시 실제 코드]
      const response = await submitPhotoChoice(selectionId, selectedPhotoId);
      if (response.redirect) {
        navigate(response.redirect);
      } else {
        navigate("/period/1976");
      }
      */

      // [프론트 단독 테스트용 Mock 동작]
      navigate("/period/1976");
    } catch (error) {
      console.error("선택 제출 오류:", error);
      alert("제출 처리 중 오류가 발생했습니다.");
    }
  };

  return (
    <>
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
        <div className="title">어떤 사진으로 떠날까요?</div>
        <p className="subtitle">마음에 드는 사진 한 장을 선택해주세요.</p>

        <div className="photo-select-row">
          {isLoading ? (
            <div>사진 목록을 불러오는 중입니다...</div>
          ) : (
            photos.map((photoItem) => (
              <div
                key={photoItem.id}
                className={`photo-frame ${selectedPhotoId === photoItem.id ? "selected" : ""}`}
                onClick={() => handleSelect(photoItem.id)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ")
                    handleSelect(photoItem.id);
                }}
              >
                {photoItem.image_url ? (
                  <img
                    src={photoItem.image_url}
                    className="captured-photo"
                    alt={`촬영된 얼굴 사진 ${photoItem.id}`}
                  />
                ) : (
                  <div
                    className="captured-photo-placeholder"
                    aria-hidden="true"
                  />
                )}
              </div>
            ))
          )}
        </div>

        <button
          type="button"
          className="primary-btn"
          onClick={handleStartTravel}
          disabled={!selectedPhotoId}
        >
          선택한 사진으로 시간 여행 시작하기
          <span className="primary-btn-arrow" aria-hidden="true">
            &#8250;
          </span>
        </button>
      </section>
    </>
  );
}

export default PhotoEndPage;