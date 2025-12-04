"use client";

/**
 * Admin Dashboard Overview Page
 *
 * Main dashboard page with statistics and quick actions
 */

import { HiCalendar, HiUsers, HiDocument, HiMicrophone, HiArrowTrendingUp } from "react-icons/hi2";
import { useAuth } from "@/feature/auth";

type StatCard = {
  label: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
  trend?: string;
  trendUp?: boolean;
  color: string;
};

const STATS: StatCard[] = [
  {
    label: "Total Events",
    value: "24",
    icon: HiCalendar,
    trend: "+12%",
    trendUp: true,
    color: "bg-blue-500/10 text-blue-600",
  },
  {
    label: "Total Users",
    value: "1,234",
    icon: HiUsers,
    trend: "+23%",
    trendUp: true,
    color: "bg-green-500/10 text-green-600",
  },
  {
    label: "Registrations",
    value: "856",
    icon: HiDocument,
    trend: "+8%",
    trendUp: true,
    color: "bg-purple-500/10 text-purple-600",
  },
  {
    label: "Speakers",
    value: "42",
    icon: HiMicrophone,
    trend: "+5%",
    trendUp: true,
    color: "bg-orange-500/10 text-orange-600",
  },
];

type Activity = {
  id: string;
  user: string;
  action: string;
  target: string;
  time: string;
};

const RECENT_ACTIVITIES: Activity[] = [
  {
    id: "1",
    user: "John Doe",
    action: "created",
    target: "Event: React Workshop 2024",
    time: "2 hours ago",
  },
  {
    id: "2",
    user: "Jane Smith",
    action: "updated",
    target: "User: alice@example.com",
    time: "4 hours ago",
  },
  {
    id: "3",
    user: "Bob Johnson",
    action: "deleted",
    target: "Speaker: Mike Wilson",
    time: "6 hours ago",
  },
  {
    id: "4",
    user: "Alice Brown",
    action: "approved",
    target: "Registration: Next.js Bootcamp",
    time: "8 hours ago",
  },
];

export default function AdminDashboardPage() {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div>
        <h1 className="text-3xl font-bold">
          Welcome back, {user?.full_name || "Admin"}!
        </h1>
        <p className="mt-1 text-foreground/60">
          Here's what's happening with your community today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {STATS.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="rounded-lg border border-border bg-surface p-6 transition-shadow hover:shadow-md"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-foreground/60">{stat.label}</p>
                  <p className="mt-2 text-3xl font-bold">{stat.value}</p>
                  {stat.trend && (
                    <div className="mt-2 flex items-center gap-1 text-sm">
                      <HiArrowTrendingUp
                        className={`h-4 w-4 ${
                          stat.trendUp ? "text-green-600" : "text-red-600"
                        }`}
                      />
                      <span
                        className={stat.trendUp ? "text-green-600" : "text-red-600"}
                      >
                        {stat.trend}
                      </span>
                      <span className="text-foreground/60">from last month</span>
                    </div>
                  )}
                </div>
                <div className={`rounded-lg p-3 ${stat.color}`}>
                  <Icon className="h-6 w-6" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Two Column Layout */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Activity */}
        <div className="rounded-lg border border-border bg-surface p-6">
          <h2 className="mb-4 text-xl font-semibold">Recent Activity</h2>
          <div className="space-y-4">
            {RECENT_ACTIVITIES.map((activity) => (
              <div
                key={activity.id}
                className="flex items-start gap-3 rounded-lg border border-border p-3 hover:bg-background"
              >
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary/10">
                  <span className="text-xs font-semibold text-primary">
                    {activity.user.charAt(0)}
                  </span>
                </div>
                <div className="flex-1">
                  <p className="text-sm">
                    <span className="font-medium">{activity.user}</span>{" "}
                    <span className="text-foreground/60">{activity.action}</span>{" "}
                    <span className="font-medium">{activity.target}</span>
                  </p>
                  <p className="mt-1 text-xs text-foreground/60">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="rounded-lg border border-border bg-surface p-6">
          <h2 className="mb-4 text-xl font-semibold">Quick Actions</h2>
          <div className="grid gap-3">
            <button className="flex items-center gap-3 rounded-lg border border-border p-4 text-left transition-colors hover:bg-background">
              <div className="rounded-lg bg-blue-500/10 p-2">
                <HiCalendar className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="font-medium">Create New Event</p>
                <p className="text-xs text-foreground/60">
                  Add a new event to the calendar
                </p>
              </div>
            </button>

            <button className="flex items-center gap-3 rounded-lg border border-border p-4 text-left transition-colors hover:bg-background">
              <div className="rounded-lg bg-green-500/10 p-2">
                <HiUsers className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="font-medium">Add User</p>
                <p className="text-xs text-foreground/60">
                  Invite a new user to the platform
                </p>
              </div>
            </button>

            <button className="flex items-center gap-3 rounded-lg border border-border p-4 text-left transition-colors hover:bg-background">
              <div className="rounded-lg bg-purple-500/10 p-2">
                <HiMicrophone className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="font-medium">Add Speaker</p>
                <p className="text-xs text-foreground/60">
                  Add a new speaker to an event
                </p>
              </div>
            </button>

            <button className="flex items-center gap-3 rounded-lg border border-border p-4 text-left transition-colors hover:bg-background">
              <div className="rounded-lg bg-orange-500/10 p-2">
                <HiDocument className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="font-medium">View Reports</p>
                <p className="text-xs text-foreground/60">
                  Check analytics and insights
                </p>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Upcoming Events */}
      <div className="rounded-lg border border-border bg-surface p-6">
        <h2 className="mb-4 text-xl font-semibold">Upcoming Events</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-border text-left text-sm">
              <tr>
                <th className="pb-3 font-medium text-foreground/60">Event</th>
                <th className="pb-3 font-medium text-foreground/60">Date</th>
                <th className="pb-3 font-medium text-foreground/60">Registrations</th>
                <th className="pb-3 font-medium text-foreground/60">Status</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              <tr className="border-b border-border">
                <td className="py-3">React Workshop 2024</td>
                <td className="py-3 text-foreground/60">Jan 15, 2024</td>
                <td className="py-3 text-foreground/60">42/50</td>
                <td className="py-3">
                  <span className="inline-flex rounded-full bg-green-500/10 px-2.5 py-0.5 text-xs font-medium text-green-600">
                    Active
                  </span>
                </td>
              </tr>
              <tr className="border-b border-border">
                <td className="py-3">Next.js Bootcamp</td>
                <td className="py-3 text-foreground/60">Jan 22, 2024</td>
                <td className="py-3 text-foreground/60">38/40</td>
                <td className="py-3">
                  <span className="inline-flex rounded-full bg-green-500/10 px-2.5 py-0.5 text-xs font-medium text-green-600">
                    Active
                  </span>
                </td>
              </tr>
              <tr>
                <td className="py-3">TypeScript Advanced</td>
                <td className="py-3 text-foreground/60">Feb 5, 2024</td>
                <td className="py-3 text-foreground/60">12/30</td>
                <td className="py-3">
                  <span className="inline-flex rounded-full bg-yellow-500/10 px-2.5 py-0.5 text-xs font-medium text-yellow-600">
                    Draft
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
