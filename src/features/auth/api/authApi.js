import { apiClient, API_ENDPOINTS } from '../../../config/api.js';

/**
 * 사용자 정보 조회 API
 * API 명세: GET /api/profile/me
 * @returns {Promise<object>} 사용자 프로필 정보 (nickname, gender, ageRange 등)
 */
export const getUserProfile = async () => {
    // API 인터셉터에서 401 처리가 이루어지지만,
    // 여기서는 상위 AuthProvider가 에러를 받도록 에러를 그대로 전파
    const response = await apiClient.get(API_ENDPOINTS.PROFILE_ME);
    return response.data;
};

/**
 * 로그아웃 API (서버에 토큰 무효화 요청)
 * API 명세: POST /api/auth/logout
 * @returns {Promise}
 */
export const logoutApi = async () => {
    try {
        const response = await apiClient.post(API_ENDPOINTS.AUTH_LOGOUT);
        return response.data;
    } catch (error) {
        // 로그아웃 API가 실패해도 클라이언트 로그아웃 처리는 진행해야 하므로
        // 에러를 던지기보다 콘솔에만 기록하고 성공으로 간주할 수 있습니다.
        console.warn('서버 로그아웃 요청 실패:', error);
        return { success: true };
    }
};

/**
 * 닉네임 수정 API
 * API 명세: PUT /api/profile/nickname
 * @param {string} nickname - 새로운 닉네임
 * @returns {Promise<object>} 업데이트된 사용자 프로필 정보
 */
export const updateNickname = async (nickname) => {
    const response = await apiClient.put(API_ENDPOINTS.PROFILE_NICKNAME_UPDATE, {
        nickname: nickname
    });
    return response.data;
};