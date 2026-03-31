import { Prescription, PrescriptionItem, Resident } from '../../../types/index';
import { useRoomConfigStore } from '../../../stores/roomConfigStore';
import { getFacilityBranding } from '../../../utils/facilityBranding';

const PRINT_STYLES = `
    :root {
        --page-padding-top: 8mm;
        --page-padding-bottom: 10mm;
        --page-side-padding: 8mm;
        --ink: #10243d;
        --title: #1d4f8c;
    }
    @media print {
        @page { margin: 8mm 10mm; size: A4; }
        body {
            margin: 0;
            color: var(--ink);
            font-family: 'Times New Roman', serif;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
        }
    }
    * { box-sizing: border-box; }
    body {
        margin: 0;
        background: #fff;
        color: var(--ink);
        font-family: 'Times New Roman', serif;
    }
    .prescription-page {
        width: 100%;
        max-width: 190mm;
        min-height: 277mm;
        margin: 0 auto;
        padding: var(--page-padding-top) var(--page-side-padding) var(--page-padding-bottom);
    }
    .print-header {
        margin-bottom: 4.2mm;
    }
    .header-row {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        gap: 12mm;
    }
    .facility-block {
        display: flex;
        align-items: flex-start;
        gap: 4mm;
        max-width: 122mm;
    }
    .facility-logo {
        width: 31mm;
        height: 21mm;
        object-fit: contain;
        object-position: left top;
        margin-top: 1mm;
    }
    .facility-copy {
        flex: 1;
        padding-top: 0.5mm;
    }
    .facility-name {
        font-size: 12.6pt;
        font-weight: 700;
        line-height: 1.05;
        text-transform: uppercase;
    }
    .facility-line {
        font-size: 9.2pt;
        line-height: 1.16;
        font-weight: 700;
        margin-top: 0.4mm;
    }
    .title {
        margin: 4.8mm 0 0;
        text-align: center;
        font-size: 20pt;
        line-height: 1;
        letter-spacing: 0.4px;
        font-weight: 700;
        color: var(--title);
    }
    .barcode-wrapper {
        width: 42mm;
        text-align: center;
        padding-top: 10.5mm;
    }
    .barcode-svg {
        width: 100%;
        height: 16mm;
        display: block;
    }
    .barcode-text {
        margin-top: 1mm;
        font-size: 8.7pt;
        line-height: 1;
        letter-spacing: 0.2px;
    }
    .patient-section {
        margin-top: 2.5mm;
        font-size: 10.7pt;
        line-height: 1.23;
    }
    .patient-row {
        display: flex;
        gap: 6mm;
        margin-bottom: 1.9mm;
    }
    .patient-row.compact { margin-bottom: 1.45mm; }
    .patient-row.triple {
        display: grid;
        grid-template-columns: 1.25fr 0.95fr 0.9fr;
        column-gap: 8mm;
        align-items: baseline;
    }
    .patient-cell { min-width: 0; }
    .full-width { width: 100%; }
    .field-label { font-weight: 700; }
    .field-value { font-weight: 700; }
    .section-label {
        margin: 3mm 0 1.8mm;
        font-size: 11pt;
        line-height: 1.1;
        font-weight: 700;
    }
    .medicine-list {
        padding-left: 8mm;
    }
    .medicine-row {
        display: grid;
        grid-template-columns: 7mm 1fr 12mm 16mm;
        column-gap: 3mm;
        align-items: baseline;
        margin-bottom: 3.1mm;
    }
    .medicine-index {
        font-size: 10.9pt;
        line-height: 1.1;
        text-align: right;
        padding-right: 1mm;
    }
    .medicine-main {
        min-width: 0;
    }
    .medicine-name {
        font-size: 11.2pt;
        line-height: 1.12;
        font-weight: 700;
    }
    .medicine-quantity,
    .medicine-unit {
        font-size: 11pt;
        line-height: 1.1;
        font-weight: 700;
        text-align: right;
        white-space: nowrap;
    }
    .medicine-instructions {
        margin-top: 1.25mm;
        padding-left: 0.5mm;
        font-size: 10pt;
        line-height: 1.18;
        font-style: italic;
    }
    .follow-up {
        margin-top: 9mm;
        font-size: 11.2pt;
        line-height: 1.18;
        font-weight: 700;
    }
    .advice-block {
        margin-top: 4mm;
        font-size: 10pt;
        line-height: 1.18;
    }
    .advice-head {
        display: flex;
        align-items: baseline;
        gap: 2mm;
    }
    .advice-title {
        font-weight: 700;
        text-decoration: underline;
    }
    .advice-inline {
        font-style: italic;
    }
    .advice-lines {
        margin: 0.5mm 0 0 17mm;
    }
    .advice-line {
        display: block;
        font-style: italic;
        margin-top: 0.5mm;
    }
    .doctor-contact {
        margin-top: 4.1mm;
        font-size: 10.4pt;
        line-height: 1.18;
        font-weight: 700;
    }
    .print-footer {
        margin-top: 24mm;
        display: flex;
        justify-content: flex-end;
    }
    .signature-box {
        width: 73mm;
        text-align: center;
    }
    .signature-date {
        font-size: 10.3pt;
        line-height: 1.18;
        margin-bottom: 1mm;
    }
    .signature-title {
        font-size: 13pt;
        line-height: 1.08;
        font-weight: 700;
        text-transform: uppercase;
    }
    .signature-note {
        font-size: 11pt;
        line-height: 1.1;
        font-weight: 700;
    }
`;

