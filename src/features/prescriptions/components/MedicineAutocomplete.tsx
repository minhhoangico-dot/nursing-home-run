import React, { useDeferredValue, useMemo, useState } from 'react';
import { Search } from 'lucide-react';

import { type Medicine } from '@/src/types/medical';

interface MedicineAutocompleteProps {
  medicines: Medicine[];
  value: string;
  onChange: (value: string) => void;
  onSelect: (medicine: Medicine) => void;
  placeholder?: string;
  autoFocus?: boolean;
}

function buildSecondaryLine(medicine: Medicine): string {
  return [medicine.strength, medicine.activeIngredient, medicine.route]
    .filter(Boolean)
    .join(' / ');
}

export const MedicineAutocomplete = ({
  medicines,
  value,
  onChange,
  onSelect,
  placeholder = 'Gõ tên thuốc hoặc hoạt chất',
  autoFocus = false,
}: MedicineAutocompleteProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const deferredValue = useDeferredValue(value);

  const filteredMedicines = useMemo(() => {
    const query = deferredValue.trim().toLowerCase();

    if (!query) {
      return medicines.slice(0, 8);
    }

    return medicines
      .filter((medicine) => {
        const searchableText = [
          medicine.name,
          medicine.activeIngredient,
          medicine.strength,
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();

        return searchableText.includes(query);
      })
      .slice(0, 8);
  }, [deferredValue, medicines]);

  const handleSelect = (medicine: Medicine) => {
    onChange(medicine.name);
    onSelect(medicine);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-slate-400" />
      <input
        autoFocus={autoFocus}
        type="text"
        value={value}
        onFocus={() => setIsOpen(true)}
        onBlur={() => {
          window.setTimeout(() => setIsOpen(false), 120);
        }}
        onChange={(event) => {
          onChange(event.currentTarget.value);
          setIsOpen(true);
        }}
        onKeyDown={(event) => {
          if (event.key === 'Enter' && filteredMedicines.length > 0) {
            event.preventDefault();
            handleSelect(filteredMedicines[0]);
          }
        }}
        placeholder={placeholder}
        className="w-full rounded-xl border border-slate-300 py-2.5 pl-9 pr-3 text-sm outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
      />

      {isOpen && filteredMedicines.length > 0 && (
        <div className="absolute z-20 mt-2 w-full overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
          <ul role="listbox" className="max-h-72 overflow-y-auto py-2">
            {filteredMedicines.map((medicine) => (
              <li key={medicine.id}>
                <button
                  type="button"
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => handleSelect(medicine)}
                  className="flex w-full flex-col px-4 py-3 text-left transition hover:bg-slate-50"
                >
                  <span className="text-sm font-medium text-slate-900">
                    {medicine.name}
                  </span>
                  <span className="text-xs text-slate-500">
                    {buildSecondaryLine(medicine)}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
