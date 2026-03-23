import { useState } from 'react';
import * as Icons from 'lucide-react';
import * as CardUI from '@components/ui/card';
import { Button } from '@components/ui/button';
import * as LayoutUI from '@components/ui/layout';
import { Text } from '@components/ui/text';
import { PasswordSettings } from '@pages/admin/settings/PasswordSettings';
import { ProfileSettings } from '@pages/admin/settings/ProfileSettings';

type TabType = 'profile' | 'password';

const tabs = [
  { id: 'profile' as const, label: 'Profile', icon: Icons.User },
  { id: 'password' as const, label: 'Change Password', icon: Icons.Lock },
] as const satisfies ReadonlyArray<{
  id: TabType;
  label: string;
  icon: typeof Icons.User;
}>;

export function AdminSettings() {
  const [activeTab, setActiveTab] = useState<TabType>('profile');

  return (
    <LayoutUI.Column gap="gap-8">
      <LayoutUI.Column gap="gap-2">
        <Text as="h1" variant="inverse" className="font-['Sora'] text-3xl font-bold md:text-4xl">
          Settings
        </Text>
        <Text variant="muted-inverse">
          Manage your account settings and preferences
        </Text>
      </LayoutUI.Column>

      <CardUI.Card tone="inverse" border={false}>
        <CardUI.CardContent className="pb-0">
          <LayoutUI.Row gap="gap-1" className="border-b border-black/10">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;

              return (
                <Button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  variant="secondary"
                  size="default"
                  className={[
                    'h-auto border-b-2 px-5 py-3 text-sm font-medium transition-colors',
                    isActive
                      ? 'border-[#29E68C] text-[#04090C] hover:bg-transparent hover:text-[#04090C]'
                      : 'border-transparent text-black/60 hover:bg-black/5 hover:text-[#04090C]',
                  ].join(' ')}
                >
                  <Icon className="size-4" />
                  {tab.label}
                </Button>
              );
            })}
          </LayoutUI.Row>
        </CardUI.CardContent>
      </CardUI.Card>

      {activeTab === 'profile' ? <ProfileSettings /> : null}
      {activeTab === 'password' ? <PasswordSettings /> : null}
    </LayoutUI.Column>
  );
}
