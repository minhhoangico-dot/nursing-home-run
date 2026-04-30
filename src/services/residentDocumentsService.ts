import { supabase } from '../lib/supabase';

const BUCKET = 'resident-documents';

export type ResidentDocKey =
   | 'idCardFront'
   | 'idCardBack'
   | 'guardianIdCardFront'
   | 'guardianIdCardBack'
   | 'bhytCard';

const DOC_KEY_TO_PREFIX: Record<ResidentDocKey, string> = {
   idCardFront: 'id_card_front',
   idCardBack: 'id_card_back',
   guardianIdCardFront: 'guardian_id_card_front',
   guardianIdCardBack: 'guardian_id_card_back',
   bhytCard: 'bhyt_card',
};

export const MAX_DOC_SIZE_BYTES = 5 * 1024 * 1024;
export const ALLOWED_DOC_MIMES = [
   'image/jpeg',
   'image/png',
   'image/webp',
   'application/pdf',
];

export const validateResidentDocFile = (file: File): string | null => {
   if (file.size > MAX_DOC_SIZE_BYTES) {
      return 'File quá lớn (tối đa 5 MB)';
   }
   if (!ALLOWED_DOC_MIMES.includes(file.type)) {
      return 'Định dạng không hỗ trợ (chỉ JPG, PNG, WEBP, PDF)';
   }
   return null;
};

const extFromFile = (file: File): string => {
   const fromName = file.name.split('.').pop();
   if (fromName && fromName.length <= 5) return fromName.toLowerCase();
   if (file.type === 'image/jpeg') return 'jpg';
   if (file.type === 'image/png') return 'png';
   if (file.type === 'image/webp') return 'webp';
   if (file.type === 'application/pdf') return 'pdf';
   return 'bin';
};

export const uploadResidentDocument = async (
   residentId: string,
   key: ResidentDocKey,
   file: File,
): Promise<string> => {
   const path = `${residentId}/${DOC_KEY_TO_PREFIX[key]}-${Date.now()}.${extFromFile(file)}`;
   const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
      upsert: true,
      contentType: file.type,
   });
   if (error) throw error;
   return path;
};

export const getResidentDocSignedUrl = async (
   path: string,
   ttlSec = 3600,
): Promise<string> => {
   const { data, error } = await supabase.storage
      .from(BUCKET)
      .createSignedUrl(path, ttlSec);
   if (error) throw error;
   return data.signedUrl;
};
