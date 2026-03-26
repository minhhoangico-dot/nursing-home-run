# Linked Module Read-Only Access Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add explicit `full | read_only | none` module access for approved non-finance linked modules while keeping sidebar visibility and default landing behavior restricted to full access only.

**Architecture:** Keep full permissions in the existing database-backed role matrix, then layer a code-owned `MODULE_READONLY_LINKS` policy on top through one pure access resolver. `ModuleRoute` becomes the route-level choke point that admits both `full` and `read_only`, provides a shared access-mode context to pages, and leaves page components responsible for disabling or hiding writes.

**Tech Stack:** React 19, TypeScript, Zustand, React Router, Vitest, Vite.

---

## File Map

### Create

- `src/lib/moduleAccess.ts`
- `src/routes/ModuleAccessContext.tsx`
- `src/components/ui/ModuleReadOnlyBanner.tsx`

### Modify

- `src/constants/modules.ts`
- `src/lib/permissions.test.ts`
- `src/stores/permissionStore.ts`
- `src/routes/ModuleRoute.tsx`
- `src/routes/RoleBasedRoute.tsx`
- `src/features/residents/pages/ResidentListPage.tsx`
- `src/features/residents/pages/ResidentDetailPage.tsx`
- `src/features/residents/components/ResidentBasicInfo.tsx`
- `src/features/residents/components/ResidentDetail.tsx`
- `src/features/residents/components/EditResidentModal.tsx`
- `src/features/residents/components/ResidentNutritionSection.tsx`
- `src/features/medical/components/MedicalHistorySection.tsx`
- `src/features/medical/components/MedicalVisitsSection.tsx`
- `src/features/medical/components/MonitoringPlansSection.tsx`
- `src/features/medical/components/VitalSignsSection.tsx`
- `src/features/prescriptions/components/PrescriptionList.tsx`
- `src/features/prescriptions/components/PrescriptionForm.tsx`
- `src/features/prescriptions/components/MedicineManager.tsx`
- `src/features/rooms/pages/RoomMapPage.tsx`
- `src/features/rooms/components/TransferRoomModal.tsx`
- `src/features/rooms/components/AssignBedModal.tsx`
- `src/features/rooms/components/RoomEditModal.tsx`
- `src/features/monitoring/pages/DailyMonitoringPage.tsx`
- `src/features/monitoring/components/MonitoringGrid.tsx`
- `src/features/monitoring/components/MobileMonitoringView.tsx`
- `src/features/monitoring/components/BloodSugarInput.tsx`
- `src/features/procedures/pages/ProceduresPage.tsx`
- `src/features/procedures/components/ProcedureGrid.tsx`
- `src/features/procedures/components/IVDripModal.tsx`
- `src/features/nutrition/pages/NutritionPage.tsx`
- `src/features/visitors/pages/VisitorsPage.tsx`
- `src/features/visitors/components/CheckInModal.tsx`
- `src/features/incidents/pages/IncidentsPage.tsx`
- `src/features/incidents/components/ReportIncidentModal.tsx`
- `src/features/maintenance/pages/MaintenancePage.tsx`
- `src/features/maintenance/components/CreateRequestModal.tsx`

### Test Surface

- `src/lib/permissions.test.ts`

### Constraints To Respect

- Do not add database schema, bootstrap, or settings-UI work for `read_only`; the source-to-target matrix stays in code.
- `read_only` is derived only from directly `full` source modules and never chains transitively.
- `finance` and `settings` remain strict deny unless the user has full permission.
- Sidebar visibility and default post-login redirect remain based on full access only.
- `/profile` stays authenticated-only and outside this access matrix.
- `weight_tracking` stays permission-managed but is not part of the linked read-only matrix for this plan.
- In `read_only` mode, navigation, search, filters, history views, and print can remain available, but mutation entry points and mutation handlers must be blocked.
- `ResidentDetail` must not expose the finance tab while the page is being accessed through linked `read_only` residents access.
- Keep the two separate bugs from the spec out of this plan:
  - deactivation invalidating an already-open session
  - clearing stale `floor` values when editing a user out of `SUPERVISOR`

## Approved Read-Only Matrix

Use this exact matrix as the initial source of truth in code:

- `rooms -> residents, incidents, maintenance`
- `residents -> rooms, daily_monitoring, procedures, nutrition, visitors, incidents, maintenance`
- `daily_monitoring -> residents, procedures`
- `procedures -> residents, daily_monitoring`
- `nutrition -> residents`
- `visitors -> residents`
- `incidents -> residents, rooms`
- `maintenance -> rooms`

