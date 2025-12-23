import React, { useState } from 'react';
import { FileText } from 'lucide-react';
import { Resident, MedicalVisit, User } from '../../../types/index';

const VisitModal = ({ user, onClose, onSave }: { user: User, onClose: () => void, onSave: (v: MedicalVisit) => void }) => {
   const [data, setData] = useState({
      complaint: '',
      diagnosis: '',
      treatment: ''
   });

   const handleSave = () => {
      onSave({
         id: `V${Math.floor(Math.random() * 1000)}`,
         date: new Date().toLocaleDateString('vi-VN'),
         doctor: user.name,
         ...data
      });
   };

   return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
         <div className="bg-white rounded-xl w-full max-w-lg p-6">
            <h3 className="font-bold text-lg mb-4">Ghi nhận khám bệnh</h3>
            <div className="space-y-4">
               <div>
                  <label className="block text-sm font-medium mb-1">Lý do khám / Triệu chứng</label>
                  <input type="text" className="w-full border rounded p-2" value={data.complaint} onChange={e => setData({...data, complaint: e.target.value})} />
               </div>
               <div>
                  <label className="block text-sm font-medium mb-1">Chẩn đoán sơ bộ</label>
                  <textarea className="w-full border rounded p-2" rows={2} value={data.diagnosis} onChange={e => setData({...data, diagnosis: e.target.value})}></textarea>
               </div>
               <div>
                  <label className="block text-sm font-medium mb-1">Hướng điều trị / Ghi chú</label>
                  <textarea className="w-full border rounded p-2" rows={2} value={data.treatment} onChange={e => setData({...data, treatment: e.target.value})}></textarea>
               </div>
            </div>
            <div className="mt-6 flex justify-end gap-2">
               <button onClick={onClose} className="px-4 py-2 text-slate-500 hover:bg-slate-100 rounded">Hủy</button>
               <button onClick={handleSave} className="px-4 py-2 bg-teal-600 text-white rounded hover:bg-teal-700">Lưu phiếu khám</button>
            </div>
         </div>
      </div>
   );
};

export const MedicalVisitsSection = ({ user, resident, onUpdate }: { user: User, resident: Resident, onUpdate: (r: Resident) => void }) => {
  const [showModal, setShowModal] = useState(false);

  const handleAddVisit = (v: MedicalVisit) => {
     onUpdate({
        ...resident,
        medicalVisits: [v, ...resident.medicalVisits]
     });
     setShowModal(false);
  };

  return (
    <div>
        {showModal && <VisitModal user={user} onClose={() => setShowModal(false)} onSave={handleAddVisit} />}
        
        <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                <FileText className="w-5 h-5 text-purple-600" /> Lịch sử khám bệnh
            </h3>
            <button onClick={() => setShowModal(true)} className="text-xs bg-purple-50 text-purple-700 px-3 py-1.5 rounded-lg font-medium hover:bg-purple-100 border border-purple-200">
                + Ghi nhận khám
            </button>
        </div>
        <div className="space-y-3">
            {resident.medicalVisits.length > 0 ? resident.medicalVisits.map((v, i) => (
                <div key={i} className="p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                    <div className="flex justify-between items-start mb-2">
                    <span className="font-bold text-slate-800">{v.date}</span>
                    <span className="text-xs bg-slate-100 px-2 py-1 rounded text-slate-600">{v.doctor}</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                    <div>
                        <p className="text-xs text-slate-500 uppercase font-bold">Triệu chứng</p>
                        <p className="text-sm text-slate-700">{v.complaint}</p>
                    </div>
                    <div>
                        <p className="text-xs text-slate-500 uppercase font-bold">Chẩn đoán & Điều trị</p>
                        <p className="text-sm text-slate-700"><span className="font-medium">{v.diagnosis}</span> - {v.treatment}</p>
                    </div>
                    </div>
                </div>
            )) : (
                <div className="text-center py-6 text-slate-400 italic border rounded-lg border-dashed bg-slate-50">Chưa có lịch sử khám</div>
            )}
        </div>
    </div>
  );
};