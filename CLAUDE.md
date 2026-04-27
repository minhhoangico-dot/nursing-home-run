# VDL — FDC Nursing Home Management System

React + Vite SPA chạy trên Cloudflare Worker. Backend Supabase (Postgres). Phục vụ trung tâm chăm sóc người cao tuổi FDC.

## Deploy

- **Production**: `npm run deploy:worker` → Cloudflare Worker `vdl` (custom domain `vdl.fdc-nhanvien.org`)
- **Test**: `npx vitest run`
- **Type check**: `npx tsc --noEmit`

Worker config: [wrangler.toml](wrangler.toml). Build artifacts go to `dist/` then served via `[assets]` binding.

## Module structure

- `src/features/` — feature folders (`residents`, `medical`, `prescriptions`, `finance`, `rooms`, `dashboard`, …)
- `src/services/` — Supabase data layer (mappers + CRUD)
- `src/stores/` — Zustand stores
- `src/types/` — domain types (Resident, Room, Finance, …)
- `public/templates/` — static binary templates served at `/templates/...` (e.g. contract docx)

## Print/export patterns

- **HTML print** (prescriptions, daily sheets): `window.open('','_blank')` + `document.write(html)` + `win.print()`. See [src/features/prescriptions/utils/printTemplates.ts](src/features/prescriptions/utils/printTemplates.ts) for the canonical pattern.
- **DOCX templating** (admission contract, since Phase 1 of admission redesign): docxtemplater + pizzip + file-saver. Source `.docx` placed in `public/templates/`, fetched at runtime, rendered into Blob, saved via file-saver. See [src/features/residents/admission/contract/](src/features/residents/admission/contract/).

## Admission module (current state — Phase 1)

- Wizard 4 bước in [src/features/residents/components/AdmissionWizard.tsx](src/features/residents/components/AdmissionWizard.tsx): NCT info → Guardian → Care level + bed assignment (real, reusing TransferRoomModal logic) → Contract review with `.docx` download.
- Contract template generator: [scripts/build-contract-template.py](scripts/build-contract-template.py) — one-off script that converts `docs/HĐ MẪU 3 PHỤ LỤC 4.2026.docx` into a docxtemplater-ready file at `public/templates/contract_template_v1.docx`. Re-run when the legal text changes.
- 16 placeholders are filled at runtime: `{contract_number}`, `{signed_day/month/year/date_full}`, `{resident_*}`, `{guardian_*}`. Phụ lục 1/2/3 stay blank for handwriting.
- Contract metadata fields on `Resident` type are **optional and not yet persisted** to Supabase — they live only in wizard state until DB migration in Phase 2.
- Roadmap for Phase 2: see [docs/PHASE2_PLAN.md](docs/PHASE2_PLAN.md).

## Conventions

- Vietnamese UI strings throughout. Keep new copy in Vietnamese unless instructed otherwise.
- `Resident.roomType` is a strict union `'1 Giường' | '2 Giường' | '4 Giường'` — when assigning from `Room.type` (which is wider, includes 3/5/7/8/9), narrow or default to `'2 Giường'`.
- Bed status is **derived** from which residents reference a `(building, floor, room, bed)` tuple — there's no persisted `Room` collection. `generateRooms(residents, maintenance, configs)` produces them on the fly.
- Room/floor configs persisted client-side in `useRoomConfigStore` (zustand persist).
- Forms: `react-hook-form` + `zod` resolver (see existing wizards for the shape).
- Toast: `react-hot-toast`. Errors should toast user-friendly Vietnamese messages.
