import { VisitorLog } from '../types/index';

export const MOCK_VISITORS: VisitorLog[] = [
  {
    id: 'VIS-001',
    visitorName: 'Nguyễn Minh Tuấn',
    idCard: '079145000123',
    phone: '0903123456',
    residentId: 'R001',
    residentName: 'Nguyễn Văn Minh',
    relationship: 'Con trai',
    checkInTime: '2023-10-25T09:00:00Z',
    status: 'Active',
    itemBrought: 'Sữa, Trái cây'
  },
  {
    id: 'VIS-002',
    visitorName: 'Trần Thị Mỹ',
    idCard: '079170000456',
    phone: '0988776655',
    residentId: 'R002',
    residentName: 'Lê Thị Lan',
    relationship: 'Con gái',
    checkInTime: '2023-10-24T15:30:00Z',
    checkOutTime: '2023-10-24T17:00:00Z',
    status: 'Completed',
    note: 'Gửi quần áo mới cho cụ'
  }
];