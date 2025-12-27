import React, { useState } from 'react';
import { Activity } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Input, Button, Card } from '../../../components/ui';
import { useAuthStore } from '../../../stores/authStore';

export const LoginPage = () => {
  const { login, users } = useAuthStore();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Login attempt:', { username, password });
    console.log('Available users (count):', users.length);
    console.log('Available usernames:', users.map(u => u.username));

    const user = users.find(u => u.username === username);
    if (!user) {
      console.warn('User not found in store:', username);
      toast.error('Tài khoản không tồn tại.');
      return;
    }

    if (user.password === password) {
      login(user);
      toast.success(`Xin chào, ${user.name}`);
      navigate('/residents');
    } else {
      console.warn('Password mismatch for user:', username);
      toast.error('Mật khẩu không đúng.');
    }
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