import React, { useEffect, useState } from 'react';
import { AlertCircle, RotateCcw, Save, ShieldCheck } from 'lucide-react';
import { useToast } from '../../../app/providers';
import { Button } from '../../../components/ui';
import { usePermissionStore } from '../../../stores/permissionStore';
import type { ManagedModuleKey, Role, RolePermission, RolePermissionMap } from '../../../types';

const ROLE_ORDER: Role[] = ['ADMIN', 'DOCTOR', 'SUPERVISOR', 'ACCOUNTANT', 'NURSE', 'CAREGIVER'];

const ROLE_LABELS: Record<Role, string> = {
  ADMIN: 'Quản trị viên',
  DOCTOR: 'Bác sĩ',
  SUPERVISOR: 'Trưởng tầng',
  ACCOUNTANT: 'Kế toán',
  NURSE: 'Điều dưỡng',
  CAREGIVER: 'Hộ lý',
};

const MODULE_DEFINITIONS: { key: ManagedModuleKey; label: string; path: string; sidebarVisible?: boolean }[] = [
  { key: 'residents', label: 'Danh sách NCT', path: '/residents', sidebarVisible: true },
  { key: 'rooms', label: 'Sơ đồ phòng', path: '/rooms', sidebarVisible: true },
  { key: 'nutrition', label: 'Dinh dưỡng', path: '/nutrition', sidebarVisible: true },
  { key: 'visitors', label: 'Khách thăm', path: '/visitors', sidebarVisible: true },
  { key: 'daily_monitoring', label: 'Theo dõi ngày', path: '/daily-monitoring', sidebarVisible: true },
  { key: 'procedures', label: 'Thủ thuật', path: '/procedures', sidebarVisible: true },
  { key: 'weight_tracking', label: 'Theo dõi cân nặng', path: '/weight-tracking' },
  { key: 'incidents', label: 'Sự cố & An toàn', path: '/incidents', sidebarVisible: true },
  { key: 'maintenance', label: 'Bảo trì', path: '/maintenance', sidebarVisible: true },
  { key: 'forms', label: 'In biểu mẫu', path: '/forms', sidebarVisible: true },
  { key: 'finance', label: 'Tài chính', path: '/finance', sidebarVisible: true },
  { key: 'settings', label: 'Cài đặt', path: '/settings', sidebarVisible: true },
];

const clonePermissionMap = (permissions: RolePermissionMap): RolePermissionMap =>
  ROLE_ORDER.reduce((nextPermissions, role) => {
    nextPermissions[role] = { ...permissions[role] };
    return nextPermissions;
  }, {} as RolePermissionMap);

const toErrorMessage = (error: unknown): string =>
  error instanceof Error ? error.message : 'Không thể tải hoặc lưu phân quyền.';

export const RolePermissionsPanel = () => {
  const { addToast } = useToast();
  const { permissions, isLoading, error, fetchPermissions, replaceRolePermissions } = usePermissionStore();
  const [draftPermissions, setDraftPermissions] = useState<RolePermissionMap | null>(null);
  const [dirtyRoles, setDirtyRoles] = useState<Role[]>([]);
  const [savingRole, setSavingRole] = useState<Role | null>(null);

  useEffect(() => {
    if (!permissions && !draftPermissions && !isLoading) {
      fetchPermissions().catch(() => undefined);
    }
  }, [draftPermissions, fetchPermissions, isLoading, permissions]);

  useEffect(() => {
    if (permissions) {
      setDraftPermissions((current) => current ?? clonePermissionMap(permissions));
    }
  }, [permissions]);

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
      setDraftPermissions(clonePermissionMap(refreshedPermissions));
      setDirtyRoles((current) => current.filter((value) => value !== role));
      addToast('success', 'Thành công', `Đã lưu phân quyền cho vai trò ${ROLE_LABELS[role]}.`);
    } catch (saveError) {
      addToast('error', 'Lỗi', toErrorMessage(saveError));
    } finally {
      setSavingRole(null);
    }
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
                {isLoading ? 'Đang tải dữ liệu phân quyền...' : error || 'Không thể tải dữ liệu phân quyền.'}
              </p>
            </div>
            {!isLoading && (
              <Button type="button" variant="secondary" onClick={() => fetchPermissions().catch(() => undefined)}>
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
          Bật hoặc tắt quyền truy cập module cho từng vai trò. Thay đổi chỉ áp dụng sau khi lưu theo từng vai trò.
        </p>
      </div>

      {ROLE_ORDER.map((role) => {
        const rolePermissions = draftPermissions[role];
        const isDirty = dirtyRoles.includes(role);
        const isSaving = savingRole === role;

        return (
          <section key={role} className="rounded-xl border border-slate-100 bg-white shadow-sm">
            <div className="flex flex-col gap-3 border-b border-slate-100 px-6 py-4 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-emerald-100 p-2 text-emerald-600">
                  <ShieldCheck className="h-5 w-5" />
                </div>
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
              {MODULE_DEFINITIONS.map((module) => {
                const isLocked = role === 'ADMIN' && module.key === 'settings';

                return (
                  <label
                    key={`${role}-${module.key}`}
                    className={`flex cursor-pointer items-center justify-between gap-4 px-6 py-4 ${isLocked ? 'bg-slate-50' : 'hover:bg-slate-50'}`}
                  >
                    <div>
                      <p className="font-medium text-slate-800">{module.label}</p>
                      <p className="text-sm text-slate-500">
                        {module.path}
                        {!module.sidebarVisible ? ' · Không hiện trên menu' : ''}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      {isLocked && <span className="text-xs font-medium text-slate-500">Luôn bật</span>}
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
