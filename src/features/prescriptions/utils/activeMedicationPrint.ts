import { ActiveMedicationRow, Resident } from '../../../types';

interface BuildActiveMedicationPrintOptions {
  residentName: string;
  residentCode?: string;
  rows: ActiveMedicationRow[];
}

const TIME_BUCKETS = [
  { label: 'Buoi sang', source: 'morning' },
  { label: 'Buoi trua', source: 'noon' },
  { label: 'Buoi chieu', source: 'afternoon' },
  { label: 'Buoi toi', source: 'evening' },
] as const;

export const buildActiveMedicationPrintHtml = ({
  residentName,
  residentCode,
  rows,
}: BuildActiveMedicationPrintOptions) => {
  const groupsHtml = TIME_BUCKETS.map(({ label, source }) => {
    const timeRows = rows.filter((row) => row.timeOfDay === source);
    if (timeRows.length === 0) return '';

    const rowHtml = timeRows
      .map(
        (row, index) => `
          <tr>
            <td>${index + 1}</td>
            <td><strong>${row.medicineName}</strong><div>${row.instructions ?? ''}</div></td>
            <td>${row.dosage}</td>
            <td>${row.sourcePrescriptionCode}</td>
            <td>${row.startDate ?? ''}</td>
          </tr>
        `,
      )
      .join('');

    return `
      <section class="time-group">
        <h2>${label}</h2>
        <table>
          <thead>
            <tr>
              <th>STT</th>
              <th>Thuoc</th>
              <th>Lieu dung</th>
              <th>Don goc</th>
              <th>Bat dau</th>
            </tr>
          </thead>
          <tbody>${rowHtml}</tbody>
        </table>
      </section>
    `;
  }).join('');

  return `
    <!doctype html>
    <html lang="vi">
      <head>
        <meta charset="utf-8" />
        <title>In tong hop thuoc dang dung</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 24px; color: #0f172a; }
          .heading { margin-bottom: 24px; }
          h1 { margin: 0 0 8px; font-size: 24px; }
          h2 { margin: 24px 0 12px; font-size: 18px; }
          table { width: 100%; border-collapse: collapse; }
          th, td { border: 1px solid #cbd5e1; padding: 8px; text-align: left; vertical-align: top; }
          th { background: #f8fafc; }
        </style>
      </head>
      <body>
        <div class="heading">
          <h1>Tong hop thuoc dang dung</h1>
          <div>Ho ten: ${residentName}</div>
          <div>Ma NCT: ${residentCode ?? ''}</div>
        </div>
        ${groupsHtml}
      </body>
    </html>
  `;
};

export const printActiveMedicationSheet = (resident: Resident, rows: ActiveMedicationRow[]) => {
  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  printWindow.document.write(
    buildActiveMedicationPrintHtml({
      residentName: resident.name,
      residentCode: resident.id,
      rows,
    }),
  );
  printWindow.document.close();
  printWindow.focus();
  printWindow.print();
};
