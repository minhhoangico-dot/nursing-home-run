# Hidden Module Retirement Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Retire `dashboard`, `shift-handover`, `schedule`, `activities`, `diabetes-monitoring`, and `inventory` as standalone app features in one combined production deploy, while preserving any necessary behavior for visible modules through a shared layer or by removing nonessential dependencies.

**Architecture:** Implement the release in four internal slices but ship them together once: extract shared behavior, rewire visible modules, retire hidden modules, then clean the shell and bootstrap. The deploy boundary is single-shot, so no unrelated cleanup is allowed in the same change set.

**Tech Stack:** React 19, React Router 6, Zustand, TypeScript, Supabase, Vite, Cloudflare Worker, Wrangler

---

## Implementation Map

- `src/stores/bloodSugarStore.ts`: new shared blood-sugar state extracted from the retired diabetes module for use by visible monitoring screens.
- `src/features/monitoring/pages/DailyMonitoringPage.tsx`: monitoring page that must switch from the retired diabetes store to the shared blood-sugar store.
- `src/features/monitoring/components/MonitoringGrid.tsx`: desktop monitoring editor that must switch to the shared blood-sugar store without changing save/update behavior.
- `src/features/monitoring/components/MobileMonitoringView.tsx`: mobile monitoring editor that must switch to the shared blood-sugar store without changing save/update behavior.
- `src/features/rooms/pages/RoomMapPage.tsx`: visible room page that currently imports hidden shift-handover behavior and must stop doing so.
- `src/components/layout/Header.tsx`: visible shell header that currently depends on the inventory store for low-stock notifications.
- `src/features/residents/pages/ResidentDetailPage.tsx`: visible resident page that currently threads inventory data into resident detail.
- `src/features/residents/components/ResidentDetail.tsx`: resident detail wrapper that should stop forwarding inventory props if they are not truly needed.
- `src/features/prescriptions/components/PrescriptionList.tsx`: prescription list that appears to accept inventory props only as leftover coupling and should be simplified.
- `src/hooks/useInitialData.ts`: bootstrap hook that still preloads inventory, schedule, and activities stores even after those modules are retired.
- `src/routes/AppRoutes.tsx`: route registration that still exposes the hidden standalone modules.
- `src/components/layout/Sidebar.tsx`: shell navigation that still contains live or commented references to the retired modules.
- `src/components/layout/MainLayout.tsx`: shell title mapping that still contains standalone page labels for retired modules.
- `src/services/databaseService.ts`: service aggregator that still exposes dead registrations for retired modules.
- `src/services/medicalService.ts`: service file that may still carry dead `handovers`, `schedules`, or `activities` blocks after module retirement.
- `src/services/inventoryService.ts`: inventory service that may become fully unused after visible modules are rewired.

## Test And Verification Strategy

This repo does not currently expose an application test harness in `package.json`, so execution should rely on:

- targeted import/reference scans after each retirement slice
- `cmd /c npm run build` as the required automated regression gate
- focused manual smoke checks for monitoring, rooms, resident detail, and header behavior before deploy

### Task 1: Preflight And Release Workspace

**Files:**
- Review: `docs/superpowers/specs/2026-03-26-hidden-module-retirement-design.md`
- Review: `package.json`
- Review: `wrangler.toml`
- Review: `worker/index.ts`
- Review: `.gitignore`

- [ ] **Step 1: Create an isolated execution workspace that includes the current working-tree snapshot**

Why: the repo is dirty and production deploy files like `wrangler.toml` and `worker/` are not fully committed on the base branch, so execution cannot safely start from a clean historical worktree.

Run: `git status --short --branch`
Expected: confirm the current dirty state before copying/snapshotting it into the execution workspace.

- [ ] **Step 2: Capture the current production rollback baseline**

Use Cloudflare MCP `version_list` for script `vdl`.
Expected: the most recent healthy production version id is recorded before any code changes.

- [ ] **Step 3: Verify the current app still builds before retirement work starts**

Run: `cmd /c npm run build`
Expected: successful Vite production build.

- [ ] **Step 4: Confirm there is no first-party automated test harness to update**

Run: `Get-Content -Raw package.json`
Expected: only `build`, `dev`, `preview`, and deploy/bootstrap scripts are present, so the release uses build plus manual verification instead of adding a new test stack mid-release.

- [ ] **Step 5: Freeze the release boundary**

Allowed in this release:
- shared-layer extraction for hidden-module dependencies
- visible-module rewiring
- hidden-module route/sidebar/store/page retirement
- shell/bootstrap cleanup required by retirement

Not allowed:
- finance cleanup
- weight-tracking fixes
- prescription/nutrition redesign not required by retirement
- deployment-doc cleanup

### Task 2: Extract Shared Blood-Sugar Behavior Out Of Diabetes

