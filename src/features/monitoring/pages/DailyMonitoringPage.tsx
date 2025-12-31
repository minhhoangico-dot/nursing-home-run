import React, { useEffect, useState } from 'react';
import { useAuthStore } from '@/src/stores/authStore';
import { useResidentsStore } from '@/src/stores/residentsStore';
import { useMonitoringStore } from '@/src/stores/monitoringStore';
import { useDiabetesStore } from '@/src/stores/diabetesStore';
import { MonitoringGrid } from '../components/MonitoringGrid';
import { MobileMonitoringView } from '../components/MobileMonitoringView';
import { ChevronLeft, ChevronRight, Calendar, Table2, LayoutList } from 'lucide-react';

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
    const { records: dailyRecords, isLoading: isMonitoringLoading, fetchDailyRecords: fetchRecords, currentMonth, setCurrentMonth } = useMonitoringStore();
    const { records: bsRecords, isLoading: isBSLoading, fetchAllRecords: fetchBSRecords } = useDiabetesStore();
    const [selectedDay, setSelectedDay] = useState(new Date().getDate());

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
        setSelectedDay(1);
    };

    const handleNextMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
        setSelectedDay(1);
    };

    if (!user) return null;

    const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();

    return (
        <div className="space-y-4 md:space-y-6 h-full flex flex-col">
            {/* Header - responsive */}
            <div className="flex flex-col gap-3 md:flex-row md:justify-between md:items-center bg-white p-3 md:p-4 rounded-lg shadow-sm border border-slate-200">
                <h2 className="text-lg md:text-2xl font-bold text-slate-800">Sổ Theo Dõi Chỉ Số Ngày</h2>

                {/* Month navigation */}
                <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-lg self-start md:self-auto">
                    <button onClick={handlePrevMonth} className="p-2 hover:bg-white rounded-md transition-colors">
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                    <div className="flex items-center gap-2 px-3 md:px-4 font-medium min-w-[100px] md:min-w-[140px] justify-center text-sm md:text-base">
                        <Calendar className="w-4 h-4 text-slate-500" />
                        {formatMonthYear(currentMonth)}
                    </div>
                    <button onClick={handleNextMonth} className="p-2 hover:bg-white rounded-md transition-colors">
                        <ChevronRight className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Mobile: Day selector */}
            <div className="md:hidden bg-white rounded-lg shadow-sm border border-slate-200 p-3">
                <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-slate-600">Chọn ngày:</span>
                    <span className="text-sm text-teal-600 font-bold">
                        Ngày {selectedDay}/{currentMonth.getMonth() + 1}
                    </span>
                </div>
                <div className="flex gap-1 overflow-x-auto pb-2 scrollbar-hide -mx-1 px-1">
                    {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => {
                        const isToday = new Date().getDate() === day &&
                            new Date().getMonth() === currentMonth.getMonth() &&
                            new Date().getFullYear() === currentMonth.getFullYear();
                        return (
                            <button
                                key={day}
                                onClick={() => setSelectedDay(day)}
                                className={`flex-shrink-0 w-10 h-10 rounded-lg text-sm font-medium transition-colors
                                    ${selectedDay === day
                                        ? 'bg-teal-600 text-white'
                                        : isToday
                                            ? 'bg-teal-50 text-teal-700 border border-teal-200'
                                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                    }`}
                            >
                                {day}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 min-h-0 flex flex-col">
                {/* Desktop: Grid view */}
                <div className="hidden md:block h-full overflow-auto">
                    <MonitoringGrid
                        month={currentMonth}
                        residents={residents}
                        dailyRecords={dailyRecords}
                        bsRecords={bsRecords}
                        isLoading={isMonitoringLoading || isBSLoading}
                    />
                </div>

                {/* Mobile: Day-based card view */}
                <div className="md:hidden flex-1 overflow-y-auto">
                    <MobileMonitoringView
                        month={currentMonth}
                        selectedDay={selectedDay}
                        residents={residents}
                        dailyRecords={dailyRecords}
                        bsRecords={bsRecords}
                        isLoading={isMonitoringLoading || isBSLoading}
                    />
                </div>
            </div>

            <div className="text-xs md:text-sm text-slate-500 italic px-2">
                * Dữ liệu Đường máu được tự động đồng bộ từ module "Đường huyết".
            </div>
        </div>
    );
};
