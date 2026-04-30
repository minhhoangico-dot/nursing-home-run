import React, { useState } from 'react';
import { useAuthStore } from '../../../stores/authStore';
import { useResidentsStore } from '../../../stores/residentsStore';
import { useFinanceStore } from '../../../stores/financeStore';
import { ResidentListItem } from '../../../types/index';
import { useDeferredStoreLoad } from '@/src/hooks/useDeferredStoreLoad';

import { MonthlyBillingConfig } from '../components/MonthlyBillingConfig';
import { InvoicePreview } from '../components/InvoicePreview';
import { calculateFixedCosts, getMonthlyUsage } from '../utils/calculateMonthlyBilling';

export const FinancePage = () => {
   const { user } = useAuthStore();
   const { residents } = useResidentsStore();
   const { usageRecords, residentFixedServices, fetchFinanceData, isLoaded } = useFinanceStore();

   const [previewData, setPreviewData] = useState<{
      resident: ResidentListItem;
      month: string;
      fixedCosts: { name: string; amount: number }[];
      incurredCosts: any[];
   } | null>(null);

   useDeferredStoreLoad(fetchFinanceData, isLoaded);

   if (!user) return null;

   const handlePrintBill = (resident: ResidentListItem, month: string) => {
      setPreviewData({
         resident,
         month,
         fixedCosts: calculateFixedCosts(resident, residentFixedServices).details,
         incurredCosts: getMonthlyUsage(usageRecords, resident.id, month),
      });
   };

   return (
      <div className="space-y-6">
         <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-slate-800">Quản lý Hóa đơn & Chi phí Dịch vụ</h2>
         </div>

         <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            <MonthlyBillingConfig
               residents={residents}
               usageRecords={usageRecords}
               residentFixedServices={residentFixedServices}
               onPrintBill={handlePrintBill}
            />
         </div>

         {previewData && (
            <InvoicePreview
               resident={previewData.resident}
               month={previewData.month}
               fixedCosts={previewData.fixedCosts}
               incurredCosts={previewData.incurredCosts}
               onClose={() => setPreviewData(null)}
            />
         )}
      </div>
   );
};
