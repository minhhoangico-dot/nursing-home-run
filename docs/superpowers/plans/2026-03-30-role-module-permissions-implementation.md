# Role Module Permissions Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add shared Supabase-backed branding and role-module permissions, expose an `ADMIN` permission editor in settings, and enforce module visibility plus finance read-only behavior consistently across navigation, routes, and key screens.

**Architecture:** Introduce a shared `app_settings` data layer and a dedicated Zustand store for facility branding and the role-module permission matrix. Replace hardcoded role checks with a module registry plus permission selectors, then thread read-only behavior into finance, resident, and room surfaces while preserving backward-compatible defaults when shared settings are absent.

**Tech Stack:** React 19, TypeScript, Vite, Zustand, Supabase, React Router 6, React Hook Form, Zod, Vitest, React Testing Library, jsdom

---

## File Structure

### Create

- `C:/Users/Minh/Desktop/VDL/vitest.config.ts`
- `C:/Users/Minh/Desktop/VDL/src/test/setup.ts`
- `C:/Users/Minh/Desktop/VDL/src/types/appSettings.ts`
- `C:/Users/Minh/Desktop/VDL/src/constants/moduleRegistry.ts`
- `C:/Users/Minh/Desktop/VDL/src/utils/modulePermissions.ts`
- `C:/Users/Minh/Desktop/VDL/src/utils/modulePermissions.test.ts`
- `C:/Users/Minh/Desktop/VDL/src/services/appSettingsService.ts`
- `C:/Users/Minh/Desktop/VDL/src/stores/appSettingsStore.ts`
- `C:/Users/Minh/Desktop/VDL/src/stores/appSettingsStore.test.ts`
- `C:/Users/Minh/Desktop/VDL/src/hooks/useFacilityBranding.ts`
- `C:/Users/Minh/Desktop/VDL/src/hooks/useModuleAccess.ts`
- `C:/Users/Minh/Desktop/VDL/src/features/settings/components/ModulePermissionsConfig.tsx`
- `C:/Users/Minh/Desktop/VDL/src/features/settings/components/ModulePermissionsConfig.test.tsx`
- `C:/Users/Minh/Desktop/VDL/src/components/layout/Sidebar.test.tsx`
- `C:/Users/Minh/Desktop/VDL/src/routes/PermissionRoute.tsx`
- `C:/Users/Minh/Desktop/VDL/src/routes/PermissionRoute.test.tsx`
- `C:/Users/Minh/Desktop/VDL/src/components/ui/RestrictedAccessPanel.tsx`
- `C:/Users/Minh/Desktop/VDL/src/components/ui/ReadOnlyBanner.tsx`
- `C:/Users/Minh/Desktop/VDL/src/features/settings/components/FacilityConfig.test.tsx`
- `C:/Users/Minh/Desktop/VDL/src/features/settings/pages/SettingsPage.test.tsx`
- `C:/Users/Minh/Desktop/VDL/src/features/finance/components/ServiceCatalog.test.tsx`
- `C:/Users/Minh/Desktop/VDL/src/features/residents/components/ResidentFinanceTab.test.tsx`
- `C:/Users/Minh/Desktop/VDL/src/features/residents/components/ResidentBasicInfo.test.tsx`
- `C:/Users/Minh/Desktop/VDL/src/features/residents/pages/ResidentListPage.test.tsx`
- `C:/Users/Minh/Desktop/VDL/src/features/rooms/pages/RoomMapPage.test.tsx`
- `C:/Users/Minh/Desktop/VDL/supabase/migrations/20260330_create_app_settings.sql`

### Modify

- `C:/Users/Minh/Desktop/VDL/package.json`
- `C:/Users/Minh/Desktop/VDL/src/types/index.ts`
- `C:/Users/Minh/Desktop/VDL/src/hooks/useInitialData.ts`
- `C:/Users/Minh/Desktop/VDL/src/utils/facilityBranding.ts`
- `C:/Users/Minh/Desktop/VDL/src/stores/roomConfigStore.ts`
- `C:/Users/Minh/Desktop/VDL/src/features/settings/components/FacilityConfig.tsx`
- `C:/Users/Minh/Desktop/VDL/src/features/settings/pages/SettingsPage.tsx`
- `C:/Users/Minh/Desktop/VDL/src/components/layout/Sidebar.tsx`
- `C:/Users/Minh/Desktop/VDL/src/features/auth/pages/LoginPage.tsx`
- `C:/Users/Minh/Desktop/VDL/src/features/finance/pages/FinancePage.tsx`
- `C:/Users/Minh/Desktop/VDL/src/features/finance/components/InvoicePreview.tsx`
- `C:/Users/Minh/Desktop/VDL/src/features/finance/components/ServiceCatalog.tsx`
- `C:/Users/Minh/Desktop/VDL/src/features/residents/pages/ResidentDetailPage.tsx`
- `C:/Users/Minh/Desktop/VDL/src/features/residents/pages/ResidentListPage.tsx`
- `C:/Users/Minh/Desktop/VDL/src/features/residents/components/ResidentDetail.tsx`
- `C:/Users/Minh/Desktop/VDL/src/features/residents/components/ResidentBasicInfo.tsx`
- `C:/Users/Minh/Desktop/VDL/src/features/residents/components/ResidentFinanceTab.tsx`
- `C:/Users/Minh/Desktop/VDL/src/features/medical/components/MedicalHistorySection.tsx`
- `C:/Users/Minh/Desktop/VDL/src/features/medical/components/MedicalVisitsSection.tsx`
- `C:/Users/Minh/Desktop/VDL/src/features/medical/components/MonitoringPlansSection.tsx`
- `C:/Users/Minh/Desktop/VDL/src/features/prescriptions/components/PrescriptionList.tsx`
- `C:/Users/Minh/Desktop/VDL/src/features/residents/components/ResidentNutritionSection.tsx`
- `C:/Users/Minh/Desktop/VDL/src/features/rooms/pages/RoomMapPage.tsx`
- `C:/Users/Minh/Desktop/VDL/src/features/prescriptions/utils/printTemplates.ts`
- `C:/Users/Minh/Desktop/VDL/src/features/print-forms/components/PrintableForm.tsx`
- `C:/Users/Minh/Desktop/VDL/src/features/procedures/components/PrintProcedureForm.tsx`
- `C:/Users/Minh/Desktop/VDL/src/features/weight-tracking/components/PrintWeightForm.tsx`
- `C:/Users/Minh/Desktop/VDL/src/routes/AppRoutes.tsx`
- `C:/Users/Minh/Desktop/VDL/scripts/sql/vostro-bootstrap.sql`

