import React, { useMemo, useState } from 'react';
import { X, Calendar, AlertCircle, Droplets, Utensils } from 'lucide-react';
import { DailyMonitoringRecord } from '@/src/types/dailyMonitoring';
import { VitalSignsChart } from './VitalSignsChart';

type MetricType = 'bp' | 'pulse' | 'sp02' | 'temp' | 'blood_sugar' | 'bowel';

interface MetricDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    type: MetricType;
    data: DailyMonitoringRecord[];
    residentName: string;
}

const METRIC_CONFIG = {
    bp: {
        title: 'Huyết áp',
        unit: 'mmHg',
        desc: 'Theo dõi huyết áp tâm thu/tâm trương',
        normal: '120/80',
        color: 'bg-blue-50 text-blue-700 border-blue-200'
    },
    pulse: {
        title: 'Mạch',
        unit: 'lần/phút',
        desc: 'Nhịp tim lúc nghỉ ngơi',
        normal: '60-100',
        color: 'bg-pink-50 text-pink-700 border-pink-200'
    },
    sp02: {
        title: 'SpO2',
        unit: '%',
        desc: 'Độ bão hòa oxy trong máu',
        normal: '> 95%',
        color: 'bg-sky-50 text-sky-700 border-sky-200'
    },
    temp: {
        title: 'Nhiệt độ',
        unit: '°C',
        desc: 'Thân nhiệt cơ thể',
        normal: '36.5 - 37.5',
        color: 'bg-orange-50 text-orange-700 border-orange-200'
    },
    blood_sugar: {
        title: 'Đường huyết',
        unit: 'mmol/L',
        desc: 'Chỉ số đường huyết mao mạch',
        normal: '3.9 - 6.4', // Fasting
        color: 'bg-emerald-50 text-emerald-700 border-emerald-200'
    },
    bowel: {
        title: 'Đại tiện',
        unit: 'lần', // Or description
        desc: 'Theo dõi bài tiết',
        normal: '-',
        color: 'bg-amber-50 text-amber-700 border-amber-200'
    }
};

