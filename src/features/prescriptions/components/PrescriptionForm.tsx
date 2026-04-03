import React, { useEffect, useState, useRef, useCallback, useId } from 'react';
import { Plus, Trash2, X, Save, AlertCircle, Search, Pill, ChevronDown } from 'lucide-react';
import { Prescription, PrescriptionItem, Medicine, Resident, User } from '../../../types/index';
import { usePrescriptionsStore } from '../../../stores/prescriptionStore';
import { normalizeMedicineText } from '../utils/medicineCatalog';

interface PrescriptionFormProps {
  user: User;
  resident?: Resident;
  residents?: Resident[];
  editingPrescription?: Prescription | null;
  onClose: () => void;
  onSave: () => void;
}

interface ItemFormData {
  id: string;
  medicineId?: string;
  medicineName: string;
  dosage: string;
  frequency: string;
  timesOfDay: string[];
  quantity: number;
  instructions: string;
  startDate: string;
  endDate: string;
  continuous: boolean;
}

const todayStr = () => new Date().toISOString().split('T')[0];

const createEmptyItem = (defaultStartDate: string): ItemFormData => ({
  id: Date.now().toString(),
  medicineName: '',
  dosage: '',
  frequency: '2 lần/ngày',
  timesOfDay: ['Sáng', 'Chiều'],
  quantity: 0,
  instructions: '',
  startDate: defaultStartDate || todayStr(),
  endDate: '',
  continuous: false,
});

const findExactMedicineMatches = (medicines: Medicine[], value: string) => {
  const normalizedValue = normalizeMedicineText(value).toLowerCase();
  if (!normalizedValue) {
    return [];
  }

  return medicines.filter((medicine) => {
    const normalizedName = normalizeMedicineText(medicine.name).toLowerCase();
    const normalizedIngredient = normalizeMedicineText(medicine.activeIngredient).toLowerCase();

    return normalizedName === normalizedValue || normalizedIngredient === normalizedValue;
  });
};

const bindMedicineToItem = (
  item: ItemFormData,
  medicines: Medicine[],
  nextValue: string,
  selectedMedicine?: Medicine,
): ItemFormData => {
  const exactMatches = selectedMedicine ? [selectedMedicine] : findExactMedicineMatches(medicines, nextValue);
  const matchedMedicine = exactMatches.length === 1 ? exactMatches[0] : undefined;

  if (!matchedMedicine) {
    return {
      ...item,
      medicineId: undefined,
      medicineName: nextValue,
    };
  }

  return {
    ...item,
    medicineId: matchedMedicine.id,
    medicineName: matchedMedicine.name,
    dosage: item.dosage || matchedMedicine.defaultDosage || '',
  };
};

// ─── Medicine Autocomplete ─────────────────────────────────────────
interface MedicineAutocompleteProps {
  value: string;
  medicines: Medicine[];
  onChange: (name: string, medicine?: Medicine) => void;
  onAddNew: () => void;
  inputRef?: React.RefObject<HTMLInputElement | null>;
}