Do not infer additional links from existing route structure.

### Task 1: Add Pure Access Policy And Lock It With Tests

**Files:**
- Create: `src/lib/moduleAccess.ts`
- Modify: `src/constants/modules.ts`
- Modify: `src/lib/permissions.test.ts`
- Test: `src/lib/permissions.test.ts`

- [ ] **Step 1: Capture the current verification baseline**

Run:

```powershell
git rev-parse HEAD
cmd /c npx tsc --noEmit
cmd /c npm run test -- src/lib/permissions.test.ts
```

Expected:
- record the current SHA as `BASE_SHA` for the final review request
- TypeScript either passes or reports only pre-existing issues outside this scope.
- Existing permission tests pass before the new assertions are added.

- [ ] **Step 2: Add failing tests for `full | read_only | none`**

Extend `src/lib/permissions.test.ts` with focused pure assertions like:

```ts
import {
  getModuleAccess,
  getSidebarModuleKeys,
  getDefaultFullModulePath,
  MODULE_READONLY_LINKS,
} from './moduleAccess';

it('returns read_only when a full source module links to the target', () => {
  expect(getModuleAccess(DEFAULT_ROLE_PERMISSIONS, 'CAREGIVER', 'residents')).toBe('read_only');
});

it('never grants read_only for finance or settings', () => {
  expect(getModuleAccess(DEFAULT_ROLE_PERMISSIONS, 'DOCTOR', 'finance')).toBe('none');
  expect(getModuleAccess(DEFAULT_ROLE_PERMISSIONS, 'DOCTOR', 'settings')).toBe('none');
});

it('does not chain read_only transitively', () => {
  expect(getModuleAccess(DEFAULT_ROLE_PERMISSIONS, 'CAREGIVER', 'procedures')).toBe('none');
});

it('keeps sidebar and default landing on full modules only', () => {
  expect(getSidebarModuleKeys(DEFAULT_ROLE_PERMISSIONS, 'CAREGIVER')).not.toContain('residents');
  expect(getDefaultFullModulePath(DEFAULT_ROLE_PERMISSIONS, 'CAREGIVER')).toBe('/nutrition');
});
```

- [ ] **Step 3: Run the focused tests to verify they fail**

Run:

```powershell
cmd /c npm run test -- src/lib/permissions.test.ts
```

Expected: FAIL because `moduleAccess.ts` and the new helpers do not exist yet.

- [ ] **Step 4: Implement the pure access resolver**

Create `src/lib/moduleAccess.ts` with:

```ts
export type ModuleAccessLevel = 'full' | 'read_only' | 'none';

export const MODULE_READONLY_LINKS: Record<ManagedModuleKey, ManagedModuleKey[]> = {
  rooms: ['residents', 'incidents', 'maintenance'],
  residents: ['rooms', 'daily_monitoring', 'procedures', 'nutrition', 'visitors', 'incidents', 'maintenance'],
  daily_monitoring: ['residents', 'procedures'],
  procedures: ['residents', 'daily_monitoring'],
  nutrition: ['residents'],
  visitors: ['residents'],
  incidents: ['residents', 'rooms'],
  maintenance: ['rooms'],
  weight_tracking: [],
  forms: [],
  finance: [],
  settings: [],
};

export const getModuleAccess = (
  permissions: RolePermissionMap,
  role: Role,
  target: ManagedModuleKey
): ModuleAccessLevel => {
  if (permissions[role][target]) {
    return 'full';
  }

  if (target === 'finance' || target === 'settings') {
    return 'none';
  }

  const hasLinkedFullSource = Object.entries(MODULE_READONLY_LINKS).some(([source, targets]) => {
    return permissions[role][source as ManagedModuleKey] && targets.includes(target);
  });

  return hasLinkedFullSource ? 'read_only' : 'none';
};
```

Refactor `src/constants/modules.ts` so:
- registry data stays there
- sidebar and default-landing helpers use full access only
- no helper accidentally treats `read_only` as sidebar-visible or landing-eligible
- keep the existing exported helper names unless a rename is required by the touched callers
- preserve current callers in `LoginPage.tsx` and `Sidebar.tsx` unless a caller-specific refactor is intentionally part of the touched diff

- [ ] **Step 5: Run the pure tests and typecheck**

Run:

