import React from 'react';
import { LucideIcon } from 'lucide-react';
import { Card } from '../../../components/ui/Card';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  color: string;
  subtext?: React.ReactNode;
}

export const StatCard = ({ title, value, icon: Icon, color, subtext }: StatCardProps) => (
  <Card className="flex items-center justify-between p-6" noPadding>
    <div className="p-6 flex-1">
      <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
      <h3 className="text-2xl font-bold text-slate-800">{value}</h3>
      {subtext && <div className="mt-1">{subtext}</div>}
    </div>
    <div className={`p-4 mr-6 rounded-lg ${color}`}>
      <Icon className="w-6 h-6 text-white" />
    </div>
  </Card>
);