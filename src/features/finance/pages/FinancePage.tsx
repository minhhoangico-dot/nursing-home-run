import React, { useState } from 'react';
import { useAuthStore } from '../../../stores/authStore';
import { useResidentsStore } from '../../../stores/residentsStore';
import { useFinanceStore } from '../../../stores/financeStore';
import { Resident } from '../../../types/index';
import { INITIAL_PRICES } from '../../../data/index';

import { MonthlyBillingConfig } from '../components/MonthlyBillingConfig';
import { InvoicePreview } from '../components/InvoicePreview';

export const FinancePage = () => {
   const { user } = useAuthStore();
   const { residents } = useResidentsStore();
   const { usageRecords } = useFinanceStore();

   const [previewData, setPreviewData] = useState<{
      resident: Resident;
      month: string;
      fixedCosts: { name: string; amount: number }[];
      incurredCosts: any[];
   } | null>(null);

   if (!user) return null;

   const handlePrintBill = (resident: Resident, month: string) => {
      // Re-calculate fixed costs logic to pass to preview
      // Ideally this helper logic should be shared or passed up, but for now duplicate the calculation or just trust the view.
      // Wait, MonthlyBillingConfig does the calculation inside.
      // To strictly pass data, I might need to move calculation up or just repeat it here for the printable.
      // Repeating is safer for decoupling.

      const fixedCosts = [];
      const roomPrice = INITIAL_PRICES.find(p => p.category === 'ROOM' && p.name.includes(resident.roomType))?.price || 0;
      if (roomPrice > 0) fixedCosts.push({ name: `Phòng ${resident.roomType}`, amount: roomPrice });

      const carePrice = INITIAL_PRICES.find(p => p.category === 'CARE' && p.name.includes(`Cấp độ ${resident.careLevel}`))?.price || 0;
      if (carePrice > 0) fixedCosts.push({ name: `CS Cấp độ ${resident.careLevel}`, amount: carePrice });

      const mealPrice = INITIAL_PRICES.find(p => p.category === 'MEAL' && p.name.includes('Suất ăn tiêu chuẩn'))?.price || 0;
      if (resident.dietType !== 'Tube') fixedCosts.push({ name: 'Suất ăn tiêu chuẩn', amount: mealPrice });

      const monthlyUsage = usageRecords.filter(u =>
         u.residentId === resident.id &&
         u.date.startsWith(month)
      );

      setPreviewData({
         resident,
         month,
         fixedCosts,
         incurredCosts: monthlyUsage
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
