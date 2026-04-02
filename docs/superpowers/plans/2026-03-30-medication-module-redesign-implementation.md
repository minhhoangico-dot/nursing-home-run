# Medication Module Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the resident medication module into a doctor-first workspace with an active-medication summary, full-page prescription editing, richer drug autocomplete, and two nurse-friendly print modes.

**Architecture:** Keep resident detail as the entry point, but split medication behavior into focused utilities, route-level editor pages, and smaller workspace components. Move business rules for quantity/day calculations, active summary generation, and print grouping out of UI components so they can be tested directly before wiring the React screens. Extend the Zustand prescription store incrementally so the new workspace can coexist with existing resident-detail integration while route and print flows are upgraded.

**Tech Stack:** React 19, TypeScript, Zustand, Supabase JS, Vite, Vitest, React Testing Library

---

## Planned File Structure

### Test Harness

- Modify: `C:/Users/Minh/Desktop/VDL/.worktrees/medication-module-redesign/package.json`
- Create: `C:/Users/Minh/Desktop/VDL/.worktrees/medication-module-redesign/vitest.config.ts`
- Create: `C:/Users/Minh/Desktop/VDL/.worktrees/medication-module-redesign/src/test/setup.ts`
- Create: `C:/Users/Minh/Desktop/VDL/.worktrees/medication-module-redesign/src/test/renderWithProviders.tsx`

### Domain And Calculation Utilities

- Modify: `C:/Users/Minh/Desktop/VDL/.worktrees/medication-module-redesign/src/types/medical.ts`
- Create: `C:/Users/Minh/Desktop/VDL/.worktrees/medication-module-redesign/src/features/prescriptions/utils/medicationCalculations.ts`
- Create: `C:/Users/Minh/Desktop/VDL/.worktrees/medication-module-redesign/src/features/prescriptions/utils/medicationCalculations.test.ts`
- Create: `C:/Users/Minh/Desktop/VDL/.worktrees/medication-module-redesign/src/features/prescriptions/utils/activeMedicationSummary.ts`
- Create: `C:/Users/Minh/Desktop/VDL/.worktrees/medication-module-redesign/src/features/prescriptions/utils/activeMedicationSummary.test.ts`

### Print Helpers

- Create: `C:/Users/Minh/Desktop/VDL/.worktrees/medication-module-redesign/src/features/prescriptions/utils/buildSinglePrescriptionPrintHtml.ts`
- Create: `C:/Users/Minh/Desktop/VDL/.worktrees/medication-module-redesign/src/features/prescriptions/utils/buildSinglePrescriptionPrintHtml.test.ts`
- Create: `C:/Users/Minh/Desktop/VDL/.worktrees/medication-module-redesign/src/features/prescriptions/utils/buildActiveMedicationPrintHtml.ts`
- Create: `C:/Users/Minh/Desktop/VDL/.worktrees/medication-module-redesign/src/features/prescriptions/utils/buildActiveMedicationPrintHtml.test.ts`
- Modify: `C:/Users/Minh/Desktop/VDL/.worktrees/medication-module-redesign/src/features/prescriptions/utils/printTemplates.ts`

### Store And Data Mapping

- Modify: `C:/Users/Minh/Desktop/VDL/.worktrees/medication-module-redesign/src/stores/prescriptionStore.ts`
- Create: `C:/Users/Minh/Desktop/VDL/.worktrees/medication-module-redesign/src/features/prescriptions/utils/prescriptionMappers.ts`
- Create: `C:/Users/Minh/Desktop/VDL/.worktrees/medication-module-redesign/src/features/prescriptions/utils/prescriptionMappers.test.ts`

### Medication Workspace UI

- Create: `C:/Users/Minh/Desktop/VDL/.worktrees/medication-module-redesign/src/features/prescriptions/components/ActiveMedicationSummaryTable.tsx`
- Create: `C:/Users/Minh/Desktop/VDL/.worktrees/medication-module-redesign/src/features/prescriptions/components/PrescriptionCard.tsx`
- Create: `C:/Users/Minh/Desktop/VDL/.worktrees/medication-module-redesign/src/features/prescriptions/components/PrescriptionWorkspace.test.tsx`
- Modify: `C:/Users/Minh/Desktop/VDL/.worktrees/medication-module-redesign/src/features/prescriptions/components/PrescriptionList.tsx`

### Full-Page Prescription Editor

