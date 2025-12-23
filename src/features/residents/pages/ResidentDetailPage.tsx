import React, { useState, useEffect } from 'react';
import { ChevronRight } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

import { Assessment } from '@/src/types/index';
import { AssessmentWizard } from '@/src/features/assessments/components/AssessmentWizard';
import { ResidentBasicInfo } from '../components/ResidentBasicInfo';
import { ResidentDetail } from '../components/ResidentDetail';
import { EditResidentModal } from '../components/EditResidentModal';
import { useAuthStore } from '@/src/stores/authStore';
import { useResidentsStore } from '@/src/stores/residentsStore';
import { useFinanceStore } from '@/src/stores/financeStore';
import { useInventoryStore } from '@/src/stores/inventoryStore';

export const ResidentDetailPage = () => {
   const { id } = useParams();
   const navigate = useNavigate();
   const { user } = useAuthStore();
   const { residents, updateResident } = useResidentsStore();
   const { inventory } = useInventoryStore();
   const { servicePrices, usageRecords, recordUsage } = useFinanceStore();

   const [showAssessmentWizard, setShowAssessmentWizard] = useState(false);
   const [showEditModal, setShowEditModal] = useState(false);

   const resident = residents.find(r => r.id === id);

   useEffect(() => {
      if (!resident && residents.length > 0) {
         // Not found but residents loaded implies invalid ID
         toast.error('Không tìm thấy thông tin NCT');
         navigate('/residents');
      }
   }, [resident, residents, navigate]);

   if (!resident || !user) return null;

   const handleSaveAssessment = async (score: number) => {
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
      try {
         await updateResident({ ...resident, ...data });
         toast.success('Cập nhật thông tin thành công');
      } catch (error) {
         toast.error('Lỗi khi cập nhật thông tin');
      }
   };

   // Check this: handleMedicalUpdate
   const handleMedicalUpdate = async (updatedResident: any) => {
      try {
         await updateResident(updatedResident);
         toast.success('Hồ sơ sức khỏe đã được cập nhật');
      } catch (error) {
         toast.error('Lỗi khi cập nhật HSBA');
      }
   };

   return (
      <div className="space-y-6">
         {showAssessmentWizard && (
            <AssessmentWizard
               resident={resident}
               onSave={handleSaveAssessment}
               onCancel={() => setShowAssessmentWizard(false)}
            />
         )}

         {showEditModal && (
            <EditResidentModal
               resident={resident}
               onClose={() => setShowEditModal(false)}
               onSave={handleUpdateInfo}
            />
         )}

         <button onClick={() => navigate('/residents')} className="flex items-center gap-2 text-slate-500 hover:text-teal-600 transition-colors no-print">
            <ChevronRight className="w-4 h-4 rotate-180" /> Quay lại danh sách
         </button>

         <ResidentBasicInfo
            resident={resident}
            onEdit={() => setShowEditModal(true)}
            onPrint={() => window.print()}
         />

         <ResidentDetail
            user={user}
            resident={resident}
            inventory={inventory}
            onUpdateResident={handleMedicalUpdate}
            onOpenAssessment={() => setShowAssessmentWizard(true)}
            onEdit={() => setShowEditModal(true)}
            servicePrices={servicePrices}
            usageRecords={usageRecords}
            onRecordUsage={recordUsage} // Directly function from store
         />
      </div>
   );
};