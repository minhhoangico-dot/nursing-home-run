# Medication Module Three-Layer Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the medication workflow around a shared drug master, a full-detail prescription editor, and a derived active-medication layer while preserving the clinic-style single-prescription print and adding a nurse-facing aggregated active-medication print.

**Architecture:** Keep the existing resident prescription surface, but split the code into three responsibilities: catalog data and autocomplete, prescription document editing plus history, and derived active-medication calculations. Centralize all supply math and active-status derivation in shared helpers so cards, warnings, and both print modes read from the same rules. Preserve backward compatibility for current prescribing flows by layering the new data model and selectors into the existing Zustand store and Supabase services instead of rewriting unrelated medical modules.

**Tech Stack:** React 19, TypeScript, Vite, Zustand, Supabase, React Hook Form, Zod, Vitest, React Testing Library, jsdom

---

## File Structure

### Create

- `C:/Users/Minh/Desktop/VDL/src/features/prescriptions/utils/prescriptionDerivations.ts`
- `C:/Users/Minh/Desktop/VDL/src/features/prescriptions/utils/prescriptionDerivations.test.ts`
- `C:/Users/Minh/Desktop/VDL/src/features/prescriptions/utils/prescriptionMappers.ts`
- `C:/Users/Minh/Desktop/VDL/src/features/prescriptions/utils/prescriptionMappers.test.ts`
- `C:/Users/Minh/Desktop/VDL/src/features/prescriptions/utils/activeMedicationPrint.ts`
- `C:/Users/Minh/Desktop/VDL/src/features/prescriptions/utils/activeMedicationPrint.test.ts`
- `C:/Users/Minh/Desktop/VDL/src/features/prescriptions/components/DrugMasterDialog.tsx`
- `C:/Users/Minh/Desktop/VDL/src/features/prescriptions/components/DrugMasterDialog.test.tsx`
- `C:/Users/Minh/Desktop/VDL/src/features/prescriptions/components/PrescriptionCard.tsx`
- `C:/Users/Minh/Desktop/VDL/src/features/prescriptions/components/PrescriptionCard.test.tsx`
- `C:/Users/Minh/Desktop/VDL/src/features/prescriptions/components/ActiveMedicationSummary.tsx`
- `C:/Users/Minh/Desktop/VDL/src/features/prescriptions/components/ActiveMedicationSummary.test.tsx`
- `C:/Users/Minh/Desktop/VDL/src/features/prescriptions/components/PrescriptionForm.test.tsx`
- `C:/Users/Minh/Desktop/VDL/src/features/prescriptions/components/PrescriptionHistoryDrawer.tsx`
- `C:/Users/Minh/Desktop/VDL/src/features/prescriptions/components/PrescriptionHistoryDrawer.test.tsx`
- `C:/Users/Minh/Desktop/VDL/supabase/migrations/20260331_expand_prescriptions_three_layer.sql`

### Modify

- `C:/Users/Minh/Desktop/VDL/package.json`
- `C:/Users/Minh/Desktop/VDL/vite.config.ts`
- `C:/Users/Minh/Desktop/VDL/src/types/medical.ts`
- `C:/Users/Minh/Desktop/VDL/src/services/databaseService.ts`
- `C:/Users/Minh/Desktop/VDL/src/services/medicalService.ts`
- `C:/Users/Minh/Desktop/VDL/src/stores/prescriptionStore.ts`
- `C:/Users/Minh/Desktop/VDL/src/features/prescriptions/components/MedicineManager.tsx`
- `C:/Users/Minh/Desktop/VDL/src/features/prescriptions/components/PrescriptionForm.tsx`
- `C:/Users/Minh/Desktop/VDL/src/features/prescriptions/components/PrescriptionList.tsx`
- `C:/Users/Minh/Desktop/VDL/src/features/prescriptions/components/PrescriptionList.test.tsx`
- `C:/Users/Minh/Desktop/VDL/src/features/prescriptions/utils/printTemplates.ts`
- `C:/Users/Minh/Desktop/VDL/src/features/prescriptions/utils/printTemplates.test.ts`
- `C:/Users/Minh/Desktop/VDL/scripts/sql/vostro-bootstrap.sql`

### Do Not Modify Unless Blocked

- `C:/Users/Minh/Desktop/VDL/migrations/*`

Reason: the active schema path in this repo is `supabase/migrations` plus `scripts/sql/vostro-bootstrap.sql`. Do not rewrite historical migrations unless later evidence shows production still depends on them.

## Task 1: Expand The Data Model For Item-Level Timing, Supply, And History

