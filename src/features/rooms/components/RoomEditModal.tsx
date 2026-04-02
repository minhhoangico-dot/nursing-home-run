import React from 'react';
import { useForm } from 'react-hook-form';
import { Save, Trash2, X } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { Room } from '@/src/types/room';

interface RoomEditModalProps {
    roomNumber: string;
    bedCount: number;
    roomType: Room['type'];
    readOnly?: boolean;
    onClose: () => void;
    onSave: (data: { roomNumber: string; bedCount: number; roomType: Room['type'] }) => void;
    onDelete?: () => void;
}

export const RoomEditModal = ({ roomNumber, bedCount, roomType, readOnly = false, onClose, onSave, onDelete }: RoomEditModalProps) => {
    const { register, handleSubmit, formState: { errors } } = useForm({
        defaultValues: {
            roomNumber,
            bedCount,
            roomType
        }
    });

    const onSubmit = (data: any) => {
        if (readOnly) {
            onClose();
            return;
        }

        onSave(data);
        onClose();
        toast.success(`Đã cập nhật phòng ${data.roomNumber}`);
    };

    const handleDelete = () => {
        if (readOnly) {
            onClose();
            return;
        }

        if (confirm('Bạn có chắc muốn xóa phòng này không?')) {
            onDelete?.();
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden">
                <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                    <h3 className="font-bold text-lg text-slate-800">Điều chỉnh phòng {roomNumber}</h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Số phòng</label>
                        <input
                            {...register('roomNumber', { required: 'Vui lòng nhập số phòng' })}
                            disabled={readOnly}
                            className={`w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                                readOnly ? 'bg-slate-50 text-slate-500 cursor-not-allowed' : ''
                            }`}
                            placeholder="VD: 101, 201A..."
                        />
                        {errors.roomNumber && <span className="text-red-500 text-xs">{errors.roomNumber.message as string}</span>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Số giường</label>
                        <input
                            type="number"
                            {...register('bedCount', { required: true, min: 1, max: 10 })}
                            disabled={readOnly}
                            className={`w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                                readOnly ? 'bg-slate-50 text-slate-500 cursor-not-allowed' : ''
                            }`}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Loại phòng</label>
                        <select
                            {...register('roomType')}
                            disabled={readOnly}
                            className={`w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                                readOnly ? 'bg-slate-50 text-slate-500 cursor-not-allowed' : ''
                            }`}
                        >
                            <option value="1 Giường">1 Giường</option>
                            <option value="2 Giường">2 Giường</option>
                            <option value="3 Giường">3 Giường</option>
                            <option value="4 Giường">4 Giường</option>
                            <option value="5 Giường">5 Giường</option>
                            <option value="7 Giường">7 Giường</option>
                            <option value="8 Giường">8 Giường</option>
                            <option value="9 Giường">9 Giường</option>
                        </select>
                    </div>

                    <div className="flex gap-3 pt-4">
                        {onDelete && !readOnly && (
                            <button
                                type="button"
                                onClick={handleDelete}
                                className="px-4 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 font-medium flex items-center gap-2"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        )}
                        {!readOnly && (
                            <button
                                type="submit"
                                className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium flex items-center justify-center gap-2"
                            >
                                <Save className="w-4 h-4" /> Lưu thay đổi
                            </button>
                        )}
                    </div>
                </form>
            </div>
        </div>
    );
};
