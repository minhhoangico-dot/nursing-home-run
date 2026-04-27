import React, { useState, useEffect } from 'react';
import { ChevronRight } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

import { Assessment } from '@/src/types/index';
import { AssessmentWizard } from '@/src/features/assessments/components/AssessmentWizard';
import { ResidentBasicInfo } from '../components/ResidentBasicInfo';
import { ResidentDetail } from '../components/ResidentDetail';
import { EditResidentModal } from '../components/EditResidentModal';
import { ModuleReadOnlyBanner } from '@/src/components/ui/ModuleReadOnlyBanner';
import { useAuthStore } from '@/src/stores/authStore';
import { useResidentsStore } from '@/src/stores/residentsStore';
import { useFinanceStore } from '@/src/stores/financeStore';
import { useModuleAccess } from '@/src/hooks/useModuleAccess';

export const ResidentDetailPage = () => {
   const { id } = useParams();
   const navigate = useNavigate();
   const { user } = useAuthStore();
   const { residents, residentDetails, fetchResidentDetail, updateResident } = useResidentsStore();
   const { servicePrices, usageRecords, recordUsage } = useFinanceStore();
   const residentsAccess = useModuleAccess('residents');
   const isReadOnly = residentsAccess.mode === 'readOnly';

   const [showAssessmentWizard, setShowAssessmentWizard] = useState(false);
   const [showEditModal, setShowEditModal] = useState(false);

   const resident = id ? residentDetails[id] : undefined;
   const residentListItem = residents.find(r => r.id === id);

   useEffect(() => {
      if (!id || resident) {
         return;
      }

      void fetchResidentDetail(id).catch(() => undefined);
   }, [fetchResidentDetail, id, resident]);

   useEffect(() => {
      if (!id || resident || residentListItem || residents.length === 0) {
         return;
      }

      toast.error('Không tìm thấy thông tin NCT');
      navigate('/residents');
   }, [id, navigate, resident, residentListItem, residents.length]);

   if (!user) return null;

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
            onPrint={() => window.print()}
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
