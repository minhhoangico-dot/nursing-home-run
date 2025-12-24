import React, { useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { useShiftHandoverStore } from '@/src/stores/shiftHandoverStore';
import { useResidentsStore } from '@/src/stores/residentsStore';
import { useAuthStore } from '@/src/stores/authStore';
import { X, Plus, Save, Clock, Users } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface ShiftHandoverFormProps {
    onClose: () => void;
    onSuccess: () => void;
}

interface ShiftNoteInput {
    residentId: string;
    content: string;
}

interface FormData {
    shiftDate: string;
    shiftTime: string;
    floors: string; // "Tầng 3" by default for now
    handoverStaff: string; // Comma separated for simplicity, or multi-select
    receiverStaff: string;
    notes: ShiftNoteInput[];
}

export const ShiftHandoverForm = ({ onClose, onSuccess }: ShiftHandoverFormProps) => {
    const { createHandover, isLoading } = useShiftHandoverStore();
    const { residents, fetchResidents } = useResidentsStore();
    const { user } = useAuthStore();

    useEffect(() => {
        if (residents.length === 0) fetchResidents();
    }, []);

    const { register, handleSubmit, control, watch, setValue, formState: { errors } } = useForm<FormData>({
        defaultValues: {
            shiftDate: new Date().toISOString().split('T')[0],
            shiftTime: '06:00',
            floors: 'Tầng 3',
            handoverStaff: user?.name || '',
            receiverStaff: '',
            notes: []
        }
    });

    const { fields, append, remove } = useFieldArray({
        control,
        name: 'notes'
    });

    const onSubmit = async (data: FormData) => {
        try {
            const formattedData = {
                shiftDate: data.shiftDate,
                shiftTime: data.shiftTime,
                floorId: data.floors,
                handoverStaff: data.handoverStaff.split(',').map(s => s.trim()).filter(Boolean),
                receiverStaff: data.receiverStaff.split(',').map(s => s.trim()).filter(Boolean),
                totalResidents: residents.length,
                notes: data.notes.map(note => {
                    const resident = residents.find(r => r.id === note.residentId);
                    return {
                        residentId: note.residentId,
                        residentName: resident?.name || 'N/A',
                        content: note.content
                    };
                })
            };

            await createHandover(formattedData);
            toast.success('Đã lưu biên bản giao ca');
            onSuccess();
            onClose();
        } catch (error) {
            console.error(error);
            toast.error('Lỗi khi lưu biên bản');
        }
    };

    // Helper to add note for a resident
    const handleAddNote = (residentId: string) => {
        // Check if note already exists
        const exists = fields.some(f => f.residentId === residentId);
        if (!exists) {
            append({ residentId, content: '' });
        }
    };

    return (
        <div className="flex flex-col h-full">
            <div className="flex justify-between items-center p-6 border-b border-slate-200">
                <h2 className="text-xl font-bold text-slate-800">Tạo biên bản giao ca mới</h2>
                <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full">
                    <X className="w-5 h-5 text-slate-500" />
                </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="flex-1 overflow-y-auto p-6 space-y-6">
                {/* Meta Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">Ngày trực</label>
                        <input
                            type="date"
                            {...register('shiftDate', { required: true })}
                            className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">Ca trực</label>
                        <select
                            {...register('shiftTime')}
                            className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                        >
                            <option value="06:00">Sáng (06:00 - 14:00)</option>
                            <option value="14:00">Chiều (14:00 - 22:00)</option>
                            <option value="22:00">Tối (22:00 - 06:00)</option>
                        </select>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">Người giao (phân cách bằng dấu phẩy)</label>
                        <input
                            {...register('handoverStaff', { required: true })}
                            placeholder="Ví dụ: Y tá A, Y tá B"
                            className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">Người nhận (phân cách bằng dấu phẩy)</label>
                        <input
                            {...register('receiverStaff', { required: true })}
                            placeholder="Ví dụ: Y tá C, Y tá D"
                            className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                        />
                    </div>
                </div>

                <div className="border-t border-slate-200 pt-6">
                    <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                        <Users className="w-5 h-5 text-teal-600" />
                        Ghi chú tình trạng NCT ({fields.length})
                    </h3>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Selector Column */}
                        <div className="lg:col-span-1 border rounded-lg p-4 bg-slate-50 max-h-[400px] overflow-y-auto">
                            <p className="text-sm font-medium text-slate-500 mb-3">Chọn NCT để thêm ghi chú:</p>
                            <div className="space-y-2">
                                {residents.map(r => (
                                    <button
                                        key={r.id}
                                        type="button"
                                        onClick={() => handleAddNote(r.id)}
                                        disabled={fields.some(f => f.residentId === r.id)}
                                        className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${fields.some(f => f.residentId === r.id)
                                            ? 'bg-blue-100 text-blue-700 cursor-not-allowed'
                                            : 'bg-white hover:bg-slate-200 text-slate-700 border border-slate-200'
                                            }`}
                                    >
                                        {r.name} - P.{r.room}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Notes Inputs */}
                        <div className="lg:col-span-2 space-y-4 max-h-[400px] overflow-y-auto pr-2">
                            {fields.map((field, index) => {
                                const resident = residents.find(r => r.id === field.residentId);
                                return (
                                    <div key={field.id} className="p-4 bg-white border border-slate-200 rounded-lg shadow-sm">
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="font-bold text-slate-800">{resident?.name}</span>
                                            <button
                                                type="button"
                                                onClick={() => remove(index)}
                                                className="text-red-500 hover:text-red-700 text-sm"
                                            >
                                                Xóa
                                            </button>
                                        </div>
                                        <textarea
                                            {...register(`notes.${index}.content` as const, { required: true })}
                                            placeholder="Nhập tình trạng sức khỏe, ăn uống, ngủ nghỉ..."
                                            className="w-full p-2 border border-slate-300 rounded-md text-sm min-h-[80px]"
                                        />
                                    </div>
                                );
                            })}

                            {fields.length === 0 && (
                                <div className="text-center py-12 text-slate-400 bg-slate-50 rounded-lg border border-dashed border-slate-300">
                                    Chọn NCT từ danh sách bên trái để thêm ghi chú
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </form>

            <div className="p-6 border-t border-slate-200 flex justify-end gap-3 bg-white">
                <button
                    onClick={onClose}
                    className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50"
                >
                    Hủy
                </button>
                <button
                    onClick={handleSubmit(onSubmit)}
                    disabled={isLoading}
                    className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 flex items-center gap-2 shadow-sm disabled:opacity-50"
                >
                    <Save className="w-4 h-4" />
                    {isLoading ? 'Đang lưu...' : 'Lưu biên bản'}
                </button>
            </div>
        </div>
    );
};
