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

// --- 토큰 재발급 로직을 위한 전역 상태 ---
let isRefreshing = false;
let failedQueue = [];

/**
 * 큐에 쌓인 요청들을 처리 (새 토큰으로 재시도 또는 에러 반환)
 */
const processQueue = (error) => {
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error);
        } else {
            // 새 토큰으로 헤더 업데이트 후 원래 요청 재시도
            prom.resolve(apiClient(prom.request)); 
        }
    });

    failedQueue = [];
};

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

// 응답 인터셉터: 401 에러 시 토큰 재발급 및 요청 재시도 로직 처리
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // 1. 에러가 401이 아니거나, 이미 재시도 처리된 요청인 경우
    if (error.response?.status !== 401 || originalRequest._retry) {
        return Promise.reject(error);
    }

    // 2. 토큰 재발급을 시도해야 하는지 판단
    // - 토큰이 없으면 재발급 불가 (로그인하지 않은 상태)
    // - 리프레시 토큰 엔드포인트 자체는 재발급 시도하지 않음 (무한 루프 방지)
    const hasToken = localStorage.getItem('accessToken');
    const isRefreshEndpoint = originalRequest.url?.includes(API_ENDPOINTS.AUTH_REFRESH);
    
    if (!hasToken || isRefreshEndpoint) {
        // 토큰이 없거나 리프레시 엔드포인트인 경우, 재발급 시도하지 않고 에러 반환
        return Promise.reject(error);
    }

    // 3. 이미 토큰 재발급 요청 중인 경우, 현재 요청을 큐에 담고 대기
    if (isRefreshing) {
        return new Promise(function(resolve, reject) {
            failedQueue.push({ resolve, reject, request: originalRequest });
        });
    }
    
    // 4. 토큰 재발급 로직 시작 (토큰이 있는 경우에만)
    isRefreshing = true;
    originalRequest._retry = true; // 재시도 플래그 설정

    // 401 에러가 발생했으니, 만료된 액세스 토큰 제거
    localStorage.removeItem('accessToken');

    try {
        // 4. 리프레시 토큰 요청
        // 리프레시 토큰은 일반적으로 HTTP Only Cookie에 저장되거나
        // 요청 본문에 명시적으로 포함되어야 합니다.
        // 여기서는 서버가 쿠키/자동 처리 등을 통해 리프레시 토큰을 식별한다고 가정하고,
        // 인증 헤더 없이 리프레시 엔드포인트에 요청합니다.
        const refreshResponse = await axios.post(
            getApiUrl(API_ENDPOINTS.AUTH_REFRESH), 
            {}, 
            { baseURL: API_BASE_URL } 
        );
        
        const newAccessToken = refreshResponse.data.accessToken;

        // 5. 새 토큰 저장
        localStorage.setItem('accessToken', newAccessToken);

        // 6. apiClient의 기본 헤더를 새 토큰으로 업데이트하여 향후 요청에 사용
        apiClient.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`;

        // 7. 큐에 있던 모든 요청 재시도
        processQueue(null);
        
        // 8. 현재 실패했던 원본 요청도 새 토큰으로 헤더를 업데이트하여 재시도
        originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
        return apiClient(originalRequest);

    } catch (refreshError) {
        // 9. 리프레시 토큰 요청마저 실패한 경우
        // - 리프레시 토큰 만료
        // - 리프레시 토큰이 없음
        // - 서버 인증 실패
        processQueue(refreshError);
        
        // 토큰 제거 (상태 관리는 AuthProvider에서 처리)
        localStorage.removeItem('accessToken'); 
        
        // 전역 이벤트 발생: AuthProvider가 이를 감지하여 performLogout() 호출
        // 이는 "토큰 만료"로 간주하고 로그아웃 처리
        window.dispatchEvent(new CustomEvent('auth:token-expired', { 
            detail: { error: refreshError } 
        }));
        
        // 에러를 throw하여 상위 컴포넌트에서도 처리 가능하도록 함
        return Promise.reject(refreshError);

    } finally {
        isRefreshing = false;
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

