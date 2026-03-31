# Medicine Catalog From HIS Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a system-settings medicine catalog seeded once from HIS, switch prescribing to the internal catalog, and replace prescription printing with the approved A4 layout.

**Architecture:** Keep Supabase `medicines` as the internal source of truth and preserve backward compatibility by continuing to use `medicine.name` as the canonical display string. Add a one-time bastion-side import script that reads HIS `tb_service`, normalizes and deduplicates it, and upserts catalog rows into Supabase. Refactor the medicine catalog UI into a reusable manager component that is mounted from settings and consumed by the prescription workflow.

**Tech Stack:** React 19, TypeScript, Zustand, Supabase, Node.js, Vitest, React Testing Library, jsdom

---

## File Structure

### Create

- `C:/Users/Minh/Desktop/VDL/vitest.config.ts`
- `C:/Users/Minh/Desktop/VDL/src/test/setup.ts`
- `C:/Users/Minh/Desktop/VDL/src/features/prescriptions/utils/medicineCatalog.ts`
- `C:/Users/Minh/Desktop/VDL/src/features/prescriptions/utils/medicineCatalog.test.ts`
- `C:/Users/Minh/Desktop/VDL/src/features/prescriptions/utils/medicineMappers.ts`
- `C:/Users/Minh/Desktop/VDL/src/features/prescriptions/utils/medicineMappers.test.ts`
- `C:/Users/Minh/Desktop/VDL/src/features/prescriptions/utils/buildPrescriptionPrintHtml.ts`
- `C:/Users/Minh/Desktop/VDL/src/features/prescriptions/utils/buildPrescriptionPrintHtml.test.ts`
- `C:/Users/Minh/Desktop/VDL/src/features/prescriptions/components/MedicineCatalogManager.tsx`
- `C:/Users/Minh/Desktop/VDL/src/features/prescriptions/components/MedicineCatalogManager.test.tsx`
- `C:/Users/Minh/Desktop/VDL/src/features/prescriptions/components/PrescriptionForm.test.tsx`
- `C:/Users/Minh/Desktop/VDL/scripts/import-his-medicines.mjs`
- `C:/Users/Minh/Desktop/VDL/scripts/import-his-medicines.test.ts`
- `C:/Users/Minh/Desktop/VDL/scripts/fixtures/his-medicine-sample.json`
- `C:/Users/Minh/Desktop/VDL/supabase/migrations/20260327_expand_medicines_for_his.sql`

### Modify

- `C:/Users/Minh/Desktop/VDL/package.json`
- `C:/Users/Minh/Desktop/VDL/src/types/medical.ts`
- `C:/Users/Minh/Desktop/VDL/src/stores/prescriptionStore.ts`
- `C:/Users/Minh/Desktop/VDL/src/features/prescriptions/components/MedicineManager.tsx`
- `C:/Users/Minh/Desktop/VDL/src/features/prescriptions/components/PrescriptionForm.tsx`
- `C:/Users/Minh/Desktop/VDL/src/features/prescriptions/components/PrescriptionList.tsx`
- `C:/Users/Minh/Desktop/VDL/src/features/prescriptions/utils/printTemplates.ts`
- `C:/Users/Minh/Desktop/VDL/src/features/settings/pages/SettingsPage.tsx`
- `C:/Users/Minh/Desktop/VDL/src/features/settings/components/FacilityConfig.tsx`
- `C:/Users/Minh/Desktop/VDL/src/stores/roomConfigStore.ts`
- `C:/Users/Minh/Desktop/VDL/scripts/sql/vostro-bootstrap.sql`

### Do Not Modify Unless Blocked

- `C:/Users/Minh/Desktop/VDL/migrations/*`

Reason: the active deployment path appears to be forward migrations under `supabase/migrations` plus bootstrap SQL under `scripts/sql/vostro-bootstrap.sql`. Avoid editing legacy historical SQL unless later evidence shows it is still used in production bootstrapping.

## Task 1: Establish Test Harness And Core Medicine Helpers