**Files:**
- Create: `C:/Users/Minh/Desktop/VDL/supabase/migrations/20260331_expand_prescriptions_three_layer.sql`
- Test: `C:/Users/Minh/Desktop/VDL/src/features/prescriptions/utils/prescriptionMappers.test.ts`
- Create: `C:/Users/Minh/Desktop/VDL/src/features/prescriptions/utils/prescriptionMappers.ts`
- Modify: `C:/Users/Minh/Desktop/VDL/src/types/medical.ts`
- Modify: `C:/Users/Minh/Desktop/VDL/src/services/databaseService.ts`
- Modify: `C:/Users/Minh/Desktop/VDL/src/services/medicalService.ts`
- Modify: `C:/Users/Minh/Desktop/VDL/scripts/sql/vostro-bootstrap.sql`

- [ ] **Step 1: Write the failing mapper tests for the expanded item model**

```ts
import { describe, expect, it } from 'vitest';
import {
  mapPrescriptionItemFromDb,
  mapPrescriptionItemToDb,
} from './prescriptionMappers';

describe('mapPrescriptionItemFromDb', () => {
  it('hydrates time-of-day flags, quantity supplied, and status fields', () => {
    expect(
      mapPrescriptionItemFromDb({
        id: 'item-1',
        medicine_id: 'med-1',
        dosage: '1 vien',
        frequency: '2 lan/ngay',
        instructions: 'Sau an',
        start_date: '2026-03-31',
        end_date: '2026-04-05',
        continuous: false,
        quantity_supplied: 10,
        administrations_per_day: 2,
        morning: true,
        noon: false,
        afternoon: false,
        evening: true,
      }),
    ).toMatchObject({
      quantitySupplied: 10,
      administrationsPerDay: 2,
      schedule: { morning: true, evening: true },
    });
  });
});

describe('mapPrescriptionItemToDb', () => {
  it('serializes the UI item into the expanded row shape', () => {
    expect(
      mapPrescriptionItemToDb({
        medicineId: 'med-1',
        dosage: '1 vien',
        frequency: '2 lan/ngay',
        instructions: 'Sau an',
        startDate: '2026-03-31',
        endDate: '2026-04-05',
        continuous: false,
        quantitySupplied: 10,
        administrationsPerDay: 2,
        schedule: { morning: true, noon: false, afternoon: false, evening: true },
      }),
    ).toMatchObject({
      quantity_supplied: 10,
      administrations_per_day: 2,
      morning: true,
      evening: true,
    });
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npm.cmd test -- src/features/prescriptions/utils/prescriptionMappers.test.ts`

Expected: FAIL because the mapper file and expanded fields do not exist yet.

- [ ] **Step 3: Add the schema migration for item-level dates, schedule, supply, and snapshots**

Create `C:/Users/Minh/Desktop/VDL/supabase/migrations/20260331_expand_prescriptions_three_layer.sql`:

```sql
alter table public.prescription_items
  add column if not exists start_date date,
  add column if not exists end_date date,
  add column if not exists continuous boolean not null default false,
  add column if not exists quantity_supplied numeric not null default 0,
  add column if not exists administrations_per_day integer not null default 1,
  add column if not exists morning boolean not null default false,
  add column if not exists noon boolean not null default false,
  add column if not exists afternoon boolean not null default false,
  add column if not exists evening boolean not null default false;

alter table public.prescriptions
  add column if not exists diagnosis text,
  add column if not exists notes text,
  add column if not exists duplicated_from_prescription_id uuid references public.prescriptions(id);

create table if not exists public.prescription_snapshots (
  id uuid primary key default gen_random_uuid(),
  prescription_id uuid not null references public.prescriptions(id) on delete cascade,
  version integer not null,
  snapshot_at timestamptz not null default now(),
  actor text,
  change_reason text,
  header_payload jsonb not null,
  items_payload jsonb not null,
  unique (prescription_id, version)
);

update public.prescription_items pi
set
  start_date = coalesce(pi.start_date, p.prescription_date::date),
  quantity_supplied = coalesce(nullif(pi.quantity_supplied, 0), 1),
  administrations_per_day = greatest(coalesce(pi.administrations_per_day, 1), 1),
  morning = case
    when not (pi.morning or pi.noon or pi.afternoon or pi.evening) then true
    else pi.morning
  end
from public.prescriptions p
where p.id = pi.prescription_id;
```

Update `C:/Users/Minh/Desktop/VDL/scripts/sql/vostro-bootstrap.sql` so fresh environments create the same columns and snapshot table.

- [ ] **Step 4: Expand the shared medical types**

Modify `C:/Users/Minh/Desktop/VDL/src/types/medical.ts`:

