import { useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import starkBackpackImage from '../../assets/images/image 54.png'
import diamondBagImage from '../../assets/images/image 55.png'
import lizShopperImage from '../../assets/images/image 56.png'
import airplaneIcon from '../../assets/images/clarity_airplane-solid.png'
import clockBgImage from '../../assets/images/image 82.png'
import stampImage from '../../assets/images/image 83.png'
import glowLeftImage from '../../assets/images/글로우 왼쪽.png'
import glowCenterImage from '../../assets/images/중앙 글로우.png'
import glowRightImage from '../../assets/images/오른쪽 글로우.png'
import './TimeMachinePage.css'

const BAGS = [
  {
    id: 'stark-backpack',
    name: 'Stark Backpack',
    description: '도시 이동에 최적화된 시그니처 백팩',
    image: starkBackpackImage,
  },
  {
    id: 'diamond-bag',
    name: 'Diamond Bag',
    description: '다이아몬드 문양을 재해석한 구조적 토트백',
    image: diamondBagImage,
  },
  {
    id: 'liz-shopper',
    name: 'Liz Shopper',
    description: '넉넉하고 유연한 데일리 쇼퍼백',
    image: lizShopperImage,
  },
]

function TimeMachinePage() {
  const navigate = useNavigate()
  const location = useLocation()

  const selectedBag = location.state?.bag ?? BAGS[0]

  useEffect(() => {
    const timer = setTimeout(() => navigate('/photo', { state: location.state }), 3000)
    return () => clearTimeout(timer)
  }, [navigate, location.state])

  return (
    <div className="tm-page">
      <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true">
        <defs>
          <filter id="tm-wavy-border">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.045"
              numOctaves="2"
              seed="7"
              result="tm-noise"
            />
            <feDisplacementMap
              in="SourceGraphic"
              in2="tm-noise"
              scale="4.5"
            />
          </filter>
        </defs>
      </svg>

      <img
        src={clockBgImage}
        className="tm-page__bg-clock"
        alt=""
        aria-hidden="true"
      />

      <img
        src={glowLeftImage}
        className="tm-page__side-glow tm-page__side-glow--left"
        alt=""
        aria-hidden="true"
      />
      <img
        src={glowRightImage}
        className="tm-page__side-glow tm-page__side-glow--right"
        alt=""
        aria-hidden="true"
      />

      <div className="tm-page__stage">
        <img
          src={glowCenterImage}
          className="tm-page__glow tm-page__glow--center"
          alt=""
          aria-hidden="true"
        />

        <div className="tm-page__content">
          <h1 className="tm-page__title">타임머신이 시작되었습니다.</h1>
          <p className="tm-page__subtitle">곧 얼굴 인식 화면으로 이동합니다.</p>

          <div className="tm-postcard">
            <div className="tm-postcard__frame">
              <img src={selectedBag.image} alt={selectedBag.name} />
            </div>

            <div className="tm-postcard__body">
              <p className="tm-postcard__eyebrow">시간여행을 함께할 나의 가방</p>
              <h2 className="tm-postcard__name">{selectedBag.name}</h2>
              <p className="tm-postcard__desc">{selectedBag.description}</p>

              <div className="tm-postcard__years">
                <span>1976</span>
                <span className="tm-postcard__line" aria-hidden="true" />
                <img
                  src={airplaneIcon}
                  className="tm-postcard__plane"
                  alt=""
                  aria-hidden="true"
                />
                <span className="tm-postcard__line" aria-hidden="true" />
                <span>2026</span>
              </div>
            </div>

            <img
              src={stampImage}
              className="tm-postcard__stamp"
              alt=""
              aria-hidden="true"
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default TimeMachinePage
