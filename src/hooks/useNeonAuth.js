import { useEffect, useState } from 'react';
import { getNeonSession } from '../utils/neonAuth';

export function useNeonAuth() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const s = await getNeonSession();
        setSession(s);
      } catch (e) {
        setSession(null);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return { session, loading };
}

export default useNeonAuth;
