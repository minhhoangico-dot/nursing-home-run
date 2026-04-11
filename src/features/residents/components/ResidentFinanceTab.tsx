import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, Calendar, CreditCard, DollarSign, Pill, TrendingUp } from 'lucide-react';

import { formatCurrency } from '@/src/data/index';
import { calculateMedicationBillingRows } from '@/src/features/finance/utils/medicationBilling';
import { usePrescriptionsStore } from '@/src/stores/prescriptionStore';
import type { Resident, ServicePrice, ServiceUsage } from '@/src/types/index';

interface ResidentFinanceTabProps {
  resident: Resident;
  servicePrices: ServicePrice[];
  usageRecords: ServiceUsage[];
  onRecordUsage: (usage: ServiceUsage) => void;
  readOnly?: boolean;
}

const isSameBillingMonth = (date: string, month: Date) => {
  const parsed = new Date(date);

  return (
    parsed.getFullYear() === month.getFullYear() &&
    parsed.getMonth() === month.getMonth()
  );
};

export const ResidentFinanceTab: React.FC<ResidentFinanceTabProps> = ({
  resident,
  servicePrices,
  usageRecords,
  onRecordUsage,
  readOnly = false,
}) => {
  const { prescriptions, medicines } = usePrescriptionsStore();
  const currentMonth = useMemo(() => new Date(), []);
  const billingMonth = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}`;
  const currentMonthStr = `${currentMonth.getMonth() + 1}/${currentMonth.getFullYear()}`;

  const fixedServices = useMemo(() => {
    const billedFixed = usageRecords.filter((usage) => {
      const service = servicePrices.find((item) => item.id === usage.serviceId);

      return (
        usage.residentId === resident.id &&
        service?.billingType === 'FIXED' &&
        isSameBillingMonth(usage.date, currentMonth)
      );
    });

    if (billedFixed.length > 0) return billedFixed;

    return [
      {
        id: 'estimated-room',
        residentId: resident.id,
        serviceId: 'estimated-room',
        serviceName: `Phòng ${resident.room} (${resident.roomType || 'Tiêu chuẩn'})`,
        unitPrice: 8_500_000,
        quantity: 1,
        totalAmount: 8_500_000,
        date: new Date().toISOString(),
        status: 'Unbilled' as const,
        description: 'Giá tạm tính từ loại phòng, chưa chốt hóa đơn',
      },
      {
        id: 'estimated-care',
        residentId: resident.id,
        serviceId: 'estimated-care',
        serviceName: `Chăm sóc cấp độ ${resident.careLevel || 1}`,
        unitPrice: 0,
        quantity: 1,
        totalAmount: 0,
        date: new Date().toISOString(),
        status: 'Unbilled' as const,
        description: 'Chưa có bảng giá chăm sóc khớp hồ sơ',
      },
    ] satisfies ServiceUsage[];
  }, [currentMonth, resident, servicePrices, usageRecords]);

  const incurredServices = useMemo(
    () =>
      usageRecords.filter((usage) => {
        const service = servicePrices.find((item) => item.id === usage.serviceId);
        const isOneOff = service?.billingType === 'ONE_OFF' || (!service && usage.serviceId.startsWith('SVC'));

        return usage.residentId === resident.id && isSameBillingMonth(usage.date, currentMonth) && isOneOff;
      }),
    [currentMonth, resident.id, servicePrices, usageRecords],
  );

  const medicationCosts = useMemo(
    () =>
      calculateMedicationBillingRows({
        residentId: resident.id,
        billingMonth,
        prescriptions,
        medicines,
      }),
    [billingMonth, medicines, prescriptions, resident.id],
  );

  const totalFixed = fixedServices.reduce((sum, service) => sum + service.totalAmount, 0);
  const totalIncurred = incurredServices.reduce((sum, service) => sum + service.totalAmount, 0);
  const totalMedication = medicationCosts.reduce((sum, item) => sum + item.amount, 0);
  const totalEstimate = totalFixed + totalIncurred + totalMedication;

  const handleAddService = (serviceId: string) => {
    if (readOnly) return;

    const service = servicePrices.find((item) => item.id === serviceId);
    if (!service) return;

    onRecordUsage({
      id: `USG-${Date.now()}`,
      residentId: resident.id,
      serviceId: service.id,
      serviceName: service.name,
      date: new Date().toISOString(),
      quantity: 1,
      unitPrice: service.price,
      totalAmount: service.price,
      description: `Quick-add from resident finance tab using service ${service.id}`,
      status: 'Unbilled',
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex items-center justify-between gap-4">
        <h3 className="flex items-center gap-2 text-lg font-bold text-slate-800">
          <Calendar className="h-5 w-5 text-teal-600" />
          Chi phí tháng {currentMonthStr}
        </h3>
        <span className="text-xs text-slate-500">Dữ liệu tạm tính đến thời điểm hiện tại</span>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-lg border border-sky-200 bg-sky-50 p-4 shadow-sm">
          <div className="mb-2 flex items-start justify-between">
            <DollarSign className="h-5 w-5 text-sky-600" />
            <span className="rounded bg-sky-100 px-2 py-0.5 text-xs font-semibold text-sky-700">Tạm tính</span>
          </div>
          <p className="text-xs font-medium uppercase text-sky-600">Tổng chi phí tháng</p>
          <p className="mt-1 text-2xl font-bold text-slate-800">{formatCurrency(totalEstimate)}</p>
        </div>

        <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 shadow-sm">
          <div className="mb-2 flex items-start justify-between">
            <CreditCard className="h-5 w-5 text-emerald-600" />
            <span className="rounded bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700">Số dư</span>
          </div>
          <p className="text-xs font-medium uppercase text-emerald-600">Ký quỹ khả dụng</p>
          <p className="mt-1 text-2xl font-bold text-slate-800">{formatCurrency(10_000_000)}</p>
        </div>

        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 shadow-sm">
          <div className="mb-2 flex items-start justify-between">
            <AlertCircle className="h-5 w-5 text-amber-600" />
            <span className="rounded bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-700">Công nợ</span>
          </div>
          <p className="text-xs font-medium uppercase text-amber-600">Cần thanh toán</p>
          <p className="mt-1 text-2xl font-bold text-slate-800">
            {resident.balance < 0 ? formatCurrency(Math.abs(resident.balance)) : '0 đ'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="space-y-6">
          <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-4 py-3">
              <h4 className="flex items-center gap-2 font-semibold text-slate-800">
                <DollarSign className="h-4 w-4 text-slate-500" />
                Dịch vụ cố định
              </h4>
              <span className="text-sm font-bold text-slate-900">{formatCurrency(totalFixed)}</span>
            </div>
            {fixedServices.length > 0 ? (
              <table className="w-full text-sm">
                <tbody className="divide-y divide-slate-100">
                  {fixedServices.map((service) => (
                    <tr key={service.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 text-slate-700">
                        {service.serviceName}
                        {service.description && (
                          <div className="mt-1 text-xs text-slate-500">{service.description}</div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right font-medium text-slate-900">
                        {formatCurrency(service.totalAmount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="p-4 text-center text-sm italic text-slate-400">Chưa có dịch vụ cố định</p>
            )}
          </section>

          <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-4 py-3">
              <h4 className="flex items-center gap-2 font-semibold text-slate-800">
                <Pill className="h-4 w-4 text-slate-500" />
                Tiền thuốc tháng này
              </h4>
              <span className="text-sm font-bold text-slate-900">{formatCurrency(totalMedication)}</span>
            </div>
            {medicationCosts.length > 0 ? (
              <table className="w-full text-sm">
                <tbody className="divide-y divide-slate-100">
                  {medicationCosts.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3">
                        <div className="font-medium text-slate-700">{item.medicineName}</div>
                        <div className="mt-1 text-xs text-slate-500">
                          {item.prescriptionCode} - SL {item.quantity} x {formatCurrency(item.unitPrice)}
                        </div>
                        {item.provisional && (
                          <div className="mt-2 inline-flex rounded bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-700">
                            Tạm tính: {item.note}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right font-medium text-slate-900">
                        {formatCurrency(item.amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="p-6 text-center">
                <p className="mb-3 text-sm text-slate-500">Chưa có thuốc Active tính phí trong tháng</p>
                <Link
                  to="/medications"
                  className="rounded-full bg-teal-50 px-3 py-1.5 text-xs font-medium text-teal-700 transition-colors hover:bg-teal-100"
                >
                  Mở danh sách đơn thuốc
                </Link>
              </div>
            )}
          </section>
        </div>

        <section className="flex h-full flex-col overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-4 py-3">
            <h4 className="flex items-center gap-2 font-semibold text-slate-800">
              <TrendingUp className="h-4 w-4 text-slate-500" />
              Dịch vụ phát sinh
            </h4>
            <span className="text-sm font-bold text-slate-900">{formatCurrency(totalIncurred)}</span>
          </div>

          <div className="border-b border-slate-100 bg-white p-4">
            <select
              className="w-full rounded-lg border-slate-200 text-sm shadow-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
              disabled={readOnly}
              aria-label="resident-finance-quick-add"
              onChange={(event) => {
                if (event.target.value) {
                  handleAddService(event.target.value);
                  event.target.value = '';
                }
              }}
            >
              <option value="">+ Thêm dịch vụ nhanh...</option>
              {servicePrices
                .filter((service) => service.billingType === 'ONE_OFF')
                .map((service) => (
                  <option key={service.id} value={service.id}>
                    {service.name} - {formatCurrency(service.price)}
                  </option>
                ))}
            </select>
          </div>

          <div className="max-h-[400px] flex-1 overflow-auto">
            {incurredServices.length > 0 ? (
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-slate-50 text-xs font-medium uppercase text-slate-500">
                  <tr>
                    <th className="px-4 py-2 text-left">Dịch vụ</th>
                    <th className="w-20 px-4 py-2 text-center">SL</th>
                    <th className="px-4 py-2 text-right">T.Tiền</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {incurredServices.map((usage) => (
                    <tr key={usage.id} className="transition-colors hover:bg-slate-50">
                      <td className="px-4 py-3">
                        <div className="font-medium text-slate-700">{usage.serviceName}</div>
                        <div className="text-xs text-slate-500">{new Date(usage.date).toLocaleDateString('vi-VN')}</div>
                        {usage.description && (
                          <div className="mt-1 text-xs text-slate-500">{usage.description}</div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center text-slate-600">{usage.quantity}</td>
                      <td className="px-4 py-3 text-right font-semibold text-slate-900">
                        {formatCurrency(usage.totalAmount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="flex min-h-[200px] flex-col items-center justify-center p-8 text-slate-400">
                <TrendingUp className="mb-2 h-8 w-8 opacity-20" />
                <p className="text-sm italic">Chưa có dịch vụ phát sinh</p>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};
