import "./LoginProcessingPage.css";

function LoginProcessingPage() {
  return (
    <div className="processing-page">
      <div className="processing-page__stage">
        <div className="processing-page__content">
          <h1 className="time-portal-title">
            <span className="time">TIME</span>
            <span className="portal">PORTAL</span>
          </h1>

          <div className="processing-page__ring-wrap">
            <div className="processing-page__ring-spin" aria-hidden="true" />
            <span className="processing-page__ring-label">PROCESSING</span>
          </div>

          <p className="processing-page__message">
            장바구니에 담은
            <br />
            가방 정보를 불러오고 있어요
          </p>

          <span className="processing-page__divider" aria-hidden="true" />

          <p className="processing-page__caption">잠시만 기다려주세요.</p>
        </div>
      </div>
    </div>
  );
}

export default LoginProcessingPage;
