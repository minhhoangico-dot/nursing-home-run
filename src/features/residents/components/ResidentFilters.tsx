import React from 'react';
import { Search, Filter } from 'lucide-react';
import { Input } from '@/src/components/ui/Input';
import { Select } from '@/src/components/ui/Select';
import { BUILDING_STRUCTURE, getFloorsForBuilding } from '@/src/constants/facility';

interface ResidentFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  buildingFilter: string;
  onBuildingFilterChange: (value: string) => void;
  floorFilter: string;
  onFloorFilterChange: (value: string) => void;
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
}

export const ResidentFilters = ({
  search,
  onSearchChange,
  buildingFilter,
  onBuildingFilterChange,
  floorFilter,
  onFloorFilterChange,
  statusFilter,
  onStatusFilterChange
}: ResidentFiltersProps) => {
  const floors = buildingFilter ? getFloorsForBuilding(buildingFilter) : [];

  return (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex flex-col lg:flex-row gap-4 items-center">
      <div className="relative flex-1 w-full">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
        <Input
          className="pl-10"
          placeholder="Tìm theo tên hoặc số phòng..."
          value={search}
          onChange={e => onSearchChange(e.target.value)}
        />
      </div>
      <div className="flex flex-col md:flex-row gap-4 w-full lg:w-auto">
        <Select
          className="w-full md:w-32"
          value={buildingFilter}
          onChange={e => {
            onBuildingFilterChange(e.target.value);
            onFloorFilterChange(''); // Reset floor when building changes
          }}
          options={[
            { value: '', label: 'Tất cả tòa' },
            ...BUILDING_STRUCTURE.map(b => ({ value: b.id, label: b.name }))
          ]}
        />
        <Select
          className="w-full md:w-40"
          value={floorFilter}
          onChange={e => onFloorFilterChange(e.target.value)}
          disabled={!buildingFilter}
          options={[
            { value: '', label: 'Tất cả tầng' },
            ...floors.map(f => ({ value: f, label: f }))
          ]}
        />
        <Select
          className="w-full md:w-40"
          value={statusFilter}
          onChange={e => onStatusFilterChange(e.target.value)}
          options={[
            { value: '', label: 'Tất cả trạng thái' },
            { value: 'Active', label: 'Đang ở' },
            { value: 'Discharged', label: 'Đã xuất viện' },
          ]}
        />
      </div>
    </div>
  );
};