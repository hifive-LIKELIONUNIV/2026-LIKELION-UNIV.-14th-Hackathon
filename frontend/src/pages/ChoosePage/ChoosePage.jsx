import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import loaferImg from '../../assets/images/6f8df85604e388f13f7183e9df7b26a8184e5056.png'
import roundBagImg from '../../assets/images/c3189b2153a4fa66e9bbbfeb24398006f8561784.png'
import bucketBagImg from '../../assets/images/e9f8dd3954b9cbfa638775efd8eb60b63640b7af.png'
import twillyImg from '../../assets/images/089a86449990c908a6f10a8b56c8ba71de52adc7.png'
import './ChoosePage.css'

const PRODUCTS = [
  {
    id: 1,
    image: loaferImg,
    name: '상품명상품명상품명상품명상...',
    link: '#',
    brand: 'MCM',
    title: '상품명상품명상품명상품명상품명',
    price: '$650.00',
    color: 'black',
    description: '선택한 상품과 비슷한 무드로 추천했어요. 클래식한 실루엣과 편안한 착용감이 돋보이는 로퍼예요.',
  },
  {
    id: 2,
    image: roundBagImg,
    name: '상품명상품명상품명상품명상...',
    link: '#',
    brand: 'MCM',
    title: '상품명상품명상품명상품명상품명',
    price: '$890.00',
    color: 'black',
    description: '선택한 상품과 비슷한 컬러로 추천했어요. 동그란 실루엣과 스터드 장식이 포인트인 라운드백입니다.',
  },
  {
    id: 3,
    image: bucketBagImg,
    name: '상품명상품명상품명상품명상...',
    link: '#',
    brand: 'MCM',
    title: 'Dessau Drawstring Bag in Visetos',
    price: '$1,080.00',
    color: 'cognac',
    description: '선택한 상품과 비슷한 꼬냑 컬러로 추천했어요. 가벼운 착용감과 넉넉한 수납공간이 돋보이는 버킷백입니다.',
  },
  {
    id: 4,
    image: twillyImg,
    name: '상품명상품명상품명상품명상...',
    link: '#',
    brand: 'MCM',
    title: '상품명상품명상품명상품명상품명',
    price: '$210.00',
    color: 'multi',
    description: '선택한 상품과 잘 어울리는 패턴으로 추천했어요. 가방에 포인트를 더해주는 트윌리 스카프입니다.',
  },
]

function ChoosePage() {
  const navigate = useNavigate()
  const [addedIds, setAddedIds] = useState([])
  const [toastVisible, setToastVisible] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState(null)

  useEffect(() => {
    if (!toastVisible) return
    const timer = setTimeout(() => setToastVisible(false), 2000)
    return () => clearTimeout(timer)
  }, [toastVisible])

  const handleBack = () => {
    navigate(-1)
  }

  const handleAddToggle = (id) => {
    setAddedIds((prev) => {
      const isCurrentlyAdded = prev.includes(id)
      if (!isCurrentlyAdded) {
        setToastVisible(true)
      }
      return isCurrentlyAdded ? prev.filter((item) => item !== id) : [...prev, id]
    })
  }

  const handleShowDetail = (product) => {
    setSelectedProduct(product)
  }

  const handleCloseDetail = () => {
    setSelectedProduct(null)
  }

  const handleNext = () => {
    // TODO: 다음 단계 페이지가 만들어지면 navigate로 연결
    console.log('다음 단계로 클릭됨')
  }

  return (
    <div className="choose-page-wrap">
      <div className="choose-header">
        <button
          type="button"
          className="choose-back-btn"
          onClick={handleBack}
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
          이전
        </button>
        <div className="choose-title">
          TIME <span className="choose-portal">PORTAL</span>
        </div>
      </div>

      <h2 className="choose-heading">
        함께한 가방과 잘 어울리거나 비슷한 상품들이에요
      </h2>

      <div className="choose-carousel">
        <div className="choose-track">
          {PRODUCTS.map((product) => {
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
                  <button
                    type="button"
                    className={
                      isAdded ? 'choose-add-btn is-added' : 'choose-add-btn'
                    }
                    onClick={() => handleAddToggle(product.id)}
                  >
                    + 장바구니 담기
                  </button>
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

      <div className={toastVisible ? 'choose-toast is-visible' : 'choose-toast'}>
        상품이 장바구니에 담겼습니다.
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
              <img src={selectedProduct.image} alt={selectedProduct.title} />
            </div>

            <div className="choose-modal-body">
              <div className="choose-modal-brand">{selectedProduct.brand}</div>
              <div className="choose-modal-name">{selectedProduct.title}</div>
              <div className="choose-modal-price">{selectedProduct.price}</div>
              <div className="choose-modal-color">Color: {selectedProduct.color}</div>
              <div className="choose-modal-divider"></div>
              <p className="choose-modal-desc">{selectedProduct.description}</p>
              <div className="choose-modal-thumbs">
                <div className="choose-modal-thumb">
                  <img src={selectedProduct.image} alt={selectedProduct.title} />
                </div>
                <div className="choose-modal-thumb">
                  <img src={selectedProduct.image} alt={selectedProduct.title} />
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