# Resident Fixed Services Finance Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Store fixed room, meal, and care services per resident, require those selections during admission, and use them in resident finance, monthly billing, and invoice preview.

**Architecture:** Add a `ResidentFixedServiceAssignment` model persisted through the finance service and loaded by `useFinanceStore`. Keep `service_usage` for one-off charges. Put matching, validation, and billing math in focused finance utilities so admission, resident finance, and monthly billing use the same behavior.

**Tech Stack:** React 19, TypeScript, Zustand, Supabase client, Vitest, React Testing Library.

---

## File Structure

- Create `src/features/finance/utils/fixedServiceAssignments.ts`
  - Pure helpers for creating assignment snapshots, validating required fixed categories, choosing defaults from catalog rows, and calculating fixed package totals.
- Create `src/features/finance/utils/fixedServiceAssignments.test.ts`
  - Unit tests for the helper rules.
- Modify `src/types/finance.ts`
  - Add `ResidentFixedServiceAssignment`, `FixedServiceCategory`, and validation warning types if needed.
- Modify `src/services/financeService.ts`
  - Add Supabase mappers and methods for `resident_fixed_services`.
- Modify `src/services/financeService.test.ts`
  - Test fixed-service persistence mapping.
- Modify `src/stores/financeStore.ts`
  - Load and update resident fixed-service assignments alongside existing finance state.
- Create or modify `src/stores/financeStore.test.ts`
  - Test store fetch and replace behavior.
- Create `supabase/migrations/20260430_create_resident_fixed_services.sql`
  - Add the table and demo-friendly public policy.
- Modify `src/features/residents/components/AdmissionWizard.tsx`
  - Add fixed-service selections and validation.
- Modify or create `src/features/residents/components/AdmissionWizard.test.tsx`
  - Cover admission validation and assignment save payload.
- Modify `src/features/residents/pages/ResidentListPage.tsx`
  - Load finance catalog and save resident assignments after resident creation.
- Modify `src/features/residents/components/ResidentFinanceTab.tsx`
  - Render assigned fixed services and allow finance users to adjust them.
- Modify `src/features/residents/components/ResidentFinanceTab.test.tsx`
  - Cover assigned fixed rows, required-category removal guard, and replacement.
- Modify `src/features/residents/components/ResidentDetail.tsx`
  - Pass fixed-service assignments into the finance tab.
- Modify `src/features/residents/pages/ResidentDetailPage.tsx`
  - Provide assignments and update callbacks from `useFinanceStore`.
- Modify `src/features/finance/utils/calculateMonthlyBilling.ts`
  - Calculate fixed costs from resident assignments.
- Create or modify `src/features/finance/utils/calculateMonthlyBilling.test.ts`
  - Prove `INITIAL_PRICES` is no longer used for fixed fees.
- Modify `src/features/finance/components/MonthlyBillingConfig.tsx`
  - Use resident assignments and show missing fixed-package warnings.
- Modify `src/features/finance/pages/FinancePage.tsx`
  - Pass assignments into monthly billing and invoice preview.
- Modify `src/features/finance/components/InvoicePreview.tsx`
  - Keep receiving fixed cost rows, but support assignment-derived labels and optional warning copy.

---

### Task 1: Fixed-Service Types And Pure Helpers

**Files:**
- Modify: `src/types/finance.ts`
- Create: `src/features/finance/utils/fixedServiceAssignments.ts`
- Create: `src/features/finance/utils/fixedServiceAssignments.test.ts`

- [ ] **Step 1: Write failing helper tests**

Add tests for:

```ts
import { describe, expect, it } from 'vitest';
import {
  createFixedServiceAssignment,
  getMissingRequiredFixedCategories,
  suggestDefaultFixedServices,
  calculateFixedServiceTotal,
} from './fixedServiceAssignments';

it('snapshots catalog price and name into an assignment', () => {
  const assignment = createFixedServiceAssignment({
    residentId: 'RES-1',
    service: { id: 'ROOM_2', name: 'Phong 2 nguoi', category: 'ROOM', price: 4500000, unit: 'Thang', billingType: 'FIXED' },
    effectiveFrom: '2026-04-30',
  });

  expect(assignment).toMatchObject({
    residentId: 'RES-1',
    serviceId: 'ROOM_2',
    serviceName: 'Phong 2 nguoi',
    category: 'ROOM',
    unitPrice: 4500000,
    quantity: 1,
    totalAmount: 4500000,
    status: 'Active',
  });
});

it('reports missing ROOM, MEAL, and CARE assignments', () => {
  expect(getMissingRequiredFixedCategories([])).toEqual(['ROOM', 'MEAL', 'CARE']);
});

it('suggests room, care, and standard meal defaults from resident data', () => {
  const suggestions = suggestDefaultFixedServices({
    residentId: 'RES-1',
    roomType: '2 Giuong',
    careLevel: 2,
    servicePrices: catalogFixture,
    effectiveFrom: '2026-04-30',
  });

  expect(suggestions.map((item) => item.category).sort()).toEqual(['CARE', 'MEAL', 'ROOM']);
});

it('sums active fixed assignments only', () => {
  expect(calculateFixedServiceTotal(assignmentsFixture)).toBe(8900000);
});
```

- [ ] **Step 2: Run helper tests to verify RED**

Run: `npx vitest run src/features/finance/utils/fixedServiceAssignments.test.ts`

Expected: FAIL because `fixedServiceAssignments.ts` does not exist.

- [ ] **Step 3: Add minimal types and helper implementation**

Add to `src/types/finance.ts`:

```ts
export type FixedServiceCategory = 'ROOM' | 'MEAL' | 'CARE';

export interface ResidentFixedServiceAssignment {
  id: string;
  residentId: string;
  serviceId: string;
  serviceName: string;
  category: ServicePrice['category'];
  unitPrice: number;
  quantity: number;
  totalAmount: number;
  effectiveFrom: string;
  status: 'Active' | 'Inactive';
}
```

Implement helpers in `fixedServiceAssignments.ts` using normalized string matching. Keep the required categories as `ROOM`, `MEAL`, and `CARE`, but allow optional fixed rows with category `OTHER`.

- [ ] **Step 4: Run helper tests to verify GREEN**

Run: `npx vitest run src/features/finance/utils/fixedServiceAssignments.test.ts`

Expected: PASS.

- [ ] **Step 5: Commit**

Run:

```bash
git add src/types/finance.ts src/features/finance/utils/fixedServiceAssignments.ts src/features/finance/utils/fixedServiceAssignments.test.ts
git commit -m "feat: add resident fixed service helpers"
```

---

### Task 2: Supabase Persistence And Finance Store

**Files:**
- Create: `supabase/migrations/20260430_create_resident_fixed_services.sql`
- Modify: `src/services/financeService.ts`
- Modify: `src/services/financeService.test.ts`
- Modify: `src/stores/financeStore.ts`
- Create: `src/stores/financeStore.test.ts`

- [ ] **Step 1: Write failing service tests**

Add `financeService` tests for:

```ts
it('maps resident fixed services from Supabase rows', async () => {
  // mock resident_fixed_services select().order()
  const assignments = await financeService.getResidentFixedServices();
  expect(assignments[0]).toMatchObject({
    residentId: 'RES-1',
    serviceId: 'ROOM_2',
    serviceName: 'Phong 2 nguoi',
    unitPrice: 4500000,
    totalAmount: 4500000,
    status: 'Active',
  });
});

it('replaces resident fixed services with snapshot rows', async () => {
  await financeService.replaceResidentFixedServices('RES-1', assignmentRows);
  expect(deleteEq).toHaveBeenCalledWith('resident_id', 'RES-1');
  expect(upsert).toHaveBeenCalledWith(expect.arrayContaining([
    expect.objectContaining({ resident_id: 'RES-1', service_id: 'ROOM_2' }),
  ]));
});
```

- [ ] **Step 2: Write failing store tests**

Create tests proving:

```ts
it('loads fixed service assignments with finance data', async () => {
  await useFinanceStore.getState().fetchFinanceData();
  expect(useFinanceStore.getState().residentFixedServices).toHaveLength(3);
});

it('replaces assignments for one resident without touching other residents', async () => {
  await useFinanceStore.getState().replaceResidentFixedServices('RES-1', nextRows);
  expect(useFinanceStore.getState().residentFixedServices).toEqual(expect.arrayContaining(nextRows));
});
```

- [ ] **Step 3: Run service and store tests to verify RED**

Run: `npx vitest run src/services/financeService.test.ts src/stores/financeStore.test.ts`

Expected: FAIL because fixed-service methods and store state do not exist.

