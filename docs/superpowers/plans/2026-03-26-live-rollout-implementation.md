# Live Rollout Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Retire `dashboard`, refactor hidden modules one by one, and deploy each small phase directly to production so the user can verify and choose whether to continue or rollback immediately.

**Architecture:** Treat each rollout phase as an isolated production release unit. Every phase must keep the shell, role policy, and core workflow internally consistent before deploy; after deploy, stop for user verification before touching the next phase.

**Tech Stack:** React 19, React Router 6, Zustand, TypeScript, Vite, Supabase, Cloudflare Worker, Wrangler

---

### Task 1: Phase 0 Baseline And Rollback Readiness

**Files:**
- Review: `package.json`
- Review: `wrangler.toml`
- Review: `worker/index.ts`
- Review: `README.md`
- Review: `HANDOFF.md`

- [ ] **Step 1: Confirm the deploy path**

Run: `cmd /c type package.json`
Expected: `deploy:worker` exists and points to the Cloudflare deployment path.

- [ ] **Step 2: Capture the currently deployed Worker version**

Use Cloudflare MCP `version_list` for script `vdl`.
Expected: a current production version id is available as the rollback baseline.

- [ ] **Step 3: Record the production verification template**

Prepare the standard handoff format for every later phase:
- production URL
- roles to test
- pages to click
- expected behavior
- rollback trigger conditions

- [ ] **Step 4: Do not change production behavior in this phase**

Expected: no file edits and no deployment.

### Task 2: Phase 1 Shell Consistency, Dashboard Retirement, And Maintenance Stabilization

**Files:**
- Modify: `src/routes/AppRoutes.tsx`
- Modify: `src/components/layout/Sidebar.tsx`
- Modify: `src/components/layout/MainLayout.tsx`
- Modify: `src/features/rooms/pages/RoomMapPage.tsx`
- Modify: `src/features/maintenance/pages/MaintenancePage.tsx`
- Modify: `src/stores/roomsStore.ts`
- Modify: `src/routes/RoleBasedRoute.tsx` (only if route guard behavior itself is wrong)
- Delete or isolate: `src/features/dashboard/**/*`
- Modify or delete: `src/providers/AppProviders.tsx`
- Modify or delete: `src/features/auth/hooks/useAuth.ts`
- Modify or delete: `src/features/auth/index.ts`

- [ ] **Step 1: Retire the disconnected dashboard**

Remove the live shell references or archive the module so `dashboard` no longer appears as a partial feature.

- [ ] **Step 2: Align visible module roles**

Make sidebar and route guard policy consistent for `settings`, `finance`, and `maintenance`.

- [ ] **Step 3: Add missing titles for currently active visible routes**

Update `MainLayout.tsx` so visible routes do not fall back to generic labels.

- [ ] **Step 4: Stabilize exposed maintenance behavior**

Replace the room-level toast-only maintenance action with a real route or prefilled maintenance flow, and wire the maintenance page `Xử lý` action to an actual state transition.

- [ ] **Step 5: Remove duplicate shell/auth scaffolding**

Consolidate duplicate provider/auth artifacts so there is one canonical shell path.

- [ ] **Step 6: Verify hidden modules stay hidden**

Do not expose `shift-handover`, `schedule`, `activities`, `diabetes-monitoring`, or `inventory` yet.

- [ ] **Step 7: Run local verification**

Run: `cmd /c npm run build`
Expected: successful Vite production build.

- [ ] **Step 8: Deploy Phase 1**

Run: `cmd /c npm run deploy:worker`
Expected: successful Cloudflare deployment for script `vdl`.

- [ ] **Step 9: Capture the new deployed version and keep the previous one ready**

Use Cloudflare MCP `version_list` for script `vdl`.
Expected: both new version id and rollback target are available before user verification.

- [ ] **Step 10: Pause for user verification**

Live checklist:
- URL: `https://vdl.fdc-nhanvien.org`
- Roles: `ADMIN`, `SUPERVISOR`, `DOCTOR`, `ACCOUNTANT`
- Check that visible menu entries reach allowed pages only
- Check that `maintenance` is no longer a dead-end flow
- Confirm `dashboard` is gone
- Confirm hidden modules are still not exposed

