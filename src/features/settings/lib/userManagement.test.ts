import { describe, expect, it } from 'vitest';
import type { User } from '../../../types';
import {
  MANAGED_SETTINGS_MODULES,
  ROLE_ORDER,
  sortUsersForManagement,
  translateUserMutationError,
} from './userManagement';

describe('user management helpers', () => {
  it('translates duplicate username errors into actionable feedback', () => {
    expect(translateUserMutationError(new Error('duplicate key value violates unique constraint "users_username_key"'))).toBe(
      'Ten dang nhap da ton tai. Vui long chon ten khac.'
    );

    expect(translateUserMutationError(new Error('Username already exists'))).toBe(
      'Ten dang nhap da ton tai. Vui long chon ten khac.'
    );
  });

  it('sorts active users ahead of inactive users, then by name', () => {
    const users: User[] = [
      { id: '3', name: 'Zed', username: 'zed', role: 'NURSE', isActive: false },
      { id: '2', name: 'An', username: 'an', role: 'DOCTOR', isActive: true },
      { id: '1', name: 'Binh', username: 'binh', role: 'ADMIN', isActive: true },
    ];

    expect(sortUsersForManagement(users).map((user) => user.id)).toEqual(['2', '1', '3']);
  });

  it('keeps fixed role order and excludes non-managed modules from the settings matrix', () => {
    expect(ROLE_ORDER).toEqual([
      'ADMIN',
      'DOCTOR',
      'SUPERVISOR',
      'ACCOUNTANT',
      'NURSE',
      'CAREGIVER',
    ]);

    expect(MANAGED_SETTINGS_MODULES.map((module) => module.key)).not.toContain('profile');
    expect(MANAGED_SETTINGS_MODULES.at(-1)?.key).toBe('settings');
  });
});