```powershell
cmd /c npm run test -- src/lib/permissions.test.ts
cmd /c npx tsc --noEmit
```

Expected:
- `permissions.test.ts` PASS
- no new type errors in touched files

- [ ] **Step 6: Commit**

```bash
git add src/lib/moduleAccess.ts src/constants/modules.ts src/lib/permissions.test.ts
git commit -m "feat: add linked module access policy"
```

### Task 2: Wire Route-Level Access Mode And Shared Read-Only UI

**Files:**
- Create: `src/routes/ModuleAccessContext.tsx`
- Create: `src/components/ui/ModuleReadOnlyBanner.tsx`
- Modify: `src/stores/permissionStore.ts`
- Modify: `src/routes/ModuleRoute.tsx`
- Modify: `src/routes/RoleBasedRoute.tsx`
- Test: `src/lib/permissions.test.ts`

- [ ] **Step 1: Extend the existing permission store surface to expose access levels**

Update `src/stores/permissionStore.ts` so the existing public API stays intact and gains:

```ts
interface PermissionState {
  permissions: RolePermissionMap | null;
  isLoading: boolean;
  error: string | null;
  fetchPermissions: () => Promise<RolePermissionMap>;
  replaceRolePermissions: (role: Role, permissions: RolePermission) => Promise<RolePermissionMap>;
  getModuleAccess: (role: Role, moduleKey: ManagedModuleKey) => ModuleAccessLevel;
  canAccessModule: (role: Role, moduleKey: ManagedModuleKey) => boolean;
  canWriteModule: (role: Role, moduleKey: ManagedModuleKey) => boolean;
}
```

Implementation rule:
- `canAccessModule` returns `true` for `full` or `read_only`
- `canWriteModule` returns `true` only for `full`

- [ ] **Step 2: Create a small route-scoped access context**

Create `src/routes/ModuleAccessContext.tsx`:

```tsx
const ModuleAccessContext = createContext<ModuleAccessLevel>('none');

export const ModuleAccessProvider = ModuleAccessContext.Provider;

export const useModuleAccessMode = () => useContext(ModuleAccessContext);

export const useModuleReadOnly = () => useModuleAccessMode() === 'read_only';
```

Create `src/components/ui/ModuleReadOnlyBanner.tsx` with a neutral banner such as:

```tsx
export const ModuleReadOnlyBanner = ({ label }: { label: string }) => (
  <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
    Bạn đang xem module {label} ở chế độ chỉ xem. Các thao tác tạo, sửa, xóa đã bị khóa.
  </div>
);
```

- [ ] **Step 3: Make `ModuleRoute` admit `read_only` and provide the context**

Refactor `src/routes/ModuleRoute.tsx` so it:
- loads permissions as it does now
- computes `const access = getModuleAccess(user.role, moduleKey)`
- blocks only when `access === 'none'`
- wraps the page in `ModuleAccessProvider value={access}`

Target shape:

```tsx
if (access === 'none') {
  return <PermissionErrorState ... />;
}

return (
  <ModuleAccessProvider value={access}>
    {children ? <>{children}</> : <Outlet />}
  </ModuleAccessProvider>
);
```

Keep the current fail-closed behavior on permission-fetch errors.

- [ ] **Step 4: Keep the compatibility wrapper single-sourced**

Update `src/routes/RoleBasedRoute.tsx` so it either:
- continues delegating directly to `ModuleRoute`, or
- is removed from active use

The important constraint is that there must still be only one live permission system.

- [ ] **Step 5: Re-run the pure tests and compile the route layer**

Run:

```powershell
cmd /c npm run test -- src/lib/permissions.test.ts
cmd /c npx tsc --noEmit
```

Expected:
- pure permission tests still PASS
- no new route/store type errors

- [ ] **Step 6: Commit**

```bash
git add src/stores/permissionStore.ts src/routes/ModuleRoute.tsx src/routes/RoleBasedRoute.tsx src/routes/ModuleAccessContext.tsx src/components/ui/ModuleReadOnlyBanner.tsx
git commit -m "feat: expose readonly module access mode"
```

### Task 3: Apply Read-Only Mode To Simple Linked Modules

**Files:**
- Modify: `src/features/residents/pages/ResidentListPage.tsx`
- Modify: `src/features/nutrition/pages/NutritionPage.tsx`
- Modify: `src/features/visitors/pages/VisitorsPage.tsx`
- Modify: `src/features/visitors/components/CheckInModal.tsx`
- Modify: `src/features/incidents/pages/IncidentsPage.tsx`
- Modify: `src/features/incidents/components/ReportIncidentModal.tsx`
- Modify: `src/features/maintenance/pages/MaintenancePage.tsx`
- Modify: `src/features/maintenance/components/CreateRequestModal.tsx`

