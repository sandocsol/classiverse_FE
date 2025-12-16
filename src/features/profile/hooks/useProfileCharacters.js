import { useEffect, useState } from 'react';
import { API_ENDPOINTS, apiClient } from '../../../config/api.js';

// 목 데이터 사용 여부 (환경 변수로 제어)
const USE_MOCK_DATA = import.meta.env.VITE_USE_MOCK_DATA === 'true';

/**
 * 친구(캐릭터) 목록을 가져오는 hook
 * API 명세: GET /api/profile/characters
 * @returns {object} { data, loading, error }
 */
export default function useProfileCharacters() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);

      try {
        let endpoint;
        
        if (USE_MOCK_DATA) {
          // 목 데이터 경로: /data/profile-characters.json
          endpoint = '/data/profile-characters.json';
        } else {
          // 실제 API 경로: /api/profile/characters
          endpoint = '/api/profile/characters';
        }
        
        const response = await apiClient.get(endpoint);
        
        if (!cancelled) {
          setData(response.data);
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

  return { data, loading, error };
}