const PRESCRIPTION_CLINIC_BRANDING = {
    name: 'TRUNG TÂM BÁC SĨ GIA ĐÌNH HÀ NỘI',
    address: 'Số 75 Đường Hồ Mễ Trì - P. Đại Mỗ - TP. Hà Nội',
    phone: '024.35.430.430',
    website: 'www.bacsigiadinhhanoivn',
    logoSrc: '/logo.png',
};

const escapeHtml = (value: string) =>
    value
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');

const formatDate = (value?: string) => {
    if (!value) return '';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleDateString('vi-VN');
};

const formatSignatureDate = (value?: string) => {
    if (!value) return 'Ngày ...... tháng ...... năm 20......';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return `Ngày ${String(date.getDate()).padStart(2, '0')} tháng ${String(date.getMonth() + 1).padStart(2, '0')} năm ${date.getFullYear()}`;
};

const formatQuantity = (item: PrescriptionItem) => {
    if (item.quantity == null) {
        return { quantity: '.....', unit: '' };
    }

    const quantity = String(item.quantity).padStart(2, '0');
    const dosage = item.dosage?.toLowerCase() || '';
    const medicineName = item.medicineName?.toLowerCase() || '';
    const searchableText = `${medicineName} ${dosage}`;

    let unit = '';
    if (searchableText.includes('chai') || searchableText.includes('ml')) unit = 'Chai';
    else if (searchableText.includes('gói') || searchableText.includes('goi')) unit = 'Gói';
    else if (searchableText.includes('lọ') || searchableText.includes('xit') || searchableText.includes('xịt')) unit = 'Lọ';
    else if (searchableText.includes('ống') || searchableText.includes('ong')) unit = 'Ống';
    else if (searchableText.includes('viên') || searchableText.includes('vien')) unit = 'Viên';

    return { quantity, unit };
};

