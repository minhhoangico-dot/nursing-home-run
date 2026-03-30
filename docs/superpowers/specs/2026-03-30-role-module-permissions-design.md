# Role Module Permissions Design

**Date:** 2026-03-30

**Project:** FDC Nursing Home Management System

**Goal:** Let `ADMIN` configure module visibility directly in system settings, enforce those permissions consistently across navigation and routes, keep direct-link access in read-only mode when editing is blocked, and treat finance as a special permission with separate `view` and `edit` controls.

## Locked Decisions

- Permission management location: `Settings > Phan quyen module`
- Permission editor owner: `ADMIN` only
- Default permission model: role-based matrix
- Module behavior when hidden: remove from primary UI surfaces
- Direct-link behavior for hidden or restricted modules: allow safe viewing where the screen can support it, but block editing
- Finance exception: split into `view` and `edit`
- Finance scope for the split permission:
  - main `/finance` page
  - finance-related settings surfaces such as service pricing
  - resident finance tab
- Branding requirement: logo and facility identity settings must be stored as shared app settings, not browser-local only
- Persistence target for shared settings: Supabase-backed global app settings

## Problem Statement

The current app hardcodes permissions in multiple places:

- [Sidebar.tsx](C:\Users\Minh\Desktop\VDL\src\components\layout\Sidebar.tsx) controls visible navigation by role
- [AppRoutes.tsx](C:\Users\Minh\Desktop\VDL\src\routes\AppRoutes.tsx) gates some pages with role lists
- screen-level components such as [ResidentDetail.tsx](C:\Users\Minh\Desktop\VDL\src\features\residents\components\ResidentDetail.tsx) still render tabs and actions without any shared permission contract

That creates three concrete problems:

1. `ADMIN` cannot adjust module access without code changes
2. navigation, routes, and component actions can drift because each layer carries its own role logic
3. facility branding is also currently stored in browser-local persisted state, so logo changes are not guaranteed to propagate across users and devices

This design replaces role hardcoding with a shared permission matrix and moves branding and permission settings into a shared app-settings source.

## Current Codebase Context

- Roles are fixed today in [user.ts](C:\Users\Minh\Desktop\VDL\src\types\user.ts): `ADMIN`, `DOCTOR`, `SUPERVISOR`, `ACCOUNTANT`, `NURSE`, `CAREGIVER`.
- Sidebar entries are hardcoded with `roles` arrays in [Sidebar.tsx](C:\Users\Minh\Desktop\VDL\src\components\layout\Sidebar.tsx).
- Route-level access is hardcoded with role lists in [AppRoutes.tsx](C:\Users\Minh\Desktop\VDL\src\routes\AppRoutes.tsx) and [RoleBasedRoute.tsx](C:\Users\Minh\Desktop\VDL\src\routes\RoleBasedRoute.tsx).
- Settings currently expose only user management, service pricing, and facility info in [SettingsPage.tsx](C:\Users\Minh\Desktop\VDL\src\features\settings\pages\SettingsPage.tsx).
- Facility branding currently reads from browser-local persisted state in [roomConfigStore.ts](C:\Users\Minh\Desktop\VDL\src\stores\roomConfigStore.ts) and helpers in [facilityBranding.ts](C:\Users\Minh\Desktop\VDL\src\utils\facilityBranding.ts).
- Finance behavior is spread across:
  - [FinancePage.tsx](C:\Users\Minh\Desktop\VDL\src\features\finance\pages\FinancePage.tsx)
  - [SettingsPage.tsx](C:\Users\Minh\Desktop\VDL\src\features\settings\pages\SettingsPage.tsx)
  - [ResidentDetail.tsx](C:\Users\Minh\Desktop\VDL\src\features\residents\components\ResidentDetail.tsx)
  - [ResidentFinanceTab.tsx](C:\Users\Minh\Desktop\VDL\src\features\residents\components\ResidentFinanceTab.tsx)

## Design Summary

This change introduces one shared permission source and one shared global settings source.

It will do five things:

