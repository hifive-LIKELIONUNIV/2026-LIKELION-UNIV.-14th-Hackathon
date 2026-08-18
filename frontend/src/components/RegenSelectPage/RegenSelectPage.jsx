import { useEffect, useReducer } from 'react'
import { useNavigate, useParams, useLocation } from 'react-router-dom'
import { apiGet, apiPostForm } from '../../api/client.js'
import { getSelectionId } from '../../api/session.js'
import './RegenSelectPage.css'

// 헤더 타임라인에 표시할 시대 목록 (진행 순서)
const ERAS = ['1976', '2005', '2016', '2026']

const initialState = { choices: null, selected: null, error: '', confirming: false }

// choices/selected/error/confirming을 하나의 state로 합쳐서
// 이펙트/핸들러 안에서 setState를 여러 번 나눠 부르지 않고 dispatch 한 번으로 처리
function reducer(state, action) {
  switch (action.type) {
    case 'reset':
      return { ...initialState }
    case 'loaded':
      return { ...state, choices: action.choices }
    case 'loadError':
      return { ...state, error: action.error }
    case 'select':
      return { ...state, selected: action.selected }
    case 'confirmStart':
      return { ...state, confirming: true, error: '' }
    case 'confirmError':
      return { ...state, confirming: false, error: action.error }
    default:
      return state
  }
}

// '다시 생성' 직후 기존 사진 vs 새로 생성된 사진 중 하나를 고르는 페이지.
// RegenCompareModal의 API 로직(GET regen-choice, POST regenerate/confirm)을 그대로 가져오고,
// 표시 방식만 모달 → 전체 페이지로 바꿈. era를 URL 파라미터로 받아 모든 시대에서 공용으로 씀.
function RegenSelectPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { era } = useParams()
  const selectionId = location.state?.selectionId ?? getSelectionId()

  const [state, dispatch] = useReducer(reducer, initialState)
  const { choices, selected, error, confirming } = state

  useEffect(() => {
    let cancelled = false
    dispatch({ type: 'reset' })

    apiGet(`/api/shop/capture/${selectionId}/era/${era}/regen-choice/`)
      .then((data) => {
        if (!cancelled) dispatch({ type: 'loaded', choices: data })
      })
      .catch((err) => {
        if (!cancelled) {
          dispatch({
            type: 'loadError',
            error: err.message || '비교할 사진을 불러오지 못했습니다.',
          })
        }
      })

    return () => {
      cancelled = true
    }
  }, [selectionId, era])

  const handleCancel = () => {
    navigate(`/period/${era}`, { state: { selectionId } })
  }

  const handleConfirm = async () => {
    if (!selected || confirming) return
    dispatch({ type: 'confirmStart' })

    try {
      const formData = new FormData()
      formData.append('choice', selected)
      await apiPostForm(`/shop/capture/${selectionId}/era/${era}/regenerate/confirm/`, formData)
      // 확정 후 원래 시대 메인 페이지로 복귀. 그 페이지의 useEraResult가
      // 마운트 시 다시 불러오므로 별도 refetch 콜백 없이도 최신 이미지가 반영됨.
      navigate(`/period/${era}`, { state: { selectionId } })
    } catch (err) {
      dispatch({ type: 'confirmError', error: err.message || '선택을 반영하지 못했습니다.' })
    }
  }

  return (
    <div className="select-page-wrap">
      <div className="select-page">
        <header>
          <div className="line">
            <div className="rule" />
            <div className="era">
              {ERAS.map((year) => (
                <span key={year} className={`year ${year === era ? 'active' : ''}`}>
                  {year === era && <span className="dot" />}
                  {year}
                </span>
              ))}
            </div>
          </div>
        </header>

        <div className="select-title">{era}년의 장면을 완성해보세요</div>
        <div className="select-subtitle">선택한 사진과 함께 여행이 이어집니다</div>

        {error && <p className="select-error">{error}</p>}

        {choices ? (
          <div className="select-photo-row">
            <div
              className={`select-photo-frame ${selected === 'original' ? 'selected' : ''}`}
              onClick={() => dispatch({ type: 'select', selected: 'original' })}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ')
                  dispatch({ type: 'select', selected: 'original' })
              }}
            >
              <img
                src={choices.original_image_url}
                className="select-photo-img"
                alt="기존 사진"
              />
            </div>
            <div
              className={`select-photo-frame ${selected === 'candidate' ? 'selected' : ''}`}
              onClick={() => dispatch({ type: 'select', selected: 'candidate' })}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ')
                  dispatch({ type: 'select', selected: 'candidate' })
              }}
            >
              <img
                src={choices.candidate_image_url}
                className="select-photo-img"
                alt="새로 생성한 사진"
              />
            </div>
          </div>
        ) : (
          !error && <p className="select-loading">불러오는 중...</p>
        )}

        <div className="select-actions">
          <button type="button" className="select-cancel-btn" onClick={handleCancel}>
            취소
          </button>
          <button
            type="button"
            className={`select-confirm-btn ${selected ? 'visible' : ''}`}
            onClick={handleConfirm}
            disabled={!selected || confirming}
          >
            {confirming ? '반영 중...' : '선택하기'}
            <span aria-hidden="true">&#8250;</span>
          </button>
        </div>
      </div>
    </div>
  )
}

export default RegenSelectPage