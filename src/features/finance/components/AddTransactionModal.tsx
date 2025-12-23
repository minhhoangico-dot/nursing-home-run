import React, { useState } from 'react';
import { X, Save, Calendar, DollarSign, FileText, User } from 'lucide-react';
import { Resident, User as AppUser, FinancialTransaction } from '../../../types';
import { formatCurrency } from '../../../data/index';
// If formatCurrency is not in utils, I'll use a local helper or import from data/index as seen in FinancePage

interface AddTransactionModalProps {
    user: AppUser;
    residents: Resident[];
    onClose: () => void;
    onSave: (transaction: FinancialTransaction) => void;
}

export const AddTransactionModal = ({ user, residents, onClose, onSave }: AddTransactionModalProps) => {
    const [formData, setFormData] = useState({
        date: new Date().toISOString().slice(0, 16), // datetime-local format
        type: 'IN' as 'IN' | 'OUT',
        amount: '',
        description: '',
        residentId: '',
        performer: user.name
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const resident = residents.find(r => r.id === formData.residentId);

        const newTransaction: FinancialTransaction = {
            id: `TRX-${Date.now()}`,
            date: new Date(formData.date).toLocaleString('vi-VN'),
            type: formData.type,
            amount: Number(formData.amount),
            description: formData.description,
            residentName: resident ? resident.name : undefined,
            performer: formData.performer,
            status: 'Success'
        };

        onSave(newTransaction);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="flex justify-between items-center p-4 border-b border-slate-100 bg-slate-50">
                    <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                        <DollarSign className="w-5 h-5 text-teal-600" />
                        Thêm giao dịch mới
                    </h3>
                    <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-400 hover:text-slate-600">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {/* Type Selection */}
                    <div className="grid grid-cols-2 gap-4">
                        <button
                            type="button"
                            onClick={() => setFormData({ ...formData, type: 'IN' })}
                            className={`p-3 rounded-xl border flex flex-col items-center gap-2 transition-all ${formData.type === 'IN'
                                ? 'bg-teal-50 border-teal-200 text-teal-700 ring-2 ring-teal-100'
                                : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                                }`}
                        >
                            <span className="font-bold text-lg">+ Thu (Income)</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => setFormData({ ...formData, type: 'OUT' })}
                            className={`p-3 rounded-xl border flex flex-col items-center gap-2 transition-all ${formData.type === 'OUT'
                                ? 'bg-red-50 border-red-200 text-red-700 ring-2 ring-red-100'
                                : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                                }`}
                        >
                            <span className="font-bold text-lg">- Chi (Expense)</span>
                        </button>
                    </div>

                    {/* Date & Amount */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                                Thời gian
                            </label>
                            <div className="relative">
                                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input
                                    type="datetime-local"
                                    required
                                    className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 outline-none"
                                    value={formData.date}
                                    onChange={e => setFormData({ ...formData, date: e.target.value })}
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                                Số tiền (VNĐ)
                            </label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₫</span>
                                <input
                                    type="number"
                                    required
                                    min="0"
                                    step="1000"
                                    className="w-full pl-8 pr-3 py-2 border border-slate-300 rounded-lg text-sm font-bold text-slate-700 focus:ring-2 focus:ring-teal-500 outline-none"
                                    placeholder="0"
                                    value={formData.amount}
                                    onChange={e => setFormData({ ...formData, amount: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                            Mô tả / Lý do
                        </label>
                        <div className="relative">
                            <FileText className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                            <textarea
                                required
                                rows={2}
                                className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 outline-none resize-none"
                                placeholder="Nhập nội dung giao dịch..."
                                value={formData.description}
                                onChange={e => setFormData({ ...formData, description: e.target.value })}
                            />
                        </div>
                    </div>

                    {/* Resident (Optional) */}
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                            Liên quan đến NCT (Tùy chọn)
                        </label>
                        <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <select
                                className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 outline-none appearance-none bg-white"
                                value={formData.residentId}
                                onChange={e => setFormData({ ...formData, residentId: e.target.value })}
                            >
                                <option value="">-- Không chọn --</option>
                                {residents.map(r => (
                                    <option key={r.id} value={r.id}>
                                        {r.name} - {r.room}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-slate-500 hover:bg-slate-100 rounded-lg text-sm font-medium transition-colors"
                        >
                            Hủy bỏ
                        </button>
                        <button
                            type="submit"
                            className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-2 rounded-lg text-sm font-bold shadow-sm flex items-center gap-2 transition-colors"
                        >
                            <Save className="w-4 h-4" />
                            Lưu giao dịch
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
