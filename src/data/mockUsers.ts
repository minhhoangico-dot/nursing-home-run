import { User } from '../types/index';

export const MOCK_USERS: User[] = [
  { id: 'U1', name: 'Lê Minh Khánh', username: 'doctor', role: 'DOCTOR' },
  { id: 'U2', name: 'Nguyễn Thị Lan', username: 'supervisor', role: 'SUPERVISOR', floor: 'Tầng 2' },
  { id: 'U3', name: 'Phan Thanh Tùng', username: 'accountant', role: 'ACCOUNTANT' },
  { id: 'U4', name: 'Trần Văn Hùng', username: 'nurse', role: 'NURSE', floor: 'Tầng 3' },
  { id: 'U5', name: 'Phạm Văn Tú', username: 'caregiver', role: 'CAREGIVER', floor: 'Tầng 1' },
  { id: 'U6', name: 'Lê Thị Mai', username: 'caregiver2', role: 'CAREGIVER', floor: 'Tầng 2' },
  { id: 'U0', name: 'Hệ Thống FDC', username: 'admin', role: 'ADMIN' }
];