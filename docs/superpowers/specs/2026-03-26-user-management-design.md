# User Management And Module Permissions Design

Date: 2026-03-26
Branch: `codex/user-management-20260326`

## Goal

Complete the internal user-management area so administrators can:

- create, read, update, and deactivate internal user accounts
- set an initial password for a new account
- reset a user's password later
- manage module visibility and access for the existing fixed roles
- enforce permissions at both navigation and route-access level

This scope explicitly keeps the current role list fixed:

- `ADMIN`
- `DOCTOR`
- `SUPERVISOR`
- `ACCOUNTANT`
- `NURSE`
- `CAREGIVER`

Permissions are module-level only, not action-level.

## Current State

The repo already has a basic settings screen and a `users` table, but the implementation is incomplete:

- [SettingsPage.tsx](C:\Users\Minh\Desktop\VDL\.worktrees\user-management-20260326\src\features\settings\pages\SettingsPage.tsx) can list users and add one, but edit/delete are placeholders.
- [AddUserModal.tsx](C:\Users\Minh\Desktop\VDL\.worktrees\user-management-20260326\src\features\settings\components\AddUserModal.tsx) only supports create and generates ids client-side.
- [Sidebar.tsx](C:\Users\Minh\Desktop\VDL\.worktrees\user-management-20260326\src\components\layout\Sidebar.tsx) hard-codes role access per menu item.
- [AppRoutes.tsx](C:\Users\Minh\Desktop\VDL\.worktrees\user-management-20260326\src\routes\AppRoutes.tsx) hard-codes role checks separately through [RoleBasedRoute.tsx](C:\Users\Minh\Desktop\VDL\.worktrees\user-management-20260326\src\routes\RoleBasedRoute.tsx).
- [authStore.ts](C:\Users\Minh\Desktop\VDL\.worktrees\user-management-20260326\src\stores\authStore.ts) loads users but has no user mutations.
- [medicalService.ts](C:\Users\Minh\Desktop\VDL\.worktrees\user-management-20260326\src\services\medicalService.ts) only exposes `getAll`, `upsert`, and `bulkUpsert` for users.
- The bootstrap schema for `users` currently has no `is_active` field, and there is no dedicated permission table.

## Recommended Approach

Use a database-backed role-permission matrix with a single source of truth shared by settings, sidebar, and route guards.

Why this approach:

- It matches the requirement that admins can change permissions inside the app.
- It removes duplicated permission logic currently split between route definitions and sidebar config.
- It keeps the fixed roles intact while still making access control configurable.

## Data Model

### Users

Extend the user record with:

- `isActive: boolean`
- `updatedAt?: string`

Database shape:

- add `is_active boolean not null default true` to `public.users`
- continue to use existing fields `id`, `name`, `username`, `password`, `role`, `floor`, `avatar`, `created_at`, `updated_at`

Behavior:

- deactivation replaces hard delete
- inactive users cannot log in
- inactive users remain visible in user management for audit and reactivation

### Role Permissions

Add a new table:

- `role_permissions`

Recommended columns:

- `role text not null`
- `module_key text not null`
- `is_enabled boolean not null default true`
- `updated_at timestamptz not null default now()`
- primary key `(role, module_key)`

This table stores which existing role can access which module.

### Module Registry

Keep the list of modules fixed in code as a registry so labels, icons, route paths, and permission keys stay aligned.

Initial registry:

- `residents`
- `rooms`
- `nutrition`
- `visitors`
- `daily_monitoring`
- `procedures`
- `incidents`
- `maintenance`
- `forms`
- `finance`
- `settings`
- `profile`

`profile` should remain accessible to authenticated users even if not shown as a sidebar module, but keeping it in the registry makes permission handling explicit and future-proof.

## Frontend Architecture

### Auth Store

Expand [authStore.ts](C:\Users\Minh\Desktop\VDL\.worktrees\user-management-20260326\src\stores\authStore.ts) so it becomes the account-management source for:

- `fetchUsers`
- `createUser`
- `updateUser`
- `deactivateUser`
- `resetPassword`
- `reactivateUser`

The store should refresh its `users` list after mutations so settings and login stay in sync.

### Permission Store

Add a dedicated permission store, for example:

