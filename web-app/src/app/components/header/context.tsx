import * as React from 'react';

type AdminHeaderContextValue = {
  displayName: string;
  displayEmail: string;
  isPending: boolean;
  showLogoutConfirm: boolean;
  setShowLogoutConfirm: (open: boolean) => void;
  handleLogoutConfirm: () => void;
};

const AdminHeaderContext = React.createContext<AdminHeaderContextValue | null>(null);

export function AdminHeaderContextProvider({
  value,
  children,
}: React.PropsWithChildren<{ value: AdminHeaderContextValue }>) {
  return <AdminHeaderContext.Provider value={value}>{children}</AdminHeaderContext.Provider>;
}

export function useAdminHeader() {
  const context = React.useContext(AdminHeaderContext);
  if (!context) {
    throw new Error('useAdminHeader must be used within AdminHeaderProvider.');
  }

  return context;
}