1. add a role-by-module permission matrix editable by `ADMIN` inside system settings
2. use that matrix to drive sidebar visibility, route access, tab visibility, and edit controls
3. add a finance-specific permission split with `view` and `edit`
4. convert branding and permission settings from browser-local state to shared Supabase-backed app settings
5. preserve safe read-only access when someone opens a direct link to a restricted module

## Scope

### In Scope

- a new settings surface for module-permission management
- a shared permission model and selector layer
- sidebar filtering by permission
- route enforcement by permission instead of only hardcoded role lists
- resident finance tab visibility and read-only behavior
- finance page read-only behavior
- service-pricing settings gated by finance permission
- shared persistence for permission settings and facility branding
- migration and fallback behavior from existing defaults

### Out Of Scope

- per-user custom permissions beyond roles
- granular edit permissions for every non-finance module in this iteration
- redesign of module information architecture beyond what is needed to expose the permission editor
- unrelated refactors to residents, finance, or login flows
- backend authentication/authorization enforcement beyond the existing client-driven app model

## Permission Model

### Roles

The system continues to use the existing role set from [user.ts](C:\Users\Minh\Desktop\VDL\src\types\user.ts).

No new roles are introduced in this change.

### Module Keys

Define a normalized module registry in shared code. Initial keys should match the visible shell and the current requirements:

- `visitors`
- `dailyMonitoring`
- `procedures`
- `nutrition`
- `residents`
- `rooms`
- `maintenance`
- `incidents`
- `forms`
- `settings`
- `finance`

The registry becomes the single source for:

- menu labels and route association
- permission lookup
- settings-matrix rendering

### Permission Shape

All non-finance modules use a visibility toggle:

```ts
type ModuleVisibilityPermission = {
  visible: boolean;
};
```

Finance uses a split permission:

```ts
type FinancePermission = {
  view: boolean;
  edit: boolean;
};
```

The full role permission object therefore looks like:

```ts
type RoleModulePermissions = {
  visitors: { visible: boolean };
  dailyMonitoring: { visible: boolean };
  procedures: { visible: boolean };
  nutrition: { visible: boolean };
  residents: { visible: boolean };
  rooms: { visible: boolean };
  maintenance: { visible: boolean };
  incidents: { visible: boolean };
  forms: { visible: boolean };
  settings: { visible: boolean };
  finance: { view: boolean; edit: boolean };
};
```

### System Rules That Cannot Be Broken By The UI

The editor must normalize and enforce these rules:

- `ADMIN.settings.visible` is always `true`
- `ADMIN.finance.view` is always `true`
- `ADMIN.finance.edit` is always `true`
- if `finance.view` is `false`, then `finance.edit` must also be `false`
- if `finance.edit` is turned `true`, the system must automatically set `finance.view` to `true`

These rules prevent the permission UI from locking the system out of its own administration path.

## Shared Settings Persistence

### Why Shared Settings Are Required

Current facility branding is stored with browser-local `zustand persist` in [roomConfigStore.ts](C:\Users\Minh\Desktop\VDL\src\stores\roomConfigStore.ts).

That is not acceptable for either:

- module permissions, because `ADMIN` changes must affect all users
- branding, because logo and facility identity must stay consistent across devices

### Persistence Strategy

Use Supabase-backed app settings as the shared source of truth.

Recommended storage shape:

- one global settings service under `src/services`
- one remote app-settings table or equivalent shared settings record
- JSON values keyed by setting purpose

Minimum keys required:

- `facility_branding`
- `role_module_permissions`

This approach keeps the configuration extensible without multiplying small tables for each settings concern.

### Fallback Behavior

If shared settings are absent or fail to load:

- the app falls back to current hardcoded/default behavior
- settings pages surface an error or warning toast for `ADMIN`
- the app must not fail closed into a blank screen

### Migration Rule

The first rollout must remain backward-compatible:

- if no remote permission settings exist yet, existing role behavior remains the default
- if no remote facility branding exists yet, existing default branding remains the default
- after `ADMIN` saves shared settings once, the remote settings become authoritative

