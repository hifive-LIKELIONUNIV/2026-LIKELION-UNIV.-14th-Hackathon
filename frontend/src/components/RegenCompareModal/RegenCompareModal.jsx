import { useEffect, useState } from 'react'
import { apiGet, apiPostForm } from '../../api/client.js'
import './RegenCompareModal.css'

// '다시 생성' 직후 기존 사진 vs 새로 생성된 사진 중 하나를 고르는 비교 모달.
// 백엔드는 시대당 재생성을 1회만 허용하며, 이 선택이 끝나야 결과(generated_image)에 반영된다.
function RegenCompareModal({ selectionId, era, onClose, onConfirmed }) {
  const [choices, setChoices] = useState(null)
  const [selected, setSelected] = useState(null)
  const [error, setError] = useState('')
  const [confirming, setConfirming] = useState(false)

  useEffect(() => {
    let cancelled = false
    apiGet(`/api/shop/capture/${selectionId}/era/${era}/regen-choice/`)
      .then((data) => {
        if (!cancelled) setChoices(data)
      })
      .catch((err) => {
        if (!cancelled) setError(err.message || '비교할 사진을 불러오지 못했습니다.')
      })
    return () => {
      cancelled = true
    }
  }, [selectionId, era])

  const handleConfirm = async () => {
    if (!selected) return
    setConfirming(true)
    setError('')
    try {
      const formData = new FormData()
      formData.append('choice', selected)
      await apiPostForm(`/shop/capture/${selectionId}/era/${era}/regenerate/confirm/`, formData)
      onConfirmed()
    } catch (err) {
      setError(err.message || '선택을 반영하지 못했습니다.')
    } finally {
      setConfirming(false)
    }
  }

  return (
    <div className="regen-modal-overlay" onClick={onClose}>
      <div className="regen-modal" onClick={(e) => e.stopPropagation()}>
        <button type="button" className="regen-modal__close" onClick={onClose} aria-label="닫기">
          &times;
        </button>

        <h3 className="regen-modal__title">어떤 사진으로 할까요?</h3>
        <p className="regen-modal__desc">마음에 드는 사진을 선택해주세요.</p>

        {error && <p className="regen-modal__error">{error}</p>}

        {choices ? (
          <div className="regen-modal__options">
            <div
              className={`regen-modal__option ${selected === 'original' ? 'is-selected' : ''}`}
              onClick={() => setSelected('original')}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') setSelected('original')
              }}
            >
              {/* <p className="regen-modal__option-label">기존 사진</p> */}
              <img src={choices.original_image_url} alt="기존 사진" />
            </div>
            <div
              className={`regen-modal__option ${selected === 'candidate' ? 'is-selected' : ''}`}
              onClick={() => setSelected('candidate')}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') setSelected('candidate')
              }}
            >
              {/* <p className="regen-modal__option-label">새로 생성한 사진</p> */}
              <img src={choices.candidate_image_url} alt="새로 생성한 사진" />
            </div>
          </div>
        ) : (
          !error && <p className="regen-modal__loading">불러오는 중...</p>
        )}

        <button
          type="button"
          className="regen-modal__confirm"
          disabled={!selected || confirming}
          onClick={handleConfirm}
        >
          {confirming ? '반영 중...' : '선택하기'}
        </button>
      </div>
    </div>
  )
}

export default RegenCompareModal