- Create: `C:/Users/Minh/Desktop/VDL/.worktrees/medication-module-redesign/src/features/prescriptions/pages/PrescriptionEditorPage.tsx`
- Create: `C:/Users/Minh/Desktop/VDL/.worktrees/medication-module-redesign/src/features/prescriptions/components/PrescriptionLineEditor.tsx`
- Create: `C:/Users/Minh/Desktop/VDL/.worktrees/medication-module-redesign/src/features/prescriptions/components/PrescriptionEditorPage.test.tsx`
- Modify: `C:/Users/Minh/Desktop/VDL/.worktrees/medication-module-redesign/src/features/prescriptions/components/PrescriptionForm.tsx`
- Modify: `C:/Users/Minh/Desktop/VDL/.worktrees/medication-module-redesign/src/features/prescriptions/index.ts`
- Modify: `C:/Users/Minh/Desktop/VDL/.worktrees/medication-module-redesign/src/routes/AppRoutes.tsx`

### Catalog UX And Integration

- Modify: `C:/Users/Minh/Desktop/VDL/.worktrees/medication-module-redesign/src/features/prescriptions/components/MedicineManager.tsx`
- Create: `C:/Users/Minh/Desktop/VDL/.worktrees/medication-module-redesign/src/features/prescriptions/components/MedicineAutocomplete.tsx`
- Create: `C:/Users/Minh/Desktop/VDL/.worktrees/medication-module-redesign/src/features/prescriptions/components/MedicineAutocomplete.test.tsx`

## Task 1: Add A Real Test Harness

**Files:**
- Modify: `C:/Users/Minh/Desktop/VDL/.worktrees/medication-module-redesign/package.json`
- Create: `C:/Users/Minh/Desktop/VDL/.worktrees/medication-module-redesign/vitest.config.ts`
- Create: `C:/Users/Minh/Desktop/VDL/.worktrees/medication-module-redesign/src/test/setup.ts`
- Create: `C:/Users/Minh/Desktop/VDL/.worktrees/medication-module-redesign/src/test/renderWithProviders.tsx`

- [ ] **Step 1: Install the missing test dependencies**

Run: `cmd /c npm.cmd install -D vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom`
Expected: install succeeds and `package.json` records the new dev dependencies

- [ ] **Step 2: Add the test scripts**

Update `package.json`:

```json
{
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest"
  }
}
```

- [ ] **Step 3: Add Vitest configuration**

Create `vitest.config.ts`:

```ts
import path from 'path';
import { fileURLToPath } from 'url';
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    css: true,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
});
```

- [ ] **Step 4: Add shared test setup**

Create `src/test/setup.ts`:

```ts
import '@testing-library/jest-dom/vitest';
```

Create `src/test/renderWithProviders.tsx` with a thin wrapper that can render React nodes inside any router/provider shell the medication tests will need.

- [ ] **Step 5: Run the empty test suite**

Run: `cmd /c npm.cmd test`
Expected: no test files found yet, or zero tests with a clean Vitest bootstrap depending on current config

- [ ] **Step 6: Commit**

```bash
git add package.json package-lock.json vitest.config.ts src/test/setup.ts src/test/renderWithProviders.tsx
git commit -m "test: add vitest harness for medication redesign"
```

## Task 2: Make Medication Calculations Explicit

**Files:**
- Modify: `C:/Users/Minh/Desktop/VDL/.worktrees/medication-module-redesign/src/types/medical.ts`
- Create: `C:/Users/Minh/Desktop/VDL/.worktrees/medication-module-redesign/src/features/prescriptions/utils/medicationCalculations.ts`
- Test: `C:/Users/Minh/Desktop/VDL/.worktrees/medication-module-redesign/src/features/prescriptions/utils/medicationCalculations.test.ts`

- [ ] **Step 1: Write the failing calculation tests**

Create `medicationCalculations.test.ts`:

```ts
import { describe, expect, test } from 'vitest';
import {
  calculateDaysSupply,
  calculateQuantityDispensed,
  calculateMedicationEndDate,
} from './medicationCalculations';

describe('calculateQuantityDispensed', () => {
  test('computes quantity from dose per time, times per day, and days supply', () => {
    expect(
      calculateQuantityDispensed({
        dosePerTime: 1,
        timesPerDay: 2,
        daysSupply: 7,
      }),
    ).toBe(14);
  });
});

describe('calculateDaysSupply', () => {
  test('computes days supply from quantity and dose structure', () => {
    expect(
      calculateDaysSupply({
        quantityDispensed: 20,
        dosePerTime: 1,
        timesPerDay: 2,
      }),
    ).toBe(10);
  });
});

describe('calculateMedicationEndDate', () => {
  test('treats the start date as day one', () => {
    expect(
      calculateMedicationEndDate({
        startDate: '2026-03-30',
        daysSupply: 7,
        isContinuous: false,
      }),
    ).toBe('2026-04-05');
  });
});
```

