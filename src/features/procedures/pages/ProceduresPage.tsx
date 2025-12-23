import React, { useState } from 'react';
import { useProceduresStore } from '@/src/stores/proceduresStore';
import { useResidentsStore } from '@/src/stores/residentsStore';
import { Syringe, Plus, Calendar } from 'lucide-react';
import { LoadingScreen } from '@/src/components/ui';
import { PROCEDURE_LABELS } from '@/src/types';

export const ProceduresPage = () => {
    const { residents } = useResidentsStore();
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-slate-200">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-blue-100 text-blue-600 rounded-lg">
                        <Syringe className="w-6 h-6" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-slate-800">Thủ thuật y tế</h1>
                        <p className="text-sm text-slate-500">Quản lý các thủ thuật thực hiện hàng ngày</p>
                    </div>
                </div>
                <div className="flex gap-3">
                    <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-2 rounded-lg">
                        <Calendar className="w-4 h-4 text-slate-400" />
                        <input
                            type="date"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            className="bg-transparent border-none outline-none text-sm text-slate-700"
                        />
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-4 border-b border-slate-100">
                    <h3 className="font-bold text-slate-700">Danh sách thực hiện ngày {new Date(selectedDate).toLocaleDateString('vi-VN')}</h3>
                </div>
                <div className="p-6 text-center text-slate-500">
                    Tính năng đang được cập nhật...
                </div>
            </div>
        </div>
    );
};
