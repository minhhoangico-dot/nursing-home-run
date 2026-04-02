import { describe, expect, test } from 'vitest';

import { buildSinglePrescriptionPrintHtml } from './buildSinglePrescriptionPrintHtml';

const residentFixture = {
  id: 'r-1',
  clinicCode: '01208000IPZK-c',
  name: 'Nguyễn Văn A',
  dob: '1950-01-01',
  gender: 'Nam' as const,
  room: 'A101',
  bed: '1',
  floor: '2',
  building: 'A',
  careLevel: 2 as const,
  status: 'Active' as const,
  admissionDate: '2026-01-01',
  guardianName: 'Nguyễn Văn B',
  guardianPhone: '0900000000',
  balance: 0,
  assessments: [],
  prescriptions: [],
  medicalVisits: [],
  specialMonitoring: [],
  medicalHistory: [],
  allergies: [],
  careLogs: [],
  currentConditionNote: '',
  lastMedicalUpdate: '2026-03-30',
  roomType: '2 Giường' as const,
  dietType: 'Normal' as const,
  isDiabetic: false,
};

describe('buildSinglePrescriptionPrintHtml', () => {
  test('uses the clinic prescription template and prioritizes medicine name', () => {
    const html = buildSinglePrescriptionPrintHtml(
      {
        id: 'rx-1',
        code: 'RX-001',
        residentId: 'r-1',
        doctorId: 'd-1',
        doctorName: 'BS. Lan',
        diagnosis: 'Tăng huyết áp',
        prescriptionDate: '2026-03-30',
        startDate: '2026-03-30',
        status: 'Active',
        items: [
          {
            id: 'item-1',
            prescriptionId: 'rx-1',
            medicineName: 'Amlodipine',
            activeIngredientSnapshot: 'Amlodipine besylate',
            strengthSnapshot: '5 mg',
            routeSnapshot: 'Uống',
            dosePerTime: 1,
            doseUnit: 'viên',
            dosage: '1 viên',
            timesPerDay: 1,
            frequency: 'Mỗi ngày 1 lần',
            timesOfDay: ['Sáng'],
            quantityDispensed: 30,
            specialInstructions: 'Sau ăn',
          },
        ],
      },
      residentFixture,
    );

    expect(html).toContain('TRUNG TÂM BÁC SĨ GIA ĐÌNH HÀ NỘI');
    expect(html).toContain('Số 75 Đường Hồ Mễ Trì - P.Đại Mỗ - TP.Hà Nội');
    expect(html).toContain('ĐƠN THUỐC');
    expect(html).toContain('Số định danh cá nhân/số căn cước công dân/số hộ chiếu của người bệnh (nếu có):');
    expect(html).toContain('Thuốc điều trị:');
    expect(html).toContain('class="logo-placeholder"');
    expect(html).toContain('Ảnh logo');
    expect(html).toContain('birth-meta-row');
    expect(html).toContain('Ngày sinh:');
    expect(html).toContain('Cân nặng:');
    expect(html).toContain('Giới tính:');
    expect(html).toContain('barcode-svg');
    expect(html).toContain('data-barcode-value="01208000IPZK-c"');
    expect(html).toContain('Amlodipine');
    expect(html).toContain('Uống');
    expect(html).toContain('1 viên');
    expect(html).toContain('Sau ăn');
    expect(html).toContain('01208000IPZK-c');
    expect(html).toContain('BÁC SỸ KHÁM BỆNH');
    expect(html).not.toContain('BÁC SỸ/ Y SỸ KHÁM BỆNH');
    expect(html).not.toContain('Amlodipine besylate');
  });

  test('does not print system user name under the signature', () => {
    const html = buildSinglePrescriptionPrintHtml(
      {
        id: 'rx-2',
        code: 'RX-002',
        residentId: 'r-1',
        doctorId: 'system',
        doctorName: 'Hệ Thống FDC',
        diagnosis: 'Theo dõi huyết áp',
        prescriptionDate: '2026-03-30',
        startDate: '2026-03-30',
        status: 'Active',
        items: [],
      },
      {
        ...residentFixture,
        clinicCode: '01208000IPZK-d',
      },
    );

    expect(html).not.toContain('Hệ Thống FDC');
  });
});
