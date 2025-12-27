import React, { useState } from 'react';
import { X, Plus, Save, Trash2, Edit2, Search } from 'lucide-react';
import { usePrescriptionsStore } from '../../../stores/prescriptionStore';
import { Medicine } from '../../../types/medical';

interface MedicineManagerProps {
    onClose: () => void;
}

export const MedicineManager = ({ onClose }: MedicineManagerProps) => {
    const { medicines, createMedicine, updateMedicine, deleteMedicine, isLoading } = usePrescriptionsStore();
    const [searchTerm, setSearchTerm] = useState('');
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState<Partial<Medicine>>({});
    const [isAdding, setIsAdding] = useState(false);

    const filteredMedicines = medicines.filter(m =>
        m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.activeIngredient?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleEdit = (medicine: Medicine) => {
        setEditingId(medicine.id);
        setFormData(medicine);
        setIsAdding(false);
    };

    const handleAdd = () => {
        setIsAdding(true);
        setEditingId(null);
        setFormData({ name: '', unit: 'viên', price: 0, defaultDosage: '', activeIngredient: '' });
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

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
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
                        className="flex items-center gap-2 bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 disabled:opacity-50 transition-colors font-medium shadow-sm"
                    >
                        <Plus className="w-4 h-4" /> Thêm thuốc mới
                    </button>
                </div>

                <div className="flex-1 overflow-auto p-0">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-100 text-slate-600 font-semibold sticky top-0 z-10 shadow-sm">
                            <tr>
                                <th className="px-4 py-3">Tên thuốc</th>
                                <th className="px-4 py-3">Hoạt chất</th>
                                <th className="px-4 py-3 w-24">Đơn vị</th>
                                <th className="px-4 py-3 w-32 text-right">Đơn giá (VNĐ)</th>
                                <th className="px-4 py-3 w-16 text-center">Hành động</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {/* ADD NEW ROW */}
                            {isAdding && (
                                <tr className="bg-teal-50">
                                    <td className="px-4 py-2">
                                        <input
                                            autoFocus={true}
                                            className="w-full border rounded px-2 py-1 focus:ring-1 focus:ring-teal-500 outline-none"
                                            placeholder="Tên thuốc..."
                                            value={formData.name || ''}
                                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        />
                                    </td>
                                    <td className="px-4 py-2">
                                        <input
                                            className="w-full border rounded px-2 py-1 outline-none"
                                            value={formData.activeIngredient || ''}
                                            onChange={e => setFormData({ ...formData, activeIngredient: e.target.value })}
                                        />
                                    </td>
                                    <td className="px-4 py-2">
                                        <input
                                            className="w-full border rounded px-2 py-1 outline-none"
                                            value={formData.unit || ''}
                                            onChange={e => setFormData({ ...formData, unit: e.target.value })}
                                        />
                                    </td>
                                    <td className="px-4 py-2">
                                        <input
                                            type="number"
                                            className="w-full border rounded px-2 py-1 text-right outline-none"
                                            value={formData.price || 0}
                                            onChange={e => setFormData({ ...formData, price: Number(e.target.value) })}
                                        />
                                    </td>
                                    <td className="px-4 py-2 text-center">
                                        <div className="flex items-center justify-center gap-2">
                                            <button
                                                onClick={handleSave}
                                                disabled={!isFormValid}
                                                className="p-1.5 bg-teal-600 text-white rounded hover:bg-teal-700 disabled:opacity-50 shadow-sm"
                                            >
                                                <Save className="w-4 h-4" />
                                            </button>
                                            <button onClick={() => setIsAdding(false)} className="p-1.5 bg-slate-200 text-slate-600 rounded hover:bg-slate-300">
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            )}

                            {filteredMedicines.map(medicine => (
                                <tr key={medicine.id} className="hover:bg-slate-50 transition-colors group">
                                    {editingId === medicine.id ? (
                                        <>
                                            <td className="px-4 py-2">
                                                <input
                                                    className="w-full border rounded px-2 py-1 focus:ring-1 focus:ring-teal-500 outline-none"
                                                    value={formData.name || ''}
                                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                                />
                                            </td>
                                            <td className="px-4 py-2">
                                                <input
                                                    className="w-full border rounded px-2 py-1 outline-none"
                                                    value={formData.activeIngredient || ''}
                                                    onChange={e => setFormData({ ...formData, activeIngredient: e.target.value })}
                                                />
                                            </td>
                                            <td className="px-4 py-2">
                                                <input
                                                    className="w-full border rounded px-2 py-1 outline-none"
                                                    value={formData.unit || ''}
                                                    onChange={e => setFormData({ ...formData, unit: e.target.value })}
                                                />
                                            </td>
                                            <td className="px-4 py-2">
                                                <input
                                                    type="number"
                                                    className="w-full border rounded px-2 py-1 text-right outline-none"
                                                    value={formData.price || 0}
                                                    onChange={e => setFormData({ ...formData, price: Number(e.target.value) })}
                                                />
                                            </td>
                                            <td className="px-4 py-2 text-center">
                                                <div className="flex items-center justify-center gap-2">
                                                    <button
                                                        onClick={handleSave}
                                                        className="p-1.5 bg-teal-600 text-white rounded hover:bg-teal-700 shadow-sm"
                                                    >
                                                        <Save className="w-4 h-4" />
                                                    </button>
                                                    <button onClick={() => setEditingId(null)} className="p-1.5 bg-slate-200 text-slate-600 rounded hover:bg-slate-300">
                                                        <X className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </>
                                    ) : (
                                        <>
                                            <td className="px-4 py-3 font-medium text-slate-800">{medicine.name}</td>
                                            <td className="px-4 py-3 text-slate-600">{medicine.activeIngredient}</td>
                                            <td className="px-4 py-3 text-slate-600">{medicine.unit}</td>
                                            <td className="px-4 py-3 text-right font-medium text-slate-800">
                                                {new Intl.NumberFormat('vi-VN').format(medicine.price || 0)}
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button onClick={() => handleEdit(medicine)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors" title="Sửa">
                                                        <Edit2 className="w-4 h-4" />
                                                    </button>
                                                    <button onClick={() => handleDelete(medicine.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors" title="Xóa">
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </>
                                    )}
                                </tr>
                            ))}

                            {!isAdding && filteredMedicines.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="text-center py-8 text-slate-400">
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
