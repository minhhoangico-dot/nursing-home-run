import React from 'react';
import { X } from 'lucide-react';
import { MedicineCatalogManager } from './MedicineCatalogManager';

interface MedicineManagerProps {
  onClose: () => void;
}

export const MedicineManager = ({ onClose }: MedicineManagerProps) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="flex max-h-[90vh] w-full max-w-6xl flex-col rounded-xl bg-white shadow-xl">
        <div className="flex items-center justify-between rounded-t-xl border-b bg-slate-50 p-4">
          <h2 className="text-lg font-bold text-slate-800">
            Quản lý Danh mục Thuốc
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 transition-colors hover:bg-slate-200"
          >
            <X className="h-5 w-5 text-slate-500" />
          </button>
        </div>

        <div className="flex-1 overflow-auto p-4">
          <MedicineCatalogManager />
        </div>
      </div>
    </div>
  );
};