```ts
export interface PrescriptionItemSchedule {
  morning: boolean;
  noon: boolean;
  afternoon: boolean;
  evening: boolean;
}

export interface PrescriptionItem {
  id?: string;
  medicineId: string;
  dosage: string;
  frequency: string;
  instructions?: string;
  startDate: string;
  endDate?: string;
  continuous: boolean;
  quantitySupplied: number;
  administrationsPerDay: number;
  schedule: PrescriptionItemSchedule;
}

export interface PrescriptionSnapshot {
  id: string;
  prescriptionId: string;
  version: number;
  snapshotAt: string;
  actor?: string;
  changeReason?: string;
  headerPayload: Record<string, unknown>;
  itemsPayload: unknown[];
}
```

- [ ] **Step 5: Implement the mapper helpers and wire them into the services**

Create `C:/Users/Minh/Desktop/VDL/src/features/prescriptions/utils/prescriptionMappers.ts` with pure mapping helpers. Update `C:/Users/Minh/Desktop/VDL/src/services/databaseService.ts` and `C:/Users/Minh/Desktop/VDL/src/services/medicalService.ts` so all prescription fetches and saves use the mapper layer instead of sprinkling field-shape conversions inline.

- [ ] **Step 6: Run the new mapper tests**

Run: `npm.cmd test -- src/features/prescriptions/utils/prescriptionMappers.test.ts`

Expected: PASS

- [ ] **Step 7: Commit**

```bash
git add supabase/migrations/20260331_expand_prescriptions_three_layer.sql scripts/sql/vostro-bootstrap.sql src/types/medical.ts src/services/databaseService.ts src/services/medicalService.ts src/features/prescriptions/utils/prescriptionMappers.ts src/features/prescriptions/utils/prescriptionMappers.test.ts
git commit -m "feat: expand prescription data model"
```

## Task 2: Centralize Active-State And Supply Derivations

**Files:**
- Create: `C:/Users/Minh/Desktop/VDL/src/features/prescriptions/utils/prescriptionDerivations.ts`
- Test: `C:/Users/Minh/Desktop/VDL/src/features/prescriptions/utils/prescriptionDerivations.test.ts`
- Modify: `C:/Users/Minh/Desktop/VDL/src/types/medical.ts`

- [ ] **Step 1: Write the failing derivation tests**

```ts
import { describe, expect, it, vi } from 'vitest';
import {
  buildActiveMedicationRows,
  getEstimatedExhaustionDate,
  getMedicationLineStatus,
} from './prescriptionDerivations';

describe('getEstimatedExhaustionDate', () => {
  it('treats the start date as day one of supply', () => {
    expect(
      getEstimatedExhaustionDate({
        startDate: '2026-03-31',
        quantitySupplied: 10,
        administrationsPerDay: 2,
      }),
    ).toBe('2026-04-04');
  });
});

describe('getMedicationLineStatus', () => {
  it('marks a line as nearEnd when remaining supply is two days', () => {
    vi.setSystemTime(new Date('2026-04-03T03:00:00.000Z'));
    expect(
      getMedicationLineStatus({
        startDate: '2026-03-31',
        quantitySupplied: 10,
        administrationsPerDay: 2,
        schedule: { morning: true, noon: false, afternoon: false, evening: true },
        continuous: false,
      }),
    ).toMatchObject({ nearEnd: true, exhausted: false });
  });
});

describe('buildActiveMedicationRows', () => {
  it('keeps duplicate medicines separate and sorts by time of day, display name, start date, then prescription code', () => {
    const rows = buildActiveMedicationRows([
      {
        id: 'prescription-1',
        prescriptionNumber: 'DT-001',
        status: 'Active',
        items: [
          {
            medicineId: 'med-1',
            medicineName: 'Amlodipine',
            dosage: '1 vien',
            frequency: '1 lan/ngay',
            startDate: '2026-03-31',
            quantitySupplied: 10,
            administrationsPerDay: 1,
            continuous: false,
            schedule: { morning: true, noon: false, afternoon: false, evening: false },
          },
          {
            medicineId: 'med-2',
            medicineName: 'Rosuvastatin',
            dosage: '1 vien',
            frequency: '1 lan/ngay',
            startDate: '2026-03-31',
            quantitySupplied: 10,
            administrationsPerDay: 1,
            continuous: false,
            schedule: { morning: false, noon: false, afternoon: false, evening: true },
          },
        ],
      },
      {
        id: 'prescription-2',
        prescriptionNumber: 'DT-002',
        status: 'Active',
        items: [
          {
            medicineId: 'med-3',
            medicineName: 'Amlodipine',
            dosage: '1 vien',
            frequency: '1 lan/ngay',
            startDate: '2026-04-01',
            quantitySupplied: 10,
            administrationsPerDay: 1,
            continuous: false,
            schedule: { morning: true, noon: false, afternoon: false, evening: false },
          },
        ],
      },
    ]);

    expect(rows.map((row) => [row.timeOfDay, row.medicineName, row.sourcePrescriptionCode])).toEqual([
      ['morning', 'Amlodipine', 'DT-001'],
      ['morning', 'Amlodipine', 'DT-002'],
      ['evening', 'Rosuvastatin', 'DT-001'],
    ]);
  });
});
```

