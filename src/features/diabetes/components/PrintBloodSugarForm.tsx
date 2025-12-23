import React from 'react';
import { BloodSugarRecord, Resident } from '@/src/types';

export const PrintBloodSugarForm = ({ resident, records }: { resident: Resident, records: BloodSugarRecord[] }) => {
    return (
        <div className="p-8 bg-white text-black print:block hidden">
            <div className="text-center mb-6">
                <h1 className="text-2xl font-bold uppercase">Phiếu Theo Dõi Đường Huyết</h1>
                <p className="text-sm mt-1">Tháng ...... Năm 20......</p>
            </div>

            <div className="flex justify-between mb-4">
                <p><span className="font-bold">Họ tên NCT:</span> {resident.name}</p>
                <p><span className="font-bold">Phòng:</span> {resident.room}</p>
                <p><span className="font-bold">Năm sinh:</span> {new Date(resident.dob).getFullYear()}</p>
            </div>

            <table className="w-full border-collapse border border-black text-xs">
                <thead>
                    <tr>
                        <th className="border border-black p-1" rowSpan={2}>Ngày</th>
                        <th className="border border-black p-1" colSpan={2}>Sáng</th>
                        <th className="border border-black p-1" colSpan={2}>Trưa</th>
                        <th className="border border-black p-1" colSpan={2}>Chiều</th>
                        <th className="border border-black p-1" rowSpan={2}>Insulin</th>
                        <th className="border border-black p-1" rowSpan={2}>Ký tên</th>
                    </tr>
                    <tr>
                        <th className="border border-black p-1">Trước ăn</th>
                        <th className="border border-black p-1">Sau ăn</th>
                        <th className="border border-black p-1">Trước ăn</th>
                        <th className="border border-black p-1">Sau ăn</th>
                        <th className="border border-black p-1">Trước ăn</th>
                        <th className="border border-black p-1">Sau ăn</th>
                    </tr>
                </thead>
                <tbody>
                    {records.map((r, idx) => (
                        <tr key={idx}>
                            <td className="border border-black p-1 text-center">{new Date(r.recordDate).getDate()}</td>
                            <td className="border border-black p-1 text-center">{r.morningBeforeMeal}</td>
                            <td className="border border-black p-1 text-center">{r.morningAfterMeal}</td>
                            <td className="border border-black p-1 text-center">{r.lunchBeforeMeal}</td>
                            <td className="border border-black p-1 text-center">{r.lunchAfterMeal}</td>
                            <td className="border border-black p-1 text-center">{r.dinnerBeforeMeal}</td>
                            <td className="border border-black p-1 text-center">{r.dinnerAfterMeal}</td>
                            <td className="border border-black p-1 text-center">{r.insulinUnits ? `${r.insulinUnits}UI` : ''}</td>
                            <td className="border border-black p-1"></td>
                        </tr>
                    ))}
                    {/* Fill empty rows for the rest of the month if needed */}
                    {Array.from({ length: Math.max(0, 31 - records.length) }).map((_, i) => (
                        <tr key={`empty-${i}`}>
                            <td className="border border-black p-4"></td>
                            <td className="border border-black p-4"></td>
                            <td className="border border-black p-4"></td>
                            <td className="border border-black p-4"></td>
                            <td className="border border-black p-4"></td>
                            <td className="border border-black p-4"></td>
                            <td className="border border-black p-4"></td>
                            <td className="border border-black p-4"></td>
                            <td className="border border-black p-4"></td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};
