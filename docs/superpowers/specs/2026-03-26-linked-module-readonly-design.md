# Linked Module Read-Only Access Design

## Goal

Allow users without full permission to enter certain non-finance modules in read-only mode when those modules are linked from modules they do have full access to.

This changes module access from a binary model:

- `full`
- `none`

to a three-level model:

- `full`
- `read_only`
- `none`

## Scope

This spec only covers module access behavior.

It does not change:

- the fixed role list
- the database-backed `role_permissions` matrix for full module access
- finance access rules
- settings access rules
- profile access rules

## Product Rules

### Access Levels

- `full`: the role has direct module permission from `role_permissions`
- `read_only`: the role does not have direct permission for the target module, but does have at least one source module with `full` access that is allowed to open the target in read-only mode
- `none`: no access

`read_only` is derived only from directly `full` source modules. It does not chain transitively through other `read_only` modules.

### Route Behavior

- `full` can enter the route normally
- `read_only` can enter the route and stay there after reload or direct URL entry
- `none` is denied

### Sidebar Behavior

- Only `full` modules appear in the sidebar
- `read_only` modules stay hidden from the sidebar
- Users reach `read_only` modules only through links or direct URLs

### Write Behavior

In `read_only` mode:

- create, edit, delete, save, submit, reset, check-in, check-out, report, assign, transfer, and similar write actions must be disabled
- UI should show a clear read-only banner
- handlers must guard against accidental writes even if invoked directly

### Strict Modules

These modules never allow `read_only`:

- `finance`
- `settings`

### Special Module Rules

- `profile` remains authenticated-only and outside the module permission matrix
- `weight_tracking` remains permission-managed but hidden from the sidebar

## Architecture

### Single Access Resolver

Add a single shared resolver in the module-permission layer:

- `getModuleAccess(role, targetModule, permissions) => 'full' | 'read_only' | 'none'`

This becomes the source of truth for:

- route guards
- login/default redirects
- page-level access mode

### Read-Only Link Matrix

Keep the source-to-target read-only matrix in code, not in the database.

Reasoning:

- it is a product policy about linked modules
- it should remain explicit and reviewable
- it changes less frequently than operational role permissions

Suggested structure:

```ts
const MODULE_READONLY_LINKS: Record<ManagedModuleKey, ManagedModuleKey[]> = {
  ...
};
```

### Read-Only Context

Expose route-level access mode through a shared context or hook, for example:

- `useModuleAccessMode()`

This lets pages respond consistently without reimplementing permission logic locally.

## Approved Read-Only Matrix

Initial allowed source -> target relationships:

- `rooms -> residents, incidents, maintenance`
- `residents -> rooms, daily_monitoring, procedures, nutrition, visitors, incidents, maintenance`
- `daily_monitoring -> residents, procedures`
- `procedures -> residents, daily_monitoring`
- `nutrition -> residents`
- `visitors -> residents`
- `incidents -> residents, rooms`
- `maintenance -> rooms`

This approved matrix is the authoritative initial content of `MODULE_READONLY_LINKS`.

Deliberately excluded:

- any path to `finance`
- any path to `settings`

## Implementation Shape

### Shared Permission Layer

Extend `src/constants/modules.ts` and related permission helpers to support:

- the read-only link matrix
- access resolution for `full | read_only | none`
- redirect selection that still prefers `/rooms` then `/residents` among `full` modules

### Route Layer

Update `ModuleRoute` to:

- allow `full`
- allow `read_only`
- deny `none`
- continue failing closed on permission fetch errors

`RoleBasedRoute` must remain only a compatibility wrapper or be removed. There must not be two active permission systems.

### UI Layer

Pages covered by the approved matrix must consume read-only mode and suppress writes.

Initial page set:

- residents
- rooms
- daily monitoring
- procedures
- nutrition
- visitors
- incidents
- maintenance

Each page should:

- show a read-only banner
- hide or disable write controls
- guard write handlers

### Navigation Layer

- Sidebar still shows only `full` modules
- direct URL access to allowed read-only targets remains valid

## Verification

### Automated

Add or extend focused permission tests for:

- access resolution
- strict deny for `finance` and `settings`
- redirect behavior preferring `/rooms` then `/residents`
- read-only targets staying hidden from the sidebar
- non-transitive `read_only` resolution

### Manual

Minimum checks:

1. A user with `full` on `rooms` and no `full` on `residents` can open a resident route in read-only mode.
2. The resident page shows read-only state and blocks writes.
3. Reloading the resident URL keeps read-only mode.
4. A user with `full` on `visitors` and no `full` on `residents` still does not see `residents` in the sidebar.
5. `finance` remains hard denied without full permission.
6. `settings` remains hard denied without full permission.

## Out Of Scope

These existing correctness issues stay outside this spec and should be handled separately:

- invalidating an already-open session after the account is deactivated elsewhere
- clearing stale `floor` values when a user is edited out of `SUPERVISOR`
