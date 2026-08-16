"""
레퍼런스 사진에서 얼굴 영역을 대략적으로 검출해 크기 비율을 구하는 유틸리티.

OpenCV 기본 제공 Haar Cascade를 사용 — 별도 모델 다운로드 없이
opencv-python(-headless) 설치만으로 동작. 정밀한 랜드마크 검출은 아니고,
프롬프트에 넣을 "대략적인 얼굴 크기 힌트"를 얻는 용도.
"""

import cv2

_face_cascade = cv2.CascadeClassifier(
    cv2.data.haarcascades + 'haarcascade_frontalface_default.xml'
)


def detect_face_height_ratio(image_path: str):
    """이미지 전체 높이 대비, 가장 크게 잡힌 얼굴 영역의 높이 비율(0~1)을 반환.
    얼굴을 못 찾거나 이미지를 못 읽으면 None을 반환."""
    img = cv2.imread(image_path)
    if img is None:
        return None

    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    faces = _face_cascade.detectMultiScale(gray, scaleFactor=1.1, minNeighbors=5, minSize=(60, 60))
    if len(faces) == 0:
        return None

    # 여러 얼굴이 잡히면 가장 크게 잡힌 것 하나만 사용
    _, _, _, h = max(faces, key=lambda f: f[2] * f[3])
    img_h = img.shape[0]
    return h / img_h
