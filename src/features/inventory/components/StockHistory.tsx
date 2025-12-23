import React, { useState } from 'react';
import { ArrowDownLeft, ArrowUpRight, Search } from 'lucide-react';
import { InventoryTransaction } from '../../../types/index';

export const StockHistory = ({ transactions }: { transactions: InventoryTransaction[] }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredTransactions = transactions.filter(trx => 
    trx.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    trx.performer.toLowerCase().includes(searchTerm.toLowerCase()) ||
    trx.reason?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
       <div className="p-4 border-b border-slate-100 flex justify-between items-center">
          <h3 className="font-bold text-slate-800">Lịch sử giao dịch kho</h3>
          <div className="relative">
             <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
             <input 
               type="text" 
               placeholder="Tìm theo tên vật tư, người thực hiện..." 
               className="pl-9 pr-4 py-1.5 border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-teal-500 w-64"
               value={searchTerm}
               onChange={e => setSearchTerm(e.target.value)}
             />
          </div>
       </div>
       <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-500 font-medium">
             <tr>
                <th className="px-6 py-3">Thời gian</th>
                <th className="px-6 py-3">Loại</th>
                <th className="px-6 py-3">Vật tư</th>
                <th className="px-6 py-3 text-right">Số lượng</th>
                <th className="px-6 py-3">Người thực hiện</th>
                <th className="px-6 py-3">Ghi chú</th>
             </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
             {filteredTransactions.length > 0 ? [...filteredTransactions].reverse().map((trx) => (
                <tr key={trx.id} className="hover:bg-slate-50">
                   <td className="px-6 py-4 text-slate-600">{trx.date}</td>
                   <td className="px-6 py-4">
                      {trx.type === 'IN' ? (
                         <span className="flex items-center gap-1 text-green-600 font-medium">
                            <ArrowDownLeft className="w-4 h-4" /> Nhập kho
                         </span>
                      ) : (
                         <span className="flex items-center gap-1 text-red-500 font-medium">
                            <ArrowUpRight className="w-4 h-4" /> Xuất kho
                         </span>
                      )}
                   </td>
                   <td className="px-6 py-4 font-medium text-slate-800">{trx.itemName}</td>
                   <td className="px-6 py-4 text-right font-bold">{trx.quantity}</td>
                   <td className="px-6 py-4 text-slate-600">{trx.performer}</td>
                   <td className="px-6 py-4 text-slate-500 italic max-w-xs truncate">{trx.reason}</td>
                </tr>
             )) : (
                <tr>
                   <td colSpan={6} className="px-6 py-8 text-center text-slate-400 italic">
                     {searchTerm ? 'Không tìm thấy kết quả phù hợp' : 'Chưa có giao dịch nào'}
                   </td>
                </tr>
             )}
          </tbody>
       </table>
    </div>
  );
};