export const MetricDetailModal = ({ isOpen, onClose, type, data, residentName }: MetricDetailModalProps) => {
    const [days, setDays] = useState(30);

    const config = METRIC_CONFIG[type];

    // Statistics Calculation
    const stats = useMemo(() => {
        if (!data.length || type === 'bowel') return null;

        const last30 = data
            .sort((a, b) => new Date(a.record_date).getTime() - new Date(b.record_date).getTime())
            .slice(-days);

        let values: number[] = [];

        if (type === 'bp') {
            values = last30
                .map(r => r.bp_morning ? parseInt(r.bp_morning.split('/')[0]) : 0)
                .filter(v => v > 0);
        } else if (type === 'pulse') {
            values = last30.map(r => r.pulse || 0).filter(v => v > 0);
        } else if (type === 'sp02') {
            values = last30.map(r => r.sp02 || 0).filter(v => v > 0);
        } else if (type === 'temp') {
            values = last30.map(r => r.temperature || 0).filter(v => v > 0);
        } else if (type === 'blood_sugar') {
            values = last30.map(r => r.blood_sugar || 0).filter(v => v > 0);
        }

        if (!values.length) return null;

        const max = Math.max(...values);
        const min = Math.min(...values);
        const avg = (values.reduce((a, b) => a + b, 0) / values.length).toFixed(1);

        return { max, min, avg, count: values.length };
    }, [data, type, days]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">

                {/* Header */}
                <div className="p-6 border-b border-slate-100 flex justify-between items-start bg-slate-50/50">
                    <div>
                        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                            {config.title} <span className="text-slate-400 font-normal text-sm">| {residentName}</span>
                        </h2>
                        <p className="text-sm text-slate-500 mt-1">{config.desc}. Mức bình thường: <strong className="text-slate-700">{config.normal}</strong></p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                        <X className="w-5 h-5 text-slate-500" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6">
                    {/* Controls & Summary */}
                    {type !== 'bowel' && (
                        <div className="flex flex-col md:flex-row gap-6 mb-8">
                            {/* Left: Summary Stats */}
                            <div className="flex-1 grid grid-cols-3 gap-4">
                                <div className="p-4 bg-red-50 rounded-xl border border-red-100 text-center">
                                    <p className="text-xs text-red-600 uppercase font-bold mb-1">Cao nhất</p>
                                    <p className="text-2xl font-bold text-slate-800">{stats?.max || '-'}</p>
                                    <p className="text-xs text-slate-500">{config.unit}</p>
                                </div>
                                <div className="p-4 bg-teal-50 rounded-xl border border-teal-100 text-center">
                                    <p className="text-xs text-teal-600 uppercase font-bold mb-1">Trung bình</p>
                                    <p className="text-2xl font-bold text-slate-800">{stats?.avg || '-'}</p>
                                    <p className="text-xs text-slate-500">{config.unit}</p>
                                </div>
                                <div className="p-4 bg-blue-50 rounded-xl border border-blue-100 text-center">
                                    <p className="text-xs text-blue-600 uppercase font-bold mb-1">Thấp nhất</p>
                                    <p className="text-2xl font-bold text-slate-800">{stats?.min || '-'}</p>
                                    <p className="text-xs text-slate-500">{config.unit}</p>
                                </div>
                            </div>

                            {/* Right: Filter or Advice */}
                            <div className="w-full md:w-64 bg-slate-50 rounded-xl p-4 border border-slate-200">
                                <div className="flex items-center gap-2 mb-3">
                                    <Calendar className="w-4 h-4 text-slate-500" />
                                    <span className="text-sm font-bold text-slate-700">Khoảng thời gian</span>
                                </div>
                                <div className="flex gap-2">
                                    {[7, 14, 30].map(d => (
                                        <button
                                            key={d}
                                            onClick={() => setDays(d)}
                                            className={`flex-1 py-1.5 text-xs font-medium rounded border ${days === d
                                                ? 'bg-white border-teal-600 text-teal-700 shadow-sm'
                                                : 'border-transparent text-slate-500 hover:bg-white hover:border-slate-300'
                                                }`}
                                        >
                                            {d} ngày
                                        </button>
                                    ))}
                                </div>

                                <div className="mt-4 pt-4 border-t border-slate-200">
                                    <div className="flex items-start gap-2">
                                        <AlertCircle className="w-4 h-4 text-orange-500 mt-0.5" />
                                        <p className="text-xs text-slate-600 leading-relaxed">
                                            {type === 'bp' ? 'Biểu đồ hiển thị dữ liệu buổi sáng làm tiêu chuẩn tham chiếu chính.' : 'Dữ liệu được cập nhật từ các lần đo trong ngày.'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Chart Section */}
                    {type !== 'bowel' && (
                        <div className="mb-8 bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
                            <VitalSignsChart data={data} type={type as any} days={days} />
                        </div>
                    )}

                    {/* History Table (Compact) */}
                    <div>
                        <h3 className="font-bold text-slate-800 mb-4">Lịch sử chi tiết</h3>
                        <div className="border rounded-lg overflow-hidden">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-slate-50 text-slate-500 font-medium">
                                    <tr>
                                        <th className="px-4 py-3">Ngày</th>
                                        <th className="px-4 py-3">Kết quả</th>
                                        {type === 'bp' && (
                                            <>
                                                <th className="px-4 py-3">Trưa</th>
                                                <th className="px-4 py-3">Chiều</th>
                                            </>
                                        )}
                                        <th className="px-4 py-3 text-right">Ghi chú</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {data.slice(0, 30).map((record) => {
                                        const dateStr = record.record_date.split('-').reverse().join('/');

                                        let val = '-';

                                        if (type === 'bp') val = record.bp_morning || '-';
                                        else if (type === 'pulse') val = record.pulse ? `${record.pulse}` : '-';
                                        else if (type === 'sp02') val = record.sp02 ? `${record.sp02}%` : '-';
                                        else if (type === 'temp') val = record.temperature ? `${record.temperature}°C` : '-';
                                        else if (type === 'blood_sugar') val = record.blood_sugar ? `${record.blood_sugar} mmol/L` : '-';
                                        else if (type === 'bowel') val = record.bowel_movements || '-';

                                        return (
                                            <tr key={record.id} className="hover:bg-slate-50">
                                                <td className="px-4 py-3 font-medium text-slate-900">{dateStr}</td>
                                                <td className="px-4 py-3 font-semibold text-slate-700">{val}</td>
                                                {type === 'bp' && (
                                                    <>
                                                        <td className="px-4 py-3 text-slate-500">{record.bp_afternoon || '-'}</td>
                                                        <td className="px-4 py-3 text-slate-500">{record.bp_evening || '-'}</td>
                                                    </>
                                                )}
                                                <td className="px-4 py-3 text-right text-slate-400 italic">{record.notes || ''}</td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                            {data.length === 0 && <div className="p-8 text-center text-slate-400">Chưa có dữ liệu</div>}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