### Do Not Modify Unless Blocked

- `C:/Users/Minh/Desktop/VDL/migrations/*`

Reason: the active deployment path already has forward migrations in `supabase/migrations` plus bootstrap SQL in `scripts/sql/vostro-bootstrap.sql`. Do not rewrite historical legacy SQL unless later evidence shows production still depends on it.

## Task 1: Establish The Test Harness And Core Permission Primitives

**Files:**
- Create: `C:/Users/Minh/Desktop/VDL/vitest.config.ts`
- Create: `C:/Users/Minh/Desktop/VDL/src/test/setup.ts`
- Create: `C:/Users/Minh/Desktop/VDL/src/types/appSettings.ts`
- Create: `C:/Users/Minh/Desktop/VDL/src/constants/moduleRegistry.ts`
- Create: `C:/Users/Minh/Desktop/VDL/src/utils/modulePermissions.ts`
- Test: `C:/Users/Minh/Desktop/VDL/src/utils/modulePermissions.test.ts`
- Modify: `C:/Users/Minh/Desktop/VDL/package.json`
- Modify: `C:/Users/Minh/Desktop/VDL/src/types/index.ts`

- [ ] **Step 1: Write the failing permission helper tests**

```ts
import { describe, expect, it } from 'vitest';
import {
  DEFAULT_ROLE_MODULE_PERMISSIONS,
  getModuleAccessMode,
  normalizeRoleModulePermissions,
} from './modulePermissions';

describe('normalizeRoleModulePermissions', () => {
  it('forces ADMIN settings and finance permissions back on', () => {
    const normalized = normalizeRoleModulePermissions({
      ...DEFAULT_ROLE_MODULE_PERMISSIONS,
      ADMIN: {
        ...DEFAULT_ROLE_MODULE_PERMISSIONS.ADMIN,
        settings: { visible: false },
        finance: { view: false, edit: false },
      },
    });

    expect(normalized.ADMIN.settings.visible).toBe(true);
    expect(normalized.ADMIN.finance).toEqual({ view: true, edit: true });
  });

  it('turns finance edit off when finance view is false', () => {
    const normalized = normalizeRoleModulePermissions({
      ...DEFAULT_ROLE_MODULE_PERMISSIONS,
      NURSE: {
        ...DEFAULT_ROLE_MODULE_PERMISSIONS.NURSE,
        finance: { view: false, edit: true },
      },
    });

    expect(normalized.NURSE.finance).toEqual({ view: false, edit: false });
  });
});

describe('getModuleAccessMode', () => {
  it('returns readOnly for residents direct links', () => {
    expect(getModuleAccessMode('residents', false)).toBe('readOnly');
  });

  it('returns restricted for visitors direct links', () => {
    expect(getModuleAccessMode('visitors', false)).toBe('restricted');
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npm test -- src/utils/modulePermissions.test.ts`

Expected: FAIL because the test runner and helper modules do not exist yet.

- [ ] **Step 3: Add the test stack**

Install dev dependencies:

```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom
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
import path from 'path';
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
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

- [ ] **Step 4: Implement the core permission files**

Create `src/types/appSettings.ts` with role-module permission types, `FacilityInfo`, and `ModuleAccessMode`.

Create `src/constants/moduleRegistry.ts` with the approved module keys, route paths, and `nav` visibility flags.

Create `src/utils/modulePermissions.ts` with:

- `DEFAULT_FACILITY_INFO`
- `DEFAULT_ROLE_MODULE_PERMISSIONS`
- `normalizeRoleModulePermissions()`
- `getModuleAccessMode()`

Re-export `appSettings` types from `src/types/index.ts`.

- [ ] **Step 5: Run the helper tests and keep them green**

Run:

```bash
npm test -- src/utils/modulePermissions.test.ts
npm run build
```

Expected: PASS, PASS

- [ ] **Step 6: Commit**

```bash
git add package.json vitest.config.ts src/test/setup.ts src/types/appSettings.ts src/types/index.ts src/constants/moduleRegistry.ts src/utils/modulePermissions.ts src/utils/modulePermissions.test.ts
git commit -m "test: add module permission primitives"
```

## Task 2: Add Shared App Settings Schema, Service, And Bootstrap Loading

**Files:**
- Create: `C:/Users/Minh/Desktop/VDL/src/services/appSettingsService.ts`
- Create: `C:/Users/Minh/Desktop/VDL/src/stores/appSettingsStore.ts`
- Test: `C:/Users/Minh/Desktop/VDL/src/stores/appSettingsStore.test.ts`
- Create: `C:/Users/Minh/Desktop/VDL/supabase/migrations/20260330_create_app_settings.sql`
- Modify: `C:/Users/Minh/Desktop/VDL/scripts/sql/vostro-bootstrap.sql`
- Modify: `C:/Users/Minh/Desktop/VDL/src/hooks/useInitialData.ts`

- [ ] **Step 1: Write the failing store tests**

```ts
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useAppSettingsStore } from './appSettingsStore';
import { appSettingsService } from '@/src/services/appSettingsService';

vi.mock('@/src/services/appSettingsService', () => ({
  appSettingsService: {
    fetchMany: vi.fn(),
    upsertSetting: vi.fn(),
  },
}));

