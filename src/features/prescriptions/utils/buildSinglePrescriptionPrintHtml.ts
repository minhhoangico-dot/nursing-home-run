import { type Prescription, type PrescriptionItem, type Resident } from '../../../types/index';

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

function getFrequencyLabel(item: PrescriptionItem): string {
  if (item.frequency?.trim()) return item.frequency.trim();
  if (typeof item.timesPerDay === 'number' && Number.isFinite(item.timesPerDay)) {
    return `${item.timesPerDay} lần/ngày`;
  }
  return '';
}

function getNoteLabel(item: PrescriptionItem): string {
  return item.specialInstructions?.trim() || item.instructions?.trim() || '';
}

function getDetailLine(item: PrescriptionItem): string {
  return [item.strengthSnapshot?.trim(), item.routeSnapshot?.trim()].filter(Boolean).join(' · ');
}

function getQuantityLabel(item: PrescriptionItem): string {
  if (typeof item.quantityDispensed === 'number' && Number.isFinite(item.quantityDispensed)) {
    return `${item.quantityDispensed}`;
  }
  if (typeof item.quantity === 'number' && Number.isFinite(item.quantity)) {
    return `${item.quantity}`;
  }
  return '';
}

function formatTimesOfDay(timesOfDay: string[] | undefined): string {
  return timesOfDay?.join(', ') || '';
}

function renderItemRow(item: PrescriptionItem, index: number): string {
  const detailLine = getDetailLine(item);
  const noteLine = getNoteLabel(item);
  const doseLabel = getDoseLabel(item);
  const frequency = getFrequencyLabel(item);
  const quantity = getQuantityLabel(item);

  return `
        <tr>
            <td style="text-align: center;">${index + 1}</td>
            <td>
                <strong>${escapeHtml(item.medicineName)}</strong>
                ${detailLine ? `<div style="font-size: 9pt; color: #555; margin-top: 2px;">${escapeHtml(detailLine)}</div>` : ''}
                ${noteLine ? `<div style="font-size: 9pt; color: #666; font-style: italic; margin-top: 2px;">${escapeHtml(noteLine)}</div>` : ''}
            </td>
            <td>${escapeHtml(doseLabel)}</td>
            <td>${escapeHtml(frequency)}</td>
            <td>${escapeHtml(formatTimesOfDay(item.timesOfDay))}</td>
            <td style="text-align: center;">${escapeHtml(quantity)}</td>
        </tr>
    `;
}

const PRINT_STYLES = `
    @media print {
        @page { margin: 1cm; size: A4; }
        body { font-family: 'Times New Roman', serif; line-height: 1.4; color: #000; }
        table { width: 100%; border-collapse: collapse; margin-top: 10px; margin-bottom: 10px; }
        th, td { border: 1px solid #ccc; padding: 6px; text-align: left; font-size: 11pt; vertical-align: top; }
        th { background-color: #f0f0f0; font-weight: bold; }
        h1 { font-size: 16pt; font-weight: bold; text-align: center; margin-bottom: 5px; text-transform: uppercase; }
        .header { display: flex; justify-content: space-between; margin-bottom: 20px; border-bottom: 2px solid #000; padding-bottom: 10px; }
        .logo-text { font-size: 10pt; font-weight: bold; }
        .sub-text { font-size: 9pt; }
        .info-row { display: flex; margin-bottom: 5px; font-size: 11pt; gap: 8px; flex-wrap: wrap; }
        .info-label { width: 120px; font-weight: bold; flex-shrink: 0; }
        .info-value { flex: 1; min-width: 140px; }
        .footer { margin-top: 30px; display: flex; justify-content: flex-end; }
        .signature-box { text-align: center; width: 200px; }
        .date-line { font-style: italic; margin-bottom: 10px; }
    }
`;

export function buildSinglePrescriptionPrintHtml(
  prescription: Prescription,
  resident: Resident,
): string {
  const itemsHtml = prescription.items?.map((item, index) => renderItemRow(item, index)).join('') || '';

  return `
        <!DOCTYPE html>
        <html>
        <head>
            <title>In Đơn Thuốc - ${escapeHtml(prescription.code)}</title>
            <style>${PRINT_STYLES}</style>
        </head>
        <body>
            <div class="header">
                <div>
                    <div class="logo-text">VIỆN DƯỠNG LÃO FDC</div>
                    <div class="sub-text">Địa chỉ: 123 Đường ABC, Quận XYZ, TP.HCM</div>
                    <div class="sub-text">Điện thoại: (028) 3838 8383</div>
                </div>
                <div style="text-align: right;">
                    <div class="sub-text">Mã đơn: <strong>${escapeHtml(prescription.code)}</strong></div>
                    <div class="sub-text">Ngày: ${escapeHtml(formatDate(prescription.prescriptionDate))}</div>
                </div>
            </div>

            <h1>ĐƠN THUỐC</h1>

            <div style="margin-bottom: 20px;">
                <div class="info-row">
                    <span class="info-label">Họ và tên:</span>
                    <span class="info-value"><strong>${escapeHtml(resident.name.toUpperCase())}</strong></span>
                    <span class="info-label">Năm sinh:</span>
                    <span class="info-value">${escapeHtml(new Date(resident.dob).getFullYear().toString())} (${escapeHtml(formatAge(resident.dob))})</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Giới tính:</span>
                    <span class="info-value">${escapeHtml(resident.gender)}</span>
                    <span class="info-label">Phòng:</span>
                    <span class="info-value">${escapeHtml(resident.room)}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Chẩn đoán:</span>
                    <span class="info-value">${escapeHtml(prescription.diagnosis)}</span>
                </div>
                ${prescription.notes ? `
                <div class="info-row">
                    <span class="info-label">Ghi chú:</span>
                    <span class="info-value">${escapeHtml(prescription.notes)}</span>
                </div>` : ''}
            </div>

            <table>
                <thead>
                    <tr>
                        <th style="width: 40px; text-align: center;">STT</th>
                        <th>Tên thuốc / Hướng dẫn</th>
                        <th style="width: 100px;">Liều lượng</th>
                        <th style="width: 100px;">Tần suất</th>
                        <th style="width: 120px;">Thời điểm</th>
                        <th style="width: 60px; text-align: center;">SL</th>
                    </tr>
                </thead>
                <tbody>
                    ${itemsHtml}
                </tbody>
            </table>

            <div style="margin-top: 10px; font-style: italic; font-size: 10pt;">
                * Quý khách vui lòng kiểm tra kỹ thuốc trước khi rời quầy.
            </div>

            <div class="footer">
                <div class="signature-box">
                    <div class="date-line">Ngày ...... tháng ...... năm 20......</div>
                    <div style="font-weight: bold; margin-bottom: 60px;">Bác sĩ kê đơn</div>
                    <div>${escapeHtml(prescription.doctorName || '................................')}</div>
                </div>
            </div>
        </body>
        </html>
    `;
}