const buildBarcodeSvg = (prescriptionCode: string) => {
    const normalizedCode = prescriptionCode || '0000000000000';
    const rects = Array.from(normalizedCode)
        .flatMap((char, index) => {
            const seed = char.charCodeAt(0) + index * 19;
            return [
                { x: index * 5.3 + 1.8, width: seed % 2 === 0 ? 1.2 : 0.8, height: seed % 3 === 0 ? 42 : 37 },
                { x: index * 5.3 + 3.7, width: seed % 5 === 0 ? 1.6 : 1.0, height: seed % 7 === 0 ? 33 : 42 },
            ];
        })
        .map(({ x, width, height }) => `<rect x="${x}" y="${46 - height}" width="${width}" height="${height}" fill="#111111" />`)
        .join('');

    return `
        <svg class="barcode-svg" viewBox="0 0 78 46" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Mã vạch đơn thuốc ${escapeHtml(normalizedCode)}">
            <rect x="0" y="0" width="78" height="46" fill="#ffffff" />
            ${rects}
        </svg>
    `;
};

const buildHeaderHtml = (prescriptionCode: string) => `
    <div class="print-header">
        <div class="header-row">
            <div class="facility-block">
                <img
                    class="facility-logo"
                    src="${PRESCRIPTION_CLINIC_BRANDING.logoSrc}"
                    alt="Logo ${PRESCRIPTION_CLINIC_BRANDING.name}"
                    onerror="this.onerror=null;this.src='${getFacilityBranding().logoSrc}';"
                />
                <div class="facility-copy">
                    <div class="facility-name">${PRESCRIPTION_CLINIC_BRANDING.name}</div>
                    <div class="facility-line">${PRESCRIPTION_CLINIC_BRANDING.address}</div>
                    <div class="facility-line">Điện thoại: ${PRESCRIPTION_CLINIC_BRANDING.phone}</div>
                    <div class="facility-line">Website: ${PRESCRIPTION_CLINIC_BRANDING.website}</div>
                </div>
            </div>
            <div class="barcode-wrapper">
                ${buildBarcodeSvg(prescriptionCode)}
                <div class="barcode-text">${prescriptionCode}</div>
            </div>
        </div>
        <div class="title">ĐƠN THUỐC</div>
    </div>
`;

const buildFooterHtml = (prescriptionDate?: string) => `
    <div class="print-footer">
        <div class="signature-box">
            <div class="signature-date">${formatSignatureDate(prescriptionDate)}</div>
            <div class="signature-title">BÁC SĨ KHÁM BỆNH</div>
            <div class="signature-note">(Ký, ghi rõ họ tên)</div>
        </div>
    </div>
`;

const buildMedicineInstruction = (item: PrescriptionItem) => {
    const parts = [item.dosage, item.frequency, item.instructions].filter(Boolean);
    return parts.length > 0 ? `${parts.join(', ')}.` : '';
};

const buildAddress = (resident: Resident) => {
    const parts = [
        resident.room ? `Phòng ${resident.room}` : '',
        resident.floor || '',
        resident.building || '',
    ].filter(Boolean);
    return parts.join(', ');
};

