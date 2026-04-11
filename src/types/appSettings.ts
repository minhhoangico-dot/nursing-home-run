import type { Role } from './user';

export type ModuleKey =
  | 'settings'
  | 'finance'
  | 'residents'
  | 'rooms'
  | 'visitors'
  | 'dailyMonitoring'
  | 'medications'
  | 'procedures'
  | 'nutrition'
  | 'maintenance'
  | 'incidents'
  | 'forms'
  | 'weightTracking';

export type AppModuleKey = ModuleKey;
export type ModuleAccessMode = 'full' | 'readOnly' | 'restricted';

export interface FacilityInfo {
  name: string;
  address: string;
  phone: string;
  email: string;
  taxCode: string;
  logoDataUrl: string;
}

export interface ModuleVisibilityPermission {
  visible: boolean;
}

export interface FinanceModulePermission {
  view: boolean;
  edit: boolean;
}

export interface RoleModulePermissions {
  settings: ModuleVisibilityPermission;
  finance: FinanceModulePermission;
  residents: ModuleVisibilityPermission;
  rooms: ModuleVisibilityPermission;
  visitors: ModuleVisibilityPermission;
  dailyMonitoring: ModuleVisibilityPermission;
  medications: ModuleVisibilityPermission;
  procedures: ModuleVisibilityPermission;
  nutrition: ModuleVisibilityPermission;
  maintenance: ModuleVisibilityPermission;
  incidents: ModuleVisibilityPermission;
  forms: ModuleVisibilityPermission;
  weightTracking: ModuleVisibilityPermission;
}

export type RoleModulePermissionMatrix = Record<Role, RoleModulePermissions>;
export type RoleModulePermissionsMap = RoleModulePermissionMatrix;
