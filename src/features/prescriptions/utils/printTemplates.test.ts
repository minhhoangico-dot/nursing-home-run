import { describe, expect, it } from 'vitest';
import type { Prescription, Resident } from '../../../types';
import { buildPrescriptionPrintHtml } from './printTemplates';

const resident: Resident = {
  id: 'resident-1',
  name: 'Hoang Minh Anh',
  dob: '2016-06-07',
  gender: 'Nam',
  room: 'P.201',
  bed: 'A',
  floor: 'Tang 2',
  building: 'Khu A',
  careLevel: 2,
  status: 'Active',
  admissionDate: '2026-03-01',
  guardianName: 'Nguoi nha',
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
  lastMedicalUpdate: '2026-03-27',
  roomType: '2 Giường',
  dietType: 'Normal',
  isDiabetic: false,
};

const prescription: Prescription = {
  id: 'prescription-1',
  code: '01208000IPZK-C',
  residentId: resident.id,
  doctorId: 'doctor-1',
  doctorName: 'Bac si A',
  diagnosis: 'J02 - Viem hong cap',
  prescriptionDate: '2026-03-27',
  startDate: '2026-03-27',
  status: 'Active',
  notes: 'Nhỏ thêm Nemydexan ở nhà. Test lại cúm AB sau ít nhất 10 tiếng nữa kể từ bây giờ.',
  items: [
    {
      id: 'item-1',
      prescriptionId: 'prescription-1',
      medicineName: 'Ibuprofen 20mg/ml (Brufen 60ml)',
      dosage: '15 ml/lần',
      frequency: '6 tiếng/lần',
      timesOfDay: ['Sáng', 'Trưa'],
      quantity: 1,
      instructions: 'Uống khi sốt trên 38 độ, cách 6 tiếng/lần',
    },
  ],
};

describe('buildPrescriptionPrintHtml', () => {
  it('renders the prescription in sample-style sections instead of a technical table', () => {
    const html = buildPrescriptionPrintHtml(prescription, resident, {
      name: 'Viện dưỡng lão FDC',
      address: '123 Đường ABC',
      phone: '028.1234.5678',
      email: 'contact@example.com',
      taxCode: '0123456789',
      logoSrc: '/logo.png',
      logoDataUrl: '',
    });

    expect(html).toContain('TRUNG TÂM BÁC SĨ GIA ĐÌNH HÀ NỘI');
    expect(html).toContain('Số 75 Đường Hồ Mễ Trì - P. Đại Mỗ - TP. Hà Nội');
    expect(html).toContain('Điện thoại: 024.35.430.430');
    expect(html).toContain('Website: www.bacsigiadinhhanoivn');
    expect(html).toContain('ĐƠN THUỐC');
    expect(html).toContain('barcode-svg');
    expect(html).toContain('page-padding-top');
    expect(html).toContain('page-padding-bottom');
    expect(html).not.toContain('position: fixed');
    expect(html).toContain('Thuốc điều trị:');
    expect(html).toContain('Tái khám ngày:');
    expect(html).toContain('Lưu ý:');
    expect(html).toContain('Lời dặn:');
    expect(html).toContain('Liên hệ với bác sĩ điều trị:');
    expect(html).toContain('BÁC SĨ KHÁM BỆNH');
    expect(html).toContain('Ibuprofen 20mg/ml (Brufen 60ml)');
    expect(html).toContain('15 ml/lần');
    expect(html).toContain('Chai');
    expect(html).not.toContain('<table>');
  });
});
