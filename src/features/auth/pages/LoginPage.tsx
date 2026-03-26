import React, { useState } from 'react';
import { Activity } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { Button, Card, Input } from '../../../components/ui';
import { getDefaultModulePathForRole } from '../../../constants/modules';
import { useAuthStore } from '../../../stores/authStore';
import { usePermissionStore } from '../../../stores/permissionStore';

export const LoginPage = () => {
  const { login, users } = useAuthStore();
  const { fetchPermissions } = usePermissionStore();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();

    const normalizedUsername = username.trim();
    const user = users.find((candidate) => candidate.username === normalizedUsername);

    if (!user) {
      toast.error('Tài khoản không tồn tại.');
      return;
    }

    if (user.isActive === false) {
      toast.error('Tài khoản đã bị khóa hoặc ngừng hoạt động.');
      return;
    }

    if (user.password !== password) {
      toast.error('Mật khẩu không đúng.');
      return;
    }

    try {
      const permissions = await fetchPermissions();
      const nextPath = getDefaultModulePathForRole(permissions, user.role);

      login(user);
      toast.success(`Xin chào, ${user.name}`);
      navigate(nextPath, { replace: true });
    } catch {
      toast.error('Không thể tải quyền truy cập. Vui lòng thử lại.');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 p-4">
      <Card className="w-full max-w-md p-8">
        <div className="mb-6 flex justify-center">
          <div className="rounded-full bg-teal-600 p-3">
            <Activity className="h-8 w-8 text-white" />
          </div>
        </div>
        <h1 className="mb-2 text-center text-2xl font-bold text-slate-800">Viện Dưỡng Lão FDC</h1>
        <p className="mb-8 text-center text-slate-500">Hệ thống quản lý chăm sóc toàn diện</p>

        <form onSubmit={handleLogin} className="space-y-4">
          <Input
            label="Tên đăng nhập"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            placeholder="Nhập tên đăng nhập..."
          />
          <Input
            label="Mật khẩu"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="••••••••"
          />
          <Button type="submit" className="w-full" size="lg">
            Đăng nhập
          </Button>
        </form>

        <div className="mt-6 text-center text-sm text-slate-500">
          <div className="mb-2 text-xs font-medium text-orange-600">
            Click vào tên bên dưới để điền thông tin:
          </div>
          <div className="mt-2 flex flex-wrap justify-center gap-4">
            <span
              className="cursor-pointer font-bold underline hover:text-teal-600"
              onClick={() => {
                setUsername('admin');
                setPassword('admin123');
              }}
            >
              Admin
            </span>
            <span
              className="cursor-pointer underline hover:text-teal-600"
              onClick={() => {
                setUsername('doctor');
                setPassword('password');
              }}
            >
              Bác sĩ
            </span>
            <span
              className="cursor-pointer underline hover:text-teal-600"
              onClick={() => {
                setUsername('supervisor');
                setPassword('password');
              }}
            >
              Trưởng tầng
            </span>
            <span
              className="cursor-pointer underline hover:text-teal-600"
              onClick={() => {
                setUsername('accountant');
                setPassword('password');
              }}
            >
              Kế toán
            </span>
          </div>
        </div>
      </Card>
    </div>
  );
};
