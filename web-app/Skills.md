# AGENTS.md

## Purpose
This document is the main guideline for the Figma Make agent so that generated UI and code **always follow this project's stack, architecture, and implementation patterns**.

The agent must read this file before creating pages, components, hooks, API clients, stores, or utilities.

---

## Required Stack

Use the following stack and do not change it without a very strong reason:

- **React**
- **Vite**
- **TypeScript**
- **Axios**
- **@tanstack/react-query**
- **react-hot-toast**
- **Zustand**
- **react-hook-form** + **@hookform/resolvers**
- **zod** for form validation schemas
- Styling must **follow the patterns already used in `home.tsx`**
- Do not create a new styling system if `home.tsx` is already the main visual reference

---

## Architecture Principles

### 1. Views are presentation-only
The `/view` folder should only contain:
- pages
- layout composition
- hook bindings
- component rendering

Do not put these in views:
- `try/catch`
- direct axios calls
- heavy response transformation
- toast logic
- business logic
- state orchestration that does not belong to local UI concerns

Views should be as simple as possible: receive data from hooks/stores and render it.

---

### 2. All domain logic belongs in features
All domain logic must live under `/feature`.

Each feature should be split at minimum into:
- `api.ts`
- `hooks.ts`
- `types.ts`

If a feature grows, expand it into:
- `feature/<module>/api/*.ts`
- `feature/<module>/hooks/*.ts`
- `feature/<module>/types/*.ts`
- `feature/<module>/components/*.tsx`

---

### 3. Toasts must not live in views
All `react-hot-toast` usage must come from:
- custom hooks
- mutation handlers
- async orchestration helpers

Views must not call success/error toasts directly.

---

### 4. No duplicate types
Types must be a single source of truth.

Rules:
- API request/response types belong in `feature/<module>/types.ts`
- shared/global types should live in a clear shared location, not copied across files
- do not create multiple interfaces/types with different names for the same shape
- if a generic backend response type already exists, reuse it

---

### 5. Base API and base response must be standardized
There must be abstractions for:
- axios instance
- request config
- generic API response
- generic paginated response if needed
- generic mutation/query key helpers if needed

Do not create a new axios instance per feature unless there is a real need.

---

### 6. Avoid repeated native HTML
If a markup pattern repeats, do not keep rewriting the same `div`, `section`, `header`, `span`, layout wrappers, or card shells.

Create reusable components such as:
- `PageSection`
- `SectionHeader`
- `CardShell`
- `Stack`
- `Inline`
- `EmptyState`
- `PageContainer`
- `FieldGroup`

The goal is for the code to feel like the work of a clean React developer, not long generated HTML.

### 6.1. Avoid noisy call sites
If a layout or page starts filling up with:
- `className`
- raw HTML wrappers
- repeated `Link` + icon + label patterns
- visual configuration that is always the same

Then that styling and structure must be moved into existing components instead of being repeated at the call site.

Desired examples:
- `SidebarHeader brandMark="IT" brandTitle="ITTS Admin" brandSubtitle="Dashboard" />`
- `SidebarMenuButton to={item.path} icon={item.icon} label={item.label} isActive={...} />`
- `SidebarMain`

Not desired:
- layouts full of nested `div`s just for icon, title, and subtitle
- manual `Link` + icon + text repeated for every item
- `main`, `section`, `header`, and wrapper styling repeated in pages/layouts

Principles:
- pages and layouts should read like composition
- visual detail should live in components
- pages and layouts should not become places to hand-write styling line by line

### 6.2. Do not create new files if existing components are enough
If a need can still be handled by improving an existing component, do that first.

Priority:
1. use existing components
2. extend the API of existing components
3. only create a new file/component if it is truly unavoidable

Examples:
- prefer upgrading `SidebarHeader` so it can accept brand props
- prefer upgrading `SidebarMenuButton` so it can accept `to`, `icon`, and `label`
- do not rush to create wrappers or mappers just for styling

### 6.3. Prefer namespace imports for large modules
If a file imports many items from the same module, use namespace imports so the file stays shorter and easier to scan.

Preferred examples:

```tsx
import * as Icons from 'lucide-react';
import * as SidebarUI from '../ui/sidebar';
import * as AdminHeader from '../ui/admin/header';
```

Avoid long import blocks when they make the file harder to read.

---

### 7. Do not duplicate components
Before creating a new component:
- check whether a similar pattern already exists
- if the difference is small, use props or variants
- do not create two different components for the same visual structure

---

### 8. Stores are only for global/shared state
Use Zustand only for state that truly deserves to be global, such as:
- auth/session
- filters used across multiple pages
- UI preferences
- multi-step wizard state
- temporary shared UI cache when truly needed

Do not use Zustand for small local state that `useState` can handle.

---

## Required Folder Structure

