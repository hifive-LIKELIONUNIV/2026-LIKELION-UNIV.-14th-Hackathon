import { useParams } from "react-router-dom";
import "./PassportPreviewPage.css";

function PassportPreviewPage() {
    const { id } = useParams();

    return (
        <div className="passport-preview">
            <img
                className="passport-preview__image"
                src={`/shop/capture/${id}/passport/preview/image/`}
                alt="네컷 결과"
            />
            <a
                className="passport-preview__download"
                href={`/shop/capture/${id}/passport/download/`}
                download
            >
                다운로드
            </a>
        </div>
    );
}

export default PassportPreviewPage;