describe('useAppSettingsStore', () => {
  beforeEach(() => {
    useAppSettingsStore.setState(useAppSettingsStore.getInitialState());
  });

  it('falls back to defaults when remote settings are missing', async () => {
    vi.mocked(appSettingsService.fetchMany).mockResolvedValue({});

    await useAppSettingsStore.getState().fetchSettings();

    expect(useAppSettingsStore.getState().permissions.ADMIN.settings.visible).toBe(true);
    expect(useAppSettingsStore.getState().facility.name).toContain('FDC');
  });

  it('normalizes and persists permissions on save', async () => {
    await useAppSettingsStore.getState().savePermissions({
      ...useAppSettingsStore.getState().permissions,
      ADMIN: {
        ...useAppSettingsStore.getState().permissions.ADMIN,
        settings: { visible: false },
        finance: { view: false, edit: false },
      },
    });

    expect(vi.mocked(appSettingsService.upsertSetting)).toHaveBeenCalledWith(
      'role_module_permissions',
      expect.objectContaining({
        ADMIN: expect.objectContaining({
          settings: { visible: true },
          finance: { view: true, edit: true },
        }),
      }),
    );
  });

  it('tracks fallback mode when remote settings fail to load', async () => {
    vi.mocked(appSettingsService.fetchMany).mockRejectedValue(new Error('offline'));

    await useAppSettingsStore.getState().fetchSettings();

    expect(useAppSettingsStore.getState().usedFallbackDefaults).toBe(true);
    expect(useAppSettingsStore.getState().lastLoadError).toContain('offline');
  });
});
```

- [ ] **Step 2: Run the store tests to verify they fail**

Run: `npm test -- src/stores/appSettingsStore.test.ts`

Expected: FAIL because the app-settings store and service do not exist yet.

- [ ] **Step 3: Add the shared settings schema**

Create `supabase/migrations/20260330_create_app_settings.sql`:

```sql
create table if not exists public.app_settings (
  key text primary key,
  value jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.app_settings enable row level security;

drop policy if exists "Public Access App Settings" on public.app_settings;
create policy "Public Access App Settings"
on public.app_settings
for all
using (true)
with check (true);
```

Mirror the same table and policy creation in `scripts/sql/vostro-bootstrap.sql`.

- [ ] **Step 4: Implement the service and store**

Create `src/services/appSettingsService.ts`:

```ts
import { supabase } from '@/src/lib/supabase';

export const appSettingsService = {
  async fetchMany(keys: string[]) {
    const { data, error } = await supabase.from('app_settings').select('*').in('key', keys);
    if (error) throw error;
    return Object.fromEntries((data || []).map((row: any) => [row.key, row.value]));
  },
  async upsertSetting(key: string, value: unknown) {
    const { error } = await supabase.from('app_settings').upsert({
      key,
      value,
      updated_at: new Date().toISOString(),
    });
    if (error) throw error;
  },
};
```

Create `src/stores/appSettingsStore.ts` with shared facility and permission state, plus `fetchSettings()`, `saveFacility()`, `savePermissions()`, a test-friendly `getInitialState()`, and fallback metadata for UI feedback:

- `usedFallbackDefaults: boolean`
- `lastLoadError: string | null`

- [ ] **Step 5: Load shared settings during app bootstrap**

Modify `src/hooks/useInitialData.ts` so `fetchSettings()` runs before user-facing routes render:

```ts
const { fetchSettings } = useAppSettingsStore();

const [settingsResult] = await Promise.allSettled([
  fetchSettings(),
  fetchUsers(),
]);

if (settingsResult.status === 'rejected') {
  console.warn('App settings unavailable, continuing with defaults', settingsResult.reason);
}
```

Keep the existing fallback behavior if remote settings are absent or fail. The important constraint is fail-open bootstrap: remote settings failure must not block the shell from rendering with defaults. Do not toast from bootstrap itself; instead, preserve `usedFallbackDefaults` and `lastLoadError` in the store so `SettingsPage` can surface an admin-visible warning when an `ADMIN` opens settings.

- [ ] **Step 6: Run the store tests and the build**

Run:

```bash
npm test -- src/stores/appSettingsStore.test.ts
npm run build
```

Expected: PASS, PASS

- [ ] **Step 7: Commit**

```bash
git add src/services/appSettingsService.ts src/stores/appSettingsStore.ts src/stores/appSettingsStore.test.ts src/hooks/useInitialData.ts supabase/migrations/20260330_create_app_settings.sql scripts/sql/vostro-bootstrap.sql
git commit -m "feat: add shared app settings store"
```

## Task 3: Move Facility Branding Onto Shared App Settings

**Files:**
- Create: `C:/Users/Minh/Desktop/VDL/src/hooks/useFacilityBranding.ts`
- Test: `C:/Users/Minh/Desktop/VDL/src/features/settings/components/FacilityConfig.test.tsx`
- Modify: `C:/Users/Minh/Desktop/VDL/src/utils/facilityBranding.ts`
- Modify: `C:/Users/Minh/Desktop/VDL/src/stores/roomConfigStore.ts`
- Modify: `C:/Users/Minh/Desktop/VDL/src/features/settings/components/FacilityConfig.tsx`
- Modify: `C:/Users/Minh/Desktop/VDL/src/components/layout/Sidebar.tsx`
- Modify: `C:/Users/Minh/Desktop/VDL/src/features/auth/pages/LoginPage.tsx`
- Modify: `C:/Users/Minh/Desktop/VDL/src/features/finance/components/InvoicePreview.tsx`
- Modify: `C:/Users/Minh/Desktop/VDL/src/features/prescriptions/utils/printTemplates.ts`
- Modify: `C:/Users/Minh/Desktop/VDL/src/features/print-forms/components/PrintableForm.tsx`
- Modify: `C:/Users/Minh/Desktop/VDL/src/features/procedures/components/PrintProcedureForm.tsx`
- Modify: `C:/Users/Minh/Desktop/VDL/src/features/weight-tracking/components/PrintWeightForm.tsx`

- [ ] **Step 1: Write the failing facility-config test**

```tsx
import { fireEvent, render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import { FacilityConfig } from './FacilityConfig';

const saveFacility = vi.fn().mockResolvedValue(undefined);

vi.mock('@/src/stores/appSettingsStore', () => ({
  useAppSettingsStore: () => ({
    facility: {
      name: 'Vien Duong Lao FDC',
      address: '123 Duong ABC',
      phone: '028 1234 5678',
      email: 'contact@fdc.vn',
      taxCode: '0123456789',
      logoDataUrl: '',
    },
    saveFacility,
    isSaving: false,
  }),
}));

it('saves branding through the shared settings store', async () => {
  render(<FacilityConfig />);
  fireEvent.change(screen.getByDisplayValue('Vien Duong Lao FDC'), {
    target: { value: 'VDL FDC Moi' },
  });
  fireEvent.click(screen.getByRole('button', { name: /Luu thay doi/i }));
  expect(saveFacility).toHaveBeenCalledWith(expect.objectContaining({ name: 'VDL FDC Moi' }));
});
```

- [ ] **Step 2: Run the facility-config test to verify it fails**

Run: `npm test -- src/features/settings/components/FacilityConfig.test.tsx`

Expected: FAIL because `FacilityConfig` still reads and writes local `roomConfigStore`.

- [ ] **Step 3: Create the shared branding hook and decouple room config**

Create `src/hooks/useFacilityBranding.ts`:

```ts
import { useAppSettingsStore } from '@/src/stores/appSettingsStore';
import { getFacilityBranding } from '@/src/utils/facilityBranding';

export const useFacilityBranding = () => {
  const { facility } = useAppSettingsStore();
  return getFacilityBranding(facility);
};
```

Modify `src/utils/facilityBranding.ts` to import defaults from the shared app-settings layer, not from `roomConfigStore`.

Modify `src/stores/roomConfigStore.ts` so it owns room configuration only and no longer persists `facility`.

- [ ] **Step 4: Refactor branding consumers**

Use `useFacilityBranding()` in:

- `Sidebar.tsx`
- `LoginPage.tsx`
- `InvoicePreview.tsx`
- `printTemplates.ts`
- `PrintableForm.tsx`
- `PrintProcedureForm.tsx`
- `PrintWeightForm.tsx`

Refactor `FacilityConfig.tsx` to read `facility` and `saveFacility()` from `useAppSettingsStore`.

- [ ] **Step 5: Run the branding test and the build**

Run:

```bash
npm test -- src/features/settings/components/FacilityConfig.test.tsx
npm run build
```

Expected: PASS, PASS

- [ ] **Step 6: Commit**

```bash
git add src/hooks/useFacilityBranding.ts src/utils/facilityBranding.ts src/stores/roomConfigStore.ts src/features/settings/components/FacilityConfig.tsx src/features/settings/components/FacilityConfig.test.tsx src/components/layout/Sidebar.tsx src/features/auth/pages/LoginPage.tsx src/features/finance/components/InvoicePreview.tsx src/features/prescriptions/utils/printTemplates.ts src/features/print-forms/components/PrintableForm.tsx src/features/procedures/components/PrintProcedureForm.tsx src/features/weight-tracking/components/PrintWeightForm.tsx
git commit -m "feat: move branding to shared app settings"
```

## Task 4: Build The Module Permission Editor In Settings

**Files:**
- Create: `C:/Users/Minh/Desktop/VDL/src/features/settings/components/ModulePermissionsConfig.tsx`
- Test: `C:/Users/Minh/Desktop/VDL/src/features/settings/components/ModulePermissionsConfig.test.tsx`
- Test: `C:/Users/Minh/Desktop/VDL/src/features/settings/pages/SettingsPage.test.tsx`
- Modify: `C:/Users/Minh/Desktop/VDL/src/features/settings/pages/SettingsPage.tsx`

- [ ] **Step 1: Write the failing module-editor and settings-shell tests**

```tsx
import { fireEvent, render, screen, vi } from '@testing-library/react';
import { ModulePermissionsConfig } from './ModulePermissionsConfig';
import { DEFAULT_ROLE_MODULE_PERMISSIONS } from '@/src/utils/modulePermissions';

it('forces finance view on when finance edit is enabled', () => {
  const onSave = vi.fn();
  render(
    <ModulePermissionsConfig
      value={DEFAULT_ROLE_MODULE_PERMISSIONS}
      isSaving={false}
      onSave={onSave}
      onReset={() => {}}
    />,
  );

  fireEvent.click(screen.getByLabelText('DOCTOR-finance-edit'));
  fireEvent.click(screen.getByRole('button', { name: /Luu thay doi/i }));

  expect(onSave).toHaveBeenCalledWith(
    expect.objectContaining({
      DOCTOR: expect.objectContaining({
        finance: { view: true, edit: true },
      }),
    }),
  );
});

it('keeps ADMIN settings locked on', () => {
  render(
    <ModulePermissionsConfig
      value={DEFAULT_ROLE_MODULE_PERMISSIONS}
      isSaving={false}
      onSave={() => {}}
      onReset={() => {}}
    />,
  );

  expect(screen.getByLabelText('ADMIN-settings-visible')).toBeDisabled();
});
```

```tsx
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { SettingsPage } from './SettingsPage';
import { DEFAULT_ROLE_MODULE_PERMISSIONS } from '@/src/utils/modulePermissions';

const addToast = vi.fn();
const savePermissions = vi.fn().mockResolvedValue(undefined);

vi.mock('../../../app/providers', () => ({
  useToast: () => ({ addToast }),
}));

vi.mock('@/src/stores/authStore', () => ({
  useAuthStore: () => ({ user: { role: 'ADMIN', name: 'Admin', username: 'admin' } }),
}));

vi.mock('@/src/stores/appSettingsStore', () => ({
  useAppSettingsStore: () => ({
    permissions: DEFAULT_ROLE_MODULE_PERMISSIONS,
    savePermissions,
    isSaving: false,
    usedFallbackDefaults: true,
    lastLoadError: 'offline',
  }),
}));

vi.mock('../components/ModulePermissionsConfig', () => ({
  ModulePermissionsConfig: ({ onSave }: { onSave: () => Promise<void> }) => (
    <button onClick={() => void onSave()}>Save permissions</button>
  ),
}));

it('shows a warning toast to ADMIN when shared settings are running on defaults', async () => {
  render(<SettingsPage />);

  await waitFor(() =>
    expect(addToast).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'warning' }),
    ),
  );
});