- [ ] **Step 2: Run the tests to verify RED**

Run: `cmd /c npm.cmd test -- src/features/prescriptions/utils/medicationCalculations.test.ts`
Expected: FAIL because the helper file does not exist yet

- [ ] **Step 3: Add the expanded medication types**

Modify `src/types/medical.ts` so `Medicine` and `PrescriptionItem` gain explicit fields used by the approved workflow:

```ts
export type PrescriptionStatus = 'Active' | 'Paused' | 'Completed';

export interface Medicine {
  id: string;
  name: string;
  activeIngredient?: string;
  strength?: string;
  unit: string;
  route?: string;
  drugGroup?: string;
  defaultDosage?: string;
  defaultFrequency?: number;
  price?: number;
}

export interface PrescriptionItem {
  id: string;
  prescriptionId: string;
  medicineId?: string;
  medicineName: string;
  activeIngredientSnapshot?: string;
  strengthSnapshot?: string;
  routeSnapshot?: string;
  dosePerTime?: number;
  doseUnit?: string;
  dosage: string;
  timesPerDay?: number;
  frequency: string;
  timesOfDay: string[];
  quantityDispensed?: number;
  quantity?: number;
  daysSupply?: number;
  startDate?: string;
  endDate?: string;
  isContinuous?: boolean;
  instructions?: string;
  specialInstructions?: string;
}
```

- [ ] **Step 4: Add a backward-compatible status normalizer**

Add this helper alongside the type updates so store work can map legacy `Cancelled` values safely:

```ts
export function normalizePrescriptionStatus(status: string): PrescriptionStatus {
  if (status === 'Cancelled') return 'Paused';
  if (status === 'Completed') return 'Completed';
  return 'Active';
}
```

- [ ] **Step 5: Implement the minimal calculation helpers**

Create `medicationCalculations.ts`:

```ts
type QuantityInput = { dosePerTime?: number; timesPerDay?: number; daysSupply?: number };
type DaysInput = { quantityDispensed?: number; dosePerTime?: number; timesPerDay?: number };
type EndDateInput = { startDate: string; daysSupply?: number; isContinuous?: boolean };

export function calculateQuantityDispensed(input: QuantityInput): number | undefined {
  if (!input.dosePerTime || !input.timesPerDay || !input.daysSupply) return undefined;
  return input.dosePerTime * input.timesPerDay * input.daysSupply;
}

export function calculateDaysSupply(input: DaysInput): number | undefined {
  if (!input.quantityDispensed || !input.dosePerTime || !input.timesPerDay) return undefined;
  const dailyUnits = input.dosePerTime * input.timesPerDay;
  if (!dailyUnits) return undefined;
  return Math.floor(input.quantityDispensed / dailyUnits);
}

export function calculateMedicationEndDate(input: EndDateInput): string | undefined {
  if (input.isContinuous || !input.daysSupply) return undefined;
  const date = new Date(`${input.startDate}T00:00:00`);
  date.setDate(date.getDate() + input.daysSupply - 1);
  return date.toISOString().slice(0, 10);
}
```

- [ ] **Step 6: Run the tests to verify GREEN**

Run: `cmd /c npm.cmd test -- src/features/prescriptions/utils/medicationCalculations.test.ts`
Expected: PASS

- [ ] **Step 7: Commit**

```bash
git add src/types/medical.ts src/features/prescriptions/utils/medicationCalculations.ts src/features/prescriptions/utils/medicationCalculations.test.ts
git commit -m "feat: add medication calculation helpers"
```

## Task 3: Build Active Summary And Print Helpers

**Files:**
- Create: `C:/Users/Minh/Desktop/VDL/.worktrees/medication-module-redesign/src/features/prescriptions/utils/activeMedicationSummary.ts`
- Test: `C:/Users/Minh/Desktop/VDL/.worktrees/medication-module-redesign/src/features/prescriptions/utils/activeMedicationSummary.test.ts`
- Create: `C:/Users/Minh/Desktop/VDL/.worktrees/medication-module-redesign/src/features/prescriptions/utils/buildSinglePrescriptionPrintHtml.ts`
- Test: `C:/Users/Minh/Desktop/VDL/.worktrees/medication-module-redesign/src/features/prescriptions/utils/buildSinglePrescriptionPrintHtml.test.ts`
- Create: `C:/Users/Minh/Desktop/VDL/.worktrees/medication-module-redesign/src/features/prescriptions/utils/buildActiveMedicationPrintHtml.ts`
- Test: `C:/Users/Minh/Desktop/VDL/.worktrees/medication-module-redesign/src/features/prescriptions/utils/buildActiveMedicationPrintHtml.test.ts`
- Modify: `C:/Users/Minh/Desktop/VDL/.worktrees/medication-module-redesign/src/features/prescriptions/utils/printTemplates.ts`

