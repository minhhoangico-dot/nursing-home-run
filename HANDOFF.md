# 📋 Project Handoff — FDC Nursing Home Management System

> **Purpose**: This document provides everything a new AI assistant (Claude Code) needs to understand and continue development on this project with zero ramp-up ambiguity.

---

## 1. Project Overview

**Name**: FDC Nursing Home Management System (Hệ thống Quản lý Viện Dưỡng Lão)  
**Type**: Internal web application for nursing home staff  
**Primary Users**: Nurses, Doctors, Supervisors (Trưởng tầng), Accountants, Admin  
**Target Device**: Tablet-first (responsive web)  
**Language**: Vietnamese UI, English codebase  

The application manages daily operations of a nursing home (starting with Floor 3), including resident care, medical monitoring, shift handovers, financial records, and staff scheduling.

---

## 2. Repository & Deployment

| Item | Value |
|------|-------|
| Local Project Root | `c:\Users\Minh\Desktop\VDL` |
| GitHub Org/User | `minhhoangico-dot` |
| GitHub Repo | `minhhoangico-dot/nursing-home-run` |
| GitHub URL | https://github.com/minhhoangico-dot/nursing-home-run |
| Active Branch | `main` (auto-deploys to Netlify) |
| Other Branches | `master`, `chore/codebase-cleanup` |
| Deployment | Netlify (auto-deploy on push to `main`) |
| Build Command | `npm run build` |
| Publish Dir | `dist` |
| Dev Server | `npm run dev` → http://localhost:3000 |

### Netlify Config (`netlify.toml`)
- SPA redirect: all routes → `/index.html` with status 200
- `SECRETS_SCAN_OMIT_KEYS` set for Supabase keys (they are public by design — RLS protects data)

---

## 3. Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend Framework | React 19 + Vite 6 |
| Language | TypeScript ~5.8 |
| Styling | TailwindCSS 3.4 |
| State Management | Zustand 5 (with `persist` middleware for auth) |
| Routing | React Router DOM 6 |
| Forms | React Hook Form 7 + Zod 4 |
| Charts | Recharts 3 |
| Icons | Lucide React |
| Toast Notifications | React Hot Toast |
| Backend/Database | Supabase (PostgreSQL) |
| Deployment | Netlify |

### Path Alias
```ts
// vite.config.ts
resolve: { alias: { '@': path.resolve(__dirname, '.') } }
```
So `@/src/...` resolves from project root.

---

## 4. Environment Variables

Create a `.env` file in the project root (already gitignored via `*.local` pattern):

```env
VITE_SUPABASE_URL=https://ttdpsbjeswwltvlxbbhn.supabase.co
VITE_SUPABASE_ANON_KEY=<your-anon-key>
GEMINI_API_KEY=<optional-gemini-key>
```

> ⚠️ **Supabase project is currently INACTIVE** (paused to save costs). Restore it via the Supabase dashboard before development.

### Supabase Project Details
| Item | Value |
|------|-------|
| Project Name | `nursing-home-run` |
| Project ID / Ref | `ttdpsbjeswwltvlxbbhn` |
| Region | `ap-southeast-1` (Singapore) |
| Status | `INACTIVE` (must be restored first) |
| DB Host | `db.ttdpsbjeswwltvlxbbhn.supabase.co` |
| DB Version | PostgreSQL 17.6 |

---

## 5. Project Structure

```
VDL/
├── src/
│   ├── app/                    # App entry, providers wrapper
│   ├── components/             # Shared/reusable UI components
│   │   ├── layout/             # MainLayout, Sidebar, Header
│   │   └── ui/                 # LoadingScreen, ErrorBoundary, etc.
│   ├── constants/              # App-wide constants
│   ├── data/                   # Static/seed data
│   ├── features/               # Feature modules (see Section 6)
│   ├── hooks/                  # Custom React hooks
│   ├── lib/                    # Supabase client init
│   ├── providers/              # Context providers
│   ├── routes/                 # Routing (AppRoutes, guards)
│   ├── services/               # Database service layer
│   ├── stores/                 # Zustand stores (see Section 7)
│   ├── types/                  # TypeScript type definitions
│   └── utils/                  # Utility functions
├── migrations/                 # SQL migration files (12 files)
├── docs/                       # Additional docs
├── scripts/                    # Helper scripts
├── supabase/                   # Supabase config/functions
├── constants/                  # Root-level constants (legacy)
├── index.html                  # HTML entry point
├── index.tsx                   # React entry point
├── vite.config.ts
├── tailwind.config.js
├── tsconfig.json
├── netlify.toml
├── DECISIONS.md                # Historical architecture decisions
└── HUONG_DAN_SU_DUNG.md        # Vietnamese usage guide
```

---

## 6. Feature Modules (`src/features/`)

Each feature is a self-contained directory typically with `pages/`, `components/`, and sometimes its own hooks.

