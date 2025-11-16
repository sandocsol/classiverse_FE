import { useEffect, useState } from 'react';
import axios from 'axios';

export default function useCharacter(dataUrl) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!dataUrl) return;
      setLoading(true);
      setError(null);

      try {
        const response = await axios.get(dataUrl, {
          headers: { Accept: 'application/json' },
        });
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
  }, [dataUrl]);

  return { data, loading, error };
}


