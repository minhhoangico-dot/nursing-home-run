import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { RolePermission } from '../types';

const { fromMock } = vi.hoisted(() => ({
  fromMock: vi.fn(),
}));

vi.mock('../lib/supabase', () => ({
  supabase: {
    from: fromMock,
  },
}));

import { db } from './databaseService';
import { medicalService } from './medicalService';

type QueryResult<T> = Promise<{ data: T; error: null }>;

const createUsersSelectBuilder = (rows: unknown[]): { select: ReturnType<typeof vi.fn> } => ({
  select: vi.fn(() => Promise.resolve({ data: rows, error: null })),
});

const createUsersInsertBuilder = (result: unknown) => {
  const builder = {
    insert: vi.fn(() => ({
      select: vi.fn(() => ({
        single: vi.fn(() => Promise.resolve({ data: result, error: null })),
      })),
    })),
  };

  return builder;
};

const createUsersUpdateBuilder = (result: unknown) => {
  const single = vi.fn(() => Promise.resolve({ data: result, error: null }));
  const select = vi.fn(() => ({ single }));
  const eq = vi.fn(() => ({ select }));
  const update = vi.fn(() => ({ eq }));

  return { update, eq, select, single };
};

const createPermissionsSelectBuilder = (rows: unknown[]) => {
  const order = vi.fn(() => Promise.resolve({ data: rows, error: null }));
  const eq = vi.fn(() => ({ order }));
  const select = vi.fn(() => ({ eq, order }));

  return { select, eq, order };
};

const createPermissionsUpsertBuilder = () => ({
  upsert: vi.fn(() => Promise.resolve({ data: null, error: null })),
});

const createMaintenanceSelectBuilder = (rows: unknown[]) => ({
  select: vi.fn(() => ({
    order: vi.fn(() => Promise.resolve({ data: rows, error: null })),
  })),
});

