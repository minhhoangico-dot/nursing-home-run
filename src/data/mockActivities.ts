import { ActivityEvent } from '../types/index';

export const MOCK_ACTIVITIES: ActivityEvent[] = [
  {
    id: 'ACT-001',
    title: 'Tập dưỡng sinh sáng sớm',
    type: 'Exercise',
    date: '2023-10-26',
    startTime: '06:30',
    endTime: '07:30',
    location: 'Sân vườn Tòa A',
    host: 'HL. Tú',
    description: 'Các bài tập hít thở và vận động nhẹ cho NCT.',
    status: 'Scheduled'
  },
  {
    id: 'ACT-002',
    title: 'Giao lưu Karaoke cuối tuần',
    type: 'Entertainment',
    date: '2023-10-28',
    startTime: '15:00',
    endTime: '17:00',
    location: 'Phòng sinh hoạt chung',
    host: 'ĐD. Lan',
    description: 'Buổi hát giao lưu và tiệc trà bánh.',
    status: 'Scheduled'
  }
];