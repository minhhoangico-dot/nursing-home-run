# Hidden Module Retirement Design

**Date:** 2026-03-26

**Project:** FDC Nursing Home Management System

**Goal:** Retire all currently hidden modules as standalone app features in one combined production deploy, while preserving any necessary behavior by absorbing it into a shared layer so visible modules continue to work.

## Locked Decisions

- Delivery shape: one combined production deploy
- Rollback model: one Cloudflare Worker version rollback
- Retirement target: all hidden standalone modules
- Retired standalone modules:
  - `dashboard`
  - `shift-handover`
  - `schedule`
  - `activities`
  - `diabetes-monitoring`
  - `inventory`
- Requirement: do not materially affect visible modules
- Replacement strategy: shared-layer absorption

## Problem Statement

The repository currently has multiple hidden modules that are no longer meant to exist as standalone app surfaces, but some of them still leak behavior into visible modules. That creates a bad intermediate state:

- the shell still knows about routes that are hidden or partially disconnected
- visible modules still import behavior from modules that are no longer product-level features
- deleting the hidden modules outright would break visible screens

The design therefore cannot be “remove a few routes.” It must separate product surface retirement from behavior preservation.

## Design Summary

This change will do three things in one production release:

1. remove all hidden modules as standalone features from routes and navigation
2. preserve only the necessary behavior they still provide by moving it into neutral shared layers
3. rewire visible modules to depend on those shared layers instead of the retired modules

After the release, no visible module should import from a retired hidden-module folder.

## Scope

### In Scope

- retiring the hidden standalone modules from the live app shell
- extracting necessary behavior from retired modules into shared layers
- rewiring visible modules to use shared replacements
- removing dead imports, dead routes, and dead sidebar entries
- deleting or archiving retired module code after consumers are rewired
- shell cleanup required to eliminate stale references

### Out Of Scope

- broad finance/reporting cleanup unrelated to the retired modules
- resident-detail prescription/nutrition redesign unless required by hidden-module removal
- weight-tracking fixes not required by this retirement
- documentation/deployment-truth cleanup
- unrelated schema/service modernization outside the retirement boundary

## Target Architecture

### Shell State After Release

The app shell must no longer contain any standalone references to the retired modules.

That means:

- [AppRoutes.tsx](C:\Users\Minh\Desktop\VDL\src\routes\AppRoutes.tsx) no longer registers routes for the retired modules
- [Sidebar.tsx](C:\Users\Minh\Desktop\VDL\src\components\layout\Sidebar.tsx) no longer contains retired-module entries, commented or live
- [MainLayout.tsx](C:\Users\Minh\Desktop\VDL\src\components\layout\MainLayout.tsx) no longer carries title logic for retired standalone pages

### Shared Layer Rule

Any still-needed logic from a retired module must move into a neutral shared layer under one of:

- `src/components`
- `src/hooks`
- `src/stores`
- `src/services`
- `src/utils`

The shared layer must be named by purpose, not by the retired module name. For example:

- room operations or floor-status behavior should live with rooms or shared facility logic, not under `shift-handover`
- blood-sugar behavior that still serves daily monitoring should live with monitoring/shared medical logic, not under `diabetes`
- shell-level status helpers should live in shared shell/application logic, not under `inventory`

### Visible Module Preservation Rule

Visible modules are allowed to change only to the extent necessary to remove direct dependence on retired hidden modules.

Their core purpose must remain intact:

- `rooms` keeps room and bed operations
- `daily-monitoring` keeps its blood-sugar and daily metrics workflow if that is core to the page
- `header` keeps shell functions like search, notifications, and user controls
- `resident detail` keeps resident care and medication workflows

Cross-module shortcuts or nonessential conveniences may be removed if preserving them would force continued dependence on a retired hidden module.

## Module Disposition

### 1. Dashboard

Disposition: full retirement

Rationale:
- already disconnected from the running shell
- no required visible-module dependency was identified

Expected result:
- remove route/sidebar/title references
- delete or archive the dashboard module code

### 2. Shift Handover

Disposition: retire standalone module, preserve only room-related behavior if still necessary

Known dependency:
- [RoomMapPage.tsx](C:\Users\Minh\Desktop\VDL\src\features\rooms\pages\RoomMapPage.tsx) currently imports `useShiftHandoverStore`, `ShiftHandoverForm`, and `HandoverHistoryModal`

Design:
- remove the standalone route/page/module
- decide whether room view truly requires handover-related behavior
- if yes, move the minimal needed behavior into room-owned or shared room-operations code
- if no, remove the room-level handover affordances entirely

Important constraint:
- visible room management must still work after retirement

