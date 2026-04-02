import type { Role } from './user';

export const MANAGED_MODULE_KEYS = [
  'residents',
  'rooms',
  'nutrition',
  'visitors',
  'daily_monitoring',
  'procedures',
  'weight_tracking',
  'incidents',
  'maintenance',
  'forms',
  'finance',
  'settings',
] as const;

export type ManagedModuleKey = (typeof MANAGED_MODULE_KEYS)[number];
export type RolePermission = Record<ManagedModuleKey, boolean>;
export type RolePermissionMap = Record<Role, RolePermission>;