it('shows a success toast after saving module permissions', async () => {
  render(<SettingsPage />);
  await userEvent.click(screen.getByRole('button', { name: /Phan quyen module/i }));
  await userEvent.click(screen.getByRole('button', { name: /Save permissions/i }));

  await waitFor(() =>
    expect(addToast).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'success' }),
    ),
  );
});
```

- [ ] **Step 2: Run the module-editor tests to verify they fail**

Run:

```bash
npm test -- src/features/settings/components/ModulePermissionsConfig.test.tsx
npm test -- src/features/settings/pages/SettingsPage.test.tsx
```

Expected: FAIL, FAIL because the editor component and settings-shell toast wiring do not exist yet.

- [ ] **Step 3: Implement the pure permission editor**

Create `ModulePermissionsConfig.tsx` as a pure component that accepts:

```ts
interface ModulePermissionsConfigProps {
  value: RoleModulePermissionMatrix;
  isSaving: boolean;
  onSave: (nextValue: RoleModulePermissionMatrix) => Promise<void> | void;
  onReset: () => void;
}
```

Key behavior:

- render a role-by-module matrix
- finance has two controls: `Xem` and `Sua`
- `Sua` auto-enables `Xem`
- turning `Xem` off also turns `Sua` off
- `ADMIN` protected cells are disabled

- [ ] **Step 4: Wire the editor into settings**

Modify `SettingsPage.tsx`:

- add `view: 'permissions'`
- add a new settings tile labeled `Phan quyen module`
- mount `ModulePermissionsConfig`
- wire `onSave` to `useAppSettingsStore().savePermissions`
- show a success toast after `savePermissions` resolves
- wire `onReset` to `DEFAULT_ROLE_MODULE_PERMISSIONS`
- when the current user is `ADMIN` and `usedFallbackDefaults` is true, show a warning toast once per mount using `lastLoadError` context

- [ ] **Step 5: Run the module-editor test and the build**

Run:

```bash
npm test -- src/features/settings/components/ModulePermissionsConfig.test.tsx
npm test -- src/features/settings/pages/SettingsPage.test.tsx
npm run build
```

Expected: PASS, PASS, PASS

- [ ] **Step 6: Commit**

```bash
git add src/features/settings/components/ModulePermissionsConfig.tsx src/features/settings/components/ModulePermissionsConfig.test.tsx src/features/settings/pages/SettingsPage.tsx src/features/settings/pages/SettingsPage.test.tsx
git commit -m "feat: add module permission settings UI"
```

## Task 5: Replace Hardcoded Role Gating With Permission-Aware Navigation And Routes

**Files:**
- Create: `C:/Users/Minh/Desktop/VDL/src/hooks/useModuleAccess.ts`
- Create: `C:/Users/Minh/Desktop/VDL/src/components/ui/RestrictedAccessPanel.tsx`
- Create: `C:/Users/Minh/Desktop/VDL/src/routes/PermissionRoute.tsx`
- Test: `C:/Users/Minh/Desktop/VDL/src/routes/PermissionRoute.test.tsx`
- Test: `C:/Users/Minh/Desktop/VDL/src/components/layout/Sidebar.test.tsx`
- Modify: `C:/Users/Minh/Desktop/VDL/src/routes/AppRoutes.tsx`
- Modify: `C:/Users/Minh/Desktop/VDL/src/components/layout/Sidebar.tsx`

- [ ] **Step 1: Write the failing route-guard tests**

```tsx
import { render, screen, vi } from '@testing-library/react';
import { PermissionRoute } from './PermissionRoute';

