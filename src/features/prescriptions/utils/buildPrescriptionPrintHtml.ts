const escapeHtml = (value?: string | number | null) =>
  String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const formatSlashDate = (value?: string | null) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';

  const day = `${date.getDate()}`.padStart(2, '0');
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

const formatLongDate = (value?: string | null) => {
  if (!value) return 'Ngày ...... tháng ...... năm ......';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return 'Ngày ...... tháng ...... năm ......';
  }

  const day = `${date.getDate()}`.padStart(2, '0');
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const year = date.getFullYear();
  return `Ngày ${day} tháng ${month} năm ${year}`;
};

const formatQuantity = (value?: string | number | null) => {
  if (value === null || value === undefined || value === '') return '';
  const numeric = Number(value);
  if (Number.isFinite(numeric)) {
    return `${numeric}`.padStart(2, '0');
  }
  return String(value);
};

const displayValue = (value?: string | number | null) => escapeHtml(value ?? '');

export type PrintableFacility = {
  name?: string;
  address?: string;
  phone?: string;
  email?: string;
  taxCode?: string;
  website?: string;
};

export type PrintableResident = {
  name: string;
  dob?: string;
  gender?: string;
  address?: string;
  room?: string;
  bed?: string;
  identityNumber?: string;
  insuranceCode?: string;
  weight?: string | number;
};

export type PrintablePrescription = {
  code: string;
  diagnosis?: string;
  prescriptionDate?: string;
  doctorName?: string;
  doctorPhone?: string;
  notes?: string;
  followUpDate?: string;
};

export type PrintableMedicineRow = {
  name: string;
  instructions?: string;
  quantity?: string | number | null;
  unit?: string | null;
};

export type BuildPrescriptionPrintHtmlInput = {
  facility: PrintableFacility;
  resident: PrintableResident;
  prescription: PrintablePrescription;
  medicineRows: PrintableMedicineRow[];
};

const STYLES = `
  @page { size: A4; margin: 14mm 16mm; }
  body {
    margin: 0;
    color: #111827;
    font-family: "Times New Roman", serif;
    font-size: 14px;
    line-height: 1.5;
  }
  .sheet {
    max-width: 794px;
    margin: 0 auto;
  }
  .topbar {
    display: flex;
    justify-content: space-between;
    gap: 24px;
    align-items: flex-start;
  }
  .brand {
    display: flex;
    gap: 16px;
    align-items: flex-start;
    flex: 1;
  }
  .brand-mark {
    width: 82px;
    min-width: 82px;
    height: 82px;
    border: 2px solid #0f766e;
    border-radius: 18px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #0f766e;
    font-weight: 700;
    font-size: 28px;
    letter-spacing: 2px;
  }
  .facility-name {
    margin: 0;
    font-size: 16px;
    font-weight: 700;
    text-transform: uppercase;
  }
  .facility-line {
    margin: 0;
    font-size: 13px;
  }
  .barcode-box {
    min-width: 200px;
    text-align: right;
  }
  .barcode-bars {
    height: 56px;
    border: 1px solid #111827;
    background:
      repeating-linear-gradient(
        to right,
        #111827 0,
        #111827 2px,
        transparent 2px,
        transparent 5px,
        #111827 5px,
        #111827 6px,
        transparent 6px,
        transparent 9px
      );
  }
  .barcode-code {
    margin-top: 6px;
    font-size: 12px;
    letter-spacing: 1px;
  }
  .title {
    margin: 18px 0 20px;
    text-align: center;
    font-size: 28px;
    font-weight: 700;
    color: #1d4ed8;
    text-transform: uppercase;
  }
  .info-line {
    margin: 0 0 6px;
    font-size: 14px;
  }
  .info-line strong {
    font-weight: 700;
  }
  .info-line.split {
    display: flex;
    gap: 24px;
    flex-wrap: wrap;
  }
  .section-heading {
    margin: 18px 0 10px;
    font-size: 15px;
    font-weight: 700;
  }
  .med-list {
    margin: 0;
    padding: 0 0 0 30px;
  }
  .med-row {
    display: grid;
    grid-template-columns: 1fr 52px 72px;
    gap: 10px;
    margin-bottom: 10px;
    break-inside: avoid;
  }
  .med-text {
    min-width: 0;
  }
  .med-name {
    font-size: 14px;
    font-weight: 700;
  }
  .med-instruction {
    margin-top: 2px;
    font-size: 13px;
    font-style: italic;
  }
  .med-qty,
  .med-unit {
    text-align: right;
    font-size: 14px;
    font-weight: 700;
    padding-top: 2px;
  }
  .meta-block {
    margin-top: 16px;
  }
  .meta-title {
    font-weight: 700;
    text-decoration: underline;
  }
  .meta-content {
    margin-top: 4px;
    white-space: pre-wrap;
  }
  .meta-placeholder {
    min-height: 20px;
  }
  .signature {
    margin-top: 42px;
    display: flex;
    justify-content: flex-end;
  }
  .signature-box {
    width: 250px;
    text-align: center;
  }
  .signature-role {
    margin-top: 4px;
    font-size: 15px;
    font-weight: 700;
    text-transform: uppercase;
  }
  .signature-note {
    font-style: italic;
  }
`;