describe('medicalService user and permission contracts', () => {
  beforeEach(() => {
    fromMock.mockReset();
  });

  it('maps user activity metadata from the database and exposes explicit db methods', async () => {
    fromMock.mockImplementation((table: string) => {
      if (table === 'users') {
        return createUsersSelectBuilder([
          {
            id: 'user-7',
            name: 'Alice',
            username: 'alice',
            password: 'secret',
            role: 'ADMIN',
            floor: 'Tầng 2',
            avatar: 'alice.png',
            is_active: false,
            created_at: '2026-03-25T10:00:00.000Z',
            updated_at: '2026-03-26T10:00:00.000Z',
          },
        ]);
      }

      throw new Error(`Unexpected table ${table}`);
    });

    const users = await medicalService.users.getAll();

    expect(users).toEqual([
      expect.objectContaining({
        id: 'user-7',
        name: 'Alice',
        username: 'alice',
        password: 'secret',
        role: 'ADMIN',
        floor: 'Tầng 2',
        avatar: 'alice.png',
        isActive: false,
        updatedAt: '2026-03-26T10:00:00.000Z',
      }),
    ]);
    expect(typeof db.users.create).toBe('function');
    expect(typeof db.users.update).toBe('function');
    expect(typeof db.users.deactivate).toBe('function');
    expect(typeof db.users.reactivate).toBe('function');
    expect(typeof db.users.resetPassword).toBe('function');
    expect(typeof db.permissions.getRolePermissions).toBe('function');
    expect(typeof db.permissions.replaceRolePermissions).toBe('function');
    expect(typeof db.schedules.getAll).toBe('function');
    expect(typeof db.activities.getAll).toBe('function');
    expect(typeof db.handovers.getAll).toBe('function');
  });

  it('writes explicit user mutations with database field names', async () => {
    const createBuilder = createUsersInsertBuilder({
      id: 'u1',
      name: 'Alice',
      username: 'alice',
      role: 'ADMIN',
      is_active: true,
      updated_at: '2026-03-26T10:00:00.000Z',
    });
    const updateBuilder = createUsersUpdateBuilder({
      id: 'u1',
      name: 'Alice Updated',
      username: 'alice',
      role: 'ADMIN',
      is_active: true,
      updated_at: '2026-03-26T11:00:00.000Z',
    });
    const deactivateBuilder = createUsersUpdateBuilder({
      id: 'u1',
      is_active: false,
    });
    const reactivateBuilder = createUsersUpdateBuilder({
      id: 'u1',
      is_active: true,
    });
    const resetPasswordBuilder = createUsersUpdateBuilder({
      id: 'u1',
      password: 'next-secret',
    });

    fromMock
      .mockReturnValueOnce(createBuilder)
      .mockReturnValueOnce(updateBuilder)
      .mockReturnValueOnce(deactivateBuilder)
      .mockReturnValueOnce(reactivateBuilder)
      .mockReturnValueOnce(resetPasswordBuilder);

    await medicalService.users.create({
      id: 'u1',
      name: 'Alice',
      username: 'alice',
      role: 'ADMIN',
      isActive: true,
      updatedAt: '2026-03-26T10:00:00.000Z',
    });
    await medicalService.users.update({
      id: 'u1',
      name: 'Alice Updated',
      username: 'alice',
      role: 'ADMIN',
      isActive: true,
      updatedAt: '2026-03-26T11:00:00.000Z',
    });
    await medicalService.users.deactivate('u1');
    await medicalService.users.reactivate('u1');
    await medicalService.users.resetPassword('u1', 'next-secret');

    expect(createBuilder.insert).toHaveBeenCalledWith({
      id: 'u1',
      name: 'Alice',
      username: 'alice',
      password: undefined,
      role: 'ADMIN',
      floor: undefined,
      avatar: undefined,
      is_active: true,
      updated_at: '2026-03-26T10:00:00.000Z',
    });
    expect(updateBuilder.update).toHaveBeenCalledWith({
      id: 'u1',
      name: 'Alice Updated',
      username: 'alice',
      password: undefined,
      role: 'ADMIN',
      floor: undefined,
      avatar: undefined,
      is_active: true,
      updated_at: '2026-03-26T11:00:00.000Z',
    });
    expect(updateBuilder.eq).toHaveBeenCalledWith('id', 'u1');
    expect(deactivateBuilder.update).toHaveBeenCalledWith({ is_active: false });
    expect(reactivateBuilder.update).toHaveBeenCalledWith({ is_active: true });
    expect(resetPasswordBuilder.update).toHaveBeenCalledWith({ password: 'next-secret' });
  });

  it('reads and replaces the role permission matrix through the dedicated permissions service', async () => {
    const selectBuilder = createPermissionsSelectBuilder([
      { role: 'ADMIN', module_key: 'settings', is_enabled: true },
      { role: 'ADMIN', module_key: 'finance', is_enabled: false },
      { role: 'DOCTOR', module_key: 'settings', is_enabled: false },
    ]);
    const upsertBuilder = createPermissionsUpsertBuilder();

    fromMock.mockReturnValueOnce(selectBuilder).mockReturnValueOnce(upsertBuilder);

    const permissions = await medicalService.permissions.getRolePermissions();
    const nextPermissions: RolePermission = {
      settings: true,
      finance: false,
      residents: true,
      rooms: true,
      nutrition: true,
      visitors: true,
      dailyMonitoring: true,
      medications: true,
      procedures: true,
      weightTracking: true,
      incidents: true,
      maintenance: true,
      forms: true,
    };

    await medicalService.permissions.replaceRolePermissions('ADMIN', nextPermissions);

    expect(permissions.ADMIN.settings).toBe(true);
    expect(permissions.ADMIN.finance).toBe(false);
    expect(permissions.DOCTOR.settings).toBe(false);
    expect(upsertBuilder.upsert).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({ role: 'ADMIN', module_key: 'settings', is_enabled: true }),
        expect.objectContaining({ role: 'ADMIN', module_key: 'finance', is_enabled: false }),
      ])
    );
  });

  it('keeps maintenance cost zero when reading rows from the database', async () => {
    fromMock.mockImplementation((table: string) => {
      if (table === 'maintenance_requests') {
        return createMaintenanceSelectBuilder([
          {
            id: 'm1',
            title: 'Fix rail',
            description: 'Tighten the bed rail',
            location: 'Room 201',
            priority: 'LOW',
            status: 'OPEN',
            reporter: 'Alice',
            assignee: 'Bob',
            created_at: '2026-03-26T12:00:00.000Z',
            completed_at: null,
            cost: 0,
            note: 'No parts needed',
          },
        ]);
      }

      throw new Error(`Unexpected table ${table}`);
    });

    const requests = await medicalService.maintenance.getAll();

    expect(requests).toEqual([
      expect.objectContaining({
        id: 'm1',
        cost: 0,
      }),
    ]);
  });
});
