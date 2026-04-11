import { create } from 'zustand';
import { MODULE_KEYS } from '@/src/constants/moduleRegistry';
import { appSettingsService } from '@/src/services/appSettingsService';
import type { FacilityInfo, RoleModulePermissionMatrix } from '@/src/types/appSettings';
import type { Role } from '@/src/types/user';
import {
  DEFAULT_FACILITY_INFO,
  DEFAULT_ROLE_MODULE_PERMISSIONS,
  normalizeRoleModulePermissions,
} from '@/src/utils/modulePermissions';

const FACILITY_BRANDING_KEY = 'facility_branding';
const ROLE_MODULE_PERMISSIONS_KEY = 'role_module_permissions';

type AppSettingsDataState = {
  facility: FacilityInfo;
  permissions: RoleModulePermissionMatrix;
  isLoading: boolean;
  isSaving: boolean;
  usedFallbackDefaults: boolean;
  lastLoadError: string | null;
};

type AppSettingsStore = AppSettingsDataState & {
  fetchSettings: () => Promise<void>;
  saveFacility: (facility: FacilityInfo) => Promise<void>;
  savePermissions: (permissions: RoleModulePermissionMatrix) => Promise<void>;
};

const cloneDefaultFacility = (): FacilityInfo => ({ ...DEFAULT_FACILITY_INFO });

const cloneDefaultPermissions = (): RoleModulePermissionMatrix =>
  normalizeRoleModulePermissions(structuredClone(DEFAULT_ROLE_MODULE_PERMISSIONS));

export const createInitialAppSettingsState = (): AppSettingsDataState => ({
  facility: cloneDefaultFacility(),
  permissions: cloneDefaultPermissions(),
  isLoading: false,
  isSaving: false,
  usedFallbackDefaults: false,
  lastLoadError: null,
});

const getErrorMessage = (error: unknown) =>
  error instanceof Error ? error.message : 'Unknown app settings error';

const mergeFacility = (value: unknown): FacilityInfo => {
  if (!value || typeof value !== 'object') {
    return cloneDefaultFacility();
  }

  return {
    ...cloneDefaultFacility(),
    ...(value as Partial<FacilityInfo>),
  };
};

const mergePermissions = (value: unknown): RoleModulePermissionMatrix => {
  const defaults = cloneDefaultPermissions();

  if (!value || typeof value !== 'object') {
    return defaults;
  }

  const rawPermissions = value as Partial<Record<Role, Record<string, unknown>>>;

  for (const role of Object.keys(defaults) as Role[]) {
    const roleInput = rawPermissions[role];

    if (!roleInput || typeof roleInput !== 'object') {
      continue;
    }

    const roleDefaults = defaults[role] as unknown as Record<string, unknown>;

    for (const moduleKey of MODULE_KEYS) {
      const nextPermission = roleInput[moduleKey];

      if (!nextPermission || typeof nextPermission !== 'object') {
        continue;
      }

      roleDefaults[moduleKey] = {
        ...(roleDefaults[moduleKey] as Record<string, unknown>),
        ...(nextPermission as Record<string, unknown>),
      };
    }
  }

  return normalizeRoleModulePermissions(defaults);
};

export const useAppSettingsStore = create<AppSettingsStore>((set) => ({
  ...createInitialAppSettingsState(),

  fetchSettings: async () => {
    set({ isLoading: true, lastLoadError: null });

    try {
      const settings = await appSettingsService.fetchMany([
        FACILITY_BRANDING_KEY,
        ROLE_MODULE_PERMISSIONS_KEY,
      ]);

      set({
        facility: mergeFacility(settings[FACILITY_BRANDING_KEY]),
        permissions: mergePermissions(settings[ROLE_MODULE_PERMISSIONS_KEY]),
        isLoading: false,
        usedFallbackDefaults:
          settings[FACILITY_BRANDING_KEY] === undefined ||
          settings[ROLE_MODULE_PERMISSIONS_KEY] === undefined,
        lastLoadError: null,
      });
    } catch (error) {
      set({
        ...createInitialAppSettingsState(),
        isLoading: false,
        usedFallbackDefaults: true,
        lastLoadError: getErrorMessage(error),
      });
    }
  },

  saveFacility: async (facility) => {
    const normalizedFacility = mergeFacility(facility);
    set({ isSaving: true });

    try {
      await appSettingsService.upsertSetting(FACILITY_BRANDING_KEY, normalizedFacility);
      set({
        facility: normalizedFacility,
        isSaving: false,
        lastLoadError: null,
      });
    } catch (error) {
      set({
        isSaving: false,
        lastLoadError: getErrorMessage(error),
      });
      throw error;
    }
  },

  savePermissions: async (permissions) => {
    const normalizedPermissions = normalizeRoleModulePermissions(permissions);
    set({ isSaving: true });

    try {
      await appSettingsService.upsertSetting(ROLE_MODULE_PERMISSIONS_KEY, normalizedPermissions);
      set({
        permissions: normalizedPermissions,
        isSaving: false,
        lastLoadError: null,
      });
    } catch (error) {
      set({
        isSaving: false,
        lastLoadError: getErrorMessage(error),
      });
      throw error;
    }
  },
}));
