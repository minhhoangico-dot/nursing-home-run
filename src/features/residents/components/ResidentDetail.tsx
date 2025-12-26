import React, { useState, useRef } from 'react';
import { Plus, Upload, FileText, Trash2, Eye, User as UserIcon, Calendar, CreditCard, Home, Bed, Activity, Clock } from 'lucide-react';
import { Resident, InventoryItem, User, ServicePrice, ServiceUsage } from '@/src/types/index';
import { MedicalHistorySection } from '@/src/features/medical/components/MedicalHistorySection';
import { VitalSignsSection } from '@/src/features/medical/components/VitalSignsSection';
import { PrescriptionList } from '@/src/features/prescriptions/components/PrescriptionList';
import { MedicalVisitsSection } from '@/src/features/medical/components/MedicalVisitsSection';
import { MonitoringPlansSection } from '@/src/features/medical/components/MonitoringPlansSection';
// CareLogSection removed
import { GuardianInfo } from './GuardianInfo';
import { ResidentNutritionSection } from './ResidentNutritionSection';
import { ServiceUsageList } from '@/src/features/finance/components/ServiceUsageList';
import { formatCurrency } from '@/src/data/index';
import { useToast } from '@/src/app/providers';

interface ResidentDetailProps {
   user: User;
   resident: Resident;
   inventory: InventoryItem[];
   onUpdateResident: (r: Resident) => void;
   onOpenAssessment: () => void;
   onEdit: () => void;
   servicePrices: ServicePrice[];
   usageRecords: ServiceUsage[];
   onRecordUsage: (u: ServiceUsage) => void;
}