const MedicineAutocomplete = ({ value, medicines, onChange, onAddNew, inputRef }: MedicineAutocompleteProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState(-1);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const listboxId = useId();

  const query = value.toLowerCase();
  const filtered = query.length >= 1
    ? medicines.filter(m =>
      m.name.toLowerCase().includes(query) ||
      m.activeIngredient?.toLowerCase().includes(query)
    ).slice(0, 8)
    : [];

  const showDropdown = isOpen && query.length >= 1;

  useEffect(() => {
    setHighlightIndex(-1);
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectMedicine = (med: Medicine) => {
    onChange(med.name, med);
    setIsOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showDropdown) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightIndex(prev => Math.min(prev + 1, filtered.length)); // +1 for "add new" option
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightIndex(prev => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (highlightIndex >= 0 && highlightIndex < filtered.length) {
        selectMedicine(filtered[highlightIndex]);
      } else if (highlightIndex === filtered.length) {
        onAddNew();
        setIsOpen(false);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  return (
    <div ref={wrapperRef} className="relative">
      <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400 pointer-events-none" />
      <input
        ref={inputRef}
        role="combobox"
        aria-autocomplete="list"
        aria-expanded={showDropdown}
        aria-controls={showDropdown ? listboxId : undefined}
        aria-activedescendant={
          showDropdown && highlightIndex >= 0 && highlightIndex < filtered.length
            ? `${listboxId}-option-${highlightIndex}`
            : undefined
        }
        className="w-full rounded-lg border border-slate-300 bg-white py-2 pl-9 pr-3 text-sm font-medium outline-none focus:ring-2 focus:ring-teal-500"
        placeholder="Tìm tên thuốc..."
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          setIsOpen(true);
        }}
        onFocus={() => setIsOpen(true)}
        onKeyDown={handleKeyDown}
      />
      {showDropdown && (
        <div
          id={listboxId}
          role="listbox"
          className="absolute z-50 mt-1 w-full rounded-lg border border-slate-200 bg-white shadow-xl max-h-64 overflow-y-auto"
        >
          {filtered.map((med, idx) => (
            <button
              key={med.id}
              id={`${listboxId}-option-${idx}`}
              type="button"
              role="option"
              aria-selected={idx === highlightIndex}
              className={`w-full px-3 py-2 text-left flex items-center gap-2 transition-colors ${idx === highlightIndex ? 'bg-teal-50' : 'hover:bg-slate-50'
                }`}
              onClick={() => selectMedicine(med)}
              onMouseEnter={() => setHighlightIndex(idx)}
            >
              <div className="flex-1 min-w-0">
                <div className="font-medium text-slate-800 text-sm truncate">{med.name}</div>
                {med.activeIngredient && (
                  <div className="text-xs text-slate-500 truncate">{med.activeIngredient}</div>
                )}
              </div>
              {med.strength && (
                <span className="shrink-0 px-1.5 py-0.5 bg-blue-50 text-blue-700 rounded text-xs border border-blue-100">
                  {med.strength}
                </span>
              )}
              {med.unit && (
                <span className="shrink-0 text-xs text-slate-400">{med.unit}</span>
              )}
            </button>
          ))}
          {filtered.length === 0 && (
            <div className="px-3 py-2 text-sm text-slate-400">Không tìm thấy thuốc nào</div>
          )}
          <button
            type="button"
            className={`w-full px-3 py-2 text-left flex items-center gap-2 border-t border-slate-100 transition-colors ${highlightIndex === filtered.length ? 'bg-teal-50' : 'hover:bg-slate-50'
              }`}
            onClick={() => {
              onAddNew();
              setIsOpen(false);
            }}
            onMouseEnter={() => setHighlightIndex(filtered.length)}
          >
            <Plus className="w-4 h-4 text-teal-600" />
            <span className="text-sm font-medium text-teal-600">Thêm thuốc mới vào danh mục</span>
          </button>
        </div>
      )}
    </div>
  );
};

// ─── Quick Add Medicine Inline ─────────────────────────────────────
interface QuickAddMedicineProps {
  onSave: (medicine: Partial<Medicine>) => Promise<void>;
  onCancel: () => void;
}

const QuickAddMedicine = ({ onSave, onCancel }: QuickAddMedicineProps) => {
  const [name, setName] = useState('');
  const [unit, setUnit] = useState('viên');
  const [activeIngredient, setActiveIngredient] = useState('');
  const [strength, setStrength] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!name || !unit) return;
    setSaving(true);
    try {
      await onSave({ name, unit, activeIngredient: activeIngredient || undefined, strength: strength || undefined, route: 'Uống' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="rounded-lg border border-teal-200 bg-teal-50/50 p-3 mb-3">
      <div className="text-xs font-semibold text-teal-700 mb-2">Thêm thuốc mới nhanh</div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        <input
          autoFocus
          className="rounded border border-slate-300 px-2 py-1.5 text-sm outline-none focus:ring-1 focus:ring-teal-500"
          placeholder="Tên thuốc *"
          value={name}
          onChange={e => setName(e.target.value)}
        />
        <input
          className="rounded border border-slate-300 px-2 py-1.5 text-sm outline-none"
          placeholder="Hoạt chất"
          value={activeIngredient}
          onChange={e => setActiveIngredient(e.target.value)}
        />
        <input
          className="rounded border border-slate-300 px-2 py-1.5 text-sm outline-none"
          placeholder="Hàm lượng (500mg)"
          value={strength}
          onChange={e => setStrength(e.target.value)}
        />
        <input
          className="rounded border border-slate-300 px-2 py-1.5 text-sm outline-none"
          placeholder="Đơn vị *"
          value={unit}
          onChange={e => setUnit(e.target.value)}
        />
      </div>
      <div className="flex gap-2 mt-2 justify-end">
        <button onClick={onCancel} className="px-3 py-1 text-sm text-slate-500 hover:text-slate-700">Hủy</button>
        <button
          onClick={handleSave}
          disabled={!name || !unit || saving}
          className="px-3 py-1 text-sm bg-teal-600 text-white rounded hover:bg-teal-700 disabled:opacity-50"
        >
          {saving ? 'Đang lưu...' : 'Lưu & chọn'}
        </button>
      </div>
    </div>
  );
};

// ─── Main Form ─────────────────────────────────────────────────────
export const PrescriptionForm = ({
  user,
  resident: initialResident,
  residents,
  editingPrescription,
  onClose,
  onSave,
}: PrescriptionFormProps) => {
  const { createPrescription, updatePrescription, medicines, fetchMedicines, createMedicine } = usePrescriptionsStore();

  const defaultStart = editingPrescription?.startDate || todayStr();
  const [selectedResidentId, setSelectedResidentId] = useState(initialResident?.id || editingPrescription?.residentId || '');
  const [diagnosis, setDiagnosis] = useState(editingPrescription?.diagnosis || '');
  const [notes, setNotes] = useState(editingPrescription?.notes || '');
  const [duration, setDuration] = useState(7);
  const [items, setItems] = useState<ItemFormData[]>(() => {
    if (editingPrescription?.items?.length) {
      return editingPrescription.items.map((item, index) => ({
        id: item.id || `${Date.now()}-${index}`,
        medicineId: item.medicineId,
        medicineName: item.medicineName,
        dosage: item.dosage,
        frequency: item.frequency,
        timesOfDay: item.timesOfDay,
        quantity: item.quantity || 0,
        instructions: item.instructions || '',
        startDate: item.startDate || editingPrescription.startDate || todayStr(),
        endDate: item.endDate || editingPrescription.endDate || '',
        continuous: item.continuous || false,
      }));
    }
    return [createEmptyItem(defaultStart)];
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [quickAddIndex, setQuickAddIndex] = useState<number | null>(null);
  const [isInitialCatalogLoading, setIsInitialCatalogLoading] = useState(medicines.length === 0);

  // Refs for auto-focus on new items
  const newItemRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    let isMounted = true;

    Promise.resolve(fetchMedicines())
      .catch(() => undefined)
      .finally(() => {
        if (isMounted) {
          setIsInitialCatalogLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [fetchMedicines]);

  useEffect(() => {
    if (medicines.length === 0) {
      return;
    }

    setItems(prev =>
      prev.map((item) => {
        if (item.medicineId || !item.medicineName.trim()) {
          return item;
        }

        return bindMedicineToItem(item, medicines, item.medicineName);
      }),
    );
  }, [medicines]);

  useEffect(() => {
    if (!editingPrescription) return;
    setSelectedResidentId(editingPrescription.residentId);
    setDiagnosis(editingPrescription.diagnosis || '');
    setNotes(editingPrescription.notes || '');

    const startDate = editingPrescription.startDate ? new Date(editingPrescription.startDate) : new Date();
    const endDate = editingPrescription.endDate ? new Date(editingPrescription.endDate) : new Date(startDate);
    const diffDays = Math.max(1, Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)));
    setDuration(diffDays);

    setItems(
      editingPrescription.items?.length
        ? editingPrescription.items.map((item, index) => ({
          id: item.id || `${Date.now()}-${index}`,
          medicineId: item.medicineId,
          medicineName: item.medicineName,
          dosage: item.dosage,
          frequency: item.frequency,
          timesOfDay: item.timesOfDay,
          quantity: item.quantity || 0,
          instructions: item.instructions || '',
          startDate: item.startDate || editingPrescription.startDate || todayStr(),
          endDate: item.endDate || editingPrescription.endDate || '',
          continuous: item.continuous || false,
        }))
        : [createEmptyItem(defaultStart)]
    );
  }, [editingPrescription]);

  const selectedResident = initialResident || residents?.find(r => r.id === selectedResidentId);
  const prescriptionCode = editingPrescription?.code ||
    `DT-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;
  const areMedicinesReady = !isInitialCatalogLoading;

  const handleAddItem = () => {
    const newItem = createEmptyItem(defaultStart);
    setItems(prev => [...prev, newItem]);
    // Focus will be handled by ref on next render
    setTimeout(() => newItemRef.current?.focus(), 50);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length <= 1) return;
    setItems(prev => {
      const next = [...prev];
      next.splice(index, 1);
      return next;
    });
  };

  const updateItem = useCallback((index: number, updates: Partial<ItemFormData>) => {
    setItems(prev => {
      const next = [...prev];
      next[index] = { ...next[index], ...updates };
      return next;
    });
  }, []);

  const handleMedicineSelect = (index: number, name: string, medicine?: Medicine) => {
    const currentItem = items[index];

    if (!currentItem) {
      return;
    }

    const normalizedCurrent = normalizeMedicineText(currentItem.medicineName).toLowerCase();
    const normalizedNext = normalizeMedicineText(name).toLowerCase();

    if (!normalizedNext) {
      updateItem(index, {
        medicineId: undefined,
        medicineName: '',
      });
      return;
    }

    if (currentItem.medicineId && !medicine && normalizedNext !== normalizedCurrent) {
      return;
    }

    updateItem(index, bindMedicineToItem(currentItem, medicines, name, medicine));
  };

  const handleQuickAddSave = async (index: number, medicineData: Partial<Medicine>) => {
    try {
      await createMedicine(medicineData);
      // After creating, the medicine list is refreshed in the store
      // Select the new medicine
      updateItem(index, { medicineName: medicineData.name || '' });
      setQuickAddIndex(null);
    } catch (e) {
      console.error('Quick add medicine failed', e);
    }
  };

  // When duration changes, update endDate for all non-continuous items
  const handleDurationChange = (newDuration: number) => {
    setDuration(newDuration);
    const start = new Date(defaultStart);
    const end = new Date(start);
    end.setDate(end.getDate() + newDuration);
    const endStr = end.toISOString().split('T')[0];

    setItems(prev => prev.map(item =>
      item.continuous ? item : { ...item, endDate: endStr }
    ));
  };

  const handleSubmit = async () => {
    if (!selectedResidentId || !diagnosis) {
      setError('Vui lòng chọn NCT và nhập chẩn đoán');
      return;
    }
    if (items.some(item => item.medicineName.trim() && !item.medicineId)) {
      setError('Vui lòng chọn thuốc từ danh mục nội bộ');
      return;
    }
    if (items.some(item => !item.medicineName || !item.dosage)) {
      setError('Vui lòng điền đầy đủ tên thuốc và liều lượng');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const now = new Date();
      const startDate = editingPrescription?.startDate || now.toISOString().split('T')[0];

      // Calculate prescription-level endDate from the latest item endDate
      const itemEndDates = items
        .filter(i => !i.continuous && i.endDate)
        .map(i => new Date(i.endDate).getTime());
      const latestEnd = itemEndDates.length > 0
        ? new Date(Math.max(...itemEndDates)).toISOString().split('T')[0]
        : undefined;

      const payload = {
        code: prescriptionCode,
        residentId: selectedResidentId,
        doctorId: user.id || 'current-user-id',
        doctorName: user.name,
        diagnosis,
        prescriptionDate: editingPrescription?.prescriptionDate || now.toISOString().split('T')[0],
        startDate,
        endDate: latestEnd,
        status: editingPrescription?.status || 'Active' as const,
        notes,
        duplicatedFromId: editingPrescription?.duplicatedFromId,
      };

      const itemsPayload = items.map(item => ({
        medicineId: item.medicineId,
        medicineName: item.medicineName,
        dosage: item.dosage,
        frequency: item.frequency,
        timesOfDay: item.timesOfDay,
        quantity: item.quantity,
        instructions: item.instructions || undefined,
        startDate: item.startDate || startDate,
        endDate: item.continuous ? undefined : (item.endDate || undefined),
        continuous: item.continuous,
      }));

      if (editingPrescription?.id) {
        await updatePrescription(editingPrescription.id, payload, itemsPayload as any);
      } else {
        await createPrescription(payload, itemsPayload as any);
      }

      onSave();
      onClose();
    } catch (e: any) {
      setError(e.message || 'Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="flex max-h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between bg-teal-600 px-6 py-4 text-white">
          <div>
            <h2 className="flex items-center gap-2 text-xl font-bold">
              <Pill className="h-5 w-5" /> {editingPrescription ? 'Điều chỉnh đơn thuốc' : 'Kê đơn thuốc mới'}
            </h2>
            <p className="mt-1 text-sm text-teal-100 opacity-90">Mã đơn: {prescriptionCode}</p>
          </div>
          <button onClick={onClose} className="rounded-full p-1 transition-colors hover:bg-white/20">
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {error && (
            <div role="alert" className="mb-4 flex items-center gap-2 rounded-lg border border-red-100 bg-red-50 p-3 text-red-600">
              <AlertCircle className="h-5 w-5 shrink-0" /> {error}
            </div>
          )}

          {/* Prescription header fields */}
          <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-semibold text-slate-700">Người cao tuổi</label>
                {initialResident ? (
                  <div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-teal-100 font-bold text-teal-600">
                      {initialResident.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-bold text-slate-900">{initialResident.name}</p>
                      <p className="text-xs text-slate-500">Phòng {initialResident.room} - {initialResident.careLevel}</p>
                    </div>
                  </div>
                ) : (
                  <select
                    className="w-full rounded-lg border border-slate-300 p-2.5 outline-none focus:ring-2 focus:ring-teal-500"
                    value={selectedResidentId}
                    onChange={e => setSelectedResidentId(e.target.value)}
                  >
                    <option value="">-- Chọn NCT --</option>
                    {residents?.map(r => (
                      <option key={r.id} value={r.id}>{r.name} - {r.room}</option>
                    ))}
                  </select>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-semibold text-slate-700">Chẩn đoán / Lý do</label>
                <input
                  type="text"
                  className="w-full rounded-lg border border-slate-300 p-2.5 outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="VD: Tăng huyết áp"
                  value={diagnosis}
                  onChange={e => setDiagnosis(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="mb-6 flex gap-4">
            <div className="w-36">
              <label className="mb-1 block text-sm font-semibold text-slate-700">Thời gian (ngày)</label>
              <input
                type="number"
                className="w-full rounded-lg border border-slate-300 p-2.5 outline-none focus:ring-2 focus:ring-teal-500"
                value={duration}
                onChange={e => handleDurationChange(Number(e.target.value))}
              />
            </div>
            <div className="flex-1">
              <label className="mb-1 block text-sm font-semibold text-slate-700">Ghi chú chung</label>
              <input
                type="text"
                className="w-full rounded-lg border border-slate-300 p-2.5 outline-none focus:ring-2 focus:ring-teal-500"
                placeholder="Lưu ý cho điều dưỡng"
                value={notes}
                onChange={e => setNotes(e.target.value)}
              />
            </div>
          </div>

          {/* Medicine items */}
          <div className="mb-2">
            <div className="mb-2 flex items-center justify-between">
              <h3 className="flex items-center gap-2 font-bold text-slate-800">
                <Pill className="h-5 w-5 text-teal-600" /> Danh sách thuốc
              </h3>
              <button
                onClick={handleAddItem}
                className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm font-semibold text-teal-600 transition-colors hover:bg-teal-50"
              >
                <Plus className="h-4 w-4" /> Thêm thuốc
              </button>
            </div>

            <div className="space-y-3">
              {items.map((item, index) => (
                <div
                  key={item.id}
                  className="group relative rounded-xl border border-slate-200 bg-slate-50/50 p-4 transition-all hover:border-teal-200 hover:shadow-sm"
                >
                  <button
                    onClick={() => handleRemoveItem(index)}
                    className="absolute right-2 top-2 rounded-lg p-1.5 text-slate-400 opacity-0 transition-all hover:bg-red-50 hover:text-red-500 group-hover:opacity-100"
                    title="Xóa dòng này"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>

                  {/* Quick add medicine inline */}
                  {quickAddIndex === index && (
                    <QuickAddMedicine
                      onSave={(med) => handleQuickAddSave(index, med)}
                      onCancel={() => setQuickAddIndex(null)}
                    />
                  )}

                  {/* Row 1: Medicine name, dosage, frequency, times */}
                  <div className="grid grid-cols-12 gap-3">
                    <div className="col-span-12 md:col-span-4">
                      <label className="mb-1 block text-xs font-semibold text-slate-500">Tên thuốc</label>
                      <MedicineAutocomplete
                        value={item.medicineName}
                        medicines={medicines}
                        onChange={(name, med) => handleMedicineSelect(index, name, med)}
                        onAddNew={() => setQuickAddIndex(index)}
                        inputRef={index === items.length - 1 ? newItemRef : undefined}
                      />
                    </div>
                    <div className="col-span-6 md:col-span-2">
                      <label className="mb-1 block text-xs font-semibold text-slate-500">Liều lượng</label>
                      <input
                        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-teal-500"
                        placeholder="VD: 1 viên"
                        value={item.dosage}
                        onChange={e => updateItem(index, { dosage: e.target.value })}
                      />
                    </div>
                    <div className="col-span-6 md:col-span-3">
                      <label className="mb-1 block text-xs font-semibold text-slate-500">Tần suất</label>
                      <input
                        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-teal-500"
                        placeholder="VD: 2 lần/ngày"
                        value={item.frequency}
                        onChange={e => updateItem(index, { frequency: e.target.value })}
                      />
                    </div>
                    <div className="col-span-12 md:col-span-3">
                      <label className="mb-1 block text-xs font-semibold text-slate-500">Thời điểm</label>
                      <div className="flex flex-wrap gap-1">
                        {['Sáng', 'Trưa', 'Chiều', 'Tối'].map(time => (
                          <button
                            key={time}
                            type="button"
                            onClick={() => {
                              const current = item.timesOfDay || [];
                              const next = current.includes(time)
                                ? current.filter(v => v !== time)
                                : [...current, time];
                              updateItem(index, { timesOfDay: next });
                            }}
                            className={`rounded border px-2.5 py-1 text-xs font-medium transition-colors ${item.timesOfDay?.includes(time)
                              ? 'border-teal-600 bg-teal-600 text-white'
                              : 'border-slate-200 bg-white text-slate-600 hover:border-teal-300'
                              }`}
                          >
                            {time}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Row 2: Instructions + dates */}
                  <div className="mt-3 grid grid-cols-12 gap-3 border-t border-slate-100 pt-3">
                    <div className="col-span-12 md:col-span-4">
                      <input
                        className="w-full border-none bg-transparent p-0 text-sm text-slate-600 placeholder:text-slate-400 focus:ring-0 outline-none"
                        placeholder="Hướng dẫn thêm (trước ăn, sau ăn...)"
                        value={item.instructions}
                        onChange={e => updateItem(index, { instructions: e.target.value })}
                      />
                    </div>
                    <div className="col-span-4 md:col-span-2">
                      <label className="mb-1 block text-xs font-semibold text-slate-500">Bắt đầu</label>
                      <input
                        type="date"
                        className="w-full rounded border border-slate-300 bg-white px-2 py-1 text-sm outline-none focus:ring-1 focus:ring-teal-500"
                        value={item.startDate}
                        onChange={e => updateItem(index, { startDate: e.target.value })}
                      />
                    </div>
                    <div className="col-span-4 md:col-span-2">
                      <label className="mb-1 block text-xs font-semibold text-slate-500">Kết thúc</label>
                      <input
                        type="date"
                        className="w-full rounded border border-slate-300 bg-white px-2 py-1 text-sm outline-none focus:ring-1 focus:ring-teal-500 disabled:opacity-40"
                        value={item.endDate}
                        disabled={item.continuous}
                        onChange={e => updateItem(index, { endDate: e.target.value })}
                      />
                    </div>
                    <div className="col-span-4 md:col-span-2 flex items-end">
                      <label className="flex items-center gap-2 cursor-pointer py-1">
                        <input
                          type="checkbox"
                          className="rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                          checked={item.continuous}
                          onChange={e => {
                            updateItem(index, {
                              continuous: e.target.checked,
                              endDate: e.target.checked ? '' : item.endDate,
                            });
                          }}
                        />
                        <span className="text-xs font-medium text-slate-600">Liên tục</span>
                      </label>
                    </div>
                    <div className="col-span-6 md:col-span-2">
                      <label className="mb-1 block text-xs font-semibold text-slate-500">Số lượng</label>
                      <input
                        type="number"
                        className="w-full rounded border border-slate-300 bg-white px-2 py-1 text-sm outline-none focus:ring-1 focus:ring-teal-500"
                        value={item.quantity || ''}
                        onChange={e => updateItem(index, { quantity: Number(e.target.value) })}
                        placeholder="0"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 border-t border-slate-200 bg-slate-50 p-4">
          <button onClick={onClose} className="rounded-xl px-6 py-2.5 font-medium text-slate-600 transition-colors hover:bg-slate-200">
            Hủy bỏ
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading || !areMedicinesReady}
            className="flex items-center gap-2 rounded-xl bg-teal-600 px-6 py-2.5 font-bold text-white shadow-lg shadow-teal-200 transition-all hover:bg-teal-700 disabled:opacity-70"
          >
            {loading ? 'Đang lưu...' : <><Save className="h-5 w-5" /> {editingPrescription ? 'Lưu điều chỉnh' : 'Lưu đơn thuốc'}</>}
          </button>
        </div>
      </div>
    </div>
  );
};
