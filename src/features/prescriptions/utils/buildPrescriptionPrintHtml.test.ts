import { describe, expect, it } from 'vitest';
import { buildPrescriptionPrintHtml } from './buildPrescriptionPrintHtml';

describe('buildPrescriptionPrintHtml', () => {
  it('renders blank placeholders for missing optional patient fields', () => {
    const html = buildPrescriptionPrintHtml({
      facility: {
        name: 'FDC',
        address: 'A',
        phone: 'B',
        email: '',
        taxCode: '',
        website: '',
      },
      resident: {
        name: 'HOANG MINH ANH',
        dob: '2016-06-07',
        gender: 'Nam',
      },
      prescription: {
        code: 'DT-001',
        diagnosis: 'J02',
        items: [],
      } as any,
      medicineRows: [],
    });

    expect(html).toContain('Số định danh cá nhân/số căn cước công dân/số hộ chiếu của người bệnh (nếu có)');
    expect(html).toContain('Tái khám ngày:');
    expect(html).toContain('Liên hệ với bác sĩ điều trị:');
  });

  it('renders facility website and formatted medicine rows', () => {
    const html = buildPrescriptionPrintHtml({
      facility: {
        name: 'FDC',
        address: '123 Đường ABC',
        phone: '0243',
        website: 'www.example.vn',
      },
      resident: {
        name: 'HOANG MINH ANH',
        dob: '2016-06-07',
        gender: 'Nam',
      },
      prescription: {
        code: 'DT-002',
        diagnosis: 'J02-Viêm họng cấp',
        prescriptionDate: '2026-03-27',
        doctorName: 'Nguyễn Văn A',
        notes: 'Nhỏ thêm thuốc tại nhà',
      },
      medicineRows: [
        {
          name: 'Ibuprofen (Brufen 60ml)',
          instructions: 'Uống 15 ml/lần, cách 6 tiếng/lần',
          quantity: 1,
          unit: 'Chai',
        },
      ],
    });

    expect(html).toContain('Website: www.example.vn');
    expect(html).toContain('Ibuprofen (Brufen 60ml)');
    expect(html).toContain('Uống 15 ml/lần, cách 6 tiếng/lần');
    expect(html).toContain('01');
    expect(html).toContain('Chai');
  });
});