Use this structure:

```txt
src/
  feature/
    <module>/
      api.ts
      hooks.ts
      types.ts
      components/
  view/
    <page-name>/
      index.tsx
  store/
    <store-name>.ts
  utility/
    api.ts
    response.ts
    error.ts
    query.ts
    format.ts
    helper.ts
  components/
    common/
    layout/
```

For large features, the structure can be expanded like this:

```txt
src/
  feature/
    user/
      api/
        user.api.ts
      hooks/
        useUserList.ts
        useCreateUser.ts
      types/
        user.type.ts
      components/
        UserCard.tsx
        UserTable.tsx
```

But the principle stays the same:
- APIs are separated
- hooks are separated
- types are separated
- views do not hold business logic

---

## Naming Conventions

### Files
- API: `user.api.ts`
- Hook: `useUserList.ts`
- Type: `user.type.ts`
- Store: `auth.store.ts`
- Utility: `formatCurrency.ts`

### Hooks
Use explicit names:
- `useUserList`
- `useUserDetail`
- `useCreateUser`
- `useUpdateUser`
- `useDeleteUser`

Avoid vague names such as:
- `useData`
- `useFeature`
- `useHandler`

---

## API Layer Standards

### Axios
There must be one base instance that handles:
- base URL
- timeout
- request interceptors
- response interceptors
- auth header injection if needed

All feature API calls must go through this base instance.

### Responses
Provide generic types such as:
- `ApiResponse<T>`
- `PaginatedResponse<T>`
- `ApiErrorResponse`

If the backend has a fixed response format, all features must follow it consistently.

---

## React Query Standards

### Query
- query keys must be consistent and structured
- separate query key builders when they start growing
- do not write long inline query functions inside views

### Mutation
- mutation logic belongs in hooks
- success toast belongs in hooks
- error toast belongs in hooks
- invalidation belongs in hooks
- server error mapping belongs in hooks/helpers, not views

---

## Error Handling Standards

- Do not put `try/catch` in views
- Handle errors in:
  - hooks
  - API abstractions
  - reusable error mappers

If backend error parsing is needed, create reusable helpers such as:
- `getErrorMessage`
- `normalizeApiError`

---

## Styling Standards

### Must follow `home.tsx`
All new pages/components must:
- follow the existing spacing system
- follow the radius, typography, shadow, border, and visual tone from `home.tsx`
- follow the layout approach from `home.tsx`
- not create styles that visually clash with the existing design

### Do not invent new styles unless necessary
If a pattern already exists in `home.tsx`, reuse it.

If a new visual component is needed, adapt the existing style language instead of creating a new one.

---

## Component Standards

When building UI:
- prioritize reusable components
- minimize unnecessary wrappers
- avoid overly deep nesting
- split components when a file becomes too large
- create layout primitives when patterns repeat often

Use this mindset:
- one component for one responsibility
- do not mix heavy container logic with presentational components

---

## Required Implementation Rules

### Required
- use clean TypeScript
- use shared types when they already exist
- views should only render
- hooks should manage fetching, mutation, toast, and query invalidation
- API calls must go through the base axios instance
- use Zustand only for truly shared/global state
- put general helpers in `/utility`
- styles must follow `home.tsx`
- reusable components are preferred over repeated markup

### Forbidden
- toasts in views
- `try/catch` in views
- axios calls in views
- duplicate types
- duplicate components
- new styling that breaks the `home.tsx` pattern
- excessive wrapper `div`s without a reason
- business logic inside pages

---

## Checklist Before Generating Code

Before the agent generates code, make sure:

1. Types are reused and not duplicated
2. API, hooks, and types are properly separated
3. The view truly only renders and binds hooks
4. Toasts exist only in hooks
5. There is no `try/catch` in the view
6. Styling follows `home.tsx`
7. Repeated markup has been turned into components when appropriate
8. A new component is only created if no suitable equivalent already exists
9. Zustand is used only for global/shared state
10. Any utility created is truly general and reusable

---

## Expected Agent Output

Every generated code output should feel like it was written by a React developer who understands:
- separation of concerns
- project scale
- maintainability
- consistency
- reuse
- modern frontend architecture

Not just UI that works, but code that is:
- clean
- consistent
- scalable
- easy to read
- easy to maintain

---

## Default Rule When in Doubt

If the agent is unsure:
- prefer reuse over duplication
- prefer file separation over bloated files
- prefer hooks over logic in views
- prefer utilities over helper copy-paste
- prefer the `home.tsx` pattern over new styles
- prefer reusable components over repeated native tags

## Rules for Editing Existing Code

When modifying existing files:
- preserve naming conventions already used in the file
- preserve import style unless it is clearly inconsistent with project standards
- do not refactor unrelated code
- make the smallest clean change that satisfies the request