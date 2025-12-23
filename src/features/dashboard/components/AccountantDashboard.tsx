import React from 'react';
import { CreditCard, TrendingUp, AlertCircle, CheckCircle2, FileText } from 'lucide-react';
import { Resident, FinancialTransaction } from '../../../types/index';
import { StatCard } from './StatCard';
import { Card } from '../../../components/ui/Card';
import { formatCurrency } from '../../../data/index';
import { useToast } from '../../../app/providers';

export const AccountantDashboard = ({ residents, transactions = [] }: { residents: Resident[], transactions?: FinancialTransaction[] }) => {
   const { addToast } = useToast();

   const totalDebt = residents.filter(r => r.balance < 0).reduce((acc, curr) => acc + curr.balance, 0);
   const debtCount = residents.filter(r => r.balance < 0).length;
   
   const collectedRevenue = transactions
      .filter(t => t.type === 'IN' && t.status === 'Success')
      .reduce((acc, curr) => acc + curr.amount, 0);
   
   const estimatedRevenue = collectedRevenue + Math.abs(totalDebt);

   const recentTransactions = [...transactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5);

  return (
    <div className="space-y-6">
       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
         <StatCard title="Doanh thu dự kiến" value={formatCurrency(estimatedRevenue)} icon={CreditCard} color="bg-blue-500" />
         <StatCard title="Thực thu" value={formatCurrency(collectedRevenue)} icon={CheckCircle2} color="bg-green-500" />
         <StatCard title="Công nợ" value={formatCurrency(Math.abs(totalDebt))} icon={AlertCircle} color="bg-red-500" />
         <StatCard title="Tăng trưởng" value="+5.2%" icon={TrendingUp} color="bg-purple-500" />
       </div>

       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card title="Danh sách nợ phí cần nhắc">
             <div className="overflow-x-auto">
               <table className="w-full text-sm text-left">
                  <thead className="text-slate-500 bg-slate-50">
                     <tr>
                        <th className="px-4 py-2 rounded-tl-lg">NCT</th>
                        <th className="px-4 py-2">Phòng</th>
                        <th className="px-4 py-2 text-right">Số tiền</th>
                        <th className="px-4 py-2 text-center rounded-tr-lg">Thao tác</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                     {residents.filter(r => r.balance < 0).slice(0, 5).map(r => (
                        <tr key={r.id} className="hover:bg-slate-50">
                           <td className="px-4 py-3 font-medium">
                              {r.name}
                              <div className="text-xs text-slate-400 font-normal">{r.guardianPhone}</div>
                           </td>
                           <td className="px-4 py-3 text-slate-500">{r.room}</td>
                           <td className="px-4 py-3 text-right text-red-600 font-bold">{formatCurrency(Math.abs(r.balance))}</td>
                           <td className="px-4 py-3 text-center">
                              <button 
                                 onClick={() => addToast('info', 'Đã gửi nhắc phí', `SMS đến: ${r.guardianPhone}`)}
                                 className="text-xs bg-white border border-slate-200 text-slate-600 px-2 py-1 rounded hover:bg-teal-50 hover:text-teal-600 hover:border-teal-200 transition-colors"
                              >
                                 Nhắc phí
                              </button>
                           </td>
                        </tr>
                     ))}
                     {debtCount === 0 && <tr><td colSpan={4} className="text-center py-8 text-slate-400 italic">Không có công nợ</td></tr>}
                  </tbody>
               </table>
             </div>
          </Card>

          <Card title="Giao dịch gần đây">
             <div className="space-y-3">
                {recentTransactions.length > 0 ? recentTransactions.map((t, i) => (
                   <div key={i} className="flex justify-between items-center p-3 border-b border-slate-50 last:border-0 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer">
                      <div className="flex items-center gap-3">
                         <div className={`p-2 rounded-full ${t.type === 'IN' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                           {t.type === 'IN' ? <CheckCircle2 className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
                         </div>
                         <div>
                           <p className="text-slate-800 text-sm font-medium">{t.description}</p>
                           <p className="text-xs text-slate-500">{t.date}</p>
                         </div>
                      </div>
                      <span className={`font-bold text-sm ${t.type === 'IN' ? 'text-green-600' : 'text-slate-600'}`}>
                         {t.type === 'IN' ? '+' : '-'}{formatCurrency(t.amount)}
                      </span>
                   </div>
                )) : (
                   <div className="text-center py-8 text-slate-400 italic">Chưa có giao dịch nào</div>
                )}
             </div>
          </Card>
       </div>
    </div>
  );
};