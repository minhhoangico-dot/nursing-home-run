import React, { useEffect, useState } from 'react';
import { Plus, FileText, User as UserIcon, Calendar, CreditCard, Home, Bed, Activity, Clock } from 'lucide-react';
import { Tabs } from '@/src/components/ui';
import { Resident, User, ServicePrice, ServiceUsage } from '@/src/types/index';
import { MedicalHistorySection } from '@/src/features/medical/components/MedicalHistorySection';
import { VitalSignsSection } from '@/src/features/medical/components/VitalSignsSection';
import { PrescriptionList } from '@/src/features/prescriptions/components/PrescriptionList';
import { MedicalVisitsSection } from '@/src/features/medical/components/MedicalVisitsSection';
import { MonitoringPlansSection } from '@/src/features/medical/components/MonitoringPlansSection';
import { GuardianInfo } from './GuardianInfo';
import { ResidentNutritionSection } from './ResidentNutritionSection';
import { ResidentFinanceTab } from './ResidentFinanceTab';
import { ResidentDocumentsGrid } from './ResidentDocumentsSection';
import { useToast } from '@/src/app/providers';
import { ReadOnlyBanner } from '@/src/components/ui/ReadOnlyBanner';
import { useModuleAccess } from '@/src/hooks/useModuleAccess';

interface ResidentDetailProps {
   user: User;
   resident: Resident;
   readOnly?: boolean;
   onUpdateResident: (r: Resident) => void;
   onOpenAssessment: () => void;
   onEdit: () => void;
   servicePrices: ServicePrice[];
   usageRecords: ServiceUsage[];
   onRecordUsage: (u: ServiceUsage) => void;
}

const missingValue = 'Chưa cập nhật';

const displayValue = (value?: string | null) => {
   const trimmed = value?.trim();
   return trimmed || missingValue;
};

const calculateAge = (dob: string, referenceDate = new Date()) => {
   const birthDate = new Date(dob);
   if (Number.isNaN(birthDate.getTime())) {
      return null;
   }

   let age = referenceDate.getFullYear() - birthDate.getFullYear();
   const hasHadBirthdayThisYear =
      referenceDate.getMonth() > birthDate.getMonth() ||
      (referenceDate.getMonth() === birthDate.getMonth() && referenceDate.getDate() >= birthDate.getDate());

   if (!hasHadBirthdayThisYear) {
      age -= 1;
   }

   return age >= 0 ? age : null;
};

