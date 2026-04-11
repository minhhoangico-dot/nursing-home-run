import React, { useEffect, useState } from 'react';
import { RotateCcw, Save } from 'lucide-react';
import { Button } from '../../../components/ui';
import { Card } from '../../../components/ui/Card';
import type { ModuleKey, RoleModulePermissionMatrix } from '@/src/types/appSettings';
import type { Role } from '@/src/types/user';
import {
  DEFAULT_ROLE_MODULE_PERMISSIONS,
  normalizeRoleModulePermissions,
} from '@/src/utils/modulePermissions';

interface ModulePermissionsConfigProps {
  value: RoleModulePermissionMatrix;
  isSaving: boolean;
  onSave: (nextValue: RoleModulePermissionMatrix) => Promise<void> | void;
  onReset: () => void;
}

const ROLE_LABELS: Record<Role, string> = {
  ADMIN: 'Quản trị viên',
  DOCTOR: 'Bác sĩ',
  SUPERVISOR: 'Trưởng tầng',
  ACCOUNTANT: 'Kế toán',
  NURSE: 'Điều dưỡng',
  CAREGIVER: 'Hộ lý',
};

const MODULE_LABELS: Record<Exclude<ModuleKey, 'finance'>, string> = {
  settings: 'Cài đặt',
  residents: 'Hồ sơ NCT',
  rooms: 'Sơ đồ phòng',
  visitors: 'Khách thăm',
  dailyMonitoring: 'Theo dõi ngày',
  medications: 'Thuốc',
  procedures: 'Thủ thuật',
  nutrition: 'Dinh dưỡng',
  maintenance: 'Bảo trì',
  incidents: 'Sự cố',
  forms: 'Biểu mẫu',
  weightTracking: 'Cân nặng',
};

const ROLE_ORDER = Object.keys(DEFAULT_ROLE_MODULE_PERMISSIONS) as Role[];
const VISIBILITY_MODULES = Object.keys(MODULE_LABELS) as Array<Exclude<ModuleKey, 'finance'>>;

const clonePermissions = (value: RoleModulePermissionMatrix) =>
  normalizeRoleModulePermissions(structuredClone(value));

export const ModulePermissionsConfig = ({
  value,
  isSaving,
  onSave,
  onReset,
}: ModulePermissionsConfigProps) => {
  const [draft, setDraft] = useState<RoleModulePermissionMatrix>(() => clonePermissions(value));

  useEffect(() => {
    setDraft(clonePermissions(value));
  }, [value]);

  const updateVisibility = (role: Role, moduleKey: Exclude<ModuleKey, 'finance'>) => {
    if (role === 'ADMIN' && moduleKey === 'settings') {
      return;
    }

    setDraft((current) => ({
      ...current,
      [role]: {
        ...current[role],
        [moduleKey]: {
          visible: !current[role][moduleKey].visible,
        },
      },
    }));
  };

  const updateFinanceView = (role: Role) => {
    if (role === 'ADMIN') {
      return;
    }

    setDraft((current) => {
      const nextView = !current[role].finance.view;
      return {
        ...current,
        [role]: {
          ...current[role],
          finance: {
            view: nextView,
            edit: nextView ? current[role].finance.edit : false,
          },
        },
      };
    });
  };

  const updateFinanceEdit = (role: Role) => {
    if (role === 'ADMIN') {
      return;
    }

    setDraft((current) => {
      const nextEdit = !current[role].finance.edit;
      return {
        ...current,
        [role]: {
          ...current[role],
          finance: {
            view: nextEdit ? true : current[role].finance.view,
            edit: nextEdit,
          },
        },
      };
    });
  };

  const handleSave = () => onSave(normalizeRoleModulePermissions(draft));

  const handleReset = () => {
    setDraft(clonePermissions(DEFAULT_ROLE_MODULE_PERMISSIONS));
    onReset();
  };

  return (
    <Card
      title="Phân quyền module"
      footer={(
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="secondary"
            icon={<RotateCcw className="h-4 w-4" />}
            onClick={handleReset}
            disabled={isSaving}
          >
            Khôi phục mặc định
          </Button>
          <Button
            type="button"
            icon={<Save className="h-4 w-4" />}
            onClick={() => void handleSave()}
            disabled={isSaving}
          >
            {isSaving ? 'Đang lưu...' : 'Lưu thay đổi'}
          </Button>
        </div>
      )}
    >
      <div className="space-y-4">
        <div className="text-sm text-slate-500">
          Bật hoặc tắt từng module cho mỗi role. Riêng tài chính có hai mức quyền:
          xem và sửa.
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-[1200px] w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-600">
                <th className="sticky left-0 bg-slate-50 px-4 py-3 text-left font-semibold">
                  Vai trò
                </th>
                <th className="px-4 py-3 text-center font-semibold" colSpan={2}>
                  Tài chính
                </th>
                {VISIBILITY_MODULES.map((moduleKey) => (
                  <th key={moduleKey} className="px-4 py-3 text-center font-semibold">
                    {MODULE_LABELS[moduleKey]}
                  </th>
                ))}
              </tr>
              <tr className="border-b border-slate-200 bg-slate-50 text-xs text-slate-500">
                <th className="sticky left-0 bg-slate-50 px-4 py-2 text-left font-medium">
                  &nbsp;
                </th>
                <th className="px-4 py-2 text-center font-medium">Xem</th>
                <th className="px-4 py-2 text-center font-medium">Sửa</th>
                {VISIBILITY_MODULES.map((moduleKey) => (
                  <th key={`${moduleKey}-visible`} className="px-4 py-2 text-center font-medium">
                    Hiện
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ROLE_ORDER.map((role) => (
                <tr key={role} className="border-b border-slate-100 last:border-b-0">
                  <td className="sticky left-0 bg-white px-4 py-3 font-semibold text-slate-800">
                    {ROLE_LABELS[role]}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <input
                      type="checkbox"
                      aria-label={`${role}-finance-view`}
                      checked={draft[role].finance.view}
                      disabled={role === 'ADMIN'}
                      onChange={() => updateFinanceView(role)}
                    />
                  </td>
                  <td className="px-4 py-3 text-center">
                    <input
                      type="checkbox"
                      aria-label={`${role}-finance-edit`}
                      checked={draft[role].finance.edit}
                      disabled={role === 'ADMIN'}
                      onChange={() => updateFinanceEdit(role)}
                    />
                  </td>
                  {VISIBILITY_MODULES.map((moduleKey) => (
                    <td key={`${role}-${moduleKey}`} className="px-4 py-3 text-center">
                      <input
                        type="checkbox"
                        aria-label={`${role}-${moduleKey}-visible`}
                        checked={draft[role][moduleKey].visible}
                        disabled={role === 'ADMIN' && moduleKey === 'settings'}
                        onChange={() => updateVisibility(role, moduleKey)}
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Card>
  );
};
