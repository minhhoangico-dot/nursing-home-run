import React, { useEffect, useMemo, useState } from 'react';
import { Edit2, Plus, Save, Search, Trash2, X } from 'lucide-react';

import { usePrescriptionsStore } from '@/src/stores/prescriptionStore';
import { type Medicine } from '@/src/types/medical';

interface MedicineManagerProps {
  onClose: () => void;
}

const EMPTY_FORM: Partial<Medicine> = {
  name: '',
  activeIngredient: '',
  strength: '',
  route: '',
  unit: 'viên',
  drugGroup: '',
  defaultDosage: '',
  defaultFrequency: undefined,
  price: 0,
};

export const MedicineManager = ({ onClose }: MedicineManagerProps) => {
  const {
    medicines,
    fetchMedicines,
    createMedicine,
    updateMedicine,
    deleteMedicine,
    isLoading,
  } = usePrescriptionsStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Medicine>>(EMPTY_FORM);
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    void fetchMedicines();
  }, [fetchMedicines]);

  const filteredMedicines = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    if (!query) {
      return medicines;
    }

    return medicines.filter((medicine) =>
      [medicine.name, medicine.activeIngredient, medicine.drugGroup]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
        .includes(query),
    );
  }, [medicines, searchTerm]);

  const resetForm = () => {
    setFormData(EMPTY_FORM);
    setEditingId(null);
    setIsAdding(false);
  };

  const handleEdit = (medicine: Medicine) => {
    setFormData(medicine);
    setEditingId(medicine.id);
    setIsAdding(false);
  };

  const handleAdd = () => {
    setFormData(EMPTY_FORM);
    setEditingId(null);
    setIsAdding(true);
  };

  const handleSave = async () => {
    try {
      if (isAdding) {
        await createMedicine(formData);
      } else if (editingId) {
        await updateMedicine(editingId, formData);
      }

      resetForm();
    } catch (error) {
      console.error('Failed to save medicine', error);
      window.alert('Không thể lưu danh mục thuốc.');
    }
  };

  const handleDelete = async (medicineId: string) => {
    if (!window.confirm('Bạn có chắc muốn xóa thuốc này?')) {
      return;
    }

    try {
      await deleteMedicine(medicineId);
    } catch (error) {
      console.error('Failed to delete medicine', error);
      window.alert('Không thể xóa thuốc đang được dùng trong đơn.');
    }
  };

  const isFormValid = Boolean(formData.name?.trim() && formData.unit?.trim());

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="flex max-h-[92vh] w-full max-w-6xl flex-col overflow-hidden rounded-[28px] bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-6 py-4">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">Danh mục thuốc</h2>
            <p className="text-sm text-slate-500">
              Quản lý nhanh thuốc dùng cho kê đơn và in điều dưỡng.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 transition hover:bg-slate-200"
          >
            <X className="h-5 w-5 text-slate-500" />
          </button>
        </div>

        <div className="grid flex-1 gap-0 overflow-hidden lg:grid-cols-[380px_minmax(0,1fr)]">
          <aside className="border-b border-slate-200 bg-slate-50/70 p-5 lg:border-b-0 lg:border-r">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-slate-900">
                  {isAdding ? 'Thêm thuốc mới' : editingId ? 'Chỉnh sửa thuốc' : 'Quick add'}
                </h3>
                <p className="text-sm text-slate-500">
                  Nhập các field cần cho autocomplete và kê đơn.
                </p>
              </div>
              <button
                type="button"
                onClick={handleAdd}
                className="inline-flex items-center gap-2 rounded-xl bg-teal-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-teal-700"
              >
                <Plus className="h-4 w-4" />
                Thêm thuốc
              </button>
            </div>

            <div className="grid gap-3">
              <input
                value={formData.name ?? ''}
                onChange={(event) =>
                  setFormData((current) => ({ ...current, name: event.currentTarget.value }))
                }
                placeholder="Tên thuốc"
                className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
              />
              <input
                value={formData.activeIngredient ?? ''}
                onChange={(event) =>
                  setFormData((current) => ({
                    ...current,
                    activeIngredient: event.currentTarget.value,
                  }))
                }
                placeholder="Hoạt chất"
                className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
              />
              <div className="grid gap-3 sm:grid-cols-2">
                <input
                  value={formData.strength ?? ''}
                  onChange={(event) =>
                    setFormData((current) => ({
                      ...current,
                      strength: event.currentTarget.value,
                    }))
                  }
                  placeholder="Hàm lượng"
                  className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
                />
                <input
                  value={formData.route ?? ''}
                  onChange={(event) =>
                    setFormData((current) => ({ ...current, route: event.currentTarget.value }))
                  }
                  placeholder="Đường dùng"
                  className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
                />
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <input
                  value={formData.unit ?? ''}
                  onChange={(event) =>
                    setFormData((current) => ({ ...current, unit: event.currentTarget.value }))
                  }
                  placeholder="Đơn vị"
                  className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
                />
                <input
                  value={formData.drugGroup ?? ''}
                  onChange={(event) =>
                    setFormData((current) => ({
                      ...current,
                      drugGroup: event.currentTarget.value,
                    }))
                  }
                  placeholder="Nhóm thuốc"
                  className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
                />
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <input
                  value={formData.defaultDosage ?? ''}
                  onChange={(event) =>
                    setFormData((current) => ({
                      ...current,
                      defaultDosage: event.currentTarget.value,
                    }))
                  }
                  placeholder="Liều phổ biến"
                  className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
                />
                <input
                  type="number"
                  min="0"
                  value={formData.defaultFrequency ?? ''}
                  onChange={(event) =>
                    setFormData((current) => ({
                      ...current,
                      defaultFrequency: event.currentTarget.value
                        ? Number(event.currentTarget.value)
                        : undefined,
                    }))
                  }
                  placeholder="Số lần/ngày"
                  className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
                />
              </div>
              <input
                type="number"
                min="0"
                value={formData.price ?? 0}
                onChange={(event) =>
                  setFormData((current) => ({
                    ...current,
                    price: Number(event.currentTarget.value),
                  }))
                }
                placeholder="Đơn giá"
                className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
              />
            </div>

            <div className="mt-5 flex gap-3">
              <button
                type="button"
                onClick={() => void handleSave()}
                disabled={!isFormValid}
                className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Save className="h-4 w-4" />
                Lưu thuốc
              </button>
              {(isAdding || editingId) && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:border-slate-400"
                >
                  Hủy
                </button>
              )}
            </div>
          </aside>

          <section className="flex min-h-0 flex-col">
            <div className="border-b border-slate-200 px-6 py-4">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.currentTarget.value)}
                  placeholder="Tìm theo tên thuốc, hoạt chất, nhóm thuốc"
                  className="w-full rounded-xl border border-slate-300 py-2.5 pl-9 pr-3 text-sm outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
                />
              </div>
            </div>

            <div className="min-h-0 flex-1 overflow-auto">
              <table className="w-full text-left text-sm">
                <thead className="sticky top-0 bg-slate-50 text-slate-600">
                  <tr>
                    <th className="px-4 py-3">Tên thuốc</th>
                    <th className="px-4 py-3">Metadata</th>
                    <th className="px-4 py-3">Gợi ý</th>
                    <th className="px-4 py-3 text-right">Giá</th>
                    <th className="px-4 py-3 text-right">Tác vụ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredMedicines.map((medicine) => (
                    <tr key={medicine.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3">
                        <div className="font-medium text-slate-900">{medicine.name}</div>
                        <div className="text-xs text-slate-500">
                          {medicine.drugGroup || 'Chưa phân nhóm'}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {[medicine.strength, medicine.activeIngredient, medicine.route]
                          .filter(Boolean)
                          .join(' / ') || 'Chưa đủ metadata'}
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {[medicine.defaultDosage, medicine.defaultFrequency ? `${medicine.defaultFrequency} lần/ngày` : '']
                          .filter(Boolean)
                          .join(' • ') || 'Chưa có mặc định'}
                      </td>
                      <td className="px-4 py-3 text-right font-medium text-slate-700">
                        {new Intl.NumberFormat('vi-VN').format(medicine.price || 0)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => handleEdit(medicine)}
                            className="rounded-lg p-2 text-blue-600 transition hover:bg-blue-50"
                            title="Sửa"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => void handleDelete(medicine.id)}
                            className="rounded-lg p-2 text-red-600 transition hover:bg-red-50"
                            title="Xóa"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}

                  {!isLoading && filteredMedicines.length === 0 && (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-4 py-10 text-center text-sm text-slate-500"
                      >
                        Không tìm thấy thuốc phù hợp.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};
