import React from 'react';
import { Resident } from '../../../types/index';
import { Card } from '../../../components/ui/Card';
import { CareLevelBadge } from '../../../components/shared/CareLevelBadge';

export const RecentAdmissions = ({ residents, onSelectResident }: { residents: Resident[], onSelectResident?: (r: Resident) => void }) => {
  const recent = residents
    .sort((a, b) => new Date(b.admissionDate).getTime() - new Date(a.admissionDate).getTime())
    .slice(0, 5);

  return (
    <Card title="Tiếp nhận gần đây" noPadding>
      <div className="divide-y divide-slate-100">
        {recent.map(r => (
          <div 
            key={r.id} 
            onClick={() => onSelectResident && onSelectResident(r)}
            className={`p-4 flex items-center justify-between hover:bg-slate-50 transition-colors ${onSelectResident ? 'cursor-pointer group' : ''}`}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-teal-50 flex items-center justify-center text-teal-700 font-bold text-sm border border-teal-100 group-hover:bg-teal-100 transition-colors">
                {r.name.charAt(0)}
              </div>
              <div>
                <p className="text-sm font-bold text-slate-800 group-hover:text-teal-700 transition-colors">{r.name}</p>
                <p className="text-xs text-slate-500">{r.room} • {r.admissionDate}</p>
              </div>
            </div>
            <CareLevelBadge level={r.careLevel} />
          </div>
        ))}
        {recent.length === 0 && (
          <div className="p-6 text-center text-slate-500 text-sm italic">Chưa có dữ liệu</div>
        )}
      </div>
    </Card>
  );
};