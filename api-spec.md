# TIME PORTAL API 명세서 (React 연동용)

`22-feat-네컷-프레임-적용` 브랜치 기준 (다음 브랜치에서 이어서 정리: `choose_photo_api` 추가, `signup`/`restart`/`onboarding` API 보완). 팀원이 먼저 `/api/...` 이하에 React 전용 GET 엔드포인트들을 만들어뒀고, 이번에 나머지(회원가입/재시작/사진 선택 확정)를 채워서 완성했다.

**주의 — 이전에 작성됐던 `19-refactor-api-json-전환` 브랜치 버전의 이 문서는 이 브랜치와 설계가 다르다 (모든 화면을 JSON으로 통째로 바꾸는 방식이었음). 그 브랜치는 병합되지 않았고, 지금 이 문서가 실제 동작을 코드로 직접 확인하고 다시 쓴 최신 버전이다.**

## 0. 공통 사항

### 인증 방식
Django 세션 쿠키 기반. React에서 fetch할 때 항상 쿠키를 함께 보내야 함:
```js
fetch(url, { credentials: 'include', ... })
```

### CORS 필요 없음
백엔드가 CORS를 열어주는 대신, **React(Vite) 개발 서버가 `/api`, `/shop`, `/accounts` 요청을 Django로 프록시**하는 걸 전제로 설계되어 있다 (`vite.config`에서 proxy + `changeOrigin` 설정). 그래서 브라우저 입장에서는 항상 같은 오리진으로 보이고 CORS 설정이 따로 필요 없다. 프론트에서 Vite 프록시를 안 쓰고 있다면 설정해야 함.

### CSRF
- **앱 시작 시 `GET /api/accounts/csrf/`를 한 번 호출**해서 `csrftoken` 쿠키를 받아야 함.
- 이후 모든 POST 요청에 헤더로 실어 보내야 통과됨:
```js
function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
}

fetch(url, {
  method: 'POST',
  credentials: 'include',
  headers: { 'X-CSRFToken': getCookie('csrftoken') },
  ...
});
```
- 로컬에서 React를 Vite 기본 포트(`5173`)가 아닌 다른 포트로 띄우면 `mcmProject/settings.py`의 `CSRF_TRUSTED_ORIGINS`에 추가해야 함.

### ⚠️ 요청 바디 형식이 엔드포인트마다 다름 (가장 헷갈리는 부분)
이 브랜치는 두 세대의 엔드포인트가 섞여 있다:

| 종류 | 경로 패턴 | 바디 형식 |
|---|---|---|
| 새로 만든 JSON API | `/api/accounts/...`, `/api/onboarding/...`, `/api/shop/...` | **JSON** (`Content-Type: application/json`, `JSON.stringify(...)`) |
| 기존에 있던, 이미 JSON을 반환하던 POST | `/shop/capture/.../save/`, `/shop/capture/.../era/.../generate/`, `/shop/capture/.../era/.../regenerate/`, `/shop/capture/.../era/.../regenerate/confirm/`, `/shop/capture/.../era/2026/capture/save/`, `/shop/cart/add/<id>/` | **form-urlencoded/FormData** (`request.POST.get(...)` 그대로 씀) |

새 엔드포인트에 form-data를 보내거나, 기존 엔드포인트에 JSON을 보내면 서버가 값을 못 읽는다. 아래 표에 엔드포인트별로 명시해뒀다.

### 이미지 필드
`*_url` 필드는 전부 **절대 URL**(`http://호스트/media/...`)로 내려온다. React 오리진이 백엔드와 달라도 `<img src="...">`에 그대로 써도 된다.

### 에러 응답
공통적으로 `{"error": "메시지"}` + 4xx/5xx. 일부는 `{"redirect": "..."}` 필드로 다음에 이동해야 할 화면을 안내하는데, 이건 **Django URL name 기준 힌트**이지 React 라우트가 아니라서 프론트가 자체 라우팅으로 해석해서 써야 함 (예: `next_era` 값 기준으로 다음 화면 결정 등).

---

## 1. 온보딩 / 인증

