import React from 'react';
import { User, MapPin } from 'lucide-react';
import { Resident } from '../../types/index';
import { Card } from '../ui/Card';
import { CareLevelBadge } from './CareLevelBadge';
import { StatusBadge } from './StatusBadge';

interface ResidentCardProps {
  resident: Resident;
  onClick: () => void;
}

export const ResidentCard = ({ resident, onClick }: ResidentCardProps) => {
  const age = new Date().getFullYear() - new Date(resident.dob).getFullYear();

  return (
    <Card 
      className="cursor-pointer hover:shadow-md transition-shadow hover:border-teal-200 group" 
      noPadding
    >
      <div className="p-4" onClick={onClick}>
        <div className="flex justify-between items-start mb-4">
           <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center border border-slate-200 group-hover:bg-teal-50 group-hover:border-teal-100 transition-colors">
              <User className="w-6 h-6 text-slate-400 group-hover:text-teal-600" />
           </div>
           <StatusBadge status={resident.status} />
        </div>
        
        <h3 className="font-bold text-slate-800 text-lg mb-1 truncate">{resident.name}</h3>
        <p className="text-sm text-slate-500 mb-3">{age} tuổi • {resident.gender}</p>
        
        <div className="flex flex-col gap-2">
           <div className="flex items-center gap-2 text-sm text-slate-600 bg-slate-50 p-2 rounded">
              <MapPin className="w-4 h-4 text-slate-400" />
              <span>P.{resident.room} - {resident.bed}</span>
           </div>
           <div className="flex justify-between items-center mt-1">
              <CareLevelBadge level={resident.careLevel} />
              <span className={`text-xs font-bold ${resident.balance < 0 ? 'text-red-500' : 'text-green-600'}`}>
                 {resident.balance < 0 ? 'Nợ phí' : 'Đủ phí'}
              </span>
           </div>
        </div>
      </div>
    </Card>
  );
};