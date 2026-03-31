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
