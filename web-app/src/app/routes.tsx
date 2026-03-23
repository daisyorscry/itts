import { createBrowserRouter } from "react-router";
// routes refreshed
import { RootLayout } from "./components/layouts/RootLayout";
import { AdminLayout } from "./components/layouts/AdminLayout";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { Home } from "./pages/Home";
import { About } from "./pages/About";
import { Community } from "./pages/Community";
import { Program } from "./pages/Program";
import { Events } from "./pages/Events";
import { Docs } from "./pages/Docs";
import { Blog } from "./pages/Blog";
import { SignIn } from "./pages/SignIn";
import { Register } from "./pages/Register";
import { OAuthCallback } from "./pages/OAuthCallback";
import { TermsOfService } from "./pages/TermsOfService";
import { PrivacyPolicy } from "./pages/PrivacyPolicy";
import { CookiePolicy } from "./pages/CookiePolicy";
import { DMCAPolicy } from "./pages/DMCAPolicy";
import { AdminDashboard } from "./pages/admin/Dashboard";
import { AdminEvents } from "./pages/admin/Events";
import { AdminEventCreate } from "./pages/admin/events/ViewCreateEvent";
import { AdminEventEdit } from "./pages/admin/events/ViewEditEvent";
import { AdminUsers } from "./pages/admin/Users";
import { AdminUserCreate } from "./pages/admin/users/ViewCreateUser";
import { AdminUserEdit } from "./pages/admin/users/ViewEditUser";
import { AdminSpeakers } from "./pages/admin/Speakers";
import { AdminSpeakerCreate } from "./pages/admin/speakers/ViewCreateSpeaker";
import { AdminSpeakerEdit } from "./pages/admin/speakers/ViewEditSpeaker";
import { AdminRegistrations } from "./pages/admin/Registrations";
import { AdminRoadmaps } from "./pages/admin/Roadmaps";
import { AdminRoadmapCreate } from "./pages/admin/roadmaps/ViewCreateRoadmap";
import { AdminRoadmapEdit } from "./pages/admin/roadmaps/ViewEditRoadmap";
import { AdminRoadmapItems } from "./pages/admin/roadmaps/ViewRoadmapItems";
import { AdminPartners } from "./pages/admin/Partners";
import { AdminPartnerCreate } from "./pages/admin/partners/ViewCreatePartner";
import { AdminPartnerEdit } from "./pages/admin/partners/ViewEditPartner";
import { AdminMentors } from "./pages/admin/Mentors";
import { AdminMentorCreate } from "./pages/admin/mentors/ViewCreateMentor";
import { AdminMentorEdit } from "./pages/admin/mentors/ViewEditMentor";
import { AdminAnalytics } from "./pages/admin/Analytics";
import { AdminRoles } from "./pages/admin/Roles";
import { AdminRoleEdit } from "./pages/admin/roles/ViewEditRole";
import { AdminPermissions } from "./pages/admin/Permissions";
import { AdminPermissionView } from "./pages/admin/permissions/ViewPermission";
import { AdminPermissionsTest } from "./pages/admin/PermissionsTest";
import { AdminSettings } from "./pages/admin/Settings";
import { AdminPMB } from "./pages/admin/PMB";
import { NotFound } from "./pages/NotFound";
import { Unauthorized } from "./pages/Unauthorized";

// Protected Admin Layout Wrapper
function ProtectedAdminLayout() {
  return (
    <ProtectedRoute requireAuth>
      <AdminLayout />
    </ProtectedRoute>
  );
}

export const router = createBrowserRouter([
  {
    path: "/",
    Component: RootLayout,
    children: [
      { index: true, Component: Home },
      { path: "about", Component: About },
      { path: "community", Component: Community },
      { path: "program", Component: Program },
      { path: "events", Component: Events },
      { path: "docs", Component: Docs },
      { path: "blog", Component: Blog },
      { path: "sign-in", Component: SignIn },
      { path: "register", Component: Register },
      { path: "auth/callback", Component: OAuthCallback },
      { path: "terms-of-service", Component: TermsOfService },
      { path: "privacy-policy", Component: PrivacyPolicy },
      { path: "cookie-policy", Component: CookiePolicy },
      { path: "dmca-policy", Component: DMCAPolicy },
    ],
  },
  {
    path: "/admin",
    Component: ProtectedAdminLayout,
    children: [
      { index: true, Component: AdminDashboard },
      { path: "events", Component: AdminEvents },
      { path: "events/create", Component: AdminEventCreate },
      { path: "events/:id", Component: AdminEventEdit },
      { path: "events/edit/:id", Component: AdminEventEdit },
      { path: "users", Component: AdminUsers },
      { path: "users/:id", Component: AdminUserEdit },
      { path: "users/create", Component: AdminUserCreate },
      { path: "users/edit/:id", Component: AdminUserEdit },
      { path: "speakers", Component: AdminSpeakers },
      { path: "speakers/create", Component: AdminSpeakerCreate },
      { path: "speakers/:id", Component: AdminSpeakerEdit },
      { path: "speakers/edit/:id", Component: AdminSpeakerEdit },
      { path: "registrations", Component: AdminRegistrations },
      { path: "roadmaps", Component: AdminRoadmaps },
      { path: "roadmaps/create", Component: AdminRoadmapCreate },
      { path: "roadmaps/:id", Component: AdminRoadmapEdit },
      { path: "roadmaps/edit/:id", Component: AdminRoadmapEdit },
      { path: "roadmaps/:id/items", Component: AdminRoadmapItems },
      { path: "partners", Component: AdminPartners },
      { path: "partners/create", Component: AdminPartnerCreate },
      { path: "partners/:id", Component: AdminPartnerEdit },
      { path: "partners/edit/:id", Component: AdminPartnerEdit },
      { path: "mentors", Component: AdminMentors },
      { path: "mentors/create", Component: AdminMentorCreate },
      { path: "mentors/:id", Component: AdminMentorEdit },
      { path: "mentors/edit/:id", Component: AdminMentorEdit },
      { path: "analytics", Component: AdminAnalytics },
      { path: "roles", Component: AdminRoles },
      { path: "roles/:id", Component: AdminRoleEdit },
      { path: "roles/edit/:id", Component: AdminRoleEdit },
      { path: "permissions", Component: AdminPermissions },
      { path: "permissions/:id", Component: AdminPermissionView },
      { path: "permissions-test", Component: AdminPermissionsTest },
      { path: "settings", Component: AdminSettings },
      { path: "pmb", Component: AdminPMB },
    ],
  },
  {
    path: "/unauthorized",
    Component: Unauthorized,
  },
  {
    path: "*",
    Component: NotFound,
  },
]);
