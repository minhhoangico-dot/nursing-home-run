# Module Integration Completion Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Connect every shipped module to a single, reachable, data-backed path through routing, navigation, stores/services, and schema.

**Architecture:** Treat the app shell (`AppRoutes`, `Sidebar`, `MainLayout`) and the Supabase-backed store/service layer as the two integration control points. First align exposure and permissions in the shell, then normalize schema/service contracts, then finish per-feature workflows that are currently hidden, stubbed, or placeholder-driven.

**Tech Stack:** React 19, React Router 6, Zustand, Supabase PostgREST, TypeScript, Vite, SQL migrations, Cloudflare Worker

---

### Task 1: Lock the Module Exposure Matrix

**Files:**
- Modify: `src/routes/AppRoutes.tsx`
- Modify: `src/components/layout/Sidebar.tsx`
- Modify: `src/components/layout/MainLayout.tsx`
- Modify: `src/routes/RoleBasedRoute.tsx` (only if guard behavior itself is wrong)

- [ ] Decide the intended exposure for `dashboard`, `shift-handover`, `schedule`, `activities`, `diabetes-monitoring`, `inventory`, `finance`, `settings`, `maintenance`, and `profile`: visible in nav, direct-link only, or retired.
- [ ] Make `Sidebar.tsx` and `AppRoutes.tsx` use the same role matrix so there are no dead-end entries for `settings`, `finance`, or `maintenance`, and no hidden-but-live routes unless that is intentional.
- [ ] Add missing title mappings in `MainLayout.tsx` for the currently active routes that fall back to the generic title.
- [ ] Either re-enable the dashboard end-to-end or remove/archive `src/features/dashboard` so the codebase matches the product surface.
- [ ] Run: `cmd /c npm run build`
- [ ] Smoke-check with at least `ADMIN`, `SUPERVISOR`, `DOCTOR`, and `ACCOUNTANT` accounts to verify every visible menu item reaches an allowed page.

### Task 2: Remove or Consolidate Disconnected Shell Artifacts

**Files:**
- Modify: `src/app/App.tsx`
- Modify: `src/app/providers.tsx`
- Delete or modify: `src/providers/AppProviders.tsx`
- Modify or delete: `src/features/auth/index.ts`
- Modify or delete: `src/features/auth/hooks/useAuth.ts`

- [ ] Collapse the duplicate provider entry points so the app has one canonical provider file.
- [ ] Remove or wire the unused legacy auth hook; do not leave a second auth path exported if Zustand is the source of truth.
- [ ] Verify that all `useToast` imports resolve through the surviving provider module and that no dead exports remain.
- [ ] Run: `cmd /c npm run build`

### Task 3: Normalize Schema and Service Contracts

**Files:**
- Modify: `src/services/databaseService.ts`
- Modify: `src/services/medicalService.ts`
- Modify: `src/services/financeService.ts`
- Modify: `src/stores/shiftHandoverStore.ts`
- Modify: `src/stores/roomsStore.ts`
- Modify: `src/stores/proceduresStore.ts`
- Create: `migrations/<next>_service_usage.sql`
- Create: `migrations/<next>_maintenance_requests_contract.sql`
- Create: `migrations/<next>_procedure_records_contract.sql`
- Create or modify: `migrations/<next>_shift_handover_contract.sql`
- Review: `supabase/migrations/*.sql`

- [ ] Choose one canonical table contract for shift handover: either the legacy `handovers` path or the newer `shift_handovers` plus `shift_handover_notes` path.
- [ ] Add a canonical migration for `service_usage`, or explicitly remove that billing path until the table exists.
- [ ] Reconcile `maintenance_requests` column names between SQL and the service/store mapping.
- [ ] Reconcile `procedure_records` columns so the store only reads/writes fields that the schema actually supports.
- [ ] Update the shared `db` aggregator only after the table contracts are settled.
- [ ] Apply migrations in the target environment and verify reads/writes against real tables, not placeholder assumptions.

### Task 4: Complete Clinical Feature Wiring

**Files:**
- Modify: `src/features/diabetes/pages/DiabetesMonitoringPage.tsx`
- Modify or delete: `src/features/diabetes/components/PrintBloodSugarForm.tsx`
- Modify or delete: `src/features/residents/components/CareLogSection.tsx`
- Modify: `src/features/residents/components/ResidentDetail.tsx`
- Modify: `src/features/weight-tracking/pages/WeightTrackingPage.tsx`
- Modify: `src/stores/weightTrackingStore.ts`
- Modify: `src/features/prescriptions/components/PrescriptionList.tsx`
- Modify: `src/types/resident.ts`
- Modify: `src/services/residentService.ts`
- Modify: `src/features/nutrition/pages/NutritionPage.tsx`
- Create or modify: `src/stores/nutritionStore.ts`

