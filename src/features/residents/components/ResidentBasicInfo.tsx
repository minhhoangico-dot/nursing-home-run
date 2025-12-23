import React from 'react';
import { User, MapPin, Calendar, Printer, Settings as SettingsIcon } from 'lucide-react';
import { Resident } from '@/src/types/index';
import { CareLevelBadge } from '@/src/components/shared/CareLevelBadge';
import { StatusBadge } from '@/src/components/shared/StatusBadge';

interface ResidentBasicInfoProps {
  resident: Resident;
  onEdit: () => void;
  onPrint: () => void;
}

export const ResidentBasicInfo = ({ resident, onEdit, onPrint }: ResidentBasicInfoProps) => {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex flex-col md:flex-row gap-6 items-start md:items-center">
      <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center border-2 border-slate-200">
        <User className="w-10 h-10 text-slate-400" />
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-2xl font-bold text-slate-800">{resident.name}</h1>
          <CareLevelBadge level={resident.careLevel} />
          <StatusBadge status={resident.status} />
        </div>
        <div className="flex flex-wrap gap-4 text-sm text-slate-500">
          <div className="flex items-center gap-1">
            <MapPin className="w-4 h-4 text-slate-400" />
            <span>Phòng {resident.room} - {resident.floor}</span>
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="w-4 h-4 text-slate-400" />
            <span>Sinh năm: {new Date(resident.dob).getFullYear()}</span>
          </div>
          <div className="flex items-center gap-1">
            <User className="w-4 h-4 text-slate-400" />
            <span>{resident.gender}</span>
          </div>
        </div>
      </div>
      <div className="flex gap-2 no-print">
        <button onClick={onPrint} className="bg-white border border-slate-300 text-slate-700 px-4 py-2 rounded-lg font-medium hover:bg-slate-50 flex items-center gap-2 transition-colors">
          <Printer className="w-4 h-4" /> In hồ sơ
        </button>
        <button onClick={onEdit} className="bg-teal-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-teal-700 flex items-center gap-2 shadow-sm transition-colors">
          <SettingsIcon className="w-4 h-4" /> Chỉnh sửa
        </button>
      </div>
    </div>
  );
};