- [ ] **Step 4: Add migration**

Create table:

```sql
CREATE TABLE IF NOT EXISTS public.resident_fixed_services (
  id text PRIMARY KEY,
  resident_id text NOT NULL REFERENCES public.residents(id) ON DELETE CASCADE,
  service_id text NOT NULL,
  service_name text NOT NULL,
  category text NOT NULL CHECK (category IN ('ROOM', 'MEAL', 'CARE', 'OTHER')),
  unit_price numeric NOT NULL DEFAULT 0,
  quantity numeric NOT NULL DEFAULT 1,
  total_amount numeric NOT NULL DEFAULT 0,
  effective_from date NOT NULL DEFAULT CURRENT_DATE,
  status text NOT NULL DEFAULT 'Active' CHECK (status IN ('Active', 'Inactive')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.resident_fixed_services ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public access resident fixed services"
  ON public.resident_fixed_services FOR ALL TO public
  USING (true)
  WITH CHECK (true);
```

- [ ] **Step 5: Implement service methods**

Add to `financeService`:

```ts
getResidentFixedServices: async (): Promise<ResidentFixedServiceAssignment[]> => { ... }
replaceResidentFixedServices: async (residentId: string, assignments: ResidentFixedServiceAssignment[]) => { ... }
```

Use `delete().eq('resident_id', residentId)` before `upsert(assignments.map(toDbRow))`.

- [ ] **Step 6: Implement store state and actions**

Add `residentFixedServices`, load it in `fetchFinanceData`, and add `replaceResidentFixedServices(residentId, assignments)`.

- [ ] **Step 7: Run tests to verify GREEN**

Run: `npx vitest run src/services/financeService.test.ts src/stores/financeStore.test.ts`

Expected: PASS.

- [ ] **Step 8: Commit**

Run:

```bash
git add supabase/migrations/20260430_create_resident_fixed_services.sql src/services/financeService.ts src/services/financeService.test.ts src/stores/financeStore.ts src/stores/financeStore.test.ts
git commit -m "feat: persist resident fixed services"
```

---

### Task 3: Admission Wizard Fixed-Service Selection

**Files:**
- Modify: `src/features/residents/components/AdmissionWizard.tsx`
- Create or modify: `src/features/residents/components/AdmissionWizard.test.tsx`
- Modify: `src/features/residents/pages/ResidentListPage.tsx`

- [ ] **Step 1: Write failing admission tests**

Test behavior:

```ts
it('blocks saving when required fixed service categories are missing', async () => {
  render(<AdmissionWizard servicePrices={[]} onSave={onSave} onCancel={() => {}} />);
  // fill required admission fields and go to final step
  await user.click(screen.getByRole('button', { name: /Luu khong tai/i }));
  expect(await screen.findByText(/chua chon du dich vu co dinh/i)).toBeInTheDocument();
  expect(onSave).not.toHaveBeenCalled();
});

it('passes fixed service assignments when admission is saved', async () => {
  render(<AdmissionWizard servicePrices={catalogFixture} onSave={onSave} onCancel={() => {}} />);
  // accept defaults, fill required fields, save
  expect(onSave).toHaveBeenCalledWith(
    expect.objectContaining({ id: expect.any(String) }),
    expect.arrayContaining([
      expect.objectContaining({ category: 'ROOM' }),
      expect.objectContaining({ category: 'MEAL' }),
      expect.objectContaining({ category: 'CARE' }),
    ]),
  );
});
```

- [ ] **Step 2: Run admission tests to verify RED**

Run: `npx vitest run src/features/residents/components/AdmissionWizard.test.tsx`

Expected: FAIL because the wizard has no fixed-service props or validation.

- [ ] **Step 3: Update AdmissionWizard props and defaults**

Change `onSave` signature to:

```ts
onSave: (
  data: Partial<Resident>,
  fixedServices: ResidentFixedServiceAssignment[],
) => Promise<void> | void;
servicePrices?: ServicePrice[];
```

Use `suggestDefaultFixedServices` after room/care changes and keep selected ids in local state.

- [ ] **Step 4: Add compact UI selection block**

Place it near Step 3 or Step 4 so users can see the financial package before saving. Render one select each for `ROOM`, `MEAL`, and `CARE`, filtered to `billingType === 'FIXED'`. Show unit price next to each selected row.

- [ ] **Step 5: Validate before final submit**

