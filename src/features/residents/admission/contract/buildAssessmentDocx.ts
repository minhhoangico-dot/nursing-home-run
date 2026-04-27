import Docxtemplater from 'docxtemplater';
import PizZip from 'pizzip';

const TEMPLATE_URL = '/templates/assessment_template_v1.docx';

export interface AssessmentContext {
  contractNumber: string;
  signedDate: string;
  residentName: string;
  residentDob?: string;
  assessmentDate: string;
  assessorName: string;
}

const formatDateVN = (iso?: string): string => {
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
  return valid
    ? `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`
    : '';
};

const toTemplateData = (ctx: AssessmentContext): Record<string, string> => ({
  contract_number: ctx.contractNumber || '',
  signed_date_full: splitSigned(ctx.signedDate),
  resident_name: ctx.residentName || '',
  resident_dob: formatDateVN(ctx.residentDob),
  assessment_date: formatDateVN(ctx.assessmentDate),
  assessor_name: ctx.assessorName || '',
});

const fetchAssessmentTemplate = async (): Promise<ArrayBuffer> => {
  const res = await fetch(TEMPLATE_URL);
  if (!res.ok) throw new Error(`Không tải được template phiếu đánh giá (${res.status})`);
  return res.arrayBuffer();
};

export const buildAssessmentDocx = async (ctx: AssessmentContext): Promise<Blob> => {
  const buffer = await fetchAssessmentTemplate();
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

export const buildAssessmentFileName = (ctx: AssessmentContext): string => {
  const slug = sanitize(ctx.residentName) || 'NCT';
  return `PhieuDanhGia-${slug}.docx`;
};
