import React from 'react';
import { Pill, Trash2 } from 'lucide-react';

import { Medicine, PrescriptionItem } from '@/src/types/medical';

export type PrescriptionLineDraft = Omit<PrescriptionItem, 'prescriptionId'>;

interface PrescriptionLineEditorProps {
  index: number;
  line: PrescriptionLineDraft;
  medicines: Medicine[];
  canRemove: boolean;
  onRemove: () => void;
  onChange: (
    index: number,
    field: keyof PrescriptionLineDraft,
    value: unknown,
  ) => void;
}

const TIME_OPTIONS = ['Sáng', 'Trưa', 'Chiều', 'Tối'];

function parseNumber(value: string): number | undefined {
  if (!value.trim()) {
    return undefined;
  }

  const parsed = Number(value);

  return Number.isFinite(parsed) ? parsed : undefined;
}

export const PrescriptionLineEditor = ({
  index,
  line,
  medicines,
  canRemove,
  onRemove,
  onChange,
}: PrescriptionLineEditorProps) => {
  const datalistId = `medicine-suggestions-${index}`;

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-teal-50 text-teal-600">
            <Pill className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-900">Thuốc {index + 1}</h3>
            <p className="text-sm text-slate-500">
              Nhập nhanh theo tên thuốc hoặc hoạt chất.
            </p>
          </div>
        </div>

        {canRemove && (
          <button
            type="button"
            onClick={onRemove}
            className="inline-flex items-center gap-2 rounded-xl border border-red-200 px-3 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4" />
            Xóa dòng
          </button>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-12">
        <div className="md:col-span-5">
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Tên thuốc
          </label>
          <input
            list={datalistId}
            value={line.medicineName}
            onChange={(event) =>
              onChange(index, 'medicineName', event.currentTarget.value)
            }
            placeholder="Gõ tên thuốc hoặc hoạt chất"
            className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
          />
          <datalist id={datalistId}>
            {medicines.map((medicine) => (
              <option key={medicine.id} value={medicine.name}>
                {[
                  medicine.strength,
                  medicine.activeIngredient,
                  medicine.route,
                ]
                  .filter(Boolean)
                  .join(' / ')}
              </option>
            ))}
          </datalist>
        </div>

        <div className="md:col-span-2">
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Liều mỗi lần
          </label>
          <input
            type="number"
            min="0"
            step="0.5"
            value={line.dosePerTime ?? ''}
            onChange={(event) =>
              onChange(index, 'dosePerTime', parseNumber(event.currentTarget.value))
            }
            className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
          />
        </div>

        <div className="md:col-span-2">
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Đơn vị liều
          </label>
          <input
            value={line.doseUnit ?? ''}
            onChange={(event) =>
              onChange(index, 'doseUnit', event.currentTarget.value)
            }
            placeholder="viên"
            className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
          />
        </div>

        <div className="md:col-span-3">
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Số lần/ngày
          </label>
          <input
            type="number"
            min="0"
            step="1"
            value={line.timesPerDay ?? ''}
            onChange={(event) =>
              onChange(index, 'timesPerDay', parseNumber(event.currentTarget.value))
            }
            className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
          />
        </div>

        <div className="md:col-span-12">
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Thời điểm dùng
          </label>
          <div className="flex flex-wrap gap-2">
            {TIME_OPTIONS.map((timeOption) => {
              const isSelected = line.timesOfDay.includes(timeOption);

              return (
                <button
                  key={timeOption}
                  type="button"
                  onClick={() => {
                    const nextTimes = isSelected
                      ? line.timesOfDay.filter((time) => time !== timeOption)
                      : [...line.timesOfDay, timeOption];
                    onChange(index, 'timesOfDay', nextTimes);
                  }}
                  className={`rounded-full border px-3 py-1.5 text-sm font-medium transition ${
                    isSelected
                      ? 'border-teal-600 bg-teal-600 text-white'
                      : 'border-slate-300 bg-white text-slate-600 hover:border-teal-300'
                  }`}
                >
                  {timeOption}
                </button>
              );
            })}
          </div>
        </div>

        <div className="md:col-span-3">
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Số lượng cấp
          </label>
          <input
            type="number"
            min="0"
            step="0.5"
            value={line.quantityDispensed ?? line.quantity ?? ''}
            onChange={(event) =>
              onChange(
                index,
                'quantityDispensed',
                parseNumber(event.currentTarget.value),
              )
            }
            className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
          />
        </div>

        <div className="md:col-span-3">
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Số ngày dùng
          </label>
          <input
            type="number"
            min="0"
            step="1"
            value={line.daysSupply ?? ''}
            onChange={(event) =>
              onChange(index, 'daysSupply', parseNumber(event.currentTarget.value))
            }
            className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
          />
        </div>

        <div className="md:col-span-3">
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Ngày bắt đầu
          </label>
          <input
            type="date"
            value={line.startDate ?? ''}
            onChange={(event) => onChange(index, 'startDate', event.currentTarget.value)}
            className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
          />
        </div>

        <div className="md:col-span-3">
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Ngày kết thúc
          </label>
          <input
            type="date"
            value={line.endDate ?? ''}
            disabled={line.isContinuous}
            onChange={(event) => onChange(index, 'endDate', event.currentTarget.value)}
            className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none transition disabled:cursor-not-allowed disabled:bg-slate-100 focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
          />
        </div>

        <div className="md:col-span-12">
          <label className="inline-flex items-center gap-2 text-sm font-medium text-slate-700">
            <input
              type="checkbox"
              checked={Boolean(line.isContinuous)}
              onChange={(event) =>
                onChange(index, 'isContinuous', event.currentTarget.checked)
              }
              className="h-4 w-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
            />
            Dùng liên tục
          </label>
        </div>

        <div className="md:col-span-6">
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Ghi chú đặc biệt
          </label>
          <input
            value={line.specialInstructions ?? ''}
            onChange={(event) =>
              onChange(index, 'specialInstructions', event.currentTarget.value)
            }
            placeholder="VD: uống sau ăn, trước ngủ"
            className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
          />
        </div>

        <div className="md:col-span-6">
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Ghi chú điều dưỡng
          </label>
          <input
            value={line.instructions ?? ''}
            onChange={(event) =>
              onChange(index, 'instructions', event.currentTarget.value)
            }
            placeholder="Lưu ý thêm cho điều dưỡng"
            className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
          />
        </div>
      </div>
    </section>
  );
};
