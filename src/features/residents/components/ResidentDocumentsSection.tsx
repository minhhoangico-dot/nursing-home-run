import React, { useEffect, useRef, useState } from 'react';
import { toast } from 'react-hot-toast';
import { FileText, Download, ImageOff, Loader2, Upload } from 'lucide-react';
import { Resident } from '../../../types';
import {
   getResidentDocSignedUrl,
   listResidentOtherDocuments,
   MAX_OTHER_DOC_FILES,
   ResidentDocKey,
   ResidentOtherDocument,
   uploadResidentDocument,
   uploadResidentOtherDocument,
   validateResidentDocFile,
   validateResidentOtherDocFile,
} from '../../../services/residentDocumentsService';

interface DocSlot {
   key: ResidentDocKey;
   label: string;
   pathField:
      | 'idCardFrontPath'
      | 'idCardBackPath'
      | 'guardianIdCardFrontPath'
      | 'guardianIdCardBackPath'
      | 'bhytCardPath';
   path?: string;
}

const buildSlots = (resident: Resident): DocSlot[] => [
   { key: 'idCardFront', label: 'CCCD NCT - mặt trước', pathField: 'idCardFrontPath', path: resident.idCardFrontPath },
   { key: 'idCardBack', label: 'CCCD NCT - mặt sau', pathField: 'idCardBackPath', path: resident.idCardBackPath },
   {
      key: 'guardianIdCardFront',
      label: 'CCCD bảo trợ - mặt trước',
      pathField: 'guardianIdCardFrontPath',
      path: resident.guardianIdCardFrontPath,
   },
   {
      key: 'guardianIdCardBack',
      label: 'CCCD bảo trợ - mặt sau',
      pathField: 'guardianIdCardBackPath',
      path: resident.guardianIdCardBackPath,
   },
   { key: 'bhytCard', label: 'Thẻ BHYT', pathField: 'bhytCardPath', path: resident.bhytCardPath },
];

const isImagePath = (path: string) => /\.(jpe?g|png|webp)$/i.test(path);

const formatFileSize = (bytes: number): string => {
   if (bytes >= 1024 * 1024) {
      return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
   }
   return `${Math.max(1, Math.round(bytes / 1024))} KB`;
};

interface DocCardProps {
   slot: DocSlot;
   resident: Resident;
   readOnly?: boolean;
   onUpdateResident?: (resident: Resident) => Promise<void> | void;
}

