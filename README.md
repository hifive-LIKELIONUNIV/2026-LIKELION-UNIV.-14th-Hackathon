# TIME PORTAL 실행 가이드

덕성여대 하이파이브팀 · 성주재단/MCM 해커톤

## 1. 처음 받았을 때 (최초 1회 셋업)

```bash
git clone <저장소 주소>
cd 2026-LIKELION-UNIV.-14th-Hackathon
git checkout 14-feat-gpt-image-2   # 작업 브랜치로 이동

python3 -m venv myvenv
source myvenv/bin/activate

cd backend/mcmProject
pip install -r requirements.txt
```

### opencv 관련 주의사항
`requirements.txt`에는 `opencv-contrib-python-headless`만 있어야 함. 만약 `opencv-python-headless`도 같이 깔려 있으면(둘 다 설치돼 있으면) `cv2.CascadeClassifier` 관련 에러가 남. 아래로 확인:

```bash
python -c "import cv2; print(hasattr(cv2, 'CascadeClassifier'))"
```
`False`가 나오면:
```bash
pip uninstall opencv-python-headless opencv-contrib-python-headless -y
pip install opencv-contrib-python-headless
```

### .env 만들기
`.env` 파일은 **저장소 최상단**(`backend/`도 아니고 `backend/mcmProject/`도 아닌, `2026-LIKELION-UNIV.-14th-Hackathon/` 바로 아래)에 있어야 함.

```
OPENAI_API_KEY=sk-여기에-실제-키
```

키는 팀 OpenAI 프로젝트에서 발급받은 걸 사용. 개인 계정 키 쓰지 말 것 (크레딧 별도).

### DB 마이그레이션
```bash
python manage.py migrate
```

### 관리자 계정
이미 있는 계정으로 로그인하거나, 필요하면 새로 생성:
```bash
python manage.py createsuperuser
```

## 2. 매번 실행할 때

```bash
source myvenv/bin/activate
cd backend/mcmProject
python manage.py runserver
```

브라우저에서 `http://127.0.0.1:8000/` 접속.

### 웹캠 촬영 테스트할 때 — 꼭 localhost로 접속
`getUserMedia`(웹캠 접근 API)는 **HTTPS이거나 localhost/127.0.0.1일 때만 동작**함. 맥의 LAN IP(예: `192.168.x.x`)로 접속하면 카메라 권한 요청 자체가 안 뜨고 "카메라 활성화 중"에서 멈춤.

- 내 컴퓨터에서 촬영 테스트 → `http://localhost:8000/` 또는 `http://127.0.0.1:8000/`
- 휴대폰에서 QR 다운로드 테스트 → 같은 와이파이에서 맥 LAN IP로 접속 (`ifconfig | grep "inet " | grep -v 127.0.0.1`로 IP 확인 후 `python manage.py runserver 0.0.0.0:8000`으로 실행)

## 3. 관리자 페이지에서 미리 채워둬야 하는 데이터

`http://127.0.0.1:8000/admin/` 접속 후:

1. **Shop → Products**: 가방 3종(Stark/Pina/Ella)이 이미 등록돼 있어야 함. 없으면 새로 추가.
2. **Shop → Era references**: 가방 3종 × 시대(1976/2005/2016) = 총 9장. 각 조합마다 레퍼런스 이미지가 등록돼 있어야 실제 합성이 됨. 없으면 `FileNotFoundError`류 에러가 남.
   - `detail_prompt` 필드(선택): 이 가방×시대 조합에서 강조하고 싶은 디테일을 영어로 적으면 생성 프롬프트에 자동으로 추가됨.
3. **Shop → Captured photos**: 웹캠 없이 테스트하고 싶을 때, 여기서 얼굴 사진 파일을 직접 업로드하고 원하는 `Persona selection`에 연결 + `is_chosen` 체크하면 촬영 없이 바로 시대별 생성 테스트 가능.

## 4. 전체 서비스 흐름

1. 가방 선택 (`/shop/select/`)
2. 얼굴 2장 촬영 → 1장 선택 (`/shop/capture/<id>/`)
3. 1976 → 2005 → 2016: 레퍼런스 사진과 합성 (로딩 화면 → 결과 화면, "다시 생성" 1회 가능)
4. 2026(현재): 합성 없이 그 자리에서 다시 촬영
5. 네컷 결과 화면 (`/shop/capture/<id>/passport/`) — QR코드 스캔하면 4컷 합친 이미지가 휴대폰에 바로 다운로드됨
6. 추천 상품 화면 → 장바구니 담기(로그인 필요)

## 5. 핵심 코드 위치

| 내용 | 경로 |
|---|---|
| 실제 이미지 생성/프롬프트 로직 | `backend/mcmProject/shop/ai_service.py` |
| 시대별 문구(제목/설명/무드) | `backend/mcmProject/shop/constants.py` |
| 뷰(화면 로직) | `backend/mcmProject/shop/views.py` |
| URL 라우팅 | `backend/mcmProject/shop/urls.py` |
| 모델(DB 구조) | `backend/mcmProject/shop/models.py` |
| 템플릿(HTML) | `backend/mcmProject/shop/templates/shop/` |
| 얼굴 프롬프트 실험용 스크립트(참고용, 실제 서비스와 별개) | `image_test/` |

## 6. 자주 나는 에러

| 에러 | 원인 / 해결 |
|---|---|
| `ModuleNotFoundError: No module named 'django'` | venv 활성화 안 했거나 `pip install -r requirements.txt` 안 함 |
| `Cannot use ImageField because Pillow is not installed` | `pip install Pillow` (requirements.txt에 포함되어 있음) |
| `cv2.CascadeClassifier` 관련 AttributeError | 위 opencv 주의사항 참고 |
| 카메라 화면에서 안 넘어감 | LAN IP로 접속 중 → localhost로 접속 |
| `EraReference 레퍼런스 이미지가 등록되어 있지 않습니다` | admin에서 해당 가방×시대 조합 이미지 업로드 필요 |
| `OPENAI_API_KEY가 설정되어 있지 않습니다` | 저장소 최상단 `.env` 파일 확인 |
| `DisallowedHost` | `settings.py`의 `ALLOWED_HOSTS`가 `['*']`인지 확인 (개발용) |
