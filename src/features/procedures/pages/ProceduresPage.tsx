import React, { useState, useEffect } from 'react';
import { useProceduresStore } from '@/src/stores/proceduresStore';
import { useResidentsStore } from '@/src/stores/residentsStore';
import { Syringe, Calendar, Printer, Filter } from 'lucide-react';
import { LoadingScreen } from '@/src/components/ui';
import { PROCEDURE_LABELS } from '@/src/types';
import { ProcedureGrid } from '../components/ProcedureGrid';
import { PrintProcedureForm } from '../components/PrintProcedureForm';
import { toast } from 'react-hot-toast';

export const ProceduresPage = () => {
    const { fetchAllRecords, upsertRecord, records, isLoading } = useProceduresStore();
    const { residents, fetchResidents } = useResidentsStore();

    // State
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [selectedType, setSelectedType] = useState<string>('injection'); // Default to first type

    // Derived state
    const dateObj = new Date(selectedDate);
    const month = dateObj.getMonth() + 1;
    const year = dateObj.getFullYear();

    useEffect(() => {
        fetchResidents();
    }, []);

    useEffect(() => {
        fetchAllRecords(month, year);
    }, [month, year]);

    const handleToggle = async (residentId: string, date: string, checked: boolean) => {
        if (!selectedType) return;

        try {
            await upsertRecord({
                residentId: residentId,
                recordDate: date,
                [selectedType]: checked
                // Note: We rely on Supabase to merge or we should pass other fields if needed.
                // Since we don't have the full record easily here without looking it up,
                // and we want to avoid race conditions.
                // Ideally we'd pass { ...existingRecord, [type]: checked }
                // But simplified for now:
            });
            // Refresh to show updates
            await fetchAllRecords(month, year);
            toast.success('Đã cập nhật');
        } catch (error) {
            console.error(error);
            toast.error('Lỗi khi cập nhật');
        }
    };

    const handlePrint = () => {
        window.print();
    };

    const procedureTypes = Object.entries(PROCEDURE_LABELS).map(([key, label]) => ({
        key,
        label
    }));

    if (isLoading && residents.length === 0) return <LoadingScreen />;

    return (
        <div className="p-6 max-w-full mx-auto space-y-6 h-[calc(100vh-80px)] flex flex-col">
            {/* Header */}
            <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-slate-200 shrink-0 print:hidden">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-blue-100 text-blue-600 rounded-lg">
                        <Syringe className="w-6 h-6" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-slate-800">Thủ thuật y tế</h1>
                        <p className="text-sm text-slate-500">Theo dõi thủ thuật tháng {month}/{year}</p>
                    </div>
                </div>
                <div className="flex gap-3">
                    <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-2 rounded-lg">
                        <Calendar className="w-4 h-4 text-slate-400" />
                        <input
                            type="month"
                            value={`${year}-${String(month).padStart(2, '0')}`}
                            onChange={(e) => {
                                const d = new Date(e.target.value + '-01');
                                setSelectedDate(d.toISOString().split('T')[0]);
                            }}
                            className="bg-transparent border-none outline-none text-sm text-slate-700"
                        />
                    </div>
                    <button
                        onClick={handlePrint}
                        className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-900"
                    >
                        <Printer className="w-4 h-4" /> In phiếu
                    </button>
                </div>
            </div>

            {/* Content Container */}
            <div className="flex-1 flex gap-6 min-h-0 print:hidden">
                {/* Sidebar Filter */}
                <div className="w-64 bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col overflow-hidden shrink-0">
                    <div className="p-4 border-b border-slate-100 bg-slate-50">
                        <h3 className="font-bold text-slate-700 flex items-center gap-2">
                            <Filter className="w-4 h-4" /> Loại thủ thuật
                        </h3>
                    </div>
                    <div className="flex-1 overflow-y-auto p-2 space-y-1">
                        {procedureTypes.map(t => (
                            <button
                                key={t.key}
                                onClick={() => setSelectedType(t.key)}
                                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${selectedType === t.key
                                        ? 'bg-blue-50 text-blue-700 font-medium'
                                        : 'text-slate-600 hover:bg-slate-50'
                                    }`}
                            >
                                {t.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Grid */}
                <div className="flex-1 bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col overflow-hidden">
                    <div className="p-4 border-b border-slate-100 flex justify-between items-center">
                        <h3 className="font-bold text-slate-800">
                            {selectedType ? PROCEDURE_LABELS[selectedType as keyof typeof PROCEDURE_LABELS] : 'Chọn loại thủ thuật'}
                        </h3>
                    </div>
                    <div className="flex-1 overflow-auto p-4">
                        <ProcedureGrid
                            month={month}
                            year={year}
                            residents={residents}
                            records={records}
                            selectedType={selectedType}
                            isLoading={isLoading}
                            onToggle={handleToggle}
                        />
                    </div>
                </div>
            </div>

            {/* Print Form (Hidden normally) */}
            <div className="hidden print:block fixed inset-0 bg-white z-[100]">
                <PrintProcedureForm
                    month={month}
                    year={year}
                    residents={residents}
                    data={records}
                    procedureType={selectedType || undefined}
                />
            </div>
        </div>
    );
};
