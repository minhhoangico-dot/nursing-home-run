import React, { useState } from 'react';
import { Activity } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Input, Button, Card } from '../../../components/ui';
import { useAuthStore } from '../../../stores/authStore';
import { usePermissionStore } from '../../../stores/permissionStore';

export const LoginPage = () => {
  const { login, users } = useAuthStore();
  const { fetchPermissions } = usePermissionStore();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    const normalizedUsername = username.trim();
    const user = users.find(u => u.username === normalizedUsername);

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

    login(user);

    try {
      await fetchPermissions();
    } catch {
      // Permission state keeps the failure so later guards can fail closed.
    }

    toast.success(`Xin chào, ${user.name}`);

    if (user.role === 'ADMIN' || user.role === 'SUPERVISOR') {
      navigate('/rooms');
      return;
    }

    navigate('/residents');
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8">
        <div className="flex justify-center mb-6">
          <div className="bg-teal-600 p-3 rounded-full">
            <Activity className="text-white w-8 h-8" />
          </div>
        </div>
        <h1 className="text-2xl font-bold text-center text-slate-800 mb-2">Viện Dưỡng Lão FDC</h1>
        <p className="text-center text-slate-500 mb-8">Hệ thống quản lý chăm sóc toàn diện</p>

        <form onSubmit={handleLogin} className="space-y-4">
          <Input
            label="Tên đăng nhập"
            value={username}
            onChange={e => setUsername(e.target.value)}
            placeholder="Nhập tên đăng nhập..."
          />
          <Input
            label="Mật khẩu"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="••••••••"
          />
          <Button type="submit" className="w-full" size="lg">
            Đăng nhập
          </Button>
        </form>
        <div className="mt-6 text-center text-sm text-slate-500">
          <div className="mb-2 text-xs text-orange-600 font-medium">Click vào tên bên dưới để điền thông tin:</div>
          <div className="flex justify-center gap-4 mt-2 flex-wrap">
            <span className="cursor-pointer hover:text-teal-600 underline font-bold" onClick={() => { setUsername('admin'); setPassword('admin123'); }}>Admin</span>
            <span className="cursor-pointer hover:text-teal-600 underline" onClick={() => { setUsername('doctor'); setPassword('password'); }}>Bác sĩ</span>
            <span className="cursor-pointer hover:text-teal-600 underline" onClick={() => { setUsername('supervisor'); setPassword('password'); }}>Trưởng tầng</span>
            <span className="cursor-pointer hover:text-teal-600 underline" onClick={() => { setUsername('accountant'); setPassword('password'); }}>Kế toán</span>
          </div>
        </div>
      </Card>
    </div>
  );
};
