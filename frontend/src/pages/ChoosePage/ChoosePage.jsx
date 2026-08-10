import { useState } from 'react'
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
  },
  {
    id: 2,
    image: roundBagImg,
    name: '상품명상품명상품명상품명상...',
    link: '#',
  },
  {
    id: 3,
    image: bucketBagImg,
    name: '상품명상품명상품명상품명상...',
    link: '#',
  },
  {
    id: 4,
    image: twillyImg,
    name: '상품명상품명상품명상품명상...',
    link: '#',
  },
]

function ChoosePage() {
  const navigate = useNavigate()
  const [addedIds, setAddedIds] = useState([])

  const handleBack = () => {
    navigate(-1)
  }

  const handleAddToggle = (id) => {
    setAddedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    )
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
                  <a className="choose-card-link" href={product.link}>
                    자세히 보기
                  </a>
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
    </div>
  )
}

export default ChoosePage