#!/bin/bash
# 자동/수동 배포 스크립트 — 서버(root@timeportal-mcm.site)에서 실행됨.
# GitHub Actions가 Main 브랜치에 push될 때마다 SSH로 이 스크립트를 원격 실행한다.
# 수동으로 배포하고 싶을 때도 서버에서 그냥 `bash ~/timeportal/deploy.sh` 한 줄이면 됨.
set -e  # 중간에 하나라도 실패하면 즉시 멈춤 (절반만 배포된 상태로 방치되지 않게)

REPO_DIR="/root/timeportal"
BACKEND_DIR="$REPO_DIR/backend/mcmProject"
FRONTEND_DIR="$REPO_DIR/frontend"
VENV="$REPO_DIR/myvenv"

echo "[deploy] 1/5 최신 코드 받기"
cd "$REPO_DIR"
git pull origin Main

echo "[deploy] 2/5 백엔드 의존성 설치 및 마이그레이션"
source "$VENV/bin/activate"
cd "$BACKEND_DIR"
pip install -q -r requirements.txt
python manage.py migrate --noinput
python manage.py collectstatic --noinput

echo "[deploy] 3/5 프론트 빌드"
cd "$FRONTEND_DIR"
npm install
npm run build

echo "[deploy] 4/5 gunicorn 재시작"
systemctl restart gunicorn

echo "[deploy] 5/5 배포 완료"
