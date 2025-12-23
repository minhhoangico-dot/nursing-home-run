import { HandoverReport } from '../types/index';

export const INITIAL_HANDOVERS: HandoverReport[] = [
  {
    id: 'HO-001',
    date: '2023-10-25',
    shift: 'Morning',
    leader: 'Nguyễn Thị Lan',
    totalResidents: 52,
    newAdmissions: 1,
    discharges: 0,
    transfers: 0,
    medicalAlerts: 'Cụ Hiển P.305 đã xuất viện từ BV Quận 7 trở về, cần theo dõi sát tri giác.',
    equipmentIssues: 'Bình oxy dự phòng tại Tầng 2 đã hết, cần nạp mới.',
    generalNotes: 'Nhân sự đi làm đầy đủ, đúng giờ.',
    createdAt: '2023-10-25T14:05:00Z'
  }
];