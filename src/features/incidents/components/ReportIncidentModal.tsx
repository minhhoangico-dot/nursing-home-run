import React from 'react';
import { X, AlertTriangle } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Incident, IncidentType, IncidentSeverity } from '../../../types';
import { useToast } from '../../../app/providers';

const schema = z.object({
   type: z.enum(['Fall', 'Medical', 'Aggression', 'Equipment', 'Other']),
   severity: z.enum(['Low', 'Medium', 'High', 'Critical']),
   location: z.string().min(1, 'Vui lòng nhập địa điểm'),
   involvedPersons: z.string().optional(),
   description: z.string().min(10, 'Mô tả phải có ít nhất 10 ký tự'),
   immediateAction: z.string().min(1, 'Vui lòng nhập biện pháp xử lý ngay'),
});

type FormData = z.infer<typeof schema>;

interface ReportIncidentModalProps {
   currentUser: any;
   onClose: () => void;
   onSubmit?: (incident: Incident) => void;
}

export const ReportIncidentModal = ({ currentUser, onClose, onSubmit }: ReportIncidentModalProps) => {
   const { addToast } = useToast();

   const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
      resolver: zodResolver(schema),
      defaultValues: {
         severity: 'Low',
         type: 'Other',
         immediateAction: 'Theo dõi và báo cáo'
      }
   });

   const onSubmitForm = (data: FormData) => {
      const newIncident: Incident = {
         id: `INC-${Date.now()}`,
         date: new Date().toISOString().split('T')[0],
         time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
         reporter: currentUser.name,
         status: 'New',
         type: data.type as IncidentType,
         severity: data.severity as IncidentSeverity,
         location: data.location,
         description: data.description,
         immediateAction: data.immediateAction,
         witnesses: data.involvedPersons
      };

      if (onSubmit) {
         onSubmit(newIncident);
      } else {
         addToast('success', 'Đã báo cáo', 'Sự cố đã được ghi nhận vào hệ thống.');
         onClose();
      }
   };

   return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
         <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-red-50">
               <h3 className="font-bold text-lg text-red-800 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5" /> Báo cáo sự cố
               </h3>
               <button onClick={onClose}><X className="w-5 h-5 text-slate-400 hover:text-red-500" /></button>
            </div>

            <form onSubmit={handleSubmit(onSubmitForm)} className="p-6 space-y-4">
               <div className="grid grid-cols-2 gap-4">
                  <div>
                     <label className="block text-sm font-medium mb-1">Loại sự cố</label>
                     <select
                        {...register('type')}
                        className="w-full border rounded-lg p-2.5"
                     >
                        <option value="Fall">Té ngã</option>
                        <option value="Medical">Y tế/Sức khỏe</option>
                        <option value="Aggression">Gây gổ/Xung đột</option>
                        <option value="Equipment">Hỏng thiết bị</option>
                        <option value="Other">Khác</option>
                     </select>
                     {errors.type && <p className="text-red-500 text-xs mt-1">{errors.type.message}</p>}
                  </div>
                  <div>
                     <label className="block text-sm font-medium mb-1">Mức độ</label>
                     <select
                        {...register('severity')}
                        className="w-full border rounded-lg p-2.5"
                     >
                        <option value="Low">Thấp</option>
                        <option value="Medium">Trung bình</option>
                        <option value="High">Cao</option>
                        <option value="Critical">Nguy hiểm</option>
                     </select>
                  </div>
               </div>

               <div>
                  <label className="block text-sm font-medium mb-1">Địa điểm xảy ra <span className="text-red-500">*</span></label>
                  <input
                     type="text"
                     {...register('location')}
                     className="w-full border rounded-lg p-2.5"
                     placeholder="VD: Phòng 101, Canteen..."
                  />
                  {errors.location && <p className="text-red-500 text-xs mt-1">{errors.location.message}</p>}
               </div>

               <div>
                  <label className="block text-sm font-medium mb-1">Người liên quan / Nhân chứng</label>
                  <input
                     type="text"
                     {...register('involvedPersons')}
                     className="w-full border rounded-lg p-2.5"
                     placeholder="Tên những người liên quan..."
                  />
               </div>

               <div>
                  <label className="block text-sm font-medium mb-1">Mô tả chi tiết <span className="text-red-500">*</span></label>
                  <textarea
                     {...register('description')}
                     className="w-full border rounded-lg p-3 h-24"
                     placeholder="Mô tả diễn biến, nguyên nhân và hậu quả..."
                  />
                  {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description.message}</p>}
               </div>

               <div>
                  <label className="block text-sm font-medium mb-1">Xử lý ngay <span className="text-red-500">*</span></label>
                  <input
                     type="text"
                     {...register('immediateAction')}
                     className="w-full border rounded-lg p-2.5"
                     placeholder="VD: Sơ cứu, gọi bác sĩ..."
                  />
                  {errors.immediateAction && <p className="text-red-500 text-xs mt-1">{errors.immediateAction.message}</p>}
               </div>

               <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
                  <button type="button" onClick={onClose} className="px-4 py-2 text-slate-600 hover:bg-slate-50 rounded-lg font-medium">Hủy bỏ</button>
                  <button
                     type="submit"
                     className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium shadow-sm shadow-red-200"
                  >
                     Gửi báo cáo
                  </button>
               </div>
            </form>
         </div>
      </div>
   );
};