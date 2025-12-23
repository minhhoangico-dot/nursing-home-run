import React from 'react';
import { Circle, CheckCircle2, Clock } from 'lucide-react';
import { MedicalCondition } from '../../../types/index';

export const DiseaseProgressTimeline = ({ history }: { history: MedicalCondition[] }) => {
  // Sort by date descending (assuming string year or date)
  const sorted = [...history].sort((a, b) => b.diagnosedDate.localeCompare(a.diagnosedDate));

  return (
    <div className="relative border-l-2 border-slate-200 ml-3 space-y-6 py-2">
      {sorted.map((item, index) => (
        <div key={item.id} className="relative pl-6">
          <div className={`absolute -left-[9px] top-1 w-4 h-4 rounded-full border-2 bg-white ${item.status === 'Active' ? 'border-blue-500' : 'border-green-500'}`}>
             {item.status === 'Resolved' && <div className="w-2 h-2 bg-green-500 rounded-full m-0.5"></div>}
          </div>
          <div>
            <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">{item.diagnosedDate}</span>
            <h4 className={`font-bold text-sm mt-1 ${item.status === 'Active' ? 'text-blue-700' : 'text-slate-700'}`}>
              {item.name}
            </h4>
            <p className="text-xs text-slate-500">
               {item.status === 'Active' ? 'Đang điều trị/Theo dõi' : 'Đã ổn định/Khỏi'}
            </p>
          </div>
        </div>
      ))}
      {sorted.length === 0 && (
         <div className="pl-6 text-sm text-slate-400 italic">Chưa có ghi nhận bệnh lý</div>
      )}
    </div>
  );
};