**Files:**
- Create: `src/stores/bloodSugarStore.ts`
- Modify: `src/features/monitoring/pages/DailyMonitoringPage.tsx`
- Modify: `src/features/monitoring/components/MonitoringGrid.tsx`
- Modify: `src/features/monitoring/components/MobileMonitoringView.tsx`
- Delete later: `src/stores/diabetesStore.ts`
- Delete later: `src/features/diabetes/**/*`

- [ ] **Step 1: Write the shared blood-sugar store**

Create `src/stores/bloodSugarStore.ts` by moving the `blood_sugar_records` persistence logic out of `useDiabetesStore` without carrying the retired-module name forward.

- [ ] **Step 2: Rewire monitoring pages to the shared store**

Replace imports of `useDiabetesStore` in:
- `src/features/monitoring/pages/DailyMonitoringPage.tsx`
- `src/features/monitoring/components/MonitoringGrid.tsx`
- `src/features/monitoring/components/MobileMonitoringView.tsx`

- [ ] **Step 3: Verify no visible monitoring screen imports from the retired diabetes module path**

Run: `Get-ChildItem -Path src -Recurse -Include *.ts,*.tsx | Select-String -Pattern 'stores/diabetesStore|features/diabetes'`
Expected: only the soon-to-be-retired diabetes files themselves still match.

- [ ] **Step 4: Keep the blood-sugar user experience unchanged on daily monitoring**

Expected preserved behavior:
- monthly fetch still works
- create/update blood sugar records still works
- mobile and desktop monitoring views still save correctly

- [ ] **Step 5: Do not delete the diabetes module yet**

Delete only after all rewiring and global retirement cleanup are complete.

### Task 3: Remove Or Absorb Shift-Handover Dependencies From Rooms

**Files:**
- Modify: `src/features/rooms/pages/RoomMapPage.tsx`
- Create or modify: `src/features/rooms/components/*` only if minimal room-owned replacement is truly necessary
- Delete later: `src/stores/shiftHandoverStore.ts`
- Delete later: `src/features/shift-handover/**/*`
- Modify later: `src/services/databaseService.ts`
- Modify later: `src/services/medicalService.ts`

- [ ] **Step 1: Decide whether room operations truly require handover UI**

Default recommendation for implementation:
- remove room-level handover modals/history/actions unless a clearly necessary room-management behavior depends on them

- [ ] **Step 2: Remove direct room-page imports from the hidden handover module**

In `src/features/rooms/pages/RoomMapPage.tsx`, eliminate:
- `useShiftHandoverStore`
- `ShiftHandoverForm`
- `HandoverHistoryModal`

- [ ] **Step 3: Preserve core room functionality**

Expected preserved behavior:
- bed detail modal
- assign/transfer/discharge
- maintenance entry points
- room editing/configuration

- [ ] **Step 4: Verify room page no longer imports retired handover code**

Run: `Get-ChildItem -Path src -Recurse -Include *.ts,*.tsx | Select-String -Pattern 'stores/shiftHandoverStore|features/shift-handover'`
Expected: only the soon-to-be-retired handover files themselves still match.

### Task 4: Retire Inventory As A Standalone Feature Without Breaking Header Or Resident Detail

**Files:**
- Modify: `src/components/layout/Header.tsx`
- Modify: `src/features/residents/pages/ResidentDetailPage.tsx`
- Modify: `src/features/residents/components/ResidentDetail.tsx`
- Modify: `src/features/prescriptions/components/PrescriptionList.tsx`
- Modify: `src/hooks/useInitialData.ts`
- Delete later: `src/stores/inventoryStore.ts`
- Delete later: `src/features/inventory/**/*`
- Modify later: `src/services/databaseService.ts`
- Modify later: `src/services/inventoryService.ts` only if it becomes fully unused

- [ ] **Step 1: Remove the resident-detail inventory pass-through if it is nonessential**

Current evidence indicates `inventory` is threaded into `PrescriptionList` but not used meaningfully there. Remove the prop chain from:
- `ResidentDetailPage.tsx`
- `ResidentDetail.tsx`
- `PrescriptionList.tsx`

- [ ] **Step 2: Remove inventory-specific shell notifications if they are only a convenience**

In `Header.tsx`, remove `useInventoryStore` dependency and the low-stock notification branch unless a minimal shared replacement is truly needed.

- [ ] **Step 3: Remove inventory bootstrap loading**

Delete `fetchInventoryData()` wiring from `useInitialData.ts` if no visible module still depends on the inventory store.

- [ ] **Step 4: Verify no visible module imports from the retired inventory module path**

Run: `Get-ChildItem -Path src -Recurse -Include *.ts,*.tsx | Select-String -Pattern 'stores/inventoryStore|features/inventory'`
Expected: only the soon-to-be-retired inventory files themselves still match.

### Task 5: Retire Schedule And Activities Cleanly

**Files:**
- Modify: `src/hooks/useInitialData.ts`
- Delete later: `src/stores/scheduleStore.ts`
- Delete later: `src/stores/activitiesStore.ts`
- Delete later: `src/features/schedule/**/*`
- Delete later: `src/features/activities/**/*`
- Modify later: `src/services/databaseService.ts`

