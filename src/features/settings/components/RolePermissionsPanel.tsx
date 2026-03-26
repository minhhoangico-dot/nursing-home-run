import React, { useEffect, useMemo, useState } from 'react';
import { AlertCircle, RotateCcw, Save } from 'lucide-react';
import { useToast } from '../../../app/providers';
import { Button } from '../../../components/ui';
import { usePermissionStore } from '../../../stores/permissionStore';
import type { ManagedModuleKey, Role, RolePermission, RolePermissionMap } from '../../../types';
import {
  MANAGED_SETTINGS_MODULES,
  ROLE_LABELS,
  ROLE_ORDER,
} from '../lib/userManagement';

const clonePermissionMap = (permissions: RolePermissionMap): RolePermissionMap =>
  ROLE_ORDER.reduce((nextPermissions, role) => {
    nextPermissions[role] = { ...permissions[role] };
    return nextPermissions;
  }, {} as RolePermissionMap);

const toErrorMessage = (error: unknown): string =>
  error instanceof Error ? error.message : 'Không thể tải hoặc lưu phân quyền.';

export const RolePermissionsPanel = () => {
  const { addToast } = useToast();
  const {
    permissions,
    isLoading,
    error,
    fetchPermissions,
    replaceRolePermissions,
  } = usePermissionStore();

  const [draftPermissions, setDraftPermissions] = useState<RolePermissionMap | null>(
    permissions ? clonePermissionMap(permissions) : null
  );
  const [dirtyRoles, setDirtyRoles] = useState<Role[]>([]);
  const [savingRole, setSavingRole] = useState<Role | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    if (permissions && !draftPermissions) {
      setDraftPermissions(clonePermissionMap(permissions));
      setLoadError(null);
    }
  }, [draftPermissions, permissions]);

  useEffect(() => {
    if (!permissions && !draftPermissions && !isLoading) {
      fetchPermissions().catch((fetchError) => {
        setLoadError(toErrorMessage(fetchError));
      });
    }
  }, [draftPermissions, fetchPermissions, isLoading, permissions]);

  const activeLoadError = loadError ?? (!draftPermissions ? error : null);

  const roleDirtyLookup = useMemo(() => new Set(dirtyRoles), [dirtyRoles]);

  const updateRoleDraft = (role: Role, nextRolePermissions: RolePermission) => {
    setDraftPermissions((current) => {
      if (!current) {
        return current;
      }

      return {
        ...current,
        [role]: {
          ...nextRolePermissions,
          ...(role === 'ADMIN' ? { settings: true } : {}),
        },
      };
    });

    setDirtyRoles((current) => (current.includes(role) ? current : [...current, role]));
  };

  const handleToggle = (role: Role, moduleKey: ManagedModuleKey) => {
    if (!draftPermissions || (role === 'ADMIN' && moduleKey === 'settings')) {
      return;
    }

    updateRoleDraft(role, {
      ...draftPermissions[role],
      [moduleKey]: !draftPermissions[role][moduleKey],
    });
  };

  const handleResetRole = (role: Role) => {
    if (!permissions || !draftPermissions) {
      return;
    }

    setDraftPermissions({
      ...draftPermissions,
      [role]: { ...permissions[role] },
    });
    setDirtyRoles((current) => current.filter((value) => value !== role));
  };

  const handleSaveRole = async (role: Role) => {
    if (!draftPermissions) {
      return;
    }

    setSavingRole(role);

    try {
      const refreshedPermissions = await replaceRolePermissions(role, draftPermissions[role]);

      setDraftPermissions((current) => {
        if (!current) {
          return clonePermissionMap(refreshedPermissions);
        }

        const nextDraft = clonePermissionMap(current);

        ROLE_ORDER.forEach((candidateRole) => {
          if (candidateRole === role || !roleDirtyLookup.has(candidateRole)) {
            nextDraft[candidateRole] = { ...refreshedPermissions[candidateRole] };
          }
        });

        return nextDraft;
      });

      setDirtyRoles((current) => current.filter((value) => value !== role));
      addToast('success', 'Thành công', `Đã lưu phân quyền cho vai trò ${ROLE_LABELS[role]}.`);
    } catch (saveError) {
      addToast('error', 'Lỗi', toErrorMessage(saveError));
    } finally {
      setSavingRole(null);
    }
  };

  const handleRetry = () => {
    setLoadError(null);
    fetchPermissions().catch((fetchError) => {
      setLoadError(toErrorMessage(fetchError));
    });
  };

  if (!draftPermissions) {
    return (
      <div className="rounded-xl border border-slate-100 bg-white p-6 shadow-sm">
        <div className="flex items-start gap-3">
          <AlertCircle className="mt-0.5 h-5 w-5 text-amber-500" />
          <div className="space-y-3">
            <div>
              <h3 className="text-lg font-bold text-slate-800">Phân quyền theo vai trò</h3>
              <p className="text-sm text-slate-500">
                {isLoading && !activeLoadError
                  ? 'Đang tải dữ liệu phân quyền...'
                  : activeLoadError || 'Không thể tải dữ liệu phân quyền.'}
              </p>
            </div>
            {!isLoading && (
              <Button type="button" variant="secondary" onClick={handleRetry}>
                Tải lại
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-bold text-slate-800">Phân quyền theo vai trò</h3>
        <p className="text-sm text-slate-500">
          Bật hoặc tắt quyền truy cập module cho từng vai trò. Thay đổi chỉ áp dụng sau khi lưu
          theo từng vai trò.
        </p>
      </div>

      {activeLoadError && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
          {activeLoadError}
        </div>
      )}

      {ROLE_ORDER.map((role) => {
        const rolePermissions = draftPermissions[role];
        const isDirty = dirtyRoles.includes(role);
        const isSaving = savingRole === role;

        return (
          <section key={role} className="rounded-xl border border-slate-100 bg-white shadow-sm">
            <div className="flex flex-col gap-3 border-b border-slate-100 px-6 py-4 md:flex-row md:items-center md:justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-base font-semibold text-slate-800">{ROLE_LABELS[role]}</h4>
                  {isDirty && (
                    <span className="inline-flex rounded-full bg-amber-100 px-2 py-1 text-xs font-medium text-amber-700">
                      Chưa lưu
                    </span>
                  )}
                </div>
                <p className="text-sm text-slate-500">Áp dụng cho toàn bộ người dùng thuộc vai trò này.</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  icon={<RotateCcw className="h-4 w-4" />}
                  onClick={() => handleResetRole(role)}
                  disabled={!isDirty || isSaving}
                >
                  Hoàn tác
                </Button>
                <Button
                  type="button"
                  size="sm"
                  icon={<Save className="h-4 w-4" />}
                  onClick={() => handleSaveRole(role)}
                  disabled={!isDirty || isSaving}
                >
                  {isSaving ? 'Đang lưu...' : 'Lưu thay đổi'}
                </Button>
              </div>
            </div>

            <div className="divide-y divide-slate-100">
              {MANAGED_SETTINGS_MODULES.map((module) => {
                const isLocked = role === 'ADMIN' && module.key === 'settings';

                return (
                  <label
                    key={`${role}-${module.key}`}
                    className={`flex cursor-pointer items-center justify-between gap-4 px-6 py-4 ${
                      isLocked ? 'bg-slate-50' : 'hover:bg-slate-50'
                    }`}
                  >
                    <div>
                      <p className="font-medium text-slate-800">{module.label}</p>
                      <p className="text-sm text-slate-500">
                        {module.path}
                        {!module.sidebarVisible ? ' · Khong hien tren menu' : ''}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      {isLocked && (
                        <span className="text-xs font-medium text-slate-500">Luon bat</span>
                      )}
                      <input
                        type="checkbox"
                        className="h-5 w-5 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                        checked={rolePermissions[module.key]}
                        onChange={() => handleToggle(role, module.key)}
                        disabled={isLocked || isSaving}
                      />
                    </div>
                  </label>
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
};
