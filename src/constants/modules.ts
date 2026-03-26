import type { Role } from '../types/user';

type ModuleDefinition = {
  key: string;
  label: string;
  path: string;
  title: string;
  sidebarVisible: boolean;
  permissionManaged: boolean;
};

export const MODULES = [
  { key: 'residents', label: 'Danh sách NCT', path: '/residents', title: 'Danh sách NCT', sidebarVisible: true, permissionManaged: true },
  { key: 'rooms', label: 'Sơ đồ phòng', path: '/rooms', title: 'Sơ đồ phòng', sidebarVisible: true, permissionManaged: true },
  { key: 'nutrition', label: 'Dinh dưỡng', path: '/nutrition', title: 'Quản lý Dinh dưỡng & Suất ăn', sidebarVisible: true, permissionManaged: true },
  { key: 'visitors', label: 'Khách thăm', path: '/visitors', title: 'Quản lý Khách thăm', sidebarVisible: true, permissionManaged: true },
  { key: 'daily_monitoring', label: 'Theo dõi ngày', path: '/daily-monitoring', title: 'Theo dõi ngày', sidebarVisible: true, permissionManaged: true },
  { key: 'procedures', label: 'Thủ thuật', path: '/procedures', title: 'Thủ thuật y tế', sidebarVisible: true, permissionManaged: true },
  { key: 'weight_tracking', label: 'Theo dõi cân nặng', path: '/weight-tracking', title: 'Theo dõi cân nặng', sidebarVisible: false, permissionManaged: true },
  { key: 'incidents', label: 'Sự cố & An toàn', path: '/incidents', title: 'Sự cố & An toàn', sidebarVisible: true, permissionManaged: true },
  { key: 'maintenance', label: 'Bảo trì', path: '/maintenance', title: 'Bảo trì & Cơ sở vật chất', sidebarVisible: true, permissionManaged: true },
  { key: 'forms', label: 'In biểu mẫu', path: '/forms', title: 'In biểu mẫu', sidebarVisible: true, permissionManaged: true },
  { key: 'finance', label: 'Tài chính', path: '/finance', title: 'Tài chính', sidebarVisible: true, permissionManaged: true },
  { key: 'settings', label: 'Cài đặt', path: '/settings', title: 'Cài đặt', sidebarVisible: true, permissionManaged: true },
  { key: 'profile', label: 'Hồ sơ cá nhân', path: '/profile', title: 'Hồ sơ cá nhân', sidebarVisible: false, permissionManaged: false },
] as const satisfies readonly ModuleDefinition[];

export type ModuleRegistryEntry = (typeof MODULES)[number];
export type ModuleKey = ModuleRegistryEntry['key'];
export type ManagedModuleKey = Extract<ModuleRegistryEntry, { permissionManaged: true }>['key'];
export type RolePermission = Record<ManagedModuleKey, boolean>;
export type RolePermissionMap = Record<Role, RolePermission>;

const isManagedModuleEntry = (
  module: ModuleRegistryEntry
): module is Extract<ModuleRegistryEntry, { permissionManaged: true }> => module.permissionManaged;

export const MODULE_KEYS = MODULES.map((module) => module.key) as ModuleKey[];

export const MANAGED_MODULE_KEYS = MODULES.filter(isManagedModuleEntry).map(
  (module) => module.key
) as ManagedModuleKey[];

const createRolePermissions = (allowedModules: readonly ManagedModuleKey[]): RolePermission => {
  const allowed = new Set(allowedModules);

  return MANAGED_MODULE_KEYS.reduce((permissions, moduleKey) => {
    permissions[moduleKey] = allowed.has(moduleKey);
    return permissions;
  }, {} as RolePermission);
};

export const DEFAULT_ROLE_PERMISSIONS: RolePermissionMap = {
  ADMIN: createRolePermissions(MANAGED_MODULE_KEYS),
  DOCTOR: createRolePermissions([
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
  ]),
  SUPERVISOR: createRolePermissions([
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
  ]),
  ACCOUNTANT: createRolePermissions([
    'residents',
    'rooms',
    'maintenance',
    'finance',
  ]),
  NURSE: createRolePermissions([
    'residents',
    'rooms',
    'nutrition',
    'visitors',
    'daily_monitoring',
    'procedures',
    'weight_tracking',
    'incidents',
    'forms',
  ]),
  CAREGIVER: createRolePermissions([
    'nutrition',
    'visitors',
    'incidents',
  ]),
};

const DEFAULT_LANDING_PRIORITY: ModuleKey[] = [
  'rooms',
  'residents',
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
  'profile',
];

export const getModuleByKey = (moduleKey: ModuleKey): ModuleRegistryEntry | undefined =>
  MODULES.find((module) => module.key === moduleKey);

export const getModuleByPath = (pathname: string): ModuleRegistryEntry | undefined =>
  MODULES.find((module) => pathname === module.path || pathname.startsWith(`${module.path}/`));

export const isModuleEnabledForRole = (
  permissions: RolePermissionMap,
  role: Role,
  moduleKey: ManagedModuleKey
): boolean => permissions[role][moduleKey];

export const getSidebarModulesForRole = (
  permissions: RolePermissionMap,
  role: Role
): ModuleRegistryEntry[] =>
  MODULES.filter((module) => {
    if (!module.sidebarVisible) {
      return false;
    }

    if (!module.permissionManaged) {
      return true;
    }

    return isModuleEnabledForRole(permissions, role, module.key);
  });

export const getAccessibleModulesForRole = (
  permissions: RolePermissionMap,
  role: Role
): ModuleRegistryEntry[] =>
  MODULES.filter((module) => {
    if (!module.permissionManaged) {
      return true;
    }

    return isModuleEnabledForRole(permissions, role, module.key);
  });

export const getModuleTitleByPath = (pathname: string): string =>
  getModuleByPath(pathname)?.title ?? 'Chi tiết';

export const getDefaultModulePathForRole = (
  permissions: RolePermissionMap,
  role: Role
): string => {
  const accessibleModuleKeys = new Set(
    getAccessibleModulesForRole(permissions, role).map((module) => module.key)
  );

  for (const moduleKey of DEFAULT_LANDING_PRIORITY) {
    if (accessibleModuleKeys.has(moduleKey)) {
      return getModuleByKey(moduleKey)?.path ?? '/profile';
    }
  }

  return '/profile';
};
