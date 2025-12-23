import React from 'react';
import { ProcedureRecord, PROCEDURE_LABELS, ProcedureType } from '@/src/types';

export const PrintProcedureForm = ({ month, year, data }: { month: number, year: number, data: ProcedureRecord[] }) => {
    const getProcedureNames = (r: ProcedureRecord) => {
        const types: string[] = [];
        if (r.injection) types.push(PROCEDURE_LABELS.injection);
        if (r.ivDrip) types.push(PROCEDURE_LABELS.ivDrip);
        if (r.gastricTube) types.push(PROCEDURE_LABELS.gastricTube);
        if (r.urinaryCatheter) types.push(PROCEDURE_LABELS.urinaryCatheter);
        if (r.bladderWash) types.push(PROCEDURE_LABELS.bladderWash);
        if (r.bloodSugarTest) types.push(PROCEDURE_LABELS.bloodSugarTest);
        if (r.bloodPressure) types.push(PROCEDURE_LABELS.bloodPressure);
        if (r.oxygenTherapy) types.push(PROCEDURE_LABELS.oxygenTherapy);
        if (r.woundDressing) types.push(PROCEDURE_LABELS.woundDressing);
        return types.join(', ');
    };

    return (
        <div className="p-8 bg-white text-black print:block hidden">
            <div className="text-center mb-6">
                <h1 className="text-2xl font-bold uppercase">Sổ Theo Dõi Thủ Thuật Y Tế</h1>
                <p className="text-sm mt-1">Tháng {month} Năm {year}</p>
            </div>

            <table className="w-full border-collapse border border-black text-sm">
                <thead>
                    <tr>
                        <th className="border border-black p-2">Ngày</th>
                        <th className="border border-black p-2">Họ tên NCT</th>
                        <th className="border border-black p-2">Tên thủ thuật</th>
                        <th className="border border-black p-2">Người thực hiện</th>
                        <th className="border border-black p-2">Kết quả/Bất thường</th>
                        <th className="border border-black p-2">Ký tên</th>
                    </tr>
                </thead>
                <tbody>
                    {data.map((r, idx) => (
                        <tr key={idx}>
                            <td className="border border-black p-2 text-center">{new Date(r.recordDate).toLocaleDateString('vi-VN')}</td>
                            <td className="border border-black p-2">{r.residentId}</td>
                            <td className="border border-black p-2">{getProcedureNames(r)}</td>
                            <td className="border border-black p-2">{r.performedBy}</td>
                            <td className="border border-black p-2">{r.notes}</td>
                            <td className="border border-black p-2"></td>
                        </tr>
                    ))}
                    {data.length === 0 && (
                        <tr>
                            <td colSpan={6} className="border border-black p-8 text-center italic">Chưa có dữ liệu</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};
/* Note: residentId maps to ID, need name in real app. Simplified for now. */
