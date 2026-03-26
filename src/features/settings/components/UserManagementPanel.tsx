import React from 'react';
import { Edit2, KeyRound, Plus, Power, RotateCcw } from 'lucide-react';
import { Button } from '../../../components/ui';
import type { User } from '../../../types';
import {
  ROLE_BADGE_CLASSES,
  ROLE_LABELS,
  sortUsersForManagement,
} from '../lib/userManagement';

interface UserManagementPanelProps {
  users: User[];
  currentUserId?: string;
  onCreate: () => void;
  onEdit: (user: User) => void;
  onResetPassword: (user: User) => void;
  onToggleActive: (user: User) => void;
  busyUserId?: string | null;
}

const getStatusClasses = (isActive: boolean) =>
  isActive
    ? 'bg-emerald-100 text-emerald-700'
    : 'bg-slate-200 text-slate-600';

export const UserManagementPanel = ({
  users,
  currentUserId,
  onCreate,
  onEdit,
  onResetPassword,
  onToggleActive,
  busyUserId,
}: UserManagementPanelProps) => {
  const sortedUsers = sortUsersForManagement(users);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-bold text-slate-800">Quản lý người dùng</h3>
          <p className="text-sm text-slate-500">
            Tạo, cập nhật, khóa tài khoản và đặt lại mật khẩu cho nhân sự nội bộ.
          </p>
        </div>
        <Button icon={<Plus className="h-4 w-4" />} onClick={onCreate}>
          Thêm người dùng
        </Button>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-100 bg-white shadow-sm">
        <table className="hidden w-full text-left text-sm md:table">
          <thead className="bg-slate-50 text-slate-500">
            <tr>
              <th className="px-6 py-3 font-medium">Họ và tên</th>
              <th className="px-6 py-3 font-medium">Tên đăng nhập</th>
              <th className="px-6 py-3 font-medium">Vai trò</th>
              <th className="px-6 py-3 font-medium">Tầng</th>
              <th className="px-6 py-3 font-medium">Trạng thái</th>
              <th className="px-6 py-3 text-right font-medium">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {sortedUsers.length > 0 ? (
              sortedUsers.map((user) => {
                const isActive = user.isActive !== false;
                const isCurrentUser = user.id === currentUserId;
                const isBusy = busyUserId === user.id;

                return (
                  <tr key={user.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 font-medium text-slate-800">{user.name}</td>
                    <td className="px-6 py-4 text-slate-600">@{user.username}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${ROLE_BADGE_CLASSES[user.role]}`}
                      >
                        {ROLE_LABELS[user.role]}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-600">{user.floor || '-'}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${getStatusClasses(isActive)}`}
                      >
                        {isActive ? 'Đang hoạt động' : 'Ngừng hoạt động'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          icon={<Edit2 className="h-4 w-4" />}
                          onClick={() => onEdit(user)}
                          disabled={isBusy}
                        >
                          Sửa
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          icon={<KeyRound className="h-4 w-4" />}
                          onClick={() => onResetPassword(user)}
                          disabled={isBusy}
                        >
                          Đặt lại mật khẩu
                        </Button>
                        <Button
                          variant={isActive ? 'danger' : 'secondary'}
                          size="sm"
                          icon={
                            isActive ? <Power className="h-4 w-4" /> : <RotateCcw className="h-4 w-4" />
                          }
                          onClick={() => onToggleActive(user)}
                          disabled={isCurrentUser || isBusy}
                          title={isCurrentUser ? 'Không thể khóa chính tài khoản của bạn.' : undefined}
                        >
                          {isActive ? 'Ngừng hoạt động' : 'Kích hoạt lại'}
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center italic text-slate-500">
                  Chưa có người dùng nào.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        <div className="divide-y divide-slate-100 md:hidden">
          {sortedUsers.length > 0 ? (
            sortedUsers.map((user) => {
              const isActive = user.isActive !== false;
              const isCurrentUser = user.id === currentUserId;
              const isBusy = busyUserId === user.id;

              return (
                <div key={user.id} className="space-y-3 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-slate-800">{user.name}</p>
                      <p className="text-sm text-slate-500">@{user.username}</p>
                    </div>
                    <span
                      className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${ROLE_BADGE_CLASSES[user.role]}`}
                    >
                      {ROLE_LABELS[user.role]}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-2 text-xs">
                    <span
                      className={`inline-flex rounded-full px-2 py-1 font-medium ${getStatusClasses(isActive)}`}
                    >
                      {isActive ? 'Đang hoạt động' : 'Ngừng hoạt động'}
                    </span>
                    {user.floor && (
                      <span className="inline-flex rounded-full bg-slate-100 px-2 py-1 font-medium text-slate-600">
                        {user.floor}
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      icon={<Edit2 className="h-4 w-4" />}
                      onClick={() => onEdit(user)}
                      disabled={isBusy}
                    >
                      Sửa thông tin
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      icon={<KeyRound className="h-4 w-4" />}
                      onClick={() => onResetPassword(user)}
                      disabled={isBusy}
                    >
                      Đặt lại mật khẩu
                    </Button>
                    <Button
                      variant={isActive ? 'danger' : 'secondary'}
                      size="sm"
                      icon={isActive ? <Power className="h-4 w-4" /> : <RotateCcw className="h-4 w-4" />}
                      onClick={() => onToggleActive(user)}
                      disabled={isCurrentUser || isBusy}
                      title={isCurrentUser ? 'Không thể khóa chính tài khoản của bạn.' : undefined}
                    >
                      {isActive ? 'Ngừng hoạt động' : 'Kích hoạt lại'}
                    </Button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="px-6 py-8 text-center italic text-slate-500">Chưa có người dùng nào.</div>
          )}
        </div>
      </div>
    </div>
  );
};
