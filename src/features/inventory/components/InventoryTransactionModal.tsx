import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { InventoryItem, InventoryTransaction, User } from '@/src/types/index';
import { useToast } from '@/src/app/providers';

const schema = z.object({
   itemId: z.string().min(1, 'Vui lòng chọn vật tư'),
   type: z.enum(['IN', 'OUT']),
   quantity: z.number().min(1, 'Số lượng phải lớn hơn 0'),
   reason: z.string().optional()
});

type FormData = z.infer<typeof schema>;

interface InventoryTransactionModalProps {
   user: User;
   inventory: InventoryItem[];
   onClose: () => void;
   onConfirm: (transaction: InventoryTransaction) => void;
}

export const InventoryTransactionModal = ({ user, inventory, onClose, onConfirm }: InventoryTransactionModalProps) => {
   const { register, handleSubmit, watch, setValue, setError, formState: { errors } } = useForm<FormData>({
      resolver: zodResolver(schema),
      defaultValues: {
         itemId: inventory[0]?.id || '',
         type: 'IN',
         quantity: 0,
         reason: ''
      }
   });

   const { addToast } = useToast();
   const type = watch('type');
   const itemId = watch('itemId');

   const onSubmit = (data: FormData) => {
      const item = inventory.find(i => i.id === data.itemId);
      if (!item) return;

      if (data.type === 'OUT' && item.stock < data.quantity) {
         setError('quantity', {
            type: 'manual',
            message: `Tồn kho không đủ (Hiện có: ${item.stock})`
         });
         return;
      }

      onConfirm({
         id: `TRX-${Date.now()}`,
         itemId: data.itemId,
         itemName: item.name,
         type: data.type,
         quantity: data.quantity,
         date: new Date().toLocaleString('vi-VN'),
         performer: user.name,
         reason: data.reason || (data.type === 'IN' ? 'Nhập hàng mới' : 'Xuất sử dụng')
      });
      addToast('success', 'Thành công', 'Giao dịch đã được ghi nhận');
      onClose();
   };

   return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
         <div className="bg-white rounded-xl w-full max-w-sm p-6">
            <h3 className="font-bold text-lg mb-4">Nhập / Xuất Kho</h3>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
               <div>
                  <label className="block text-sm font-medium mb-1">Vật tư</label>
                  <select
                     {...register('itemId')}
                     className="w-full border rounded p-2"
                  >
                     {inventory.map(i => <option key={i.id} value={i.id}>{i.name} (Tồn: {i.stock})</option>)}
                  </select>
               </div>
               <div>
                  <label className="block text-sm font-medium mb-1">Loại giao dịch</label>
                  <div className="flex gap-2">
                     <button
                        type="button"
                        onClick={() => setValue('type', 'IN')}
                        className={`flex-1 py-2 rounded border ${type === 'IN' ? 'bg-teal-600 text-white border-teal-600' : 'bg-white text-slate-600'}`}
                     >
                        Nhập kho (+)
                     </button>
                     <button
                        type="button"
                        onClick={() => setValue('type', 'OUT')}
                        className={`flex-1 py-2 rounded border ${type === 'OUT' ? 'bg-red-600 text-white border-red-600' : 'bg-white text-slate-600'}`}
                     >
                        Xuất kho (-)
                     </button>
                  </div>
               </div>
               <div>
                  <label className="block text-sm font-medium mb-1">Số lượng</label>
                  <input
                     {...register('quantity', { valueAsNumber: true })}
                     type="number"
                     className={`w-full border rounded p-2 ${errors.quantity ? 'border-red-500' : ''}`}
                  />
                  {errors.quantity && <p className="text-red-500 text-xs mt-1">{errors.quantity.message}</p>}
               </div>
               <div>
                  <label className="block text-sm font-medium mb-1">Ghi chú / Lý do</label>
                  <textarea
                     {...register('reason')}
                     className="w-full border rounded p-2"
                     rows={2}
                     placeholder={type === 'IN' ? 'Nhập từ NCC...' : 'Xuất cho khoa...'}
                  />
               </div>
               <div className="mt-6 flex justify-end gap-2">
                  <button type="button" onClick={onClose} className="px-4 py-2 text-slate-500 hover:bg-slate-100 rounded">Hủy</button>
                  <button type="submit" className="px-4 py-2 bg-slate-800 text-white rounded hover:bg-slate-900">Xác nhận</button>
               </div>
            </form>
         </div>
      </div>
   );
};