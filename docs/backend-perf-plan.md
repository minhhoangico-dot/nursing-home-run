# Backend / Data-Layer Performance Pass — Codex Handoff

> **Handoff note (for the human operator, not for Codex):** this plan is a
> Codex-targeted task list covering the backend / data-layer half of a broader
> VDL workflow-and-speed audit. The frontend half (modal focus-trap, Ctrl+K
> command palette, sidebar grouping, AdmissionWizard single-page rewrite,
> smart-default form improvements) is being executed by Opus on a separate
> branch and is **out of scope** for Codex.

---

## Repository context

- **Project:** `fdc-nursing-home-management-system--v1` — React 19 + Vite +
  Zustand + Supabase + Cloudflare Worker (SPA app-shell).
- **Working dir:** `c:\Users\Minh\Desktop\VDL`
- **Branch for this work:** `codex/backend-perf` (already created from `master`)
- **Test runner:** Vitest (`npm run test`). Dev server: `npm run dev`. Build:
  `npm run build` (runs `vite build` then `node scripts/version-app-shell.mjs`).
- **Supabase client:** [src/lib/supabase.ts](../src/lib/supabase.ts). All
  queries today go through either `src/services/*.ts` or direct calls in
  `src/stores/*.ts` — note the **inconsistency**: some stores call Supabase
  directly (`bloodSugarStore`, `monitoringStore`), others go through a
  service layer (`residentService`, `financeService`). Do **not** try to
  unify this inconsistency in this pass — it is out of scope.
- **Pre-existing uncommitted changes:** the branch was cut with several
  uncommitted edits already in the working tree (including
  `src/stores/bloodSugarStore.ts` and `src/stores/monitoringStore.ts`). Treat
  those as the baseline — do not revert them. Commit the plan file and any
  task output as new commits on top.

## Codex ground rules

1. **Do not touch anything under these paths** — they belong to the frontend
   agent working in parallel:
   - `src/components/ui/Modal.tsx`
   - `src/components/layout/` (Sidebar, Header, MainLayout, CommandPalette)
   - `src/features/residents/components/AdmissionWizard.tsx`
   - `src/features/incidents/components/ReportIncidentModal.tsx`
   - `src/features/visitors/components/CheckInModal.tsx`
   - Any new `src/components/layout/CommandPalette.tsx` file
2. **Keep changes surgical.** Do not refactor unrelated code, rename stores,
   restyle files, or "clean up" imports.
3. **Every task has an acceptance check.** Do not mark a task complete until
   the check passes and `npm run test` is green.
