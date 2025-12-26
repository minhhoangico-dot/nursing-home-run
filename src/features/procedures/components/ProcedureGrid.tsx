import React from 'react';
import { Resident } from '@/src/types/resident';
import { ProcedureRecord } from '@/src/types';

interface ProcedureGridProps {
    month: number;
    year: number;
    residents: Resident[];
    records: ProcedureRecord[];
    selectedType: string | null;
    isLoading: boolean;
    onToggle: (residentId: string, date: string, checked: boolean, count: number) => void;
}

export const ProcedureGrid = ({ month, year, residents, records, selectedType, isLoading, onToggle, mode = 'add' }: ProcedureGridProps & { mode?: 'add' | 'subtract' }) => {
    const daysInMonth = new Date(year, month, 0).getDate();
    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

    const checkRecord = (residentId: string, day: number) => {
        const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const record = records.find(r => r.residentId === residentId && r.recordDate === dateStr);
        if (!record || !selectedType) return { checked: false, count: 0 };

        const countKey = `${selectedType}Count` as keyof ProcedureRecord;
        const count = (record as any)[countKey] as number || 0;
        const checked = (record as any)[selectedType] === true;

        return { checked, count }; // Use count as primary truth if > 0
    };

    const handleCellClick = (residentId: string, day: number, current: { checked: boolean, count: number }) => {
        if (!selectedType || isLoading) return;
        const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

        let newCount = current.count;
        if (mode === 'add') {
            newCount = current.count + 1;
        } else {
            newCount = Math.max(0, current.count - 1);
        }

        // Also toggle boolean based on count
        const newChecked = newCount > 0;

        onToggle(residentId, dateStr, newChecked, newCount);
    };

    if (!selectedType) {
        return (
            <div className="p-12 text-center text-slate-500 bg-slate-50 rounded-lg border border-dashed border-slate-300">
                <p>Vui lòng chọn loại thủ thuật để xem và cập nhật bảng theo dõi tháng</p>
            </div>
        );
    }

    return (
        <div className="overflow-x-auto border rounded-xl shadow-sm">
            <table className="w-full text-xs text-left border-collapse">
                <thead className="bg-slate-50 text-slate-700 font-bold sticky top-0 z-10">
                    <tr>
                        <th className="p-2 border border-slate-200 min-w-[200px] bg-slate-50 sticky left-0 z-20 shadow-sm">
                            Họ tên NCT
                        </th>
                        {days.map(d => (
                            <th key={d} className="p-1 border border-slate-200 w-8 text-center min-w-[32px]">
                                {d}
                            </th>
                        ))}
                        <th className="p-2 border border-slate-200 w-12 text-center">Tổng</th>
                    </tr>
                </thead>
                <tbody className="bg-white">
                    {residents.map((r, idx) => {
                        let total = 0;
                        return (
                            <tr key={r.id} className="hover:bg-slate-50 transition-colors">
                                <td className="p-2 border border-slate-200 font-medium whitespace-nowrap sticky left-0 bg-white z-10">
                                    {idx + 1}. {r.name}
                                </td>
                                {days.map(d => {
                                    const { checked, count } = checkRecord(r.id, d);
                                    if (checked) total += (count > 0 ? count : 1); // Count logic: if count exist use it, otherwise 1 (legacy support)
                                    const isToday = new Date().getDate() === d && new Date().getMonth() + 1 === month && new Date().getFullYear() === year;

                                    return (
                                        <td
                                            key={d}
                                            onClick={() => handleCellClick(r.id, d, { checked, count })}
                                            className={`border border-slate-200 text-center cursor-pointer select-none transition-colors
                                                ${checked ? 'bg-blue-100 text-blue-600 font-bold' : 'hover:bg-gray-50'}
                                                ${isToday ? 'bg-yellow-50' : ''}
                                            `}
                                        >
                                            {checked ? (count > 1 ? count : '✓') : ''}
                                        </td>
                                    );
                                })}
                                <td className="p-2 border border-slate-200 text-center font-bold text-slate-700 bg-slate-50">
                                    {total}
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
};
