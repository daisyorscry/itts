import { useState } from 'react';
import { useLogout } from '@feature/auth/hooks';
import { useAuthStore } from '@store/auth.store';
import { AdminHeaderContextProvider } from '@components/header/context';

export function AdminHeaderProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuthStore();
  const { mutate: logout, isPending } = useLogout();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState<boolean>(false);

  const displayName = user?.full_name?.trim() || 'User';
  const displayEmail = user?.email?.trim() || 'user@itts.fun';

  const handleLogoutConfirm = () => {
    logout();
    setShowLogoutConfirm(false);
  };

  return (
    <AdminHeaderContextProvider
      value={{
        displayName,
        displayEmail,
        isPending,
        showLogoutConfirm,
        setShowLogoutConfirm,
        handleLogoutConfirm,
      }}
    >
      {children}
    </AdminHeaderContextProvider>
  );
}