**Files:**
- Create: `C:/Users/Minh/Desktop/VDL/vitest.config.ts`
- Create: `C:/Users/Minh/Desktop/VDL/src/test/setup.ts`
- Create: `C:/Users/Minh/Desktop/VDL/src/features/prescriptions/utils/medicineCatalog.ts`
- Test: `C:/Users/Minh/Desktop/VDL/src/features/prescriptions/utils/medicineCatalog.test.ts`
- Modify: `C:/Users/Minh/Desktop/VDL/package.json`

- [ ] **Step 1: Write the failing helper tests**

```ts
import { describe, expect, it } from 'vitest';
import {
  buildMedicineDisplayName,
  normalizeMedicineText,
  normalizeMedicineRoute,
  normalizeMedicineUnit,
} from './medicineCatalog';

describe('buildMedicineDisplayName', () => {
  it('formats active ingredient and trade name as a single label', () => {
    expect(
      buildMedicineDisplayName('Desloratadine', 'Aerius 0.5mg/ml'),
    ).toBe('Desloratadine (Aerius 0.5mg/ml)');
  });

  it('falls back safely when one side is missing', () => {
    expect(buildMedicineDisplayName('Amlodipine', '')).toBe('Amlodipine');
  });
});

describe('normalizers', () => {
  it('normalizes junk route placeholders to empty string', () => {
    expect(normalizeMedicineRoute('.')).toBe('');
  });

  it('normalizes unit casing without losing the original meaning', () => {
    expect(normalizeMedicineUnit('gói')).toBe('Goi');
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npm test -- src/features/prescriptions/utils/medicineCatalog.test.ts`

Expected: FAIL because the test runner and helper module do not exist yet.

- [ ] **Step 3: Add the test stack**

Install dev dependencies:

```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom @types/testing-library__jest-dom
```

Modify `package.json`:

```json
{
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest"
  }
}
```

Create `vitest.config.ts`:

```ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
  },
});
```

Create `src/test/setup.ts`:

```ts
import '@testing-library/jest-dom';
```

- [ ] **Step 4: Implement the minimal helper module**

Create `src/features/prescriptions/utils/medicineCatalog.ts`:

```ts
const collapseWhitespace = (value: string) => value.replace(/\s+/g, ' ').trim();

export const normalizeMedicineText = (value?: string | null) =>
  collapseWhitespace((value ?? '').replace(/\u00a0/g, ' '));

export const normalizeMedicineRoute = (value?: string | null) => {
  const normalized = normalizeMedicineText(value);
  return normalized === '.' ? '' : normalized;
};

export const normalizeMedicineUnit = (value?: string | null) => {
  const normalized = normalizeMedicineText(value);
  if (!normalized) return '';
  return normalized.charAt(0).toUpperCase() + normalized.slice(1).toLowerCase();
};

export const buildMedicineDisplayName = (
  activeIngredient?: string | null,
  tradeName?: string | null,
) => {
  const active = normalizeMedicineText(activeIngredient);
  const trade = normalizeMedicineText(tradeName);
  if (active && trade) return `${active} (${trade})`;
  return active || trade;
};
```

- [ ] **Step 5: Run the helper tests and keep them green**

Run: `npm test -- src/features/prescriptions/utils/medicineCatalog.test.ts`

Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add package.json vitest.config.ts src/test/setup.ts src/features/prescriptions/utils/medicineCatalog.ts src/features/prescriptions/utils/medicineCatalog.test.ts
git commit -m "test: add medicine catalog utility coverage"
```

## Task 2: Add Schema Support And Store Mapping For The Expanded Catalog

**Files:**
- Create: `C:/Users/Minh/Desktop/VDL/supabase/migrations/20260327_expand_medicines_for_his.sql`
- Create: `C:/Users/Minh/Desktop/VDL/src/features/prescriptions/utils/medicineMappers.ts`
- Test: `C:/Users/Minh/Desktop/VDL/src/features/prescriptions/utils/medicineMappers.test.ts`
- Modify: `C:/Users/Minh/Desktop/VDL/src/types/medical.ts`
- Modify: `C:/Users/Minh/Desktop/VDL/src/stores/prescriptionStore.ts`
- Modify: `C:/Users/Minh/Desktop/VDL/scripts/sql/vostro-bootstrap.sql`

- [ ] **Step 1: Write failing mapper tests**

```ts
import { describe, expect, it } from 'vitest';
import { mapMedicineRowFromDb, mapMedicineRowToDb } from './medicineMappers';

