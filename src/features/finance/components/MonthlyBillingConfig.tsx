import React, { useState, useMemo } from 'react';
import { Search, ChevronRight, Printer, AlertCircle } from 'lucide-react';
import { ResidentListItem, ServiceUsage } from '../../../types/index';
import { formatCurrency } from '../../../data/index';
import { calculateFixedCosts, getMonthlyUsage } from '../utils/calculateMonthlyBilling';

interface MonthlyBillingConfigProps {
    residents: ResidentListItem[];
    usageRecords: ServiceUsage[];
    onPrintBill: (resident: ResidentListItem, month: string) => void;
}

export const MonthlyBillingConfig = ({ residents, usageRecords, onPrintBill }: MonthlyBillingConfigProps) => {
    const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7)); // YYYY-MM
    const [searchTerm, setSearchTerm] = useState('');
    const [expandedResidentId, setExpandedResidentId] = useState<string | null>(null);

    const toggleExpand = (id: string) => {
        setExpandedResidentId(prev => prev === id ? null : id);
    };

    const billingData = useMemo(() => {
        return residents.map(resident => {
            const fixed = calculateFixedCosts(resident);

            const monthlyUsage = getMonthlyUsage(usageRecords, resident.id, selectedMonth);
            const incurredTotal = monthlyUsage.reduce((sum, u) => sum + u.totalAmount, 0);

            // Total Due
            const totalDue = fixed.total + incurredTotal;

            return {
                resident,
                fixed,
                incurred: { total: incurredTotal, details: monthlyUsage },
                totalDue
            };
        }).filter(data =>
            data.resident.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            data.resident.room.includes(searchTerm)
        );
    }, [residents, usageRecords, selectedMonth, searchTerm]);

    const totalExpectedRevenue = billingData.reduce((sum, item) => sum + item.totalDue, 0);

    return (
        <div className="space-y-6">
            {/* Header Controls */}
            <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-slate-200">
                <div className="flex gap-4 items-center w-full md:w-auto">
                    <div className="relative flex-1 md:w-64">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            className="w-full pl-9 pr-4 py-2 border rounded-lg text-sm"
                            placeholder="Tìm theo tên, phòng..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <input
                        type="month"
                        className="border rounded-lg px-3 py-2 text-sm"
                        value={selectedMonth}
                        onChange={e => setSelectedMonth(e.target.value)}
                    />
                </div>
                <div className="flex gap-6 text-right">
                    <div>
                        <div className="text-xs text-slate-500 font-medium uppercase">Dự kiến thu</div>
                        <div className="text-xl font-bold text-slate-700">{formatCurrency(totalExpectedRevenue)}</div>
                    </div>
                </div>
            </div>

            {/* Billing List */}
            <div className="grid grid-cols-1 gap-4">
                {billingData.map((item) => (
                    <div key={item.resident.id} className="bg-white rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow overflow-hidden">
                        <div className="p-4 flex flex-col md:flex-row gap-4 items-center justify-between">

                            {/* Resident Info */}
                            <div className="flex items-center gap-4 flex-1 min-w-[250px]">
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-white shadow-sm ${item.resident.gender === 'Nam' ? 'bg-blue-500' : 'bg-pink-500'}`}>
                                    {item.resident.name.charAt(0)}
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-800 text-lg">{item.resident.name}</h4>
                                    <div className="text-xs text-slate-500 flex gap-2 mt-1">
                                        <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded">P. {item.resident.room}</span>
                                        <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded">Mã: {item.resident.id}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Cost Breakdown Summary */}
                            <div className="flex flex-1 gap-8 justify-center w-full md:w-auto py-4 md:py-0 border-t md:border-t-0 border-b md:border-b-0 border-slate-100">
                                <div className="text-center">
                                    <div className="text-xs text-slate-400 mb-1">Cố định</div>
                                    <div className="font-semibold text-slate-700">{formatCurrency(item.fixed.total)}</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-xs text-slate-400 mb-1">Phát sinh</div>
                                    <div className="font-semibold text-orange-600">{formatCurrency(item.incurred.total)}</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-xs text-slate-400 mb-1">Tổng cộng</div>
                                    <div className="font-bold text-teal-700 text-lg">{formatCurrency(item.totalDue)}</div>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-2 w-full md:w-auto justify-end items-center">
                                <button
                                    onClick={() => onPrintBill(item.resident, selectedMonth)}
                                    className="bg-white border-2 border-slate-200 hover:border-teal-500 hover:text-teal-600 text-slate-600 px-5 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 group"
                                >
                                    <Printer className="w-4 h-4 group-hover:text-teal-600" />
                                    In Bill
                                </button>

                                <button
                                    onClick={() => toggleExpand(item.resident.id)}
                                    className={`p-2.5 rounded-xl transition-all ${expandedResidentId === item.resident.id ? 'bg-teal-50 text-teal-600 rotate-90' : 'text-slate-400 hover:text-teal-600 hover:bg-teal-50'}`}
                                >
                                    <ChevronRight className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        {/* Expanded Details */}
                        {expandedResidentId === item.resident.id && (
                            <div className="border-t border-slate-100 bg-slate-50/50 p-6 animate-in slide-in-from-top-2 duration-200">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    {/* Fixed Costs Detail */}
                                    <div>
                                        <h5 className="font-bold text-slate-700 mb-3 flex items-center gap-2 text-sm uppercase">
                                            <div className="w-2 h-2 rounded-full bg-slate-400"></div>
                                            Chi phí cố định
                                        </h5>
                                        <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
                                            <table className="w-full text-sm">
                                                <tbody className="divide-y divide-slate-100">
                                                    {item.fixed.details.map((detail, idx) => (
                                                        <tr key={idx} className="hover:bg-slate-50">
                                                            <td className="px-4 py-3 text-slate-600">{detail.name}</td>
                                                            <td className="px-4 py-3 text-right font-medium text-slate-800">{formatCurrency(detail.amount)}</td>
                                                        </tr>
                                                    ))}
                                                    <tr className="bg-slate-50 font-bold">
                                                        <td className="px-4 py-3 text-slate-700">Tổng cố định</td>
                                                        <td className="px-4 py-3 text-right text-slate-800">{formatCurrency(item.fixed.total)}</td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>

                                    {/* Incurred Costs Detail */}
                                    <div>
                                        <h5 className="font-bold text-orange-600 mb-3 flex items-center gap-2 text-sm uppercase">
                                            <div className="w-2 h-2 rounded-full bg-orange-600"></div>
                                            Chi phí phát sinh
                                        </h5>
                                        <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
                                            {item.incurred.details.length > 0 ? (
                                                <table className="w-full text-sm">
                                                    <thead className="bg-slate-50 text-xs text-slate-500 uppercase font-bold">
                                                        <tr>
                                                            <th className="px-4 py-2 text-left">Dịch vụ</th>
                                                            <th className="px-4 py-2 text-center">Ngày</th>
                                                            <th className="px-4 py-2 text-center">SL</th>
                                                            <th className="px-4 py-2 text-right">Thành tiền</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-slate-100">
                                                        {item.incurred.details.map((usage, idx) => (
                                                            <tr key={idx} className="hover:bg-slate-50">
                                                                <td className="px-4 py-3 text-slate-600">{usage.serviceName}</td>
                                                                <td className="px-4 py-3 text-center text-slate-500 text-xs">
                                                                    {new Date(usage.date).toLocaleDateString('vi-VN')}
                                                                </td>
                                                                <td className="px-4 py-3 text-center text-slate-600">{usage.quantity}</td>
                                                                <td className="px-4 py-3 text-right font-medium text-slate-800">{formatCurrency(usage.totalAmount)}</td>
                                                            </tr>
                                                        ))}
                                                        <tr className="bg-orange-50/50 font-bold">
                                                            <td colSpan={3} className="px-4 py-3 text-orange-700">Tổng phát sinh</td>
                                                            <td className="px-4 py-3 text-right text-orange-700">{formatCurrency(item.incurred.total)}</td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                            ) : (
                                                <div className="p-8 text-center text-slate-400 italic text-sm">
                                                    Không có chi phí phát sinh trong tháng này
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                ))}

                {billingData.length === 0 && (
                    <div className="text-center py-12 text-slate-400 bg-white rounded-xl border border-dashed border-slate-200">
                        Không tìm thấy dữ liệu phù hợp
                    </div>
                )}
            </div>
        </div>
    );
};
