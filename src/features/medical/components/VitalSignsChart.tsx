import React from 'react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    ReferenceArea,
    ReferenceLine
} from 'recharts';
import { DailyMonitoringRecord } from '@/src/types/dailyMonitoring';

interface VitalSignsChartProps {
    data: DailyMonitoringRecord[];
    type: 'bp' | 'pulse' | 'sp02' | 'temp';
    days?: number;
}

export const VitalSignsChart = ({ data, type, days = 7 }: VitalSignsChartProps) => {
    // 1. Process Data
    const processedData = [...data]
        .sort((a, b) => new Date(a.record_date).getTime() - new Date(b.record_date).getTime())
        .slice(-days) // Take last N days
        .map(record => {
            const date = new Date(record.record_date).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });

            // BP Logic: Parse '120/80' strings
            let bpSys = null;
            let bpDia = null;
            if (type === 'bp' && record.bp_morning) {
                const parts = record.bp_morning.split('/');
                if (parts.length === 2) {
                    bpSys = parseInt(parts[0]);
                    bpDia = parseInt(parts[1]);
                }
            }

            return {
                date,
                ...record,
                bpSys,
                bpDia,
                pulse: record.pulse,
                sp02: record.sp02,
                temp: record.temperature
            };
        });

    // 2. Configuration per type
    const config = {
        bp: {
            yDomain: [40, 200],
            unit: 'mmHg',
            lines: [
                { key: 'bpSys', color: '#ef4444', name: 'Huyết áp tâm thu' },
                { key: 'bpDia', color: '#3b82f6', name: 'Huyết áp tâm trương' }
            ],
            refLines: [
                { y: 140, label: 'Cao (140)', color: 'orange' },
                { y: 90, label: 'Cao (90)', color: 'orange' }
            ]
        },
        pulse: {
            yDomain: [40, 140],
            unit: 'lần/p',
            lines: [
                { key: 'pulse', color: '#ec4899', name: 'Mạch' }
            ],
            refLines: [
                { y: 100, label: 'Nhanh (100)', color: 'orange' },
                { y: 60, label: 'Chậm (60)', color: 'blue' }
            ]
        },
        sp02: {
            yDomain: [80, 100],
            unit: '%',
            lines: [
                { key: 'sp02', color: '#0ea5e9', name: 'SpO2' }
            ],
            refLines: [
                { y: 95, label: 'Thấp (95%)', color: 'red' }
            ]
        },
        temp: {
            yDomain: [35, 42],
            unit: '°C',
            lines: [
                { key: 'temp', color: '#f59e0b', name: 'Nhiệt độ' }
            ],
            refLines: [
                { y: 37.5, label: 'Sốt nhẹ', color: 'orange' }
            ]
        }
    };

    const activeConfig = config[type];

    if (!processedData.length) {
        return <div className="h-full flex items-center justify-center text-slate-400">Chưa có dữ liệu biểu đồ</div>;
    }

    return (
        <div className="w-full h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
                <LineChart
                    data={processedData}
                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis
                        dataKey="date"
                        tick={{ fontSize: 12, fill: '#64748b' }}
                        axisLine={false}
                        tickLine={false}
                    />
                    <YAxis
                        domain={activeConfig.yDomain}
                        unit={type === 'temp' ? '' : ''}
                        tick={{ fontSize: 12, fill: '#64748b' }}
                        axisLine={false}
                        tickLine={false}
                    />
                    <Tooltip
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    />
                    <Legend />

                    {activeConfig.refLines.map((ref, idx) => (
                        <ReferenceLine key={idx} y={ref.y} stroke={ref.color} strokeDasharray="3 3" label={{ value: ref.label, fill: ref.color, fontSize: 10 }} />
                    ))}

                    {activeConfig.lines.map((line) => (
                        <Line
                            key={line.key}
                            type="monotone"
                            dataKey={line.key}
                            stroke={line.color}
                            name={line.name}
                            strokeWidth={3}
                            dot={{ r: 4, strokeWidth: 2 }}
                            activeDot={{ r: 6 }}
                        />
                    ))}
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
};