vi.mock('@/src/hooks/useModuleAccess', () => ({
  useModuleAccess: vi.fn(),
}));

import { useModuleAccess } from '@/src/hooks/useModuleAccess';

it('renders children in read-only mode for hidden residents routes', () => {
  vi.mocked(useModuleAccess).mockReturnValue({
    mode: 'readOnly',
    visible: false,
    canViewFinance: false,
    canEditFinance: false,
  });
  render(
    <PermissionRoute moduleKey="residents">
      <div>Residents Screen</div>
    </PermissionRoute>,
  );

  expect(screen.getByText('Residents Screen')).toBeInTheDocument();
  expect(screen.getByText(/Che do xem/i)).toBeInTheDocument();
});

it('shows the restricted panel when finance view is disabled', () => {
  vi.mocked(useModuleAccess).mockReturnValue({
    mode: 'restricted',
    visible: false,
    canViewFinance: false,
    canEditFinance: false,
  });
  render(
    <PermissionRoute moduleKey="finance">
      <div>Finance Screen</div>
    </PermissionRoute>,
  );

  expect(screen.getByText(/Khong co quyen truy cap/i)).toBeInTheDocument();
  expect(screen.getByText(/Tai chinh/i)).toBeInTheDocument();
});
```

- [ ] **Step 2: Run the route-guard tests to verify they fail**

Run:

```bash
npm test -- src/routes/PermissionRoute.test.tsx
npm test -- src/components/layout/Sidebar.test.tsx
```

Expected: FAIL because the permission-aware route layer does not exist yet.

- [ ] **Step 3: Implement `useModuleAccess` and `PermissionRoute`**

Create `src/hooks/useModuleAccess.ts`:

```ts
import { useAuthStore } from '@/src/stores/authStore';
import { useAppSettingsStore } from '@/src/stores/appSettingsStore';
import { getModuleAccessMode } from '@/src/utils/modulePermissions';
import { ModuleKey } from '@/src/types/appSettings';

export const useModuleAccess = (moduleKey: ModuleKey) => {
  const { user } = useAuthStore();
  const { permissions } = useAppSettingsStore();
  if (!user) return { mode: 'restricted', visible: false, canViewFinance: false, canEditFinance: false };

  if (moduleKey === 'finance') {
    const finance = permissions[user.role].finance;
    return {
      mode: finance.view ? (finance.edit ? 'full' : 'readOnly') : 'restricted',
      visible: finance.view,
      canViewFinance: finance.view,
      canEditFinance: finance.edit,
    };
  }

  const visible = permissions[user.role][moduleKey].visible;
  return {
    mode: getModuleAccessMode(moduleKey, visible),
    visible,
    canViewFinance: false,
    canEditFinance: false,
  };
};
```

If `Sidebar.tsx` needs to evaluate many modules in one render, extract the role/permission calculation into a pure selector such as `getRoleModuleAccess(role, permissions, moduleKey)` in `modulePermissions.ts`. Keep `useModuleAccess()` as a thin hook wrapper around that selector instead of calling the hook inside a `.map()` or `.filter()`.

Create `PermissionRoute.tsx`:

```tsx
import React from 'react';
import { ReadOnlyBanner } from '@/src/components/ui/ReadOnlyBanner';
import { RestrictedAccessPanel } from '@/src/components/ui/RestrictedAccessPanel';
import { ModuleKey } from '@/src/types/appSettings';
import { useModuleAccess } from '@/src/hooks/useModuleAccess';