export const buildPrescriptionPrintHtml = (
    prescription: Prescription,
    resident: Resident,
    _brandingOverride?: unknown
) => {
    const medicineItemsHtml = prescription.items?.map((item, index) => {
        const quantity = formatQuantity(item);
        return `
            <div class="medicine-row">
                <div class="medicine-index">${index + 1}.</div>
                <div class="medicine-main">
                    <div class="medicine-name">${item.medicineName || '&nbsp;'}</div>
                    <div class="medicine-instructions">${buildMedicineInstruction(item) || '&nbsp;'}</div>
                </div>
                <div class="medicine-quantity">${quantity.quantity}</div>
                <div class="medicine-unit">${quantity.unit}</div>
            </div>
        `;
    }).join('') || '<div class="medicine-row"><div class="medicine-main">Không có thuốc điều trị.</div><div></div><div></div></div>';

    return `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8" />
            <title>In Đơn Thuốc - ${prescription.code}</title>
            <style>${PRINT_STYLES}</style>
        </head>
        <body>
            <div class="prescription-page">
                ${buildHeaderHtml(prescription.code)}

                <div class="patient-section">
                    <div class="patient-row compact">
                        <div class="patient-cell full-width">
                            - <span class="field-label">Họ tên:</span>
                            <span class="field-value">${resident.name.toUpperCase()}</span>
                        </div>
                    </div>
                    <div class="patient-row compact">
                        <div class="patient-cell full-width">
                            - <span class="field-label">Số định danh cá nhân/số căn cước công dân/số căn cước/số hộ chiếu của người bệnh (nếu có):</span>
                        </div>
                    </div>
                    <div class="patient-row triple compact">
                        <div class="patient-cell">
                            - <span class="field-label">Ngày sinh:</span> ${formatDate(resident.dob)}
                        </div>
                        <div class="patient-cell">
                            <span class="field-label">Cân nặng</span> ........
                        </div>
                        <div class="patient-cell">
                            <span class="field-label">Giới tính:</span> ${resident.gender}
                        </div>
                    </div>
                    <div class="patient-row compact">
                        <div class="patient-cell full-width">
                            - <span class="field-label">Mã số bảo hiểm y tế (nếu có):</span>
                        </div>
                    </div>
                    <div class="patient-row compact">
                        <div class="patient-cell full-width">
                            - <span class="field-label">Nơi thường trú/nơi tạm trú/nơi ở hiện tại:</span> ${buildAddress(resident)}
                        </div>
                    </div>
                    <div class="patient-row compact">
                        <div class="patient-cell full-width">
                            - <span class="field-label">Chẩn đoán:</span> ${prescription.diagnosis || '&nbsp;'}
                        </div>
                    </div>
                </div>

                <div class="section-label">Thuốc điều trị:</div>
                <div class="medicine-list">
                    ${medicineItemsHtml}
                </div>

                <div class="follow-up">Tái khám ngày: ............................................................</div>

                <div class="advice-block">
                    <div class="advice-head">
                        <span class="advice-title">Lưu ý:</span>
                        <span class="advice-inline">* Khám lại ngay khi có bất thường.</span>
                    </div>
                    <div class="advice-lines">
                        <span class="advice-line">* Tái khám miễn phí trong 3 ngày đầu tại Trung tâm kể từ ngày khám.</span>
                        <span class="advice-line">* Hóa đơn chỉ xuất trong ngày. Trân trọng!</span>
                    </div>
                </div>

                <div class="advice-block">
                    <div class="advice-head">
                        <span class="advice-title">Lời dặn:</span>
                        <span>${prescription.notes || '&nbsp;'}</span>
                    </div>
                </div>

                <div class="doctor-contact">Liên hệ với bác sĩ điều trị: ................................</div>

                ${buildFooterHtml(prescription.prescriptionDate)}
            </div>
        </body>
        </html>
    `;
};

export const printPrescription = (prescription: Prescription, resident: Resident) => {
    const win = window.open('', '_blank');
    if (!win) return;

    const html = buildPrescriptionPrintHtml(prescription, resident);
    win.document.write(html);
    win.document.close();
    win.focus();
    setTimeout(() => win.print(), 500);
};

