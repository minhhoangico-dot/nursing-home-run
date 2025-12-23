import React from 'react';
import { useNavigate } from 'react-router-dom';
import { DoctorDashboard } from '../components/DoctorDashboard';
import { FloorHeadDashboard } from '../components/FloorHeadDashboard';
import { AccountantDashboard } from '../components/AccountantDashboard';
import { useAuthStore } from '../../../stores/authStore';
import { useResidentsStore } from '../../../stores/residentsStore';
import { useFinanceStore } from '../../../stores/financeStore';

export const DashboardPage = () => {
   const { user } = useAuthStore();
   const { residents } = useResidentsStore();
   const { transactions } = useFinanceStore();
   const navigate = useNavigate();

   if (!user) return null;

   const handleSelectResident = (r: any) => {
      useResidentsStore.getState().selectResident(r);
      navigate(`/residents/${r.id}`);
   };

   return (
      <div className="space-y-6">
         <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-slate-800">Tổng quan hệ thống</h2>
            <span className="text-sm text-slate-500 bg-white px-3 py-1 rounded-full border shadow-sm">
               Xin chào, {user.name} ({
                  user.role === 'ADMIN' ? 'Quản trị viên' :
                     user.role === 'DOCTOR' ? 'Bác sĩ' :
                        user.role === 'SUPERVISOR' ? 'Trưởng tầng' : 'Kế toán'
               })
            </span>
         </div>

         {(user.role === 'DOCTOR' || user.role === 'ADMIN') && <DoctorDashboard residents={residents} onSelectResident={handleSelectResident} />}
         {user.role === 'SUPERVISOR' && <FloorHeadDashboard residents={residents} />}
         {user.role === 'ACCOUNTANT' && <AccountantDashboard residents={residents} transactions={transactions} />}
      </div>
   );
};