| 메서드 | 경로 | 바디 | 설명 |
|---|---|---|---|
| GET | `/api/accounts/csrf/` | - | CSRF 쿠키 발급. 앱 시작 시 1회 |
| GET | `/api/onboarding/` | - | 온보딩(첫 화면) 정적 카피 |
| POST | `/api/onboarding/restart/` | 없음 | 로그아웃 + 세션 초기화 ("처음으로") |
| POST | `/api/accounts/signup/` | **JSON** | 회원가입 |
| POST | `/api/accounts/login/` | **JSON** | 로그인 |
| POST | `/api/accounts/logout/` | 없음 | 로그아웃 |
| GET | `/api/accounts/me/` | - | 현재 로그인 상태 확인 |

**GET `/api/onboarding/`**
```json
{ "brand": "MCM Heritage Experience", "title": "Time PORTAL", "subtitle": "MCM의 시간을 건너, 그 시대 속 당신을 만나보세요." }
```

**POST `/api/onboarding/restart/`** → `{ "success": true }`

**POST `/api/accounts/signup/`** — body: `{ "email": "...", "password1": "...", "password2": "..." }`
- 성공(200): `{ "email": "a@b.com" }` (성공 시 바로 로그인 처리됨)
- 실패(400): `{ "errors": { "password2": [{ "message": "...", "code": "password_mismatch" }], ... } }` (Django 폼 에러를 `get_json_data()`로 직렬화한 형태)

**POST `/api/accounts/login/`** — body: `{ "email": "...", "password": "..." }`
- 성공(200): `{ "email": "a@b.com" }`
- 실패(401): `{ "error": "이메일 또는 비밀번호가 올바르지 않습니다." }`

**GET `/api/accounts/me/`** → `{ "authenticated": true, "email": "a@b.com" }` 또는 `{ "authenticated": false, "email": null }`

---

## 2. 가방 선택

| 메서드 | 경로 | 바디 | 설명 |
|---|---|---|---|
| GET | `/api/shop/products/` | - | 추천/기본 가방 목록 |
| POST | `/api/shop/select/` | **JSON** | 가방 선택 → selection 생성 |

**GET `/api/shop/products/`**
```json
{ "message": "취향에 맞는 가방을 골라주세요", "products": [ { "id": 1, "name": "Stark 사이드 스터드 비세토스 백팩", "subtitle": "...", "description": "...", "image_url": "http://.../media/products/1.jpg", "price": "1890000.00" } ] }
```

**POST `/api/shop/select/`** — body: `{ "product_id": 1 }` → `{ "selection_id": 12 }`

> 이후 모든 화면은 이 `selection_id`를 경로에 물고 다닌다.

---

## 3. 얼굴 촬영 / 사진 선택

| 메서드 | 경로 | 바디 | 설명 |
|---|---|---|---|
| GET | `/api/shop/capture/<id>/` | - | 현재까지 촬영한 사진 수 |
| POST | `/shop/capture/<id>/save/` | **FormData** | 캡처한 사진(base64) 저장 |
| GET | `/api/shop/capture/<id>/photos/` | - | 촬영된 사진 목록 |
| POST | `/api/shop/capture/<id>/choose/` | **JSON** | 최종 사진 확정 (이번에 새로 추가) |

**GET `/api/shop/capture/<id>/`** → `{ "photo_count": 1 }`

**POST `/shop/capture/<id>/save/`** — FormData: `image_data` (data URL, `data:image/png;base64,...`)
```json
{ "success": true, "photo_id": 5, "photo_count": 1, "next_step": "capture_again" }
```
2장 다 찍으면 `next_step: "choose"`.

**GET `/api/shop/capture/<id>/photos/`** → `{ "photos": [ { "id": 5, "image_url": "..." }, { "id": 6, "image_url": "..." } ] }`

**POST `/api/shop/capture/<id>/choose/`** — body: `{ "photo_id": 5 }`
→ `{ "success": true, "first_era": "1976" }`
(선택 확정 시 서버가 1976·2005 두 시대 이미지 생성을 백그라운드로 바로 시작함 — `first_era`로 다음 화면을 안내)

> ⚠️ 기존 HTML용 `choose_photo`(`/shop/capture/<id>/choose/submit/`)는 JSON이 아니라 실제 302 redirect를 반환해서 React에서 쓰기 애매했음 — 그래서 위 `/api/shop/capture/<id>/choose/`를 새로 만들었다. **React는 이 새 엔드포인트를 써야 한다.**

