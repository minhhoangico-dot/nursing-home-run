import { supabase } from '../lib/supabase';

const BUCKET = 'resident-documents';

export type ResidentDocKey =
   | 'idCardFront'
   | 'idCardBack'
   | 'guardianIdCardFront'
   | 'guardianIdCardBack'
   | 'bhytCard';

export interface ResidentOtherDocument {
   id: string;
   residentId: string;
   fileName: string;
   filePath: string;
   fileSize: number;
   mimeType: string;
   createdAt: string;
}

const DOC_KEY_TO_PREFIX: Record<ResidentDocKey, string> = {
   idCardFront: 'id_card_front',
   idCardBack: 'id_card_back',
   guardianIdCardFront: 'guardian_id_card_front',
   guardianIdCardBack: 'guardian_id_card_back',
   bhytCard: 'bhyt_card',
};

export const MAX_DOC_SIZE_BYTES = 5 * 1024 * 1024;
export const MAX_OTHER_DOC_SIZE_BYTES = 10 * 1024 * 1024;
export const MAX_OTHER_DOC_FILES = 5;

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

export const validateResidentOtherDocFile = (
   file: File,
   existingCount: number,
): string | null => {
   if (existingCount >= MAX_OTHER_DOC_FILES) {
      return 'Tối đa 5 tài liệu khác';
   }
   if (file.size > MAX_OTHER_DOC_SIZE_BYTES) {
      return 'File quá lớn (tối đa 10 MB)';
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

const safeFileName = (fileName: string): string => {
   const cleaned = fileName.trim().replace(/[^a-zA-Z0-9._-]+/g, '_');
   return cleaned || `file.${Date.now()}`;
};

const createId = (): string => {
   if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
      return crypto.randomUUID();
   }
   return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
};

const mapOtherDocumentFromDb = (row: any): ResidentOtherDocument => ({
   id: row.id,
   residentId: row.resident_id,
   fileName: row.file_name,
   filePath: row.file_path,
   fileSize: Number(row.file_size ?? 0),
   mimeType: row.mime_type || 'application/octet-stream',
   createdAt: row.created_at,
});

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

export const listResidentOtherDocuments = async (
   residentId: string,
): Promise<ResidentOtherDocument[]> => {
   const { data, error } = await supabase
      .from('resident_other_documents')
      .select('*')
      .eq('resident_id', residentId)
      .order('created_at', { ascending: true });
   if (error) throw error;
   return (data || []).map(mapOtherDocumentFromDb);
};

export const uploadResidentOtherDocument = async (
   residentId: string,
   file: File,
): Promise<ResidentOtherDocument> => {
   const existingDocuments = await listResidentOtherDocuments(residentId);
   const validationError = validateResidentOtherDocFile(file, existingDocuments.length);
   if (validationError) {
      throw new Error(validationError);
   }

   const id = createId();
   const path = `${residentId}/other/${Date.now()}-${safeFileName(file.name)}`;
   const { error: uploadError } = await supabase.storage.from(BUCKET).upload(path, file, {
      upsert: true,
      contentType: file.type || 'application/octet-stream',
   });
   if (uploadError) throw uploadError;

   const { data, error } = await supabase
      .from('resident_other_documents')
      .insert({
         id,
         resident_id: residentId,
         file_name: file.name,
         file_path: path,
         file_size: file.size,
         mime_type: file.type || 'application/octet-stream',
      })
      .select('*')
      .single();
   if (error) throw error;
   return mapOtherDocumentFromDb(data);
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
