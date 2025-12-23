import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { X, Save, AlertTriangle } from 'lucide-react';
import { User } from '@/src/types/index';

const handoverSchema = z.object({
   shift: z.string().min(1, 'Vui lòng chọn ca trực'),
   notes: z.string().optional(),
   criticalIssues: z.string().optional()
});

type HandoverSimpleData = z.infer<typeof handoverSchema>;

interface CreateHandoverModalProps {
   currentUser: User;
   onClose: () => void;
   onSubmit: (report: HandoverSimpleData) => void;
}

export const CreateHandoverModal = ({ currentUser, onClose, onSubmit }: CreateHandoverModalProps) => {
   const { register, handleSubmit, formState: { errors } } = useForm<HandoverSimpleData>({
      resolver: zodResolver(handoverSchema),
      defaultValues: {
         shift: 'Sáng (6:00 - 14:00)',
         notes: '',
         criticalIssues: ''
      }
   });

   return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
         <div className="bg-white rounded-xl shadow-xl w-full max-w-lg">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
               <h3 className="font-bold text-lg text-slate-800">Tạo bàn giao ca</h3>
               <button onClick={onClose}><X className="w-5 h-5 text-slate-400 hover:text-slate-600" /></button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)}>
               <div className="p-6 space-y-4">
                  <div>
                     <label className="block text-sm font-medium mb-1">Ca trực</label>
                     <select
                        {...register('shift')}
                        className="w-full border rounded-lg p-2.5"
                     >
                        <option>Sáng (6:00 - 14:00)</option>
                        <option>Chiều (14:00 - 22:00)</option>
                        <option>Đêm (22:00 - 6:00)</option>
                     </select>
                     {errors.shift && <p className="text-sm text-red-500">{errors.shift.message}</p>}
                  </div>

                  <div>
                     <label className="block text-sm font-medium mb-1">Ghi chú chung</label>
                     <textarea
                        {...register('notes')}
                        className="w-full border rounded-lg p-3 h-24"
                        placeholder="Tình hình chung trong ca..."
                     />
                  </div>

                  <div>
                     <label className="block text-sm font-medium mb-1 text-red-600 flex items-center gap-1">
                        <AlertTriangle className="w-4 h-4" /> Vấn đề cần lưu ý đặc biệt
                     </label>
                     <textarea
                        {...register('criticalIssues')}
                        className="w-full border border-red-200 rounded-lg p-3 h-20 bg-red-50 focus:border-red-400 focus:ring-red-200"
                        placeholder="Các vấn đề quan trọng cần bàn giao..."
                     />
                  </div>

                  <div className="bg-slate-50 p-3 rounded-lg text-sm text-slate-600">
                     <span className="font-bold">Người bàn giao:</span> {currentUser.name}
                  </div>
               </div>
               <div className="p-4 border-t border-slate-100 flex justify-end gap-3">
                  <button type="button" onClick={onClose} className="px-4 py-2 text-slate-600 hover:bg-slate-50 rounded-lg font-medium">Hủy</button>
                  <button
                     type="submit"
                     className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 font-medium flex items-center gap-2"
                  >
                     <Save className="w-4 h-4" /> Lưu bàn giao
                  </button>
               </div>
            </form>
         </div>
      </div>
   );
};