import React, { useEffect, useState } from 'react';
import { FileText, Download, ImageOff } from 'lucide-react';
import { Resident } from '../../../types';
import { getResidentDocSignedUrl } from '../../../services/residentDocumentsService';

interface DocSlot {
   key: string;
   label: string;
   path?: string;
}

const buildSlots = (resident: Resident): DocSlot[] => [
   { key: 'idCardFront', label: 'CCCD NCT - mặt trước', path: resident.idCardFrontPath },
   { key: 'idCardBack', label: 'CCCD NCT - mặt sau', path: resident.idCardBackPath },
   { key: 'guardianIdCardFront', label: 'CCCD bảo trợ - mặt trước', path: resident.guardianIdCardFrontPath },
   { key: 'guardianIdCardBack', label: 'CCCD bảo trợ - mặt sau', path: resident.guardianIdCardBackPath },
   { key: 'bhytCard', label: 'Thẻ BHYT', path: resident.bhytCardPath },
];

const isImagePath = (path: string) => /\.(jpe?g|png|webp)$/i.test(path);

interface DocCardProps {
   slot: DocSlot;
}

const DocCard = ({ slot }: DocCardProps) => {
   const [signedUrl, setSignedUrl] = useState<string | undefined>();
   const [error, setError] = useState(false);

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

   return (
      <div className="rounded-lg border border-slate-200 bg-white overflow-hidden">
         <div className="aspect-[4/3] bg-slate-50 flex items-center justify-center">
            {!slot.path ? (
               <div className="text-center text-xs text-slate-400">
                  <ImageOff className="w-6 h-6 mx-auto mb-1" />
                  Chưa có
               </div>
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

interface ResidentDocumentsSectionProps {
   resident: Resident;
}

interface ResidentDocumentsGridProps {
   resident: Resident;
   className?: string;
}

export const ResidentDocumentsGrid = ({
   resident,
   className = 'grid grid-cols-2 md:grid-cols-5 gap-3',
}: ResidentDocumentsGridProps) => {
   const slots = buildSlots(resident);

   return (
      <div className={className}>
         {slots.map((slot) => (
            <DocCard key={slot.key} slot={slot} />
         ))}
      </div>
   );
};

export const ResidentDocumentsSection = ({ resident }: ResidentDocumentsSectionProps) => {
   const slots = buildSlots(resident);
   const hasAny = slots.some((s) => s.path);
   if (!hasAny) return null;

   return (
      <div className="rounded-2xl border border-slate-200 bg-white p-4 md:p-5">
         <h3 className="text-sm font-semibold text-slate-700 mb-3">Giấy tờ tùy thân</h3>
         <ResidentDocumentsGrid resident={resident} />
      </div>
   );
};
