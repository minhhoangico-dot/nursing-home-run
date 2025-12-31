import React from 'react';
import { FileText, Bell, Send } from 'lucide-react';
import { Resident } from '../../../types/index';
import { formatCurrency } from '../../../data/index';
import { useToast } from '../../../app/providers';
import { Table, Column } from '@/src/components/ui/Table';

interface DebtListProps {
   residents: Resident[];
   onCreateInvoice: (resident: Resident) => void;
}

export const DebtList = ({ residents, onCreateInvoice }: DebtListProps) => {
   const { addToast } = useToast();

   const handleRemind = (r: Resident) => {
      addToast('info', 'Đã gửi nhắc phí', `Đã gửi tin nhắn SMS đến SĐT: ${r.guardianPhone}`);
   };

   const columns: Column<Resident>[] = [
      {
         header: 'NCT',
         accessor: 'name',
         mobilePrimary: true,
         render: (r) => (
            <div>
               <div className="font-medium text-slate-800">{r.name}</div>
               <div className="text-xs text-slate-400 font-normal">BL: {r.guardianName}</div>
            </div>
         )
      },
      {
         header: 'Phòng',
         accessor: 'room',
         mobileLabel: 'Phòng'
      },
      {
         header: 'Dư nợ',
         accessor: 'balance',
         className: 'text-right',
         mobileLabel: 'Dư nợ',
         render: (r) => (
            <span className={`font-bold text-base ${r.balance < 0 ? 'text-red-600' : 'text-slate-400'}`}>
               {r.balance !== 0 ? formatCurrency(Math.abs(r.balance)) : '-'}
            </span>
         )
      },
      {
         header: 'Trạng thái',
         accessor: 'balance',
         className: 'text-center',
         mobileLabel: 'Trạng thái',
         render: (r) => (
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${r.balance < 0 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
               {r.balance < 0 ? 'Chưa thanh toán' : 'Hoàn tất'}
            </span>
         )
      },
      {
         header: 'Thao tác',
         accessor: 'id',
         className: 'text-right',
         render: (r) => (
            <div className="flex justify-end gap-2">
               {r.balance < 0 && (
                  <button
                     onClick={(e) => { e.stopPropagation(); handleRemind(r); }}
                     className="text-orange-500 hover:text-orange-700 p-2 hover:bg-orange-50 rounded-lg transition-colors tooltip"
                     title="Gửi tin nhắn nhắc phí"
                  >
                     <Send className="w-4 h-4" />
                  </button>
               )}
               <button
                  onClick={(e) => { e.stopPropagation(); onCreateInvoice(r); }}
                  className="bg-teal-50 text-teal-700 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-teal-100 border border-teal-200 transition-colors flex items-center gap-1"
               >
                  <FileText className="w-3 h-3" /> Lập phiếu
               </button>
            </div>
         )
      }
   ];

   return (
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
         <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
               <Bell className="w-5 h-5 text-red-500" /> Danh sách công nợ & Nhắc phí
            </h3>
            <button className="text-teal-600 text-sm font-medium hover:text-teal-700 hover:underline hidden md:block">Xuất báo cáo Excel</button>
         </div>
         <Table
            data={residents}
            columns={columns}
            mobileCardView={true}
         />
      </div>
   );
};