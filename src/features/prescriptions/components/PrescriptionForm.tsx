import React, { useState } from 'react';
import { Prescription, InventoryItem, User } from '../../../types/index';

export const PrescriptionForm = ({ user, onClose, onSave, inventory }: { user: User, onClose: () => void, onSave: (p: Prescription) => void, inventory: InventoryItem[] }) => {
  const [data, setData] = useState({
    medicationName: '',
    dosage: '',
    frequency: 'Sáng, Chiều',
    duration: 7
  });

  const meds = inventory.filter(i => i.category === 'Thuốc');

  const handleSave = () => {
    const p: Prescription = {
      id: `P${Math.floor(Math.random() * 1000)}`,
      medicationName: data.medicationName,
      dosage: data.dosage,
      frequency: data.frequency,
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + data.duration * 86400000).toISOString().split('T')[0],
      doctor: user.name,
      status: 'Active'
    };
    onSave(p);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
       <div className="bg-white rounded-xl w-full max-w-md p-6">
          <h3 className="font-bold text-lg mb-4">Kê đơn thuốc mới</h3>
          <div className="space-y-4">
             <div>
                <label className="block text-sm font-medium mb-1">Tên thuốc</label>
                <select className="w-full border rounded p-2" value={data.medicationName} onChange={e => setData({...data, medicationName: e.target.value})}>
                   <option value="">-- Chọn thuốc --</option>
                   {meds.map(m => <option key={m.id} value={m.name}>{m.name} (Tồn: {m.stock})</option>)}
                </select>
             </div>
             <div>
                <label className="block text-sm font-medium mb-1">Liều lượng</label>
                <input type="text" className="w-full border rounded p-2" placeholder="VD: 1 viên" value={data.dosage} onChange={e => setData({...data, dosage: e.target.value})} />
             </div>
             <div>
                <label className="block text-sm font-medium mb-1">Tần suất</label>
                <select className="w-full border rounded p-2" value={data.frequency} onChange={e => setData({...data, frequency: e.target.value})}>
                   <option>Sáng</option>
                   <option>Sáng, Chiều</option>
                   <option>Sáng, Trưa, Chiều</option>
                   <option>Tối</option>
                </select>
             </div>
             <div>
                <label className="block text-sm font-medium mb-1">Thời gian (ngày)</label>
                <input type="number" className="w-full border rounded p-2" value={data.duration} onChange={e => setData({...data, duration: Number(e.target.value)})} />
             </div>
          </div>
          <div className="mt-6 flex justify-end gap-2">
             <button onClick={onClose} className="px-4 py-2 text-slate-500 hover:bg-slate-100 rounded">Hủy</button>
             <button onClick={handleSave} className="px-4 py-2 bg-teal-600 text-white rounded hover:bg-teal-700">Lưu đơn thuốc</button>
          </div>
       </div>
    </div>
  );
};