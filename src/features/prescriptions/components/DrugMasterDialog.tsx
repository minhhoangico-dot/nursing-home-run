import React, { useMemo, useState } from 'react';
import { Search, X } from 'lucide-react';
import { Medicine } from '../../../types/medical';
import { MedicineManager } from './MedicineManager';

interface DrugMasterDialogProps {
  open: boolean;
  medicines: Medicine[];
  onClose: () => void;
  onSelect: (medicine: Medicine) => void;
  onCreateMedicine: () => void;
}

export const DrugMasterDialog = ({
  open,
  medicines,
  onClose,
  onSelect,
  onCreateMedicine,
}: DrugMasterDialogProps) => {
  const [query, setQuery] = useState('');
  const [showManager, setShowManager] = useState(false);

  const filteredMedicines = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return medicines;

    return medicines.filter((medicine) =>
      [medicine.name, medicine.activeIngredient, medicine.strength, medicine.route]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(normalizedQuery)),
    );
  }, [medicines, query]);

  if (!open) return null;

  if (showManager) {
    return (
      <MedicineManager
        onClose={() => {
          setShowManager(false);
          onCreateMedicine();
        }}
      />
    );
  }

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-3xl overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Danh mục thuốc</h3>
            <p className="mt-1 text-sm text-slate-500">Tìm và chọn thuốc từ danh mục có sẵn</p>
          </div>
          <button onClick={onClose} className="rounded-full p-2 text-slate-500 transition-colors hover:bg-slate-100">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="border-b border-slate-200 px-5 py-4">
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Tim thuoc..."
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                className="w-full rounded-lg border border-slate-300 py-2 pl-9 pr-3 outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <button
              onClick={() => setShowManager(true)}
              className="rounded-lg border border-teal-200 bg-teal-50 px-4 py-2 text-sm font-medium text-teal-700 transition-colors hover:bg-teal-100"
            >
              Them thuoc moi
            </button>
          </div>
        </div>

        <div className="max-h-[60vh] overflow-y-auto p-5">
          <div className="space-y-2">
            {filteredMedicines.map((medicine) => (
              <button
                key={medicine.id}
                onClick={() => onSelect(medicine)}
                className="flex w-full items-start justify-between rounded-xl border border-slate-200 px-4 py-3 text-left transition-colors hover:border-teal-300 hover:bg-teal-50"
              >
                <div>
                  <div className="font-semibold text-slate-900">{medicine.name}</div>
                  <div className="mt-1 text-sm text-slate-500">
                    {[medicine.activeIngredient, medicine.strength, medicine.route, medicine.unit]
                      .filter(Boolean)
                      .join(' • ')}
                  </div>
                </div>
              </button>
            ))}

            {filteredMedicines.length === 0 && (
              <div className="rounded-xl border border-dashed border-slate-200 px-4 py-8 text-center text-sm text-slate-400">
                Khong tim thay thuoc phu hop
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