- [ ] **Step 2: Run the derivation tests to verify they fail**

Run: `npm.cmd test -- src/features/prescriptions/utils/prescriptionDerivations.test.ts`

Expected: FAIL because the derivation module does not exist yet.

- [ ] **Step 3: Implement one pure derivation module**

Create `C:/Users/Minh/Desktop/VDL/src/features/prescriptions/utils/prescriptionDerivations.ts` with:

```ts
export const getAdministrationsPerDay = (schedule: PrescriptionItemSchedule) =>
  Math.max(1, [schedule.morning, schedule.noon, schedule.afternoon, schedule.evening].filter(Boolean).length);

export const getEstimatedDaysSupply = (quantitySupplied: number, administrationsPerDay: number) =>
  Math.floor(quantitySupplied / Math.max(1, administrationsPerDay));

export const getEstimatedExhaustionDate = ({ startDate, quantitySupplied, administrationsPerDay }: {
  startDate: string;
  quantitySupplied: number;
  administrationsPerDay: number;
}) => {
  // returns yyyy-mm-dd in Asia/Saigon semantics
};

export const getMedicationLineStatus = (item: PrescriptionItem, today = new Date()) => {
  // returns { active, nearEnd, exhausted, remainingDays, estimatedExhaustionDate }
};

export const buildActiveMedicationRows = (prescriptions: Prescription[]) => {
  // duplicates remain separate; sorted by locked ordering contract
};
```

- [ ] **Step 4: Add the derived types needed by the UI**

Modify `C:/Users/Minh/Desktop/VDL/src/types/medical.ts`:

```ts
export interface MedicationLineStatus {
  active: boolean;
  nearEnd: boolean;
  exhausted: boolean;
  remainingDays: number | null;
  estimatedExhaustionDate: string | null;
}

export interface ActiveMedicationRow {
  prescriptionId: string;
  sourcePrescriptionCode: string;
  medicineName: string;
  dosage: string;
  instructions?: string;
  timeOfDay: 'morning' | 'noon' | 'afternoon' | 'evening';
  status: MedicationLineStatus;
}
```

- [ ] **Step 5: Run the derivation tests**

Run: `npm.cmd test -- src/features/prescriptions/utils/prescriptionDerivations.test.ts`

Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add src/types/medical.ts src/features/prescriptions/utils/prescriptionDerivations.ts src/features/prescriptions/utils/prescriptionDerivations.test.ts
git commit -m "feat: centralize prescription derivations"
```

## Task 3: Upgrade The Store For History, Duplicate, Pause, Complete, And Derived Selectors

**Files:**
- Modify: `C:/Users/Minh/Desktop/VDL/src/stores/prescriptionStore.ts`
- Modify: `C:/Users/Minh/Desktop/VDL/src/services/medicalService.ts`
- Test: `C:/Users/Minh/Desktop/VDL/src/features/prescriptions/components/PrescriptionList.test.tsx`

- [ ] **Step 1: Add the failing store behavior tests through the list surface**

Extend `C:/Users/Minh/Desktop/VDL/src/features/prescriptions/components/PrescriptionList.test.tsx`:

```ts
it('shows duplicate, pause, and complete actions on active cards', () => {
  render(<PrescriptionList residentId="resident-1" />);
  expect(screen.getByRole('button', { name: /nhan ban/i })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /tam ngung/i })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /ket thuc/i })).toBeInTheDocument();
});

it('opens history for an adjusted prescription', async () => {
  render(<PrescriptionList residentId="resident-1" />);
  await user.click(screen.getByRole('button', { name: /lich su dieu chinh/i }));
  expect(screen.getByText(/phien ban 1/i)).toBeInTheDocument();
});
```

- [ ] **Step 2: Run the list tests and confirm the new expectations fail**

Run: `npm.cmd test -- src/features/prescriptions/components/PrescriptionList.test.tsx`

Expected: FAIL because the store does not expose the new actions or history state yet.

- [ ] **Step 3: Add the store contract**

Modify `C:/Users/Minh/Desktop/VDL/src/stores/prescriptionStore.ts` to expose:

```ts
interface PrescriptionStore {
  duplicatePrescription: (prescriptionId: string) => Promise<void>;
  pausePrescription: (prescriptionId: string, reason?: string) => Promise<void>;
  completePrescription: (prescriptionId: string, reason?: string) => Promise<void>;
  getActivePrescriptionsForResident: (residentId: string) => Prescription[];
  getActiveMedicationRowsForResident: (residentId: string) => ActiveMedicationRow[];
  fetchPrescriptionSnapshots: (prescriptionId: string) => Promise<PrescriptionSnapshot[]>;
}
```

Before `updatePrescription`, `pausePrescription`, and `completePrescription`, write a snapshot row with the current header and items. For `duplicatePrescription`, create a new record with `duplicated_from_prescription_id` set and cloned items.

- [ ] **Step 4: Keep the selector logic DRY**

In the same store, route all active-card and warning data through `prescriptionDerivations.ts` instead of recalculating inside React components.

- [ ] **Step 5: Run the list tests**

Run: `npm.cmd test -- src/features/prescriptions/components/PrescriptionList.test.tsx`

Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add src/stores/prescriptionStore.ts src/services/medicalService.ts src/features/prescriptions/components/PrescriptionList.test.tsx
git commit -m "feat: add prescription lifecycle actions"
```

