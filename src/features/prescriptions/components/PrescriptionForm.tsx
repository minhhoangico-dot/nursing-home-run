import React, { useEffect, useMemo, useState } from 'react';
import { AlertCircle, Pill, Plus, Save, Search, Trash2, X } from 'lucide-react';
import { Prescription, PrescriptionItem, Resident, User } from '../../../types/index';
import { usePrescriptionsStore } from '../../../stores/prescriptionStore';
import { DrugMasterDialog } from './DrugMasterDialog';

interface PrescriptionFormProps {
  user: User;
  resident?: Resident;
  residents?: Resident[];
  editingPrescription?: Prescription | null;
  duplicateSource?: Prescription | null;
  onClose: () => void;
  onSave: () => void;
}

type EditableItem = Omit<PrescriptionItem, 'prescriptionId'> & { localId: string };

const TIME_OPTIONS = [
  { key: 'morning', label: 'Sang' },
  { key: 'noon', label: 'Trua' },
  { key: 'afternoon', label: 'Chieu' },
  { key: 'evening', label: 'Toi' },
] as const;

const todayString = () => new Date().toISOString().split('T')[0];
const plusDays = (value: string, days: number) => {
  const date = new Date(`${value}T00:00:00`);
  date.setDate(date.getDate() + days);
  return date.toISOString().split('T')[0];
};

const buildScheduleFromTimes = (timesOfDay: string[] = []) => ({
  morning: timesOfDay.includes('Sang'),
  noon: timesOfDay.includes('Trua'),
  afternoon: timesOfDay.includes('Chieu'),
  evening: timesOfDay.includes('Toi'),
});

const buildTimesFromSchedule = (item: EditableItem) =>
  TIME_OPTIONS.filter(({ key }) => item.schedule?.[key]).map(({ label }) => label);

const getAdministrationsPerDay = (item: EditableItem) =>
  Math.max(TIME_OPTIONS.filter(({ key }) => item.schedule?.[key]).length, 1);

