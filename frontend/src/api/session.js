const SELECTION_ID_KEY = 'mcm_selection_id'

// 라우터 state는 새로고침 시 사라지므로, 진행 상태(selection_id)는 localStorage에도
// 보관해 새로고침 후에도 흐름이 끊기지 않게 한다.
export function getSelectionId() {
  const raw = localStorage.getItem(SELECTION_ID_KEY)
  return raw ? Number(raw) : null
}

export function setSelectionId(id) {
  localStorage.setItem(SELECTION_ID_KEY, String(id))
}

export function clearSelection() {
  localStorage.removeItem(SELECTION_ID_KEY)
}
