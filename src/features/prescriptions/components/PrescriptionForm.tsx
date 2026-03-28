import React, { useEffect, useState } from 'react';
import {
  Plus,
  Trash2,
  X,
  Save,
  AlertCircle,
  Search,
  Pill,
} from 'lucide-react';
import {
  Medicine,
  PrescriptionItem,
  Resident,
  User,
} from '../../../types/index';
import { usePrescriptionsStore } from '../../../stores/prescriptionStore';
import { buildMedicineDisplayName } from '../utils/medicineCatalog';
import { MedicineCombobox } from './MedicineCombobox';

interface PrescriptionFormProps {
  user: User;
  resident?: Resident;
  residents?: Resident[];
  onClose: () => void;
  onSave: () => void;
}

export const PrescriptionForm = ({
  user,
  resident: initialResident,
  residents,
  onClose,
  onSave,
}: PrescriptionFormProps) => {
  const { createPrescription, medicines, fetchMedicines } = usePrescriptionsStore();
  const [selectedResidentId, setSelectedResidentId] = useState(initialResident?.id || '');
  const [diagnosis, setDiagnosis] = useState('');
  const [notes, setNotes] = useState('');
  const [duration, setDuration] = useState(7);
  const [isCatalogReady, setIsCatalogReady] = useState(medicines.length > 0);
  const [items, setItems] = useState<Partial<PrescriptionItem>[]>([
    {
      id: Date.now().toString(),
      medicineName: '',
      dosage: '',
      frequency: '2 láº§n/ngÃ y',
      timesOfDay: ['SÃ¡ng', 'Chiá»u'],
      quantity: 0,
    },
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    setIsCatalogReady(medicines.length > 0);

    Promise.resolve(fetchMedicines()).finally(() => {
      if (isMounted) {
        setIsCatalogReady(true);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [fetchMedicines]);

  const getMedicineDisplayName = (medicine: Medicine) =>
    medicine.name || buildMedicineDisplayName(medicine.activeIngredient, medicine.tradeName);

  const selectedResident =
    initialResident || residents?.find((resident) => resident.id === selectedResidentId);
  const prescriptionCode = `DT-${new Date()
    .toISOString()
    .slice(0, 10)
    .replace(/-/g, '')}-${Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, '0')}`;

  const handleAddItem = () => {
    setItems([
      ...items,
      {
        id: Date.now().toString(),
        medicineName: '',
        dosage: '',
        frequency: '2 láº§n/ngÃ y',
        timesOfDay: ['SÃ¡ng', 'Chiá»u'],
        quantity: 0,
      },
    ]);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length > 1) {
      const nextItems = [...items];
      nextItems.splice(index, 1);
      setItems(nextItems);
    }
  };

  const updateItem = (index: number, field: keyof PrescriptionItem, value: any) => {
    const nextItems = [...items];
    nextItems[index] = { ...nextItems[index], [field]: value };
    setItems(nextItems);
  };

  const findUniqueMedicineByDisplayName = (
    value: string,
    catalog: Medicine[] = medicines,
  ) => {
    const normalizedValue = value.trim();
    if (!normalizedValue) return undefined;

    const matches = catalog.filter(
      (medicine: Medicine) => getMedicineDisplayName(medicine) === normalizedValue,
    );
    return matches.length === 1 ? matches[0] : undefined;
  };

  const bindItemToCatalogMedicine = (
    item: Partial<PrescriptionItem>,
    catalog: Medicine[] = medicines,
  ): Partial<PrescriptionItem> => {
    if (item.medicineId || !item.medicineName?.trim()) {
      return item;
    }

    const selectedMedicine = findUniqueMedicineByDisplayName(item.medicineName, catalog);
    if (!selectedMedicine) {
      return item;
    }

    return {
      ...item,
      medicineId: selectedMedicine.id,
      medicineName: getMedicineDisplayName(selectedMedicine),
    };
  };

  useEffect(() => {
    if (medicines.length === 0) {
      return;
    }

    setItems((currentItems) => {
      let hasChanges = false;

      const nextItems = currentItems.map((item) => {
        const nextItem = bindItemToCatalogMedicine(item, medicines);
        if (nextItem !== item) {
          hasChanges = true;
        }
        return nextItem;
      });

      return hasChanges ? nextItems : currentItems;
    });
  }, [medicines]);

  const handleMedicineNameChange = (index: number, value: string) => {
    const currentItem = items[index];
    const trimmedValue = value.trim();

    if (!trimmedValue) {
      setItems((currentItems) => {
        const nextItems = [...currentItems];
        nextItems[index] = {
          ...nextItems[index],
          medicineId: undefined,
          medicineName: '',
        };
        return nextItems;
      });
      return;
    }

    if (currentItem?.medicineId) {
      if (currentItem.medicineName !== trimmedValue) {
        return;
      }
      return;
    }

    const selectedMedicine = findUniqueMedicineByDisplayName(value);
    if (selectedMedicine) {
      setItems((currentItems) => {
        const nextItems = [...currentItems];
        nextItems[index] = {
          ...nextItems[index],
          medicineId: selectedMedicine.id,
          medicineName: getMedicineDisplayName(selectedMedicine),
        };
        return nextItems;
      });
      return;
    }

    setItems((currentItems) => {
      const nextItems = [...currentItems];
      nextItems[index] = {
        ...nextItems[index],
        medicineId: undefined,
        medicineName: value,
      };
      return nextItems;
    });
  };

  const handleMedicineSelect = (index: number, medicine: Medicine) => {
    setItems((currentItems) => {
      const nextItems = [...currentItems];
      nextItems[index] = {
        ...nextItems[index],
        medicineId: medicine.id,
        medicineName: getMedicineDisplayName(medicine),
      };
      return nextItems;
    });
  };

  const handleSubmit = async () => {
    if (!isCatalogReady) {
      setError('Danh má»¥c thuá»‘c Ä‘ang táº£i, vui lÃ²ng thá»­ láº¡i sau giÃ¢y lÃ¡t');
      return;
    }

    const resolvedItems = items.map((item) => bindItemToCatalogMedicine(item));
    const hasReconciledItems = resolvedItems.some((item, index) => item !== items[index]);
    if (hasReconciledItems) {
      setItems(resolvedItems);
    }

    if (!selectedResidentId || !diagnosis) {
      setError('Vui lÃ²ng chá»n NCT vÃ  nháº­p cháº©n Ä‘oÃ¡n');
      return;
    }

    if (resolvedItems.some((item) => !item.medicineId || !item.medicineName || !item.dosage)) {
      setError(
        'Vui lÃ²ng chá»n thuá»‘c tá»« danh má»¥c ná»™i bá»™ vÃ  Ä‘iá»n Ä‘áº§y Ä‘á»§ thÃ´ng tin thuá»‘c',
      );
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const now = new Date();
      const endDate = new Date(now);
      endDate.setDate(endDate.getDate() + duration);

      await createPrescription(
        {
          code: prescriptionCode,
          residentId: selectedResidentId,
          doctorId: user.id || 'current-user-id',
          doctorName: user.name,
          diagnosis,
          prescriptionDate: now.toISOString().split('T')[0],
          startDate: now.toISOString().split('T')[0],
          endDate: endDate.toISOString().split('T')[0],
          status: 'Active',
          notes,
        },
        resolvedItems as any[],
      );

      onSave();
      onClose();
    } catch (submitError: any) {
      setError(submitError.message || 'CÃ³ lá»—i xáº£y ra');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
        <div className="px-6 py-4 bg-teal-600 text-white flex justify-between items-center shrink-0">
          <div>
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Pill className="w-5 h-5" /> KÃª ÄÆ¡n Thuá»‘c Má»›i
            </h2>
            <p className="text-teal-100 text-sm mt-1 opacity-90">MÃ£ Ä‘Æ¡n: {prescriptionCode}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-white/20 rounded-full transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1">
          {error && (
            <div className="mb-4 bg-red-50 text-red-600 p-3 rounded-lg flex items-center gap-2 border border-red-100">
              <AlertCircle className="w-5 h-5" /> {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  NgÆ°á»i cao tuá»•i <span className="text-red-500">*</span>
                </label>
                {initialResident ? (
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center gap-3">
                    <div className="w-10 h-10 bg-teal-100 text-teal-600 rounded-full flex items-center justify-center font-bold">
                      {initialResident.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-bold text-slate-900">{initialResident.name}</p>
                      <p className="text-xs text-slate-500">
                        PhÃ²ng {initialResident.room} - {initialResident.careLevel}
                      </p>
                    </div>
                  </div>
                ) : (
                  <select
                    className="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-teal-500 outline-none"
                    value={selectedResidentId}
                    onChange={(event) => setSelectedResidentId(event.target.value)}
                  >
                    <option value="">-- Chá»n NCT --</option>
                    {residents?.map((resident) => (
                      <option key={resident.id} value={resident.id}>
                        {resident.name} - {resident.room}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Cháº©n Ä‘oÃ¡n / LÃ½ do <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  className="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-teal-500 outline-none"
                  placeholder="VD: TÄƒng huyáº¿t Ã¡p, Äau dáº¡ dÃ y..."
                  value={diagnosis}
                  onChange={(event) => setDiagnosis(event.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="mb-6 flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-semibold text-slate-700 mb-1">
                Thá»i gian dÃ¹ng (ngÃ y)
              </label>
              <input
                type="number"
                className="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-teal-500 outline-none"
                value={duration}
                onChange={(event) => setDuration(Number(event.target.value))}
              />
            </div>
            <div className="flex-[2]">
              <label className="block text-sm font-semibold text-slate-700 mb-1">
                Ghi chÃº chung
              </label>
              <input
                type="text"
                className="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-teal-500 outline-none"
                placeholder="LÆ°u Ã½ chung cho Ä‘iá»u dÆ°á»¡ng..."
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
              />
            </div>
          </div>

          <div className="mb-2">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <Pill className="w-5 h-5 text-teal-600" /> Danh sÃ¡ch thuá»‘c
              </h3>
              <button
                onClick={handleAddItem}
                className="text-sm text-teal-600 font-semibold hover:bg-teal-50 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1"
              >
                <Plus className="w-4 h-4" /> ThÃªm thuá»‘c
              </button>
            </div>

            <div className="space-y-3">
              {items.map((item, index) => (
                <div
                  key={item.id}
                  className="p-4 border border-slate-200 rounded-xl bg-slate-50/50 hover:border-teal-200 hover:shadow-sm transition-all relative group"
                >
                  <button
                    onClick={() => handleRemoveItem(index)}
                    className="absolute top-2 right-2 p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                    title="XÃ³a dÃ²ng nÃ y"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  <div className="grid grid-cols-12 gap-3">
                    <div className="col-span-12 md:col-span-4">
                      <label className="text-xs font-semibold text-slate-500 block mb-1">
                        TÃªn thuá»‘c
                      </label>
                      <div className="relative">
                        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                        <MedicineCombobox
                          medicines={medicines}
                          value={item.medicineName || ''}
                          onInputChange={(value) => handleMedicineNameChange(index, value)}
                          onSelect={(medicine) => handleMedicineSelect(index, medicine)}
                          placeholder="TÃ¬m tÃªn thuá»‘c..."
                          locked={Boolean(item.medicineId)}
                        />
                      </div>
                    </div>

                    <div className="col-span-6 md:col-span-2">
                      <label className="text-xs font-semibold text-slate-500 block mb-1">
                        Liá»u lÆ°á»£ng
                      </label>
                      <input
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white"
                        placeholder="VD: 1 viÃªn"
                        value={item.dosage}
                        onChange={(event) => updateItem(index, 'dosage', event.target.value)}
                      />
                    </div>

                    <div className="col-span-6 md:col-span-3">
                      <label className="text-xs font-semibold text-slate-500 block mb-1">
                        Táº§n suáº¥t
                      </label>
                      <div className="flex gap-2">
                        <input
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white"
                          placeholder="VD: 2 láº§n/ngÃ y"
                          value={item.frequency}
                          onChange={(event) =>
                            updateItem(index, 'frequency', event.target.value)
                          }
                        />
                      </div>
                    </div>

                    <div className="col-span-12 md:col-span-3">
                      <label className="text-xs font-semibold text-slate-500 block mb-1">
                        Thá»i Ä‘iá»ƒm
                      </label>
                      <div className="flex flex-wrap gap-1">
                        {['SÃ¡ng', 'TrÆ°a', 'Chiá»u', 'Tá»‘i'].map((timeOfDay) => (
                          <button
                            key={timeOfDay}
                            type="button"
                            onClick={() => {
                              const current = item.timesOfDay || [];
                              const nextTimes = current.includes(timeOfDay)
                                ? current.filter((entry) => entry !== timeOfDay)
                                : [...current, timeOfDay];
                              updateItem(index, 'timesOfDay', nextTimes);
                            }}
                            className={`px-2 py-1 text-xs rounded border ${
                              item.timesOfDay?.includes(timeOfDay)
                                ? 'bg-teal-600 text-white border-teal-600'
                                : 'bg-white text-slate-600 border-slate-200 hover:border-teal-300'
                            }`}
                          >
                            {timeOfDay}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 pt-3 border-t border-slate-100">
                    <input
                      className="w-full text-sm text-slate-600 placeholder:text-slate-400 bg-transparent border-none p-0 focus:ring-0"
                      placeholder="HÆ°á»›ng dáº«n thÃªm (VD: Uá»‘ng sau khi Äƒn no...)"
                      value={item.instructions || ''}
                      onChange={(event) =>
                        updateItem(index, 'instructions', event.target.value)
                      }
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-3 shrink-0">
          <button
            onClick={onClose}
            className="px-6 py-2.5 text-slate-600 font-medium hover:bg-slate-200 rounded-xl transition-colors"
          >
            Há»§y bá»
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading || !isCatalogReady}
            className="px-6 py-2.5 bg-teal-600 text-white font-bold rounded-xl hover:bg-teal-700 shadow-lg shadow-teal-200 flex items-center gap-2 transition-all disabled:opacity-70"
          >
            {loading ? (
              'Äang lÆ°u...'
            ) : (
              <>
                <Save className="w-5 h-5" /> LÆ°u Ä‘Æ¡n thuá»‘c
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
