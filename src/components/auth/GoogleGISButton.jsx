import { useEffect, useRef, useState } from 'react';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';

const GOOGLE_CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID || '';

export default function GoogleGISButton({ className = '' }) {
  const btnRef = useRef(null);
  const { setUser, setupRealtime } = useAuth();
  const [error, setError] = useState('');

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) return;
    if (document.getElementById('google-gis-script')) {
      if (window.google?.accounts?.id) {
        initialize();
      }
      return;
    }
    const script = document.createElement('script');
    script.id = 'google-gis-script';
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => {
      initialize();
    };
    document.head.appendChild(script);
  }, []);

  const initialize = () => {
    try {
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: handleCredential,
      });
      if (btnRef.current) {
        window.google.accounts.id.renderButton(btnRef.current, {
          theme: 'outline',
          size: 'large',
          width: '100%',
          text: 'signin_with',
        });
      }
    } catch (e) {}
  };

  const handleCredential = async (response) => {
    setError('');
    try {
      const res = await api.post('/auth/google', { credential: response.credential });
      const { token, user } = res.data.data;
      if (token) {
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        window.location.href = '/feed';
        return;
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Google sign-in failed');
    }
  };

  if (!GOOGLE_CLIENT_ID) {
    return null;
  }

  return (
    <div className={className}>
      <div ref={btnRef} className="w-full flex justify-center" />
      {error && <div className="mt-2 text-xs text-red-500 text-center">{error}</div>}
    </div>
  );
}
