import React, { useState } from 'react';
import { X, Trash2, Plus, Save, DollarSign } from 'lucide-react';
import { Resident, User, ServicePrice, ServiceUsage } from '../../../types/index';
import { formatCurrency } from '../../../data/index';
import { useToast } from '../../../app/providers';

export const InvoiceGenerator = ({
   user,
   resident,
   onClose,
   onPayment,
   servicePrices,
   usageRecords = [],
   onMarkAsBilled
}: {
   user: User,
   resident: Resident,
   onClose: () => void,
   onPayment?: (amount: number) => void,
   servicePrices: ServicePrice[],
   usageRecords?: ServiceUsage[],
   onMarkAsBilled?: (ids: string[]) => void
}) => {
   const [items, setItems] = useState<any[]>([]);
   const [newItem, setNewItem] = useState({ desc: '', amount: 0 });
   const [paymentMode, setPaymentMode] = useState(false);
   const [paymentAmount, setPaymentAmount] = useState('');
   const { addToast } = useToast();

   // Helper to map resident data to Pricing Codes
   const getRoomCode = (type: string) => {
      const t = type.toLowerCase();
      if (t.includes('1') || t.includes('riêng')) return '1-bed';
      if (t.includes('2')) return '2-bed';
      if (t.includes('3')) return '3-bed';
      return '4-bed'; // Default to lowest cost/common if matches nothing (e.g. '4+', 'tập thể')
   };

   const roomCode = getRoomCode(resident.roomType);
   const careCode = `CL${resident.careLevel}_${roomCode}`;

   // Lookup Prices by Code
   const roomPriceObj = servicePrices.find(p => p.category === 'ROOM' && p.code === roomCode);
   const carePriceObj = servicePrices.find(p => p.category === 'CARE' && p.code === careCode);
   const mealPriceObj = servicePrices.find(p => p.category === 'MEAL' && p.code === 'standard'); // Default to standard

   const roomPrice = roomPriceObj?.price || 0;
   const careFee = carePriceObj?.price || 0;
   const mealFee = mealPriceObj?.price || 3900000;

   const unbilledUsage = usageRecords.filter(u => u.residentId === resident.id && u.status === 'Unbilled');
   const usageFees = unbilledUsage.map(u => ({
      desc: `${u.serviceName} (${u.quantity}x)`,
      amount: u.totalAmount,
      id: u.id
   }));

   const baseFees = [
      { desc: `Phí phòng (${resident.roomType} - ${roomPriceObj?.name || roomCode})`, amount: roomPrice },
      { desc: `Phí ăn uống (${mealPriceObj?.name || 'Tiêu chuẩn'})`, amount: mealFee },
      { desc: `Phí chăm sóc (Cấp ${resident.careLevel} - ${carePriceObj?.name || ''})`, amount: careFee },
   ];

   const total = baseFees.reduce((a, b) => a + b.amount, 0)
      + items.reduce((a, b) => a + b.amount, 0)
      + usageFees.reduce((a, b) => a + b.amount, 0);

   if (paymentMode) {
      return (
         <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
               <h3 className="text-lg font-bold mb-4 text-slate-800">Ghi nhận thanh toán</h3>
               <p className="mb-4 text-sm text-slate-500">NCT: <span className="font-bold">{resident.name}</span></p>
               <div className="bg-red-50 p-3 rounded mb-4">
                  <p className="text-xs text-red-500 font-bold uppercase">Dư nợ hiện tại</p>
                  <p className="text-xl font-bold text-red-700">{formatCurrency(Math.abs(resident.balance))}</p>
               </div>
               <div className="space-y-4">
                  <div>
                     <label className="block text-sm font-medium mb-1">Số tiền thanh toán</label>
                     <input type="number" className="w-full border rounded p-2 text-lg font-bold text-green-700" value={paymentAmount} onChange={e => setPaymentAmount(e.target.value)} />
                  </div>
                  <div>
                     <label className="block text-sm font-medium mb-1">Hình thức</label>
                     <select className="w-full border rounded p-2">
                        <option>Tiền mặt</option>
                        <option>Chuyển khoản</option>
                     </select>
                  </div>
                  <div className="text-sm text-slate-500 italic">
                     * Người thu: {user.name}
                  </div>
               </div>
               <div className="mt-6 flex justify-end gap-2">
                  <button onClick={() => setPaymentMode(false)} className="px-4 py-2 text-slate-500 hover:bg-slate-100 rounded">Quay lại</button>
                  <button
                     onClick={() => {
                        if (onPayment) onPayment(Number(paymentAmount));
                        if (onMarkAsBilled && unbilledUsage.length > 0) {
                           onMarkAsBilled(unbilledUsage.map(u => u.id));
                        }
                        setPaymentMode(false);
                        onClose();
                     }}
                     className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 font-bold"
                  >
                     Xác nhận thu tiền
                  </button>
               </div>
            </div>
         </div>
      )
   }

   return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
         <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl h-[90vh] flex flex-col">
            <div className="p-6 border-b border-slate-200 flex justify-between items-center bg-slate-50">
               <h2 className="text-xl font-bold text-slate-800">Tạo bảng kê phí dịch vụ</h2>
               <button onClick={onClose}><X className="w-6 h-6 text-slate-400 hover:text-red-500" /></button>
            </div>

            <div className="flex-1 overflow-auto p-8 bg-slate-50">
               <div className="bg-white p-8 shadow-sm border border-slate-200 max-w-3xl mx-auto">
                  {/* Invoice Header */}
                  <div className="flex justify-between mb-8 border-b border-slate-200 pb-6">
                     <div>
                        <h1 className="text-2xl font-bold text-teal-800 uppercase mb-2">Viện Dưỡng Lão FDC</h1>
                        <p className="text-sm text-slate-500">123 Đường ABC, Quận 7, TP.HCM</p>
                     </div>
                     <div className="text-right">
                        <h2 className="text-xl font-bold text-slate-800">BẢNG KÊ PHÍ</h2>
                        <p className="text-slate-500">Tháng: {new Date().getMonth() + 1}/{new Date().getFullYear()}</p>
                     </div>
                  </div>

                  {/* Resident Info */}
                  <div className="mb-8 p-4 bg-slate-50 rounded-lg">
                     <p><span className="font-bold">Người sử dụng dịch vụ:</span> {resident.name}</p>
                     <p><span className="font-bold">Phòng:</span> {resident.room} ({resident.floor})</p>
                  </div>

                  {/* Fee Table */}
                  <table className="w-full text-sm mb-6">
                     <thead>
                        <tr className="border-b-2 border-slate-800">
                           <th className="text-left py-2">Diễn giải</th>
                           <th className="text-right py-2">Thành tiền</th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-slate-100">
                        {baseFees.map((fee, i) => (
                           <tr key={i}>
                              <td className="py-3 font-medium text-slate-700">{fee.desc}</td>
                              <td className="py-3 text-right font-medium">{formatCurrency(fee.amount)}</td>
                           </tr>
                        ))}
                        {usageFees.map((fee, i) => (
                           <tr key={`usage-${i}`}>
                              <td className="py-3 text-slate-600 italic pl-6 border-l-2 border-teal-200 bg-teal-50/30">
                                 {fee.desc}
                              </td>
                              <td className="py-3 text-right text-slate-600">{formatCurrency(fee.amount)}</td>
                           </tr>
                        ))}
                        {items.map((item, i) => (
                           <tr key={`extra-${i}`}>
                              <td className="py-3 text-slate-600 flex justify-between group">
                                 {item.desc}
                                 <button onClick={() => setItems(items.filter((_, idx) => idx !== i))} className="text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100"><Trash2 className="w-4 h-4" /></button>
                              </td>
                              <td className="py-3 text-right text-slate-600">{formatCurrency(item.amount)}</td>
                           </tr>
                        ))}
                     </tbody>
                     <tfoot>
                        <tr className="border-t-2 border-slate-800">
                           <td className="py-4 font-bold text-lg">TỔNG CỘNG</td>
                           <td className="py-4 font-bold text-lg text-right text-teal-700">{formatCurrency(total)}</td>
                        </tr>
                     </tfoot>
                  </table>

                  {/* Add Extra Item */}
                  <div className="mt-8 pt-6 border-t border-slate-200 no-print">
                     <h4 className="font-semibold text-slate-700 mb-3">Thêm chi phí phát sinh</h4>
                     <div className="flex gap-3">
                        <input
                           type="text"
                           placeholder="Tên chi phí (VD: Thuốc ngoài, Bỉm...)"
                           className="flex-1 border rounded px-3 py-2 text-sm"
                           value={newItem.desc}
                           onChange={e => setNewItem({ ...newItem, desc: e.target.value })}
                        />
                        <input
                           type="number"
                           placeholder="Số tiền"
                           className="w-40 border rounded px-3 py-2 text-sm"
                           value={newItem.amount || ''}
                           onChange={e => setNewItem({ ...newItem, amount: Number(e.target.value) })}
                        />
                        <button
                           onClick={() => {
                              if (newItem.desc && newItem.amount) {
                                 setItems([...items, newItem]);
                                 setNewItem({ desc: '', amount: 0 });
                              }
                           }}
                           className="bg-slate-200 text-slate-700 px-4 rounded hover:bg-slate-300 font-medium"
                        >
                           <Plus className="w-5 h-5" />
                        </button>
                     </div>
                  </div>
               </div>
            </div>

            <div className="p-4 border-t border-slate-200 bg-white flex justify-between gap-3">
               <div>
                  {resident.balance < 0 && (
                     <button onClick={() => setPaymentMode(true)} className="px-6 py-2 rounded-lg bg-green-100 text-green-700 font-bold border border-green-200 hover:bg-green-200 flex items-center gap-2">
                        <DollarSign className="w-4 h-4" /> Thanh toán
                     </button>
                  )}
               </div>
               <div className="flex gap-3">
                  <button onClick={onClose} className="px-6 py-2 rounded-lg border border-slate-300 text-slate-600 font-medium">Hủy</button>
                  <button
                     onClick={() => addToast('success', 'Đã lưu', 'Bảng kê đã được lưu vào hệ thống!')}
                     className="px-6 py-2 rounded-lg bg-teal-600 text-white font-medium hover:bg-teal-700 flex items-center gap-2"
                  >
                     <Save className="w-4 h-4" /> Lưu bảng kê
                  </button>
               </div>
            </div>
         </div>
      </div >
   );
};