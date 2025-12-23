import React, { useState } from 'react';
import { Activity, Stethoscope, AlertTriangle, History } from 'lucide-react';
import { Resident, User } from '../../../types/index';
import { MedicalInfoModal } from './MedicalInfoModal';
import { DiseaseProgressTimeline } from './DiseaseProgressTimeline';

export const MedicalHistorySection = ({ user, resident, onUpdate }: { user: User, resident: Resident, onUpdate: (r: Resident) => void }) => {
  const [showModal, setShowModal] = useState(false);

  return (
    <div className="space-y-6">
      {showModal && (
        <MedicalInfoModal
          user={user}
          resident={resident}
          onClose={() => setShowModal(false)}
          onSave={(data) => onUpdate({...resident, ...data})}
        />
      )}

      {/* Summary & Current Condition */}
      <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-bold text-blue-900 flex items-center gap-2">
            <Activity className="w-5 h-5" /> Tình trạng hiện tại
          </h3>
          <button 
            onClick={() => setShowModal(true)}
            className="text-xs bg-white text-blue-700 px-3 py-1.5 rounded border border-blue-200 hover:bg-blue-50 font-medium"
          >
            Cập nhật thông tin
          </button>
        </div>
        <p className="text-sm text-blue-800 whitespace-pre-wrap">{resident.currentConditionNote || 'Chưa có ghi chú tình trạng.'}</p>
        {(resident.lastMedicalUpdate || resident.lastUpdatedBy) && (
           <p className="text-xs text-blue-400 mt-2">
              Cập nhật lần cuối: {resident.lastMedicalUpdate} {resident.lastUpdatedBy ? `bởi ${resident.lastUpdatedBy}` : ''}
           </p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Medical History List */}
        <div className="md:col-span-2">
            <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <Stethoscope className="w-5 h-5 text-slate-500" /> Danh sách bệnh lý
            </h3>
            <div className="space-y-2">
              {resident.medicalHistory && resident.medicalHistory.length > 0 ? resident.medicalHistory.map(h => (
                  <div key={h.id} className="flex justify-between items-center p-3 bg-slate-50 rounded-lg border border-slate-100 hover:bg-slate-100 transition-colors">
                    <div>
                        <p className="font-bold text-sm text-slate-700">{h.name}</p>
                        <p className="text-xs text-slate-500">Phát hiện: {h.diagnosedDate}</p>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${h.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-slate-200 text-slate-600'}`}>
                        {h.status === 'Active' ? 'Đang điều trị' : 'Đã khỏi'}
                    </span>
                  </div>
              )) : (
                  <p className="text-sm text-slate-400 italic">Chưa có dữ liệu tiền sử bệnh.</p>
              )}
            </div>

            <h3 className="font-semibold text-slate-800 mt-6 mb-4 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-500" /> Dị ứng
            </h3>
            <div className="space-y-2">
              {resident.allergies && resident.allergies.length > 0 ? resident.allergies.map(a => (
                  <div key={a.id} className="flex justify-between items-center p-3 bg-red-50 rounded-lg border border-red-100">
                    <div>
                        <p className="font-bold text-sm text-red-800">{a.allergen}</p>
                        <p className="text-xs text-red-600">Phản ứng: {a.reaction}</p>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs font-bold border ${
                        a.severity === 'Nặng' ? 'bg-red-200 text-red-900 border-red-300' : 
                        a.severity === 'Trung bình' ? 'bg-orange-100 text-orange-800 border-orange-200' : 
                        'bg-yellow-100 text-yellow-800 border-yellow-200'
                    }`}>
                        {a.severity}
                    </span>
                  </div>
              )) : (
                  <p className="text-sm text-slate-400 italic">Không có ghi nhận dị ứng.</p>
              )}
            </div>
        </div>

        {/* Timeline */}
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 h-fit">
           <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <History className="w-5 h-5 text-slate-500" /> Diễn tiến
           </h3>
           <DiseaseProgressTimeline history={resident.medicalHistory || []} />
        </div>
      </div>
    </div>
  );
};