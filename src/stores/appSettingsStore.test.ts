import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createInitialAppSettingsState, useAppSettingsStore } from './appSettingsStore';
import { appSettingsService } from '@/src/services/appSettingsService';

vi.mock('@/src/services/appSettingsService', () => ({
  appSettingsService: {
    fetchMany: vi.fn(),
    upsertSetting: vi.fn(),
  },
}));

describe('useAppSettingsStore', () => {
  beforeEach(() => {
    useAppSettingsStore.setState(createInitialAppSettingsState());
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