- `src/stores/permissionStore.ts`

Responsibilities:

- load the role-permission matrix from the database
- expose helper selectors such as `canAccessModule(role, moduleKey)`
- provide admin mutations to update the matrix for a role

This keeps permission logic out of page components.

### Settings UX

Expand [SettingsPage.tsx](C:\Users\Minh\Desktop\VDL\.worktrees\user-management-20260326\src\features\settings\pages\SettingsPage.tsx) from three views into:

- `menu`
- `users`
- `roles`
- `facility`
- `prices`

#### User Management View

Support:

- list all users
- filter by role and active status if practical
- create user
- edit user profile fields
- deactivate user
- reactivate inactive user
- reset password

Create and edit should use one shared form component instead of a create-only modal.

Suggested user fields in admin form:

- full name
- username
- role
- floor when applicable
- active status
- password field only for create and reset flows

#### Role Permissions View

Render one row per role and one toggle per module.

Expected behavior:

- admin opens a role
- sees all modules in a stable order
- toggles module access on or off
- saves changes to database
- changes apply immediately to sidebar and route guards

## Access Enforcement

### Sidebar

[Sidebar.tsx](C:\Users\Minh\Desktop\VDL\.worktrees\user-management-20260326\src\components\layout\Sidebar.tsx) should stop hard-coding role arrays per menu item.

Instead:

- build the menu from the shared module registry
- filter modules through the permission store for `user.role`

This guarantees the menu matches real access.

### Routes

[RoleBasedRoute.tsx](C:\Users\Minh\Desktop\VDL\.worktrees\user-management-20260326\src\routes\RoleBasedRoute.tsx) should be replaced or refactored into a module-based guard, for example:

- `ModuleRoute`

It should:

- redirect unauthenticated users to `/login`
- deny access when the user role lacks the module permission
- optionally redirect to a safe fallback page such as `/residents` or render a not-authorized state

[AppRoutes.tsx](C:\Users\Minh\Desktop\VDL\.worktrees\user-management-20260326\src\routes\AppRoutes.tsx) should pass a `moduleKey` instead of hard-coded role lists for guarded routes.

## Login Behavior

[LoginPage.tsx](C:\Users\Minh\Desktop\VDL\.worktrees\user-management-20260326\src\features\auth\pages\LoginPage.tsx) should be updated so:

- inactive users cannot log in
- wrong-password and inactive-account errors are distinct
- demo quick-fill shortcuts remain, but they should still respect the real user record

## Service Layer Changes

Extend the user service in [medicalService.ts](C:\Users\Minh\Desktop\VDL\.worktrees\user-management-20260326\src\services\medicalService.ts) and [databaseService.ts](C:\Users\Minh\Desktop\VDL\.worktrees\user-management-20260326\src\services\databaseService.ts) with:

- `create` or `upsert` semantics suitable for admin forms
- `deactivate`
- `reactivate`
- `resetPassword`
- `getRolePermissions`
- `replaceRolePermissions`

Mapping functions must include:

- `is_active <-> isActive`
- `updated_at <-> updatedAt`

## Migration Strategy

Add a new migration that:

1. adds `is_active` to `users`
2. creates `role_permissions`
3. seeds default permissions so the current live behavior is preserved as the starting matrix

The seed must mirror the current production access pattern before refactor, then settings can modify it later.

## Error Handling

Expected UI handling:

- duplicate username -> inline form error or toast
- reset password failure -> toast, no optimistic success
- permission save failure -> keep unsaved UI state visible and show error
- missing permissions data -> fail closed for guarded routes, but show an explanatory state instead of crashing

## Verification

Minimum verification for implementation:

- build passes with `cmd /c npm run build`
- admin can create a user and that user appears in settings
- admin can edit a user
- admin can deactivate a user and that user can no longer log in
- admin can reactivate the user and login works again
- admin can reset a user password and login requires the new password
- changing a role's module permissions updates sidebar visibility
- changing a role's module permissions blocks direct route access

## Non-Goals

This design does not include:

- CRUD for roles themselves
- per-action permissions inside a module
- external auth providers
- password hashing or enterprise auth redesign

Those can be addressed later, but they are outside the current request.