it('maps the expanded medicine row from Supabase into the UI model', () => {
  expect(
    mapMedicineRowFromDb({
      id: '1',
      code: 'BSGD00012',
      name: 'Desloratadine (Aerius 0.5mg/ml)',
      trade_name: 'Aerius 0.5mg/ml',
      active_ingredient: 'Desloratadine',
      unit: 'Lo',
      route: 'Uong',
      source: 'HIS_IMPORT',
      his_service_id: 11253,
    }),
  ).toMatchObject({
    code: 'BSGD00012',
    tradeName: 'Aerius 0.5mg/ml',
    route: 'Uong',
    source: 'HIS_IMPORT',
  });
});
```

- [ ] **Step 2: Run the mapper tests to verify they fail**

Run: `npm test -- src/features/prescriptions/utils/medicineMappers.test.ts`

Expected: FAIL because the mapper file does not exist yet.

- [ ] **Step 3: Add the schema migration**

Create `supabase/migrations/20260327_expand_medicines_for_his.sql`:

```sql
alter table public.medicines
  add column if not exists code text,
  add column if not exists trade_name text,
  add column if not exists route text,
  add column if not exists source text not null default 'MANUAL',
  add column if not exists his_service_id bigint,
  add column if not exists updated_at timestamptz not null default now();

create index if not exists medicines_code_idx on public.medicines (code);
create index if not exists medicines_source_idx on public.medicines (source);
```

Update `scripts/sql/vostro-bootstrap.sql` so clean bootstraps create the same `medicines` columns.

- [ ] **Step 4: Expand the TypeScript medicine model**

Modify `src/types/medical.ts`:

```ts
export interface Medicine {
  id: string;
  code?: string;
  name: string;
  tradeName?: string;
  activeIngredient?: string;
  unit: string;
  route?: string;
  defaultDosage?: string;
  price?: number;
  source?: 'HIS_IMPORT' | 'MANUAL';
  hisServiceId?: number | null;
}
```

- [ ] **Step 5: Implement the mapper module and use it in the store**

Create `src/features/prescriptions/utils/medicineMappers.ts`:

```ts
import { Medicine } from '@/src/types/medical';
import { buildMedicineDisplayName } from './medicineCatalog';

export const mapMedicineRowFromDb = (row: any): Medicine => ({
  id: row.id,
  code: row.code,
  name: row.name ?? buildMedicineDisplayName(row.active_ingredient, row.trade_name),
  tradeName: row.trade_name,
  activeIngredient: row.active_ingredient,
  unit: row.unit,
  route: row.route,
  defaultDosage: row.default_dosage,
  price: row.price,
  source: row.source,
  hisServiceId: row.his_service_id,
});

