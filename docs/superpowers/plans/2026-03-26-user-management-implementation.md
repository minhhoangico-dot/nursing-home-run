# User Management And Module Permissions Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Complete internal user CRUD and database-backed module permissions so admins can manage accounts and role access, and module permissions are enforced consistently in both navigation and routes.

**Architecture:** Add a shared module registry plus a database-backed `role_permissions` matrix as the single access-control source of truth. Extend the user model with `isActive`, centralize user mutations in the auth/data layer, then refactor settings, sidebar, and route guards to consume the new stores instead of hard-coded role arrays.

**Tech Stack:** React 19, TypeScript, Zustand, Supabase, Vite, Zod, React Hook Form, Vitest for new focused unit tests.

---

## File Map

### Create

- `src/constants/modules.ts`
- `src/types/permissions.ts`
- `src/stores/permissionStore.ts`
- `src/routes/ModuleRoute.tsx`
- `src/features/settings/components/UserFormModal.tsx`
- `src/features/settings/components/ResetPasswordModal.tsx`
- `src/features/settings/components/UserManagementPanel.tsx`
- `src/features/settings/components/RolePermissionsPanel.tsx`
- `src/lib/permissions.test.ts`
- `migrations/012_user_management_permissions.sql`

### Modify

- `package.json`
- `src/types/user.ts`
- `src/types/index.ts`
- `src/services/medicalService.ts`
- `src/services/databaseService.ts`
- `src/stores/authStore.ts`
- `src/hooks/useInitialData.ts`
- `src/features/auth/pages/LoginPage.tsx`
- `src/features/profile/pages/ProfilePage.tsx`
- `src/features/settings/pages/SettingsPage.tsx`
- `src/features/settings/components/AddUserModal.tsx`
- `src/features/settings/index.ts`
- `src/components/layout/Sidebar.tsx`
- `src/components/layout/MainLayout.tsx`
- `src/routes/AppRoutes.tsx`
- `src/routes/RoleBasedRoute.tsx`
- `scripts/sql/vostro-bootstrap.sql`
- `scripts/bootstrap-vostro-supabase.mjs`

### Optional Cleanup If Reached Naturally

- `src/features/auth/hooks/useAuth.ts`
- `src/data/mockUsers.ts`
- `src/data/index.ts`

Do not spend a standalone task on the optional cleanup unless those files actively conflict with the implementation.

### Constraints To Respect

- `ADMIN -> settings` must always remain enabled.
- A logged-in admin must not be able to deactivate their own account.
- A logged-in admin must not be able to change their own role.
- `weight-tracking` must be included in the permission matrix even though it is not currently shown in the sidebar.
- `profile` remains accessible to any authenticated user, stays in the shared route/module registry, and is not part of the admin-managed module matrix.
- This repo currently has no first-party test harness. Add a minimal Vitest setup for pure permission logic only; use `cmd /c npm run build` plus structured manual checks for the rest.
- Capture a baseline `cmd /c npx tsc --noEmit` result before implementation work starts. If the repo is already red, do not introduce new type errors in touched files.

## Approved Seed Matrix To Seed

Use this approved matrix as the new single source of truth for the implementation. Do not try to infer it dynamically from the current repo, because the live route rules and sidebar rules are already inconsistent.