- [ ] **Step 1: Write the failing active-summary tests**

Create `activeMedicationSummary.test.ts`:

```ts
import { describe, expect, test } from 'vitest';
import { buildActiveMedicationRows } from './activeMedicationSummary';

test('keeps same-name medicines from different active prescriptions as separate rows', () => {
  const rows = buildActiveMedicationRows([
    {
      id: 'p1',
      code: 'DT-001',
      residentId: 'r1',
      doctorId: 'u1',
      diagnosis: 'THA',
      prescriptionDate: '2026-03-30',
      startDate: '2026-03-30',
      status: 'Active',
      items: [
        { id: 'i1', prescriptionId: 'p1', medicineName: 'Amlodipin', dosage: '1 viên', frequency: '1 lần/ngày', timesOfDay: ['Sáng'], quantity: 30 },
      ],
    },
    {
      id: 'p2',
      code: 'DT-002',
      residentId: 'r1',
      doctorId: 'u1',
      diagnosis: 'THA',
      prescriptionDate: '2026-03-30',
      startDate: '2026-03-30',
      status: 'Active',
      items: [
        { id: 'i2', prescriptionId: 'p2', medicineName: 'Amlodipin', dosage: '1 viên', frequency: '1 lần/ngày', timesOfDay: ['Tối'], quantity: 30 },
      ],
    },
  ]);

  expect(rows).toHaveLength(2);
  expect(rows.map((row) => row.prescriptionCode)).toEqual(['DT-001', 'DT-002']);
});
```

- [ ] **Step 2: Write the failing print-helper tests**

Create:

- `buildSinglePrescriptionPrintHtml.test.ts`
- `buildActiveMedicationPrintHtml.test.ts`

with assertions that:

- single-prescription print emphasizes medicine name
- active-summary print groups rows into `Sáng / Trưa / Chiều / Tối`
- duplicate same-name rows from different prescriptions are preserved in print output

- [ ] **Step 3: Run tests to verify RED**

Run:

```bash
cmd /c npm.cmd test -- src/features/prescriptions/utils/activeMedicationSummary.test.ts src/features/prescriptions/utils/buildSinglePrescriptionPrintHtml.test.ts src/features/prescriptions/utils/buildActiveMedicationPrintHtml.test.ts
```

Expected: FAIL because helper modules do not exist yet

- [ ] **Step 4: Implement the active-summary builder**

Create `activeMedicationSummary.ts`:

```ts
import { Prescription } from '@/src/types/medical';

export interface ActiveMedicationRow {
  itemId: string;
  prescriptionId: string;
  prescriptionCode: string;
  medicineName: string;
  dosage: string;
  timesOfDay: string[];
  instructions?: string;
  startDate?: string;
  endDate?: string;
  isContinuous?: boolean;
}

export function buildActiveMedicationRows(prescriptions: Prescription[], today = new Date()): ActiveMedicationRow[] {
  const todayIso = today.toISOString().slice(0, 10);
  return prescriptions
    .filter((prescription) => prescription.status === 'Active')
    .flatMap((prescription) =>
      (prescription.items ?? [])
        .filter((item) => item.isContinuous || !item.endDate || item.endDate >= todayIso)
        .map((item) => ({
          itemId: item.id,
          prescriptionId: prescription.id,
          prescriptionCode: prescription.code,
          medicineName: item.medicineName,
          dosage: item.dosage,
          timesOfDay: item.timesOfDay ?? [],
          instructions: item.specialInstructions || item.instructions,
          startDate: item.startDate || prescription.startDate,
          endDate: item.endDate || prescription.endDate,
          isContinuous: item.isContinuous,
        })),
    );
}
```

- [ ] **Step 5: Implement the two print HTML builders**

Create separate helpers that return HTML strings only, then keep `printTemplates.ts` as a thin `window.open(...); document.write(...)` wrapper:

- `buildSinglePrescriptionPrintHtml.ts`
- `buildActiveMedicationPrintHtml.ts`