export const mapMedicineRowToDb = (medicine: Partial<Medicine>) => ({
  code: medicine.code,
  name: medicine.name,
  trade_name: medicine.tradeName,
  active_ingredient: medicine.activeIngredient,
  unit: medicine.unit,
  route: medicine.route,
  default_dosage: medicine.defaultDosage,
  price: medicine.price,
  source: medicine.source ?? 'MANUAL',
  his_service_id: medicine.hisServiceId ?? null,
  updated_at: new Date().toISOString(),
});
```

Then modify `src/stores/prescriptionStore.ts` so `fetchMedicines`, `createMedicine`, and `updateMedicine` use the mapper helpers instead of ad hoc inline objects.

- [ ] **Step 6: Run the mapper tests and a targeted store smoke test**

Run:

```bash
npm test -- src/features/prescriptions/utils/medicineMappers.test.ts
npm run build
```

Expected: mapper test PASS, build PASS

- [ ] **Step 7: Commit**

```bash
git add supabase/migrations/20260327_expand_medicines_for_his.sql scripts/sql/vostro-bootstrap.sql src/types/medical.ts src/stores/prescriptionStore.ts src/features/prescriptions/utils/medicineMappers.ts src/features/prescriptions/utils/medicineMappers.test.ts
git commit -m "feat: expand medicine schema for HIS import"
```

## Task 3: Implement The One-Time HIS Import Script

**Files:**
- Create: `C:/Users/Minh/Desktop/VDL/scripts/import-his-medicines.mjs`
- Create: `C:/Users/Minh/Desktop/VDL/scripts/import-his-medicines.test.ts`
- Create: `C:/Users/Minh/Desktop/VDL/scripts/fixtures/his-medicine-sample.json`
- Modify: `C:/Users/Minh/Desktop/VDL/package.json`

- [ ] **Step 1: Write failing import tests**

```ts
import { describe, expect, it } from 'vitest';
import {
  dedupeHisMedicineRows,
  filterHisMedicineRow,
  mapHisMedicineRow,
} from '../../scripts/import-his-medicines.mjs';

it('rejects junk active ingredient placeholders', () => {
  expect(
    filterHisMedicineRow({
      servicecode: 'VDL000052',
      servicename: 'Day truyen',
      listmedicinehoatchat: '.',
    }),
  ).toBe(false);
});

it('prefers the newest row per code', () => {
  expect(
    dedupeHisMedicineRows([
      { serviceid: 10, servicecode: 'BSGD00012', servicename: 'Aerius', listmedicinehoatchat: 'Desloratadine', serviceunit: 'Lo', dm_medicine_duongdung: 'Uong' },
      { serviceid: 12, servicecode: 'BSGD00012', servicename: 'Aerius 0.5mg/ml', listmedicinehoatchat: 'Desloratadine', serviceunit: 'Lo', dm_medicine_duongdung: 'Uong' },
    ])[0].tradeName,
  ).toBe('Aerius 0.5mg/ml');
});
```

- [ ] **Step 2: Run the import tests to verify they fail**

Run: `npm test -- scripts/import-his-medicines.test.ts`

Expected: FAIL because the script exports do not exist yet.

- [ ] **Step 3: Implement the import script as pure helpers plus CLI wrapper**

Create `scripts/import-his-medicines.mjs` with:

- pure exported helpers for filtering, normalization, dedupe, and conflict detection
- a CLI wrapper that:
  - reads `HIS_DB_*` env vars
  - reads `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`
  - supports `--dry-run`, `--apply`, and `--conflicts-file`

Core output row shape:

```js
{
  code: row.servicecode,
  tradeName: normalizeMedicineText(row.servicename),
  activeIngredient: normalizeMedicineText(row.listmedicinehoatchat),
  unit: normalizeMedicineUnit(row.serviceunit),
  route: normalizeMedicineRoute(row.dm_medicine_duongdung),
  name: buildMedicineDisplayName(row.listmedicinehoatchat, row.servicename),
  source: 'HIS_IMPORT',
  hisServiceId: row.serviceid,
}
```

- [ ] **Step 4: Add package scripts for bastion usage**

Modify `package.json`:

```json
{
  "scripts": {
    "medicines:import:dry-run": "node scripts/import-his-medicines.mjs --dry-run",
    "medicines:import": "node scripts/import-his-medicines.mjs --apply"
  }
}
```

- [ ] **Step 5: Run import tests and a dry-run against fixture data**

Run:

```bash
npm test -- scripts/import-his-medicines.test.ts
node scripts/import-his-medicines.mjs --dry-run --fixture scripts/fixtures/his-medicine-sample.json
```

Expected:

- test PASS
- dry-run prints counts, deduped rows, and conflict summary without writing

- [ ] **Step 6: Commit**

```bash
git add package.json scripts/import-his-medicines.mjs scripts/import-his-medicines.test.ts scripts/fixtures/his-medicine-sample.json
git commit -m "feat: add one-time HIS medicine import script"
```

## Task 4: Refactor The Catalog UI Into A Shared Manager And Expose It In Settings

**Files:**
- Create: `C:/Users/Minh/Desktop/VDL/src/features/prescriptions/components/MedicineCatalogManager.tsx`
- Test: `C:/Users/Minh/Desktop/VDL/src/features/prescriptions/components/MedicineCatalogManager.test.tsx`
- Modify: `C:/Users/Minh/Desktop/VDL/src/features/prescriptions/components/MedicineManager.tsx`
- Modify: `C:/Users/Minh/Desktop/VDL/src/features/settings/pages/SettingsPage.tsx`
- Modify: `C:/Users/Minh/Desktop/VDL/src/stores/prescriptionStore.ts`

- [ ] **Step 1: Write the failing component tests**

```tsx
import { render, screen } from '@testing-library/react';
import { MedicineCatalogManager } from './MedicineCatalogManager';

