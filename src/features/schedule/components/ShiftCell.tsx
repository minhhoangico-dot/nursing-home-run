import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { ShiftAssignment, ShiftType, SHIFT_CONFIG } from '../../../types/schedule';
import { BUILDING_STRUCTURE, getFloorsForBuilding } from '../../../constants/facility';
import { Sun, Moon, Sunset, X, Plus, Trash2, MapPin } from 'lucide-react';

interface ShiftCellProps {
  assignments: ShiftAssignment[];
  onChange: (assignments: ShiftAssignment[]) => void;
  isHeader?: boolean;
  dateLabel?: string;
  isToday?: boolean;
  isEditing: boolean;
  defaultBuilding?: string;
  defaultFloor?: string;
}

const SHIFT_ICONS: Record<ShiftType, React.ElementType> = {
  Morning: Sun,
  Afternoon: Sunset,
  Night: Moon
};

export const ShiftCell: React.FC<ShiftCellProps> = ({
  assignments = [],
  onChange,
  isHeader,
  dateLabel,
  isToday,
  isEditing,
  defaultBuilding,
  defaultFloor
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
  const [localAssignments, setLocalAssignments] = useState<ShiftAssignment[]>(assignments);

  const cellRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Sync local state with props
  useEffect(() => {
    const normalized = Array.isArray(assignments) ? assignments : (assignments ? [assignments] : []);
    setLocalAssignments(normalized);
  }, [assignments, showMenu]);

  // Handle clicks outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node) &&
        cellRef.current && !cellRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };
    if (showMenu) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showMenu]);

  const handleClick = (e: React.MouseEvent) => {
    if (!isEditing || isHeader) return;
    const rect = e.currentTarget.getBoundingClientRect();
    setMenuPosition({
      top: rect.bottom + window.scrollY + 8,
      left: rect.left + window.scrollX + (rect.width / 2)
    });
    setShowMenu(!showMenu);
  };

  const handleAddShift = () => {
    const newShift: ShiftAssignment = {
      shift: 'Morning',
      building: defaultBuilding || '',
      floor: defaultFloor || ''
    };
    setLocalAssignments([...localAssignments, newShift]);
  };

  const handleRemoveShift = (index: number) => {
    setLocalAssignments(localAssignments.filter((_, i) => i !== index));
  };

  const handleUpdateShift = (index: number, field: keyof ShiftAssignment, value: string) => {
    const updated = [...localAssignments];
    if (field === 'shift') {
      updated[index] = { ...updated[index], shift: value as ShiftType };
    } else if (field === 'building') {
      updated[index] = { ...updated[index], building: value, floor: getFloorsForBuilding(value)[0] || '' };
    } else {
      updated[index] = { ...updated[index], [field]: value };
    }
    setLocalAssignments(updated);
  };

  const handleSave = () => {
    onChange(localAssignments);
    setShowMenu(false);
  };

  // Header cell
  if (isHeader) {
    return (
      <div className={`p-2 border-b border-r border-slate-100 flex flex-col items-center justify-center h-16 ${isToday ? 'bg-blue-50/50' : ''}`}>
        <span className={`text-xs uppercase font-bold ${isToday ? 'text-blue-600' : 'text-slate-400'}`}>
          {dateLabel?.split(',')[0]}
        </span>
        <span className={`text-sm font-bold ${isToday ? 'text-blue-800' : 'text-slate-700'}`}>
          {dateLabel?.split(',')[1]}
        </span>
      </div>
    );
  }

  return (
    <>
      <div
        ref={cellRef}
        onClick={handleClick}
        className={`p-0.5 border-b border-r border-slate-100 min-h-[64px] flex flex-col items-center justify-center gap-0.5 transition-colors relative group
          ${isEditing ? 'cursor-pointer hover:bg-slate-50' : 'cursor-default'}
        `}
      >
        {/* Display stacked pills */}
        {assignments.length > 0 ? (
          assignments.map((a, idx) => {
            const config = SHIFT_CONFIG[a.shift];
            const Icon = SHIFT_ICONS[a.shift];
            return (
              <div
                key={idx}
                className={`w-full px-1 py-0.5 rounded text-[9px] font-medium flex items-center gap-1 border ${config.color}`}
              >
                <Icon className="w-3 h-3 flex-shrink-0" />
                <span className="truncate flex-1">
                  {config.label}
                  {a.building && <span className="opacity-70 ml-1">• {a.floor || a.building}</span>}
                </span>
              </div>
            );
          })
        ) : (
          isEditing && (
            <span className="text-slate-300 group-hover:text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">
              <Plus className="w-5 h-5" />
            </span>
          )
        )}
      </div>

      {/* Portal Popover */}
      {showMenu && createPortal(
        <div
          ref={menuRef}
          className="fixed z-[9999] bg-white rounded-xl shadow-2xl ring-1 ring-slate-900/10 p-4 w-80 max-h-[80vh] overflow-y-auto"
          style={{ top: menuPosition.top, left: menuPosition.left, transform: 'translateX(-50%)' }}
          onClick={e => e.stopPropagation()}
        >
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
            <h4 className="font-bold text-slate-800 text-sm">{dateLabel}</h4>
            <button onClick={() => setShowMenu(false)} className="text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Shift List */}
          <div className="space-y-3 mb-4">
            {localAssignments.length === 0 && (
              <p className="text-sm text-slate-400 text-center py-4">Chưa có ca nào</p>
            )}
            {localAssignments.map((a, idx) => (
              <div key={idx} className="p-3 bg-slate-50 rounded-lg border border-slate-100 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500 uppercase">Ca {idx + 1}</span>
                  <button
                    onClick={() => handleRemoveShift(idx)}
                    className="text-red-400 hover:text-red-600 p-1 rounded hover:bg-red-50"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Shift Type Selector */}
                <div className="grid grid-cols-3 gap-1">
                  {(Object.keys(SHIFT_CONFIG) as ShiftType[]).map(type => {
                    const config = SHIFT_CONFIG[type];
                    const Icon = SHIFT_ICONS[type];
                    return (
                      <button
                        key={type}
                        onClick={() => handleUpdateShift(idx, 'shift', type)}
                        className={`flex flex-col items-center p-1.5 rounded-lg border text-[10px] font-bold transition-all
                          ${a.shift === type
                            ? `${config.color} ring-2 ring-offset-1 ring-blue-500/30`
                            : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                          }
                        `}
                      >
                        <Icon className="w-4 h-4 mb-0.5" />
                        {config.label}
                      </button>
                    );
                  })}
                </div>

                {/* Location Selector */}
                <div className="grid grid-cols-2 gap-2">
                  <select
                    className="text-xs p-1.5 border border-slate-200 rounded-md bg-white"
                    value={a.building || ''}
                    onChange={e => handleUpdateShift(idx, 'building', e.target.value)}
                  >
                    <option value="">Tòa...</option>
                    {BUILDING_STRUCTURE.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                  </select>
                  <select
                    className="text-xs p-1.5 border border-slate-200 rounded-md bg-white disabled:opacity-50"
                    value={a.floor || ''}
                    onChange={e => handleUpdateShift(idx, 'floor', e.target.value)}
                    disabled={!a.building}
                  >
                    <option value="">Tầng...</option>
                    {a.building && getFloorsForBuilding(a.building).map(f => <option key={f} value={f}>{f}</option>)}
                  </select>
                </div>
              </div>
            ))}
          </div>

          {/* Add Shift Button */}
          <button
            onClick={handleAddShift}
            className="w-full py-2 border-2 border-dashed border-slate-200 rounded-lg text-slate-400 hover:border-blue-300 hover:text-blue-500 transition-colors flex items-center justify-center gap-2 text-sm font-medium mb-4"
          >
            <Plus className="w-4 h-4" />
            Thêm ca
          </button>

          {/* Actions */}
          <div className="flex gap-2">
            <button
              onClick={() => setShowMenu(false)}
              className="flex-1 py-2 px-3 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            >
              Hủy
            </button>
            <button
              onClick={handleSave}
              className="flex-1 py-2 px-3 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-sm"
            >
              Lưu thay đổi
            </button>
          </div>
        </div>,
        document.body
      )}
    </>
  );
};