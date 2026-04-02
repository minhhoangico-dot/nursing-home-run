import { create } from 'zustand';
import { db } from '../services/databaseService';
import type { Role, RolePermission, RolePermissionMap } from '../types';

interface PermissionState {
  permissions: RolePermissionMap | null;
  isLoading: boolean;
  error: string | null;
  fetchPermissions: () => Promise<RolePermissionMap>;
  replaceRolePermissions: (role: Role, permissions: RolePermission) => Promise<RolePermissionMap>;
}

export const usePermissionStore = create<PermissionState>((set) => ({
  permissions: null,
  isLoading: false,
  error: null,

  fetchPermissions: async () => {
    set({ isLoading: true, error: null });

    try {
      const permissions = await db.permissions.getRolePermissions();
      set({ permissions, isLoading: false, error: null });
      return permissions;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Không thể tải phân quyền.';
      set({ permissions: null, isLoading: false, error: message });
      throw error;
    }
  },

  replaceRolePermissions: async (role, permissions) => {
    set({ isLoading: true, error: null });

    try {
      const refreshedPermissions = await db.permissions.replaceRolePermissions(role, permissions);
      set({ permissions: refreshedPermissions, isLoading: false, error: null });
      return refreshedPermissions;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Không thể lưu phân quyền.';
      set({ isLoading: false, error: message });
      throw error;
    }
  },
}));
