// src/api/captureApi.js

// CSRF 쿠키 수신 (앱 최초 진입 시 또는 필요 시 호출)
export const fetchCsrfToken = async () => {
  try {
    await fetch('/csrf/', { method: 'GET' });
  } catch (error) {
    console.error('CSRF Token fetch error:', error);
  }
};

// 1. 촬영 화면용 상태 조회
export const getCaptureStatus = async (id) => {
  const res = await fetch(`/shop/capture/${id}/`);
  if (!res.ok) throw new Error('촬영 상태 조회 실패');
  return await res.json();
};

// 2. 캡처한 사진(base64) 저장 (x-www-form-urlencoded 형식 전송)
export const saveCapturedPhoto = async (id, base64Image) => {
  const params = new URLSearchParams();
  params.append('image_data', base64Image);

  const res = await fetch(`/shop/capture/${id}/save/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params,
  });

  if (!res.ok) throw new Error('사진 저장 실패');
  return await res.json();
};

// 3. 촬영된 2장 목록 조회
export const getPhotoList = async (id) => {
  const res = await fetch(`/shop/capture/${id}/choose/`);
  if (!res.ok) throw new Error('사진 목록 조회 실패');
  return await res.json();
};

// 4. 최종 선택 확정 (x-www-form-urlencoded 형식 전송)
export const submitPhotoChoice = async (id, photoId) => {
  const params = new URLSearchParams();
  params.append('photo_id', photoId);

  const res = await fetch(`/shop/capture/${id}/choose/submit/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params,
  });

  if (!res.ok) throw new Error('사진 선택 제출 실패');
  return await res.json();
};