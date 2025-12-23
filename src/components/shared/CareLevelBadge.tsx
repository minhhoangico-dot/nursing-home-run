import React from 'react';

export const CareLevelBadge = ({ level }: { level: number }) => {
  const colors = {
    1: 'bg-green-100 text-green-700 border-green-200',
    2: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    3: 'bg-orange-100 text-orange-700 border-orange-200',
    4: 'bg-red-100 text-red-700 border-red-200',
  };
  // @ts-ignore
  return <span className={`px-2 py-1 rounded-full text-xs font-semibold border ${colors[level] || 'bg-gray-100'}`}>Cấp độ {level}</span>;
};