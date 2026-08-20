import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import loaferImg from '../../assets/images/6f8df85604e388f13f7183e9df7b26a8184e5056.png'
import roundBagImg from '../../assets/images/c3189b2153a4fa66e9bbbfeb24398006f8561784.png'
import bucketBagImg from '../../assets/images/e9f8dd3954b9cbfa638775efd8eb60b63640b7af.png'
import twillyImg from '../../assets/images/089a86449990c908a6f10a8b56c8ba71de52adc7.png'
import { apiGet, apiPostForm } from '../../api/client.js'
import { getSelectionId } from '../../api/session.js'
import TimePortalTitle from '../../components/TimePortalTitle/TimePortalTitle.jsx'
import './ChoosePage.css'

const FALLBACK_IMAGES = [loaferImg, roundBagImg, bucketBagImg, twillyImg]

// 서버에서 Decimal("930000.00") 같은 문자열/숫자로 내려오는 가격을
// "₩930,000" 형태로 정리 (불필요한 소수점 .00 제거 + 천 단위 콤마 + 원화 기호)
function formatPrice(price) {
  if (price === null || price === undefined || price === '') return ''
  const numeric = Number(price)
  if (Number.isNaN(numeric)) return String(price)
  return `₩${numeric.toLocaleString('ko-KR', { maximumFractionDigits: 0 })}`
}

function ChoosePage() {
  const navigate = useNavigate()
  const location = useLocation()
  const selectionId = location.state?.selectionId ?? getSelectionId()

  const [products, setProducts] = useState([])
  // 응답에 cart_enabled가 없는 경우엔 기존 동작 그대로(true) 유지
  const [cartEnabled, setCartEnabled] = useState(true)
  const [addedIds, setAddedIds] = useState([])
  const [toastVisible, setToastVisible] = useState(false)
  const [toastMessage, setToastMessage] = useState('')
  const [selectedProduct, setSelectedProduct] = useState(null)

  useEffect(() => {
    if (!selectionId) return
    apiGet(`/api/shop/capture/${selectionId}/recommend/`)
      .then((data) => {
        setProducts(
          (data.products ?? []).map((product, index) => ({
            ...product,
            image: product.image_url || FALLBACK_IMAGES[index % FALLBACK_IMAGES.length],
          })),
        )
        // 로그인 여부에 따라 서버가 내려주는 값. UX용이고, 실제 차단은 서버가 해야 함.
        if (typeof data.cart_enabled === 'boolean') {
          setCartEnabled(data.cart_enabled)
        }
      })
      .catch(() => {})
  }, [selectionId])

  useEffect(() => {
    if (!toastVisible) return
    const timer = setTimeout(() => setToastVisible(false), 2000)
    return () => clearTimeout(timer)
  }, [toastVisible])

  const showToast = (message) => {
    setToastMessage(message)
    setToastVisible(true)
  }

  const handleAddToggle = async (id) => {
    if (addedIds.includes(id)) return
    try {
      await apiPostForm(`/shop/cart/add/${id}/`, new FormData())
      setAddedIds((prev) => [...prev, id])
      showToast('상품이 장바구니에 담겼습니다.')
    } catch (err) {
      showToast(err.message || '장바구니 담기에 실패했습니다.')
    }
  }

  const handleShowDetail = (product) => {
    setSelectedProduct(product)
  }

  const handleCloseDetail = () => {
    setSelectedProduct(null)
  }

  const handleNext = () => {
    navigate('/final', { state: { ...location.state, selectionId } })
  }

  return (
    <div className="choose-page-wrap">
      <div className="choose-stage">
        <div className="choose-header">
          <TimePortalTitle className="choose-title" />
        </div>

        <h2 className="choose-heading">
          함께한 가방과 잘 어울리거나 비슷한 상품들이에요
        </h2>

        <div className="choose-carousel">
          <div className="choose-track">
            {products.map((product) => {
              const isAdded = addedIds.includes(product.id)
              return (
                <div className="choose-card" key={product.id}>
                  <div className="choose-card-img">
                    <img src={product.image} alt="상품 이미지" />
                  </div>
                  <div className="choose-card-body">
                    <div className="choose-card-name">{product.name}</div>
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
                          isAdded ? 'choose-add-btn is-added' : 'choose-add-btn'
                        }
                        onClick={() => handleAddToggle(product.id)}
                      >
                        {isAdded ? '담김' : '+ 장바구니 담기'}
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div
          className="choose-next-step"
          onClick={handleNext}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') handleNext()
          }}
        >
          다음 단계로 <span>&#8250;</span>
        </div>
      </div>

      <div className={toastVisible ? 'choose-toast is-visible' : 'choose-toast'}>
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
              <img src={selectedProduct.image} alt={selectedProduct.name} />
            </div>

            <div className="choose-modal-body">
              <div className="choose-modal-brand">MCM</div>
              <div className="choose-modal-name">{selectedProduct.name}</div>
              <div className="choose-modal-price">
                {formatPrice(selectedProduct.price)}
              </div>
              <div className="choose-modal-divider"></div>
              <p className="choose-modal-desc">
                {selectedProduct.description || selectedProduct.subtitle}
              </p>
              <div className="choose-modal-thumbs">
                <div className="choose-modal-thumb">
                  <img src={selectedProduct.image} alt={selectedProduct.name} />
                </div>
                <div className="choose-modal-thumb">
                  <img src={selectedProduct.image} alt={selectedProduct.name} />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ChoosePage