import React from 'react';
import { ProcedureRecord } from '@/src/types';
import { Resident } from '@/src/types/resident';

interface PrintProcedureFormProps {
    month: number;
    year: number;
    residents: Resident[];
    data: ProcedureRecord[];
    procedureType?: string; // If 'all', sum counts? Or just specific type?
}

export const PrintProcedureForm = ({ month, year, residents, data, procedureType }: PrintProcedureFormProps) => {
    const daysInMonth = new Date(year, month, 0).getDate();
    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

    // Filter relevant records
    const getRecord = (residentId: string, day: number) => {
        const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        return data.find(r => r.residentId === residentId && r.recordDate === dateStr);
    };

    const hasProcedure = (record: ProcedureRecord | undefined) => {
        if (!record) return false;
        // If specific type selected
        if (procedureType) {
            return (record as any)[procedureType];
        }
        // If 'any', check if any true
        return record.injection || record.ivDrip || record.gastricTube || record.urinaryCatheter ||
            record.bladderWash || record.bloodSugarTest || record.bloodPressure ||
            record.oxygenTherapy || record.woundDressing;
    };

    const getCount = (residentId: string) => {
        let count = 0;
        days.forEach(day => {
            const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const record = data.find(r => r.residentId === residentId && r.recordDate === dateStr);
            if (hasProcedure(record)) count++;
        });
        return count;
    };

    return (
        <div className="p-4 bg-white text-black print:block hidden font-serif text-sm">
            <div className="text-center mb-4">
                <h1 className="text-xl font-bold uppercase">Phiếu Theo Dõi Thủ Thuật - Tháng {month}/{year}</h1>
                <p className="italic">Loại thủ thuật: {procedureType ? (procedureType === 'all' ? 'Tất cả' : procedureType) : 'Tất cả'}</p>
            </div>

            <div className="mb-2">
                <p><strong>Tầng:</strong> 3</p>
            </div>

            <table className="w-full border-collapse border border-black text-xs">
                <thead>
                    <tr>
                        <th className="border border-black p-1 w-8">STT</th>
                        <th className="border border-black p-1 text-left min-w-[150px]">Họ tên NCT</th>
                        {days.map(d => (
                            <th key={d} className="border border-black p-0.5 w-6 text-center">{d}</th>
                        ))}
                        <th className="border border-black p-1 w-10">Tổng</th>
                    </tr>
                </thead>
                <tbody>
                    {residents.map((r, idx) => (
                        <tr key={r.id}>
                            <td className="border border-black p-1 text-center">{idx + 1}</td>
                            <td className="border border-black p-1 font-medium">{r.name}</td>
                            {days.map(d => {
                                const record = getRecord(r.id, d);
                                const checked = hasProcedure(record);
                                return (
                                    <td key={d} className="border border-black p-0.5 text-center">
                                        {checked ? '✓' : ''}
                                    </td>
                                );
                            })}
                            <td className="border border-black p-1 text-center font-bold">{getCount(r.id)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <div className="flex justify-between mt-8 px-8">
                <div className="text-center">
                    <p className="font-bold">Người lập biểu</p>
                    <p className="italic text-xs mt-8">(Ký, họ tên)</p>
                </div>
                <div className="text-center">
                    <p className="font-bold">Xác nhận của y tá trưởng</p>
                    <p className="italic text-xs mt-8">(Ký, họ tên)</p>
                </div>
            </div>
        </div>
    );
};