export const ResidentDetail = ({
   user, resident, inventory, onUpdateResident, onOpenAssessment, onEdit,
   servicePrices, usageRecords, onRecordUsage
}: ResidentDetailProps) => {
   const [activeTab, setActiveTab] = useState('info');
   const [documents, setDocuments] = useState<{ id: string, name: string, type: string }[]>([
      { id: '1', name: 'CCCD Mặt trước.jpg', type: 'image' },
      { id: '2', name: 'CCCD Mặt sau.jpg', type: 'image' },
      { id: '3', name: 'BHYT.jpg', type: 'image' }
   ]);
   const fileInputRef = useRef<HTMLInputElement>(null);
   const { addToast } = useToast();

   const handleAddService = (service: ServicePrice) => {
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
      const files = e.target.files;
      if (files && files.length > 0) {
         const file = files[0];
         // Mock upload
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
      // Removed care log tab

      { id: 'medical_record', label: 'Bệnh án' },
      { id: 'medication', label: 'Thuốc' },
      { id: 'vital_signs', label: 'Chỉ số sinh hiệu' },
      { id: 'monitoring', label: 'Theo dõi' },
      { id: 'assessment', label: 'Đánh giá cấp độ' },
      { id: 'finance', label: 'Tài chính' },

   ];

   return (
      <>
         {/* Tabs */}
         <div className="border-b border-slate-200 mb-6 no-print">
            <div className="flex overflow-x-auto gap-6 hide-scrollbar">
               {tabs.map(tab => (
                  <button
                     key={tab.id}
                     onClick={() => setActiveTab(tab.id)}
                     className={`pb-3 text-sm font-medium whitespace-nowrap transition-colors border-b-2 px-1 ${activeTab === tab.id ? 'text-teal-600 border-teal-600' : 'text-slate-500 border-transparent hover:text-slate-700'
                        }`}
                  >
                     {tab.label}
                  </button>
               ))}
            </div>
         </div>

         {/* Tab Content */}
         <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 min-h-[400px]">
            {activeTab === 'info' && (
               <div className="grid grid-cols-12 gap-6">
                  {/* General Info Card - Span 8 */}
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
                           <p className="font-semibold text-slate-800 flex items-center gap-2">
                              {resident.id}
                              <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-xs rounded-full font-normal">System ID</span>
                           </p>
                        </div>

                        <div className="space-y-1">
                           <label className="text-xs text-slate-500 font-medium uppercase tracking-wide">Họ và tên</label>
                           <p className="font-semibold text-slate-800 text-lg">{resident.name}</p>
                        </div>

                        <div className="space-y-1">
                           <label className="text-xs text-slate-500 font-medium uppercase tracking-wide flex items-center gap-1">
                              <Calendar className="w-3 h-3" /> Ngày sinh
                           </label>
                           <p className="font-medium text-slate-800">{resident.dob} <span className="text-slate-400 text-sm font-normal">(75 tuổi)</span></p>
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
                           <p className="font-medium text-slate-800">079145000XXX</p>
                        </div>

                        <div className="space-y-1">
                           <label className="text-xs text-slate-500 font-medium uppercase tracking-wide flex items-center gap-1">
                              <Activity className="w-3 h-3" /> Bảo hiểm Y tế
                           </label>
                           <p className="font-medium text-teal-700 bg-teal-50 inline-block px-2 py-0.5 rounded">DN479000XXX</p>
                        </div>
                     </div>
                  </div>

                  {/* Admission Info Card - Span 4 */}
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

                  {/* Guardian Info - Span 6 */}
                  <div className="col-span-12 md:col-span-6">
                     <div className="h-full bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                        <GuardianInfo resident={resident} />
                     </div>
                  </div>

                  {/* Documents - Span 6 */}
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
                           <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileUpload} />
                           <button
                              onClick={() => fileInputRef.current?.click()}
                              className="text-xs bg-slate-100 text-slate-700 px-3 py-2 rounded-lg flex items-center gap-2 hover:bg-slate-200 transition-colors font-medium"
                           >
                              <Upload className="w-3 h-3" /> Tải lên
                           </button>
                        </div>
                        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                           {documents.map(doc => (
                              <div key={doc.id} className="relative group aspect-[4/3] bg-slate-50 rounded-lg border border-slate-200 flex flex-col items-center justify-center p-3 text-center overflow-hidden hover:border-orange-200 transition-all cursor-pointer">
                                 <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center mb-2 shadow-sm">
                                    <FileText className="w-5 h-5 text-orange-400" />
                                 </div>
                                 <span className="text-xs text-slate-600 font-medium truncate w-full px-1">{doc.name}</span>
                                 <div className="absolute inset-0 bg-black/40 hidden group-hover:flex items-center justify-center gap-2 transition-all backdrop-blur-[1px]">
                                    <button className="p-2 bg-white text-slate-800 rounded-full hover:bg-orange-50 shadow-lg transform hover:scale-105 transition-all"><Eye className="w-4 h-4" /></button>
                                    <button onClick={(e) => { e.stopPropagation(); setDocuments(documents.filter(d => d.id !== doc.id)); }} className="p-2 bg-white text-red-500 rounded-full hover:bg-red-50 shadow-lg transform hover:scale-105 transition-all"><Trash2 className="w-4 h-4" /></button>
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
                  <MedicalHistorySection user={user} resident={resident} onUpdate={onUpdateResident} />
                  <div className="border-t border-slate-200 my-6"></div>
                  <MedicalVisitsSection user={user} resident={resident} onUpdate={onUpdateResident} />
               </div>
            )}

            {activeTab === 'medication' && (
               <div className="space-y-6">
                  <PrescriptionList user={user} resident={resident} inventory={inventory} onUpdate={onUpdateResident} />
               </div>
            )}

            {activeTab === 'vital_signs' && (
               <div className="space-y-8">
                  <VitalSignsSection user={user} resident={resident} />
               </div>
            )}

            {activeTab === 'monitoring' && (
               <div className="space-y-8">
                  <MonitoringPlansSection user={user} resident={resident} onUpdate={onUpdateResident} />
                  <div className="border-t border-slate-200 my-6"></div>
                  <ResidentNutritionSection resident={resident} onEdit={onEdit} />
               </div>
            )}



            {activeTab === 'assessment' && (
               <div className="space-y-6">
                  <div className="flex justify-between items-center">
                     <h3 className="font-semibold text-slate-800">Lịch sử đánh giá</h3>
                     <button onClick={onOpenAssessment} className="text-sm bg-teal-600 text-white px-3 py-1.5 rounded hover:bg-teal-700 flex items-center gap-2 no-print">
                        <Plus className="w-4 h-4" /> Đánh giá mới
                     </button>
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

            {activeTab === 'finance' && (
               <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                     <div className="p-4 bg-red-50 rounded-lg border border-red-100">
                        <p className="text-xs text-red-600 uppercase font-semibold">Công nợ hiện tại</p>
                        <p className="text-2xl font-bold text-red-700">{resident.balance < 0 ? `${formatCurrency(Math.abs(resident.balance))}` : '0 đ'}</p>
                     </div>
                     <div className="p-4 bg-green-50 rounded-lg border border-green-100">
                        <p className="text-xs text-green-600 uppercase font-semibold">Số dư ký quỹ</p>
                        <p className="text-2xl font-bold text-green-700">10,000,000 đ</p>
                     </div>
                  </div>

                  <div className="mt-8">
                     <div className="flex justify-between items-center mb-4">
                        <h3 className="font-semibold text-slate-800">Dịch vụ sử dụng</h3>
                        <div className="flex gap-2">
                           <select
                              className="text-sm border rounded px-2 py-1"
                              onChange={(e) => {
                                 const service = servicePrices.find(s => s.id === e.target.value);
                                 if (service) handleAddService(service);
                                 e.target.value = ''; // Reset
                              }}
                           >
                              <option value="">+ Thêm dịch vụ nhanh...</option>
                              {servicePrices.map(s => (
                                 <option key={s.id} value={s.id}>{s.name} - {formatCurrency(s.price)}</option>
                              ))}
                           </select>
                        </div>
                     </div>

                     <ServiceUsageList
                        usageRecords={usageRecords.filter(u => u.residentId === resident.id)}
                        residents={[resident]}
                        hideResidentFilter={true}
                     />
                  </div>

                  <h3 className="font-semibold text-slate-800 mt-6">Lịch sử giao dịch</h3>
                  <table className="w-full text-sm">
                     <thead className="bg-slate-50">
                        <tr>
                           <th className="px-4 py-2 text-left">Ngày</th>
                           <th className="px-4 py-2 text-left">Nội dung</th>
                           <th className="px-4 py-2 text-right">Số tiền</th>
                           <th className="px-4 py-2 text-center">Trạng thái</th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-slate-100">
                        <tr>
                           <td className="px-4 py-3">01/10/2023</td>
                           <td className="px-4 py-3">Phí dịch vụ tháng 10/2023</td>
                           <td className="px-4 py-3 text-right font-medium text-red-600">-8,500,000 đ</td>
                           <td className="px-4 py-3 text-center"><span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded text-xs">Chờ thanh toán</span></td>
                        </tr>
                        <tr>
                           <td className="px-4 py-3">05/09/2023</td>
                           <td className="px-4 py-3">Thanh toán phí tháng 9/2023</td>
                           <td className="px-4 py-3 text-right font-medium text-green-600">+8,500,000 đ</td>
                           <td className="px-4 py-3 text-center"><span className="px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs">Hoàn thành</span></td>
                        </tr>
                     </tbody>
                  </table>
               </div>
            )}


         </div>
      </>
   );
};