Before calling `onSave`, build assignments and call `getMissingRequiredFixedCategories`. If any category is missing, toast a Vietnamese error and stay in the wizard.

- [ ] **Step 6: Wire ResidentListPage to finance store**

Load finance data with `useDeferredStoreLoad(fetchFinanceData, isLoaded)` if not already loaded. In `handleAddResident`, call:

```ts
await addResident(data);
await replaceResidentFixedServices(data.id, fixedServices);
```

Close the wizard only after both calls succeed.

- [ ] **Step 7: Run admission tests to verify GREEN**

Run: `npx vitest run src/features/residents/components/AdmissionWizard.test.tsx src/features/residents/pages/ResidentListPage.test.tsx`

Expected: PASS.

- [ ] **Step 8: Commit**

Run:

```bash
git add src/features/residents/components/AdmissionWizard.tsx src/features/residents/components/AdmissionWizard.test.tsx src/features/residents/pages/ResidentListPage.tsx src/features/residents/pages/ResidentListPage.test.tsx
git commit -m "feat: require fixed services during admission"
```

---

### Task 4: Resident Finance Fixed-Service Editing

**Files:**
- Modify: `src/features/residents/components/ResidentFinanceTab.tsx`
- Modify: `src/features/residents/components/ResidentFinanceTab.test.tsx`
- Modify: `src/features/residents/components/ResidentDetail.tsx`
- Modify: `src/features/residents/pages/ResidentDetailPage.tsx`
- Modify: `src/features/residents/pages/ResidentDetailPage.test.tsx`

- [ ] **Step 1: Write failing finance tab tests**

Add tests:

```ts
it('renders assigned fixed services instead of estimated rows', () => {
  render(<ResidentFinanceTab fixedServices={assignmentFixture} servicePrices={catalogFixture} ... />);
  expect(screen.getByText('Phong 2 nguoi')).toBeInTheDocument();
  expect(screen.queryByText(/Gia tam tinh/i)).not.toBeInTheDocument();
});

it('prevents removing the last required fixed service category', async () => {
  render(<ResidentFinanceTab fixedServices={requiredOnlyFixture} ... />);
  await user.click(screen.getByLabelText('remove-fixed-service-ROOM_2'));
  expect(onReplaceFixedServices).not.toHaveBeenCalled();
  expect(screen.getByText(/khong the xoa dich vu bat buoc/i)).toBeInTheDocument();
});

it('replaces a fixed service with a catalog snapshot', async () => {
  await user.selectOptions(screen.getByLabelText(/Dich vu phong o/i), 'ROOM_1');
  expect(onReplaceFixedServices).toHaveBeenCalledWith(expect.arrayContaining([
    expect.objectContaining({ serviceId: 'ROOM_1', unitPrice: 6000000 }),
  ]));
});
```

- [ ] **Step 2: Run finance tab tests to verify RED**

Run: `npx vitest run src/features/residents/components/ResidentFinanceTab.test.tsx`

Expected: FAIL because `fixedServices` props and editing UI do not exist.

- [ ] **Step 3: Add finance tab props**

Add:

```ts
fixedServices: ResidentFixedServiceAssignment[];
onReplaceFixedServices: (assignments: ResidentFixedServiceAssignment[]) => void;
```

Keep `onRecordUsage` for one-off services.

- [ ] **Step 4: Replace estimated fixed rows**

Filter `fixedServices` by `resident.id` and active status. If required categories are missing, show a warning and do not synthesize hidden prices.

- [ ] **Step 5: Add edit controls**

Add select controls for required categories and a select/button for optional fixed monthly services. Disable mutation controls when `readOnly` is true.

- [ ] **Step 6: Wire parent components**

Pass `residentFixedServices` and `replaceResidentFixedServices` from `ResidentDetailPage` through `ResidentDetail` into `ResidentFinanceTab`.

- [ ] **Step 7: Run tests to verify GREEN**

Run: `npx vitest run src/features/residents/components/ResidentFinanceTab.test.tsx src/features/residents/components/ResidentDetail.test.tsx src/features/residents/pages/ResidentDetailPage.test.tsx`

Expected: PASS.

- [ ] **Step 8: Commit**

Run:

```bash
git add src/features/residents/components/ResidentFinanceTab.tsx src/features/residents/components/ResidentFinanceTab.test.tsx src/features/residents/components/ResidentDetail.tsx src/features/residents/pages/ResidentDetailPage.tsx src/features/residents/pages/ResidentDetailPage.test.tsx
git commit -m "feat: edit resident fixed services in finance tab"
```

