import { BUILDING_STRUCTURE } from '../../../constants/facility';
import { MODULES } from '../../../constants/modules';
import type { ManagedModuleKey, Role, User } from '../../../types';

export const ROLE_ORDER: Role[] = [
  'ADMIN',
  'DOCTOR',
  'SUPERVISOR',
  'ACCOUNTANT',
  'NURSE',
  'CAREGIVER',
];

export const ROLE_LABELS: Record<Role, string> = {
  ADMIN: 'Quan tri vien',
  DOCTOR: 'Bac si',
  SUPERVISOR: 'Truong tang',
  ACCOUNTANT: 'Ke toan',
  NURSE: 'Dieu duong',
  CAREGIVER: 'Ho ly',
};

export const ROLE_OPTIONS = ROLE_ORDER.map((value) => ({
  value,
  label: ROLE_LABELS[value],
}));

export const USER_STATUS_OPTIONS = [
  { value: 'active', label: 'Dang hoat dong' },
  { value: 'inactive', label: 'Ngung hoat dong' },
] as const;

export const FLOOR_OPTIONS = Array.from(
  new Set(BUILDING_STRUCTURE.flatMap((building) => building.floors))
).map((floor) => ({
  value: floor,
  label: floor,
}));

export const ROLE_BADGE_CLASSES: Record<Role, string> = {
  ADMIN: 'bg-slate-800 text-white',
  DOCTOR: 'bg-blue-100 text-blue-700',
  SUPERVISOR: 'bg-green-100 text-green-700',
  ACCOUNTANT: 'bg-purple-100 text-purple-700',
  NURSE: 'bg-amber-100 text-amber-700',
  CAREGIVER: 'bg-pink-100 text-pink-700',
};

export const MANAGED_SETTINGS_MODULES = MODULES.filter(
  (module): module is typeof MODULES[number] & { key: ManagedModuleKey } => module.permissionManaged
);

export const requiresFloor = (role: Role): boolean => role === 'SUPERVISOR';

export const sortUsersForManagement = (users: User[]): User[] =>
  [...users].sort((left, right) => {
    const leftActive = left.isActive !== false ? 1 : 0;
    const rightActive = right.isActive !== false ? 1 : 0;

    if (leftActive !== rightActive) {
      return rightActive - leftActive;
    }

    return left.name.localeCompare(right.name, 'vi');
  });

export const translateUserMutationError = (error: unknown): string => {
  const rawMessage =
    error instanceof Error ? error.message : typeof error === 'string' ? error : '';
  const normalized = rawMessage.toLowerCase();

  if (
    normalized.includes('duplicate') ||
    normalized.includes('already exists') ||
    normalized.includes('users_username_key')
  ) {
    return 'Ten dang nhap da ton tai. Vui long chon ten khac.';
  }

  if (normalized.includes('you cannot change your own role')) {
    return 'Khong the thay doi vai tro cua chinh ban.';
  }

  if (normalized.includes('you cannot deactivate your own account')) {
    return 'Khong the ngung hoat dong chinh tai khoan cua ban.';
  }

  return rawMessage || 'Da xay ra loi. Vui long thu lai.';
};
