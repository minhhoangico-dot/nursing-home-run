import type {
  FacilityInfo,
  FinanceModulePermission,
  ModuleAccessMode,
  ModuleKey,
  ModuleVisibilityPermission,
  RoleModulePermissionMatrix,
  RoleModulePermissions,
} from '../types/appSettings';
import type { Role } from '../types/user';

const VISIBILITY_MODULES: ModuleKey[] = [
  'settings',
  'residents',
  'rooms',
  'visitors',
  'dailyMonitoring',
  'procedures',
  'nutrition',
  'maintenance',
  'incidents',
  'forms',
  'weightTracking',
];

const ROLE_ORDER: Role[] = ['ADMIN', 'DOCTOR', 'SUPERVISOR', 'ACCOUNTANT', 'NURSE', 'CAREGIVER'];

const visible = (isVisible: boolean): ModuleVisibilityPermission => ({ visible: isVisible });

const finance = (viewEnabled: boolean, editEnabled: boolean): FinanceModulePermission => ({
  view: viewEnabled,
  edit: editEnabled,
});

const buildRolePermissions = (
  visibleModules: ModuleKey[],
  financePermission: FinanceModulePermission,
): RoleModulePermissions => {
  const moduleVisibility = VISIBILITY_MODULES.reduce<Record<ModuleKey, ModuleVisibilityPermission>>(
    (result, moduleKey) => {
      result[moduleKey] = visible(visibleModules.includes(moduleKey));
      return result;
    },
    {} as Record<ModuleKey, ModuleVisibilityPermission>,
  );

  return {
    settings: moduleVisibility.settings,
    finance: financePermission,
    residents: moduleVisibility.residents,
    rooms: moduleVisibility.rooms,
    visitors: moduleVisibility.visitors,
    dailyMonitoring: moduleVisibility.dailyMonitoring,
    procedures: moduleVisibility.procedures,
    nutrition: moduleVisibility.nutrition,
    maintenance: moduleVisibility.maintenance,
    incidents: moduleVisibility.incidents,
    forms: moduleVisibility.forms,
    weightTracking: moduleVisibility.weightTracking,
  };
};

export const DEFAULT_FACILITY_INFO: FacilityInfo = {
  name: 'Vien Duong Lao FDC',
  address: '123 Duong ABC, Quan 7, TP.HCM',
  phone: '028 1234 5678',
  email: 'contact@fdc.vn',
  taxCode: '0123456789',
  logoDataUrl: '',
};

export const DEFAULT_ROLE_MODULE_PERMISSIONS: RoleModulePermissionMatrix = {
  ADMIN: buildRolePermissions(VISIBILITY_MODULES, finance(true, true)),
  DOCTOR: buildRolePermissions(
    [
      'residents',
      'rooms',
      'visitors',
      'dailyMonitoring',
      'procedures',
      'nutrition',
      'maintenance',
      'incidents',
      'forms',
      'weightTracking',
    ],
    finance(false, false),
  ),
  SUPERVISOR: buildRolePermissions(
    [
      'residents',
      'rooms',
      'visitors',
      'dailyMonitoring',
      'procedures',
      'nutrition',
      'maintenance',
      'incidents',
      'forms',
      'weightTracking',
    ],
    finance(false, false),
  ),
  ACCOUNTANT: buildRolePermissions(['residents', 'rooms', 'maintenance'], finance(true, true)),
  NURSE: buildRolePermissions(
    [
      'residents',
      'rooms',
      'visitors',
      'dailyMonitoring',
      'procedures',
      'nutrition',
      'incidents',
      'forms',
      'weightTracking',
    ],
    finance(false, false),
  ),
  CAREGIVER: buildRolePermissions(['visitors', 'nutrition'], finance(false, false)),
};

const normalizeSingleRolePermissions = (permissions: RoleModulePermissions): RoleModulePermissions => {
  const financePermission = permissions.finance.view
    ? permissions.finance
    : { view: false, edit: false };

  return {
    ...permissions,
    finance: financePermission,
  };
};

export const normalizeRoleModulePermissions = (
  permissions: RoleModulePermissionMatrix,
): RoleModulePermissionMatrix => {
  const normalized = ROLE_ORDER.reduce<RoleModulePermissionMatrix>((result, role) => {
    const source = permissions[role] ?? DEFAULT_ROLE_MODULE_PERMISSIONS[role];
    result[role] = normalizeSingleRolePermissions(source);
    return result;
  }, {} as RoleModulePermissionMatrix);

  normalized.ADMIN.settings = visible(true);
  normalized.ADMIN.finance = finance(true, true);

  return normalized;
};

export const getModuleAccessMode = (
  moduleKey: ModuleKey,
  isModuleVisible: boolean,
): ModuleAccessMode => {
  if (isModuleVisible) {
    return 'full';
  }

  if (moduleKey === 'residents' || moduleKey === 'rooms') {
    return 'readOnly';
  }

  return 'restricted';
};
