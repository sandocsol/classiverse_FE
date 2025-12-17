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

// ------------------------------------------------------------------
// Interceptors 설정 (토큰 자동 주입 & 자동 갱신)
// ------------------------------------------------------------------

// 1. 요청 인터셉터: AccessToken 헤더 주입
apiClient.interceptors.request.use(
  (config) => {
    const url = config.url || "";

    // ✅ 로그인/재발급/로그아웃 요청에는 Authorization을 붙이지 않음
    // (찌꺼기 토큰 때문에 로그인 요청이 막히는 문제 방지)
    if (
      url.includes("/api/auth/kakao/callback") ||
      url.includes("/api/auth/refresh") ||
      url.includes("/api/auth/logout")
    ) {
      return config;
    }

    let token = localStorage.getItem('accessToken');
    
    // 개발용 토큰 예외 처리
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


// 2. 응답 인터셉터: 401 발생 시 토큰 갱신 시도
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // 401이 아니거나, 이미 재시도한 요청이면 에러 반환
    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    const refreshToken = localStorage.getItem('refreshToken');
    // 리프레시 토큰이 없으면 갱신 불가 -> 로그인 페이지로 가야 함
    if (!refreshToken) {
      return Promise.reject(error);
    }

    // 무한 루프 방지용 플래그
    originalRequest._retry = true;

    try {
      // ✅ [핵심] 백엔드 계약 준수: Body에 { refreshToken: "..." } 담아서 요청
      // 순환 참조 방지를 위해 API_BASE_URL + 문자열 경로 직접 사용
      const refreshResponse = await axios.post(
        `${API_BASE_URL}/api/auth/refresh`,
        { refreshToken: refreshToken },
        {
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );

      const { accessToken: newAccessToken, refreshToken: newRefreshToken } = refreshResponse.data;

      // 새 토큰 저장 (액세스 토큰과 리프레시 토큰 모두 반드시 저장)
      localStorage.setItem('accessToken', newAccessToken);
      localStorage.setItem('refreshToken', newRefreshToken);

      // 실패했던 원본 요청의 헤더를 새 토큰으로 교체 후 재요청
      originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
      
      // axios(originalRequest) 대신 apiClient(originalRequest) 사용
      return apiClient(originalRequest);

    } catch (refreshError) {
      // 갱신 실패 시 로그아웃 처리
      console.error("토큰 갱신 실패:", refreshError);
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      
      // 필요하다면 이벤트 발생으로 로그인 페이지 이동 트리거
      window.dispatchEvent(new CustomEvent('auth:token-expired'));
      
      return Promise.reject(refreshError);
    }
  }
);

export const API_ENDPOINTS = {
  // 인증
  AUTH_KAKAO: '/api/auth/kakao/callback',

  AUTH_REFRESH: '/api/auth/refresh',

  AUTH_LOGOUT: '/api/auth/logout',

  PROFILE_NICKNAME_UPDATE: '/api/profile/nickname',

  PROFILE_NICKNAME_CHECK: '/api/profile/nickname/check',

  PROFILE_ME: '/api/profile/me',

  PROFILE_CHARACTERS: '/api/profile/characters',
  
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

