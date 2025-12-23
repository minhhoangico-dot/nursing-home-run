import React, { useState } from 'react';
import { Pill } from 'lucide-react';
import { Prescription, InventoryItem, Resident, User } from '../../../types/index';
import { PrescriptionForm } from './PrescriptionForm';

export const PrescriptionList = ({ user, resident, inventory, onUpdate }: { user: User, resident: Resident, inventory: InventoryItem[], onUpdate: (r: Resident) => void }) => {
  const [showModal, setShowModal] = useState(false);

  const handleAdd = (p: Prescription) => {
     onUpdate({
        ...resident,
        prescriptions: [...resident.prescriptions, p]
     });
     setShowModal(false);
  };

  return (
    <div>
        {showModal && <PrescriptionForm user={user} inventory={inventory} onClose={() => setShowModal(false)} onSave={handleAdd} />}
        
        <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                <Pill className="w-5 h-5 text-teal-600" /> Đơn thuốc đang dùng
            </h3>
            <button onClick={() => setShowModal(true)} className="text-xs bg-teal-50 text-teal-700 px-3 py-1.5 rounded-lg font-medium hover:bg-teal-100 border border-teal-200">
                + Kê đơn mới
            </button>
        </div>
        <div className="border rounded-lg overflow-hidden shadow-sm">
            <table className="w-full text-sm">
                <thead className="bg-slate-50">
                    <tr>
                    <th className="px-4 py-2 text-left text-slate-500 font-medium">Tên thuốc</th>
                    <th className="px-4 py-2 text-left text-slate-500 font-medium">Liều lượng</th>
                    <th className="px-4 py-2 text-left text-slate-500 font-medium">Tần suất</th>
                    <th className="px-4 py-2 text-left text-slate-500 font-medium">Ngày bắt đầu</th>
                    <th className="px-4 py-2 text-center text-slate-500 font-medium">Bác sĩ kê</th>
                    <th className="px-4 py-2 text-center text-slate-500 font-medium">Trạng thái</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {resident.prescriptions.length > 0 ? resident.prescriptions.map((p, i) => (
                    <tr key={i} className="hover:bg-slate-50">
                        <td className="px-4 py-3 font-medium text-slate-800">{p.medicationName}</td>
                        <td className="px-4 py-3 text-slate-600">{p.dosage}</td>
                        <td className="px-4 py-3 text-slate-600">{p.frequency}</td>
                        <td className="px-4 py-3 text-slate-600">{p.startDate}</td>
                        <td className="px-4 py-3 text-center text-slate-600">{p.doctor}</td>
                        <td className="px-4 py-3 text-center">
                            <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">Đang dùng</span>
                        </td>
                    </tr>
                    )) : (
                    <tr><td colSpan={6} className="text-center py-6 text-slate-400 italic">Chưa có đơn thuốc nào</td></tr>
                    )}
                </tbody>
            </table>
        </div>
    </div>
  );
};