# Project Handoff

## Overview

FDC Nursing Home Management System is an internal React/Vite application for nursing home operations. It supports nurses, doctors, supervisors, accountants, caregivers, and administrators across resident care, medical monitoring, medication workflow, incidents, finance, print forms, and settings.

## Repository

- Local root: `C:\Users\Minh\Desktop\VDL`
- Current deployment target: Cloudflare Workers, configured by `wrangler.toml`
- Production app: `https://vdl.fdc-nhanvien.org`
- Backend target: `https://supabase.fdc-nhanvien.org`

## Stack

- React 19, Vite 6, TypeScript, TailwindCSS
- Zustand stores in `src/stores`
- React Router DOM 6.30.3
- Supabase/PostgreSQL
- Vitest and Testing Library

## Active Routes

- `/login`
- `/dashboard`
- `/residents`
- `/residents/:id`
- `/residents/:residentId/medications/new`
- `/residents/:residentId/medications/:prescriptionId`
- `/residents/:residentId/medications/:prescriptionId/duplicate`
- `/medications`
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
- `/profile`

## Permission Model

The active app-settings module model uses camel-case module keys:

- `settings`
- `finance`
- `residents`
- `rooms`
- `visitors`
- `dailyMonitoring`
- `medications`
- `procedures`
- `nutrition`
- `maintenance`
- `incidents`
- `forms`
- `weightTracking`

Do not reintroduce parallel snake-case app module keys such as `daily_monitoring` or `weight_tracking`. Snake-case names are still valid where they refer to database table names, for example the `daily_monitoring` table.

`PermissionRoute` provides `ModuleAccessProvider`, so components using `useModuleReadOnly` receive the correct read-only state.

## Recent Implementation Notes

- `/dashboard` is the default authenticated landing page and renders role-specific today summaries through `buildTodayDashboard`.
- `/medications` is a first-class medication workflow with active medication rows, pending alerts, print/export actions, and resident links.
- Resident finance medication billing uses `calculateMedicationBillingRows` from `src/features/finance/utils/medicationBilling.ts`.
- Medication billing rows are provisional when medicine price or quantity is missing.
- Quick-add finance service usage records include a traceable description.
- `react-router-dom` is pinned at `6.30.3` to pull the patched router dependency.

## Verification Commands

```bash
npm test
npm run build
npx tsc --noEmit
npm audit --omit=dev
```

## Known Boundaries

- The app remains an internal/demo-style tool.
- Supabase Auth and stricter RLS hardening are intentionally separate from the current UX workflow track.
- Some legacy service/data names still reflect database table naming. Keep UI and permission module keys camel-case while leaving database table names unchanged.
