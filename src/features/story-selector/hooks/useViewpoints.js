import { useEffect, useState } from 'react';
import { API_ENDPOINTS, apiClient } from '../../../config/api.js';

// 목 데이터 사용 여부 (환경 변수로 제어)
const USE_MOCK_DATA = import.meta.env.VITE_USE_MOCK_DATA === 'true';

/**
 * API 응답을 프론트엔드에서 사용하는 구조로 변환
 * API 명세: { storyTitle, introductions: [{ charId, characterName, introText, isLeader, charImage, firstContentId }] }
 * 프론트엔드 구조: { storyId, storyTitle, prompt, viewpoints: [{ characterId, name, preview, tag, charImage, startContentId }] }
 */
function transformApiResponse(apiData, storyId) {
  return {
    storyId: storyId,
    storyTitle: apiData.storyTitle,
    prompt: '누구의 시점으로 이야기를 볼까요?', // API에 없으므로 기본값 사용
    viewpoints: apiData.introductions?.map(intro => ({
      characterId: intro.charId,
      name: intro.characterName,
      preview: intro.introText,
      tag: intro.isLeader === 'Y' ? '원작' : null,
      charImage: intro.charImage,
      startContentId: intro.firstContentId,
    })) || [],
  };
}

/**
 * 스토리 한줄소개 (viewpoints) 데이터를 가져오는 hook
 * @param {string|number} storyId - 스토리 ID
 * @returns {object} { data, loading, error }
 */
export default function useViewpoints(storyId) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!storyId) return;
      
      setLoading(true);
      setError(null);

      try {
        let endpoint;
        
        if (USE_MOCK_DATA) {
          // 목 데이터 경로: /data/story-viewpoints/{storyId}.json
          endpoint = `/data/story-viewpoints/${storyId}.json`;
        } else {
          // 실제 API 경로: /api/stories/{storyId}/intro
          endpoint = API_ENDPOINTS.STORY_INTRO(storyId);
        }
        
        const response = await apiClient.get(endpoint);
        
        if (!cancelled) {
          // API 응답(또는 목 데이터)을 프론트엔드 구조로 변환
          // 목 데이터와 실제 API 모두 같은 구조를 사용하므로 동일하게 변환
          const transformedData = transformApiResponse(response.data, storyId);
          setData(transformedData);
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
  }, [storyId]);

  return { data, loading, error };
}

