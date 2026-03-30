import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  CopyPlus,
  Plus,
  Printer,
  Save,
  StickyNote,
} from 'lucide-react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';

import { PrescriptionLineDraft, PrescriptionLineEditor } from '../components/PrescriptionLineEditor';
import {
  calculateDaysSupply,
  calculateMedicationEndDate,
  calculateQuantityDispensed,
} from '../utils/medicationCalculations';
import { useAuthStore } from '@/src/stores/authStore';
import { usePrescriptionsStore } from '@/src/stores/prescriptionStore';
import { useResidentsStore } from '@/src/stores/residentsStore';

type EditorMode = 'new' | 'edit' | 'duplicate';

const PAGE_TODAY = new Date().toISOString().slice(0, 10);

function createEmptyLine(startDate: string): PrescriptionLineDraft {
  return {
    id: crypto.randomUUID(),
    medicineName: '',
    dosage: '',
    frequency: '',
    timesOfDay: [],
    quantity: undefined,
    quantityDispensed: undefined,
    daysSupply: undefined,
    startDate,
    endDate: undefined,
    isContinuous: false,
    instructions: '',
    specialInstructions: '',
  };
}

function applyLineCalculations(
  line: PrescriptionLineDraft,
  changedField: keyof PrescriptionLineDraft,
): PrescriptionLineDraft {
  const nextLine = { ...line };

  if (nextLine.dosePerTime && nextLine.doseUnit) {
    nextLine.dosage = `${nextLine.dosePerTime} ${nextLine.doseUnit}`;
  }

  if (nextLine.timesPerDay) {
    nextLine.frequency = `${nextLine.timesPerDay} lần/ngày`;
  }

  if (changedField === 'daysSupply') {
    const quantityDispensed = calculateQuantityDispensed({
      dosePerTime: nextLine.dosePerTime,
      timesPerDay: nextLine.timesPerDay,
      daysSupply: nextLine.daysSupply,
    });

    nextLine.quantityDispensed = quantityDispensed;
    nextLine.quantity = quantityDispensed;
  } else if (changedField === 'quantityDispensed') {
    nextLine.quantity = nextLine.quantityDispensed;
    nextLine.daysSupply = calculateDaysSupply({
      quantityDispensed: nextLine.quantityDispensed,
      dosePerTime: nextLine.dosePerTime,
      timesPerDay: nextLine.timesPerDay,
    });
  } else if (
    changedField === 'dosePerTime' ||
    changedField === 'timesPerDay' ||
    changedField === 'doseUnit'
  ) {
    if (nextLine.daysSupply) {
      const quantityDispensed = calculateQuantityDispensed({
        dosePerTime: nextLine.dosePerTime,
        timesPerDay: nextLine.timesPerDay,
        daysSupply: nextLine.daysSupply,
      });

      nextLine.quantityDispensed = quantityDispensed;
      nextLine.quantity = quantityDispensed;
    } else if (nextLine.quantityDispensed) {
      nextLine.daysSupply = calculateDaysSupply({
        quantityDispensed: nextLine.quantityDispensed,
        dosePerTime: nextLine.dosePerTime,
        timesPerDay: nextLine.timesPerDay,
      });
    }
  }

  if (nextLine.isContinuous) {
    nextLine.endDate = undefined;
  } else {
    nextLine.endDate = calculateMedicationEndDate({
      startDate: nextLine.startDate,
      daysSupply: nextLine.daysSupply,
      isContinuous: nextLine.isContinuous,
    });
  }

  return nextLine;
}

