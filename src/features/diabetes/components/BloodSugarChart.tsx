import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';
import { BloodSugarRecord } from '@/src/types';

interface BloodSugarChartProps {
    data: BloodSugarRecord[];
}

export const BloodSugarChart = ({ data }: BloodSugarChartProps) => {
    // Transform data for chart
    // Sort by date ascending
    const chartData = [...data]
        .sort((a, b) => new Date(a.recordDate).getTime() - new Date(b.recordDate).getTime())
        .map(r => ({
            date: new Date(r.recordDate).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' }),
            'Sáng (Trước)': r.morningBeforeMeal,
            'Sáng (Sau)': r.morningAfterMeal,
            'Trưa (Trước)': r.lunchBeforeMeal,
            'Trưa (Sau)': r.lunchAfterMeal,
            'Tối (Trước)': r.dinnerBeforeMeal,
            'Tối (Sau)': r.dinnerAfterMeal,
        }));

    return (
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 h-[400px]">
            <h3 className="text-lg font-bold mb-4 text-slate-800">Biểu đồ đường huyết</h3>
            <ResponsiveContainer width="100%" height="100%">
                <LineChart
                    data={chartData}
                    margin={{
                        top: 5,
                        right: 30,
                        left: 20,
                        bottom: 5,
                    }}
                >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis domain={[0, 20]} label={{ value: 'mmol/L', angle: -90, position: 'insideLeft' }} />
                    <Tooltip />
                    <Legend />
                    {/* Zones */}
                    <ReferenceLine y={4} stroke="red" strokeDasharray="3 3" label="Thấp" />
                    <ReferenceLine y={10} stroke="orange" strokeDasharray="3 3" label="Cao" />

                    {/* Lines - Using distinctive colors */}
                    <Line type="monotone" dataKey="Sáng (Trước)" stroke="#8884d8" name="Sáng (Trước)" strokeWidth={2} />
                    <Line type="monotone" dataKey="Sáng (Sau)" stroke="#82ca9d" name="Sáng (Sau)" strokeWidth={2} />
                    {/* Hidden by default or lighter? User can toggle in legend */}
                    <Line type="monotone" dataKey="Trưa (Trước)" stroke="#ffc658" name="Trưa (Trước)" hide />
                    <Line type="monotone" dataKey="Trưa (Sau)" stroke="#ff7300" name="Trưa (Sau)" hide />

                </LineChart>
            </ResponsiveContainer>
        </div>
    );
};
