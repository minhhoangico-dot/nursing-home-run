import React, { useState, useEffect } from 'react';
import { useProceduresStore } from '@/src/stores/proceduresStore';
import { useResidentsStore } from '@/src/stores/residentsStore';
import { Syringe, Calendar, Printer, Filter, ChevronDown, X, Check, Plus, Minus } from 'lucide-react';
import { LoadingScreen } from '@/src/components/ui';
import { IVDripModal } from '../components/IVDripModal';
import { PROCEDURE_LABELS, ProcedureRecord, IVDripItem } from '@/src/types';
import { ProcedureGrid } from '../components/ProcedureGrid';
import { PrintProcedureForm } from '../components/PrintProcedureForm';
import { toast } from 'react-hot-toast';
import { ModuleReadOnlyBanner } from '@/src/components/ui/ModuleReadOnlyBanner';
import { useModuleReadOnly } from '@/src/routes/ModuleAccessContext';

export const ProceduresPage = () => {
    const { fetchAllRecords, upsertRecord, records, isLoading } = useProceduresStore();
    const { residents, fetchResidents } = useResidentsStore();
    const readOnly = useModuleReadOnly();

    // State
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [selectedType, setSelectedType] = useState<string>('injection');
    const [mode, setMode] = useState<'add' | 'subtract'>('add');
    const [showMobileFilter, setShowMobileFilter] = useState(false);
    const [mobileSelectedDay, setMobileSelectedDay] = useState(new Date().getDate());

    const [ivDripModal, setIvDripModal] = useState<{
        isOpen: boolean;
        residentId: string;
        residentName: string;
        date: string;
        items: IVDripItem[];
    }>({
        isOpen: false,
        residentId: '',
        residentName: '',
        date: '',
        items: []
    });

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

    const handleToggle = async (residentId: string, date: string, checked: boolean, count: number) => {
        if (readOnly || isLoading || !selectedType) return;

        try {
            await upsertRecord({
                residentId: residentId,
                recordDate: date,
                [selectedType]: checked,
                [`${selectedType}Count`]: count
            });
            await fetchAllRecords(month, year);
        } catch (error) {
            console.error(error);
            toast.error('Lỗi khi cập nhật');
        }
    };

    const handleDetailedClick = (residentId: string, date: string, record: ProcedureRecord | undefined) => {
        if (readOnly || isLoading) return;
        const resident = residents.find(r => r.id === residentId);
        setIvDripModal({
            isOpen: true,
            residentId,
            residentName: resident?.name || '',
            date,
            items: record?.ivDripDetails || []
        });
    };

    const handleSaveIVDrip = async (items: IVDripItem[]) => {
        if (readOnly || isLoading || !ivDripModal.residentId || !ivDripModal.date) return;

        const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);

        try {
            await upsertRecord({
                residentId: ivDripModal.residentId,
                recordDate: ivDripModal.date,
                ivDrip: items.length > 0,
                ivDripCount: totalQuantity,
                ivDripDetails: items
            });
            await fetchAllRecords(month, year);
            setIvDripModal(prev => ({ ...prev, isOpen: false }));
        } catch (error) {
            console.error(error);
            toast.error('Lỗi khi lưu truyền dịch');
        }
    };

    const handlePrint = () => {
        window.print();
    };

    const procedureTypes = Object.entries(PROCEDURE_LABELS).map(([key, label]) => ({
        key,
        label
    }));

    const daysInMonth = new Date(year, month, 0).getDate();

    // Mobile: toggle for a specific resident on selected day
    const handleMobileToggle = async (residentId: string, currentCount: number) => {
        if (readOnly || isLoading) return;
        const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(mobileSelectedDay).padStart(2, '0')}`;

        if (selectedType === 'ivDrip') {
            const record = records.find(r => r.residentId === residentId && r.recordDate === dateStr);
            handleDetailedClick(residentId, dateStr, record);
            return;
        }

        const newCount = mode === 'add' ? currentCount + 1 : Math.max(0, currentCount - 1);
        await handleToggle(residentId, dateStr, newCount > 0, newCount);
    };

    const getMobileRecord = (residentId: string) => {
        const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(mobileSelectedDay).padStart(2, '0')}`;
        const record = records.find(r => r.residentId === residentId && r.recordDate === dateStr);
        if (!record || !selectedType) return { checked: false, count: 0 };
        const countKey = `${selectedType}Count` as keyof typeof record;
        const count = (record as any)[countKey] as number || 0;
        const checked = (record as any)[selectedType] === true;
        return { checked, count };
    };

    if (isLoading && residents.length === 0) return <LoadingScreen />;

    return (
        <div className="h-full flex flex-col">
            {readOnly && <ModuleReadOnlyBanner />}
            {/* Header */}
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-3 bg-white p-3 md:p-4 rounded-xl shadow-sm border border-slate-200 shrink-0 print:hidden">
                <div className="flex items-center gap-3">
                    <div className="p-2 md:p-3 bg-blue-100 text-blue-600 rounded-lg">
                        <Syringe className="w-5 h-5 md:w-6 md:h-6" />
                    </div>
                    <div>
                        <h1 className="text-lg md:text-xl font-bold text-slate-800">Thủ thuật y tế</h1>
                        <p className="text-xs md:text-sm text-slate-500">Tháng {month}/{year}</p>
                    </div>
                </div>
                <div className="flex gap-2 md:gap-3">
                    <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-2 md:px-3 py-2 rounded-lg flex-1 md:flex-none">
                        <Calendar className="w-4 h-4 text-slate-400" />
                        <input
                            type="month"
                            value={`${year}-${String(month).padStart(2, '0')}`}
                            onChange={(e) => {
                                const d = new Date(e.target.value + '-01');
                                setSelectedDate(d.toISOString().split('T')[0]);
                            }}
                            className="bg-transparent border-none outline-none text-sm text-slate-700 w-full md:w-auto"
                        />
                    </div>
                    <button
                        onClick={handlePrint}
                        className="hidden md:flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-900"
                    >
                        <Printer className="w-4 h-4" /> In phiếu
                    </button>
                </div>
            </div>

            {/* Mobile: Procedure type selector */}
            <div className="md:hidden mt-3 print:hidden">
                <button
                    onClick={() => setShowMobileFilter(true)}
                    className="w-full flex items-center justify-between bg-white p-3 rounded-xl border border-slate-200 shadow-sm"
                >
                    <div className="flex items-center gap-2">
                        <Filter className="w-4 h-4 text-slate-400" />
                        <span className="font-medium text-slate-700">
                            {selectedType ? PROCEDURE_LABELS[selectedType as keyof typeof PROCEDURE_LABELS] : 'Chọn loại'}
                        </span>
                    </div>
                    <ChevronDown className="w-5 h-5 text-slate-400" />
                </button>
            </div>

            {/* Mobile: Day selector */}
            <div className="md:hidden bg-white rounded-xl shadow-sm border border-slate-200 p-3 mt-3 print:hidden">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-slate-600">Ngày:</span>
                    <div className="flex bg-slate-100 p-1 rounded-lg">
                        <button
                            onClick={() => setMode('add')}
                            className={`px-3 py-1 text-xs font-bold rounded-md transition-all flex items-center gap-1 ${mode === 'add' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'}`}
                        >
                            <Plus className="w-3 h-3" /> Thêm
                        </button>
                        <button
                            onClick={() => setMode('subtract')}
                            className={`px-3 py-1 text-xs font-bold rounded-md transition-all flex items-center gap-1 ${mode === 'subtract' ? 'bg-white text-red-600 shadow-sm' : 'text-slate-500'}`}
                        >
                            <Minus className="w-3 h-3" /> Giảm
                        </button>
                    </div>
                </div>
                <div className="flex gap-1 overflow-x-auto pb-2 scrollbar-hide -mx-1 px-1">
                    {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => {
                        const isToday = new Date().getDate() === day &&
                            new Date().getMonth() + 1 === month &&
                            new Date().getFullYear() === year;
                        return (
                            <button
                                key={day}
                                onClick={() => setMobileSelectedDay(day)}
                                className={`flex-shrink-0 w-10 h-10 rounded-lg text-sm font-medium transition-colors
                                    ${mobileSelectedDay === day
                                        ? 'bg-blue-600 text-white'
                                        : isToday
                                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                    }`}
                            >
                                {day}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Content Container */}
            <div className="flex-1 flex gap-4 md:gap-6 min-h-0 mt-3 md:mt-6 print:hidden">
                {/* Desktop: Sidebar Filter */}
                <div className="hidden md:flex w-64 bg-white rounded-xl shadow-sm border border-slate-200 flex-col overflow-hidden shrink-0">
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

                {/* Desktop: Grid */}
                <div className="hidden md:flex flex-1 bg-white rounded-xl shadow-sm border border-slate-200 flex-col overflow-hidden">
                    <div className="p-4 border-b border-slate-100 flex justify-between items-center">
                        <h3 className="font-bold text-slate-800">
                            {selectedType ? PROCEDURE_LABELS[selectedType as keyof typeof PROCEDURE_LABELS] : 'Chọn loại thủ thuật'}
                        </h3>
                        <div className="flex bg-slate-100 p-1 rounded-lg">
                            <button
                                onClick={() => setMode('add')}
                                className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${mode === 'add' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                            >
                                [+] Thêm
                            </button>
                            <button
                                onClick={() => setMode('subtract')}
                                className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${mode === 'subtract' ? 'bg-white text-red-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                            >
                                [-] Giảm
                            </button>
                        </div>
                    </div>
                    <div className="flex-1 overflow-auto p-4">
                        <ProcedureGrid
                            month={month}
                            year={year}
                            residents={residents}
                            records={records}
                            selectedType={selectedType}
                            isLoading={isLoading}
                            readOnly={readOnly}
                            onToggle={handleToggle}
                            onDetailedClick={handleDetailedClick}
                            mode={mode}
                        />
                    </div>
                </div>

                {/* Mobile: Card list for selected day */}
                <div className="md:hidden flex-1 overflow-y-auto space-y-2 pb-4">
                    {!selectedType ? (
                        <div className="p-8 text-center text-slate-500 bg-slate-50 rounded-xl border border-dashed border-slate-300">
                            Vui lòng chọn loại thủ thuật
                        </div>
                    ) : residents.length === 0 ? (
                        <div className="p-8 text-center text-slate-500">Không có NCT</div>
                    ) : (
                        residents.map((resident, idx) => {
                            const { checked, count } = getMobileRecord(resident.id);
                            return (
                                <div
                                    key={resident.id}
                                    className="bg-white rounded-xl border border-slate-200 p-4 flex items-center justify-between"
                                >
                                    <div className="flex items-center gap-3 flex-1 min-w-0">
                                        <span className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-sm font-bold flex-shrink-0">
                                            {idx + 1}
                                        </span>
                                        <div className="min-w-0">
                                            <h3 className="font-medium text-slate-800 truncate">{resident.name}</h3>
                                            <p className="text-xs text-slate-500">P.{resident.room}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 flex-shrink-0">
                                        {checked && (
                                            <span className="text-lg font-bold text-blue-600">
                                                {count > 0 ? count : '✓'}
                                            </span>
                                        )}
                                        <button
                                            onClick={() => handleMobileToggle(resident.id, count)}
                                            disabled={readOnly || isLoading}
                                            className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${mode === 'add'
                                                ? 'bg-blue-100 text-blue-600 active:bg-blue-200'
                                                : 'bg-red-100 text-red-600 active:bg-red-200'
                                                } ${readOnly || isLoading ? 'opacity-50' : ''}`}
                                        >
                                            {mode === 'add' ? <Plus className="w-6 h-6" /> : <Minus className="w-6 h-6" />}
                                        </button>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>

            {/* Mobile Filter Bottom Sheet */}
            {showMobileFilter && (
                <div className="md:hidden fixed inset-0 z-50 print:hidden">
                    <div className="absolute inset-0 bg-black/50" onClick={() => setShowMobileFilter(false)} />
                    <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl max-h-[70vh] flex flex-col animate-slide-up safe-area-bottom">
                        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                            <h3 className="font-bold text-slate-800">Chọn loại thủ thuật</h3>
                            <button onClick={() => setShowMobileFilter(false)} className="p-2 hover:bg-slate-100 rounded-lg">
                                <X className="w-5 h-5 text-slate-500" />
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-2">
                            {procedureTypes.map(t => (
                                <button
                                    key={t.key}
                                    onClick={() => {
                                        setSelectedType(t.key);
                                        setShowMobileFilter(false);
                                    }}
                                    className={`w-full text-left px-4 py-3 rounded-lg text-sm transition-colors flex items-center justify-between ${selectedType === t.key
                                        ? 'bg-blue-50 text-blue-700 font-medium'
                                        : 'text-slate-600 hover:bg-slate-50'
                                        }`}
                                >
                                    {t.label}
                                    {selectedType === t.key && <Check className="w-5 h-5 text-blue-600" />}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* IV Drip Modal */}
            <IVDripModal
                isOpen={ivDripModal.isOpen}
                onClose={() => setIvDripModal(prev => ({ ...prev, isOpen: false }))}
                onSave={handleSaveIVDrip}
                initialItems={ivDripModal.items}
                residentName={ivDripModal.residentName}
                recordDate={ivDripModal.date}
                readOnly={readOnly}
            />

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
