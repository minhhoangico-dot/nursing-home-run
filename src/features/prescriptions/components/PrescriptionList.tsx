import React, { useState, useEffect } from 'react';
import { Pill, Plus, History, Calendar, Clock, User as UserIcon, AlertCircle, CheckCircle2, XCircle, FileText, ChevronDown, ChevronUp, Printer } from 'lucide-react';
import { Prescription, PrescriptionItem, InventoryItem, Resident, User } from '../../../types/index';
import { PrescriptionForm } from './PrescriptionForm';
import { usePrescriptionsStore } from '../../../stores/prescriptionStore';
import { printDailyMedicationSheet, printPrescription } from '../utils/printTemplates';

export const PrescriptionList = ({ user, resident, inventory, onUpdate }: { user: User, resident: Resident, inventory: InventoryItem[], onUpdate: (r: Resident) => void }) => {
    const [showModal, setShowModal] = useState(false);
    const [expandedHistory, setExpandedHistory] = useState<string | null>(null);

    const { prescriptions, fetchPrescriptions, isLoading } = usePrescriptionsStore();

    useEffect(() => {
        fetchPrescriptions(resident.id);
    }, [resident.id, fetchPrescriptions]);

    // Filter for this resident from store
    const residentPrescriptions = prescriptions.filter(p => p.residentId === resident.id);

    // 1. Get Active Prescriptions
    const activePrescriptions = residentPrescriptions.filter(p => p.status === 'Active');

    // 2. Aggregate Active Items
    const activeItems: (PrescriptionItem & { prescriptionCode: string, startDate: string })[] = [];
    activePrescriptions.forEach(p => {
        if (p.items) {
            p.items.forEach(item => {
                activeItems.push({
                    ...item,
                    prescriptionCode: p.code,
                    startDate: p.startDate
                });
            });
        }
    });

    // 3. Get History (Completed/Cancelled)
    const historyPrescriptions = residentPrescriptions.filter(p => p.status !== 'Active').sort((a, b) => new Date(b.prescriptionDate).getTime() - new Date(a.prescriptionDate).getTime());

    const handleCreateSuccess = () => {
        setShowModal(false);
        fetchPrescriptions(resident.id); // Refresh data
    };

    const toggleHistory = (id: string) => {
        setExpandedHistory(expandedHistory === id ? null : id);
    };

    if (isLoading && prescriptions.length === 0) {
        return <div className="p-8 text-center text-slate-400">Đang tải dữ liệu...</div>;
    }

    return (
        <div className="space-y-8">
            {showModal && (
                <PrescriptionForm
                    user={user}
                    resident={resident}
                    inventory={inventory}
                    onClose={() => setShowModal(false)}
                    onSave={handleCreateSuccess}
                />
            )}

            {/* SECTION A: CURRENT MEDICATIONS (Aggregated) */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-4 bg-teal-50 border-b border-teal-100 flex justify-between items-center">
                    <div>
                        <h3 className="font-bold text-teal-800 text-lg flex items-center gap-2">
                            <Pill className="w-5 h-5" /> Thuốc đang dùng
                            <span className="bg-teal-200 text-teal-800 text-xs px-2 py-0.5 rounded-full font-bold">
                                {activeItems.length}
                            </span>
                        </h3>
                        <p className="text-sm text-teal-600 mt-0.5">Danh sách tổng hợp các thuốc cần dùng hàng ngày</p>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => printDailyMedicationSheet(resident, activeItems)}
                            className="flex items-center gap-2 bg-white text-teal-700 border border-teal-200 px-3 py-2 rounded-lg hover:bg-teal-50 shadow-sm transition-all font-medium text-sm"
                        >
                            <Printer className="w-4 h-4" /> In phiếu chia thuốc
                        </button>
                        {['DOCTOR', 'ADMIN', 'SUPERVISOR'].includes(user.role) && (
                            <button
                                onClick={() => setShowModal(true)}
                                className="flex items-center gap-2 bg-teal-600 text-white px-3 py-2 rounded-lg hover:bg-teal-700 shadow-sm transition-all font-medium text-sm"
                            >
                                <Plus className="w-4 h-4" /> Kê đơn mới
                            </button>
                        )}
                    </div>
                </div>

                {activeItems.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-slate-50 text-slate-500 font-medium">
                                <tr>
                                    <th className="px-4 py-3">Tên thuốc</th>
                                    <th className="px-4 py-3">Liều lượng</th>
                                    <th className="px-4 py-3">Cách dùng</th>
                                    <th className="px-4 py-3">Thời điểm</th>
                                    <th className="px-4 py-3">Kê từ đơn</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {activeItems.map((item, idx) => (
                                    <tr key={idx} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-4 py-3 font-semibold text-slate-800">
                                            {item.medicineName}
                                            {item.instructions && (
                                                <div className="text-xs font-normal text-slate-500 italic mt-0.5">
                                                    Lưu ý: {item.instructions}
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-slate-700">{item.dosage}</td>
                                        <td className="px-4 py-3 text-slate-700">{item.frequency}</td>
                                        <td className="px-4 py-3">
                                            <div className="flex gap-1 flex-wrap">
                                                {item.timesOfDay?.map(t => (
                                                    <span key={t} className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-xs border border-blue-100">
                                                        {t}
                                                    </span>
                                                ))}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-slate-500">
                                            <div className="flex flex-col">
                                                <span className="font-medium text-teal-600">{item.prescriptionCode}</span>
                                                <span className="text-xs">Bắt đầu: {item.startDate}</span>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="p-8 text-center text-slate-400">
                        <CheckCircle2 className="w-10 h-10 mx-auto mb-2 opacity-50" />
                        <p>Hiện tại không có thuốc nào đang dùng</p>
                    </div>
                )}
            </div>

            {/* SECTION B: HISTORY */}
            <div className="space-y-4">
                <h3 className="font-bold text-slate-700 flex items-center gap-2 px-1">
                    <History className="w-5 h-5" /> Lịch sử đơn thuốc
                </h3>

                {historyPrescriptions.length > 0 ? (
                    <div className="grid gap-4">
                        {historyPrescriptions.map(p => (
                            <div key={p.id} className="bg-white border border-slate-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow">
                                <div
                                    className="p-4 flex items-center justify-between cursor-pointer bg-slate-50/50 hover:bg-slate-50"
                                    onClick={() => toggleHistory(p.id)}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={`p-2 rounded-full ${p.status === 'Completed' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                                            <FileText className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <span className="font-bold text-slate-800">{p.code}</span>
                                                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${p.status === 'Completed' ? 'bg-slate-200 text-slate-600' : 'bg-red-100 text-red-600'
                                                    }`}>
                                                    {p.status === 'Completed' ? 'Đã hoàn thành' : 'Đã hủy'}
                                                </span>
                                            </div>
                                            <div className="text-sm text-slate-500 mt-0.5 flex items-center gap-3">
                                                <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {p.prescriptionDate}</span>
                                                <span className="flex items-center gap-1"><UserIcon className="w-3 h-3" /> BS. {p.doctorName || 'Unknown'}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <button
                                            onClick={(e) => { e.stopPropagation(); printPrescription(p, resident); }}
                                            className="p-2 text-slate-400 hover:text-teal-600 hover:bg-teal-50 rounded-full transition-colors"
                                            title="In đơn thuốc"
                                        >
                                            <Printer className="w-4 h-4" />
                                        </button>
                                        <div className="text-right hidden sm:block">
                                            <div className="text-sm font-medium text-slate-700">{p.diagnosis}</div>
                                            <div className="text-xs text-slate-500">{p.items?.length || 0} loại thuốc</div>
                                        </div>
                                        {expandedHistory === p.id ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
                                    </div>
                                </div>

                                {expandedHistory === p.id && (
                                    <div className="border-t border-slate-100 p-4 bg-white animate-in slide-in-from-top-2">
                                        <div className="mb-3 text-sm text-slate-600 italic border-l-2 border-teal-500 pl-3 py-1 bg-teal-50/30">
                                            Chẩn đoán: {p.diagnosis}
                                            {p.notes && <div>Ghi chú: {p.notes}</div>}
                                        </div>
                                        <table className="w-full text-sm">
                                            <thead className="bg-slate-50 text-slate-500">
                                                <tr>
                                                    <th className="px-3 py-2 text-left">Thuốc</th>
                                                    <th className="px-3 py-2 text-left">Liều dùng</th>
                                                    <th className="px-3 py-2 text-left">Số lượng</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100">
                                                {p.items?.map((item, idx) => (
                                                    <tr key={idx}>
                                                        <td className="px-3 py-2 font-medium">{item.medicineName}</td>
                                                        <td className="px-3 py-2 text-slate-600">{item.dosage} - {item.frequency}</td>
                                                        <td className="px-3 py-2 text-slate-600">{item.quantity}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-6 text-slate-400 italic bg-slate-50 rounded-lg border border-dashed border-slate-200">
                        Chưa có lịch sử đơn thuốc
                    </div>
                )}
            </div>
        </div>
    );
};