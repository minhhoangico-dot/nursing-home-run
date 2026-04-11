# FDC Nursing Home Management System

Internal web application for nursing home operations, optimized for tablets and desktop use by nurses, doctors, supervisors, accountants, and administrators.

## Current Modules

- `/dashboard`: role-based "today" dashboard. Nurses see charting/procedure tasks, doctors see clinical and medication alerts, supervisors see incidents and coverage pressure, and accountants see billing/debt exceptions.
- `/residents` and `/residents/:id`: resident list, resident detail, medical records, prescription workspace, and resident finance tab.
- `/medications`: top-level medication workflow with pending prescription alerts, active medication summary, print/export entry points, and resident deep links.
- `/daily-monitoring`: daily vital signs and clinical monitoring.
- `/procedures`: procedure tracking for injections, IV drip, catheter, oxygen, wound dressing, and related care work.
- `/rooms`: room map and occupancy view.
- `/nutrition`: meal and nutrition workflow.
- `/visitors`: visitor log.
- `/incidents`: incident and safety tracking.
- `/maintenance`: facility maintenance requests.
- `/finance`: billing and finance workflow.
- `/forms`: print-friendly forms.
- `/settings`: facility branding and role/module permissions.
- `/profile`: current user profile.

## Tech Stack

- React 19, Vite 6, TypeScript, TailwindCSS.
- Zustand for state management.
- React Router DOM 6.30.3.
- Supabase/PostgreSQL for data.
- Cloudflare Workers deployment via `wrangler.toml`.

## Local Development

```bash
npm install
npm run dev
```

Create `.env` with the active Supabase endpoint and anon key:

```env
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
```

## Verification

Run these checks before handing off changes:

```bash
npm test
npm run build
npx tsc --noEmit
npm audit --omit=dev
```

## Deployment

The current production target is the Cloudflare Worker configured in `wrangler.toml`.

```bash
npm run build
npm run deploy:worker
```

Production app: `https://vdl.fdc-nhanvien.org`  
Backend target: `https://supabase.fdc-nhanvien.org`

## Current Roadmap Notes

- The active permission model uses camel-case app module keys such as `dailyMonitoring`, `weightTracking`, and `medications`.
- Medication billing is calculated from prescription items and medicine prices. Rows with missing price or quantity are visibly provisional.
- The app is still an internal/demo-style tool; auth and RLS hardening remain a separate track.
