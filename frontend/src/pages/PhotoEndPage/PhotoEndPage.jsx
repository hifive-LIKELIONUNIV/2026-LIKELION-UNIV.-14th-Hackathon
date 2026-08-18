import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import ringImage from '../../assets/images/빙글빙글 원.svg'
import arrowImage from '../../assets/images/이전_왼쪽 화살표.svg'
import { apiPostForm } from '../../api/client.js'
import { getSelectionId } from '../../api/session.js'
import './PhotoEndPage.css'

function PhotoEndPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const selectionId = location.state?.selectionId ?? getSelectionId()
  const photos = location.state?.photos ?? []
  const [selectedIndex, setSelectedIndex] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleBack = () => {
    navigate(-1)
  }

  const handleSelect = (index) => {
    setSelectedIndex(index)
  }

  const handleStartTravel = async () => {
    if (selectedIndex === null) return
    const chosenPhoto = photos[selectedIndex]

    setSubmitting(true)
    setError('')
    try {
      const formData = new FormData()
      formData.append('photo_id', chosenPhoto.id)
      await apiPostForm(`/shop/capture/${selectionId}/choose/submit/`, formData)
      navigate('/loading-1976', { state: { ...location.state, selectionId } })
    } catch (err) {
      setError(err.message || '사진 선택에 실패했어요.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      <div className="rings" aria-hidden="true">
        <div className="ring-corner top-right">
          <img src={ringImage} className="ring-img" alt="" />
        </div>
        <div className="ring-corner bottom-left">
          <img src={ringImage} className="ring-img ring-img-delay" alt="" />
        </div>
      </div>

      <header>
        <div
          className="past-content"
          onClick={handleBack}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') handleBack()
          }}
        >
          <img src={arrowImage} className="arrow" alt="" />
          <div>이전</div>
        </div>
      </header>

      <section>
        <div className="title">어떤 사진으로 떠날까요?</div>
        <p className="subtitle">마음에 드는 사진 한 장을 선택해주세요.</p>

        <div className="photo-select-row">
          {photos.map((photo, index) => (
            <div
              key={photo.id ?? index}
              className={`photo-frame ${selectedIndex === index ? 'selected' : ''}`}
              onClick={() => handleSelect(index)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') handleSelect(index)
              }}
            >
              {photo?.dataUrl ? (
                <img
                  src={photo.dataUrl}
                  className="captured-photo"
                  alt={`촬영된 얼굴 사진 ${index + 1}`}
                />
              ) : (
                <div className="captured-photo-placeholder" aria-hidden="true" />
              )}
            </div>
          ))}
        </div>

        {error && <p className="photo-end-error">{error}</p>}

        <button
          type="button"
          className="primary-btn"
          onClick={handleStartTravel}
          disabled={selectedIndex === null || submitting}
        >
          {submitting ? '선택 중...' : '선택한 사진으로 시간 여행 시작하기'}
          <span className="primary-btn-arrow" aria-hidden="true">
            &#8250;
          </span>
        </button>
      </section>
    </>
  )
}

export default PhotoEndPage
