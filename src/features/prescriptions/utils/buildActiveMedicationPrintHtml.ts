import { type PrescriptionItem, type Resident } from '../../../types/index';
import {
  buildActiveMedicationSummary,
  type ActiveMedicationSourceItem,
  type ActiveMedicationTimeSlot,
} from './activeMedicationSummary';

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function formatDate(value?: string): string {
  if (!value) return '';
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? value : parsed.toLocaleDateString('vi-VN');
}

function formatAge(dob: string): string {
  const birth = new Date(dob);
  return Number.isNaN(birth.getTime()) ? '' : `${new Date().getFullYear() - birth.getFullYear()} tuổi`;
}

function getDoseLabel(item: PrescriptionItem): string {
  if (typeof item.dosePerTime === 'number' && Number.isFinite(item.dosePerTime)) {
    return item.doseUnit?.trim() ? `${item.dosePerTime} ${item.doseUnit.trim()}` : `${item.dosePerTime}`;
  }
  return item.dosage?.trim() || '';
}

function getNoteLabel(item: PrescriptionItem): string {
  return item.specialInstructions?.trim() || item.instructions?.trim() || '';
}

function getSourceCode(item: ActiveMedicationSourceItem): string {
  return item.sourcePrescriptionCode || item.prescriptionCode || '';
}

function getSectionTitle(slot: ActiveMedicationTimeSlot): string {
  switch (slot) {
    case 'morning':
      return 'SÁNG';
    case 'noon':
      return 'TRƯA';
    case 'afternoon':
      return 'CHIỀU';
    case 'night':
      return 'TỐI';
  }
}

function renderRow(item: ActiveMedicationSourceItem): string {
  const doseLabel = getDoseLabel(item);
  const noteLabel = getNoteLabel(item);
  const sourceCode = getSourceCode(item);

  return `
        <tr>
            <td style="width: 10px;"></td>
            <td>
                <strong style="font-size: 11.5pt;">${escapeHtml(item.medicineName)}</strong>
                ${doseLabel || noteLabel ? `
                    <div style="font-size: 9pt; color: #555; margin-top: 2px;">
                        ${doseLabel ? escapeHtml(doseLabel) : ''}
                        ${doseLabel && noteLabel ? ' · ' : ''}
                        ${noteLabel ? escapeHtml(noteLabel) : ''}
                    </div>
                ` : ''}
            </td>
            <td style="width: 130px; color: #0f766e; font-weight: 600;">${escapeHtml(sourceCode)}</td>
        </tr>
    `;
}

const PRINT_STYLES = `
    @media print {
        @page { margin: 1cm; size: A4; }
        body { font-family: 'Times New Roman', serif; line-height: 1.35; color: #000; }
        table { width: 100%; border-collapse: collapse; margin-top: 8px; }
        th, td { border: 1px solid #d1d5db; padding: 6px 8px; text-align: left; font-size: 11pt; vertical-align: top; }
        th { background-color: #eef2f7; font-weight: bold; }
        h1 { font-size: 16pt; font-weight: bold; text-align: center; margin-bottom: 6px; text-transform: uppercase; }
        h2 { font-size: 13pt; margin: 12px 0 6px; padding: 4px 8px; background: #f8fafc; border-left: 4px solid #0f766e; }
        .header { display: flex; justify-content: space-between; margin-bottom: 18px; border-bottom: 2px solid #000; padding-bottom: 10px; }
        .logo-text { font-size: 10pt; font-weight: bold; }
        .sub-text { font-size: 9pt; }
        .info-row { display: flex; margin-bottom: 5px; font-size: 11pt; gap: 8px; flex-wrap: wrap; }
        .info-label { width: 120px; font-weight: bold; flex-shrink: 0; }
        .info-value { flex: 1; min-width: 140px; }
        .signature-grid { display: flex; justify-content: space-between; gap: 16px; margin-top: 28px; }
        .signature-box { text-align: center; width: 210px; }
    }
`;

function renderSection(title: string, rows: ActiveMedicationSourceItem[]): string {
  if (rows.length === 0) return '';

  return `
        <section>
            <h2>${title}</h2>
            <table>
                <thead>
                    <tr>
                        <th style="width: 22px;"></th>
                        <th>Thuốc</th>
                        <th style="width: 130px;">Kê từ đơn</th>
                    </tr>
                </thead>
                <tbody>
                    ${rows.map((row) => renderRow(row)).join('')}
                </tbody>
            </table>
        </section>
    `;
}

