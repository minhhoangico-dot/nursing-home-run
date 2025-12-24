import React from 'react';
import { Resident } from '@/src/types/resident';
import { WeightRecord } from '@/src/types';

interface PrintWeightFormProps {
    month: string; // YYYY-MM
    residents: Resident[];
    records: WeightRecord[];
}

export const PrintWeightForm = ({ month, residents, records }: PrintWeightFormProps) => {
    const [yearStr, monthStr] = month.split('-');

    const getBMI = (weight: number, height: number) => {
        if (!height) return '-';
        const bmi = weight / (height * height);
        return bmi.toFixed(1);
    };

    const getWeight = (residentId: string) => {
        return records.find(r => r.residentId === residentId)?.weightKg;
    };

    return (
        <div className="p-8 bg-white text-black print:block hidden font-serif">
            <div className="text-center mb-6">
                <h1 className="text-2xl font-bold uppercase">Bảng Theo Dõi Cân Nặng</h1>
                <p className="mt-1">Tháng {monthStr} Năm {yearStr}</p>
                <p className="text-sm italic mt-1">Tầng: 3</p>
            </div>

            <table className="w-full border-collapse border border-black text-sm">
                <thead>
                    <tr>
                        <th className="border border-black p-2 w-10">STT</th>
                        <th className="border border-black p-2 text-left">Họ tên NCT</th>
                        <th className="border border-black p-2">Phòng</th>
                        <th className="border border-black p-2">Chiều cao (m)</th>
                        <th className="border border-black p-2">Cân nặng (kg)</th>
                        <th className="border border-black p-2">BMI</th>
                        <th className="border border-black p-2">Đánh giá</th>
                        <th className="border border-black p-2">Ghi chú</th>
                    </tr>
                </thead>
                <tbody>
                    {residents.map((r, idx) => {
                        const weight = getWeight(r.id);
                        const bmi = weight && r.height ? getBMI(weight, r.height) : '-';
                        let evalText = '';
                        if (bmi !== '-') {
                            const b = parseFloat(bmi);
                            if (b < 18.5) evalText = 'Gầy';
                            else if (b < 23) evalText = 'BT';
                            else if (b < 25) evalText = 'Tiền béo phì';
                            else evalText = 'Béo phì';
                        }

                        return (
                            <tr key={r.id}>
                                <td className="border border-black p-2 text-center">{idx + 1}</td>
                                <td className="border border-black p-2 font-medium">{r.name}</td>
                                <td className="border border-black p-2 text-center">{r.room}</td>
                                <td className="border border-black p-2 text-center">{r.height || '-'}</td>
                                <td className="border border-black p-2 text-center font-bold">{weight || ''}</td>
                                <td className="border border-black p-2 text-center">{bmi}</td>
                                <td className="border border-black p-2 text-center">{evalText}</td>
                                <td className="border border-black p-2"></td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>

            <div className="flex justify-between mt-12 px-8">
                <div className="text-center">
                    <p className="font-bold">Người lập biểu</p>
                    <p className="italic text-xs mt-12">(Ký, họ tên)</p>
                </div>
                <div className="text-center">
                    <p className="font-bold">Y tá trưởng</p>
                    <p className="italic text-xs mt-12">(Ký, họ tên)</p>
                </div>
            </div>
        </div>
    );
};