## Task 4: Refactor Drug Master Into A Reusable Search-And-Create Surface

**Files:**
- Create: `C:/Users/Minh/Desktop/VDL/src/features/prescriptions/components/DrugMasterDialog.tsx`
- Test: `C:/Users/Minh/Desktop/VDL/src/features/prescriptions/components/DrugMasterDialog.test.tsx`
- Modify: `C:/Users/Minh/Desktop/VDL/src/features/prescriptions/components/MedicineManager.tsx`
- Modify: `C:/Users/Minh/Desktop/VDL/src/stores/prescriptionStore.ts`

- [ ] **Step 1: Write the failing dialog tests**

```tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DrugMasterDialog } from './DrugMasterDialog';

it('filters by medicine name and active ingredient', async () => {
  render(<DrugMasterDialog open medicines={[{ id: '1', name: 'Aerius', activeIngredient: 'Desloratadine' }]} />);
  await userEvent.type(screen.getByPlaceholderText(/tim thuoc/i), 'deslo');
  expect(screen.getByText(/aerius/i)).toBeInTheDocument();
});

it('prefills the selected medicine back into the editor', async () => {
  const onSelect = vi.fn();
  render(<DrugMasterDialog open medicines={[{ id: '1', name: 'Aerius' }]} onSelect={onSelect} />);
  await userEvent.click(screen.getByRole('button', { name: /aerius/i }));
  expect(onSelect).toHaveBeenCalledWith(expect.objectContaining({ id: '1' }));
});
```

- [ ] **Step 2: Run the dialog tests to verify they fail**

Run: `npm.cmd test -- src/features/prescriptions/components/DrugMasterDialog.test.tsx`

Expected: FAIL because the dialog component does not exist yet.

- [ ] **Step 3: Implement the reusable dialog**

Create `C:/Users/Minh/Desktop/VDL/src/features/prescriptions/components/DrugMasterDialog.tsx` with:

```tsx
export function DrugMasterDialog({
  open,
  medicines,
  onClose,
  onSelect,
  onCreateMedicine,
}: DrugMasterDialogProps) {
  // search box, result list, quick create CTA
}
```

It should:
- search by display name and active ingredient
- show strength, route, and unit in result rows
- expose a “Them thuoc moi” action without navigating away from the editor

- [ ] **Step 4: Reuse the dialog from the existing medicine manager**

Modify `C:/Users/Minh/Desktop/VDL/src/features/prescriptions/components/MedicineManager.tsx` so it becomes the maintenance form used by `DrugMasterDialog`, instead of a one-off modal that only the current screen knows about.

- [ ] **Step 5: Run the dialog tests**

Run: `npm.cmd test -- src/features/prescriptions/components/DrugMasterDialog.test.tsx`

Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add src/features/prescriptions/components/DrugMasterDialog.tsx src/features/prescriptions/components/DrugMasterDialog.test.tsx src/features/prescriptions/components/MedicineManager.tsx src/stores/prescriptionStore.ts
git commit -m "feat: add reusable drug master dialog"
```

## Task 5: Rebuild The Prescription Editor As A Full-Detail, Keyboard-Friendly Form

**Files:**
- Test: `C:/Users/Minh/Desktop/VDL/src/features/prescriptions/components/PrescriptionForm.test.tsx`
- Modify: `C:/Users/Minh/Desktop/VDL/src/features/prescriptions/components/PrescriptionForm.tsx`
- Modify: `C:/Users/Minh/Desktop/VDL/src/stores/prescriptionStore.ts`
- Modify: `C:/Users/Minh/Desktop/VDL/src/types/medical.ts`

- [ ] **Step 1: Write the failing editor tests**

```tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PrescriptionForm } from './PrescriptionForm';

