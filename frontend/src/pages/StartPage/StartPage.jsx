import bgImage from '../../assets/images/image 1.png'
import ringImage from '../../assets/images/빙글빙글 원.svg'
import './StartPage.css'

function StartPage() {
  return (
    <div className="start-page">
      <div className="start-page__stage">
        <img src={bgImage} className="start-page__bg" alt="" />
        <div className="start-page__overlay" />

        <div className="start-page__content">
          <div className="start-page__top">
            <div className="start-page__ring-wrap" aria-hidden="true">
              <img src={ringImage} className="start-page__ring" alt="" />
              <div className="start-page__ring-orbit start-page__ring-orbit--outer">
                <span className="start-page__ring-spark" />
              </div>
              <div className="start-page__ring-orbit start-page__ring-orbit--inner">
                <span className="start-page__ring-spark" />
              </div>
            </div>
            <p className="start-page__eyebrow">MCM Heritage Experience</p>
          </div>

          <h1 className="start-page__title">
            <span>TIME</span>
            <span className="start-page__title--accent">PORTAL</span>
          </h1>

          <div className="start-page__bottom">
            <div className="start-page__spacer" aria-hidden="true" />
            <p className="start-page__subtitle">
              MCM의 시간을 건너, 그 시대 속 당신을 만나보세요.
            </p>
            <div className="start-page__spacer" aria-hidden="true" />
            <button type="button" className="start-page__cta">
              체험 시작하기
              <span className="start-page__cta-arrow" aria-hidden="true">
                &#8250;
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default StartPage
