import React, { useEffect, useMemo, useState } from 'react';
import { FileText, History, Plus } from 'lucide-react';
import type { Prescription, PrescriptionSnapshot, Resident, User } from '../../../types';
import { usePrescriptionsStore } from '../../../stores/prescriptionStore';
import { printPrescription } from '../utils/printTemplates';
import { printActiveMedicationSheet } from '../utils/activeMedicationPrint';
import { PrescriptionForm } from './PrescriptionForm';
import { MedicineManager } from './MedicineManager';
import { PrescriptionCard } from './PrescriptionCard';
import { ActiveMedicationSummary } from './ActiveMedicationSummary';
import { PrescriptionHistoryDrawer } from './PrescriptionHistoryDrawer';

const isPrivilegedUser = (role: User['role']) => ['DOCTOR', 'ADMIN', 'SUPERVISOR'].includes(role);

export const PrescriptionList = ({
  user,
  resident,
  onUpdate,
}: {
  user: User;
  resident: Resident;
  onUpdate: (resident: Resident) => void;
}) => {
  const [showModal, setShowModal] = useState(false);
  const [showMedicineManager, setShowMedicineManager] = useState(false);
  const [editingPrescription, setEditingPrescription] = useState<Prescription | null>(null);
  const [duplicateSource, setDuplicateSource] = useState<Prescription | null>(null);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [selectedSnapshots, setSelectedSnapshots] = useState<PrescriptionSnapshot[]>([]);

  const store = usePrescriptionsStore();
  const {
    prescriptions,
    fetchPrescriptions,
    isLoading,
    pausePrescription,
    completePrescription,
    fetchPrescriptionSnapshots,
    getActivePrescriptionsForResident,
    getActiveMedicationRowsForResident,
  } = store;

  useEffect(() => {
    fetchPrescriptions(resident.id);
  }, [resident.id, fetchPrescriptions]);

  const residentPrescriptions = useMemo(
    () => prescriptions.filter((prescription) => prescription.residentId === resident.id),
    [prescriptions, resident.id],
  );

  const activePrescriptions = useMemo(() => {
    if (typeof getActivePrescriptionsForResident === 'function') {
      return getActivePrescriptionsForResident(resident.id);
    }

    return residentPrescriptions.filter((prescription) => prescription.status === 'Active');
  }, [getActivePrescriptionsForResident, resident.id, residentPrescriptions]);

  const activeMedicationRows = useMemo(() => {
    if (typeof getActiveMedicationRowsForResident === 'function') {
      return getActiveMedicationRowsForResident(resident.id);
    }

    return [];
  }, [getActiveMedicationRowsForResident, resident.id]);

  const historyPrescriptions = useMemo(
    () =>
      residentPrescriptions
        .filter((prescription) => prescription.status !== 'Active')
        .sort((left, right) => new Date(right.prescriptionDate).getTime() - new Date(left.prescriptionDate).getTime()),
    [residentPrescriptions],
  );

  const closeModal = () => {
    setShowModal(false);
    setEditingPrescription(null);
    setDuplicateSource(null);
  };

  const handleCreateSuccess = async () => {
    closeModal();
    await fetchPrescriptions(resident.id);
    onUpdate(resident);
  };

  const handleOpenCreate = () => {
    setEditingPrescription(null);
    setDuplicateSource(null);
    setShowModal(true);
  };

  const handleOpenEdit = (prescription: Prescription) => {
    setDuplicateSource(null);
    setEditingPrescription(prescription);
    setShowModal(true);
  };

  const handleOpenDuplicate = (prescription: Prescription) => {
    setEditingPrescription(null);
    setDuplicateSource(prescription);
    setShowModal(true);
  };

  const handlePause = async (prescriptionId: string) => {
    if (!pausePrescription) return;
    await pausePrescription(prescriptionId);
    await fetchPrescriptions(resident.id);
  };

  const handleComplete = async (prescriptionId: string) => {
    if (!completePrescription) return;
    await completePrescription(prescriptionId);
    await fetchPrescriptions(resident.id);
  };

  const handleOpenHistory = async (prescription: Prescription) => {
    if (typeof fetchPrescriptionSnapshots !== 'function') return;
    const snapshots = await fetchPrescriptionSnapshots(prescription.id);
    setSelectedSnapshots(snapshots);
    setHistoryOpen(true);
  };

  if (isLoading && prescriptions.length === 0) {
    return <div className="p-8 text-center text-slate-400">Dang tai du lieu...</div>;
  }

  return (
    <div className="space-y-8">
      {showModal && (
        <PrescriptionForm
          user={user}
          resident={resident}
          editingPrescription={editingPrescription}
          duplicateSource={duplicateSource}
          onClose={closeModal}
          onSave={handleCreateSuccess}
        />
      )}

      {showMedicineManager && <MedicineManager onClose={() => setShowMedicineManager(false)} />}

      <ActiveMedicationSummary
        rows={activeMedicationRows}
        onOpenDrugMaster={() => setShowMedicineManager(true)}
        onPrint={() => printActiveMedicationSheet(resident, activeMedicationRows)}
        onCreatePrescription={handleOpenCreate}
        canCreate={isPrivilegedUser(user.role)}
      />

      <div className="space-y-4">
        <h3 className="flex items-center gap-2 px-1 font-bold text-slate-700">
          <FileText className="h-5 w-5" /> Don thuoc dang hieu luc
        </h3>

        {activePrescriptions.length > 0 ? (
          <div className="grid gap-4">
            {activePrescriptions.map((prescription) => (
              <PrescriptionCard
                key={prescription.id}
                prescription={prescription}
                canManage={isPrivilegedUser(user.role)}
                onAdjust={handleOpenEdit}
                onDuplicate={handleOpenDuplicate}
                onPause={handlePause}
                onComplete={handleComplete}
                onPrint={(selectedPrescription) => printPrescription(selectedPrescription, resident)}
                onViewHistory={handleOpenHistory}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 py-6 text-center italic text-slate-400">
            Chua co don thuoc dang hieu luc
          </div>
        )}
      </div>

      <div className="space-y-4">
        <h3 className="flex items-center gap-2 px-1 font-bold text-slate-700">
          <History className="h-5 w-5" /> Lich su don thuoc
        </h3>

        {historyPrescriptions.length > 0 ? (
          <div className="grid gap-4">
            {historyPrescriptions.map((prescription) => (
              <div key={prescription.id} className="rounded-xl border border-slate-200 bg-white p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-800">{prescription.code}</span>
                      <span className="rounded-full bg-slate-200 px-2 py-0.5 text-xs font-medium text-slate-600">
                        {prescription.status === 'Completed' ? 'Da hoan thanh' : 'Da dung'}
                      </span>
                    </div>
                    <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-slate-500">
                      <span>{prescription.prescriptionDate}</span>
                      <span>BS. {prescription.doctorName || 'Unknown'}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      aria-label="Lich su dieu chinh"
                      onClick={() => handleOpenHistory(prescription)}
                      className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 shadow-sm transition-all hover:bg-slate-50"
                    >
                      Lich su dieu chinh
                    </button>
                    <button
                      type="button"
                      aria-label="In don thuoc"
                      onClick={() => printPrescription(prescription, resident)}
                      className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 shadow-sm transition-all hover:bg-slate-50"
                    >
                      In don thuoc
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 py-6 text-center italic text-slate-400">
            Chua co lich su don thuoc
          </div>
        )}
      </div>

      {isPrivilegedUser(user.role) && activePrescriptions.length === 0 && (
        <div className="flex justify-end">
          <button
            type="button"
            onClick={handleOpenCreate}
            className="inline-flex items-center gap-2 rounded-lg bg-teal-600 px-3 py-2 text-sm font-medium text-white shadow-sm transition-all hover:bg-teal-700"
          >
            <Plus className="h-4 w-4" /> Ke don
          </button>
        </div>
      )}

      <PrescriptionHistoryDrawer
        open={historyOpen}
        snapshots={selectedSnapshots}
        onClose={() => {
          setHistoryOpen(false);
          setSelectedSnapshots([]);
        }}
      />
    </div>
  );
};
