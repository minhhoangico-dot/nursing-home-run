import React, { useState, useEffect } from 'react';
import { ChevronRight } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

import { Assessment } from '@/src/types/index';
import { AssessmentWizard } from '@/src/features/assessments/components/AssessmentWizard';
import { ResidentBasicInfo } from '../components/ResidentBasicInfo';
import { ResidentDetail } from '../components/ResidentDetail';
import { EditResidentModal } from '../components/EditResidentModal';
import { PrintMenuModal } from '../components/PrintMenuModal';
import { TransferRoomModal } from '@/src/features/rooms/components/TransferRoomModal';
import { InvoicePreview } from '@/src/features/finance/components/InvoicePreview';
import {
   calculateFixedCosts,
   getMonthlyUsage,
} from '@/src/features/finance/utils/calculateMonthlyBilling';
import { ModuleReadOnlyBanner } from '@/src/components/ui/ModuleReadOnlyBanner';
import { useAuthStore } from '@/src/stores/authStore';
import { useResidentsStore } from '@/src/stores/residentsStore';
import { useFinanceStore } from '@/src/stores/financeStore';
import { useModuleAccess } from '@/src/hooks/useModuleAccess';
import { normalizeResidentId } from '@/src/services/residentService';

export const ResidentDetailPage = () => {
   const { id } = useParams();
   const navigate = useNavigate();
   const { user } = useAuthStore();
   const { residents, residentDetails, fetchResidentDetail, updateResident } = useResidentsStore();
   const { servicePrices, usageRecords, recordUsage } = useFinanceStore();
   const residentsAccess = useModuleAccess('residents');
   const financeAccess = useModuleAccess('finance');
   const isReadOnly = residentsAccess.mode === 'readOnly';

   const [showAssessmentWizard, setShowAssessmentWizard] = useState(false);
   const [showEditModal, setShowEditModal] = useState(false);
   const [showTransferModal, setShowTransferModal] = useState(false);
   const [showPrintMenu, setShowPrintMenu] = useState(false);
   const [invoiceMonth, setInvoiceMonth] = useState<string | null>(null);

   const residentId = normalizeResidentId(id);
   const isInvalidResidentId = !residentId;
   const resident = residentId ? residentDetails[residentId] : undefined;
   const residentListItem = residents.find(r => r.id === residentId);

   useEffect(() => {
      if (!user || !isInvalidResidentId) {
         return;
      }

      toast.error('Không tìm thấy thông tin NCT');
      navigate('/residents', { replace: true });
   }, [isInvalidResidentId, navigate, user]);

   useEffect(() => {
      if (!residentId || resident) {
         return;
      }

      void fetchResidentDetail(residentId).catch(() => undefined);
   }, [fetchResidentDetail, residentId, resident]);

   useEffect(() => {
      if (!residentId || resident || residentListItem || residents.length === 0) {
         return;
      }

      toast.error('Không tìm thấy thông tin NCT');
      navigate('/residents');
   }, [residentId, navigate, resident, residentListItem, residents.length]);

   if (!user) return null;

   if (isInvalidResidentId) return null;

   if (!resident) {
      return (
         <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
            Đang tải hồ sơ NCT...
         </div>
      );
   }

   const handleSaveAssessment = async (score: number) => {
      if (isReadOnly) return;

      let level: 1 | 2 | 3 | 4 = 1;
      if (score > 10) level = 2;
      if (score > 20) level = 3;
      if (score > 30) level = 4;

      const newAssessment: Assessment = {
         date: new Date().toLocaleDateString('vi-VN'),
         score,
         level,
         assessor: user.name
      };

      try {
         await updateResident({
            ...resident,
            careLevel: level,
            assessments: [newAssessment, ...resident.assessments]
         });
         setShowAssessmentWizard(false);
         toast.success(`Đánh giá thành công. Cập nhật cấp độ ${level}`);
      } catch (error) {
         toast.error('Lỗi khi cập nhật đánh giá');
      }
   };

   const handleUpdateInfo = async (data: any) => {
      if (isReadOnly) return;

      try {
         await updateResident({ ...resident, ...data });
         toast.success('Cập nhật thông tin thành công');
      } catch (error) {
         toast.error('Lỗi khi cập nhật thông tin');
      }
   };

   const handleTransfer = async (data: {
      room: string;
      bed: string;
      floor: string;
      building: string;
      roomType: string;
   }) => {
      if (isReadOnly) return;

      try {
         await updateResident({ ...resident, ...data } as typeof resident);
         setShowTransferModal(false);
         toast.success('Chuyển phòng thành công');
      } catch (error) {
         const message = error instanceof Error && error.message ? error.message : `Không thể chuyển phòng cho ${resident.name}.`;
         toast.error(message);
      }
   };

   const handleMedicalUpdate = async (updatedResident: any) => {
      if (isReadOnly) return;

      try {
         await updateResident(updatedResident);
         toast.success('Hồ sơ sức khỏe đã được cập nhật');
      } catch (error) {
         toast.error('Lỗi khi cập nhật HSBA');
      }
   };

   return (
      <div className="space-y-6">
         {isReadOnly && <ModuleReadOnlyBanner />}

         {showAssessmentWizard && !isReadOnly && (
            <AssessmentWizard
               resident={resident}
               onSave={handleSaveAssessment}
               onCancel={() => setShowAssessmentWizard(false)}
            />
         )}

         {showEditModal && !isReadOnly && (
            <EditResidentModal
               resident={resident}
               onClose={() => setShowEditModal(false)}
               onSave={handleUpdateInfo}
               existingCodes={residents.map(r => r.clinicCode || '').filter(Boolean)}
               readOnly={isReadOnly}
               onRequestTransfer={() => {
                  setShowEditModal(false);
                  setShowTransferModal(true);
               }}
            />
         )}

         {showTransferModal && !isReadOnly && (
            <TransferRoomModal
               resident={resident}
               allResidents={residents}
               onClose={() => setShowTransferModal(false)}
               onSave={handleTransfer}
            />
         )}

         {showPrintMenu && (
            <PrintMenuModal
               resident={resident}
               user={user}
               canViewFinance={financeAccess.canViewFinance}
               onClose={() => setShowPrintMenu(false)}
               onShowInvoice={(month) => setInvoiceMonth(month)}
            />
         )}

         {invoiceMonth && (
            <InvoicePreview
               resident={resident}
               month={invoiceMonth}
               fixedCosts={calculateFixedCosts(resident).details}
               incurredCosts={getMonthlyUsage(usageRecords, resident.id, invoiceMonth)}
               onClose={() => setInvoiceMonth(null)}
            />
         )}

         <button onClick={() => navigate('/residents')} className="flex items-center gap-2 text-slate-500 hover:text-teal-600 transition-colors no-print">
            <ChevronRight className="w-4 h-4 rotate-180" /> Quay lại danh sách
         </button>

         <ResidentBasicInfo
            resident={resident}
            onEdit={() => {
               if (!isReadOnly) {
                  setShowEditModal(true);
               }
            }}
            onPrint={() => setShowPrintMenu(true)}
            readOnly={isReadOnly}
         />

         <ResidentDetail
            user={user}
            resident={resident}
            onUpdateResident={handleMedicalUpdate}
            onOpenAssessment={() => {
               if (!isReadOnly) {
                  setShowAssessmentWizard(true);
               }
            }}
            onEdit={() => {
               if (!isReadOnly) {
                  setShowEditModal(true);
               }
            }}
            servicePrices={servicePrices}
            usageRecords={usageRecords}
            onRecordUsage={recordUsage}
            readOnly={isReadOnly}
         />
      </div>
   );
};
