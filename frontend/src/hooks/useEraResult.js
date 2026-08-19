import { useCallback, useEffect, useState } from 'react'
import { apiGet } from '../api/client.js'

// era_result 화면 데이터(합성 결과 이미지, 재생성 가능 여부, 다음 시대)를 가져오는 훅.
export function useEraResult(selectionId, era) {
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(true)

  const refetch = useCallback(() => {
    if (!selectionId) return
    setLoading(true)
    return apiGet(`/api/shop/capture/${selectionId}/era/${era}/result/`)
      .then((data) => setResult(data))
      .finally(() => setLoading(false))
  }, [selectionId, era])

  useEffect(() => {
    queueMicrotask(refetch)
  }, [refetch])

  return { result, loading, refetch }
}
