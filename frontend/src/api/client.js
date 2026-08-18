function getCookie(name) {
  const value = `; ${document.cookie}`
  const parts = value.split(`; ${name}=`)
  if (parts.length === 2) return parts.pop().split(';').shift()
  return null
}

let csrfReady = null

// SPA는 Django 템플릿을 거치지 않아 csrftoken 쿠키가 자동으로 안 심어지므로,
// 첫 POST 전에 이 엔드포인트를 한 번 호출해 쿠키를 심어둔다 (앱 시작 시 1회, 이후 캐시).
export function ensureCsrf() {
  if (!csrfReady) {
    csrfReady = fetch('/api/accounts/csrf/', { credentials: 'include' }).catch(() => {
      csrfReady = null
    })
  }
  return csrfReady
}

async function toResult(res) {
  const contentType = res.headers.get('content-type') || ''
  const data = contentType.includes('application/json') ? await res.json() : null
  if (!res.ok) {
    const error = new Error((data && data.error) || `요청에 실패했습니다. (${res.status})`)
    error.status = res.status
    error.data = data
    throw error
  }
  return data
}

export async function apiGet(path) {
  const res = await fetch(path, { credentials: 'include' })
  return toResult(res)
}

export async function apiPostJson(path, body) {
  await ensureCsrf()
  const res = await fetch(path, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRFToken': getCookie('csrftoken'),
    },
    body: JSON.stringify(body),
  })
  return toResult(res)
}

export async function apiPostForm(path, formData) {
  await ensureCsrf()
  const res = await fetch(path, {
    method: 'POST',
    credentials: 'include',
    headers: { 'X-CSRFToken': getCookie('csrftoken') },
    body: formData,
  })
  return toResult(res)
}