- `residents`: `ADMIN`, `DOCTOR`, `SUPERVISOR`, `ACCOUNTANT`, `NURSE`
- `rooms`: `ADMIN`, `DOCTOR`, `SUPERVISOR`, `ACCOUNTANT`, `NURSE`
- `nutrition`: `ADMIN`, `DOCTOR`, `SUPERVISOR`, `NURSE`, `CAREGIVER`
- `visitors`: `ADMIN`, `DOCTOR`, `SUPERVISOR`, `NURSE`, `CAREGIVER`
- `daily_monitoring`: `ADMIN`, `DOCTOR`, `SUPERVISOR`, `NURSE`
- `procedures`: `ADMIN`, `DOCTOR`, `SUPERVISOR`, `NURSE`
- `weight_tracking`: `ADMIN`, `DOCTOR`, `SUPERVISOR`, `NURSE`
- `incidents`: `ADMIN`, `DOCTOR`, `SUPERVISOR`, `NURSE`, `CAREGIVER`
- `maintenance`: `ADMIN`, `DOCTOR`, `SUPERVISOR`, `ACCOUNTANT`
- `forms`: `ADMIN`, `DOCTOR`, `SUPERVISOR`, `NURSE`
- `finance`: `ADMIN`, `ACCOUNTANT`
- `settings`: `ADMIN`

Use the same ordering in:

- module registry
- permission UI
- seed SQL
- sidebar
- route guard coverage

### Task 1: Establish Module Contracts And Minimal Test Harness

**Files:**
- Create: `src/constants/modules.ts`
- Create: `src/types/permissions.ts`
- Create: `src/lib/permissions.test.ts`
- Modify: `package.json`
- Test: `src/lib/permissions.test.ts`

- [ ] **Step 1: Add a minimal Vitest test script and dependency**

Update `package.json` to add:

```json
{
  "scripts": {
    "test": "vitest run"
  },
  "devDependencies": {
    "vitest": "^3.2.4"
  }
}
```

- [ ] **Step 2: Write the failing permission-contract tests**

Create `src/lib/permissions.test.ts` covering:

```ts
import { describe, expect, it } from 'vitest';
import { MODULES, MODULE_KEYS, DEFAULT_ROLE_PERMISSIONS } from '../constants/modules';

describe('module registry', () => {
  it('includes weight_tracking and profile in the shared registry', () => {
    expect(MODULE_KEYS).toContain('weight_tracking');
    expect(MODULE_KEYS).toContain('profile');
  });

  it('keeps settings enabled for ADMIN in the default matrix', () => {
    expect(DEFAULT_ROLE_PERMISSIONS.ADMIN.settings).toBe(true);
  });

  it('keeps profile outside the admin-managed permission matrix', () => {
    expect('profile' in DEFAULT_ROLE_PERMISSIONS.ADMIN).toBe(false);
  });
});
```

- [ ] **Step 3: Run the test to verify it fails**

Run: `cmd /c npm run test -- src/lib/permissions.test.ts`
Expected: FAIL because `modules.ts` does not exist yet.

- [ ] **Step 4: Implement the shared permission contracts**

Create `src/types/permissions.ts` with:

- `ModuleKey`
- `RolePermission`
- `RolePermissionMap`

Create `src/constants/modules.ts` with:

- fixed registry entries for all managed modules
- a `profile` entry that is routed through the shared registry but excluded from admin-managed toggles
- labels, paths, titles, sidebar visibility
- `DEFAULT_ROLE_PERMISSIONS`
- helpers such as `getModuleByPath` and `getSidebarModulesForRole` if they remain pure

Keep `profile` outside `DEFAULT_ROLE_PERMISSIONS`.

- [ ] **Step 5: Run the focused tests**

Run: `cmd /c npm run test -- src/lib/permissions.test.ts`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add package.json package-lock.json src/constants/modules.ts src/types/permissions.ts src/lib/permissions.test.ts
git commit -m "test: add permission contracts and registry"
```

### Task 2: Add Schema And Bootstrap Support For Active Users And Role Permissions

**Files:**
- Create: `migrations/012_user_management_permissions.sql`
- Modify: `scripts/sql/vostro-bootstrap.sql`
- Modify: `scripts/bootstrap-vostro-supabase.mjs`

- [ ] **Step 1: Write the migration**

Create `migrations/012_user_management_permissions.sql` to:

```sql
alter table public.users
  add column if not exists is_active boolean not null default true;

