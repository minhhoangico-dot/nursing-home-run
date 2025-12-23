import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { X, Save, PenTool } from 'lucide-react';
import { MaintenanceRequest, MaintenancePriority } from '@/src/types/index';

const schema = z.object({
   title: z.string().min(1, 'Vui lòng nhập tiêu đề'),
   location: z.string().min(1, 'Vui lòng nhập khu vực'),
   description: z.string().optional(),
   priority: z.enum(['Low', 'Medium', 'High', 'Critical'])
});

type MaintenanceFormData = z.infer<typeof schema>;

interface CreateRequestModalProps {
   onClose: () => void;
   onSubmit: (req: MaintenanceFormData) => void;
}

export const CreateRequestModal = ({ onClose, onSubmit }: CreateRequestModalProps) => {
   const { register, handleSubmit, formState: { errors } } = useForm<MaintenanceFormData>({
      resolver: zodResolver(schema),
      defaultValues: {
         title: '',
         description: '',
         location: '',
         priority: 'Medium'
      }
   });

   return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
         <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50 rounded-t-xl">
               <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                  <PenTool className="w-5 h-5 text-orange-500" /> Tạo yêu cầu bảo trì
               </h3>
               <button onClick={onClose}><X className="w-5 h-5 text-slate-400 hover:text-red-500" /></button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)}>
               <div className="p-6 space-y-4">
                  <div>
                     <label className="block text-sm font-medium mb-1">Vấn đề cần xử lý <span className="text-red-500">*</span></label>
                     <input
                        type="text"
                        {...register('title')}
                        className="w-full border rounded-lg p-2.5"
                        placeholder="VD: Hỏng đèn, Tắc bồn cầu..."
                     />
                     {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
                  </div>

                  <div>
                     <label className="block text-sm font-medium mb-1">Khu vực / Phòng <span className="text-red-500">*</span></label>
                     <input
                        type="text"
                        {...register('location')}
                        className="w-full border rounded-lg p-2.5"
                        placeholder="VD: Phòng 201, Nhà bếp..."
                     />
                     {errors.location && <p className="text-red-500 text-xs mt-1">{errors.location.message}</p>}
                  </div>

                  <div>
                     <label className="block text-sm font-medium mb-1">Mức độ ưu tiên</label>
                     <select
                        {...register('priority')}
                        className="w-full border rounded-lg p-2.5"
                     >
                        <option value="Low">Thấp</option>
                        <option value="Medium">Bình thường</option>
                        <option value="High">Cao (Cần xử lý trong ngày)</option>
                        <option value="Critical">Khẩn cấp (Ngay lập tức)</option>
                     </select>
                  </div>

                  <div>
                     <label className="block text-sm font-medium mb-1">Mô tả chi tiết</label>
                     <textarea
                        {...register('description')}
                        className="w-full border rounded-lg p-3 h-24"
                        placeholder="Mô tả cụ thể tình trạng..."
                     />
                  </div>
               </div>

               <div className="p-4 border-t border-slate-100 flex justify-end gap-3 bg-slate-50 rounded-b-xl">
                  <button type="button" onClick={onClose} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium">Hủy</button>
                  <button
                     type="submit"
                     className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 font-medium flex items-center gap-2"
                  >
                     <Save className="w-4 h-4" /> Gửi yêu cầu
                  </button>
               </div>
            </form>
         </div>
      </div>
   );
};