---

## 4. 시대별 생성 / 결과 / 재생성

흐름: (사진 확정 시 1976·2005 자동 백그라운드 생성 시작) → `era_status`(폴링) 또는 `era_generate`(수동 트리거) → `era_result_api`(결과 표시) → (선택) `era_regenerate` → `era_regen_choice_api` → `era_regen_confirm`.

| 메서드 | 경로 | 바디 | 설명 |
|---|---|---|---|
| GET | `/shop/capture/<id>/era/<era>/status/` | - | 생성 상태 폴링 (기존 JSON 그대로 재사용) |
| POST | `/shop/capture/<id>/era/<era>/generate/` | 없음 | 생성 수동 트리거 (동기, 완료까지 대기) |
| GET | `/api/shop/capture/<id>/era/<era>/result/` | - | 결과 조회 |
| POST | `/shop/capture/<id>/era/<era>/regenerate/` | 없음 | 다시 생성(시대당 1회, 서버가 강제) |
| GET | `/api/shop/capture/<id>/era/<era>/regen-choice/` | - | 재생성 후 원본/후보 비교 |
| POST | `/shop/capture/<id>/era/<era>/regenerate/confirm/` | **FormData** | 최종 선택 확정 |

`era`는 `1976` / `2005` / `2016` / `2026` 중 하나 (2026은 합성이 아니라 실시간 촬영, 5번 참고).

**GET `.../status/`** — 1초 간격 폴링 권장
- 진행 중: `{ "status": "pending" }` / `{ "status": "processing" }`
- 완료: `{ "status": "done", "redirect": "/shop/capture/12/era/1976/result/" }` (redirect는 무시하고 `/api/shop/capture/12/era/1976/result/`을 호출할 것)
- 실패: `{ "status": "failed" }`

**POST `.../generate/`** — status가 pending인데도 안 넘어갈 때 직접 트리거 (바디 없음)
- 이미 처리 중: `{ "processing": true }`
- 성공: `{ "success": true, "redirect": "..." }`
- 실패(500): `{ "error": "이미지 생성에 실패했어요. 잠시 후 다시 시도해주세요." }`

**GET `/api/shop/capture/<id>/era/<era>/result/`**
```json
{
  "status": "done",
  "image_url": "http://.../media/persona_results/result_12_1976.png",
  "has_candidate": false,
  "can_regenerate": true,
  "next_era": "2005"
}
```
`next_era`가 `null`이면 마지막 시대 → passport 화면으로.

**POST `.../regenerate/`** (바디 없음, 시대당 1회만 허용)
- 성공: `{ "success": true, "redirect": "..." }`
- 이미 사용함(400): `{ "error": "이미 다시 생성을 사용했습니다." }`
- 실패(500): `{ "error": "다시 생성에 실패했어요. 잠시 후 다시 시도해주세요." }`

**GET `/api/shop/capture/<id>/era/<era>/regen-choice/`**
- 정상: `{ "original_image_url": "...", "candidate_image_url": "..." }`
- 후보 없음: 404

**POST `.../regenerate/confirm/`** — FormData: `choice` (`original` 또는 `candidate`)
→ `{ "success": true, "redirect": "..." }`

---

## 5. 2026(현재) 실시간 촬영

합성이 아니라 그 자리에서 찍은 사진을 그대로 결과로 저장한다.

| 메서드 | 경로 | 바디 | 설명 |
|---|---|---|---|
| GET | `/api/shop/capture/<id>/era/2026/` | - | 촬영 완료 여부 |
| POST | `/shop/capture/<id>/era/2026/capture/save/` | **FormData** | 촬영 결과 저장 |

**GET `/api/shop/capture/<id>/era/2026/`** → `{ "status": "pending"|"done", "image_url": "..."|null }`

**POST `.../capture/save/`** — FormData: `image_data` → `{ "success": true, "redirect": "..." }`

---

## 6. 결과 모아보기 (네컷 / passport)

