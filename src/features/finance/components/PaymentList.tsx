import React from 'react';
import { ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import { FinancialTransaction } from '../../../types/index';
import { formatCurrency } from '../../../data/index';

export const PaymentList = ({ transactions }: { transactions: FinancialTransaction[] }) => {
   return (
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
         <div className="p-4 border-b border-slate-100">
             <h3 className="font-bold text-slate-800">Lịch sử giao dịch tài chính</h3>
         </div>
         <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500 font-medium">
               <tr>
                  <th className="px-6 py-3">Mã GD</th>
                  <th className="px-6 py-3">Thời gian</th>
                  <th className="px-6 py-3">Đối tượng</th>
                  <th className="px-6 py-3">Nội dung</th>
                  <th className="px-6 py-3 text-right">Số tiền</th>
                  <th className="px-6 py-3">Người thực hiện</th>
                  <th className="px-6 py-3 text-center">Trạng thái</th>
               </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
               {transactions.map((trx, i) => (
                  <tr key={i} className="hover:bg-slate-50">
                     <td className="px-6 py-4 font-mono text-xs text-slate-500">{trx.id}</td>
                     <td className="px-6 py-4 text-slate-600">{trx.date}</td>
                     <td className="px-6 py-4 font-medium text-slate-800">{trx.residentName}</td>
                     <td className="px-6 py-4 text-slate-600">{trx.description}</td>
                     <td className="px-6 py-4 text-right font-bold">
                        <div className={`flex items-center justify-end gap-1 ${trx.type === 'IN' ? 'text-green-600' : 'text-red-500'}`}>
                           {trx.type === 'IN' ? <ArrowDownLeft className="w-3 h-3" /> : <ArrowUpRight className="w-3 h-3" />}
                           {formatCurrency(trx.amount)}
                        </div>
                     </td>
                     <td className="px-6 py-4 text-slate-600 text-xs">{trx.performer}</td>
                     <td className="px-6 py-4 text-center">
                        <span className={`px-2 py-1 rounded text-xs font-bold ${
                           trx.status === 'Success' ? 'bg-green-100 text-green-700' : 
                           trx.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
                        }`}>
                           {trx.status === 'Success' ? 'Thành công' : trx.status}
                        </span>
                     </td>
                  </tr>
               ))}
            </tbody>
         </table>
      </div>
   );
};