import * as Icons from 'lucide-react';
import * as CardUI from '@components/ui/card';
import * as LayoutUI from '@components/ui/layout';
import { Text } from '@components/ui/text';
import { QueryStatePanel } from '@components/query-state-panel';

export function AdminPermissionsTest() {
  return (
    <LayoutUI.Column gap="gap-8">
      <LayoutUI.Column gap="gap-2">
        <Text as="h1" variant="inverse" className="font-['Sora'] text-3xl font-bold md:text-4xl">
          Permissions Management Test
        </Text>
        <Text variant="muted-inverse">
          Simple routing smoke test for the permissions area.
        </Text>
      </LayoutUI.Column>

      <CardUI.Card tone="inverse">
        <CardUI.CardContent>
          <QueryStatePanel
            icon={Icons.BadgeCheck}
            title="Route Working"
            description="If this page renders, the test route is resolving correctly."
          />
        </CardUI.CardContent>
      </CardUI.Card>
    </LayoutUI.Column>
  );
}
