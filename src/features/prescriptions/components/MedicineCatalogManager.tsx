import React, { useEffect, useMemo, useState } from 'react';
import { Edit2, Plus, Save, Search, Trash2, X } from 'lucide-react';
import { usePrescriptionsStore } from '../../../stores/prescriptionStore';
import { Medicine } from '../../../types/medical';
import { buildMedicineDisplayName } from '../utils/medicineCatalog';

type FormState = {
  code: string;
  activeIngredient: string;
  tradeName: string;
  unit: string;
  route: string;
};

const emptyForm: FormState = {
  code: '',
  activeIngredient: '',
  tradeName: '',
  unit: '',
  route: '',
};

const sourceLabel = (source?: Medicine['source']) =>
  source === 'HIS_IMPORT' ? 'HIS' : 'Thủ công';

export const MedicineCatalogManager = () => {
  const {
    medicines,
    fetchMedicines,
    createMedicine,
    updateMedicine,
    deleteMedicine,
    isLoading,
  } = usePrescriptionsStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [editingMedicine, setEditingMedicine] = useState<Medicine | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm);

  useEffect(() => {
    void fetchMedicines();
  }, [fetchMedicines]);

  const derivedName = buildMedicineDisplayName(
    form.activeIngredient,
    form.tradeName,
  );

  const filteredMedicines = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return medicines;

    return medicines.filter((medicine) =>
      [
        medicine.code,
        medicine.name,
        medicine.tradeName,
        medicine.activeIngredient,
        medicine.unit,
        medicine.route,
        sourceLabel(medicine.source),
      ]
        .filter(Boolean)
        .some((value) => value!.toLowerCase().includes(term)),
    );
  }, [medicines, searchTerm]);

  const resetForm = () => {
    setForm(emptyForm);
    setEditingMedicine(null);
    setIsAdding(false);
  };

  const openAddForm = () => {
    setEditingMedicine(null);
    setForm(emptyForm);
    setIsAdding(true);
  };

  const openEditForm = (medicine: Medicine) => {
    setEditingMedicine(medicine);
    setIsAdding(false);
    setForm({
      code: medicine.code ?? '',
      activeIngredient: medicine.activeIngredient ?? '',
      tradeName: medicine.tradeName ?? '',
      unit: medicine.unit ?? '',
      route: medicine.route ?? '',
    });
  };

  const updateFormField = (field: keyof FormState, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleSave = async () => {
    const payload: Partial<Medicine> = {
      code: form.code || undefined,
      activeIngredient: form.activeIngredient,
      tradeName: form.tradeName || undefined,
      unit: form.unit,
      route: form.route || undefined,
      name: derivedName,
    };

    try {
      if (editingMedicine) {
        await updateMedicine(editingMedicine.id, payload);
      } else {
        await createMedicine(payload);
      }
      resetForm();
    } catch (error) {
      console.error('Failed to save medicine', error);
      alert('Lỗi khi lưu thuốc');
    }
  };

  const handleDelete = async (medicine: Medicine) => {
    if (!confirm('Bạn có chắc muốn xóa thuốc này?')) return;

    try {
      await deleteMedicine(medicine.id);
    } catch (error) {
      console.error('Failed to delete medicine', error);
      alert('Không thể xóa thuốc đang được sử dụng trong đơn thuốc');
    }
  };

  const showForm = isAdding || editingMedicine !== null;
  const isFormValid = Boolean(form.activeIngredient.trim() && form.unit.trim());

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Tìm kiếm theo mã, tên thuốc, hoạt chất, tên thương mại..."
            className="w-full rounded-lg border border-slate-200 py-2 pl-9 pr-4 outline-none transition focus:border-teal-400 focus:ring-2 focus:ring-teal-100"
          />
        </div>
        <button
          type="button"
          onClick={openAddForm}
          disabled={showForm}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Plus className="h-4 w-4" />
          Thêm thuốc mới
        </button>
      </div>

      {showForm && (
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-slate-800">
                {editingMedicine ? 'Cập nhật thuốc' : 'Thêm thuốc thủ công'}
              </h3>
              <p className="text-sm text-slate-500">
                Tên hiển thị được tạo tự động từ hoạt chất và tên thương mại.
              </p>
            </div>
            <button
              type="button"
              onClick={resetForm}
              className="rounded-full p-2 text-slate-500 transition hover:bg-slate-200"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            <label className="space-y-1 text-sm text-slate-600">
              <span>Mã thuốc</span>
              <input
                value={form.code}
                onChange={(event) => updateFormField('code', event.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 outline-none transition focus:border-teal-400 focus:ring-2 focus:ring-teal-100"
              />
            </label>
            <label className="space-y-1 text-sm text-slate-600">
              <span>Hoạt chất</span>
              <input
                value={form.activeIngredient}
                onChange={(event) =>
                  updateFormField('activeIngredient', event.target.value)
                }
                className="w-full rounded-lg border border-slate-200 px-3 py-2 outline-none transition focus:border-teal-400 focus:ring-2 focus:ring-teal-100"
              />
            </label>
            <label className="space-y-1 text-sm text-slate-600">
              <span>Tên thương mại</span>
              <input
                value={form.tradeName}
                onChange={(event) => updateFormField('tradeName', event.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 outline-none transition focus:border-teal-400 focus:ring-2 focus:ring-teal-100"
              />
            </label>
            <label className="space-y-1 text-sm text-slate-600">
              <span>Đơn vị</span>
              <input
                value={form.unit}
                onChange={(event) => updateFormField('unit', event.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 outline-none transition focus:border-teal-400 focus:ring-2 focus:ring-teal-100"
              />
            </label>
            <label className="space-y-1 text-sm text-slate-600">
              <span>Đường dùng</span>
              <input
                value={form.route}
                onChange={(event) => updateFormField('route', event.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 outline-none transition focus:border-teal-400 focus:ring-2 focus:ring-teal-100"
              />
            </label>
            <label className="space-y-1 text-sm text-slate-600">
              <span>Tên hiển thị</span>
              <input
                aria-label="Tên hiển thị"
                value={derivedName}
                readOnly
                className="w-full rounded-lg border border-slate-200 bg-slate-100 px-3 py-2 text-slate-700 outline-none"
              />
            </label>
          </div>

          <div className="mt-4 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={resetForm}
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100"
            >
              Hủy
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={!isFormValid || isLoading}
              className="inline-flex items-center gap-2 rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              Lưu thuốc
            </button>
          </div>
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-slate-100 bg-white shadow-sm">
        <div className="overflow-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="px-4 py-3 font-medium">Mã</th>
                <th className="px-4 py-3 font-medium">Tên hiển thị</th>
                <th className="px-4 py-3 font-medium">Tên thương mại</th>
                <th className="px-4 py-3 font-medium">Đơn vị</th>
                <th className="px-4 py-3 font-medium">Đường dùng</th>
                <th className="px-4 py-3 font-medium">Nguồn</th>
                <th className="px-4 py-3 text-right font-medium">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredMedicines.map((medicine) => (
                <tr key={medicine.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium text-slate-700">
                    {medicine.code || '-'}
                  </td>
                  <td className="px-4 py-3 text-slate-800">{medicine.name}</td>
                  <td className="px-4 py-3 text-slate-600">
                    {medicine.tradeName || '-'}
                  </td>
                  <td className="px-4 py-3 text-slate-600">{medicine.unit || '-'}</td>
                  <td className="px-4 py-3 text-slate-600">
                    {medicine.route || '-'}
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
                      {sourceLabel(medicine.source)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => openEditForm(medicine)}
                        className="rounded p-2 text-blue-600 transition hover:bg-blue-50"
                        title="Sửa"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(medicine)}
                        className="rounded p-2 text-red-600 transition hover:bg-red-50"
                        title="Xóa"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredMedicines.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-slate-400">
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
