import React, { useEffect, useMemo, useState } from 'react';
import { Plus, LayoutGrid, List as ListIcon, Filter, X, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { AdmissionWizard } from '../components/AdmissionWizard';
import { ResidentFilters } from '../components/ResidentFilters';
import { ResidentCard } from '../../../components/shared/ResidentCard';
import { ResidentList } from '../components/ResidentList';
import { Button } from '../../../components/ui';
import { ModuleReadOnlyBanner } from '../../../components/ui/ModuleReadOnlyBanner';
import { useResidentsStore } from '../../../stores/residentsStore';
import { StatusBadge } from '../../../components/shared/StatusBadge';
import { useModuleAccess } from '@/src/hooks/useModuleAccess';

export const ResidentListPage = () => {
   const navigate = useNavigate();
   const { residents, residentDetails, fetchResidentDetail, addResident, selectResident } = useResidentsStore();
   const residentsAccess = useModuleAccess('residents');
   const isReadOnly = residentsAccess.mode === 'readOnly';

   const [search, setSearch] = useState('');
   const [buildingFilter, setBuildingFilter] = useState('');
   const [floorFilter, setFloorFilter] = useState('');
   const [statusFilter, setStatusFilter] = useState('');
   const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
   const [showWizard, setShowWizard] = useState(false);
   const [showMobileFilters, setShowMobileFilters] = useState(false);

   useEffect(() => {
      if (isReadOnly) {
         setShowWizard(false);
      }
   }, [isReadOnly]);

   const filtered = useMemo(() => residents.filter(r => {
      const matchSearch = r.name.toLowerCase().includes(search.toLowerCase()) || r.room.includes(search);
      const matchBuilding = buildingFilter ? r.building === buildingFilter : true;
      const matchFloor = floorFilter ? r.floor === floorFilter : true;
      const matchStatus = statusFilter ? r.status === statusFilter : true;
      return matchSearch && matchBuilding && matchFloor && matchStatus;
   }), [residents, search, buildingFilter, floorFilter, statusFilter]);

   useEffect(() => {
      if (viewMode !== 'list') {
         return;
      }

      void Promise.all(filtered.map((resident) => fetchResidentDetail(resident.id))).catch(() => undefined);
   }, [fetchResidentDetail, filtered, viewMode]);

   const filteredWithDetails = useMemo(() => (
      filtered.map((resident) => ({
         ...resident,
         medicalHistory: residentDetails[resident.id]?.medicalHistory,
         allergies: residentDetails[resident.id]?.allergies,
      }))
   ), [filtered, residentDetails]);

   const activeFilterCount = [buildingFilter, floorFilter, statusFilter].filter(Boolean).length;

   const handleSelect = (resident: any) => {
      selectResident(resident);
      navigate(`/residents/${resident.id}`);
   };

   const handleAddResident = async (data: any) => {
      if (isReadOnly) {
         setShowWizard(false);
         toast.error('Module is in read-only mode');
         return;
      }

      try {
         await addResident(data);
         setShowWizard(false);
         toast.success(`Đã tạo hồ sơ cho NCT ${data.name}`);
      } catch (error) {
         toast.error('Lỗi khi thêm NCT');
      }
   };

   const clearFilters = () => {
      setBuildingFilter('');
      setFloorFilter('');
      setStatusFilter('');
   };

   return (
      <div className="space-y-4 md:space-y-6 pb-20 md:pb-0">
         {isReadOnly && <ModuleReadOnlyBanner />}

         {showWizard && !isReadOnly && (
            <AdmissionWizard
               onSave={handleAddResident}
               onCancel={() => setShowWizard(false)}
               existingCodes={residents.map(r => r.clinicCode || '').filter(Boolean)}
               existingContractNumbers={residents.map(r => r.contractNumber || '').filter(Boolean)}
               allResidents={residents}
            />
         )}

         <div className="flex flex-col gap-3 md:flex-row md:justify-between md:items-end pb-2 border-b border-slate-200">
            <div>
               <h2 className="text-2xl md:text-3xl font-bold text-slate-800 tracking-tight">Danh sách NCT</h2>
               <p className="text-slate-500 mt-1 flex items-center gap-2 text-sm">
                  <span className="inline-block w-2 h-2 rounded-full bg-teal-500"></span>
                  {filtered.length} hồ sơ đang hiển thị
               </p>
            </div>

            <div className="hidden md:flex gap-3 items-center">
               <div className="flex bg-slate-100 p-1 rounded-lg">
                  <button
                     onClick={() => setViewMode('list')}
                     className={`p-2 rounded-md transition-all shadow-sm ${viewMode === 'list' ? 'bg-white text-teal-600 font-medium' : 'text-slate-400 hover:text-slate-600'}`}
                  >
                     <ListIcon className="w-4 h-4" />
                  </button>
                  <button
                     onClick={() => setViewMode('grid')}
                     className={`p-2 rounded-md transition-all shadow-sm ${viewMode === 'grid' ? 'bg-white text-teal-600 font-medium' : 'text-slate-400 hover:text-slate-600'}`}
                  >
                     <LayoutGrid className="w-4 h-4" />
                  </button>
               </div>
               {!isReadOnly && (
                  <Button
                     onClick={() => setShowWizard(true)}
                     icon={<Plus className="w-4 h-4" />}
                     className="bg-teal-600 hover:bg-teal-700 shadow-md shadow-teal-200"
                  >
                     Thêm NCT mới
                  </Button>
               )}
            </div>

            <div className="flex md:hidden gap-2 items-center justify-between">
               <button
                  onClick={() => setShowMobileFilters(!showMobileFilters)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors ${showMobileFilters || activeFilterCount > 0
                        ? 'bg-teal-50 border-teal-200 text-teal-700'
                        : 'bg-white border-slate-200 text-slate-600'
                     }`}
               >
                  <Filter className="w-4 h-4" />
                  <span className="text-sm font-medium">Lọc</span>
                  {activeFilterCount > 0 && (
                     <span className="bg-teal-600 text-white text-xs px-1.5 py-0.5 rounded-full">
                        {activeFilterCount}
                     </span>
                  )}
               </button>

               <div className="flex bg-slate-100 p-1 rounded-lg">
                  <button
                     onClick={() => setViewMode('list')}
                     className={`p-2 rounded-md transition-all ${viewMode === 'list' ? 'bg-white text-teal-600' : 'text-slate-400'}`}
                  >
                     <ListIcon className="w-4 h-4" />
                  </button>
                  <button
                     onClick={() => setViewMode('grid')}
                     className={`p-2 rounded-md transition-all ${viewMode === 'grid' ? 'bg-white text-teal-600' : 'text-slate-400'}`}
                  >
                     <LayoutGrid className="w-4 h-4" />
                  </button>
               </div>
            </div>
         </div>

         <div className={`${showMobileFilters ? 'block' : 'hidden'} md:block`}>
            <ResidentFilters
               search={search} onSearchChange={setSearch}
               buildingFilter={buildingFilter} onBuildingFilterChange={setBuildingFilter}
               floorFilter={floorFilter} onFloorFilterChange={setFloorFilter}
               statusFilter={statusFilter} onStatusFilterChange={setStatusFilter}
            />
            {activeFilterCount > 0 && (
               <div className="md:hidden mt-2 flex justify-end">
                  <button
                     onClick={clearFilters}
                     className="text-sm text-slate-500 hover:text-slate-700 flex items-center gap-1"
                  >
                     <X className="w-3 h-3" /> Xóa bộ lọc
                  </button>
               </div>
            )}
         </div>

         {viewMode === 'list' ? (
            <>
               <div className="hidden md:block">
                  <ResidentList data={filteredWithDetails} onSelect={handleSelect} />
               </div>

               <div className="md:hidden space-y-3">
                  {filtered.length > 0 ? (
                     filtered.map(r => (
                        <MobileResidentCard key={r.id} resident={r} onClick={() => handleSelect(r)} />
                     ))
                  ) : (
                     <div className="text-center py-12 bg-slate-50 border border-dashed border-slate-200 rounded-xl text-slate-500">
                        Không tìm thấy kết quả phù hợp
                     </div>
                  )}
               </div>
            </>
         ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
               {filtered.map(r => (
                  <ResidentCard key={r.id} resident={r} onClick={() => handleSelect(r)} />
               ))}
               {filtered.length === 0 && (
                  <div className="col-span-full text-center py-12 bg-slate-50 border border-dashed border-slate-200 rounded-xl text-slate-500">
                     Không tìm thấy kết quả phù hợp
                  </div>
               )}
            </div>
         )}

         {!isReadOnly && (
            <button
               onClick={() => setShowWizard(true)}
               className="md:hidden fixed bottom-6 right-4 w-14 h-14 bg-teal-600 hover:bg-teal-700 text-white rounded-full shadow-lg shadow-teal-300 flex items-center justify-center z-30 active:scale-95 transition-transform"
               aria-label="Thêm NCT mới"
            >
               <Plus className="w-6 h-6" />
            </button>
         )}
      </div>
   );
};

const MobileResidentCard = ({ resident, onClick }: { resident: any; onClick: () => void }) => {
   const age = new Date().getFullYear() - new Date(resident.dob).getFullYear();
   const avatarColors = [
      'bg-slate-200 text-slate-700',
      'bg-teal-100 text-teal-700',
      'bg-blue-100 text-blue-700',
      'bg-purple-100 text-purple-700',
      'bg-rose-100 text-rose-700',
   ];

   const getColor = (name: string) => {
      let hash = 0;
      for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
      return avatarColors[Math.abs(hash) % avatarColors.length];
   };

   const initials = resident.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase();

   return (
      <div
         onClick={onClick}
         className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-4 active:bg-slate-50 cursor-pointer"
      >
         <div className={`w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${getColor(resident.name)}`}>
            {initials}
         </div>
         <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
               <h3 className="font-semibold text-slate-800 truncate">{resident.name}</h3>
               {resident.isDiabetic && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-rose-50 text-rose-600 border border-rose-100 flex-shrink-0">
                     Tiểu đường
                  </span>
               )}
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-500">
               <span>{age} tuổi</span>
               <span className="w-1 h-1 rounded-full bg-slate-300"></span>
               <span>P.{resident.room}-{resident.bed}</span>
            </div>
         </div>
         <div className="flex flex-col items-end gap-2 flex-shrink-0">
            <StatusBadge status={resident.status} />
            <ChevronRight className="w-5 h-5 text-slate-300" />
         </div>
      </div>
   );
};
