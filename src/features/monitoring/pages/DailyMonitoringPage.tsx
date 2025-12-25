import React, { useEffect, useState } from 'react';
import { useAuthStore } from '@/src/stores/authStore';
import { useResidentsStore } from '@/src/stores/residentsStore';
import { useMonitoringStore } from '@/src/stores/monitoringStore';
import { useDiabetesStore } from '@/src/stores/diabetesStore'; // Ensure this path is correct
import { MonitoringGrid } from '../components/MonitoringGrid';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';

const formatMonthYear = (d: Date) => {
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${month}/${year}`;
};

const formatYearMonth = (d: Date) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
};

export const DailyMonitoringPage = () => {
    const { user } = useAuthStore();
    const { residents, fetchResidents } = useResidentsStore();
    const { records: dailyRecords, isLoading: isMonitoringLoading, fetchRecords, currentMonth, setCurrentMonth } = useMonitoringStore();
    const { records: bsRecords, isLoading: isBSLoading, fetchAllRecords: fetchBSRecords } = useDiabetesStore();

    useEffect(() => {
        fetchResidents();
    }, []);

    useEffect(() => {
        // Fetch both daily monitoring and blood sugar records for the month
        const loadData = async () => {
            await fetchRecords(currentMonth);
            await fetchBSRecords(formatYearMonth(currentMonth));
        };
        loadData();
    }, [currentMonth]);

    const handlePrevMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
    };

    const handleNextMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
    };

    if (!user) return null;

    return (
        <div className="space-y-6 max-h-[calc(100vh-4rem)] flex flex-col">
            <div className="flex justify-between items-center bg-white p-4 rounded-lg shadow-sm border border-slate-200">
                <h2 className="text-2xl font-bold text-slate-800">Sổ Theo Dõi Chỉ Số Ngày</h2>

                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-lg">
                        <button onClick={handlePrevMonth} className="p-2 hover:bg-white rounded-md transition-colors"><ChevronLeft className="w-5 h-5" /></button>
                        <div className="flex items-center gap-2 px-4 font-medium min-w-[140px] justify-center">
                            <Calendar className="w-4 h-4 text-slate-500" />
                            {formatMonthYear(currentMonth)}
                        </div>
                        <button onClick={handleNextMonth} className="p-2 hover:bg-white rounded-md transition-colors"><ChevronRight className="w-5 h-5" /></button>
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-hidden flex flex-col">
                <MonitoringGrid
                    month={currentMonth}
                    residents={residents}
                    dailyRecords={dailyRecords}
                    bsRecords={bsRecords}
                    isLoading={isMonitoringLoading || isBSLoading}
                />
            </div>

            <div className="text-sm text-slate-500 italic px-2">
                * Dữ liệu Đường máu được tự động đồng bộ từ module "Đường huyết".
            </div>
        </div>
    );
};
