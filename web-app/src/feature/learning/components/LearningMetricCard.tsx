import type { LucideIcon } from 'lucide-react';
import * as CardUI from '@components/ui/card';
import * as LayoutUI from '@components/ui/layout';
import { Text } from '@components/ui/text';

interface LearningMetricCardProps {
  icon: LucideIcon;
  label: string;
  value: string;
  hint?: string;
}

export function LearningMetricCard({
  icon: Icon,
  label,
  value,
  hint,
}: LearningMetricCardProps) {
  return (
    <CardUI.Card tone="inverse">
      <CardUI.CardContent padding="auth">
        <LayoutUI.Column gap="gap-3">
          <LayoutUI.Row justify="justify-between" align="items-start">
            <LayoutUI.Column gap="gap-1">
              <Text variant="muted-inverse" size="sm">{label}</Text>
              <Text as="h3" variant="inverse" className="font-['Sora'] text-3xl font-semibold">
                {value}
              </Text>
            </LayoutUI.Column>
            <LayoutUI.Container surface="accent" padding="sm" radius="xl">
              <Icon className="size-5 text-[#0F172A]" />
            </LayoutUI.Container>
          </LayoutUI.Row>
          {hint ? <Text variant="muted-inverse" size="sm">{hint}</Text> : null}
        </LayoutUI.Column>
      </CardUI.CardContent>
    </CardUI.Card>
  );
}
