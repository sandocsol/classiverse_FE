import { useEffect, useMemo, useState } from 'react';
import { API_ENDPOINTS, apiClient } from '../../../config/api.js';

// 목 데이터 사용 여부 (환경 변수로 제어)
const USE_MOCK_DATA = import.meta.env.VITE_USE_MOCK_DATA === 'true';

export default function useBookDetail(bookId) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // URL 배열 (목 데이터 또는 실제 API)
  const urls = useMemo(() => {
    if (!bookId) return null;
    
    if (USE_MOCK_DATA) {
      // 목 데이터 경로
      return [
        `/data/book-detail/${bookId}.json`,
        `/data/book-detail/${bookId}-stories.json`,
        `/data/book-detail/${bookId}-characters.json`
      ];
    } else {
      // 실제 API 경로 (apiClient의 baseURL이 설정되어 있으므로 상대 경로만 사용)
      return [
        API_ENDPOINTS.BOOK_DETAIL(bookId),
        API_ENDPOINTS.BOOK_STORIES(bookId),
        API_ENDPOINTS.BOOK_CHARACTERS(bookId)
      ];
    }
  }, [bookId]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (!bookId || !urls) return;
      
      setLoading(true);
      setError(null);
      
      try {
        let bookJson, storiesJson, charactersJson;
        
        // 목 데이터와 실제 API 모두 axios 사용 (일관성 유지)
        const [bookRes, storiesRes, charactersRes] = await Promise.all(
          urls.map(url => apiClient.get(url))
        );
        
        bookJson = bookRes.data;
        storiesJson = storiesRes.data;
        charactersJson = charactersRes.data;
        
        if (!cancelled) {
          setData({
            ...bookJson,
            stories: storiesJson,
            characters: charactersJson
          });
        }
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
  }, [bookId, urls]);

  return { data, loading, error };
}


