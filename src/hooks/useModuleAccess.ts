import { useAppSettingsStore } from '@/src/stores/appSettingsStore';
import { useAuthStore } from '@/src/stores/authStore';
import type { ModuleKey } from '@/src/types/appSettings';
import { getRoleModuleAccess } from '@/src/utils/modulePermissions';

export const useModuleAccess = (moduleKey: ModuleKey) => {
  const { user } = useAuthStore();
  const { permissions } = useAppSettingsStore();

  if (!user) {
    return {
      mode: 'restricted' as const,
      visible: false,
      canViewFinance: false,
      canEditFinance: false,
    };
  }

  return getRoleModuleAccess(user.role, permissions, moduleKey);
};