export const buildPrescriptionPrintHtml = ({
  facility,
  resident,
  prescription,
  medicineRows,
}: BuildPrescriptionPrintHtmlInput) => {
  const medicineHtml =
    medicineRows.length > 0
      ? medicineRows
          .map(
            (row, index) => `
              <div class="med-row">
                <div class="med-text">
                  <div class="med-name">${index + 1}. ${displayValue(row.name)}</div>
                  <div class="med-instruction">${displayValue(row.instructions)}</div>
                </div>
                <div class="med-qty">${displayValue(formatQuantity(row.quantity))}</div>
                <div class="med-unit">${displayValue(row.unit)}</div>
              </div>
            `,
          )
          .join('')
      : '<div class="meta-placeholder"></div>';

  return `
    <!DOCTYPE html>
    <html lang="vi">
      <head>
        <meta charset="UTF-8" />
        <title>Đơn thuốc - ${displayValue(prescription.code)}</title>
        <style>${STYLES}</style>
      </head>
      <body>
        <div class="sheet">
          <div class="topbar">
            <div class="brand">
              <div class="brand-mark">FDC</div>
              <div>
                <p class="facility-name">${displayValue(facility.name)}</p>
                <p class="facility-line">${displayValue(facility.address)}</p>
                <p class="facility-line">Điện thoại: ${displayValue(facility.phone)}</p>
                <p class="facility-line">Website: ${displayValue(facility.website)}</p>
              </div>
            </div>
            <div class="barcode-box">
              <div class="barcode-bars"></div>
              <div class="barcode-code">${displayValue(prescription.code)}</div>
            </div>
          </div>

          <div class="title">Đơn thuốc</div>

          <p class="info-line">- Họ tên: <strong>${displayValue(resident.name).toUpperCase()}</strong></p>
          <p class="info-line">- Số định danh cá nhân/số căn cước công dân/số hộ chiếu của người bệnh (nếu có): ${displayValue(resident.identityNumber)}</p>
          <div class="info-line split">
            <span>- Ngày sinh: ${displayValue(formatSlashDate(resident.dob))}</span>
            <span>Cân nặng: ${displayValue(resident.weight)}</span>
            <span>Giới tính: ${displayValue(resident.gender)}</span>
          </div>
          <p class="info-line">- Mã số bảo hiểm y tế (nếu có): ${displayValue(resident.insuranceCode)}</p>
          <p class="info-line">- Nơi thường trú/tạm trú/nơi ở hiện tại: ${displayValue(resident.address)}</p>
          <p class="info-line">- Chẩn đoán: ${displayValue(prescription.diagnosis)}</p>

          <div class="section-heading">Thuốc điều trị:</div>
          <div class="med-list">${medicineHtml}</div>

          <div class="meta-block">
            <div><span class="meta-title">Tái khám ngày:</span> ${displayValue(formatLongDate(prescription.followUpDate))}</div>
          </div>

          <div class="meta-block">
            <div class="meta-title">Lời dặn:</div>
            <div class="meta-content">${displayValue(prescription.notes)}</div>
          </div>

          <div class="meta-block">
            <div><span class="meta-title">Liên hệ với bác sĩ điều trị:</span> ${displayValue(prescription.doctorPhone)}</div>
          </div>

          <div class="signature">
            <div class="signature-box">
              <div>${displayValue(formatLongDate(prescription.prescriptionDate))}</div>
              <div class="signature-role">Bác sĩ/Y sĩ khám bệnh</div>
              <div class="signature-note">(Ký, ghi rõ họ tên)</div>
              <div style="margin-top: 64px;">${displayValue(prescription.doctorName)}</div>
            </div>
          </div>
        </div>
      </body>
    </html>
  `;
};
