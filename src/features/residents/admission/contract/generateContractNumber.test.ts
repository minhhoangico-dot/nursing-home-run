import { describe, expect, it } from 'vitest';
import { generateContractNumber } from './generateContractNumber';

describe('generateContractNumber', () => {
  it('returns 001 when no existing numbers', () => {
    expect(generateContractNumber([])).toBe('001');
  });

  it('finds the next sequence within the same year', () => {
    expect(
      generateContractNumber(
        ['001/2026/DV-VDL', '003/2026/DV-VDL', '002/2026/DV-VDL'],
        2026,
      ),
    ).toBe('004');
  });

  it('ignores numbers from other years', () => {
    expect(
      generateContractNumber(['015/2025/DV-VDL', '001/2026/DV-VDL'], 2026),
    ).toBe('002');
  });

  it('skips malformed inputs', () => {
    expect(
      generateContractNumber(
        ['not-a-number', '', undefined, '007/2026/DV-VDL'],
        2026,
      ),
    ).toBe('008');
  });

  it('zero-pads to 3 digits', () => {
    expect(generateContractNumber(['098/2026/DV-VDL'], 2026)).toBe('099');
    expect(generateContractNumber(['099/2026/DV-VDL'], 2026)).toBe('100');
  });
});
