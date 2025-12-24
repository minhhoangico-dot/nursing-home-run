import React, { useState, useEffect } from 'react';
import { useShiftHandoverStore } from '@/src/stores/shiftHandoverStore';
import { useResidentsStore } from '@/src/stores/residentsStore';
import { useAuthStore } from '@/src/stores/authStore';
import { ClipboardList, Plus, Printer, Save } from 'lucide-react';
import { LoadingScreen } from '@/src/components/ui';
import { ShiftHandoverForm } from '../components/ShiftHandoverForm';

export const ShiftHandoverPage = () => {
    const { handovers, isLoading, fetchHandovers, createHandover } = useShiftHandoverStore();
    const { residents } = useResidentsStore();
    const { user } = useAuthStore();
    const [showForm, setShowForm] = useState(false);

    useEffect(() => {
        fetchHandovers();
    }, []);

    if (isLoading && !handovers.length) return <LoadingScreen />;

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-slate-200">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-teal-100 text-teal-600 rounded-lg">
                        <ClipboardList className="w-6 h-6" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-slate-800">Giao ca trực</h1>
                        <p className="text-sm text-slate-500">Quản lý biên bản giao ca hàng ngày</p>
                    </div>
                </div>
                <div className="flex gap-3">
                    <button className="flex items-center gap-2 px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 text-slate-600">
                        <Printer className="w-4 h-4" /> In biên bản
                    </button>
                    <button
                        onClick={() => setShowForm(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 shadow-sm"
                    >
                        <Plus className="w-4 h-4" /> Tạo giao ca mới
                    </button>
                </div>
            </div>

            <div className="grid gap-6">
                {handovers.map(h => (
                    <div key={h.id} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="font-bold text-lg text-slate-800">Ca {h.shiftTime} - Ngày {new Date(h.shiftDate).toLocaleDateString('vi-VN')}</h3>
                                <p className="text-sm text-slate-500 mt-1">Người giao: {h.handoverStaff.join(', ')}</p>
                                <p className="text-sm text-slate-500">Người nhận: {h.receiverStaff.join(', ')}</p>
                            </div>
                            <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-bold">
                                {h.totalResidents} NCT
                            </span>
                        </div>

                        <div className="space-y-3">
                            {(h.notes || []).map((note: any) => (
                                <div key={note.id} className="p-3 bg-yellow-50 text-yellow-800 rounded-lg text-sm border border-yellow-100">
                                    <span className="font-bold">{note.residentName}:</span> {note.content}
                                </div>
                            ))}
                            {(!h.notes || h.notes.length === 0) && (
                                <p className="text-sm text-slate-400 italic">Không có ghi chú đặc biệt</p>
                            )}
                        </div>
                    </div>
                ))}

                {handovers.length === 0 && (
                    <div className="text-center py-12 bg-white rounded-xl border border-dashed border-slate-300">
                        <p className="text-slate-500">Chưa có biên bản giao ca nào</p>
                    </div>
                )}
            </div>

            {showForm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
                        <ShiftHandoverForm
                            onClose={() => setShowForm(false)}
                            onSuccess={() => fetchHandovers()} // Refresh list
                        />
                    </div>
                </div>
            )}
        </div>
    );
};
