import React, { useDeferredValue, useEffect, useId, useRef, useState } from 'react';
import { Medicine } from '../../../types';

interface MedicineComboboxProps {
  medicines: Medicine[];
  value: string;
  onInputChange: (value: string) => void;
  onSelect: (medicine: Medicine) => void;
  placeholder?: string;
  disabled?: boolean;
  locked?: boolean;
  className?: string;
}

const stripDiacritics = (value: string) =>
  value.normalize('NFD').replace(/[\u0300-\u036f]/g, '');

const normalizeSearchText = (value?: string | null) =>
  stripDiacritics(String(value ?? ''))
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();

const scoreSuggestion = (medicine: Medicine, query: string) => {
  const fields = {
    name: normalizeSearchText(medicine.name),
    code: normalizeSearchText(medicine.code),
    tradeName: normalizeSearchText(medicine.tradeName),
    activeIngredient: normalizeSearchText(medicine.activeIngredient),
  };

  const checks: Array<[string, number, boolean]> = [
    [fields.name, 0, true],
    [fields.code, 1, true],
    [fields.tradeName, 2, true],
    [fields.activeIngredient, 3, true],
    [fields.name, 4, false],
    [fields.tradeName, 5, false],
    [fields.activeIngredient, 6, false],
    [fields.code, 7, false],
  ];

  for (const [candidate, score, startsWithOnly] of checks) {
    if (!candidate) continue;
    if (startsWithOnly) {
      if (candidate.startsWith(query)) return score;
      continue;
    }
    if (candidate.includes(query)) return score;
  }

  return Number.POSITIVE_INFINITY;
};

const getSuggestions = (medicines: Medicine[], query: string, limit = 10) => {
  const normalizedQuery = normalizeSearchText(query);
  if (!normalizedQuery) return [];

  return medicines
    .map((medicine, index) => ({
      medicine,
      index,
      score: scoreSuggestion(medicine, normalizedQuery),
    }))
    .filter((entry) => Number.isFinite(entry.score))
    .sort((left, right) => {
      if (left.score !== right.score) {
        return left.score - right.score;
      }

      return left.index - right.index;
    })
    .slice(0, limit)
    .map((entry) => entry.medicine);
};

export const MedicineCombobox = ({
  medicines,
  value,
  onInputChange,
  onSelect,
  placeholder,
  disabled,
  locked,
  className,
}: MedicineComboboxProps) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const listboxId = useId();
  const deferredQuery = useDeferredValue(value);
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);

  const suggestions = getSuggestions(medicines, deferredQuery);
  const shouldShowSuggestions = isOpen && !locked && value.trim().length > 0;

  useEffect(() => {
    if (!shouldShowSuggestions || suggestions.length === 0) {
      setHighlightedIndex(-1);
      return;
    }

    setHighlightedIndex((currentIndex) => {
      if (currentIndex >= 0 && currentIndex < suggestions.length) {
        return currentIndex;
      }
      return 0;
    });
  }, [shouldShowSuggestions, suggestions.length]);

  const selectMedicine = (medicine: Medicine) => {
    setIsOpen(false);
    setHighlightedIndex(-1);
    onSelect(medicine);
  };

  return (
    <div ref={containerRef} className={className}>
      <input
        role="combobox"
        aria-autocomplete="list"
        aria-expanded={shouldShowSuggestions}
        aria-controls={shouldShowSuggestions ? listboxId : undefined}
        aria-activedescendant={
          shouldShowSuggestions && highlightedIndex >= 0
            ? `${listboxId}-option-${highlightedIndex}`
            : undefined
        }
        className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-sm font-medium focus:ring-2 focus:ring-teal-500 outline-none bg-white"
        placeholder={placeholder}
        value={value}
        disabled={disabled}
        autoComplete="off"
        onFocus={() => {
          if (!locked && value.trim()) {
            setIsOpen(true);
          }
        }}
        onBlur={(event) => {
          const nextTarget = event.relatedTarget as Node | null;
          if (nextTarget && containerRef.current?.contains(nextTarget)) {
            return;
          }
          setIsOpen(false);
        }}
        onChange={(event) => {
          const nextValue = event.target.value;
          onInputChange(nextValue);
          setIsOpen(nextValue.trim().length > 0);
        }}
        onKeyDown={(event) => {
          if (event.key === 'Escape') {
            setIsOpen(false);
            setHighlightedIndex(-1);
            return;
          }

          if (!shouldShowSuggestions || suggestions.length === 0) {
            return;
          }

          if (event.key === 'ArrowDown') {
            event.preventDefault();
            setHighlightedIndex((currentIndex) =>
              Math.min(currentIndex + 1, suggestions.length - 1),
            );
            return;
          }

          if (event.key === 'ArrowUp') {
            event.preventDefault();
            setHighlightedIndex((currentIndex) => Math.max(currentIndex - 1, 0));
            return;
          }

          if (event.key === 'Enter') {
            event.preventDefault();
            const selectedSuggestion =
              suggestions[highlightedIndex >= 0 ? highlightedIndex : 0];
            if (selectedSuggestion) {
              selectMedicine(selectedSuggestion);
            }
          }
        }}
      />

      {shouldShowSuggestions && (
        <div
          id={listboxId}
          role="listbox"
          className="absolute z-20 mt-1 w-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl"
        >
          {suggestions.length > 0 ? (
            suggestions.map((medicine, index) => (
              <button
                key={medicine.id}
                id={`${listboxId}-option-${index}`}
                type="button"
                role="option"
                aria-selected={index === highlightedIndex}
                className={`block w-full px-3 py-2 text-left text-sm transition-colors ${
                  index === highlightedIndex
                    ? 'bg-teal-50 text-teal-900'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
                onMouseDown={(event) => {
                  event.preventDefault();
                  selectMedicine(medicine);
                }}
                onMouseEnter={() => {
                  setHighlightedIndex(index);
                }}
              >
                <div className="font-medium">{medicine.name}</div>
                {(medicine.code || medicine.activeIngredient) && (
                  <div className="mt-0.5 text-xs text-slate-500">
                    {[medicine.code, medicine.activeIngredient].filter(Boolean).join(' • ')}
                  </div>
                )}
              </button>
            ))
          ) : (
            <div className="px-3 py-2 text-sm text-slate-500">
              Khong tim thay thuoc trong danh muc
            </div>
          )}
        </div>
      )}
    </div>
  );
};
