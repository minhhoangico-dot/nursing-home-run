import { Incident } from '../types/index';

export const INITIAL_INCIDENTS: Incident[] = [
  {
    id: 'INC-001',
    date: '2023-10-20',
    time: '09:15',
    type: 'Fall',
    severity: 'Medium',
    residentId: 'R001',
    residentName: 'Nguyễn Văn Minh',
    location: 'Hành lang Tầng 1',
    description: 'NCT trượt chân khi đi vệ sinh, sàn nhà hơi ướt sau khi lau.',
    immediateAction: 'Sơ cứu vết trầy xước, kiểm tra sinh hiệu, báo BS Khánh.',
    reporter: 'HL. Tú',
    status: 'Resolved',
    witnesses: 'HL. Mai'
  },
  {
    id: 'INC-002',
    date: '2023-10-24',
    time: '21:30',
    type: 'Medical',
    severity: 'High',
    residentId: 'R003',
    residentName: 'Trần Thế Hiển',
    location: 'Phòng 305',
    description: 'NCT lên cơn co giật nhẹ, tím tái môi.',
    immediateAction: 'Cho thở oxy, gọi xe cấp cứu chuyển BV Quận 7.',
    reporter: 'ĐD. Hùng',
    status: 'Investigating',
    notes: 'Đang theo dõi tại bệnh viện tuyến trên.'
  }
];