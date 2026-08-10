import { useNavigate, useLocation } from 'react-router-dom'
import ringImage from '../../assets/images/빙글빙글 원.svg'
import arrowImage from '../../assets/images/이전_왼쪽 화살표.svg'
import infoIcon from '../../assets/images/가방정보설명 _info icon.svg'
import './PhotoEndPage.css'

function PhotoEndPage() {
  const navigate = useNavigate()
  const location = useLocation()

  // PhotoPage에서 navigate('/photo-end', { state: { photo: capturedImage } })
  // 로 넘어온 촬영 이미지(data URL 등). 없으면 회색 플레이스홀더 표시.
  const capturedPhoto = location.state?.photo ?? null

  const handleBack = () => {
    navigate(-1)
  }

  const handleStartTravel = () => {
    // 1976 시대 페이지로 이동. 촬영 사진이 있으면 함께 넘겨서
    // PeriodPage1976 쪽에서도 이어서 쓸 수 있게 해둠.
    navigate('/period/1976', { state: { photo: capturedPhoto } })
  }

  const handleRetake = () => {
    navigate('/photo')
  }

  return (
    <>
      <div className="rings" aria-hidden="true">
        <div className="ring-corner top-right">
          <img src={ringImage} className="ring-img" alt="" />
        </div>
        <div className="ring-corner bottom-left">
          <img
            src={ringImage}
            className="ring-img ring-img-delay"
            alt=""
          />
        </div>
      </div>

      <header>
        <div
          className="past-content"
          onClick={handleBack}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') handleBack()
          }}
        >
          <img src={arrowImage} className="arrow" alt="" />
          <div>이전</div>
        </div>
      </header>

      <section>
        <div className="title">사진을 확인해주세요.</div>
        <p className="subtitle"></p>

        <div className="capture-frame">
          {/* <span className="corner tl" />
          <span className="corner tr" />
          <span className="corner bl" />
          <span className="corner br" /> */}
          {capturedPhoto ? (
            <img
              src={capturedPhoto}
              className="captured-photo"
              alt="촬영된 얼굴 사진"
            />
          ) : (
            <div className="captured-photo-placeholder" aria-hidden="true" />
          )}
        </div>

        <div className="disclaimer">
          <img
            src={infoIcon}
            className="info-icon"
            alt=""
            aria-hidden="true"
          />
          <span className="disclaimer-text">
            <span className="disclaimer-line1">
              촬영된 얼굴 이미지는 TIME PORTAL
            </span>
            &nbsp;
            <span className="disclaimer-line2">
              체험 이미지 생성에만 사용됩니다.
            </span>
          </span>
        </div>

        <button
          type="button"
          className="primary-btn"
          onClick={handleStartTravel}
        >
          시간 여행 시작하기
          <span className="primary-btn-arrow" aria-hidden="true">
            &#8250;
          </span>
        </button>

        <button type="button" className="retake-link" onClick={handleRetake}>
          다시 촬영
        </button>
      </section>
    </>
  )
}

export default PhotoEndPage