export const PermissionRoute = ({
  moduleKey,
  children,
}: {
  moduleKey: ModuleKey;
  children: React.ReactNode;
}) => {
  const access = useModuleAccess(moduleKey);

  if (access.mode === 'restricted') {
    return <RestrictedAccessPanel moduleKey={moduleKey} />;
  }

  return (
    <>
      {access.mode === 'readOnly' && <ReadOnlyBanner />}
      {children}
    </>
  );
};
```

Create `src/components/ui/RestrictedAccessPanel.tsx` so it accepts module context:

```tsx
import { ModuleKey } from '@/src/types/appSettings';

const messages: Record<ModuleKey, { title: string; body: string }> = {
  finance: {
    title: 'Khong co quyen truy cap Tai chinh',
    body: 'Vai tro hien tai khong co quyen xem module tai chinh.',
  },
  residents: {
    title: 'Khong co quyen truy cap Ho so NCT',
    body: 'Ban chi co the mo ho so nay khi role duoc cap quyen module.',
  },
  rooms: {
    title: 'Khong co quyen truy cap So do phong',
    body: 'Role hien tai khong duoc mo module phong o.',
  },
  visitors: { title: 'Khong co quyen truy cap', body: 'Module nay dang bi an voi role hien tai.' },
  dailyMonitoring: { title: 'Khong co quyen truy cap', body: 'Module nay dang bi an voi role hien tai.' },
  procedures: { title: 'Khong co quyen truy cap', body: 'Module nay dang bi an voi role hien tai.' },
  nutrition: { title: 'Khong co quyen truy cap', body: 'Module nay dang bi an voi role hien tai.' },
  maintenance: { title: 'Khong co quyen truy cap', body: 'Module nay dang bi an voi role hien tai.' },
  incidents: { title: 'Khong co quyen truy cap', body: 'Module nay dang bi an voi role hien tai.' },
  forms: { title: 'Khong co quyen truy cap', body: 'Module nay dang bi an voi role hien tai.' },
  weightTracking: { title: 'Khong co quyen truy cap', body: 'Module nay dang bi an voi role hien tai.' },
  settings: { title: 'Khong co quyen truy cap', body: 'Chi ADMIN duoc mo khu vuc cai dat.' },
};

export const RestrictedAccessPanel = ({ moduleKey }: { moduleKey: ModuleKey }) => {
  const message = messages[moduleKey];
  return (
    <div className="flex flex-col items-center justify-center h-full p-8 text-center text-slate-500">
      <h2 className="text-2xl font-bold mb-2">{message.title}</h2>
      <p>{message.body}</p>
    </div>
  );
};
```

- [ ] **Step 4: Wire routes and sidebar to the shared model**

Modify `AppRoutes.tsx`:

- wrap `residents`, `rooms`, `finance`, `weight-tracking`, and other module routes with `PermissionRoute`
- stop relying on hardcoded role lists for module surfaces that now belong to the matrix

Modify `Sidebar.tsx`:

- remove `roles` arrays from menu items
- read `user` and `permissions` once, then filter nav items through the shared pure selector (not by calling `useModuleAccess()` inside `.map()`/`.filter()`)
- keep `weightTracking` out of sidebar because the registry marks it `nav: false`

Add `Sidebar.test.tsx` to prove a hidden module is removed from nav when the current role matrix marks it invisible.

- [ ] **Step 5: Run the route tests and the build**

Run:

```bash
npm test -- src/routes/PermissionRoute.test.tsx
npm test -- src/components/layout/Sidebar.test.tsx
npm run build
```

Expected: PASS, PASS

- [ ] **Step 6: Commit**

```bash
 git add src/hooks/useModuleAccess.ts src/components/ui/RestrictedAccessPanel.tsx src/routes/PermissionRoute.tsx src/routes/PermissionRoute.test.tsx src/routes/AppRoutes.tsx src/components/layout/Sidebar.tsx src/components/layout/Sidebar.test.tsx
git commit -m "feat: wire routes and nav to module permissions"
```

## Task 6: Implement Finance Read-Only Enforcement

**Files:**
- Create: `C:/Users/Minh/Desktop/VDL/src/components/ui/ReadOnlyBanner.tsx`
- Test: `C:/Users/Minh/Desktop/VDL/src/features/finance/components/ServiceCatalog.test.tsx`
- Test: `C:/Users/Minh/Desktop/VDL/src/features/residents/components/ResidentFinanceTab.test.tsx`
- Modify: `C:/Users/Minh/Desktop/VDL/src/features/finance/components/ServiceCatalog.tsx`
- Modify: `C:/Users/Minh/Desktop/VDL/src/features/finance/pages/FinancePage.tsx`
- Modify: `C:/Users/Minh/Desktop/VDL/src/features/residents/components/ResidentDetail.tsx`
- Modify: `C:/Users/Minh/Desktop/VDL/src/features/residents/components/ResidentFinanceTab.tsx`
- Modify: `C:/Users/Minh/Desktop/VDL/src/features/settings/pages/SettingsPage.tsx`

- [ ] **Step 1: Write the failing finance read-only tests**

```tsx
import { render, screen } from '@testing-library/react';
import { ServiceCatalog } from './ServiceCatalog';

it('disables service mutations in read-only mode', () => {
  render(
    <ServiceCatalog
      services={[]}
      readOnly={true}
      onAdd={() => {}}
      onUpdate={() => {}}
      onDelete={() => {}}
    />,
  );

  expect(screen.getByRole('button', { name: /Them/i })).toBeDisabled();
});
```

```tsx
import { render, screen } from '@testing-library/react';
import { ResidentFinanceTab } from './ResidentFinanceTab';

