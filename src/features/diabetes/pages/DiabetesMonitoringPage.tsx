import React, { useState, useEffect } from 'react';
import { useDiabetesStore } from '@/src/stores/diabetesStore';
import { useResidentsStore } from '@/src/stores/residentsStore';
import { Droplets, Search, Plus } from 'lucide-react';
import { LoadingScreen } from '@/src/components/ui';

export const DiabetesMonitoringPage = () => {
    const { fetchRecords, records, isLoading } = useDiabetesStore();
    const { residents } = useResidentsStore();
    const [selectedResidentId, setSelectedResidentId] = useState<string>('');

    // Filter diabetic residents
    const diabeticResidents = residents.filter(r => r.isDiabetic);

    useEffect(() => {
        if (diabeticResidents.length > 0 && !selectedResidentId) {
            setSelectedResidentId(diabeticResidents[0].id);
        }
    }, [residents]);

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
                <div className="p-4 border-b border-slate-100">
                    <h2 className="font-bold text-slate-800 flex items-center gap-2">
                        <Droplets className="w-5 h-5 text-purple-500" />
                        NCT Phải TD Đường Huyết
                    </h2>
                </div>
                <div className="flex-1 overflow-y-auto p-2 space-y-1">
                    {diabeticResidents.map(r => (
                        <div
                            key={r.id}
                            onClick={() => setSelectedResidentId(r.id)}
                            className={`p-3 rounded-lg cursor-pointer transition-colors ${selectedResidentId === r.id ? 'bg-purple-50 border border-purple-200' : 'hover:bg-slate-50 border border-transparent'}`}
                        >
                            <p className={`font-bold text-sm ${selectedResidentId === r.id ? 'text-purple-700' : 'text-slate-700'}`}>{r.name}</p>
                            <p className="text-xs text-slate-500">Phòng {r.room}</p>
                        </div>
                    ))}
                    {diabeticResidents.length === 0 && (
                        <div className="p-4 text-center text-slate-500 text-sm">Chưa có NCT nào được đánh dấu tiểu đường</div>
                    )}
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col h-full overflow-hidden">
                {selectedResident ? (
                    <>
                        <div className="p-4 border-b border-slate-100 flex justify-between items-center">
                            <div>
                                <h2 className="text-lg font-bold text-slate-800">{selectedResident.name}</h2>
                                <p className="text-sm text-slate-500">Lịch sử đo đường huyết</p>
                            </div>
                            <button className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm font-medium">
                                <Plus className="w-4 h-4" /> Nhập chỉ số mới
                            </button>
                        </div>
                        <div className="flex-1 overflow-auto p-4">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-slate-50 text-slate-600 font-medium">
                                    <tr>
                                        <th className="p-3 rounded-l-lg">Ngày</th>
                                        <th className="p-3">Sáng (T/S)</th>
                                        <th className="p-3">Trưa (T/S)</th>
                                        <th className="p-3">Tối (T/S)</th>
                                        <th className="p-3">Insulin</th>
                                        <th className="p-3 rounded-r-lg">Ghi chú</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {records.map(r => (
                                        <tr key={r.id} className="hover:bg-slate-50">
                                            <td className="p-3 font-medium">{new Date(r.recordDate).toLocaleDateString('vi-VN')}</td>
                                            <td className="p-3">{r.morningBeforeMeal || '-'} / {r.morningAfterMeal || '-'}</td>
                                            <td className="p-3">{r.lunchBeforeMeal || '-'} / {r.lunchAfterMeal || '-'}</td>
                                            <td className="p-3">{r.dinnerBeforeMeal || '-'} / {r.dinnerAfterMeal || '-'}</td>
                                            <td className="p-3">
                                                {r.insulinUnits ? (
                                                    <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded text-xs font-bold">
                                                        {r.insulinUnits} đơn vị ({r.insulinTime})
                                                    </span>
                                                ) : '-'}
                                            </td>
                                            <td className="p-3 text-slate-500 max-w-xs truncate">{r.notes}</td>
                                        </tr>
                                    ))}
                                    {records.length === 0 && (
                                        <tr>
                                            <td colSpan={6} className="p-8 text-center text-slate-500 italic">Chưa có dữ liệu</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex items-center justify-center text-slate-400">
                        Vui lòng chọn NCT để xem
                    </div>
                )}
            </div>
        </div>
    );
};
