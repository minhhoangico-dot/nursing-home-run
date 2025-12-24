import React, { useState, useEffect } from 'react';
import { useDiabetesStore } from '@/src/stores/diabetesStore';
import { useResidentsStore } from '@/src/stores/residentsStore';
import { Droplets, Search, Plus } from 'lucide-react';
import { LoadingScreen } from '@/src/components/ui';
import { BloodSugarChart } from '../components/BloodSugarChart';
import { BloodSugarForm } from '../components/BloodSugarForm';

export const DiabetesMonitoringPage = () => {
    const { fetchRecords, records, isLoading } = useDiabetesStore();
    const { residents, fetchResidents } = useResidentsStore();
    const [selectedResidentId, setSelectedResidentId] = useState<string>('');
    const [showForm, setShowForm] = useState(false);

    // Filter diabetic residents
    const diabeticResidents = residents.filter(r => r.isDiabetic);

    useEffect(() => {
        fetchResidents();
    }, []);

    useEffect(() => {
        if (diabeticResidents.length > 0 && !selectedResidentId) {
            setSelectedResidentId(diabeticResidents[0].id);
        }
    }, [residents]); // Re-run when residents load

    useEffect(() => {
        if (selectedResidentId) {
            fetchRecords(selectedResidentId);
        }
    }, [selectedResidentId]);

    const selectedResident = residents.find(r => r.id === selectedResidentId);

    if (isLoading && !records.length && !selectedResidentId) return <LoadingScreen />;

    return (
        <div className="p-6 max-w-7xl mx-auto h-[calc(100vh-80px)] flex gap-6">
            {/* Sidebar List */}
            <div className="w-80 bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col h-full">
                <div className="p-4 border-b border-slate-100 bg-purple-50 rounded-t-xl">
                    <h2 className="font-bold text-purple-800 flex items-center gap-2">
                        <Droplets className="w-5 h-5" />
                        NCT Tiểu Đường ({diabeticResidents.length})
                    </h2>
                </div>
                <div className="flex-1 overflow-y-auto p-2 space-y-1">
                    {diabeticResidents.map(r => (
                        <div
                            key={r.id}
                            onClick={() => setSelectedResidentId(r.id)}
                            className={`p-3 rounded-lg cursor-pointer transition-colors border ${selectedResidentId === r.id ? 'bg-purple-50 border-purple-200 shadow-sm' : 'hover:bg-slate-50 border-transparent'}`}
                        >
                            <p className={`font-bold text-sm ${selectedResidentId === r.id ? 'text-purple-700' : 'text-slate-700'}`}>{r.name}</p>
                            <p className="text-xs text-slate-500">Phòng {r.room}</p>
                        </div>
                    ))}
                    {diabeticResidents.length === 0 && (
                        <div className="p-8 text-center text-slate-500 text-sm">Chưa có NCT nào được đánh dấu tiểu đường</div>
                    )}
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col h-full overflow-hidden">
                {selectedResident ? (
                    <>
                        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-white z-10">
                            <div>
                                <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                    {selectedResident.name}
                                    <span className="text-xs font-normal text-slate-500 px-2 py-0.5 bg-slate-100 rounded-full">Phòng {selectedResident.room}</span>
                                </h2>
                                <p className="text-xs text-slate-400">Lịch sử đo đường huyết</p>
                            </div>
                            <button
                                onClick={() => setShowForm(true)}
                                className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm font-medium shadow-sm transition-all"
                            >
                                <Plus className="w-4 h-4" /> Nhập chỉ số mới
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 space-y-6">
                            {/* Chart Section */}
                            {records.length > 0 && (
                                <BloodSugarChart data={records} />
                            )}

                            {/* Table Section */}
                            <div className="border rounded-xl overflow-hidden shadow-sm">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-slate-50 text-slate-600 font-medium">
                                        <tr>
                                            <th className="p-3 border-b">Ngày</th>
                                            <th className="p-3 border-b">Sáng (T/S)</th>
                                            <th className="p-3 border-b">Trưa (T/S)</th>
                                            <th className="p-3 border-b">Tối (T/S)</th>
                                            <th className="p-3 border-b">Insulin</th>
                                            <th className="p-3 border-b">Ghi chú</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {records.map(r => (
                                            <tr key={r.id} className="hover:bg-slate-50 group">
                                                <td className="p-3 font-medium text-slate-700">{new Date(r.recordDate).toLocaleDateString('vi-VN')}</td>
                                                <td className="p-3">
                                                    <span className={r.morningBeforeMeal && (r.morningBeforeMeal < 4 || r.morningBeforeMeal > 7.5) ? 'text-red-600 font-bold' : ''}>{r.morningBeforeMeal || '-'}</span>
                                                    <span className="text-slate-300 mx-1">/</span>
                                                    <span className={r.morningAfterMeal && r.morningAfterMeal > 10 ? 'text-red-600 font-bold' : ''}>{r.morningAfterMeal || '-'}</span>
                                                </td>
                                                <td className="p-3">{r.lunchBeforeMeal || '-'} / {r.lunchAfterMeal || '-'}</td>
                                                <td className="p-3">{r.dinnerBeforeMeal || '-'} / {r.dinnerAfterMeal || '-'}</td>
                                                <td className="p-3">
                                                    {r.insulinUnits ? (
                                                        <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded text-xs font-bold border border-purple-200">
                                                            {r.insulinUnits} đv ({r.insulinTime === 'morning' ? 'S' : r.insulinTime === 'noon' ? 'Tr' : 'T'})
                                                        </span>
                                                    ) : '-'}
                                                </td>
                                                <td className="p-3 text-slate-500 max-w-xs truncate group-hover:whitespace-normal">{r.notes}</td>
                                            </tr>
                                        ))}
                                        {records.length === 0 && (
                                            <tr>
                                                <td colSpan={6} className="p-12 text-center text-slate-400 italic bg-slate-50">
                                                    Chưa có dữ liệu đo đường huyết. Hãy nhập chỉ số đầu tiên.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-slate-400 bg-slate-50/50">
                        <Droplets className="w-16 h-16 text-slate-200 mb-4" />
                        <p>Vui lòng chọn NCT để xem chi tiết</p>
                    </div>
                )}

                {/* Modal Form */}
                {showForm && selectedResident && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <div className="w-full max-w-2xl max-h-[90vh] shadow-2xl rounded-xl overflow-hidden">
                            <BloodSugarForm
                                resident={selectedResident}
                                onClose={() => setShowForm(false)}
                                onSuccess={() => fetchRecords(selectedResidentId)}
                            />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
