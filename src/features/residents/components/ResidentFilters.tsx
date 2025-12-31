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
    <div className="bg-white p-3 md:p-4 rounded-xl shadow-sm border border-slate-100 space-y-3 md:space-y-0 md:flex md:flex-row md:gap-4 md:items-center">
      {/* Search - full width */}
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
        <Input
          className="pl-10 w-full"
          placeholder="Tìm theo tên hoặc số phòng..."
          value={search}
          onChange={e => onSearchChange(e.target.value)}
        />
      </div>

      {/* Filter selects - grid on mobile, flex on desktop */}
      <div className="grid grid-cols-3 gap-2 md:flex md:gap-4">
        <Select
          className="w-full md:w-32"
          value={buildingFilter}
          onChange={e => {
            onBuildingFilterChange(e.target.value);
            onFloorFilterChange(''); // Reset floor when building changes
          }}
          options={[
            { value: '', label: 'Tòa' },
            ...BUILDING_STRUCTURE.map(b => ({ value: b.id, label: b.name }))
          ]}
        />
        <Select
          className="w-full md:w-40"
          value={floorFilter}
          onChange={e => onFloorFilterChange(e.target.value)}
          disabled={!buildingFilter}
          options={[
            { value: '', label: 'Tầng' },
            ...floors.map(f => ({ value: f, label: f }))
          ]}
        />
        <Select
          className="w-full md:w-40"
          value={statusFilter}
          onChange={e => onStatusFilterChange(e.target.value)}
          options={[
            { value: '', label: 'Trạng thái' },
            { value: 'Active', label: 'Đang ở' },
            { value: 'Discharged', label: 'Đã xuất' },
          ]}
        />
      </div>
    </div>
  );
};