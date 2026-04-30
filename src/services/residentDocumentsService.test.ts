import { describe, expect, it, vi } from 'vitest';

import {
  MAX_OTHER_DOC_FILES,
  MAX_OTHER_DOC_SIZE_BYTES,
  validateResidentOtherDocFile,
} from './residentDocumentsService';

vi.mock('../lib/supabase', () => ({
  supabase: {},
}));

describe('residentDocumentsService', () => {
  it('accepts any file type for other resident documents up to 10 MB', () => {
    const file = new File(['x'.repeat(1024)], 'ghi-chu.docx', {
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    });

    expect(validateResidentOtherDocFile(file, MAX_OTHER_DOC_FILES - 1)).toBeNull();
  });

  it('rejects other resident documents larger than 10 MB', () => {
    const file = new File(['x'], 'video.mp4', { type: 'video/mp4' });
    Object.defineProperty(file, 'size', {
      value: MAX_OTHER_DOC_SIZE_BYTES + 1,
    });

    expect(validateResidentOtherDocFile(file, 0)).toBe('File quá lớn (tối đa 10 MB)');
  });

  it('rejects other resident documents once five files already exist', () => {
    const file = new File(['x'], 'ghi-chu.txt', { type: 'text/plain' });

    expect(validateResidentOtherDocFile(file, MAX_OTHER_DOC_FILES)).toBe(
      'Tối đa 5 tài liệu khác',
    );
  });
});