- [ ] **Step 1: Derive `readOnly` once per page and show the shared banner**

In each page, add:

```tsx
const readOnly = useModuleReadOnly();

return (
  <div className="space-y-6">
    {readOnly && <ModuleReadOnlyBanner label="..." />}
    ...
  </div>
);
```

Apply it to:
- residents list
- nutrition
- visitors
- incidents
- maintenance

- [ ] **Step 2: Block modal entry and mutation buttons in the simple pages**

Implement the smallest page-level guards:
- `ResidentListPage`: hide or disable `Thêm NCT mới`, suppress `AdmissionWizard`
- `VisitorsPage`: hide or disable `Đăng ký vào` and `Check-out`
- `IncidentsPage`: hide or disable `Báo cáo sự cố`
- `MaintenancePage`: hide or disable `Tạo yêu cầu`
- `NutritionPage`: keep search and print only; no write affordances should appear

Target pattern:

```tsx
const openCheckIn = () => {
  if (readOnly) return;
  setShowModal(true);
};
```

- [ ] **Step 3: Guard the submit handlers even if a modal is triggered indirectly**

Inside each write handler, bail out early:

```tsx
if (readOnly) {
  return;
}
```

Apply this to:
- resident creation
- visitor check-in and check-out
- incident report submit
- maintenance request submit

- [ ] **Step 4: Build and manually smoke-test the simple modules**

Run:

```powershell
cmd /c npx tsc --noEmit
cmd /c npm run build
```

Manual checks:
- a linked read-only user can open `/residents` but cannot start the admission wizard
- visitors search/history still works, but no check-in/out is possible
- incidents list is viewable, but report modal cannot open or submit
- maintenance list is viewable, but request creation cannot open or submit

- [ ] **Step 5: Commit**

```bash
git add src/features/residents/pages/ResidentListPage.tsx src/features/nutrition/pages/NutritionPage.tsx src/features/visitors/pages/VisitorsPage.tsx src/features/visitors/components/CheckInModal.tsx src/features/incidents/pages/IncidentsPage.tsx src/features/incidents/components/ReportIncidentModal.tsx src/features/maintenance/pages/MaintenancePage.tsx src/features/maintenance/components/CreateRequestModal.tsx
git commit -m "feat: add readonly guards for linked operational modules"
```

### Task 4: Make Rooms Fully Viewable But Non-Mutating In Read-Only Mode

**Files:**
- Modify: `src/features/rooms/pages/RoomMapPage.tsx`
- Modify: `src/features/rooms/components/TransferRoomModal.tsx`
- Modify: `src/features/rooms/components/AssignBedModal.tsx`
- Modify: `src/features/rooms/components/RoomEditModal.tsx`

- [ ] **Step 1: Thread `readOnly` through the rooms page and bed modal**

Update `RoomMapPage.tsx` so:
- `const readOnly = useModuleReadOnly()`
- the page shows `ModuleReadOnlyBanner`
- `BedDetailModal` receives `readOnly`

Update the local `BedDetailModalProps` to include:

```ts
readOnly: boolean;
```

- [ ] **Step 2: Preserve navigation to resident detail but block all room mutations**

Keep `view_resident` working, but block:
- transfer
- discharge
- assign
- maintenance start/end shortcuts
- edit-mode entry
- add-room entry

Implementation shape:

```ts
if (readOnly && action !== 'view_resident') {
  return;
}
```

For page chrome:
- hide or disable edit-mode and add-room controls
- leave building/floor switching usable

- [ ] **Step 3: Propagate `readOnly` into write-capable room modals**

For `TransferRoomModal`, `AssignBedModal`, and `RoomEditModal`:
- add a `readOnly?: boolean` prop
- disable submit buttons and form inputs when `readOnly`
- no-op early in submit handlers if `readOnly`

Use a shared pattern:

```tsx
<button disabled={readOnly || isSubmitting}>Lưu</button>
```

- [ ] **Step 4: Compile and manually verify rooms**

Run:

```powershell
cmd /c npx tsc --noEmit
cmd /c npm run build
```

Manual checks:
- a read-only rooms-linked user can inspect beds and open resident detail
- transfer, discharge, assignment, and room edit actions do not execute
- admin/supervisor full-access behavior still works unchanged

