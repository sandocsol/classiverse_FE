import { useEffect, useState } from 'react';
import { API_ENDPOINTS, apiClient } from '../../../config/api.js';

// 목 데이터 사용 여부 (환경 변수로 제어)
const USE_MOCK_DATA = import.meta.env.VITE_USE_MOCK_DATA === 'true';

/**
 * 특정 카테고리의 책 목록을 가져오는 훅
 * @param {number} categoryId - 카테고리 ID
 * @returns {Object} { data, loading, error }
 */
export default function useCategoryBooks(categoryId) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!categoryId) {
      setData(null);
      setLoading(false);
      setError(null);
      return;
    }

    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);

      try {
        // 목 데이터 또는 실제 API 경로 선택
        const endpoint = USE_MOCK_DATA
          ? `/data/categories/${categoryId}/books.json`
          : API_ENDPOINTS.CATEGORY_BOOKS(categoryId);
        
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
  }, [categoryId]);

  return { data, loading, error };
}

