import * as Icons from 'lucide-react';
import * as CardUI from '@components/ui/card';
import * as LayoutUI from '@components/ui/layout';
import { Text } from '@components/ui/text';
import { QueryStatePanel } from '@components/query-state-panel';

export function AdminAnalytics() {
  return (
    <LayoutUI.Column gap="gap-8">
      <LayoutUI.Column gap="gap-2">
        <Text as="h1" variant="inverse" className="font-['Sora'] text-3xl font-bold md:text-4xl">
          Analytics Dashboard
        </Text>
        <Text variant="muted-inverse">
          View platform analytics and insights.
        </Text>
      </LayoutUI.Column>

      <CardUI.Card tone="inverse">
        <CardUI.CardContent>
          <QueryStatePanel
            icon={Icons.BarChart3}
            title="Analytics Coming Soon"
            description="This section is ready for charts, trends, and conversion insights."
          />
        </CardUI.CardContent>
      </CardUI.Card>
    </LayoutUI.Column>
  );
}