Rollback trigger:
- any visible role sees a dead-end page from the sidebar
- maintenance flow still dead-ends
- hidden modules become visible early

### Task 3: Phase 2 Shift Handover Contract Cleanup And Exposure

**Files:**
- Modify: `src/services/databaseService.ts`
- Modify: `src/services/medicalService.ts`
- Modify: `src/stores/shiftHandoverStore.ts`
- Modify: `src/features/shift-handover/pages/ShiftHandoverPage.tsx`
- Modify: `src/features/shift-handover/components/ShiftHandoverForm.tsx`
- Modify: `src/components/layout/Sidebar.tsx`
- Create or modify: `migrations/<next>_shift_handover_contract.sql`
- Review: `supabase/migrations/*.sql`

- [ ] **Step 1: Ask the user to choose the canonical handover backend**

Decision checkpoint:
- keep legacy `handovers`
- or keep `shift_handovers` plus `shift_handover_notes`

- [ ] **Step 2: Remove the split contract**

Make service, store, and schema point to one surviving handover contract.

- [ ] **Step 3: Validate the page against the surviving contract**

Fix load/create/update behavior as needed so the module is internally consistent.

- [ ] **Step 4: Expose `shift-handover` in the sidebar**

Only after the route, role policy, and page flow are stable.

- [ ] **Step 5: Run local verification**

Run: `cmd /c npm run build`
Expected: successful build.

- [ ] **Step 6: Deploy Phase 2**

Run: `cmd /c npm run deploy:worker`
Expected: successful deploy.

- [ ] **Step 7: Pause for user verification**

Live checklist:
- intended roles can see `shift-handover`
- non-allowed roles cannot reach it
- create/view/update handover flow works

Rollback trigger:
- handover page fails to load
- old and new contract paths are both still active
- sidebar exposure is wrong

### Task 4: Phase 3 Schedule Exposure

**Files:**
- Modify: `src/routes/AppRoutes.tsx`
- Modify: `src/components/layout/Sidebar.tsx`
- Modify: `src/features/schedule/pages/SchedulePage.tsx`
- Modify: `src/stores/scheduleStore.ts` (only if behavior issues appear)

- [ ] **Step 1: Confirm intended schedule role policy**

Decision checkpoint if route and sidebar policy do not already clearly match.

- [ ] **Step 2: Expose `schedule` in the sidebar**

Do not change unrelated modules.

- [ ] **Step 3: Verify schedule page behavior**

Confirm the page loads and uses the expected store flow.

- [ ] **Step 4: Run local verification**

Run: `cmd /c npm run build`
Expected: successful build.

- [ ] **Step 5: Deploy Phase 3**

Run: `cmd /c npm run deploy:worker`
Expected: successful deploy.

- [ ] **Step 6: Pause for user verification**

Live checklist:
- intended roles can discover `schedule`
- schedule page loads and basic interactions work
- no shell regressions elsewhere

Rollback trigger:
- schedule is visible to wrong roles
- page is broken or shell nav regresses

### Task 5: Phase 4 Activities Exposure

**Files:**
- Modify: `src/components/layout/Sidebar.tsx`
- Modify: `src/features/activities/pages/ActivitiesPage.tsx`
- Modify: `src/stores/activitiesStore.ts` (only if behavior issues appear)
- Review: `src/hooks/useInitialData.ts`

- [ ] **Step 1: Expose `activities` in the sidebar**

Keep the change isolated to this module.

- [ ] **Step 2: Verify page and preload behavior**

Confirm the module works with its current store/preload path.

- [ ] **Step 3: Run local verification**

Run: `cmd /c npm run build`
Expected: successful build.

- [ ] **Step 4: Deploy Phase 4**

Run: `cmd /c npm run deploy:worker`
Expected: successful deploy.

- [ ] **Step 5: Pause for user verification**

Live checklist:
- intended roles can see `activities`
- page loads and add/create flow works if available

Rollback trigger:
- activities is visible but broken
- shell or resident flows regress

### Task 6: Phase 5 Diabetes Page Completion And Exposure

