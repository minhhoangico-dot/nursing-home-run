export type Role = 'ADMIN' | 'DOCTOR' | 'SUPERVISOR' | 'ACCOUNTANT' | 'NURSE' | 'CAREGIVER';

export interface User {
  id: string;
  name: string;
  username: string;
  password?: string;
  role: Role;
  floor?: string;
  avatar?: string;
}