import React, { useState } from 'react';
import { useAuthStore } from '../../../stores/authStore';
import { db } from '../../../services/databaseService';
import { useToast } from '../../../app/providers';
import { Card, Input, Button } from '../../../components/ui';
import { User, Lock, Shield, Save } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';

export const ProfilePage = () => {
    const { user, login } = useAuthStore();
    const { addToast } = useToast();
    const [searchParams, setSearchParams] = useSearchParams();
    const currentTab = searchParams.get('tab') || 'info';

    const [isSaving, setIsSaving] = useState(false);

    // Info state
    const [name, setName] = useState(user?.name || '');
    const [username, setUsername] = useState(user?.username || '');

    // Password state
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    if (!user) return null;

    const handleSaveInfo = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            const updatedUser = { ...user, name, username };
            await db.users.upsert(updatedUser);
            login(updatedUser);
            addToast('success', 'Thành công', 'Đã cập nhật thông tin cá nhân');
        } catch (error) {
            addToast('error', 'Lỗi', 'Không thể cập nhật thông tin');
        } finally {
            setIsSaving(false);
        }
    };

    const handleSavePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (currentPassword !== user.password) {
            addToast('error', 'Lỗi', 'Mật khẩu hiện tại không đúng');
            return;
        }
        if (newPassword !== confirmPassword) {
            addToast('error', 'Lỗi', 'Mật khẩu mới không khớp');
            return;
        }
        if (newPassword.length < 6) {
            addToast('error', 'Lỗi', 'Mật khẩu mới phải từ 6 ký tự');
            return;
        }

        setIsSaving(true);
        try {
            const updatedUser = { ...user, password: newPassword };
            await db.users.upsert(updatedUser);
            login(updatedUser);
            addToast('success', 'Thành công', 'Đã thay đổi mật khẩu');
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (error) {
            addToast('error', 'Lỗi', 'Không thể đổi mật khẩu');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-slate-800">Hồ sơ cá nhân</h1>
                <p className="text-slate-500">Quản lý thông tin cá nhân và bảo mật tài khoản</p>
            </div>

            <div className="flex flex-col md:flex-row gap-6">
                {/* Sidebar */}
                <div className="w-full md:w-64 shrink-0">
                    <Card className="p-2 overflow-hidden">
                        <button
                            onClick={() => setSearchParams({ tab: 'info' })}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${currentTab === 'info' ? 'bg-teal-50 text-teal-700' : 'text-slate-600 hover:bg-slate-50'}`}
                        >
                            <User className="w-5 h-5" /> Thông tin cá nhân
                        </button>
                        <button
                            onClick={() => setSearchParams({ tab: 'security' })}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${currentTab === 'security' ? 'bg-teal-50 text-teal-700' : 'text-slate-600 hover:bg-slate-50'}`}
                        >
                            <Shield className="w-5 h-5" /> Bảo mật & Mật khẩu
                        </button>
                    </Card>
                </div>

                {/* Main Content */}
                <div className="flex-1">
                    {currentTab === 'info' && (
                        <Card className="p-6">
                            <h2 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-4 mb-6">Thông tin cá nhân</h2>
                            <form onSubmit={handleSaveInfo} className="space-y-4 max-w-lg">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Vai trò</label>
                                    <input 
                                        type="text" 
                                        value={user.role === 'ADMIN' ? 'Quản trị viên' : user.role === 'DOCTOR' ? 'Bác sĩ' : user.role === 'SUPERVISOR' ? 'Trưởng tầng' : user.role === 'ACCOUNTANT' ? 'Kế toán' : user.role} 
                                        readOnly 
                                        className="w-full px-4 py-2 bg-slate-100 border-transparent rounded-lg text-sm text-slate-500 cursor-not-allowed"
                                    />
                                </div>
                                <Input
                                    label="Họ và tên"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Nhập họ và tên..."
                                    required
                                />
                                <Input
                                    label="Tên đăng nhập"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    placeholder="Tên đăng nhập hệ thống..."
                                    required
                                />
                                <div className="pt-4">
                                    <Button type="submit" disabled={isSaving} className="flex items-center gap-2">
                                        <Save className="w-4 h-4" /> Lưu thông tin
                                    </Button>
                                </div>
                            </form>
                        </Card>
                    )}

                    {currentTab === 'security' && (
                        <Card className="p-6">
                            <h2 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-4 mb-6">Đổi mật khẩu</h2>
                            <form onSubmit={handleSavePassword} className="space-y-4 max-w-lg">
                                <Input
                                    label="Mật khẩu hiện tại"
                                    type="password"
                                    value={currentPassword}
                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                    placeholder="••••••••"
                                    required
                                />
                                <Input
                                    label="Mật khẩu mới"
                                    type="password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    placeholder="••••••••"
                                    required
                                />
                                <Input
                                    label="Xác nhận mật khẩu mới"
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="••••••••"
                                    required
                                />
                                <div className="pt-4">
                                    <Button type="submit" disabled={isSaving} className="flex items-center gap-2">
                                        <Lock className="w-4 h-4" /> Đổi mật khẩu
                                    </Button>
                                </div>
                            </form>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
};