it('renders derived display names as read-only rows', () => {
  render(
    <MedicineCatalogManager
      medicines={[
        {
          id: '1',
          code: 'BSGD00012',
          name: 'Desloratadine (Aerius 0.5mg/ml)',
          tradeName: 'Aerius 0.5mg/ml',
          activeIngredient: 'Desloratadine',
          unit: 'Lo',
          route: 'Uong',
          source: 'HIS_IMPORT',
        },
      ]}
      onCreate={async () => {}}
      onUpdate={async () => {}}
      onDelete={async () => {}}
    />,
  );

  expect(screen.getByText('Desloratadine (Aerius 0.5mg/ml)')).toBeInTheDocument();
  expect(screen.getByText('HIS_IMPORT')).toBeInTheDocument();
});
```

- [ ] **Step 2: Run the UI test to verify it fails**

Run: `npm test -- src/features/prescriptions/components/MedicineCatalogManager.test.tsx`

Expected: FAIL because the component does not exist yet.

- [ ] **Step 3: Build the shared catalog manager**

Create `MedicineCatalogManager.tsx` as the shell-agnostic component with:

- toolbar search input
- add button
- table columns: code, name, trade name, unit, route, source
- manual form fields: code, active ingredient, trade name, unit, route
- derived display name preview that updates live

Keep `name` read-only in the form. Recompute it before save with `buildMedicineDisplayName`.

- [ ] **Step 4: Turn the old modal into a thin wrapper**

Modify `MedicineManager.tsx` so it becomes a modal shell around `MedicineCatalogManager` instead of holding all table logic directly.

- [ ] **Step 5: Add the settings entry**

Modify `SettingsPage.tsx`:

- add `view: 'medicines'`
- add the new tile on the settings menu
- render the catalog manager inside the settings flow

- [ ] **Step 6: Run the UI test and a build**

Run:

```bash
npm test -- src/features/prescriptions/components/MedicineCatalogManager.test.tsx
npm run build
```

Expected: PASS, PASS

- [ ] **Step 7: Commit**

```bash
git add src/features/prescriptions/components/MedicineCatalogManager.tsx src/features/prescriptions/components/MedicineCatalogManager.test.tsx src/features/prescriptions/components/MedicineManager.tsx src/features/settings/pages/SettingsPage.tsx
git commit -m "feat: expose medicine catalog in settings"
```

## Task 5: Switch Prescribing To The Catalog Snapshot Model

**Files:**
- Test: `C:/Users/Minh/Desktop/VDL/src/features/prescriptions/components/PrescriptionForm.test.tsx`
- Modify: `C:/Users/Minh/Desktop/VDL/src/features/prescriptions/components/PrescriptionForm.tsx`
- Modify: `C:/Users/Minh/Desktop/VDL/src/features/prescriptions/components/PrescriptionList.tsx`
- Modify: `C:/Users/Minh/Desktop/VDL/src/stores/prescriptionStore.ts`

- [ ] **Step 1: Write the failing prescription-form test**

```tsx
import { fireEvent, render, screen } from '@testing-library/react';
import { PrescriptionForm } from './PrescriptionForm';