**Files:**
- Modify: `src/features/diabetes/pages/DiabetesMonitoringPage.tsx`
- Modify or delete: `src/features/diabetes/components/PrintBloodSugarForm.tsx`
- Modify: `src/components/layout/Sidebar.tsx`
- Review: `src/features/monitoring/pages/DailyMonitoringPage.tsx`
- Review: `src/features/monitoring/components/MonitoringGrid.tsx`
- Review: `src/features/monitoring/components/MobileMonitoringView.tsx`

- [ ] **Step 1: Ask the user whether `PrintBloodSugarForm` stays or is retired**

Decision checkpoint before implementation.

- [ ] **Step 2: Complete standalone diabetes page wiring**

Ensure the standalone route is internally complete.

- [ ] **Step 3: Confirm shared diabetes logic still supports existing monitoring pages**

Do not break visible monitoring flows.

- [ ] **Step 4: Expose `diabetes-monitoring` in the sidebar**

Only after standalone behavior is stable.

- [ ] **Step 5: Run local verification**

Run: `cmd /c npm run build`
Expected: successful build.

- [ ] **Step 6: Deploy Phase 5**

Run: `cmd /c npm run deploy:worker`
Expected: successful deploy.

- [ ] **Step 7: Pause for user verification**

Live checklist:
- intended roles can see the diabetes module
- diabetes page works
- daily monitoring still works

Rollback trigger:
- diabetes route works but monitoring regresses
- print behavior is broken or misleading

### Task 7: Phase 6 Inventory Exposure

**Files:**
- Modify: `src/routes/AppRoutes.tsx`
- Modify: `src/components/layout/Sidebar.tsx`
- Modify: `src/features/inventory/pages/StockPage.tsx`
- Review: `src/components/layout/Header.tsx`
- Review: `src/features/residents/pages/ResidentDetailPage.tsx`

- [ ] **Step 1: Confirm intended inventory role policy**

Decision checkpoint if route/sidebar policy still conflicts.

- [ ] **Step 2: Expose `inventory` in the sidebar**

Keep current hidden-module rule for all other modules.

- [ ] **Step 3: Verify existing inventory-dependent visible consumers**

Check header and resident detail behavior, not just the stock page.

- [ ] **Step 4: Run local verification**

Run: `cmd /c npm run build`
Expected: successful build.

- [ ] **Step 5: Deploy Phase 6**

Run: `cmd /c npm run deploy:worker`
Expected: successful deploy.

- [ ] **Step 6: Pause for user verification**

Live checklist:
- intended roles can see `inventory`
- stock page works
- header and resident detail still behave correctly

Rollback trigger:
- inventory exposure breaks existing visible inventory consumers

### Task 8: Phase 7 Clinical Integrity Cleanup

**Files:**
- Modify: `src/features/weight-tracking/pages/WeightTrackingPage.tsx`
- Modify: `src/stores/weightTrackingStore.ts`
- Modify: `src/features/prescriptions/components/PrescriptionList.tsx`
- Modify: `src/types/resident.ts`
- Modify: `src/services/residentService.ts`
- Modify or delete: `src/features/residents/components/CareLogSection.tsx`
- Modify: `src/features/residents/components/ResidentDetail.tsx`
- Modify: `src/features/nutrition/pages/NutritionPage.tsx`
- Create or modify: `src/stores/nutritionStore.ts`
- Modify: `src/services/databaseService.ts`

- [ ] **Step 1: Ask the user whether care log should be restored or retired**

Decision checkpoint before touching resident detail.

- [ ] **Step 2: Ask the user to choose the prescription source of truth**

Decision checkpoint:
- resident aggregate
- or prescription store only

- [ ] **Step 3: Ask the user whether nutrition remains resident-derived or becomes persisted**

Decision checkpoint before creating a nutrition store.

- [ ] **Step 4: Fix weight tracking save-refresh behavior**

Make successful saves update state deterministically and clear loading state.

- [ ] **Step 5: Apply the resident-detail data ownership decisions**

Implement the chosen care-log, prescription, and nutrition path.

- [ ] **Step 6: Run local verification**

Run: `cmd /c npm run build`
Expected: successful build.

- [ ] **Step 7: Deploy Phase 7**

Run: `cmd /c npm run deploy:worker`
Expected: successful deploy.

- [ ] **Step 8: Pause for user verification**

