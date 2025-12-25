import React, { useEffect, useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { useShiftHandoverStore } from '@/src/stores/shiftHandoverStore';
import { useResidentsStore } from '@/src/stores/residentsStore';
import { useAuthStore } from '@/src/stores/authStore';
import { X, Save, Users, Calendar } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { Resident } from '@/src/types/resident';

interface ShiftHandoverFormProps {
    onClose: () => void;
    onSuccess: () => void;
}

interface ResidentStatusUpdate {
    residentId: string;
    name: string;
    room: string;
    locationStatus: 'Present' | 'Home' | 'Hospital';
    absentStartDate?: string;
    note: string;
}

interface FormData {
    shiftDate: string;
    shiftTime: string;
    floors: string;
    handoverStaff: string;
    receiverStaff: string;
    residentUpdates: ResidentStatusUpdate[];
}

export const ShiftHandoverForm = ({ onClose, onSuccess }: ShiftHandoverFormProps) => {
    const { createHandover, isLoading } = useShiftHandoverStore();
    const { residents, fetchResidents, updateResident } = useResidentsStore();
    const { user } = useAuthStore();

    // Initialize form with default values
    const { register, handleSubmit, control, setValue, watch, reset } = useForm<FormData>({
        defaultValues: {
            shiftDate: new Date().toISOString().split('T')[0],
            shiftTime: '06:00',
            floors: 'Tầng 3',
            handoverStaff: user?.name || '',
            receiverStaff: '',
            residentUpdates: []
        }
    });

    const { fields, replace } = useFieldArray({
        control,
        name: 'residentUpdates'
    });

    // Load residents and populate form
    useEffect(() => {
        const load = async () => {
            if (residents.length === 0) await fetchResidents();
        };
        load();
    }, []);

    // Keep form synced with residents list structure
    useEffect(() => {
        if (residents.length > 0 && fields.length === 0) {
            const updates = residents.map(r => ({
                residentId: r.id,
                name: r.name,
                room: r.room,
                locationStatus: r.locationStatus || 'Present',
                absentStartDate: r.absentStartDate,
                note: ''
            }));
            replace(updates);
        }
    }, [residents, replace, fields.length]);

    // Calculate days absent
    const getDaysAbsent = (startDate?: string) => {
        if (!startDate) return 0;
        const start = new Date(startDate);
        const now = new Date();
        const diffTime = Math.abs(now.getTime() - start.getTime());
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    };

    const handleStatusChange = (index: number, newStatus: 'Present' | 'Home' | 'Hospital') => {
        const currentUpdate = fields[index];
        let newStartDate = currentUpdate.absentStartDate;

        if (newStatus === 'Present') {
            newStartDate = undefined; // Clear if back
        } else if (currentUpdate.locationStatus === 'Present' && newStatus !== 'Present') {
            // Check if just starting absence
            newStartDate = new Date().toISOString();
        }

        setValue(`residentUpdates.${index}.locationStatus`, newStatus);
        setValue(`residentUpdates.${index}.absentStartDate`, newStartDate);
    };

    const onSubmit = async (data: FormData) => {
        try {
            // 1. Update Residents Status Logic
            const updatePromises = data.residentUpdates.map(async (update) => {
                const resident = residents.find(r => r.id === update.residentId);
                if (resident && (resident.locationStatus !== update.locationStatus || resident.absentStartDate !== update.absentStartDate)) {
                    await updateResident({
                        ...resident,
                        locationStatus: update.locationStatus,
                        absentStartDate: update.absentStartDate,
                        // Ensure we strictly preserve or clear absentStartDate as logic dictates
                    });
                }
            });
            await Promise.all(updatePromises);

            // 2. Prepare Handover Notes
            // Filter only interesting updates (notes OR status is not Present)
            // But user might want ALL residents listed? Usually handovers highlight issues.
            // The requirement is "review status table". The report saves "NOTES".
            // We will save meaningful notes.

            const notesToSave = data.residentUpdates
                .filter(u => u.note.trim() !== '' || u.locationStatus !== 'Present')
                .map(u => {
                    let contentPrefix = '';
                    if (u.locationStatus !== 'Present') {
                        const days = getDaysAbsent(u.absentStartDate);
                        const statusText = u.locationStatus === 'Home' ? 'Về nhà' : 'Đi viện';
                        contentPrefix = `[${statusText} - ${days} ngày] `;
                    }

                    return {
                        residentId: u.residentId,
                        residentName: u.name,
                        content: contentPrefix + u.note
                    };
                });

            const formattedHandover = {
                shiftDate: data.shiftDate,
                shiftTime: data.shiftTime,
                floorId: data.floors,
                handoverStaff: data.handoverStaff.split(',').map(s => s.trim()).filter(Boolean),
                receiverStaff: data.receiverStaff.split(',').map(s => s.trim()).filter(Boolean),
                totalResidents: residents.length,
                notes: notesToSave
            };

            await createHandover(formattedHandover);
            toast.success('Đã lưu biên bản và cập nhật trạng thái NCT');
            onSuccess();
            onClose();
        } catch (error) {
            console.error(error);
            toast.error('Lỗi khi lưu biên bản');
        }
    };

    return (
        <div className="flex flex-col h-full bg-slate-50">
            <div className="flex justify-between items-center p-6 border-b border-slate-200 bg-white shadow-sm">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-teal-100 rounded-lg">
                        <Calendar className="w-6 h-6 text-teal-600" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-slate-800">Giao Ban & Điểm Danh</h2>
                        <p className="text-sm text-slate-500">Cập nhật trạng thái và ghi chú giao ca</p>
                    </div>
                </div>
                <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                    <X className="w-5 h-5 text-slate-500" />
                </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="flex-1 overflow-y-auto p-6 space-y-6">
                {/* Meta Info Card */}
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-500 uppercase">Ngày trực</label>
                        <input type="date" {...register('shiftDate', { required: true })} className="w-full p-2 border border-slate-200 rounded-lg text-sm font-medium" />
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-500 uppercase">Ca trực</label>
                        <select {...register('shiftTime')} className="w-full p-2 border border-slate-200 rounded-lg text-sm font-medium">
                            <option value="06:00">Sáng (06:00 - 14:00)</option>
                            <option value="14:00">Chiều (14:00 - 22:00)</option>
                            <option value="22:00">Tối (22:00 - 06:00)</option>
                        </select>
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-500 uppercase">Người giao</label>
                        <input {...register('handoverStaff', { required: true })} className="w-full p-2 border border-slate-200 rounded-lg text-sm font-medium" placeholder="Tên người giao..." />
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-500 uppercase">Người nhận</label>
                        <input {...register('receiverStaff', { required: true })} className="w-full p-2 border border-slate-200 rounded-lg text-sm font-medium" placeholder="Tên người nhận..." />
                    </div>
                </div>

                {/* Resident Status Table */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center gap-2">
                        <Users className="w-5 h-5 text-slate-600" />
                        <h3 className="font-bold text-slate-800">Bảng Tình Trạng NCT ({fields.length})</h3>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-slate-500 uppercase bg-slate-50/50 border-b border-slate-200">
                                <tr>
                                    <th className="px-4 py-3 font-semibold text-center w-12">P</th>
                                    <th className="px-4 py-3 font-semibold">Họ tên</th>
                                    <th className="px-4 py-3 font-semibold w-40">Hiện trạng</th>
                                    <th className="px-4 py-3 font-semibold w-32">Vắng (Ngày)</th>
                                    <th className="px-4 py-3 font-semibold">Ghi chú giao ban</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {fields.map((field, index) => {
                                    const status = watch(`residentUpdates.${index}.locationStatus`);
                                    const startDate = watch(`residentUpdates.${index}.absentStartDate`);
                                    const isAbsent = status !== 'Present';

                                    return (
                                        <tr key={field.id} className="hover:bg-slate-50/80 transition-colors">
                                            <td className="px-4 py-3 text-center font-medium text-slate-600">
                                                {field.room}
                                            </td>
                                            <td className="px-4 py-3 font-medium text-slate-900">
                                                {field.name}
                                            </td>
                                            <td className="px-4 py-3">
                                                <select
                                                    {...register(`residentUpdates.${index}.locationStatus`)}
                                                    onChange={(e) => handleStatusChange(index, e.target.value as any)}
                                                    className={`w-full p-1.5 rounded-md border text-xs font-semibold focus:ring-2 focus:ring-teal-500 outline-none
                                                        ${status === 'Present' ? 'bg-green-50 text-green-700 border-green-200' :
                                                            status === 'Home' ? 'bg-orange-50 text-orange-700 border-orange-200' :
                                                                'bg-red-50 text-red-700 border-red-200'}`}
                                                >
                                                    <option value="Present">Tại viện</option>
                                                    <option value="Home">Về nhà</option>
                                                    <option value="Hospital">Đi viện</option>
                                                </select>
                                            </td>
                                            <td className="px-4 py-3">
                                                {isAbsent && startDate && (
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-bold text-slate-700">{getDaysAbsent(startDate)}</span>
                                                        <span className="text-xs text-slate-400">ngày</span>
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-4 py-3">
                                                <input
                                                    {...register(`residentUpdates.${index}.note`)}
                                                    placeholder="Nhập ghi chú..."
                                                    className="w-full p-1.5 border border-slate-200 rounded-md focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none transition-all"
                                                />
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            </form>

            <div className="p-4 border-t border-slate-200 bg-white flex justify-end gap-3 z-10">
                <button
                    onClick={onClose}
                    className="px-5 py-2.5 border border-slate-300 rounded-lg text-slate-700 font-medium hover:bg-slate-50 transition-colors"
                >
                    Hủy bỏ
                </button>
                <button
                    onClick={handleSubmit(onSubmit)}
                    disabled={isLoading}
                    className="px-5 py-2.5 bg-teal-600 text-white rounded-lg font-medium hover:bg-teal-700 flex items-center gap-2 shadow-lg shadow-teal-600/20 disabled:opacity-50 disabled:shadow-none transition-all"
                >
                    <Save className="w-4 h-4" />
                    {isLoading ? 'Đang lưu...' : 'Lưu Biên Bản'}
                </button>
            </div>
        </div>
    );
};