export const PrescriptionEditorPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { residentId, prescriptionId } = useParams();
  const { user } = useAuthStore();
  const { residents } = useResidentsStore();
  const {
    medicines,
    prescriptions,
    fetchMedicines,
    fetchPrescriptions,
    createPrescription,
    updatePrescription,
    pausePrescription,
    completePrescription,
  } = usePrescriptionsStore();

  const resident = residents.find((item) => item.id === residentId);
  const sourcePrescription = prescriptions.find(
    (item) => item.id === prescriptionId && item.residentId === residentId,
  );

  const mode: EditorMode = useMemo(() => {
    if (!prescriptionId) return 'new';

    return location.pathname.endsWith('/duplicate') ? 'duplicate' : 'edit';
  }, [location.pathname, prescriptionId]);

  const [diagnosis, setDiagnosis] = useState('');
  const [notes, setNotes] = useState('');
  const [prescriptionDate, setPrescriptionDate] = useState(PAGE_TODAY);
  const [lines, setLines] = useState<PrescriptionLineDraft[]>([
    createEmptyLine(PAGE_TODAY),
  ]);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSourceTransitionChoices, setShowSourceTransitionChoices] =
    useState(false);

  useEffect(() => {
    if (residentId) {
      void fetchPrescriptions(residentId);
    }

    void fetchMedicines();
  }, [residentId, fetchMedicines, fetchPrescriptions]);

  useEffect(() => {
    if (!resident || !user) {
      return;
    }

    if (!sourcePrescription) {
      setDiagnosis('');
      setNotes('');
      setPrescriptionDate(PAGE_TODAY);
      setLines([createEmptyLine(PAGE_TODAY)]);
      return;
    }

    const duplicatedDate = PAGE_TODAY;
    const effectiveStartDate =
      mode === 'duplicate' ? duplicatedDate : sourcePrescription.startDate;

    setDiagnosis(sourcePrescription.diagnosis);
    setNotes(sourcePrescription.notes ?? '');
    setPrescriptionDate(
      mode === 'duplicate' ? duplicatedDate : sourcePrescription.prescriptionDate,
    );
    setLines(
      sourcePrescription.items.map((item) =>
        applyLineCalculations(
          {
            ...item,
            id: crypto.randomUUID(),
            startDate: mode === 'duplicate' ? effectiveStartDate : item.startDate,
          },
          'startDate',
        ),
      ),
    );
  }, [mode, resident, sourcePrescription, user]);

  if (!resident || !user || !residentId) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center text-slate-500">
        Không tìm thấy thông tin NCT hoặc người dùng.
      </div>
    );
  }

  const pageTitle =
    mode === 'duplicate'
      ? 'Nhân bản đơn thuốc'
      : mode === 'edit'
        ? 'Chỉnh sửa đơn thuốc'
        : 'Kê đơn thuốc';

  const pageDescription =
    mode === 'duplicate'
      ? 'Tạo một đơn mới từ đơn hiện có, sau đó quyết định trạng thái đơn cũ.'
      : 'Giao diện kê đơn tối ưu cho thao tác nhanh trên desktop và tablet.';

  const handleLineChange = (
    index: number,
    field: keyof PrescriptionLineDraft,
    value: unknown,
  ) => {
    setLines((currentLines) =>
      currentLines.map((line, lineIndex) => {
        if (lineIndex !== index) {
          return line;
        }

        let nextLine: PrescriptionLineDraft = {
          ...line,
          [field]: value,
        };

        if (field === 'medicineName') {
          const selectedMedicine = medicines.find((medicine) => {
            const query = String(value).trim().toLowerCase();

            return (
              medicine.name.toLowerCase() === query ||
              medicine.activeIngredient?.toLowerCase() === query
            );
          });

          if (selectedMedicine) {
            nextLine = {
              ...nextLine,
              medicineId: selectedMedicine.id,
              medicineName: selectedMedicine.name,
              activeIngredientSnapshot: selectedMedicine.activeIngredient,
              strengthSnapshot: selectedMedicine.strength,
              routeSnapshot: selectedMedicine.route,
              doseUnit: nextLine.doseUnit ?? selectedMedicine.unit,
              dosage: nextLine.dosage || selectedMedicine.defaultDosage || '',
              timesPerDay:
                nextLine.timesPerDay ?? selectedMedicine.defaultFrequency,
            };
          }
        }

        return applyLineCalculations(nextLine, field);
      }),
    );
  };

  const handleAddLine = () => {
    setLines((currentLines) => [...currentLines, createEmptyLine(prescriptionDate)]);
  };

  const handleRemoveLine = (index: number) => {
    setLines((currentLines) =>
      currentLines.filter((_, lineIndex) => lineIndex !== index),
    );
  };

  const handleSubmit = async () => {
    if (!lines.length || lines.some((line) => !line.medicineName.trim())) {
      setError('Vui lòng nhập tên thuốc cho tất cả các dòng.');
      return;
    }

    setError(null);
    setIsSaving(true);

    const payload = {
      code:
        mode === 'edit' && sourcePrescription
          ? sourcePrescription.code
          : `DT-${prescriptionDate.replaceAll('-', '')}-${Date.now().toString().slice(-4)}`,
      residentId,
      residentName: resident.name,
      doctorId: user.id,
      doctorName: user.name,
      diagnosis,
      prescriptionDate,
      startDate: prescriptionDate,
      endDate: undefined,
      status: 'Active' as const,
      notes,
    };

    const itemsPayload = lines.map(({ id: _id, ...line }) => ({
      ...line,
      startDate: line.startDate ?? prescriptionDate,
    }));

    try {
      if (mode === 'edit' && sourcePrescription) {
        await updatePrescription(sourcePrescription.id, payload, itemsPayload);
        navigate(`/residents/${residentId}`);
        return;
      }

      await createPrescription(payload, itemsPayload);

      if (mode === 'duplicate' && sourcePrescription) {
        setShowSourceTransitionChoices(true);
      } else {
        navigate(`/residents/${residentId}`);
      }
    } catch (submitError: any) {
      setError(submitError?.message ?? 'Không thể lưu đơn thuốc.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSourceTransition = async (transition: 'complete' | 'pause' | 'keep') => {
    if (sourcePrescription) {
      if (transition === 'complete') {
        await completePrescription(sourcePrescription.id);
      }

      if (transition === 'pause') {
        await pausePrescription(sourcePrescription.id);
      }
    }

    setShowSourceTransitionChoices(false);
    navigate(`/residents/${residentId}`);
  };

  return (
    <div className="space-y-6">
      <button
        type="button"
        onClick={() => navigate(`/residents/${residentId}`)}
        className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-teal-600"
      >
        <ArrowLeft className="h-4 w-4" />
        Quay lại hồ sơ NCT
      </button>

      <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium uppercase tracking-[0.18em] text-teal-600">
              Medication Workspace
            </p>
            <h1 className="text-3xl font-semibold text-slate-950">{pageTitle}</h1>
            <p className="max-w-2xl text-sm leading-6 text-slate-500">
              {pageDescription}
            </p>
          </div>

          <div className="grid gap-3 rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600 sm:grid-cols-2">
            <div>
              <div className="text-xs uppercase tracking-wide text-slate-400">
                NCT
              </div>
              <div className="font-medium text-slate-900">{resident.name}</div>
            </div>
            <div>
              <div className="text-xs uppercase tracking-wide text-slate-400">
                Phòng
              </div>
              <div className="font-medium text-slate-900">
                {resident.room} - Giường {resident.bed}
              </div>
            </div>
            <div>
              <div className="text-xs uppercase tracking-wide text-slate-400">
                Bác sĩ kê
              </div>
              <div className="font-medium text-slate-900">{user.name}</div>
            </div>
            <div>
              <div className="text-xs uppercase tracking-wide text-slate-400">
                Ngày kê
              </div>
              <div className="font-medium text-slate-900">{prescriptionDate}</div>
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Chẩn đoán / Lý do kê đơn
            </label>
            <input
              value={diagnosis}
              onChange={(event) => setDiagnosis(event.currentTarget.value)}
              placeholder="Nhập chẩn đoán hoặc mục tiêu điều trị"
              className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Ngày kê
            </label>
            <input
              type="date"
              value={prescriptionDate}
              onChange={(event) => setPrescriptionDate(event.currentTarget.value)}
              className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
            />
          </div>

          <div className="lg:col-span-3">
            <label className="mb-1 flex items-center gap-2 text-sm font-medium text-slate-700">
              <StickyNote className="h-4 w-4 text-slate-400" />
              Ghi chú chung
            </label>
            <textarea
              value={notes}
              onChange={(event) => setNotes(event.currentTarget.value)}
              rows={3}
              placeholder="Lưu ý chung cho điều dưỡng hoặc bác sĩ theo dõi"
              className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
            />
          </div>
        </div>
      </section>

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {showSourceTransitionChoices && (
        <section className="rounded-[28px] border border-amber-200 bg-amber-50 p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-3">
            <CopyPlus className="h-5 w-5 text-amber-700" />
            <div>
              <h2 className="text-lg font-semibold text-amber-950">
                Đơn mới đã được lưu
              </h2>
              <p className="text-sm text-amber-800">
                Chọn cách xử lý đơn nguồn ngay bây giờ.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => void handleSourceTransition('complete')}
              className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800"
            >
              Kết thúc đơn cũ
            </button>
            <button
              type="button"
              onClick={() => void handleSourceTransition('pause')}
              className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:border-slate-400"
            >
              Tạm ngưng đơn cũ
            </button>
            <button
              type="button"
              onClick={() => void handleSourceTransition('keep')}
              className="rounded-xl border border-teal-300 bg-teal-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-teal-700"
            >
              Giữ cả hai đơn đang dùng
            </button>
          </div>
        </section>
      )}

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">Danh sách thuốc</h2>
            <p className="text-sm text-slate-500">
              Tối ưu cho thao tác nhanh và tab liên tục trên tablet.
            </p>
          </div>

          <button
            type="button"
            onClick={handleAddLine}
            className="inline-flex items-center gap-2 rounded-2xl bg-teal-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-teal-700"
          >
            <Plus className="h-4 w-4" />
            Thêm dòng thuốc
          </button>
        </div>

        <div className="space-y-4">
          {lines.map((line, index) => (
            <PrescriptionLineEditor
              key={line.id}
              index={index}
              line={line}
              medicines={medicines}
              canRemove={lines.length > 1}
              onRemove={() => handleRemoveLine(index)}
              onChange={handleLineChange}
            />
          ))}
        </div>
      </section>

      <footer className="sticky bottom-4 z-10 rounded-[28px] border border-slate-200 bg-white/95 p-4 shadow-lg backdrop-blur">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-slate-500">
            {lines.length} dòng thuốc, cập nhật tự động số lượng và ngày kết thúc.
          </p>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-2xl border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:border-slate-400"
            >
              <Printer className="h-4 w-4" />
              In ngay
            </button>
            <button
              type="button"
              onClick={() => void handleSubmit()}
              disabled={isSaving}
              className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Save className="h-4 w-4" />
              {isSaving ? 'Đang lưu...' : 'Lưu đơn thuốc'}
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};
