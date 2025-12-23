import React from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Download, Filter, FileSpreadsheet, Plus, Settings } from 'lucide-react';
import { Button } from '../../../components/ui';

interface ScheduleHeaderProps {
    weekStart: Date;
    onWeekChange: (direction: 'prev' | 'next') => void;
    onDateSelect: (date: Date) => void;
    roleFilter: string;
    onRoleFilterChange: (role: string) => void;
    onExport: () => void;
    isEditing: boolean;
    onToggleEdit: () => void;
    onManageStaff: () => void;
}

export const ScheduleHeader: React.FC<ScheduleHeaderProps> = ({
    weekStart,
    onWeekChange,
    onDateSelect,
    roleFilter,
    onRoleFilterChange,
    onExport,
    isEditing,
    onToggleEdit,
    onManageStaff
}) => {
    const weekEndDate = new Date(weekStart);
    weekEndDate.setDate(weekStart.getDate() + 6);

    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.value) {
            onDateSelect(new Date(e.target.value));
        }
    };

    return (
        <div className="flex flex-col gap-4 mb-4">
            {/* Top Bar: Title & Actions */}
            <div className="flex justify-between items-center bg-white/50 backdrop-blur-sm p-4 rounded-xl border border-white/20 shadow-sm">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Lịch trực & Phân công</h1>
                    <p className="text-slate-500 text-sm">Quản lý điều phối nhân sự theo khu vực</p>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={onManageStaff}
                        className="flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-4 py-2 rounded-lg font-medium shadow-sm transition-all"
                    >
                        <Settings className="w-4 h-4 text-slate-400" /> Quản lý nhân viên
                    </button>

                    <button
                        onClick={onExport}
                        className="flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-4 py-2 rounded-lg font-medium shadow-sm transition-all"
                    >
                        <FileSpreadsheet className="w-4 h-4 text-green-600" /> Xuất Excel
                    </button>

                    <button
                        onClick={onToggleEdit}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium shadow-sm transition-all border
                            ${isEditing
                                ? 'bg-teal-600 hover:bg-teal-700 border-teal-600 text-white'
                                : 'bg-blue-600 hover:bg-blue-700 border-blue-600 text-white'}
                        `}
                    >
                        {isEditing ? (
                            <>Lưu thay đổi</>
                        ) : (
                            <>Chế độ chỉnh sửa</>
                        )}
                    </button>
                </div>
            </div>

            {/* Controls Bar: Time & Filters */}
            <div className="flex items-center justify-between bg-white p-2 rounded-xl border border-slate-200 shadow-sm">
                {/* Week Picker */}
                <div className="flex items-center gap-2 bg-slate-50 p-1 rounded-lg border border-slate-100">
                    <button onClick={() => onWeekChange('prev')} className="p-1.5 hover:bg-white rounded-md shadow-sm transition-all text-slate-600"><ChevronLeft className="w-5 h-5" /></button>
                    <div className="flex items-center gap-2 px-3 relative group cursor-pointer">
                        <CalendarIcon className="w-5 h-5 text-blue-600" />
                        <span className="font-bold text-slate-700 w-48 text-center text-sm">
                            {weekStart.toLocaleDateString('vi-VN')} - {weekEndDate.toLocaleDateString('vi-VN')}
                        </span>
                        <input
                            type="date"
                            className="absolute inset-0 opacity-0 cursor-pointer"
                            onChange={handleDateChange}
                        />
                    </div>
                    <button onClick={() => onWeekChange('next')} className="p-1.5 hover:bg-white rounded-md shadow-sm transition-all text-slate-600"><ChevronRight className="w-5 h-5" /></button>
                </div>

                {/* Filters */}
                <div className="flex items-center gap-3 pr-2">
                    <div className="text-sm font-medium text-slate-500 flex items-center gap-2">
                        <Filter className="w-4 h-4" /> Lọc:
                    </div>
                    <select
                        className="bg-slate-50 border-none rounded-lg text-sm font-medium text-slate-700 py-1.5 pl-3 pr-8 focus:ring-0 cursor-pointer hover:bg-slate-100"
                        value={roleFilter}
                        onChange={(e) => onRoleFilterChange(e.target.value)}
                    >
                        <option value="ALL">Tất cả chức vụ</option>
                        <option value="DOCTOR">Bác sĩ</option>
                        <option value="NURSE">Điều dưỡng</option>
                        <option value="CAREGIVER">Hộ lý</option>
                        <option value="SUPERVISOR">Trưởng tầng</option>
                        <option value="SECURITY">Bảo vệ</option>
                        <option value="CLEANER">Tạp vụ</option>
                        <option value="CHEF">Bếp</option>
                    </select>
                </div>
            </div>
        </div>
    );
};