export const ResidentDetail = ({
   user,
   resident,
   onUpdateResident,
   onOpenAssessment,
   onEdit,
   servicePrices,
   usageRecords,
   onRecordUsage,
   readOnly = false,
}: ResidentDetailProps) => {
   const [activeTab, setActiveTab] = useState('info');
   const { addToast } = useToast();
   const financeAccess = useModuleAccess('finance');
   const canViewFinance = financeAccess.canViewFinance;
   const isFinanceReadOnly = canViewFinance && !financeAccess.canEditFinance;
   const residentAge = calculateAge(resident.dob);
   const healthInsuranceStatus = resident.bhytCardPath ? 'Đã có ảnh thẻ BHYT' : missingValue;

   useEffect(() => {
      if (activeTab === 'finance' && !canViewFinance) {
         setActiveTab('info');
      }
   }, [activeTab, canViewFinance]);

   const handleAddService = (service: ServicePrice) => {
      if (readOnly) return;

      const usage: ServiceUsage = {
         id: `USG-${Date.now()}`,
         residentId: resident.id,
         serviceId: service.id,
         serviceName: service.name,
         date: new Date().toISOString(),
         quantity: 1,
         unitPrice: service.price,
         totalAmount: service.price,
         status: 'Unbilled'
      };

      onRecordUsage(usage);
      addToast('success', 'Đã ghi nhận dịch vụ', `Đã thêm ${service.name}`);
   };

   const tabs = [
      { id: 'info', label: 'Thông tin cá nhân' },
      { id: 'medical_record', label: 'Bệnh án' },
      { id: 'medication', label: 'Thuốc' },
      { id: 'vital_signs', label: 'Chỉ số sinh hiệu' },
      { id: 'monitoring', label: 'Theo dõi' },
      { id: 'assessment', label: 'Đánh giá cấp độ' },
      ...(canViewFinance ? [{ id: 'finance', label: 'Tài chính' }] : []),
   ];

   const visibleTabs = readOnly ? tabs.filter(tab => tab.id !== 'finance') : tabs;

   useEffect(() => {
      if (readOnly && activeTab === 'finance') {
         setActiveTab('info');
      }
   }, [activeTab, readOnly]);

   return (
      <>
         <div className="mb-6 no-print">
            <Tabs
               tabs={visibleTabs}
               activeTab={activeTab}
               onChange={setActiveTab}
            />
         </div>

         <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 min-h-[400px]">
            {activeTab === 'info' && (
               <div className="grid grid-cols-12 gap-6">
                  <div className="col-span-12 md:col-span-8 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                     <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4">
                        <div className="w-10 h-10 bg-teal-50 rounded-full flex items-center justify-center text-teal-600">
                           <UserIcon className="w-5 h-5" />
                        </div>
                        <div>
                           <h3 className="font-bold text-slate-800 text-lg">Thông tin hồ sơ</h3>
                           <p className="text-xs text-slate-500">Thông tin hành chính và định danh</p>
                        </div>
                     </div>

                     <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-8">
                        <div className="space-y-1">
                           <label className="text-xs text-slate-500 font-medium uppercase tracking-wide">Mã hồ sơ</label>
                           <p className="font-semibold text-slate-800">{resident.clinicCode}</p>
                        </div>

                        <div className="space-y-1">
                           <label className="text-xs text-slate-500 font-medium uppercase tracking-wide">Họ và tên</label>
                           <p className="font-semibold text-slate-800 text-lg">{resident.name}</p>
                        </div>

                        <div className="space-y-1">
                           <label className="text-xs text-slate-500 font-medium uppercase tracking-wide flex items-center gap-1">
                              <Calendar className="w-3 h-3" /> Ngày sinh
                           </label>
                           <p className="font-medium text-slate-800">
                              {resident.dob} <span className="text-slate-400 text-sm font-normal">{residentAge === null ? '' : `(${residentAge} tuổi)`}</span>
                           </p>
                        </div>

                        <div className="space-y-1">
                           <label className="text-xs text-slate-500 font-medium uppercase tracking-wide flex items-center gap-1">
                              <UserIcon className="w-3 h-3" /> Giới tính
                           </label>
                           <p className="font-medium text-slate-800">{resident.gender}</p>
                        </div>

                        <div className="space-y-1">
                           <label className="text-xs text-slate-500 font-medium uppercase tracking-wide flex items-center gap-1">
                              <CreditCard className="w-3 h-3" /> CCCD / CMT
                           </label>
                           <p className="font-medium text-slate-800">{displayValue(resident.idCard)}</p>
                        </div>

                        <div className="space-y-1">
                           <label className="text-xs text-slate-500 font-medium uppercase tracking-wide flex items-center gap-1">
                              <Activity className="w-3 h-3" /> Bảo hiểm Y tế
                           </label>
                           <p className="font-medium text-teal-700 bg-teal-50 inline-block px-2 py-0.5 rounded">{healthInsuranceStatus}</p>
                        </div>
                     </div>
                  </div>

                  <div className="col-span-12 md:col-span-4 space-y-6">
                     <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                        <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4">
                           <div className="w-10 h-10 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-600">
                              <Home className="w-5 h-5" />
                           </div>
                           <div>
                              <h3 className="font-bold text-slate-800 text-lg">Nơi ở hiện tại</h3>
                              <p className="text-xs text-slate-500">Vị trí phòng và giường</p>
                           </div>
                        </div>

                        <div className="space-y-4">
                           <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg border border-slate-100">
                              <div className="flex items-center gap-3">
                                 <Home className="w-4 h-4 text-slate-400" />
                                 <span className="text-sm font-medium text-slate-600">Phòng</span>
                              </div>
                              <span className="font-bold text-slate-900 text-lg">{resident.room}</span>
                           </div>

                           <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg border border-slate-100">
                              <div className="flex items-center gap-3">
                                 <Bed className="w-4 h-4 text-slate-400" />
                                 <span className="text-sm font-medium text-slate-600">Giường</span>
                              </div>
                              <span className="font-bold text-slate-900 text-lg">{resident.bed}</span>
                           </div>

                           <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg border border-slate-100">
                              <div className="flex items-center gap-3">
                                 <Clock className="w-4 h-4 text-slate-400" />
                                 <span className="text-sm font-medium text-slate-600">Ngày vào</span>
                              </div>
                              <span className="font-medium text-slate-900">{resident.admissionDate}</span>
                           </div>
                        </div>
                     </div>
                  </div>

                  <div className="col-span-12 md:col-span-6">
                     <div className="h-full bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                        <GuardianInfo resident={resident} />
                     </div>
                  </div>

                  <div className="col-span-12 md:col-span-6">
                     <div className="h-full bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                        <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4">
                           <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-orange-50 rounded-full flex items-center justify-center text-orange-600">
                                 <FileText className="w-5 h-5" />
                              </div>
                              <div>
                                 <h3 className="font-bold text-slate-800 text-lg">Tài liệu đính kèm</h3>
                                 <p className="text-xs text-slate-500">CCCD, BHYT, Hợp đồng...</p>
                              </div>
                           </div>
                        </div>
                        <ResidentDocumentsGrid
                           resident={resident}
                           className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4"
                           readOnly={readOnly}
                           onUpdateResident={onUpdateResident}
                        />
                     </div>
                  </div>
               </div>
            )}

            {activeTab === 'medical_record' && (
               <div className="space-y-8">
                  <MedicalHistorySection user={user} resident={resident} onUpdate={onUpdateResident} readOnly={readOnly} />
                  <div className="border-t border-slate-200 my-6"></div>
                  <MedicalVisitsSection user={user} resident={resident} onUpdate={onUpdateResident} readOnly={readOnly} />
               </div>
            )}

            {activeTab === 'medication' && (
               <div className="space-y-6">
                  <PrescriptionList user={user} resident={resident} onUpdate={onUpdateResident} readOnly={readOnly} />
               </div>
            )}

            {activeTab === 'vital_signs' && (
               <div className="space-y-8">
                  <VitalSignsSection
                     user={user}
                     resident={resident}
                     readOnly={readOnly}
                     onNavigateToMonitoring={() => setActiveTab('monitoring')}
                  />
               </div>
            )}

            {activeTab === 'monitoring' && (
               <div className="space-y-8">
                  <MonitoringPlansSection user={user} resident={resident} onUpdate={onUpdateResident} readOnly={readOnly} />
                  <div className="border-t border-slate-200 my-6"></div>
                  <ResidentNutritionSection resident={resident} onEdit={onEdit} readOnly={readOnly} />
               </div>
            )}

            {activeTab === 'assessment' && (
               <div className="space-y-6">
                  <div className="flex justify-between items-center">
                     <h3 className="font-semibold text-slate-800">Lịch sử đánh giá</h3>
                     {!readOnly && (
                        <button onClick={onOpenAssessment} className="text-sm bg-teal-600 text-white px-3 py-1.5 rounded hover:bg-teal-700 flex items-center gap-2 no-print">
                           <Plus className="w-4 h-4" /> Đánh giá mới
                        </button>
                     )}
                  </div>
                  <div className="space-y-3">
                     {resident.assessments.length > 0 ? resident.assessments.map((a, i) => (
                        <div key={i} className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:bg-slate-50">
                           <div>
                              <p className="font-medium text-slate-900">{a.date}</p>
                              <p className="text-xs text-slate-500">Đánh giá bởi: {a.assessor}</p>
                           </div>
                           <div className="text-right">
                              <p className="text-sm font-semibold">Điểm: {a.score}/40</p>
                              <span className={`text-xs font-bold ${a.level >= 3 ? 'text-orange-600' : 'text-green-600'}`}>Cấp độ {a.level}</span>
                           </div>
                        </div>
                     )) : (
                        <div className="text-center py-8 text-slate-400 italic bg-slate-50 rounded-lg">Chưa có dữ liệu đánh giá</div>
                     )}
                  </div>
               </div>
            )}

            {activeTab === 'finance' && canViewFinance && (
               <div className="space-y-4">
                  {isFinanceReadOnly && (
                     <ReadOnlyBanner message="Bạn có thể xem dữ liệu tài chính nhưng không thể thêm dịch vụ phát sinh." />
                  )}
                  <ResidentFinanceTab
                     resident={resident}
                     servicePrices={servicePrices}
                     usageRecords={usageRecords}
                     onRecordUsage={onRecordUsage}
                     readOnly={isFinanceReadOnly}
                  />
               </div>
            )}
         </div>
      </>
   );
};
