import { useEffect, useRef, useState } from 'react'
import { apiGet, apiPostForm } from '../api/client.js'

// era_loading.html의 진행률/폴링 로직을 그대로 이식한 훅.
// 상태 확인 -> (이미 진행 중이면 폴링만, 아니면) 생성 요청 -> 완료 시 최소 노출시간을 채운 뒤 onDone 호출.
const EXPECTED_DURATION = 18000
const CAP = 92
const MIN_VISIBLE_MS = 10000
const POLL_INTERVAL_MS = 1000
const MAX_POLL_MS = 120000

export function useEraGeneration(selectionId, era, onDone) {
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState(false)
  const [attempt, setAttempt] = useState(0)

  const startTimeRef = useRef(null)
  const finishedRef = useRef(false)
  const onDoneRef = useRef(onDone)

  useEffect(() => {
    onDoneRef.current = onDone
  }, [onDone])

  useEffect(() => {
    if (!selectionId) return undefined
    let cancelled = false
    finishedRef.current = false
    startTimeRef.current = Date.now()
    queueMicrotask(() => {
      if (cancelled) return
      setProgress(0)
      setError(false)
    })

    const tickTimer = setInterval(() => {
      if (finishedRef.current || cancelled) return
      const elapsed = Date.now() - startTimeRef.current
      const pct = CAP * (1 - Math.exp(-elapsed / EXPECTED_DURATION))
      setProgress(pct)
    }, 200)

    let pollTimer = null

    function finishAndRedirect() {
      if (finishedRef.current || cancelled) return
      finishedRef.current = true
      clearInterval(tickTimer)
      if (pollTimer) clearInterval(pollTimer)
      const elapsed = Date.now() - startTimeRef.current
      const minWait = Math.max(0, MIN_VISIBLE_MS - elapsed)
      setTimeout(() => {
        if (cancelled) return
        setProgress(100)
        setTimeout(() => {
          if (!cancelled) onDoneRef.current?.()
        }, 400)
      }, minWait)
    }

    function showError() {
      if (finishedRef.current || cancelled) return
      finishedRef.current = true
      clearInterval(tickTimer)
      if (pollTimer) clearInterval(pollTimer)
      setError(true)
    }

    function pollUntilDone() {
      pollTimer = setInterval(() => {
        if (Date.now() - startTimeRef.current > MAX_POLL_MS) {
          clearInterval(pollTimer)
          showError()
          return
        }
        apiGet(`/shop/capture/${selectionId}/era/${era}/status/`)
          .then((data) => {
            if (data.status === 'done') {
              clearInterval(pollTimer)
              finishAndRedirect()
            } else if (data.status === 'failed') {
              clearInterval(pollTimer)
              showError()
            }
          })
          .catch(() => {})
      }, POLL_INTERVAL_MS)
    }

    function requestGeneration() {
      apiPostForm(`/shop/capture/${selectionId}/era/${era}/generate/`, new FormData())
        .then((data) => {
          if (data.processing) {
            pollUntilDone()
            return
          }
          finishAndRedirect()
        })
        .catch(() => {
          showError()
        })
    }

    apiGet(`/shop/capture/${selectionId}/era/${era}/status/`)
      .then((data) => {
        if (data.status === 'done') {
          finishAndRedirect()
        } else if (data.status === 'processing') {
          pollUntilDone()
        } else {
          requestGeneration()
        }
      })
      .catch(() => {
        requestGeneration()
      })

    return () => {
      cancelled = true
      clearInterval(tickTimer)
      if (pollTimer) clearInterval(pollTimer)
    }
  }, [selectionId, era, attempt])

  const retry = () => setAttempt((n) => n + 1)

  return { progress, error, retry }
}
