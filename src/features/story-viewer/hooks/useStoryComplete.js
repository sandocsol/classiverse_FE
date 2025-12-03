import { useEffect, useState } from 'react';
import { API_ENDPOINTS, apiClient } from '../../../config/api.js';

// 목 데이터 사용 여부 (환경 변수로 제어)
const USE_MOCK_DATA = import.meta.env.VITE_USE_MOCK_DATA === 'true';

export default function useStoryComplete(storyId, characterId) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!storyId || !characterId) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        let endpoint;
        let response;

        if (USE_MOCK_DATA) {
          // 목 데이터 경로: /data/story-complete/{storyId}_{characterId}.json
          endpoint = `/data/story-complete/${storyId}_${characterId}.json`;
          response = await apiClient.get(endpoint);
        } else {
          // 실제 API 경로: POST /api/stories/{storyId}/characters/{characterId}/complete
          endpoint = API_ENDPOINTS.STORY_COMPLETE(storyId, characterId);
          response = await apiClient.post(endpoint);
        }

        const data = response.data;

        if (!cancelled) {
          setData(data);
          setLoading(false);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err);
          setLoading(false);
        }
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [storyId, characterId]);

  return { data, loading, error };
}

