import React, { useState } from 'react';
import { ShoppingCart, Plus, CheckCircle2, AlertCircle } from 'lucide-react';
import { PurchaseRequest, InventoryItem } from '../../../types/index';
import { formatCurrency } from '../../../data/index';
import { Modal, Button, Input } from '../../../components/ui/index';

export const PurchaseRequestList = ({ 
   requests, 
   inventory,
   onRequest 
}: { 
   requests: PurchaseRequest[], 
   inventory: InventoryItem[],
   onRequest: (req: PurchaseRequest) => void 
}) => {
   const [showModal, setShowModal] = useState(false);
   const [newItemId, setNewItemId] = useState(inventory[0]?.id || '');
   const [qty, setQty] = useState(1);

   const handleAdd = () => {
      const item = inventory.find(i => i.id === newItemId);
      if (!item) return;

      onRequest({
         id: `PR-${Date.now()}`,
         itemId: item.id,
         itemName: item.name,
         quantity: Number(qty),
         status: 'Pending',
         requestDate: new Date().toLocaleDateString('vi-VN'),
         priority: 'Normal',
         estimatedCost: item.price * Number(qty)
      });
      setShowModal(false);
   };

   // Auto-suggest items low in stock
   const lowStockItems = inventory.filter(i => i.stock <= i.minStock);

   return (
      <div className="space-y-6">
         {showModal && (
            <Modal title="Tạo yêu cầu mua sắm" onClose={() => setShowModal(false)}>
               <div className="space-y-4">
                  <div>
                     <label className="block text-sm font-medium mb-1">Vật tư cần mua</label>
                     <select className="w-full border rounded p-2" value={newItemId} onChange={e => setNewItemId(e.target.value)}>
                        {inventory.map(i => <option key={i.id} value={i.id}>{i.name} (Hiện có: {i.stock})</option>)}
                     </select>
                  </div>
                  <Input label="Số lượng đề xuất" type="number" value={qty} onChange={e => setQty(Number(e.target.value))} />
                  <div className="flex justify-end pt-4">
                     <Button onClick={handleAdd} icon={<ShoppingCart className="w-4 h-4" />}>Tạo yêu cầu</Button>
                  </div>
               </div>
            </Modal>
         )}

         {lowStockItems.length > 0 && (
            <div className="bg-orange-50 border border-orange-200 p-4 rounded-xl flex justify-between items-center">
               <div className="flex items-center gap-3">
                  <AlertCircle className="w-6 h-6 text-orange-500" />
                  <div>
                     <h4 className="font-bold text-orange-800">Cảnh báo tồn kho thấp</h4>
                     <p className="text-sm text-orange-700">Có {lowStockItems.length} mặt hàng dưới định mức tối thiểu. Cần đặt hàng ngay.</p>
                  </div>
               </div>
               <Button size="sm" variant="danger" onClick={() => setShowModal(true)}>Đặt hàng ngay</Button>
            </div>
         )}

         <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center">
               <h3 className="font-bold text-slate-800">Danh sách yêu cầu mua sắm</h3>
               <Button size="sm" onClick={() => setShowModal(true)} icon={<Plus className="w-4 h-4" />}>Thêm yêu cầu</Button>
            </div>
            <table className="w-full text-left text-sm">
               <thead className="bg-slate-50 text-slate-500 font-medium">
                  <tr>
                     <th className="px-6 py-3">Ngày yêu cầu</th>
                     <th className="px-6 py-3">Vật tư</th>
                     <th className="px-6 py-3 text-right">Số lượng</th>
                     <th className="px-6 py-3 text-right">Dự toán</th>
                     <th className="px-6 py-3">Ưu tiên</th>
                     <th className="px-6 py-3 text-center">Trạng thái</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-slate-100">
                  {requests.map(req => (
                     <tr key={req.id} className="hover:bg-slate-50">
                        <td className="px-6 py-4">{req.requestDate}</td>
                        <td className="px-6 py-4 font-medium">{req.itemName}</td>
                        <td className="px-6 py-4 text-right">{req.quantity}</td>
                        <td className="px-6 py-4 text-right">{formatCurrency(req.estimatedCost)}</td>
                        <td className="px-6 py-4">
                           <span className={`text-xs px-2 py-1 rounded font-medium ${req.priority === 'High' ? 'bg-red-100 text-red-700' : 'bg-blue-50 text-blue-700'}`}>
                              {req.priority === 'High' ? 'Khẩn cấp' : 'Bình thường'}
                           </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                           <span className={`text-xs px-2 py-1 rounded-full font-bold ${
                              req.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' :
                              req.status === 'Approved' ? 'bg-blue-100 text-blue-700' :
                              req.status === 'Received' ? 'bg-green-100 text-green-700' :
                              'bg-slate-200 text-slate-600'
                           }`}>
                              {req.status === 'Pending' ? 'Chờ duyệt' : 
                               req.status === 'Approved' ? 'Đã duyệt' : 
                               req.status === 'Received' ? 'Đã nhập kho' : req.status}
                           </span>
                        </td>
                     </tr>
                  ))}
                  {requests.length === 0 && (
                     <tr><td colSpan={6} className="text-center py-8 text-slate-400 italic">Chưa có yêu cầu nào</td></tr>
                  )}
               </tbody>
            </table>
         </div>
      </div>
   );
};