| Module | Route | Allowed Roles | Description |
|--------|-------|---------------|-------------|
| `auth` | `/login` | Public | Login page (simulated — users fetched from DB) |
| `residents` | `/residents`, `/residents/:id` | All | Resident list & detail (demographics, medical history, assessments) |
| `rooms` | `/rooms` | All | Room map / floor plan view |
| `shift-handover` | `/shift-handover` | ADMIN, SUPERVISOR | Structured staff shift handover reports |
| `monitoring` | `/daily-monitoring` | ADMIN, SUPERVISOR, DOCTOR, NURSE | Daily vital signs monitoring |
| `diabetes` | `/diabetes-monitoring` | ADMIN, DOCTOR, SUPERVISOR, NURSE | Blood sugar tracking (4x/day + insulin) with charts |
| `procedures` | `/procedures` | ADMIN, DOCTOR, SUPERVISOR, NURSE | Medical procedures grid (injections, IV drip, catheters, etc.) |
| `weight-tracking` | `/weight-tracking` | ADMIN, DOCTOR, SUPERVISOR, NURSE | Monthly weight + BMI tracking with trends |
| `incidents` | `/incidents` | ADMIN, DOCTOR, SUPERVISOR, NURSE | Incident reporting & tracking |
| `schedule` | `/schedule` | ADMIN, SUPERVISOR | Staff scheduling |
| `finance` | `/finance` | ADMIN, ACCOUNTANT | Billing and financial reports |
| `inventory` | `/inventory` | ADMIN, ACCOUNTANT, SUPERVISOR | Stock / inventory management |
| `activities` | `/activities` | All | Resident activity logging |
| `nutrition` | `/nutrition` | All | Nutrition / meal tracking |
| `visitors` | `/visitors` | All | Visitor log |
| `maintenance` | `/maintenance` | All | Facility maintenance requests |
| `print-forms` | `/forms` | All | Print-friendly PDF forms (procedures, weight, handover) |
| `settings` | `/settings` | ADMIN only | Application settings |
| `profile` | `/profile` | All | User profile |
| `dashboard` | (disabled) | — | Role-based dashboards (currently commented out) |
| `assessments` | (sub-page) | — | Resident health assessments |
| `medical` | (sub-page) | — | Medical records |
| `prescriptions` | (sub-page) | — | Prescription management |

---

## 7. State Management — Zustand Stores (`src/stores/`)

All stores use the Zustand pattern. The `authStore` uses the `persist` middleware (localStorage key: `auth-storage`).

| Store File | Manages |
|------------|---------|
| `authStore.ts` | Current user session, user list fetching |
| `residentsStore.ts` | Resident CRUD |
| `roomsStore.ts` | Room data |
| `roomConfigStore.ts` | Room configuration settings |
| `monitoringStore.ts` | Vital signs, daily monitoring records |
| `diabetesStore.ts` | Blood sugar records (CRUD + filtering by resident) |
| `proceduresStore.ts` | Medical procedure records + IV drip details |
| `weightTrackingStore.ts` | Weight records (monthly, per resident) |
| `shiftHandoverStore.ts` | Shift handover reports |
| `incidentsStore.ts` | Incident reports |
| `prescriptionStore.ts` | Prescriptions & medicines |
| `financeStore.ts` | Financial records |
| `inventoryStore.ts` | Inventory/stock items |
| `scheduleStore.ts` | Staff schedules |
| `activitiesStore.ts` | Activities log |
| `visitorsStore.ts` | Visitor records |
| `uiStore.ts` | UI state (sidebar open/close, etc.) |

---

## 8. Authentication System

> ⚠️ **Important**: Auth is **simulated** — there is no Supabase Auth integration. Users are stored in a `users` table in the database and login works by selecting/fetching a user row.

### User Roles
```ts
type UserRole = 'ADMIN' | 'SUPERVISOR' | 'DOCTOR' | 'NURSE' | 'ACCOUNTANT';
```

### Login Flow
1. `LoginPage` calls `authStore.fetchUsers()` → fetches all rows from the `users` DB table
2. User picks their name from a list (or types username/password)
3. `authStore.login(user)` sets the user in state + localStorage
4. `ProtectedRoute` checks `isAuthenticated`
5. `RoleBasedRoute` checks `user.role` against `allowedRoles[]`

### Known Admin Account
- Username: `hbminh`, Password: `password123` (role: ADMIN)

---

## 9. Database Layer

### Service Architecture
```
src/services/databaseService.ts   ← Aggregates all services as `db`
├── residentService.ts             ← Resident CRUD (Supabase)
├── medicalService.ts              ← Users, incidents, schedules, handovers,
│                                     visitors, maintenance, activities,
│                                     medication, nutrition
├── financeService.ts              ← Finance CRUD
└── inventoryService.ts            ← Inventory CRUD
```

All services import the Supabase client from `src/lib/` and make direct calls to Supabase PostgREST.

Stores call services directly. Example:
```ts
const users = await db.users.getAll();
const residents = await db.residents.getAll();
```

### TypeScript Types (`src/types/`)
All domain types are exported from `src/types/index.ts`. Key types:

