import { useEffect, useState } from 'react';
import { API_ENDPOINTS, apiClient } from '../../../config/api.js';

// 목 데이터 사용 여부 (환경 변수로 제어)
const USE_MOCK_DATA = import.meta.env.VITE_USE_MOCK_DATA === 'true';

export default function useStoryContent(storyId, characterId, contentId) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (!storyId || !characterId || !contentId) {
        setLoading(false);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        let dataUrl;
        
        if (USE_MOCK_DATA) {
          // 목 데이터 경로: /data/story-content/{storyId}/{characterId}/{contentId}.json
          dataUrl = `/data/story-content/${storyId}/${characterId}/${contentId}.json`;
        } else {
          // 실제 API 경로: /api/stories/{storyId}/characters/{characterId}/contents/{contentId}
          dataUrl = API_ENDPOINTS.STORY_CONTENT(storyId, characterId, contentId);
        }
        
        const response = await apiClient.get(dataUrl);
        if (!cancelled) setData(response.data);
      } catch (err) {
        if (!cancelled) setError(err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [storyId, characterId, contentId]);

  return { data, loading, error };
}

