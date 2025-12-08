import { useEffect, useState } from 'react';
import { API_ENDPOINTS, apiClient } from '../../../config/api.js';

// 목 데이터 사용 여부 (환경 변수로 제어)
const USE_MOCK_DATA = import.meta.env.VITE_USE_MOCK_DATA === 'true';

/**
 * 카테고리 목록과 사용자 잠금 상태를 가져오는 훅
 * 백엔드 API 응답 구조에 따라 다음과 같이 처리:
 * - 배열 형태: [{ categoryId, categoryName, unlocked, ... }, ...]
 * - 객체 형태: { categories: [...], userProfileImage: "..." } 또는 { userProfileImage: "...", ... }
 * 
 * @returns {Object} { data, loading, error, userProfileImage }
 * - data: 카테고리 배열 또는 전체 응답 데이터
 * - userProfileImage: 사용자 프로필 이미지 URL (응답에 포함된 경우)
 */
export default function useCategories() {
  const [data, setData] = useState(null);
  const [userProfileImage, setUserProfileImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);

      try {
        // 목 데이터 또는 실제 API 경로 선택
        const endpoint = USE_MOCK_DATA
          ? '/data/categories-me.json'
          : API_ENDPOINTS.CATEGORIES_ME;
        
        const response = await apiClient.get(endpoint);
        
        if (!cancelled) {
          const responseData = response.data;
          
          // 응답이 객체이고 categories 필드가 있는 경우
          if (responseData && typeof responseData === 'object' && !Array.isArray(responseData)) {
            // 사용자 프로필 이미지 추출
            const profileImage = responseData.userProfileImage || 
                                 responseData.avatarImage || 
                                 responseData.profileImage ||
                                 responseData.user?.profileImage ||
                                 responseData.user?.avatarImage ||
                                 null;
            setUserProfileImage(profileImage);
            
            // categories 배열이 있으면 그대로 사용, 없으면 전체 객체 사용
            setData(responseData.categories || responseData);
          } else {
            // 응답이 배열인 경우
            setData(responseData);
            setUserProfileImage(null);
          }
        }
      } catch (err) {
        if (!cancelled) {
          setError(err);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    load();
    
    return () => {
      cancelled = true;
    };
  }, []);

  return { data, userProfileImage, loading, error };
}