## Settings UI Design

### New Settings Tile

Add a new top-level card to [SettingsPage.tsx](C:\Users\Minh\Desktop\VDL\src\features\settings\pages\SettingsPage.tsx):

- title: `Phan quyen module`
- description: manage module visibility by role, with finance read/write controls

This tile appears only for `ADMIN`.

### Editor Layout

The permission editor should be a matrix view, not a role-by-role drilldown flow.

Rows:

- one row per role

Columns:

- one column per standard module with a `visible` toggle
- finance presented as two adjacent controls: `Xem` and `Sua`

This matrix is preferred because it makes differences between roles visible at a glance and avoids slow, error-prone per-role editing.

### Controls

For standard modules:

- one switch or checkbox per cell

For finance:

- `Xem`
- `Sua`

Behavior:

- if `Xem` is turned off, `Sua` turns off and becomes disabled
- if `Sua` is turned on, `Xem` turns on automatically
- mandatory `ADMIN` cells are disabled and visually marked as system-protected

### Actions

The page needs:

- `Luu thay doi`
- `Khoi phuc mac dinh`

Changes should not auto-save per click.

### Feedback

After saving:

- show a success toast
- update the in-memory permission state immediately so the running app reacts without reload

## Runtime Enforcement

Permissions must be applied consistently at four layers.

### 1. Navigation And Entry Points

[Sidebar.tsx](C:\Users\Minh\Desktop\VDL\src\components\layout\Sidebar.tsx) must render only modules allowed by the current role's shared permissions.

[SettingsPage.tsx](C:\Users\Minh\Desktop\VDL\src\features\settings\pages\SettingsPage.tsx) must hide settings sub-surfaces that the active role cannot access, especially finance-related settings if `finance.view` is disabled.

[ResidentDetail.tsx](C:\Users\Minh\Desktop\VDL\src\features\residents\components\ResidentDetail.tsx) must hide the finance tab when `finance.view` is disabled.

### 2. Route-Level Enforcement

Introduce a permission-aware route guard alongside or in place of pure role-list gating.

The route guard must support:

- standard module visibility checks
- finance `view` vs `edit` mode

Behavior for standard modules:

- if the role can access the module, render normally
- if the role cannot edit but the page can be safely shown, render a read-only restricted surface
- if the page cannot sensibly render in read-only mode, show a consistent restricted-access panel

Behavior for finance:

- if `finance.view` is `false`, deny entry to finance surfaces entirely
- if `finance.view` is `true` but `finance.edit` is `false`, allow entry in read-only mode

### 3. Component-Level Edit Locks

Screen components must not rely only on hidden menu entries.

Finance components must accept a read-only signal and disable mutation behavior.

Minimum finance touchpoints:

- [FinancePage.tsx](C:\Users\Minh\Desktop\VDL\src\features\finance\pages\FinancePage.tsx)
- [ResidentFinanceTab.tsx](C:\Users\Minh\Desktop\VDL\src\features\residents\components\ResidentFinanceTab.tsx)
- finance-related settings inside [SettingsPage.tsx](C:\Users\Minh\Desktop\VDL\src\features\settings\pages\SettingsPage.tsx)

Read-only finance mode must:

- preserve viewing of totals, invoices, and financial data
- disable adds, updates, deletes, and service-usage recording
- show a clear visual cue such as `Che do xem`

### 4. Restricted UX

When editing is blocked, the app should not fail with a blank page.

Use a consistent restricted panel message:

- explain that the current role can view but not edit, or does not have access to that module
- keep the message contextual, especially for finance

## Finance-Specific Behavior

Finance is the one exception that needs read/write separation in the first iteration.

### Finance View Surfaces

`finance.view` governs visibility of:

- `/finance`
- finance settings surfaces such as service-price management
- resident finance tab

If `finance.view` is `false`, all of those entry points are hidden.

### Finance Edit Surfaces

`finance.edit` governs all finance mutations, including:

