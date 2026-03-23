import { Bell } from 'lucide-react';
import { Button } from '@components/ui/button';

export function AdminHeaderNotificationButton() {
  return (
    <Button variant="ghost" size="icon" className="rounded-xl">
      <Bell className="text-black/70" size={20} />
    </Button>
  );
}
