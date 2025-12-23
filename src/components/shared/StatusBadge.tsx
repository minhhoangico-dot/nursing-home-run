import React from 'react';

export const StatusBadge = ({ status }: { status: 'Active' | 'Discharged' }) => {
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium ${status === 'Active' ? 'text-green-700 bg-green-50' : 'text-slate-500 bg-slate-100'}`}>
      <div className={`w-1.5 h-1.5 rounded-full ${status === 'Active' ? 'bg-green-500' : 'bg-slate-400'}`}></div>
      {status === 'Active' ? 'Đang ở' : 'Đã xuất viện'}
    </span>
  );
};