4. **When Supabase schema or RPC/view needs to change, write the SQL as a
   migration file under `supabase/migrations/` (create the directory if it
   doesn't exist) in the format `YYYYMMDDHHMM_<slug>.sql`.** Do not attempt
   to apply the migration remotely — leave that to the operator.
5. **TypeScript strict must stay strict.** No `any` widening to paper over
   type errors. Reuse existing types from `src/types/`.
6. **Commit in small, reviewable chunks** — one commit per numbered task.
   Commit messages: `perf(store): <what>` / `perf(db): <what>` /
   `refactor(services): <what>`. No squashing.

---

## Task 1 — Split resident fetch into lean-list vs full-detail

### Why
`residentService.getAll` currently runs `.select('*')` at
[src/services/residentService.ts:62](../src/services/residentService.ts#L62).
The `residents` Supabase table holds several JSONB array columns
(`assessments`, `prescriptions`, `medical_visits`, `special_monitoring`,
`medical_history`, `allergies`, `vital_signs`, `care_logs` — enumerated in
`mapResidentToDb` at [lines 4-34](../src/services/residentService.ts#L4-L34))
that are only consumed by the detail page, never by list views. A
200-resident facility with years of care history will ship tens of MB on
every app boot.

### What
1. Add a new type `ResidentListItem` in `src/types/resident.ts` containing only
   the scalar columns needed for list/card rendering:
   `id, name, dob, gender, room, bed, floor, building, careLevel, status,
    admissionDate, guardianName, guardianPhone, balance, isDiabetic, roomType,
    dietType, currentConditionNote, lastMedicalUpdate, lastUpdatedBy`.
   Do **not** export JSONB array fields in this type. Keep the existing
   `Resident` type untouched for the detail page.
2. In `src/services/residentService.ts`:
   - Replace `getAll` so it selects the explicit lean column list (snake_case)
     from the table and maps to `ResidentListItem[]`. Keep the function name
     and the `.order('name')` clause.
   - Add `getById(id: string): Promise<Resident>` that runs
     `.select('*').eq('id', id).single()` and maps via the existing
     `mapResidentFromDb`.
3. In `src/stores/residentsStore.ts`:
   - Keep `residents: ResidentListItem[]` as the list state (retype the
     array). Existing list consumers (ResidentList, Header search) need only
     these columns — verify by grepping usages.
   - Add `residentDetails: Record<string, Resident>` as a detail cache.
   - Add `fetchResidentDetail(id: string)` that calls `getById`, stores in
     `residentDetails[id]`, and returns it. If already cached, return cached
     immediately and revalidate in the background.
4. In `src/features/residents/pages/ResidentDetailPage.tsx` (minimal UI
   touch — **only** the data-fetch branch, no visual/JSX restructuring):
   - Pull from `residentDetails[id]` instead of `residents.find`.
   - On mount, call `fetchResidentDetail(id)` if not cached.
   - If not cached and not yet loaded, render the existing loading branch.
5. Audit every consumer of `useResidentsStore().residents` with grep:
   `useResidentsStore`, `\.residents\b`. For any consumer that references a
   JSONB field (e.g. `r.prescriptions`, `r.vitalSigns`, `r.careLogs`) —
   that consumer must migrate to `fetchResidentDetail(id)`. Report these
   in the commit message; do not silently drop data access.

### Acceptance
- `npm run test` green.
- DevTools Network tab: first `residents` query on app boot carries the lean
  columns only. Check by inspecting the response JSON (no `prescriptions`,
  `assessments`, `care_logs` keys present).
- Navigate to a ResidentDetailPage — it triggers a single-row `GET` against
  Supabase, and all medical/prescription sections render unchanged.
- Hard-refresh on a deep resident URL → detail loads via `fetchResidentDetail`
  fallback (Task 6 extends this further).

---

## Task 2 — Explicit projections on daily monitoring + blood sugar

### Why
Both stores currently `select('*')` on tables that can grow to thousands of
rows per month. Monitoring has pulse, BP, temperature, weight and several
notes columns; blood sugar already defines its column mapping in
[bloodSugarStore.ts:16-32](../src/stores/bloodSugarStore.ts#L16-L32).
Shipping `*` also risks picking up new columns that callers aren't ready
for.

### What
1. **`src/stores/bloodSugarStore.ts`** — in `fetchRecords`
   ([line 74](../src/stores/bloodSugarStore.ts#L74)) and `fetchAllRecords`
   ([line 96](../src/stores/bloodSugarStore.ts#L96)), replace `.select('*')`
   with the exact column list implied by `mapRecord` at
   [lines 16-32](../src/stores/bloodSugarStore.ts#L16-L32). Use a single
   `BLOOD_SUGAR_COLUMNS` const at module top to avoid duplication.
2. **`src/stores/monitoringStore.ts`** — in `fetchDailyRecords`
   ([line 33](../src/stores/monitoringStore.ts#L33)), `fetchLatestReadings`
   ([line 49](../src/stores/monitoringStore.ts#L49)), and
   `fetchResidentRecords` ([line 76](../src/stores/monitoringStore.ts#L76)),
   replace `.select('*')` with an explicit column list. Inspect
   `src/types/dailyMonitoring.ts` to build the list. Const-hoist as
   `DAILY_MONITORING_COLUMNS`.
3. Do **not** change the response shape exposed to consumers — same types
   come out.

### Acceptance
- `npm run test` green.
- DevTools Network tab: column count on response payloads matches the const
  list; request URL shows the projection (`select=id,resident_id,...`).

---

## Task 3 — Push `DISTINCT ON (resident_id)` to Postgres

### Why
[monitoringStore.ts:45-70](../src/stores/monitoringStore.ts#L45-L70) currently
fetches every row, then runs a client-side `Map` dedupe. With 200 residents
× 30 days that is 6000 rows shipped to get 200. The comments in the code
even acknowledge this is a workaround.

### What
1. Write a migration at `supabase/migrations/<timestamp>_latest_daily_monitoring_view.sql`:
   ```sql
   CREATE OR REPLACE VIEW latest_daily_monitoring AS
   SELECT DISTINCT ON (resident_id) *
   FROM daily_monitoring
   ORDER BY resident_id, record_date DESC;

   -- RLS: inherits from base table if RLS is enabled there. Verify in
   -- review — if daily_monitoring has policies, re-create them on the view
   -- or use a SECURITY INVOKER function instead. Note this for the operator.
   ```
2. In `src/stores/monitoringStore.ts` `fetchLatestReadings`, replace the
   fetch + Map dedupe with `.from('latest_daily_monitoring').select(<lean
   projection from Task 2>)`. Remove the client-side `Map` loop and the
   justification comments at lines 55-57.
3. **Do not apply the migration.** Leave it as a file on the branch. Note in
   the PR description that the operator must review RLS and apply manually.

### Acceptance
- `npm run test` green (store unit test updated to assert the new query
  path — add one if absent: `latest_daily_monitoring` is queried, Map dedupe
  is gone).
- Migration file exists and the SQL parses (dry-run with `psql --set
  ON_ERROR_STOP=on -f <file>` against a disposable DB if available; otherwise
  leave it to the operator).

---

## Task 4 — Month-level SWR cache in monitoring + blood-sugar stores

### Why
Clicking prev/next month on
[DailyMonitoringPage.tsx:43](../src/features/monitoring/pages/DailyMonitoringPage.tsx#L43)
blocks on a full re-fetch every time, even if the user already viewed that
month seconds ago. Same for blood-sugar month navigation.

### What
1. **`src/stores/monitoringStore.ts`**:
   - Change `records: DailyMonitoringRecord[]` to
     `recordsByMonth: Record<string /* 'YYYY-MM' */, DailyMonitoringRecord[]>`.
   - Add a selector-style getter (or keep a derived `records` slice keyed on
     `currentMonth`) so the existing page code only needs a tiny change.
   - In `fetchDailyRecords(date)`: compute the `YYYY-MM` key. If the key is
     already in `recordsByMonth`, set `records` to that cached slice
     synchronously, **then** fire the network request in the background and
     reconcile on success. Set `isLoading: true` only when there is no
     cached data for the requested month.
   - Cap the cache at 3 months (drop the oldest by key) to bound memory.
2. **`src/stores/bloodSugarStore.ts`** — same treatment for `fetchAllRecords`
   at [line 89](../src/stores/bloodSugarStore.ts#L89). Leave
   `fetchRecords(residentId)` untouched since it is resident-scoped, not
   month-scoped.
3. Add unit tests in `src/stores/monitoringStore.test.ts` (already exists,
   as does `src/stores/bloodSugarStore.test.ts`) covering:
   - First fetch populates the cache.
   - Second fetch of the same month returns cached data synchronously, then
     revalidates.
   - Third month evicts the oldest entry.

### Acceptance
- `npm run test` green with new tests.
- Manual: `npm run dev`, navigate prev → next → prev — the second prev is
  visibly instant, no spinner flash.

---

## Task 5 — Split `useInitialData` into critical and deferred paths

### Why
[src/hooks/useInitialData.ts:49-55](../src/hooks/useInitialData.ts#L49-L55)
runs `Promise.all` on `fetchResidents`, `fetchMaintenanceRequests`,
`fetchFinanceData`, `fetchIncidents`, `fetchVisitors`. `fetchFinanceData`
alone fires 6 parallel table queries
([financeService.ts:25-40](../src/services/financeService.ts#L25-L40)).
First meaningful paint waits on the slowest of all five stores.

### What
1. In `useInitialData`, keep **only** residents + auth/settings/permissions in
   the blocking `Promise.all`. The other stores move out.
2. Create a new hook `src/hooks/useDeferredStoreLoad.ts`:
   ```ts
   export function useDeferredStoreLoad(
     fetcher: () => Promise<unknown>,
     alreadyLoaded: boolean
   ) { /* fire once on mount if not already loaded */ }
   ```
   Use it on the pages that actually need the data:
   - Maintenance page → `fetchMaintenanceRequests`
   - Finance page → `fetchFinanceData`
   - Incidents page → `fetchIncidents`
   - Visitors page → `fetchVisitors`
3. For each of those stores, expose an `isLoaded: boolean` flag so the hook
   can no-op on revisits within a session.
4. **Do not touch** the page JSX beyond adding the hook call — no skeletons,
   no loading banners added in this task (the frontend agent will style empty
   states on their side). Just make sure the pages don't crash when data is
   empty on first render (most already handle `[]` correctly — verify with a
   grep for each store's selector usage and add a `?? []` guard only where
   strictly necessary).

### Acceptance
- `npm run test` green.
- Manual: DevTools Network throttled to Slow 3G → navigate to the dashboard.
  The shell and residents list should render before finance/incidents/
  visitors/maintenance requests resolve.
- Revisiting e.g. the Finance page a second time in the same session does
  **not** re-fire `fetchFinanceData`.

---

## Task 6 — Deep-link fallback for ResidentDetailPage

### Why
[ResidentDetailPage.tsx:29](../src/features/residents/pages/ResidentDetailPage.tsx#L29)
does `const resident = residents.find(r => r.id === id)` — pasting a detail
URL shows a blank page for 1-2 seconds until the full list loads. Task 1
already adds `fetchResidentDetail(id)`; this task wires the page to use it as
a deep-link fallback without waiting for the list.

### What
1. In `ResidentDetailPage.tsx` (minimal change — do not restructure JSX):
   - On mount, if `residentDetails[id]` is not cached, call
     `fetchResidentDetail(id)` regardless of whether the list has loaded.
   - Render from `residentDetails[id]` preferentially; fall back to the list
     item only if detail hasn't arrived yet.
2. Keep the existing loading branch behavior — do not invent new skeletons.
   The frontend agent owns visuals.

### Acceptance
- `npm run test` green.
- Manual: open an incognito window, paste a resident detail URL — the page
  fetches that single resident directly and renders without waiting for the
  full list fetch to complete.

---

## Task 7 — Sanity check on fetch-everything stores (report only, do not fix)

Do a one-pass grep + write a short audit note into the PR description: list
every `.select('*')` remaining in `src/services/` and `src/stores/` after
Tasks 1-3. For each, note whether it looks like a list view, detail view, or
single-row fetch. This gives the operator a follow-up TODO list without
blowing up the scope of this PR.

No code changes in this task.

---

## Verification checklist (whole PR)

Before opening the PR:

- [ ] `npm run test` green.
- [ ] `npm run build` green (note: build also runs
      `scripts/version-app-shell.mjs` — do not skip).
- [ ] `npx tsc --noEmit` clean (no type errors).
- [ ] Manual smoke in `npm run dev`:
  - App shell renders before finance / incidents / visitors / maintenance
    have resolved (Task 5).
  - Residents list initial payload is lean (Task 1).
  - Resident detail page works on deep-link paste (Task 6).
  - Month navigation in DailyMonitoring feels instant on repeat (Task 4).
- [ ] No changes in any of the files listed in the "Codex ground rules"
      block above.
- [ ] Migration file present but not applied.
- [ ] PR description lists remaining `.select('*')` hot spots (Task 7).

## PR / handoff

Open the PR against `master` titled:

> `perf(data-layer): lean projections, SWR month cache, deferred initial loads`

Body should link back to `docs/backend-perf-plan.md` (this file) and
include the Task 7 audit note.

## Out of scope (do not touch)

- Optimistic updates in any store (intentionally deferred).
- Zustand selector optimizations (`useStore(s => s.foo)` pattern rollout) —
  the audit flagged this as low priority and the refactor surface is huge.
- Prescription quantity auto-calc — frontend agent's follow-up pass.
- Cloudflare worker changes — `worker/index.ts` caching is already correct.
- Any mock-data or seed-data file.
- Any UI file listed in "Codex ground rules".
