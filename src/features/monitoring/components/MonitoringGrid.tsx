import React, { useState, useEffect } from 'react';
import { Resident, BloodSugarRecord } from '@/src/types';
import { DailyMonitoringRecord, DailyMonitoringUpdate } from '@/src/types/dailyMonitoring';
import { Loader2 } from 'lucide-react';
import { useMonitoringStore } from '@/src/stores/monitoringStore';
import { useDiabetesStore } from '@/src/stores/diabetesStore';

interface MonitoringGridProps {
    month: Date;
    residents: Resident[];
    dailyRecords: DailyMonitoringRecord[];
    bsRecords: BloodSugarRecord[];
    isLoading: boolean;
}

const formatDate = (d: Date) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

export const MonitoringGrid = ({ month, residents, dailyRecords, bsRecords, isLoading }: MonitoringGridProps) => {
    const { updateRecord } = useMonitoringStore();
    const { addRecord, updateRecord: updateBSRecord } = useDiabetesStore();
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
        const date = new Date(month.getFullYear(), month.getMonth(), day);
        const dateStr = formatDate(date);
        const update: DailyMonitoringUpdate = {
            resident_id: residentId,
            record_date: dateStr,
            [field]: value
        };
        await updateRecord(update);
    };

    const handleBSUpdate = async (residentId: string, day: number, value: string) => {
        if (!value.trim()) return; // Handle empty? maybe delete? for now ignore

        const date = new Date(month.getFullYear(), month.getMonth(), day);
        const dateStr = formatDate(date);
        const existing = bsRecords.find(r => r.residentId === residentId && r.recordDate === dateStr);

        // Simple Parser
        // "S:7.5 T:8" or "7.5"
        // S = MorningBefore, Tr = LunchBefore, T = DinnerBefore
        const updates: any = {};
        const lower = value.toLowerCase();

        // Regex for precise matching could be complex, simple split logic:
        // If single number: "7.5" -> morningBeforeMeal
        const isSingleNumber = /^-?\d*(\.\d+)?$/.test(value.trim());
        if (isSingleNumber) {
            updates.morningBeforeMeal = parseFloat(value);
        } else {
            // Parse tokens
            // S:7.5, S7.5, S 7.5
            const updateVal = (key: string, val: string) => {
                const num = parseFloat(val.replace(':', ''));
                if (!isNaN(num)) updates[key] = num;
            };

            // Simple primitive non-regex manual parse or smarter regex
            // Let's use regex global match
            // S:?(\d+(\.\d+)?)
            const sMatch = value.match(/S[:\s]*([\d\.]+)/i);
            if (sMatch) updateVal('morningBeforeMeal', sMatch[1]);

            const trMatch = value.match(/(?:Tr|C)[:\s]*([\d\.]+)/i); // Tr or C (Chieu)
            if (trMatch) updateVal('lunchBeforeMeal', trMatch[1]);

            const tMatch = value.match(/T[:\s]*([\d\.]+)/i);
            if (tMatch) updateVal('dinnerBeforeMeal', tMatch[1]);
        }

        if (Object.keys(updates).length === 0) return;

        if (existing) {
            await updateBSRecord(existing.id, updates);
        } else {
            await addRecord({
                residentId: residentId,
                recordDate: dateStr,
                ...updates
            });
        }
    };

    if (isLoading) {
        return <div className="flex justify-center p-8"><Loader2 className="w-8 h-8 animate-spin text-teal-600" /></div>;
    }

    return (
        <div className="overflow-x-auto border border-slate-200 rounded-lg shadow bg-white">
            <table className="w-full text-sm border-collapse min-w-[max-content]">
                <thead>
                    <tr className="bg-slate-100 text-slate-700 font-bold">
                        <th className="sticky left-0 z-20 bg-slate-100 border p-2 w-12 min-w-[3rem]">STT</th>
                        <th className="sticky left-12 z-20 bg-slate-100 border p-2 w-48 min-w-[12rem] text-left">Tên NCT</th>
                        <th className="border p-2 w-24 min-w-[6rem]">Chỉ số</th>
                        {days.map(d => (
                            <th key={d} className="border p-1 w-12 min-w-[3rem] text-center">{d}</th>
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
                                    // Combine standard logic: maybe specific input or just free text.
                                    // Use bp_morning for simplicity in this grid view if tight space,
                                    // OR render a small stack? The image shows "S 105/72 T 132/70"
                                    // Let's use a single text input for now that maps to bp_morning or special logic.
                                    // Better: popover? No, grid needs speed.
                                    // Let's allow typing "120/80" -> update bp_morning (default).
                                    // If user wants multiple, they probably type "S:120/80 T:130/80".
                                    // I'll map this input to `bp_morning` for now as the "primary" text field if simplifying.
                                    // Wait, I defined 3 columns.
                                    return (
                                        <td key={`bp-${day}`} className="border p-0 relative group">
                                            <input
                                                className="w-full h-full p-1 text-[10px] text-center bg-transparent focus:bg-teal-50 outline-none overflow-hidden"
                                                defaultValue={[record?.bp_morning, record?.bp_afternoon].filter(Boolean).join(' ') || ''}
                                                title={`S: ${record?.bp_morning || '-'} | C: ${record?.bp_afternoon || '-'} | T: ${record?.bp_evening || '-'}`}
                                                onBlur={(e) => handleUpdate(resident.id, day, 'bp_morning', e.target.value)}
                                            // Simplified: saving to bp_morning ONLY. Supervisor can type "S120 T130".
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
                                    const hasBowel = !!record?.bowel_movements;

                                    return (
                                        <td
                                            key={`bowel-${day}`}
                                            className="border p-0 text-center cursor-pointer hover:bg-slate-100 transition-colors select-none"
                                            onClick={() => handleUpdate(resident.id, day, 'bowel_movements', hasBowel ? '' : 'x')}
                                        >
                                            {hasBowel && <span className="text-slate-700 font-bold">x</span>}
                                        </td>
                                    );
                                })}
                            </tr>
                            {/* Row 4: Đường máu (Blood Sugar - Editable) */}
                            <tr className="hover:bg-slate-50 bg-orange-50/30">
                                <td className="border p-2 font-medium text-slate-600 truncate text-orange-700">Đ.Máu</td>
                                {days.map(day => {
                                    const bs = getBSRecord(resident.id, day);
                                    let display = '';
                                    if (bs) {
                                        const parts = [];
                                        if (bs.morningBeforeMeal) parts.push(`S:${bs.morningBeforeMeal}`);
                                        if (bs.lunchBeforeMeal) parts.push(`Tr:${bs.lunchBeforeMeal}`);
                                        if (bs.dinnerBeforeMeal) parts.push(`T:${bs.dinnerBeforeMeal}`);
                                        display = parts.length > 0 ? parts.join(' ') : (bs.morningBeforeMeal?.toString() || '');
                                    }
                                    return (
                                        <td key={`bs-${day}`} className="border p-0 relative group">
                                            <input
                                                className="w-full h-full p-1 text-[10px] text-center bg-transparent focus:bg-orange-100 outline-none text-orange-800 font-medium"
                                                defaultValue={display}
                                                // placeholder="S:7 T:8"
                                                title="S=Sáng, Tr=Trưa, T=Tối (VD: S:7.5 T:8.0)"
                                                onBlur={(e) => handleBSUpdate(resident.id, day, e.target.value)}
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
