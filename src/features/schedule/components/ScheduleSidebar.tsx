import React from 'react';
import { Building, Layers, MapPin } from 'lucide-react';
import { BUILDING_STRUCTURE } from '../../../constants/facility';

interface ScheduleSidebarProps {
    activeBuilding: string;
    activeFloor: string;
    onSelect: (building: string, floor: string) => void;
    staffCounts?: Record<string, number>;
}

export const ScheduleSidebar: React.FC<ScheduleSidebarProps> = ({
    activeBuilding,
    activeFloor,
    onSelect,
    staffCounts = {}
}) => {
    return (
        <div className="w-64 flex-shrink-0 bg-white border-r border-slate-100 flex flex-col h-full">
            <div className="p-4 border-b border-slate-100">
                <h3 className="font-bold text-slate-800 flex items-center gap-2">
                    <Building className="w-5 h-5 text-blue-600" />
                    Cơ sở vật chất
                </h3>
                <p className="text-xs text-slate-500 mt-1">Chọn khu vực để xếp lịch</p>
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-6">
                {/* All/Overview Option */}
                <button
                    onClick={() => onSelect('', '')}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium flex items-center justify-between group transition-all
            ${!activeBuilding ? 'bg-blue-50 text-blue-700 shadow-sm ring-1 ring-blue-200' : 'text-slate-600 hover:bg-slate-50'}
            `}
                >
                    <span className="flex items-center gap-2">
                        <Layers className={`w-4 h-4 ${!activeBuilding ? 'text-blue-600' : 'text-slate-400'}`} />
                        Tất cả khu vực
                    </span>
                </button>

                {BUILDING_STRUCTURE.map((building) => (
                    <div key={building.id}>
                        <div
                            className={`px-3 py-2 text-xs font-bold uppercase tracking-wider mb-1 flex items-center gap-2 cursor-pointer rounded-md
                ${activeBuilding === building.id && !activeFloor ? 'bg-slate-100 text-slate-900' : 'text-slate-400 hover:text-slate-600'}
                `}
                            onClick={() => onSelect(building.id, '')}
                        >
                            {building.name}
                        </div>

                        <div className="space-y-1 ml-2 pl-2 border-l border-slate-100">
                            {building.floors.map((floor) => {
                                const isActive = activeBuilding === building.id && activeFloor === floor;
                                // Generate a key for counting, assuming format "Floor-BuildingId" if needed, 
                                // but simpler to just show current logic later.
                                // For now, simple button structure.
                                return (
                                    <button
                                        key={floor}
                                        onClick={() => onSelect(building.id, floor)}
                                        className={`w-full text-left px-3 py-1.5 rounded-md text-sm transition-all flex items-center justify-between
                      ${isActive
                                                ? 'bg-white text-blue-700 font-semibold shadow-sm ring-1 ring-slate-200'
                                                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}
                    `}
                                    >
                                        <span>{floor}</span>
                                        {/* Placeholder for badge */}
                                        {/* <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 rounded-full">12</span> */}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>

            <div className="p-4 border-t border-slate-100 text-xs text-slate-400 text-center">
                v2.0 Dashboard
            </div>
        </div>
    );
};
