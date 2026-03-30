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
  if (Number.isNaN(parsed.getTime())) return value;

  const day = `${parsed.getDate()}`.padStart(2, '0');
  const month = `${parsed.getMonth() + 1}`.padStart(2, '0');
  const year = parsed.getFullYear();
  return `${day}/${month}/${year}`;
}

function formatLongDate(value?: string): string {
  if (!value) return 'Ngày ...... tháng ...... năm ........';

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return escapeHtml(value);

  const day = `${parsed.getDate()}`.padStart(2, '0');
  const month = `${parsed.getMonth() + 1}`.padStart(2, '0');
  const year = parsed.getFullYear();
  return `Ngày ${day} tháng ${month} năm ${year}`;
}

function formatDateOrBlank(value?: string): string {
  return value ? formatDate(value) : '';
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

function getTimesOfDayLabel(item: PrescriptionItem): string {
  return item.timesOfDay?.map((slot) => slot.trim()).filter(Boolean).join(', ') || '';
}

function getInstructionLabel(item: PrescriptionItem): string {
  const doseLabel = getDoseLabel(item);
  const frequencyLabel = getFrequencyLabel(item);
  const timesOfDayLabel = getTimesOfDayLabel(item);
  const noteLabel = item.specialInstructions?.trim() || item.instructions?.trim() || '';

  const segments: string[] = [];

  if (item.routeSnapshot?.trim() && doseLabel) {
    segments.push(`${item.routeSnapshot.trim()} ${doseLabel}`);
  } else if (item.routeSnapshot?.trim()) {
    segments.push(item.routeSnapshot.trim());
  } else if (doseLabel) {
    segments.push(doseLabel);
  }

  if (frequencyLabel) segments.push(frequencyLabel);
  if (timesOfDayLabel) segments.push(timesOfDayLabel);
  if (noteLabel) segments.push(noteLabel);

  return segments.join(', ');
}

function getQuantityValue(item: PrescriptionItem): string {
  if (typeof item.quantityDispensed === 'number' && Number.isFinite(item.quantityDispensed)) {
    return `${item.quantityDispensed}`;
  }

  if (typeof item.quantity === 'number' && Number.isFinite(item.quantity)) {
    return `${item.quantity}`;
  }

  return '';
}

function getQuantityUnit(item: PrescriptionItem): string {
  return item.doseUnit?.trim() || '';
}

function getReferenceCode(prescription: Prescription, resident: Resident): string {
  return resident.clinicCode?.trim() || prescription.code?.trim() || '';
}

function getSignatureDoctorName(doctorName?: string): string {
  const normalizedName = doctorName?.trim() || '';

  if (!normalizedName) return '&nbsp;';
  if (normalizedName.toLowerCase() === 'hệ thống fdc') return '&nbsp;';

  return escapeHtml(normalizedName);
}

function buildBarcodeSvg(value: string): string {
  const barcodeValue = value.trim() || ' ';
  const bytes = Array.from(new TextEncoder().encode(barcodeValue));
  const quietZone = 12;
  const moduleWidth = 2;
  const height = 42;
  const startGuard = '101011110';
  const endGuard = '111010101';
  const bitStream = `${startGuard}${bytes
    .map((byte) => {
      const binary = byte.toString(2).padStart(8, '0');
      const parityBit = binary.split('').reduce((sum, bit) => sum + Number(bit), 0) % 2;
      return `10${binary}${parityBit}01`;
    })
    .join('00')}${endGuard}`;

  let x = quietZone;
  const bars: string[] = [];

  for (const bit of bitStream) {
    if (bit === '1') {
      bars.push(`<rect x="${x}" y="0" width="${moduleWidth}" height="${height}" fill="#000000" />`);
    }

    x += moduleWidth;
  }

  const width = x + quietZone;

  return `
    <svg
      class="barcode-svg"
      data-barcode-value="${escapeHtml(barcodeValue)}"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 ${width} ${height}"
      role="img"
      aria-label="Mã vạch đơn thuốc ${escapeHtml(barcodeValue)}"
      preserveAspectRatio="none"
    >
      <rect x="0" y="0" width="${width}" height="${height}" fill="#ffffff" />
      ${bars.join('')}
    </svg>
  `;
}

function renderInfoLine(label: string, value: string, extraClass = ''): string {
  const className = ['info-line', extraClass].filter(Boolean).join(' ');

  return `
    <div class="${className}">
      <span class="dash">-</span>
      <span class="label">${escapeHtml(label)}</span>
      <span class="value">${value || '&nbsp;'}</span>
    </div>
  `;
}

function renderBirthMetaRow(birthDate: string, gender: string): string {
  return `
    <div class="info-line birth-meta-row">
      <span class="dash">-</span>
      <div class="birth-meta-content">
        <div class="birth-meta-field">
          <span class="birth-meta-label">Ngày sinh:</span>
          <span class="birth-meta-value">${birthDate || '&nbsp;'}</span>
        </div>
        <div class="birth-meta-field">
          <span class="birth-meta-label">Cân nặng:</span>
          <span class="birth-meta-value">&nbsp;</span>
        </div>
        <div class="birth-meta-field">
          <span class="birth-meta-label">Giới tính:</span>
          <span class="birth-meta-value">${gender || '&nbsp;'}</span>
        </div>
      </div>
    </div>
  `;
}

function renderMedicineRow(item: PrescriptionItem, index: number): string {
  const instructionLabel = getInstructionLabel(item);
  const quantityValue = getQuantityValue(item);
  const quantityUnit = getQuantityUnit(item);

  return `
    <div class="medicine-row">
      <div class="medicine-index">${index + 1}.</div>
      <div class="medicine-main">
        <div class="medicine-name">${escapeHtml(item.medicineName)}</div>
        ${instructionLabel ? `<div class="medicine-instruction">(${escapeHtml(instructionLabel)})</div>` : ''}
      </div>
      <div class="medicine-quantity">${escapeHtml(quantityValue)}</div>
      <div class="medicine-unit">${escapeHtml(quantityUnit)}</div>
    </div>
  `;
}

const CLINIC_NOTES = [
  '* Khám lại ngay khi có bất thường.',
  '* Tái khám miễn phí trong 3 ngày đầu tại Trung tâm kể từ ngày khám (không áp dụng với BHYT)',
  '* Tái khám tại nhà trong 3 ngày đầu giảm 50%.',
  '* Hóa đơn chỉ xuất trong ngày. Trân trọng!',
];

const PRINT_STYLES = `
  @page {
    margin: 10mm;
    size: A4;
  }

  * {
    box-sizing: border-box;
  }

  html,
  body {
    margin: 0;
    padding: 0;
    background: #ffffff;
    color: #000000;
    font-family: 'Times New Roman', serif;
  }

  body {
    line-height: 1.25;
  }

  .page {
    width: 190mm;
    min-height: 277mm;
    margin: 0 auto;
    padding: 6mm 8mm 8mm;
  }

  .header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 12mm;
  }

  .brand-block {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    flex: 1;
  }

  .brand-mark {
    width: 82px;
    min-width: 82px;
  }

  .clinic-lines {
    flex: 1;
    padding-top: 2px;
  }

  .clinic-name,
  .clinic-address,
  .clinic-phone,
  .clinic-website {
    font-size: 16px;
    font-weight: 700;
  }

  .title-row {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: 12mm;
    margin: 6mm 0 4mm;
  }

  .page-title {
    flex: 1;
    text-align: center;
    color: #1d5fa7;
    font-size: 30px;
    font-weight: 700;
    letter-spacing: 0.5px;
    margin-left: 76px;
  }

  .barcode-block {
    width: 190px;
    text-align: center;
    margin-top: -8px;
  }

  .logo-placeholder {
    width: 82px;
    height: 82px;
    border: 1.5px dashed #7c9ac3;
    border-radius: 10px;
    color: #45658f;
    font-size: 13px;
    font-weight: 700;
    display: flex;
    align-items: center;
    justify-content: center;
    text-align: center;
    padding: 8px;
  }

  .barcode-svg {
    display: block;
    width: 100%;
    height: 42px;
    border: 1px solid #333333;
    background: #ffffff;
  }

  .barcode-text {
    font-size: 14px;
    margin-top: 4px;
  }

  .patient-section {
    margin-top: 2mm;
    font-size: 16px;
  }

  .info-line {
    display: flex;
    align-items: baseline;
    gap: 6px;
    margin-bottom: 4px;
  }

  .dash {
    width: 12px;
    font-weight: 700;
    flex: 0 0 auto;
  }

  .label {
    flex: 0 0 auto;
    font-weight: 400;
  }

  .value {
    flex: 1;
    min-width: 0;
  }

  .highlight {
    font-weight: 700;
  }

  .birth-meta-row {
    align-items: flex-start;
  }

  .birth-meta-content {
    flex: 1;
    min-width: 0;
    display: flex;
    align-items: baseline;
    gap: 14px;
    flex-wrap: nowrap;
  }

  .birth-meta-field {
    display: inline-flex;
    align-items: baseline;
    gap: 6px;
    min-width: 0;
    white-space: nowrap;
  }

  .birth-meta-label {
    font-weight: 400;
  }

  .birth-meta-value {
    min-width: 56px;
  }

  .section-label {
    font-size: 18px;
    margin: 8px 0 10px 12px;
  }

  .medicines {
    margin-left: 24px;
  }

  .medicine-row {
    display: grid;
    grid-template-columns: 28px minmax(0, 1fr) 42px 56px;
    gap: 8px;
    align-items: start;
    margin-bottom: 9px;
    font-size: 16px;
  }

  .medicine-index,
  .medicine-quantity,
  .medicine-unit {
    font-weight: 700;
  }

  .medicine-name {
    font-weight: 700;
  }

  .medicine-instruction {
    margin-top: 2px;
    font-style: italic;
  }

  .follow-up,
  .advice,
  .doctor-contact {
    font-size: 16px;
    margin-top: 8px;
  }

  .notes-block {
    margin-top: 8px;
  }

  .notes-title {
    font-size: 16px;
    text-decoration: underline;
    margin-bottom: 2px;
  }

  .notes-line {
    font-size: 15px;
    margin-left: 44px;
    margin-bottom: 2px;
    font-style: italic;
  }

  .signature {
    width: 320px;
    margin-left: auto;
    margin-top: 28px;
    text-align: center;
  }

  .signature-date {
    font-size: 16px;
    margin-bottom: 6px;
  }

  .signature-title {
    font-size: 16px;
    font-weight: 700;
  }

  .signature-hint {
    font-size: 15px;
    font-style: italic;
  }

  .signature-name {
    min-height: 70px;
    padding-top: 54px;
    font-size: 16px;
    font-weight: 700;
  }
`;

export function buildSinglePrescriptionPrintHtml(
  prescription: Prescription,
  resident: Resident,
): string {
  const referenceCode = getReferenceCode(prescription, resident);
  const medicinesHtml = prescription.items?.map((item, index) => renderMedicineRow(item, index)).join('') || '';
  const residentName = resident.name?.trim() ? escapeHtml(resident.name.toUpperCase()) : '&nbsp;';
  const diagnosis = prescription.diagnosis?.trim() ? escapeHtml(prescription.diagnosis.trim()) : '&nbsp;';
  const gender = resident.gender?.trim() ? escapeHtml(resident.gender.trim()) : '&nbsp;';
  const birthDate = formatDateOrBlank(resident.dob) || '&nbsp;';
  const reminder = prescription.notes?.trim() ? escapeHtml(prescription.notes.trim()) : '&nbsp;';
  const doctorName = getSignatureDoctorName(prescription.doctorName);
  const barcodeSvg = buildBarcodeSvg(referenceCode);

  return `
    <!DOCTYPE html>
    <html lang="vi">
      <head>
        <meta charset="UTF-8" />
        <title>Đơn thuốc - ${escapeHtml(referenceCode || prescription.code)}</title>
        <style>${PRINT_STYLES}</style>
      </head>
      <body>
        <div class="page">
          <div class="header">
            <div class="brand-block">
              <div class="brand-mark">
                <div class="logo-placeholder">Ảnh logo</div>
              </div>
              <div class="clinic-lines">
                <div class="clinic-name">TRUNG TÂM BÁC SĨ GIA ĐÌNH HÀ NỘI</div>
                <div class="clinic-address">Số 75 Đường Hồ Mễ Trì - P.Đại Mỗ - TP.Hà Nội</div>
                <div class="clinic-phone">Điện thoại: 024.35.430.430</div>
                <div class="clinic-website">Website: www.bacsigiadinhhanoi.vn</div>
              </div>
            </div>
          </div>

          <div class="title-row">
            <div class="page-title">ĐƠN THUỐC</div>
            <div class="barcode-block">
              ${barcodeSvg}
              <div class="barcode-text">${escapeHtml(referenceCode)}</div>
            </div>
          </div>

          <div class="patient-section">
            ${renderInfoLine('Họ tên:', `<span class="highlight">${residentName}</span>`)}
            ${renderInfoLine(
              'Số định danh cá nhân/số căn cước công dân/số hộ chiếu của người bệnh (nếu có):',
              '&nbsp;',
            )}
            ${renderBirthMetaRow(birthDate, gender)}
            ${renderInfoLine('Mã số bảo hiểm y tế (nếu có):', '&nbsp;')}
            ${renderInfoLine('Nơi thường trú hiện tại:', '&nbsp;')}
            ${renderInfoLine('Chẩn đoán:', diagnosis)}
          </div>

          <div class="section-label">Thuốc điều trị:</div>
          <div class="medicines">
            ${medicinesHtml || '<div class="medicine-row"><div class="medicine-main">Không có thuốc trong đơn.</div></div>'}
          </div>

          <div class="follow-up"><strong>Tái khám ngày:</strong> Ngày ...... tháng ...... năm ........</div>

          <div class="notes-block">
            <div class="notes-title">Lưu ý:</div>
            ${CLINIC_NOTES.map((line) => `<div class="notes-line">${escapeHtml(line)}</div>`).join('')}
          </div>

          <div class="advice"><strong>Lời dặn:</strong> ${reminder}</div>
          <div class="doctor-contact"><strong>Liên hệ với bác sĩ điều trị:</strong> &nbsp;</div>

          <div class="signature">
            <div class="signature-date">${escapeHtml(formatLongDate(prescription.prescriptionDate))}</div>
            <div class="signature-title">BÁC SỸ KHÁM BỆNH</div>
            <div class="signature-hint">(Ký, ghi rõ họ tên)</div>
            <div class="signature-name">${doctorName}</div>
          </div>
        </div>
      </body>
    </html>
  `;
}
