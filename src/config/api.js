/**
 * API 설정
 * 환경 변수로 API base URL을 관리합니다.
 */

import axios from 'axios';

// 목 데이터 사용 여부 (환경 변수로 제어)
const USE_MOCK_DATA = import.meta.env.VITE_USE_MOCK_DATA === 'true';

// 개발 환경에서는 로컬 API 서버, 프로덕션에서는 실제 API 서버
// 목 데이터 모드일 때는 baseURL을 빈 문자열로 설정 (상대 경로 사용)
const API_BASE_URL = USE_MOCK_DATA 
  ? '' 
  : (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080');

// 또는 상대 경로를 사용하는 경우 (프록시 설정 시)
// const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

/**
 * Axios 인스턴스 생성
 * 전역 설정 및 인터셉터를 추가할 수 있습니다.
 */
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  },
});

// 요청 인터셉터: 모든 요청에 토큰 자동 추가
apiClient.interceptors.request.use(
  (config) => {
    // 1. localStorage에서 토큰 확인 (로그인 후 저장된 토큰)
    // 백엔드 요구사항: localStorage 키는 'accessToken' 사용
    let token = localStorage.getItem('accessToken');
    
    // 2. localStorage에 토큰이 없고, 개발용 토큰이 환경 변수에 설정되어 있으면 사용
    if (!token && import.meta.env.VITE_DEV_AUTH_TOKEN) {
      token = import.meta.env.VITE_DEV_AUTH_TOKEN;
    }
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 응답 인터셉터: 401 에러 시 자동 로그아웃 처리
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // 토큰 만료 또는 인증 실패 시 처리
      localStorage.removeItem('accessToken');
      // 로그인 페이지로 리다이렉트
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const API_ENDPOINTS = {
  // 인증
  DEV_LOGIN: '/api/auth/dev/login',
  
  // 책 기본 정보
  BOOK_DETAIL: (bookId) => `/api/books/${bookId}`,
  
  // 스토리 목록
  BOOK_STORIES: (bookId) => `/api/books/${bookId}/stories`,
  
  // 캐릭터 및 친밀도
  BOOK_CHARACTERS: (bookId) => `/api/books/${bookId}/characters`,
  
  // 스토리 한줄소개 (viewpoints)
  STORY_INTRO: (storyId) => `/api/stories/${storyId}/intro`,
  
  // 스토리 보기 (content)
  STORY_CONTENT: (storyId, characterId, contentId) => 
    `/api/stories/${storyId}/characters/${characterId}/contents/${contentId}`,
  
  // 캐릭터 상세 정보
  CHARACTER_DETAIL: (bookId, characterId) => `/api/books/${bookId}/characters/${characterId}`,
  
  // 스토리 완료 및 친밀도 상승
  STORY_COMPLETE: (storyId, characterId) => `/api/stories/${storyId}/characters/${characterId}/complete`,
  
  // 탐색 페이지 관련
  CATEGORIES_ME: '/api/categories/me',
  CATEGORY_BOOKS: (categoryId) => `/api/categories/${categoryId}/books`,
};

/**
 * API URL 생성 헬퍼
 */
export function getApiUrl(endpoint) {
  // endpoint가 이미 전체 URL인 경우
  if (endpoint.startsWith('http://') || endpoint.startsWith('https://')) {
    return endpoint;
  }
  
  // 상대 경로인 경우
  if (endpoint.startsWith('/')) {
    return API_BASE_URL ? `${API_BASE_URL}${endpoint}` : endpoint;
  }
  
  return `${API_BASE_URL}/${endpoint}`;
}

export default API_BASE_URL;

