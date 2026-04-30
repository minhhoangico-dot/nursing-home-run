import React, { useEffect, useRef, useState } from 'react';
import { Upload, X, FileText } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { validateResidentDocFile } from '../../../services/residentDocumentsService';

interface FileUploadFieldProps {
   label: string;
   value?: File;
   onChange: (file: File | undefined) => void;
   accept?: string;
}

export const FileUploadField = ({
   label,
   value,
   onChange,
   accept = 'image/*,.pdf',
}: FileUploadFieldProps) => {
   const inputRef = useRef<HTMLInputElement>(null);
   const [previewUrl, setPreviewUrl] = useState<string | undefined>();

   useEffect(() => {
      if (!value || !value.type.startsWith('image/')) {
         setPreviewUrl(undefined);
         return;
      }
      const url = URL.createObjectURL(value);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
   }, [value]);

   const handleFile = (file: File | null) => {
      if (!file) return;
      const err = validateResidentDocFile(file);
      if (err) {
         toast.error(err);
         return;
      }
      onChange(file);
   };

   return (
      <div>
         <label className="block text-xs font-medium text-slate-600 mb-1">{label}</label>
         {!value ? (
            <button
               type="button"
               onClick={() => inputRef.current?.click()}
               className="w-full flex items-center justify-center gap-2 px-3 py-3 border-2 border-dashed border-slate-300 rounded-lg text-sm text-slate-500 hover:border-teal-400 hover:bg-teal-50/30 transition-colors"
            >
               <Upload className="w-4 h-4" />
               Chọn file (≤ 5MB)
            </button>
         ) : (
            <div className="flex items-center gap-3 px-3 py-2 border border-slate-200 rounded-lg bg-slate-50">
               {previewUrl ? (
                  <img
                     src={previewUrl}
                     alt={label}
                     className="w-12 h-12 object-cover rounded border border-slate-200"
                  />
               ) : (
                  <div className="w-12 h-12 flex items-center justify-center rounded bg-white border border-slate-200">
                     <FileText className="w-5 h-5 text-slate-400" />
                  </div>
               )}
               <div className="flex-1 min-w-0">
                  <p className="text-sm text-slate-700 truncate">{value.name}</p>
                  <p className="text-xs text-slate-400">
                     {(value.size / 1024).toFixed(0)} KB
                  </p>
               </div>
               <button
                  type="button"
                  onClick={() => onChange(undefined)}
                  className="p-1 text-slate-400 hover:text-red-500"
                  aria-label="Xóa file"
               >
                  <X className="w-4 h-4" />
               </button>
            </div>
         )}
         <input
            ref={inputRef}
            type="file"
            accept={accept}
            className="hidden"
            onChange={(e) => {
               handleFile(e.target.files?.[0] ?? null);
               e.target.value = '';
            }}
         />
      </div>
   );
};
