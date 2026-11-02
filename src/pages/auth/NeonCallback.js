import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { authClient, getNeonJWT } from '../../lib/auth-client';

export default function NeonCallback() {
  const navigate = useNavigate();
  const { loginWithNeon } = useAuth();
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        // Wait for Neon Auth to establish session after OAuth redirect
        for (let attempt = 0; attempt < 10; attempt++) {
          const { data, error: sessionError } = await authClient.getSession();
          if (sessionError) throw sessionError;
          if (data?.session) {
            const neonToken = await getNeonJWT();
            await loginWithNeon(neonToken);
            if (active) navigate('/feed', { replace: true });
            return;
          }
          await new Promise(r => setTimeout(r, 500));
        }
        throw new Error('Google sign-in did not return a session in time.');
      } catch (err) {
        if (active) setError(err?.message || 'Could not complete Google sign-in.');
      }
    })();
    return () => { active = false; };
  }, [loginWithNeon, navigate]);

  return (
    <div className="min-h-[calc(100vh-56px)] flex items-center justify-center px-4 bg-gradient-to-br from-tide-50/50 via-white to-flow-50/50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-tide-500 mx-auto mb-4"></div>
        {error ? (
          <div className="text-sm text-red-600 dark:text-red-400">
            <p>{error}</p>
            <button className="mt-3 underline" onClick={() => navigate('/login', { replace: true })}>Back to sign in</button>
          </div>
        ) : <p className="text-gray-600 dark:text-gray-400">Completing sign-in...</p>}
      </div>
    </div>
  );
}
