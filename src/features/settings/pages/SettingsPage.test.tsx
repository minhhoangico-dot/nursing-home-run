import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DEFAULT_ROLE_MODULE_PERMISSIONS } from '@/src/utils/modulePermissions';

vi.mock('../../../app/providers', () => {
  const addToast = vi.fn();
  (globalThis as Record<string, unknown>).__settingsPageAddToastMock = addToast;

  return {
    useToast: () => ({ addToast }),
  };
});

vi.mock('@/src/stores/authStore', () => ({
  useAuthStore: () => ({
    user: { role: 'ADMIN', name: 'Admin', username: 'admin' },
    users: [],
  }),
}));

const financeStoreMocks = vi.hoisted(() => ({
  fetchFinanceData: vi.fn().mockResolvedValue(undefined),
  updateServicePrice: vi.fn(),
  deleteServicePrice: vi.fn(),
}));

vi.mock('@/src/stores/financeStore', () => ({
  useFinanceStore: () => ({
    servicePrices: [],
    fetchFinanceData: financeStoreMocks.fetchFinanceData,
    isLoaded: false,
    updateServicePrice: financeStoreMocks.updateServicePrice,
    deleteServicePrice: financeStoreMocks.deleteServicePrice,
  }),
}));

vi.mock('@/src/services/databaseService', () => ({
  db: {
    users: {
      upsert: vi.fn(),
    },
  },
}));

vi.mock('@/src/stores/appSettingsStore', () => {
  const savePermissions = vi.fn().mockResolvedValue(undefined);
  (globalThis as Record<string, unknown>).__settingsPageSavePermissionsMock = savePermissions;

  return {
    useAppSettingsStore: () => ({
      permissions: DEFAULT_ROLE_MODULE_PERMISSIONS,
      savePermissions,
      isSaving: false,
      usedFallbackDefaults: true,
      lastLoadError: 'offline',
    }),
  };
});

vi.mock('../components/ModulePermissionsConfig', () => ({
  ModulePermissionsConfig: ({
    onSave,
  }: {
    onSave: (nextValue: typeof DEFAULT_ROLE_MODULE_PERMISSIONS) => Promise<void>;
  }) => (
    <button onClick={() => void onSave(DEFAULT_ROLE_MODULE_PERMISSIONS)}>
      Save permissions
    </button>
  ),
}));

import { SettingsPage } from './SettingsPage';

const getAddToastMock = () =>
  (globalThis as Record<string, any>).__settingsPageAddToastMock as ReturnType<typeof vi.fn>;

const getSavePermissionsMock = () =>
  (globalThis as Record<string, any>).__settingsPageSavePermissionsMock as ReturnType<typeof vi.fn>;

describe('SettingsPage', () => {
  beforeEach(() => {
    getAddToastMock().mockClear();
    getSavePermissionsMock().mockClear();
    financeStoreMocks.fetchFinanceData.mockClear();
    financeStoreMocks.updateServicePrice.mockClear();
    financeStoreMocks.deleteServicePrice.mockClear();
  });

  it('shows a warning toast to ADMIN when shared settings are running on defaults', async () => {
    render(<SettingsPage />);

    await waitFor(() =>
      expect(getAddToastMock()).toHaveBeenCalledWith(
        'warning',
        expect.any(String),
        expect.stringContaining('offline'),
      ),
    );
  });

  it('shows a success toast after saving module permissions', async () => {
    const user = userEvent.setup();

    render(<SettingsPage />);

    await user.click(screen.getByRole('button', { name: /Phân quyền module/i }));
    await user.click(screen.getByRole('button', { name: /Save permissions/i }));

    await waitFor(() => {
      expect(getSavePermissionsMock()).toHaveBeenCalledWith(
        DEFAULT_ROLE_MODULE_PERMISSIONS,
      );
      expect(getAddToastMock()).toHaveBeenCalledWith(
        'success',
        expect.any(String),
        expect.any(String),
      );
    });
  });

  it('loads finance data when opening the service price settings', async () => {
    const user = userEvent.setup();

    render(<SettingsPage />);

    expect(financeStoreMocks.fetchFinanceData).not.toHaveBeenCalled();

    await user.click(screen.getByRole('button', { name: /Bảng giá dịch vụ/i }));

    await waitFor(() => {
      expect(financeStoreMocks.fetchFinanceData).toHaveBeenCalledTimes(1);
    });
  });
});
