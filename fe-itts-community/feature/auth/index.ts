/**
 * Auth Feature Module Exports
 */

// Context & Hooks
export { AuthProvider, useAuth, type AuthContextType } from "./context";
export * from "./hooks";

// OAuth
export * from "./oauth";
export * from "./oauth-hooks";

// Components
export {
  ProtectedRoute,
  CanAccess,
  RequireAuth,
  RoleBadge,
  UserAvatar,
} from "./components";

// Types & Utilities
export * from "./adapter";

// API (if needed for custom usage)
export * as authApi from "./api";