it('disables the quick-add finance control in read-only mode', () => {
  render(
    <ResidentFinanceTab
      resident={residentFixture}
      servicePrices={[]}
      usageRecords={[]}
      readOnly={true}
      onRecordUsage={() => {}}
    />,
  );

  expect(screen.getByRole('combobox')).toBeDisabled();
});
```

- [ ] **Step 2: Run the finance tests to verify they fail**

Run:

```bash
npm test -- src/features/finance/components/ServiceCatalog.test.tsx
npm test -- src/features/residents/components/ResidentFinanceTab.test.tsx
```

Expected: FAIL, FAIL because the components do not accept `readOnly` yet.

- [ ] **Step 3: Thread a shared read-only banner and props through finance surfaces**

Create `ReadOnlyBanner.tsx`:

```tsx
export const ReadOnlyBanner = ({ message = 'Ban dang o che do xem.' }: { message?: string }) => (
  <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
    {message}
  </div>
);
```

Modify `ServiceCatalog.tsx`:

- add `readOnly?: boolean`
- disable create button, edit button, delete button, and usage recording
- keep table viewing intact

Modify `ResidentFinanceTab.tsx`:

- add `readOnly?: boolean`
- disable the quick-add select
- keep totals and tables visible

Modify `FinancePage.tsx` and `SettingsPage.tsx`:

- compute `canViewFinance` and `canEditFinance` via `useModuleAccess('finance')`
- show `ReadOnlyBanner` when `view=true` and `edit=false`
- pass `readOnly={!canEditFinance}` into finance mutation components

Modify `ResidentDetail.tsx` to:

- hide the finance tab entirely when `canViewFinance` is false
- pass `readOnly={!canEditFinance}` when the tab is visible

- [ ] **Step 4: Run the finance tests and the build**

Run:

```bash
npm test -- src/features/finance/components/ServiceCatalog.test.tsx
npm test -- src/features/residents/components/ResidentFinanceTab.test.tsx
npm run build
```

Expected: PASS, PASS, PASS

- [ ] **Step 5: Commit**

```bash
git add src/components/ui/ReadOnlyBanner.tsx src/features/finance/components/ServiceCatalog.tsx src/features/finance/components/ServiceCatalog.test.tsx src/features/finance/pages/FinancePage.tsx src/features/residents/components/ResidentDetail.tsx src/features/residents/components/ResidentFinanceTab.tsx src/features/residents/components/ResidentFinanceTab.test.tsx src/features/settings/pages/SettingsPage.tsx
git commit -m "feat: add finance read-only enforcement"
```

## Task 7: Implement Resident Module Read-Only Behavior

**Files:**
- Test: `C:/Users/Minh/Desktop/VDL/src/features/residents/components/ResidentBasicInfo.test.tsx`
- Test: `C:/Users/Minh/Desktop/VDL/src/features/residents/pages/ResidentListPage.test.tsx`
- Modify: `C:/Users/Minh/Desktop/VDL/src/features/residents/pages/ResidentListPage.tsx`
- Modify: `C:/Users/Minh/Desktop/VDL/src/features/residents/pages/ResidentDetailPage.tsx`
- Modify: `C:/Users/Minh/Desktop/VDL/src/features/residents/components/ResidentDetail.tsx`
- Modify: `C:/Users/Minh/Desktop/VDL/src/features/residents/components/ResidentBasicInfo.tsx`
- Modify: `C:/Users/Minh/Desktop/VDL/src/features/medical/components/MedicalHistorySection.tsx`
- Modify: `C:/Users/Minh/Desktop/VDL/src/features/medical/components/MedicalVisitsSection.tsx`
- Modify: `C:/Users/Minh/Desktop/VDL/src/features/medical/components/MonitoringPlansSection.tsx`
- Modify: `C:/Users/Minh/Desktop/VDL/src/features/prescriptions/components/PrescriptionList.tsx`
- Modify: `C:/Users/Minh/Desktop/VDL/src/features/residents/components/ResidentNutritionSection.tsx`

- [ ] **Step 1: Write the failing resident-shell tests**

```tsx
import { render, screen } from '@testing-library/react';
import { ResidentBasicInfo } from './ResidentBasicInfo';

it('hides the edit button in read-only mode', () => {
  render(
    <ResidentBasicInfo
      resident={residentFixture}
      readOnly={true}
      onEdit={() => {}}
      onPrint={() => {}}
    />,
  );

  expect(screen.queryByRole('button', { name: /Chinh sua/i })).not.toBeInTheDocument();
});
```

```tsx
import { render, screen, vi } from '@testing-library/react';
import { ResidentListPage } from './ResidentListPage';

vi.mock('@/src/hooks/useModuleAccess', () => ({
  useModuleAccess: () => ({ mode: 'readOnly' }),
}));

it('hides resident creation controls in read-only mode', () => {
  render(<ResidentListPage />);
  expect(screen.queryByRole('button', { name: /Them NCT moi/i })).not.toBeInTheDocument();
});
```

- [ ] **Step 2: Run the resident tests to verify they fail**

Run:

```bash
npm test -- src/features/residents/components/ResidentBasicInfo.test.tsx
npm test -- src/features/residents/pages/ResidentListPage.test.tsx
```

Expected: FAIL, FAIL because the resident screens do not have a module-level read-only mode yet.

- [ ] **Step 3: Compute resident access once at the page level**

Modify `ResidentListPage.tsx` and `ResidentDetailPage.tsx`:

```ts
const residentsAccess = useModuleAccess('residents');
const isReadOnly = residentsAccess.mode === 'readOnly';
```

Apply `isReadOnly` to:

- hide `AdmissionWizard` launch buttons and the mobile FAB
- prevent resident edit modals from opening
- prevent assessment wizard from opening

- [ ] **Step 4: Thread read-only props into resident detail sections**

Modify `ResidentBasicInfo.tsx`:

- add `readOnly?: boolean`
- keep `In ho so`
- hide `Chinh sua` when read-only

Modify `ResidentDetail.tsx`:

- add `readOnly?: boolean`
- pass `readOnly` into the medical, prescription, monitoring, and nutrition sections
- keep pure data views visible

Modify these child components so they hide or disable mutation CTA buttons when `readOnly` is true:

- `MedicalHistorySection.tsx`
- `MedicalVisitsSection.tsx`
- `MonitoringPlansSection.tsx`
- `PrescriptionList.tsx`
- `ResidentNutritionSection.tsx`

- [ ] **Step 5: Run the resident tests and the build**

Run:

```bash
npm test -- src/features/residents/components/ResidentBasicInfo.test.tsx
npm test -- src/features/residents/pages/ResidentListPage.test.tsx
npm run build
```

Expected: PASS, PASS, PASS

- [ ] **Step 6: Commit**

```bash
git add src/features/residents/pages/ResidentListPage.tsx src/features/residents/pages/ResidentDetailPage.tsx src/features/residents/components/ResidentDetail.tsx src/features/residents/components/ResidentBasicInfo.tsx src/features/residents/components/ResidentBasicInfo.test.tsx src/features/residents/pages/ResidentListPage.test.tsx src/features/medical/components/MedicalHistorySection.tsx src/features/medical/components/MedicalVisitsSection.tsx src/features/medical/components/MonitoringPlansSection.tsx src/features/prescriptions/components/PrescriptionList.tsx src/features/residents/components/ResidentNutritionSection.tsx
git commit -m "feat: add resident read-only mode"
```

## Task 8: Implement Room Read-Only Behavior And Final Verification

**Files:**
- Test: `C:/Users/Minh/Desktop/VDL/src/features/rooms/pages/RoomMapPage.test.tsx`
- Modify: `C:/Users/Minh/Desktop/VDL/src/features/rooms/pages/RoomMapPage.tsx`
- Review only: `C:/Users/Minh/Desktop/VDL/docs/superpowers/specs/2026-03-30-role-module-permissions-design.md`
- Review only: `C:/Users/Minh/Desktop/VDL/docs/superpowers/plans/2026-03-30-role-module-permissions-implementation.md`

- [ ] **Step 1: Write the failing room-page test**

```tsx
import { render, screen, vi } from '@testing-library/react';
import { RoomMapPage } from './RoomMapPage';