- [ ] **Step 5: Commit**

```bash
git add src/features/rooms/pages/RoomMapPage.tsx src/features/rooms/components/TransferRoomModal.tsx src/features/rooms/components/AssignBedModal.tsx src/features/rooms/components/RoomEditModal.tsx
git commit -m "feat: enforce readonly mode in rooms"
```

### Task 5: Disable Auto-Save And Cell Mutations In Monitoring And Procedures

**Files:**
- Modify: `src/features/monitoring/pages/DailyMonitoringPage.tsx`
- Modify: `src/features/monitoring/components/MonitoringGrid.tsx`
- Modify: `src/features/monitoring/components/MobileMonitoringView.tsx`
- Modify: `src/features/monitoring/components/BloodSugarInput.tsx`
- Modify: `src/features/procedures/pages/ProceduresPage.tsx`
- Modify: `src/features/procedures/components/ProcedureGrid.tsx`
- Modify: `src/features/procedures/components/IVDripModal.tsx`

- [ ] **Step 1: Add page-level `readOnly` plumbing and banners**

In both `DailyMonitoringPage.tsx` and `ProceduresPage.tsx`:

```tsx
const readOnly = useModuleReadOnly();
```

Then:
- show `ModuleReadOnlyBanner`
- pass `readOnly` into all child views and modals

- [ ] **Step 2: Disable DOM-level inputs in daily monitoring**

Update `MonitoringGrid.tsx`, `MobileMonitoringView.tsx`, and `BloodSugarInput.tsx` so:
- inputs/selects receive `disabled={readOnly}`
- `onBlur`, `onChange`, and `onSave` handlers return immediately when `readOnly`

Target pattern:

```tsx
<input
  disabled={readOnly}
  onBlur={(event) => {
    if (readOnly) return;
    void handleUpdate(...);
  }}
/>
```

This is required because auto-save currently happens on blur.

- [ ] **Step 3: Disable procedure toggles, counters, and IV-drip edits**

Update `ProcedureGrid.tsx` and `ProceduresPage.tsx` so:
- cell clicks do nothing when `readOnly`
- mobile plus/minus controls do nothing when `readOnly`
- IV-drip modal either does not open in `readOnly`, or opens in a non-editable state with save removed

Use the same defensive handler guard:

```ts
if (readOnly || isLoading) {
  return;
}
```

- [ ] **Step 4: Compile and manually verify both modules**

Run:

```powershell
cmd /c npx tsc --noEmit
cmd /c npm run build
```

Manual checks:
- read-only users can browse months, filters, and resident rows
- monitoring inputs cannot be edited or auto-saved
- blood sugar cells cannot save
- procedure cells cannot toggle
- IV-drip edits cannot be saved

- [ ] **Step 5: Commit**

```bash
git add src/features/monitoring/pages/DailyMonitoringPage.tsx src/features/monitoring/components/MonitoringGrid.tsx src/features/monitoring/components/MobileMonitoringView.tsx src/features/monitoring/components/BloodSugarInput.tsx src/features/procedures/pages/ProceduresPage.tsx src/features/procedures/components/ProcedureGrid.tsx src/features/procedures/components/IVDripModal.tsx
git commit -m "feat: disable readonly writes in monitoring and procedures"
```

### Task 6: Make Resident Detail Safe For Linked Read-Only Access

**Files:**
- Modify: `src/features/residents/pages/ResidentDetailPage.tsx`
- Modify: `src/features/residents/components/ResidentBasicInfo.tsx`
- Modify: `src/features/residents/components/ResidentDetail.tsx`
- Modify: `src/features/residents/components/EditResidentModal.tsx`
- Modify: `src/features/residents/components/ResidentNutritionSection.tsx`
- Modify: `src/features/medical/components/MedicalHistorySection.tsx`
- Modify: `src/features/medical/components/MedicalVisitsSection.tsx`
- Modify: `src/features/medical/components/MonitoringPlansSection.tsx`
- Modify: `src/features/medical/components/VitalSignsSection.tsx`
- Modify: `src/features/prescriptions/components/PrescriptionList.tsx`
- Modify: `src/features/prescriptions/components/PrescriptionForm.tsx`
- Modify: `src/features/prescriptions/components/MedicineManager.tsx`

- [ ] **Step 1: Derive `readOnly` once in the page and thread it through every write-capable child**