create table if not exists public.role_permissions (
  role text not null,
  module_key text not null,
  is_enabled boolean not null default true,
  updated_at timestamptz not null default now(),
  primary key (role, module_key)
);
```

Seed one row per `role + module_key` from the default matrix above.

- [ ] **Step 2: Add demo-safe RLS and policies for `role_permissions`**

In the same migration, mirror the repo's demo access style for the new table:

- enable row level security on `public.role_permissions`
- add the same broad demo read/write policy pattern already used by other app tables

Do the same in `scripts/sql/vostro-bootstrap.sql` so fresh bootstraps and upgraded environments stay aligned.

- [ ] **Step 3: Mirror the same schema in bootstrap SQL**

Update `scripts/sql/vostro-bootstrap.sql` so fresh environments create:

- `users.is_active`
- `role_permissions`

and so the bootstrap schema matches the migration shape.

- [ ] **Step 4: Seed permission rows during bootstrap**

Update `scripts/bootstrap-vostro-supabase.mjs` to:

- give seeded users `is_active: true`
- upsert seeded `role_permissions`
- wait for `role_permissions` to be visible to PostgREST before any REST upsert, or seed it through SQL instead

Use the same fixed module matrix as the migration.

- [ ] **Step 5: Require disposable bootstrap verification**

Run:

- `Get-Content migrations\\012_user_management_permissions.sql`
- `Get-Content scripts\\sql\\vostro-bootstrap.sql`

Expected: both define `users.is_active` and `role_permissions`.

Then run on a disposable environment:

- `cmd /c npm run bootstrap:vostro`

Expected: bootstrap completes successfully and seeds both `users` and `role_permissions`.

Do not point bootstrap at a production database during development.

- [ ] **Step 6: Commit**

```bash
git add migrations/012_user_management_permissions.sql scripts/sql/vostro-bootstrap.sql scripts/bootstrap-vostro-supabase.mjs
git commit -m "feat: add user activity and role permission schema"
```

### Task 3: Extend User Types And Service Layer

**Files:**
- Modify: `src/types/user.ts`
- Modify: `src/types/index.ts`
- Modify: `src/services/medicalService.ts`
- Modify: `src/services/databaseService.ts`
- Test: `src/lib/permissions.test.ts`

- [ ] **Step 1: Extend the user type**

Update `src/types/user.ts` to add:

```ts
export interface User {
  id: string;
  name: string;
  username: string;
  password?: string;
  role: Role;
  floor?: string;
  avatar?: string;
  isActive?: boolean;
  updatedAt?: string;
}
```

Keep `role` as the existing fixed union.

- [ ] **Step 2: Export the new permission types**

Update `src/types/index.ts` to export `./permissions`.

- [ ] **Step 3: Extend user mappers and service methods**

Update `src/services/medicalService.ts` so the user mapper handles:

- `is_active -> isActive`
- `updated_at -> updatedAt`

Add user operations:

- `create`
- `update`
- `deactivate`
- `reactivate`
- `resetPassword`

Add role-permission operations:

- `getRolePermissions`
- `replaceRolePermissions`

Prefer small explicit methods over a catch-all `upsert` in UI call sites.

- [ ] **Step 4: Expose the new methods through `db`**

Update `src/services/databaseService.ts` so `db.users` and `db.permissions` provide the new API.

- [ ] **Step 5: Re-run the focused tests and type-check through build**

Run:

- `cmd /c npm run test -- src/lib/permissions.test.ts`
- `cmd /c npx tsc --noEmit`
- `cmd /c npm run build`

Expected: tests/build PASS, and `tsc` introduces no new errors in touched files.

- [ ] **Step 6: Commit**

```bash
git add src/types/user.ts src/types/index.ts src/services/medicalService.ts src/services/databaseService.ts
git commit -m "feat: extend user and permission services"
```

### Task 4: Centralize Auth And Permission State

**Files:**
- Create: `src/stores/permissionStore.ts`
- Modify: `src/stores/authStore.ts`
- Modify: `src/hooks/useInitialData.ts`
- Modify: `src/features/auth/pages/LoginPage.tsx`
- Modify: `src/features/profile/pages/ProfilePage.tsx`

- [ ] **Step 1: Write the permission store**

Create `src/stores/permissionStore.ts` with:

- `permissions`
- `isLoading`
- `error`
- `fetchPermissions`
- `replaceRolePermissions`
- pure selector `canAccessModule(role, moduleKey)`

Initialize from DB, not local storage.
If permissions fail to load, store enough state for the route guard and sidebar to fail closed instead of silently granting access.

- [ ] **Step 2: Expand the auth store with user mutations**

Update `src/stores/authStore.ts` to add:

- `createUser`
- `updateUser`
- `deactivateUser`
- `reactivateUser`
- `resetPassword`

Rules to enforce in store-level guards:

- prevent deactivating the currently logged-in user
- prevent changing the current user's role

When the current user's record changes in DB, refresh `user` in persisted state if still valid.

- [ ] **Step 3: Load users and permissions during bootstrap**

Update `src/hooks/useInitialData.ts` so authenticated app boot loads:

- users
- permissions
- existing domain data

Keep login boot working even before an authenticated session exists.

- [ ] **Step 4: Harden login against inactive accounts**

Update `src/features/auth/pages/LoginPage.tsx` so:

- missing user shows account-not-found
- inactive user shows inactive-account error
- wrong password shows password error

Do not log passwords or raw sensitive state to the console.

- [ ] **Step 5: Keep profile compatible with the new user shape**

Update `src/features/profile/pages/ProfilePage.tsx` to use the new user mutation API instead of writing directly to `db.users.upsert` when practical.

Keep profile accessible to all authenticated users regardless of the module matrix.

- [ ] **Step 6: Verify build and typecheck**

Run:

- `cmd /c npx tsc --noEmit`
- `cmd /c npm run build`

Expected: no new type errors in touched files, build PASS

- [ ] **Step 7: Commit**

```bash
git add src/stores/permissionStore.ts src/stores/authStore.ts src/hooks/useInitialData.ts src/features/auth/pages/LoginPage.tsx src/features/profile/pages/ProfilePage.tsx
git commit -m "feat: centralize auth and permission state"
```

### Task 5: Build The User CRUD UI

**Files:**
- Create: `src/features/settings/components/UserFormModal.tsx`
- Create: `src/features/settings/components/ResetPasswordModal.tsx`
- Create: `src/features/settings/components/UserManagementPanel.tsx`
- Modify: `src/features/settings/components/AddUserModal.tsx`
- Modify: `src/features/settings/pages/SettingsPage.tsx`
- Modify: `src/features/settings/index.ts`

- [ ] **Step 1: Replace the create-only modal with a shared form**

Create `UserFormModal.tsx` with modes:

- `create`
- `edit`

Fields:

- name
- username
- role
- floor when relevant
- active status for edit mode
- password for create mode

Use Zod + React Hook Form, and keep role-specific floor behavior.

- [ ] **Step 2: Add a reset-password modal**

Create `ResetPasswordModal.tsx` with:

- new password
- confirm password
- minimum length validation

This modal must call the auth-store reset action, not write directly to service code.

- [ ] **Step 3: Extract the user list into a focused panel**

Create `UserManagementPanel.tsx` to render:

- desktop table
- mobile cards
- action buttons for edit, deactivate/reactivate, reset password

Display active/inactive status clearly.

- [ ] **Step 4: Refactor settings to use the extracted components**

Update `SettingsPage.tsx` so the `users` view uses the shared panel and modal state instead of inline row actions.

Admin safety rules in UI:

- disable edit-role for the currently logged-in admin
- disable deactivate for the currently logged-in admin
- translate duplicate-username database errors into form feedback and/or toast text the admin can act on

- [ ] **Step 5: Retire or wrap the old `AddUserModal`**

Either:

- replace its internals with `UserFormModal`, or
- remove its exports and stop referencing it

Do not leave dead create-only code behind.

- [ ] **Step 6: Verify build and typecheck**

Run:

- `cmd /c npx tsc --noEmit`
- `cmd /c npm run build`

Expected: no new type errors in touched files, build PASS

- [ ] **Step 7: Commit**

```bash
git add src/features/settings/components/UserFormModal.tsx src/features/settings/components/ResetPasswordModal.tsx src/features/settings/components/UserManagementPanel.tsx src/features/settings/components/AddUserModal.tsx src/features/settings/pages/SettingsPage.tsx src/features/settings/index.ts
git commit -m "feat: complete internal user management ui"
```

### Task 6: Add The Role Permission Management UI

**Files:**
- Create: `src/features/settings/components/RolePermissionsPanel.tsx`
- Modify: `src/features/settings/pages/SettingsPage.tsx`
- Modify: `src/features/settings/index.ts`
- Modify: `src/constants/modules.ts`

- [ ] **Step 1: Add the settings entry point for role permissions**

Update the settings menu cards so admins can enter a new `roles` view.

- [ ] **Step 2: Build the permission matrix panel**

Create `RolePermissionsPanel.tsx` that:

- renders one section per fixed role
- renders module toggles in registry order
- uses local dirty state until save
- saves by role through `permissionStore.replaceRolePermissions`

Hard rule:

- `ADMIN -> settings` toggle is locked on and visually non-editable

- [ ] **Step 3: Surface save and error states**

Show:

- unsaved changes state
- saving state
- success toast
- failure toast while keeping unsaved choices visible

- [ ] **Step 4: Verify build and typecheck**

Run:

- `cmd /c npx tsc --noEmit`
- `cmd /c npm run build`

Expected: no new type errors in touched files, build PASS

- [ ] **Step 5: Commit**

```bash
git add src/features/settings/components/RolePermissionsPanel.tsx src/features/settings/pages/SettingsPage.tsx src/features/settings/index.ts src/constants/modules.ts
git commit -m "feat: add role permission management ui"
```

### Task 7: Replace Hard-Coded Access Control In Sidebar And Routes

**Files:**
- Create: `src/routes/ModuleRoute.tsx`
- Modify: `src/components/layout/Sidebar.tsx`
- Modify: `src/components/layout/MainLayout.tsx`
- Modify: `src/routes/AppRoutes.tsx`
- Modify: `src/routes/RoleBasedRoute.tsx`
- Modify: `src/constants/modules.ts`

- [ ] **Step 1: Build the module route guard**

Create `src/routes/ModuleRoute.tsx` with the signature:

```tsx
<ModuleRoute moduleKey="finance">
  <FinancePage />
