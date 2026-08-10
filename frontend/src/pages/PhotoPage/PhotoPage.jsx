import { useNavigate } from 'react-router-dom'
import ringImage from '../../assets/images/빙글빙글 원.svg'
import arrowImage from '../../assets/images/이전_왼쪽 화살표.svg'
import cameraIconYellow from '../../assets/images/사진 촬영_카메라 icon_황색.svg'
import cameraIconWhite from '../../assets/images/사진 촬영_카메라 icon_흰색.svg'
import infoIcon from '../../assets/images/가방정보설명 _info icon.svg'
import './PhotoPage.css'

function PhotoPage() {
  const navigate = useNavigate()

  const handleBack = () => {
    navigate(-1) // 브라우저 히스토리상 이전 페이지로 이동
  }

  const handleCapture = () => {
    // TODO: 실제 카메라 캡처 로직 연결 후, 캡처된 이미지를 state로 넘기면 됨
    // 예) navigate('/photo-end', { state: { photo: capturedImageDataUrl } })
    navigate('/photo-end')
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
        <div className="title">얼굴을 인식해주세요</div>
        <p className="subtitle">카메라에 얼굴을 정면으로 비춰주세요.</p>

        <div className="capture-frame">
          <span className="corner tl" />
          <span className="corner tr" />
          <span className="corner bl" />
          <span className="corner br" />
          <span className="camera-icon-wrap">
            <img src={cameraIconYellow} className="camera-icon" alt="" />
            <span className="camera-lens" />
          </span>
          <div className="camera-status">카메라 활성화 중</div>
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

        <button type="button" className="capture-btn" onClick={handleCapture}>
          <span className="btn-icon-wrap">
            <img src={cameraIconWhite} alt="" />
            <span className="camera-lens camera-lens-sm" />
          </span>
          촬영하기
        </button>
      </section>
    </>
  )
}

export default PhotoPage