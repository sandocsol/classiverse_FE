import { useEffect, useState } from 'react';
import { API_ENDPOINTS, apiClient } from '../../../config/api.js';

// 목 데이터 사용 여부 (환경 변수로 제어)
const USE_MOCK_DATA = import.meta.env.VITE_USE_MOCK_DATA === 'true';

export default function useCharacter(bookId, characterId) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!bookId || !characterId) return;
      
      setLoading(true);
      setError(null);

      try {
        let endpoint;
        
        if (USE_MOCK_DATA) {
          // 목 데이터 경로: /data/character-detail/{characterId}.json
          endpoint = `/data/character-detail/${characterId}.json`;
        } else {
          // 실제 API 경로: /api/books/{bookId}/characters/{characterId}
          endpoint = API_ENDPOINTS.CHARACTER_DETAIL(bookId, characterId);
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
  }, [bookId, characterId]);

  return { data, loading, error };
}


