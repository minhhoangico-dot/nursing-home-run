import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { useAuthStore } from '../../../stores/authStore';
import { useResidentsStore } from '../../../stores/residentsStore';
import { useFinanceStore } from '../../../stores/financeStore';
import { FinancialTransaction, ServiceUsage, ServicePrice, Resident } from '../../../types/index';
import { formatCurrency } from '../../../data/index';

// import { InvoiceGenerator } from '../components/InvoiceGenerator';
import { PaymentList } from '../components/PaymentList';
import { ServiceCatalog } from '../components/ServiceCatalog';
import { ServiceUsageList } from '../components/ServiceUsageList';
import { AddTransactionModal } from '../components/AddTransactionModal';
import { Plus } from 'lucide-react';

export const FinancePage = () => {
   const { user } = useAuthStore();
   const { residents, updateResident } = useResidentsStore();
   const {
      transactions,
      addTransaction,
      servicePrices,
      usageRecords,
      updateServicePrice,
      deleteServicePrice,
      recordUsage,
      markAsBilled
   } = useFinanceStore();

   const [showInvoice, setShowInvoice] = useState(false);
   const [showAddTransactionModal, setShowAddTransactionModal] = useState(false);
   const [selectedResident, setSelectedResident] = useState<Resident | null>(null);
   const [activeTab, setActiveTab] = useState<'transactions' | 'services'>('services');

   if (!user) return null;

   const handlePayment = async (resident: Resident, amount: number) => {
      try {
         await updateResident({
            ...resident,
            balance: resident.balance + amount
         });

         const newTrx: FinancialTransaction = {
            id: `TRX-${Date.now()}`,
            date: new Date().toLocaleString('vi-VN'),
            residentName: resident.name,
            description: 'Thanh toán phí dịch vụ',
            amount: amount,
            type: 'IN',
            performer: user.name,
            status: 'Success'
         };

         await addTransaction(newTrx);
         toast.success(`Đã ghi nhận thanh toán ${formatCurrency(amount)}`);
      } catch (error) {
         toast.error('Giao dịch thất bại');
      }
   };

   const handleQuickRecordUsage = async (service: ServicePrice) => {
      const residentId = prompt('Nhập Mã NCT (ID) để ghi nhận sử dụng (VD: R001):');
      if (!residentId) return;

      const resident = residents.find(r => r.id === residentId || r.name === residentId);
      if (!resident) {
         toast.error(`Không tìm thấy NCT với mã/tên: ${residentId}`);
         return;
      }

      const usage: ServiceUsage = {
         id: `USG-${Date.now()}`,
         residentId: resident.id,
         serviceId: service.id,
         serviceName: service.name,
         date: new Date().toISOString(),
         quantity: 1,
         unitPrice: service.price,
         totalAmount: service.price,
         status: 'Unbilled'
      };

      try {
         await recordUsage(usage);
         toast.success(`Đã thêm ${service.name} cho ${resident.name}`);
      } catch (error) {
         toast.error('Lỗi khi ghi nhận dịch vụ');
      }
   };

   return (
      <div className="space-y-6">
         {/* {showInvoice && selectedResident && (
            <InvoiceGenerator
               user={user}
               resident={selectedResident}
               servicePrices={servicePrices}
               usageRecords={usageRecords}
               onClose={() => { setShowInvoice(false); setSelectedResident(null) }}
               onPayment={(amount) => handlePayment(selectedResident, amount)}
               onMarkAsBilled={markAsBilled}
            />
         )} */}

         <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-slate-800">Quản lý Tài chính</h2>
            <div className="flex bg-white rounded-lg p-1 border border-slate-200">
               <button
                  onClick={() => setActiveTab('services')}
                  className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === 'services' ? 'bg-teal-600 text-white' : 'text-slate-600 hover:bg-slate-50'}`}
               >
                  Dịch vụ
               </button>
               <button
                  onClick={() => setActiveTab('transactions')}
                  className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === 'transactions' ? 'bg-teal-600 text-white' : 'text-slate-600 hover:bg-slate-50'}`}
               >
                  Lịch sử giao dịch
               </button>
            </div>
         </div>

         {activeTab === 'services' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
               <ServiceCatalog
                  services={servicePrices}
                  onAdd={updateServicePrice}
                  onUpdate={updateServicePrice}
                  onDelete={deleteServicePrice}
                  onRecordUsage={handleQuickRecordUsage}
               />
               <ServiceUsageList
                  usageRecords={usageRecords}
                  residents={residents}
               />
            </div>
         )}

         {activeTab === 'transactions' && (
            <div className="space-y-4">
               <div className="flex justify-end">
                  <button
                     onClick={() => setShowAddTransactionModal(true)}
                     className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-sm flex items-center gap-2 transition-colors"
                  >
                     <Plus className="w-4 h-4" />
                     Thêm giao dịch
                  </button>
               </div>
               <PaymentList transactions={transactions} />
            </div>
         )}

         {showAddTransactionModal && (
            <AddTransactionModal
               user={user}
               residents={residents}
               onClose={() => setShowAddTransactionModal(false)}
               onSave={async (trx) => {
                  try {
                     await addTransaction(trx);
                     toast.success('Đã thêm giao dịch thành công');
                     setShowAddTransactionModal(false);
                  } catch (error) {
                     toast.error('Lỗi khi thêm giao dịch');
                  }
               }}
            />
         )}
      </div>
   );
};