Live checklist:
- resident detail still works
- weight tracking saves and refreshes correctly
- prescription/nutrition behavior matches the chosen model

Rollback trigger:
- resident detail tabs regress
- saved data appears stale or contradictory

### Task 9: Phase 8 Finance And Reporting Cleanup

**Files:**
- Modify: `src/routes/AppRoutes.tsx`
- Modify: `src/components/layout/Sidebar.tsx`
- Modify: `src/features/finance/pages/FinancePage.tsx`
- Modify: `src/features/finance/components/MonthlyBillingConfig.tsx`
- Modify: `src/features/settings/pages/SettingsPage.tsx`
- Modify: `src/stores/financeStore.ts`
- Modify: `src/services/financeService.ts`
- Modify: `src/features/residents/components/ResidentFinanceTab.tsx`
- Modify: `src/features/print-forms/components/PrintableForm.tsx`
- Create: `migrations/<next>_service_usage.sql` (if still missing)

- [ ] **Step 1: Confirm intended finance role policy**

Decision checkpoint if route and sidebar policy still conflict.

- [ ] **Step 2: Replace static pricing logic with persisted/store-backed service prices**

Remove reliance on `INITIAL_PRICES` for live billing behavior.

- [ ] **Step 3: Implement real service price persistence**

Replace stubbed `console.warn` price mutations with actual persistence and store updates.

- [ ] **Step 4: Replace resident finance placeholders**

Use real fixed costs, medication costs, and actual deposit/balance sources.

- [ ] **Step 5: Connect print forms to live schedule and nutrition data**

Remove hardcoded placeholder output.

- [ ] **Step 6: Run local verification**

Run: `cmd /c npm run build`
Expected: successful build.

- [ ] **Step 7: Deploy Phase 8**

Run: `cmd /c npm run deploy:worker`
Expected: successful deploy.

- [ ] **Step 8: Pause for user verification**

Live checklist:
- finance role visibility is correct
- billing reflects saved service prices
- resident finance detail uses real values
- print forms use live data paths

Rollback trigger:
- financial data becomes obviously placeholder or inconsistent
- role access is wrong

### Task 10: Phase 9 Documentation And Deployment Truth

**Files:**
- Modify: `README.md`
- Modify: `HANDOFF.md`
- Modify or delete: `netlify.toml`
- Review: `wrangler.toml`
- Review: `package.json`

- [ ] **Step 1: Confirm Cloudflare remains the authoritative production path**

Decision checkpoint only if deployment reality changed during earlier phases.

- [ ] **Step 2: Update repository docs to match the live deployment path**

Make setup, deploy, and production hosting tell one consistent story.

- [ ] **Step 3: Remove or deprecate conflicting Netlify guidance**

Do not leave two active deployment stories in the repo.

- [ ] **Step 4: Run local verification**

Run: `cmd /c npm run build`
Expected: successful build.

- [ ] **Step 5: Deploy Phase 9 if runtime-facing files changed**

Run: `cmd /c npm run deploy:worker`
Expected: successful deploy or no deploy if docs-only changes do not affect production.

- [ ] **Step 6: Pause for user verification**

Live checklist:
- production still serves correctly
- docs match the actual deployed platform

Rollback trigger:
- deploy config changes affect production routing unexpectedly

### Task 11: Final Verification And Closeout

**Files:**
- Review: `src/routes/AppRoutes.tsx`
- Review: `src/components/layout/Sidebar.tsx`
- Review: `src/services/**/*.ts`
- Review: `src/stores/**/*.ts`
- Review: `migrations/*.sql`
- Review: `docs/superpowers/specs/2026-03-26-live-rollout-design.md`

- [ ] **Step 1: Run final local build verification**

Run: `cmd /c npm run build`
Expected: successful build.

- [ ] **Step 2: Verify the final visible module set**

Expected live set:
- `dashboard` retired
- `shift-handover`, `schedule`, `activities`, `diabetes-monitoring`, and `inventory` exposed only if their phases were approved

- [ ] **Step 3: Verify rollback history is clean**

Expected: each rejected phase was rolled back before further work; no unresolved production regression remains.

- [ ] **Step 4: Summarize remaining deferred decisions**

Expected: no unresolved decision remains hidden inside the codebase.