it('creates a medication row with full item fields', async () => {
  render(<PrescriptionForm residentId="resident-1" />);
  await userEvent.click(screen.getByRole('button', { name: /them thuoc/i }));
  expect(screen.getByLabelText(/ngay bat dau/i)).toBeInTheDocument();
  expect(screen.getByLabelText(/ngay ket thuc/i)).toBeInTheDocument();
  expect(screen.getByLabelText(/dung lien tuc/i)).toBeInTheDocument();
  expect(screen.getByLabelText(/so luong cap/i)).toBeInTheDocument();
});

it('duplicates an existing prescription into a new form state', async () => {
  render(<PrescriptionForm residentId="resident-1" duplicateSource={fixturePrescription} />);
  expect(screen.getByDisplayValue(/rosuvastatin/i)).toBeInTheDocument();
});

it('recomputes administrations per day from the selected schedule', async () => {
  const onSubmit = vi.fn();
  render(<PrescriptionForm residentId="resident-1" onSubmit={onSubmit} />);
  await userEvent.click(screen.getByLabelText(/sang/i));
  await userEvent.click(screen.getByLabelText(/toi/i));
  await userEvent.click(screen.getByRole('button', { name: /luu don/i }));
  expect(onSubmit).toHaveBeenCalledWith(
    expect.objectContaining({
      items: [expect.objectContaining({ administrationsPerDay: 2 })],
    }),
  );
});
```

- [ ] **Step 2: Run the editor tests to verify they fail**

Run: `npm.cmd test -- src/features/prescriptions/components/PrescriptionForm.test.tsx`

Expected: FAIL because the current form does not expose the full item fields or duplicate flow.

- [ ] **Step 3: Rebuild the form around structured rows**

Modify `C:/Users/Minh/Desktop/VDL/src/features/prescriptions/components/PrescriptionForm.tsx` so each medication row includes:

```tsx
<DrugMasterDialog
  open={medicineDialogOpen}
  medicines={medicines}
  onClose={() => setMedicineDialogOpen(false)}
  onSelect={(medicine) => handleSelectMedicine(rowIndex, medicine)}
  onCreateMedicine={handleCreateMedicine}
/>
<input aria-label="Lieu dung" />
<input aria-label="So lan/ngay" />
<fieldset aria-label="Thoi diem uong">
  <input type="checkbox" aria-label="Sang" />
  <input type="checkbox" aria-label="Trua" />
  <input type="checkbox" aria-label="Chieu" />
  <input type="checkbox" aria-label="Toi" />
</fieldset>
<textarea aria-label="Ghi chu dac biet" />
<input type="date" aria-label="Ngay bat dau" />
<input type="date" aria-label="Ngay ket thuc" />
<input type="checkbox" aria-label="Dung lien tuc" />
<input type="number" aria-label="So luong cap" />
```

Use `React Hook Form` field arrays or the existing array state, but keep the row model explicit and tab order stable. Derive `administrationsPerDay` from the schedule when the row changes.

- [ ] **Step 4: Preserve edit and duplicate modes**

The form should support:
- create new prescription
- direct adjustment of an active prescription
- duplicate from an existing prescription into a new draft

Keep the save entry points separate in the UI labels so the user can tell whether they are adjusting or creating.

- [ ] **Step 5: Run the editor tests**

Run: `npm.cmd test -- src/features/prescriptions/components/PrescriptionForm.test.tsx`

Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add src/features/prescriptions/components/PrescriptionForm.tsx src/features/prescriptions/components/PrescriptionForm.test.tsx src/stores/prescriptionStore.ts src/types/medical.ts
git commit -m "feat: rebuild prescription editor"
```

## Task 6: Center The Resident Workspace On Active Prescription Cards And Summary Rows

**Files:**
- Create: `C:/Users/Minh/Desktop/VDL/src/features/prescriptions/components/PrescriptionCard.tsx`
- Test: `C:/Users/Minh/Desktop/VDL/src/features/prescriptions/components/PrescriptionCard.test.tsx`
- Create: `C:/Users/Minh/Desktop/VDL/src/features/prescriptions/components/ActiveMedicationSummary.tsx`
- Test: `C:/Users/Minh/Desktop/VDL/src/features/prescriptions/components/ActiveMedicationSummary.test.tsx`
- Create: `C:/Users/Minh/Desktop/VDL/src/features/prescriptions/components/PrescriptionHistoryDrawer.tsx`
- Test: `C:/Users/Minh/Desktop/VDL/src/features/prescriptions/components/PrescriptionHistoryDrawer.test.tsx`
- Modify: `C:/Users/Minh/Desktop/VDL/src/features/prescriptions/components/PrescriptionList.tsx`
- Modify: `C:/Users/Minh/Desktop/VDL/src/features/prescriptions/components/PrescriptionList.test.tsx`

- [ ] **Step 1: Write the failing card and summary tests**