</ModuleRoute>
```

Behavior:

- unauthenticated -> redirect `/login`
- permission loading -> render loading state, not false-deny
- permission fetch error -> fail closed and render an explanatory unauthorized/error state
- unauthorized -> render the existing not-authorized experience or redirect safely

- [ ] **Step 2: Convert guarded routes to module keys**

Update `AppRoutes.tsx` to wrap module pages with `ModuleRoute`.

Managed routes:

- `/residents`
- `/rooms`
- `/nutrition`
- `/visitors`
- `/daily-monitoring`
- `/procedures`
- `/weight-tracking`
- `/incidents`
- `/maintenance`
- `/forms`
- `/finance`
- `/settings`

Keep `/profile` on `ProtectedRoute` only.

- [ ] **Step 3: Replace sidebar role arrays**

Update `Sidebar.tsx` so it reads visible modules from `modules.ts` and `permissionStore`.

Keep `weight-tracking` in the matrix but out of the sidebar if that remains the current product decision. If you decide to show it later, do that in a separate product change.

- [ ] **Step 4: Unify page titles with the module registry**

Update `MainLayout.tsx` so titles come from the shared module registry where possible.

- [ ] **Step 5: Retire or wrap `RoleBasedRoute`**

Either remove its usage entirely or reduce it to a compatibility wrapper that delegates to `ModuleRoute`. Do not keep two active permission systems.

- [ ] **Step 6: Verify build and typecheck**

Run:

- `cmd /c npx tsc --noEmit`
- `cmd /c npm run build`

Expected: no new type errors in touched files, build PASS

- [ ] **Step 7: Commit**

```bash
git add src/routes/ModuleRoute.tsx src/components/layout/Sidebar.tsx src/components/layout/MainLayout.tsx src/routes/AppRoutes.tsx src/routes/RoleBasedRoute.tsx src/constants/modules.ts
git commit -m "feat: enforce module permissions in navigation and routes"
```

### Task 8: End-To-End Verification And Cleanup

**Files:**
- Modify only if defects are found during verification

- [ ] **Step 1: Run the focused unit tests**

Run: `cmd /c npm run test`
Expected: PASS

- [ ] **Step 2: Run the production build**

Run: `cmd /c npm run build`
Expected: PASS

- [ ] **Step 3: Run the typecheck**

Run: `cmd /c npx tsc --noEmit`
Expected: no new type errors in touched files; if pre-existing repo errors remain, document them explicitly.

- [ ] **Step 4: Execute the manual verification checklist**

Log in as `admin` and verify:

- create a user with an initial password
- attempt to create another user with the same username and confirm duplicate-username feedback is shown
- edit a user
- reset that user's password
- deactivate that user
- confirm inactive login is blocked
- reactivate that user
- confirm login works again
- attempt to deactivate the current admin and confirm the action is blocked
- attempt to change the current admin role and confirm the action is blocked
- open role permissions and confirm `ADMIN -> settings` is locked on
- remove `finance` from `ACCOUNTANT` and confirm sidebar hides it and direct `/finance` access is denied
- restore `finance` for `ACCOUNTANT`
- remove `maintenance` from `DOCTOR` and confirm both sidebar and route update
- simulate or force a permissions-fetch failure in local development and confirm sidebar/routes fail closed
- confirm `profile` stays accessible for any authenticated user
- confirm `weight-tracking` is permission-managed even if hidden from sidebar

- [ ] **Step 5: Clean up only if safe**

If the optional mock-auth files are now misleading and unused:

- `src/features/auth/hooks/useAuth.ts`
- `src/data/mockUsers.ts`
- `src/data/index.ts`

remove or document them in the same commit only if all imports are gone.

- [ ] **Step 6: Commit the verification fixes**

```bash
git add -A
git commit -m "chore: finalize user management and permission rollout"
```

## Subagent Execution Split

Use fresh subagents with disjoint ownership where possible:

- Worker A: Task 1 and Task 2
  - owns permission contracts, migration, bootstrap SQL
- Worker B: Task 3 and Task 4
  - owns stores, service wiring, login/profile integration
- Worker C: Task 5 and Task 6
  - owns settings user CRUD and role-permission UI
- Main agent: Task 7 and Task 8
  - owns route/sidebar integration, conflict resolution, final verification

Do not let two workers edit the same file set at the same time. In particular:

- `SettingsPage.tsx` belongs only to the settings/UI worker
- `authStore.ts` belongs only to the auth/data worker
- `modules.ts`, `Sidebar.tsx`, `AppRoutes.tsx`, `MainLayout.tsx` belong to the main agent unless explicitly reassigned after upstream tasks land

## Verification Notes

- This plan intentionally introduces only a small pure-logic test harness. Do not try to add full React DOM testing unless a later defect proves it necessary.
- Treat `cmd /c npm run build` as the required freshness check before every completion claim.
- Treat `cmd /c npx tsc --noEmit` as a non-regression gate for touched files after the baseline snapshot.
- If the implementation needs live database verification, use a disposable environment or clearly confirm before touching shared infrastructure.