- [ ] Decide whether `PrintBloodSugarForm` is a real deliverable. If yes, wire it into the diabetes page with an explicit print action; if not, delete it.
- [ ] Decide whether care log is part of resident detail. Restore the tab and data path or remove the unused component.
- [ ] Fix weight tracking so a successful save updates local state or triggers a deterministic refetch and always clears loading state.
- [ ] Pick one prescription source of truth. Either keep prescriptions on the resident aggregate and update them, or remove `resident.prescriptions` and rely entirely on `usePrescriptionsStore`.
- [ ] Decide whether nutrition is resident-derived only or a standalone persisted module. If standalone, add a real nutrition store and connect the page to `db.nutrition`.
- [ ] Run: `cmd /c npm run build`
- [ ] Smoke-check resident detail, diabetes, nutrition, and weight tracking with real resident data.

### Task 5: Complete Operations Workflows

**Files:**
- Modify: `src/features/rooms/pages/RoomMapPage.tsx`
- Modify: `src/features/maintenance/pages/MaintenancePage.tsx`
- Modify: `src/stores/roomsStore.ts`
- Modify: `src/services/medicalService.ts`
- Modify: `src/features/incidents/pages/IncidentsPage.tsx`
- Modify: `src/stores/incidentsStore.ts`
- Modify: `src/components/layout/Sidebar.tsx`

- [ ] Replace the room-level “Báo hỏng / Bảo trì” dead end with a real navigation or create-request flow into maintenance.
- [ ] Add a single-request maintenance update action so the “Xử lý” button can move requests through status changes.
- [ ] Wire incident action buttons to the existing update path and add the minimal UI needed for triage/progress/resolution.
- [ ] Expose the operational modules that should be reachable in the main nav: at minimum resolve the discoverability of `shift-handover`, `schedule`, and `activities`.
- [ ] Run: `cmd /c npm run build`
- [ ] Smoke-check room-to-maintenance, incident update, and operational navigation flows.

### Task 6: Finish Finance and Reporting Integrations

**Files:**
- Modify: `src/features/finance/pages/FinancePage.tsx`
- Modify: `src/features/finance/components/MonthlyBillingConfig.tsx`
- Modify: `src/features/settings/pages/SettingsPage.tsx`
- Modify: `src/stores/financeStore.ts`
- Modify: `src/services/financeService.ts`
- Modify: `src/features/residents/components/ResidentFinanceTab.tsx`
- Modify: `src/features/print-forms/components/PrintableForm.tsx`
- Modify: `src/components/layout/Sidebar.tsx`

- [ ] Make billing calculate from persisted/store-backed `servicePrices`, not `INITIAL_PRICES`.
- [ ] Implement real price upsert/delete persistence in `financeService.ts` and surface failures in the store.
- [ ] Replace the resident finance placeholders with real fixed costs, medication costs, and actual deposit/balance data.
- [ ] Decide whether inventory should be a first-class module in navigation. Restore it or retire the route.
- [ ] Replace hardcoded print-form values with live schedule and nutrition data.
- [ ] Run: `cmd /c npm run build`
- [ ] Smoke-check monthly billing, settings price edits, resident finance detail, and printable forms.

### Task 7: Align Documentation and Deployment Truth

**Files:**
- Modify: `README.md`
- Modify: `HANDOFF.md`
- Modify or delete: `netlify.toml`
- Review: `wrangler.toml`
- Review: `worker/index.ts`
- Review: `package.json`

- [ ] Choose the authoritative deployment path: Cloudflare Worker or Netlify.
- [ ] Update docs so repository setup, deploy commands, and production hosting all describe the same system.
- [ ] Remove or clearly mark deprecated deployment config that is no longer used.
- [ ] Re-run the documented deploy/build command locally to confirm the docs are accurate.

### Task 8: Final Verification Pass

**Files:**
- Review: `src/routes/AppRoutes.tsx`
- Review: `src/components/layout/Sidebar.tsx`
- Review: `src/services/**/*.ts`
- Review: `src/stores/**/*.ts`
- Review: `migrations/*.sql`

- [ ] Run: `cmd /c npm run build`
- [ ] Verify that every visible module has all of the following: route, discoverable entry point, role-consistent guard, state/store hookup, and schema-backed persistence where applicable.
- [ ] Verify that every retired module is either deleted or intentionally commented with a clear rationale.
- [ ] Verify that docs name the same deployment/runtime path that the repo actually uses.
