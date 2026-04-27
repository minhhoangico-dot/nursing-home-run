import React, { useState } from 'react';
import {
  FileText,
  FileSignature,
  ClipboardCheck,
  Pill,
  Receipt,
  Lock,
} from 'lucide-react';
import { saveAs } from 'file-saver';

import { Modal } from '@/src/components/ui/index';
import { Resident, User } from '@/src/types/index';
import {
  buildContractDocx,
  buildContractFileName,
  type ContractContext,
} from '../admission/contract/buildContractDocx';
import {
  buildAssessmentDocx,
  buildAssessmentFileName,
  type AssessmentContext,
} from '../admission/contract/buildAssessmentDocx';
import { printDailyMedicationSheet } from '@/src/features/prescriptions/utils/printTemplates';
import type { PrescriptionItem } from '@/src/types/medical';

interface PrintMenuModalProps {
  resident: Resident;
  user: User;
  canViewFinance: boolean;
  onClose: () => void;
  onShowInvoice: (month: string) => void;
}

const todayIso = () => new Date().toISOString().slice(0, 10);
const currentMonth = () => new Date().toISOString().slice(0, 7);

const buildContractContext = (resident: Resident): ContractContext => ({
  contractNumber: resident.contractNumber || '___',
  signedDate: resident.contractSignedDate || todayIso(),
  residentName: resident.name,
  residentDob: resident.dob,
  residentIdCard: resident.idCard,
  guardianName: resident.guardianName,
  guardianPhone: resident.guardianPhone,
  guardianAddress: resident.guardianAddress,
  guardianIdCard: resident.guardianIdCard,
  guardianRelation: resident.guardianRelation,
});

const buildAssessmentContext = (resident: Resident, user: User): AssessmentContext => ({
  contractNumber: resident.contractNumber || '___',
  signedDate: resident.contractSignedDate || todayIso(),
  residentName: resident.name,
  residentDob: resident.dob,
  assessmentDate: todayIso(),
  assessorName: user.name,
});

const collectActiveItems = (
  resident: Resident,
): (PrescriptionItem & { prescriptionCode: string; startDate: string })[] => {
  const items: (PrescriptionItem & { prescriptionCode: string; startDate: string })[] = [];
  for (const p of resident.prescriptions || []) {
    if (p.status !== 'Active') continue;
    for (const item of p.items || []) {
      items.push({
        ...item,
        prescriptionCode: p.code,
        startDate: item.startDate || p.startDate,
      });
    }
  }
  return items;
};

interface TileProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  accent: string;
  disabled?: boolean;
  disabledHint?: string;
  loading?: boolean;
  onClick: () => void;
  children?: React.ReactNode;
}

const Tile = ({
  icon,
  title,
  description,
  accent,
  disabled,
  disabledHint,
  loading,
  onClick,
  children,
}: TileProps) => (
  <div
    className={`relative rounded-xl border p-4 transition-all ${
      disabled
        ? 'border-slate-100 bg-slate-50 opacity-60'
        : 'border-slate-200 bg-white hover:border-teal-300 hover:shadow-sm'
    }`}
  >
    <button
      type="button"
      disabled={disabled || loading}
      onClick={onClick}
      className="block w-full text-left disabled:cursor-not-allowed"
      title={disabled ? disabledHint : undefined}
    >
      <div className="flex items-start gap-3">
        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${accent}`}>
          {icon}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-1.5">
            <h4 className="font-bold text-slate-800">{title}</h4>
            {disabled && <Lock className="h-3.5 w-3.5 text-slate-400" />}
          </div>
          <p className="mt-0.5 text-xs text-slate-500">
            {loading ? 'Đang tạo file...' : disabled && disabledHint ? disabledHint : description}
          </p>
        </div>
      </div>
    </button>
    {children && <div className="mt-3 pl-13">{children}</div>}
  </div>
);

export const PrintMenuModal = ({
  resident,
  user,
  canViewFinance,
  onClose,
  onShowInvoice,
}: PrintMenuModalProps) => {
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [invoiceMonth, setInvoiceMonth] = useState(currentMonth());

  const handlePrintProfile = () => {
    onClose();
    setTimeout(() => window.print(), 100);
  };

  const handleContract = async () => {
    setBusy('contract');
    setError(null);
    try {
      const ctx = buildContractContext(resident);
      const blob = await buildContractDocx(ctx);
      saveAs(blob, buildContractFileName(ctx));
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không tạo được hợp đồng');
    } finally {
      setBusy(null);
    }
  };

  const handleAssessment = async () => {
    setBusy('assessment');
    setError(null);
    try {
      const ctx = buildAssessmentContext(resident, user);
      const blob = await buildAssessmentDocx(ctx);
      saveAs(blob, buildAssessmentFileName(ctx));
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không tạo được phiếu đánh giá');
    } finally {
      setBusy(null);
    }
  };

  const handlePrescription = () => {
    const activeItems = collectActiveItems(resident);
    if (activeItems.length === 0) {
      setError('Không có thuốc đang dùng để in');
      return;
    }
    printDailyMedicationSheet(resident, activeItems);
    onClose();
  };

  const handleInvoice = () => {
    onShowInvoice(invoiceMonth);
    onClose();
  };

  return (
    <Modal title="In hồ sơ NCT" onClose={onClose} maxWidth="max-w-2xl">
      <div className="space-y-3">
        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        )}

        <p className="text-xs text-slate-500">Chọn loại tài liệu cần in cho {resident.name}:</p>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <Tile
            icon={<FileText className="h-5 w-5" />}
            accent="bg-slate-100 text-slate-600"
            title="Hồ sơ tổng quan"
            description="In trang chi tiết NCT đang xem"
            onClick={handlePrintProfile}
          />

          <Tile
            icon={<FileSignature className="h-5 w-5" />}
            accent="bg-indigo-100 text-indigo-600"
            title="Hợp đồng dịch vụ"
            description="Tải file DOCX hợp đồng đã điền sẵn"
            loading={busy === 'contract'}
            onClick={() => void handleContract()}
          />

          <Tile
            icon={<ClipboardCheck className="h-5 w-5" />}
            accent="bg-emerald-100 text-emerald-600"
            title="Phiếu đánh giá cấp độ"
            description="Phụ lục 2 — đánh giá mức độ chăm sóc"
            loading={busy === 'assessment'}
            onClick={() => void handleAssessment()}
          />

          <Tile
            icon={<Pill className="h-5 w-5" />}
            accent="bg-rose-100 text-rose-600"
            title="Đơn thuốc đang dùng"
            description="In bảng thuốc Active theo ca uống"
            onClick={handlePrescription}
          />
        </div>

        <Tile
          icon={<Receipt className="h-5 w-5" />}
          accent="bg-amber-100 text-amber-600"
          title="Viện phí tháng"
          description="Xem trước hóa đơn dịch vụ tháng đã chọn"
          disabled={!canViewFinance}
          disabledHint="Cần quyền tài chính để in viện phí"
          onClick={handleInvoice}
        >
          {canViewFinance && (
            <div className="flex items-center gap-2">
              <input
                type="month"
                value={invoiceMonth}
                onChange={(e) => setInvoiceMonth(e.target.value)}
                className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
              />
              <button
                type="button"
                onClick={handleInvoice}
                className="rounded-lg bg-teal-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-teal-700"
              >
                Xem hóa đơn
              </button>
            </div>
          )}
        </Tile>
      </div>
    </Modal>
  );
};
