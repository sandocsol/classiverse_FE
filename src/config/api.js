/**
 * API 설정
 * 환경 변수로 API base URL을 관리합니다.
 */

import axios from 'axios';

// 개발 환경에서는 로컬 API 서버, 프로덕션에서는 실제 API 서버
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

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

// TODO: 로그인 기능 추가 시 인터셉터 설정
// 요청 인터셉터: 모든 요청에 토큰 자동 추가
// apiClient.interceptors.request.use(
//   (config) => {
//     const token = localStorage.getItem('authToken');
//     if (token) {
//       config.headers.Authorization = `Bearer ${token}`;
//     }
//     return config;
//   },
//   (error) => Promise.reject(error)
// );

// TODO: 응답 인터셉터: 401 에러 시 자동 로그아웃 처리
// apiClient.interceptors.response.use(
//   (response) => response,
//   (error) => {
//     if (error.response?.status === 401) {
//       // 토큰 만료 또는 인증 실패 시 처리
//       localStorage.removeItem('authToken');
//       // 로그인 페이지로 리다이렉트
//       window.location.href = '/login';
//     }
//     return Promise.reject(error);
//   }
// );

export const API_ENDPOINTS = {
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

