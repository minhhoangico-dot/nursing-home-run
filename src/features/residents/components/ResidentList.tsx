import React from 'react';
import { Resident } from '@/src/types/index';
import { StatusBadge } from '@/src/components/shared/StatusBadge';
import { AlertTriangle, ChevronRight, Droplets, FileText, AlertCircle } from 'lucide-react';

interface ResidentListProps {
  data: Resident[];
  onSelect: (r: Resident) => void;
}

const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

// Aesthetic pastel colors for avatars
const AVATAR_COLORS = [
  'bg-slate-200 text-slate-700',
  'bg-red-100 text-red-700',
  'bg-orange-100 text-orange-700',
  'bg-amber-100 text-amber-700',
  'bg-green-100 text-green-700',
  'bg-emerald-100 text-emerald-700',
  'bg-teal-100 text-teal-700',
  'bg-cyan-100 text-cyan-700',
  'bg-sky-100 text-sky-700',
  'bg-blue-100 text-blue-700',
  'bg-indigo-100 text-indigo-700',
  'bg-violet-100 text-violet-700',
  'bg-purple-100 text-purple-700',
  'bg-fuchsia-100 text-fuchsia-700',
  'bg-pink-100 text-pink-700',
  'bg-rose-100 text-rose-700',
];

const getAvatarColor = (name: string) => {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
};

export const ResidentList = ({ data, onSelect }: ResidentListProps) => {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[1000px]">
          <thead>
            <tr className="bg-slate-50/50 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500 font-semibold">
              <th className="px-6 py-4 sticky left-0 z-10 bg-slate-50/95 backdrop-blur w-64">Họ và tên</th>
              <th className="px-4 py-4 w-24 text-center">Phòng</th>

              {/* Medical Columns */}
              <th className="px-4 py-4 w-64">Tình trạng y tế</th>
              <th className="px-4 py-4 w-48">Danh sách bệnh lý</th>
              <th className="px-4 py-4 w-40">Dị ứng</th>

              <th className="px-6 py-4 w-32 text-center">Trạng thái</th>
              <th className="px-6 py-4 text-right"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {data.map(r => {
              const unassigned = r.status === 'Active' && (r.room === 'Chưa xếp' || !r.room || r.room === 'N/A');
              const avatarColor = getAvatarColor(r.name);

              return (
                <tr
                  key={r.id}
                  className="group hover:bg-slate-50/80 transition-all duration-200 ease-in-out cursor-pointer"
                  onClick={() => onSelect(r)}
                >
                  {/* Name Column */}
                  <td className="px-6 py-4 sticky left-0 z-10 bg-white group-hover:bg-slate-50/80 transition-colors border-r border-transparent group-hover:border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold shadow-sm ${avatarColor}`}>
                        {getInitials(r.name)}
                      </div>
                      <div className="min-w-0">
                        <div className="font-semibold text-slate-800 truncate text-sm mb-0.5 group-hover:text-teal-700 transition-colors" title={r.name}>{r.name}</div>
                        <div className="text-xs text-slate-500 flex items-center gap-1.5">
                          <span>{new Date().getFullYear() - new Date(r.dob).getFullYear()} tuổi</span>
                          <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                          <span>{r.gender}</span>
                          {r.isDiabetic && (
                            <span className="ml-1 inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-rose-50 text-rose-600 border border-rose-100">
                              Tiểu đường
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Room Column */}
                  <td className="px-4 py-4 text-center">
                    {unassigned ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-amber-50 text-amber-700 border border-amber-100">
                        <AlertCircle className="w-3 h-3" /> Chưa xếp
                      </span>
                    ) : (
                      <span className="inline-block px-2.5 py-1 rounded-md text-sm font-semibold text-slate-600 bg-slate-100 border border-slate-200">
                        {r.room}-{r.bed}
                      </span>
                    )}
                  </td>

                  {/* Current Condition */}
                  <td className="px-4 py-4 align-top">
                    {r.currentConditionNote ? (
                      <div className="flex items-start gap-2">
                        <FileText className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-slate-600 line-clamp-2 leading-relaxed" title={r.currentConditionNote}>
                          {r.currentConditionNote}
                        </span>
                      </div>
                    ) : (
                      <span className="text-slate-300 text-sm italic">Chưa có ghi chú</span>
                    )}
                  </td>

                  {/* Medical History */}
                  <td className="px-4 py-4 align-top">
                    <div className="flex flex-wrap gap-1.5">
                      {r.medicalHistory && r.medicalHistory.length > 0 ? (
                        <>
                          {r.medicalHistory.slice(0, 2).map((condition, idx) => (
                            <span key={idx} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100 max-w-[150px] truncate">
                              {condition.name}
                            </span>
                          ))}
                          {r.medicalHistory.length > 2 && (
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200" title={r.medicalHistory.slice(2).map(c => c.name).join(', ')}>
                              +{r.medicalHistory.length - 2}
                            </span>
                          )}
                        </>
                      ) : (
                        <span className="text-slate-300 text-sm">-</span>
                      )}
                    </div>
                  </td>

                  {/* Allergies */}
                  <td className="px-4 py-4 align-top">
                    <div className="flex flex-wrap gap-1.5">
                      {r.allergies && r.allergies.length > 0 ? (
                        r.allergies.map((allergy, idx) => (
                          <span key={idx} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-50 text-red-700 border border-red-100" title={`Mức độ: ${allergy.severity}`}>
                            <AlertTriangle className="w-3 h-3 mr-1 flex-shrink-0" />
                            {allergy.allergen}
                          </span>
                        ))
                      ) : (
                        <span className="text-slate-300 text-sm">-</span>
                      )}
                    </div>
                  </td>

                  {/* Status & Actions */}
                  <td className="px-6 py-4 text-center align-middle">
                    <div className="flex justify-center"><StatusBadge status={r.status} /></div>
                  </td>
                  <td className="px-6 py-4 text-right align-middle">
                    <button className="text-slate-400 group-hover:text-teal-600 hover:bg-teal-50 p-2 rounded-full transition-all opacity-0 group-hover:opacity-100">
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              )
            })}
            {data.length === 0 && (
              <tr>
                <td colSpan={7} className="px-6 py-16 text-center">
                  <div className="flex flex-col items-center justify-center text-slate-400">
                    <Droplets className="w-12 h-12 mb-3 text-slate-200" />
                    <p className="text-lg font-medium text-slate-500">Chưa có dữ liệu</p>
                    <p className="text-sm">Vui lòng thêm người cao tuổi hoặc thay đổi bộ lọc</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};