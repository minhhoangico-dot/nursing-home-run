import { create } from 'zustand';
import { DEFAULT_ROLE_PERMISSIONS } from '../constants/modules';
import { getModuleAccess as getModuleAccessLevel, type ModuleAccessLevel } from '../lib/moduleAccess';
import { db } from '../services/databaseService';
import type { ManagedModuleKey, Role, RolePermission, RolePermissionMap } from '../types';

const normalizeRolePermissions = (role: Role, permissions: RolePermission): RolePermission => {
    const normalized = {
        ...DEFAULT_ROLE_PERMISSIONS[role],
        ...permissions,
    };

    if (role === 'ADMIN') {
        normalized.settings = true;
    }

    return normalized;
};

const getResolvedModuleAccess = (
    permissions: RolePermissionMap | null,
    role: Role,
    moduleKey: ManagedModuleKey
): ModuleAccessLevel => getModuleAccessLevel(permissions, role, moduleKey);

interface PermissionState {
    permissions: RolePermissionMap | null;
    isLoading: boolean;
    error: string | null;
    getModuleAccess: (role: Role, moduleKey: ManagedModuleKey) => ModuleAccessLevel;
    canAccessModule: (role: Role, moduleKey: ManagedModuleKey) => boolean;
    canWriteModule: (role: Role, moduleKey: ManagedModuleKey) => boolean;
    fetchPermissions: () => Promise<RolePermissionMap>;
    replaceRolePermissions: (role: Role, permissions: RolePermission) => Promise<RolePermissionMap>;
}

export const usePermissionStore = create<PermissionState>((set, get) => ({
    permissions: null,
    isLoading: false,
    error: null,
    getModuleAccess: (role, moduleKey) => getResolvedModuleAccess(get().permissions, role, moduleKey),
    canAccessModule: (role, moduleKey) => getResolvedModuleAccess(get().permissions, role, moduleKey) !== 'none',
    canWriteModule: (role, moduleKey) => getResolvedModuleAccess(get().permissions, role, moduleKey) === 'full',

    fetchPermissions: async () => {
        set({ isLoading: true, error: null });

        try {
            const permissions = await db.permissions.getRolePermissions();
            set({ permissions, isLoading: false, error: null });
            return permissions;
        } catch (error) {
            const message = (error as Error).message;
            set({ permissions: null, isLoading: false, error: message });
            throw error;
        }
    },

    replaceRolePermissions: async (role, permissions) => {
        set({ isLoading: true, error: null });

        try {
            const nextPermissions = normalizeRolePermissions(role, permissions);
            await db.permissions.replaceRolePermissions(role, nextPermissions);
            const refreshedPermissions = await db.permissions.getRolePermissions();
            set({ permissions: refreshedPermissions, isLoading: false, error: null });
            return refreshedPermissions;
        } catch (error) {
            const message = (error as Error).message;
            set({ isLoading: false, error: message });
            throw error;
        }
    },
}));