export function buildActiveMedicationPrintHtml(
  resident: Resident,
  activeItems: (ActiveMedicationSourceItem & { prescriptionCode: string; startDate: string })[],
): string {
  const summaryRows = buildActiveMedicationSummary(activeItems);

  const rowsBySlot: Record<ActiveMedicationTimeSlot, ActiveMedicationSourceItem[]> = {
    morning: [],
    noon: [],
    afternoon: [],
    night: [],
  };
  const unscheduledRows: ActiveMedicationSourceItem[] = [];

  summaryRows.forEach((row, index) => {
    const sourceItem = activeItems[index];
    const item: ActiveMedicationSourceItem = {
      ...sourceItem,
      prescriptionCode: sourceItem.sourcePrescriptionCode || sourceItem.prescriptionCode,
      sourcePrescriptionCode: row.sourcePrescriptionCode,
      sourcePrescriptionId: row.sourcePrescriptionId,
      sourcePrescriptionStartDate: row.sourcePrescriptionStartDate,
      sourcePrescriptionEndDate: row.sourcePrescriptionEndDate,
      sourcePrescriptionStatus: row.sourcePrescriptionStatus,
    };

    if (row.timeSlots.length === 0) {
      unscheduledRows.push(item);
      return;
    }

    row.timeSlots.forEach((slot) => rowsBySlot[slot].push(item));
  });

  const sections = [
    renderSection(getSectionTitle('morning'), rowsBySlot.morning),
    renderSection(getSectionTitle('noon'), rowsBySlot.noon),
    renderSection(getSectionTitle('afternoon'), rowsBySlot.afternoon),
    renderSection(getSectionTitle('night'), rowsBySlot.night),
    unscheduledRows.length > 0 ? renderSection('KHÁC', unscheduledRows) : '',
  ].filter(Boolean).join('');

  return `
        <!DOCTYPE html>
        <html>
        <head>
            <title>Phiếu Tổng Hợp Thuốc - ${escapeHtml(resident.name)}</title>
            <style>${PRINT_STYLES}</style>
        </head>
        <body>
            <div class="header">
                <div>
                   <div class="logo-text">VIỆN DƯỠNG LÃO FDC</div>
                   <div style="font-size: 14pt; font-weight: bold; margin-top: 10px;">PHIẾU TỔNG HỢP THUỐC ĐANG DÙNG</div>
                </div>
                 <div style="text-align: right;">
                    <div class="sub-text">Ngày in: ${escapeHtml(formatDate(new Date().toISOString().slice(0, 10)))}</div>
                </div>
            </div>

             <div style="margin-bottom: 20px;">
                <div class="info-row">
                    <span class="info-label">Họ và tên:</span>
                    <span class="info-value"><strong>${escapeHtml(resident.name.toUpperCase())}</strong></span>
                </div>
                <div class="info-row">
                    <span class="info-label">Phòng:</span>
                    <span class="info-value">${escapeHtml(resident.room)}${resident.bed ? ` (Giường: ${escapeHtml(resident.bed)})` : ''}</span>
                    <span class="info-label">Mã y tế:</span>
                    <span class="info-value">${escapeHtml(resident.id)}</span>
                </div>
                 <div class="info-row">
                    <span class="info-label">Dị ứng:</span>
                    <span class="info-value" style="color: #b91c1c; font-weight: bold;">
                        ${escapeHtml(resident.allergies?.map((allergy) => allergy.allergen).join(', ') || 'Không ghi nhận')}
                    </span>
                </div>
                <div class="info-row">
                    <span class="info-label">Năm sinh:</span>
                    <span class="info-value">${escapeHtml(new Date(resident.dob).getFullYear().toString())} (${escapeHtml(formatAge(resident.dob))})</span>
                    <span class="info-label">Giới tính:</span>
                    <span class="info-value">${escapeHtml(resident.gender)}</span>
                </div>
            </div>

            ${sections || '<div style="text-align:center; padding: 20px;">Hiện không có thuốc nào đang dùng.</div>'}

            <div class="signature-grid">
                <div class="signature-box">
                     <div style="font-weight: bold; margin-bottom: 60px;">Người lập phiếu</div>
                     <div>................................</div>
                </div>
                <div class="signature-box">
                    <div style="font-weight: bold; margin-bottom: 60px;">Y tá / Điều dưỡng</div>
                    <div>................................</div>
                </div>
            </div>
        </body>
        </html>
    `;
}