The active print helper must group into four sections:

```ts
const PERIODS = ['Sáng', 'Trưa', 'Chiều', 'Tối'] as const;
```

and keep same-name medicines from different prescriptions on distinct lines with the source prescription visible in supporting text.

- [ ] **Step 6: Run tests to verify GREEN**

Run:

```bash
cmd /c npm.cmd test -- src/features/prescriptions/utils/activeMedicationSummary.test.ts src/features/prescriptions/utils/buildSinglePrescriptionPrintHtml.test.ts src/features/prescriptions/utils/buildActiveMedicationPrintHtml.test.ts
```

Expected: PASS

- [ ] **Step 7: Commit**

```bash
git add src/features/prescriptions/utils/activeMedicationSummary.ts src/features/prescriptions/utils/activeMedicationSummary.test.ts src/features/prescriptions/utils/buildSinglePrescriptionPrintHtml.ts src/features/prescriptions/utils/buildSinglePrescriptionPrintHtml.test.ts src/features/prescriptions/utils/buildActiveMedicationPrintHtml.ts src/features/prescriptions/utils/buildActiveMedicationPrintHtml.test.ts src/features/prescriptions/utils/printTemplates.ts
git commit -m "feat: add medication summary and print helpers"
```

## Task 4: Refactor The Prescription Store And Mappers

**Files:**
- Modify: `C:/Users/Minh/Desktop/VDL/.worktrees/medication-module-redesign/src/stores/prescriptionStore.ts`
- Create: `C:/Users/Minh/Desktop/VDL/.worktrees/medication-module-redesign/src/features/prescriptions/utils/prescriptionMappers.ts`
- Test: `C:/Users/Minh/Desktop/VDL/.worktrees/medication-module-redesign/src/features/prescriptions/utils/prescriptionMappers.test.ts`

- [ ] **Step 1: Write the failing mapper tests**

Create `prescriptionMappers.test.ts`:

```ts
import { describe, expect, test } from 'vitest';
import { mapPrescriptionRow, mapMedicineRow } from './prescriptionMappers';

test('maps medicine metadata needed by autocomplete secondary lines', () => {
  const result = mapMedicineRow({
    id: 'm1',
    name: 'Amlodipin',
    active_ingredient: 'Amlodipine',
    strength: '5mg',
    route: 'Uống',
    unit: 'viên',
    drug_group: 'Tim mạch',
    default_dosage: '1 viên',
    default_frequency: 1,
    price: 1000,
  });

  expect(result.strength).toBe('5mg');
  expect(result.route).toBe('Uống');
});
```

- [ ] **Step 2: Run tests to verify RED**

Run: `cmd /c npm.cmd test -- src/features/prescriptions/utils/prescriptionMappers.test.ts`
Expected: FAIL because mapper file does not exist yet

- [ ] **Step 3: Implement focused mapper helpers**

Create `prescriptionMappers.ts`:

```ts
import { Medicine, Prescription } from '@/src/types/medical';

export function mapMedicineRow(row: any): Medicine {
  return {
    id: row.id,
    name: row.name,
    activeIngredient: row.active_ingredient,
    strength: row.strength,
    unit: row.unit,
    route: row.route,
    drugGroup: row.drug_group,
    defaultDosage: row.default_dosage,
    defaultFrequency: row.default_frequency,
    price: row.price,
  };
}

export function mapPrescriptionRow(row: any): Prescription {
  return {
    id: row.id,
    code: row.code,
    residentId: row.resident_id,
    doctorId: row.doctor_id,
    doctorName: row.doctor_name,
    diagnosis: row.diagnosis,
    prescriptionDate: row.prescription_date,
    startDate: row.start_date,
    endDate: row.end_date,
    status: row.status,
    notes: row.notes,
    items: (row.items ?? []).map((item: any) => ({
      id: item.id,
      prescriptionId: item.prescription_id,
      medicineId: item.medicine_id,
      medicineName: item.medicine_name,
      activeIngredientSnapshot: item.active_ingredient_snapshot,
      strengthSnapshot: item.strength_snapshot,
      routeSnapshot: item.route_snapshot,
      dosePerTime: item.dose_per_time,
      doseUnit: item.dose_unit,
      dosage: item.dosage,
      timesPerDay: item.times_per_day,
      frequency: item.frequency,
      timesOfDay: item.times_of_day ?? [],
      quantityDispensed: item.quantity_dispensed ?? item.quantity,
      quantity: item.quantity,
      daysSupply: item.days_supply,
      startDate: item.start_date,
      endDate: item.end_date,
      isContinuous: item.is_continuous,
      instructions: item.instructions,
      specialInstructions: item.special_instructions,
    })),
  };
}
```