### 3. Schedule

Disposition: full retirement unless a visible dependency is discovered during implementation

Known state:
- currently routed but hidden from primary nav
- no required visible dependency has been confirmed so far

Design:
- remove the standalone route/page/module
- delete store/service use only if no visible module still relies on it

### 4. Activities

Disposition: full retirement unless a visible dependency is discovered during implementation

Known state:
- routed but hidden from primary nav
- preload exists in the app bootstrap, but no visible-module dependency has been confirmed

Design:
- remove route/page/module
- remove preload/store wiring if it is only supporting the retired module

### 5. Diabetes Monitoring

Disposition: retire standalone module, preserve monitoring-needed behavior

Known dependency:
- [DailyMonitoringPage.tsx](C:\Users\Minh\Desktop\VDL\src\features\monitoring\pages\DailyMonitoringPage.tsx),
  [MonitoringGrid.tsx](C:\Users\Minh\Desktop\VDL\src\features\monitoring\components\MonitoringGrid.tsx),
  and [MobileMonitoringView.tsx](C:\Users\Minh\Desktop\VDL\src\features\monitoring\components\MobileMonitoringView.tsx)
  depend on `useDiabetesStore`

Design:
- remove the standalone `diabetes-monitoring` page and sidebar/route identity
- move the still-needed blood-sugar state/operations into shared monitoring/medical state
- keep daily monitoring behavior intact
- do not leave monitoring importing from a retired diabetes module path

### 6. Inventory

Disposition: retire standalone module, preserve shell/resident behavior only if necessary

Known dependencies:
- [Header.tsx](C:\Users\Minh\Desktop\VDL\src\components\layout\Header.tsx) uses `useInventoryStore`
- [ResidentDetailPage.tsx](C:\Users\Minh\Desktop\VDL\src\features\residents\pages\ResidentDetailPage.tsx) passes inventory into resident detail

Design:
- remove the standalone inventory route/page/module
- decide whether header notifications and resident-detail medication behavior truly require inventory-backed logic
- if required, move the minimal behavior into shared stores/services with neutral naming
- otherwise remove those nonessential inventory-dependent affordances

Important constraint:
- do not leave shell notifications or resident-detail behavior broken because the standalone stock module disappeared

## Implementation Strategy Inside The One Deploy

Although this is one production release, implementation should follow a safe internal order:

### Slice 1: Shared Extraction

Move needed behavior out of retired modules into shared layers.

### Slice 2: Visible Rewiring

Update visible modules to consume the shared replacements.

### Slice 3: Hidden Module Retirement

Remove routes, sidebar entries, and standalone module code once no visible consumer depends on them.

### Slice 4: Shell Cleanup

Remove stale titles, dead imports, and dead bootstrap/store wiring.

This order minimizes the chance of deleting a module before its visible consumers are safe.

## Data And Service Constraints

This design should avoid broad schema changes unless a hidden module cannot be retired safely without one.

Permitted:
- small shared-store or shared-service reshaping directly required by retirement
- removal of dead store/service registrations that only served retired modules

Not permitted:
- large unrelated migration sweeps
- broad contract redesign unrelated to the hidden-module retirement objective

## Verification Strategy

Because this is a single combined deploy, verification must be organized around what must still work after retirement.

### Before Deploy

- local production build must pass
- all imports from retired module folders must be removed from visible modules
- shell must no longer expose retired standalone routes

### After Deploy

Check at least:

- core visible navigation still works
- `rooms` still works
- `daily-monitoring` still works
- `resident detail` still works
- header shell behavior still works
- retired modules are gone from the live app

### Rollback Trigger

Rollback immediately if:

- any visible page loses core functionality because a retired module was still providing hidden dependencies
- the shell still references retired modules
- daily monitoring, room operations, or resident detail regresses in a material way

## Risks

### Risk 1: Hidden dependencies were underestimated

Mitigation:
- scan all imports before deleting module folders
- preserve behavior in shared layers first, then delete

### Risk 2: The single deploy has a wider blast radius than the prior serial rollout

Mitigation:
- strictly freeze unrelated cleanup
- verify only against visible-module preservation and hidden-module retirement

### Risk 3: Shared-layer extraction creates weak boundaries

Mitigation:
- name extracted pieces by purpose, not by retired module identity
- avoid “compatibility shims” that silently preserve the old architecture

## Success Criteria

The release is successful when all of the following are true:

- all hidden standalone modules are retired from the live app shell
- necessary behavior survives only through shared layers or visible modules
- no visible module still imports from retired module folders
- visible modules keep their core purpose intact
- one Cloudflare version rollback can return the site to its prior state if needed
