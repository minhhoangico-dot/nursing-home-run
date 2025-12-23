import React from 'react';
import { WeightRecord, Resident } from '@/src/types';

export const PrintWeightForm = ({ month, year, residents, weights }: { month: number, year: number, residents: Resident[], weights: WeightRecord[] }) => {
    return (
        <div className="p-8 bg-white text-black print:block hidden">
            <div className="text-center mb-6">
                <h1 className="text-2xl font-bold uppercase">Phiếu Theo Dõi Cân Nặng</h1>
                <p className="text-sm mt-1">Tháng {month} Năm {year}</p>
            </div>

            <table className="w-full border-collapse border border-black text-sm">
                <thead>
                    <tr>
                        <th className="border border-black p-2 w-10">STT</th>
                        <th className="border border-black p-2">Họ và tên</th>
                        <th className="border border-black p-2">Phòng</th>
                        <th className="border border-black p-2">Cân nặng (kg)</th>
                        <th className="border border-black p-2">Thay đổi so với tháng trước</th>
                        <th className="border border-black p-2">Ghi chú</th>
                    </tr>
                </thead>
                <tbody>
                    {residents.map((r, idx) => {
                        const w = weights.find(wr => wr.residentId === r.id);
                        return (
                            <tr key={r.id}>
                                <td className="border border-black p-2 text-center">{idx + 1}</td>
                                <td className="border border-black p-2">{r.name}</td>
                                <td className="border border-black p-2 text-center">{r.room}</td>
                                <td className="border border-black p-2 text-center font-bold">{w?.weightKg || '-'}</td>
                                <td className="border border-black p-2 text-center">
                                    {/* Placeholder for diff logic */}
                                    -
                                </td>
                                <td className="border border-black p-2">{w?.notes || ''}</td>
                            </tr>
                        )
                    })}
                </tbody>
            </table>

            <div className="mt-8 flex justify-end">
                <div className="text-center pr-12">
                    <p className="font-bold mb-16">Người lập phiếu</p>
                    <p className="italic">(Ký và ghi rõ họ tên)</p>
                </div>
            </div>
        </div>
    );
};
