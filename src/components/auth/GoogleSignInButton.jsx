import { signInWithGoogle } from '../../utils/neonAuth';
import { useState } from 'react';
import { FcGoogle } from 'react-icons/fc';

export default function GoogleSignInButton({ callbackURL = window.location.origin + '/auth/callback', className = '' }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleClick = async () => {
    setError('');
    setLoading(true);
    try {
      // Use Neon Auth for Google OAuth - this redirects to Google
      // Session will be established via cookies, then app reloads to /feed
      await signInWithGoogle(callbackURL);
    } catch (err) {
      setError(err?.message || 'Failed to sign in with Google');
      setLoading(false);
    }
  };

  return (
    <div className={className}>
      <button
        type="button"
        onClick={handleClick}
        disabled={loading}
        className="w-full flex items-center justify-center gap-3 py-2.5 px-4 border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 font-medium hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
      >
        <FcGoogle size={20} />
        {loading ? 'Redirecting...' : 'Continue with Google'}
      </button>
      {error && (
        <div className="mt-2 text-xs text-red-500 dark:text-red-400 text-center">{error}</div>
      )}
    </div>
  );
}
