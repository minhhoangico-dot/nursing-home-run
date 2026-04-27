import React, { useState, useEffect } from 'react';
import { ResidentListItem, BloodSugarRecord } from '@/src/types';
import { DailyMonitoringRecord, DailyMonitoringUpdate } from '@/src/types/dailyMonitoring';
import { Loader2 } from 'lucide-react';
import { useMonitoringStore } from '@/src/stores/monitoringStore';
import { useBloodSugarStore } from '@/src/stores/bloodSugarStore';
import { BloodSugarInput } from './BloodSugarInput';

interface MonitoringGridProps {
    month: Date;
    residents: ResidentListItem[];
    dailyRecords: DailyMonitoringRecord[];
    bsRecords: BloodSugarRecord[];
    isLoading: boolean;
    readOnly?: boolean;
}

const formatDate = (d: Date) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

export const MonitoringGrid = ({ month, residents, dailyRecords, bsRecords, isLoading, readOnly = false }: MonitoringGridProps) => {
    const { updateRecord } = useMonitoringStore();
    const { addRecord, updateRecord: updateBSRecord } = useBloodSugarStore();
    const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

    const getDailyRecord = (residentId: string, day: number) => {
        const date = new Date(month.getFullYear(), month.getMonth(), day);
        const dateStr = formatDate(date);
        return dailyRecords.find(r => r.resident_id === residentId && r.record_date === dateStr);
    };

    const getBSRecord = (residentId: string, day: number) => {
        const date = new Date(month.getFullYear(), month.getMonth(), day);
        const dateStr = formatDate(date);
        return bsRecords.find(r => r.residentId === residentId && r.recordDate === dateStr);
    };

    const handleUpdate = async (residentId: string, day: number, field: keyof DailyMonitoringUpdate, value: any) => {
        if (readOnly) return;
        const date = new Date(month.getFullYear(), month.getMonth(), day);
        const dateStr = formatDate(date);
        const update: DailyMonitoringUpdate = {
            resident_id: residentId,
            record_date: dateStr,
            [field]: value
        };
        await updateRecord(update);
    };

    const handleBSSave = async (residentId: string, day: number, data: Partial<BloodSugarRecord>) => {
        if (readOnly) return;
        const date = new Date(month.getFullYear(), month.getMonth(), day);
        const dateStr = formatDate(date);
        const existing = bsRecords.find(r => r.residentId === residentId && r.recordDate === dateStr);

        if (existing) {
            await updateBSRecord(existing.id, data);
        } else {
            // New record
            await addRecord({
                residentId: residentId,
                recordDate: dateStr,
                ...data
            } as any);
        }
    };

    if (isLoading) {
        return <div className="flex justify-center p-8"><Loader2 className="w-8 h-8 animate-spin text-teal-600" /></div>;
    }

    return (
        <div className="overflow-auto border border-slate-200 rounded-lg shadow bg-white h-full">
            <table className="w-full text-sm border-collapse min-w-max">
                <thead className="sticky top-0 z-30">
                    <tr className="bg-slate-100 text-slate-700 font-bold">
                        <th className="sticky left-0 z-40 bg-slate-100 border p-2 w-12 min-w-[3rem]">STT</th>
                        <th className="sticky left-12 z-40 bg-slate-100 border p-2 w-48 min-w-[12rem] text-left">Tên NCT</th>
                        <th className="bg-slate-100 border p-2 w-24 min-w-[6rem]">Chỉ số</th>
                        {days.map(d => (
                            <th key={d} className="bg-slate-100 border p-1 w-12 min-w-[3rem] text-center">{d}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {residents.map((resident, idx) => (
                        <React.Fragment key={resident.id}>
                            {/* Row 1: Mạch (Pulse) */}
                            <tr className="hover:bg-slate-50">
                                <td rowSpan={6} className="sticky left-0 z-10 bg-white border p-2 text-center font-medium">{idx + 1}</td>
                                <td rowSpan={6} className="sticky left-12 z-10 bg-white border p-2 font-medium">{resident.name}</td>
                                <td className="border p-2 font-medium text-slate-600">Mạch</td>
                                {days.map(day => {
                                    const record = getDailyRecord(resident.id, day);
                                    return (
                                        <td key={`pulse-${day}`} className="border p-0">
                                            <input
                                                className="w-full h-full p-1 text-center bg-transparent focus:bg-teal-50 outline-none"
                                                defaultValue={record?.pulse || ''}
                                                disabled={readOnly}
                                                onBlur={(e) => handleUpdate(resident.id, day, 'pulse', e.target.value ? parseInt(e.target.value) : null)}
                                            />
                                        </td>
                                    );
                                })}
                            </tr>
                            {/* Row 2: H.A (Blood Pressure) */}
                            <tr className="hover:bg-slate-50">
                                <td className="border p-2 font-medium text-slate-600 truncate" title="Huyết áp">H.A</td>
                                {days.map(day => {
                                    const record = getDailyRecord(resident.id, day);
                                    return (
                                        <td key={`bp-${day}`} className="border p-0 relative group">
                                            <input
                                                className="w-full h-full p-1 text-[10px] text-center bg-transparent focus:bg-teal-50 outline-none overflow-hidden"
                                                defaultValue={[record?.bp_morning, record?.bp_afternoon].filter(Boolean).join(' ') || ''}
                                                title={`S: ${record?.bp_morning || '-'} | C: ${record?.bp_afternoon || '-'} | T: ${record?.bp_evening || '-'}`}
                                                disabled={readOnly}
                                                onBlur={(e) => handleUpdate(resident.id, day, 'bp_morning', e.target.value)}
                                            />
                                        </td>
                                    );
                                })}
                            </tr>
                            {/* Row 3: Đại tiện (Bowel) */}
                            <tr className="hover:bg-slate-50">
                                <td className="border p-2 font-medium text-slate-600 truncate">Đại tiện</td>
                                {days.map(day => {
                                    const record = getDailyRecord(resident.id, day);
                                    return (
                                        <td key={`bowel-${day}`} className="border p-0">
                                            <select
                                                className="w-full h-full p-1 text-center bg-transparent focus:bg-teal-50 outline-none appearance-none"
                                                value={record?.bowel_movements || ''}
                                                disabled={readOnly}
                                                onChange={(e) => handleUpdate(resident.id, day, 'bowel_movements', e.target.value)}
                                                style={{ textAlignLast: 'center' }}
                                            >
                                                <option value=""></option>
                                                <option value="thường">x</option>
                                                <option value="móc">M</option>
                                                <option value="thụt">T</option>
                                            </select>
                                        </td>
                                    );
                                })}
                            </tr>
                            {/* Row 4: Đường máu (Blood Sugar - Editable) */}
                            <tr className="hover:bg-slate-50 bg-orange-50/30">
                                <td className="border p-2 font-medium text-slate-600 truncate text-orange-700">Đ.Máu</td>
                                {days.map(day => {
                                    const bs = getBSRecord(resident.id, day);
                                    return (
                                        <td key={`bs-${day}`} className="border p-0 relative h-[32px]">
                                            <BloodSugarInput
                                                initialData={bs}
                                                onSave={(data) => handleBSSave(resident.id, day, data)}
                                                readOnly={readOnly}
                                            />
                                        </td>
                                    );
                                })}
                            </tr>
                            {/* Row 5: SP02 */}
                            <tr className="hover:bg-slate-50">
                                <td className="border p-2 font-medium text-slate-600">SP02</td>
                                {days.map(day => {
                                    const record = getDailyRecord(resident.id, day);
                                    return (
                                        <td key={`sp02-${day}`} className="border p-0">
                                            <input
                                                className="w-full h-full p-1 text-center bg-transparent focus:bg-teal-50 outline-none"
                                                defaultValue={record?.sp02 || ''}
                                                placeholder="%"
                                                disabled={readOnly}
                                                onBlur={(e) => handleUpdate(resident.id, day, 'sp02', e.target.value ? parseInt(e.target.value) : null)}
                                            />
                                        </td>
                                    );
                                })}
                            </tr>
                            {/* Row 6: Nhiệt độ (Temp) */}
                            <tr className="hover:bg-slate-50 border-b-2 border-slate-300">
                                <td className="border p-2 font-medium text-slate-600">Nhiệt độ</td>
                                {days.map(day => {
                                    const record = getDailyRecord(resident.id, day);
                                    return (
                                        <td key={`temp-${day}`} className="border p-0">
                                            <input
                                                className="w-full h-full p-1 text-center bg-transparent focus:bg-teal-50 outline-none"
                                                defaultValue={record?.temperature || ''}
                                                step="0.1"
                                                disabled={readOnly}
                                                onBlur={(e) => handleUpdate(resident.id, day, 'temperature', e.target.value ? parseFloat(e.target.value) : null)}
                                            />
                                        </td>
                                    );
                                })}
                            </tr>
                        </React.Fragment>
                    ))}
                </tbody>
            </table>
        </div>
    );
};
