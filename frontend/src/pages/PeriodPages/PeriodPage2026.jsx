import cameraIconYellow from '../../assets/images/사진 촬영_카메라 icon_황색.svg'
import cameraIconWhite from '../../assets/images/사진 촬영_카메라 icon_흰색.svg'
import './PeriodPage2026.css'

function PeriodPage2026() {
  const handleCapture = () => {
    // TODO: 실제 촬영 로직 연결
    console.log('촬영하기 클릭됨')
  }

  return (
    <div className="page-wrap">
      <div className="page">
        <header>
          <div className="timeline" style={{ '--progress': 1 }}>
            <div className="year">1976</div>
            <div className="year">2005</div>
            <div className="year">2016</div>
            <div className="year active">2026</div>
          </div>
        </header>

        <section>
          <div className="imgPage">
            <span className="camera-icon-wrap">
              <img src={cameraIconYellow} className="camera-icon" alt="" />
              <span className="camera-lens" />
            </span>
            <div className="camera-status">카메라 활성화 중</div>
          </div>

          <div className="content">
            <div>
              <div className="contentTitle">2026, MCM HAUS</div>
              <div className="contentMiniTitle">
                당신과 함께하는 MCM의 새로운 여정
              </div>
              <div className="contentTxt">
                MCM의 50년, 다음 여정을 시작합니다.
                <br />
                2026년 MCM 매장에서의 모습을 담아주세요.
              </div>
            </div>

            <button
              type="button"
              className="captureCta"
              onClick={handleCapture}
            >
              <span className="btn-icon-wrap">
                <img src={cameraIconWhite} alt="" />
                <span className="camera-lens camera-lens-sm" />
              </span>
              촬영하기
            </button>
          </div>
        </section>
      </div>
    </div>
  )
}

export default PeriodPage2026