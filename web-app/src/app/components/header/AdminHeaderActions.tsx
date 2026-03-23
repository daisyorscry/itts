import { AdminHeaderLogoutButton } from '@components/header/AdminHeaderLogoutButton';
import { AdminHeaderNotificationButton } from '@components/header/AdminHeaderNotificationButton';
import { AdminHeaderProfile } from '@components/header/AdminHeaderProfile';
import { Row } from '@components/ui/layout';

export function AdminHeaderActions({ children }: { children?: React.ReactNode }) {
  return (
    <Row className="ml-auto shrink-0 items-center max-md:w-full max-md:justify-end max-md:border-t max-md:border-black/10 max-md:pt-3 md:ml-6" gap="gap-3">
      {children ?? (
        <>
          <AdminHeaderNotificationButton />
          <AdminHeaderProfile />
          <AdminHeaderLogoutButton />
        </>
      )}
    </Row>
  );
}