---

### Task 5: Monthly Billing And Invoice From Assignments

**Files:**
- Modify: `src/features/finance/utils/calculateMonthlyBilling.ts`
- Create or modify: `src/features/finance/utils/calculateMonthlyBilling.test.ts`
- Modify: `src/features/finance/components/MonthlyBillingConfig.tsx`
- Modify: `src/features/finance/pages/FinancePage.tsx`
- Modify: `src/features/finance/components/InvoicePreview.tsx`

- [ ] **Step 1: Write failing billing tests**

Add tests:

```ts
it('calculates fixed costs from resident fixed assignments', () => {
  const result = calculateFixedCosts(residentFixture, assignmentFixture);
  expect(result.total).toBe(8900000);
  expect(result.details.map((row) => row.name)).toEqual(['Phong 2 nguoi', 'Cham soc cap 2', 'An tai nha an']);
});

it('does not fall back to INITIAL_PRICES when assignments are missing', () => {
  const result = calculateFixedCosts(residentFixture, []);
  expect(result.total).toBe(0);
  expect(result.missingRequiredCategories).toEqual(['ROOM', 'MEAL', 'CARE']);
});
```

- [ ] **Step 2: Run billing tests to verify RED**

Run: `npx vitest run src/features/finance/utils/calculateMonthlyBilling.test.ts`

Expected: FAIL because `calculateFixedCosts` currently uses `INITIAL_PRICES` and has no warning output.

- [ ] **Step 3: Update billing utility**

Change `calculateFixedCosts` to accept assignments:

```ts
export const calculateFixedCosts = (
  resident: ResidentListItem,
  fixedServices: ResidentFixedServiceAssignment[] = [],
): FixedCostBreakdown => { ... }
```

Return details from active resident assignments and add `missingRequiredCategories`.

- [ ] **Step 4: Update MonthlyBillingConfig**

Add `residentFixedServices` prop and call `calculateFixedCosts(resident, residentFixedServices)`. Show a compact warning badge if any required category is missing.

- [ ] **Step 5: Update FinancePage and InvoicePreview flow**

Load `residentFixedServices` from `useFinanceStore`. Pass assignment-derived fixed rows into `InvoicePreview`. Keep invoice visual layout unchanged unless a missing-category warning needs to render.

- [ ] **Step 6: Run billing tests to verify GREEN**

Run: `npx vitest run src/features/finance/utils/calculateMonthlyBilling.test.ts`

Expected: PASS.

- [ ] **Step 7: Run related UI tests**

Run: `npx vitest run src/features/residents/components/ResidentFinanceTab.test.tsx src/features/finance/utils/calculateMonthlyBilling.test.ts`

Expected: PASS.

- [ ] **Step 8: Commit**

Run:

```bash
git add src/features/finance/utils/calculateMonthlyBilling.ts src/features/finance/utils/calculateMonthlyBilling.test.ts src/features/finance/components/MonthlyBillingConfig.tsx src/features/finance/pages/FinancePage.tsx src/features/finance/components/InvoicePreview.tsx
git commit -m "feat: bill resident fixed service packages"
```

---

### Task 6: Full Verification

**Files:**
- No production edits expected.

- [ ] **Step 1: Run focused test suite**

Run:

```bash
npx vitest run \
  src/features/finance/utils/fixedServiceAssignments.test.ts \
  src/services/financeService.test.ts \
  src/stores/financeStore.test.ts \
  src/features/residents/components/AdmissionWizard.test.tsx \
  src/features/residents/components/ResidentFinanceTab.test.tsx \
  src/features/finance/utils/calculateMonthlyBilling.test.ts
```

Expected: PASS.

- [ ] **Step 2: Run full tests**

Run: `npm test`

Expected: PASS.

- [ ] **Step 3: Type-check**

Run: `npx tsc --noEmit`

Expected: PASS.

- [ ] **Step 4: Build**

Run: `npm run build`

Expected: PASS.

- [ ] **Step 5: Review git diff**

Run: `git status --short` and `git diff --stat HEAD`

Expected: Only files related to resident fixed services are modified.

- [ ] **Step 6: Commit any verification-only fixes**

If verification required small fixes, commit them with a focused message.
