import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Plus, Upload, FileText, Trash2, Eye, User as UserIcon, Calendar, CreditCard, Home, Bed, Activity, Clock } from 'lucide-react';
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

type DocumentPreview = { id: string; name: string; type: string };

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

const buildResidentDocuments = (resident: Resident): DocumentPreview[] => ([
   { id: 'idCardFront', name: 'CCCD NCT - mặt trước', type: 'image', path: resident.idCardFrontPath },
   { id: 'idCardBack', name: 'CCCD NCT - mặt sau', type: 'image', path: resident.idCardBackPath },
   { id: 'guardianIdCardFront', name: 'CCCD bảo trợ - mặt trước', type: 'image', path: resident.guardianIdCardFrontPath },
   { id: 'guardianIdCardBack', name: 'CCCD bảo trợ - mặt sau', type: 'image', path: resident.guardianIdCardBackPath },
   { id: 'bhytCard', name: 'Thẻ BHYT', type: 'image', path: resident.bhytCardPath },
].filter((document) => Boolean(document.path)).map(({ path: _path, ...document }) => document));

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
   const residentDocumentDefaults = useMemo(() => buildResidentDocuments(resident), [
      resident.id,
      resident.idCardFrontPath,
      resident.idCardBackPath,
      resident.guardianIdCardFrontPath,
      resident.guardianIdCardBackPath,
      resident.bhytCardPath,
   ]);
   const [documents, setDocuments] = useState<DocumentPreview[]>(() => residentDocumentDefaults);
   const fileInputRef = useRef<HTMLInputElement>(null);
   const { addToast } = useToast();
   const financeAccess = useModuleAccess('finance');
   const canViewFinance = financeAccess.canViewFinance;
   const isFinanceReadOnly = canViewFinance && !financeAccess.canEditFinance;
   const residentAge = calculateAge(resident.dob);
   const healthInsuranceStatus = resident.bhytCardPath ? 'Đã có ảnh thẻ BHYT' : missingValue;

   useEffect(() => {
      setDocuments(residentDocumentDefaults);
   }, [residentDocumentDefaults]);

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

   const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (readOnly) {
         return;
      }

      const files = e.target.files;
      if (files && files.length > 0) {
         const file = files[0];
         setTimeout(() => {
            setDocuments(prev => [...prev, {
               id: Math.random().toString(36).substr(2, 9),
               name: file.name,
               type: file.type.includes('image') ? 'image' : 'file'
            }]);
            addToast('success', 'Tải lên thành công', `Đã lưu tệp ${file.name}`);
         }, 1000);
      }
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
                           {!readOnly && (
                              <>
                                 <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileUpload} />
                                 <button
                                    onClick={() => fileInputRef.current?.click()}
                                    className="text-xs bg-slate-100 text-slate-700 px-3 py-2 rounded-lg flex items-center gap-2 hover:bg-slate-200 transition-colors font-medium"
                                 >
                                    <Upload className="w-3 h-3" /> Tải lên
                                 </button>
                              </>
                           )}
                        </div>
                        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                           {documents.map(doc => (
                              <div key={doc.id} className="relative group aspect-[4/3] bg-slate-50 rounded-lg border border-slate-200 flex flex-col items-center justify-center p-3 text-center overflow-hidden hover:border-orange-200 transition-all cursor-pointer">
                                 <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center mb-2 shadow-sm">
                                    <FileText className="w-5 h-5 text-orange-400" />
                                 </div>
                                 <span className="text-xs text-slate-600 font-medium truncate w-full px-1">{doc.name}</span>
                                 <div className="absolute inset-0 bg-black/40 hidden group-hover:flex items-center justify-center gap-2 transition-all backdrop-blur-[1px]">
                                    <button className="p-2 bg-white text-slate-800 rounded-full hover:bg-orange-50 shadow-lg transform hover:scale-105 transition-all">
                                       <Eye className="w-4 h-4" />
                                    </button>
                                    {!readOnly && (
                                       <button
                                          onClick={(e) => {
                                             e.stopPropagation();
                                             setDocuments(documents.filter(d => d.id !== doc.id));
                                          }}
                                          className="p-2 bg-white text-red-500 rounded-full hover:bg-red-50 shadow-lg transform hover:scale-105 transition-all"
                                       >
                                          <Trash2 className="w-4 h-4" />
                                       </button>
                                    )}
                                 </div>
                              </div>
                           ))}
                           {documents.length === 0 && (
                              <div className="col-span-3 py-12 flex flex-col items-center justify-center text-slate-400 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50">
                                 <FileText className="w-8 h-8 mb-2 opacity-50" />
                                 <span className="text-sm italic">Chưa có tài liệu nào</span>
                              </div>
                           )}
                        </div>
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