```tsx
it('shows near-end badges when any line has two or fewer days remaining', () => {
  render(<PrescriptionCard prescription={fixturePrescriptionWithNearEndItem} />);
  expect(screen.getByText(/sap het trong 2 ngay/i)).toBeInTheDocument();
});

it('renders merged active rows grouped by morning, noon, afternoon, and evening', () => {
  render(<ActiveMedicationSummary rows={fixtureRows} />);
  expect(screen.getByText(/buoi sang/i)).toBeInTheDocument();
  expect(screen.getByText(/buoi toi/i)).toBeInTheDocument();
});

it('shows source prescription codes for duplicate medicines', () => {
  render(<ActiveMedicationSummary rows={duplicateMedicineRows} />);
  expect(screen.getAllByText(/dt-001|dt-002/i)).toHaveLength(2);
});
```

- [ ] **Step 2: Run the new component tests to verify they fail**

Run:
- `npm.cmd test -- src/features/prescriptions/components/PrescriptionCard.test.tsx`
- `npm.cmd test -- src/features/prescriptions/components/ActiveMedicationSummary.test.tsx`
- `npm.cmd test -- src/features/prescriptions/components/PrescriptionHistoryDrawer.test.tsx`

Expected: FAIL because the components do not exist yet.

- [ ] **Step 3: Split the current list page into focused components**

Create:
- `PrescriptionCard.tsx` for one active-card surface
- `ActiveMedicationSummary.tsx` for the resident-level merged active-medication section
- `PrescriptionHistoryDrawer.tsx` for snapshot history browsing

Modify `C:/Users/Minh/Desktop/VDL/src/features/prescriptions/components/PrescriptionList.tsx` so the page structure becomes:

```tsx
<ActionBar />
<section aria-label="Don dang dung">
  {activePrescriptions.map((prescription) => (
    <PrescriptionCard
      key={prescription.id}
      prescription={prescription}
      onAdjust={handleOpenEdit}
      onDuplicate={handleDuplicate}
      onPause={handlePause}
      onComplete={handleComplete}
      onPrint={handlePrintSingle}
      onViewHistory={handleOpenHistory}
    />
  ))}
</section>
<ActiveMedicationSummary rows={activeMedicationRows} />
<HistorySection prescriptions={endedOrPausedPrescriptions} />
<PrescriptionHistoryDrawer
  open={historyOpen}
  snapshots={selectedSnapshots}
  onClose={() => setHistoryOpen(false)}
/>
```

- [ ] **Step 4: Keep the page mobile-safe**

Ensure cards stack vertically on narrower widths and action buttons remain tappable. Do not hide critical actions behind hover-only affordances.

- [ ] **Step 5: Run the component and list tests**

Run:
- `npm.cmd test -- src/features/prescriptions/components/PrescriptionCard.test.tsx`
- `npm.cmd test -- src/features/prescriptions/components/ActiveMedicationSummary.test.tsx`
- `npm.cmd test -- src/features/prescriptions/components/PrescriptionHistoryDrawer.test.tsx`
- `npm.cmd test -- src/features/prescriptions/components/PrescriptionList.test.tsx`

Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add src/features/prescriptions/components/PrescriptionCard.tsx src/features/prescriptions/components/PrescriptionCard.test.tsx src/features/prescriptions/components/ActiveMedicationSummary.tsx src/features/prescriptions/components/ActiveMedicationSummary.test.tsx src/features/prescriptions/components/PrescriptionHistoryDrawer.tsx src/features/prescriptions/components/PrescriptionHistoryDrawer.test.tsx src/features/prescriptions/components/PrescriptionList.tsx src/features/prescriptions/components/PrescriptionList.test.tsx
git commit -m "feat: center medication workspace on active cards"
```

## Task 7: Preserve The Clinic Print And Add The Nurse-Facing Aggregated Print

**Files:**
- Create: `C:/Users/Minh/Desktop/VDL/src/features/prescriptions/utils/activeMedicationPrint.ts`
- Test: `C:/Users/Minh/Desktop/VDL/src/features/prescriptions/utils/activeMedicationPrint.test.ts`
- Modify: `C:/Users/Minh/Desktop/VDL/src/features/prescriptions/utils/printTemplates.ts`
- Modify: `C:/Users/Minh/Desktop/VDL/src/features/prescriptions/utils/printTemplates.test.ts`
- Modify: `C:/Users/Minh/Desktop/VDL/src/features/prescriptions/components/PrescriptionList.tsx`

- [ ] **Step 1: Write the failing print tests**

```ts
import { describe, expect, it } from 'vitest';
import { buildActiveMedicationPrintHtml } from './activeMedicationPrint';
import { buildPrescriptionPrintHtml } from './printTemplates';

