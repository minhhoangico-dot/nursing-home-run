import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { X, ArrowLeft, ArrowRight, CheckCircle2, BedDouble, AlertCircle } from 'lucide-react';
import { Resident } from '@/src/types/index';

const admissionSchema = z.object({
   name: z.string().min(2, 'Họ tên phải có ít nhất 2 ký tự'),
   dob: z.string().min(1, 'Vui lòng chọn ngày sinh'),
   gender: z.enum(['Nam', 'Nữ']),
   idCard: z.string().optional(),
   guardianName: z.string().min(2, 'Vui lòng nhập tên người bảo trợ'),
   guardianPhone: z.string().regex(/^(0|\+84)\d{9,10}$/, 'Số điện thoại không đúng định dạng'),
   guardianAddress: z.string().optional(),
   roomType: z.enum(['1 Giường', '2 Giường', '4 Giường']),
   careLevel: z.number().min(1).max(4),
   isDiabetic: z.boolean().optional()
});

type FormData = z.infer<typeof admissionSchema>;

export const AdmissionWizard = ({ onSave, onCancel }: { onSave: (data: Partial<Resident>) => void, onCancel: () => void }) => {
   const [step, setStep] = useState(1);
   const { register, handleSubmit, trigger, watch, setValue, formState: { errors } } = useForm<FormData>({
      resolver: zodResolver(admissionSchema),
      defaultValues: {
         name: '',
         gender: 'Nam',
         roomType: '2 Giường',
         careLevel: 1,
         idCard: '',
         guardianAddress: '',
         isDiabetic: false
      }
   });

   // Watch values for UI logic (e.g. room selection highlighting)
   const roomType = watch('roomType');
   const careLevel = watch('careLevel');
   const gender = watch('gender');

   const steps = [
      { num: 1, title: 'Thông tin cá nhân', fields: ['name', 'dob', 'gender', 'idCard'] as const },
      { num: 2, title: 'Người bảo trợ', fields: ['guardianName', 'guardianPhone', 'guardianAddress'] as const },
      { num: 3, title: 'Phòng & Dịch vụ', fields: ['roomType', 'careLevel'] as const },
   ];

   const handleNext = async () => {
      const fieldsToValidate = steps[step - 1].fields;
      const isValid = await trigger(fieldsToValidate);
      if (isValid) {
         setStep(s => s + 1);
      }
   };

   const onSubmit = (data: FormData) => {
      onSave({
         ...data,
         careLevel: data.careLevel as 1 | 2 | 3 | 4,
         status: 'Active',
         admissionDate: new Date().toISOString().split('T')[0],
         balance: 0
      });
   };

   return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
         <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-slate-200 flex justify-between items-center">
               <h2 className="text-xl font-bold text-slate-800">Tiếp nhận NCT mới</h2>
               <button onClick={onCancel}><X className="w-6 h-6 text-slate-400 hover:text-red-500" /></button>
            </div>

            {/* Stepper */}
            <div className="flex items-center justify-between px-12 py-6 bg-slate-50">
               {steps.map((s) => (
                  <div key={s.num} className="flex flex-col items-center relative z-10">
                     <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm mb-2 transition-colors ${step >= s.num ? 'bg-teal-600 text-white' : 'bg-slate-200 text-slate-500'}`}>
                        {s.num}
                     </div>
                     <span className={`text-xs font-medium ${step >= s.num ? 'text-teal-700' : 'text-slate-400'}`}>{s.title}</span>
                  </div>
               ))}
               <div className="absolute top-[88px] left-0 w-full h-0.5 bg-slate-200 -z-0">
                  <div className="h-full bg-teal-600 transition-all duration-300" style={{ width: `${((step - 1) / 2) * 100}%` }}></div>
               </div>
            </div>

            <form className="flex-1 overflow-y-auto p-8">
               {step === 1 && (
                  <div className="space-y-4">
                     <div className="grid grid-cols-1 gap-4">
                        <div>
                           <label className="block text-sm font-medium text-slate-700 mb-1">Họ và tên <span className="text-red-500">*</span></label>
                           <input
                              {...register('name')}
                              type="text"
                              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 ${errors.name ? 'border-red-500' : ''}`}
                              placeholder="VD: Nguyễn Văn A"
                           />
                           {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                           <div>
                              <label className="block text-sm font-medium text-slate-700 mb-1">Ngày sinh <span className="text-red-500">*</span></label>
                              <input
                                 {...register('dob')}
                                 type="date"
                                 className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 ${errors.dob ? 'border-red-500' : ''}`}
                              />
                              {errors.dob && <p className="text-red-500 text-xs mt-1">{errors.dob.message}</p>}
                           </div>
                           <div>
                              <label className="block text-sm font-medium text-slate-700 mb-1">Giới tính</label>
                              <select {...register('gender')} className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500">
                                 <option value="Nam">Nam</option>
                                 <option value="Nữ">Nữ</option>
                              </select>
                           </div>
                        </div>
                        <div>
                           <label className="block text-sm font-medium text-slate-700 mb-1">Số CCCD</label>
                           <input
                              {...register('idCard')}
                              type="text"
                              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                              placeholder="0791..."
                           />
                        </div>

                        <div className="flex items-center gap-2 mt-2">
                           <input
                              type="checkbox"
                              id="isDiabetic"
                              {...register('isDiabetic')}
                              className="w-4 h-4 text-teal-600 rounded border-slate-300 focus:ring-teal-500"
                           />
                           <label htmlFor="isDiabetic" className="text-sm font-medium text-slate-700">Người cao tuổi có tiểu đường</label>
                        </div>
                     </div>
                  </div>
               )}

               {step === 2 && (
                  <div className="space-y-4">
                     <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Tên người bảo trợ <span className="text-red-500">*</span></label>
                        <input
                           {...register('guardianName')}
                           type="text"
                           className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 ${errors.guardianName ? 'border-red-500' : ''}`}
                        />
                        {errors.guardianName && <p className="text-red-500 text-xs mt-1">{errors.guardianName.message}</p>}
                     </div>
                     <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Số điện thoại liên hệ <span className="text-red-500">*</span></label>
                        <input
                           {...register('guardianPhone')}
                           type="text"
                           className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 ${errors.guardianPhone ? 'border-red-500' : ''}`}
                        />
                        {errors.guardianPhone && <p className="text-red-500 text-xs mt-1">{errors.guardianPhone.message}</p>}
                     </div>
                     <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Địa chỉ</label>
                        <textarea
                           {...register('guardianAddress')}
                           className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                           rows={3}
                        ></textarea>
                     </div>
                  </div>
               )}

               {step === 3 && (
                  <div className="space-y-4">
                     <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Loại phòng đăng ký</label>
                        <div className="grid grid-cols-3 gap-4">
                           {['1 Giường', '2 Giường', '4 Giường'].map(type => (
                              <div key={type}
                                 onClick={() => setValue('roomType', type as any)}
                                 className={`border rounded-xl p-4 cursor-pointer text-center hover:border-teal-500 transition-all ${roomType === type ? 'bg-teal-50 border-teal-500 ring-1 ring-teal-500' : 'bg-white border-slate-200'}`}>
                                 <BedDouble className={`w-6 h-6 mx-auto mb-2 ${roomType === type ? 'text-teal-600' : 'text-slate-400'}`} />
                                 <span className={`text-sm font-medium ${roomType === type ? 'text-teal-700' : 'text-slate-600'}`}>{type}</span>
                              </div>
                           ))}
                        </div>
                     </div>
                     <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Dự kiến cấp độ chăm sóc (Tạm tính)</label>
                        <select
                           {...register('careLevel', { valueAsNumber: true })}
                           className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                        >
                           <option value={1}>Cấp độ 1 (Tự phục vụ)</option>
                           <option value={2}>Cấp độ 2 (Hỗ trợ một phần)</option>
                           <option value={3}>Cấp độ 3 (Hỗ trợ nhiều)</option>
                           <option value={4}>Cấp độ 4 (Chăm sóc đặc biệt)</option>
                        </select>
                     </div>
                     <div className="p-4 bg-yellow-50 text-yellow-800 text-sm rounded-lg flex items-start gap-2">
                        <AlertCircle className="w-5 h-5 shrink-0" />
                        <span>Lưu ý: Cấp độ chăm sóc chính thức sẽ được xác định sau khi Bác sĩ thực hiện đánh giá chuyên môn trong vòng 24h.</span>
                     </div>
                  </div>
               )}
            </form>

            <div className="p-6 border-t border-slate-200 flex justify-between bg-slate-50">
               {step > 1 ? (
                  <button onClick={() => setStep(s => s - 1)} className="flex items-center gap-2 px-4 py-2 border rounded-lg text-slate-600 hover:bg-white">
                     <ArrowLeft className="w-4 h-4" /> Quay lại
                  </button>
               ) : <div></div>}

               {step < 3 ? (
                  <button
                     type="button"
                     onClick={handleNext}
                     className="flex items-center gap-2 px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
                  >
                     Tiếp tục <ArrowRight className="w-4 h-4" />
                  </button>
               ) : (
                  <button
                     type="button"
                     onClick={handleSubmit(onSubmit)}
                     className="flex items-center gap-2 px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 shadow-lg shadow-teal-900/10"
                  >
                     <CheckCircle2 className="w-4 h-4" /> Hoàn tất & Nhập viện
                  </button>
               )}
            </div>
         </div>
      </div>
   );
};