it('snapshots the derived medicine label when a catalog entry is selected', async () => {
  render(/* mocked store state with a medicine named "Desloratadine (Aerius 0.5mg/ml)" */);
  fireEvent.change(screen.getByPlaceholderText(/Tim ten thuoc/i), {
    target: { value: 'Desloratadine (Aerius 0.5mg/ml)' },
  });
  // assert the submission payload captures medicineId + medicineName
});
```

- [ ] **Step 2: Run the prescription-form test to verify it fails**

Run: `npm test -- src/features/prescriptions/components/PrescriptionForm.test.tsx`

Expected: FAIL because the form does not yet enforce catalog-backed snapshots.

- [ ] **Step 3: Update prescription form selection behavior**

Modify `PrescriptionForm.tsx` so choosing a medicine:

- stores `medicineId`
- stores `medicineName` using the selected catalog row's `name`
- optionally keeps trade name and route in local derived state if useful for future UI

Do not switch back to freeform raw names after selection unless the user explicitly clears the field.

- [ ] **Step 4: Keep resident history print-safe**

Modify `PrescriptionList.tsx` only as needed so historical rows continue to use the stored `medicineName` snapshot and do not depend on the current catalog.

- [ ] **Step 5: Run the form test and build**

Run:

```bash
npm test -- src/features/prescriptions/components/PrescriptionForm.test.tsx
npm run build
```

Expected: PASS, PASS

- [ ] **Step 6: Commit**

```bash
git add src/features/prescriptions/components/PrescriptionForm.tsx src/features/prescriptions/components/PrescriptionForm.test.tsx src/features/prescriptions/components/PrescriptionList.tsx src/stores/prescriptionStore.ts
git commit -m "feat: snapshot catalog display names in prescriptions"
```

## Task 6: Replace The Print Template And Add Facility Website Support

**Files:**
- Create: `C:/Users/Minh/Desktop/VDL/src/features/prescriptions/utils/buildPrescriptionPrintHtml.ts`
- Test: `C:/Users/Minh/Desktop/VDL/src/features/prescriptions/utils/buildPrescriptionPrintHtml.test.ts`
- Modify: `C:/Users/Minh/Desktop/VDL/src/features/prescriptions/utils/printTemplates.ts`
- Modify: `C:/Users/Minh/Desktop/VDL/src/features/settings/components/FacilityConfig.tsx`
- Modify: `C:/Users/Minh/Desktop/VDL/src/stores/roomConfigStore.ts`

- [ ] **Step 1: Write the failing print-html tests**

```ts
import { describe, expect, it } from 'vitest';
import { buildPrescriptionPrintHtml } from './buildPrescriptionPrintHtml';

