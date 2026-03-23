import { User } from 'lucide-react';
import { useAdminHeader } from '@components/header/context';
import { Column, Row } from '@components/ui/layout';
import { Text } from '@components/ui/text';

export function AdminHeaderProfile() {
  const { displayName, displayEmail } = useAdminHeader();

  return (
    <Row className="min-w-0 items-center border-l border-black/10 pl-3 md:pl-4" gap="gap-3">
      <Row className="h-10 w-10 shrink-0 justify-center rounded-full border border-accent/30 bg-accent/20">
        <User className="text-accent" size={20} />
      </Row>
      <Column className="min-w-0 max-sm:hidden" gap="gap-0">
        <Text className="text-sm font-medium" style={{ color: '#04090C' }}>
          {displayName}
        </Text>
        <Text className="truncate text-xs" style={{ color: 'rgba(4, 9, 12, 0.5)' }}>
          {displayEmail}
        </Text>
      </Column>
    </Row>
  );
}
