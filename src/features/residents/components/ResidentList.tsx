import React from 'react';
import { Resident } from '@/src/types/index';
import { CareLevelBadge } from '@/src/components/shared/CareLevelBadge';
import { StatusBadge } from '@/src/components/shared/StatusBadge';
import { AlertCircle } from 'lucide-react';

interface ResidentListProps {
  data: Resident[];
  onSelect: (r: Resident) => void;
}

export const ResidentList = ({ data, onSelect }: ResidentListProps) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
      <table className="w-full text-left text-sm">
        <thead className="bg-slate-50 text-slate-500 font-medium">
          <tr>
            <th className="px-6 py-3">Họ và tên</th>
            <th className="px-6 py-3">Phòng/Giường</th>
            <th className="px-6 py-3">Tuổi/Giới tính</th>
            <th className="px-6 py-3">Cấp độ</th>
            <th className="px-6 py-3">Trạng thái</th>
            <th className="px-6 py-3 text-right">Thao tác</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {data.map(r => {
            const age = new Date().getFullYear() - new Date(r.dob).getFullYear();
            const unassigned = r.status === 'Active' && (r.room === 'Chưa xếp' || !r.room || r.room === 'N/A');

            return (
              <tr key={r.id} className="hover:bg-slate-50 cursor-pointer transition-colors" onClick={() => onSelect(r)}>
                <td className="px-6 py-4 font-medium text-slate-900">
                  {r.name}
                  <div className="text-xs text-slate-400 font-normal">{r.id}</div>
                </td>
                <td className="px-6 py-4">
                  {unassigned ? (
                    <div className="flex items-center gap-1 text-orange-600 font-bold bg-orange-50 px-2 py-1 rounded w-fit">
                      <AlertCircle className="w-3 h-3" /> Chưa xếp phòng
                    </div>
                  ) : (
                    <>
                      <span className="font-medium text-slate-700">{r.room} - {r.bed}</span>
                      <div className="text-xs text-slate-500">{r.floor}</div>
                    </>
                  )}
                </td>
                <td className="px-6 py-4">{age} / {r.gender}</td>
                <td className="px-6 py-4">
                  <div className="flex flex-col gap-1">
                    <CareLevelBadge level={r.careLevel} />
                    {r.isDiabetic && (
                      <span className="w-fit px-2 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-700 border border-purple-200">
                        Tiểu đường
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4"><StatusBadge status={r.status} /></td>
                <td className="px-6 py-4 text-right">
                  <button className="text-teal-600 hover:text-teal-800 font-medium text-xs border border-teal-200 px-3 py-1 rounded-full hover:bg-teal-50 transition-colors">
                    Chi tiết
                  </button>
                </td>
              </tr>
            )
          })}
          {data.length === 0 && (
            <tr>
              <td colSpan={6} className="px-6 py-12 text-center text-slate-400 italic">
                Không có dữ liệu hiển thị
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};