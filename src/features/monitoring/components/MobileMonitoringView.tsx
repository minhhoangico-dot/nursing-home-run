import React, { useState } from 'react';
import { Resident, BloodSugarRecord } from '@/src/types';
import { DailyMonitoringRecord, DailyMonitoringUpdate } from '@/src/types/dailyMonitoring';
import { Loader2, Heart, Thermometer, Wind, Check, Droplets, ChevronDown, ChevronUp } from 'lucide-react';
import { useMonitoringStore } from '@/src/stores/monitoringStore';
import { useDiabetesStore } from '@/src/stores/diabetesStore';

interface MobileMonitoringViewProps {
    month: Date;
    selectedDay: number;
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

export const MobileMonitoringView = ({
    month,
    selectedDay,
    residents,
    dailyRecords,
    bsRecords,
    isLoading
}: MobileMonitoringViewProps) => {
    const { updateRecord } = useMonitoringStore();
    const { addRecord, updateRecord: updateBSRecord } = useDiabetesStore();
    const [expandedResident, setExpandedResident] = useState<string | null>(null);

    const date = new Date(month.getFullYear(), month.getMonth(), selectedDay);
    const dateStr = formatDate(date);

    const getDailyRecord = (residentId: string) => {
        return dailyRecords.find(r => r.resident_id === residentId && r.record_date === dateStr);
    };

    const getBSRecord = (residentId: string) => {
        return bsRecords.find(r => r.residentId === residentId && r.recordDate === dateStr);
    };

    const handleUpdate = async (residentId: string, field: keyof DailyMonitoringUpdate, value: any) => {
        const update: DailyMonitoringUpdate = {
            resident_id: residentId,
            record_date: dateStr,
            [field]: value
        };
        await updateRecord(update);
    };

    const handleBSSave = async (residentId: string, data: Partial<BloodSugarRecord>) => {
        const existing = bsRecords.find(r => r.residentId === residentId && r.recordDate === dateStr);
        if (existing) {
            await updateBSRecord(existing.id, data);
        } else {
            await addRecord({
                residentId: residentId,
                recordDate: dateStr,
                ...data
            } as any);
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center p-8">
                <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
            </div>
        );
    }

    return (
        <div className="space-y-3 pb-4">
            {residents.map((resident, idx) => {
                const record = getDailyRecord(resident.id);
                const bsRecord = getBSRecord(resident.id);
                const isExpanded = expandedResident === resident.id;

                // Check if any data exists for this day
                const hasData = record?.pulse || record?.bp_morning || record?.bowel_movements ||
                    record?.sp02 || record?.temperature || bsRecord;

                return (
                    <div
                        key={resident.id}
                        className="bg-white rounded-xl border border-slate-200 overflow-hidden"
                    >
                        {/* Resident header - always visible */}
                        <button
                            onClick={() => setExpandedResident(isExpanded ? null : resident.id)}
                            className="w-full px-4 py-3 flex items-center justify-between bg-slate-50 active:bg-slate-100"
                        >
                            <div className="flex items-center gap-3">
                                <span className="w-7 h-7 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center text-sm font-bold">
                                    {idx + 1}
                                </span>
                                <div className="text-left">
                                    <h3 className="font-semibold text-slate-800">{resident.name}</h3>
                                    <p className="text-xs text-slate-500">P.{resident.room}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                {hasData && (
                                    <span className="text-xs bg-teal-100 text-teal-700 px-2 py-0.5 rounded-full">
                                        Đã nhập
                                    </span>
                                )}
                                {isExpanded ? (
                                    <ChevronUp className="w-5 h-5 text-slate-400" />
                                ) : (
                                    <ChevronDown className="w-5 h-5 text-slate-400" />
                                )}
                            </div>
                        </button>

                        {/* Expanded content */}
                        {isExpanded && (
                            <div className="p-4 space-y-4 border-t border-slate-100">
                                {/* Pulse */}
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center flex-shrink-0">
                                        <Heart className="w-5 h-5 text-red-500" />
                                    </div>
                                    <div className="flex-1">
                                        <label className="text-sm font-medium text-slate-600">Mạch</label>
                                        <input
                                            type="number"
                                            inputMode="numeric"
                                            className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none"
                                            placeholder="VD: 72"
                                            defaultValue={record?.pulse || ''}
                                            onBlur={(e) => handleUpdate(resident.id, 'pulse', e.target.value ? parseInt(e.target.value) : null)}
                                        />
                                    </div>
                                    <span className="text-sm text-slate-400">bpm</span>
                                </div>

                                {/* Blood Pressure */}
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                                        <Droplets className="w-5 h-5 text-blue-500" />
                                    </div>
                                    <div className="flex-1">
                                        <label className="text-sm font-medium text-slate-600">Huyết áp</label>
                                        <input
                                            type="text"
                                            className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none"
                                            placeholder="VD: 120/80"
                                            defaultValue={record?.bp_morning || ''}
                                            onBlur={(e) => handleUpdate(resident.id, 'bp_morning', e.target.value)}
                                        />
                                    </div>
                                    <span className="text-sm text-slate-400">mmHg</span>
                                </div>

                                {/* Temperature */}
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-orange-50 flex items-center justify-center flex-shrink-0">
                                        <Thermometer className="w-5 h-5 text-orange-500" />
                                    </div>
                                    <div className="flex-1">
                                        <label className="text-sm font-medium text-slate-600">Nhiệt độ</label>
                                        <input
                                            type="number"
                                            inputMode="decimal"
                                            step="0.1"
                                            className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none"
                                            placeholder="VD: 36.5"
                                            defaultValue={record?.temperature || ''}
                                            onBlur={(e) => handleUpdate(resident.id, 'temperature', e.target.value ? parseFloat(e.target.value) : null)}
                                        />
                                    </div>
                                    <span className="text-sm text-slate-400">°C</span>
                                </div>

                                {/* SP02 */}
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-sky-50 flex items-center justify-center flex-shrink-0">
                                        <Wind className="w-5 h-5 text-sky-500" />
                                    </div>
                                    <div className="flex-1">
                                        <label className="text-sm font-medium text-slate-600">SpO2</label>
                                        <input
                                            type="number"
                                            inputMode="numeric"
                                            className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none"
                                            placeholder="VD: 98"
                                            defaultValue={record?.sp02 || ''}
                                            onBlur={(e) => handleUpdate(resident.id, 'sp02', e.target.value ? parseInt(e.target.value) : null)}
                                        />
                                    </div>
                                    <span className="text-sm text-slate-400">%</span>
                                </div>

                                {/* Blood Sugar */}
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center flex-shrink-0">
                                        <Droplets className="w-5 h-5 text-amber-600" />
                                    </div>
                                    <div className="flex-1">
                                        <label className="text-sm font-medium text-slate-600">Đường máu (sáng)</label>
                                        <input
                                            type="number"
                                            inputMode="decimal"
                                            step="0.1"
                                            className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none"
                                            placeholder="VD: 5.6"
                                            defaultValue={bsRecord?.morningBeforeMeal || ''}
                                            onBlur={(e) => handleBSSave(resident.id, { morningBeforeMeal: e.target.value ? parseFloat(e.target.value) : undefined })}
                                        />
                                    </div>
                                    <span className="text-sm text-slate-400">mmol/L</span>
                                </div>

                                {/* Bowel Movement toggle */}
                                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center flex-shrink-0">
                                            <Check className="w-5 h-5 text-green-500" />
                                        </div>
                                        <span className="font-medium text-slate-600">Đại tiện</span>
                                    </div>
                                    <select
                                        value={record?.bowel_movements || ''}
                                        onChange={(e) => handleUpdate(resident.id, 'bowel_movements', e.target.value)}
                                        className="h-9 px-3 border border-slate-200 rounded-lg bg-white focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none text-sm font-medium text-slate-700"
                                    >
                                        <option value="">Chưa có</option>
                                        <option value="thường">Bình thường (x)</option>
                                        <option value="móc">Móc (M)</option>
                                        <option value="thụt">Thụt (T)</option>
                                    </select>
                                </div>
                            </div>
                        )}
                    </div>
                );
            })}

            {residents.length === 0 && (
                <div className="text-center py-12 text-slate-500">
                    Không có NCT để hiển thị
                </div>
            )}
        </div>
    );
};
