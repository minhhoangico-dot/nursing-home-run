import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { X, Check } from 'lucide-react';
import { User, Role } from '../../../types/index';

const userSchema = z.object({
   name: z.string().min(2, 'Họ tên phải có ít nhất 2 ký tự'),
   username: z.string().min(3, 'Tên đăng nhập phải có ít nhất 3 ký tự'),
   role: z.enum(['ADMIN', 'DOCTOR', 'SUPERVISOR', 'ACCOUNTANT', 'NURSE', 'CAREGIVER']),
   floor: z.string().optional()
});

type FormData = z.infer<typeof userSchema>;

export const AddUserModal = ({ onClose, onSave }: { onClose: () => void, onSave: (u: User) => void }) => {
   const { register, handleSubmit, watch, formState: { errors } } = useForm<FormData>({
      resolver: zodResolver(userSchema),
      defaultValues: {
         name: '',
         username: '',
         role: 'DOCTOR',
         floor: ''
      }
   });

   const role = watch('role');

   const onSubmit = (data: FormData) => {
      onSave({
         id: Math.random().toString(36).substr(2, 9),
         ...data
      });
   };

   return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
         <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
               <h3 className="font-bold text-slate-800">Thêm người dùng mới</h3>
               <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSubmit(onSubmit)}>
               <div className="p-6 space-y-4">
                  <div>
                     <label className="block text-sm font-medium text-slate-700 mb-1">Họ và tên <span className="text-red-500">*</span></label>
                     <input
                        {...register('name')}
                        type="text"
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none ${errors.name ? 'border-red-500' : 'border-slate-300'}`}
                        placeholder="VD: Nguyễn Văn A"
                     />
                     {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
                  </div>
                  <div>
                     <label className="block text-sm font-medium text-slate-700 mb-1">Tên đăng nhập <span className="text-red-500">*</span></label>
                     <input
                        {...register('username')}
                        type="text"
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none ${errors.username ? 'border-red-500' : 'border-slate-300'}`}
                        placeholder="VD: nguyenva"
                     />
                     {errors.username && <p className="text-red-500 text-xs mt-1">{errors.username.message}</p>}
                  </div>
                  <div>
                     <label className="block text-sm font-medium text-slate-700 mb-1">Vai trò</label>
                     <select
                        {...register('role')}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none"
                     >
                        <option value="ADMIN">Quản trị viên</option>
                        <option value="DOCTOR">Bác sĩ</option>
                        <option value="SUPERVISOR">Trưởng tầng</option>
                        <option value="ACCOUNTANT">Kế toán</option>
                        <option value="NURSE">Điều dưỡng</option>
                        <option value="CAREGIVER">Hộ lý</option>
                     </select>
                  </div>
                  {role === 'SUPERVISOR' && (
                     <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Phụ trách tầng</label>
                        <select
                           {...register('floor')}
                           className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none"
                        >
                           <option value="">-- Chọn tầng --</option>
                           <option value="Tầng 1">Tầng 1</option>
                           <option value="Tầng 2">Tầng 2</option>
                           <option value="Tầng 3">Tầng 3</option>
                           <option value="Tầng 4">Tầng 4</option>
                        </select>
                     </div>
                  )}
               </div>
               <div className="p-4 bg-slate-50 flex justify-end gap-2">
                  <button type="button" onClick={onClose} className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-200 rounded-lg">Hủy</button>
                  <button type="submit" className="px-4 py-2 bg-teal-600 text-white font-medium hover:bg-teal-700 rounded-lg flex items-center gap-2">
                     <Check className="w-4 h-4" /> Lưu người dùng
                  </button>
               </div>
            </form>
         </div>
      </div>
   );
};