import { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import loaferImg from "../../assets/images/6f8df85604e388f13f7183e9df7b26a8184e5056.png";
import roundBagImg from "../../assets/images/c3189b2153a4fa66e9bbbfeb24398006f8561784.png";
import bucketBagImg from "../../assets/images/e9f8dd3954b9cbfa638775efd8eb60b63640b7af.png";
import twillyImg from "../../assets/images/089a86449990c908a6f10a8b56c8ba71de52adc7.png";
import "./ChoosePage.css";
import TimePortalTitle from "../../components/TimePortalTitle/TimePortalTitle.jsx";

// 백엔드 연결 실패 시 보여줄 기본 더미 데이터
const DEFAULT_PRODUCTS = [
  {
    id: 1,
    image: loaferImg,
    name: "로퍼 상품",
    brand: "MCM",
    title: "MCM 클래식 로퍼",
    price: "$650.00",
    color: "black",
    description: "선택한 상품과 비슷한 무드로 추천했어요. 클래식한 실루엣이 돋보이는 로퍼예요.",
  },
  {
    id: 2,
    image: roundBagImg,
    name: "라운드백 상품",
    brand: "MCM",
    title: "MCM 라운드 백",
    price: "$890.00",
    color: "black",
    description: "선택한 상품과 비슷한 컬러로 추천했어요. 동그란 실루엣이 포인트입니다.",
  },
  {
    id: 3,
    image: bucketBagImg,
    name: "버킷백 상품",
    brand: "MCM",
    title: "Dessau Drawstring Bag",
    price: "$1,080.00",
    color: "cognac",
    description: "선택한 상품과 비슷한 꼬냑 컬러로 추천했어요.",
  },
  {
    id: 4,
    image: twillyImg,
    name: "트윌리 스카프",
    brand: "MCM",
    title: "MCM 트윌리 스카프",
    price: "$210.00",
    color: "multi",
    description: "가방에 포인트를 더해주는 트윌리 스카프입니다.",
  },
];

function ChoosePage() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  // 이전 페이지(가방 선택)에서 state로 capture_id를 넘겨줬는지 확인
  const captureId = id || location.state?.captureId || 1;

  const [products, setProducts] = useState(DEFAULT_PRODUCTS); // 기본값으로 더미 설정
  const [cartEnabled, setCartEnabled] = useState(true); // 테스트용 기본 true
  const [addedIds, setAddedIds] = useState([]);
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [selectedProduct, setSelectedProduct] = useState(null);

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        const response = await fetch(`/shop/capture/${captureId}/recommend/`);
        
        if (!response.ok) {
          throw new Error("백엔드 API 응답 없음 (더미 데이터 유지)");
        }

        const data = await response.json();
        if (data.products && data.products.length > 0) {
          setProducts(data.products);
        }
        if (typeof data.cart_enabled === "boolean") {
          setCartEnabled(data.cart_enabled);
        }
      } catch (error) {
        console.warn("API 연동 실패로 테스트용 더미 데이터를 표시합니다:", error);
        // 실패 시 기본 더미 데이터(DEFAULT_PRODUCTS) 유지
      }
    };

    fetchRecommendations();
  }, [captureId]);

  useEffect(() => {
    if (!toastVisible) return;
    const timer = setTimeout(() => setToastVisible(false), 2000);
    return () => clearTimeout(timer);
  }, [toastVisible]);

  const handleAddToCart = async (productId) => {
    try {
      const response = await fetch(`/shop/cart/add/${productId}/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setAddedIds((prev) => [...prev, productId]);
        setToastMessage("상품이 장바구니에 담겼습니다.");
        setToastVisible(true);
      } else {
        alert(data.error || "로그인이 필요한 기능입니다. 원하시는 상품은 직원에게 알려주세요.");
      }
    } catch (error) {
      // API 없을 시 로컬 로직 테스트용
      console.warn("장바구니 API 호출 실패, 더미 로직으로 동작합니다:", error);
    setAddedIds((prev) => [...prev, productId]);
    setToastMessage("상품이 장바구니에 담겼습니다.");
    setToastVisible(true);
    }
  };

  const handleShowDetail = (product) => {
    setSelectedProduct(product);
  };

  const handleCloseDetail = () => {
    setSelectedProduct(null);
  };

  const handleNext = () => {
    navigate("/next-step");
  };

  return (
    <div className="choose-page-wrap">
      <div className="choose-header">
        <TimePortalTitle />
      </div>
      <div className="choose-divider" />

      <h2 className="choose-heading">
        함께한 가방과 잘 어울리거나 비슷한 상품들이에요
      </h2>

      <div className="choose-carousel">
        <div className="choose-track">
          {products.map((product) => {
            const productId = product.id || product.product_id;
            const isAdded = addedIds.includes(productId);

            return (
              <div className="choose-card" key={productId}>
                <div className="choose-card-img">
                  <img
                    src={product.image || product.image_url}
                    alt={product.name || product.title}
                  />
                </div>
                <div className="choose-card-body">
                  <div className="choose-card-name">
                    {product.name || product.title}
                  </div>
                  <button
                    type="button"
                    className="choose-card-link"
                    onClick={() => handleShowDetail(product)}
                  >
                    자세히 보기
                  </button>

                  {cartEnabled && (
                    <button
                      type="button"
                      className={
                        isAdded ? "choose-add-btn is-added" : "choose-add-btn"
                      }
                      onClick={() => handleAddToCart(productId)}
                      disabled={isAdded}
                    >
                      {isAdded ? "담김 완료" : "+ 장바구니 담기"}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div
        className="choose-next-step"
        onClick={handleNext}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") handleNext();
        }}
      >
        다음 단계로 <span>&#8250;</span>
      </div>

      <div className={toastVisible ? "choose-toast is-visible" : "choose-toast"}>
        {toastMessage}
      </div>

      {selectedProduct && (
        <div className="choose-modal-overlay" onClick={handleCloseDetail}>
          <div className="choose-modal" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="choose-modal-close"
              onClick={handleCloseDetail}
              aria-label="닫기"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>

            <div className="choose-modal-img">
              <img
                src={selectedProduct.image || selectedProduct.image_url}
                alt={selectedProduct.title || selectedProduct.name}
              />
            </div>

            <div className="choose-modal-body">
              <div className="choose-modal-brand">
                {selectedProduct.brand || "MCM"}
              </div>
              <div className="choose-modal-name">
                {selectedProduct.title || selectedProduct.name}
              </div>
              <div className="choose-modal-price">{selectedProduct.price}</div>
              <div className="choose-modal-color">
                Color: {selectedProduct.color || "Default"}
              </div>
              <div className="choose-modal-divider"></div>
              <p className="choose-modal-desc">{selectedProduct.description}</p>
              <div className="choose-modal-thumbs">
                <div className="choose-modal-thumb">
                  <img
                    src={selectedProduct.image || selectedProduct.image_url}
                    alt={selectedProduct.title || selectedProduct.name}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ChoosePage;