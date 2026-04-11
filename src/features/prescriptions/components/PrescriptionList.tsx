import React, { useState, useEffect } from 'react';
import { Pill, Plus, History, Calendar, Clock, User as UserIcon, AlertCircle, CheckCircle2, XCircle, FileText, ChevronDown, ChevronUp, Printer, Edit2, Copy, Pause, Play, Square } from 'lucide-react';
import { Table } from '@/src/components/ui';
import { Prescription, PrescriptionItem, Resident, User } from '../../../types/index';
import { PrescriptionForm } from './PrescriptionForm';
import { usePrescriptionsStore } from '../../../stores/prescriptionStore';
import { printDailyMedicationSheet, printPrescription } from '../utils/printTemplates';
import { MedicineManager } from './MedicineManager';

type ActiveItem = PrescriptionItem & { prescriptionCode: string; startDate: string };

const getRemainingDays = (item: PrescriptionItem): number | null => {
    if (item.continuous) return null; // infinite
    const endDate = item.endDate;
    if (!endDate) return null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const end = new Date(endDate);
    end.setHours(0, 0, 0, 0);
    return Math.ceil((end.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
};

const RemainingBadge = ({ item }: { item: PrescriptionItem }) => {
    const days = getRemainingDays(item);
    if (days === null) {
        if (item.continuous) {
            return <span className="px-1.5 py-0.5 bg-slate-100 text-slate-500 rounded text-xs">∞</span>;
        }
        return null;
    }
    if (days <= 0) {
        return <span className="px-1.5 py-0.5 bg-red-100 text-red-700 rounded text-xs font-bold border border-red-200">Đã hết</span>;
    }
    if (days <= 2) {
        return <span className="px-1.5 py-0.5 bg-amber-100 text-amber-700 rounded text-xs font-medium border border-amber-200">Còn {days} ngày</span>;
    }
    return <span className="px-1.5 py-0.5 bg-green-50 text-green-600 rounded text-xs">Còn {days} ngày</span>;
};

const StatusBadge = ({ status }: { status: string }) => {
    switch (status) {
        case 'Active':
            return <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-emerald-100 text-emerald-700">Đang dùng</span>;
        case 'Paused':
            return <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-amber-100 text-amber-700">Tạm ngưng</span>;
        case 'Completed':
            return <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-slate-200 text-slate-600">Đã hoàn thành</span>;
        case 'Cancelled':
            return <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-red-100 text-red-600">Đã hủy</span>;
        default:
            return null;
    }
};

export const PrescriptionList = ({
    user,
    resident,
    onUpdate,
    readOnly = false,
}: {
    user: User;
    resident: Resident;
    onUpdate: (r: Resident) => void;
    readOnly?: boolean;
}) => {
    const [showModal, setShowModal] = useState(false);
    const [showMedicineManager, setShowMedicineManager] = useState(false);
    const [expandedHistory, setExpandedHistory] = useState<string | null>(null);
    const [editingPrescription, setEditingPrescription] = useState<Prescription | null>(null);

    const { prescriptions, fetchPrescriptions, isLoading, pausePrescription, resumePrescription, completePrescription, duplicatePrescription } = usePrescriptionsStore();

    useEffect(() => {
        fetchPrescriptions(resident.id);
    }, [resident.id, fetchPrescriptions]);

    const residentPrescriptions = prescriptions.filter(p => p.residentId === resident.id);

    // Active = Active status only (not Paused)
    const activePrescriptions = residentPrescriptions.filter(p => p.status === 'Active');
    const pausedPrescriptions = residentPrescriptions.filter(p => p.status === 'Paused');

    // Aggregate active items (only from Active prescriptions, not Paused)
    const activeItems: ActiveItem[] = [];
    activePrescriptions.forEach(p => {
        if (p.items) {
            p.items.forEach(item => {
                activeItems.push({
                    ...item,
                    prescriptionCode: p.code,
                    startDate: item.startDate || p.startDate,
                });
            });
        }
    });

    // Sort: expired/near-end items first
    activeItems.sort((a, b) => {
        const daysA = getRemainingDays(a);
        const daysB = getRemainingDays(b);
        // null (continuous) goes to end
        const scoreA = daysA === null ? 999 : daysA;
        const scoreB = daysB === null ? 999 : daysB;
        return scoreA - scoreB;
    });

    // History
    const historyPrescriptions = residentPrescriptions
        .filter(p => p.status === 'Completed' || p.status === 'Cancelled')
        .sort((a, b) => new Date(b.prescriptionDate).getTime() - new Date(a.prescriptionDate).getTime());

    const handleCreateSuccess = () => {
        setShowModal(false);
        setEditingPrescription(null);
        fetchPrescriptions(resident.id);
    };

    const handleOpenCreate = () => {
        setEditingPrescription(null);
        setShowModal(true);
    };

    const handleOpenEdit = (prescription: Prescription) => {
        setEditingPrescription(prescription);
        setShowModal(true);
    };

    const handleDuplicate = async (prescription: Prescription) => {
        const duplicated = await duplicatePrescription(prescription.id);
        if (duplicated) {
            // Open the duplicated prescription for editing
            setEditingPrescription(duplicated);
            setShowModal(true);
        }
    };

    const handlePause = async (id: string) => {
        await pausePrescription(id);
    };

    const handleResume = async (id: string) => {
        await resumePrescription(id);
    };

    const handleComplete = async (id: string) => {
        if (confirm('Bạn có chắc muốn kết thúc đơn thuốc này?')) {
            await completePrescription(id);
        }
    };

    const toggleHistory = (id: string) => {
        setExpandedHistory(expandedHistory === id ? null : id);
    };

    const isDoctor = !readOnly && ['DOCTOR', 'ADMIN', 'SUPERVISOR'].includes(user.role);

    if (isLoading && prescriptions.length === 0) {
        return <div className="p-8 text-center text-slate-400">Đang tải dữ liệu...</div>;
    }

    const renderPrescriptionCard = (p: Prescription, showActions: boolean) => (
        <div key={p.id} className={`bg-white border rounded-xl overflow-hidden hover:shadow-md transition-shadow ${p.status === 'Paused' ? 'border-amber-200 bg-amber-50/30' : 'border-slate-200'}`}>
            <div className="p-4 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div className="space-y-2 flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-slate-800">{p.code}</span>
                        <StatusBadge status={p.status} />
                    </div>
                    <div className="text-sm text-slate-500 flex flex-wrap items-center gap-3">
                        <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {p.prescriptionDate}</span>
                        <span className="flex items-center gap-1"><UserIcon className="w-3 h-3" /> BS. {p.doctorName || 'Unknown'}</span>
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {p.startDate}{p.endDate ? ` → ${p.endDate}` : ''}</span>
                    </div>
                    <div className="text-sm text-slate-700">
                        <span className="font-medium">Chẩn đoán:</span> {p.diagnosis}
                    </div>
                    {p.notes && (
                        <div className="text-sm text-slate-600 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2 inline-flex items-start gap-2">
                            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
                            <span>{p.notes}</span>
                        </div>
                    )}
                </div>

                {showActions && (
                    <div className="flex flex-col sm:items-end gap-2 sm:min-w-[180px]">
                        {isDoctor && (
                            <div className="flex flex-wrap gap-2">
                                <button
                                    onClick={() => handleOpenEdit(p)}
                                    className="flex items-center gap-1.5 bg-white text-slate-700 border border-slate-200 px-3 py-1.5 rounded-lg hover:bg-slate-50 shadow-sm transition-all font-medium text-sm whitespace-nowrap"
                                >
                                    <Edit2 className="w-3.5 h-3.5" /> Điều chỉnh
                                </button>
                                <button
                                    onClick={() => handleDuplicate(p)}
                                    className="flex items-center gap-1.5 bg-white text-blue-700 border border-blue-200 px-3 py-1.5 rounded-lg hover:bg-blue-50 shadow-sm transition-all font-medium text-sm whitespace-nowrap"
                                    title="Nhân bản đơn"
                                >
                                    <Copy className="w-3.5 h-3.5" /> Nhân bản
                                </button>
                            </div>
                        )}
                        {isDoctor && (
                            <div className="flex flex-wrap gap-2">
                                {p.status === 'Active' && (
                                    <button
                                        onClick={() => handlePause(p.id)}
                                        className="flex items-center gap-1.5 bg-white text-amber-700 border border-amber-200 px-3 py-1.5 rounded-lg hover:bg-amber-50 shadow-sm transition-all font-medium text-sm whitespace-nowrap"
                                    >
                                        <Pause className="w-3.5 h-3.5" /> Tạm ngưng
                                    </button>
                                )}
                                {p.status === 'Paused' && (
                                    <button
                                        onClick={() => handleResume(p.id)}
                                        className="flex items-center gap-1.5 bg-white text-emerald-700 border border-emerald-200 px-3 py-1.5 rounded-lg hover:bg-emerald-50 shadow-sm transition-all font-medium text-sm whitespace-nowrap"
                                    >
                                        <Play className="w-3.5 h-3.5" /> Tiếp tục
                                    </button>
                                )}
                                <button
                                    onClick={() => handleComplete(p.id)}
                                    className="flex items-center gap-1.5 bg-white text-slate-500 border border-slate-200 px-3 py-1.5 rounded-lg hover:bg-slate-50 shadow-sm transition-all font-medium text-sm whitespace-nowrap"
                                >
                                    <Square className="w-3.5 h-3.5" /> Kết thúc
                                </button>
                            </div>
                        )}
                        <button
                            onClick={() => printPrescription(p, resident)}
                            className="flex items-center justify-center gap-1.5 bg-white text-teal-700 border border-teal-200 px-3 py-1.5 rounded-lg hover:bg-teal-50 shadow-sm transition-all font-medium text-sm whitespace-nowrap"
                        >
                            <Printer className="w-3.5 h-3.5" /> In đơn thuốc
                        </button>
                        <div className="text-xs text-slate-500">
                            {p.items?.length || 0} loại thuốc
                        </div>
                    </div>
                )}
            </div>
        </div>
    );

    return (
        <div className="space-y-8">
            {showModal && (
                <PrescriptionForm
                    user={user}
                    resident={resident}
                    editingPrescription={editingPrescription}
                    onClose={() => { setShowModal(false); setEditingPrescription(null); }}
                    onSave={handleCreateSuccess}
                />
            )}

            {showMedicineManager && (
                <MedicineManager onClose={() => setShowMedicineManager(false)} />
            )}

            {/* SECTION A: CURRENT MEDICATIONS (Aggregated) */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-4 bg-teal-50 border-b border-teal-100">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                        <div>
                            <h3 className="font-bold text-teal-800 text-lg flex items-center gap-2">
                                <Pill className="w-5 h-5" /> Thuốc đang dùng
                                <span aria-hidden="true" className="bg-teal-200 text-teal-800 text-xs px-2 py-0.5 rounded-full font-bold">
                                    {activeItems.length}
                                </span>
                            </h3>
                            <p className="text-sm text-teal-600 mt-0.5 hidden sm:block">Danh sách thuốc cần dùng hàng ngày</p>
                        </div>
                        <div className="flex gap-2 w-full sm:w-auto overflow-x-auto hide-scrollbar">
                            <button
                                onClick={() => setShowMedicineManager(true)}
                                className="flex items-center gap-2 bg-white text-slate-700 border border-slate-200 px-3 py-2 rounded-lg hover:bg-slate-50 shadow-sm transition-all font-medium text-sm whitespace-nowrap shrink-0"
                            >
                                <Pill className="w-4 h-4" /> <span className="hidden sm:inline">Danh mục</span><span className="sm:hidden">DM</span>
                            </button>
                            <button
                                onClick={() => printDailyMedicationSheet(resident, activeItems)}
                                aria-label="In tổng hợp thuốc đang dùng"
                                className="flex items-center gap-2 bg-white text-teal-700 border border-teal-200 px-3 py-2 rounded-lg hover:bg-teal-50 shadow-sm transition-all font-medium text-sm whitespace-nowrap shrink-0"
                            >
                                <Printer className="w-4 h-4" /> In phiếu
                            </button>
                            {isDoctor && (
                                <button
                                    onClick={handleOpenCreate}
                                    className="flex items-center gap-2 bg-teal-600 text-white px-3 py-2 rounded-lg hover:bg-teal-700 shadow-sm transition-all font-medium text-sm whitespace-nowrap shrink-0"
                                >
                                    <Plus className="w-4 h-4" /> Kê đơn mới
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {activeItems.length > 0 ? (
                    <Table
                        data={activeItems}
                        columns={[
                            {
                                header: 'Tên thuốc',
                                accessor: (item) => (
                                    <div>
                                        <div className="font-semibold text-slate-800">{item.medicineName}</div>
                                        {item.instructions && (
                                            <div className="text-xs font-normal text-slate-500 italic mt-0.5">
                                                Lưu ý: {item.instructions}
                                            </div>
                                        )}
                                    </div>
                                ),
                                mobilePrimary: true
                            },
                            {
                                header: 'Liều lượng',
                                accessor: 'dosage',
                                mobileLabel: 'Liều'
                            },
                            {
                                header: 'Cách dùng',
                                accessor: 'frequency',
                                mobileLabel: 'Tần suất'
                            },
                            {
                                header: 'Thời điểm',
                                accessor: (item) => (
                                    <div className="flex gap-1 flex-wrap">
                                        {item.timesOfDay?.map(t => (
                                            <span key={t} className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-xs border border-blue-100">
                                                {t}
                                            </span>
                                        ))}
                                    </div>
                                ),
                                mobileLabel: 'Giờ dùng'
                            },
                            {
                                header: 'Còn lại',
                                accessor: (item) => <RemainingBadge item={item} />,
                                mobileLabel: 'Thời hạn'
                            },
                            {
                                header: 'Từ đơn',
                                accessor: (item) => (
                                    <div className="flex flex-col">
                                        <span className="font-medium text-teal-600">{item.prescriptionCode}</span>
                                        <span className="text-xs">BĐ: {item.startDate}</span>
                                    </div>
                                ),
                                mobileLabel: 'Đơn thuốc',
                                mobileHidden: true
                            }
                        ]}
                        mobileCardView={true}
                    />
                ) : (
                    <div className="p-8 text-center text-slate-400">
                        <CheckCircle2 className="w-10 h-10 mx-auto mb-2 opacity-50" />
                        <p>Hiện tại không có thuốc nào đang dùng</p>
                    </div>
                )}
            </div>

            {/* SECTION B: ACTIVE + PAUSED PRESCRIPTIONS */}
            <div className="space-y-4">
                <h3 className="font-bold text-slate-700 flex items-center gap-2 px-1">
                    <FileText className="w-5 h-5" /> Đơn thuốc đang hiệu lực
                    {pausedPrescriptions.length > 0 && (
                        <span className="text-xs text-amber-600 font-normal">({pausedPrescriptions.length} tạm ngưng)</span>
                    )}
                </h3>

                {(activePrescriptions.length > 0 || pausedPrescriptions.length > 0) ? (
                    <div className="grid gap-4">
                        {activePrescriptions.map(p => renderPrescriptionCard(p, true))}
                        {pausedPrescriptions.map(p => renderPrescriptionCard(p, true))}
                    </div>
                ) : (
                    <div className="text-center py-6 text-slate-400 italic bg-slate-50 rounded-lg border border-dashed border-slate-200">
                        Chưa có đơn thuốc đang hiệu lực
                    </div>
                )}
            </div>

            {/* SECTION C: HISTORY */}
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
                                                <StatusBadge status={p.status} />
                                            </div>
                                            <div className="text-sm text-slate-500 mt-0.5 flex items-center gap-3">
                                                <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {p.prescriptionDate}</span>
                                                <span className="flex items-center gap-1"><UserIcon className="w-3 h-3" /> BS. {p.doctorName || 'Unknown'}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        {isDoctor && (
                                            <button
                                                onClick={(e) => { e.stopPropagation(); handleDuplicate(p); }}
                                                className="p-2 text-blue-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                                                title="Nhân bản đơn thuốc"
                                            >
                                                <Copy className="w-4 h-4" />
                                            </button>
                                        )}
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
                                        {/* Desktop Table */}
                                        <table className="hidden sm:table w-full text-sm">
                                            <thead className="bg-slate-50 text-slate-500">
                                                <tr>
                                                    <th className="px-3 py-2 text-left">Thuốc</th>
                                                    <th className="px-3 py-2 text-left">Liều dùng</th>
                                                    <th className="px-3 py-2 text-left">Thời điểm</th>
                                                    <th className="px-3 py-2 text-left">Số lượng</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100">
                                                {p.items?.map((item, idx) => (
                                                    <tr key={idx}>
                                                        <td className="px-3 py-2 font-medium">{item.medicineName}</td>
                                                        <td className="px-3 py-2 text-slate-600">{item.dosage} - {item.frequency}</td>
                                                        <td className="px-3 py-2 text-slate-600">
                                                            <div className="flex gap-1 flex-wrap">
                                                                {item.timesOfDay?.map(t => (
                                                                    <span key={t} className="px-1.5 py-0.5 bg-blue-50 text-blue-700 rounded text-xs">{t}</span>
                                                                ))}
                                                            </div>
                                                        </td>
                                                        <td className="px-3 py-2 text-slate-600">{item.quantity}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                        {/* Mobile Card View */}
                                        <div className="sm:hidden space-y-2">
                                            {p.items?.map((item, idx) => (
                                                <div key={idx} className="bg-slate-50 p-3 rounded-lg">
                                                    <p className="font-medium text-slate-800">{item.medicineName}</p>
                                                    <div className="flex justify-between text-sm text-slate-600 mt-1">
                                                        <span>{item.dosage} - {item.frequency}</span>
                                                        <span className="font-medium">SL: {item.quantity}</span>
                                                    </div>
                                                    <div className="flex gap-1 mt-1">
                                                        {item.timesOfDay?.map(t => (
                                                            <span key={t} className="px-1.5 py-0.5 bg-blue-50 text-blue-700 rounded text-xs">{t}</span>
                                                        ))}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
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
