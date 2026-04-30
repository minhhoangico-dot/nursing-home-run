import { render, screen } from '@testing-library/react';
import { waitFor } from '@testing-library/react';
import { vi } from 'vitest';

import { ResidentDetail } from './ResidentDetail';
import type { Resident, User } from '@/src/types';
import { getResidentDocSignedUrl } from '@/src/services/residentDocumentsService';

vi.mock('@/src/services/residentDocumentsService', () => ({
  getResidentDocSignedUrl: vi.fn(),
}));

const residentFixture: Resident = {
  id: 'RES-DETAIL-1',
  clinicCode: 'HS-001',
  name: 'Tran Thi B',
  dob: '1960-02-02',
  gender: 'Nữ',
  room: '301',
  bed: 'A',
  floor: 'Tang 3',
  building: 'Khu A',
  careLevel: 2,
  status: 'Active',
  admissionDate: '2026-04-22',
  guardianName: 'Nguyen Van C',
  guardianPhone: '0916000666',
  guardianAddress: '45 Le Loi, Q.1, TP.HCM',
  guardianRelation: 'Con gai',
  guardianIdCard: '079000111222',
  idCard: '079999888777',
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

const userFixture: User = {
  id: 'USER-1',
  username: 'admin',
  name: 'Admin',
  role: 'ADMIN',
};

describe('ResidentDetail', () => {
  beforeEach(() => {
    vi.mocked(getResidentDocSignedUrl).mockResolvedValue('https://signed.example/id-card-front.jpg');
  });

  it('renders personal information from the selected resident record', () => {
    render(
      <ResidentDetail
        user={userFixture}
        resident={residentFixture}
        onUpdateResident={() => {}}
        onOpenAssessment={() => {}}
        onEdit={() => {}}
        servicePrices={[]}
        usageRecords={[]}
        onRecordUsage={() => {}}
      />,
    );

    expect(screen.getByText('Tran Thi B')).toBeInTheDocument();
    expect(screen.getByText('079999888777')).toBeInTheDocument();
    expect(screen.getByText(/\(66/)).toBeInTheDocument();
    expect(screen.getByText('Mối quan hệ: Con gai')).toBeInTheDocument();
    expect(screen.getByText('45 Le Loi, Q.1, TP.HCM')).toBeInTheDocument();
    expect(screen.queryByText('079145000XXX')).not.toBeInTheDocument();
    expect(screen.queryByText('DN479000XXX')).not.toBeInTheDocument();
    expect(screen.queryByText('123 Nguyễn Văn Linh, Q.7, TP.HCM')).not.toBeInTheDocument();
    expect(screen.queryByText('CCCD Mặt trước.jpg')).not.toBeInTheDocument();
    expect(screen.queryByText('BHYT.jpg')).not.toBeInTheDocument();
  });

  it('renders persisted identity documents in the attachment card', async () => {
    render(
      <ResidentDetail
        user={userFixture}
        resident={{
          ...residentFixture,
          idCardFrontPath: 'resident-1/id_card_front.jpg',
        }}
        onUpdateResident={() => {}}
        onOpenAssessment={() => {}}
        onEdit={() => {}}
        servicePrices={[]}
        usageRecords={[]}
        onRecordUsage={() => {}}
      />,
    );

    expect(screen.getByRole('heading', { name: /Tài liệu đính kèm/i })).toBeInTheDocument();

    await waitFor(() => {
      expect(getResidentDocSignedUrl).toHaveBeenCalledWith('resident-1/id_card_front.jpg');
    });

    expect(screen.getByAltText('CCCD NCT - mặt trước')).toHaveAttribute(
      'src',
      'https://signed.example/id-card-front.jpg',
    );
    expect(screen.queryByRole('button', { name: /Tải lên/i })).not.toBeInTheDocument();
  });
});