- [ ] **Step 1: Remove schedule bootstrap loading**

Delete `useScheduleStore` and `fetchSchedules()` from `useInitialData.ts` unless a visible module is found to need them.

- [ ] **Step 2: Remove activities bootstrap loading**

Delete `useActivitiesStore` and `fetchActivities()` from `useInitialData.ts` unless a visible module is found to need them.

- [ ] **Step 3: Verify there are no visible-module dependencies left**

Run: `Get-ChildItem -Path src -Recurse -Include *.ts,*.tsx | Select-String -Pattern 'stores/scheduleStore|features/schedule|stores/activitiesStore|features/activities'`
Expected: only the soon-to-be-retired module files themselves still match.

### Task 6: Retire Hidden Modules From The Shell

**Files:**
- Modify: `src/routes/AppRoutes.tsx`
- Modify: `src/components/layout/Sidebar.tsx`
- Modify: `src/components/layout/MainLayout.tsx`
- Delete or archive: `src/features/dashboard/**/*`
- Delete or archive: `src/features/shift-handover/**/*`
- Delete or archive: `src/features/schedule/**/*`
- Delete or archive: `src/features/activities/**/*`
- Delete or archive: `src/features/diabetes/**/*`
- Delete or archive: `src/features/inventory/**/*`

- [ ] **Step 1: Remove all standalone hidden-module routes**

Delete route registration and lazy imports for:
- `dashboard`
- `shift-handover`
- `schedule`
- `activities`
- `diabetes-monitoring`
- `inventory`

- [ ] **Step 2: Remove all sidebar references to retired modules**

Delete active and commented entries in `Sidebar.tsx` for those modules.

- [ ] **Step 3: Remove stale title mappings**

Delete any `MainLayout.tsx` title logic that only existed for retired standalone pages.

- [ ] **Step 4: Delete or archive the retired module folders**

Only after slices 2 to 5 confirm no visible imports remain.

### Task 7: Remove Dead Stores, Dead Service Registrations, And Dead Imports

**Files:**
- Modify: `src/services/databaseService.ts`
- Modify: `src/hooks/useInitialData.ts`
- Delete: `src/stores/diabetesStore.ts`
- Delete: `src/stores/shiftHandoverStore.ts`
- Delete: `src/stores/scheduleStore.ts`
- Delete: `src/stores/activitiesStore.ts`
- Delete: `src/stores/inventoryStore.ts`
- Review: `src/services/inventoryService.ts`
- Review: `src/services/medicalService.ts`

- [ ] **Step 1: Remove dead store registrations from the shared aggregator**

Delete `db.inventory`, `db.schedules`, `db.handovers`, and `db.activities` only if no surviving visible/shared consumer remains.

- [ ] **Step 2: Remove dead bootstrap imports**

Ensure `useInitialData.ts` no longer imports retired stores.

- [ ] **Step 3: Remove dead app imports after folder deletion**

Run: `Get-ChildItem -Path src -Recurse -Include *.ts,*.tsx | Select-String -Pattern 'stores/diabetesStore|features/diabetes|stores/shiftHandoverStore|features/shift-handover|stores/scheduleStore|features/schedule|stores/activitiesStore|features/activities|stores/inventoryStore|features/inventory|features/dashboard'`
Expected: no live application file outside intentionally archived code still imports a retired module path or retired standalone store.

- [ ] **Step 4: Verify the visible dependency graph is clean**

Expected:
- no visible module imports retired module folders
- any preserved behavior now comes from shared layers or visible-module code

### Task 8: Build, Deploy Once, And Hold For Verification

**Files:**
- Review: `package.json`
- Review: `wrangler.toml`
- Review: `worker/index.ts`

- [ ] **Step 1: Run final local build verification**

Run: `cmd /c npm run build`
Expected: successful Vite production build.

- [ ] **Step 2: Capture the pre-deploy rollback target**

Use Cloudflare MCP `version_list` for script `vdl`.
Expected: baseline version id is recorded before deploy.

- [ ] **Step 3: Deploy the combined release**

Run: `cmd /c npm run deploy:worker`
Expected: successful Cloudflare deployment.

- [ ] **Step 4: Capture the new deployed version**

Use Cloudflare MCP `version_list` for script `vdl`.
Expected: both the newly deployed version id and rollback target are available before user verification.

- [ ] **Step 5: Pause for user verification**

Live checklist:
- URL: `https://vdl.fdc-nhanvien.org`
- core visible navigation still works
- rooms still works
- daily monitoring still works, including blood sugar entry/update
- resident detail still works
- header still works
- retired modules are gone from the app surface

Rollback trigger:
- any visible module loses core functionality
- shell still links to a retired module
- monitoring, rooms, header, or resident detail materially regresses

- [ ] **Step 6: If rejected, rollback immediately**

Use Cloudflare MCP `version_rollback` for script `vdl` to the pre-deploy version captured in Step 2.
Expected: production returns to the last healthy state before further debugging.
