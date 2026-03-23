import { useEffect, useState } from 'react';
import { RouterProvider } from 'react-router';
import { router } from './routes';
import { Toaster } from './components/ui/sonner';
import { QueryProvider } from './providers/QueryProvider';
import { Toaster as HotToaster } from 'react-hot-toast';
import { useAuthStore } from '@store/auth.store';

function App() {
  const [isMobile, setIsMobile] = useState(false);
  const initAuth = useAuthStore((state) => state.initAuth);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(max-width: 768px)');
    const updateIsMobile = () => setIsMobile(mediaQuery.matches);

    updateIsMobile();
    mediaQuery.addEventListener('change', updateIsMobile);

    return () => {
      mediaQuery.removeEventListener('change', updateIsMobile);
    };
  }, []);

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  return (
    <QueryProvider>
      <RouterProvider router={router} />
      <Toaster />
      <HotToaster 
        position={isMobile ? 'bottom-center' : 'top-right'}
        containerStyle={isMobile ? { bottom: 16, left: 16, right: 16 } : undefined}
        toastOptions={{
          duration: 4000,
          style: {
            background: '#04090C',
            color: '#ECE9DE',
            fontFamily: 'Outfit, sans-serif',
            borderRadius: '12px',
            padding: '12px 16px',
            maxWidth: isMobile ? '100%' : '420px',
          },
          success: {
            iconTheme: {
              primary: '#29E68C',
              secondary: '#04090C',
            },
          },
          error: {
            iconTheme: {
              primary: '#EF4444',
              secondary: '#04090C',
            },
          },
        }}
      />
    </QueryProvider>
  );
}

export default App;
