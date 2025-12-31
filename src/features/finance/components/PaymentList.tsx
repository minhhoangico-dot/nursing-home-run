import React from 'react';
import { ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import { FinancialTransaction } from '../../../types/index';
import { formatCurrency } from '../../../data/index';
import { Table, Column } from '@/src/components/ui/Table';

export const PaymentList = ({ transactions }: { transactions: FinancialTransaction[] }) => {

   const columns: Column<FinancialTransaction>[] = [
      {
         header: 'Mã GD',
         accessor: 'id',
         mobileLabel: 'Mã GD',
         className: 'font-mono text-xs text-slate-500'
      },
      {
         header: 'Thời gian',
         accessor: 'date',
         mobileLabel: 'Thời gian',
         className: 'text-slate-600'
      },
      {
         header: 'Đối tượng',
         accessor: 'residentName',
         mobilePrimary: true,
         className: 'font-medium text-slate-800'
      },
      {
         header: 'Nội dung',
         accessor: 'description',
         mobileLabel: 'Nội dung',
         className: 'text-slate-600'
      },
      {
         header: 'Số tiền',
         accessor: 'amount',
         className: 'text-right font-bold',
         mobileLabel: 'Số tiền',
         render: (trx) => (
            <div className={`flex items-center justify-end gap-1 ${trx.type === 'IN' ? 'text-green-600' : 'text-red-500'}`}>
               {trx.type === 'IN' ? <ArrowDownLeft className="w-3 h-3" /> : <ArrowUpRight className="w-3 h-3" />}
               {formatCurrency(trx.amount)}
            </div>
         )
      },
      {
         header: 'Người TH',
         accessor: 'performer',
         mobileHidden: true,
         className: 'text-slate-600 text-xs'
      },
      {
         header: 'Trạng thái',
         accessor: 'status',
         className: 'text-center',
         mobileLabel: 'Trạng thái',
         render: (trx) => (
            <span className={`px-2 py-1 rounded text-xs font-bold ${trx.status === 'Success' ? 'bg-green-100 text-green-700' :
                  trx.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
               }`}>
               {trx.status === 'Success' ? 'Thành công' : trx.status}
            </span>
         )
      }
   ];

   return (
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
         <div className="p-4 border-b border-slate-100">
            <h3 className="font-bold text-slate-800">Lịch sử giao dịch tài chính</h3>
         </div>
         <Table
            data={transactions}
            columns={columns}
            mobileCardView={true}
         />
      </div>
   );
};