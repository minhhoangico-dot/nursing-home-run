import Docxtemplater from 'docxtemplater';
import PizZip from 'pizzip';

const TEMPLATE_URL = '/templates/contract_template_v1.docx';

export interface ContractContext {
  contractNumber: string;        // "001"
  signedDate: string;            // ISO yyyy-mm-dd

  residentName: string;
  residentDob?: string;          // ISO
  residentAddress?: string;
  residentPhone?: string;
  residentIdCard?: string;

  guardianName: string;
  guardianDob?: string;
  guardianAddress?: string;
  guardianPhone: string;
  guardianIdCard?: string;
  guardianRelation?: string;
}

const formatDob = (iso?: string): string => {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  return `${dd}/${mm}/${d.getFullYear()}`;
};

const splitSigned = (iso: string) => {
  const d = new Date(iso);
  const valid = !Number.isNaN(d.getTime());
  return {
    day: valid ? String(d.getDate()).padStart(2, '0') : '',
    month: valid ? String(d.getMonth() + 1).padStart(2, '0') : '',
    year: valid ? String(d.getFullYear()) : '',
    full: valid
      ? `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`
      : '',
  };
};

const toTemplateData = (ctx: ContractContext): Record<string, string> => {
  const signed = splitSigned(ctx.signedDate);
  return {
    contract_number: ctx.contractNumber,
    signed_day: signed.day,
    signed_month: signed.month,
    signed_year: signed.year,
    signed_date_full: signed.full,
    resident_name: ctx.residentName || '',
    resident_dob: formatDob(ctx.residentDob),
    resident_address: ctx.residentAddress || '',
    resident_phone: ctx.residentPhone || '',
    resident_id_card: ctx.residentIdCard || '',
    guardian_name: ctx.guardianName || '',
    guardian_dob: formatDob(ctx.guardianDob),
    guardian_address: ctx.guardianAddress || '',
    guardian_phone: ctx.guardianPhone || '',
    guardian_id_card: ctx.guardianIdCard || '',
    guardian_relation: ctx.guardianRelation || '',
  };
};

export const fetchContractTemplate = async (): Promise<ArrayBuffer> => {
  const res = await fetch(TEMPLATE_URL);
  if (!res.ok) throw new Error(`Không tải được template hợp đồng (${res.status})`);
  return res.arrayBuffer();
};

export const buildContractDocx = async (ctx: ContractContext): Promise<Blob> => {
  const buffer = await fetchContractTemplate();
  const zip = new PizZip(buffer);
  const doc = new Docxtemplater(zip, {
    paragraphLoop: true,
    linebreaks: true,
    delimiters: { start: '{', end: '}' },
  });
  doc.render(toTemplateData(ctx));
  return doc.getZip().generate({
    type: 'blob',
    mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  });
};

const sanitize = (s: string) =>
  s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

export const buildContractFileName = (ctx: ContractContext): string => {
  const slug = sanitize(ctx.residentName) || 'NCT';
  return `HD-${ctx.contractNumber}-${slug}.docx`;
};