it('renders blank placeholders for missing optional patient fields', () => {
  const html = buildPrescriptionPrintHtml({
    facility: { name: 'FDC', address: 'A', phone: 'B', email: '', taxCode: '', website: '' },
    resident: { name: 'HOANG MINH ANH', dob: '2016-06-07', gender: 'Nam' },
    prescription: { code: 'DT-001', diagnosis: 'J02', items: [] },
  });

  expect(html).toContain('So dinh danh ca nhan/CCCD/Ho chieu');
  expect(html).toContain('Tai kham ngay');
});
```

- [ ] **Step 2: Run the print test to verify it fails**

Run: `npm test -- src/features/prescriptions/utils/buildPrescriptionPrintHtml.test.ts`

Expected: FAIL because the HTML builder does not exist yet.

- [ ] **Step 3: Extract the HTML builder**

Create `buildPrescriptionPrintHtml.ts` as a pure helper that accepts:

- facility settings
- resident snapshot
- prescription snapshot
- already formatted medicine rows

Return the full printable HTML string with the approved A4 structure.

- [ ] **Step 4: Wire the print entry point**

Modify `printTemplates.ts` so `printPrescription()`:

- calls `buildPrescriptionPrintHtml()`
- opens the print window
- writes the generated HTML
- keeps blank labels for missing optional values

- [ ] **Step 5: Add facility website support**

Modify `roomConfigStore.ts` and `FacilityConfig.tsx`:

- add `website` to `FacilityInfo`
- surface it in the settings form
- keep it optional

- [ ] **Step 6: Run the print tests and build**

Run:

```bash
npm test -- src/features/prescriptions/utils/buildPrescriptionPrintHtml.test.ts
npm run build
```

Expected: PASS, PASS

- [ ] **Step 7: Commit**

```bash
git add src/features/prescriptions/utils/buildPrescriptionPrintHtml.ts src/features/prescriptions/utils/buildPrescriptionPrintHtml.test.ts src/features/prescriptions/utils/printTemplates.ts src/features/settings/components/FacilityConfig.tsx src/stores/roomConfigStore.ts
git commit -m "feat: redesign prescription print layout"
```

## Task 7: End-To-End Verification And Operator Handoff

**Files:**
- Modify if needed: `C:/Users/Minh/Desktop/VDL/package.json`
- Review only: `C:/Users/Minh/Desktop/VDL/docs/superpowers/specs/2026-03-27-medicine-catalog-from-his-design.md`
- Review only: `C:/Users/Minh/Desktop/VDL/docs/superpowers/plans/2026-03-27-medicine-catalog-from-his-implementation.md`

- [ ] **Step 1: Run the full automated suite**

Run:

```bash
npm test
npm run build
```

Expected: all tests PASS, build PASS

- [ ] **Step 2: Run the HIS import in dry-run mode against the real endpoint**

Run:

```bash
$env:HIS_DB_HOST='...'; $env:HIS_DB_PORT='...'; $env:HIS_DB_NAME='...'; $env:HIS_DB_USER='...'; $env:HIS_DB_PASSWORD='...'
$env:SUPABASE_URL='...'; $env:SUPABASE_SERVICE_ROLE_KEY='...'
npm run medicines:import:dry-run
```

Expected:

- a deduped count close to the design baseline
- conflict file written
- no Supabase writes yet

- [ ] **Step 3: Run the real import once approved**

Run: `npm run medicines:import`

Expected: successful upsert summary

- [ ] **Step 4: Manual app smoke test**

Check:

- settings shows `Danh muc thuoc`
- imported HIS rows are visible and searchable
- manual medicine creation recalculates display name
- prescription form suggestions show display name
- saved prescription history still prints the same medicine names
- A4 print layout matches the approved mockup closely

- [ ] **Step 5: Commit final implementation polish if needed**

```bash
git add package.json vitest.config.ts src/test/setup.ts \
  src/features/prescriptions/utils/medicineCatalog.ts \
  src/features/prescriptions/utils/medicineCatalog.test.ts \
  src/features/prescriptions/utils/medicineMappers.ts \
  src/features/prescriptions/utils/medicineMappers.test.ts \
  src/features/prescriptions/utils/buildPrescriptionPrintHtml.ts \
  src/features/prescriptions/utils/buildPrescriptionPrintHtml.test.ts \
  src/features/prescriptions/utils/printTemplates.ts \
  src/features/prescriptions/components/MedicineCatalogManager.tsx \
  src/features/prescriptions/components/MedicineCatalogManager.test.tsx \
  src/features/prescriptions/components/MedicineManager.tsx \
  src/features/prescriptions/components/PrescriptionForm.tsx \
  src/features/prescriptions/components/PrescriptionForm.test.tsx \
  src/features/prescriptions/components/PrescriptionList.tsx \
  src/features/settings/pages/SettingsPage.tsx \
  src/features/settings/components/FacilityConfig.tsx \
  src/stores/prescriptionStore.ts \
  src/stores/roomConfigStore.ts \
  src/types/medical.ts \
  scripts/import-his-medicines.mjs \
  scripts/import-his-medicines.test.ts \
  scripts/fixtures/his-medicine-sample.json \
  scripts/sql/vostro-bootstrap.sql \
  supabase/migrations/20260327_expand_medicines_for_his.sql
git commit -m "chore: finalize medicine catalog rollout"
```
