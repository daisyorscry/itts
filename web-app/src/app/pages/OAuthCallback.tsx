import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { Loader2 } from 'lucide-react';
import { getMeApi } from '@feature/auth/api';
import { useAuthStore } from '@store/auth.store';
import toast from 'react-hot-toast';

export function OAuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    const processOAuthCallback = async () => {
      // Get tokens dari URL query params (dari backend redirect)
      const accessToken = searchParams.get('access_token');
      const refreshToken = searchParams.get('refresh_token');
      const expiresIn = searchParams.get('expires_in');
      const error = searchParams.get('error');
      const errorDescription = searchParams.get('error_description');

      // Handle error dari backend
      if (error) {
        const message = errorDescription || error || 'OAuth authentication failed';
        setErrorMessage(message);
        setStatus('error');
        toast.error(message);
        
        // Redirect ke sign-in setelah 2 detik
        setTimeout(() => {
          navigate('/sign-in');
        }, 2000);
        return;
      }

      // Validate tokens
      if (!accessToken || !refreshToken) {
        const message = 'No tokens received from OAuth provider';
        setErrorMessage(message);
        setStatus('error');
        toast.error(message);
        
        setTimeout(() => {
          navigate('/sign-in');
        }, 2000);
        return;
      }

      try {
        // 1. Simpan tokens ke localStorage
        localStorage.setItem('access_token', accessToken);
        localStorage.setItem('refresh_token', refreshToken);
        if (expiresIn) {
          localStorage.setItem('expires_in', expiresIn);
        }

        // 2. Fetch user data
        const userResponse = await getMeApi();
        
        if (!userResponse.data) {
          throw new Error('Failed to fetch user data');
        }

        // 3. Set auth state
        setAuth(userResponse.data, accessToken, refreshToken);
        
        // 4. Show success message
        setStatus('success');
        toast.success('Successfully signed in!');

        // 5. Redirect ke admin dashboard
        setTimeout(() => {
          navigate('/admin');
        }, 500);
        
      } catch (error) {
        // Handle error
        const message = error instanceof Error ? error.message : 'Failed to authenticate';
        setErrorMessage(message);
        setStatus('error');
        toast.error(message);
        
        // Clear tokens kalo gagal
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('expires_in');
        
        // Redirect ke sign-in setelah 2 detik
        setTimeout(() => {
          navigate('/sign-in');
        }, 2000);
      }
    };

    processOAuthCallback();
  }, [searchParams, navigate, setAuth]);

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: '#ECE9DE' }}>
      <div className="text-center">
        {status === 'processing' && (
          <div className="w-12 h-12 border-4 border-t-transparent rounded-full animate-spin mx-auto mb-4" style={{ borderColor: '#29E68C' }}></div>
        )}
        {status === 'success' && (
          <div className="w-12 h-12 flex items-center justify-center mx-auto mb-4" style={{ color: '#29E68C' }}>
            <Loader2 className="animate-spin" />
          </div>
        )}
        {status === 'error' && (
          <div className="w-12 h-12 flex items-center justify-center mx-auto mb-4" style={{ color: '#FF5733' }}>
            <Loader2 className="animate-spin" />
          </div>
        )}
        <p className="font-['Outfit'] text-sm" style={{ color: 'rgba(4, 9, 12, 0.6)' }}>
          {status === 'processing' ? 'Completing authentication...' : status === 'success' ? 'Successfully signed in!' : errorMessage}
        </p>
      </div>
    </div>
  );
}
