
import { Prescription, PrescriptionItem, Resident } from '../../../types/index';
import { useRoomConfigStore } from '../../../stores/roomConfigStore';
import { buildPrescriptionPrintHtml } from './buildPrescriptionPrintHtml';

const PRINT_STYLES = `
    @media print {
        @page { margin: 1cm; size: A4; }
        body { font-family: 'Times New Roman', serif; line-height: 1.4; color: #000; }
        .no-print { display: none !important; }
        .print-only { display: block !important; }
        table { width: 100%; border-collapse: collapse; margin-top: 10px; margin-bottom: 10px; }
        th, td { border: 1px solid #ccc; padding: 6px; text-align: left; font-size: 11pt; }
        th { background-color: #f0f0f0; font-weight: bold; }
        h1 { font-size: 16pt; font-weight: bold; text-align: center; margin-bottom: 5px; text-transform: uppercase; }
        h2 { font-size: 14pt; font-weight: bold; text-align: center; margin-bottom: 15px; }
        .header { display: flex; justify-content: space-between; margin-bottom: 20px; border-bottom: 2px solid #000; padding-bottom: 10px; }
        .logo-text { font-size: 10pt; font-weight: bold; }
        .sub-text { font-size: 9pt; }
        .info-row { display: flex; margin-bottom: 5px; font-size: 11pt; }
        .info-label { width: 120px; font-weight: bold; }
        .info-value { flex: 1; }
        .footer { margin-top: 30px; display: flex; justify-content: flex-end; }
        .signature-box { text-align: center; width: 200px; }
        .date-line { font-style: italic; margin-bottom: 10px; }
    }
`;

export const printPrescription = (prescription: Prescription, resident: Resident) => {
    const win = window.open('', '_blank');
    if (!win) return;
    const facility = useRoomConfigStore.getState().facility;
    const html = buildPrescriptionPrintHtml({
        facility,
        resident: {
            name: resident.name,
            dob: resident.dob,
            gender: resident.gender,
            room: resident.room,
            bed: resident.bed,
        },
        prescription: {
            code: prescription.code,
            diagnosis: prescription.diagnosis,
            prescriptionDate: prescription.prescriptionDate,
            doctorName: prescription.doctorName,
            notes: prescription.notes,
        },
        medicineRows: (prescription.items || []).map((item) => ({
            name: item.medicineName,
            instructions: item.instructions || [item.dosage, item.frequency].filter(Boolean).join(' - '),
            quantity: item.quantity,
            unit: null,
        })),
    });

    win.document.write(html);
    win.document.close();
    win.focus();
    setTimeout(() => win.print(), 500);
};

export const printDailyMedicationSheet = (resident: Resident, activeItems: (PrescriptionItem & { prescriptionCode: string, startDate: string })[]) => {
    const win = window.open('', '_blank');
    if (!win) return;

    // Group items by Time of Day: Sang, Trua, Chieu, Toi
    const times = ['Sáng', 'Trưa', 'Chiều', 'Tối'];

    // Create a row for each medicine, but visual groupings by time is requested by user? 
    // "Medication table grouped by time of day (SÁNG, TRƯA, TỐI) with columns for Medication, Dosage, Notes, and a checkbox"
    // Actually, usually a daily sheet has one row per medicine and columns for times. 
    // But the user request specifically said: "Medication table grouped by time of day... with columns for Medication..."
    // This implies distinct sections: SÁNG -> list of meds. TRƯA -> list of meds.

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
                <table>
                    <thead>
                        <tr>
                            <th style="width: 40px; text-align: center;">STT</th>
                            <th>Tên thuốc</th>
                            <th>Liều lượng</th>
                            <th>Lưu ý</th>
                            <th>Đã uống</th>
                        </tr>
                    </thead>
                    <tbody>${rows}</tbody>
                </table>
            </div>
        `;
    };

    const sectionsHtml = times.map(t => renderTimeSection(t, activeItems)).join('');

    const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>Phiếu Chia Thuốc - ${resident.name}</title>
            <style>${PRINT_STYLES}</style>
        </head>
        <body>
            <div class="header">
                <div>
                   <div class="logo-text">VIỆN DƯỠNG LÃO FDC</div>
                   <div style="font-size: 14pt; font-weight: bold; margin-top: 10px;">PHIẾU TỔNG HỢP THUỐC ĐANG DÙNG</div>
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
                <div class="signature-box" style="margin-right: 50px;">
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