export const printDailyMedicationSheet = (
    resident: Resident,
    activeItems: (PrescriptionItem & { prescriptionCode: string; startDate: string })[]
) => {
    const win = window.open('', '_blank');
    if (!win) return;

    const times = ['Sáng', 'Trưa', 'Chiều', 'Tối'];

    const renderTimeSection = (time: string, items: typeof activeItems) => {
        const timeItems = items.filter(i => i.timesOfDay?.includes(time));
        if (timeItems.length === 0) return '';

        const rows = timeItems.map((item, idx) => `
            <tr>
                <td style="text-align: center;">${idx + 1}</td>
                <td><strong>${item.medicineName}</strong></td>
                <td>${item.dosage}</td>
                <td>${item.instructions || ''}</td>
                <td style="text-align: center; width: 50px;">◻</td>
            </tr>
        `).join('');

        return `
            <div style="margin-top: 20px;">
                <h3 style="background-color: #eee; padding: 5px; border-bottom: 2px solid #ccc; font-size: 12pt;">${time.toUpperCase()}</h3>
                <table style="width: 100%; border-collapse: collapse; margin-top: 10px; margin-bottom: 10px;">
                    <thead>
                        <tr>
                            <th style="width: 40px; text-align: center; border: 1px solid #ccc; padding: 6px;">STT</th>
                            <th style="border: 1px solid #ccc; padding: 6px; text-align: left;">Tên thuốc</th>
                            <th style="border: 1px solid #ccc; padding: 6px; text-align: left;">Liều lượng</th>
                            <th style="border: 1px solid #ccc; padding: 6px; text-align: left;">Lưu ý</th>
                            <th style="border: 1px solid #ccc; padding: 6px; text-align: center;">Đã uống</th>
                        </tr>
                    </thead>
                    <tbody>${rows}</tbody>
                </table>
            </div>
        `;
    };

    const sectionsHtml = times.map(t => renderTimeSection(t, activeItems)).join('');
    const branding = getFacilityBranding(useRoomConfigStore.getState().facility);

    const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8" />
            <title>Phiếu Chia Thuốc - ${resident.name}</title>
            <style>
                @media print {
                    @page { margin: 1cm; size: A4; }
                    body { font-family: 'Times New Roman', serif; line-height: 1.4; color: #000; }
                }
                body { font-family: 'Times New Roman', serif; line-height: 1.4; color: #000; }
                .header { display: flex; justify-content: space-between; margin-bottom: 20px; border-bottom: 2px solid #000; padding-bottom: 10px; }
                .brand-block { display: flex; align-items: center; gap: 12px; }
                .brand-logo { width: 64px; height: 64px; object-fit: contain; }
                .brand-copy { display: flex; flex-direction: column; gap: 4px; }
                .logo-text { font-size: 10pt; font-weight: bold; }
                .sub-text { font-size: 9pt; }
                .info-row { display: flex; margin-bottom: 5px; font-size: 11pt; }
                .info-label { width: 120px; font-weight: bold; }
                .info-value { flex: 1; }
                .footer { margin-top: 30px; display: flex; justify-content: flex-end; gap: 40px; }
                .signature-box { text-align: center; width: 200px; }
            </style>
        </head>
        <body>
            <div class="header">
                <div class="brand-block">
                    <img class="brand-logo" src="${branding.logoSrc}" alt="Logo ${branding.name}" onerror="this.onerror=null;this.src='${getFacilityBranding().logoSrc}';" />
                    <div class="brand-copy">
                        <div class="logo-text">${branding.name.toUpperCase()}</div>
                        <div class="sub-text">Địa chỉ: ${branding.address}</div>
                        <div class="sub-text">Điện thoại: ${branding.phone}</div>
                        <div style="font-size: 14pt; font-weight: bold; margin-top: 6px;">PHIẾU TỔNG HỢP THUỐC ĐANG DÙNG</div>
                    </div>
                </div>
                <div style="text-align: right;">
                    <div class="sub-text">Ngày in: ${new Date().toLocaleDateString('vi-VN')}</div>
                </div>
            </div>

            <div style="margin-bottom: 20px;">
                <div class="info-row">
                    <span class="info-label">Họ và tên:</span>
                    <span class="info-value"><strong>${resident.name.toUpperCase()}</strong></span>
                </div>
                <div class="info-row">
                    <span class="info-label">Phòng:</span>
                    <span class="info-value">${resident.room} (G: ${resident.bed || '...'})</span>
                    <span class="info-label">Mã y tế:</span>
                    <span class="info-value">${resident.id}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Dị ứng:</span>
                    <span class="info-value" style="color: red; font-weight: bold;">
                        ${resident.allergies?.map(a => a.allergen).join(', ') || 'Không ghi nhận'}
                    </span>
                </div>
            </div>

            ${sectionsHtml || '<div style="text-align:center; padding: 20px;">Hiện không có thuốc nào đang dùng.</div>'}

            <div class="footer">
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

    win.document.write(html);
    win.document.close();
    win.focus();
    setTimeout(() => win.print(), 500);
};
