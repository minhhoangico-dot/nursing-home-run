import React from 'react';
import { ShiftHandover } from '@/src/types';

export const PrintShiftHandover = ({ data }: { data: ShiftHandover }) => {
    return (
        <div className="p-8 bg-white text-black print:block hidden" id="print-handover">
            <div className="text-center mb-6">
                <h1 className="text-2xl font-bold uppercase">Biên Bản Giao Ca Trực</h1>
                <p className="text-sm">Tầng: {data.floorId} - Ngày: {new Date(data.shiftDate).toLocaleDateString('vi-VN')} - Ca: {data.shiftTime}</p>
            </div>

            <div className="grid grid-cols-2 gap-8 mb-6">
                <div>
                    <p className="font-bold">Người giao:</p>
                    <p>{data.handoverStaff.join(', ')}</p>
                </div>
                <div>
                    <p className="font-bold">Người nhận:</p>
                    <p>{data.receiverStaff.join(', ')}</p>
                </div>
            </div>

            <div className="mb-4">
                <p className="font-bold">Tổng số NCT: {data.totalResidents}</p>
            </div>

            <div className="mb-6">
                <h3 className="font-bold border-b border-black mb-2 pb-1">Ghi chú đặc biệt</h3>
                <table className="w-full border-collapse border border-black text-sm">
                    <thead>
                        <tr>
                            <th className="border border-black p-2">STT</th>
                            <th className="border border-black p-2">Tên NCT</th>
                            <th className="border border-black p-2">Nội dung</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.notes?.map((note, idx) => (
                            <tr key={idx}>
                                <td className="border border-black p-2 text-center">{idx + 1}</td>
                                <td className="border border-black p-2">{note.residentName}</td>
                                <td className="border border-black p-2">{note.content}</td>
                            </tr>
                        ))}
                        {(!data.notes || data.notes.length === 0) && (
                            <tr>
                                <td colSpan={3} className="border border-black p-4 text-center italic">Không có ghi chú</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <div className="flex justify-between mt-12">
                <div className="text-center">
                    <p className="font-bold mb-12">Người giao</p>
                    <p className="italic text-sm">(Ký và ghi rõ họ tên)</p>
                </div>
                <div className="text-center">
                    <p className="font-bold mb-12">Người nhận</p>
                    <p className="italic text-sm">(Ký và ghi rõ họ tên)</p>
                </div>
            </div>
        </div>
    );
};
