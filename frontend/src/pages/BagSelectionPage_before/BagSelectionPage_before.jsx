import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import TimePortalTitle from '../../components/TimePortalTitle/TimePortalTitle.jsx'
import starkBackpackImage from '../../assets/images/image 54.png'
import diamondBagImage from '../../assets/images/image 55.png'
import lizShopperImage from '../../assets/images/image 56.png'
import arrowIcon from '../../assets/images/Vector.png'
import { apiGet, apiPostJson } from '../../api/client.js'
import { setSelectionId } from '../../api/session.js'
import './BagSelectionPage_before.css'

const FALLBACK_IMAGES = [starkBackpackImage, diamondBagImage, lizShopperImage]

function BagSelectionPageBefore() {
  const navigate = useNavigate()
  const [bags, setBags] = useState([])
  const [selectedId, setSelectedId] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    apiGet('/api/shop/products/')
      .then((data) => {
        if (cancelled) return
        setBags(
          data.products.map((product, index) => ({
            ...product,
            image: product.image_url || FALLBACK_IMAGES[index % FALLBACK_IMAGES.length],
          })),
        )
      })
      .catch(() => {
        if (!cancelled) setError('가방 목록을 불러오지 못했습니다.')
      })
    return () => {
      cancelled = true
    }
  }, [])

  const handleNext = async () => {
    const selectedBag = bags.find((bag) => bag.id === selectedId)
    if (!selectedBag) return

    setSubmitting(true)
    setError('')
    try {
      const { selection_id: selectionId } = await apiPostJson('/api/shop/select/', {
        product_id: selectedBag.id,
      })
      setSelectionId(selectionId)
      navigate('/timemachine', {
        state: { bag: selectedBag, selectionId },
      })
    } catch (err) {
      setError(err.message || '가방을 선택하지 못했습니다.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="bag-page">
      <div className="bag-page__stage">
        <div className="bag-page__content">
          <header className="bag-page__header">
            <TimePortalTitle className="bag-page__title" />
          </header>

          <div className="bag-page__divider" />

          <div className="bag-page__intro">
            <h2 className="bag-page__heading">취향에 맞는 가방을 골라주세요</h2>
            <p className="bag-page__subtitle">
              선택한 가방과 함께 MCM의 시간을 여행합니다
            </p>
          </div>

          <div className="bag-page__grid">
            {bags.map((bag) => (
              <button
                key={bag.id}
                type="button"
                className={
                  'bag-card' +
                  (selectedId === bag.id ? ' bag-card--selected' : '')
                }
                onClick={() => setSelectedId(bag.id)}
              >
                <div className="bag-card__image">
                  <img src={bag.image} alt={bag.name} />
                </div>
                <h3 className="bag-card__name">{bag.name}</h3>
                <p className="bag-card__description">{bag.subtitle}</p>
              </button>
            ))}
          </div>

          {error && <p className="bag-page__error">{error}</p>}

          <div className="bag-page__footer">
            <button
              type="button"
              className="bag-page__next"
              disabled={!selectedId || submitting}
              onClick={handleNext}
            >
              {submitting ? '선택 중...' : '다음 단계로'}
              <img
                src={arrowIcon}
                className="bag-page__next-arrow"
                alt=""
                aria-hidden="true"
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default BagSelectionPageBefore
