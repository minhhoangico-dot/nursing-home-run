import React, { useState, useEffect } from 'react';
import { useWeightTrackingStore } from '@/src/stores/weightTrackingStore';
import { useResidentsStore } from '@/src/stores/residentsStore';
import { Scale, Printer, Search, TrendingUp } from 'lucide-react';
import { LoadingScreen } from '@/src/components/ui';
import { toast } from 'react-hot-toast';
import { PrintWeightForm } from '../components/PrintWeightForm';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

// Component for Resident History Chart
const WeightChart = ({ residentId, residentName }: { residentId: string, residentName: string }) => {
    const { fetchRecords, records } = useWeightTrackingStore();
    useEffect(() => {
        fetchRecords(residentId);
    }, [residentId]);

    // Use a copy reversed for chart (oldest to newest)
    const data = [...records].reverse().map(r => ({
        month: r.recordMonth,
        weight: r.weightKg
    }));

    return (
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 mt-6 md:mt-0 md:ml-6 w-full md:w-80 shrink-0">
            <h3 className="font-bold text-slate-700 mb-2 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-orange-500" />
                Lịch sử: {residentName}
            </h3>
            <div className="h-48 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                        <YAxis domain={['auto', 'auto']} width={30} tick={{ fontSize: 10 }} />
                        <Tooltip />
                        <Line type="monotone" dataKey="weight" stroke="#f97316" strokeWidth={2} dot={{ r: 3 }} />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export const WeightTrackingPage = () => {
    const { fetchAllRecords, addRecord, records, isLoading } = useWeightTrackingStore();
    const { residents, fetchResidents } = useResidentsStore();

    const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7)); // YYYY-MM
    const [filterName, setFilterName] = useState('');
    const [inputWeights, setInputWeights] = useState<Record<string, string>>({}); // Buffer inputs
    const [selectedResidentForChart, setSelectedResidentForChart] = useState<string | null>(null);

    useEffect(() => {
        fetchResidents();
    }, []);

    useEffect(() => {
        fetchAllRecords(selectedMonth);
        setInputWeights({}); // Reset inputs on month change
    }, [selectedMonth]);

    // Effect: populate inputs from records when records load
    useEffect(() => {
        const map: Record<string, string> = {};
        records.forEach(r => {
            map[r.residentId] = r.weightKg.toString();
        });
        setInputWeights(prev => ({ ...prev, ...map }));
    }, [records]);

    const handleWeightChange = (id: string, val: string) => {
        setInputWeights(prev => ({ ...prev, [id]: val }));
    };

    const handleSave = async (residentId: string) => {
        const val = inputWeights[residentId];
        if (!val) return;
        const weight = parseFloat(val);
        if (isNaN(weight) || weight <= 0 || weight > 200) {
            toast.error('Cân nặng không hợp lệ');
            return;
        }

        try {
            await addRecord({
                residentId: residentId,
                recordMonth: selectedMonth,
                weightKg: weight,
                recordedBy: 'Y tá', // Should use auth store
            });
            toast.success('Đã lưu cân nặng');
            // No need to refetch ALL if local state matches, but good practice to sync
            // Store's addRequest doesn't refresh all.
            // We assume successful save.
        } catch (error) {
            toast.error('Lỗi khi lưu');
        }
    };

    const handlePrint = () => {
        window.print();
    };

    const filteredResidents = residents.filter(r =>
        r.name.toLowerCase().includes(filterName.toLowerCase()) ||
        r.room.includes(filterName)
    );

    const calculateBMI = (weight: number, height: number) => {
        if (!weight || !height) return '-';
        return (weight / (height * height)).toFixed(1);
    };

    // Helper to get weight from Inputs (priority) or Records
    const getWeightVal = (id: string) => inputWeights[id] || '';

    return (
        <div className="p-6 max-w-full mx-auto space-y-6 flex flex-col h-[calc(100vh-80px)]">
            {/* Header */}
            <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-slate-200 shrink-0 print:hidden">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-orange-100 text-orange-600 rounded-lg">
                        <Scale className="w-6 h-6" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-slate-800">Theo dõi cân nặng</h1>
                        <p className="text-sm text-slate-500">Tháng {selectedMonth}</p>
                    </div>
                </div>
                <div className="flex gap-3">
                    <div className="relative">
                        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                            type="text"
                            placeholder="Tìm NCT..."
                            value={filterName}
                            onChange={(e) => setFilterName(e.target.value)}
                            className="pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:border-orange-500"
                        />
                    </div>
                    <input
                        type="month"
                        value={selectedMonth}
                        onChange={(e) => setSelectedMonth(e.target.value)}
                        className="px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:border-orange-500"
                    />
                    <button
                        onClick={handlePrint}
                        className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-900"
                    >
                        <Printer className="w-4 h-4" /> In phiếu
                    </button>
                </div>
            </div>

            <div className="flex-1 flex min-h-0 gap-6 print:hidden">
                {/* Main Table */}
                <div className="flex-1 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
                    <div className="flex-1 overflow-auto">
                        <table className="w-full text-sm text-left border-collapse">
                            <thead className="bg-slate-50 text-slate-700 font-bold sticky top-0 z-10">
                                <tr>
                                    <th className="p-3 border-b">Họ tên / Phòng</th>
                                    <th className="p-3 border-b text-center">Chiều cao (m)</th>
                                    <th className="p-3 border-b w-32">Cân nặng (kg)</th>
                                    <th className="p-3 border-b text-center">BMI</th>
                                    <th className="p-3 border-b text-center">Thao tác</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredResidents.map(r => {
                                    const wStr = getWeightVal(r.id);
                                    const w = parseFloat(wStr);
                                    const bmi = calculateBMI(w, r.height || 0);
                                    const hasHeight = !!r.height;
                                    const isSaved = records.find(rec => rec.residentId === r.id && rec.weightKg === w)?.weightKg === w; // Simple check

                                    return (
                                        <tr key={r.id} className="hover:bg-slate-50 group">
                                            <td
                                                className="p-3 font-medium cursor-pointer"
                                                onClick={() => setSelectedResidentForChart(r.id)}
                                            >
                                                <div className="text-slate-800">{r.name}</div>
                                                <div className="text-xs text-slate-500">Phòng {r.room}</div>
                                            </td>
                                            <td className="p-3 text-center">
                                                {hasHeight ? r.height : <span className="text-red-400 text-xs italic">Chưa nhập</span>}
                                            </td>
                                            <td className="p-3">
                                                <input
                                                    type="number"
                                                    step="0.1"
                                                    value={wStr}
                                                    onChange={(e) => handleWeightChange(r.id, e.target.value)}
                                                    className="w-full px-2 py-1 border border-slate-300 rounded focus:border-orange-500 outline-none transition-colors"
                                                    placeholder="0.0"
                                                    onKeyDown={(e) => e.key === 'Enter' && handleSave(r.id)}
                                                />
                                            </td>
                                            <td className="p-3 text-center">
                                                <span className={`px-2 py-0.5 rounded text-xs font-bold ${bmi !== '-' ? (
                                                        parseFloat(bmi) < 18.5 ? 'bg-yellow-100 text-yellow-700' :
                                                            parseFloat(bmi) > 23 ? 'bg-red-100 text-red-700' :
                                                                'bg-green-100 text-green-700'
                                                    ) : 'bg-slate-100'
                                                    }`}>
                                                    {bmi}
                                                </span>
                                            </td>
                                            <td className="p-3 text-center">
                                                <button
                                                    onClick={() => handleSave(r.id)}
                                                    className={`text-xs px-3 py-1 rounded border transition-colors ${isSaved ? 'bg-green-50 text-green-600 border-green-200' : 'bg-orange-50 text-orange-600 border-orange-200 hover:bg-orange-100'
                                                        }`}
                                                >
                                                    {isSaved ? 'Đã lưu' : 'Lưu'}
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Sidebar Chart (If resident selected) */}
                {selectedResidentForChart && (
                    <WeightChart
                        residentId={selectedResidentForChart}
                        residentName={residents.find(r => r.id === selectedResidentForChart)?.name || ''}
                    />
                )}
            </div>

            {/* Print Form */}
            <div className="hidden print:block fixed inset-0 bg-white z-[100]">
                <PrintWeightForm
                    month={selectedMonth}
                    residents={residents}
                    records={records}
                />
            </div>
        </div>
    );
};
