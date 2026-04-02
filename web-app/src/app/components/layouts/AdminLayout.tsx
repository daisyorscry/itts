import * as Icons from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Outlet, useLocation } from 'react-router';
import * as AdminHeader from '../header';
import * as SidebarUI from '../sidebar';
import * as LayoutUI from '../ui/layout';

const menuGroups = [
  {
    icon: Icons.LayoutDashboard,
    label: 'Overview',
    items: [
      { icon: Icons.LayoutDashboard, label: 'Dashboard', path: '/admin' },
      { icon: Icons.BarChart3, label: 'Analytics', path: '/admin/analytics' },
    ],
  },
  {
    icon: Icons.Calendar,
    label: 'Content',
    items: [
      { icon: Icons.Calendar, label: 'Events', path: '/admin/events' },
      { icon: Icons.NotebookPen, label: 'Blog', path: '/admin/blog' },
      { icon: Icons.ClipboardList, label: 'Registrations', path: '/admin/registrations' },
      { icon: Icons.Mic, label: 'Speakers', path: '/admin/speakers' },
    ],
  },
  {
    icon: Icons.Users,
    label: 'Access',
    items: [
      { icon: Icons.Users, label: 'Users', path: '/admin/users' },
      { icon: Icons.Shield, label: 'Roles', path: '/admin/roles' },
      { icon: Icons.Key, label: 'Permissions', path: '/admin/permissions' },
    ],
  },
  {
    icon: Icons.Map,
    label: 'Programs',
    items: [
      { icon: Icons.BookOpenCheck, label: 'Learning', path: '/admin/learning' },
      { icon: Icons.FileCheck2, label: 'Assignment Reviews', path: '/admin/learning/reviews' },
      { icon: Icons.BadgeCheck, label: 'Certificates', path: '/admin/learning/certificates' },
      { icon: Icons.Map, label: 'Roadmaps', path: '/admin/roadmaps' },
      { icon: Icons.UsersRound, label: 'Mentors', path: '/admin/mentors' },
      { icon: Icons.Handshake, label: 'Partners', path: '/admin/partners' },
      { icon: Icons.GraduationCap, label: 'PMB', path: '/admin/pmb' },
    ],
  },
  {
    icon: Icons.Settings,
    label: 'System',
    items: [
      { icon: Icons.Settings, label: 'Settings', path: '/admin/settings' },
    ],
  },
] as const;

export function AdminLayout() {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const isLearningBuilder = location.pathname.startsWith('/admin/learning/edit/');
  const currentLessonLabel = searchParams.get('lesson_label') ?? '';
  const builderBasePath = location.pathname;
  const resolvedMenuGroups = useMemo(
    () =>
      menuGroups.map((group) => {
        if (group.label !== 'Programs' || !isLearningBuilder) {
          return group;
        }

        const createLearningBuilderPath = (view: string) => {
          const next = new URLSearchParams(location.search);
          next.set('view', view);
          return `${builderBasePath}?${next.toString()}`;
        };

        return {
          ...group,
          items: [
            ...group.items,
            { icon: Icons.BookOpenText, label: 'Course', path: createLearningBuilderPath('overview') },
            { icon: Icons.LayoutList, label: 'Curriculum', path: createLearningBuilderPath('curriculum') },
            {
              icon: Icons.FilePenLine,
              label: currentLessonLabel ? `Lesson: ${currentLessonLabel}` : 'Lesson',
              path: createLearningBuilderPath('lesson'),
            },
          ],
        };
      }),
    [builderBasePath, currentLessonLabel, isLearningBuilder, location.search],
  );
  const isActive = (path: string) => {
    if (path === '/admin') return location.pathname === '/admin';
    return location.pathname.startsWith(path);
  };
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(
      resolvedMenuGroups.map((group) => [
        group.label,
        group.items.some((item) => (item.path === '/admin' ? location.pathname === '/admin' : location.pathname.startsWith(item.path))),
      ]),
    ),
  );

  useEffect(() => {
    setOpenGroups((current) => ({
      ...current,
      ...Object.fromEntries(
        resolvedMenuGroups.map((group) => [
          group.label,
          current[group.label] || group.items.some((item) => isActive(item.path)),
        ]),
      ),
    }));
  }, [location.pathname, resolvedMenuGroups]);

  const toggleGroup = (label: string) => {
    setOpenGroups((current) => ({
      ...current,
      [label]: !current[label],
    }));
  };

  return (
    <SidebarUI.SidebarProvider defaultOpen>
      <SidebarUI.Sidebar collapsible="offcanvas">
        <SidebarUI.SidebarHeader brandMark="IT" brandTitle="ITTS Admin" brandSubtitle="Dashboard" />

        <SidebarUI.SidebarContent>
          {resolvedMenuGroups.map((group) => (
            <SidebarUI.SidebarGroup key={group.label}>
              <SidebarUI.SidebarGroupTrigger
                icon={group.icon}
                label={group.label}
                isOpen={!openGroups[group.label]}
                onClick={() => toggleGroup(group.label)}
              />
              <SidebarUI.SidebarGroupContent isOpen={openGroups[group.label]}>
                <SidebarUI.SidebarMenu>
                  {group.items.map((item) => (
                    <SidebarUI.SidebarMenuItem key={item.path}>
                      <SidebarUI.SidebarMenuButton
                        to={item.path}
                        icon={item.icon}
                        label={item.label}
                        isActive={isActive(item.path)}
                      />
                    </SidebarUI.SidebarMenuItem>
                  ))}
                </SidebarUI.SidebarMenu>
              </SidebarUI.SidebarGroupContent>
            </SidebarUI.SidebarGroup>
          ))}
        </SidebarUI.SidebarContent>
      </SidebarUI.Sidebar>

      <SidebarUI.SidebarInset>
        <AdminHeader.AdminHeaderProvider>
          <AdminHeader.AdminHeaderBar>
            <LayoutUI.Row className="min-w-0 flex-1 max-md:w-full" gap="gap-3">
              <SidebarUI.SidebarTrigger />
              <AdminHeader.AdminHeaderSearch />
            </LayoutUI.Row>
            <AdminHeader.AdminHeaderActions />
          </AdminHeader.AdminHeaderBar>
          <AdminHeader.AdminHeaderLogoutDialog />
        </AdminHeader.AdminHeaderProvider>
        <SidebarUI.SidebarMain>
          <Outlet />
        </SidebarUI.SidebarMain>
      </SidebarUI.SidebarInset>
    </SidebarUI.SidebarProvider>
  );
}