- [ ] **Step 4: Expand the store API**

Modify `prescriptionStore.ts` to add:

- `updatePrescription`
- `duplicatePrescription`
- `pausePrescription`
- `getResidentActiveMedicationRows`
- richer medicine mapping via `mapMedicineRow`

When mapping persisted prescriptions, always normalize statuses so legacy DB rows still behave correctly:

- DB `Active` => UI `Active`
- DB `Cancelled` => UI `Paused`
- DB `Paused` => UI `Paused`
- DB `Completed` => UI `Completed`

Keep the store action names small and explicit. Use `buildActiveMedicationRows()` instead of reimplementing summary logic in React components.

- [ ] **Step 5: Run the mapper tests and build**

Run:

```bash
cmd /c npm.cmd test -- src/features/prescriptions/utils/prescriptionMappers.test.ts
cmd /c npm.cmd run build
```

Expected: tests PASS and build PASS

- [ ] **Step 6: Commit**

```bash
git add src/stores/prescriptionStore.ts src/features/prescriptions/utils/prescriptionMappers.ts src/features/prescriptions/utils/prescriptionMappers.test.ts
git commit -m "feat: expand prescription store for medication workspace"
```

## Task 5: Build The Full-Page Prescription Editor

**Files:**
- Create: `C:/Users/Minh/Desktop/VDL/.worktrees/medication-module-redesign/src/features/prescriptions/pages/PrescriptionEditorPage.tsx`
- Create: `C:/Users/Minh/Desktop/VDL/.worktrees/medication-module-redesign/src/features/prescriptions/components/PrescriptionLineEditor.tsx`
- Create: `C:/Users/Minh/Desktop/VDL/.worktrees/medication-module-redesign/src/features/prescriptions/components/PrescriptionEditorPage.test.tsx`
- Modify: `C:/Users/Minh/Desktop/VDL/.worktrees/medication-module-redesign/src/features/prescriptions/components/PrescriptionForm.tsx`
- Modify: `C:/Users/Minh/Desktop/VDL/.worktrees/medication-module-redesign/src/features/prescriptions/index.ts`
- Modify: `C:/Users/Minh/Desktop/VDL/.worktrees/medication-module-redesign/src/routes/AppRoutes.tsx`

- [ ] **Step 1: Write the failing editor page tests**

Create `PrescriptionEditorPage.test.tsx`:

```tsx
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { render, screen } from '@testing-library/react';
import { PrescriptionEditorPage } from '../pages/PrescriptionEditorPage';

test('renders a full-page prescription editor with resident context and medication rows', () => {
  render(
    <MemoryRouter initialEntries={['/residents/R1/medications/new']}>
      <Routes>
        <Route path="/residents/:residentId/medications/new" element={<PrescriptionEditorPage />} />
      </Routes>
    </MemoryRouter>,
  );

  expect(screen.getByText(/Kê đơn thuốc/i)).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /Thêm dòng thuốc/i })).toBeInTheDocument();
});
```

- [ ] **Step 2: Run the test to verify RED**

Run: `cmd /c npm.cmd test -- src/features/prescriptions/components/PrescriptionEditorPage.test.tsx`
Expected: FAIL because the editor page does not exist yet

- [ ] **Step 3: Implement the editor shell and line editor**

Create:

- `PrescriptionEditorPage.tsx`
- `PrescriptionLineEditor.tsx`

Use a page layout with:

- resident context header
- medication rows
- sticky action footer

Use `medicationCalculations.ts` for the quantity/day linkage instead of duplicating math in the component.

- [ ] **Step 4: Extend the editor test for duplicate-save transitions**

Add one more test to `PrescriptionEditorPage.test.tsx`:

```tsx
test('duplicate mode prompts to end, pause, or keep the previous prescription active on save', async () => {
  // Render duplicate mode with an existing prescription in state.
  // Save the duplicated draft.
  // Assert transition choices are shown.
});
```

- [ ] **Step 5: Run the editor tests to verify the new duplicate workflow stays RED**

Run: `cmd /c npm.cmd test -- src/features/prescriptions/components/PrescriptionEditorPage.test.tsx`
Expected: FAIL because duplicate-save transition choices are not implemented yet

- [ ] **Step 6: Implement the duplicate-to-new save contract**

In duplicate mode, saving must:

1. create a new prescription draft from the selected source prescription
2. save the new prescription as a new record
3. immediately ask whether to:
   - `Kết thúc đơn cũ`
   - `Tạm ngưng đơn cũ`
   - `Giữ cả hai đơn đang dùng`

Wire each choice to the store so the previous prescription state transition is explicit, not invented ad hoc later.

- [ ] **Step 7: Rewire the old modal entry point**

Reduce `PrescriptionForm.tsx` to either:

- a compatibility wrapper that redirects to the page route
- or a small adapter component if other parts still import it

Update `src/features/prescriptions/index.ts` and `src/routes/AppRoutes.tsx` to expose:

- `/residents/:residentId/medications/new`
- `/residents/:residentId/medications/:prescriptionId/edit`
- `/residents/:residentId/medications/:prescriptionId/duplicate`

- [ ] **Step 8: Run the editor test and build**

Run:

```bash
cmd /c npm.cmd test -- src/features/prescriptions/components/PrescriptionEditorPage.test.tsx
cmd /c npm.cmd run build
```

Expected: PASS

- [ ] **Step 9: Commit**

```bash
git add src/features/prescriptions/pages/PrescriptionEditorPage.tsx src/features/prescriptions/components/PrescriptionLineEditor.tsx src/features/prescriptions/components/PrescriptionEditorPage.test.tsx src/features/prescriptions/components/PrescriptionForm.tsx src/features/prescriptions/index.ts src/routes/AppRoutes.tsx
git commit -m "feat: add full-page prescription editor"
```

## Task 6: Rebuild The Medication Workspace In Resident Detail

**Files:**
- Create: `C:/Users/Minh/Desktop/VDL/.worktrees/medication-module-redesign/src/features/prescriptions/components/ActiveMedicationSummaryTable.tsx`
- Create: `C:/Users/Minh/Desktop/VDL/.worktrees/medication-module-redesign/src/features/prescriptions/components/PrescriptionCard.tsx`
- Test: `C:/Users/Minh/Desktop/VDL/.worktrees/medication-module-redesign/src/features/prescriptions/components/PrescriptionWorkspace.test.tsx`
- Modify: `C:/Users/Minh/Desktop/VDL/.worktrees/medication-module-redesign/src/features/prescriptions/components/PrescriptionList.tsx`

- [ ] **Step 1: Write the failing workspace test**

Create `PrescriptionWorkspace.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';
import { PrescriptionList } from './PrescriptionList';

test('renders the active medication summary above prescription cards', () => {
  render(
    <PrescriptionList
      user={{ id: 'u1', name: 'BS A', role: 'DOCTOR' } as any}
      resident={{ id: 'r1', name: 'Lan', room: '202', bed: 'A', floor: '2', building: 'A' } as any}
      onUpdate={() => {}}
    />,
  );

  expect(screen.getByText(/Thuốc đang dùng/i)).toBeInTheDocument();
  expect(screen.getByText(/Lịch sử đơn thuốc/i)).toBeInTheDocument();
});
```

- [ ] **Step 2: Run the test to verify RED**

Run: `cmd /c npm.cmd test -- src/features/prescriptions/components/PrescriptionWorkspace.test.tsx`
Expected: FAIL or incomplete render because the current component does not expose the redesigned structure cleanly

- [ ] **Step 3: Implement focused workspace components**

Create:

- `ActiveMedicationSummaryTable.tsx`
- `PrescriptionCard.tsx`

Then refactor `PrescriptionList.tsx` to become an orchestration shell:

- fetch prescriptions and medicine catalog
- compute summary rows via the store/helper
- render the top action bar with:
  - `Kê đơn mới`
  - `In tổng hợp thuốc đang dùng`
  - `Danh mục thuốc`
- render summary table first
- render active prescription cards second
- render history last

- [ ] **Step 4: Wire the action bar**

In `PrescriptionList.tsx`:

- `Kê đơn mới` should navigate to `/residents/:residentId/medications/new`
- `In tổng hợp thuốc đang dùng` should call the new active-summary print helper
- `Danh mục thuốc` should open the refactored medicine manager

- [ ] **Step 5: Replace old modal-based card actions with navigation actions**

In `PrescriptionList.tsx`:

- `Sửa` should navigate to `/residents/:residentId/medications/:prescriptionId/edit`
- `Nhân bản` should navigate to `/residents/:residentId/medications/:prescriptionId/duplicate`

- [ ] **Step 6: Run the workspace test and build**

Run:

```bash
cmd /c npm.cmd test -- src/features/prescriptions/components/PrescriptionWorkspace.test.tsx
cmd /c npm.cmd run build
```

Expected: PASS

- [ ] **Step 7: Commit**

```bash
git add src/features/prescriptions/components/ActiveMedicationSummaryTable.tsx src/features/prescriptions/components/PrescriptionCard.tsx src/features/prescriptions/components/PrescriptionWorkspace.test.tsx src/features/prescriptions/components/PrescriptionList.tsx
git commit -m "feat: redesign resident medication workspace"
```

## Task 7: Upgrade Drug Master List UX And Quick Add

**Files:**
- Modify: `C:/Users/Minh/Desktop/VDL/.worktrees/medication-module-redesign/src/features/prescriptions/components/MedicineManager.tsx`
- Create: `C:/Users/Minh/Desktop/VDL/.worktrees/medication-module-redesign/src/features/prescriptions/components/MedicineAutocomplete.tsx`
- Test: `C:/Users/Minh/Desktop/VDL/.worktrees/medication-module-redesign/src/features/prescriptions/components/MedicineAutocomplete.test.tsx`

- [ ] **Step 1: Write the failing autocomplete test**

Create `MedicineAutocomplete.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MedicineAutocomplete } from './MedicineAutocomplete';

test('matches medicines by active ingredient and shows a secondary metadata line', async () => {
  const user = userEvent.setup();
  render(
    <MedicineAutocomplete
      medicines={[
        {
          id: 'm1',
          name: 'Amlodipin',
          activeIngredient: 'Amlodipine',
          strength: '5mg',
          route: 'Uống',
          unit: 'viên',
        },
      ]}
      value=""
      onSelect={() => {}}
    />,
  );

  await user.type(screen.getByRole('textbox'), 'Amlodipine');
  expect(screen.getByText('Amlodipin')).toBeInTheDocument();
  expect(screen.getByText(/5mg/i)).toBeInTheDocument();
});
```

- [ ] **Step 2: Run the test to verify RED**

Run: `cmd /c npm.cmd test -- src/features/prescriptions/components/MedicineAutocomplete.test.tsx`
Expected: FAIL because the component does not exist yet

- [ ] **Step 3: Implement the autocomplete component**

Create `MedicineAutocomplete.tsx` that:

- filters by `name` and `activeIngredient`
- renders medicine name on the main line
- renders strength, active ingredient, and route on the second line
- supports keyboard selection of the first item

- [ ] **Step 4: Refactor the medicine manager**

Update `MedicineManager.tsx` to support the richer medicine fields:

- `strength`
- `route`
- `drugGroup`
- optional default hints

Keep the manager usable both from settings and from the editor quick-add flow.

- [ ] **Step 5: Run the test and build**

Run:

```bash
cmd /c npm.cmd test -- src/features/prescriptions/components/MedicineAutocomplete.test.tsx
cmd /c npm.cmd run build
```

Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add src/features/prescriptions/components/MedicineManager.tsx src/features/prescriptions/components/MedicineAutocomplete.tsx src/features/prescriptions/components/MedicineAutocomplete.test.tsx
git commit -m "feat: upgrade medication catalog autocomplete"
```

## Task 8: Final Integrated Verification

**Files:**
- Verify only

- [ ] **Step 1: Run the focused medication test suite**

Run:

```bash
cmd /c npm.cmd test -- src/features/prescriptions/utils/medicationCalculations.test.ts src/features/prescriptions/utils/activeMedicationSummary.test.ts src/features/prescriptions/utils/buildSinglePrescriptionPrintHtml.test.ts src/features/prescriptions/utils/buildActiveMedicationPrintHtml.test.ts src/features/prescriptions/utils/prescriptionMappers.test.ts src/features/prescriptions/components/PrescriptionEditorPage.test.tsx src/features/prescriptions/components/PrescriptionWorkspace.test.tsx src/features/prescriptions/components/MedicineAutocomplete.test.tsx
```

Expected: all medication redesign tests PASS

- [ ] **Step 2: Run the production build**

Run: `cmd /c npm.cmd run build`
Expected: PASS with exit code 0

- [ ] **Step 3: Manual local smoke check**

Run: `cmd /c npm.cmd run dev -- --host 127.0.0.1 --port 5173`

Verify:

- resident detail `Thuốc` tab loads
- active summary appears above prescription cards
- `Kê đơn mới` opens the new route
- single prescription print opens
- active summary print opens

- [ ] **Step 4: Commit final integration**

```bash
git add -A
git commit -m "feat: implement medication module redesign"
```
