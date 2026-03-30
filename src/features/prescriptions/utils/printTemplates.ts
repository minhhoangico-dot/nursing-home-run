import { type Prescription, type PrescriptionItem, type Resident } from '../../../types/index';
import { buildActiveMedicationPrintHtml } from './buildActiveMedicationPrintHtml';
import { buildSinglePrescriptionPrintHtml } from './buildSinglePrescriptionPrintHtml';

function openPrintWindow(html: string): void {
  const win = window.open('', '_blank');
  if (!win) return;

  win.document.write(html);
  win.document.close();
  win.focus();
  setTimeout(() => win.print(), 500);
}

export const printPrescription = (prescription: Prescription, resident: Resident) => {
  openPrintWindow(buildSinglePrescriptionPrintHtml(prescription, resident));
};

export const printDailyMedicationSheet = (
  resident: Resident,
  activeItems: (PrescriptionItem & { prescriptionCode: string; startDate: string })[],
) => {
  openPrintWindow(buildActiveMedicationPrintHtml(resident, activeItems));
};
