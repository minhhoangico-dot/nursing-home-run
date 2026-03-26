import { describe, expect, it } from 'vitest';
import {
  DEFAULT_ROLE_PERMISSIONS,
  MANAGED_MODULE_KEYS,
  MODULE_KEYS,
  MODULES,
  getDefaultModulePathForRole,
  getModuleByPath,
  getModuleTitleByPath,
  getSidebarModulesForRole,
} from '../constants/modules';
import { MODULE_READONLY_LINKS, getModuleAccess } from './moduleAccess';

describe('module registry', () => {
  it('keeps profile in the registry while excluding it from admin-managed permissions', () => {
    expect(MODULES.some((module) => module.key === 'profile')).toBe(true);
    expect(MODULE_KEYS).toContain('weight_tracking');
    expect(MODULE_KEYS).toContain('profile');
    expect(MANAGED_MODULE_KEYS).toContain('weight_tracking');
    expect(MANAGED_MODULE_KEYS).not.toContain('profile');
    expect('profile' in DEFAULT_ROLE_PERMISSIONS.ADMIN).toBe(false);
  });

  it('keeps settings enabled for ADMIN in the default matrix', () => {
    expect(DEFAULT_ROLE_PERMISSIONS.ADMIN.settings).toBe(true);
  });

  it('uses the existing Vietnamese metadata for managed modules', () => {
    const weightTrackingModule = MODULES.find((module) => module.key === 'weight_tracking');

    expect(weightTrackingModule).toMatchObject({
      key: 'weight_tracking',
      label: 'Theo dõi cân nặng',
      path: '/weight-tracking',
      title: 'Theo dõi cân nặng',
      sidebarVisible: false,
      permissionManaged: true,
    });
  });

  it('derives read_only access from a directly full source module', () => {
    expect(getModuleAccess(DEFAULT_ROLE_PERMISSIONS, 'ADMIN', 'rooms')).toBe('full');
    expect(MODULE_READONLY_LINKS.rooms).toEqual(['residents', 'incidents', 'maintenance']);
    expect(getModuleAccess(DEFAULT_ROLE_PERMISSIONS, 'CAREGIVER', 'residents')).toBe('read_only');
  });

  it('denies finance and settings without direct full access', () => {
    expect(getModuleAccess(DEFAULT_ROLE_PERMISSIONS, 'CAREGIVER', 'finance')).toBe('none');
    expect(getModuleAccess(DEFAULT_ROLE_PERMISSIONS, 'CAREGIVER', 'settings')).toBe('none');
  });

  it('does not chain read_only access transitively', () => {
    expect(getModuleAccess(DEFAULT_ROLE_PERMISSIONS, 'CAREGIVER', 'maintenance')).toBe('none');
  });

  it('keeps shared-only modules in the registry metadata', () => {
    const profileModule = getModuleByPath('/profile');

    expect(profileModule).toMatchObject({
      key: 'profile',
      label: 'Hồ sơ cá nhân',
      path: '/profile',
      title: 'Hồ sơ cá nhân',
      sidebarVisible: false,
      permissionManaged: false,
    });
  });

  it('keeps registry keys and paths unique and resolves descendant routes', () => {
    const keys = MODULES.map((module) => module.key);
    const paths = MODULES.map((module) => module.path);

    expect(new Set(keys).size).toBe(keys.length);
    expect(new Set(paths).size).toBe(paths.length);
    expect(getModuleByPath('/residents/123')?.key).toBe('residents');
  });

  it('filters sidebar modules using the provided permission map', () => {
    const adminSidebarKeys = getSidebarModulesForRole(DEFAULT_ROLE_PERMISSIONS, 'ADMIN').map((module) => module.key);
    const caregiverSidebarKeys = getSidebarModulesForRole(DEFAULT_ROLE_PERMISSIONS, 'CAREGIVER').map((module) => module.key);

    expect(adminSidebarKeys).toContain('settings');
    expect(adminSidebarKeys).not.toContain('profile');
    expect(adminSidebarKeys).not.toContain('weight_tracking');
    expect(getModuleAccess(DEFAULT_ROLE_PERMISSIONS, 'CAREGIVER', 'residents')).toBe('read_only');
    expect(caregiverSidebarKeys).not.toContain('residents');
    expect(caregiverSidebarKeys).toEqual(['nutrition', 'visitors', 'incidents']);
  });

  it('derives page titles and safe default redirects from the shared registry', () => {
    expect(getModuleTitleByPath('/daily-monitoring')).toBe('Theo dõi ngày');
    expect(getModuleTitleByPath('/profile')).toBe('Hồ sơ cá nhân');

    expect(getDefaultModulePathForRole(DEFAULT_ROLE_PERMISSIONS, 'ADMIN')).toBe('/rooms');
    expect(getDefaultModulePathForRole(DEFAULT_ROLE_PERMISSIONS, 'CAREGIVER')).toBe('/nutrition');
    expect(getDefaultModulePathForRole(DEFAULT_ROLE_PERMISSIONS, 'CAREGIVER')).not.toBe('/residents');
  });
});
