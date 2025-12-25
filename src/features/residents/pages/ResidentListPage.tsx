import React, { useState, useMemo } from 'react';
import { Plus, LayoutGrid, List as ListIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { AdmissionWizard } from '../components/AdmissionWizard';
import { ResidentFilters } from '../components/ResidentFilters';
import { ResidentCard } from '../../../components/shared/ResidentCard';
import { ResidentList } from '../components/ResidentList';
import { Button } from '../../../components/ui';
import { useResidentsStore } from '../../../stores/residentsStore';

export const ResidentListPage = () => {
   const navigate = useNavigate();
   const { residents, addResident, selectResident } = useResidentsStore();

   const [search, setSearch] = useState('');
   const [buildingFilter, setBuildingFilter] = useState('');
   const [floorFilter, setFloorFilter] = useState('');
   const [statusFilter, setStatusFilter] = useState('');
   const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
   const [showWizard, setShowWizard] = useState(false);

   const filtered = useMemo(() => residents.filter(r => {
      const matchSearch = r.name.toLowerCase().includes(search.toLowerCase()) || r.room.includes(search);
      const matchBuilding = buildingFilter ? r.building === buildingFilter : true;
      const matchFloor = floorFilter ? r.floor === floorFilter : true;
      const matchStatus = statusFilter ? r.status === statusFilter : true;
      return matchSearch && matchBuilding && matchFloor && matchStatus;
   }), [residents, search, buildingFilter, floorFilter, statusFilter]);

   const handleSelect = (r: any) => {
      selectResident(r);
      navigate(`/residents/${r.id}`);
   };

   const handleAddResident = async (data: any) => {
      try {
         await addResident(data);
         setShowWizard(false);
         toast.success(`Đã tạo hồ sơ cho NCT ${data.name}`);
      } catch (error) {
         toast.error('Lỗi khi thêm NCT');
      }
   };

   return (
      <div className="space-y-6">
         {showWizard && (
            <AdmissionWizard
               onSave={handleAddResident}
               onCancel={() => setShowWizard(false)}
            />
         )}

         <div className="flex flex-col md:flex-row justify-between items-end gap-4 pb-2 border-b border-slate-200">
            <div>
               <h2 className="text-3xl font-bold text-slate-800 tracking-tight">Danh sách NCT</h2>
               <p className="text-slate-500 mt-1 flex items-center gap-2">
                  <span className="inline-block w-2 h-2 rounded-full bg-teal-500"></span>
                  {filtered.length} hồ sơ đang hiển thị
               </p>
            </div>
            <div className="flex gap-3 items-center">
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
               <Button onClick={() => setShowWizard(true)} icon={<Plus className="w-4 h-4" />} className="bg-teal-600 hover:bg-teal-700 shadow-md shadow-teal-200">
                  Thêm NCT mới
               </Button>
            </div>
         </div>

         <ResidentFilters
            search={search} onSearchChange={setSearch}
            buildingFilter={buildingFilter} onBuildingFilterChange={setBuildingFilter}
            floorFilter={floorFilter} onFloorFilterChange={setFloorFilter}
            statusFilter={statusFilter} onStatusFilterChange={setStatusFilter}
         />

         {viewMode === 'list' ? (
            <ResidentList data={filtered} onSelect={handleSelect} />
         ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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
      </div>
   );
};