import React, { useState } from 'react';
import { Search, Calendar, Filter, User } from 'lucide-react';
import { Table } from '@/src/components/ui';
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

            <div className="rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
                    <h3 className="font-bold text-slate-800">Lịch sử sử dụng dịch vụ</h3>
                    <span className="text-sm font-semibold text-teal-600">Tổng cộng: {formatCurrency(totalAmount)}</span>
                </div>
                <Table
                    data={filteredRecords}
                    mobileCardView={true}
                    columns={[
                        {
                            header: 'Ngày',
                            accessor: (r) => new Date(r.date).toLocaleDateString('vi-VN'),
                            mobileLabel: 'Ngày',
                        },
                        {
                            header: 'Người sử dụng',
                            accessor: (r) => getResidentName(r.residentId),
                            mobileHidden: true
                        },
                        {
                            header: 'Dịch vụ',
                            accessor: (r) => (
                                <div>
                                    <div>{r.serviceName}</div>
                                    {r.description && <div className="text-xs text-slate-400 italic">{r.description}</div>}
                                </div>
                            ),
                            mobilePrimary: true
                        },
                        {
                            header: 'SL',
                            accessor: 'quantity',
                            align: 'center',
                            mobileLabel: 'Số lượng'
                        },
                        {
                            header: 'Thành tiền',
                            accessor: (r) => formatCurrency(r.totalAmount),
                            align: 'right',
                            mobileLabel: 'Tổng tiền',
                            className: 'font-medium text-slate-700'
                        },
                        {
                            header: 'Trạng thái',
                            accessor: (r) => (
                                <span className={`px-2 py-0.5 rounded text-xs font-semibold ${r.status === 'Billed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                    {r.status === 'Billed' ? 'Đã thu' : 'Chưa thu'}
                                </span>
                            ),
                            align: 'center',
                            mobileLabel: 'Trạng thái'
                        }
                    ]}
                />
            </div>
        </div>
    );
};