- service-price create or update
- service-price delete
- resident service-usage recording
- other finance write actions already exposed in current finance UI

If `finance.view=true` and `finance.edit=false`, the user can inspect financial information but cannot change it.

## Branding Design

### Shared Branding Source

Branding helpers in [facilityBranding.ts](C:\Users\Minh\Desktop\VDL\src\utils\facilityBranding.ts) should continue to provide merged/fallback output, but their primary source must become shared remote settings instead of browser-local-only state.

### Scope Of Branding Application

Shared branding must drive at least:

- login page logo and name in [LoginPage.tsx](C:\Users\Minh\Desktop\VDL\src\features\auth\pages\LoginPage.tsx)
- sidebar logo and facility name in [Sidebar.tsx](C:\Users\Minh\Desktop\VDL\src\components\layout\Sidebar.tsx)
- facility settings preview and save flow in [FacilityConfig.tsx](C:\Users\Minh\Desktop\VDL\src\features\settings\components\FacilityConfig.tsx)

The outcome must be that an `ADMIN` changes logo once and all users see the updated logo.

## Implementation Strategy

Implementation should be phased in this order:

### Slice 1: Shared Types, Registry, And Selectors

- add module registry
- add permission types
- add selectors/helpers such as:
  - `canSeeModule`
  - `canViewFinance`
  - `canEditFinance`
  - permission normalization helpers

### Slice 2: Shared Settings Data Layer

- add remote settings service for branding and permissions
- load remote settings during app bootstrap or initial-data flow
- keep fallback defaults until remote values are available

### Slice 3: Settings Surfaces

- add `Phan quyen module` tile and editor
- move facility branding save behavior onto shared settings persistence

### Slice 4: Navigation And Route Enforcement

- wire sidebar to permission selectors
- replace or extend role-only route guards with permission-aware guards

### Slice 5: Finance Read-Only Enforcement

- thread finance read-only state into finance page, finance settings, and resident finance tab
- disable all finance mutations in read-only mode

### Slice 6: Remaining UX Polish

- restricted panels
- badges such as `Che do xem`
- save/reset feedback

## Testing Strategy

The repository currently does not have an established main-app test suite in place for these flows, so this work must add focused coverage around the new permission logic rather than relying on existing broad tests.

### Unit Tests

Add tests for:

- permission normalization
- role-to-module selectors
- finance `view` and `edit` interactions
- fallback behavior when shared settings are absent

### Component Or Integration Tests

Add targeted tests for:

- sidebar filtering by permission
- settings matrix rendering and state transitions
- finance read-only mode in resident finance tab
- finance read-only mode in the main finance page

### Manual Verification Checklist

Verify at minimum:

- `ADMIN` can open settings and edit module permissions
- saving permissions updates the app immediately
- another role loses module visibility after permissions change
- direct-link access to a restricted module does not allow editing
- finance read-only users can still view but cannot mutate
- branding updates propagate to login and sidebar across sessions

## Risks

### Risk 1: Navigation and route behavior drift again

Mitigation:

- centralize module metadata and selectors
- do not leave `Sidebar` and route guards on separate permission definitions

### Risk 2: Remote settings load failure creates broken shell behavior

Mitigation:

- keep safe defaults
- fail open to current default behavior rather than rendering nothing
- surface admin-visible errors

### Risk 3: Read-only mode is applied inconsistently

Mitigation:

- define explicit finance read-only props/selectors
- audit all current finance write actions in the touched screens

### Risk 4: Local branding and remote branding conflict during rollout

Mitigation:

- establish remote settings as authoritative once present
- treat browser-local values only as temporary fallback during migration

## Success Criteria

- `ADMIN` can manage module permissions inside system settings without code changes.
- Sidebar visibility, route gating, and screen-level editability all follow the same shared permission source.
- Direct-link access never allows editing when the active role is restricted.
- Finance supports separate `view` and `edit` permissions across all currently exposed finance surfaces.
- Facility branding is stored as shared app settings and updates consistently across users and devices.
- The rollout remains backward-compatible when remote settings have not been created yet.
