import { useState } from 'react'
import './BagSelectionPage.css'

const BAGS = [
  {
    id: 'stark-backpack',
    name: 'Stark Backpack',
    description: ['도시 이동에 최적화된', '시그니처 백팩'],
  },
  {
    id: 'diamond-bag',
    name: 'Diamond Bag',
    description: ['다이아몬드 문양을', '재해석한 구조적 토트백'],
  },
  {
    id: 'liz-shopper',
    name: 'Liz Shopper',
    description: ['넉넉하고 유연한', '데일리 쇼퍼백'],
  },
]

function BagIcon() {
  return (
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path
        d="M20 24V18a12 12 0 0 1 24 0v6"
        stroke="#c99a63"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <rect x="12" y="24" width="40" height="30" rx="6" stroke="#c99a63" strokeWidth="2.5" />
      <circle cx="32" cy="38" r="3" fill="#c99a63" />
    </svg>
  )
}

function BagSelectionPage() {
  const [selectedId, setSelectedId] = useState(null)

  return (
    <div className="bag-page">
      <div className="bag-page__stage">
        <div className="bag-page__content">
          <header className="bag-page__header">
            <h1 className="bag-page__title">
              <span>TIME</span>
              <span className="bag-page__title--accent">PORTAL</span>
            </h1>
          </header>

          <div className="bag-page__divider" />

          <div className="bag-page__intro">
            <h2 className="bag-page__heading">마음에 드는 가방을 골라주세요</h2>
            <p className="bag-page__subtitle">
              선택한 가방과 함께 MCM의 시간을 여행합니다
            </p>
          </div>

          <div className="bag-page__grid">
            {BAGS.map((bag) => (
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
                  <BagIcon />
                </div>
                <h3 className="bag-card__name">{bag.name}</h3>
                <p className="bag-card__description">
                  {bag.description[0]}
                  <br />
                  {bag.description[1]}
                </p>
              </button>
            ))}
          </div>

          <div className="bag-page__footer">
            <button
              type="button"
              className="bag-page__next"
              disabled={!selectedId}
            >
              다음 단계로
              <span className="bag-page__next-arrow" aria-hidden="true">
                &#8250;
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default BagSelectionPage
