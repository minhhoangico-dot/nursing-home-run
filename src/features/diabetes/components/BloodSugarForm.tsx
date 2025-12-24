import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useDiabetesStore } from '@/src/stores/diabetesStore';
import { useAuthStore } from '@/src/stores/authStore';
import { X, Save, AlertTriangle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { Resident } from '@/src/types/resident';

interface BloodSugarFormProps {
    resident: Resident;
    onClose: () => void;
    onSuccess: () => void;
}

const bloodSugarSchema = z.object({
    recordDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Ngày không hợp lệ'),
    morningBeforeMeal: z.number().min(0).max(30).optional().nullable().or(z.nan()),
    morningAfterMeal: z.number().min(0).max(30).optional().nullable().or(z.nan()),
    lunchBeforeMeal: z.number().min(0).max(30).optional().nullable().or(z.nan()),
    lunchAfterMeal: z.number().min(0).max(30).optional().nullable().or(z.nan()),
    dinnerBeforeMeal: z.number().min(0).max(30).optional().nullable().or(z.nan()),
    dinnerAfterMeal: z.number().min(0).max(30).optional().nullable().or(z.nan()),
    insulinUnits: z.number().min(0).max(100).optional().nullable().or(z.nan()),
    insulinTime: z.enum(['morning', 'noon', 'evening']).optional(),
    notes: z.string().optional(),
});

type FormData = z.infer<typeof bloodSugarSchema>;

export const BloodSugarForm = ({ resident, onClose, onSuccess }: BloodSugarFormProps) => {
    const { addRecord, isLoading } = useDiabetesStore();
    const { user } = useAuthStore();

    const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
        resolver: zodResolver(bloodSugarSchema),
        defaultValues: {
            recordDate: new Date().toISOString().split('T')[0],
            insulinTime: 'morning'
        }
    });

    const onSubmit = async (data: FormData) => {
        try {
            // Convert NaNs/nulls to undefined for optional fields if needed, or pass as is if store handles it
            // Supabase expects null for empty numbers usually
            const cleanNumber = (val: any) => (val === '' || isNaN(val)) ? null : Number(val);

            await addRecord({
                residentId: resident.id,
                recordDate: data.recordDate,
                morningBeforeMeal: cleanNumber(data.morningBeforeMeal),
                morningAfterMeal: cleanNumber(data.morningAfterMeal),
                lunchBeforeMeal: cleanNumber(data.lunchBeforeMeal),
                lunchAfterMeal: cleanNumber(data.lunchAfterMeal),
                dinnerBeforeMeal: cleanNumber(data.dinnerBeforeMeal),
                dinnerAfterMeal: cleanNumber(data.dinnerAfterMeal),
                insulinUnits: cleanNumber(data.insulinUnits),
                insulinTime: data.insulinTime as any,
                administeredBy: user?.name || 'Y tá',
                notes: data.notes
            });

            toast.success('Đã lưu chỉ số đường huyết');
            onSuccess();
            onClose();
        } catch (error) {
            console.error(error);
            toast.error('Lỗi khi lưu dữ liệu');
        }
    };

    return (
        <div className="flex flex-col h-full bg-white rounded-xl overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b border-slate-200">
                <div>
                    <h2 className="text-xl font-bold text-slate-800">Nhập chỉ số đường huyết</h2>
                    <p className="text-sm text-slate-500">NCT: {resident.name}</p>
                </div>
                <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full">
                    <X className="w-5 h-5 text-slate-500" />
                </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="flex-1 overflow-y-auto p-6 space-y-6">
                <div className="bg-blue-50 p-4 rounded-lg flex gap-3 text-blue-800 text-sm">
                    <AlertTriangle className="w-5 h-5 shrink-0" />
                    <div>
                        <p className="font-bold">Lưu ý ngưỡng an toàn:</p>
                        <ul className="list-disc ml-4 mt-1 space-y-1">
                            <li>Đói (Trước ăn): 4.4 - 7.2 mmol/L</li>
                            <li>No (Sau ăn 2h): &lt; 10.0 mmol/L</li>
                            <li>Hạ đường huyết: &lt; 3.9 mmol/L</li>
                        </ul>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">Ngày đo</label>
                        <input
                            type="date"
                            {...register('recordDate')}
                            className="w-full p-2 border border-slate-300 rounded-lg"
                        />
                        {errors.recordDate && <p className="text-red-500 text-xs">{errors.recordDate.message}</p>}
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">Ghi chú</label>
                        <input
                            {...register('notes')}
                            placeholder="Ghi chú khác..."
                            className="w-full p-2 border border-slate-300 rounded-lg"
                        />
                    </div>
                </div>

                <div className="border-t border-slate-200 pt-4">
                    <h3 className="font-bold mb-4 text-slate-700">1. Chỉ số đường huyết (mmol/L)</h3>
                    <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-3">
                            <p className="text-center font-medium text-slate-600 bg-slate-100 py-1 rounded">Sáng</p>
                            <div>
                                <label className="text-xs text-slate-500">Trước ăn</label>
                                <input type="number" step="0.1" {...register('morningBeforeMeal', { valueAsNumber: true })} className="w-full p-2 border border-slate-300 rounded" />
                            </div>
                            <div>
                                <label className="text-xs text-slate-500">Sau ăn</label>
                                <input type="number" step="0.1" {...register('morningAfterMeal', { valueAsNumber: true })} className="w-full p-2 border border-slate-300 rounded" />
                            </div>
                        </div>
                        <div className="space-y-3">
                            <p className="text-center font-medium text-slate-600 bg-slate-100 py-1 rounded">Trưa</p>
                            <div>
                                <label className="text-xs text-slate-500">Trước ăn</label>
                                <input type="number" step="0.1" {...register('lunchBeforeMeal', { valueAsNumber: true })} className="w-full p-2 border border-slate-300 rounded" />
                            </div>
                            <div>
                                <label className="text-xs text-slate-500">Sau ăn</label>
                                <input type="number" step="0.1" {...register('lunchAfterMeal', { valueAsNumber: true })} className="w-full p-2 border border-slate-300 rounded" />
                            </div>
                        </div>
                        <div className="space-y-3">
                            <p className="text-center font-medium text-slate-600 bg-slate-100 py-1 rounded">Tối</p>
                            <div>
                                <label className="text-xs text-slate-500">Trước ăn</label>
                                <input type="number" step="0.1" {...register('dinnerBeforeMeal', { valueAsNumber: true })} className="w-full p-2 border border-slate-300 rounded" />
                            </div>
                            <div>
                                <label className="text-xs text-slate-500">Sau ăn</label>
                                <input type="number" step="0.1" {...register('dinnerAfterMeal', { valueAsNumber: true })} className="w-full p-2 border border-slate-300 rounded" />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="border-t border-slate-200 pt-4">
                    <h3 className="font-bold mb-4 text-slate-700">2. Tiêm Insulin</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm font-medium text-slate-700">Liều lượng (đơn vị)</label>
                            <input
                                type="number"
                                {...register('insulinUnits', { valueAsNumber: true })}
                                className="w-full p-2 border border-slate-300 rounded-lg"
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium text-slate-700">Buổi tiêm</label>
                            <select {...register('insulinTime')} className="w-full p-2 border border-slate-300 rounded-lg">
                                <option value="morning">Sáng</option>
                                <option value="noon">Trưa</option>
                                <option value="evening">Tối</option>
                            </select>
                        </div>
                    </div>
                </div>
            </form>

            <div className="p-6 border-t border-slate-200 flex justify-end gap-3 bg-slate-50">
                <button
                    onClick={onClose}
                    className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-white"
                >
                    Hủy
                </button>
                <button
                    onClick={handleSubmit(onSubmit)}
                    disabled={isLoading}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2 shadow-sm disabled:opacity-50"
                >
                    <Save className="w-4 h-4" />
                    {isLoading ? 'Đang lưu...' : 'Lưu kết quả'}
                </button>
            </div>
        </div>
    );
};