const DocCard = ({ slot, resident, readOnly = false, onUpdateResident }: DocCardProps) => {
   const inputRef = useRef<HTMLInputElement>(null);
   const [signedUrl, setSignedUrl] = useState<string | undefined>();
   const [error, setError] = useState(false);
   const [uploading, setUploading] = useState(false);
   const canUpload = !readOnly && Boolean(onUpdateResident);

   useEffect(() => {
      setSignedUrl(undefined);
      setError(false);
      if (!slot.path) return;
      let cancelled = false;
      getResidentDocSignedUrl(slot.path)
         .then((url) => {
            if (!cancelled) setSignedUrl(url);
         })
         .catch(() => {
            if (!cancelled) setError(true);
         });
      return () => {
         cancelled = true;
      };
   }, [slot.path]);

   const handleUpload = async (file: File | null) => {
      if (!file || !onUpdateResident) return;
      const validationError = validateResidentDocFile(file);
      if (validationError) {
         toast.error(validationError);
         return;
      }

      setUploading(true);
      try {
         const path = await uploadResidentDocument(resident.id, slot.key, file);
         await onUpdateResident({
            ...resident,
            [slot.pathField]: path,
         });
         toast.success('Đã tải lên giấy tờ');
      } catch (uploadError) {
         toast.error(`Lỗi tải lên: ${(uploadError as Error).message}`);
      } finally {
         setUploading(false);
      }
   };

   return (
      <div className="rounded-lg border border-slate-200 bg-white overflow-hidden">
         <div className="aspect-[4/3] bg-slate-50 flex items-center justify-center">
            {!slot.path ? (
               canUpload ? (
                  <>
                     <button
                        type="button"
                        onClick={() => inputRef.current?.click()}
                        disabled={uploading}
                        className="w-full h-full text-center text-xs text-slate-500 hover:text-teal-700 hover:bg-teal-50/70 transition-colors disabled:opacity-60"
                        aria-label={`Tải lên ${slot.label}`}
                     >
                        {uploading ? (
                           <Loader2 className="w-6 h-6 mx-auto mb-1 animate-spin" />
                        ) : (
                           <Upload className="w-6 h-6 mx-auto mb-1" />
                        )}
                        {uploading ? 'Đang tải lên…' : 'Tải lên'}
                     </button>
                     <input
                        ref={inputRef}
                        type="file"
                        accept="image/*,.pdf"
                        className="hidden"
                        aria-label={`Chọn file ${slot.label}`}
                        onChange={(event) => {
                           void handleUpload(event.target.files?.[0] ?? null);
                           event.target.value = '';
                        }}
                     />
                  </>
               ) : (
                  <div className="text-center text-xs text-slate-400">
                     <ImageOff className="w-6 h-6 mx-auto mb-1" />
                     Chưa có
                  </div>
               )
            ) : error ? (
               <div className="text-xs text-red-500">Lỗi tải</div>
            ) : !signedUrl ? (
               <div className="text-xs text-slate-400">Đang tải…</div>
            ) : isImagePath(slot.path) ? (
               <img src={signedUrl} alt={slot.label} className="w-full h-full object-cover" />
            ) : (
               <FileText className="w-10 h-10 text-slate-400" />
            )}
         </div>
         <div className="px-3 py-2 flex items-center justify-between gap-2">
            <span className="text-xs text-slate-600 truncate">{slot.label}</span>
            {signedUrl && (
               <a
                  href={signedUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-teal-600 hover:text-teal-700 shrink-0"
                  download
               >
                  <Download className="w-4 h-4" />
               </a>
            )}
         </div>
      </div>
   );
};

const OtherDocumentCard = ({ document }: { document: ResidentOtherDocument }) => {
   const [signedUrl, setSignedUrl] = useState<string | undefined>();
   const [error, setError] = useState(false);

   useEffect(() => {
      setSignedUrl(undefined);
      setError(false);
      let cancelled = false;
      getResidentDocSignedUrl(document.filePath)
         .then((url) => {
            if (!cancelled) setSignedUrl(url);
         })
         .catch(() => {
            if (!cancelled) setError(true);
         });
      return () => {
         cancelled = true;
      };
   }, [document.filePath]);

   return (
      <div className="rounded-lg border border-slate-200 bg-white overflow-hidden">
         <div className="aspect-[4/3] bg-slate-50 flex items-center justify-center">
            {error ? (
               <div className="text-xs text-red-500">Lỗi tải</div>
            ) : !signedUrl ? (
               <div className="text-xs text-slate-400">Đang tải…</div>
            ) : isImagePath(document.filePath) ? (
               <img src={signedUrl} alt={document.fileName} className="w-full h-full object-cover" />
            ) : (
               <div className="text-center text-slate-400">
                  <FileText className="w-10 h-10 mx-auto mb-1" />
                  <span className="text-xs">Tài liệu khác</span>
               </div>
            )}
         </div>
         <div className="px-3 py-2 flex items-center justify-between gap-2">
            <div className="min-w-0">
               <p className="text-xs text-slate-600 truncate">{document.fileName}</p>
               <p className="text-[11px] text-slate-400">{formatFileSize(document.fileSize)}</p>
            </div>
            {signedUrl && (
               <a
                  href={signedUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-teal-600 hover:text-teal-700 shrink-0"
                  download
                  aria-label={`Tải xuống ${document.fileName}`}
               >
                  <Download className="w-4 h-4" />
               </a>
            )}
         </div>
      </div>
   );
};

const OtherUploadCard = ({
   residentId,
   currentCount,
   onUploaded,
}: {
   residentId: string;
   currentCount: number;
   onUploaded: (documents: ResidentOtherDocument[]) => void;
}) => {
   const inputRef = useRef<HTMLInputElement>(null);
   const [uploading, setUploading] = useState(false);
   const remaining = MAX_OTHER_DOC_FILES - currentCount;

   const handleFiles = async (fileList: FileList | null) => {
      const files = Array.from(fileList || []);
      if (!files.length) return;
      if (files.length > remaining) {
         toast.error(`Chỉ có thể tải thêm ${remaining} tài liệu khác`);
         return;
      }

      for (let index = 0; index < files.length; index += 1) {
         const validationError = validateResidentOtherDocFile(files[index], currentCount + index);
         if (validationError) {
            toast.error(validationError);
            return;
         }
      }

      setUploading(true);
      try {
         const uploaded = await Promise.all(
            files.map((file) => uploadResidentOtherDocument(residentId, file)),
         );
         onUploaded(uploaded);
         toast.success('Đã tải lên tài liệu khác');
      } catch (uploadError) {
         toast.error(`Lỗi tải lên: ${(uploadError as Error).message}`);
      } finally {
         setUploading(false);
      }
   };

   return (
      <div className="rounded-lg border border-dashed border-slate-300 bg-white overflow-hidden">
         <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading || remaining <= 0}
            className="aspect-[4/3] w-full bg-slate-50 flex flex-col items-center justify-center text-xs text-slate-500 hover:text-teal-700 hover:bg-teal-50/70 transition-colors disabled:opacity-60"
            aria-label="Tải lên tài liệu khác"
         >
            {uploading ? (
               <Loader2 className="w-6 h-6 mb-1 animate-spin" />
            ) : (
               <Upload className="w-6 h-6 mb-1" />
            )}
            <span>{uploading ? 'Đang tải lên…' : 'Tài liệu khác'}</span>
            <span className="text-[11px] text-slate-400">Còn {remaining}/5 file</span>
         </button>
         <div className="px-3 py-2 text-xs text-slate-500">
            Tối đa 10MB/file
         </div>
         <input
            ref={inputRef}
            type="file"
            multiple
            className="hidden"
            aria-label="Chọn tài liệu khác"
            onChange={(event) => {
               void handleFiles(event.target.files);
               event.target.value = '';
            }}
         />
      </div>
   );
};

const OtherDocumentsLimitCard = () => (
   <div className="rounded-lg border border-slate-200 bg-slate-50 aspect-[4/3] flex items-center justify-center text-center text-xs text-slate-400">
      Đã đủ 5 tài liệu khác
   </div>
);

interface ResidentDocumentsSectionProps {
   resident: Resident;
   readOnly?: boolean;
   onUpdateResident?: (resident: Resident) => Promise<void> | void;
}

interface ResidentDocumentsGridProps {
   resident: Resident;
   className?: string;
   readOnly?: boolean;
   onUpdateResident?: (resident: Resident) => Promise<void> | void;
}

export const ResidentDocumentsGrid = ({
   resident,
   className = 'grid grid-cols-2 md:grid-cols-5 gap-3',
   readOnly = false,
   onUpdateResident,
}: ResidentDocumentsGridProps) => {
   const slots = buildSlots(resident);
   const [otherDocuments, setOtherDocuments] = useState<ResidentOtherDocument[]>([]);
   const [loadingOtherDocuments, setLoadingOtherDocuments] = useState(true);
   const [otherDocumentsError, setOtherDocumentsError] = useState(false);

   useEffect(() => {
      let cancelled = false;
      setLoadingOtherDocuments(true);
      setOtherDocumentsError(false);
      listResidentOtherDocuments(resident.id)
         .then((documents) => {
            if (!cancelled) setOtherDocuments(documents);
         })
         .catch(() => {
            if (!cancelled) setOtherDocumentsError(true);
         })
         .finally(() => {
            if (!cancelled) setLoadingOtherDocuments(false);
         });
      return () => {
         cancelled = true;
      };
   }, [resident.id]);

   return (
      <div className={className}>
         {slots.map((slot) => (
            <DocCard
               key={slot.key}
               slot={slot}
               resident={resident}
               readOnly={readOnly}
               onUpdateResident={onUpdateResident}
            />
         ))}
         {loadingOtherDocuments && (
            <div className="rounded-lg border border-slate-200 bg-slate-50 aspect-[4/3] flex items-center justify-center text-xs text-slate-400">
               Đang tải tài liệu khác…
            </div>
         )}
         {otherDocumentsError && (
            <div className="rounded-lg border border-red-100 bg-red-50 aspect-[4/3] flex items-center justify-center text-xs text-red-500">
               Lỗi tải tài liệu khác
            </div>
         )}
         {otherDocuments.map((document) => (
            <OtherDocumentCard key={document.id} document={document} />
         ))}
         {!readOnly && !loadingOtherDocuments && !otherDocumentsError && (
            otherDocuments.length >= MAX_OTHER_DOC_FILES ? (
               <OtherDocumentsLimitCard />
            ) : (
               <OtherUploadCard
                  residentId={resident.id}
                  currentCount={otherDocuments.length}
                  onUploaded={(documents) => setOtherDocuments((current) => [...current, ...documents])}
               />
            )
         )}
      </div>
   );
};

export const ResidentDocumentsSection = ({
   resident,
   readOnly = false,
   onUpdateResident,
}: ResidentDocumentsSectionProps) => {
   const slots = buildSlots(resident);
   const hasAny = slots.some((s) => s.path);
   if (!hasAny) return null;

   return (
      <div className="rounded-2xl border border-slate-200 bg-white p-4 md:p-5">
         <h3 className="text-sm font-semibold text-slate-700 mb-3">Giấy tờ tùy thân</h3>
         <ResidentDocumentsGrid
            resident={resident}
            readOnly={readOnly}
            onUpdateResident={onUpdateResident}
         />
      </div>
   );
};
