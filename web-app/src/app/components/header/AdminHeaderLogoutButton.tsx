import { LogOut } from 'lucide-react';
import { Button } from '@components/ui/button';
import { useAdminHeader } from '@components/header/context';

export function AdminHeaderLogoutButton() {
  const { setShowLogoutConfirm } = useAdminHeader();

  return (
    <Button variant="ghost" size="icon" className="rounded-xl" onClick={() => setShowLogoutConfirm(true)} title="Logout">
      <LogOut className="text-black/70" size={20} />
    </Button>
  );
}
