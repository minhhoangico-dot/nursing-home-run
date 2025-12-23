import React, { useState } from 'react';
import { Search, Calendar, Filter, User } from 'lucide-react';
import { ServiceUsage, Resident } from '../../../types/index';
import { formatCurrency } from '../../../data/index';

interface ServiceUsageListProps {
    usageRecords: ServiceUsage[];
    residents: Resident[];
    hideResidentFilter?: boolean;
}

export const ServiceUsageList = ({ usageRecords, residents, hideResidentFilter = false }: ServiceUsageListProps) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterMonth, setFilterMonth] = useState(new Date().toISOString().slice(0, 7)); // YYYY-MM
    const [filterResident, setFilterResident] = useState('ALL');

    const filteredRecords = usageRecords.filter(r => {
        const matchesSearch = r.serviceName.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesMonth = r.date.startsWith(filterMonth);
        const matchesResident = hideResidentFilter || filterResident === 'ALL' || r.residentId === filterResident;
        return matchesSearch && matchesMonth && matchesResident;
    });

    const getResidentName = (id: string) => residents.find(r => r.id === id)?.name || id;

    const totalAmount = filteredRecords.reduce((sum, r) => sum + r.totalAmount, 0);

    return (
        <div className="space-y-4">
            <div className="flex gap-4 items-center bg-white p-4 rounded-xl shadow-sm border border-slate-200">
                <div className="relative flex-1">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                        className="w-full pl-9 pr-4 py-2 border rounded-lg text-sm"
                        placeholder="Tìm tên dịch vụ..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>
                <div>
                    <input
                        type="month"
                        className="border rounded-lg px-3 py-2 text-sm"
                        value={filterMonth}
                        onChange={e => setFilterMonth(e.target.value)}
                    />
                </div>
                {!hideResidentFilter && (
                    <div>
                        <select
                            className="border rounded-lg px-3 py-2 text-sm max-w-[200px]"
                            value={filterResident}
                            onChange={e => setFilterResident(e.target.value)}
                        >
                            <option value="ALL">Tất cả NCT</option>
                            {residents.map(r => (
                                <option key={r.id} value={r.id}>{r.name}</option>
                            ))}
                        </select>
                    </div>
                )}
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
                    <h3 className="font-bold text-slate-800">Lịch sử sử dụng dịch vụ</h3>
                    <span className="text-sm font-semibold text-teal-600">Tổng cộng: {formatCurrency(totalAmount)}</span>
                </div>
                <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 border-b border-slate-100">
                        <tr>
                            <th className="px-6 py-3 font-medium text-slate-500">Ngày</th>
                            <th className="px-6 py-3 font-medium text-slate-500">Người sử dụng</th>
                            <th className="px-6 py-3 font-medium text-slate-500">Dịch vụ</th>
                            <th className="px-6 py-3 font-medium text-slate-500 text-center">SL</th>
                            <th className="px-6 py-3 font-medium text-slate-500 text-right">Thành tiền</th>
                            <th className="px-6 py-3 font-medium text-slate-500 text-center">Trạng thái</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {filteredRecords.length > 0 ? filteredRecords.map(r => (
                            <tr key={r.id} className="hover:bg-slate-50">
                                <td className="px-6 py-3 text-slate-600">{new Date(r.date).toLocaleDateString('vi-VN')}</td>
                                <td className="px-6 py-3 font-medium text-slate-800">{getResidentName(r.residentId)}</td>
                                <td className="px-6 py-3 text-slate-700">
                                    {r.serviceName}
                                    {r.description && <div className="text-xs text-slate-400 italic">{r.description}</div>}
                                </td>
                                <td className="px-6 py-3 text-center">{r.quantity}</td>
                                <td className="px-6 py-3 text-right font-medium text-slate-700">{formatCurrency(r.totalAmount)}</td>
                                <td className="px-6 py-3 text-center">
                                    <span className={`px-2 py-0.5 rounded text-xs font-semibold ${r.status === 'Billed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                                        }`}>
                                        {r.status === 'Billed' ? 'Đã thu' : 'Chưa thu'}
                                    </span>
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan={6} className="text-center py-8 text-slate-400 italic">Không có dữ liệu</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
