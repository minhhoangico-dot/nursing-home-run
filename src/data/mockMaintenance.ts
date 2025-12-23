import { MaintenanceRequest } from '../types/index';

export const MOCK_MAINTENANCE: MaintenanceRequest[] = [
  {
    id: 'MT-001',
    title: 'Hỏng máy lạnh P.201',
    description: 'Máy chạy nhưng không mát, có tiếng kêu lạ.',
    location: 'Phòng 201',
    priority: 'High',
    status: 'Pending',
    reporter: 'ĐD. Lan',
    createdAt: '2023-10-25T08:30:00Z'
  },
  {
    id: 'MT-002',
    title: 'Thay bóng đèn hành lang',
    description: 'Bóng đèn huỳnh quang bị nhấp nháy.',
    location: 'Hành lang Tầng 1',
    priority: 'Low',
    status: 'In_Progress',
    reporter: 'HL. Tú',
    assignee: 'KT. Nam',
    createdAt: '2023-10-24T10:00:00Z'
  }
];