| 메서드 | 경로 | 설명 |
|---|---|---|
| GET | `/api/shop/capture/<id>/passport/` | 4개 결과 준비 상태 + 목록 |
| GET | `/shop/capture/<id>/passport/preview/image/` | 네컷 합성 이미지 (**바이너리 PNG**) |
| GET | `/shop/capture/<id>/passport/download/` | 네컷 다운로드 (**바이너리 PNG**, `attachment`) |
| GET | `/shop/capture/<id>/passport/qrcode/` | QR코드 이미지 (**바이너리 PNG**) |

**GET `/api/shop/capture/<id>/passport/`**
```json
{ "ready": true, "results": [ { "era": "1976", "image_url": "..." }, { "era": "2005", "image_url": "..." }, { "era": "2016", "image_url": "..." }, { "era": "2026", "image_url": "..." } ] }
```
`ready`가 `false`면 아직 4개가 다 안 끝난 것.

`preview/image/`, `download/`, `qrcode/`는 JSON이 아니라 이미지를 직접 반환한다 — `<img src="...">`/`<a href="...">`에 그대로 쓰면 됨. 프리뷰와 다운로드는 서버에서 같은 캐시된 이미지를 재사용하므로 동일한 파일이 내려온다(미리보기에서 본 것과 다운로드 결과가 다를까 걱정 안 해도 됨). QR코드는 휴대폰으로 스캔했을 때 이동할 미리보기 페이지(`passport_preview`, HTML) URL을 담고 있음 — 이 페이지는 React 앱이 아니라 서버가 직접 렌더링하는 별도의 폰 전용 화면이라 React에서 신경 쓸 필요 없음.

---

## 7. 추천 상품 / 장바구니 / 마무리

| 메서드 | 경로 | 바디 | 설명 |
|---|---|---|---|
| GET | `/api/shop/capture/<id>/recommend/` | - | 추천 상품 목록 |
| POST | `/shop/cart/add/<product_id>/` | 없음 | 장바구니 담기 (로그인 필요) |

**GET `.../recommend/`** → `{ "products": [ { "id": 2, "name": "...", "subtitle": "...", "description": "...", "image_url": "...", "price": "..." } ] }`

**POST `/shop/cart/add/<product_id>/`**
- 성공: `{ "success": true }`
- 비로그인(401): `{ "error": "로그인이 필요한 기능입니다. 원하시는 상품은 직원에게 알려주세요." }`

**"마무리" 화면(혼자 둘러보기 / 직원과 함께)은 백엔드 호출이 필요 없다** — 기존 HTML 화면(`finish.html`)도 실제로는 버튼 클릭 시 서버에 아무것도 보내지 않고 프론트(JS)가 그냥 안내 모달만 띄우는 구조다(`mode`를 서버로 보내는 폼 submit 자체가 발생하지 않음, 서버 쪽 `mode == 'with_staff'` 분기도 현재 아무 동작 없음). React도 두 안내 문구를 프론트에 하드코딩해서 그대로 보여주면 되고, "처음으로" 버튼만 `POST /api/onboarding/restart/`를 호출하면 됨.

---

## 8. 이번 작업 요약

- 팀원이 먼저 만들어 둔 `/api/shop/`, `/api/accounts/` (GET 위주 JSON 엔드포인트, `shop/api_views.py` + `accounts/api_views.py`)를 그대로 재활용.
- 빠져 있던 부분을 채움:
  - `POST /api/accounts/signup/` (신규)
  - `onboarding` 앱에 `api_views.py`/`api_urls.py` 신규 생성 → `GET /api/onboarding/`, `POST /api/onboarding/restart/` 추가, `mcmProject/urls.py`에 `api/onboarding/` 경로 연결
  - `POST /api/shop/capture/<id>/choose/` (신규) — 기존 `choose_photo`가 실제 302 redirect를 반환해서 React에서 못 쓰던 문제를 해결
- CORS는 별도 설정 없음 (Vite 프록시 방식이라 불필요) — `19` 브랜치의 `django-cors-headers` 방식과 다름.
- 모든 신규/기존 엔드포인트는 Django test client로 직접 호출해 응답을 검증함 (회원가입 성공/실패, 로그인 상태 전환, 재시작, 상품 목록, 선택 생성, 사진 저장 2장 → 선택 확정 → 백그라운드 생성 트리거까지 실제 흐름으로 확인).
