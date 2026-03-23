import { motion } from 'motion/react';
import * as Icons from 'lucide-react';
import { Badge } from '@components/ui/badge';
import { Button } from '@components/ui/button';
import * as CardUI from '@components/ui/card';
import * as LayoutUI from '@components/ui/layout';
import { Text } from '@components/ui/text';

export function AdminDashboard() {
  const stats = [
    {
      icon: Icons.Users,
      label: 'Total Members',
      value: '524',
      change: '+12%',
      isPositive: true,
      color: 'from-blue-500 to-cyan-500',
    },
    {
      icon: Icons.Calendar,
      label: 'Active Events',
      value: '8',
      change: '+3',
      isPositive: true,
      color: 'from-green-500 to-emerald-500',
    },
    {
      icon: Icons.TrendingUp,
      label: 'Registrations',
      value: '156',
      change: '+24%',
      isPositive: true,
      color: 'from-fuchsia-500 to-pink-500',
    },
    {
      icon: Icons.Award,
      label: 'Completion Rate',
      value: '87%',
      change: '-2%',
      isPositive: false,
      color: 'from-orange-500 to-red-500',
    },
  ] as const;

  const quickActions = [
    'Create Event',
    'Add User',
    'View Analytics',
    'Manage Registrations',
  ] as const;

  const recentActivities = [
    { user: 'Ahmad Fauzi', action: 'registered for DevSecOps track', time: '2 hours ago' },
    { user: 'System', action: 'created a new event "Docker Workshop"', time: '5 hours ago' },
    { user: 'Siti Rahma', action: 'completed Networking Module 3', time: '1 day ago' },
    { user: 'Budi Hartono', action: 'joined the community', time: '1 day ago' },
    { user: 'Sarah Lestari', action: 'scheduled as speaker for Web Security event', time: '2 days ago' },
  ] as const;

  const upcomingEvents = [
    {
      id: 1,
      title: 'Docker & Kubernetes Workshop',
      date: 'March 20, 2026',
      time: '14:00 WIB',
      registrations: 45,
      status: 'Open',
    },
    {
      id: 2,
      title: 'Web Security Fundamentals',
      date: 'March 25, 2026',
      time: '15:00 WIB',
      registrations: 32,
      status: 'Open',
    },
    {
      id: 3,
      title: 'Monthly Community Meetup',
      date: 'April 1, 2026',
      time: '18:00 WIB',
      registrations: 87,
      status: 'Open',
    },
  ] as const;

  return (
    <LayoutUI.Column gap="gap-8">
      <LayoutUI.Column gap="gap-2">
        <Text as="h1" variant="inverse" className="font-['Sora'] text-3xl font-bold md:text-4xl">
          Dashboard Overview
        </Text>
        <Text variant="muted-inverse">
          Welcome back. Here&apos;s what&apos;s happening today.
        </Text>
      </LayoutUI.Column>

      <LayoutUI.Container className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          const ChangeIcon = stat.isPositive ? Icons.ArrowUpRight : Icons.ArrowDownRight;

          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.08 }}
            >
              <CardUI.Card tone="inverse">
                <CardUI.CardContent className="py-6">
                  <LayoutUI.Column gap="gap-4">
                    <LayoutUI.Row justify="justify-between" align="items-start">
                      <LayoutUI.Container className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${stat.color}`}>
                        <Icon className="size-6 text-[#04090C]" />
                      </LayoutUI.Container>
                      <LayoutUI.Row gap="gap-1" className={stat.isPositive ? 'text-green-500' : 'text-red-500'}>
                        <ChangeIcon className="size-4" />
                        <Text className={stat.isPositive ? 'text-green-500' : 'text-red-500'} size="sm">
                          {stat.change}
                        </Text>
                      </LayoutUI.Row>
                    </LayoutUI.Row>

                    <LayoutUI.Column gap="gap-1">
                      <Text variant="inverse" className="text-3xl font-bold">
                        {stat.value}
                      </Text>
                      <Text variant="muted-inverse" size="sm">
                        {stat.label}
                      </Text>
                    </LayoutUI.Column>
                  </LayoutUI.Column>
                </CardUI.CardContent>
              </CardUI.Card>
            </motion.div>
          );
        })}
      </LayoutUI.Container>

      <CardUI.Card tone="inverse">
        <CardUI.CardHeader>
          <CardUI.CardTitle tone="inverse">Quick Actions</CardUI.CardTitle>
          <CardUI.CardDescription tone="inverse">
            Common admin shortcuts.
          </CardUI.CardDescription>
        </CardUI.CardHeader>
        <CardUI.CardContent>
          <LayoutUI.Container className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            {quickActions.map((action) => (
              <Button
                key={action}
                variant="ghost-inverse"
                className="h-auto rounded-xl border border-[#29E68C]/20 bg-[#29E68C]/10 px-4 py-3 text-sm font-medium text-[#04090C] hover:bg-[#29E68C]/20"
              >
                {action}
              </Button>
            ))}
          </LayoutUI.Container>
        </CardUI.CardContent>
      </CardUI.Card>

      <LayoutUI.Container className="grid grid-cols-1 gap-8 xl:grid-cols-2">
        <CardUI.Card tone="inverse">
          <CardUI.CardHeader>
            <CardUI.CardTitle tone="inverse">Recent Activity</CardUI.CardTitle>
          </CardUI.CardHeader>
          <CardUI.CardContent>
            <LayoutUI.Column gap="gap-4">
              {recentActivities.map((activity) => (
                <LayoutUI.Row
                  key={`${activity.user}-${activity.time}`}
                  align="items-start"
                  gap="gap-3"
                  className="border-b border-black/10 pb-4 last:border-0 last:pb-0"
                >
                  <span className="mt-2 size-2 rounded-full bg-[#29E68C]" />
                  <LayoutUI.Column className="flex-1" gap="gap-1">
                    <Text variant="inverse" size="sm">
                      <Text as="span" variant="inverse" className="font-medium">
                        {activity.user}
                      </Text>{' '}
                      {activity.action}
                    </Text>
                    <Text variant="muted-inverse" size="xs">
                      {activity.time}
                    </Text>
                  </LayoutUI.Column>
                </LayoutUI.Row>
              ))}
            </LayoutUI.Column>
          </CardUI.CardContent>
        </CardUI.Card>

        <CardUI.Card tone="inverse">
          <CardUI.CardHeader>
            <CardUI.CardTitle tone="inverse">Upcoming Events</CardUI.CardTitle>
          </CardUI.CardHeader>
          <CardUI.CardContent>
            <LayoutUI.Column gap="gap-4">
              {upcomingEvents.map((event) => (
                <CardUI.Card key={event.id} tone="inverse">
                  <CardUI.CardContent className="py-4">
                    <LayoutUI.Column gap="gap-2">
                      <LayoutUI.Row justify="justify-between" align="items-start" gap="gap-4">
                        <Text as="h3" variant="inverse" className="font-semibold">
                          {event.title}
                        </Text>
                        <Badge variant="success">{event.status}</Badge>
                      </LayoutUI.Row>
                      <Text variant="muted-inverse" size="sm">
                        {event.date} • {event.time}
                      </Text>
                      <Text variant="muted-inverse" size="sm">
                        {event.registrations} registrations
                      </Text>
                    </LayoutUI.Column>
                  </CardUI.CardContent>
                </CardUI.Card>
              ))}
            </LayoutUI.Column>
          </CardUI.CardContent>
        </CardUI.Card>
      </LayoutUI.Container>
    </LayoutUI.Column>
  );
}