| Type | Description |
|------|-------------|
| `User` | Staff user with role |
| `Resident` | Nursing home resident + demographics |
| `ProcedureRecord` | Daily medical procedures (9 types) |
| `IVDripItem` | IV fluid type + quantity (nacl, ringer, aminoplasma, lipofudin, albumin, combilipid) |
| `BloodSugarRecord` | Blood sugar readings (6 time slots) + insulin |
| `WeightRecord` | Monthly weight measurement |
| `ShiftHandover` | Shift handover report + notes |
| `ShiftNote` | Individual note within a handover |
| Various finance, inventory, incident, schedule types | See individual files |

---

## 10. Database Migrations (`migrations/`)

Applied in order. **All migrations have been run on the production Supabase project.**

| File | Description |
|------|-------------|
| `001_initial_schema.sql` | Core tables: residents, rooms, users, incidents, visitors, schedules |
| `002_new_modules.sql` | Extended modules (monitoring, handovers, activities, etc.) |
| `002_pricing_restructure.sql` | Finance/billing pricing restructure |
| `003_seed_demo_data.sql` | Demo data for testing |
| `004_add_height.sql` | Added `height` column to residents |
| `005_fix_procedure_policies.sql` | RLS policy fix for procedures table |
| `006_relax_rls_for_demo.sql` | Relaxed RLS policies (demo mode — all authenticated users can read/write) |
| `007_add_resident_status.sql` | Added `status` column to residents |
| `008_create_daily_monitoring.sql` | Daily monitoring / vital signs table |
| `009_fix_daily_monitoring_rls.sql` | RLS fix for daily_monitoring table |
| `010_prescriptions_redesign.sql` | Prescriptions table redesign |
| `011_medicines_price_and_policies.sql` | Medicines pricing + RLS policies |

> **Note**: RLS is intentionally relaxed for demo (`006_relax_rls_for_demo.sql`). In production, tighten RLS to be role-based.

---

## 11. Routing Architecture (`src/routes/`)

- `AppRoutes.tsx` — All routes defined here with lazy loading via `React.lazy`
- `ProtectedRoute.tsx` — Redirects unauthenticated users to `/login`
- `RoleBasedRoute.tsx` — Redirects unauthorized roles to `/residents`
- Default route `/` redirects to `/residents`
- `*` (catch-all) redirects to `/residents`
- All pages wrapped in `<Suspense>` with `<LoadingScreen>` fallback
- `<ErrorBoundary>` wraps entire route tree (prevents white screen of death)

---

## 12. Known Issues & Technical Debt

1. **TypeScript Errors** — `tsc_errors.log` (16KB) exists at root, indicating type errors. Run `npx tsc --noEmit` to review current state.
2. **Dashboard disabled** — `DashboardPage` import is commented out in `AppRoutes.tsx`. Role-based dashboards are partially implemented but not routed.
3. **Auth is simulated** — No real authentication. Supabase Auth is NOT used. This is intentional for the demo but is a security concern for production.
4. **RLS is relaxed** — `migration 006` relaxes all RLS policies. Must be tightened before any production deployment.
5. **`.env` not committed** — Supabase URL and anon key must be set manually in `.env`.
6. **Supabase project INACTIVE** — Must be manually restored via Supabase dashboard before any DB operations.
7. **Stale `minhhoangico-dot/` folder** — A leftover nested directory at project root from an early mistake; safely ignorable.

---

## 13. Development Workflow

### Setup
```bash
# 1. Install dependencies
npm install

# 2. Create .env file
VITE_SUPABASE_URL=https://ttdpsbjeswwltvlxbbhn.supabase.co
VITE_SUPABASE_ANON_KEY=<anon-key-from-supabase-dashboard>

# 3. Restore Supabase project (if INACTIVE) via dashboard or MCP

# 4. Start dev server
npm run dev
# → http://localhost:3000
```

### Deployment
```bash
# Push to main branch → Netlify auto-deploys
git push origin main
```

### Running Type Check
```bash
npx tsc --noEmit
```

---

## 14. Architecture Decisions (from `DECISIONS.md`)

| Decision | Rationale |
|----------|-----------|
| Feature-based directory structure (`src/features/*`) | Keeps code modular and organized by domain |
| Recharts for visualization | Lightweight, React-native, flexible |
| Simulated auth (no Supabase Auth) | Simplified for demo/internal tool — staff doesn't need email/password auth |
| ErrorBoundary around all routes | Prevents white screen; shows graceful reload option |
| Doctor dashboard shows high glucose alerts | Provides immediate clinical value |
| Zustand with persist for auth | Survives page refresh without re-login |

---

## 15. What's NOT Implemented (Future Work)

- Real authentication (Supabase Auth / JWT)
- Role-based RLS policies for production
- Full role-based dashboards (currently disabled)
- Photo uploads for residents
- Notification system
- Multi-floor support (currently hardcoded to Floor 3)
- PDF generation (print forms currently use `window.print()`)
- Offline support / PWA

---

## 16. Quick Links

- **GitHub**: https://github.com/minhhoangico-dot/nursing-home-run
- **Supabase Dashboard**: https://supabase.com/dashboard/project/ttdpsbjeswwltvlxbbhn
- **Netlify Dashboard**: https://app.netlify.com (linked to `minhhoangico-dot` account)
