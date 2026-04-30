import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ResidentDocumentsGrid } from './ResidentDocumentsSection';
import type { Resident } from '@/src/types';
import {
  getResidentDocSignedUrl,
  listResidentOtherDocuments,
  uploadResidentDocument,
  uploadResidentOtherDocument,
} from '@/src/services/residentDocumentsService';

vi.mock('react-hot-toast', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock('@/src/services/residentDocumentsService', () => ({
  getResidentDocSignedUrl: vi.fn(),
  listResidentOtherDocuments: vi.fn(),
  uploadResidentDocument: vi.fn(),
  uploadResidentOtherDocument: vi.fn(),
  validateResidentDocFile: vi.fn(() => null),
  validateResidentOtherDocFile: vi.fn(() => null),
  MAX_OTHER_DOC_FILES: 5,
}));

const residentFixture: Resident = {
  id: 'resident-1',
  clinicCode: 'HS-001',
  name: 'Tran Thi B',
  dob: '1960-02-02',
  gender: 'Nữ',
  room: '301',
  bed: 'A',
  floor: 'Tầng 3',
  building: 'Tòa A',
  careLevel: 2,
  status: 'Active',
  admissionDate: '2026-04-22',
  guardianName: 'Nguyen Van C',
  guardianPhone: '0916000666',
  balance: 0,
  assessments: [],
  prescriptions: [],
  medicalVisits: [],
  specialMonitoring: [],
  medicalHistory: [],
  allergies: [],
  vitalSigns: [],
  careLogs: [],
  currentConditionNote: '',
  lastMedicalUpdate: '2026-04-01',
  roomType: '2 Giường',
  dietType: 'Normal',
  isDiabetic: false,
};

describe('ResidentDocumentsGrid', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getResidentDocSignedUrl).mockResolvedValue('https://signed.example/doc');
    vi.mocked(listResidentOtherDocuments).mockResolvedValue([]);
  });

  it('uploads a missing defined document when its placeholder is selected', async () => {
    const user = userEvent.setup();
    const onUpdateResident = vi.fn().mockResolvedValue(undefined);
    vi.mocked(uploadResidentDocument).mockResolvedValue('resident-1/id_card_front-new.pdf');

    render(
      <ResidentDocumentsGrid
        resident={residentFixture}
        onUpdateResident={onUpdateResident}
      />,
    );

    const file = new File(['front'], 'cccd-front.pdf', { type: 'application/pdf' });
    await user.upload(screen.getByLabelText('Chọn file CCCD NCT - mặt trước'), file);

    await waitFor(() => {
      expect(uploadResidentDocument).toHaveBeenCalledWith('resident-1', 'idCardFront', file);
    });

    expect(onUpdateResident).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'resident-1',
        idCardFrontPath: 'resident-1/id_card_front-new.pdf',
      }),
    );
  });

  it('uploads additional free-form documents and appends them to the list', async () => {
    const user = userEvent.setup();
    vi.mocked(listResidentOtherDocuments).mockResolvedValueOnce([
      {
        id: 'doc-1',
        residentId: 'resident-1',
        fileName: 'hop-dong.docx',
        filePath: 'resident-1/other/hop-dong.docx',
        fileSize: 1024,
        mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        createdAt: '2026-04-30T00:00:00.000Z',
      },
    ]);
    vi.mocked(uploadResidentOtherDocument).mockResolvedValue({
      id: 'doc-2',
      residentId: 'resident-1',
      fileName: 'ket-qua-xet-nghiem.xlsx',
      filePath: 'resident-1/other/ket-qua-xet-nghiem.xlsx',
      fileSize: 2048,
      mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      createdAt: '2026-04-30T01:00:00.000Z',
    });

    render(<ResidentDocumentsGrid resident={residentFixture} onUpdateResident={vi.fn()} />);

    expect(await screen.findByText('hop-dong.docx')).toBeInTheDocument();

    const file = new File(['xlsx'], 'ket-qua-xet-nghiem.xlsx', {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    await user.upload(screen.getByLabelText('Chọn tài liệu khác'), file);

    await waitFor(() => {
      expect(uploadResidentOtherDocument).toHaveBeenCalledWith('resident-1', file);
    });

    expect(await screen.findByText('ket-qua-xet-nghiem.xlsx')).toBeInTheDocument();
  });

  it('does not show the free-form upload control after five other documents exist', async () => {
    vi.mocked(listResidentOtherDocuments).mockResolvedValue(
      Array.from({ length: 5 }, (_, index) => ({
        id: `doc-${index + 1}`,
        residentId: 'resident-1',
        fileName: `tai-lieu-${index + 1}.pdf`,
        filePath: `resident-1/other/tai-lieu-${index + 1}.pdf`,
        fileSize: 1024,
        mimeType: 'application/pdf',
        createdAt: '2026-04-30T00:00:00.000Z',
      })),
    );

    render(<ResidentDocumentsGrid resident={residentFixture} onUpdateResident={vi.fn()} />);

    expect(await screen.findByText('tai-lieu-5.pdf')).toBeInTheDocument();
    expect(screen.queryByLabelText('Chọn tài liệu khác')).not.toBeInTheDocument();
    expect(screen.getByText('Đã đủ 5 tài liệu khác')).toBeInTheDocument();
  });
});
