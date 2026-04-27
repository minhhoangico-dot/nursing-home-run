/**
 * Integration smoke test for buildContractDocx.
 * Loads the actual template from disk (since fetch is mocked here)
 * and verifies all placeholders get replaced.
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it, beforeAll, afterAll, vi } from 'vitest';
import PizZip from 'pizzip';
import { buildContractDocx, buildContractFileName, ContractContext } from './buildContractDocx';

const TEMPLATE_PATH = resolve(__dirname, '../../../../../public/templates/contract_template_v1.docx');

const sampleCtx: ContractContext = {
  contractNumber: '042',
  signedDate: '2026-04-27',
  residentName: 'Nguyễn Văn A',
  residentDob: '1948-03-15',
  residentAddress: '123 Lê Lợi, Q.1, TP.HCM',
  residentPhone: '0901111111',
  residentIdCard: '079012345678',
  guardianName: 'Nguyễn Văn B',
  guardianDob: '1975-07-20',
  guardianAddress: '123 Lê Lợi, Q.1, TP.HCM',
  guardianPhone: '0902222222',
  guardianIdCard: '079098765432',
  guardianRelation: 'Con trai',
};

describe('buildContractDocx', () => {
  let originalFetch: typeof fetch;

  beforeAll(() => {
    originalFetch = globalThis.fetch;
    globalThis.fetch = vi.fn(async () => ({
      ok: true,
      arrayBuffer: async () => readFileSync(TEMPLATE_PATH).buffer as ArrayBuffer,
    })) as unknown as typeof fetch;
  });

  afterAll(() => {
    globalThis.fetch = originalFetch;
  });

  it('replaces all placeholders with values from context', async () => {
    const blob = await buildContractDocx(sampleCtx);
    expect(blob.size).toBeGreaterThan(1000);

    const buffer = await blob.arrayBuffer();
    const zip = new PizZip(buffer);
    const documentXml = zip.file('word/document.xml')?.asText() ?? '';

    // No leftover placeholders
    expect(documentXml.match(/\{[a-z_]+\}/g)).toBeNull();

    // Spot-check substituted values
    expect(documentXml).toContain('Nguyễn Văn A');
    expect(documentXml).toContain('Nguyễn Văn B');
    expect(documentXml).toContain('042/2026/DV-VDL');
    expect(documentXml).toContain('27/04/2026');
    expect(documentXml).toContain('Con trai');
    expect(documentXml).toContain('0902222222');
    expect(documentXml).toContain('079012345678');
  });

  it('produces a sensible filename', () => {
    expect(buildContractFileName(sampleCtx)).toBe('HD-042-Nguyen-Van-A.docx');
  });
});