In `ResidentDetailPage.tsx`:

```tsx
const readOnly = useModuleReadOnly();
```

Then:
- show `ModuleReadOnlyBanner`
- pass `readOnly` into `ResidentBasicInfo`
- pass `readOnly` into `ResidentDetail`
- bail early in `handleSaveAssessment`, `handleUpdateInfo`, and `handleMedicalUpdate` when `readOnly`

- [ ] **Step 2: Remove write entry points from the page shell**

Update `ResidentBasicInfo.tsx` and `ResidentDetail.tsx` so `readOnly`:
- hides edit buttons
- hides upload/delete document affordances
- hides “Đánh giá mới”
- hides any “thêm”, “sửa”, “xóa”, or “ghi nhận dịch vụ” actions

Additionally, in `ResidentDetail.tsx`:
- remove the `finance` tab from the tab list while `readOnly`
- keep non-finance history and view tabs accessible

- [ ] **Step 3: Propagate `readOnly` into nested medical and prescription components**

For each nested component, add `readOnly?: boolean` and block mutations:
- `MedicalHistorySection`
- `MedicalVisitsSection`
- `MonitoringPlansSection`
- `VitalSignsSection`
- `PrescriptionList`
- `PrescriptionForm`
- `MedicineManager`
- `ResidentNutritionSection`
- `EditResidentModal`

Target pattern:

```tsx
if (readOnly) {
  return null;
}
```

or:

```tsx
if (readOnly) {
  return;
}
```

Use the first form for entire action blocks and the second for submit handlers.

- [ ] **Step 4: Compile and manually verify resident detail**

Run:

```powershell
cmd /c npx tsc --noEmit
cmd /c npm run build
```

Manual checks:
- linked read-only users can open `/residents/:id`
- personal info, medical history, and monitoring history remain viewable
- edit modal, assessment wizard, prescription add/edit, vitals entry, monitoring-plan add, document upload/delete, and nutrition edit are all blocked
- finance tab does not appear in read-only residents access

- [ ] **Step 5: Commit**

```bash
git add src/features/residents/pages/ResidentDetailPage.tsx src/features/residents/components/ResidentBasicInfo.tsx src/features/residents/components/ResidentDetail.tsx src/features/residents/components/EditResidentModal.tsx src/features/residents/components/ResidentNutritionSection.tsx src/features/medical/components/MedicalHistorySection.tsx src/features/medical/components/MedicalVisitsSection.tsx src/features/medical/components/MonitoringPlansSection.tsx src/features/medical/components/VitalSignsSection.tsx src/features/prescriptions/components/PrescriptionList.tsx src/features/prescriptions/components/PrescriptionForm.tsx src/features/prescriptions/components/MedicineManager.tsx
git commit -m "feat: make resident detail readonly-safe"
```

### Task 7: Run Final Verification, Review, And Prepare Deployment Handoff

**Files:**
- Modify: only files touched naturally while fixing final review findings
- Test: `src/lib/permissions.test.ts`

- [ ] **Step 1: Run the full automated verification suite available in this repo**

Run:

```powershell
cmd /c npm run test
cmd /c npx tsc --noEmit
cmd /c npm run build
```

Expected:
- tests PASS
- no new type errors
- production build succeeds

- [ ] **Step 2: Execute the manual linked-module matrix smoke test**

Verify at minimum:

1. `rooms` full + `residents` none grants resident routes in `read_only`
2. resident routes stay hidden from sidebar
3. direct URL reload preserves `read_only`
4. `visitors` full + `residents` none grants residents read-only but not procedures
5. `finance` stays denied without full permission
6. `settings` stays denied without full permission
7. full-access users still land on `/rooms` or `/residents` as before

- [ ] **Step 3: Request code review before deployment**

Collect SHAs:

```powershell
git rev-parse HEAD
```

Use the `BASE_SHA` value recorded in Task 1 together with the current `HEAD` when dispatching the reviewer.

Then dispatch one reviewer subagent with:
- plan path
- spec path
- changed file summary
- explicit focus on permission leaks, route regressions, and write-hole regressions

- [ ] **Step 4: Fix any blocking findings and re-run verification**

After review fixes, re-run:

```powershell
cmd /c npm run test
cmd /c npx tsc --noEmit
cmd /c npm run build
```

Expected: all PASS again before deployment.

- [ ] **Step 5: Commit the final review fixes**

```bash
git add .
git commit -m "chore: finalize linked module readonly access"
```