it('renders the nursing print grouped by time of day with source prescription codes', () => {
  const html = buildActiveMedicationPrintHtml({
    residentName: 'Nguyen Van A',
    rows: duplicateMedicineRows,
  });

  expect(html).toContain('Buoi sang');
  expect(html).toContain('DT-001');
  expect(html).toContain('DT-002');
});

it('keeps the clinic print title as DON THUOC and doctor signature label as BAC SI KHAM BENH', () => {
  const html = buildPrescriptionPrintHtml(fixturePrescription);
  expect(html).toContain('DON THUOC');
  expect(html).toContain('BAC SI KHAM BENH');
});
```

- [ ] **Step 2: Run the print tests to verify they fail**

Run:
- `npm.cmd test -- src/features/prescriptions/utils/activeMedicationPrint.test.ts`
- `npm.cmd test -- src/features/prescriptions/utils/printTemplates.test.ts`

Expected: FAIL because the nurse print module does not exist yet.

- [ ] **Step 3: Implement one print helper per print mode**

Create `C:/Users/Minh/Desktop/VDL/src/features/prescriptions/utils/activeMedicationPrint.ts`:

```ts
export const buildActiveMedicationPrintHtml = ({
  residentName,
  residentCode,
  rows,
}: BuildActiveMedicationPrintOptions) => {
  // grouped morning/noon/afternoon/evening print for nurses
};
```

Keep `C:/Users/Minh/Desktop/VDL/src/features/prescriptions/utils/printTemplates.ts` focused on the family-facing single prescription print only. Do not mix nurse-print layout logic back into the clinic template file.

- [ ] **Step 4: Add explicit UI actions for both print modes**

Modify `C:/Users/Minh/Desktop/VDL/src/features/prescriptions/components/PrescriptionList.tsx` so the page exposes:
- `In don` on each active card for the single clinic document
- `In tong hop thuoc dang dung` at the resident level for nurses

- [ ] **Step 5: Run the print tests**

Run:
- `npm.cmd test -- src/features/prescriptions/utils/activeMedicationPrint.test.ts`
- `npm.cmd test -- src/features/prescriptions/utils/printTemplates.test.ts`
- `npm.cmd test -- src/features/prescriptions/components/PrescriptionList.test.tsx`

Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add src/features/prescriptions/utils/activeMedicationPrint.ts src/features/prescriptions/utils/activeMedicationPrint.test.ts src/features/prescriptions/utils/printTemplates.ts src/features/prescriptions/utils/printTemplates.test.ts src/features/prescriptions/components/PrescriptionList.tsx
git commit -m "feat: add nurse medication print"
```

## Task 8: Full Regression Pass For The Medication Module

**Files:**
- Modify: `C:/Users/Minh/Desktop/VDL/package.json`
- Modify: `C:/Users/Minh/Desktop/VDL/vite.config.ts`

- [ ] **Step 1: Add a medication-focused test script**

Modify `C:/Users/Minh/Desktop/VDL/package.json`:

```json
{
  "scripts": {
    "test:medication": "vitest run src/features/prescriptions"
  }
}
```

- [ ] **Step 2: Keep Vitest from walking worktree mirrors**

Modify `C:/Users/Minh/Desktop/VDL/vite.config.ts`:

```ts
test: {
  exclude: ['**/.worktrees/**', '**/node_modules/**', '**/dist/**'],
}
```

- [ ] **Step 3: Run the focused medication suite**

Run: `npm.cmd run test:medication`

Expected: PASS

- [ ] **Step 4: Run the production build**

Run: `npm.cmd run build`

Expected: PASS

- [ ] **Step 5: Run a targeted manual verification checklist**

Verify in the browser:
1. Open a resident with multiple active prescriptions.
2. Confirm each active card shows `Dieu chinh`, `Nhan ban`, `Tam ngung`, `Ket thuc`, and `In don`.
3. Adjust a prescription and confirm a history version appears.
4. Duplicate a prescription and confirm a new draft opens with cloned items.
5. Print the clinic single prescription and compare against the approved legacy sample.
6. Print the aggregated active-medication sheet and confirm duplicate medicines remain separate with source codes.
7. Confirm near-end warnings appear when an item has `<= 2` remaining days.

- [ ] **Step 6: Commit**

```bash
git add package.json vite.config.ts
git commit -m "test: add medication regression entrypoint"
```

## Execution Notes

- Keep commits small and task-scoped. Do not combine migration, derivation, and UI work into one commit.
- Prefer pure helper tests before touching React surfaces.
- Preserve the current single-prescription print output while introducing the nurse print as a separate utility.
- Do not deduplicate duplicate medicines in the aggregated active-medication layer.
- Keep all date math pinned to `Asia/Saigon` semantics and covered by tests that freeze time.
