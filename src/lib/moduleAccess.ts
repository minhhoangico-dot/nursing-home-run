import type { ManagedModuleKey } from '../constants/modules';
import type { RolePermissionMap } from '../types/permissions';
import type { Role } from '../types/user';

export type ModuleAccessLevel = 'full' | 'read_only' | 'none';

export const MODULE_READONLY_LINKS = {
  rooms: ['residents', 'incidents', 'maintenance'],
  residents: ['rooms', 'daily_monitoring', 'procedures', 'nutrition', 'visitors', 'incidents', 'maintenance'],
  daily_monitoring: ['residents', 'procedures'],
  procedures: ['residents', 'daily_monitoring'],
  nutrition: ['residents'],
  visitors: ['residents'],
  incidents: ['residents', 'rooms'],
  maintenance: ['rooms'],
  weight_tracking: [],
  forms: [],
  finance: [],
  settings: [],
} as const satisfies Record<ManagedModuleKey, readonly ManagedModuleKey[]>;

export const getModuleAccess = (
  permissions: RolePermissionMap | null | undefined,
  role: Role,
  moduleKey: ManagedModuleKey
): ModuleAccessLevel => {
  if (permissions?.[role]?.[moduleKey]) {
    return 'full';
  }

  if (moduleKey === 'finance' || moduleKey === 'settings') {
    return 'none';
  }

  for (const [sourceModuleKey, linkedModuleKeys] of Object.entries(MODULE_READONLY_LINKS) as Array<
    [ManagedModuleKey, readonly ManagedModuleKey[]]
  >) {
    if (linkedModuleKeys.includes(moduleKey) && permissions?.[role]?.[sourceModuleKey]) {
      return 'read_only';
    }
  }

  return 'none';
};