const createEmptyItem = (): EditableItem => {
  const startDate = todayString();

  return {
    id: `draft-${Date.now()}`,
    localId: `local-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    medicineId: undefined,
    medicineName: '',
    dosage: '',
    frequency: '',
    timesOfDay: [],
    quantity: 0,
    instructions: '',
    startDate,
    endDate: plusDays(startDate, 7),
    continuous: false,
    quantitySupplied: 0,
    administrationsPerDay: 1,
    schedule: {
      morning: false,
      noon: false,
      afternoon: false,
      evening: false,
    },
  };
};

const mapPrescriptionToEditableItems = (prescription: Prescription): EditableItem[] =>
  prescription.items.map((item, index) => {
    const schedule = item.schedule ?? buildScheduleFromTimes(item.timesOfDay);

    return {
      ...item,
      localId: `local-${item.id || index}`,
      startDate: item.startDate ?? prescription.startDate ?? todayString(),
      endDate: item.endDate ?? prescription.endDate ?? plusDays(prescription.startDate ?? todayString(), 7),
      continuous: Boolean(item.continuous),
      quantitySupplied: item.quantitySupplied ?? item.quantity ?? 0,
      administrationsPerDay: item.administrationsPerDay ?? Math.max(item.timesOfDay?.length ?? 0, 1),
      schedule,
      timesOfDay: item.timesOfDay?.length ? item.timesOfDay : TIME_OPTIONS.filter(({ key }) => schedule[key]).map(({ label }) => label),
    };
  });

const buildNewPrescriptionCode = () =>
  `DT-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, '0')}`;

export const PrescriptionForm = ({
  user,
  resident: initialResident,
  residents,
  editingPrescription,
  duplicateSource,
  onClose,
  onSave,
}: PrescriptionFormProps) => {
  const sourcePrescription = editingPrescription ?? duplicateSource ?? null;
  const isEditing = Boolean(editingPrescription?.id);

  const {
    createPrescription,
    updatePrescription,
    medicines,
    fetchMedicines,
  } = usePrescriptionsStore();

  const [selectedResidentId, setSelectedResidentId] = useState(
    initialResident?.id || sourcePrescription?.residentId || '',
  );
  const [diagnosis, setDiagnosis] = useState(sourcePrescription?.diagnosis || '');
  const [notes, setNotes] = useState(sourcePrescription?.notes || '');
  const [items, setItems] = useState<EditableItem[]>(
    sourcePrescription?.items?.length ? mapPrescriptionToEditableItems(sourcePrescription) : [createEmptyItem()],
  );
  const [dialogRowIndex, setDialogRowIndex] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchMedicines();
  }, [fetchMedicines]);

  const selectedResident = initialResident || residents?.find((entry) => entry.id === selectedResidentId);
  const prescriptionCode = useMemo(() => {
    if (isEditing && editingPrescription) return editingPrescription.code;
    return buildNewPrescriptionCode();
  }, [editingPrescription, isEditing]);

  const updateItem = (index: number, updater: (item: EditableItem) => EditableItem) => {
    setItems((currentItems) => currentItems.map((item, itemIndex) => (itemIndex === index ? updater(item) : item)));
  };

  const handleScheduleToggle = (index: number, key: keyof EditableItem['schedule']) => {
    updateItem(index, (item) => {
      const nextSchedule = {
        morning: item.schedule?.morning ?? false,
        noon: item.schedule?.noon ?? false,
        afternoon: item.schedule?.afternoon ?? false,
        evening: item.schedule?.evening ?? false,
      };

      nextSchedule[key] = !nextSchedule[key];

      const nextItem = {
        ...item,
        schedule: nextSchedule,
      };

      return {
        ...nextItem,
        timesOfDay: buildTimesFromSchedule(nextItem),
        administrationsPerDay: getAdministrationsPerDay(nextItem),
      };
    });
  };

  const handleMedicineSelect = (index: number, medicine: { id: string; name: string; defaultDosage?: string }) => {
    updateItem(index, (item) => ({
      ...item,
      medicineId: medicine.id,
      medicineName: medicine.name,
      dosage: item.dosage || medicine.defaultDosage || '',
    }));
    setDialogRowIndex(null);
  };

  const handleSave = async () => {
    if (!selectedResidentId || !diagnosis.trim()) {
      setError('Vui long chon NCT va nhap chan doan');
      return;
    }

    if (items.some((item) => !item.medicineName.trim() || !item.dosage.trim())) {
      setError('Vui long dien day du thong tin thuoc');
      return;
    }

    const normalizedItems = items.map((item) => ({
      medicineId: item.medicineId,
      medicineName: item.medicineName,
      dosage: item.dosage,
      frequency: item.frequency || `${getAdministrationsPerDay(item)} lan/ngay`,
      timesOfDay: buildTimesFromSchedule(item),
      quantity: item.quantitySupplied ?? item.quantity ?? 0,
      instructions: item.instructions,
      startDate: item.startDate,
      endDate: item.continuous ? undefined : item.endDate,
      continuous: item.continuous,
      quantitySupplied: item.quantitySupplied ?? item.quantity ?? 0,
      administrationsPerDay: getAdministrationsPerDay(item),
      schedule: item.schedule,
    }));

    const startDates = normalizedItems.map((item) => item.startDate || todayString()).sort();
    const endDates = normalizedItems
      .filter((item) => !item.continuous && item.endDate)
      .map((item) => item.endDate as string)
      .sort();

    const prescriptionPayload = {
      code: prescriptionCode,
      residentId: selectedResidentId,
      doctorId: user.id || 'current-user-id',
      doctorName: user.name,
      diagnosis: diagnosis.trim(),
      prescriptionDate: isEditing && editingPrescription ? editingPrescription.prescriptionDate : todayString(),
      startDate: startDates[0] ?? todayString(),
      endDate: endDates[endDates.length - 1],
      status: isEditing && editingPrescription ? editingPrescription.status : 'Active',
      notes: notes.trim(),
      duplicatedFromPrescriptionId: duplicateSource?.id,
    };

    setLoading(true);
    setError(null);

    try {
      if (isEditing && editingPrescription) {
        await updatePrescription(
          editingPrescription.id,
          prescriptionPayload,
          normalizedItems as Omit<PrescriptionItem, 'id' | 'prescriptionId'>[],
        );
      } else {
        await createPrescription(
          prescriptionPayload,
          normalizedItems as Omit<PrescriptionItem, 'id' | 'prescriptionId'>[],
        );
      }

      onSave();
      onClose();
    } catch (saveError: any) {
      setError(saveError.message || 'Co loi xay ra');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between bg-teal-600 px-6 py-4 text-white">
          <div>
            <h2 className="flex items-center gap-2 text-xl font-bold">
              <Pill className="h-5 w-5" /> {isEditing ? 'Dieu chinh don thuoc' : 'Ke don thuoc'}
            </h2>
            <p className="mt-1 text-sm text-teal-100 opacity-90">Ma don: {prescriptionCode}</p>
          </div>
          <button onClick={onClose} className="rounded-full p-2 transition-colors hover:bg-white/20">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {error && (
            <div className="mb-4 flex items-center gap-2 rounded-lg border border-red-100 bg-red-50 p-3 text-red-600">
              <AlertCircle className="h-5 w-5" /> {error}
            </div>
          )}

          <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label htmlFor="resident-select" className="mb-1 block text-sm font-semibold text-slate-700">
                Nguoi cao tuoi
              </label>
              {initialResident ? (
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <div className="font-semibold text-slate-900">{initialResident.name}</div>
                  <div className="mt-1 text-sm text-slate-500">
                    Phong {initialResident.room} - {initialResident.careLevel}
                  </div>
                </div>
              ) : (
                <select
                  id="resident-select"
                  value={selectedResidentId}
                  onChange={(event) => setSelectedResidentId(event.target.value)}
                  className="w-full rounded-lg border border-slate-300 p-2.5 outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="">-- Chon NCT --</option>
                  {residents?.map((entry) => (
                    <option key={entry.id} value={entry.id}>
                      {entry.name} - {entry.room}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div>
              <label htmlFor="diagnosis-input" className="mb-1 block text-sm font-semibold text-slate-700">
                Chan doan
              </label>
              <input
                id="diagnosis-input"
                aria-label="Chan doan"
                type="text"
                value={diagnosis}
                onChange={(event) => setDiagnosis(event.target.value)}
                className="w-full rounded-lg border border-slate-300 p-2.5 outline-none focus:ring-2 focus:ring-teal-500"
                placeholder="VD: Tang huyet ap"
              />
            </div>

            <div className="md:col-span-2">
              <label htmlFor="notes-input" className="mb-1 block text-sm font-semibold text-slate-700">
                Ghi chu chung
              </label>
              <textarea
                id="notes-input"
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                className="min-h-[80px] w-full rounded-lg border border-slate-300 p-2.5 outline-none focus:ring-2 focus:ring-teal-500"
                placeholder="Luu y cho dieu duong"
              />
            </div>
          </div>

          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-800">Danh sach thuoc</h3>
            <button
              type="button"
              onClick={() => setItems((currentItems) => [...currentItems, createEmptyItem()])}
              className="inline-flex items-center gap-2 rounded-lg border border-teal-200 bg-teal-50 px-3 py-2 text-sm font-medium text-teal-700 transition-colors hover:bg-teal-100"
            >
              <Plus className="h-4 w-4" /> Them thuoc
            </button>
          </div>

          <div className="space-y-4">
            {items.map((item, index) => (
              <div key={item.localId} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="mb-4 flex items-start justify-between">
                  <div>
                    <div className="text-sm font-semibold text-slate-800">Dong thuoc {index + 1}</div>
                    {selectedResident && (
                      <div className="text-xs text-slate-500">NCT: {selectedResident.name}</div>
                    )}
                  </div>
                  {items.length > 1 && (
                    <button
                      type="button"
                      onClick={() =>
                        setItems((currentItems) => currentItems.filter((currentItem) => currentItem.localId !== item.localId))
                      }
                      className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-500"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <label htmlFor={`medicine-name-${item.localId}`} className="mb-1 block text-sm font-semibold text-slate-700">
                      Ten thuoc
                    </label>
                    <div className="flex gap-2">
                      <input
                        id={`medicine-name-${item.localId}`}
                        aria-label="Ten thuoc"
                        value={item.medicineName}
                        onChange={(event) =>
                          updateItem(index, (currentItem) => ({
                            ...currentItem,
                            medicineName: event.target.value,
                          }))
                        }
                        className="flex-1 rounded-lg border border-slate-300 px-3 py-2.5 outline-none focus:ring-2 focus:ring-teal-500"
                        placeholder="Nhap ten thuoc"
                      />
                      <button
                        type="button"
                        onClick={() => setDialogRowIndex(index)}
                        className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-700 transition-colors hover:bg-slate-50"
                      >
                        <Search className="h-4 w-4" /> Tim
                      </button>
                    </div>
                  </div>

                  <div>
                    <label htmlFor={`dosage-${item.localId}`} className="mb-1 block text-sm font-semibold text-slate-700">
                      Lieu dung
                    </label>
                    <input
                      id={`dosage-${item.localId}`}
                      aria-label="Lieu dung"
                      value={item.dosage}
                      onChange={(event) =>
                        updateItem(index, (currentItem) => ({
                          ...currentItem,
                          dosage: event.target.value,
                        }))
                      }
                      className="w-full rounded-lg border border-slate-300 px-3 py-2.5 outline-none focus:ring-2 focus:ring-teal-500"
                      placeholder="VD: 1 vien"
                    />
                  </div>

                  <div>
                    <label htmlFor={`frequency-${item.localId}`} className="mb-1 block text-sm font-semibold text-slate-700">
                      So lan/ngay
                    </label>
                    <input
                      id={`frequency-${item.localId}`}
                      aria-label="So lan/ngay"
                      value={item.frequency}
                      onChange={(event) =>
                        updateItem(index, (currentItem) => ({
                          ...currentItem,
                          frequency: event.target.value,
                        }))
                      }
                      className="w-full rounded-lg border border-slate-300 px-3 py-2.5 outline-none focus:ring-2 focus:ring-teal-500"
                      placeholder="VD: 2 lan/ngay"
                    />
                  </div>

                  <div>
                    <label htmlFor={`quantity-${item.localId}`} className="mb-1 block text-sm font-semibold text-slate-700">
                      So luong cap
                    </label>
                    <input
                      id={`quantity-${item.localId}`}
                      aria-label="So luong cap"
                      type="number"
                      value={item.quantitySupplied ?? 0}
                      onChange={(event) =>
                        updateItem(index, (currentItem) => ({
                          ...currentItem,
                          quantitySupplied: Number(event.target.value),
                          quantity: Number(event.target.value),
                        }))
                      }
                      className="w-full rounded-lg border border-slate-300 px-3 py-2.5 outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <fieldset>
                      <legend className="mb-2 block text-sm font-semibold text-slate-700">Thoi diem uong</legend>
                      <div className="flex flex-wrap gap-3">
                        {TIME_OPTIONS.map((option) => (
                          <label key={option.key} className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700">
                            <input
                              type="checkbox"
                              aria-label={option.label}
                              checked={Boolean(item.schedule?.[option.key])}
                              onChange={() => handleScheduleToggle(index, option.key)}
                            />
                            {option.label}
                          </label>
                        ))}
                      </div>
                    </fieldset>
                  </div>

                  <div>
                    <label htmlFor={`start-date-${item.localId}`} className="mb-1 block text-sm font-semibold text-slate-700">
                      Ngay bat dau
                    </label>
                    <input
                      id={`start-date-${item.localId}`}
                      aria-label="Ngay bat dau"
                      type="date"
                      value={item.startDate || todayString()}
                      onChange={(event) =>
                        updateItem(index, (currentItem) => ({
                          ...currentItem,
                          startDate: event.target.value,
                        }))
                      }
                      className="w-full rounded-lg border border-slate-300 px-3 py-2.5 outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>

                  <div>
                    <label htmlFor={`end-date-${item.localId}`} className="mb-1 block text-sm font-semibold text-slate-700">
                      Ngay ket thuc
                    </label>
                    <input
                      id={`end-date-${item.localId}`}
                      aria-label="Ngay ket thuc"
                      type="date"
                      disabled={Boolean(item.continuous)}
                      value={item.endDate || ''}
                      onChange={(event) =>
                        updateItem(index, (currentItem) => ({
                          ...currentItem,
                          endDate: event.target.value,
                        }))
                      }
                      className="w-full rounded-lg border border-slate-300 px-3 py-2.5 outline-none focus:ring-2 focus:ring-teal-500 disabled:bg-slate-100"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="inline-flex items-center gap-2 text-sm font-medium text-slate-700">
                      <input
                        type="checkbox"
                        aria-label="Dung lien tuc"
                        checked={Boolean(item.continuous)}
                        onChange={() =>
                          updateItem(index, (currentItem) => ({
                            ...currentItem,
                            continuous: !currentItem.continuous,
                          }))
                        }
                      />
                      Dung lien tuc
                    </label>
                  </div>

                  <div className="md:col-span-2">
                    <label htmlFor={`instructions-${item.localId}`} className="mb-1 block text-sm font-semibold text-slate-700">
                      Ghi chu dac biet
                    </label>
                    <textarea
                      id={`instructions-${item.localId}`}
                      value={item.instructions || ''}
                      onChange={(event) =>
                        updateItem(index, (currentItem) => ({
                          ...currentItem,
                          instructions: event.target.value,
                        }))
                      }
                      className="min-h-[80px] w-full rounded-lg border border-slate-300 p-2.5 outline-none focus:ring-2 focus:ring-teal-500"
                      placeholder="Truoc an, sau an, va cac luu y khac"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-3 border-t border-slate-200 bg-slate-50 p-4">
          <button onClick={onClose} className="rounded-xl px-6 py-2.5 font-medium text-slate-600 transition-colors hover:bg-slate-200">
            Huy bo
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-xl bg-teal-600 px-6 py-2.5 font-bold text-white shadow-lg shadow-teal-200 transition-all hover:bg-teal-700 disabled:opacity-70"
          >
            {loading ? 'Dang luu...' : (
              <>
                <Save className="h-5 w-5" /> {isEditing ? 'Luu dieu chinh' : 'Luu don thuoc'}
              </>
            )}
          </button>
        </div>
      </div>

      <DrugMasterDialog
        open={dialogRowIndex !== null}
        medicines={medicines}
        onClose={() => setDialogRowIndex(null)}
        onSelect={(medicine) => {
          if (dialogRowIndex === null) return;
          handleMedicineSelect(dialogRowIndex, medicine);
        }}
        onCreateMedicine={fetchMedicines}
      />
    </div>
  );
};
