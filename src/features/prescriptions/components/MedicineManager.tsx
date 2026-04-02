import React, { useState } from 'react';
import { X, Plus, Save, Trash2, Edit2, Search } from 'lucide-react';
import { usePrescriptionsStore } from '../../../stores/prescriptionStore';
import { Medicine } from '../../../types/medical';

interface MedicineManagerProps {
    onClose: () => void;
}

export const MedicineManager = ({ onClose }: MedicineManagerProps) => {
    const { medicines, createMedicine, updateMedicine, deleteMedicine } = usePrescriptionsStore();
    const [searchTerm, setSearchTerm] = useState('');
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState<Partial<Medicine>>({});
    const [isAdding, setIsAdding] = useState(false);

    const filteredMedicines = medicines.filter(m =>
        m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.activeIngredient?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.therapeuticGroup?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleEdit = (medicine: Medicine) => {
        setEditingId(medicine.id);
        setFormData(medicine);
        setIsAdding(false);
    };

    const handleAdd = () => {
        setIsAdding(true);
        setEditingId(null);
        setFormData({ name: '', unit: 'viên', price: 0, defaultDosage: '', activeIngredient: '', strength: '', route: 'Uống', therapeuticGroup: '' });
    };

    const handleSave = async () => {
        try {
            if (isAdding) {
                await createMedicine(formData);
            } else if (editingId) {
                await updateMedicine(editingId, formData);
            }
            setEditingId(null);
            setIsAdding(false);
            setFormData({});
        } catch (error) {
            console.error('Failed to save medicine', error);
            alert('Lỗi khi lưu thuốc');
        }
    };

    const handleDelete = async (id: string) => {
        if (confirm('Bạn có chắc muốn xóa thuốc này?')) {
            try {
                await deleteMedicine(id);
            } catch (error) {
                console.error('Failed to delete', error);
                alert('Không thể xóa thuốc đang được sử dụng trong đơn thuốc');
            }
        }
    };

    const isFormValid = formData.name && formData.unit;

    const renderFormRow = (isNew: boolean) => (
        <>
            {/* Desktop form row */}
            <tr className={`hidden lg:table-row ${isNew ? 'bg-teal-50' : ''}`}>
                <td className="px-3 py-2">
                    <input
                        autoFocus={isNew}
                        className="w-full border rounded px-2 py-1 focus:ring-1 focus:ring-teal-500 outline-none text-sm"
                        placeholder="Tên thuốc..."
                        value={formData.name || ''}
                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                    />
                </td>
                <td className="px-3 py-2">
                    <input
                        className="w-full border rounded px-2 py-1 outline-none text-sm"
                        placeholder="Hoạt chất"
                        value={formData.activeIngredient || ''}
                        onChange={e => setFormData({ ...formData, activeIngredient: e.target.value })}
                    />
                </td>
                <td className="px-3 py-2">
                    <input
                        className="w-full border rounded px-2 py-1 outline-none text-sm"
                        placeholder="500mg"
                        value={formData.strength || ''}
                        onChange={e => setFormData({ ...formData, strength: e.target.value })}
                    />
                </td>
                <td className="px-3 py-2">
                    <input
                        className="w-full border rounded px-2 py-1 outline-none text-sm"
                        placeholder="viên"
                        value={formData.unit || ''}
                        onChange={e => setFormData({ ...formData, unit: e.target.value })}
                    />
                </td>
                <td className="px-3 py-2">
                    <select
                        className="w-full border rounded px-2 py-1 outline-none text-sm"
                        value={formData.route || ''}
                        onChange={e => setFormData({ ...formData, route: e.target.value })}
                    >
                        <option value="">--</option>
                        {['Uống', 'Tiêm', 'Bôi', 'Nhỏ mắt', 'Nhỏ mũi', 'Xịt', 'Đặt', 'Khác'].map(r => (
                            <option key={r} value={r}>{r}</option>
                        ))}
                    </select>
                </td>
                <td className="px-3 py-2">
                    <input
                        className="w-full border rounded px-2 py-1 outline-none text-sm"
                        placeholder="Nhóm thuốc"
                        value={formData.therapeuticGroup || ''}
                        onChange={e => setFormData({ ...formData, therapeuticGroup: e.target.value })}
                    />
                </td>
                <td className="px-3 py-2">
                    <input
                        type="number"
                        className="w-full border rounded px-2 py-1 text-right outline-none text-sm"
                        value={formData.price || 0}
                        onChange={e => setFormData({ ...formData, price: Number(e.target.value) })}
                    />
                </td>
                <td className="px-3 py-2 text-center">
                    <div className="flex items-center justify-center gap-1">
                        <button
                            onClick={handleSave}
                            disabled={!isFormValid}
                            className="p-1.5 bg-teal-600 text-white rounded hover:bg-teal-700 disabled:opacity-50 shadow-sm"
                        >
                            <Save className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => { setIsAdding(false); setEditingId(null); }} className="p-1.5 bg-slate-200 text-slate-600 rounded hover:bg-slate-300">
                            <X className="w-3.5 h-3.5" />
                        </button>
                    </div>
                </td>
            </tr>
            {/* Mobile form card */}
            <tr className="lg:hidden">
                <td colSpan={8}>
                    <div className={`p-4 space-y-3 ${isNew ? 'bg-teal-50' : 'bg-blue-50'}`}>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="text-xs font-semibold text-slate-500 mb-1 block">Tên thuốc *</label>
                                <input
                                    autoFocus={isNew}
                                    className="w-full border rounded px-2 py-1.5 focus:ring-1 focus:ring-teal-500 outline-none text-sm"
                                    placeholder="Tên thuốc..."
                                    value={formData.name || ''}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-slate-500 mb-1 block">Hoạt chất</label>
                                <input
                                    className="w-full border rounded px-2 py-1.5 outline-none text-sm"
                                    value={formData.activeIngredient || ''}
                                    onChange={e => setFormData({ ...formData, activeIngredient: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-slate-500 mb-1 block">Hàm lượng</label>
                                <input
                                    className="w-full border rounded px-2 py-1.5 outline-none text-sm"
                                    placeholder="500mg"
                                    value={formData.strength || ''}
                                    onChange={e => setFormData({ ...formData, strength: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-slate-500 mb-1 block">Đơn vị *</label>
                                <input
                                    className="w-full border rounded px-2 py-1.5 outline-none text-sm"
                                    value={formData.unit || ''}
                                    onChange={e => setFormData({ ...formData, unit: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-slate-500 mb-1 block">Đường dùng</label>
                                <select
                                    className="w-full border rounded px-2 py-1.5 outline-none text-sm"
                                    value={formData.route || ''}
                                    onChange={e => setFormData({ ...formData, route: e.target.value })}
                                >
                                    <option value="">--</option>
                                    {['Uống', 'Tiêm', 'Bôi', 'Nhỏ mắt', 'Nhỏ mũi', 'Xịt', 'Đặt', 'Khác'].map(r => (
                                        <option key={r} value={r}>{r}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-slate-500 mb-1 block">Nhóm thuốc</label>
                                <input
                                    className="w-full border rounded px-2 py-1.5 outline-none text-sm"
                                    value={formData.therapeuticGroup || ''}
                                    onChange={e => setFormData({ ...formData, therapeuticGroup: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-slate-500 mb-1 block">Đơn giá (VNĐ)</label>
                                <input
                                    type="number"
                                    className="w-full border rounded px-2 py-1.5 text-right outline-none text-sm"
                                    value={formData.price || 0}
                                    onChange={e => setFormData({ ...formData, price: Number(e.target.value) })}
                                />
                            </div>
                        </div>
                        <div className="flex gap-2 justify-end">
                            <button onClick={() => { setIsAdding(false); setEditingId(null); }} className="px-3 py-1.5 bg-slate-200 text-slate-600 rounded text-sm hover:bg-slate-300">
                                Hủy
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={!isFormValid}
                                className="px-3 py-1.5 bg-teal-600 text-white rounded text-sm hover:bg-teal-700 disabled:opacity-50"
                            >
                                Lưu
                            </button>
                        </div>
                    </div>
                </td>
            </tr>
        </>
    );

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-6xl max-h-[90vh] flex flex-col">
                <div className="p-4 border-b flex justify-between items-center bg-slate-50 rounded-t-xl">
                    <h2 className="text-lg font-bold text-slate-800">Quản lý Danh mục Thuốc</h2>
                    <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
                        <X className="w-5 h-5 text-slate-500" />
                    </button>
                </div>

                <div className="p-4 border-b flex gap-4 items-center bg-white">
                    <div className="relative flex-1">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Tìm kiếm thuốc..."
                            className="w-full pl-9 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button
                        onClick={handleAdd}
                        disabled={isAdding || !!editingId}
                        className="flex items-center gap-2 bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 disabled:opacity-50 transition-colors font-medium shadow-sm whitespace-nowrap"
                    >
                        <Plus className="w-4 h-4" /> Thêm thuốc mới
                    </button>
                </div>

                <div className="flex-1 overflow-auto p-0">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-100 text-slate-600 font-semibold sticky top-0 z-10 shadow-sm">
                            <tr>
                                <th className="px-3 py-3">Tên thuốc</th>
                                <th className="px-3 py-3 hidden lg:table-cell">Hoạt chất</th>
                                <th className="px-3 py-3 hidden lg:table-cell w-24">Hàm lượng</th>
                                <th className="px-3 py-3 w-20">Đơn vị</th>
                                <th className="px-3 py-3 hidden lg:table-cell w-24">Đường dùng</th>
                                <th className="px-3 py-3 hidden lg:table-cell">Nhóm thuốc</th>
                                <th className="px-3 py-3 w-28 text-right hidden sm:table-cell">Đơn giá</th>
                                <th className="px-3 py-3 w-20 text-center">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {isAdding && renderFormRow(true)}

                            {filteredMedicines.map(medicine => (
                                editingId === medicine.id ? (
                                    <React.Fragment key={medicine.id}>
                                        {renderFormRow(false)}
                                    </React.Fragment>
                                ) : (
                                    <tr key={medicine.id} className="hover:bg-slate-50 transition-colors group">
                                        <td className="px-3 py-3">
                                            <div className="font-medium text-slate-800">{medicine.name}</div>
                                            {/* Show extra info on mobile */}
                                            <div className="lg:hidden text-xs text-slate-500 mt-0.5">
                                                {[medicine.activeIngredient, medicine.strength, medicine.route].filter(Boolean).join(' · ')}
                                            </div>
                                            {medicine.therapeuticGroup && (
                                                <div className="lg:hidden text-xs text-teal-600 mt-0.5">{medicine.therapeuticGroup}</div>
                                            )}
                                        </td>
                                        <td className="px-3 py-3 text-slate-600 hidden lg:table-cell">{medicine.activeIngredient}</td>
                                        <td className="px-3 py-3 text-slate-600 hidden lg:table-cell">{medicine.strength}</td>
                                        <td className="px-3 py-3 text-slate-600">{medicine.unit}</td>
                                        <td className="px-3 py-3 text-slate-600 hidden lg:table-cell">{medicine.route}</td>
                                        <td className="px-3 py-3 text-slate-600 hidden lg:table-cell">
                                            {medicine.therapeuticGroup && (
                                                <span className="px-2 py-0.5 bg-teal-50 text-teal-700 rounded text-xs border border-teal-100">
                                                    {medicine.therapeuticGroup}
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-3 py-3 text-right font-medium text-slate-800 hidden sm:table-cell">
                                            {new Intl.NumberFormat('vi-VN').format(medicine.price || 0)}
                                        </td>
                                        <td className="px-3 py-3 text-center">
                                            <div className="flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button onClick={() => handleEdit(medicine)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors" title="Sửa">
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                                <button onClick={() => handleDelete(medicine.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors" title="Xóa">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                )
                            ))}

                            {!isAdding && filteredMedicines.length === 0 && (
                                <tr>
                                    <td colSpan={8} className="text-center py-8 text-slate-400">
                                        Không tìm thấy thuốc nào.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};