vi.mock('@/src/hooks/useModuleAccess', () => ({
  useModuleAccess: () => ({ mode: 'readOnly' }),
}));

it('hides room mutation controls in read-only mode', () => {
  render(<RoomMapPage />);
  expect(screen.queryByText(/Chinh sua/i)).not.toBeInTheDocument();
  expect(screen.queryByTitle(/Them phong/i)).not.toBeInTheDocument();
});
```

- [ ] **Step 2: Run the room-page test to verify it fails**

Run: `npm test -- src/features/rooms/pages/RoomMapPage.test.tsx`

Expected: FAIL because `RoomMapPage` still exposes edit and assignment controls for anyone who reaches the page.

- [ ] **Step 3: Add read-only gating to rooms**

Modify `RoomMapPage.tsx`:

- compute `const roomsAccess = useModuleAccess('rooms')`
- show `ReadOnlyBanner` when `roomsAccess.mode === 'readOnly'`
- hide the edit-mode toggle and add-room button in read-only mode
- block `assign`, `transfer`, `discharge`, `start_maintenance`, and `end_maintenance` actions when read-only
- keep room occupancy viewing intact

- [ ] **Step 4: Run targeted verification plus the full suite**

Run:

```bash
npm test -- src/features/rooms/pages/RoomMapPage.test.tsx
npm test
npm run build
```

Expected: targeted room test PASS, full test suite PASS, build PASS

- [ ] **Step 5: Manual app smoke test**

Check at minimum:

- `ADMIN` can open `Settings > Phan quyen module`
- saving permissions updates the running app without a refresh
- branding changes appear on login and sidebar after reload
- `ACCOUNTANT` can view and edit finance but cannot access settings
- a role with `finance.view=true` and `finance.edit=false` can open finance surfaces but cannot mutate data
- a role with hidden `residents` can open a direct resident link in read-only mode
- a role with hidden `rooms` can open `/rooms` in read-only mode
- hidden modules that are not `residents`, `rooms`, or finance show the restricted panel instead of editable content
- `/weight-tracking` follows the permission route and does not bypass the matrix

- [ ] **Step 6: Commit final polish if needed**

```bash
 git add package.json vitest.config.ts src/test/setup.ts src/types/appSettings.ts src/types/index.ts src/constants/moduleRegistry.ts src/utils/modulePermissions.ts src/utils/modulePermissions.test.ts src/services/appSettingsService.ts src/stores/appSettingsStore.ts src/stores/appSettingsStore.test.ts src/hooks/useFacilityBranding.ts src/hooks/useModuleAccess.ts src/features/settings/components/FacilityConfig.tsx src/features/settings/components/FacilityConfig.test.tsx src/features/settings/components/ModulePermissionsConfig.tsx src/features/settings/components/ModulePermissionsConfig.test.tsx src/features/settings/pages/SettingsPage.tsx src/features/settings/pages/SettingsPage.test.tsx src/components/layout/Sidebar.tsx src/components/layout/Sidebar.test.tsx src/features/auth/pages/LoginPage.tsx src/features/finance/pages/FinancePage.tsx src/features/finance/components/InvoicePreview.tsx src/features/finance/components/ServiceCatalog.tsx src/features/finance/components/ServiceCatalog.test.tsx src/features/residents/pages/ResidentListPage.tsx src/features/residents/pages/ResidentListPage.test.tsx src/features/residents/pages/ResidentDetailPage.tsx src/features/residents/components/ResidentDetail.tsx src/features/residents/components/ResidentBasicInfo.tsx src/features/residents/components/ResidentBasicInfo.test.tsx src/features/residents/components/ResidentFinanceTab.tsx src/features/residents/components/ResidentFinanceTab.test.tsx src/features/medical/components/MedicalHistorySection.tsx src/features/medical/components/MedicalVisitsSection.tsx src/features/medical/components/MonitoringPlansSection.tsx src/features/prescriptions/components/PrescriptionList.tsx src/features/residents/components/ResidentNutritionSection.tsx src/features/rooms/pages/RoomMapPage.tsx src/features/rooms/pages/RoomMapPage.test.tsx src/features/prescriptions/utils/printTemplates.ts src/features/print-forms/components/PrintableForm.tsx src/features/procedures/components/PrintProcedureForm.tsx src/features/weight-tracking/components/PrintWeightForm.tsx src/routes/AppRoutes.tsx src/routes/PermissionRoute.tsx src/routes/PermissionRoute.test.tsx src/components/ui/RestrictedAccessPanel.tsx src/components/ui/ReadOnlyBanner.tsx src/hooks/useInitialData.ts src/utils/facilityBranding.ts src/stores/roomConfigStore.ts supabase/migrations/20260330_create_app_settings.sql scripts/sql/vostro-bootstrap.sql
git commit -m "feat: add shared module permissions and branding settings"
```
